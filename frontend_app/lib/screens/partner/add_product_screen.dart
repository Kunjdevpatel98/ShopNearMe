import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../providers/shop_provider.dart';
import '../../utils/style_constants.dart';
import '../../models/product.dart';

class AddEditProductScreen extends StatefulWidget {
  final int shopId;
  final Product? product;
  const AddEditProductScreen({super.key, required this.shopId, this.product});

  @override
  State<AddEditProductScreen> createState() => _AddEditProductScreenState();
}

class _AddEditProductScreenState extends State<AddEditProductScreen> {
  final _formKey = GlobalKey<FormState>();
  late TextEditingController _nameController;
  late TextEditingController _descriptionController;
  late TextEditingController _priceController;
  late TextEditingController _imageUrlController;
  bool _isLoading = false;

  bool get isEditMode => widget.product != null;

  @override
  void initState() {
    super.initState();
    _nameController = TextEditingController(text: widget.product?.name ?? "");
    _descriptionController = TextEditingController(text: widget.product?.description ?? "");
    _priceController = TextEditingController(text: widget.product?.price.toString() ?? "");
    _imageUrlController = TextEditingController(text: widget.product?.imageUrl ?? "");
  }

  @override
  void dispose() {
    _nameController.dispose();
    _descriptionController.dispose();
    _priceController.dispose();
    _imageUrlController.dispose();
    super.dispose();
  }

  Future<void> _submit() async {
    if (!_formKey.currentState!.validate()) return;

    setState(() => _isLoading = true);

    final productData = {
      'name': _nameController.text,
      'description': _descriptionController.text,
      'price': double.parse(_priceController.text),
      'imageUrl': _imageUrlController.text.isNotEmpty ? _imageUrlController.text : null,
      'isAvailable': widget.product?.isAvailable ?? true,
    };

    final shopProvider = Provider.of<ShopProvider>(context, listen: false);
    bool success;
    
    if (isEditMode) {
      success = await shopProvider.updateProduct(widget.product!.id!, productData);
    } else {
      success = await shopProvider.addProduct(widget.shopId, productData);
    }

    setState(() => _isLoading = false);

    if (success && mounted) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text(isEditMode ? 'Product updated successfully!' : 'Product added successfully!')),
      );
      Navigator.pop(context, true);
    } else if (mounted) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text(isEditMode ? 'Failed to update product' : 'Failed to add product')),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        title: Text(isEditMode ? "Edit Product" : "Add New Product", style: AppStyles.headingSub),
        backgroundColor: Colors.white,
        elevation: 0,
        foregroundColor: AppColors.textPrimary,
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(24),
        child: Form(
          key: _formKey,
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text("Product Details", style: AppStyles.bodyLarge.copyWith(fontWeight: FontWeight.bold)),
              const SizedBox(height: 20),
              _buildCard([
                _buildTextField(_nameController, "Product Name", Icons.shopping_bag_outlined, required: true),
                const SizedBox(height: 16),
                _buildTextField(_descriptionController, "Description", Icons.description_outlined, maxLines: 3),
              ]),
              const SizedBox(height: 24),
              Text("Pricing", style: AppStyles.bodyLarge.copyWith(fontWeight: FontWeight.bold)),
              const SizedBox(height: 20),
              _buildCard([
                _buildTextField(_priceController, "Price (₹)", Icons.payments_outlined, required: true, keyboardType: TextInputType.number),
              ]),
              const SizedBox(height: 24),
              Text("Media", style: AppStyles.bodyLarge.copyWith(fontWeight: FontWeight.bold)),
              const SizedBox(height: 20),
              _buildCard([
                _buildTextField(_imageUrlController, "Image URL", Icons.image_outlined),
              ]),
              const SizedBox(height: 40),
              SizedBox(
                width: double.infinity,
                height: 56,
                child: ElevatedButton(
                  onPressed: _isLoading ? null : _submit,
                  style: ElevatedButton.styleFrom(
                    backgroundColor: AppColors.primary,
                    foregroundColor: Colors.white,
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
                    elevation: 0,
                  ),
                  child: _isLoading
                      ? const CircularProgressIndicator(color: Colors.white)
                      : Text(isEditMode ? "Update Product" : "Add Product", style: const TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildCard(List<Widget> children) {
    return Container(
      padding: const EdgeInsets.all(20),
      decoration: AppStyles.cardDecoration,
      child: Column(children: children),
    );
  }

  Widget _buildTextField(
    TextEditingController controller,
    String label,
    IconData icon, {
    bool required = false,
    int maxLines = 1,
    TextInputType keyboardType = TextInputType.text,
  }) {
    return TextFormField(
      controller: controller,
      maxLines: maxLines,
      keyboardType: keyboardType,
      decoration: InputDecoration(
        labelText: label,
        prefixIcon: Icon(icon, color: AppColors.primary, size: 20),
        filled: true,
        fillColor: AppColors.background.withOpacity(0.5),
        border: OutlineInputBorder(
          borderRadius: BorderRadius.circular(12),
          borderSide: BorderSide.none,
        ),
        labelStyle: const TextStyle(fontSize: 14),
      ),
      validator: required
          ? (value) => (value == null || value.isEmpty) ? "This field is required" : null
          : null,
    );
  }
}

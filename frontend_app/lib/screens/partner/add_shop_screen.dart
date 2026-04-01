import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../providers/shop_provider.dart';
import '../../utils/style_constants.dart';
import '../../models/category.dart';

class AddShopScreen extends StatefulWidget {
  const AddShopScreen({super.key});

  @override
  State<AddShopScreen> createState() => _AddShopScreenState();
}

class _AddShopScreenState extends State<AddShopScreen> {
  final _formKey = GlobalKey<FormState>();
  final _nameController = TextEditingController();
  final _descriptionController = TextEditingController();
  final _addressController = TextEditingController();
  final _cityController = TextEditingController();
  final _latController = TextEditingController(text: "12.9716");
  final _lngController = TextEditingController(text: "77.5946");
  final _phoneController = TextEditingController();
  final _imageUrlController = TextEditingController();
  final _openingController = TextEditingController();
  final _closingController = TextEditingController();

  Category? _selectedCategory;
  bool _isLoading = false;

  @override
  void initState() {
    super.initState();
    Provider.of<ShopProvider>(context, listen: false).fetchCategories();
  }

  @override
  void dispose() {
    _nameController.dispose();
    _descriptionController.dispose();
    _addressController.dispose();
    _cityController.dispose();
    _latController.dispose();
    _lngController.dispose();
    _phoneController.dispose();
    _imageUrlController.dispose();
    _openingController.dispose();
    _closingController.dispose();
    super.dispose();
  }

  Future<void> _submit() async {
    if (!_formKey.currentState!.validate() || _selectedCategory == null) {
      if (_selectedCategory == null) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Please select a category')),
        );
      }
      return;
    }

    setState(() => _isLoading = true);

    final shopData = {
      'name': _nameController.text,
      'description': _descriptionController.text,
      'address': _addressController.text,
      'city': _cityController.text,
      'latitude': double.parse(_latController.text),
      'longitude': double.parse(_lngController.text),
      'phone': _phoneController.text,
      'imageUrl': _imageUrlController.text,
      'openingTime': _openingController.text,
      'closingTime': _closingController.text,
      'category': _selectedCategory!.toJson(),
      'open': true,
    };

    final success = await Provider.of<ShopProvider>(context, listen: false).addShop(shopData);

    setState(() => _isLoading = false);

    if (success && mounted) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Shop registered successfully!')),
      );
      Navigator.pop(context, true);
    } else if (mounted) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Failed to register shop')),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    final shopProvider = Provider.of<ShopProvider>(context);

    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        title: Text("Register New Shop", style: AppStyles.headingSub),
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
              Text("Basic Information", style: AppStyles.bodyLarge.copyWith(fontWeight: FontWeight.bold)),
              const SizedBox(height: 20),
              _buildCard([
                _buildTextField(_nameController, "Shop Name", Icons.storefront, required: true),
                const SizedBox(height: 16),
                _buildTextField(_descriptionController, "Description", Icons.info_outline, maxLines: 3),
                const SizedBox(height: 16),
                DropdownButtonFormField<Category>(
                  value: _selectedCategory,
                  decoration: _inputDecoration("Category", Icons.category_outlined),
                  items: shopProvider.categories.map((cat) {
                    return DropdownMenuItem(
                      value: cat,
                      child: Text(cat.name),
                    );
                  }).toList(),
                  onChanged: (val) => setState(() => _selectedCategory = val),
                  validator: (val) => val == null ? "Required" : null,
                ),
              ]),
              const SizedBox(height: 24),
              Text("Location Details", style: AppStyles.bodyLarge.copyWith(fontWeight: FontWeight.bold)),
              const SizedBox(height: 20),
              _buildCard([
                _buildTextField(_addressController, "Street Address", Icons.location_on_outlined, required: true),
                const SizedBox(height: 16),
                _buildTextField(_cityController, "City", Icons.location_city, required: true),
                const SizedBox(height: 16),
                Row(
                  children: [
                    Expanded(child: _buildTextField(_latController, "Lat", Icons.map_outlined, required: true, keyboardType: TextInputType.number)),
                    const SizedBox(width: 16),
                    Expanded(child: _buildTextField(_lngController, "Lng", Icons.map_outlined, required: true, keyboardType: TextInputType.number)),
                  ],
                ),
              ]),
              const SizedBox(height: 24),
              Text("Contact & Media", style: AppStyles.bodyLarge.copyWith(fontWeight: FontWeight.bold)),
              const SizedBox(height: 20),
              _buildCard([
                _buildTextField(_phoneController, "Phone Number", Icons.phone_outlined, required: true, keyboardType: TextInputType.phone),
                const SizedBox(height: 16),
                _buildTextField(_imageUrlController, "Shop Image URL", Icons.image_outlined),
              ]),
              const SizedBox(height: 24),
              Text("Operational Hours", style: AppStyles.bodyLarge.copyWith(fontWeight: FontWeight.bold)),
              const SizedBox(height: 20),
              _buildCard([
                Row(
                  children: [
                    Expanded(child: _buildTextField(_openingController, "Opening", Icons.access_time)),
                    const SizedBox(width: 16),
                    Expanded(child: _buildTextField(_closingController, "Closing", Icons.access_time)),
                  ],
                ),
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
                  ),
                  child: _isLoading
                      ? const CircularProgressIndicator(color: Colors.white)
                      : const Text("Register Shop", style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
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

  InputDecoration _inputDecoration(String label, IconData icon) {
    return InputDecoration(
      labelText: label,
      prefixIcon: Icon(icon, color: AppColors.primary, size: 20),
      filled: true,
      fillColor: AppColors.background.withOpacity(0.5),
      border: OutlineInputBorder(
        borderRadius: BorderRadius.circular(12),
        borderSide: BorderSide.none,
      ),
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
      decoration: _inputDecoration(label, icon),
      validator: required
          ? (value) => (value == null || value.isEmpty) ? "Required" : null
          : null,
    );
  }
}

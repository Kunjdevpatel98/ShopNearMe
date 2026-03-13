import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../../models/shop.dart';
import '../../../providers/shop_provider.dart';

class SettingsTab extends StatefulWidget {
  final Shop shop;
  const SettingsTab({super.key, required this.shop});

  @override
  State<SettingsTab> createState() => _SettingsTabState();
}

class _SettingsTabState extends State<SettingsTab> {
  late TextEditingController _nameController;
  late TextEditingController _descriptionController;
  late TextEditingController _addressController;
  late TextEditingController _cityController;
  late TextEditingController _latController;
  late TextEditingController _lngController;
  late TextEditingController _phoneController;
  late TextEditingController _imageController;
  late TextEditingController _openController;
  late TextEditingController _closeController;

  bool _isSaving = false;

  @override
  void initState() {
    super.initState();
    _initControllers();
  }

  @override
  void didUpdateWidget(SettingsTab oldWidget) {
    super.didUpdateWidget(oldWidget);
    if (oldWidget.shop.id != widget.shop.id) {
      _initControllers();
    }
  }

  void _initControllers() {
    _nameController = TextEditingController(text: widget.shop.name);
    _descriptionController = TextEditingController(text: widget.shop.description);
    _addressController = TextEditingController(text: widget.shop.address);
    _cityController = TextEditingController(text: widget.shop.city);
    _latController = TextEditingController(text: widget.shop.latitude.toString());
    _lngController = TextEditingController(text: widget.shop.longitude.toString());
    _phoneController = TextEditingController(text: widget.shop.phone);
    _imageController = TextEditingController(text: widget.shop.imageUrl);
    _openController = TextEditingController(text: widget.shop.openingTime);
    _closeController = TextEditingController(text: widget.shop.closingTime);
  }

  Future<void> _saveChanges() async {
    setState(() => _isSaving = true);
    final provider = Provider.of<ShopProvider>(context, listen: false);
    
    final Map<String, dynamic> data = {
      'name': _nameController.text,
      'description': _descriptionController.text,
      'address': _addressController.text,
      'city': _cityController.text,
      'latitude': double.tryParse(_latController.text) ?? widget.shop.latitude,
      'longitude': double.tryParse(_lngController.text) ?? widget.shop.longitude,
      'phone': _phoneController.text,
      'imageUrl': _imageController.text,
      'openingTime': _openController.text,
      'closingTime': _closeController.text,
      'category': widget.shop.category.toJson(),
      'open': widget.shop.manualOpen,
    };

    final success = await provider.updateShop(widget.shop.id!, data);
    
    if (mounted) {
      setState(() => _isSaving = false);
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text(success ? "Shop updated successfully!" : "Failed to update shop."),
          backgroundColor: success ? Colors.green : Colors.red,
        ),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    return SingleChildScrollView(
      padding: const EdgeInsets.all(20),
      child: Container(
        padding: const EdgeInsets.all(20),
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(16),
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                Container(
                  padding: const EdgeInsets.all(8),
                  decoration: BoxDecoration(
                    color: Colors.purple[50],
                    shape: BoxShape.circle,
                  ),
                  child: const Icon(Icons.settings, color: Colors.purple, size: 20),
                ),
                const SizedBox(width: 12),
                const Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text("Shop Settings", style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
                      Text("Update your store info", style: TextStyle(color: Colors.grey, fontSize: 11)),
                    ],
                  ),
                ),
              ],
            ),
            const SizedBox(height: 30),
            const Text("Edit Shop", style: TextStyle(fontWeight: FontWeight.bold, fontSize: 14)),
            const SizedBox(height: 20),
            _buildInput("Shop Name", _nameController),
            const SizedBox(height: 16),
            _buildInput("Description", _descriptionController),
            const SizedBox(height: 16),
            _buildInput("Address", _addressController),
            const SizedBox(height: 16),
            _buildInput("City", _cityController),
            const SizedBox(height: 16),
            Row(
              children: [
                Expanded(child: _buildInput("Latitude", _latController)),
                const SizedBox(width: 12),
                Expanded(child: _buildInput("Longitude", _lngController)),
              ],
            ),
            const SizedBox(height: 16),
            _buildInput("Phone", _phoneController),
            const SizedBox(height: 16),
            _buildInput("Shop Image URL", _imageController),
            const SizedBox(height: 16),
            Row(
              children: [
                Expanded(child: _buildInput("Opening", _openController, isTime: true)),
                const SizedBox(width: 12),
                Expanded(child: _buildInput("Closing", _closeController, isTime: true)),
              ],
            ),
            const SizedBox(height: 30),
            SizedBox(
              width: double.infinity,
              child: ElevatedButton(
                onPressed: _isSaving ? null : _saveChanges,
                style: ElevatedButton.styleFrom(
                  backgroundColor: Colors.indigo,
                  padding: const EdgeInsets.symmetric(vertical: 14),
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
                ),
                child: _isSaving
                    ? const SizedBox(height: 20, width: 20, child: CircularProgressIndicator(color: Colors.white, strokeWidth: 2))
                    : const Text("Save Changes"),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildInput(String label, TextEditingController controller, {bool isTime = false}) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(label, style: const TextStyle(fontSize: 11, color: Colors.grey)),
        const SizedBox(height: 6),
        Container(
          padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 0),
          decoration: BoxDecoration(
            border: Border.all(color: Colors.grey[300]!),
            borderRadius: BorderRadius.circular(8),
          ),
          child: Row(
            children: [
              Expanded(
                child: TextField(
                  controller: controller,
                  style: const TextStyle(fontSize: 14),
                  decoration: const InputDecoration(
                    border: InputBorder.none,
                    isDense: true,
                    contentPadding: EdgeInsets.symmetric(vertical: 12),
                  ),
                ),
              ),
              if (isTime) const Icon(Icons.access_time, color: Colors.grey, size: 16),
            ],
          ),
        ),
      ],
    );
  }
}

import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../providers/auth_provider.dart';
import '../models/user.dart';

class RegisterScreen extends StatefulWidget {
  const RegisterScreen({super.key});

  @override
  State<RegisterScreen> createState() => _RegisterScreenState();
}

class _RegisterScreenState extends State<RegisterScreen> {
  final _nameController = TextEditingController();
  final _emailController = TextEditingController();
  final _passwordController = TextEditingController();

  Role _selectedRole = Role.USER;

  @override
  Widget build(BuildContext context) {
    final auth = Provider.of<AuthProvider>(context);

    return Scaffold(
      backgroundColor: const Color(0xfff6f6f6),
      appBar: AppBar(
        elevation: 0,
        backgroundColor: Colors.transparent,
        foregroundColor: Colors.black,
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.symmetric(horizontal: 28),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const SizedBox(height: 10),

            /// Title
            const Text(
              "Create Account",
              style: TextStyle(fontSize: 32, fontWeight: FontWeight.bold),
            ),

            const SizedBox(height: 6),

            const Text(
              "Join ShopNearMe and explore local markets",
              style: TextStyle(color: Colors.grey, fontSize: 15),
            ),

            const SizedBox(height: 40),

            /// Form Card
            Container(
              padding: const EdgeInsets.all(22),
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(18),
                boxShadow: [
                  BoxShadow(
                    blurRadius: 20,
                    color: Colors.black.withOpacity(.06),
                    offset: const Offset(0, 10),
                  ),
                ],
              ),
              child: Column(
                children: [
                  /// Name
                  TextField(
                    controller: _nameController,
                    decoration: _inputStyle("Full Name", Icons.person_outline),
                  ),

                  const SizedBox(height: 16),

                  /// Email
                  TextField(
                    controller: _emailController,
                    decoration: _inputStyle(
                      "Email Address",
                      Icons.email_outlined,
                    ),
                    keyboardType: TextInputType.emailAddress,
                  ),

                  const SizedBox(height: 16),

                  /// Password
                  TextField(
                    controller: _passwordController,
                    decoration: _inputStyle("Password", Icons.lock_outline),
                    obscureText: true,
                  ),

                  const SizedBox(height: 24),

                  /// Role selector
                  Row(
                    children: [
                      Expanded(child: _roleButton("Customer", Role.USER)),
                      const SizedBox(width: 10),
                      Expanded(
                        child: _roleButton("Shopkeeper", Role.SHOPKEEPER),
                      ),
                    ],
                  ),

                  const SizedBox(height: 30),

                  /// Register button
                  SizedBox(
                    width: double.infinity,
                    height: 52,
                    child: ElevatedButton(
                      style: ElevatedButton.styleFrom(
                        backgroundColor: const Color(0xffff7a00),
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(12),
                        ),
                      ),
                      onPressed: auth.isLoading
                          ? null
                          : () async {
                              final user = User(
                                name: _nameController.text,
                                email: _emailController.text,
                                role: _selectedRole,
                              );

                              final success = await auth.register(
                                user,
                                _passwordController.text,
                              );

                              if (success && mounted) {
                                ScaffoldMessenger.of(context).showSnackBar(
                                  const SnackBar(
                                    content: Text(
                                      'Registration successful! Please login.',
                                    ),
                                  ),
                                );
                                Navigator.pop(context);
                              } else if (mounted) {
                                ScaffoldMessenger.of(context).showSnackBar(
                                  const SnackBar(
                                    content: Text('Registration failed'),
                                  ),
                                );
                              }
                            },
                      child: auth.isLoading
                          ? const CircularProgressIndicator(color: Colors.white)
                          : const Text(
                              "Create Account",
                              style: TextStyle(
                                fontSize: 16,
                                fontWeight: FontWeight.bold,
                              ),
                            ),
                    ),
                  ),
                ],
              ),
            ),

            const SizedBox(height: 40),
          ],
        ),
      ),
    );
  }

  InputDecoration _inputStyle(String label, IconData icon) {
    return InputDecoration(
      labelText: label,
      prefixIcon: Icon(icon),
      filled: true,
      fillColor: const Color(0xfffafafa),
      border: OutlineInputBorder(
        borderRadius: BorderRadius.circular(12),
        borderSide: BorderSide.none,
      ),
    );
  }

  Widget _roleButton(String text, Role role) {
    final selected = _selectedRole == role;

    return GestureDetector(
      onTap: () => setState(() => _selectedRole = role),
      child: Container(
        height: 48,
        alignment: Alignment.center,
        decoration: BoxDecoration(
          color: selected ? const Color(0xffff7a00) : Colors.white,
          borderRadius: BorderRadius.circular(12),
          border: Border.all(color: const Color(0xffff7a00)),
        ),
        child: Text(
          text,
          style: TextStyle(
            color: selected ? Colors.white : const Color(0xffff7a00),
            fontWeight: FontWeight.bold,
          ),
        ),
      ),
    );
  }
}

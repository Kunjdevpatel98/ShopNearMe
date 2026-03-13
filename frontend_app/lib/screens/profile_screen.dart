import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../providers/auth_provider.dart';
import '../models/user.dart';
import '../utils/style_constants.dart';
import 'bookmarks_screen.dart';

class ProfileScreen extends StatefulWidget {
  const ProfileScreen({super.key});

  @override
  State<ProfileScreen> createState() => _ProfileScreenState();
}

class _ProfileScreenState extends State<ProfileScreen> {
  final _nameController = TextEditingController();
  final _phoneController = TextEditingController();
  final _emailController = TextEditingController();

  @override
  void initState() {
    super.initState();
    _loadUserData();
  }

  void _loadUserData() {
    final user = context.read<AuthProvider>().user;
    if (user != null) {
      _nameController.text = user.name;
      _phoneController.text = user.phone ?? '';
      _emailController.text = user.email;
    }
  }

  Future<void> _handleSave() async {
    final auth = context.read<AuthProvider>();
    final currentUser = auth.user;
    if (currentUser == null) return;

    final updatedUser = User(
      id: currentUser.id,
      name: _nameController.text,
      email: currentUser.email, // Email usually locked
      phone: _phoneController.text,
      role: currentUser.role,
      profilePhotoUrl: currentUser.profilePhotoUrl,
    );

    final success = await auth.updateProfile(updatedUser);

    if (mounted) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text(
            success
                ? "Profile updated successfully!"
                : "Failed to update profile",
            style: const TextStyle(color: Colors.white),
          ),
          backgroundColor: success ? Colors.green : Colors.red,
          behavior: SnackBarBehavior.floating,
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(10),
          ),
        ),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    final auth = context.watch<AuthProvider>();
    final user = auth.user;

    // Sync controllers if they are empty and user data is available
    if (user != null &&
        _nameController.text.isEmpty &&
        _emailController.text.isEmpty) {
      _nameController.text = user.name;
      _phoneController.text = user.phone ?? '';
      _emailController.text = user.email;
    }

    return Scaffold(
      backgroundColor: Colors.grey[50],
      body: CustomScrollView(
        slivers: [
          /// PREMIUM HEADER
          SliverAppBar(
            expandedHeight: 200,
            pinned: true,
            backgroundColor: AppColors.primary,
            flexibleSpace: FlexibleSpaceBar(
              background: Container(
                decoration: const BoxDecoration(
                  gradient: LinearGradient(
                    begin: Alignment.topLeft,
                    end: Alignment.bottomRight,
                    colors: [AppColors.primary, Color(0xFFFF9E40)],
                  ),
                ),
                child: Column(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    const SizedBox(height: 40),
                    Container(
                      height: 110,
                      width: 110,
                      decoration: BoxDecoration(
                        color: _getColorForUser(user?.name ?? ""),
                        shape: BoxShape.circle,
                        boxShadow: [
                          BoxShadow(
                            color: _getColorForUser(
                              user?.name ?? "",
                            ).withOpacity(0.4),
                            blurRadius: 15,
                            offset: const Offset(0, 8),
                          ),
                          const BoxShadow(
                            color: Colors.white,
                            blurRadius: 0,
                            spreadRadius: 4,
                          ),
                        ],
                      ),
                      alignment: Alignment.center,
                      child: Text(
                        _getEmojiForUser(user?.name ?? "U"),
                        style: const TextStyle(fontSize: 58),
                      ),
                    ),
                  ],
                ),
              ),
              title: Text(
                user?.name ?? "Profile",
                style: const TextStyle(
                  color: Colors.white,
                  fontWeight: FontWeight.bold,
                  fontSize: 18,
                ),
              ),
              centerTitle: true,
            ),
          ),

          /// CONTENT
          SliverToBoxAdapter(
            child: Padding(
              padding: const EdgeInsets.all(20),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  _buildSectionTitle("Account Information"),
                  const SizedBox(height: 15),

                  _buildInfoCard([
                    _profileTile(
                      icon: Icons.person_outline,
                      label: "Full Name",
                      controller: _nameController,
                    ),
                    const Divider(height: 30),
                    _profileTile(
                      icon: Icons.phone_android_outlined,
                      label: "Phone Number",
                      controller: _phoneController,
                    ),
                    const Divider(height: 30),
                    _profileTile(
                      icon: Icons.email_outlined,
                      label: "Email Address",
                      controller: _emailController,
                      enabled: false,
                    ),
                  ]),

                  const SizedBox(height: 30),
                  _buildSectionTitle("Activity"),
                  const SizedBox(height: 15),

                  _buildInfoCard([
                    ListTile(
                      contentPadding: EdgeInsets.zero,
                      leading: Container(
                        padding: const EdgeInsets.all(8),
                        decoration: BoxDecoration(
                          color: AppColors.primary.withOpacity(0.1),
                          borderRadius: BorderRadius.circular(10),
                        ),
                        child: const Icon(
                          Icons.bookmark_outline,
                          color: AppColors.primary,
                        ),
                      ),
                      title: const Text(
                        "My Bookmarks",
                        style: TextStyle(fontWeight: FontWeight.w600),
                      ),
                      trailing: const Icon(Icons.arrow_forward_ios, size: 14),
                      onTap: () => Navigator.push(
                        context,
                        MaterialPageRoute(
                          builder: (_) => const BookmarksScreen(),
                        ),
                      ),
                    ),
                  ]),

                  const SizedBox(height: 30),
                  _buildSectionTitle("Security"),
                  const SizedBox(height: 15),

                  _buildInfoCard([
                    ListTile(
                      contentPadding: EdgeInsets.zero,
                      leading: Container(
                        padding: const EdgeInsets.all(8),
                        decoration: BoxDecoration(
                          color: Colors.orange.withOpacity(0.1),
                          borderRadius: BorderRadius.circular(10),
                        ),
                        child: const Icon(
                          Icons.lock_outline,
                          color: Colors.orange,
                        ),
                      ),
                      title: const Text(
                        "Change Password",
                        style: TextStyle(fontWeight: FontWeight.w600),
                      ),
                      trailing: const Icon(Icons.arrow_forward_ios, size: 14),
                      onTap: _showChangePasswordDialog,
                    ),
                  ]),

                  const SizedBox(height: 40),

                  /// ACTION BUTTONS
                  if (auth.isLoading)
                    const Center(
                      child: CircularProgressIndicator(
                        color: AppColors.primary,
                      ),
                    )
                  else
                    Column(
                      children: [
                        SizedBox(
                          width: double.infinity,
                          height: 55,
                          child: ElevatedButton(
                            onPressed: _handleSave,
                            style: ElevatedButton.styleFrom(
                              backgroundColor: AppColors.primary,
                              elevation: 4,
                              shadowColor: AppColors.primary.withOpacity(0.4),
                            ),
                            child: const Text(
                              "Save Changes",
                              style: TextStyle(
                                fontSize: 16,
                                fontWeight: FontWeight.bold,
                              ),
                            ),
                          ),
                        ),
                        const SizedBox(height: 16),
                        SizedBox(
                          width: double.infinity,
                          height: 55,
                          child: OutlinedButton.icon(
                            onPressed: () {
                              auth.logout();
                              Navigator.of(
                                context,
                              ).pushNamedAndRemoveUntil('/', (route) => false);
                            },
                            icon: const Icon(Icons.logout, color: Colors.red),
                            label: const Text(
                              "Logout Account",
                              style: TextStyle(
                                color: Colors.red,
                                fontWeight: FontWeight.bold,
                              ),
                            ),
                            style: OutlinedButton.styleFrom(
                              side: const BorderSide(
                                color: Colors.red,
                                width: 1.5,
                              ),
                              shape: RoundedRectangleBorder(
                                borderRadius: BorderRadius.circular(16),
                              ),
                            ),
                          ),
                        ),
                      ],
                    ),
                  const SizedBox(height: 120),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildSectionTitle(String title) {
    return Text(
      title,
      style: TextStyle(
        fontSize: 14,
        fontWeight: FontWeight.bold,
        color: Colors.grey[600],
        letterSpacing: 1.2,
      ),
    );
  }

  Widget _buildInfoCard(List<Widget> children) {
    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(24),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.04),
            blurRadius: 20,
            offset: const Offset(0, 4),
          ),
        ],
      ),
      child: Column(children: children),
    );
  }

  Widget _profileTile({
    required IconData icon,
    required String label,
    required TextEditingController controller,
    bool enabled = true,
  }) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          children: [
            Icon(icon, size: 20, color: AppColors.primary),
            const SizedBox(width: 8),
            Text(
              label,
              style: TextStyle(
                fontSize: 12,
                color: Colors.grey[500],
                fontWeight: FontWeight.w600,
              ),
            ),
          ],
        ),
        TextField(
          controller: controller,
          enabled: enabled,
          style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 16),
          decoration: const InputDecoration(
            border: InputBorder.none,
            enabledBorder: InputBorder.none,
            focusedBorder: InputBorder.none,
            contentPadding: EdgeInsets.only(top: 8),
          ),
        ),
      ],
    );
  }

  void _showChangePasswordDialog() {
    final currentPasswordController = TextEditingController();
    final newPasswordController = TextEditingController();

    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text("Change Password"),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            TextField(
              controller: currentPasswordController,
              decoration: const InputDecoration(labelText: "Current Password"),
              obscureText: true,
            ),
            const SizedBox(height: 10),
            TextField(
              controller: newPasswordController,
              decoration: const InputDecoration(labelText: "New Password"),
              obscureText: true,
            ),
          ],
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text("Cancel"),
          ),
          ElevatedButton(
            onPressed: () async {
              final error = await context.read<AuthProvider>().changePassword(
                currentPasswordController.text,
                newPasswordController.text,
              );
              if (mounted) {
                Navigator.pop(context);
                ScaffoldMessenger.of(context).showSnackBar(
                  SnackBar(
                    content: Text(error ?? "Password updated successfully!"),
                    backgroundColor: error == null ? Colors.green : Colors.red,
                  ),
                );
              }
            },
            child: const Text("Update"),
          ),
        ],
      ),
    );
  }

  String _getEmojiForUser(String name) {
    final emojis = ["💀"];
    final index = name.length % emojis.length;
    return emojis[index];
  }

  Color _getColorForUser(String name) {
    final colors = [
      const Color(0xFFFFE5E5), // Light Red
      const Color(0xFFE5F9FF), // Light Blue
      const Color(0xFFF2FFE5), // Light Green
      const Color(0xFFFFF7E5), // Light Orange
      const Color(0xFFF9E5FF), // Light Purple
      const Color(0xFFE5FFE9), // Light Mint
    ];
    if (name.isEmpty) return colors[0];
    final index = name.length % colors.length;
    return colors[index];
  }
}

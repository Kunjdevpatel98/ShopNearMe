import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme, themes } from '../context/ThemeContext';
import api from '../config/api';

const SettingsPage = () => {
    const { user } = useAuth();
    const { currentTheme, changeTheme } = useTheme();
    const [activeTab, setActiveTab] = useState('general');
    const [isLoading, setIsLoading] = useState(false);

    // General Form State
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        profilePhotoUrl: ''
    });

    // Password Form State
    const [passwordData, setPasswordData] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });

    useEffect(() => {
        if (user) {
            // Load fresh data if possible or use context
            // Ideally fetch from API to get phone etc if context is stale
            fetchProfile();
        }
    }, [user]);

    const fetchProfile = async () => {
        try {
            const res = await api.get('/users/profile');
            setFormData({
                name: res.data.name || '',
                email: res.data.email || '',
                phone: res.data.phone || '',
                profilePhotoUrl: res.data.profilePhotoUrl || ''
            });
        } catch (error) {
            console.error(error);
        }
    };

    const handlePhotoUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const uploadData = new FormData();
        uploadData.append('file', file);

        try {
            setIsLoading(true);
            const res = await api.post('/users/upload-photo', uploadData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            const photoUrl = "http://localhost:8080" + res.data; // Prepended host for local dev if needed, or relative if proxied
            setFormData(prev => ({ ...prev, profilePhotoUrl: photoUrl }));

            // Auto save profile with new photo
            await api.put('/users/profile', { ...formData, profilePhotoUrl: photoUrl });
            alert("Profile photo updated!");
        } catch (error) {
            console.error("Upload failed", error);
            alert("Failed to upload photo");
        } finally {
            setIsLoading(false);
        }
    };

    const handleGeneralSubmit = async (e) => {
        e.preventDefault();
        try {
            setIsLoading(true);
            await api.put('/users/profile', formData);
            alert("Profile updated successfully!");
        } catch (error) {
            alert("Failed to update profile");
        } finally {
            setIsLoading(false);
        }
    };

    const handlePasswordSubmit = async (e) => {
        e.preventDefault();
        if (passwordData.newPassword !== passwordData.confirmPassword) {
            alert("New passwords do not match");
            return;
        }
        try {
            setIsLoading(true);
            await api.put('/users/password', {
                currentPassword: passwordData.currentPassword,
                newPassword: passwordData.newPassword
            });
            alert("Password changed successfully!");
            setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
        } catch (error) {
            alert(error.response?.data || "Failed to change password");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 pt-24 pb-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mx-auto">
                <h1 className="text-3xl font-bold text-gray-900 mb-8">Account Settings</h1>

                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="flex border-b border-gray-100">
                        <button
                            onClick={() => setActiveTab('general')}
                            className={`flex-1 py-4 text-sm font-medium text-center transition-colors ${activeTab === 'general' ? 'bg-gray-50 text-primary border-b-2 border-primary' : 'text-gray-500 hover:text-gray-700'}`}
                        >
                            General
                        </button>
                        <button
                            onClick={() => setActiveTab('security')}
                            className={`flex-1 py-4 text-sm font-medium text-center transition-colors ${activeTab === 'security' ? 'bg-gray-50 text-primary border-b-2 border-primary' : 'text-gray-500 hover:text-gray-700'}`}
                        >
                            Security
                        </button>
                        <button
                            onClick={() => setActiveTab('appearance')}
                            className={`flex-1 py-4 text-sm font-medium text-center transition-colors ${activeTab === 'appearance' ? 'bg-gray-50 text-primary border-b-2 border-primary' : 'text-gray-500 hover:text-gray-700'}`}
                        >
                            Appearance
                        </button>
                    </div>

                    <div className="p-8">
                        {activeTab === 'general' && (
                            <div className="space-y-8 animate-fade-in-up">
                                {/* Photo Upload */}
                                <div className="flex items-center gap-6">
                                    <div className="w-24 h-24 rounded-full bg-gray-100 relative overflow-hidden flex-shrink-0 border border-gray-200">
                                        {formData.profilePhotoUrl ? (
                                            <img src={formData.profilePhotoUrl} alt="Profile" className="w-full h-full object-cover" />
                                        ) : (
                                            <div className="flex items-center justify-center h-full text-3xl">👤</div>
                                        )}
                                        {isLoading && <div className="absolute inset-0 bg-black/50 flex items-center justify-center text-white text-xs">...</div>}
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-gray-900">Profile Photo</h3>
                                        <p className="text-sm text-gray-500 mb-3">Upload a new avatar. Recommended size 400x400.</p>
                                        <label className="cursor-pointer bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-50 inline-block">
                                            Upload Image
                                            <input type="file" className="hidden" accept="image/*" onChange={handlePhotoUpload} />
                                        </label>
                                    </div>
                                </div>

                                <hr className="border-gray-100" />

                                {/* Form */}
                                <form onSubmit={handleGeneralSubmit} className="space-y-6">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                                            <input
                                                type="text"
                                                value={formData.name}
                                                onChange={e => setFormData({ ...formData, name: e.target.value })}
                                                className="w-full border border-gray-300 rounded-lg px-4 py-2 outline-none focus:ring-2 focus:ring-primary"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                                            <input
                                                type="tel"
                                                value={formData.phone}
                                                onChange={e => setFormData({ ...formData, phone: e.target.value })}
                                                className="w-full border border-gray-300 rounded-lg px-4 py-2 outline-none focus:ring-2 focus:ring-primary"
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                                        <input
                                            type="email"
                                            value={formData.email}
                                            onChange={e => setFormData({ ...formData, email: e.target.value })}
                                            className="w-full border border-gray-300 rounded-lg px-4 py-2 outline-none focus:ring-2 focus:ring-primary bg-white"
                                        />
                                        <p className="text-xs text-gray-400 mt-1">Changing email might require re-login.</p>
                                    </div>

                                    <div className="flex justify-end pt-4">
                                        <button disabled={isLoading} type="submit" className="bg-primary text-white px-8 py-2 rounded-lg font-bold hover:bg-primary-hover transition-all disabled:opacity-50">
                                            {isLoading ? 'Saving...' : 'Save Changes'}
                                        </button>
                                    </div>
                                </form>
                            </div>
                        )}

                        {activeTab === 'security' && (
                            <form onSubmit={handlePasswordSubmit} className="space-y-6 max-w-md animate-fade-in-up">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Current Password</label>
                                    <input
                                        type="password"
                                        required
                                        value={passwordData.currentPassword}
                                        onChange={e => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                                        className="w-full border border-gray-300 rounded-lg px-4 py-2 outline-none focus:ring-2 focus:ring-[#ef4f5f]"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
                                    <input
                                        type="password"
                                        required
                                        value={passwordData.newPassword}
                                        onChange={e => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                                        className="w-full border border-gray-300 rounded-lg px-4 py-2 outline-none focus:ring-2 focus:ring-[#ef4f5f]"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Confirm New Password</label>
                                    <input
                                        type="password"
                                        required
                                        value={passwordData.confirmPassword}
                                        onChange={e => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                                        className="w-full border border-gray-300 rounded-lg px-4 py-2 outline-none focus:ring-2 focus:ring-[#ef4f5f]"
                                    />
                                </div>

                                <div className="pt-4">
                                    <button disabled={isLoading} type="submit" className="w-full bg-gray-900 text-white px-8 py-2 rounded-lg font-bold hover:bg-gray-800 transition-all disabled:opacity-50">
                                        {isLoading ? 'Updating...' : 'Update Password'}
                                    </button>
                                </div>
                            </form>
                        )}

                        {activeTab === 'appearance' && (
                            <div className="space-y-6 animate-fade-in-up">
                                <h3 className="text-lg font-medium text-gray-900">Select Theme</h3>
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {Object.entries(themes).map(([key, theme]) => (
                                        <button
                                            key={key}
                                            onClick={() => changeTheme(key)}
                                            className={`relative group p-4 border rounded-xl text-left transition-all ${currentTheme === key
                                                ? 'border-primary ring-2 ring-primary ring-opacity-10 bg-gray-50'
                                                : 'border-gray-200 hover:border-gray-300 hover:shadow-sm'
                                                }`}
                                        >
                                            <div className="flex items-center justify-between mb-4">
                                                <span className={`font-semibold ${currentTheme === key ? 'text-primary' : 'text-gray-900'}`}>{theme.name}</span>
                                                {currentTheme === key && <span className="text-primary text-xl">✓</span>}
                                            </div>
                                            <div className="flex gap-2">
                                                <div className="w-8 h-8 rounded-full shadow-sm" style={{ backgroundColor: theme.colors.primary }}></div>
                                                <div className="w-8 h-8 rounded-full shadow-sm" style={{ backgroundColor: theme.colors.primaryLight }}></div>
                                                <div className="w-8 h-8 rounded-full shadow-sm" style={{ backgroundColor: theme.colors.primaryHover }}></div>
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div >
    );
};

export default SettingsPage;

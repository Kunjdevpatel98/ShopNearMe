import { useState, useEffect } from 'react';
import api from '../config/api';
import ShopForm from '../components/ShopForm';

const CategoryForm = ({ initialData, onSave, onCancel }) => {
    const [formData, setFormData] = useState(initialData || { name: '', description: '' });

    useEffect(() => {
        if (initialData) setFormData(initialData);
    }, [initialData]);

    const handleSubmit = (e) => {
        e.preventDefault();
        onSave(formData);
    };

    return (
        <div className="bg-white p-6 rounded shadow mb-6">
            <h3 className="text-lg font-bold mb-4">{initialData ? 'Edit Category' : 'Add New Category'}</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
                <input className="border p-2 rounded w-full" placeholder="Name" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} required />
                <input className="border p-2 rounded w-full" placeholder="Description" value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} />
                <div className="flex justify-end space-x-2">
                    <button type="button" onClick={onCancel} className="px-4 py-2 bg-gray-300 rounded">Cancel</button>
                    <button type="submit" className="px-4 py-2 bg-indigo-600 text-white rounded">Save</button>
                </div>
            </form>
        </div>
    );
};

const AdminDashboard = () => {
    const [shops, setShops] = useState([]);
    const [categories, setCategories] = useState([]);
    const [activeTab, setActiveTab] = useState('shops'); // 'shops' or 'categories'

    // Form states
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [currentShop, setCurrentShop] = useState(null);
    const [currentCategory, setCurrentCategory] = useState(null);

    useEffect(() => {
        fetchShops();
        fetchCategories();
    }, []);

    const fetchShops = async () => {
        try {
            const response = await api.get('/shops');
            setShops(response.data);
        } catch (error) {
            console.error("Error fetching shops:", error);
        }
    };

    const fetchCategories = async () => {
        try {
            const response = await api.get('/categories');
            setCategories(response.data);
        } catch (error) {
            console.error("Error fetching categories:", error);
        }
    };

    const handleSaveShop = async (shopData) => {
        try {
            // Find full category object based on ID
            const selectedCategory = categories.find(c => c.id == shopData.categoryId);
            const payload = { ...shopData, category: selectedCategory };

            if (currentShop) {
                await api.put(`/shops/${currentShop.id}`, payload);
            } else {
                await api.post('/shops', payload);
            }
            setIsFormOpen(false);
            setCurrentShop(null);
            fetchShops();
        } catch (error) {
            console.error("Error saving shop:", error);
            alert("Failed to save shop");
        }
    };

    const handleSaveCategory = async (categoryData) => {
        try {
            if (currentCategory) {
                await api.put(`/categories/${currentCategory.id}`, categoryData);
            } else {
                await api.post('/categories', categoryData);
            }
            setIsFormOpen(false);
            setCurrentCategory(null);
            fetchCategories();
        } catch (error) {
            console.error("Error saving category:", error);
            alert("Failed to save category");
        }
    };

    const handleDeleteShop = async (id) => {
        if (window.confirm('Are you sure you want to delete this shop?')) {
            try {
                await api.delete(`/shops/${id}`);
                fetchShops();
            } catch (error) {
                console.error("Error deleting shop:", error);
            }
        }
    };

    const handleDeleteCategory = async (id) => {
        if (window.confirm('Are you sure you want to delete this category?')) {
            try {
                await api.delete(`/categories/${id}`);
                fetchCategories();
            } catch (error) {
                console.error("Error deleting category:", error);
            }
        }
    };

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <h1 className="text-2xl font-bold mb-6">Admin Dashboard</h1>

            <div className="flex space-x-4 mb-6 border-b">
                <button
                    className={`pb-2 px-4 ${activeTab === 'shops' ? 'border-b-2 border-indigo-600 text-indigo-600 font-medium' : 'text-gray-500'}`}
                    onClick={() => { setActiveTab('shops'); setIsFormOpen(false); }}
                >
                    Manage Shops
                </button>
                <button
                    className={`pb-2 px-4 ${activeTab === 'categories' ? 'border-b-2 border-indigo-600 text-indigo-600 font-medium' : 'text-gray-500'}`}
                    onClick={() => { setActiveTab('categories'); setIsFormOpen(false); }}
                >
                    Manage Categories
                </button>
            </div>

            {activeTab === 'shops' && (
                <div>
                    {!isFormOpen && (
                        <button onClick={() => { setCurrentShop(null); setIsFormOpen(true); }} className="mb-4 bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700">
                            + Add Shop
                        </button>
                    )}

                    {isFormOpen && (
                        <ShopForm
                            initialData={currentShop}
                            categories={categories}
                            onSave={handleSaveShop}
                            onCancel={() => { setIsFormOpen(false); setCurrentShop(null); }}
                        />
                    )}

                    <div className="bg-white shadow overflow-hidden sm:rounded-md">
                        <ul className="divide-y divide-gray-200">
                            {shops.map(shop => (
                                <li key={shop.id} className="px-6 py-4 flex items-center justify-between">
                                    <div>
                                        <h4 className="text-lg font-medium text-gray-900">{shop.name}</h4>
                                        <p className="text-sm text-gray-500">{shop.city} - {shop.category?.name}</p>
                                    </div>
                                    <div className="space-x-2">
                                        <button onClick={() => { setCurrentShop(shop); setIsFormOpen(true); }} className="text-indigo-600 hover:text-indigo-900">Edit</button>
                                        <button onClick={() => handleDeleteShop(shop.id)} className="text-red-600 hover:text-red-900">Delete</button>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            )}

            {activeTab === 'categories' && (
                <div>
                    {!isFormOpen && (
                        <button onClick={() => { setCurrentCategory(null); setIsFormOpen(true); }} className="mb-4 bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700">
                            + Add Category
                        </button>
                    )}

                    {isFormOpen && (
                        <CategoryForm
                            initialData={currentCategory}
                            onSave={handleSaveCategory}
                            onCancel={() => { setIsFormOpen(false); setCurrentCategory(null); }}
                        />
                    )}

                    <div className="bg-white shadow overflow-hidden sm:rounded-md">
                        <ul className="divide-y divide-gray-200">
                            {categories.map(cat => (
                                <li key={cat.id} className="px-6 py-4 flex items-center justify-between">
                                    <div>
                                        <h4 className="text-lg font-medium text-gray-900">{cat.name}</h4>
                                        <p className="text-sm text-gray-500">{cat.description}</p>
                                    </div>
                                    <div className="space-x-2">
                                        <button onClick={() => { setCurrentCategory(cat); setIsFormOpen(true); }} className="text-indigo-600 hover:text-indigo-900">Edit</button>
                                        <button onClick={() => handleDeleteCategory(cat.id)} className="text-red-600 hover:text-red-900">Delete</button>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminDashboard;

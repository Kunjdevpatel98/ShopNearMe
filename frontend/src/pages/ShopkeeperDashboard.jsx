import { useState, useEffect } from 'react';
import api from '../config/api';
import ProductForm from '../components/ProductForm';
import ShopForm from '../components/ShopForm';
import ToggleSwitch from '../components/ToggleSwitch';

const ShopkeeperDashboard = () => {
    const [myShops, setMyShops] = useState([]);
    const [categories, setCategories] = useState([]);
    const [selectedShop, setSelectedShop] = useState(null);
    const [products, setProducts] = useState([]);
    const [activeTab, setActiveTab] = useState('overview'); // overview, products, orders, settings
    const [productSearch, setProductSearch] = useState('');

    // UI States
    const [isShopFormOpen, setIsShopFormOpen] = useState(false);
    const [isProductFormOpen, setIsProductFormOpen] = useState(false);
    const [editingShop, setEditingShop] = useState(null);
    const [editingProduct, setEditingProduct] = useState(null);

    useEffect(() => {
        fetchMyShops();
        fetchCategories();
    }, []);

    // Stats State
    const [stats, setStats] = useState({
        totalViews: 0,
        totalOrders: 0,
        totalSales: 0,
        rating: 4.5,
        pendingOrders: 0
    });

    useEffect(() => {
        if (selectedShop) {
            fetchProducts(selectedShop.id);
            fetchStats(selectedShop.id);
        }
    }, [selectedShop]);

    const fetchMyShops = async () => {
        try {
            const response = await api.get('/shops/my-shops');
            setMyShops(response.data);
            if (response.data.length > 0 && !selectedShop) {
                setSelectedShop(response.data[0]);
            }
        } catch (error) {
            console.error("Error fetching my shops:", error);
        }
    };

    const fetchStats = async (shopId) => {
        try {
            const response = await api.get(`/orders/shop/${shopId}/stats`);
            setStats(response.data);
        } catch (error) {
            console.error("Error fetching stats:", error);
        }
    };

    const handleSimulateData = async () => {
        if (!selectedShop) return;
        try {
            await api.post(`/orders/${selectedShop.id}/simulate`);
            fetchStats(selectedShop.id);
            alert("Simulated 5 random orders!");
        } catch (error) {
            console.error("Error simulating data:", error);
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

    const fetchProducts = async (shopId) => {
        try {
            const response = await api.get(`/products/shop/${shopId}`);
            setProducts(response.data);
        } catch (error) {
            console.error("Error fetching products:", error);
        }
    };

    const handleSaveShop = async (shopData) => {
        try {
            const selectedCategory = categories.find(c => c.id == shopData.categoryId);
            const payload = { ...shopData, category: selectedCategory };

            if (editingShop) {
                await api.put(`/shops/${editingShop.id}`, payload);
            } else {
                await api.post('/shops', payload);
            }
            setIsShopFormOpen(false);
            setEditingShop(null);
            fetchMyShops();
        } catch (error) {
            console.error("Error saving shop:", error);
            alert("Failed to save shop");
        }
    };

    const handleSaveProduct = async (productData, shopId) => {
        try {
            if (editingProduct) {
                await api.put(`/products/${editingProduct.id}`, productData);
            } else {
                await api.post(`/products/shop/${shopId}`, productData);
            }
            setIsProductFormOpen(false);
            setEditingProduct(null);
            fetchProducts(shopId);
        } catch (error) {
            console.error("Error saving product:", error);
            const errorMsg = error.response?.data?.message || error.response?.data || error.message || "Failed to save product";
            alert("Failed to save product: " + errorMsg);
        }
    };

    const handleDeleteProduct = async (productId) => {
        if (window.confirm("Delete this product?")) {
            try {
                await api.delete(`/products/${productId}`);
                fetchProducts(selectedShop.id);
            } catch (error) {
                console.error("Error deleting product:", error);
            }
        }
    };

    const Sidebar = () => (
        <div className="w-72 bg-[#1A1C1E] text-white flex-shrink-0 flex flex-col hidden md:flex shadow-2xl z-10">
            <div className="p-8">
                <div className="flex items-center gap-3 mb-1">
                    <div className="w-8 h-8 rounded-lg bg-[#ef4f5f] flex items-center justify-center font-bold text-white">P</div>
                    <span className="text-xl font-bold tracking-tight">Partner<span className="text-[#ef4f5f]">Hub</span></span>
                </div>
                <p className="text-xs text-gray-500 pl-11">Manage your business</p>
            </div>

            <nav className="flex-1 px-4 space-y-2 mt-4">
                {[
                    { id: 'overview', label: 'Overview', icon: '📊' },
                    { id: 'products', label: 'Products', icon: '📦' },
                    { id: 'orders', label: 'Orders', icon: '🧾' },
                    { id: 'settings', label: 'Settings', icon: '⚙️' },
                ].map(item => (
                    <button
                        key={item.id}
                        onClick={() => setActiveTab(item.id)}
                        className={`w-full flex items-center gap-4 px-4 py-3.5 rounded-xl text-sm font-medium transition-all duration-300 ${activeTab === item.id
                            ? 'bg-[#ef4f5f] text-white shadow-lg shadow-red-900/20 translate-x-1'
                            : 'text-gray-400 hover:bg-white/5 hover:text-white'
                            }`}
                    >
                        <span className="text-lg">{item.icon}</span>
                        {item.label}
                    </button>
                ))}
            </nav>

            <div className="p-4 border-t border-white/10 bg-[#151718]">
                <div className="text-xs font-bold text-gray-500 mb-3 uppercase tracking-wider px-2">Your Shops</div>
                <div className="space-y-2 max-h-48 overflow-y-auto custom-scrollbar">
                    {myShops.map(shop => (
                        <div
                            key={shop.id}
                            onClick={() => setSelectedShop(shop)}
                            className={`group flex items-center gap-3 p-2.5 rounded-lg cursor-pointer transition-all ${selectedShop?.id === shop.id ? 'bg-white/10 border border-white/5' : 'hover:bg-white/5 border border-transparent'}`}
                        >
                            <div className={`w-8 h-8 rounded-md flex items-center justify-center text-xs font-bold flex-shrink-0 transition-colors ${selectedShop?.id === shop.id ? 'bg-[#ef4f5f] text-white' : 'bg-gray-800 text-gray-400 group-hover:bg-gray-700'}`}>
                                {shop.name[0]}
                            </div>
                            <div className="overflow-hidden">
                                <div className={`text-sm font-medium truncate ${selectedShop?.id === shop.id ? 'text-white' : 'text-gray-400 group-hover:text-white'}`}>{shop.name}</div>
                            </div>
                        </div>
                    ))}
                </div>
                <button
                    onClick={() => { setEditingShop(null); setIsShopFormOpen(true); }}
                    className="mt-4 w-full flex items-center justify-center gap-2 py-2.5 rounded-lg border border-dashed border-gray-600 text-gray-400 text-xs font-bold hover:border-[#ef4f5f] hover:text-[#ef4f5f] transition-all"
                >
                    <span>+</span> Add Another Shop
                </button>
            </div>
        </div>
    );

    const StatCard = ({ title, value, icon, gradient, trend }) => (
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] hover:shadow-lg transition-shadow relative overflow-hidden group">
            <div className={`absolute top-0 right-0 w-24 h-24 bg-gradient-to-br ${gradient} opacity-10 rounded-bl-full transform translate-x-4 -translate-y-4 transition-transform group-hover:scale-110`}></div>
            <div className="flex justify-between items-start mb-4">
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center text-xl text-white shadow-md`}>
                    {icon}
                </div>
                {trend && (
                    <div className="flex items-center gap-1 text-xs font-bold text-green-500 bg-green-50 px-2 py-1 rounded-full">
                        ↑ {trend}%
                    </div>
                )}
            </div>
            <div>
                <div className="text-sm font-medium text-gray-400 mb-1">{title}</div>
                <div className="text-3xl font-bold text-gray-800 tracking-tight">{value}</div>
            </div>
        </div>
    );

    const handleToggleShopStatus = async () => {
        if (!selectedShop) return;
        const currentStatus = selectedShop.manualOpen !== undefined ? selectedShop.manualOpen : selectedShop.open;
        const newStatus = !currentStatus;
        console.log("DEBUG: handleToggleShopStatus called for shop", selectedShop.id, "to", newStatus);
        try {
            await api.put(`/shops/${selectedShop.id}/status`, { isOpen: newStatus });
            // Update local state for immediate feedback
            const updatedShops = myShops.map(s => s.id === selectedShop.id ? { ...s, open: newStatus, manualOpen: newStatus } : s);
            setMyShops(updatedShops);
            setSelectedShop({ ...selectedShop, open: newStatus, manualOpen: newStatus });
        } catch (error) {
            console.error("Error toggling shop status:", error);
            alert("Failed to update shop status");
        }
    };

    const handleToggleAvailability = async (product) => {
        console.log("DEBUG: handleToggleAvailability called for product", product.id, "current isAvailable:", product.isAvailable);
        try {
            const newStatus = !product.isAvailable;
            console.log("DEBUG: Sending request to toggle product", product.id, "to", newStatus);
            const response = await api.put(`/products/${product.id}/availability`, { isAvailable: newStatus });
            console.log("DEBUG: API Response received:", response.status);
            // Re-fetch products for the selected shop to ensure UI sync
            if (selectedShop) {
                console.log("DEBUG: Re-fetching products for shop", selectedShop.id);
                fetchProducts(selectedShop.id);
            }
        } catch (error) {
            console.error("Error toggling availability:", error);
            const errorMsg = error.response?.data?.message || error.response?.data || error.message;
            alert("Failed to update status: " + errorMsg);
        }
    };


    const ProductCard = ({ product }) => (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-[0_8px_30px_rgb(0,0,0,0.04)] transition-all duration-300 group overflow-hidden flex flex-col h-full">
            <div className="relative aspect-[4/3] bg-gray-100 overflow-hidden">
                {product.imageUrl ? (
                    <img
                        src={product.imageUrl}
                        alt={product.name}
                        className={`w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ${!product.isAvailable ? 'grayscale opacity-60' : ''}`}
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center text-4xl text-gray-300 bg-gray-50">
                        📦
                    </div>
                )}
                <div className="absolute top-3 left-3 flex gap-2">
                    <span className="bg-white/90 backdrop-blur-sm px-2 py-1 rounded-lg text-xs font-bold text-gray-700 shadow-sm border border-gray-100">
                        {product.category?.name || 'Item'}
                    </span>
                </div>
                <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="flex gap-2">
                        <button
                            onClick={() => { setEditingProduct(product); setIsProductFormOpen(true); }}
                            className="bg-white p-2 rounded-lg shadow-lg hover:bg-gray-50 text-gray-700 transition-colors"
                            title="Edit"
                        >
                            ✏️
                        </button>
                        <button
                            onClick={() => handleDeleteProduct(product.id)}
                            className="bg-white p-2 rounded-lg shadow-lg hover:bg-red-50 text-red-500 transition-colors"
                            title="Delete"
                        >
                            🗑️
                        </button>
                    </div>
                </div>
            </div>

            <div className="p-5 flex-1 flex flex-col">
                <div className="flex justify-between items-start mb-2">
                    <h3 className="font-bold text-gray-800 text-lg leading-snug line-clamp-2" title={product.name}>{product.name}</h3>
                    <span className="font-bold text-[#ef4f5f] bg-red-50 px-2 py-1 rounded-md text-sm shrink-0 ml-2">₹{product.price}</span>
                </div>
                <p className="text-gray-500 text-sm mb-4 line-clamp-2 flex-grow">{product.description}</p>

                <div className="flex items-center justify-between pt-4 border-t border-gray-50 mt-auto">
                    <span className="text-xs text-gray-400">ID: {product.id}</span>
                    {/* Toggle removed as requested */}
                </div>
            </div>
        </div>
    );

    if (myShops.length === 0 && !isShopFormOpen && !editingShop) {
        return (
            <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
                <div className="text-center mb-8 animate-fade-in-up">
                    <div className="w-20 h-20 bg-gradient-to-br from-[#ef4f5f] to-orange-500 rounded-3xl mx-auto mb-6 flex items-center justify-center text-4xl shadow-xl shadow-red-200 text-white">
                        🏪
                    </div>
                    <h1 className="text-3xl font-extrabold text-gray-900 mb-2">Welcome to PartnerHub</h1>
                    <p className="text-gray-500 max-w-md mx-auto">Your professional command center for managing shops, products, and orders. (V2)</p>
                </div>
                <button
                    onClick={() => { setEditingShop(null); setIsShopFormOpen(true); }}
                    className="bg-[#1A1C1E] text-white px-8 py-3.5 rounded-xl font-bold text-lg shadow-lg shadow-gray-200 hover:bg-black hover:scale-105 transition-all"
                >
                    + Register First Shop
                </button>
                {isShopFormOpen && (
                    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
                        <div className="bg-white rounded-2xl p-8 w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl">
                            <h2 className="text-3xl font-bold mb-6 text-gray-900">Get Started</h2>
                            <ShopForm
                                initialData={editingShop}
                                categories={categories}
                                onSave={handleSaveShop}
                                onCancel={() => { setIsShopFormOpen(false); setEditingShop(null); }}
                            />
                        </div>
                    </div>
                )}
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-[#F3F4F6] font-sans flex text-[#1c1c1c] fixed inset-0 top-0 pt-0">
            {/* Main Layout Layer to handle fixed position properly */}
            <div className="flex w-full h-full pt-[72px]">
                <Sidebar />

                {/* Mobile Header */}
                <div className="md:hidden fixed top-0 w-full bg-white z-20 border-b border-gray-200 p-4 flex justify-between items-center mt-20">
                    <div className="font-bold text-[#ef4f5f] italic">PartnerHub</div>
                    <button onClick={() => { }} className="text-gray-500">Menu</button>
                </div>

                {/* Main Content Area */}
                <div className="flex-1 overflow-y-auto h-full p-6 md:p-10 scroll-smooth">
                    {selectedShop ? (
                        <div className="max-w-7xl mx-auto space-y-8 pb-20">

                            {/* Header */}
                            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                                <div>
                                    <div className="flex items-center gap-3 mb-1">
                                        <h1 className="text-3xl font-extrabold text-gray-900">{selectedShop.name}</h1>
                                        {selectedShop.open ? (
                                            <span className="bg-green-100 text-green-700 text-xs font-bold px-2 py-1 rounded-full border border-green-200">OPEN</span>
                                        ) : (
                                            <span className="bg-red-100 text-red-700 text-xs font-bold px-2 py-1 rounded-full border border-red-200">CLOSED</span>
                                        )}
                                    </div>
                                    <p className="text-gray-400 font-medium flex items-center gap-2 text-sm">
                                        <span>📍 {selectedShop.city}</span> • <span>🆔 {selectedShop.id}</span>
                                    </p>
                                </div>
                                <div className="flex items-center gap-4 w-full md:w-auto">
                                    <div className="flex flex-col items-center">
                                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">Shop Status</span>
                                        <ToggleSwitch
                                            isOn={selectedShop.manualOpen !== undefined ? selectedShop.manualOpen : selectedShop.open}
                                            onToggle={handleToggleShopStatus}
                                            id={`shop-status-toggle-${selectedShop.id}`}
                                        />
                                    </div>
                                    <button
                                        onClick={() => setActiveTab('settings')}
                                        className="flex-1 md:flex-none px-5 py-2.5 bg-[#ef4f5f] text-white rounded-xl text-sm font-bold shadow-lg shadow-red-200 hover:bg-[#d03f4f] hover:translate-y-[-1px] transition-all"
                                    >
                                        Edit Shop
                                    </button>
                                </div>
                            </div>

                            {/* Dynamic Content */}
                            {activeTab === 'overview' && (
                                <div className="space-y-8 animate-fade-in-up">
                                    {/* Stats Grid */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                                        <StatCard title="Total Views" value={stats.totalViews} icon="👁️" gradient="from-blue-400 to-blue-600" trend={12} />
                                        <StatCard title="Orders Today" value={stats.totalOrders} icon="🧾" gradient="from-emerald-400 to-emerald-600" trend={5} />
                                        <StatCard title="Total Sales" value={`₹${stats.totalSales.toFixed(0)}`} icon="💰" gradient="from-violet-400 to-violet-600" trend={8} />
                                        <StatCard title="Rating" value={`${stats.rating} ★`} icon="⭐" gradient="from-amber-400 to-amber-600" />
                                    </div>

                                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                                        {/* Chart Section */}
                                        <div className="lg:col-span-2 bg-white p-8 rounded-3xl border border-gray-100 shadow-sm min-h-[400px] flex flex-col">
                                            <div className="flex justify-between items-center mb-8">
                                                <h3 className="text-xl font-bold text-gray-800">Sales Analytics</h3>
                                                <select className="bg-gray-50 border-none text-sm font-bold text-gray-600 rounded-lg py-2 px-4 cursor-pointer hover:bg-gray-100">
                                                    <option>This Week</option>
                                                    <option>This Month</option>
                                                    <option>This Year</option>
                                                </select>
                                            </div>
                                            <div className="flex-1 flex flex-col items-center justify-center text-gray-300 border-2 border-dashed border-gray-100 rounded-2xl bg-gray-50/50">
                                                <div className="text-5xl mb-4">📈</div>
                                                <p className="font-medium">Chart Visualization Placeholder</p>
                                                <button onClick={handleSimulateData} className="mt-6 px-6 py-2 bg-white border border-gray-200 rounded-full text-sm font-bold text-primary shadow-sm hover:shadow-md transition-all">
                                                    Simulate Live Data
                                                </button>
                                            </div>
                                        </div>

                                        {/* Recent Activity */}
                                        <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm">
                                            <h3 className="text-xl font-bold text-gray-800 mb-6">Recent Activity</h3>
                                            <div className="space-y-6">
                                                <div className="flex items-center gap-4 p-4 rounded-2xl bg-orange-50 border border-orange-100">
                                                    <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center text-orange-600 font-bold">
                                                        ⚠️
                                                    </div>
                                                    <div>
                                                        <div className="text-sm font-bold text-gray-800">Pending Orders</div>
                                                        <div className="text-xs text-orange-600 font-medium">{stats.pendingOrders} orders waiting</div>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-4 p-4 rounded-2xl bg-green-50 border border-green-100">
                                                    <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center text-green-600 font-bold">
                                                        ⚡
                                                    </div>
                                                    <div>
                                                        <div className="text-sm font-bold text-gray-800">System Status</div>
                                                        <div className="text-xs text-green-600 font-medium">All systems operational</div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {activeTab === 'products' && (
                                <div className="animate-fade-in-up">
                                    {/* Toolbar */}
                                    <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-8">
                                        <div className="relative w-full md:w-96">
                                            <input
                                                type="text"
                                                placeholder="Search products..."
                                                value={productSearch}
                                                onChange={(e) => setProductSearch(e.target.value)}
                                                className="w-full pl-12 pr-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#ef4f5f]/20 focus:border-[#ef4f5f] transition-all shadow-sm"
                                            />
                                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-lg">🔍</span>
                                        </div>
                                        <button
                                            onClick={() => { setEditingProduct(null); setIsProductFormOpen(true); }}
                                            className="w-full md:w-auto bg-[#1A1C1E] text-white px-6 py-3 rounded-xl font-bold shadow-lg hover:bg-black hover:scale-105 transition-all flex items-center justify-center gap-2"
                                        >
                                            <span>+</span> Add New Item
                                        </button>
                                    </div>

                                    {/* Products Grid */}
                                    {products.length === 0 ? (
                                        <div className="bg-white rounded-3xl p-16 text-center border border-gray-100 shadow-sm">
                                            <div className="text-6xl mb-6 opacity-20">📦</div>
                                            <h3 className="text-2xl font-bold text-gray-900 mb-2">No Products Yet</h3>
                                            <p className="text-gray-500 mb-8 max-w-sm mx-auto">Start building your menu by adding your first product. It only takes a few seconds.</p>
                                            <button
                                                onClick={() => { setEditingProduct(null); setIsProductFormOpen(true); }}
                                                className="bg-[#ef4f5f] text-white px-8 py-3 rounded-xl font-bold hover:bg-[#d03f4f] transition-colors shadow-lg shadow-red-200"
                                            >
                                                Add First Product
                                            </button>
                                        </div>
                                    ) : (
                                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                                            {products
                                                .filter(p => p.name.toLowerCase().includes(productSearch.toLowerCase()))
                                                .map(product => (
                                                    <ProductCard key={product.id} product={product} />
                                                ))}
                                        </div>
                                    )}
                                </div>
                            )}

                            {activeTab === 'settings' && (
                                <div className="animate-fade-in-up max-w-4xl mx-auto">
                                    <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm">
                                        <div className="flex items-center gap-3 mb-8 pb-8 border-b border-gray-100">
                                            <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center text-xl">⚙️</div>
                                            <div>
                                                <h2 className="text-2xl font-bold text-gray-900">Shop Settings</h2>
                                                <p className="text-gray-500 text-sm">Update your store information and preferences</p>
                                            </div>
                                        </div>
                                        <ShopForm
                                            initialData={selectedShop}
                                            categories={categories}
                                            onSave={(data) => { handleSaveShop(data); }}
                                            onCancel={() => setActiveTab('overview')}
                                        />
                                    </div>
                                </div>
                            )}

                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center h-full text-gray-400">
                            <div className="text-4xl mb-4">👈</div>
                            <p className="font-medium">Select a shop from the sidebar to manage</p>
                        </div>
                    )}
                </div>

                {/* Modals */}
                {isProductFormOpen && (
                    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                        <div className="bg-white rounded-2xl p-8 w-full max-w-lg shadow-2xl animate-fade-in-up max-h-[90vh] overflow-y-auto">
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-2xl font-bold text-gray-900">{editingProduct ? 'Edit Item' : 'Add New Item'}</h2>
                                <button onClick={() => { setIsProductFormOpen(false); setEditingProduct(null); }} className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 hover:bg-gray-200 transition-colors">✕</button>
                            </div>
                            <ProductForm
                                initialData={editingProduct}
                                shopId={selectedShop?.id}
                                categories={categories}
                                onSave={handleSaveProduct}
                                onCancel={() => { setIsProductFormOpen(false); setEditingProduct(null); }}
                            />
                        </div>
                    </div>
                )}

                {(isShopFormOpen && activeTab !== 'settings') && (
                    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                        <div className="bg-white rounded-2xl p-8 w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl">
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-2xl font-bold text-gray-900">Register New Shop</h2>
                                <button onClick={() => { setIsShopFormOpen(false); setEditingShop(null); }} className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 hover:bg-gray-200 transition-colors">✕</button>
                            </div>
                            <ShopForm
                                initialData={editingShop}
                                categories={categories}
                                onSave={handleSaveShop}
                                onCancel={() => { setIsShopFormOpen(false); setEditingShop(null); }}
                            />
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ShopkeeperDashboard;

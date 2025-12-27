import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../config/api';
import { Link } from 'react-router-dom';

const ProfilePage = () => {
    const { user } = useAuth();
    const [myShops, setMyShops] = useState([]);
    const [bookmarks, setBookmarks] = useState([]);
    const [wishlistProducts, setWishlistProducts] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (user) {
            if (user.role === 'SHOPKEEPER') {
                fetchMyShops();
            }
            fetchBookmarks();
            fetchWishlist();
        } else {
            setIsLoading(false);
        }
    }, [user]);

    const fetchMyShops = async () => {
        try {
            const response = await api.get('/shops/my-shops');
            setMyShops(response.data);
        } catch (error) {
            console.error("Error fetching shops:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const fetchBookmarks = async () => {
        try {
            const response = await api.get('/bookmarks');
            setBookmarks(response.data);
        } catch (error) {
            console.error("Error fetching bookmarks:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const fetchWishlist = async () => {
        try {
            const response = await api.get('/wishlist');
            setWishlistProducts(response.data);
        } catch (error) {
            console.error("Error fetching wishlist:", error);
        }
    };

    const removeBookmark = async (shopId) => {
        try {
            await api.post(`/bookmarks/${shopId}`);
            setBookmarks(bookmarks.filter(b => b.id !== shopId));
        } catch (error) {
            console.error("Error removing bookmark:", error);
        }
    };

    const removeWishlistItem = async (productId) => {
        try {
            await api.post(`/wishlist/${productId}`); // Toggle API removes if exists
            setWishlistProducts(wishlistProducts.filter(p => p.id !== productId));
        } catch (error) {
            console.error("Error removing wishlist item:", error);
        }
    };

    if (!user) return <div className="pt-24 text-center">Please log in to view profile.</div>;

    const ShopCard = ({ shop, isBookmark }) => (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow overflow-hidden group relative">
            <Link to={`/shops/${shop.id}`} className="block h-32 bg-gray-100 relative group">
                {shop.imageUrl ? (
                    <img src={shop.imageUrl} alt={shop.name} className="w-full h-full object-cover" />
                ) : (
                    <div className="flex items-center justify-center h-full text-4xl text-gray-300">🏪</div>
                )}
                <div className={`absolute top-2 right-2 px-2 py-1 rounded-md text-xs font-bold ${shop.open ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                    {shop.open ? 'OPEN' : 'CLOSED'}
                </div>
            </Link>
            <div className="p-4">
                <Link to={`/shops/${shop.id}`} className="block">
                    <h3 className="font-bold text-gray-800 text-lg mb-1 group-hover:text-[#ef4f5f] transition-colors">{shop.name}</h3>
                </Link>
                <p className="text-gray-500 text-sm mb-3 line-clamp-1">{shop.city}</p>
                <div className="flex justify-between items-center border-t border-gray-50 pt-3">
                    <span className="text-xs text-gray-400">{shop.category?.name || 'Shop'}</span>
                    {isBookmark ? (
                        <button
                            onClick={() => removeBookmark(shop.id)}
                            className="text-xs font-medium text-red-500 hover:text-red-700 hover:underline flex items-center gap-1"
                        >
                            <span className="text-lg">🗑️</span> Remove
                        </button>
                    ) : (
                        <Link to="/shopkeeper" className="text-xs font-medium text-[#ef4f5f] hover:underline">
                            Manage Shop →
                        </Link>
                    )}
                </div>
            </div>
        </div>
    );

    const ProductCard = ({ product }) => (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow overflow-hidden flex flex-col">
            <div className="h-40 w-full relative bg-gray-50 p-4">
                {product.imageUrl ? (
                    <img src={product.imageUrl} alt={product.name} className="w-full h-full object-contain mix-blend-multiply" />
                ) : (
                    <div className="w-full h-full flex items-center justify-center text-4xl opacity-20">🎁</div>
                )}
                <button
                    onClick={() => removeWishlistItem(product.id)}
                    className="absolute top-2 right-2 bg-white/80 p-1.5 rounded-full hover:bg-red-50 text-red-500 transition-colors shadow-sm"
                    title="Remove from wishlist"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                        <path d="M11.645 20.91l-.007-.003-.022-.012a15.247 15.247 0 01-.383-.218 25.18 25.18 0 01-4.244-3.17C4.688 15.36 2.25 12.174 2.25 8.25 2.25 5.322 4.714 3 7.688 3A5.5 5.5 0 0112 5.052 5.5 5.5 0 0116.313 3c2.973 0 5.437 2.322 5.437 5.25 0 3.925-2.438 7.111-4.739 9.256a25.175 25.175 0 01-4.244 3.17 15.247 15.247 0 01-.383.219l-.022.012-.007.004-.003.001a.752.752 0 01-.704 0l-.003-.001z" />
                    </svg>
                </button>
            </div>
            <div className="p-4 flex flex-col flex-1">
                <Link to={`/shops/${product.shop?.id}`} className="block mb-1">
                    <h4 className="font-bold text-gray-800 line-clamp-1 hover:text-[#ef4f5f]">{product.name}</h4>
                </Link>
                <div className="text-xs text-gray-500 mb-2 flex items-center gap-1">
                    <span>by {product.shop?.name || "Unknown Shop"}</span>
                </div>
                <div className="mt-auto flex justify-between items-center pt-2 border-t border-dashed border-gray-100">
                    <span className="font-bold text-[#ef4f5f]">₹{product.price}</span>
                    <Link to={`/shops/${product.shop?.id}`} className="text-xs font-bold bg-gray-900 text-white px-3 py-1.5 rounded-lg hover:bg-black transition-colors">
                        Buy Now
                    </Link>
                </div>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-gray-50 pt-24 pb-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto space-y-8">

                {/* Profile Header */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 flex flex-col md:flex-row items-center gap-8 animate-fade-in-up">
                    <div className="w-24 h-24 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-4xl font-bold text-white shadow-lg">
                        {user.email[0].toUpperCase()}
                    </div>
                    <div className="text-center md:text-left flex-1 space-y-2">
                        <h1 className="text-3xl font-bold text-gray-900">{user.name || "User"}</h1>
                        <p className="text-gray-500 font-medium">{user.email}</p>
                        <div className="flex items-center justify-center md:justify-start gap-4 pt-2">
                            <span className="px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 text-xs font-bold uppercase tracking-wide border border-indigo-100">
                                {user.role}
                            </span>
                        </div>
                    </div>
                    {user.role === 'SHOPKEEPER' && (
                        <div>
                            <Link to="/shopkeeper" className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-xl text-white bg-[#ef4f5f] hover:bg-[#d03f4f] shadow-lg shadow-red-200 transition-all transform hover:-translate-y-0.5">
                                Go to Dashboard
                            </Link>
                        </div>
                    )}
                </div>

                {/* Content Section */}
                {user.role === 'SHOPKEEPER' && (
                    <div className="animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-2xl font-bold text-gray-800">My Shops</h2>
                            <Link to="/shopkeeper" className="text-sm font-medium text-[#ef4f5f] hover:text-[#d03f4f]">
                                + Add New Shop
                            </Link>
                        </div>

                        {isLoading ? (
                            <div className="text-center py-12 text-gray-400">Loading shops...</div>
                        ) : myShops.length > 0 ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                                {myShops.map(shop => (
                                    <ShopCard key={shop.id} shop={shop} />
                                ))}
                            </div>
                        ) : (
                            <div className="bg-white rounded-xl col-span-full p-12 text-center border-2 border-dashed border-gray-200">
                                <div className="text-6xl mb-4">🏪</div>
                                <h3 className="text-lg font-bold text-gray-900 mb-2">No Shops Yet</h3>
                                <p className="text-gray-500 mb-6">You haven't created any shops yet. Start your journey today!</p>
                                <Link to="/shopkeeper" className="inline-block px-6 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors">
                                    Create First Shop
                                </Link>
                            </div>
                        )}
                    </div>
                )}

                <div className="animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
                    <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                        <span>🔖</span> My Bookmarks
                    </h2>
                    {bookmarks.length > 0 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                            {bookmarks.map(shop => (
                                <ShopCard key={shop.id} shop={shop} isBookmark={true} />
                            ))}
                        </div>
                    ) : (
                        <div className="bg-white rounded-xl p-8 text-center text-gray-400 border border-gray-100">
                            <p>No saved shops yet.</p>
                            <Link to="/" className="text-[#ef4f5f] hover:underline mt-2 inline-block">Explore Shops</Link>
                        </div>
                    )}
                </div>

                <div className="animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
                    <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                        <span className="text-red-500">❤️</span> My Wishlist
                    </h2>
                    {wishlistProducts.length > 0 ? (
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                            {wishlistProducts.map(product => (
                                <ProductCard key={product.id} product={product} />
                            ))}
                        </div>
                    ) : (
                        <div className="bg-white rounded-xl p-8 text-center text-gray-400 border border-gray-100">
                            <p>No liked products yet.</p>
                            <Link to="/" className="text-[#ef4f5f] hover:underline mt-2 inline-block">Explore Products</Link>
                        </div>
                    )}
                </div>

            </div>
        </div>
    );
};

export default ProfilePage;

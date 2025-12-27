import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../config/api';
import { useAuth } from '../context/AuthContext';
import ProductRating from '../components/ProductRating';
import ToggleSwitch from '../components/ToggleSwitch';

const ShopDetailsPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const [shop, setShop] = useState(null);
    const [products, setProducts] = useState([]);
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('products'); // products, overview, reviews
    const [isBookmarked, setIsBookmarked] = useState(false);
    const [newReview, setNewReview] = useState({ rating: 5, text: '' });
    const [submittingReview, setSubmittingReview] = useState(false);
    const [wishlistIds, setWishlistIds] = useState([]);

    useEffect(() => {
        const fetchShopAndProducts = async () => {
            try {
                const [shopRes, productsRes] = await Promise.all([
                    api.get(`/shops/${id}`),
                    api.get(`/products/shop/${id}`)
                ]);
                setShop(shopRes.data);
                setProducts(productsRes.data);

                // Fetch reviews separately so main page doesn't crash if this fails
                try {
                    const reviewsRes = await api.get(`/reviews/shop/${id}`);
                    setReviews(reviewsRes.data);
                } catch (reviewErr) {
                    console.warn("Could not fetch reviews:", reviewErr);
                }

            } catch (error) {
                console.error('Error fetching details:', error);
            } finally {
                setLoading(false);
            }
        };

        const checkBookmarkStatus = async () => {
            if (user) {
                try {
                    const res = await api.get(`/bookmarks/${id}/check`);
                    setIsBookmarked(res.data.bookmarked);
                } catch (error) {
                    console.error('Error checking bookmark:', error);
                }
            }
        };

        const fetchWishlistIds = async () => {
            if (user) {
                try {
                    const res = await api.get('/wishlist/ids');
                    setWishlistIds(res.data);
                } catch (error) {
                    console.error('Error checking wishlist:', error);
                }
            }
        };

        fetchShopAndProducts();
        checkBookmarkStatus();
        fetchWishlistIds();
    }, [id, user]);

    const toggleWishlist = async (productId) => {
        if (!user) {
            navigate('/login');
            return;
        }
        try {
            await api.post(`/wishlist/${productId}`);
            setWishlistIds(prev => {
                if (prev.includes(productId)) {
                    return prev.filter(pid => pid !== productId);
                } else {
                    return [...prev, productId];
                }
            });
        } catch (error) {
            console.error("Error toggling wishlist:", error);
        }
    };

    const isOwner = user && shop && shop.owner && (user.id == shop.owner.id || user.email === shop.owner.email);

    const handleToggleAvailability = async (product) => {
        console.log("DEBUG: handleToggleAvailability called for product", product.id, "current isAvailable:", product.isAvailable);
        try {
            const newStatus = !product.isAvailable;
            console.log("DEBUG: Sending request to toggle product", product.id, "to", newStatus);
            const response = await api.put(`/products/${product.id}/availability`, { isAvailable: newStatus });
            console.log("DEBUG: API Response received:", response.status);
            // Refresh products
            const productsRes = await api.get(`/products/shop/${id}`);
            setProducts(productsRes.data);
        } catch (error) {
            console.error("Error toggling availability:", error);
            const errorMsg = error.response?.data?.message || error.response?.data || error.message;
            alert("Failed to update status: " + errorMsg);
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-screen bg-white">
                <div className="animate-bounce flex space-x-2">
                    <div className="w-3 h-3 bg-[#ef4f5f] rounded-full"></div>
                    <div className="w-3 h-3 bg-[#ef4f5f] rounded-full animation-delay-200"></div>
                    <div className="w-3 h-3 bg-[#ef4f5f] rounded-full animation-delay-400"></div>
                </div>
            </div>
        );
    }

    if (!shop) {
        return <div className="text-center mt-20 text-xl font-bold text-gray-400">Shop not found.</div>;
    }

    return (
        <div className="min-h-screen bg-white font-sans pb-20 pt-20">
            {/* Single Hero Image Header */}
            <div className="w-full h-auto md:min-h-[540px] grid grid-cols-1 md:grid-cols-2 bg-white border-b border-gray-100 overflow-hidden">
                {/* Left: Hero Image */}
                <div className="relative h-[300px] md:h-full bg-gray-100 overflow-hidden group">
                    {shop.imageUrl ? (
                        <img
                            src={shop.imageUrl}
                            alt={shop.name}
                            className={`w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105 ${!shop.open ? 'grayscale opacity-60' : ''}`}
                        />
                    ) : (
                        <div className="w-full h-full bg-gray-50 flex items-center justify-center">
                            <span className="text-8xl opacity-30">🏪</span>
                        </div>
                    )}
                </div>

                {/* Right: Visit Our Store Section */}
                <div className="bg-white p-8 md:p-16 flex flex-col justify-center border-l border-gray-50">
                    <div className="mb-6">
                        <span className="inline-flex items-center gap-2 bg-[#fff2f3] text-[#ef4f5f] px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-[0.2em] shadow-sm">
                            <span className="w-1.5 h-1.5 bg-[#ef4f5f] rounded-full"></span>
                            Live Location
                        </span>
                    </div>

                    <h2 className="text-5xl font-black text-[#1A1C1E] mb-8 tracking-tighter">Visit Our Store</h2>

                    <div className="flex items-center gap-5 mb-10">
                        <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center flex-shrink-0 text-2xl shadow-[0_10px_30px_-10px_rgba(0,0,0,0.1)] border border-gray-100">
                            <span className="text-[#ef4f5f]">📍</span>
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-gray-800 tracking-tight">
                                {shop.name}
                            </p>
                            <p className="text-[11px] font-black text-gray-400 uppercase tracking-widest mt-1">
                                {shop.city} • 2.5 KM FROM YOU
                            </p>
                        </div>
                    </div>

                    {/* Interactive Map Card */}
                    <div
                        className="w-full h-48 bg-gray-100 rounded-[2.5rem] mb-6 overflow-hidden relative group cursor-pointer border border-gray-100 shadow-sm"
                        onClick={() => {
                            const url = `https://www.google.com/maps/search/?api=1&query=${shop.latitude},${shop.longitude}`;
                            window.open(url, '_blank');
                        }}
                    >
                        <img
                            src="https://images.unsplash.com/photo-1526778548025-fa2f459cd5c1?q=80&w=2000&auto=format&fit=crop"
                            className="w-full h-full object-cover grayscale opacity-60 group-hover:opacity-100 group-hover:grayscale-0 transition-all duration-1000"
                            alt="Map"
                        />
                        <div className="absolute inset-0 flex items-center justify-center">
                            <div className="bg-white px-8 py-3.5 rounded-2xl font-black text-sm shadow-2xl flex items-center gap-3 transform group-hover:scale-105 transition-transform border border-gray-50">
                                <span className="text-xl">🗺️</span>
                                Open Interactive Map
                            </div>
                        </div>
                    </div>

                    <button
                        onClick={() => {
                            const url = `https://www.google.com/maps/search/?api=1&query=${shop.latitude},${shop.longitude}`;
                            window.open(url, '_blank');
                        }}
                        className="w-full py-5 bg-[#ef4f5f] text-white rounded-[1.5rem] font-black text-lg shadow-2xl shadow-red-100 hover:bg-[#d03f5f] hover:translate-y-[-2px] transition-all flex items-center justify-center gap-3 active:translate-y-0"
                    >
                        🚀 Direction
                    </button>
                </div>
            </div>

            <div className="w-full px-6 md:px-12 lg:px-16 mt-12 mb-20">
                <div className="flex flex-col gap-10">

                    {/* Main Column: Info & Details - Now Full Width */}
                    <div className="w-full">
                        <div className="flex justify-between items-start mb-2">
                            <div>
                                <div className="flex items-center gap-3 mb-2">
                                    <h1 className="text-4xl md:text-5xl font-black text-[#1A1C1E] tracking-tight">{shop.name}</h1>
                                    {shop.open ? (
                                        <span className="bg-green-100 text-green-700 text-xs font-bold px-3 py-1 rounded-full border border-green-200 shadow-sm">OPEN</span>
                                    ) : (
                                        <span className="bg-red-100 text-red-700 text-xs font-bold px-3 py-1 rounded-full border border-red-200 shadow-sm">CLOSED</span>
                                    )}
                                </div>
                                <div className="text-gray-400 text-lg font-bold tracking-tight mb-8">
                                    {shop.category?.name || "Retail Store"} • {shop.city}
                                </div>
                            </div>
                            <div className="flex items-center gap-1.5 bg-[#008f4c] text-white px-3 py-1.5 rounded-lg font-black text-xl shadow-lg shadow-green-100 flex-shrink-0">
                                <span>{shop.rating || '4.2'}</span>
                                <span className="text-sm">★</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex gap-4 mb-12">
                    <button
                        onClick={async () => {
                            if (!user) { navigate('/login'); return; }
                            try {
                                const res = await api.post(`/bookmarks/${id}`);
                                setIsBookmarked(res.data.bookmarked);
                            } catch (error) { console.error('Error toggling bookmark', error); }
                        }}
                        className={`px-8 py-3.5 border-2 rounded-2xl font-black text-xs uppercase tracking-widest transition-all flex items-center gap-3 ${isBookmarked ? 'bg-[#ef4f5f] text-white border-[#ef4f5f] shadow-xl shadow-red-100' : 'bg-white text-[#ef4f5f] border-gray-100 hover:border-[#ef4f5f]'
                            }`}
                    >
                        <span className="text-lg">🚩</span> Bookmark
                    </button>
                    <button
                        onClick={() => {
                            if (navigator.share) {
                                navigator.share({ title: shop.name, url: window.location.href });
                            } else {
                                navigator.clipboard.writeText(window.location.href);
                                alert('Copied!');
                            }
                        }}
                        className="px-8 py-3.5 border-2 border-gray-100 bg-white text-gray-400 hover:text-gray-900 hover:border-gray-900 rounded-2xl font-black text-xs uppercase tracking-widest transition-all flex items-center gap-3"
                    >
                        <span className="text-lg">🔗</span> Share
                    </button>
                </div>

                {/* Interactive Tabs */}
                <div className="border-b border-gray-200 mb-6 sticky top-[72px] bg-white z-40">
                    <div className="flex gap-8 text-lg font-medium text-gray-500">
                        <span
                            onClick={() => setActiveTab('products')}
                            className={`pb-3 border-b-2 cursor-pointer transition-colors ${activeTab === 'products' ? 'border-[#ef4f5f] text-[#ef4f5f]' : 'border-transparent hover:border-gray-300'
                                }`}
                        >
                            Products
                        </span>
                        <span
                            onClick={() => setActiveTab('overview')}
                            className={`pb-3 border-b-2 cursor-pointer transition-colors ${activeTab === 'overview' ? 'border-[#ef4f5f] text-[#ef4f5f]' : 'border-transparent hover:border-gray-300'
                                }`}
                        >
                            Overview
                        </span>
                        <span
                            onClick={() => setActiveTab('reviews')}
                            className={`pb-3 border-b-2 cursor-pointer transition-colors ${activeTab === 'reviews' ? 'border-[#ef4f5f] text-[#ef4f5f]' : 'border-transparent hover:border-gray-300'
                                }`}
                        >
                            Reviews
                        </span>
                    </div>
                </div>

                {/* Tab Content */}
                {activeTab === 'overview' && (
                    <div className="mb-10 animate-fade-in space-y-8">
                        <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100">
                            <h2 className="text-xl font-bold mb-4 text-gray-800 flex items-center gap-2">
                                <span className="text-2xl">🏪</span> About this place
                            </h2>
                            <p className="text-gray-600 leading-relaxed text-lg font-light">
                                {shop.description}
                            </p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="group bg-white p-6 rounded-2xl shadow-sm hover:shadow-md border border-gray-100 transition-all duration-300">
                                <div className="w-12 h-12 bg-blue-50 rounded-full flex items-center justify-center mb-4 text-2xl group-hover:scale-110 transition-transform">
                                    ✨
                                </div>
                                <h3 className="text-lg font-bold mb-2 text-gray-800">Services</h3>
                                <p className="text-gray-500 leading-relaxed">
                                    {shop.services || "General Assistance provided at the store."}
                                </p>
                            </div>

                            <div className="group bg-gradient-to-br from-[#fff0f1] to-white p-6 rounded-2xl shadow-sm hover:shadow-md border border-red-50 transition-all duration-300">
                                <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mb-4 text-2xl group-hover:scale-110 transition-transform">
                                    🎁
                                </div>
                                <h3 className="text-lg font-bold mb-2 text-[#ef4f5f]">Special Offers</h3>
                                <p className="text-gray-700 font-medium">
                                    {shop.offers || "Visit the store to check current deals!"}
                                </p>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'products' && (
                    <div className="mb-10 animate-fade-in">
                        <h2 className="text-2xl font-semibold mb-6 text-gray-800">Products / Menu</h2>
                        <div className="space-y-6">
                            {products.length === 0 ? (
                                <div className="text-center py-16 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                                    <p className="text-gray-400 text-lg">No products listed yet.</p>
                                </div>
                            ) : (
                                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
                                    {products.map(product => (
                                        <div key={product.id} className="bg-white border border-gray-200 rounded-2xl p-3 hover:shadow-lg transition-all duration-300 group relative flex flex-col h-full">

                                            {/* Wishlist / Heart Icon */}
                                            <div
                                                className="absolute top-3 right-3 z-10 cursor-pointer bg-white/80 p-1.5 rounded-full hover:bg-white shadow-sm border border-transparent hover:border-gray-100 transition-all"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    toggleWishlist(product.id);
                                                }}
                                            >
                                                <svg xmlns="http://www.w3.org/2000/svg" fill={wishlistIds.includes(product.id) ? "currentColor" : "none"} viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={`w-5 h-5 transition-colors ${wishlistIds.includes(product.id) ? 'text-red-500' : 'text-gray-400 hover:text-red-500'}`}>
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
                                                </svg>
                                            </div>

                                            {/* Image Section - Refined size for 4-column layout */}
                                            <div className="h-52 w-full mb-4 flex items-center justify-center overflow-hidden rounded-xl bg-gray-50 relative">
                                                {product.imageUrl ? (
                                                    <img
                                                        src={product.imageUrl}
                                                        alt={product.name}
                                                        className={`h-full w-full object-contain mix-blend-multiply p-2 transition-transform duration-500 group-hover:scale-105 ${!product.isAvailable ? 'grayscale opacity-60' : ''}`}
                                                    />
                                                ) : (
                                                    <span className="text-4xl grayscale opacity-50">🥘</span>
                                                )}
                                                {!product.isAvailable && (
                                                    <div className="absolute inset-0 bg-white/20 flex items-center justify-center backdrop-blur-[0.5px] z-10 transition-all duration-500">
                                                        <div className="bg-[#1A1C1E] text-white text-[11px] font-black px-4 py-2 rounded-md shadow-2xl flex items-center justify-center tracking-widest uppercase">
                                                            OUT OF STOCK
                                                        </div>
                                                    </div>
                                                )}
                                            </div>

                                            {/* Content Section */}
                                            <div className="flex flex-col flex-grow">
                                                {/* Veg Icon Placeholder (Green Dot) */}
                                                <div className="w-4 h-4 border border-green-600 p-[2px] mb-2 flex items-center justify-center rounded-sm">
                                                    <div className="w-2 h-2 bg-green-600 rounded-full"></div>
                                                </div>

                                                <h3 className="text-gray-800 font-medium text-sm leading-snug line-clamp-2 mb-1 h-10">
                                                    {product.name}
                                                </h3>
                                                {/* Dynamic Product Rating */}
                                                <div className="mb-2">
                                                    <ProductRating product={product} />
                                                </div>

                                                <div className="mt-auto pt-2 border-t border-dashed border-gray-100">
                                                    <div className="flex items-center gap-2 mb-2 flex-wrap">
                                                        <span className="text-base font-bold text-gray-900">₹{product.price}</span>
                                                        {/* Fake MRP for visual match - logic: price + 20% */}
                                                        <span className="text-xs text-gray-400 line-through">
                                                            ₹{Math.round(product.price * 1.2)}
                                                        </span>
                                                        <span className="text-[10px] font-bold text-green-600 bg-green-50 px-1 rounded border border-green-100">
                                                            20% OFF
                                                        </span>
                                                    </div>

                                                    {/* Toggle removed as requested */}
                                                    <div className="flex items-center justify-between">
                                                        <div className="flex items-center gap-1 text-[10px] font-bold text-green-600 bg-green-50 px-2 py-0.5 rounded-full w-fit">
                                                            OFFER APPLIED
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {activeTab === 'reviews' && (
                    <div className="mb-10 animate-fade-in space-y-8">
                        {/* Write Review Section */}
                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                            <h3 className="text-lg font-bold text-gray-800 mb-4">Write a Review</h3>
                            <div className="flex flex-col gap-4">
                                <div className="flex gap-2">
                                    {[1, 2, 3, 4, 5].map((star) => (
                                        <button
                                            key={star}
                                            onClick={() => setNewReview({ ...newReview, rating: star })}
                                            className={`text-2xl transition-transform hover:scale-110 ${star <= newReview.rating ? 'text-yellow-400' : 'text-gray-200'}`}
                                        >
                                            ★
                                        </button>
                                    ))}
                                    <span className="ml-2 text-sm text-gray-400 font-medium self-center">
                                        {newReview.rating}/5
                                    </span>
                                </div>
                                <textarea
                                    value={newReview.text}
                                    onChange={(e) => setNewReview({ ...newReview, text: e.target.value })}
                                    placeholder="Share your experience..."
                                    className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#ef4f5f]/20 focus:border-[#ef4f5f] transition-all resize-none h-24"
                                />
                                <div className="flex justify-end">
                                    <button
                                        onClick={async () => {
                                            if (!user) {
                                                navigate('/login');
                                                return;
                                            }
                                            if (!newReview.text.trim()) return;

                                            setSubmittingReview(true);
                                            try {
                                                const res = await api.post('/reviews', {
                                                    shopId: id,
                                                    rating: newReview.rating,
                                                    text: newReview.text
                                                });
                                                setReviews([res.data, ...reviews]);
                                                setNewReview({ rating: 5, text: '' });
                                            } catch (error) {
                                                console.error('Failed to post review:', error);
                                                alert('Failed to post review');
                                            } finally {
                                                setSubmittingReview(false);
                                            }
                                        }}
                                        disabled={submittingReview || !newReview.text.trim()}
                                        className="px-6 py-2 bg-[#ef4f5f] text-white rounded-lg font-bold shadow-md hover:bg-[#e03f4f] disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                                    >
                                        {submittingReview ? 'Posting...' : 'Post Review'}
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Review List */}
                        <div className="space-y-4">
                            <h3 className="text-xl font-bold text-gray-800">
                                Customer Reviews ({reviews.length})
                            </h3>

                            {reviews.length === 0 ? (
                                <div className="text-center py-12 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                                    <div className="text-4xl mb-3 opacity-30">💬</div>
                                    <p className="text-gray-400">No reviews yet. Be the first!</p>
                                </div>
                            ) : (
                                reviews.map((review) => (
                                    <div key={review.id} className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                                        <div className="flex justify-between items-start mb-2">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-100 to-blue-100 flex items-center justify-center text-purple-600 font-bold border border-white shadow-sm">
                                                    {review.user?.name?.charAt(0).toUpperCase() || 'U'}
                                                </div>
                                                <div>
                                                    <div className="font-bold text-gray-800 text-sm">{review.user?.name || "User"}</div>
                                                    <div className="text-xs text-gray-400">
                                                        {new Date(review.createdAt).toLocaleDateString()}
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="flex text-yellow-400 text-sm">
                                                {[...Array(5)].map((_, i) => (
                                                    <span key={i}>{i < review.rating ? '★' : '☆'}</span>
                                                ))}
                                            </div>
                                        </div>
                                        <p className="text-gray-600 text-sm leading-relaxed pl-13 ml-12 border-l-2 border-gray-100 pl-3">
                                            {review.text}
                                        </p>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                )}

            </div>

        </div>
    );
};

export default ShopDetailsPage;

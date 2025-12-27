import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import api from '../config/api';
import Footer from '../components/Footer';

const HomePage = () => {
    const [shops, setShops] = useState([]);
    const [categories, setCategories] = useState([]);
    const [filters, setFilters] = useState({
        city: '',
        categoryId: '',
        search: ''
    });
    const [locationDropdownOpen, setLocationDropdownOpen] = useState(false);
    const [currentLocation, setCurrentLocation] = useState('');
    const [savedAddresses] = useState([
        { id: 1, label: 'Home', address: 'Bhopal, Sukh Sagar Phase-III, Gopal Nagar, Bhopal, Madhya Pradesh 462022' }
    ]);
    const scrollRef = useRef(null);

    useEffect(() => {
        fetchCategories();
        fetchShops();
    }, []);

    useEffect(() => {
        fetchShops();
    }, [filters]);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (locationDropdownOpen && !event.target.closest('.location-dropdown-container')) {
                setLocationDropdownOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [locationDropdownOpen]);

    const fetchCategories = async () => {
        try {
            const response = await api.get('/categories');
            setCategories(response.data);
        } catch (error) {
            console.error('Error fetching categories:', error);
        }
    };

    const fetchShops = async () => {
        try {
            const params = {};
            if (filters.city) params.city = filters.city;
            if (filters.categoryId) params.categoryId = filters.categoryId;
            if (filters.search) params.search = filters.search;

            const response = await api.get('/shops', { params });
            setShops(response.data);
        } catch (error) {
            console.error('Error fetching shops:', error);
        }
    };

    const getCurrentLocation = () => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                async (position) => {
                    const { latitude, longitude } = position.coords;
                    try {
                        // Reverse geocoding to get address
                        const response = await fetch(
                            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`
                        );
                        const data = await response.json();
                        const locationText = data.display_name || `${latitude}, ${longitude}`;
                        setCurrentLocation(locationText);
                        setFilters({ ...filters, city: data.address?.city || data.address?.town || data.address?.village || '' });
                        setLocationDropdownOpen(false);
                    } catch (error) {
                        console.error('Error getting location:', error);
                        alert('Unable to get address for current location');
                    }
                },
                (error) => {
                    console.error('Error getting location:', error);
                    alert('Please enable location access in your browser');
                }
            );
        } else {
            alert('Geolocation is not supported by your browser');
        }
    };

    const ShopCard = ({ shop }) => {
        return (
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 sm:p-6 hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
                <div className="flex flex-col sm:flex-row gap-6 items-start">
                    {/* Left: Image/Icon - Slightly larger and cleaner */}
                    <Link to={`/shops/${shop.id}`} className="flex-shrink-0 w-full sm:w-32">
                        <div className="aspect-square w-full sm:w-32 rounded-lg overflow-hidden bg-gray-50 border border-gray-100 relative group">
                            {shop.imageUrl ? (
                                <img
                                    src={shop.imageUrl}
                                    alt={shop.name}
                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-4xl bg-gray-50 text-gray-300">
                                    {/* Dynamic Icons for Indian Context */}
                                    {shop.category?.name.includes('Medicine') ? '💊' :
                                        shop.category?.name.includes('Kirana') || shop.category?.name.includes('Grocery') ? '🛒' :
                                            shop.category?.name.includes('Fruit') || shop.category?.name.includes('Vegetable') ? '🥦' :
                                                shop.category?.name.includes('Restaurant') || shop.category?.name.includes('Food') ? '🥘' :
                                                    shop.category?.name.includes('Sweet') || shop.category?.name.includes('Bakery') ? '🍰' :
                                                        shop.category?.name.includes('Electronic') || shop.category?.name.includes('Mobile') ? '📱' :
                                                            shop.category?.name.includes('Cloth') || shop.category?.name.includes('Fashion') ? '👕' :
                                                                shop.category?.name.includes('Salon') ? '💇' :
                                                                    shop.category?.name.includes('Hardware') ? '🔨' :
                                                                        shop.category?.name.includes('Book') ? '📚' :
                                                                            shop.category?.name.includes('Dairy') ? '🥛' :
                                                                                shop.category?.name.includes('Auto') ? '🚗' : '🏪'}
                                </div>
                            )}
                            {/* Overlay Rating on Image for mobile, discrete */}
                            <div className="absolute top-2 right-2 bg-white/95 backdrop-blur px-1.5 py-0.5 rounded text-[10px] font-bold shadow-sm flex items-center gap-1">
                                <span>★</span> {shop.rating || '4.2'}
                            </div>
                        </div>
                    </Link>

                    {/* Right: Content - Better Typography & Spacing */}
                    <div className="flex-grow w-full">
                        <div className="flex justify-between items-start">
                            <div>
                                <Link to={`/shops/${shop.id}`}>
                                    <h3 className="text-xl sm:text-2xl font-bold text-gray-900 hover:text-primary transition-colors mb-1">{shop.name}</h3>
                                </Link>
                                <div className="flex flex-wrap items-center gap-y-1 gap-x-3 text-sm text-gray-500">
                                    <span className="font-medium text-gray-700">{shop.category?.name || "Retail"}</span>
                                    <span className="hidden sm:inline text-gray-300">•</span>
                                    <span>{shop.city}</span>
                                    <span className="hidden sm:inline text-gray-300">•</span>
                                    <span className="text-gray-400">{(Math.random() * 5).toFixed(1)} km</span>
                                </div>
                            </div>

                            {/* Status Pill */}
                            <div className={`px-3 py-1 rounded-full text-xs font-bold border ${shop.open ? 'bg-green-50 text-green-700 border-green-100' : 'bg-red-50 text-red-700 border-red-100'}`}>
                                {shop.open ? 'Open Now' : 'Closed'}
                            </div>
                        </div>

                        <p className="text-sm text-gray-400 mt-3 line-clamp-2 font-light leading-relaxed">
                            {shop.description || "No description available for this shop."}
                        </p>

                        <div className="mt-4 flex flex-wrap gap-2">
                            <span className="px-2 py-1 bg-gray-50 border border-gray-100 text-gray-600 text-[10px] uppercase font-bold tracking-wider rounded">Home Delivery</span>
                        </div>

                        <div className="h-px bg-gray-100 w-full my-4"></div>

                        {/* Action Buttons - Cleaner visual style */}
                        <div className="flex flex-wrap gap-3">
                            <Link to={`/shops/${shop.id}`} className="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-primary text-white px-6 py-2.5 rounded-lg text-sm font-bold hover:bg-primary-hover shadow-sm hover:shadow transition-all">
                                View Shop
                            </Link>


                            <button className="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-white border border-gray-200 text-gray-700 px-4 py-2.5 rounded-lg text-sm font-medium hover:border-blue-500 hover:text-blue-600 transition-colors">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                                Map
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div className="min-h-screen bg-white font-sans">
            {/* Orange Hero Section with Cards */}
            <div className="bg-gradient-to-br from-[#DC4100] via-[#E85A20] to-[#DC4100] pt-40 py-16 px-4 relative overflow-hidden">
                {/* Decorative geometric patterns */}
                <div className="absolute inset-0 opacity-10">
                    <div className="absolute top-10 left-10 w-32 h-32 border-4 border-white rounded-full"></div>
                    <div className="absolute bottom-20 right-20 w-48 h-48 border-4 border-white rotate-45"></div>
                    <div className="absolute top-1/2 left-1/4 w-24 h-24 border-4 border-white rounded-lg"></div>
                </div>
                <div className="max-w-6xl mx-auto relative z-10">
                    {/* Headline */}
                    <h1 className="text-[48px] font-semibold text-white text-center mb-6 drop-shadow-lg" style={{ letterSpacing: '-0.3px' }}>
                        Shop local stores & find nearby deals.
                        <br />
                        Discover best shops. ShopNearMe it!
                    </h1>

                    {/* Search Bar - Two Separate Inputs */}
                    <div className="flex flex-col md:flex-row items-center gap-4 max-w-4xl mx-auto mb-16 relative">
                        {/* Location Input with Dropdown */}
                        <div className="w-full md:w-2/5 relative location-dropdown-container">
                            <div
                                className="bg-white rounded-xl shadow-lg px-5 py-4 flex items-center gap-3 cursor-pointer hover:shadow-xl transition-shadow"
                                onClick={() => setLocationDropdownOpen(!locationDropdownOpen)}
                            >
                                <svg className="w-5 h-5 text-[#DC4100] flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                                </svg>
                                <input
                                    type="text"
                                    placeholder="Sukh Sagar Phase-III, G..."
                                    className="flex-grow outline-none text-gray-700 placeholder-gray-400 font-medium bg-transparent pointer-events-none"
                                    value={filters.city}
                                    readOnly
                                />
                                <svg
                                    className={`w-5 h-5 text-gray-400 flex-shrink-0 transition-transform ${locationDropdownOpen ? 'rotate-180' : ''}`}
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                </svg>
                            </div>

                            {/* Location Dropdown */}
                            {locationDropdownOpen && (
                                <div className="absolute top-full mt-2 w-full bg-white rounded-xl shadow-2xl border border-gray-100 overflow-hidden z-50">
                                    {/* Use Current Location */}
                                    <button
                                        onClick={getCurrentLocation}
                                        className="w-full px-5 py-4 flex items-center gap-3 hover:bg-orange-50 transition-colors text-left border-b border-gray-100"
                                    >
                                        <svg className="w-5 h-5 text-[#DC4100]" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                                        </svg>
                                        <span className="text-[#DC4100] font-semibold">Use my current location</span>
                                    </button>

                                    {/* Saved Addresses */}
                                    <div className="px-5 py-3">
                                        <h3 className="text-xs text-gray-400 uppercase font-bold tracking-wider mb-2">Saved Addresses</h3>
                                        {savedAddresses.map((addr) => (
                                            <button
                                                key={addr.id}
                                                onClick={() => {
                                                    setFilters({ ...filters, city: addr.address.split(',')[0] });
                                                    setLocationDropdownOpen(false);
                                                }}
                                                className="w-full px-3 py-3 flex items-start gap-3 hover:bg-gray-50 rounded-lg transition-colors text-left"
                                            >
                                                <svg className="w-5 h-5 text-gray-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                                                    <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                                                </svg>
                                                <div className="flex-grow">
                                                    <div className="font-bold text-gray-900 text-sm">{addr.label}</div>
                                                    <div className="text-xs text-gray-500 mt-0.5 line-clamp-1">{addr.address}</div>
                                                </div>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Search Input */}
                        <div className="w-full md:w-3/5">
                            <div className="bg-white rounded-xl shadow-lg px-5 py-4 flex items-center gap-3 hover:shadow-xl transition-shadow">
                                <svg className="w-5 h-5 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                </svg>
                                <input
                                    type="text"
                                    placeholder="Search for restaurant, item or more"
                                    className="flex-grow outline-none text-gray-700 placeholder-gray-400 font-medium"
                                    value={filters.search}
                                    onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Three Feature Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
                        {/* LOCAL SHOPS Card */}
                        <div className="bg-white rounded-3xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-2 relative overflow-hidden group cursor-pointer">
                            <div className="mb-4">
                                <h3 className="text-xl font-extrabold text-gray-800 mb-1">LOCAL SHOPS</h3>
                                <p className="text-gray-500 text-xs mb-2 font-normal">FROM NEARBY STORES</p>
                                <span className="text-[#DC4100] font-bold text-xs">UPTO 50% OFF</span>
                            </div>
                            <div className="flex justify-center items-center h-20 mb-3">
                                <div className="text-7xl">🛍️</div>
                            </div>
                            <div className="flex justify-start">
                                <div className="w-10 h-10 bg-gradient-to-r from-[#DC4100] to-[#E85A20] rounded-full flex items-center justify-center text-white group-hover:scale-110 transition-all duration-300 shadow-md">
                                    →
                                </div>
                            </div>
                        </div>

                        {/* INSTANT DELIVERY Card */}
                        <div className="bg-white rounded-3xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-2 relative overflow-hidden group cursor-pointer">
                            <div className="mb-4">
                                <h3 className="text-xl font-extrabold text-gray-800 mb-1">INSTANT DELIVERY</h3>
                                <p className="text-gray-500 text-xs mb-2 font-normal">GROCERY & ESSENTIALS</p>
                                <span className="text-[#DC4100] font-bold text-xs">UPTO 40% OFF</span>
                            </div>
                            <div className="flex justify-center items-center h-20 mb-3">
                                <div className="text-7xl">🛒</div>
                            </div>
                            <div className="flex justify-start">
                                <div className="w-10 h-10 bg-yellow-500 rounded-full flex items-center justify-center text-white group-hover:scale-110 transition-transform">
                                    →
                                </div>
                            </div>
                        </div>

                        {/* SERVICES Card */}
                        <div className="bg-white rounded-3xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-2 relative overflow-hidden group cursor-pointer">
                            <div className="mb-4">
                                <h3 className="text-xl font-extrabold text-gray-800 mb-1">SERVICES</h3>
                                <p className="text-gray-500 text-xs mb-2 font-normal">HOME & PERSONAL CARE</p>
                                <span className="text-[#DC4100] font-bold text-xs">UPTO 30% OFF</span>
                            </div>
                            <div className="flex justify-center items-center h-20 mb-3">
                                <div className="text-7xl">✂️</div>
                            </div>
                            <div className="flex justify-start">
                                <div className="w-10 h-10 bg-yellow-500 rounded-full flex items-center justify-center text-white group-hover:scale-110 transition-transform">
                                    →
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>


            {/* Main Listings Section */}
            <div className="bg-[#f8f8f8] py-12 mt-24">
                <div className="max-w-6xl mx-auto px-4">
                    {/* Categories Section - 3D Style Carousel */}
                    <div className="mb-24">
                        <div className="flex justify-between items-end mb-12">
                            <div>
                                <h2 style={{
                                    fontFamily: 'Gilroy, sans-serif',
                                    fontWeight: 600,
                                    fontSize: '24px',
                                    lineHeight: '26px',
                                    letterSpacing: '-0.6px',
                                    color: 'rgba(2, 6, 12, 0.92)'
                                }}>
                                    Select a category to explore
                                </h2>
                            </div>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => scrollRef.current?.scrollBy({ left: -200, behavior: 'smooth' })}
                                    className="w-10 h-10 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors"
                                >
                                    <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                                </button>
                                <button
                                    onClick={() => scrollRef.current?.scrollBy({ left: 200, behavior: 'smooth' })}
                                    className="w-10 h-10 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors"
                                >
                                    <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                                </button>
                            </div>
                        </div>

                        <div
                            ref={scrollRef}
                            className="grid grid-rows-2 grid-flow-col gap-x-10 gap-y-8 overflow-x-auto pb-6 scrollbar-hide no-scrollbar scroll-smooth px-2"
                        >


                            {/* Dynamic Categories */}
                            {categories.map((cat) => {
                                // Determine Image URL based on Category Name (Using 3D-Fluency style for 3D look)
                                let imgUrl = "https://img.icons8.com/3d-fluency/94/shopping-bag.png";
                                const name = cat.name.toLowerCase();

                                if (name.includes('medicine')) imgUrl = "https://img.icons8.com/3d-fluency/94/pill.png";
                                else if (name.includes('grocery') || name.includes('kirana')) imgUrl = "https://img.icons8.com/3d-fluency/94/shopping-basket-2.png";
                                else if (name.includes('fruit')) imgUrl = "https://img.icons8.com/3d-fluency/94/strawberry.png";
                                else if (name.includes('vegetable')) imgUrl = "https://img.icons8.com/3d-fluency/94/carrot.png";
                                else if (name.includes('restaurant') || name.includes('food')) imgUrl = "https://img.icons8.com/3d-fluency/94/hamburger.png";
                                else if (name.includes('sweet') || name.includes('bakery')) imgUrl = "https://img.icons8.com/3d-fluency/94/piece-of-cake.png";
                                else if (name.includes('mobile')) imgUrl = "https://img.icons8.com/3d-fluency/94/iphone.png";
                                else if (name.includes('electronic')) imgUrl = "https://img.icons8.com/3d-fluency/94/imac.png";
                                else if (name.includes('cloth') || name.includes('fashion')) imgUrl = "https://img.icons8.com/3d-fluency/94/t-shirt.png";
                                else if (name.includes('salon')) imgUrl = "https://img.icons8.com/3d-fluency/94/barber-scissors.png";
                                else if (name.includes('hardware')) imgUrl = "https://img.icons8.com/3d-fluency/94/hammer.png";
                                else if (name.includes('book')) imgUrl = "https://img.icons8.com/3d-fluency/94/books.png";
                                else if (name.includes('dairy')) imgUrl = "https://img.icons8.com/3d-fluency/94/milk-bottle.png";
                                else if (name.includes('auto')) imgUrl = "https://img.icons8.com/3d-fluency/94/car.png";
                                else if (name.includes('biryani')) imgUrl = "https://img.icons8.com/3d-fluency/94/rice-bowl.png";
                                else if (name.includes('pizza')) imgUrl = "https://img.icons8.com/3d-fluency/94/pizza.png";
                                else if (name.includes('burger')) imgUrl = "https://img.icons8.com/3d-fluency/94/hamburger.png";
                                else if (name.includes('coffee')) imgUrl = "https://img.icons8.com/3d-fluency/94/coffee-to-go.png";
                                else if (name.includes('ice cream')) imgUrl = "https://img.icons8.com/3d-fluency/94/ice-cream-cone.png";

                                return (
                                    <div
                                        key={cat.id}
                                        onClick={() => setFilters({ ...filters, categoryId: cat.id })}
                                        className="flex flex-col items-center gap-2 cursor-pointer group w-24"
                                    >
                                        <div className={`w-20 h-20 rounded-full flex items-center justify-center transition-all duration-300 group-hover:scale-105 ${filters.categoryId === cat.id ? 'ring-2 ring-primary ring-offset-2' : ''}`}>
                                            <img
                                                src={imgUrl}
                                                alt={cat.name}
                                                className="w-full h-full object-contain drop-shadow-lg"
                                                onError={(e) => {
                                                    // Fallback to standard fluency if 3d not found
                                                    if (e.target.src.includes('3d-fluency')) {
                                                        e.target.src = e.target.src.replace('3d-fluency', 'fluency');
                                                    } else {
                                                        e.target.src = "https://img.icons8.com/fluency/96/box.png";
                                                    }
                                                }}
                                            />
                                        </div>
                                        <span className={`text-sm font-medium text-center truncate w-full ${filters.categoryId === cat.id ? 'text-primary font-bold' : 'text-gray-700'}`}>
                                            {cat.name}
                                        </span>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    <h2 style={{
                        fontFamily: 'Gilroy, sans-serif',
                        fontWeight: 600,
                        fontSize: '24px',
                        lineHeight: '26px',
                        letterSpacing: '-0.6px',
                        color: 'rgba(2, 6, 12, 0.92)'
                    }} className="mb-6">
                        Popular Shops in {filters.city || 'Your Area'}
                    </h2>

                    <div className="flex flex-col gap-6">
                        {shops.map(shop => <ShopCard key={shop.id} shop={shop} />)}
                    </div>

                    {shops.length === 0 && (
                        <div className="flex flex-col items-center justify-center py-20 text-gray-400">
                            <span className="text-6xl mb-4">🏙️</span>
                            <p className="text-xl font-light">No shops found here yet.</p>
                            <button className="mt-4 px-6 py-2 border border-gray-300 rounded-full hover:bg-white transition-colors">
                                Clear Filters
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* Get the ShopNearMe App Section */}
            <div className="bg-gradient-to-br from-orange-50 via-orange-100 to-orange-50 py-20 relative overflow-hidden">
                {/* Decorative elements */}
                <div className="absolute top-0 left-0 w-full h-full opacity-5">
                    <div className="absolute top-20 left-10 w-64 h-64 bg-[#DC4100] rounded-full blur-3xl"></div>
                    <div className="absolute bottom-10 right-10 w-96 h-96 bg-[#DC4100] rounded-full blur-3xl"></div>
                </div>
                {/* Decorative Elements */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-[#DC4100]/20 rounded-full blur-3xl"></div>
                <div className="absolute bottom-0 left-0 w-96 h-96 bg-[#DC4100]/20 rounded-full blur-3xl"></div>

                <div className="max-w-6xl mx-auto px-4 relative z-10">
                    <div className="flex flex-col md:flex-row items-center gap-12">
                        {/* Left: Phone Mockup */}
                        <div className="w-full md:w-1/2 flex justify-center">
                            <div className="relative">
                                {/* Phone Frame */}
                                <div className="relative w-[280px] h-[560px] bg-gradient-to-br from-gray-800 to-gray-900 rounded-[40px] p-3 shadow-2xl">
                                    {/* Screen */}
                                    <div className="w-full h-full bg-white rounded-[32px] overflow-hidden relative">
                                        {/* Notch */}
                                        <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-32 h-6 bg-gray-900 rounded-b-3xl z-10"></div>

                                        {/* App Preview Content */}
                                        <div className="pt-8 px-4 h-full overflow-hidden bg-gradient-to-b from-white to-gray-50">
                                            {/* Header */}
                                            <div className="flex items-center justify-between mb-4">
                                                <span className="text-2xl font-black italic bg-gradient-to-r from-[#DC4100] to-[#E85A20] bg-clip-text text-transparent">ShopNearMe</span>
                                                <div className="flex gap-2">
                                                    <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center text-xs">🔔</div>
                                                    <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center text-xs">👤</div>
                                                </div>
                                            </div>

                                            {/* Search Bar */}
                                            <div className="bg-gray-100 rounded-lg px-3 py-2 mb-4 flex items-center gap-2">
                                                <span className="text-xs">🔍</span>
                                                <span className="text-xs text-gray-400">Search shops near you...</span>
                                            </div>

                                            {/* Categories */}
                                            <div className="flex gap-2 mb-4 overflow-hidden">
                                                <div className="bg-gradient-to-r from-[#DC4100] to-[#E85A20] text-white text-xs px-3 py-1.5 rounded-full font-bold shadow-md">🛒 All</div>
                                                <div className="bg-white text-gray-600 text-xs px-3 py-1.5 rounded-full border">🥘 Food</div>
                                                <div className="bg-white text-gray-600 text-xs px-3 py-1.5 rounded-full border">👕 Fashion</div>
                                            </div>

                                            {/* Shop Cards */}
                                            <div className="space-y-2">
                                                <div className="bg-white rounded-lg p-2 shadow-sm flex gap-2 items-center">
                                                    <div className="w-12 h-12 bg-gradient-to-br from-[#DC4100] to-[#E85A20] rounded-lg flex-shrink-0 shadow-md"></div>
                                                    <div className="flex-grow">
                                                        <div className="text-xs font-bold">Local Grocery Store</div>
                                                        <div className="text-[10px] text-gray-400">0.5 km away</div>
                                                    </div>
                                                    <div className="text-xs text-yellow-500">⭐ 4.5</div>
                                                </div>
                                                <div className="bg-white rounded-lg p-2 shadow-sm flex gap-2 items-center">
                                                    <div className="w-12 h-12 bg-gradient-to-br from-purple-400 to-pink-400 rounded-lg flex-shrink-0"></div>
                                                    <div className="flex-grow">
                                                        <div className="text-xs font-bold">Fashion Hub</div>
                                                        <div className="text-[10px] text-gray-400">1.2 km away</div>
                                                    </div>
                                                    <div className="text-xs text-yellow-500">⭐ 4.8</div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Floating badges */}
                                <div className="absolute -top-4 -right-4 bg-gradient-to-r from-[#DC4100] to-[#E85A20] text-white px-5 py-2.5 rounded-full text-xs font-black shadow-xl animate-pulse">
                                    New! 🎉
                                </div>
                            </div>
                        </div>

                        {/* Right: Content */}
                        <div className="w-full md:w-1/2 text-center md:text-left">
                            <div className="inline-block bg-white px-4 py-1.5 rounded-full text-sm font-semibold text-[#DC4100] mb-4 shadow-sm">
                                📱 Mobile App
                            </div>
                            <h2 className="text-3xl md:text-4xl font-bold mb-4 bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
                                Get the ShopNearMe App
                            </h2>
                            <p className="text-gray-600 mb-6 text-base leading-relaxed">
                                Discover local shops, exclusive deals, and seamless shopping experience - all in your pocket. Download now and explore shops near you!
                            </p>

                            {/* Email input */}
                            <div className="bg-white rounded-xl shadow-lg p-2 flex flex-col sm:flex-row gap-2 mb-6">
                                <input
                                    type="email"
                                    placeholder="Enter your email..."
                                    className="flex-grow px-4 py-3 outline-none text-gray-700 rounded-lg"
                                />
                                <button className="bg-gradient-to-r from-[#DC4100] to-[#E85A20] hover:from-[#B83700] hover:to-[#DC4100] text-white px-6 py-3 rounded-lg font-bold transition-all duration-300 hover:scale-105 shadow-lg whitespace-nowrap">
                                    Share App Link
                                </button>
                            </div>

                            <p className="text-sm text-gray-500 mb-3 font-medium">Download from:</p>

                            {/* App Store Buttons */}
                            <div className="flex flex-col sm:flex-row gap-3 justify-center md:justify-start">
                                <a href="#" className="flex items-center gap-3 bg-black hover:bg-gray-900 text-white rounded-xl px-5 py-3 transition-all duration-300 hover:scale-105 shadow-lg group">
                                    <div className="text-3xl">🍎</div>
                                    <div className="text-left">
                                        <div className="text-xs opacity-80">Download on the</div>
                                        <div className="font-bold text-sm">App Store</div>
                                    </div>
                                </a>
                                <a href="#" className="flex items-center gap-3 bg-black hover:bg-gray-900 text-white rounded-xl px-5 py-3 transition-all duration-300 hover:scale-105 shadow-lg group">
                                    <div className="text-3xl">📱</div>
                                    <div className="text-left">
                                        <div className="text-xs opacity-80">Get it on</div>
                                        <div className="font-bold text-sm">Google Play</div>
                                    </div>
                                </a>
                            </div>

                            {/* Features List */}
                            <div className="mt-8 grid grid-cols-2 gap-4">
                                <div className="flex items-center gap-2">
                                    <span className="text-green-500 text-xl">✓</span>
                                    <span className="text-sm text-gray-600">Free to use</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="text-green-500 text-xl">✓</span>
                                    <span className="text-sm text-gray-600">Real-time updates</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="text-green-500 text-xl">✓</span>
                                    <span className="text-sm text-gray-600">Exclusive deals</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="text-green-500 text-xl">✓</span>
                                    <span className="text-sm text-gray-600">Easy navigation</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Footer */}
            <Footer />
        </div>
    );
};

export default HomePage;

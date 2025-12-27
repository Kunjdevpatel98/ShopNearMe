import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useState, useEffect, useRef } from 'react';

const Navbar = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const [searchQuery, setSearchQuery] = useState('');
    const [isScrolled, setIsScrolled] = useState(false);

    // Check if we are on the home page to determine transparency
    const isHomePage = location.pathname === '/';

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 50);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const handleSearch = (e) => {
        e.preventDefault();
        console.log("Searching for:", searchQuery);
    };

    // Navbar classes based on state
    // If Home & Not Scrolled -> Transparent text-white (immersive)
    // If Home & Scrolled OR Not Home -> White bg text-black shadow
    const navClasses = isHomePage && !isScrolled
        ? "bg-transparent text-white"
        : "bg-white text-gray-800 shadow-md";

    const logoClasses = isHomePage && !isScrolled
        ? "text-white"
        : "text-primary"; // Dynamic Theme Color

    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const dropdownRef = useRef(null);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsDropdownOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    return (
        <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${navClasses} py-4`}>
            <div className="max-w-6xl mx-auto px-4 flex items-center justify-between">

                {/* Logo */}
                <Link to="/" className="flex items-center gap-3">
                    {/* Logo Icon */}
                    <div className="w-10 h-10 rounded-lg overflow-hidden flex-shrink-0">
                        <img
                            src="/shopnearme-logo.png"
                            alt="ShopNearMe"
                            className="w-full h-full object-cover"
                        />
                    </div>
                    <span className={`text-xl md:text-2xl font-bold ${logoClasses}`}>
                        ShopNearMe
                    </span>
                </Link>

                {/* Desktop Search Bar (Only visible if scrolled or not on home) */}
                {(!isHomePage || isScrolled) && (
                    <div className="hidden md:flex flex-grow max-w-lg mx-8 relative">
                        <div className="flex items-center w-full bg-white rounded-lg border border-gray-200 shadow-sm px-3 py-2">
                            <span className="text-primary mr-2">📍</span>
                            <input
                                type="text"
                                className="flex-grow outline-none text-sm text-gray-700 placeholder-gray-400"
                                placeholder="Search for shops, services..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                            <span className="text-gray-400 text-lg mx-2">|</span>
                            <button onClick={handleSearch} className="text-gray-500 hover:text-primary">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                            </button>
                        </div>
                    </div>
                )}

                {/* Action Buttons */}
                <div className="flex items-center gap-4 text-sm font-medium">
                    {user ? (
                        <div className="relative" ref={dropdownRef}>
                            <button
                                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                                className="flex items-center gap-3 focus:outline-none"
                            >
                                <span className={`hidden md:block text-base font-medium ${isHomePage && !isScrolled ? 'text-white' : 'text-gray-600'}`}>
                                    {user.name || user.email.split('@')[0]}
                                </span>
                                <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold border-2 border-white/20 shadow-sm overflow-hidden">
                                    {user.profilePhotoUrl ? (
                                        <img src={user.profilePhotoUrl} alt={user.name} className="w-full h-full object-cover" />
                                    ) : (
                                        (user.name ? user.name[0] : user.email[0]).toUpperCase()
                                    )}
                                </div>
                            </button>

                            {/* Dropdown Menu */}
                            {isDropdownOpen && (
                                <div className="absolute right-0 mt-3 w-56 bg-white rounded-xl shadow-2xl py-2 text-gray-800 border border-gray-100 overflow-hidden animate-fade-in-up origin-top-right">
                                    <div className="px-4 py-3 border-b border-gray-50 bg-gray-50/50">
                                        <p className="text-xs text-gray-500 uppercase tracking-wider font-bold">Signed in as</p>
                                        <p className="text-sm font-medium truncate text-gray-900">{user.email}</p>
                                    </div>

                                    <div className="py-1">
                                        <Link to="/profile" onClick={() => setIsDropdownOpen(false)} className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-primary transition-colors">
                                            <span>👤</span> My Profile
                                        </Link>

                                        {user.role === 'SHOPKEEPER' && (
                                            <Link to="/shopkeeper" onClick={() => setIsDropdownOpen(false)} className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-primary transition-colors">
                                                <span>📊</span> Partner Dashboard
                                            </Link>
                                        )}

                                        <Link to="/settings" onClick={() => setIsDropdownOpen(false)} className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-primary transition-colors">
                                            <span>⚙️</span> Settings
                                        </Link>
                                    </div>

                                    <div className="border-t border-gray-100 mt-1 pt-1">
                                        <button onClick={handleLogout} className="w-full text-left flex items-center gap-2 px-4 py-2 text-sm text-red-500 hover:bg-red-50 transition-colors">
                                            <span>🚪</span> Log out
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    ) : (
                        <>
                            <Link to="/login" className={`hover:opacity-80 transition-opacity ${isHomePage && !isScrolled ? 'text-white' : 'text-gray-500'}`}>
                                Log in
                            </Link>
                            <Link to="/register" className={`hover:opacity-80 transition-opacity ${isHomePage && !isScrolled ? 'text-white' : 'text-gray-500'}`}>
                                Sign up
                            </Link>
                        </>
                    )}

                    {/* Get the App Button */}
                    <Link
                        to="#app-section"
                        className={`hidden md:flex items-center gap-2 px-4 py-2 rounded-lg border-2 transition-all ${isHomePage && !isScrolled
                            ? 'border-white text-white hover:bg-white hover:text-[#DC4100]'
                            : 'border-gray-800 text-gray-800 hover:bg-gray-800 hover:text-white'
                            }`}
                    >
                        Get the App
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                        </svg>
                    </Link>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;

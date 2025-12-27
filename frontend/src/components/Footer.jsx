import { Link } from 'react-router-dom';

const Footer = () => {
    return (
        <footer className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white relative overflow-hidden">
            {/* Decorative background elements */}
            <div className="absolute inset-0 opacity-5">
                <div className="absolute top-10 left-10 w-72 h-72 bg-[#ef4f5f] rounded-full blur-3xl"></div>
                <div className="absolute bottom-10 right-10 w-96 h-96 bg-orange-500 rounded-full blur-3xl"></div>
            </div>

            <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-8">
                {/* Main Footer Content */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">

                    {/* Brand Section */}
                    <div className="lg:col-span-1">
                        <Link to="/" className="inline-block mb-4">
                            <span className="text-3xl font-bold italic bg-gradient-to-r from-[#ef4f5f] to-orange-500 bg-clip-text text-transparent">
                                ShopNearMe
                            </span>
                        </Link>
                        <p className="text-gray-400 text-sm leading-relaxed mb-6">
                            Discover local treasures and connect with shops near you. Your neighborhood marketplace made simple.
                        </p>
                        {/* Social Media */}
                        <div className="flex gap-3">
                            <a href="#" className="w-10 h-10 bg-white/10 hover:bg-[#ef4f5f] rounded-full flex items-center justify-center transition-all duration-300 hover:scale-110">
                                <span className="text-lg">📘</span>
                            </a>
                            <a href="#" className="w-10 h-10 bg-white/10 hover:bg-[#ef4f5f] rounded-full flex items-center justify-center transition-all duration-300 hover:scale-110">
                                <span className="text-lg">📸</span>
                            </a>
                            <a href="#" className="w-10 h-10 bg-white/10 hover:bg-[#ef4f5f] rounded-full flex items-center justify-center transition-all duration-300 hover:scale-110">
                                <span className="text-lg">🐦</span>
                            </a>
                            <a href="#" className="w-10 h-10 bg-white/10 hover:bg-[#ef4f5f] rounded-full flex items-center justify-center transition-all duration-300 hover:scale-110">
                                <span className="text-lg">▶️</span>
                            </a>
                        </div>
                    </div>

                    {/* Quick Links */}
                    <div>
                        <h3 className="font-bold text-lg mb-4 text-white">Explore</h3>
                        <ul className="space-y-3">
                            <li><Link to="/" className="text-gray-400 hover:text-[#ef4f5f] transition-colors text-sm">Home</Link></li>
                            <li><Link to="/shops" className="text-gray-400 hover:text-[#ef4f5f] transition-colors text-sm">All Shops</Link></li>
                            <li><Link to="/categories" className="text-gray-400 hover:text-[#ef4f5f] transition-colors text-sm">Categories</Link></li>
                            <li><Link to="/about" className="text-gray-400 hover:text-[#ef4f5f] transition-colors text-sm">About Us</Link></li>
                        </ul>
                    </div>

                    {/* For Business */}
                    <div>
                        <h3 className="font-bold text-lg mb-4 text-white">For Business</h3>
                        <ul className="space-y-3">
                            <li><Link to="/shopkeeper" className="text-gray-400 hover:text-[#ef4f5f] transition-colors text-sm">List Your Shop</Link></li>
                            <li><Link to="/partner" className="text-gray-400 hover:text-[#ef4f5f] transition-colors text-sm">Become a Partner</Link></li>
                            <li><a href="#" className="text-gray-400 hover:text-[#ef4f5f] transition-colors text-sm">Business Tools</a></li>
                            <li><a href="#" className="text-gray-400 hover:text-[#ef4f5f] transition-colors text-sm">Support</a></li>
                        </ul>
                    </div>

                    {/* Download App Section */}
                    <div>
                        <h3 className="font-bold text-lg mb-4 text-white">Get the App</h3>
                        <p className="text-gray-400 text-sm mb-4">
                            Download ShopNearMe for seamless shopping on the go!
                        </p>
                        <div className="space-y-3">
                            <a href="#" className="flex items-center gap-3 bg-black hover:bg-gray-900 rounded-lg px-4 py-2.5 transition-all duration-300 hover:scale-105 border border-gray-700">
                                <span className="text-2xl">🍎</span>
                                <div className="text-left">
                                    <div className="text-xs text-gray-400">Download on the</div>
                                    <div className="font-semibold text-sm">App Store</div>
                                </div>
                            </a>
                            <a href="#" className="flex items-center gap-3 bg-black hover:bg-gray-900 rounded-lg px-4 py-2.5 transition-all duration-300 hover:scale-105 border border-gray-700">
                                <span className="text-2xl">📱</span>
                                <div className="text-left">
                                    <div className="text-xs text-gray-400">Get it on</div>
                                    <div className="font-semibold text-sm">Google Play</div>
                                </div>
                            </a>
                        </div>
                    </div>
                </div>

                {/* Newsletter Section */}
                <div className="border-t border-gray-700 pt-8 pb-8">
                    <div className="flex flex-col md:flex-row justify-between items-center gap-6">
                        <div className="text-center md:text-left">
                            <h3 className="font-bold text-lg mb-2">Stay Connected</h3>
                            <p className="text-gray-400 text-sm">Get exclusive deals and updates delivered to your inbox</p>
                        </div>
                        <div className="flex gap-2 w-full md:w-auto">
                            <input
                                type="email"
                                placeholder="Enter your email"
                                className="px-4 py-3 bg-white/10 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-[#ef4f5f] transition-colors w-full md:w-64"
                            />
                            <button className="px-6 py-3 bg-gradient-to-r from-[#ef4f5f] to-orange-500 hover:from-[#e03f4f] hover:to-orange-600 rounded-lg font-semibold transition-all duration-300 hover:scale-105 whitespace-nowrap">
                                Subscribe
                            </button>
                        </div>
                    </div>
                </div>

                {/* Bottom Bar */}
                <div className="border-t border-gray-700 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
                    <p className="text-gray-400 text-sm text-center md:text-left">
                        © 2024 ShopNearMe. All rights reserved. Made with ❤️ in India
                    </p>
                    <div className="flex gap-6">
                        <a href="#" className="text-gray-400 hover:text-[#ef4f5f] text-sm transition-colors">Privacy Policy</a>
                        <a href="#" className="text-gray-400 hover:text-[#ef4f5f] text-sm transition-colors">Terms of Service</a>
                        <a href="#" className="text-gray-400 hover:text-[#ef4f5f] text-sm transition-colors">Contact</a>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;

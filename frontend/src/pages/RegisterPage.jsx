import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const RegisterPage = () => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isShopOwner, setIsShopOwner] = useState(false);
    const [error, setError] = useState('');
    const { register } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await register({
                name,
                email,
                password,
                role: isShopOwner ? 'SHOPKEEPER' : 'USER'
            });
            navigate('/login');
        } catch (err) {
            setError('Registration failed. Email might be in use.');
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-white font-sans">
            <div className="w-full max-w-md p-6">
                <div className="text-center mb-10">
                    <h1 className="text-5xl font-extrabold italic text-[#ef4f5f] mb-2">ShopNearMe</h1>
                    <p className="text-xl text-gray-500 font-light">Join the community</p>
                </div>

                <div className="bg-white">
                    <h2 className="text-3xl font-medium text-gray-800 mb-8 text-center">Sign Up</h2>

                    {error && (
                        <div className="bg-red-50 text-red-500 text-sm p-3 rounded-lg border border-red-100 text-center mb-6">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <input
                                type="text"
                                required
                                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-[#ef4f5f] focus:ring-1 focus:ring-[#ef4f5f] outline-none transition-all placeholder-gray-400"
                                placeholder="Full Name"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                            />
                        </div>
                        <div>
                            <input
                                type="email"
                                required
                                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-[#ef4f5f] focus:ring-1 focus:ring-[#ef4f5f] outline-none transition-all placeholder-gray-400"
                                placeholder="Email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                        </div>
                        <div>
                            <input
                                type="password"
                                required
                                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-[#ef4f5f] focus:ring-1 focus:ring-[#ef4f5f] outline-none transition-all placeholder-gray-400"
                                placeholder="Password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                        </div>

                        <div className="flex items-center p-2">
                            <input
                                id="shopOwner"
                                type="checkbox"
                                checked={isShopOwner}
                                onChange={(e) => setIsShopOwner(e.target.checked)}
                                className="w-5 h-5 text-[#ef4f5f] border-gray-300 rounded focus:ring-[#ef4f5f] accent-[#ef4f5f]"
                            />
                            <label htmlFor="shopOwner" className="ml-2 text-gray-600">Register as Seller</label>
                        </div>

                        <button
                            type="submit"
                            className="w-full bg-[#ef4f5f] hover:bg-[#e03f4f] text-white py-3 rounded-lg font-bold text-lg shadow-lg hover:shadow-red-200 transition-all"
                        >
                            Create Account
                        </button>
                    </form>

                    <div className="mt-8 text-center text-gray-500">
                        Already have an account? <Link to="/login" className="text-[#ef4f5f] font-medium hover:underline">Log in</Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default RegisterPage;

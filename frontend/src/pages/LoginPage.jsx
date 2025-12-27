import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const LoginPage = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const data = await login(email, password);
            const user = data.user;
            if (user.role === 'ADMIN') {
                navigate('/admin');
            } else if (user.role === 'SHOPKEEPER') {
                navigate('/shopkeeper');
            } else {
                navigate('/');
            }
        } catch (err) {
            setError('Invalid email or password');
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-white font-sans">
            <div className="w-full max-w-md p-6">
                <div className="text-center mb-10">
                    <h1 className="text-5xl font-extrabold italic text-[#ef4f5f] mb-2">ShopNearMe</h1>
                    <p className="text-xl text-gray-500 font-light">Explore your city's best shops</p>
                </div>

                <div className="bg-white">
                    <h2 className="text-3xl font-medium text-gray-800 mb-8 text-center">Login</h2>

                    {error && (
                        <div className="bg-red-50 text-red-500 text-sm p-3 rounded-lg border border-red-100 text-center mb-6">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-6">
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

                        <button
                            type="submit"
                            className="w-full bg-[#ef4f5f] hover:bg-[#e03f4f] text-white py-3 rounded-lg font-bold text-lg shadow-lg hover:shadow-red-200 transition-all"
                        >
                            Log in
                        </button>

                        <div className="flex justify-between items-center text-sm text-gray-500 mt-4">
                            <a href="#" className="hover:text-[#ef4f5f]">Forgot Password?</a>
                        </div>
                    </form>

                    <div className="mt-10 text-center text-gray-500">
                        New here? <Link to="/register" className="text-[#ef4f5f] font-medium hover:underline">Create an account</Link>
                    </div>

                    <div className="my-8 flex items-center justify-between">
                        <span className="h-px bg-gray-200 flex-grow"></span>
                        <span className="px-4 text-gray-400 text-sm">or</span>
                        <span className="h-px bg-gray-200 flex-grow"></span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LoginPage;

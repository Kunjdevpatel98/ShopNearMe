import { createContext, useState, useEffect, useContext } from 'react';
import api from '../config/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            // Ideally call an endpoint to validate token / get user details
            // For now, we decode token or just assume logged in if token exists
            // Let's decode the JWT to get role (simple decode)
            try {
                const payload = JSON.parse(atob(token.split('.')[1]));
                // Normalize role by removing 'ROLE_' prefix if present
                const role = payload.role.startsWith('ROLE_') ? payload.role.replace('ROLE_', '') : payload.role;
                setUser({ email: payload.sub, role: role });
            } catch (e) {
                localStorage.removeItem('token');
            }
        }
        setLoading(false);
    }, []);

    const login = async (email, password) => {
        const response = await api.post('/auth/login', { email, password });
        const { token, user } = response.data;
        localStorage.setItem('token', token);
        // We can still decode token for persistence check on reload, 
        // but for immediate login we use the response user
        setUser(user);
        return response.data;
    };

    const register = async (userData) => {
        return await api.post('/auth/register', userData);
    };

    const logout = () => {
        localStorage.removeItem('token');
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, login, register, logout, loading }}>
            {!loading && children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);

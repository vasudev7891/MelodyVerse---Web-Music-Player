import { createContext, useContext, useState, useEffect } from 'react';
import { login as loginAPI, register as registerAPI, getProfile as getProfileAPI } from '../services/api';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [token, setToken] = useState(localStorage.getItem('melodyverse_token'));

    useEffect(() => {
        if (token) {
            loadUser();
        } else {
            setLoading(false);
        }
    }, []);

    const loadUser = async () => {
        try {
            const res = await getProfileAPI();
            setUser(res.data.user);
        } catch (error) {
            localStorage.removeItem('melodyverse_token');
            setToken(null);
            setUser(null);
        } finally {
            setLoading(false);
        }
    };

    const login = async (email, password) => {
        const res = await loginAPI({ email, password });
        localStorage.setItem('melodyverse_token', res.data.token);
        setToken(res.data.token);
        setUser(res.data.user);
        return res.data;
    };

    const register = async (name, email, password) => {
        const res = await registerAPI({ name, email, password });
        localStorage.setItem('melodyverse_token', res.data.token);
        setToken(res.data.token);
        setUser(res.data.user);
        return res.data;
    };

    const logout = () => {
        localStorage.removeItem('melodyverse_token');
        setToken(null);
        setUser(null);
    };

    const updateUser = (updatedUser) => {
        setUser(updatedUser);
    };

    return (
        <AuthContext.Provider value={{ user, token, loading, login, register, logout, updateUser, loadUser }}>
            {children}
        </AuthContext.Provider>
    );
};

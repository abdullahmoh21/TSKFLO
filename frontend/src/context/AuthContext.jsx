import React, { createContext, useContext, useState } from 'react';
const AuthContext = createContext(null);
export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(false);
    const login = async (email, password) => {
        setLoading(true);
        try {
            // TODO: Replace with actual API call
            const mockUser = {
                id: '1',
                name: 'John Doe',
                email,
                role: 'user'
            };
            setUser(mockUser);
            return { success: true };
        } catch (error) {
            return { success: false, error: error.message };
        } finally {
            setLoading(false);
        }
    };
    const logout = () => {
        setUser(null);
    };
    const value = {
        user,
        loading,
        login,
        logout,
        isAuthenticated: !!user
    };
    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
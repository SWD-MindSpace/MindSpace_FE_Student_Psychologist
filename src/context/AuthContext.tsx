'use client';

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';

interface AuthContextType {
    user: { idToken: string; accessToken: string } | null;
    loading: boolean;
    login: (tokens: { id_token: string; access_token: string }) => void;
    logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<{ idToken: string; accessToken: string } | null>(null);
    const [loading, setLoading] = useState(true); // ✅ Add loading state
    const router = useRouter();

    useEffect(() => {
        const idToken = localStorage.getItem('idToken');
        const accessToken = localStorage.getItem('accessToken');

        if (idToken && accessToken && !isTokenExpired(idToken)) {
            setUser({ idToken, accessToken });
        } else {
            localStorage.removeItem('idToken');
            localStorage.removeItem('accessToken');
        }

        setLoading(false); // ✅ Done loading after checking tokens
    }, []);

    const logout = useCallback(async () => {
        try {
            const accessToken = localStorage.getItem('accessToken');
            if (accessToken) {
                await fetch('https://localhost:7096/api/v1/identity/logout', {
                    method: 'POST',
                    headers: {
                        Authorization: `Bearer ${accessToken}`,
                        'Content-Type': 'application/json',
                    },
                    credentials: 'include',
                });
            }
        } catch (error) {
            console.error('Logout request failed:', error);
        }

        localStorage.removeItem('idToken');
        localStorage.removeItem('accessToken');
        setUser(null);
        router.push('/login');
    }, [router]);

    const isTokenExpired = (token: string): boolean => {
        try {
            const payload = JSON.parse(atob(token.split('.')[1])); // Decode JWT payload
            return payload.exp * 1000 < Date.now(); // Check if expired
        } catch (error) {
            console.error('Error decoding ID token:', error);
            return true;
        }
    };

    const login = ({ id_token, access_token }: { id_token: string; access_token: string }) => {
        localStorage.setItem('idToken', id_token);
        localStorage.setItem('accessToken', access_token);
        setUser({ idToken: id_token, accessToken: access_token });
        router.push('/');
    };

    return (
        <AuthContext.Provider value={{ user, loading, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth(): AuthContextType {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}

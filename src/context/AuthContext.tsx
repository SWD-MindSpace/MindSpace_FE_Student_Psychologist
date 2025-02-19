'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

interface AuthContextType {
    user: { idToken: string; accessToken: string } | null;
    login: (tokens: { id_token: string; access_token: string }) => void;
    logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<{ idToken: string; accessToken: string } | null>(null);
    const router = useRouter();

    useEffect(() => {
        const idToken = localStorage.getItem('idToken');
        const accessToken = localStorage.getItem('accessToken');

        if (idToken && accessToken) {
            setUser({ idToken, accessToken });
        } else {
            setUser(null);
        }
    }, []);

    const login = ({ id_token, access_token }: { id_token: string; access_token: string }) => {
        localStorage.setItem('idToken', id_token);
        localStorage.setItem('accessToken', access_token);
        setUser({ idToken: id_token, accessToken: access_token });
        router.push('/');
    };

    const logout = async () => {
        try {
            const accessToken = localStorage.getItem("accessToken");
            console.log("Before logout - Access Token:", accessToken);

            if (accessToken) {
                await fetch("https://localhost:7096/api/v1/identity/logout", {
                    method: "POST",
                    headers: {
                        Authorization: `Bearer ${accessToken}`,
                        "Content-Type": "application/json",
                    },
                    credentials: "include",
                });
            }
        } catch (error) {
            console.error("Logout request failed:", error);
        }

        localStorage.removeItem("idToken");
        localStorage.removeItem("accessToken");

        console.log("After logout - Access Token:", localStorage.getItem("accessToken"));
        console.log("After logout - ID Token:", localStorage.getItem("idToken"));

        setUser(null);
        router.push("/login");
    };

    return (
        <AuthContext.Provider value={{ user, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth(): AuthContextType {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
}

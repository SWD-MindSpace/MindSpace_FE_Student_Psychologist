'use client';

import { HeroUIProvider } from "@heroui/react";
import React, { ReactNode } from 'react';
import Navbar from "../Navbar";
import Footer from "../Footer";
import { usePathname } from 'next/navigation';
import { AuthProvider } from '@/context/AuthContext';  

export default function Providers({ children }: { children: ReactNode }) {
    const pathname = usePathname();  
    const hideLayout = ['/login', '/register'].some(route => pathname.startsWith(route));

    return (
        <HeroUIProvider>
            <AuthProvider>      
                <div className="flex flex-col min-h-screen">
                    {!hideLayout && <Navbar />}  
                    
                    <main className="flex-grow">{children}</main>

                    {!hideLayout && <Footer />}  
                </div>
            </AuthProvider>
        </HeroUIProvider>
    );
}

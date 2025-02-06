'use client'

import {HeroUIProvider} from "@heroui/react";
import React, { ReactNode } from 'react'

export default function Providers({ children }: { children: ReactNode }) {
    return (
        <HeroUIProvider>
            <main className='container mx-auto p-10'>
                {children}
            </main>
        </HeroUIProvider>
    )
}

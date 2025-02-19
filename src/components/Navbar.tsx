'use client';

import {
    Button,
    Dropdown,
    DropdownItem,
    DropdownMenu,
    DropdownTrigger,
    Navbar,
    NavbarBrand,
    NavbarContent,
    NavbarItem
} from '@heroui/react';
import React from 'react';
import { useRouter } from 'next/navigation';
import { FiChevronDown } from 'react-icons/fi';
import { FaBrain } from 'react-icons/fa';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';  

export default function TopNav() {
    const router = useRouter();
    const { user, logout } = useAuth();  

    return (
        <Navbar
            maxWidth="2xl"
            className="border-b border-gray-300 h-24"
            classNames={{
                item: ['text-base', 'text-[#727272]']
            }}
        >
            <NavbarBrand className="gap-2">
                <FaBrain className="text-blue-600 w-6 h-6" />
                <Link href="/" className="text-2xl font-bold pr-2">MindSpace</Link>
            </NavbarBrand>

            <NavbarContent className="gap-5">
                <Dropdown>
                    <DropdownTrigger className="text-base text-[#727272]">
                        <Button variant="light">
                            Account Name <FiChevronDown size={20} color="#727272" />
                        </Button>
                    </DropdownTrigger>
                    <DropdownMenu className="uppercase text-[#002D72]">
                        <DropdownItem key="dashboard">
                            <Link href="#">Dashboard</Link>
                        </DropdownItem>
                        <DropdownItem key="profile">
                            <Link href="#">Profile</Link>
                        </DropdownItem>
                        <DropdownItem key="text-history">
                            <Link href="#">Text history</Link>
                        </DropdownItem>
                    </DropdownMenu>
                </Dropdown>
                <Dropdown>
                    <DropdownTrigger className="text-base text-[#727272]">
                        <Button variant="light">
                            Appointment <FiChevronDown size={20} color="#727272" />
                        </Button>
                    </DropdownTrigger>
                    <DropdownMenu className="uppercase text-[#002D72]">
                        <DropdownItem key="book-appointment">
                            <Link href="#">Book Appointment</Link>
                        </DropdownItem>
                        <DropdownItem key="future-appointments">
                            <Link href="#">Future Appointments</Link>
                        </DropdownItem>
                        <DropdownItem key="appointment-history">
                            <Link href="#">Appointments history</Link>
                        </DropdownItem>
                    </DropdownMenu>
                </Dropdown>
                <Dropdown>
                    <DropdownTrigger className="text-base text-[#727272]">
                        <Button variant="light">
                            Supporting Programs <FiChevronDown size={20} color="#727272" />
                        </Button>
                    </DropdownTrigger>
                    <DropdownMenu className="uppercase text-[#002D72]">
                        <DropdownItem key="all-programs">
                            <Link href="#">All supporting programs</Link>
                        </DropdownItem>
                        <DropdownItem key="registered-program">
                            <Link href="#">Registered Programs</Link>
                        </DropdownItem>
                    </DropdownMenu>
                </Dropdown>

                <NavbarItem>
                    <Link href="/alltests" className="text-[#727272] hover:underline">
                        All tests
                    </Link>
                </NavbarItem>
                <NavbarItem>
                    <Link href="/resources" className="text-[#727272] hover:underline">
                        Resources
                    </Link>
                </NavbarItem>
                <NavbarItem>
                    <Link href="#" className="text-[#727272] hover:underline">
                        Our psychologists
                    </Link>
                </NavbarItem>
                <NavbarItem>
                    <Link href="/about-us" className="text-[#727272] hover:underline">
                        About us
                    </Link>
                </NavbarItem>
            </NavbarContent>

            <NavbarContent className="font-bold pl-20 flex items-center gap-4">
                {user ? (
                    <Button
                        onPress={logout} 
                        className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-all shadow-md"
                    >
                        Logout
                    </Button>
                ) : (
                    <>
                        <Button
                            onPress={() => router.push('/login')}
                            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-all shadow-md"
                        >
                            Login
                        </Button>
                        <Button
                            onPress={() => router.push('/register')}
                            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-all shadow-md"
                        >
                            Register
                        </Button>
                    </>
                )}
            </NavbarContent>
        </Navbar>
    );
}

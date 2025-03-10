'use client'

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Input, Button, Card, CardBody, CardHeader, Divider } from "@heroui/react";
import { FiMail, FiLock } from 'react-icons/fi';
import { FaRegEye, FaRegEyeSlash } from "react-icons/fa";
import { useAuth } from '@/context/AuthContext';

export default function LoginForm() {
    const { login } = useAuth();
    const router = useRouter();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [type, setType] = useState<'password' | 'text'>('password');
    const [error, setError] = useState('');

    const API_URL = 'https://localhost:7096/api/v1/identity/login';

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        try {
            const response = await fetch(API_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({ Email: email, Password: password }),
            });

            const data = await response.json();
            if (!response.ok) throw new Error(data?.message || 'Invalid credentials');

            const { id_token, access_token } = data;
            if (!id_token || !access_token) throw new Error("Missing tokens in response");

            console.log("ID Token:", id_token);
            console.log("Access Token:", access_token);

            login({ id_token, access_token }); 
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } catch (err: any) {
            setError(err.message || 'Something went wrong');
        }
    };

    return (
        <div className="flex min-h-screen">
            <div className="hidden md:flex w-1/2 bg-cover bg-center" 
                style={{ backgroundImage: "url('https://res.cloudinary.com/ddewgbug1/image/upload/v1741431645/pomogpovlunvp23f1g8s.avif')" }}>
            </div>

            <div className="w-full md:w-1/2 flex flex-col items-center justify-center bg-gray-100 p-8">
                <div className="text-4xl font-bold font-bevnpro text-indigo-600 mb-6">
                    MindSpace 
                </div>

                <Card className="w-[400px] p-8 rounded-xl shadow-lg bg-white">
                    <CardHeader className="text-2xl font-bold text-center text-gray-800">
                        Login
                    </CardHeader>
                    <Divider />
                    <CardBody>
                        {error && <p className="text-red-500 text-sm text-center">{error}</p>}
                        <form onSubmit={handleLogin} className="flex flex-col gap-5 mt-4">
                            <Input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                startContent={<FiMail size={20} className="text-gray-500" />}
                                label="Email"
                                placeholder="Enter your email"
                                isRequired
                                className="border-gray-300 focus:border-indigo-500"
                            />
                            <Input
                                type={type}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                startContent={<FiLock size={20} className="text-gray-500" />}
                                endContent={
                                    <span className="cursor-pointer text-gray-500 hover:text-indigo-500" 
                                        onClick={() => setType(type === 'password' ? 'text' : 'password')}>
                                        {type === 'password' ? <FaRegEyeSlash size={20} /> : <FaRegEye size={20} />}
                                    </span>
                                }
                                label="Password"
                                placeholder="Enter your password"
                                isRequired
                                className="border-gray-300 focus:border-indigo-500"
                            />
                            <Button type="submit" color="primary" className="mt-3 bg-indigo-600 hover:bg-indigo-700 transition">
                                Login
                            </Button>
                            <Button onPress={() => router.push('/')} color="secondary" variant="flat" className="mt-2 text-gray-700 hover:text-gray-900">
                                Back
                            </Button>
                        </form>
                    </CardBody>
                </Card>
            </div>
        </div>
    );
}

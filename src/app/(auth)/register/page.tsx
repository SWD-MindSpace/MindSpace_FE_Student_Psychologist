'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation';
import { Button, Card, CardBody, CardHeader, Divider, Input } from '@heroui/react'
import { FiMail, FiLock } from 'react-icons/fi'
import { FaRegEye, FaRegEyeSlash } from "react-icons/fa";

export default function Page() {
    const router = useRouter();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [type, setType] = useState<'password' | 'text'>('password');
    const [error, setError] = useState('');


    const handleToggle = () => {
        setType((prevType) => (prevType === 'password' ? 'text' : 'password'));
    };

    return (
        <div className='flex justify-center items-center min-h-screen bg-gray-300'>
            <Card className='w-[400px] p-6'>
                <CardHeader className='text-2xl font-bold'>Register for Parent</CardHeader>
                <Divider />
                <CardBody>
                    <form className='flex flex-col gap-4 mt-4'>
                        <Input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            startContent={<FiMail size={20} />}
                            label="Email"
                            placeholder="Enter your email"
                            isRequired
                        />
                        <Input
                            type={type}
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            startContent={<FiLock size={20} />}
                            endContent={
                                <span className="cursor-pointer" onClick={handleToggle}>
                                    {type === 'password' ? <FaRegEyeSlash size={20} /> : <FaRegEye size={20} />}
                                </span>
                            }
                            label="Password"
                            placeholder="Enter your password"
                            isRequired
                        />
                        <Input
                            type="password"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            startContent={<FiLock size={20} />}
                            label="Confirm your password"
                            placeholder="Enter your password again"
                            isRequired
                        />
                        <Button type="submit" color="secondary" className="mt-2">
                            Login
                        </Button>
                        <Button onPress={() => router.back()} color="secondary" variant="flat">
                            Back
                        </Button>
                    </form>
                </CardBody>
            </Card>

        </div>
    )
}

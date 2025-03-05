'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardBody, CardHeader, Button, Spinner, Divider } from "@heroui/react";
import { AiOutlineClockCircle } from 'react-icons/ai';
import { FaBrain } from 'react-icons/fa';
import toast, { Toaster } from 'react-hot-toast';

type Test = {
    id: number;
    title: string;
    testCode: string;
    testCategory: {
        id: number;
        name: string;
    };
    specialization: {
        id: number;
        name: string;
    };
    targetUser: string;
    description: string;
    questionCount: number;
    price: number;
    author: {
        id: number;
        fullName: string;
        email: string;
    };
    dueDate?: string;
};

export default function AllTests() {
    const [tests, setTests] = useState<Test[]>([]);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        const fetchTests = async () => {
            try {
                const response = await fetch(
                    `https://localhost:7096/api/v1/tests?Title=&TestCode=&TargetUser=&MinPrice=&MaxPrice=&TestCategoryId=&SpecializationId=&Sort=&PageIndex=1&PageSize=10`,
                    {
                        method: 'GET',
                        headers: {
                            'Authorization': `Bearer ${localStorage.getItem("accessToken")}`,
                            'Content-Type': 'application/json',
                        },
                    }
                );
                if (!response.ok) {
                    throw new Error('Failed to fetch tests');
                }
                const data = await response.json();
                setTests(data.data);
            } catch (error) {
                console.error('Error fetching tests:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchTests();
    }, []);

    const formatDate = (dateString?: string) => {
        return dateString ? new Date(dateString).toLocaleDateString() : "N/A";
    };

    const handleStartTest = (testId: number) => {
        const accessToken = localStorage.getItem('accessToken');

        if (!accessToken) {
            toast.error('Please login to start the test!', {
                duration: 3000,
                style: {
                    background: '#f87171',
                    color: '#fff',
                    fontWeight: 'bold',
                    padding: '20px',
                    borderRadius: '10px',
                },
            });
            return;
        }

        router.push(`/tests/${testId}`);
    };

    return (
        <div className="min-h-screen p-6 bg-gray-100">
            <Toaster position="top-center" reverseOrder={false} />
            <h1 className="text-4xl font-bold font-bevnpro text-center text-blue-700 mb-8">Các bài kiểm tra</h1>
            <Divider className='mb-10 w-1/2 mx-auto'/>

            {loading ? (
                <div className="flex justify-center">
                    <Spinner size="lg" color="primary" />
                </div>
            ) : (
                <>
                    <Card className="mb-10 bg-blue-50 shadow-lg">
                        <CardHeader className="text-blue-700 flex items-center gap-2 text-2xl font-semibold">
                            <AiOutlineClockCircle size={30} />
                            Periodic Tests
                        </CardHeader>
                        <Divider />
                        <CardBody>
                            <div className="grid gap-6">
                                {tests.filter(test => test.testCategory.id === 3).map((test) => (
                                    <Card key={test.id} className="p-6 bg-white shadow-md hover:shadow-xl transition duration-300">
                                        <CardHeader className="text-xl font-bold">{test.title}</CardHeader>
                                        <CardBody>
                                            <p className="text-black text-lg">{test.testCode}</p>
                                            <p className="text-gray-600 text-lg">{test.description}</p>
                                            <p className="text-red-500 font-semibold">📅 Due Date: {formatDate(test.dueDate)}</p>
                                            <Button
                                                color="primary"
                                                variant="shadow"
                                                className="mt-3 w-fit p-5"
                                                onPress={() => handleStartTest(test.id)}
                                            >
                                                Take Test
                                            </Button>
                                        </CardBody>
                                    </Card>
                                ))}
                            </div>
                        </CardBody>
                    </Card>

                    <Card className="bg-green-50 shadow-lg">
                        <CardHeader className="text-green-700 flex items-center gap-2 text-2xl font-semibold">
                            <FaBrain size={30} />
                            Psychologist Tests
                        </CardHeader>
                        <Divider />
                        <CardBody>
                            <div className="grid gap-6">
                                {tests.filter(test => test.testCategory.id === 1).map((test) => (
                                    <Card key={test.id} className="p-6 bg-white shadow-md hover:shadow-lg transition duration-300">
                                        <CardHeader className="text-xl font-bold">{test.title}</CardHeader>
                                        <CardBody>
                                            <p className="text-black text-lg">{test.testCode}</p>
                                            <p className="text-gray-600 text-lg">{test.description}</p>
                                            <Button
                                                color="success"
                                                variant="shadow"
                                                className="mt-3 w-fit p-5"
                                                onPress={() => handleStartTest(test.id)}
                                            >
                                                Start Test
                                            </Button>
                                        </CardBody>
                                    </Card>
                                ))}
                            </div>
                        </CardBody>
                    </Card>
                </>
            )}
        </div>
    );
}

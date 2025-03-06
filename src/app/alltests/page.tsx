'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardBody, CardHeader, Button, Spinner, Divider } from "@heroui/react";
import { Toaster, toast } from 'react-hot-toast';

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
    const [userRole, setUserRole] = useState<string | null>(null);
    const router = useRouter();

    useEffect(() => {
        const storedRole = localStorage.getItem("userRole");
        setUserRole(storedRole);

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

    if (loading) {
        return (
            <div className="min-h-screen flex justify-center items-center">
                <Spinner size="lg" color="primary" />
            </div>
        );
    }

    // Define displayed tests based on user role
    let displayedTests: Test[] = [];
    let psychologicalTests: Test[] = [];
    let periodicTests: Test[] = [];

    if (!userRole) {
        // If not logged in → Show "Parent" & "Student" tests (excluding "Periodic")
        displayedTests = tests.filter(
            (test) => (test.targetUser === "Parent" || test.targetUser === "Student") &&
                test.testCategory.name !== "Periodic"
        );
    } else if (userRole === "Student") {
        // If logged in as Student → Separate Psychological and Periodic tests
        psychologicalTests = tests.filter((test) => test.testCategory.name === "Psychological");
        periodicTests = tests.filter((test) => test.testCategory.name === "Periodic");
    } else if (userRole === "Parent") {
        // If logged in as Parent → Show only "Parenting" tests
        displayedTests = tests.filter((test) => test.testCategory.name === "Parenting");
    }

    return (
        <div className="min-h-screen p-6 bg-gray-100">
            <Toaster position="top-center" reverseOrder={false} />
            <h1 className="text-4xl font-bold font-bevnpro text-center text-blue-700 mb-8">
                Các bài kiểm tra
            </h1>
            <Divider className='mb-10 w-1/2 mx-auto' />

            {/* If user is a Student, show Psychological & Periodic separately */}
            {userRole === "Student" ? (
                <>
                    {/* Psychological Tests */}
                    {psychologicalTests.length > 0 && (
                        <>
                            <h2 className="text-2xl font-bold text-gray-800 mb-4">Psychological Tests</h2>
                            <div className="grid gap-6">
                                {psychologicalTests.map((test) => (
                                    <Card key={test.id} className="p-6 bg-white shadow-md hover:shadow-lg transition duration-300">
                                        <CardHeader className="text-xl font-bold">{test.title}</CardHeader>
                                        <CardBody>
                                            <p className="text-black text-lg">{test.testCode}</p>
                                            <p className="text-gray-600 text-lg">{test.description}</p>
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
                        </>
                    )}

                    {/* Periodic Tests */}
                    {periodicTests.length > 0 && (
                        <>
                            <Divider className="my-10" />
                            <h2 className="text-2xl font-bold text-gray-800 mb-4">Periodic Tests</h2>
                            <div className="grid gap-6">
                                {periodicTests.map((test) => (
                                    <Card key={test.id} className="p-6 bg-yellow-50 shadow-md hover:shadow-lg transition duration-300">
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
                                                Take Test
                                            </Button>
                                        </CardBody>
                                    </Card>
                                ))}
                            </div>
                        </>
                    )}
                </>
            ) : (
                // For other users (Not logged in or Parent)
                displayedTests.length === 0 ? (
                    <p className="text-center text-lg font-semibold text-gray-600">
                        No tests available.
                    </p>
                ) : (
                    <div className="grid gap-6">
                        {displayedTests.map((test) => (
                            <Card key={test.id} className="p-6 bg-white shadow-md hover:shadow-lg transition duration-300">
                                <CardHeader className="text-xl font-bold">{test.title}</CardHeader>
                                <CardBody>
                                    <p className="text-black text-lg">{test.testCode}</p>
                                    <p className="text-gray-600 text-lg">{test.description}</p>
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
                )
            )}
        </div>
    );
}

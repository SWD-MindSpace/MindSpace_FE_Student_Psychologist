'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardBody, CardHeader, Button, Spinner, Image, Pagination } from "@heroui/react";
import { Toaster } from 'react-hot-toast';
import { FaMapMarkerAlt, FaCalendarAlt, FaCheckCircle, FaTimesCircle } from 'react-icons/fa';
import { registerForProgram } from '@/lib/utils';

interface SupportingProgram {
    id: number;
    title: string;
    thumbnailUrl: string;
    pdffileUrl: string;
    maxQuantity: number;
    city: string;
    street: string;
    ward: string;
    province: string;
    isActive: boolean;
    startDateAt: string;
}

export default function SupportingPrograms() {
    const [programs, setPrograms] = useState<SupportingProgram[]>([]);
    const [loading, setLoading] = useState(true);
    const [pageIndex, setPageIndex] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const pageSize = 6;
    const router = useRouter();

    useEffect(() => {
        const fetchPrograms = async () => {
            setLoading(true);
            try {
                const response = await fetch(
                    `https://localhost:7096/api/v1/supporting-programs?pageIndex=${pageIndex}&pageSize=${pageSize}&MinQuantity=10&MaxQuantity=100`,
                    {
                        method: 'GET',
                        headers: {
                            'Authorization': `Bearer ${localStorage.getItem("accessToken")}`,
                            'Content-Type': 'application/json',
                        },
                    }
                );
                if (!response.ok) {
                    throw new Error('Failed to fetch programs');
                }
                const data = await response.json();
                setPrograms(data.data);
                setTotalPages(Math.ceil(data.count / pageSize));
            } catch (error) {
                console.error('Error fetching programs:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchPrograms();
    }, [pageIndex]);

    return (
        <div className="min-h-screen bg-gray-100">
            <Toaster position="top-center" reverseOrder={false} />
            <div className='bg-gradient-to-r from-purple-500 to-indigo-600 py-16 px-6 mb-10'>
                <h1 className="text-4xl font-bold text-center text-white flex items-center justify-center">
                    Chương trình hỗ trợ
                </h1>
            </div>

            {loading ? (
                <div className="flex justify-center">
                    <Spinner size="lg" color="primary" />
                </div>
            ) : (
                <>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6">
                        {programs.map((program) => (
                            <Card key={program.id} className="p-4 bg-white shadow-md hover:shadow-lg transition duration-300 rounded-lg">
                                <Image src={program.thumbnailUrl} alt={program.city} className="w-full h-40 object-cover rounded-md" />
                                <div className="flex justify-between items-end mt-3">
                                    <div>
                                        <CardHeader className="text-xl font-bold font-bevnpro">{program.city}</CardHeader>
                                        <CardBody className='font-noto-sans'>
                                            <p className='text-xl font-bevnpro'>{program.title}</p>
                                            <p className="text-gray-600 text-lg flex items-center"><FaMapMarkerAlt className="mr-2" /> {program.street}</p>
                                            <p className="text-gray-600 text-lg flex items-center"><FaCalendarAlt className="mr-2" /> {new Date(program.startDateAt).toLocaleDateString()}</p>
                                            <p className="font-semibold flex items-center">
                                                {program.isActive ? (
                                                    <FaCheckCircle className="text-green-500 mr-2" />
                                                ) : (
                                                    <FaTimesCircle className="text-red-500 mr-2" />
                                                )}
                                                {program.isActive ? 'Active' : 'Inactive'}
                                            </p>
                                        </CardBody>
                                    </div>

                                    <div className="flex flex-col gap-4 font-noto-sans">
                                        <Button
                                            color="primary"
                                            variant="solid"
                                            className="px-4 py-2 text-sm rounded-full shadow-md hover:shadow-lg transition"
                                            onPress={() => router.push(`/supporting-programs/${program.id}`)}
                                        >
                                            View Details
                                        </Button>
                                        <Button
                                            color="success"
                                            variant="solid"
                                            className="px-4 py-2 text-sm rounded-full shadow-md hover:shadow-lg transition"
                                            onPress={() => registerForProgram(program.id)}
                                        >
                                            Register
                                        </Button>
                                    </div>
                                </div>
                            </Card>
                        ))}
                    </div>

                    <div className="flex justify-center mt-6 py-4">
                        <Pagination
                            page={pageIndex}
                            total={totalPages}
                            onChange={(newPage: number) => setPageIndex(newPage)}
                        />
                    </div>
                </>
            )}
        </div>
    );
}
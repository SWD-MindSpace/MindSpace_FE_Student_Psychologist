'use client';

import React, { useEffect, useState } from 'react';
import { Spinner, Card, CardBody, Image, Pagination } from "@heroui/react";
import { FaMapMarkerAlt, FaCalendarAlt, FaCheckCircle, FaTimesCircle } from 'react-icons/fa';
import { Toaster, toast } from 'react-hot-toast';
import { useRouter } from 'next/navigation';
interface RegisteredProgram {
    id: number;
    thumbnailUrl: string;
    pdffileUrl: string;
    maxQuantity: number;
    city: string;
    street: string | null;
    ward: string | null;
    province: string | null;
    postalCode: string;
    isActive: boolean;
    startDateAt: string;
}

export default function ProgramHistory() {
    const router = useRouter();
    const [programs, setPrograms] = useState<RegisteredProgram[]>([]);
    const [loading, setLoading] = useState(true);
    const [pageIndex, setPageIndex] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const pageSize = 4;

    useEffect(() => {
        const accessToken = localStorage.getItem("accessToken");
        const userId = localStorage.getItem("userId");
        if (!accessToken) {
            router.push("/login");
            return;
        }
        const fetchRegisteredPrograms = async () => {
            setLoading(true);
            try {
                const response = await fetch(
                    `https://localhost:7096/api/v1/supporting-programs/history?StudentId=${userId}&pageIndex=${pageIndex}&pageSize=${pageSize}`,
                    {
                        method: 'GET',
                        headers: {
                            'Authorization': `Bearer ${localStorage.getItem("accessToken")}`,
                            'Content-Type': 'application/json',
                        },
                    }
                );

                if (!response.ok) {
                    throw new Error('Failed to fetch registered programs');
                }

                const data = await response.json();
                setPrograms(data.data);
                setTotalPages(Math.ceil(data.count / pageSize));
            } catch (error) {
                toast.error('Failed to load registered programs. Please try again.');
                console.error('Error fetching registered programs:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchRegisteredPrograms();
    }, [pageIndex, router]);

    return (
        <div className="min-h-screen bg-gray-100">
            <Toaster position="top-center" reverseOrder={false} />
            <div className="bg-gradient-to-r from-purple-500 to-indigo-600 py-16 px-6 mb-10">
                <h1 className="text-4xl font-bold text-center text-white">
                    Chương trình bạn đã đăng kí
                </h1>
            </div>

            {loading ? (
                <div className="flex justify-center">
                    <Spinner size="lg" color="primary" />
                </div>
            ) : (
                <>
                    {programs.length === 0 ? (
                        <p className="text-center text-xl">You have not registered for any programs yet.</p>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6">
                            {programs.map((program) => (
                                <Card key={program.id} className="p-4 bg-white shadow-md hover:shadow-lg transition duration-300 rounded-lg">
                                    <Image src={program.thumbnailUrl} alt={program.city} className="w-full h-40 object-cover rounded-md" />
                                    <div className="flex justify-between items-end mt-3">
                                        <div>
                                            <CardBody>
                                                <p className="text-gray-600 text-lg flex items-center">
                                                    <FaMapMarkerAlt className="mr-2" /> {program.city}, {program.street}
                                                </p>
                                                <p className="text-gray-600 text-lg flex items-center">
                                                    <FaCalendarAlt className="mr-2" /> {new Date(program.startDateAt).toLocaleDateString()}
                                                </p>
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
                                    </div>
                                </Card>
                            ))}
                        </div>
                    )}

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

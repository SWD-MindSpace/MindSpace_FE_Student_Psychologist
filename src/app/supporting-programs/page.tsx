'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardBody, CardHeader, Button, Spinner, Image } from "@heroui/react";
import { FaMapMarkerAlt, FaCalendarAlt, FaCheckCircle, FaTimesCircle, FaBookOpen } from 'react-icons/fa';

interface SupportingProgram {
    id: number;
    thumbnailUrl: string;
    pdffileUrl: string;
    maxQuantity: number;
    city: string;
    street: string;
    isActive: boolean;
    startDateAt: string;
}

export default function SupportingPrograms() {
    const [programs, setPrograms] = useState<SupportingProgram[]>([]);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        const fetchPrograms = async () => {
            try {
                const response = await fetch(
                    `https://localhost:7096/api/v1/supporting-programs?MinQuantity=10&MaxQuantity=100&SearchTitle=&Sort=joinedAtAsc&StartDateAt&SchoolManagerId&PsychologistId&SchoolId&FromDate&ToDate`,
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
            } catch (error) {
                console.error('Error fetching programs:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchPrograms();
    }, []);

    return (
        <div className="min-h-screen bg-gray-100">
            <div className='bg-gradient-to-r from-purple-500 to-indigo-600 py-16 px-6 mb-10'>
                <h1 className="text-4xl font-bold text-center text-white flex items-center justify-center">
                    <FaBookOpen className="mr-3" /> Chương trình hỗ trợ
                </h1>
            </div>
            {loading ? (
                <div className="flex justify-center">
                    <Spinner size="lg" color="primary" />
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6">
                    {programs.map((program) => (
                        <Card key={program.id} className="p-4 bg-white shadow-md hover:shadow-lg transition duration-300">
                            <Image src={program.thumbnailUrl} alt={program.city} className="w-full h-40 object-cover rounded-md" />
                            <CardHeader className="text-xl font-bold mt-3">{program.city}</CardHeader>
                            <CardBody>
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
                                <Button
                                    color="primary"
                                    variant="shadow"
                                    className="mt-3 w-full"
                                    onPress={() => router.push(`/supporting-programs/${program.id}`)}
                                >
                                    View Details
                                </Button>
                            </CardBody>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
}
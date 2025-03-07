'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Card, CardBody, Button, Spinner, Image } from "@heroui/react";
import { Toaster } from 'react-hot-toast';
import { FaMapMarkerAlt, FaCalendarAlt } from 'react-icons/fa';
import { RiInformation2Fill } from "react-icons/ri";
import { registerForProgram } from '@/lib/utils';

interface SupportingProgram {
    id: number;
    title: string;
    thumbnailUrl: string;
    maxQuantity: number;
    city: string;
    street: string;
    ward: string;
    province: string;
    isActive: boolean;
    startDateAt: string;
}

export default function ProgramDetail() {
    const { id } = useParams();
    const [program, setProgram] = useState<SupportingProgram | null>(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        const fetchProgramDetails = async () => {
            try {
                const response = await fetch(`https://localhost:7096/api/v1/supporting-programs/${id}`, {
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem("accessToken")}`,
                        'Content-Type': 'application/json',
                    },
                });

                if (!response.ok) {
                    throw new Error('Failed to fetch program details');
                }

                const data = await response.json();
                setProgram(data);
            } catch (error) {
                console.error('Error fetching program details:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchProgramDetails();
    }, [id]);

    return (
        <div className="min-h-screen bg-gray-100">
            <Toaster position="top-center" reverseOrder={false} />
            <div className="flex justify-center py-10 bg-gradient-to-r from-purple-500 to-indigo-600">
                <h1 className="flex items-center gap-2 text-4xl font-bevnpro font-bold text-white">
                    <RiInformation2Fill /> Program Details
                </h1>
            </div>

            {loading ? (
                <div className="flex justify-center mt-10">
                    <Spinner size="lg" color="primary" />
                </div>
            ) : program ? (
                <div className="max-w-4xl mx-auto p-6">
                    <Card className="shadow-lg rounded-lg">
                        <Image src={program.thumbnailUrl} alt={program.title} className="w-full h-60 object-cover rounded-t-lg" />
                        <CardBody className="p-6">
                            <div className="mt-3 flex items-center gap-2">
                                <FaMapMarkerAlt className="text-gray-500" />
                                <span className="text-gray-600">{program.street}, {program.city}, {program.ward}, {program.province}</span>
                            </div>

                            <div className="mt-2 flex items-center gap-2">
                                <FaCalendarAlt className="text-gray-500" />
                                <span className="text-gray-600">{new Date(program.startDateAt).toLocaleDateString()}</span>
                            </div>

                            <p className="mt-4 text-lg font-semibold">Maximum Participants: {program.maxQuantity}</p>

                            <div className="flex gap-4 mt-6">
                                <Button color="primary" variant="bordered" className="w-full" onPress={() => router.push('/supporting-programs')}>
                                    Back to List
                                </Button>
                                <Button color="success" className="w-full" onPress={() => registerForProgram(program.id)}>
                                    Register Program
                                </Button>
                            </div>
                        </CardBody>
                    </Card>
                </div>
            ) : (
                <p className="text-center text-red-500 text-xl mt-10">Program not found</p>
            )}
        </div>
    );
}

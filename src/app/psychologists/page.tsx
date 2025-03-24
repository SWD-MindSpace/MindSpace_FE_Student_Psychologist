'use client';

import { useEffect, useState, useCallback } from 'react';
import { Avatar, Button, Input } from '@heroui/react';
import { FaStar, FaUserDoctor, FaLock } from "react-icons/fa6";
import { useRouter } from 'next/navigation';
import MotionHeading from '@/components/MotionHeading';

const BASE_URL = "https://localhost:7096/api/v1/identities/accounts/psychologists";

type Psychologist = {
    id: number;
    fullName: string;
    bio: string;
    averageRating: number;
    sessionPrice: number;
    specialization: {
        id: number;
        name: string;
    };
    imageUrl?: string;
};

const PsychologistPage = () => {
    const router = useRouter();
    const [psychologists, setPsychologists] = useState<Psychologist[]>([]);
    const [loading, setLoading] = useState(true);
    const [unauthorized, setUnauthorized] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [searchTerm, setSearchTerm] = useState('');

    const fetchPsychologists = useCallback(async () => {
        setLoading(true);
        try {
            const accessToken = localStorage.getItem('accessToken');
            if (!accessToken) {
                setUnauthorized(true);
                setLoading(false);
                return;
            }

            const searchParam = searchTerm ? `&SearchName=${encodeURIComponent(searchTerm)}` : '';
            const API_URL = `${BASE_URL}?Status=All${searchParam}`;

            const response = await fetch(API_URL, {
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                    'Content-Type': 'application/json',
                },
            });

            if (response.status === 401) {
                setUnauthorized(true);
                return;
            }

            if (!response.ok) {
                throw new Error("Failed to fetch data");
            }

            const data = await response.json();
            setPsychologists(data.data);
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
        } catch (err) {
            setUnauthorized(true);
        } finally {
            setLoading(false);
        }
    }, [searchTerm]);

    useEffect(() => {
        fetchPsychologists();
    }, [fetchPsychologists]);

    return (
        <>
            <div
                className="relative bg-cover bg-center text-white py-16 px-6"
                style={{
                    backgroundImage: `url('https://res.cloudinary.com/ddewgbug1/image/upload/v1742826548/smt6861krglkqtfisr98.jpg')`,
                }}
            >
                <MotionHeading className="text-white font-noto-sans mt-5 text-center">
                    Các chuyên gia tâm lí
                </MotionHeading>
            </div>
            <div className="max-w-4xl mx-auto px-4 py-6">

                <div className="flex justify-center gap-2 mb-4">
                    <Input
                        type="text"
                        placeholder="Search by name..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full max-w-md border rounded-md p-2"
                    />
                    <Button onClick={() => setSearchTerm(searchQuery)} className="bg-blue-500 text-white px-4 py-2 rounded">
                        Search
                    </Button>
                </div>

                {loading && <p className="text-center text-gray-500">Loading...</p>}

                {unauthorized && (
                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-4 rounded-md flex flex-col items-center">
                        <FaLock className="text-red-500 text-2xl mb-2" />
                        <p className="text-lg font-semibold">You need to log in to view psychologists.</p>
                        <Button className="mt-3 bg-blue-500 text-white px-4 py-2 rounded" onPress={() => router.push('/login')}>
                            Go to Login
                        </Button>
                    </div>
                )}

                {!unauthorized && (
                    <div className="flex flex-col gap-4">
                        {psychologists.map((psychologist) => (
                            <div key={psychologist.id} className="bg-fifth-color shadow-2xl p-4 my-6 border-2 border-black rounded-xl">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="flex items-center gap-4 flex-1">
                                        <Avatar
                                            src={psychologist.imageUrl || '/default-avatar.png'}
                                            alt={psychologist.fullName}
                                            className="w-32 h-32 rounded-md object-cover border-2 border-blue-500"
                                        />
                                        <div>
                                            <h2 className="text-lg font-semibold flex items-center gap-1"><FaUserDoctor className='text-primary-blue' /> {psychologist.fullName}</h2>
                                            <p className="text-medium">{psychologist.specialization.name}</p>
                                        </div>
                                    </div>

                                    <div className="flex flex-col items-end">
                                        <div className="mb-2 text-right">
                                            <p className="flex font-semibold items-center gap-1">Rating: {psychologist.averageRating} <FaStar className='text-yellow-300' /></p>
                                            <p className="mt-1 font-semibold text-second-color">Price: {psychologist.sessionPrice.toLocaleString()} VND</p>
                                        </div>
                                        <div className="flex flex-col gap-2">
                                            <Button
                                                variant="bordered"
                                                className="w-32 text-sm bg-white"
                                                onPress={() => router.push(`/psychologists/details/${psychologist.id}`)}
                                            >
                                                View Detail
                                            </Button>
                                            <Button className="w-32 text-sm bg-purple-600">Book Now</Button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </>
    );
};

export default PsychologistPage;

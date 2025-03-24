'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useParams } from 'next/navigation';
import { Avatar, Button, Card, Divider } from '@heroui/react';
import { FaStar, FaUserDoctor, FaEnvelope } from "react-icons/fa6";

const BASE_URL = "https://localhost:7096/api/v1/identities/accounts/psychologists";

type Feedback = {
    rating: number;
    feedbackContent: string;
};

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
    email: string;
    imageUrl?: string;
    feedbacks: Feedback[];
};

const PsychologistDetailPage = () => {
    const { id } = useParams();
    const router = useRouter();
    const [psychologist, setPsychologist] = useState<Psychologist | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchPsychologist = async () => {
            try {
                const accessToken = localStorage.getItem('accessToken');
                const response = await fetch(`${BASE_URL}/${id}`, {
                    headers: {
                        Authorization: `Bearer ${accessToken || ''}`,
                        'Content-Type': 'application/json',
                    },
                });

                if (!response.ok) throw new Error('Failed to fetch psychologist details');

                const data = await response.json();
                setPsychologist(data);
                // eslint-disable-next-line @typescript-eslint/no-unused-vars
            } catch (err) {
                setError('Error fetching psychologist details.');
            } finally {
                setLoading(false);
            }
        };

        fetchPsychologist();
    }, [id]);

    if (loading) return <p className="text-center text-gray-500">Loading...</p>;
    if (error) return <p className="text-center text-red-500">{error}</p>;

    return (
        <div className="max-w-4xl mx-auto px-4 py-6">
            <div className='grid grid-cols-2 pb-6'> 
                <div className="flex items-center gap-6">
                    <Avatar
                        src={psychologist?.imageUrl || '/default-avatar.png'}
                        alt={psychologist?.fullName}
                        className="w-40 h-40 rounded-md object-cover border-2 border-black"
                    />
                    <div>
                        <h1 className="text-2xl font-semibold flex items-center gap-2">
                            <FaUserDoctor className='text-primary-blue'/> {psychologist?.fullName}
                        </h1>
                        <p className="text-lg text-gray-600">{psychologist?.specialization.name}</p>
                        <p className="flex items-center text-lg font-medium mt-1 gap-2">
                            <FaStar className="text-yellow-400" /> {psychologist?.averageRating.toFixed(1)}
                        </p>
                        <p className="text-lg font-semibold mt-2">
                            Phí tư vấn: {psychologist?.sessionPrice.toLocaleString()} VND
                        </p>
                        <p className="flex items-center gap-1 text-gray-600 mt-2">
                            <FaEnvelope /> {psychologist?.email}
                        </p>
                    </div>
                </div>
                <div className="flex items-end justify-end">
                    <Button variant='bordered' className="bg-purple-600 text-white px-6 py-2 rounded">Book Now</Button>
                </div>
            </div>

            <Divider className='h-2 bg-black my-6' />

            <div className='py-2'>
                <p className='text-xl font-bold'>Mô tả</p>
                <p>{psychologist?.bio}</p>
            </div>

            <div className="mt-6">
                <h2 className="text-xl font-semibold">Đánh giá</h2>
                <div className="mt-4 space-y-4">
                    {psychologist?.feedbacks.length ? (
                        psychologist.feedbacks.map((feedback, index) => (
                            <Card key={index} className="p-4 border rounded-md">
                                <p className="text-gray-700">{feedback.feedbackContent}</p>
                                <p className="text-sm text-gray-500 mt-1">Rating: {feedback.rating} <FaStar className="inline text-yellow-400" /></p>
                            </Card>
                        ))
                    ) : (
                        <p className="text-gray-500">No feedback available.</p>
                    )}
                </div>
            </div>

        </div>
    );
};

export default PsychologistDetailPage;

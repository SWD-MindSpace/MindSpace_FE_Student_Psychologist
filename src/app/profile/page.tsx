'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { Card, CardBody, CardHeader, Button, Avatar } from '@heroui/react';

const API_URL = 'https://localhost:7096/api/v1/identities/profile/';

interface UserProfile {
    email: string;
    fullName: string;
    phoneNumber: string | null;
    userName: string;
    dateOfBirth: string;
    imageUrl: string | null;
}

export default function Profile() {
    const { user, loading, logout } = useAuth();
    const router = useRouter();
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [error, setError] = useState('');

    useEffect(() => {
        if (!loading && !user) {
            router.push('/login');
            return;
        }

        if (user) {
            const fetchProfile = async () => {
                try {
                    const response = await fetch(API_URL, {
                        method: 'GET',
                        headers: {
                            Authorization: `Bearer ${user.accessToken}`,
                            'Content-Type': 'application/json',
                        },
                    });

                    if (!response.ok) throw new Error('Failed to fetch profile');

                    const data: UserProfile = await response.json();
                    setProfile(data);
                } catch (err) {
                    setError((err as Error).message);
                }
            };

            fetchProfile();
        }
    }, [user, loading, router]);

    if (loading) {
        return (
            <div className="flex items-center justify-center h-screen bg-gray-200">
                <p className="text-gray-600 text-lg">Loading...</p>
            </div>
        );
    }

    return (
        <div className="flex items-center justify-center h-screen bg-gradient-to-br from-blue-100 to-blue-400">
            <Card className="max-w-md w-full bg-white backdrop-blur-md shadow-2xl rounded-2xl p-8">
                <CardHeader className="text-2xl font-semibold font-bevnpro text-center text-gray-900">Profile</CardHeader>
                <CardBody className="flex flex-col items-center gap-6 font-bevnpro">
                    {error && <p className="text-red-500 text-sm text-center">{error}</p>}

                    {profile ? (
                        <>
                            <div className="relative">
                                <Avatar
                                    src={profile.imageUrl || '/default-avatar.png'}
                                    size="lg"
                                    className="border-4 border-white shadow-lg rounded-full"
                                />
                            </div>

                            <div className="text-center">
                                <p className="text-2xl font-bold text-gray-900">{profile.fullName}</p>
                                <p className="text-gray-600">@{profile.userName}</p>
                            </div>

                            <div className="w-full px-6 py-4 bg-white/60 rounded-lg shadow-md text-gray-700">
                                <p className="text-lg"><strong>Email:</strong> {profile.email}</p>
                                <p className="text-lg"><strong>Ngày sinh nhật:</strong> {new Date(profile.dateOfBirth).toLocaleDateString()}</p>
                            </div>

                            <Button onPress={logout} color="danger" className="py-2 text-lg font-semibold">
                                Logout
                            </Button>
                        </>
                    ) : (
                        <p className="text-center text-gray-600 text-lg">Loading profile...</p>
                    )}
                </CardBody>
            </Card>
        </div>
    );
}

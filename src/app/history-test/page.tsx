'use client';

import React, { useState, useEffect } from 'react';
import { Button, Card, CardBody, CardHeader, Spinner } from "@heroui/react";
import { useRouter } from 'next/navigation';
import { useAuth } from '../../context/AuthContext'; 

interface TestHistoryEntry {
    testId: string;
    title: string;
    date: string;
    totalScore: number;
    result: string;
}

export default function HistoryPage() {
    const router = useRouter();
    const { user, loading } = useAuth();
    const [history, setHistory] = useState<TestHistoryEntry[]>([]);

    useEffect(() => {
        if (loading) return;

        if (!user) {
            router.push('/login');
            return;
        }

        const userId = localStorage.getItem("userId") || "unknown";
        const historyKey = `test-history-${userId}`;
        const storedHistory = JSON.parse(localStorage.getItem(historyKey) || "[]");
        setHistory(storedHistory.reverse());
    }, [user, loading, router]);

    const handleClearHistory = () => {
        const userId = localStorage.getItem("userId") || "unknown";
        const historyKey = `test-history-${userId}`;
        localStorage.removeItem(historyKey);
        setHistory([]);
    };

    if (loading) {
        return (
            <div className="min-h-screen flex justify-center items-center">
                <Spinner size="lg" color="primary" />
            </div>
        );
    }

    if (!user) return null;

    return (
        <div className="min-h-screen px-4 py-6 bg-gray-50">
            <Card className="max-w-4xl mx-auto bg-white shadow-md rounded-lg p-4">
                <CardHeader className="text-xl font-semibold text-blue-700 text-center">
                    Lịch sử Bài Kiểm Tra
                </CardHeader>
                <CardBody className="text-gray-700 text-sm text-center">
                    {history.length === 0 ? (
                        <p className="text-center text-gray-500">Không có bài kiểm tra nào đã làm.</p>
                    ) : (
                        history.map((entry, index) => (
                            <div key={index} className="mb-3 p-3 bg-gray-100 rounded-md shadow-sm">
                                <p className="text-sm font-semibold">{entry.title}</p>
                                <p className="text-xs text-gray-500">Ngày làm: {entry.date}</p>
                                <p className="text-xs">Tổng điểm: {entry.totalScore}</p>
                                <p className="text-xs font-bold text-blue-700">Kết quả: {entry.result}</p>
                            </div>
                        ))
                    )}
                    {history.length > 0 && (
                        <div className="flex justify-center">
                            <Button color="danger" variant="flat" className="mt-4 w-1/2" onPress={handleClearHistory}>
                                Xóa lịch sử
                            </Button>
                        </div>
                    )}
                    <div className="flex justify-center">
                        <Button color="primary" className="mt-2 w-1/2" onPress={() => router.push('/')}>
                            Quay lại trang chủ
                        </Button>
                    </div>
                </CardBody>
            </Card>
        </div>
    );
}
'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button, Spinner, Card, CardBody, CardHeader, Divider } from "@heroui/react";
import toast, { Toaster } from 'react-hot-toast';

interface TestScoreRank {
    minScore: number;
    maxScore: number;
    result: string;
}

interface TestOption {
    id: number;
    score: number;
    displayedText: string;
}

interface Question {
    id: number;
    content: string;
}

interface Test {
    id: string;
    title: string;
    description: string;
    questions: Question[];
    testScoreRanks: TestScoreRank[];
    psychologyTestOptions: TestOption[];
}

export default function TestPage() {
    const { id } = useParams();
    const router = useRouter();
    const [test, setTest] = useState<Test | null>(null);
    const [answers, setAnswers] = useState<{ [key: number]: number }>({});
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const accessToken = localStorage.getItem("accessToken");
        if (!accessToken) {
            alert("Bạn cần đăng nhập để thực hiện bài kiểm tra.");
            router.push("/login");
            return;
        }

        const fetchTest = async () => {
            try {
                const response = await fetch(`https://localhost:7096/api/v1/tests/${id}`, {
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem("accessToken")}`,
                        'Content-Type': 'application/json',
                    },
                });
                if (!response.ok) throw new Error('Failed to fetch test');
                const data: Test = await response.json();
                setTest(data);
            } catch (error) {
                console.error('Error fetching test:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchTest();
    }, [id, router]);

    const handleSelect = (questionId: number, optionScore: number) => {
        setAnswers((prevAnswers) => ({
            ...prevAnswers,
            [questionId]: optionScore
        }));
    };

    const handleSubmit = () => {
        if (!test) return;

        const totalScore = Object.values(answers).reduce((sum, score) => sum + score, 0);
        const result = test.testScoreRanks.find(rank => totalScore >= rank.minScore && totalScore <= rank.maxScore)?.result || 'Không xác định';

        // Use user-specific key for test history
        const userId = localStorage.getItem("userId") || "unknown";
        const historyKey = `test-history-${userId}`;
        const history = JSON.parse(localStorage.getItem(historyKey) || "[]");
        const newEntry = {
            testId: test.id,
            title: test.title,
            date: new Date().toLocaleString(),
            totalScore,
            result,
        };
        localStorage.setItem(historyKey, JSON.stringify([...history, newEntry]));

        toast.success(`Kết quả của bạn: ${result}`, {
            duration: 5000,
            style: {
                fontWeight: 'bold',
                borderRadius: '10px',
                padding: '20px',
            },
        });

        router.push('/history-test');
    };

    if (loading) return <div className="flex justify-center py-10"><Spinner size="lg" color="primary" /></div>;
    if (!test) return <p className="text-center text-red-500 text-sm">Không tìm thấy bài kiểm tra</p>;

    return (
        <div className="min-h-screen px-4 py-6 bg-gray-50">
            <Toaster position="top-center" reverseOrder={false} />
            <Card className="max-w-2xl mx-auto bg-white shadow-md rounded-lg p-4">
                <CardHeader className="flex justify-center text-xl font-semibold text-blue-700">{test.title}</CardHeader>
                <CardBody className="text-gray-700 text-sm">
                    <p className="text-gray-600 text-center mb-4">{test.description}</p>
                    <Divider className="my-3" />
                    {test.questions.map((question) => (
                        <div key={question.id} className="mb-3 p-3 bg-gray-100 rounded-md shadow-sm">
                            <p className="text-sm font-medium">{question.content}</p>
                            <div className="mt-2 grid gap-3">
                                {test.psychologyTestOptions.map((option) => (
                                    <Button
                                        key={option.id}
                                        color={answers[question.id] === option.score ? 'danger' : 'default'}
                                        variant="flat"
                                        className="w-full text-xs py-2"
                                        onPress={() => handleSelect(question.id, option.score)}
                                    >
                                        {option.displayedText}
                                    </Button>
                                ))}
                            </div>
                        </div>
                    ))}
                    <Button color="success" variant="bordered" className="mt-4 w-full p-3 text-sm font-semibold" onPress={handleSubmit}>
                        Hoàn thành bài kiểm tra
                    </Button>
                </CardBody>
            </Card>
        </div>
    );
}
'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button, Spinner, Card, CardBody, CardHeader, Divider } from "@heroui/react";
import { useAuth } from '@/context/AuthContext';

interface TestScoreRank {
    minScore: number;
    maxScore: number;
    result: string;
}

interface TestOption {
    id: number;
    score?: number;
    displayedText: string;
}

interface Question {
    id: number;
    content: string;
    questionOptions: TestOption[];
}

interface Test {
    id?: number;
    title: string;
    description: string;
    questions: Question[];
    testScoreRanks: TestScoreRank[];
    psychologyTestOptions: TestOption[];
}

interface TestResponseItem {
    questionContent: string;
    score: number;
    answerText: string;
}

interface TestResponse {
    totalScore: number;
    testScoreRankResult?: string;
    studentId: number | null;
    parentId: number | null;
    testId?: number;
    testResponseItems: TestResponseItem[];
}

export default function TestPage() {
    const { id } = useParams();
    const router = useRouter();
    const { user } = useAuth();

    const [test, setTest] = useState<Test | null>(null);
    const [answers, setAnswers] = useState<{ [key: number]: TestOption }>({});
    const [loading, setLoading] = useState(true);
    const [studentId, setStudentId] = useState<number | null>(null);
    const [parentId, setParentId] = useState<number | null>(null);

    // Extract studentId or parentId from JWT token
    useEffect(() => {
        if (user?.accessToken) {
            try {
                const payloadBase64 = user.accessToken.split('.')[1];
                if (!payloadBase64) throw new Error("Invalid token format");

                const decodedPayload = JSON.parse(atob(payloadBase64));
                const userId = decodedPayload.sub ? parseInt(decodedPayload.sub) : null;
                const userRole = decodedPayload["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"]; // Fix role extraction

                if (!userId || !userRole) {
                    throw new Error("User ID or Role missing in token");
                }

                if (userRole === "Student") {
                    setStudentId(userId);
                } else if (userRole === "Parent") {
                    setParentId(userId);
                } else {
                    throw new Error("Unexpected role in token: " + userRole);
                }
            } catch (error) {
                console.error("Error decoding accessToken:", error);
            }
        }
    }, [user]);


    // Fetch test details
    useEffect(() => {
        const accessToken = localStorage.getItem("accessToken");
        if (!accessToken) {
            router.push("/login");
            return;
        }
        const fetchTest = async () => {
            try {
                const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/tests/${id}`, {
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

    // Handle answer selection
    const handleSelect = (questionId: number, option: TestOption) => {
        setAnswers((prevAnswers) => ({
            ...prevAnswers,
            [questionId]: option
        }));
    };

    // Handle test submission
    const handleSubmit = async () => {
        if (!test || (!studentId && !parentId)) return; // Ensure at least one ID is set

        // Calculate total score
        const totalScore = Object.values(answers).reduce((sum, option) => sum + (option.score || 0), 0);
        const result = test.testScoreRanks.find(rank => totalScore >= rank.minScore && totalScore <= rank.maxScore)?.result || undefined;

        // Create testResponseItems from answers
        const testResponseItems: TestResponseItem[] = Object.entries(answers).map(([questionId, option]) => {
            const question = test.questions.find(q => q.id === Number(questionId));
            return {
                questionContent: question?.content || "",
                score: option.score || 0,
                answerText: option.displayedText
            };
        });

        // Create testResponse payload
        const testResponse: TestResponse = {
            totalScore,
            testScoreRankResult: result,
            studentId: studentId || null, // Send only if student
            parentId: parentId || null, // Send only if parent
            testId: test.id,
            testResponseItems
        };

        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/test-responses`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem("accessToken")}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(testResponse),
            });

            const locationUrl = response.headers.get('Location');
            if (!locationUrl) throw new Error('Location header not found');

            const testResponseId = locationUrl.split('/').pop();
            if (!testResponseId) throw new Error("Invalid response location");

            router.push(`/test-responses/${testResponseId}`);
        } catch (error) {
            console.error('Error saving test response:', error);
            alert('Có lỗi khi lưu kết quả bài kiểm tra');
        }

        alert(result ? `Kết quả của bạn: ${result}` : 'Đã hoàn thành bài khảo sát');
    };

    if (loading) return <div className="flex justify-center py-10"><Spinner size="lg" color="primary" /></div>;
    if (!test) return <p className="text-center text-red-500 text-sm">Không tìm thấy bài kiểm tra</p>;

    return (
        <div className="min-h-screen px-4 py-6 bg-gray-50">
            <Card className="max-w-2xl mx-auto bg-white shadow-md rounded-lg p-4">
                <CardHeader className="flex justify-center text-xl font-semibold text-blue-700">{test.title}</CardHeader>
                <CardBody className="text-gray-700 text-sm">
                    <p className="text-gray-600 text-center mb-4">{test.description}</p>
                    <Divider className="my-3" />
                    {test.questions.map((question) => (
                        <div key={question.id} className="mb-3 p-3 bg-gray-100 rounded-md shadow-sm">
                            <p className="text-sm font-medium">{question.content}</p>
                            <div className="mt-2 grid gap-3">
                                {(test.psychologyTestOptions.length > 0
                                    ? test.psychologyTestOptions
                                    : question.questionOptions).map((option) => (
                                        <Button
                                            key={option.id}
                                            color={answers[question.id]?.id === option.id ? 'primary' : 'default'}
                                            variant="flat"
                                            className="w-full text-xs py-2"
                                            onPress={() => handleSelect(question.id, option)}
                                        >
                                            {option.displayedText}
                                        </Button>
                                    ))}
                            </div>
                        </div>
                    ))}
                    <Button
                        color="success"
                        variant="bordered"
                        className="mt-4 w-full p-3 text-sm font-semibold"
                        onPress={handleSubmit}
                        disabled={!studentId && !parentId} // Ensure either student or parent is set
                    >
                        Hoàn thành bài kiểm tra
                    </Button>
                </CardBody>
            </Card>
        </div>
    );
}

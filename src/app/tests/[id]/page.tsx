'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button, Spinner, Card, CardBody, CardHeader, Divider } from "@heroui/react";

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
    studentId: number;
    parentId: number | null;
    testId?: number;
    testResponseItems: TestResponseItem[];
}

export default function TestPage() {
    const { id } = useParams();
    const router = useRouter();
    const [test, setTest] = useState<Test | null>(null);
    const [answers, setAnswers] = useState<{ [key: number]: TestOption }>({});
    const [loading, setLoading] = useState(true);

    useEffect(() => {
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
    }, [id]);

    const handleSelect = (questionId: number, option: TestOption) => {
        setAnswers((prevAnswers) => ({
            ...prevAnswers,
            [questionId]: option
        }));
    };

    const handleSubmit = async () => {
        if (!test) return;

        // Tính tổng score
        const totalScore = Object.values(answers).reduce((sum, option) => sum + (option.score || 0), 0);
        const result = test.testScoreRanks.find(rank => totalScore >= rank.minScore && totalScore <= rank.maxScore)?.result || undefined;

        // Tạo testResponseItems từ answers
        const testResponseItems: TestResponseItem[] = Object.entries(answers).map(([questionId, option]) => {
            const question = test.questions.find(q => q.id === Number(questionId));
            return {
                questionContent: question?.content || "",
                score: option.score || 0,
                answerText: option.displayedText
            };
        });

        // Tạo dữ liệu testResponse
        const testResponse: TestResponse = {
            totalScore,
            testScoreRankResult: result,
            studentId: 1, // lay tu access token
            parentId: null,
            testId: test.id,
            testResponseItems
        };
        // Gửi request POST để lưu testResponse
        try {
            const response = await fetch('https://localhost:7096/api/v1/test-responses', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem("accessToken")}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(testResponse),
            });
            const locationUrl = response.headers.get('Location');
            console.log(locationUrl)
            if (!locationUrl) throw new Error('Location header not found');
            router.push(new URL(locationUrl).pathname); // chinh lai di toi trang test detail by id
        } catch (error) {
            console.error('Error saving test response:', error);
            alert('Có lỗi khi lưu kết quả bài kiểm tra');
        }
        const msg = `Kết quả của bạn: ${result}`;
        result == undefined ? alert('Đã hoàn thành bài khảo sát') : alert(msg);

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
                    >
                        Hoàn thành bài kiểm tra
                    </Button>
                </CardBody>
            </Card>
        </div>
    );
}

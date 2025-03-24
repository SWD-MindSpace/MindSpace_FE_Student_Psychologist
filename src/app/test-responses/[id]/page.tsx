"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button, Spinner, Card, CardBody, CardHeader, Divider } from "@heroui/react";

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

export default function TestResponseDetail() {
    const { id } = useParams();
    const router = useRouter();
    const [testResponse, setTestResponse] = useState<TestResponse | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchTestResponse = async () => {
            try {
                const response = await fetch(`https://localhost:7096/api/v1/test-responses/${id}`, {
                    method: "GET",
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
                        "Content-Type": "application/json",
                    },
                });
                if (!response.ok) throw new Error("Failed to fetch test response");
                const data: TestResponse = await response.json();
                setTestResponse(data);
            } catch (error) {
                console.error("Error fetching test response:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchTestResponse();
    }, [id]);

    if (loading) return <div className="flex justify-center py-10"><Spinner size="lg" color="primary" /></div>;
    if (!testResponse) return <p className="text-center text-red-500 text-sm">Không tìm thấy kết quả bài kiểm tra</p>;

    return (
        <div className="min-h-screen px-4 py-6 bg-gray-50">
            <Card className="max-w-2xl mx-auto bg-white shadow-md rounded-lg p-4">
                <CardHeader className="text-center text-xl font-semibold text-blue-700">
                    Kết Quả Bài Kiểm Tra
                </CardHeader>
                <CardBody className="text-gray-700 text-sm">
                    <p className="text-center text-gray-600">Tổng điểm: <strong>{testResponse.totalScore}</strong></p>
                    {testResponse.testScoreRankResult && (
                        <p className="text-center text-lg font-semibold text-green-600">
                            Kết quả: {testResponse.testScoreRankResult}
                        </p>
                    )}
                    <Divider className="my-3" />
                    {testResponse.testResponseItems.map((item, index) => (
                        <div key={index} className="mb-3 p-3 bg-gray-100 rounded-md shadow-sm">
                            <p className="text-sm font-medium">{item.questionContent}</p>
                            <p className="text-xs text-gray-500">Điểm: {item.score}</p>
                            <p className="text-xs font-semibold">Câu trả lời: {item.answerText}</p>
                        </div>
                    ))}
                    <div className="flex justify-center gap-4 font-noto-sans">
                        <Button color="primary" className="mt-4" onPress={() => router.push("/")}>
                            Quay lại trang chủ
                        </Button>
                        <Button color="secondary" className="mt-4" onPress={() => router.push("/psychologists")}>
                            Đặt một cuộc hẹn với nhà tâm lý
                        </Button>
                    </div>
                </CardBody>
            </Card>
        </div>
    );
}

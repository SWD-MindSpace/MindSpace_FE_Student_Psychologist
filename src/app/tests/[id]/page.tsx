"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button, Spinner, Card, CardBody, CardHeader, Divider } from "@heroui/react";
import { useAuth } from "@/context/AuthContext";
import { toast, Toaster } from "react-hot-toast";

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

  useEffect(() => {
    const accessToken = localStorage.getItem("accessToken");
    if (!accessToken) {
      router.push("/login");
      return;
    }

    try {
      const payloadBase64 = accessToken.split(".")[1];
      if (!payloadBase64) throw new Error("Invalid token format");

      const decodedPayload = JSON.parse(atob(payloadBase64));
      const userId = decodedPayload.sub ? parseInt(decodedPayload.sub) : null;
      const userRole = decodedPayload["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"];

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
      router.push("/login");
    }
  }, [router]);

  useEffect(() => {
    const fetchTest = async () => {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/tests/${id}`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
            "Content-Type": "application/json",
          },
        });
        if (!response.ok) throw new Error("Failed to fetch test");
        const data: Test = await response.json();
        setTest(data);
      } catch (error) {
        console.error("Error fetching test:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchTest();
  }, [id, router]);

  const handleSelect = (questionId: number, option: TestOption) => {
    setAnswers((prevAnswers) => ({
      ...prevAnswers,
      [questionId]: option,
    }));
  };

  const handleSubmit = async () => {
    if (!test || (!studentId && !parentId)) {
      toast.error("Vui lòng đăng nhập để hoàn thành bài kiểm tra");
      return;
    }

    if (Object.keys(answers).length !== test.questions.length) {
      toast.error("Vui lòng trả lời tất cả các câu hỏi");
      return;
    }

    const totalScore = Object.values(answers).reduce((sum, option) => sum + (option.score || 0), 0);
    const result =
      test.testScoreRanks.find((rank) => totalScore >= rank.minScore && totalScore <= rank.maxScore)?.result ||
      undefined;

    const testResponseItems: TestResponseItem[] = Object.entries(answers).map(([questionId, option]) => {
      const question = test.questions.find((q) => q.id === Number(questionId));
      return {
        questionContent: question?.content || "",
        score: option.score || 0,
        answerText: option.displayedText,
      };
    });

    const testResponse: TestResponse = {
      totalScore,
      testScoreRankResult: result,
      studentId: studentId || null,
      parentId: parentId || null,
      testId: test.id,
      testResponseItems,
    };

    try {
      const accessToken = localStorage.getItem("accessToken");
      if (!accessToken) {
        throw new Error("Access token not found");
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/test-responses`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(testResponse),
      });

      if (!response.ok) {
        throw new Error("Failed to submit test response");
      }

      const locationUrl = response.headers.get("Location");
      if (!locationUrl) throw new Error("Location header not found");

      const testResponseId = locationUrl.split("/").pop();
      if (!testResponseId) throw new Error("Invalid response location");

      toast.success(result ? `Kết quả của bạn: ${result}` : "Đã hoàn thành bài khảo sát", {
        duration: 3000,
      });

      setTimeout(() => {
        router.push(`/test-responses/${testResponseId}`);
      }, 1000);
    } catch (error) {
      console.error("Error saving test response:", error);
      toast.error("Có lỗi khi lưu kết quả bài kiểm tra. Vui lòng thử lại.");
    }
  };

  if (loading)
    return (
      <div className="flex justify-center py-10">
        <Spinner size="lg" color="primary" />
      </div>
    );
  if (!test) return <p className="text-center text-red-500 text-sm">Không tìm thấy bài kiểm tra</p>;

  return (
    <div className="min-h-screen px-4 py-6 bg-gray-50">
      <Toaster />
      <Card className="max-w-2xl mx-auto bg-seventh-color shadow-md rounded-lg p-4">
        <CardHeader className="flex justify-center text-xl font-semibold text-blue-700">{test.title}</CardHeader>
        <CardBody className="text-sm">
          <p className="text-black text-center mb-4">{test.description}</p>
          <Divider className="my-3 h-1" />
          {test.questions.map((question) => (
            <div key={question.id} className="mb-8 p-4 bg-gray-100 rounded-md shadow-sm">
              <p className="text-sm font-medium">{question.content}</p>
              <div className="mt-2 grid gap-3">
                {(test.psychologyTestOptions.length > 0 ? test.psychologyTestOptions : question.questionOptions).map(
                  (option) => (
                    <Button
                      key={option.id}
                      color={answers[question.id]?.id === option.id ? "secondary" : "default"}
                      variant="flat"
                      className="w-full text-xs py-2"
                      onPress={() => handleSelect(question.id, option)}
                    >
                      {option.displayedText}
                    </Button>
                  )
                )}
              </div>
            </div>
          ))}
          <div className="flex justify-center mt-4">
            <Button variant="solid" className="w-full max-w-xs p-3 text-sm font-semibold bg-green-500" onPress={handleSubmit}>
              Hoàn thành bài kiểm tra
            </Button>
          </div>
        </CardBody>
      </Card>
    </div>
  );
}

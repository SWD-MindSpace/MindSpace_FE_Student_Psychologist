"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardBody, CardHeader, Button, Spinner, Divider, CardFooter, Image } from "@heroui/react";
import { Toaster, toast } from "react-hot-toast";
import MotionHeading from "@/components/MotionHeading";
import { useAuth } from "@/context/AuthContext";
import { LuNotebookPen } from "react-icons/lu";

type Test = {
  id: number;
  title: string;
  testCode: string;
  testCategory: {
    id: number;
    name: string;
  };
  specialization: {
    id: number;
    name: string;
  };
  targetUser: string;
  description: string;
  questionCount: number;
  price: number;
  author: {
    id: number;
    fullName: string;
    email: string;
  };
  dueDate?: string;
};

export default function AllTests() {
  const { user } = useAuth();
  const [tests, setTests] = useState<Test[]>([]);
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [error, setError] = useState("");
  const router = useRouter();

  const fetchTests = async () => {
    try {
      if (!user?.studentId) {
        throw new Error("Student ID not found");
      }

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/tests?Title=&TestCode=&TargetUser=&MinPrice=&MaxPrice=&TestCategoryId=&SpecializationId=&Sort=&PageIndex=1&PageSize=10&ExcludeFromCompletedTest=true&StudentId=${user.studentId}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch tests");
      }

      const data = await response.json();
      setTests(data.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch tests");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const storedRole = localStorage.getItem("userRole");
    setUserRole(storedRole);
    fetchTests();
  }, [user?.studentId]);

  const handleStartTest = (testId: number) => {
    const accessToken = localStorage.getItem("accessToken");
    console.log(accessToken);


    if (!accessToken) {
      toast.error("Please login to start the test!", {
        duration: 3000,
        style: {
          background: "#f87171",
          color: "#fff",
          fontWeight: "bold",
          padding: "20px",
          borderRadius: "10px",
        },
      });
      return;
    }

    router.push(`/tests/${testId}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex justify-center items-center">
        <Spinner size="lg" color="primary" />
      </div>
    );
  }

  if (error) return <div>Error: {error}</div>;

  // Define displayed tests based on user role
  let displayedTests: Test[] = [];
  let psychologicalTests: Test[] = [];
  let periodicTests: Test[] = [];

  if (!userRole) {
    // If not logged in → Show "Parent" & "Student" tests (excluding "Periodic")
    displayedTests = tests.filter(
      (test) => (test.targetUser === "Parent" || test.targetUser === "Student") && test.testCategory.name !== "Periodic"
    );
  } else if (userRole === "Student") {
    // If logged in as Student → Separate Psychological and Periodic tests
    psychologicalTests = tests.filter((test) => test.testCategory.name === "Psychological");
    periodicTests = tests.filter((test) => test.testCategory.name === "Periodic");
  } else if (userRole === "Parent") {
    // If logged in as Parent → Show only "Parenting" tests
    displayedTests = tests.filter((test) => test.testCategory.name === "Parenting");
  }

  return (
    <div className="min-h-screen p-6 bg-gray-100">
      <Toaster position="top-center" reverseOrder={false} />
      <MotionHeading className="flex justify-center mb-6">
        <Image
          src="https://res.cloudinary.com/ddewgbug1/image/upload/v1742236899/ktakxftbqjdcn59g8y1l.jpg"
          alt="hello"
          width={1400}
          height={550}
          shadow="md"
          isBlurred
        />
      </MotionHeading>
      <div className="mt-16">
        <MotionHeading className="text-center mb-4">Sự thay đổi có thể bắt đầu bằng một bước duy nhất</MotionHeading>
        <MotionHeading className="font-normal text-center text-xl font-noto-sans" delay={0.5}>
          Các bài kiểm tra sức khỏe tâm thần trực tuyến của chúng tôi có thể giúp bạn hiểu được cảm xúc của mình và có
          thể là bước đầu tiên để nhận được sự trợ giúp phù hợp.
        </MotionHeading>
      </div>
      <Divider className="my-10 w-1/2 mx-auto" />

      {/* If user is a Student, show Psychological & Periodic separately */}
      {userRole === "Student" ? (
        <>
          {/* Psychological Tests */}
          {psychologicalTests.length > 0 && (
            <>
              <MotionHeading className="text-center mb-6 flex items-center justify-center gap-2"><LuNotebookPen /> Các bài kiểm tra tâm lí</MotionHeading>
              <div className="grid md:grid-cols-3 gap-6 font-noto-sans">
                {psychologicalTests.map((test) => (
                  <Card key={test.id} className="bg-white shadow-md hover:scale-105 transition-transform">
                    <CardHeader className="text-xl font-bold font-bevnpro bg-first-color h-[80px]">
                      {test.title}
                    </CardHeader>
                    <CardBody className="px-6">
                      <p className="font-semibold text-2xl pb-2">{test.testCode}</p>
                      <p className="text-gray-600 text-lg">{test.description}</p>
                    </CardBody>
                    <CardFooter className="px-6">
                      <Button
                        variant="shadow"
                        className="mt-3 w-fit p-5 bg-second-color"
                        onPress={() => handleStartTest(test.id)}
                      >
                        Làm bài test
                      </Button>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            </>
          )}

          {/* Periodic Tests */}
          {periodicTests.length > 0 && (
            <>
              <Divider className="my-10 w-1/2 mx-auto" />
              <MotionHeading className="text-center mb-6">Periodic Tests</MotionHeading>
              <div className="grid grid-cols-2 gap-6">
                {periodicTests.map((test) => (
                  <Card key={test.id} className="p-6 bg-yellow-50 shadow-md hover:shadow-lg transition duration-300">
                    <CardHeader className="text-xl font-bold">{test.title}</CardHeader>
                    <CardBody>
                      <p className="text-black text-lg font-semibold">{test.testCode}</p>
                      <p className="text-gray-600 text-lg">{test.description}</p>
                      <Button
                        color="success"
                        variant="shadow"
                        className="mt-3 w-fit p-5"
                        onPress={() => handleStartTest(test.id)}
                      >
                        Take Test
                      </Button>
                    </CardBody>
                  </Card>
                ))}
              </div>
            </>
          )}
        </>
      ) : // For other users (Not logged in or Parent)
        displayedTests.length === 0 ? (
          <p className="text-center text-lg font-semibold text-gray-600">No tests available.</p>
        ) : (
          <div className="grid md:grid-cols-3 gap-6">
            {displayedTests.map((test) => (
              <Card key={test.id} className="bg-white shadow-md hover:shadow-lg transition duration-300">
                <CardHeader className="text-xl font-bevnpro font-bold bg-first-color h-[80px]">{test.title}</CardHeader>
                <CardBody className="px-6 font-noto-sans">
                  <p className="text-2xl font-semibold">{test.testCode}</p>
                  <p className="text-gray-600 text-lg">{test.description}</p>
                </CardBody>
                <CardFooter className="px-6">
                  <Button
                    variant="shadow"
                    className="mt-3 w-fit p-5 bg-second-color"
                    onPress={() => handleStartTest(test.id)}
                  >
                    Take Test
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
    </div>
  );
}

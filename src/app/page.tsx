'use client';

import Link from "next/link";
import { FaBrain, FaHeart, FaHandsHelping } from "react-icons/fa";
import { Card, CardBody, CardHeader, Image, Button } from "@heroui/react";

export default function Home() {
    const psychologists = [
        { id: 1, name: "Dr. Emily Carter", specialty: "Cognitive Behavioral Therapy", image: "https://randomuser.me/api/portraits/men/7.jpg" },
        { id: 2, name: "Dr. James Smith", specialty: "Mindfulness & Stress Reduction", image: "https://randomuser.me/api/portraits/men/8.jpg" },
        { id: 3, name: "Dr. Sophia Lee", specialty: "Child & Adolescent Psychology", image: "https://randomuser.me/api/portraits/men/9.jpg" },
    ];

    return (
        <div className="min-h-screen bg-gray-100">
            {/* Hero Section */}
            <section className="bg-blue-900 text-white py-20 text-center">
                <h1 className="text-4xl font-bold">Welcome to MindSpace</h1>
                <p className="mt-4 text-lg">Your journey to mental well-being starts here.</p>
                <Link href="/appointments">
                    <Button color="primary" variant="solid" className="mt-6">Book an Appointment</Button>
                </Link>
            </section>

            {/* Features */}
            <section className="container mx-auto my-12 grid grid-cols-1 md:grid-cols-3 gap-8 px-6">
                {[
                    { icon: <FaBrain className="text-blue-700 text-4xl" />, title: "Expert Guidance", text: "Our specialists provide professional and personalized care." },
                    { icon: <FaHeart className="text-red-500 text-4xl" />, title: "Compassionate Support", text: "We prioritize your emotional well-being." },
                    { icon: <FaHandsHelping className="text-green-600 text-4xl" />, title: "Community Programs", text: "Join support groups and workshops tailored for you." }
                ].map((feature, index) => (
                    <Card key={index} shadow="md">
                        <CardBody className="text-center">
                            <div className="mb-4">{feature.icon}</div>
                            <h3 className="text-xl font-semibold">{feature.title}</h3>
                            <p className="text-gray-600">{feature.text}</p>
                        </CardBody>
                    </Card>
                ))}
            </section>

            {/* Psychologists Section */}
            <section className="container mx-auto my-12 px-6">
                <h2 className="text-3xl font-bold text-center text-gray-800 mb-8">Meet Our Psychologists</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {psychologists.map((psychologist) => (
                        <Card key={psychologist.id} shadow="md">
                            <CardHeader className="flex justify-center">
                                <Image
                                    src={psychologist.image}
                                    alt={psychologist.name}
                                    width={300}
                                    height={200}
                                    className="rounded-lg object-cover"
                                />
                            </CardHeader>
                            <CardBody className="text-center">
                                <h3 className="text-xl font-semibold">{psychologist.name}</h3>
                                <p className="text-gray-600">{psychologist.specialty}</p>
                            </CardBody>
                        </Card>
                    ))}
                </div>
            </section>
        </div>
    );
}

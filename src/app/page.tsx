'use client';

import Link from "next/link";
import { FaBrain, FaHeart, FaHandsHelping, FaCheckCircle } from "react-icons/fa";
import { Card, CardBody, CardHeader, Image, Button, Divider } from "@heroui/react";

export default function Home() {
    const psychologists = [
        { id: 1, name: "Dr. Emily Carter", specialty: "Cognitive Behavioral Therapy", image: "https://randomuser.me/api/portraits/women/7.jpg" },
        { id: 2, name: "Dr. James Smith", specialty: "Mindfulness & Stress Reduction", image: "https://randomuser.me/api/portraits/men/8.jpg" },
        { id: 3, name: "Dr. Sophia Lee", specialty: "Child & Adolescent Psychology", image: "https://randomuser.me/api/portraits/women/9.jpg" },
    ];

    return (
        <div className="min-h-screen bg-gray-50 text-gray-800">
            {/* Hero Section */}
            <section className="bg-secondary-blue text-white py-24 text-center">
                <h1 className="text-5xl font-extrabold">Welcome to MindSpace</h1>
                <p className="mt-4 text-xl">Your journey to mental well-being starts here.</p>
                <Link href="/appointments">
                    <Button className="mt-6 px-8 py-3 text-lg font-semibold shadow-lg transition-transform hover:scale-105">
                        Book an Appointment
                    </Button>
                </Link>
            </section>

            {/* Features */}
            <section className="container mx-auto my-36 px-6 grid grid-cols-1 md:grid-cols-3 gap-8">
                {[
                    { icon: <FaBrain className="text-blue-600 text-5xl mb-4" />, title: "Expert Guidance", text: "Our specialists provide professional and personalized care." },
                    { icon: <FaHeart className="text-red-500 text-5xl mb-4" />, title: "Compassionate Support", text: "We prioritize your emotional well-being." },
                    { icon: <FaHandsHelping className="text-green-600 text-5xl mb-4" />, title: "Community Programs", text: "Join support groups and workshops tailored for you." }
                ].map((feature, index) => (
                    <Card key={index} shadow="lg" className="p-6 text-center transition-all hover:shadow-2xl hover:scale-105">
                        <CardBody>
                            {feature.icon}
                            <h3 className="text-2xl font-semibold mt-2">{feature.title}</h3>
                            <p className="text-gray-600 mt-2">{feature.text}</p>
                        </CardBody>
                    </Card>
                ))}
            </section>

            {/* Scale & Expand Section */}
            <section className="container mx-auto my-24 px-6 flex flex-col md:flex-row items-center gap-12">
                {/* Image */}
                <div className="w-full md:w-1/2">
                    <Image
                        src="https://oasiseducation.com/wp-content/uploads/2024/02/Scale-Expand-Mental-Health-Services.jpg"
                        alt="Mental Health Support"
                        width={600}
                        height={400}
                        className="rounded-lg shadow-lg"
                    />
                </div>

                {/* Text Content */}
                <div className="w-full md:w-1/2">
                    <h2 className="text-4xl font-bold">Scale & Expand Mental Health Services</h2>
                    <p className="text-gray-600 mt-4">
                        Oasis eliminates wait times for mental health support and reduces overwhelming caseloads for counseling center staff.
                    </p>
                    <ul className="mt-6 space-y-3">
                        {[
                            "24/7 Support Counseling",
                            "Same-Day Appointments",
                            "Monitored Peer Support Forum",
                            "Professionally Developed Courses",
                            "Evidence-Based Articles & Videos",
                            "Teletherapy (No Insurance Needed)"
                        ].map((item, index) => (
                            <li key={index} className="flex items-center text-lg">
                                <FaCheckCircle className="text-green-600 mr-2" /> {item}
                            </li>
                        ))}
                    </ul>
                </div>
            </section>

            {/* Psychologists Section */}
            <section className="container mx-auto my-36 px-6">
                <h2 className="text-4xl font-bold text-center mb-8">Meet Our Psychologists</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {psychologists.map((psychologist) => (
                        <Card key={psychologist.id} shadow="lg" className="transition-transform hover:scale-105">
                            <CardHeader className="flex justify-center">
                                <Image
                                    src={psychologist.image}
                                    alt={psychologist.name}
                                    width={150}
                                    height={150}
                                    className="rounded-full object-cover border-4 border-blue-500 shadow-md"
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

            <section className="container mx-auto my-24 px-6">
                {/* Heading & Divider */}
                <div className="text-center leading-relaxed space-y-4">
                    <h1 className="text-4xl">Supporting <strong>Faculty & Staff</strong></h1>
                    <p className="text-gray-600 text-lg">
                        Oasis provides unique content, tools, guides, and training for your faculty and staff.
                    </p>
                    <Divider className="w-1/2 mx-auto border-gray-400" />
                </div>

                {/* Features Grid */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mt-8">
                    {[
                        { icon: <FaBrain className="text-blue-600 text-5xl mb-4" />, title: "Expert Guidance", text: "Our specialists provide professional and personalized care." },
                        { icon: <FaHeart className="text-red-500 text-5xl mb-4" />, title: "Compassionate Support", text: "We prioritize your emotional well-being." },
                        { icon: <FaHandsHelping className="text-green-600 text-5xl mb-4" />, title: "Community Programs", text: "Join support groups and workshops tailored for you." },
                        { icon: <FaCheckCircle className="text-purple-500 text-5xl mb-4" />, title: "Training Resources", text: "Access professional training and development courses." }
                    ].map((feature, index) => (
                        <Card key={index} shadow="lg" className="p-6 text-center transition-all hover:shadow-2xl hover:scale-105">
                            <CardBody>
                                {feature.icon}
                                <h3 className="text-2xl font-semibold mt-2">{feature.title}</h3>
                                <p className="text-gray-600 mt-2">{feature.text}</p>
                            </CardBody>
                        </Card>
                    ))}
                </div>
            </section>
            
            <Divider className="w-1/2 mx-auto mb-10 h-1 bg-blue-200"/>

            <section className="container mx-auto mb-10 px-6 text-center">
                {/* Section Title */}
                <h2 className="text-4xl font-bold">Why Students Love Oasis</h2>
                <p className="text-gray-600 mt-4 text-lg">Hear from students who have benefited from our support and services.</p>

                {/* Scrollable Reviews */}
                <div className="mt-10 overflow-x-auto">
                    <div className="flex space-x-6 w-max">
                        {[
                            { name: "Sophia Johnson", comment: "Oasis changed my life! I finally found the support I needed.", image: "https://randomuser.me/api/portraits/women/10.jpg", rating: 5 },
                            { name: "Daniel Kim", comment: "The peer support forum helped me connect with others.", image: "https://randomuser.me/api/portraits/men/11.jpg", rating: 4 },
                            { name: "Ava Martinez", comment: "Same-day appointments were a game changer!", image: "https://randomuser.me/api/portraits/women/12.jpg", rating: 5 },
                            { name: "Ethan Brown", comment: "Oasis made mental health support so accessible!", image: "https://randomuser.me/api/portraits/men/13.jpg", rating: 4 },
                            { name: "Ethan Brown", comment: "Oasis made mental health support so accessible!", image: "https://randomuser.me/api/portraits/men/13.jpg", rating: 4 },
                            { name: "Ethan Brown", comment: "Oasis made mental health support so accessible!", image: "https://randomuser.me/api/portraits/men/13.jpg", rating: 4 },
                            { name: "Ethan Brown", comment: "Oasis made mental health support so accessible!", image: "https://randomuser.me/api/portraits/men/13.jpg", rating: 4 },
                        ].map((student, index) => (
                            <div key={index} className="bg-white shadow-lg rounded-lg p-6 w-80 text-left flex-shrink-0">
                                <div className="flex items-center gap-4">
                                    <Image src={student.image} alt={student.name} className="w-14 h-14 rounded-full border-2 border-blue-500" />
                                    <div>
                                        <h3 className="text-lg font-semibold">{student.name}</h3>
                                        <div className="text-yellow-400">
                                            {"★".repeat(student.rating)}{"☆".repeat(5 - student.rating)}
                                        </div>
                                    </div>
                                </div>
                                <p className="mt-4 text-gray-700">{student.comment}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>
        </div>
    );
}

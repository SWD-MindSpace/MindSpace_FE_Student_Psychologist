'use client';

import React from 'react';
import { Button, Card, CardBody, CardHeader, Divider, Image } from '@heroui/react';
import { FaUsers, FaRocket } from 'react-icons/fa';

export default function AboutPage() {
    return (
        <div className="min-h-screen pt-12 bg-gray-100 text-gray-800">
            <div className="max-w-5xl mx-auto">
                <section className="max-w-5xl mx-auto px-4 py-12">
                  
                    <h1 className="text-5xl text-center font-bold mb-10">About Us</h1>

                
                    <div className="flex flex-col md:flex-row items-start gap-8">
                    
                        <div className="w-full">
                            <Image
                                src="https://media.istockphoto.com/id/1443245439/photo/business-meeting-businesswoman-woman-office-portrait-job-career-happy-businessman-teamwork.jpg?s=612x612&w=0&k=20&c=1ZR02c1UKfGdBCNWzzKlrwrVZuEiOqnAKcKF4V_t038="
                                alt="Business team meeting"
                                width={600}
                                height={400}
                                radius="lg"
                                shadow="md"
                                isBlurred
                                isZoomed
                            />
                        </div>

                       
                        <div className="w-full">
                            <p className="mt-4 leading-10 text-xl">
                                At <strong>MindSpace</strong>, we believe every student deserves a supportive environment for their mental well-being.
                                Our mission is to bridge the gap in psychological health support within Vietnamese schools by providing an accessible,
                                data-driven, and student-friendly digital platform.
                            </p>
                        </div>
                    </div>
                </section>
                <Divider className='h-1 bg-gray-500'/>
               
                <section className="my-20">
                    <h2 className="text-4xl font-semibold flex items-center gap-2 justify-center">
                        <FaUsers className="text-blue-500" /> Who We Are
                    </h2>
                    <p className="mt-2 leading-relaxed text-center">
                        MindSpace is a team of professionals dedicated to enhancing student mental health through technology.
                    </p>

                  
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
                        {[
                            { name: "Duy", role: "BE", image: "https://randomuser.me/api/portraits/men/1.jpg" },
                            { name: "P.Dat", role: "BE", image: "https://randomuser.me/api/portraits/men/2.jpg" },
                            { name: "Hoa", role: "BE", image: "https://randomuser.me/api/portraits/men/3.jpg" },
                            { name: "Duyen", role: "FE", image: "https://randomuser.me/api/portraits/men/4.jpg" },
                            { name: "Quan", role: "FE", image: "https://randomuser.me/api/portraits/men/5.jpg" },
                            { name: "T.Dat", role: "FE", image: "https://randomuser.me/api/portraits/men/6.jpg" }
                        ].map((member, index) => (
                            <div key={index} className="flex flex-col items-center bg-white shadow-md p-4 rounded-lg border border-gray-200">
                                <Image
                                    src={member.image}
                                    alt={member.name}
                                    className="w-24 h-24 rounded-full object-cover mb-3"
                                />
                                <h3 className="font-semibold text-lg">{member.name}</h3>
                                <p className="text-gray-600">{member.role}</p>
                            </div>
                        ))}
                    </div>
                </section>
                
                <Divider className='h-1 bg-gray-500'/>

              
                <section className="my-20">
                    <h2 className="text-4xl font-semibold flex items-center gap-2 justify-center">
                        <FaRocket className="text-red-500" /> Why MindSpace?
                    </h2>

                    <div className="grid md:grid-cols-2 lg:grid-cols-2 gap-6 mt-4">
                        <Card className="shadow-md border border-gray-200">
                            <CardHeader className="font-semibold text-lg">School-Focused Solution</CardHeader>
                            <CardBody>
                                Designed specifically for educational environments.
                            </CardBody>
                        </Card>

                        <Card className="shadow-md border border-gray-200">
                            <CardHeader className="font-semibold text-lg">Efficient Digital Management</CardHeader>
                            <CardBody>
                                Replaces outdated manual records with a streamlined system.
                            </CardBody>
                        </Card>

                        <Card className="shadow-md border border-gray-200">
                            <CardHeader className="font-semibold text-lg">Direct Professional Support</CardHeader>
                            <CardBody>
                                Students can connect with licensed psychologists anytime they need help.
                            </CardBody>
                        </Card>

                        <Card className="shadow-md border border-gray-200">
                            <CardHeader className="font-semibold text-lg">Smart Analytics</CardHeader>
                            <CardBody>
                                Schools gain insights into student mental health trends for proactive action.
                            </CardBody>
                        </Card>
                    </div>
                </section>
             
            </div>
            <section className="mt-12 text-center w-full py-12 bg-blue-100">
                    <h2 className="text-4xl font-bold">Join Us</h2>
                    <p className="mt-2 leading-relaxed">
                        MindSpace is more than just a platform—it’s a movement for a healthier student community.
                        Be a part of this initiative today.
                    </p>
                    <Button color="primary" className="mt-4">Get Involved</Button>
                </section>
        </div>
    );
}

'use client';

import React from 'react';
import { Button, Card, CardBody, CardHeader, Divider, Image } from '@heroui/react';
import { FaUsers, FaRocket } from 'react-icons/fa';

export default function AboutPage() {
    return (
        <div className="min-h-screen pt-12 bg-gray-100 text-gray-800">
            <div className="max-w-5xl mx-auto">
                <section className="max-w-5xl mx-auto px-4 py-12">
                  
                    <h1 className="text-5xl text-center font-bold mb-10">Về Chúng Tôi</h1>

                
                    <div className="flex flex-col md:flex-row items-start gap-8">
                    
                        <div className="w-full">
                            <Image
                                src="https://media.istockphoto.com/id/1443245439/photo/business-meeting-businesswoman-woman-office-portrait-job-career-happy-businessman-teamwork.jpg?s=612x612&w=0&k=20&c=1ZR02c1UKfGdBCNWzzKlrwrVZuEiOqnAKcKF4V_t038="
                                alt="Cuộc họp nhóm kinh doanh"
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
                                Tại <strong>MindSpace</strong>, chúng tôi tin rằng mỗi sinh viên đều xứng đáng có một môi trường hỗ trợ cho sức khỏe tâm lý của họ.
                                Sứ mệnh của chúng tôi là thu hẹp khoảng cách trong hỗ trợ sức khỏe tâm lý trong các trường học Việt Nam bằng cách cung cấp một nền tảng kỹ thuật số dễ tiếp cận,
                                dựa trên dữ liệu và thân thiện với sinh viên.
                            </p>
                        </div>
                    </div>
                </section>
                <Divider className='h-1 bg-gray-500'/>
               
                <section className="my-20">
                    <h2 className="text-4xl font-semibold flex items-center gap-2 justify-center">
                        <FaUsers className="text-blue-500" /> Chúng Tôi Là Ai
                    </h2>
                    <p className="mt-2 leading-relaxed text-center">
                        MindSpace là một đội ngũ chuyên gia tận tâm nâng cao sức khỏe tâm lý của sinh viên thông qua công nghệ.
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
                        <FaRocket className="text-red-500" /> Tại Sao Chọn MindSpace?
                    </h2>

                    <div className="grid md:grid-cols-2 lg:grid-cols-2 gap-6 mt-4">
                        <Card className="shadow-md border border-gray-200">
                            <CardHeader className="font-semibold text-lg">Giải Pháp Tập Trung Vào Trường Học</CardHeader>
                            <CardBody>
                                Được thiết kế đặc biệt cho môi trường giáo dục.
                            </CardBody>
                        </Card>

                        <Card className="shadow-md border border-gray-200">
                            <CardHeader className="font-semibold text-lg">Quản Lý Kỹ Thuật Số Hiệu Quả</CardHeader>
                            <CardBody>
                                Thay thế các hồ sơ thủ công lỗi thời bằng một hệ thống hợp lý hóa.
                            </CardBody>
                        </Card>

                        <Card className="shadow-md border border-gray-200">
                            <CardHeader className="font-semibold text-lg">Hỗ Trợ Chuyên Nghiệp Trực Tiếp</CardHeader>
                            <CardBody>
                                Sinh viên có thể kết nối với các nhà tâm lý học có giấy phép bất cứ khi nào họ cần giúp đỡ.
                            </CardBody>
                        </Card>

                        <Card className="shadow-md border border-gray-200">
                            <CardHeader className="font-semibold text-lg">Phân Tích Thông Minh</CardHeader>
                            <CardBody>
                                Các trường học có được cái nhìn sâu sắc về xu hướng sức khỏe tâm lý của sinh viên để có hành động chủ động.
                            </CardBody>
                        </Card>
                    </div>
                </section>
             
            </div>
            <section className="mt-12 text-center w-full py-12 bg-blue-100">
                    <h2 className="text-4xl font-bold">Tham Gia Cùng Chúng Tôi</h2>
                    <p className="mt-2 leading-relaxed">
                        MindSpace không chỉ là một nền tảng—đó là một phong trào cho một cộng đồng sinh viên khỏe mạnh hơn.
                        Hãy trở thành một phần của sáng kiến này ngay hôm nay.
                    </p>
                    <Button color="primary" className="mt-4">Tham Gia Ngay</Button>
                </section>
        </div>
    );
}

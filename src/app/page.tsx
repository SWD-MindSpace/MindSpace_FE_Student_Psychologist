"use client";

import Link from "next/link";
import { FaBrain, FaHeart, FaHandsHelping, FaCheckCircle } from "react-icons/fa";
import { Card, CardBody, CardHeader, Image, Button, Divider, ScrollShadow } from "@heroui/react";
import { GrUserExpert } from "react-icons/gr";
import { RiUserCommunityLine } from "react-icons/ri";
import { MdModelTraining } from "react-icons/md";
import MotionHeading from "@/components/MotionHeading";

export default function Home() {
  const psychologists = [
    {
      id: 1,
      name: "Dr. Emily Carter",
      specialty: "Cognitive Behavioral Therapy",
      experience: 12,
      qualifications: "Ph.D. in Clinical Psychology, Harvard University",
      bio: "Dr. Carter specializes in helping individuals overcome anxiety and depression through structured cognitive interventions.",
      image: "https://randomuser.me/api/portraits/women/7.jpg",
    },
    {
      id: 2,
      name: "Dr. James Smith",
      specialty: "Mindfulness & Stress Reduction",
      experience: 15,
      qualifications: "Psy.D. in Counseling Psychology, Stanford University",
      bio: "Dr. Smith incorporates mindfulness techniques to help clients manage stress, build resilience, and improve emotional well-being.",
      image: "https://randomuser.me/api/portraits/men/8.jpg",
    },
    {
      id: 3,
      name: "Dr. Sophia Lee",
      specialty: "Child & Adolescent Psychology",
      experience: 10,
      qualifications: "M.A. in Child Psychology, University of California, Berkeley",
      bio: "Dr. Lee has a decade of experience working with children and teenagers, providing compassionate support for developmental challenges.",
      image: "https://randomuser.me/api/portraits/women/9.jpg",
    },
    {
      id: 4,
      name: "Dr. Michael Johnson",
      specialty: "Relationship & Family Therapy",
      experience: 18,
      qualifications: "Ph.D. in Family Therapy, Yale University",
      bio: "Dr. Johnson helps couples and families navigate relationships, communication issues, and emotional conflicts.",
      image: "https://randomuser.me/api/portraits/men/10.jpg",
    },
    {
      id: 5,
      name: "Dr. Olivia Brown",
      specialty: "Trauma & PTSD Recovery",
      experience: 14,
      qualifications: "Psy.D. in Trauma Counseling, University of Chicago",
      bio: "Dr. Brown specializes in trauma therapy, assisting clients in processing past experiences and fostering healing.",
      image: "https://randomuser.me/api/portraits/women/11.jpg",
    },
    {
      id: 6,
      name: "Dr. Ethan Williams",
      specialty: "Addiction & Recovery Counseling",
      experience: 9,
      qualifications: "M.S. in Clinical Counseling, New York University",
      bio: "Dr. Williams supports individuals overcoming substance abuse and addictive behaviors through evidence-based strategies.",
      image: "https://randomuser.me/api/portraits/men/12.jpg",
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <section className="relative bg-secondary-blue text-white py-28 text-center font-noto-sans shadow-sm shadow-black">
        {/* Background Video */}
        <video className="absolute top-0 left-0 w-full h-full object-cover" autoPlay loop muted playsInline>
          <source
            src="https://res.cloudinary.com/ddewgbug1/video/upload/v1741977745/pg2y7f8da85pyuwj86lz.mp4"
            type="video/mp4"
          />
          Your browser does not support the video tag.
        </video>

        {/* Content */}
        <div className="relative z-10">
          <MotionHeading className="text-5xl">Chào mừng tới với MindSpace</MotionHeading>
          <MotionHeading className="text-xl font-noto-sans mt-4" delay={0.5}>
            Hành trình đến với sức khỏe tinh thần của bạn bắt đầu từ đây.
          </MotionHeading>
          <Link href="/psychologists">
            <Button className="mt-6 px-8 py-3 text-lg font-semibold shadow-lg transition-transform hover:scale-105">
              Đặt một cuộc hẹn
            </Button>
          </Link>
        </div>
      </section>

      <section className="container mx-auto my-24 px-6 grid grid-cols-1 md:grid-cols-3 gap-8">
        {[
          {
            icon: <FaBrain className="text-5xl mb-4" />,
            title: "Expert Guidance",
            text: "Our specialists provide professional and personalized care.",
          },
          {
            icon: <FaHeart className="text-5xl mb-4" />,
            title: "Compassionate Support",
            text: "We prioritize your emotional well-being.",
          },
          {
            icon: <FaHandsHelping className="text-5xl mb-4" />,
            title: "Community Programs",
            text: "Join support groups and workshops tailored for you.",
          },
        ].map((feature, index) => (
          <Card key={index} shadow="lg" className="p-6 transition-all hover:shadow-2xl hover:scale-105 bg-sky-100">
            <CardBody className="flex flex-col items-center text-center font-noto-sans">
              {feature.icon}
              <h3 className="text-2xl font-semibold font-bevnpro mt-2">{feature.title}</h3>
              <p className="text-gray-600 mt-2">{feature.text}</p>
            </CardBody>
          </Card>
        ))}
      </section>
      <Divider className="w-1/2 mx-auto mb-10" />

      <section className="container mx-auto my-24 px-6 flex flex-col md:flex-row items-center gap-12 font-noto-sans">
        <div className="w-full md:w-1/2">
          <Image
            src="https://oasiseducation.com/wp-content/uploads/2024/02/Scale-Expand-Mental-Health-Services.jpg"
            alt="Mental Health Support"
            width={600}
            height={400}
            className="shadow-lg"
          />
        </div>

        <div className="w-full md:w-1/2">
          <MotionHeading className="text-secondary-blue text-5xl" direction="right">Mở rộng & Nâng cao</MotionHeading>
          <MotionHeading className="text-secondary-blue font-normal font-noto-sans mt-2" direction="right" delay={0.5}>Dịch vụ Sức khỏe Tâm thần</MotionHeading>
          <MotionHeading className="mt-4 font-normal font-noto-sans text-lg" direction="right" delay={1}>
            MindSpace loại bỏ thời gian chờ đợi để được hỗ trợ sức khỏe tâm thần và giảm bớt khối lượng công việc quá tải cho nhân viên trung tâm tư vấn.
          </MotionHeading>
          <ul className="grid md:grid-cols-2 mt-6">
            {[
              "24/7 Support Counseling",
              "Same-Day Appointments",
              "Monitored Peer Support Forum",
              "Professionally Developed Courses",
              "Evidence-Based Articles & Videos",
              "Teletherapy (No Insurance Needed)",
            ].map((item, index) => (
              <li key={index} className="flex items-center text-lg py-3">
                <FaCheckCircle className="text-third-color mr-2" /> {item}
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="container mx-auto my-36 px-6 font-noto-sans">
        <MotionHeading className="text-center text-secondary-blue mb-6">Meet Our Expert Psychologists</MotionHeading>
        <MotionHeading className="text-center text-gray-600 mx-auto mb-12 text-lg font-noto-sans" delay={0.5}>
          Our team of licensed psychologists is dedicated to providing compassionate care, offering evidence-based
          therapies tailored to your needs.
        </MotionHeading>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {psychologists.map((psychologist) => (
            <Card
              key={psychologist.id}
              shadow="lg"
              className="transition-transform hover:scale-105 bg-white rounded-lg overflow-hidden border border-blue-400"
            >
              <CardHeader className="flex flex-col items-center bg-blue-100 py-6">
                <Image
                  src={psychologist.image}
                  alt={psychologist.name}
                  width={120}
                  height={120}
                  className="rounded-full object-cover shadow-md"
                />
                <h3 className="text-xl font-semibold mt-4">{psychologist.name}</h3>
                <p className="text-blue-700 text-sm">{psychologist.specialty}</p>
              </CardHeader>
              <CardBody className="p-6 text-center">
                <p className="text-gray-600 text-sm">{psychologist.experience} years of experience</p>
                <p className="text-gray-600 text-sm mt-2">{psychologist.qualifications}</p>
                <p className="text-gray-700 mt-4">{psychologist.bio}</p>
              </CardBody>
            </Card>
          ))}
        </div>
      </section>

      <section className="container mx-auto my-24 px-6 font-noto-sans">
        <div className="text-center leading-relaxed space-y-4">
          <MotionHeading className="text-secondary-blue">
            Supporting <strong>Faculty & Staff</strong>
          </MotionHeading>
          <MotionHeading className="text-gray-600 text-lg font-noto-sans" delay={0.5}>
            MindSpace provides unique content, tools, guides, and training for your faculty and staff.
          </MotionHeading>
          <Divider className="w-1/2 mx-auto" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mt-8">
          {[
            {
              icon: <GrUserExpert className="text-5xl mb-4" />,
              title: "Expert Guidance",
              text: "Our specialists provide professional and personalized care.",
            },
            {
              icon: <FaHeart className="text-5xl mb-4" />,
              title: "Compassionate Support",
              text: "We prioritize your emotional well-being.",
            },
            {
              icon: <RiUserCommunityLine className="text-5xl mb-4" />,
              title: "Community Programs",
              text: "Join support groups and workshops tailored for you.",
            },
            {
              icon: <MdModelTraining className="text-5xl mb-4" />,
              title: "Training Resources",
              text: "Access professional training and development courses.",
            },
          ].map((feature, index) => (
            <Card key={index} shadow="lg" className="p-6 text-center transition-all hover:shadow-2xl hover:scale-105">
              <CardBody>
                {feature.icon}
                <h3 className="text-xl font-semibold mt-2">{feature.title}</h3>
                <p className="text-gray-600 mt-2">{feature.text}</p>
              </CardBody>
            </Card>
          ))}
        </div>
      </section>

      <Divider className="w-1/2 mx-auto mb-10" />

      <section className="container mx-auto py-6 px-6 text-center">
        <h2 className="text-4xl font-bold text-secondary-blue">Why Students Love MindSpace</h2>
        <p className="text-gray-600 mt-4 text-lg">
          Hear from students who have benefited from our support and services.
        </p>

        <ScrollShadow hideScrollBar className="mt-10">
          <div className="flex space-x-6">
            {[
              {
                name: "Sophia Johnson",
                comment: "Oasis changed my life! I finally found the support I needed.",
                image: "https://randomuser.me/api/portraits/women/10.jpg",
                rating: 5,
              },
              {
                name: "Daniel Kim",
                comment: "The peer support forum helped me connect with others.",
                image: "https://randomuser.me/api/portraits/men/11.jpg",
                rating: 4,
              },
              {
                name: "Ava Martinez",
                comment: "Same-day appointments were a game changer!",
                image: "https://randomuser.me/api/portraits/women/12.jpg",
                rating: 5,
              },
              {
                name: "Ethan Brown",
                comment: "Oasis made mental health support so accessible!",
                image: "https://randomuser.me/api/portraits/men/13.jpg",
                rating: 4,
              },
              {
                name: "Ethan Brown",
                comment: "Oasis made mental health support so accessible!",
                image: "https://randomuser.me/api/portraits/men/13.jpg",
                rating: 4,
              },
              {
                name: "Ethan Brown",
                comment: "Oasis made mental health support so accessible!",
                image: "https://randomuser.me/api/portraits/men/13.jpg",
                rating: 4,
              },
              {
                name: "Ethan Brown",
                comment: "Oasis made mental health support so accessible!",
                image: "https://randomuser.me/api/portraits/men/13.jpg",
                rating: 4,
              },
            ].map((student, index) => (
              <div key={index} className="bg-white shadow-lg rounded-lg p-6 w-80 text-left flex-shrink-0">
                <div className="flex items-center gap-4">
                  <Image
                    src={student.image}
                    alt={student.name}
                    className="w-14 h-14 rounded-full border-2 border-blue-500"
                  />
                  <div>
                    <h3 className="text-lg font-semibold">{student.name}</h3>
                    <div className="text-yellow-400">
                      {"★".repeat(student.rating)}
                      {"☆".repeat(5 - student.rating)}
                    </div>
                  </div>
                </div>
                <p className="mt-4 text-gray-700">{student.comment}</p>
              </div>
            ))}
          </div>
        </ScrollShadow>
      </section>
    </div>
  );
}

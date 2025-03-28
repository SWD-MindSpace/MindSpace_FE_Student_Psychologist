"use client";

import {
  FaBrain,
  FaHeart,
  FaHandsHelping,
  FaCheckCircle,
} from "react-icons/fa";
import {
  Card,
  CardBody,
  CardHeader,
  Image,
  Button,
  Divider,
  ScrollShadow,
} from "@heroui/react";
import { GrUserExpert } from "react-icons/gr";
import { RiUserCommunityLine } from "react-icons/ri";
import { MdModelTraining } from "react-icons/md";
import MotionHeading from "@/components/MotionHeading";
import { Psychologist } from "@/types/psychologist";
import { useEffect, useState } from "react";
import LoginReminderModal from "@/components/modals/LoginReminderModal";

export default function Home() {
  const [psychologists, setPsychologists] = useState<Psychologist[]>([]);
  const [loginReminderModal, setLoginReminderModal] = useState(false);

  useEffect(() => {
    const accessToken = localStorage.getItem("accessToken");
    const fetchPsychologists = async () => {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/identities/accounts/psychologists?Status=Enabled&PageSize=3`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
        }
      );
      const data = await response.json();
      setPsychologists(data.data);
    };
    fetchPsychologists();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      <LoginReminderModal
        open={loginReminderModal}
        onClose={() => setLoginReminderModal(false)}
      />

      <section className="relative bg-secondary-blue text-white py-28 text-center font-noto-sans shadow-sm shadow-black">
        {/* Background Video */}
        <video
          className="absolute top-0 left-0 w-full h-full object-cover"
          autoPlay
          loop
          muted
          playsInline
          suppressHydrationWarning
        >
          <source
            src="https://res.cloudinary.com/ddewgbug1/video/upload/v1741977745/pg2y7f8da85pyuwj86lz.mp4"
            type="video/mp4"
          />
          Your browser does not support the video tag.
        </video>

        {/* Content */}
        <div className="relative z-10">
          <MotionHeading className="text-5xl">
            Chào mừng tới với MindSpace
          </MotionHeading>
          <MotionHeading className="text-xl font-noto-sans mt-4" delay={0.5}>
            Hành trình đến với sức khỏe tinh thần của bạn bắt đầu từ đây.
          </MotionHeading>
          <Button
            onPress={() => setLoginReminderModal(true)}
            className="mt-6 px-8 py-3 text-lg font-semibold shadow-lg transition-transform hover:scale-105"
          >
            Đặt một cuộc hẹn
          </Button>
        </div>
      </section>

      <section className="container mx-auto my-24 px-6 grid grid-cols-1 md:grid-cols-3 gap-8">
        {[
          {
            icon: <FaBrain className="text-5xl mb-4" />,
            title: "Hướng dẫn chuyên sâu",
            text: "Chúng tôi cung cấp sự hỗ trợ chuyên sâu và cá nhân hóa.",
          },
          {
            icon: <FaHeart className="text-5xl mb-4" />,
            title: "Hỗ trợ đa cảm xúc",
            text: "Chúng tôi ưu tiên sức khỏe tâm thần của bạn.",
          },
          {
            icon: <FaHandsHelping className="text-5xl mb-4" />,
            title: "Chương trình cộng đồng",
            text: "Tham gia các nhóm hỗ trợ và khóa học được thiết kế phù hợp với bạn.",
          },
        ].map((feature, index) => (
          <Card
            key={index}
            shadow="lg"
            className="p-6 transition-all hover:shadow-2xl hover:scale-105 bg-sky-100"
          >
            <CardBody className="flex flex-col items-center text-center font-noto-sans">
              {feature.icon}
              <h3 className="text-2xl font-semibold font-bevnpro mt-2">
                {feature.title}
              </h3>
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
          <MotionHeading
            className="text-secondary-blue text-5xl"
            direction="right"
          >
            Mở rộng & Nâng cao
          </MotionHeading>
          <MotionHeading
            className="text-secondary-blue font-normal font-noto-sans mt-2"
            direction="right"
            delay={0.5}
          >
            Dịch vụ Sức khỏe Tâm thần
          </MotionHeading>
          <MotionHeading
            className="mt-4 font-normal font-noto-sans text-lg"
            direction="right"
            delay={1}
          >
            MindSpace loại bỏ thời gian chờ đợi để được hỗ trợ sức khỏe tâm thần
            và giảm bớt khối lượng công việc quá tải cho nhân viên trung tâm tư
            vấn.
          </MotionHeading>
          <ul className="grid md:grid-cols-2 mt-6">
            {[
              "Hỗ trợ tư vấn 24/7",
              "Lịch hẹn ngay lập tức",
              "Nhóm hỗ trợ tâm lý được giám sát",
              "Khóa học được phát triển chuyên nghiệp",
              "Bài viết và video dựa trên cơ sở khoa học",
              "Tư vấn tâm lý (Không cần bảo hiểm)",
            ].map((item, index) => (
              <li key={index} className="flex items-center text-lg py-3">
                <FaCheckCircle className="text-third-color mr-2" /> {item}
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="container mx-auto my-36 px-6 font-noto-sans">
        <MotionHeading className="text-center text-secondary-blue mb-6">
          Gặp gỡ nhà tư vấn chuyên nghiệp
        </MotionHeading>
        <MotionHeading
          className="text-center text-gray-600 mx-auto mb-12 text-lg font-noto-sans"
          delay={0.5}
        >
          Đội ngũ nhà tư vấn tâm lý đã được cấp phép cung cấp sự hỗ trợ tâm lý
          cảm thông, cung cấp các phương pháp tư vấn dựa trên cơ sở khoa học,
          được thiết kế phù hợp với nhu cầu của bạn.
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
                  src={psychologist.imageUrl}
                  alt={psychologist.fullName}
                  width={120}
                  height={120}
                  className="rounded-full object-cover shadow-md"
                />
                <h3 className="text-xl font-semibold mt-4">
                  {psychologist.fullName}
                </h3>
                <p className="text-blue-700 text-sm">
                  {psychologist.specialization.name}
                </p>
              </CardHeader>
              <CardBody className="p-6 text-center">
                <div className="flex items-center justify-center">
                  <p className="text-gray-600 text-sm mr-2">
                    {psychologist.averageRating}
                  </p>
                  {Array.from({ length: 5 }, (_, index) => (
                    <span
                      key={index}
                      className={
                        index < Math.round(psychologist.averageRating)
                          ? "text-yellow-500"
                          : "text-gray-300"
                      }
                    >
                      ★
                    </span>
                  ))}
                </div>
                <p className="text-gray-700 mt-4">{psychologist.bio}</p>
              </CardBody>
            </Card>
          ))}
        </div>
      </section>

      <section className="container mx-auto my-24 px-6 font-noto-sans">
        <div className="text-center leading-relaxed space-y-4">
          <MotionHeading className="text-secondary-blue">
            Hỗ trợ <strong>Giảng viên & Nhân viên</strong>
          </MotionHeading>
          <MotionHeading
            className="text-gray-600 text-lg font-noto-sans"
            delay={0.5}
          >
            MindSpace cung cấp nội dung, công cụ, hướng dẫn và đào tạo cho giảng
            viên và nhân viên của bạn.
          </MotionHeading>
          <Divider className="w-1/2 mx-auto" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mt-8">
          {[
            {
              icon: <GrUserExpert className="text-5xl mb-4" />,
              title: "Hướng dẫn chuyên sâu",
              text: "Chúng tôi cung cấp sự hỗ trợ chuyên sâu và cá nhân hóa.",
            },
            {
              icon: <FaHeart className="text-5xl mb-4" />,
              title: "Hỗ trợ tâm lý",
              text: "Chúng tôi ưu tiên sức khỏe tâm thần của bạn.",
            },
            {
              icon: <RiUserCommunityLine className="text-5xl mb-4" />,
              title: "Chương trình cộng đồng",
              text: "Tham gia các nhóm hỗ trợ và khóa học được thiết kế phù hợp với bạn.",
            },
            {
              icon: <MdModelTraining className="text-5xl mb-4" />,
              title: "Tài nguyên đào tạo",
              text: "Truy cập khóa học và khóa đào tạo chuyên nghiệp.",
            },
          ].map((feature, index) => (
            <Card
              key={index}
              shadow="lg"
              className="p-6 text-center transition-all hover:shadow-2xl hover:scale-105"
            >
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
        <h2 className="text-4xl font-bold text-secondary-blue">
          Tại sao sinh viên yêu thích MindSpace
        </h2>
        <p className="text-gray-600 mt-4 text-lg">
          Nghe từ sinh viên đã hưởng lợi từ sự hỗ trợ và dịch vụ của chúng tôi.
        </p>

        <ScrollShadow hideScrollBar className="mt-10">
          <div className="flex space-x-6">
            {[
              {
                name: "Sophia Johnson",
                comment:
                  "MindSpace đã thay đổi cuộc đời tôi! Tôi cuối cùng đã tìm thấy sự hỗ trợ mà tôi cần.",
                image: "https://randomuser.me/api/portraits/women/10.jpg",
                rating: 5,
              },
              {
                name: "Daniel Kim",
                comment:
                  "Nhóm hỗ trợ tâm lý giúp tôi kết nối với những người khác.",
                image: "https://randomuser.me/api/portraits/men/11.jpg",
                rating: 4,
              },
              {
                name: "Ava Martinez",
                comment: "Lịch hẹn ngay lập tức giúp tôi cảm thấy thoải mái.",
                image: "https://randomuser.me/api/portraits/women/12.jpg",
                rating: 5,
              },
              {
                name: "Ethan Brown",
                comment:
                  "MindSpace làm cho việc hỗ trợ tâm lý trở nên dễ dàng hơn bao giờ hết!",
                image: "https://randomuser.me/api/portraits/men/13.jpg",
                rating: 4,
              },
              {
                name: "Ethan Brown",
                comment:
                  "MindSpace làm cho việc hỗ trợ tâm lý trở nên dễ dàng hơn bao giờ hết!",
                image: "https://randomuser.me/api/portraits/men/13.jpg",
                rating: 4,
              },
              {
                name: "Ethan Brown",
                comment:
                  "MindSpace làm cho việc hỗ trợ tâm lý trở nên dễ dàng hơn bao giờ hết!",
                image: "https://randomuser.me/api/portraits/men/13.jpg",
                rating: 4,
              },
              {
                name: "Ethan Brown",
                comment:
                  "MindSpace làm cho việc hỗ trợ tâm lý trở nên dễ dàng hơn bao giờ hết!",
                image: "https://randomuser.me/api/portraits/men/13.jpg",
                rating: 4,
              },
            ].map((student, index) => (
              <div
                key={index}
                className="bg-white shadow-lg rounded-lg p-6 w-80 text-left flex-shrink-0"
              >
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

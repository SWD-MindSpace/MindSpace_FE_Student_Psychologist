'use client'

import { Card, CardHeader, CardBody, Image } from "@heroui/react";

const text = 'Cuộc sống là một hành trình đầy thử thách, nhưng cũng không thiếu những khoảnh khắc đẹp đẽ và đáng nhớ. Mỗi ngày trôi qua, ta học được nhiều điều mới mẻ, từ những người xung quanh đến chính bản thân mình. Quan trọng nhất là biết trân trọng những giây phút hiện tại và luôn cố gắng vươn lên, dù cho những khó khăn có thể làm ta cảm thấy mệt mỏi. Hãy sống với niềm tin và hy vọng, vì tương lai luôn rộng mở cho những ai dám ước mơ.'

export default function Home() {
    return (
        <>
            <div className="grid grid-cols-1 w-screen">
                <div className="h-28 bg-primary-blue"></div>
                <div className="h-28 bg-secondary-blue"></div>
                <div className="h-28 bg-white"></div>
                <div className="h-28 bg-bg-gray"></div>
            </div>
            <div className="flex flex-col items-center justify-between h-screen text-center py-10">
                <div className="w-[70%] py-10 text-left flex flex-col gap-5">

                    <h1 className="font-bevnpro text-5xl text-black text-left mb-3 font-[700] text-black-1">Có Chơi Có Chịu</h1>
                    <h1 className="font-bevnpro text-5xl text-black text-left mb-3 font-[700] text-black-2">Có Chơi Có Chịu</h1>
                    <h1 className="font-bevnpro text-4xl text-black text-left mb-3 font-[700]">Có Chơi Có Chịu</h1>
                    <h1 className="font-bevnpro text-3xl text-black text-left mb-3 font-[700]">Có Chơi Có Chịu</h1>
                    <h1 className="font-bevnpro text-2xl text-black text-left mb-3 font-[700]">Có Chơi Có Chịu</h1>
                    <h1 className="font-bevnpro text-xl text-black text-left mb-3 font-semibold">Có Chơi Có Chịu</h1>

                    <h1 className="font-bevnpro text-2xl text-black text-left mb-3 font-semibold">Tạo bài test mới</h1>

                    <h1 className="font-bevnpro text-5xl text-left mb-3 font-[800] text-primary-blue">Có Chơi Có Chịu</h1>
                    <p className="font-noto-sans text-black font-[500]">{text} <span className="font-semibold">Ý nghĩa cuộc sống</span> rốt cuộc nằm ở đâu, ở ngõ nào, ngách nào.</p>
                    <p className="text-txt-gray font-noto-sans font-[450]">{text} <span className="font-semibold">Ý nghĩa cuộc sống</span> rốt cuộc nằm ở đâu, ở ngõ nào, ngách nào.</p>

                </div>
                <div className="flex flex-row items-center justify-center h-full">
                    <Card className="py-4">
                        <CardHeader className="pb-0 pt-2 px-4 flex-col items-start">
                            <h4 className="font-bold text-large">Frontend Team</h4>
                        </CardHeader>
                        <CardBody className="overflow-visible py-2">
                            <Image
                                alt="Card background"
                                className="object-cover rounded-xl"
                                src="https://heroui.com/images/hero-card-complete.jpeg"
                                width={270}
                            />
                        </CardBody>
                    </Card>
                </div>
            </div >
        </>


    );
}

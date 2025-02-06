'use client'

import { Card, CardHeader, CardBody, Image } from "@heroui/react";

export default function Home() {
    return (
        <div className="bg-amber-200 h-screen text-center py-10">
            <h1 className="font-bold text-5xl text-red-500">Management Site - NextJS</h1>
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

    );
}

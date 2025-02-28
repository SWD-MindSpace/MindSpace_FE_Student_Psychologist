'use client'

import { Divider, Image } from '@heroui/react';
import React from 'react'

export default function page() {
    const psychologists = [
        { id: 1, name: "Dr. Emily Carter", specialty: "Cognitive Behavioral Therapy", image: "https://randomuser.me/api/portraits/men/7.jpg" },
        { id: 2, name: "Dr. James Smith", specialty: "Mindfulness & Stress Reduction", image: "https://randomuser.me/api/portraits/men/8.jpg" },
        { id: 3, name: "Dr. Sophia Lee", specialty: "Child & Adolescent Psychology", image: "https://randomuser.me/api/portraits/men/9.jpg" },
    ];
    return (
        <div className='min-h-screen p-6 max-w-6xl mx-auto'>
            <div className='flex justify-center'>
                <Image
                    alt="psychologist main image"
                    width={1000}
                    height={700}
                    src='https://img1.wsimg.com/isteam/ip/5bd7378e-737c-48de-a4a5-f2d20b800b4e/Louisa%20and%20Fergus.jpg/:/cr=t:0%25,l:0%25,w:100%25,h:72.77%25/rs=w:1863,h:1863,cg:true'
                />
            </div>
            <Divider className='mt-10' />
            <div className='mt-10'>
                <p className='text-2xl'>FERGUS TREVETHAN</p>
                <Divider className='mt-2' />
                <div className='grid grid-cols-1 md:grid-cols-2 gap-10 leading-relaxed mb-10 my-5'>
                    <p>Registered Psychologist - PSY0002271259
                        Over the years I have been fortunate enough to have the unique opportunity of living and working in the UK, Norway, France, and Sweden. From here I then went onto working for the United Nations in refugee camps in Tanzania, Kenya, Rwanda and Burundi. The life changing experiences afforded to me in my travels  have provided me with invaluable lessons and experiences. It also fostered a keen sense of social justice that has driven my desire to pursue a life long career in psychology.

                        Coaching Rugby, Cricket and now practicing as a Registered Psychologist, whilst teaching full-time, have provided me the intellectual platform to diversify my skillset within the education sector. Having the opportunity to work as a researcher for Independent Schools Queensland, on multiple occasions, has cemented my commitment to being a lifelong learner and been a thoroughly rewarding experience.

                        My interest in volunteer work has given me to opportunity to work in the oncology ward at the Royal Children's Hospital, now the Lady Cilento Hospital, in Brisbane when I first started university. Volunteering has taken me throughout Africa and continues today with a local focus through my commitment to ongoing volunteer work in the local community. From a personal perspective, it continues through The Smith Family's tutoring and mentoring program at various schools in need on the Gold Coast.



                        For more details on my education and work experience please visit my Linked In profile.</p>
                    <Image 
                    src='https://img1.wsimg.com/isteam/ip/5bd7378e-737c-48de-a4a5-f2d20b800b4e/CF5CF503-56A6-4387-B9A3-F0D248A66705_1_105_c.jpeg/:/cr=t:9.68%25,l:9.68%25,w:80.65%25,h:80.65%25/rs=w:768,cg:true,m'
                    alt="FERGUS"
                    width={600}
                    height={400}
                    />
                </div>
            </div>
        </div>
    )
}

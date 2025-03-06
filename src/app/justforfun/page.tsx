'use client'

import { CloudinaryUploadWidgetResults } from 'next-cloudinary';

import { CldUploadButton } from "next-cloudinary";

const CloudPresetName = process.env.NEXT_PUBLIC_CLOUDINARY_PRESET_NAME;

export default function JustForFun() {

    const onSuccessfulUpload = (result: CloudinaryUploadWidgetResults) => {
        console.log('onSuccessfulUpload', result);
    }

    return (
        <>
            <div className='flex items-center justify-center'>
                <CldUploadButton
                    options={{ multiple: true }}
                    onSuccess={onSuccessfulUpload}
                    uploadPreset={CloudPresetName}
                >
                    <span className='text-2xl'>Upload images</span>
                </CldUploadButton>
            </div>
        </>

    )
}

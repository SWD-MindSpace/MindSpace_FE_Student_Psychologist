'use client'

import { CldUploadButton } from "next-cloudinary";

export default function JustForFun() {

    const onSuccessfulUpload = (result: CloudinaryUploadWidgetResults) => {
        console.log('onSuccessfulUpload', result);
    }

    const text = 'Cuộc sống là một hành trình đầy thử thách, nhưng cũng không thiếu những khoảnh khắc đẹp đẽ và đáng nhớ. Mỗi ngày trôi qua, ta học được nhiều điều mới mẻ, từ những người xung quanh đến chính bản thân mình. Quan trọng nhất là biết trân trọng những giây phút hiện tại và luôn cố gắng vươn lên, dù cho những khó khăn có thể làm ta cảm thấy mệt mỏi. Hãy sống với niềm tin và hy vọng, vì tương lai luôn rộng mở cho những ai dám ước mơ.'
    return (
        <>
           <div>
            <CldUploadButton>
                options={{ multiple: true }}
                onSuccess={onSuccessfulUpload}
                uploadPreset={CloudPresetName}
            </CldUploadButton>
           </div>
        </>

    )
}

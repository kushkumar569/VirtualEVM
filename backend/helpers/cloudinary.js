import { v2 as cloudinary } from "cloudinary";
import fs from "fs";

const uploadOnCloudinary = async (localFilePath) => {
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET, 
});

    try {
        if (!localFilePath) return null;
        const responce = await cloudinary.uploader.upload(localFilePath, {
            resource_type: "auto",
            timeout: 60000
        });
        
        fs.unlinkSync(localFilePath);
        return responce;
    } catch (error) {
        if (error.name === 'TimeoutError' && retries > 0) {
            console.log(`Timeout occurred. Retrying... ${retries} attempts left.`);
            return uploadOnCloudinary(filePath, retries - 1); // Retry the upload
        } else {
            fs.unlinkSync(localFilePath);
            return null;
        }
    }
};

export { uploadOnCloudinary };
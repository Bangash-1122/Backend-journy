import {
    v2 as cloudinary
} from 'cloudinary';
import fs from 'fs';

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

const uploadOnCloudinary = async (localFilePath, customOptions = {}) => {
    try {
        if (!localFilePath) return null;
        const options = {
            resource_type: "auto",
            ...customOptions,
        };
        const response = await cloudinary.uploader.upload(localFilePath, options);
        if (fs.existsSync(localFilePath)) {
            fs.unlinkSync(localFilePath);
        }
        return response;
    } catch (error) {
        if (localFilePath && fs.existsSync(localFilePath)) {
            try {
                fs.unlinkSync(localFilePath);
            } catch {
                // Ignore unlink errors
            }
        }
        return null;
    }
};

const extractPublicId = (url) => {
    if (!url || typeof url !== 'string') return null;
    try {
        const parts = url.split('/');
        const fileWithExt = parts[parts.length - 1];
        const publicId = fileWithExt.split('.')[0];
        const uploadIndex = parts.indexOf('upload');
        if (uploadIndex !== -1 && uploadIndex < parts.length - 2) {
            const folderParts = parts.slice(uploadIndex + 2, parts.length - 1);
            return folderParts.length > 0 ? `${folderParts.join('/')}/${publicId}` : publicId;
        }
        return publicId;
    } catch {
        return null;
    }
};

const deleteFromCloudinary = async (publicIdOrUrl, resourceType = "image") => {
    try {
        if (!publicIdOrUrl) return null;
        const publicId = publicIdOrUrl.startsWith('http') ?
            extractPublicId(publicIdOrUrl) :
            publicIdOrUrl;
        if (!publicId) return null;
        const result = await cloudinary.uploader.destroy(publicId, {
            resource_type: resourceType
        });
        return result;
    } catch (error) {
        console.error("Cloudinary delete error:", error);
        return null;
    }
};

export {
    uploadOnCloudinary,
    deleteFromCloudinary
};
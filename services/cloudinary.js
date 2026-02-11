// // services/cloudinary.js
// const cloudinary = require('cloudinary').v2;

// cloudinary.config({
//   cloud_name: process.env.CLOUDINARY_CLOUD_NAME || '',
//   api_key: process.env.CLOUDINARY_API_KEY || '',
//   api_secret: process.env.CLOUDINARY_API_SECRET || ''
// });

// async function uploadImage(filePath, folder = 'norvae') {
//   const res = await cloudinary.uploader.upload(filePath, {
//     folder,
//     use_filename: true,
//     unique_filename: false,
//     resource_type: 'image'
//   });
//   return { url: res.secure_url, public_id: res.public_id };
// }

// async function deleteImage(publicId) {
//   return cloudinary.uploader.destroy(publicId);
// }

// module.exports = { uploadImage, deleteImage, cloudinary };
// services/cloudinary.js

const cloudinary = require("cloudinary").v2;

// Ensure required env variables exist
if (
  !process.env.CLOUDINARY_CLOUD_NAME ||
  !process.env.CLOUDINARY_API_KEY ||
  !process.env.CLOUDINARY_API_SECRET
) {
  throw new Error("❌ Cloudinary environment variables are missing");
}

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

async function uploadImage(filePath, folder = "rivae/products") {
  const res = await cloudinary.uploader.upload(filePath, {
    folder,
    use_filename: true,
    unique_filename: true,
    resource_type: "image",
  });

  return {
    url: res.secure_url,
    public_id: res.public_id,
  };
}

async function deleteImage(publicId) {
  return cloudinary.uploader.destroy(publicId);
}

module.exports = { uploadImage, deleteImage, cloudinary };

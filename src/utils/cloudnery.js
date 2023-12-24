import { v2 as cloudinary } from 'cloudinary';
import fs from "fs"   // file system

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUSINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});
const cloudinaryupdate = async (localFilePath) => {
  try {
    if (!localFilePath)
      return null;
    const response = await cloudinary.uploader.upload(localFilePath, {
      resource_type: "auto"

    })
    // file has been succesfully uploaded:
    console.log("file has been uploaded successfully", response.url);
    fs.unlinkSync(localFilePath)
    return response;

  } catch (error) {
    fs.unlinkSync(localFilePath)  // remove the lovcalluy saved temporary file as the upload operation got  failed:;
    return null;
  }
}
// cloudinary.v2.uploader.upload("https://upload.wikimedia.org/wikipedia/commons/a/ae/Olympic_flag.jpg",
//   { public_id: "olympic_flag" }, 
//   function(error, result) {console.log(result); });
export { cloudinaryupdate }
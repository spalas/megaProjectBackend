import { v2 as cloudinary } from "cloudinary"
import fs from "fs"


          
cloudinary.config({ 
  cloud_name: process.env.CLOUDIARY_CLOUD_NAME, 
  api_key: process.env.CLOUDIARY_API_KEY, 
  api_secret: process.env.CLOUDIARY_API_SECRET 
});

const uploadOneCloudinary = async (localFilePath) => {
    try {
        if (!localFilePath) return null
        // upload the file on cloudinary
        cloudinary.uploader.upload(localFilePath, {
            resource_type: "auto"
        })
        // file has been successfully uploaded
        
    } catch (error) {
        
    }
}



cloudinary.v2.uploader.upload("https://upload.wikimedia.org/wikipedia/commons/a/ae/Olympic_flag.jpg",
  { public_id: "olympic_flag" }, 
  function(error, result) {console.log(result); });
import mongoose, { Schema } from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt"


const videoSchema = new Schema(
    {
        videoFile: {
            type: String,
            required: true,

        },
        thumbnail: {
            type: String,
            required: true,
            
        },
      title : {
            type: String,
            required: true,
            
        },
        description: {
            type: String,
            required: true,
            
        },
      duration: {
            type: Number,
            required: true,
            
        },
        views: {
            type: Number,
            default: 0,
            
        },
        isPublished: {
            type: Boolean,
            default:true,
        },

        owner: {
            type: Schema.Types.ObjectId,
            ref: "User"
        }

      

    },
    {
        timestamps: true,
    }
)
userSchema.pre('save', async function (next) {
    if (!this.isModified("password")) return next();
        
    
    this.password = bcrypt.hash(this.password, 10)
    next()
})
userSchema.methods.isPasswordCorrect = async function
    (password) {
    return await bcrypt.compare(password, this.password)
    }

export const Video = mongoose.model("Video", videoSchema)
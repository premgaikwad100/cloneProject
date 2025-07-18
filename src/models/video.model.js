import { modelNames } from "mongoose";
import mongoose ,{Schema} from mongoose;
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2"


const videoSchema= new Schema(
    {
        videoFile:{
            type:String,   //cloudinary 
            required:true,
        },
        thumbnail:{
             type:String,
             required:true,
        },
        title:{
            type:String,
            required:true,
        },
        description:{
            type:String,
            required:true,
        },
        duration:{
            type:Number, //actually take duration from cloudinary it get info from url that what is duration
            required:true,
        },
        views:{
            type:Number,     
            default:0,
        },
        isPublished:{
            type:Boolean,     //who can view video
            default:true,
        },
        owner:{
            type: Schema.Types.ObjectId,
            ref:"User",
        }
    },
    {
        timestamps:true,
    }
)
videoSchema.plugin(mongooseAggregatePaginate)

export const Video = mongoose.model("Video",videoSchema); 
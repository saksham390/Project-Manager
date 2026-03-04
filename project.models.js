import mongoose,{Schema} from "mongoose";

const projectSchema=new Schema({
    name:{
        type:String,
        required:true,
        unique:true,
        trim:true,
    },
    descrption:{
        type:String,
    },
    createdBy:{
        type:Schema.Types.ObjectId,
        ref:"User",
        required:true
    }
},{timeStamps:true})


export const Project=mongoose.model("Project",projectSchema)
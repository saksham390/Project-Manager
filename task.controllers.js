import {User} from "../models/user.models.js";
import {Project} from "../models/project.models.js";
import {Task} from "../models/task.models.js";
import {Subtask} from "../models/subtask.models.js";


import {ApiResponse} from "../utils/api_response.js";
import {asyncHandler} from "../utils/async-handler.js";
import {ApiError} from "../utils/api_error.js";
import mongoose from "mongoose";
import { AvailableUserRole,UserRolesEnum } from "../utils/constants.js";



const getTasks=asyncHandler(async(req,res)=>{

    const{projectId}=req.params;
    const project =await ProjectFindById(projectId)
     if(!project){
        throw new ApiError(404,"project not found");
    }
    const tasks=await Task.find({
        project:new mongoose.Types.ObjectId(projectId)
    }).populate("assignedTo","avatar username fullName");
    return res
.status(201)
.json(
    new ApiResponse(201,task,"task fetched succesfullly")
);


});
const createTasks=asyncHandler(async(req,res)=>{
    const{title,description,assignedTo,status}=req.body
    const{projectId}=req.params;
    const project =await ProjectFindById(projectId)

    if(!project){
        throw new ApiError(404,"project not found");
    }
   const files= req.files || [];

  const attachments= files.map((file) => {
    return{
        url:`${process.env.SERVER_URL}/images/${file.originalname}`,
        mimetype:file.mimetype,
        size:file.size,
    }




   })


   const task=await Task.create({
    title,
    description,
    project:new mongoose.Types.ObjectId(projectId),
    asssignedTo:assignedTo?new mongoose.Types.ObjectId(assignedTo):undefined,
    status,
    assignedBy :new mongoose.Types.ObjectId(req.user._id),
    attachments,

   })
return res
.status(201)
.json(
    new ApiResponse(201,task,"task created succesfullly")
);
});
const getTaskById=asyncHandler(async(req,res)=>{
    const{taskId}=req.params
    const task=await Task.aggregate([
        {
            $match:{
                _id:new mongoose.Types.ObjectId(taskId)
            }
        },
        {
            $lookup:{
                from:"users",
                localField:"assignedTo",
                foreignField:"_id",
                as:"assignedTo",
                pipeline:[
                    {
                        _id:1,
                        username:1,
                        fullName:1,
                        avatar:1,
                    }
                ]
            }
        },
        {
            $lookup:{
                from:"subTasks",
                localField:"_id",
                foreignField:"task",
                as:"subtasks",
                pipeline:[

                    {
                        $lookup:{
                            from:"users",
                localField:"createdBy",
                foreignField:"_id",
                as:"createdBy",
                pipeline:[
                    {
                        $project:{
                            _id:1,
                            username:1,
                            avatar:1,
                            fullName:1
                        }
                    }
                ]

                        }
                    },
                    {
                        $addFields:{
                            createdBy:{
                                $arrayElementAt:["createdBy",0]
                            }
                        }
                    }
                ]
                


            }
              
        },
        {
            $addFields:{
                assignedTo:{
                    $arrayElemAt:["$assignedTo",0]
                }
            }
        }
    ]);
    if(!task || task.length===0){
        throw new ApiError(404,"task not found")
    }
    return res
    .status(200)
    .json(
        new ApiResponse(200,task[0],"task fetched succesfully")
    )

});
const updateTask=asyncHandler(async(req,res)=>{

});

const deleteTask=asyncHandler(async(req,res)=>{

});

const createSubTask=asyncHandler(async(req,res)=>{

});

const updateSubTask=asyncHandler(async(req,res)=>{

});

const deleteSubTask=asyncHandler(async(req,res)=>{

});

export{
    createSubTask,createTasks,deleteTask,deleteSubTask,updateSubTask,updateTask,getTaskById,getTasks
}
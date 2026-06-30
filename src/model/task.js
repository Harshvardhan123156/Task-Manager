import mongoose from "mongoose";
import validator from 'validator'

const taskSchema= new mongoose.Schema({
    description:{
        type:String,
        required:true,
        trim:true
    },
    completed:{
        defualt:false,
        type:Boolean
    },
    owner:{
        type:mongoose.Schema.Types.ObjectId,
        required:true,
        ref:'User'
    }
},{
    timestamps:true
})

export const Task=mongoose.model('Task',taskSchema)
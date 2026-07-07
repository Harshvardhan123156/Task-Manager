import express from 'express'
import { Task } from '../model/task.js'
import { auth } from '../middleware/auth.js'

export const router = new express.Router()

router.post('/tasks', auth , async (req,res)=>{
    const task=new Task({
        ...req.body,
        owner:req.user._id
    })
    try {
        await task.save()
        res.status(201).send(task)
    } catch (e) {
        res.status(400).send(e)
    }/*
    task.save().then(()=>{
        res.status(201).send(task)
    }).catch((error)=>{
        res.send(error)
    })*/
})

router.get('/tasks',auth,async(req,res)=>{
    const match={}
    const sort={}

    if(req.query.completed){
        match.completed = req.query.completed === 'true'
    }

    if(req.query.sortBy){
        const parts= req.query.sortBy.split(':')
        sort[parts[0]]=parts[1]==='desc'? -1:1
    }
    try {
        await req.user.populate({
            path:'tasks',
            match,
            options:{
                limit:req.query.limit,
                skip:req.query.skip
            }
        })
        res.send(req.user.tasks)
    } catch (e) {
        res.status(500).send()
    }/*
    Task.find({}).then((tasks)=>{
        res.send(tasks)
    }).catch((e)=>{
        res.status(500).send()
    })*/
})

router.get('/tasks/:id', auth , async (req,res) => {
    const _id=req.params.id
    try {
        const task=await Task.findOne({_id,owner:req.user._id})
        if(!task){
            return res.status(404).send()
        }
        res.send(task)
    } catch (e) {
        res.status(500).send()
    }/*
    Task.findById(_id).then((task)=>{
        if(!task){
            return res.status(404).send()
        }
        res.send(task)
    }).catch((e)=>{
        res.status(500).send()
    })*/
})

router.patch('/tasks/:id',auth,async (req,res)=>{
    const allowedupdates=['description','completed']
    const updates=Object.keys(req.body)
    const isvalidupdate=updates.every((update)=>{return updates.includes(update)})

    if(!isvalidupdate){
        return res.status(404).send()
    }

    try {
        const task = await Task.findOne({_id:req.params.id,owner:req.user._id})
        if(!task){
            res.status(404).send()
        }
        updates.forEach((update)=>task[update]=req.body[update])
        await task.save()

        //const task=await Task.findByIdAndUpdate(_id,req.body,{new:true,runValidators:true})
        res.send(task)
    } catch (error) {
        res.status(400).send(e)
    }
})

router.delete('/tasks/:id',auth,async (req,res)=>{ 
    const _id=req.params.id
    try {
        const task=await Task.findOneAndDelete({_id,owner:req.user._id})
        if(!task){
            return res.status(404).send()
        }
        res.send(task)
    } catch (e) {
        res.status(500).send()
    }
})
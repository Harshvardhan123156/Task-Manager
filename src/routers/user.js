import express from 'express'
import { User } from '../model/user.js'
import { auth } from '../middleware/auth.js'
import multer from 'multer'
import sharp from 'sharp'
import { sendCancelationEmail, sendWelcomeEmail } from '../emails/account.js'

const upload= multer({
    limits:{
        fileSize:7000000
    },
    fileFilter(req,file,cb){
        if(!file.originalname.match(/\.(jpg|jpeg|png)$/)){
            return cb(new Error('Please upload in a valid format'))
        }
        cb(undefined,true)
    }
})

export const router = new express.Router()

router.post('/users',async (req,res)=>{
    const user=await new User(req.body)
    try {
        await user.save()
        sendWelcomeEmail(user.email,user.name)
        const token = await user.generateAuthToken()
        res.status(201).send({user,token})
    } catch (e) {
        console.log(e)
        res.status(400).send(e)
    }
    /*user.save().then(()=>{
        res.status(201).send(user)
    }).catch((error)=>{
        res.status(400).send(error)
    })*/
})

router.get('/users/me',auth,async (req,res)=>{
    res.send(req.user)
    /*
    User.find({}).then((users)=>{
        res.send(users)
    }).catch((e)=>{
        res.status(500).send()
    })*/
})

router.post('/users/login',async(req,res)=>{
    try {
        const user=await User.findByCredentials(req.body.email,req.body.password)
        const token = await user.generateAuthToken()
        res.send({user,token})
    } catch (e) {
        res.status(400).send()
    }
})

router.post('/users/logout',auth,async(req,res)=>{
    try {
        req.user.tokens=req.user.tokens.filter((token)=>{
            return token.token!==req.token
        })
        await req.user.save()
        res.send()
    } catch (e) {
        res.status(500).send()
    }
})

router.post('/users/logoutAll',auth,async(req,res)=>{
    try {
        req.user.tokens=[]
        await req.user.save()
        res.send()
    } catch (e) {
        res.status(500).send()
    }
})

router.patch('/users/me',auth,async (req,res)=>{
    const updates= Object.keys(req.body)
    const allowedupdates=['name','age','password','email']
    const isvalidupdate=updates.every((update)=>{return allowedupdates.includes(update)})
    if(!isvalidupdate){
        return res.status(404).send({error:'Invalid update field!'})
    }

    try {
        updates.forEach((update)=>req.user[update]=req.body[update])

        await req.user.save()
        //const user = await User.findByIdAndUpdate(_id,req.body,{new:true,runValidators:true})
        res.send(req.user)
    } catch (e) {
        res.status(400).send(e)
    }
})

router.delete('/users/me',auth,async (req,res)=>{
    try {
        await req.user.deleteOne()
        sendCancelationEmail(req.user.email,req.user.name)
        res.send(req.user)
    } catch (e) {
        res.status(500).send()
    }
})

//file uploads and crud operations on it...

router.post('/users/me/avatar',auth,upload.single('avatar'),async (req,res)=>{
    const buffer = await sharp(req.file.buffer).resize({width:250,height:250}).png().toBuffer()
    req.user.avatar=buffer
    await req.user.save()
    res.send()
},(error,req,res,next)=>{
    res.status(404).send({error:error.message})
})

router.get('/users/:id/avatar',async(req,res)=>{
    try {
        const user=await User.findById(req.params.id)

        if(!user || !user.avatar){
            throw new Error()
        }
        res.set('Content-Type','image/png')
        res.send(user.avatar)
    } catch (e) {
        res.status(404).send()
    }
})

router.delete('/users/me/avatar',auth,upload.single('avatar'),async(req,res)=>{
    req.user.avatar=undefined
    await req.user.save()
    res.status(200).send()
},(error,req,res,next)=>{
    res.status(404).send({error:error.message})
})



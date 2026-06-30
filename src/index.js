import express from 'express'
import './db/mongoose.js'
import { router as userRouter } from './routers/user.js'
import { router as taskRouter } from './routers/task.js'
import { Task } from './model/task.js'
import { User } from './model/user.js'
import multer from 'multer'

const app=express()
const port = process.env.PORT

/*app.use((req,res,next)=>{
    console.log(req.method ,req.path)
    next()
})

app.use((req,res,next)=>{
    res.status(503).send('Site under maintainance!')
    next()
})*/

app.use(express.json())
app.use(userRouter)
app.use(taskRouter)

app.listen(port,()=>{
    console.log('Runing on port '+port)
})
/*const main = async ()=>{
    /*const task=await Task.findById('6a3a3809559c4f5e565be838')
    await task.populate('owner')
    console.log(task.owner)*/

/*    const user=await User.findById('6a3a37ec141e4cd2b2feb595')
    await user.populate('tasks')
    console.log(user.tasks)
}*/

//main()
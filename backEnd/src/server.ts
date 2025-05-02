import express from 'express'
import cors from 'cors';


import 'dotenv/config'
import router from './router'
import { connectDB } from './config/db';
import { corsConfig } from './config/cors';


const app  = express()
connectDB()

//Cors
//app.use(cors(corsConfig))
app.use(cors())

//Lee datos de formularios
app.use(express.json())
// app.use(express.urlencoded({ extended: true }))

app.use("/", router)

export default app
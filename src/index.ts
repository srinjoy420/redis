import express from "express";
import axios from "axios";
import dotenv from "dotenv"
dotenv.config()

const app =express()
const PORT= process.env.PORT ?? 8000
app.get("/",(req,res)=>{
    return res.json({status:"ssuccess"})
})
app.get("/books",async(req,res)=>{
    const response=await axios.get("https://api.freeapi.app/api/v1/public/books");
    return res.json(response)
})
app.listen(PORT,()=>console.log(`server is running at PORt:${PORT}`)
);
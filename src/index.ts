import express from "express";
import axios from "axios";
import Redis from "ioredis";
import dotenv from "dotenv"
dotenv.config()
const app = express()
const PORT = process.env.PORT ?? 8000
const redis = new Redis({ host: 'localhost', port: Number(6379) })

// rate limitig
app.use(async function(req,res,next){
   // const key1=`rate limit${_id}`; //per user rate limiting
    const key="rate-limit";
    const value=await redis.get(key)
    if(value===null){
         redis.set(key,0)
         redis.expire(key,60) //remove after 60 secoend
    }
    if(value && Number(value)>10){
        return res.status(429).json({message:"too many request"})
    }
   

    redis.incr(key) //increment by 1
    next()


})


// queee systerm

// redis.lpush("video-queue0",'video-url1')
// redis.lpush("video-queue0",'video-url1')
// redis.lpush("video-queue0",'video-url1')
// redis.lpush("video-queue0",'video-url1')


// interface CacheStore {
//     totalpageCount: number
// }
// const cacheStore: CacheStore = {
//     totalpageCount: 0
// }
app.get("/", (req, res) => {
    return res.json({ status: "ssuccess" })
})
app.get("/books", async (req, res) => {
    const response = await axios.get("https://api.freeapi.app/api/v1/public/books");
    return res.json(response.data)
})
app.get("/books/total", async (req, res) => {
    //check cache
    //  if(cacheStore.totalpageCount){
    //     console.log(`cache hit`)
    //       return res.json({totalpageCount:Number(cacheStore.totalpageCount)})
    //  }

    // using redis
    const cachedValue = await redis.get("totalpageValue")
    if (cachedValue) {
        console.log(`cache hit`)
        return res.json({ totalpageCount: Number(cachedValue) })

    }
    const response = await axios.get("https://api.freeapi.app/api/v1/public/books");
    const totalpageCount = response?.data?.data?.data.reduce(
        (acc: number, curr: { volumeInfo?: { pageCount?: number } }) => !curr.volumeInfo?.pageCount ? 0 : curr.volumeInfo.pageCount + acc,
        0
    )
    //set the cache
    // cacheStore.totalpageCount = Number(totalpageCount);
    await redis.set("totalpageValue",totalpageCount)
    console.log(`cache Miss`)
    console.log(totalpageCount);

    return res.json({ totalpageCount })
})
app.listen(PORT, () => console.log(`server is running at PORt:${PORT}`)
);
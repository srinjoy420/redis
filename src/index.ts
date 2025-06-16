import express from "express";
import axios from "axios";
import Redis from "ioredis";
import dotenv from "dotenv"
dotenv.config()
const redis = new Redis({ host: 'localhost', port: Number(6379) })

const app = express()
const PORT = process.env.PORT ?? 8000
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
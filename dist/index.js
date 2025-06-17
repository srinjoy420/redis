"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const axios_1 = __importDefault(require("axios"));
const ioredis_1 = __importDefault(require("ioredis"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const app = (0, express_1.default)();
const PORT = (_a = process.env.PORT) !== null && _a !== void 0 ? _a : 8000;
const redis = new ioredis_1.default({ host: 'localhost', port: Number(6379) });
// rate limitig
app.use(function (req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        // const key1=`rate limit${_id}`; //per user rate limiting
        const key = "rate-limit";
        const value = yield redis.get(key);
        if (value === null) {
            redis.set(key, 0);
            redis.expire(key, 60); //remove after 60 secoend
        }
        if (value && Number(value) > 10) {
            return res.status(429).json({ message: "too many request" });
        }
        redis.incr(key); //increment by 1
        next();
    });
});
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
    return res.json({ status: "ssuccess" });
});
app.get("/books", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const response = yield axios_1.default.get("https://api.freeapi.app/api/v1/public/books");
    return res.json(response.data);
}));
app.get("/books/total", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    //check cache
    //  if(cacheStore.totalpageCount){
    //     console.log(`cache hit`)
    //       return res.json({totalpageCount:Number(cacheStore.totalpageCount)})
    //  }
    var _a, _b;
    // using redis
    const cachedValue = yield redis.get("totalpageValue");
    if (cachedValue) {
        console.log(`cache hit`);
        return res.json({ totalpageCount: Number(cachedValue) });
    }
    const response = yield axios_1.default.get("https://api.freeapi.app/api/v1/public/books");
    const totalpageCount = (_b = (_a = response === null || response === void 0 ? void 0 : response.data) === null || _a === void 0 ? void 0 : _a.data) === null || _b === void 0 ? void 0 : _b.data.reduce((acc, curr) => { var _a; return !((_a = curr.volumeInfo) === null || _a === void 0 ? void 0 : _a.pageCount) ? 0 : curr.volumeInfo.pageCount + acc; }, 0);
    //set the cache
    // cacheStore.totalpageCount = Number(totalpageCount);
    yield redis.set("totalpageValue", totalpageCount);
    console.log(`cache Miss`);
    console.log(totalpageCount);
    return res.json({ totalpageCount });
}));
app.listen(PORT, () => console.log(`server is running at PORt:${PORT}`));

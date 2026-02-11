import dotenv from'dotenv';
import { ChatOpenAI } from'@langchain/openai';

dotenv.config();// 将 .env 文件内容加载到 process.env

const model = new ChatOpenAI({ 
    modelName: process.env.MODEL_NAME || "qwen-coder-turbo",
    apiKey: process.env.OPENAI_API_KEY,
    configuration: {
        baseURL: process.env.OPENAI_BASE_URL,
    },
});

const response = await model.invoke("介绍下自己");
console.log(response.content);
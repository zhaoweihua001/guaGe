import "dotenv/config";
import"cheerio";
import { CheerioWebBaseLoader } from"@langchain/community/document_loaders/web/cheerio";
import { RecursiveCharacterTextSplitter } from"@langchain/textsplitters";

const cheerioLoader = new CheerioWebBaseLoader(
"https://juejin.cn/post/7233327509919547452",
  {
    selector: '.main-area p'
  }
);

const documents = await cheerioLoader.load();
const textsplitters = new RecursiveCharacterTextSplitter({ 
  chunkSize: 400 ,//每块的大小
  chunkOverlap: 50,//重叠的大小
  separators: ['。', '！', '？'],//分隔符
});
const splitDocuments = await textsplitters.splitDocuments(documents);
console.log(splitDocuments);
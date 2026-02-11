import "dotenv/config";
import { MilvusClient } from '@zilliz/milvus2-sdk-node';
import { OpenAIEmbeddings } from "@langchain/openai";

const COLLECTION_NAME = 'ai_diary';
const VECTOR_DIM = 1024;

const embeddings = new OpenAIEmbeddings({
  apiKey: process.env.OPENAI_API_KEY,
  model: process.env.EMBEDDINGS_MODEL_NAME,
  configuration: {
    baseURL: process.env.OPENAI_BASE_URL
  },
  dimensions: VECTOR_DIM
});

const client = new MilvusClient({
  address: 'localhost:19530'
});

async function getEmbedding(text) {
  const result = await embeddings.embedQuery(text);
  return result;
}

async function main() {
  const totalStart = Date.now(); // 总开始时间

  try {
    console.log('='.repeat(80));
    console.log('Milvus 数据更新示例');
    console.log('='.repeat(80));

    // 连接到 Milvus
    console.log('\n【1. 连接到 Milvus】');
    const connectStart = Date.now();
    await client.connectPromise;
    const connectTime = Date.now() - connectStart;
    console.log(`→ 耗时: ${connectTime} ms`);

    // 更新数据（Milvus 通过 upsert 实现更新）
    console.log('\n【2. 更新日记条目】');
    const updateId = 'diary_001';
    const updatedContent = {
      id: updateId,
      content: '今天下了一整天的雨，心情很糟糕。工作上遇到了很多困难，感觉压力很大。一个人在家，感觉特别孤独。',
      date: '2026-01-10',
      mood: 'sad',
      tags: ['生活', '散步', '朋友']
    };

    console.log('生成新的嵌入...');
    const vectorStart = Date.now();
    const vector = await getEmbedding(updatedContent.content);
    const vectorTime = Date.now() - vectorStart;
    console.log(`→ 耗时: ${vectorTime} ms`);

    const updateData = { ...updatedContent, vector };

    console.log('执行 upsert 操作...');
    const upsertStart = Date.now();
    const result = await client.upsert({
      collection_name: COLLECTION_NAME,
      data: [updateData]
    });
    const upsertTime = Date.now() - upsertStart;
    console.log(`→ 耗时: ${upsertTime} ms`);

    console.log(`✓ 更新完成: ${updateId}`);
    console.log(`  新内容: ${updatedContent.content}`);
    console.log(`  新心情: ${updatedContent.mood}`);
    console.log(`  新标签: ${updatedContent.tags.join(', ')}\n`);

    // 打印总耗时
    const totalTime = Date.now() - totalStart;
    console.log(`✅ 总耗时: ${totalTime} ms`);
    console.log(`   ├─ 连接: ${connectTime} ms`);
    console.log(`   ├─ 嵌入生成: ${vectorTime} ms`);
    console.log(`   └─ Upsert 操作: ${upsertTime} ms`);

  } catch (error) {
    console.error('发生错误:', error.message);
    const totalTime = Date.now() - totalStart;
    console.log(`\n❌ 总耗时（含错误）: ${totalTime} ms`);
  }
}

main();
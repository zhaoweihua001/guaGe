import { tool } from'@langchain/core/tools';
import fs from'node:fs/promises';
import path from'node:path';
import { spawn } from'node:child_process';
import { z } from'zod';

// 1. 读取文件工具
const readFileTool = tool(
async ({ filePath }) => {
    try {
      const content = await fs.readFile(filePath, 'utf-8');
      console.log(`  [工具调用] read_file("${filePath}") - 成功读取 ${content.length} 字节`);
      return`文件内容:\n${content}`;
    } catch (error) {
      console.log(`  [工具调用] read_file("${filePath}") - 错误: ${error.message}`);
      return`读取文件失败: ${error.message}`;
    }
  },
  {
    name: 'read_file',
    description: '读取指定路径的文件内容',
    schema: z.object({
      filePath: z.string().describe('文件路径'),//describe('文件路径')给大模型看的参数用法
    }),//传入的参数必须是对象、必须包含 filePath、必须是字符串
  }
);

// 2. 写入文件工具
const writeFileTool = tool(
  async ({ filePath, content }) => {  // 接收文件路径和内容两个参数
    try {
      const dir = path.dirname(filePath);  // 获取文件路径中的目录部分
      await fs.mkdir(dir, { recursive: true });  // 如果不存在，递归创建目录，而不是报错
      await fs.writeFile(filePath, content, 'utf-8');  // 以utf-8编码写入文件
      console.log(`  [工具调用] write_file("${filePath}") - 成功写入 ${content.length} 字节`);  // 记录成功日志
      return `文件写入成功: ${filePath}`;  // 返回成功信息
    } catch (error) {  // 捕获异常
      console.log(`  [工具调用] write_file("${filePath}") - 错误: ${error.message}`);  // 记录错误日志
      return `写入文件失败: ${error.message}`;  // 返回错误信息
    }
  },
  {
    name: 'write_file',  // 工具名称
    description: '向指定路径写入文件内容，自动创建目录',  // 工具描述
    schema: z.object({
      filePath: z.string().describe('文件路径'),  // 定义filePath参数为字符串类型，必填
      content: z.string().describe('要写入的文件内容')  // 定义content参数为字符串类型，必填
    }),
  }
);

// 3. 执行命令工具（带实时输出）
const executeCommandTool = tool(
  async ({ command, workingDirectory }) => {
    const cwd = workingDirectory || process.cwd();

    console.log(
      `  [工具调用] execute_command("${command}")${
        workingDirectory ? ` - 工作目录: ${workingDirectory}` : ''
      }`
    );

    return new Promise((resolve) => {
      // Windows 固定使用 PowerShell
      const child = spawn(
        'powershell.exe',
        ['-NoProfile', '-Command', command],
        {
          cwd,
          env: process.env, // 关键：继承当前环境变量（包含 pnpm）
          stdio: ['ignore', 'pipe', 'pipe'], // 捕获输出
        }
      );

      let stdout = '';
      let stderr = '';

      // 实时输出 stdout
      child.stdout.on('data', (data) => {
        const text = data.toString();
        stdout += text;
        process.stdout.write(text);
      });

      // 实时输出 stderr
      child.stderr.on('data', (data) => {
        const text = data.toString();
        stderr += text;
        process.stderr.write(text);
      });

      child.on('error', (error) => {
        resolve(`命令执行错误: ${error.message}`);
      });

      child.on('close', (code) => {
        if (code === 0) {
          resolve(`命令执行成功:\n${stdout}`);
        } else {
          resolve(
            `命令执行失败 (退出码 ${code}):\n${stderr || stdout}`
          );
        }
      });
    });
  },
  {
    name: 'execute_command',
    description: '在 Windows PowerShell 中执行系统命令，支持指定工作目录',
    schema: z.object({
      command: z.string().describe('要执行的命令'),
      workingDirectory: z.string().optional().describe('工作目录'),
    }),
  }
);

// 4. 列出目录内容工具
const listDirectoryTool = tool(
async ({ directoryPath }) => {
    try {
      const files = await fs.readdir(directoryPath);
      console.log(`  [工具调用] list_directory("${directoryPath}") - 找到 ${files.length} 个项目`);
      return`目录内容:\n${files.map(f => `- ${f}`).join('\n')}`;
    } catch (error) {
      console.log(`  [工具调用] list_directory("${directoryPath}") - 错误: ${error.message}`);
      return`列出目录失败: ${error.message}`;
    }
  },
  {
    name: 'list_directory',
    description: '列出指定目录下的所有文件和文件夹',
    schema: z.object({
      directoryPath: z.string().describe('目录路径'),
    }),
  }
);

export { readFileTool, writeFileTool, executeCommandTool, listDirectoryTool };
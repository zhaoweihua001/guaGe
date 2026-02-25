import { spawn } from 'node:child_process';

// // 定义要执行的命令
// const command = '-e "n\nn" | pnpm create vite react-todo-app --template react-ts';

// // 获取当前工作目录
// const cwd = process.cwd();
// // 解析命令和参数
// const [cmd, ...args] = command.split(' ');

// // 使用 spawn 创建子进程执行命令
// const child = spawn(cmd, args, {
//   cwd, // 设置子进程的工作目录
//   stdio: 'inherit', // 实时输出到控制台（继承父进程的 stdin, stdout, stderr）
//   // shell: true, // 使用 shell 执行命令
// });
const POWERSHELL_PATH = 'C:\\Windows\\System32\\WindowsPowerShell\\v1.0\\powershell.exe';
const command = `"n\`nn\`n" | pnpm create vite react-todo-app --template react-ts`;
// 获取当前工作目录
const cwd = process.cwd();
// 使用 spawn 创建子进程执行命令
const child = spawn(POWERSHELL_PATH, ['-NoProfile', '-Command', command], {
  cwd,
  stdio: 'inherit'  // 继承父进程的 stdin/stdout/stderr
});

// 用于存储错误信息
let errorMsg = '';

// 监听子进程的错误事件
child.on('error', (error) => {
  errorMsg = error.message;
});

// 监听子进程的关闭事件
child.on('close', (code) => {
  // 如果命令执行成功（退出码为0）
  if (code === 0) {
    process.exit(0); // 正常退出
  } else {
    // 如果有错误信息，则输出到控制台
    if (errorMsg) {
      console.error(`错误: ${errorMsg}`);
    }
    // 以错误码退出进程，如果没有错误码则使用默认值1
    process.exit(code || 1);
  }
});
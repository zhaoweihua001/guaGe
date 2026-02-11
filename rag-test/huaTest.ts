// test.ts
declare const SupportedTextSplitterLanguages: readonly [
  "cpp", "go", "java", "js", "php", "proto", "python", "rst",
  "ruby", "rust", "scala", "swift", "markdown", "latex", "html", "sol"
];
type SupportedTextSplitterLanguage = (typeof SupportedTextSplitterLanguages)[number];

// 写一个使用该类型的函数
function setLanguage(lang: SupportedTextSplitterLanguage) {
  console.log("Using language:", lang);
}

// 在这里触发智能提示 👇
setLanguage(
  // 把光标放在这里，按 Ctrl+Space（Windows/Linux）或 Cmd+Space（Mac）
  
);
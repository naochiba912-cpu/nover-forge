/**
 * 完成した小説をテキストファイルとしてダウンロードする
 */
export function downloadAsTextFile(text, title) {
  const blob = new Blob([text], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `${title || "novel"}.txt`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * 章の配列から全文テキストを組み立てる
 */
export function buildFullText(setup, chapters) {
  let text = `『${setup.title}』\n\n`;
  text += `ジャンル: ${setup.genre}\n`;
  text += "=".repeat(50) + "\n\n";

  for (const chapter of chapters) {
    text += `\n${"─".repeat(30)}\n`;
    text += `  ${chapter.title}\n`;
    text += `${"─".repeat(30)}\n\n`;
    text += chapter.content + "\n\n";
  }

  return text;
}

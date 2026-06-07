import { useNovel } from "../context/NovelContext";

export default function StatusBar() {
  const { phase, chapters, isGenerating, setup } = useNovel();

  const charCount = chapters.reduce(
    (sum, ch) => sum + (ch.content?.length || 0),
    0
  );
  const chapterCount = chapters.filter((ch) => ch.type === "chapter").length;

  return (
    <div className="status-bar">
      <div className="status-bar-item">
        <span
          className={`status-indicator ${isGenerating ? "generating" : ""}`}
        />
        <span>{isGenerating ? "AI生成中..." : "準備完了"}</span>
      </div>
      <div className="status-bar-item">
        <span>📝</span>
        <span>{chapterCount} 章</span>
      </div>
      <div className="status-bar-item">
        <span>📊</span>
        <span>{charCount.toLocaleString()} 文字</span>
      </div>
      <span className="status-bar-spacer" />
      {setup && (
        <div className="status-bar-item">
          <span>📚</span>
          <span>{setup.genre}</span>
        </div>
      )}
      <div className="status-bar-item">
        <span>AI Provider: Mock</span>
      </div>
    </div>
  );
}

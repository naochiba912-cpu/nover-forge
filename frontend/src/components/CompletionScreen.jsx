import { useState } from "react";
import { useNovel, useNovelDispatch } from "../context/NovelContext";
import { novelApi } from "../hooks/useNovelApi";
import { downloadAsTextFile } from "../utils/exportUtils";
import ChapterViewer from "./ChapterViewer";

export default function CompletionScreen() {
  const { setup, chapters, viewingChapter } = useNovel();
  const dispatch = useNovelDispatch();
  const [isExporting, setIsExporting] = useState(false);
  const [showFullText, setShowFullText] = useState(true);

  const charCount = chapters.reduce(
    (sum, ch) => sum + (ch.content?.length || 0),
    0
  );
  const chapterCount = chapters.filter((ch) => ch.type === "chapter").length;

  const handleExport = async () => {
    setIsExporting(true);
    try {
      const { buildFullText } = await import("../utils/exportUtils");
      const text = buildFullText(setup, chapters);
      downloadAsTextFile(text, setup.title);
    } catch (err) {
      console.error("Export error:", err);
    } finally {
      setIsExporting(false);
    }
  };

  const handleNewNovel = () => {
    dispatch({ type: "RESET" });
  };

  return (
    <div className="content-area">
      <div className="content-scroll">
        <div className="fade-in">
          {/* 完成ヘッダー */}
          <div className="completion-header">
            <h1>🎉 完成おめでとうございます！</h1>
            <p>『{setup?.title}』が完成しました</p>
          </div>

          {/* 統計 */}
          <div className="completion-stats">
            <div className="stat-item">
              <div className="stat-value">{chapterCount}</div>
              <div className="stat-label">章</div>
            </div>
            <div className="stat-item">
              <div className="stat-value">
                {charCount.toLocaleString()}
              </div>
              <div className="stat-label">文字</div>
            </div>
            <div className="stat-item">
              <div className="stat-value">{chapters.length}</div>
              <div className="stat-label">セクション</div>
            </div>
          </div>

          {/* アクションボタン */}
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              gap: "var(--sp-md)",
              marginBottom: "var(--sp-xl)",
            }}
          >
            <button
              className="btn btn-primary btn-lg"
              onClick={handleExport}
              disabled={isExporting}
            >
              {isExporting
                ? "⏳ エクスポート中..."
                : "📥 テキストファイルをダウンロード"}
            </button>
            <button className="btn btn-lg" onClick={handleNewNovel}>
              📖 新しい小説を書く
            </button>
          </div>

          {/* 章ナビゲーション */}
          <div className="panel">
            <div className="panel-header">
              <span className="panel-title">📚 全文プレビュー</span>
            </div>

            <div
              style={{
                display: "flex",
                gap: "var(--sp-xs)",
                flexWrap: "wrap",
                marginBottom: "var(--sp-md)",
              }}
            >
              <button
                className={`btn btn-sm ${showFullText ? "btn-primary" : ""}`}
                onClick={() => setShowFullText(true)}
              >
                全文
              </button>
              {chapters.map((ch, idx) => (
                <button
                  key={ch.id}
                  className={`btn btn-sm ${!showFullText && viewingChapter?.id === ch.id ? "btn-primary" : ""}`}
                  onClick={() => {
                    setShowFullText(false);
                    dispatch({ type: "SELECT_CHAPTER", payload: idx });
                  }}
                >
                  {ch.title}
                </button>
              ))}
            </div>

            {showFullText ? (
              <div className="novel-text" style={{ maxHeight: "600px" }}>
                {chapters.map((ch) => `\n── ${ch.title} ──\n\n${ch.content}`).join("\n\n")}
              </div>
            ) : (
              <div style={{ marginTop: "var(--sp-md)" }}>
                <ChapterViewer />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

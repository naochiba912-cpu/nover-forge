import { useState } from "react";
import { useNovel, useNovelDispatch } from "../context/NovelContext";
import { novelApi } from "../hooks/useNovelApi";
import GeneratingOverlay from "./GeneratingOverlay";
import ChapterViewer from "./ChapterViewer";
import IdeaAssistPanel from "./IdeaAssistPanel";

export default function ChapterEditor() {
  const { setup, chapters, isGenerating, phase } = useNovel();
  const dispatch = useNovelDispatch();
  const [setting, setSetting] = useState("");
  const [customTitle, setCustomTitle] = useState("");
  const [isFinal, setIsFinal] = useState(false);
  const [error, setError] = useState("");

  const currentChapterNumber =
    chapters.filter((ch) => ch.type === "chapter").length;
  const nextChapterNumber = currentChapterNumber + 1;

  const handleIdeaSelect = (idea) => {
    setSetting(idea);
  };

  const handleGenerate = async () => {
    if (!setting.trim()) {
      setError("この章の展開メモを入力してください。");
      return;
    }

    setError("");
    dispatch({ type: "SET_GENERATING", payload: true });

    try {
      const result = await novelApi.generateChapter(setup, chapters, setting.trim(), isFinal, customTitle.trim());
      dispatch({ type: "ADD_GENERATED_CHAPTER", payload: result.chapter });
      setSetting("");
      setCustomTitle("");
      setIsFinal(false);
    } catch (err) {
      setError(err.message || "章の生成に失敗しました。");
    } finally {
      dispatch({ type: "SET_GENERATING", payload: false });
    }
  };

  return (
    <div className="content-area">
      {/* 閲覧中の章の表示 */}
      <ChapterViewer />

      {/* 次の章の入力フォーム（writingフェーズのみ） */}
      {phase === "writing" && (
        <div className="panel fade-in" style={{ marginTop: "var(--sp-lg)" }}>
          <div className="panel-header">
            <span className="panel-title">
              📝 第{nextChapterNumber}章の執筆
            </span>
          </div>

          {setup?.mode === "easy" && (
            <div style={{ marginBottom: "var(--sp-lg)" }}>
              <IdeaAssistPanel onSelect={handleIdeaSelect} phase="chapter" chapters={chapters} />
            </div>
          )}

          <div className="form-group" style={{ marginBottom: "var(--sp-md)" }}>
            <label className="form-label">📝 章のタイトル（オプション）</label>
            <input
              type="text"
              className="form-input"
              value={customTitle}
              onChange={(e) => setCustomTitle(e.target.value)}
              placeholder="空欄の場合はAIが内容に合わせてタイトルを考えます"
            />
          </div>

          <div className="form-group">
            <label className="form-label">📝 章の展開メモ</label>
            <textarea
              className="form-textarea"
              value={setting}
              onChange={(e) => setSetting(e.target.value)}
              placeholder={`第${nextChapterNumber}章の展開メモを入力してください。\n\n例:\n・前章の謎が一つ解ける\n・新しい仲間との出会い\n・敵の正体が少し見える`}
              style={{ minHeight: "120px", width: "100%" }}
            />
          </div>

          <div className="actions-bar">
            <div className="actions-bar-left">
              <label className="form-checkbox">
                <input
                  type="checkbox"
                  checked={isFinal}
                  onChange={(e) => setIsFinal(e.target.checked)}
                />
                <span>🏁 最終章（次はエピローグ）</span>
              </label>
            </div>
            <div className="actions-bar-right">
              <button
                className="btn btn-primary"
                onClick={handleGenerate}
                disabled={isGenerating || !setting.trim()}
              >
                ✍️ 第{nextChapterNumber}章を生成
              </button>
            </div>
          </div>

          {error && (
            <div
              style={{
                padding: "var(--sp-sm) var(--sp-md)",
                background: "#fdecea",
                color: "var(--error)",
                border: "1px solid #f5c6cb",
                borderRadius: "var(--radius-md)",
                fontSize: "var(--fs-sm)",
                marginTop: "var(--sp-sm)",
              }}
            >
              ⚠️ {error}
            </div>
          )}
        </div>
      )}

      {isGenerating && <GeneratingOverlay message="次の章を執筆中..." />}
    </div>
  );
}

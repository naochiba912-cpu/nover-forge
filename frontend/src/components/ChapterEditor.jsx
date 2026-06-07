import { useState } from "react";
import { useNovel, useNovelDispatch } from "../context/NovelContext";
import { novelApi } from "../hooks/useNovelApi";
import GeneratingOverlay from "./GeneratingOverlay";
import ChapterViewer from "./ChapterViewer";
import IdeaAssistPanel from "./IdeaAssistPanel";
import ResizableLayout from "./ResizableLayout";

export default function ChapterEditor() {
  const { setup, chapters, isGenerating, phase } = useNovel();
  const dispatch = useNovelDispatch();
  const [setting, setSetting] = useState("");
  const [customTitle, setCustomTitle] = useState("");
  const [isFinal, setIsFinal] = useState(false);
  const [error, setError] = useState("");
  const [isEditingChapter, setIsEditingChapter] = useState(false);

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

  const topContent = <ChapterViewer onEditStateChange={setIsEditingChapter} />;

  const bottomContent = phase === "writing" ? (
    <div className="panel fade-in">
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
          style={{ minHeight: "120px", width: "100%", resize: "none" }}
        />
      </div>

      <div className="actions-bar">
        <div className="actions-bar-left">
          <label className="checkbox-label" style={{ cursor: "pointer" }}>
            <input
              type="checkbox"
              checked={isFinal}
              onChange={(e) => setIsFinal(e.target.checked)}
            />
            <span>🏁 この章を最終章（クライマックス）にする</span>
          </label>
        </div>
        <div className="actions-bar-right">
          <button
            className="btn btn-primary btn-lg"
            onClick={handleGenerate}
            disabled={isGenerating || !setting.trim()}
          >
            📖 章を生成する
          </button>
        </div>
      </div>
      
      {error && (
        <div style={{ color: "var(--error)", fontSize: "var(--fs-sm)", marginTop: "var(--sp-sm)" }}>
          ⚠️ {error}
        </div>
      )}
    </div>
  ) : null;

  return (
    <div className="content-area">
      <ResizableLayout
        topContent={topContent}
        bottomContent={bottomContent}
        hideBottom={isEditingChapter || phase !== "writing"}
      />

      {isGenerating && <GeneratingOverlay message="次の章を執筆中..." />}
    </div>
  );
}

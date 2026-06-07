import { useState } from "react";
import { useNovel, useNovelDispatch } from "../context/NovelContext";
import { novelApi } from "../hooks/useNovelApi";

export default function ChapterViewer() {
  const { setup, chapters, isGenerating, viewingChapter, selectedChapterIndex } = useNovel();
  const dispatch = useNovelDispatch();
  const [error, setError] = useState("");
  
  // やり直しモード
  const [isRedoing, setIsRedoing] = useState(false);
  const [redoSetting, setRedoSetting] = useState("");
  const [redoCustomTitle, setRedoCustomTitle] = useState("");

  // 編集モード
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  if (!viewingChapter) return null;

  const handleRedo = async () => {
    if (!viewingChapter || !redoSetting.trim()) return;

    dispatch({ type: "SET_GENERATING", payload: true });
    try {
      const result = await novelApi.redoChapter(
        selectedChapterIndex,
        setup,
        chapters,
        redoSetting.trim(),
        redoCustomTitle.trim()
      );
      dispatch({ 
        type: "REDO_CHAPTER", 
        payload: { chapterIndex: selectedChapterIndex, chapter: result.chapter } 
      });
      setIsRedoing(false);
      setRedoSetting("");
      setRedoCustomTitle("");
    } catch (err) {
      setError(err.message || "やり直しに失敗しました。");
    } finally {
      dispatch({ type: "SET_GENERATING", payload: false });
    }
  };

  const startRedo = () => {
    if (viewingChapter) {
      setRedoSetting(viewingChapter.setting);
      setRedoCustomTitle(""); // やり直すときはタイトル指定をリセットするか、元のタイトルを入れるか。空でOK
      setIsRedoing(true);
      setIsEditing(false);
    }
  };

  const cancelRedo = () => {
    setIsRedoing(false);
    setRedoSetting("");
    setRedoCustomTitle("");
    setError("");
  };

  // 編集モード開始
  const startEditing = () => {
    if (viewingChapter) {
      setEditContent(viewingChapter.content);
      setIsEditing(true);
      setIsRedoing(false);
    }
  };

  // 編集キャンセル
  const cancelEditing = () => {
    setIsEditing(false);
    setEditContent("");
  };

  // 編集内容を保存
  const saveEditing = async () => {
    if (!viewingChapter) return;

    setIsSaving(true);
    try {
      dispatch({
        type: "UPDATE_CHAPTER_CONTENT",
        payload: { chapterId: viewingChapter.id, content: editContent },
      });
      setIsEditing(false);
      setEditContent("");
    } catch (err) {
      setError(err.message || "保存に失敗しました。");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fade-in" style={{ flex: 1, overflow: "hidden", display: "flex", flexDirection: "column" }}>
      <div className="chapter-header">
        <div>
          <h2 className="chapter-title">{viewingChapter.title}</h2>
          <span className="chapter-subtitle">
            {viewingChapter.setting.substring(0, 80)}
            {viewingChapter.setting.length > 80 ? "..." : ""}
          </span>
        </div>
        <div style={{ display: "flex", gap: "var(--sp-sm)" }}>
          {!isEditing && !isRedoing && (
            <button
              className="btn btn-sm"
              onClick={startEditing}
              disabled={isGenerating}
            >
              ✏️ 編集する
            </button>
          )}
          {viewingChapter.type !== "epilogue" && !isEditing && (
            <button
              className="btn btn-danger btn-sm"
              onClick={startRedo}
              disabled={isGenerating}
            >
              🔄 ここからやり直す
            </button>
          )}
        </div>
      </div>

      {/* やり直しモード */}
      {isRedoing && (
        <div
          className="panel fade-in"
          style={{
            border: "2px solid var(--warning)",
            marginBottom: "var(--sp-md)",
          }}
        >
          <div className="panel-header">
            <span className="panel-title">
              🔄 「{viewingChapter.title}」をやり直す
            </span>
            <button className="btn btn-sm" onClick={cancelRedo}>
              ✕ キャンセル
            </button>
          </div>
          <p
            style={{
              fontSize: "var(--fs-xs)",
              color: "var(--warning)",
              marginBottom: "var(--sp-sm)",
            }}
          >
            ⚠️
            この章以降のすべての章が破棄され、ここから新しい展開になります。
          </p>
          
          <div className="form-group" style={{ marginBottom: "var(--sp-sm)" }}>
            <label className="form-label">📝 章のタイトル（オプション）</label>
            <input
              type="text"
              className="form-input"
              value={redoCustomTitle}
              onChange={(e) => setRedoCustomTitle(e.target.value)}
              placeholder="空欄の場合はAIが内容に合わせてタイトルを考えます"
            />
          </div>

          <textarea
            className="form-textarea"
            value={redoSetting}
            onChange={(e) => setRedoSetting(e.target.value)}
            placeholder="修正した展開メモを入力"
            style={{ minHeight: "100px" }}
          />
          {error && (
            <div style={{ color: "var(--error)", fontSize: "var(--fs-sm)", marginTop: "var(--sp-sm)" }}>
              ⚠️ {error}
            </div>
          )}
          <div
            style={{
              marginTop: "var(--sp-sm)",
              display: "flex",
              justifyContent: "flex-end",
              gap: "var(--sp-sm)",
            }}
          >
            <button className="btn" onClick={cancelRedo}>
              キャンセル
            </button>
            <button
              className="btn btn-danger"
              onClick={handleRedo}
              disabled={!redoSetting.trim() || isGenerating}
            >
              🔄 再生成する
            </button>
          </div>
        </div>
      )}

      {/* 編集モード */}
      {isEditing ? (
        <div className="fade-in" style={{ flex: 1, display: "flex", flexDirection: "column" }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "var(--sp-sm) 0",
              marginBottom: "var(--sp-xs)",
            }}
          >
            <span
              style={{
                fontSize: "var(--fs-sm)",
                color: "var(--accent)",
                fontWeight: 600,
                display: "flex",
                alignItems: "center",
                gap: "var(--sp-xs)",
              }}
            >
              ✏️ 編集中 — テキストを自由に修正できます
            </span>
            <div style={{ display: "flex", gap: "var(--sp-sm)" }}>
              <button
                className="btn btn-sm"
                onClick={cancelEditing}
                disabled={isSaving}
              >
                ✕ キャンセル
              </button>
              <button
                className="btn btn-primary btn-sm"
                onClick={saveEditing}
                disabled={isSaving}
              >
                {isSaving ? "⏳ 保存中..." : "💾 保存する"}
              </button>
            </div>
          </div>
          <textarea
            className="form-textarea"
            value={editContent}
            onChange={(e) => setEditContent(e.target.value)}
            style={{
              flex: 1,
              minHeight: "300px",
              fontFamily: "var(--font-novel)",
              fontSize: "15px",
              lineHeight: "2",
              resize: "none",
            }}
          />
        </div>
      ) : (
        /* 生成された本文（読み取り専用） */
        <div className="novel-text" style={{ flex: 1 }}>
          {viewingChapter.content}
        </div>
      )}
    </div>
  );
}

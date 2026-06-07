import { useState } from "react";
import { useNovel, useNovelDispatch } from "../context/NovelContext";
import { novelApi } from "../hooks/useNovelApi";
import GeneratingOverlay from "./GeneratingOverlay";

export default function ChapterEditor() {
  const { setup, chapters, isGenerating, viewingChapter, phase, selectedChapterIndex } = useNovel();
  const dispatch = useNovelDispatch();
  const [setting, setSetting] = useState("");
  const [isFinal, setIsFinal] = useState(false);
  const [error, setError] = useState("");
  const [isRedoing, setIsRedoing] = useState(false);
  const [redoSetting, setRedoSetting] = useState("");

  // 編集モード
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const currentChapterNumber =
    chapters.filter((ch) => ch.type === "chapter").length;
  const nextChapterNumber = currentChapterNumber + 1;

  const handleGenerate = async () => {
    if (!setting.trim()) {
      setError("この章の展開メモを入力してください。");
      return;
    }

    setError("");
    dispatch({ type: "SET_GENERATING", payload: true });

    try {
      const result = await novelApi.generateChapter(setup, chapters, setting.trim(), isFinal);
      dispatch({ type: "ADD_GENERATED_CHAPTER", payload: result.chapter });
      setSetting("");
      setIsFinal(false);
    } catch (err) {
      setError(err.message || "章の生成に失敗しました。");
    } finally {
      dispatch({ type: "SET_GENERATING", payload: false });
    }
  };

  const handleRedo = async () => {
    if (!viewingChapter || !redoSetting.trim()) return;

    dispatch({ type: "SET_GENERATING", payload: true });
    try {
      const result = await novelApi.redoChapter(
        selectedChapterIndex,
        setup,
        chapters,
        redoSetting.trim()
      );
      dispatch({ 
        type: "REDO_CHAPTER", 
        payload: { chapterIndex: selectedChapterIndex, chapter: result.chapter } 
      });
      setIsRedoing(false);
      setRedoSetting("");
    } catch (err) {
      setError(err.message || "やり直しに失敗しました。");
    } finally {
      dispatch({ type: "SET_GENERATING", payload: false });
    }
  };

  const startRedo = () => {
    if (viewingChapter) {
      setRedoSetting(viewingChapter.setting);
      setIsRedoing(true);
      setIsEditing(false);
    }
  };

  const cancelRedo = () => {
    setIsRedoing(false);
    setRedoSetting("");
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
    <div className="content-area">
      {/* 閲覧中の章の表示 */}
      {viewingChapter && (
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
              <textarea
                className="form-textarea"
                value={redoSetting}
                onChange={(e) => setRedoSetting(e.target.value)}
                placeholder="修正した展開メモを入力"
                style={{ minHeight: "100px" }}
              />
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
                  disabled={!redoSetting.trim()}
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
      )}

      {/* 次の章の入力フォーム（writingフェーズのみ） */}
      {phase === "writing" && !isRedoing && !isEditing && (
        <div className="panel fade-in" style={{ marginTop: "var(--sp-lg)" }}>
          <div className="panel-header">
            <span className="panel-title">
              📝 第{nextChapterNumber}章の設定
            </span>
          </div>

          <textarea
            className="form-textarea"
            value={setting}
            onChange={(e) => setSetting(e.target.value)}
            placeholder={`第${nextChapterNumber}章の展開メモを入力してください。\n\n例:\n・前章の謎が一つ解ける\n・新しい仲間との出会い\n・敵の正体が少し見える`}
            style={{ minHeight: "120px", width: "100%" }}
          />

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

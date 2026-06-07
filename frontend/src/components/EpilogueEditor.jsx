import { useState } from "react";
import { useNovel, useNovelDispatch } from "../context/NovelContext";
import { novelApi } from "../hooks/useNovelApi";
import GeneratingOverlay from "./GeneratingOverlay";
import ChapterViewer from "./ChapterViewer";

export default function EpilogueEditor() {
  const { setup, chapters, isGenerating, phase } = useNovel();
  const dispatch = useNovelDispatch();
  const [setting, setSetting] = useState("");
  const [error, setError] = useState("");

  const handleGenerate = async () => {
    if (!setting.trim()) {
      setError("エピローグのあらすじ・設定を入力してください。");
      return;
    }

    setError("");
    dispatch({ type: "SET_GENERATING", payload: true });

    try {
      const result = await novelApi.generateEpilogue(setup, chapters, setting.trim());
      dispatch({ type: "ADD_GENERATED_CHAPTER", payload: result.chapter });
    } catch (err) {
      setError(err.message || "エピローグの生成に失敗しました。");
    } finally {
      dispatch({ type: "SET_GENERATING", payload: false });
    }
  };

  return (
    <div className="content-area">
      <ChapterViewer />

      {phase === "epilogue" && (
        <div className="panel fade-in" style={{ marginTop: "var(--sp-lg)" }}>
          <div className="panel-header">
            <span className="panel-title">🏁 エピローグ設定</span>
          </div>
          <div style={{ marginBottom: "var(--sp-lg)" }}>
            <p style={{ color: "var(--text-secondary)", fontSize: "var(--fs-md)" }}>
              『{setup?.title}』の物語を締めくくるエピローグの設定を入力してください。
            </p>
          </div>

          <textarea
            className="form-textarea"
            value={setting}
            onChange={(e) => setSetting(e.target.value)}
            placeholder={`エピローグの展開を入力してください。\n\n例:\n・物語の後日談\n・主人公のその後\n・世界がどう変わったか`}
            style={{ minHeight: "160px", width: "100%" }}
          />

          {error && (
            <div
              style={{
                padding: "var(--sp-sm) var(--sp-md)",
                background: "#fdecea",
                color: "var(--error)",
                border: "1px solid #f5c6cb",
                borderRadius: "var(--radius-md)",
                fontSize: "var(--fs-sm)",
                marginTop: "var(--sp-md)",
              }}
            >
              ⚠️ {error}
            </div>
          )}

          <div style={{ marginTop: "var(--sp-lg)", textAlign: "right" }}>
            <button
              className="btn btn-primary btn-lg"
              onClick={handleGenerate}
              disabled={isGenerating || !setting.trim()}
            >
              🏁 エピローグを生成して完成させる
            </button>
          </div>
        </div>
      )}

      {isGenerating && (
        <GeneratingOverlay message="エピローグを執筆中..." />
      )}
    </div>
  );
}

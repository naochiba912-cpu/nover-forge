import { useState } from "react";
import { useNovel, useNovelDispatch } from "../context/NovelContext";
import { novelApi } from "../hooks/useNovelApi";
import IdeaAssistPanel from "./IdeaAssistPanel";
import GeneratingOverlay from "./GeneratingOverlay";

export default function PrologueEditor() {
  const { setup, isGenerating } = useNovel();
  const dispatch = useNovelDispatch();
  const [setting, setSetting] = useState("");
  const [error, setError] = useState("");

  const handleGenerate = async () => {
    if (!setting.trim()) {
      setError("プロローグのあらすじ・設定を入力してください。");
      return;
    }

    setError("");
    dispatch({ type: "SET_GENERATING", payload: true });

    try {
      const result = await novelApi.generatePrologue(setup, setting.trim());
      dispatch({ type: "ADD_GENERATED_CHAPTER", payload: result.chapter });
    } catch (err) {
      setError(err.message || "プロローグの生成に失敗しました。");
    } finally {
      dispatch({ type: "SET_GENERATING", payload: false });
    }
  };

  const handleIdeaSelect = (idea) => {
    setSetting(idea);
  };

  return (
    <div className="content-scroll">
      <div className="fade-in" style={{ maxWidth: "800px", margin: "0 auto" }}>
        <div style={{ marginBottom: "var(--sp-xl)" }}>
          <h2
            style={{
              fontSize: "var(--fs-2xl)",
              fontWeight: 700,
              marginBottom: "var(--sp-xs)",
            }}
          >
            プロローグ設定
          </h2>
          <p style={{ color: "var(--text-secondary)", fontSize: "var(--fs-md)" }}>
            『{setup?.title}』のプロローグの設定を入力してください。
          </p>
        </div>

        {/* 設定情報の表示 */}
        <div className="panel" style={{ marginBottom: "var(--sp-lg)" }}>
          <div className="panel-header">
            <span className="panel-title">📋 小説の設定</span>
          </div>
          <div
            className="panel-inset"
            style={{
              display: "grid",
              gridTemplateColumns: "auto 1fr",
              gap: "var(--sp-sm) var(--sp-lg)",
              fontSize: "var(--fs-sm)",
            }}
          >
            <span style={{ color: "var(--text-secondary)", fontWeight: 600 }}>
              タイトル:
            </span>
            <span>{setup?.title}</span>
            <span style={{ color: "var(--text-secondary)", fontWeight: 600 }}>
              ジャンル:
            </span>
            <span>{setup?.genre}</span>
            <span style={{ color: "var(--text-secondary)", fontWeight: 600 }}>
              長さ:
            </span>
            <span>{setup?.length === "short" ? "短編" : "長編"}</span>
            {setup?.world_setting && (
              <>
                <span
                  style={{ color: "var(--text-secondary)", fontWeight: 600 }}
                >
                  世界観:
                </span>
                <span>{setup.world_setting}</span>
              </>
            )}
          </div>
        </div>

        {/* アイデアアシスト（簡単モード時） */}
        {setup?.mode === "easy" && (
          <div style={{ marginBottom: "var(--sp-lg)" }}>
            <IdeaAssistPanel onSelect={handleIdeaSelect} />
          </div>
        )}

        {/* プロローグ設定入力 */}
        <div className="panel">
          <div className="panel-header">
            <span className="panel-title">📝 プロローグのあらすじ・設定</span>
          </div>
          <textarea
            className="form-textarea"
            value={setting}
            onChange={(e) => setSetting(e.target.value)}
            placeholder={`プロローグの展開を箇条書きや文章で入力してください。\n\n例:\n・主人公が不思議な夢を見る\n・目覚めると手に見慣れない紋章が刻まれている\n・街に謎の旅人が現れる`}
            style={{ minHeight: "180px", width: "100%" }}
          />
        </div>

        {/* エラー表示 */}
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

        {/* 生成ボタン */}
        <div style={{ marginTop: "var(--sp-lg)", textAlign: "right" }}>
          <button
            className="btn btn-primary btn-lg"
            onClick={handleGenerate}
            disabled={isGenerating || !setting.trim()}
          >
            📖 プロローグを生成する
          </button>
        </div>
      </div>

      {isGenerating && (
        <GeneratingOverlay message="プロローグを執筆中..." />
      )}
    </div>
  );
}

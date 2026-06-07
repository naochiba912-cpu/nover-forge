import { useState } from "react";
import { useNovel, useNovelDispatch } from "../context/NovelContext";
import { novelApi } from "../hooks/useNovelApi";
import GeneratingOverlay from "./GeneratingOverlay";
import ChapterViewer from "./ChapterViewer";
import IdeaAssistPanel from "./IdeaAssistPanel";
import ResizableLayout from "./ResizableLayout";

export default function EpilogueEditor() {
  const { setup, chapters, isGenerating, phase } = useNovel();
  const dispatch = useNovelDispatch();
  const [setting, setSetting] = useState("");
  const [error, setError] = useState("");
  const [isEditingChapter, setIsEditingChapter] = useState(false);

  const handleIdeaSelect = (idea) => {
    setSetting(idea);
  };

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

  const topContent = <ChapterViewer isEditingProp={isEditingChapter} onEditStateChange={setIsEditingChapter} />;

  const bottomContent = phase === "epilogue" ? (
    <div className="panel fade-in">
      <div className="panel-header">
        <span className="panel-title">🏁 エピローグ設定</span>
      </div>

      <div style={{ marginBottom: "var(--sp-lg)" }}>
        <p style={{ color: "var(--text-secondary)", fontSize: "var(--fs-md)" }}>
          『{setup?.title}』の物語を締めくくるエピローグの設定を入力してください。
        </p>
      </div>

      {setup?.mode === "easy" && (
        <div style={{ marginBottom: "var(--sp-lg)" }}>
          <IdeaAssistPanel onSelect={handleIdeaSelect} phase="epilogue" chapters={chapters} />
        </div>
      )}

      <textarea
        className="form-textarea"
        value={setting}
        onChange={(e) => setSetting(e.target.value)}
        placeholder="エピローグの展開を入力してください。\n\n例:\n・数年後の主人公たちの姿\n・平和を取り戻した世界\n・最後に残された小さな謎"
        style={{ minHeight: "150px", width: "100%", resize: "none" }}
      />

      {error && (
        <div style={{ color: "var(--error)", fontSize: "var(--fs-sm)", marginTop: "var(--sp-sm)" }}>
          ⚠️ {error}
        </div>
      )}

      <div style={{ marginTop: "var(--sp-md)", textAlign: "right" }}>
        <button
          className="btn btn-primary btn-lg"
          onClick={handleGenerate}
          disabled={isGenerating || !setting.trim()}
        >
          📖 エピローグを生成する
        </button>
      </div>
    </div>
  ) : null;

  return (
    <div className="content-area">
      <ResizableLayout
        topContent={topContent}
        bottomContent={bottomContent}
        hideBottom={isEditingChapter || phase !== "epilogue"}
      />

      {isGenerating && <GeneratingOverlay message="エピローグを執筆中..." />}
    </div>
  );
}

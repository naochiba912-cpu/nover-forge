import { useState } from "react";
import { novelApi } from "../hooks/useNovelApi";
import { useNovel } from "../context/NovelContext";

export default function IdeaAssistPanel({ onSelect }) {
  const { setup } = useNovel();
  const [input, setInput] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);

  const handleAssist = async () => {
    if (!input.trim()) return;

    setIsLoading(true);
    setSuggestions([]);
    setSelectedIndex(-1);
    try {
      const result = await novelApi.assistIdeas(setup, input.trim());
      setSuggestions(result.suggestions);
    } catch (err) {
      console.error("Idea assist error:", err);
      setSuggestions(["エラーが発生しました。もう一度お試しください。"]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelect = (index) => {
    setSelectedIndex(index);
    if (onSelect) {
      onSelect(suggestions[index]);
    }
  };

  return (
    <div className="panel">
      <div className="panel-header">
        <span className="panel-title">✨ アイデアアシスト</span>
      </div>

      <p
        style={{
          fontSize: "var(--fs-sm)",
          color: "var(--text-secondary)",
          marginBottom: "var(--sp-md)",
        }}
      >
        キーワードや短い文を入力すると、AIがプロローグの設定案を提案します。
      </p>

      <div style={{ display: "flex", gap: "var(--sp-sm)" }}>
        <input
          className="form-input"
          style={{ flex: 1 }}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="例: 魔法学校、時間旅行、記憶喪失..."
          onKeyDown={(e) => e.key === "Enter" && handleAssist()}
        />
        <button
          className="btn btn-primary"
          onClick={handleAssist}
          disabled={isLoading || !input.trim()}
        >
          {isLoading ? "⏳ 生成中..." : "💡 アシスト"}
        </button>
      </div>

      {suggestions.length > 0 && (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "var(--sp-sm)",
            marginTop: "var(--sp-md)",
          }}
        >
          {suggestions.map((suggestion, index) => (
            <div
              key={index}
              className={`idea-card ${selectedIndex === index ? "selected" : ""}`}
              onClick={() => handleSelect(index)}
            >
              {suggestion}
            </div>
          ))}

          <p
            style={{
              fontSize: "var(--fs-xs)",
              color: "var(--text-muted)",
              textAlign: "center",
            }}
          >
            カードをクリックして設定案を選択してください
          </p>
        </div>
      )}
    </div>
  );
}

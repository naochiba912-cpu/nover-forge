import { useState } from "react";
import { useNovelDispatch } from "../context/NovelContext";
import { novelApi } from "../hooks/useNovelApi";

const GENRES = [
  "ファンタジー",
  "SF",
  "ミステリー",
  "恋愛",
  "歴史小説",
  "ホラー",
  "冒険",
  "日常",
];

export default function SetupForm() {
  const dispatch = useNovelDispatch();
  const [mode, setMode] = useState("easy");
  const [title, setTitle] = useState("");
  const [genre, setGenre] = useState("");
  const [length, setLength] = useState("short");
  const [worldSetting, setWorldSetting] = useState("");
  const [characters, setCharacters] = useState("");
  const [theme, setTheme] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (mode === "detailed" && !title.trim()) {
      setError("詳細設定モードではタイトルは必須です。");
      return;
    }

    setIsSubmitting(true);
    try {
      const data = {
        title: title.trim() || null,
        genre: genre || null,
        length: length || null,
        mode,
        world_setting: worldSetting.trim() || null,
        characters: characters.trim() || null,
        theme: theme.trim() || null,
      };
      const setup = await novelApi.setup(data);
      dispatch({ type: "SET_SETUP", payload: setup });
    } catch (err) {
      setError(err.message || "設定の保存に失敗しました。");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="content-scroll">
      <div className="setup-container fade-in">
        <div className="setup-header">
          <h1>📖 NovelForge</h1>
          <p>AIと一緒に小説を書こう</p>
        </div>

        <form className="setup-form" onSubmit={handleSubmit}>
          {/* モード選択 */}
          <div className="panel">
            <div className="panel-header">
              <span className="panel-title">モード選択</span>
            </div>
            <div className="mode-selector">
              <button
                type="button"
                className={`mode-option ${mode === "easy" ? "active" : ""}`}
                onClick={() => setMode("easy")}
              >
                ✨ 簡単モード
              </button>
              <button
                type="button"
                className={`mode-option ${mode === "detailed" ? "active" : ""}`}
                onClick={() => setMode("detailed")}
              >
                ⚙️ 詳細設定モード
              </button>
            </div>
            <p
              style={{
                fontSize: "var(--fs-xs)",
                color: "var(--text-muted)",
                marginTop: "var(--sp-sm)",
              }}
            >
              {mode === "easy"
                ? "未記入の項目はAIがランダムに設定します。"
                : "すべての世界観や設定を手動で入力します。"}
            </p>
          </div>

          {/* 基本情報 */}
          <div className="panel">
            <div className="panel-header">
              <span className="panel-title">基本情報</span>
            </div>

            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "var(--sp-md)",
              }}
            >
              <div className="form-group">
                <label className="form-label" htmlFor="novel-title">
                  タイトル {mode === "easy" && "(任意)"}
                </label>
                <input
                  id="novel-title"
                  className="form-input"
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder={
                    mode === "easy"
                      ? "空欄の場合、AIが提案します"
                      : "小説のタイトルを入力"
                  }
                />
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="novel-genre">
                  ジャンル {mode === "easy" && "(任意)"}
                </label>
                <select
                  id="novel-genre"
                  className="form-select"
                  value={genre}
                  onChange={(e) => setGenre(e.target.value)}
                >
                  <option value="">
                    {mode === "easy" ? "AIにおまかせ" : "選択してください"}
                  </option>
                  {GENRES.map((g) => (
                    <option key={g} value={g}>
                      {g}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">長さ</label>
                <div className="form-radio-group">
                  <label className="form-radio">
                    <input
                      type="radio"
                      name="length"
                      value="short"
                      checked={length === "short"}
                      onChange={(e) => setLength(e.target.value)}
                    />
                    短編
                  </label>
                  <label className="form-radio">
                    <input
                      type="radio"
                      name="length"
                      value="long"
                      checked={length === "long"}
                      onChange={(e) => setLength(e.target.value)}
                    />
                    長編
                  </label>
                </div>
              </div>
            </div>
          </div>

          {/* 詳細設定（詳細モード時のみ） */}
          {mode === "detailed" && (
            <div className="panel fade-in">
              <div className="panel-header">
                <span className="panel-title">詳細設定</span>
              </div>

              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "var(--sp-md)",
                }}
              >
                <div className="form-group">
                  <label className="form-label" htmlFor="world-setting">
                    世界観
                  </label>
                  <textarea
                    id="world-setting"
                    className="form-textarea"
                    value={worldSetting}
                    onChange={(e) => setWorldSetting(e.target.value)}
                    placeholder="物語の舞台となる世界の設定を記述してください"
                    rows={3}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="characters">
                    登場人物
                  </label>
                  <textarea
                    id="characters"
                    className="form-textarea"
                    value={characters}
                    onChange={(e) => setCharacters(e.target.value)}
                    placeholder="主要な登場人物の名前、性格、役割を記述してください"
                    rows={3}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="novel-theme">
                    テーマ
                  </label>
                  <input
                    id="novel-theme"
                    className="form-input"
                    type="text"
                    value={theme}
                    onChange={(e) => setTheme(e.target.value)}
                    placeholder="物語のテーマ（例: 友情、冒険、成長）"
                  />
                </div>
              </div>
            </div>
          )}

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
              }}
            >
              ⚠️ {error}
            </div>
          )}

          {/* 送信ボタン */}
          <button
            type="submit"
            className="btn btn-primary btn-lg"
            disabled={isSubmitting}
            style={{ width: "100%" }}
          >
            {isSubmitting
              ? "⏳ 設定を処理中..."
              : "📝 この設定で小説を始める"}
          </button>
        </form>
      </div>
    </div>
  );
}

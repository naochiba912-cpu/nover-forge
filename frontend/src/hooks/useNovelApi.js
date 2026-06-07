const API_BASE = import.meta.env.DEV ? "http://localhost:8000/api/novel" : "/api/novel";

async function request(path, options = {}) {
  const apiKey = localStorage.getItem("gemini_api_key");
  if (!apiKey) {
    throw new Error("Gemini APIキーが設定されていません。右上の「🔑」ボタンから設定してください。");
  }

  const url = `${API_BASE}${path}`;
  const config = {
    headers: { 
      "Content-Type": "application/json",
      "x-api-key": apiKey
    },
    ...options,
  };

  const response = await fetch(url, config);

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    let errorMsg = `API Error: ${response.status}`;
    if (error.detail) {
      if (typeof error.detail === 'string') {
        errorMsg = error.detail;
      } else if (Array.isArray(error.detail)) {
        errorMsg = error.detail.map(d => `${d.loc.join('.')}: ${d.msg}`).join(', ');
      } else {
        errorMsg = JSON.stringify(error.detail);
      }
    }
    throw new Error(errorMsg);
  }

  return response.json();
}

export const novelApi = {
  /** 初期設定を送信 */
  setup: (data) =>
    request("/setup", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  /** プロローグを生成 */
  generatePrologue: (setup, setting) =>
    request("/generate-prologue", {
      method: "POST",
      body: JSON.stringify({ setup, setting }),
    }),

  /** 章を生成 */
  generateChapter: (setup, chapters, setting, isFinal = false) =>
    request("/generate-chapter", {
      method: "POST",
      body: JSON.stringify({ setup, chapters, setting, is_final: isFinal }),
    }),

  /** エピローグを生成 */
  generateEpilogue: (setup, chapters, setting) =>
    request("/generate-epilogue", {
      method: "POST",
      body: JSON.stringify({ setup, chapters, setting }),
    }),

  /** 章をやり直し */
  redoChapter: (chapterId, setup, chapters, setting) =>
    request(`/redo-chapter/${chapterId}`, {
      method: "POST",
      body: JSON.stringify({ setup, chapters, setting }),
    }),

  /** アイデアアシスト */
  assistIdeas: (setup, userInput) =>
    request("/assist-ideas", {
      method: "POST",
      body: JSON.stringify({ setup, user_input: userInput }),
    }),
};


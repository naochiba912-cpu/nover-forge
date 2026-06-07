import { useState, useEffect } from "react";
import { useNovel, useNovelDispatch } from "./context/NovelContext";
import TitleBar from "./components/TitleBar";
import StatusBar from "./components/StatusBar";
import SetupForm from "./components/SetupForm";
import PrologueEditor from "./components/PrologueEditor";
import ChapterEditor from "./components/ChapterEditor";
import ChapterSidebar from "./components/ChapterSidebar";
import EpilogueEditor from "./components/EpilogueEditor";
import CompletionScreen from "./components/CompletionScreen";

function ApiKeyModal({ isOpen, onClose }) {
  const [apiKey, setApiKey] = useState("");
  const [showHelp, setShowHelp] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setApiKey(localStorage.getItem("gemini_api_key") || "");
      setShowHelp(false); // 開くたびにヘルプは閉じた状態から
    }
  }, [isOpen]);

  const handleSave = () => {
    localStorage.setItem("gemini_api_key", apiKey.trim());
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: "rgba(0,0,0,0.5)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1000,
      }}
    >
      <div
        className="panel fade-in"
        style={{
          width: "400px",
          maxWidth: "90%",
          maxHeight: "85vh",
          overflowY: "auto",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "var(--sp-md)" }}>
          <h3 style={{ margin: 0 }}>🔑 Gemini APIキー設定</h3>
          <button 
            className="btn btn-sm" 
            onClick={() => setShowHelp(!showHelp)}
            style={{ padding: "4px 8px", borderRadius: "50%" }}
            title="APIキーって何？"
          >
            ❓
          </button>
        </div>

        {showHelp ? (
          <div style={{ fontSize: "var(--fs-sm)", lineHeight: "1.6", color: "var(--text-secondary)", marginBottom: "var(--sp-md)" }}>
            <p><strong>Gemini APIキーの取得方法：</strong></p>
            <ol style={{ paddingLeft: "1.2rem", marginBottom: "var(--sp-md)" }}>
              <li style={{ marginBottom: "8px" }}>
                <a href="https://aistudio.google.com/" target="_blank" rel="noopener noreferrer" style={{ color: "var(--primary)" }}>Google AI Studio</a> にアクセスします。
              </li>
              <li style={{ marginBottom: "8px" }}>普段お使いのGoogleアカウントでログインしてください。</li>
              <li style={{ marginBottom: "8px" }}>画面左側にある<strong>「Get API key」</strong>（または「Create API key」）のボタンをタップ（クリック）します。</li>
              <li style={{ marginBottom: "8px" }}>「Create API key in new project」を選んでキーを発行し、表示された文字列（AIza...で始まるもの）をコピーします。</li>
              <li>この画面に戻り、下の入力欄にコピーしたキーを貼り付けて「保存」を押してください！</li>
            </ol>
            <p style={{ color: "var(--warning)", fontWeight: "bold", marginBottom: "var(--sp-md)" }}>
              ※ わからなかったら作成者に直接聞いてください！
            </p>
            <div style={{ marginTop: "var(--sp-md)", padding: "var(--sp-sm)", backgroundColor: "var(--bg-tertiary)", borderRadius: "var(--radius-md)", fontSize: "var(--fs-xs)" }}>
              もしかしたら無料枠だけだと限界が来るかもしれません….<br />
              っつってもそこまでの課金額にはならないと思うので、それくらい我慢しろ無料で使えると思うな
            </div>
            <div style={{ textAlign: "center", marginTop: "var(--sp-md)" }}>
              <button className="btn btn-sm" onClick={() => setShowHelp(false)}>説明を閉じる</button>
            </div>
          </div>
        ) : (
          <>
            <p style={{ fontSize: "var(--fs-sm)", color: "var(--text-secondary)", marginBottom: "var(--sp-md)" }}>
              ご自身のGemini APIキーを入力してください。キーはブラウザにのみ保存されます。<br />
              <span style={{ fontSize: "var(--fs-xs)", color: "var(--primary)", cursor: "pointer" }} onClick={() => setShowHelp(true)}>
                👉 APIキーの取得方法はこちら
              </span>
            </p>
            <input
              type="password"
              className="form-input"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="AIzaSy..."
              style={{ width: "100%", marginBottom: "var(--sp-md)" }}
            />
            <div style={{ display: "flex", justifyContent: "flex-end", gap: "var(--sp-sm)" }}>
              <button className="btn" onClick={onClose}>キャンセル</button>
              <button className="btn btn-primary" onClick={handleSave}>保存</button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function HelpModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: "rgba(0,0,0,0.5)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1000,
      }}
    >
      <div
        className="panel fade-in"
        style={{
          width: "500px",
          maxWidth: "90%",
          maxHeight: "85vh",
          overflowY: "auto",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "var(--sp-md)" }}>
          <h3 style={{ margin: 0 }}>❓ NovelForge の使い方</h3>
        </div>
        <div style={{ fontSize: "var(--fs-sm)", lineHeight: "1.6", color: "var(--text-secondary)", marginBottom: "var(--sp-md)" }}>
          <p>NovelForge は AI と一緒に小説を書き進めるツールです。</p>
          <ol style={{ paddingLeft: "1.2rem", marginBottom: "var(--sp-md)" }}>
            <li style={{ marginBottom: "8px" }}><strong>設定:</strong> まずはタイトルや世界観を決めます。AIにおまかせすることも可能です。</li>
            <li style={{ marginBottom: "8px" }}><strong>プロローグ:</strong> 物語の導入を書きます。</li>
            <li style={{ marginBottom: "8px" }}><strong>本編:</strong> 1章ずつ「この章で何が起きるか」を指示して生成していきます。</li>
            <li style={{ marginBottom: "8px" }}><strong>エピローグ:</strong> 物語の結末を書きます。</li>
            <li style={{ marginBottom: "8px" }}><strong>完成:</strong> 完成した小説をテキストファイルとしてダウンロードできます。</li>
          </ol>
          <p style={{ color: "var(--text-muted)", fontSize: "var(--fs-xs)" }}>
            ※ 「↩️ 最初からやり直す」を押すと、現在書いている小説のデータがすべて消えて最初の画面に戻ります。ご注意ください。
          </p>
        </div>
        <div style={{ display: "flex", justifyContent: "flex-end" }}>
          <button className="btn btn-primary" onClick={onClose}>閉じる</button>
        </div>
      </div>
    </div>
  );
}

function MenuBar({ onOpenApiKeyModal, onOpenHelpModal }) {
  const dispatch = useNovelDispatch();

  const handleReset = () => {
    if (window.confirm("現在の小説データをリセットしますか？")) {
      dispatch({ type: "RESET" });
    }
  };

  return (
    <div className="menu-bar">
      <span className="menu-bar-item" onClick={handleReset}>
        ↩️ 最初からやり直す
      </span>
      <span className="menu-bar-item" onClick={onOpenApiKeyModal}>
        🔑 APIキー設定
      </span>
      <span className="menu-bar-item" onClick={onOpenHelpModal}>
        ❓ ヘルプ
      </span>
    </div>
  );
}

function MainContent() {
  const { phase, chapters } = useNovel();
  const showSidebar =
    phase === "writing" || phase === "epilogue" || phase === "complete";

  const renderPhaseContent = () => {
    switch (phase) {
      case "setup":
        return (
          <div className="content-area">
            <SetupForm />
          </div>
        );
      case "prologue":
        return (
          <div className="content-area">
            <PrologueEditor />
          </div>
        );
      case "writing":
        return <ChapterEditor />;
      case "epilogue":
        return <EpilogueEditor />;
      case "complete":
        return <CompletionScreen />;
      default:
        return null;
    }
  };

  return (
    <div className="main-content">
      {showSidebar && chapters.length > 0 && <ChapterSidebar />}
      {renderPhaseContent()}
    </div>
  );
}

export default function App() {
  const [isApiKeyModalOpen, setIsApiKeyModalOpen] = useState(false);
  const [isHelpModalOpen, setIsHelpModalOpen] = useState(false);

  // 初回起動時にAPIキーがなければモーダルを開く
  useEffect(() => {
    if (!localStorage.getItem("gemini_api_key")) {
      setIsApiKeyModalOpen(true);
    }
  }, []);

  return (
    <div className="window-frame">
      <TitleBar />
      <MenuBar 
        onOpenApiKeyModal={() => setIsApiKeyModalOpen(true)} 
        onOpenHelpModal={() => setIsHelpModalOpen(true)}
      />
      <MainContent />
      <StatusBar />
      <ApiKeyModal
        isOpen={isApiKeyModalOpen}
        onClose={() => setIsApiKeyModalOpen(false)}
      />
      <HelpModal
        isOpen={isHelpModalOpen}
        onClose={() => setIsHelpModalOpen(false)}
      />
    </div>
  );
}

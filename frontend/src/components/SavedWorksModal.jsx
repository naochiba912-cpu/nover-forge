import { useState, useEffect } from "react";
import { useNovel, useNovelDispatch } from "../context/NovelContext";

const SAVED_WORKS_KEY = "novel_forge_saved_works";

export default function SavedWorksModal({ isOpen, onClose }) {
  const state = useNovel();
  const dispatch = useNovelDispatch();
  const [works, setWorks] = useState([]);
  const [saveName, setSaveName] = useState("");

  useEffect(() => {
    if (isOpen) {
      loadWorks();
      setSaveName(state.setup?.title || "名称未設定の作品");
    }
  }, [isOpen, state.setup?.title]);

  const loadWorks = () => {
    try {
      const saved = localStorage.getItem(SAVED_WORKS_KEY);
      if (saved) {
        setWorks(JSON.parse(saved));
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleSave = () => {
    if (!saveName.trim()) return;
    const newWork = {
      id: Date.now().toString(),
      name: saveName,
      date: new Date().toLocaleString(),
      state: state
    };
    const updated = [newWork, ...works];
    localStorage.setItem(SAVED_WORKS_KEY, JSON.stringify(updated));
    setWorks(updated);
    setSaveName(state.setup?.title || "名称未設定の作品");
  };

  const handleLoad = (workState) => {
    if (window.confirm("現在の執筆状況は上書きされます。よろしいですか？")) {
      dispatch({ type: "LOAD_STATE", payload: workState });
      onClose();
    }
  };

  const handleDelete = (id) => {
    if (window.confirm("この保存データを削除します。よろしいですか？")) {
      const updated = works.filter(w => w.id !== id);
      localStorage.setItem(SAVED_WORKS_KEY, JSON.stringify(updated));
      setWorks(updated);
    }
  };

  if (!isOpen) return null;

  const currentChapterCount = state.chapters ? state.chapters.filter(ch => ch.type === "chapter").length : 0;

  return (
    <div className="modal-overlay fade-in">
      <div className="modal-content" style={{ maxWidth: "600px" }}>
        <div className="modal-header">
          <h2 className="modal-title">📁 保存した作品</h2>
          <button className="btn btn-sm" onClick={onClose}>✕</button>
        </div>

        <div className="modal-body">
          {/* 現在の作品をセーブ */}
          {state.phase !== "setup" && (
            <div className="panel" style={{ marginBottom: "var(--sp-lg)" }}>
              <div className="panel-header">
                <span className="panel-title">💾 現在の作品をセーブ</span>
              </div>
              <p style={{ fontSize: "var(--fs-sm)", color: "var(--text-secondary)", marginBottom: "var(--sp-sm)" }}>
                現在の執筆状況（フェーズ: {state.phase}, {currentChapterCount}章まで）をブラウザに保存します。
              </p>
              <div style={{ display: "flex", gap: "var(--sp-sm)" }}>
                <input
                  type="text"
                  className="form-input"
                  style={{ flex: 1 }}
                  value={saveName}
                  onChange={(e) => setSaveName(e.target.value)}
                  placeholder="保存する名前を入力"
                />
                <button
                  className="btn btn-primary"
                  onClick={handleSave}
                  disabled={!saveName.trim()}
                >
                  セーブ
                </button>
              </div>
            </div>
          )}

          {/* 保存済み作品の一覧 */}
          <h3 style={{ fontSize: "var(--fs-md)", fontWeight: 600, marginBottom: "var(--sp-sm)", color: "var(--text-secondary)" }}>
            保存データ一覧
          </h3>
          
          {works.length === 0 ? (
            <div style={{ textAlign: "center", padding: "var(--sp-xl)", color: "var(--text-muted)", background: "var(--sys-surface-alt)", borderRadius: "var(--radius-md)" }}>
              保存された作品はありません。
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "var(--sp-sm)", maxHeight: "300px", overflowY: "auto" }}>
              {works.map((work) => {
                const chapterCount = work.state.chapters ? work.state.chapters.filter(ch => ch.type === "chapter").length : 0;
                
                return (
                  <div key={work.id} className="panel" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "var(--sp-sm) var(--sp-md)" }}>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: "var(--fs-md)" }}>{work.name}</div>
                      <div style={{ fontSize: "var(--fs-xs)", color: "var(--text-secondary)", marginTop: "4px" }}>
                        {work.date} ・ {chapterCount}章まで ・ {work.state.phase}
                      </div>
                    </div>
                    <div style={{ display: "flex", gap: "var(--sp-xs)" }}>
                      <button className="btn btn-sm btn-primary" onClick={() => handleLoad(work.state)}>
                        ロード
                      </button>
                      <button className="btn btn-sm btn-danger" onClick={() => handleDelete(work.id)}>
                        削除
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

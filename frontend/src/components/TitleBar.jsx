import { useNovel } from "../context/NovelContext";

const phaseLabels = {
  setup: "初期設定",
  prologue: "プロローグ設定",
  writing: "執筆中",
  epilogue: "エピローグ設定",
  complete: "完成",
};

export default function TitleBar() {
  const { phase, setup } = useNovel();

  const title = setup ? `NovelForge — ${setup.title}` : "NovelForge";
  const phaseLabel = phaseLabels[phase] || "";

  return (
    <div className="title-bar">
      <div className="title-bar-controls">
        <button className="title-bar-btn close" aria-label="Close" />
        <button className="title-bar-btn minimize" aria-label="Minimize" />
        <button className="title-bar-btn maximize" aria-label="Maximize" />
      </div>
      <span className="title-bar-text">{title}</span>
      {phaseLabel && <span className="title-bar-badge">{phaseLabel}</span>}
    </div>
  );
}

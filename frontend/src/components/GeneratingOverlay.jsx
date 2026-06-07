export default function GeneratingOverlay({ message = "AIが執筆中です..." }) {
  return (
    <div className="generating-overlay">
      <div className="generating-spinner" />
      <div className="generating-text">{message}</div>
      <div className="generating-subtext">
        しばらくお待ちください。物語を紡いでいます。
      </div>
    </div>
  );
}

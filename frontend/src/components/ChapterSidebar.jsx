import { useNovel, useNovelDispatch } from "../context/NovelContext";

export default function ChapterSidebar() {
  const { chapters, currentChapterIndex, viewingChapter } = useNovel();
  const dispatch = useNovelDispatch();

  const getChapterIcon = (chapter) => {
    switch (chapter.type) {
      case "prologue":
        return "📖";
      case "epilogue":
        return "🏁";
      default:
        return chapter.is_final ? "⭐" : "📄";
    }
  };

  const handleChapterClick = (index) => {
    dispatch({ type: "SELECT_CHAPTER", payload: index });
  };

  if (chapters.length === 0) {
    return (
      <div className="sidebar">
        <div className="sidebar-header">章リスト</div>
        <div className="sidebar-content">
          <div className="empty-state">
            <div className="empty-state-icon">📚</div>
            <p style={{ fontSize: "var(--fs-sm)" }}>まだ章がありません</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="sidebar">
      <div className="sidebar-header">章リスト</div>
      <div className="sidebar-content">
        {chapters.map((chapter, index) => (
          <div
            key={chapter.id}
            className={`sidebar-item ${
              viewingChapter?.id === chapter.id ? "active" : ""
            }`}
            onClick={() => handleChapterClick(index)}
          >
            <span className="chapter-icon">{getChapterIcon(chapter)}</span>
            <span className="chapter-label">{chapter.title}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

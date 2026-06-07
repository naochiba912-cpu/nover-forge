import { useState, useRef, useEffect, useCallback } from "react";

export default function ResizableLayout({ topContent, bottomContent, hideBottom }) {
  const [topHeight, setTopHeight] = useState("60%");
  const containerRef = useRef(null);
  const isDragging = useRef(false);

  const startDragging = useCallback((e) => {
    e.preventDefault();
    isDragging.current = true;
    document.body.style.cursor = "row-resize";
  }, []);

  const onDrag = useCallback((e) => {
    if (!isDragging.current || !containerRef.current) return;
    
    const containerRect = containerRef.current.getBoundingClientRect();
    const newTopHeight = e.clientY - containerRect.top;
    
    // 最小・最大の高さを制限
    const minHeight = 100; // px
    const maxHeight = containerRect.height - 100;
    
    if (newTopHeight >= minHeight && newTopHeight <= maxHeight) {
      setTopHeight(`${newTopHeight}px`);
    }
  }, []);

  const stopDragging = useCallback(() => {
    if (isDragging.current) {
      isDragging.current = false;
      document.body.style.cursor = "default";
    }
  }, []);

  useEffect(() => {
    document.addEventListener("mousemove", onDrag);
    document.addEventListener("mouseup", stopDragging);
    return () => {
      document.removeEventListener("mousemove", onDrag);
      document.removeEventListener("mouseup", stopDragging);
    };
  }, [onDrag, stopDragging]);

  if (hideBottom) {
    return (
      <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
        {topContent}
      </div>
    );
  }

  return (
    <div ref={containerRef} style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
      <div style={{ flex: `0 0 ${topHeight}`, overflow: "hidden", display: "flex", flexDirection: "column" }}>
        {topContent}
      </div>
      
      <div
        onMouseDown={startDragging}
        style={{
          height: "8px",
          background: "var(--sys-border-light)",
          cursor: "row-resize",
          margin: "var(--sp-xs) 0",
          borderRadius: "4px",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          transition: "background 0.2s"
        }}
        onMouseEnter={(e) => e.target.style.background = "var(--accent-light)"}
        onMouseLeave={(e) => e.target.style.background = "var(--sys-border-light)"}
      >
        <div style={{ width: "30px", height: "2px", background: "var(--sys-border)" }} />
      </div>
      
      <div style={{ flex: 1, overflow: "auto", display: "flex", flexDirection: "column" }}>
        {bottomContent}
      </div>
    </div>
  );
}

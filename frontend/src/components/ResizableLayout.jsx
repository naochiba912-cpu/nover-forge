import { useState, useRef, useEffect, useCallback } from "react";

export default function ResizableLayout({ topContent, bottomContent, hideBottom }) {
  const [topHeight, setTopHeight] = useState("60%");
  const containerRef = useRef(null);
  const isDragging = useRef(false);

  const startDragging = useCallback((e) => {
    e.preventDefault();
    isDragging.current = true;
    document.body.style.cursor = "row-resize";
    document.body.style.userSelect = "none";
  }, []);

  const onDrag = useCallback((e) => {
    if (!isDragging.current || !containerRef.current) return;
    
    const containerRect = containerRef.current.getBoundingClientRect();
    const percentage = ((e.clientY - containerRect.top) / containerRect.height) * 100;
    
    if (percentage >= 10 && percentage <= 90) {
      setTopHeight(`${percentage}%`);
    }
  }, []);

  const stopDragging = useCallback(() => {
    if (isDragging.current) {
      isDragging.current = false;
      document.body.style.cursor = "default";
      document.body.style.userSelect = "auto";
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

  return (
    <div ref={containerRef} style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden", minHeight: 0 }}>
      <div style={{ flex: hideBottom ? "1" : `0 0 ${topHeight}`, overflow: "hidden", display: "flex", flexDirection: "column", minHeight: 0 }}>
        {topContent}
      </div>
      
      <div
        onMouseDown={startDragging}
        style={{
          display: hideBottom ? "none" : "flex",
          height: "8px",
          background: "var(--sys-border-light)",
          cursor: "row-resize",
          margin: "var(--sp-xs) 0",
          borderRadius: "4px",
          justifyContent: "center",
          alignItems: "center",
          transition: "background 0.2s"
        }}
        onMouseEnter={(e) => e.target.style.background = "var(--accent-light)"}
        onMouseLeave={(e) => e.target.style.background = "var(--sys-border-light)"}
      >
        <div style={{ width: "30px", height: "2px", background: "var(--sys-border)" }} />
      </div>
      
      <div style={{ display: hideBottom ? "none" : "flex", flex: 1, overflow: "auto", flexDirection: "column", minHeight: 0 }}>
        {bottomContent}
      </div>
    </div>
  );
}

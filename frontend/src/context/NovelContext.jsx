import { createContext, useContext, useReducer, useEffect as import_react_useEffect } from "react";

const NovelContext = createContext(null);
const NovelDispatchContext = createContext(null);

const initialState = {
  phase: "setup", // setup | prologue | writing | epilogue | complete
  setup: null,
  chapters: [],
  currentChapterIndex: -1,
  isGenerating: false,
  selectedChapterIndex: -1,
  viewingChapter: null,
};

const AUTOSAVE_KEY = "novel_forge_autosave";

function loadInitialState() {
  try {
    const saved = localStorage.getItem(AUTOSAVE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      return { ...parsed, isGenerating: false };
    }
  } catch (e) {
    console.error("Failed to load autosave", e);
  }
  return initialState;
}

function novelReducer(state, action) {
  switch (action.type) {
    case "LOAD_STATE":
      return { ...action.payload, isGenerating: false };

    case "SET_PHASE":
      return { ...state, phase: action.payload };

    case "SET_SETUP":
      return {
        ...state,
        setup: action.payload,
        phase: "prologue",
      };

    case "SET_GENERATING":
      return { ...state, isGenerating: action.payload };

    case "ADD_CHAPTER":
      return {
        ...state,
        chapters: [...state.chapters, action.payload],
        currentChapterIndex: state.chapters.length,
        viewingChapter: action.payload,
      };

    case "ADD_GENERATED_CHAPTER": {
      const chapter = action.payload;
      let newPhase = state.phase;
      
      if (chapter.type === "prologue") {
        newPhase = "writing";
      } else if (chapter.type === "chapter" && chapter.is_final) {
        newPhase = "epilogue";
      } else if (chapter.type === "epilogue") {
        newPhase = "complete";
      }

      return {
        ...state,
        chapters: [...state.chapters, chapter],
        currentChapterIndex: state.chapters.length,
        viewingChapter: chapter,
        phase: newPhase,
      };
    }

    case "REDO_CHAPTER": {
      const { chapterIndex, chapter } = action.payload;
      // chapterIndex以降を削除し、新しく生成されたchapterを追加
      const newChapters = [...state.chapters.slice(0, chapterIndex), chapter];
      return {
        ...state,
        chapters: newChapters,
        currentChapterIndex: newChapters.length - 1,
        viewingChapter: chapter,
        phase: "writing",
      };
    }

    case "SELECT_CHAPTER":
      return {
        ...state,
        selectedChapterIndex: action.payload,
        viewingChapter: state.chapters[action.payload] || null,
      };

    case "VIEW_CHAPTER":
      return {
        ...state,
        viewingChapter: action.payload,
      };

    case "REDO_FROM_CHAPTER": {
      const idx = action.payload.chapterIndex;
      return {
        ...state,
        chapters: state.chapters.slice(0, idx),
        currentChapterIndex: idx - 1,
        phase: "writing",
        selectedChapterIndex: -1,
      };
    }

    case "UPDATE_CHAPTER_CONTENT": {
      const { chapterId, content } = action.payload;
      const updatedChapters = state.chapters.map((ch) =>
        ch.id === chapterId ? { ...ch, content } : ch
      );
      const updatedViewing =
        state.viewingChapter?.id === chapterId
          ? { ...state.viewingChapter, content }
          : state.viewingChapter;
      return {
        ...state,
        chapters: updatedChapters,
        viewingChapter: updatedViewing,
      };
    }

    case "RESET":
      return { ...initialState };

    default:
      return state;
  }
}

export function NovelProvider({ children }) {
  const [state, dispatch] = useReducer(novelReducer, null, loadInitialState);

  // 自動保存
  import_react_useEffect(() => {
    localStorage.setItem(AUTOSAVE_KEY, JSON.stringify(state));
  }, [state]);

  return (
    <NovelContext.Provider value={state}>
      <NovelDispatchContext.Provider value={dispatch}>
        {children}
      </NovelDispatchContext.Provider>
    </NovelContext.Provider>
  );
}

export function useNovel() {
  const context = useContext(NovelContext);
  if (!context && context !== initialState) {
    throw new Error("useNovel must be used within a NovelProvider");
  }
  return context;
}

export function useNovelDispatch() {
  const context = useContext(NovelDispatchContext);
  if (!context) {
    throw new Error("useNovelDispatch must be used within a NovelProvider");
  }
  return context;
}

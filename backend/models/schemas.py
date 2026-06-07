from pydantic import BaseModel, Field
from typing import Optional, List
from enum import Enum


class NovelLength(str, Enum):
    SHORT = "short"
    LONG = "long"


class NovelMode(str, Enum):
    EASY = "easy"
    DETAILED = "detailed"


class NovelPhase(str, Enum):
    SETUP = "setup"
    PROLOGUE = "prologue"
    WRITING = "writing"
    EPILOGUE = "epilogue"
    COMPLETE = "complete"


class ChapterType(str, Enum):
    PROLOGUE = "prologue"
    CHAPTER = "chapter"
    EPILOGUE = "epilogue"


class NovelSetupRequest(BaseModel):
    title: Optional[str] = None
    genre: Optional[str] = None
    length: Optional[NovelLength] = None
    mode: NovelMode = NovelMode.EASY
    world_setting: Optional[str] = None
    characters: Optional[str] = None
    theme: Optional[str] = None


class NovelSetupResponse(BaseModel):
    title: str
    genre: str
    length: NovelLength
    mode: NovelMode
    world_setting: Optional[str] = None
    characters: Optional[str] = None
    theme: Optional[str] = None


class Chapter(BaseModel):
    id: int
    type: ChapterType
    chapter_number: Optional[int] = None
    title: str
    setting: str
    content: str
    is_final: bool = False


class GeneratePrologueRequest(BaseModel):
    setup: NovelSetupResponse
    setting: str


class GenerateChapterRequest(BaseModel):
    setup: NovelSetupResponse
    chapters: List[Chapter]
    setting: str
    is_final: bool = False
    custom_title: Optional[str] = None


class GenerateEpilogueRequest(BaseModel):
    setup: NovelSetupResponse
    chapters: List[Chapter]
    setting: str


class RedoChapterRequest(BaseModel):
    setup: NovelSetupResponse
    chapters: List[Chapter]
    setting: str
    custom_title: Optional[str] = None


class UpdateChapterRequest(BaseModel):
    content: str


class IdeaAssistRequest(BaseModel):
    setup: NovelSetupResponse
    user_input: str
    phase: str = "prologue"
    chapters: List[Chapter] = Field(default_factory=list)


class IdeaAssistResponse(BaseModel):
    suggestions: List[str]


class NovelState(BaseModel):
    phase: NovelPhase = NovelPhase.SETUP
    setup: Optional[NovelSetupResponse] = None
    chapters: List[Chapter] = Field(default_factory=list)
    current_chapter_index: int = -1


class GenerateResponse(BaseModel):
    chapter: Chapter

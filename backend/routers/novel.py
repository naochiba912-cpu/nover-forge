from fastapi import APIRouter, HTTPException, Header, Depends
from models.schemas import (
    NovelSetupRequest,
    NovelSetupResponse,
    GeneratePrologueRequest,
    GenerateChapterRequest,
    GenerateEpilogueRequest,
    RedoChapterRequest,
    IdeaAssistRequest,
    IdeaAssistResponse,
    Chapter,
    ChapterType,
    GenerateResponse,
)
from services.gemini_provider import GeminiProvider

router = APIRouter(prefix="/api/novel", tags=["novel"])

def get_ai_provider(x_api_key: str = Header(...)):
    try:
        return GeminiProvider(api_key=x_api_key)
    except ValueError as e:
        raise HTTPException(status_code=401, detail=str(e))

@router.post("/setup", response_model=NovelSetupResponse)
async def setup_novel(
    request: NovelSetupRequest, 
    provider: GeminiProvider = Depends(get_ai_provider)
):
    """初期設定を保存し、簡単モード時はAIが未記入項目を補完する。"""
    setup = await provider.auto_fill_setup(request)
    return setup

@router.post("/generate-prologue", response_model=GenerateResponse)
async def generate_prologue(
    request: GeneratePrologueRequest,
    provider: GeminiProvider = Depends(get_ai_provider)
):
    """プロローグの本文を生成する。"""
    content = await provider.generate_prologue(request.setup, request.setting)
    
    chapter = Chapter(
        id=0,
        type=ChapterType.PROLOGUE,
        title="プロローグ",
        setting=request.setting,
        content=content,
    )
    return GenerateResponse(chapter=chapter)

@router.post("/generate-chapter", response_model=GenerateResponse)
async def generate_chapter(
    request: GenerateChapterRequest,
    provider: GeminiProvider = Depends(get_ai_provider)
):
    """章の本文を生成する。"""
    chapter_number = len([c for c in request.chapters if c.type == ChapterType.CHAPTER]) + 1

    title, content = await provider.generate_chapter(
        request.setup,
        request.chapters,
        request.setting,
        chapter_number,
        request.is_final,
        request.custom_title,
    )

    chapter = Chapter(
        id=len(request.chapters),
        type=ChapterType.CHAPTER,
        chapter_number=chapter_number,
        title=title,
        setting=request.setting,
        content=content,
        is_final=request.is_final,
    )
    return GenerateResponse(chapter=chapter)

@router.post("/generate-epilogue", response_model=GenerateResponse)
async def generate_epilogue(
    request: GenerateEpilogueRequest,
    provider: GeminiProvider = Depends(get_ai_provider)
):
    """エピローグの本文を生成する。"""
    content = await provider.generate_epilogue(
        request.setup,
        request.chapters,
        request.setting,
    )

    chapter = Chapter(
        id=len(request.chapters),
        type=ChapterType.EPILOGUE,
        title="エピローグ",
        setting=request.setting,
        content=content,
    )
    return GenerateResponse(chapter=chapter)

@router.post("/redo-chapter/{chapter_id}", response_model=GenerateResponse)
async def redo_chapter(
    chapter_id: int, 
    request: RedoChapterRequest,
    provider: GeminiProvider = Depends(get_ai_provider)
):
    """指定した章を再生成する。"""
    if chapter_id < 0 or chapter_id >= len(request.chapters):
        raise HTTPException(status_code=404, detail="指定された章が見つかりません")

    target_chapter = request.chapters[chapter_id]
    previous_chapters = request.chapters[:chapter_id]

    if target_chapter.type == ChapterType.PROLOGUE:
        content = await provider.generate_prologue(request.setup, request.setting)
        chapter = Chapter(
            id=0,
            type=ChapterType.PROLOGUE,
            title="プロローグ",
            setting=request.setting,
            content=content,
        )
    elif target_chapter.type == ChapterType.CHAPTER:
        title, content = await provider.generate_chapter(
            request.setup,
            previous_chapters,
            request.setting,
            target_chapter.chapter_number,
            False,
            request.custom_title,
        )
        chapter = Chapter(
            id=chapter_id,
            type=ChapterType.CHAPTER,
            chapter_number=target_chapter.chapter_number,
            title=title,
            setting=request.setting,
            content=content,
        )
    else:
        raise HTTPException(status_code=400, detail="エピローグを直接やり直すことはできません")

    return GenerateResponse(chapter=chapter)

@router.post("/assist-ideas", response_model=IdeaAssistResponse)
async def assist_ideas(
    request: IdeaAssistRequest,
    provider: GeminiProvider = Depends(get_ai_provider)
):
    """ユーザー入力を元にアイデアを拡張・提案する。"""
    suggestions = await provider.assist_ideas(request.setup, request.user_input)
    return IdeaAssistResponse(suggestions=suggestions)

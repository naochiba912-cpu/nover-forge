from typing import List
import google.generativeai as genai
from models.schemas import NovelSetupRequest, NovelSetupResponse, NovelLength, Chapter


class GeminiProvider:
    """Google Gemini API プロバイダー。"""

    def __init__(self, api_key: str):
        if not api_key:
            raise ValueError("Gemini APIキーが必要です。")
        genai.configure(api_key=api_key, transport="rest")
        self.model = genai.GenerativeModel("gemini-3.5-flash")

    def _build_context(
        self, setup: NovelSetupResponse, chapters: List[Chapter] = None
    ) -> str:
        """プロンプト用のコンテキスト情報を構築する。"""
        context = f"""あなたは優れた日本語の小説家です。以下の設定に基づいて物語を執筆してください。
文章は美しい日本語で、小説として自然な文体で書いてください。段落の先頭は全角スペースで字下げしてください。

【小説の設定】
- タイトル: {setup.title}
- ジャンル: {setup.genre}
- 長さ: {"短編" if setup.length == NovelLength.SHORT else "長編"}
"""
        if setup.world_setting:
            context += f"- 世界観: {setup.world_setting}\n"
        if setup.characters:
            context += f"- 登場人物: {setup.characters}\n"
        if setup.theme:
            context += f"- テーマ: {setup.theme}\n"

        if chapters:
            context += "\n【これまでの物語】\n"
            for ch in chapters:
                context += f"\n--- {ch.title} ---\n{ch.content}\n"

        return context

    async def auto_fill_setup(self, setup: NovelSetupRequest) -> NovelSetupResponse:
        prompt = """面白い小説の設定を一つ提案してください。以下の形式で、各項目を1行ずつ出力してください。余計な説明は不要です。

タイトル: [魅力的なタイトル]
ジャンル: [ファンタジー/SF/ミステリー/恋愛/歴史小説/ホラーのいずれか]
世界観: [50文字程度の簡潔な世界観の説明]"""

        if setup.title:
            prompt += f"\nヒント - タイトル案: {setup.title}"
        if setup.genre:
            prompt += f"\nヒント - 希望ジャンル: {setup.genre}"

        response = await self.model.generate_content_async(prompt)
        text = response.text

        # レスポンスをパースする
        parsed = {}
        for line in text.strip().split("\n"):
            if ":" in line or "：" in line:
                separator = "：" if "：" in line else ":"
                key, value = line.split(separator, 1)
                parsed[key.strip()] = value.strip()

        return NovelSetupResponse(
            title=setup.title or parsed.get("タイトル", "無題の物語"),
            genre=setup.genre or parsed.get("ジャンル", "ファンタジー"),
            length=setup.length or NovelLength.SHORT,
            mode=setup.mode,
            world_setting=setup.world_setting or parsed.get("世界観"),
            characters=setup.characters,
            theme=setup.theme,
        )

    async def generate_prologue(self, setup: NovelSetupResponse, setting: str) -> str:
        context = self._build_context(setup)
        prompt = f"""{context}

【指示】
以下のプロローグ設定に基づいて、物語のプロローグを執筆してください。
- 読者を引き込む魅力的な冒頭にしてください
- 800〜1500文字程度で書いてください
- 章タイトルや見出しは含めず、本文のみを出力してください

【プロローグ設定】
{setting}"""

        response = await self.model.generate_content_async(prompt)
        return response.text

    async def generate_chapter(
        self,
        setup: NovelSetupResponse,
        previous_chapters: List[Chapter],
        setting: str,
        chapter_number: int,
        is_final: bool,
    ) -> str:
        context = self._build_context(setup, previous_chapters)

        final_instruction = ""
        if is_final:
            final_instruction = (
                "\n重要: これは最終章です。物語のクライマックスとして、"
                "これまでの伏線を回収し、感動的な結末に向かう展開を描いてください。"
            )

        prompt = f"""{context}

【指示】
第{chapter_number}章を執筆してください。
- これまでの物語の流れを自然に受けて、展開を進めてください
- 800〜1500文字程度で書いてください
- 章タイトルや見出しは含めず、本文のみを出力してください
{final_instruction}

【この章の設定・展開メモ】
{setting}"""

        response = await self.model.generate_content_async(prompt)
        return response.text

    async def generate_epilogue(
        self,
        setup: NovelSetupResponse,
        previous_chapters: List[Chapter],
        setting: str,
    ) -> str:
        context = self._build_context(setup, previous_chapters)
        prompt = f"""{context}

【指示】
エピローグを執筆してください。
- 物語の余韻を感じさせる、美しい締めくくりを書いてください
- 500〜1000文字程度で書いてください
- 章タイトルや見出しは含めず、本文のみを出力してください

【エピローグ設定】
{setting}"""

        response = await self.model.generate_content_async(prompt)
        return response.text

    async def assist_ideas(
        self, setup: NovelSetupResponse, user_input: str
    ) -> List[str]:
        context = self._build_context(setup)
        prompt = f"""{context}

【指示】
ユーザーが以下のキーワードやアイデアメモを提供しています。
これを元に、プロローグの設定案を3つ提案してください。

ルール:
- 各案は100〜150文字程度で簡潔に
- それぞれ異なるアプローチ・方向性の提案にする
- 各案は「【案1】」「【案2】」「【案3】」で始める
- 余計な前置きや説明は不要

【ユーザーのアイデア】
{user_input}"""

        response = await self.model.generate_content_async(prompt)
        text = response.text

        # レスポンスをパースして案を分離する
        suggestions = []
        current = ""
        for line in text.split("\n"):
            if line.strip().startswith("【案"):
                if current.strip():
                    suggestions.append(current.strip())
                current = line
            else:
                current += "\n" + line
        if current.strip():
            suggestions.append(current.strip())

        return suggestions if suggestions else [text]


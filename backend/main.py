import warnings

# サードパーティライブラリからの不要な警告を非表示にする
warnings.filterwarnings("ignore", category=FutureWarning)
warnings.filterwarnings("ignore", module="urllib3")
warnings.filterwarnings("ignore", category=UserWarning)

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse, JSONResponse
from dotenv import load_dotenv
import os
from routers import novel

load_dotenv()

app = FastAPI(
    title="NovelForge API",
    description="AI共同小説執筆アプリケーション バックエンドAPI",
    version="1.0.0",
)

@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    return JSONResponse(
        status_code=400,
        content={"detail": f"AIプロバイダーエラー: {str(exc)}"}
    )

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(novel.router)


# 開発環境用ルート (API動作確認用)
@app.get("/api")
async def root():
    return {"message": "NovelForge API is running", "version": "1.0.0"}


# フロントエンドのビルド結果を配信 (本番デプロイ用)
frontend_dist = os.path.join(os.path.dirname(__file__), "../frontend/dist")

if os.path.isdir(frontend_dist):
    app.mount("/assets", StaticFiles(directory=os.path.join(frontend_dist, "assets")), name="assets")

    # SPA用のフォールバックルーティング
    @app.get("/{full_path:path}")
    async def serve_frontend(full_path: str):
        file_path = os.path.join(frontend_dist, full_path)
        if os.path.isfile(file_path):
            return FileResponse(file_path)
        return FileResponse(os.path.join(frontend_dist, "index.html"))
else:
    print(f"Warning: Frontend dist directory not found at {frontend_dist}. Running in API-only mode.")


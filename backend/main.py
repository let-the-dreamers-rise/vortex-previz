"""Vortex Previz Backend — FastAPI server powering the cinematic orchestrator.

Endpoints:
  GET  /api/health            — Health check
  GET  /api/ideas             — All idea nodes
  POST /api/generate-sequence — Omni-Orchestrator sequence generation
  POST /api/extract-style     — Gemini Vision style extraction
"""

import os
import uuid
import traceback
from contextlib import asynccontextmanager

from dotenv import load_dotenv
load_dotenv()

from pathlib import Path
from fastapi import FastAPI, HTTPException, Request, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse, StreamingResponse
from pydantic import BaseModel
from typing import Optional, List

STATIC_DIR = Path(__file__).parent / "static"

from models.schemas import (
    DiscoveryRequest,
    DiscoveryResponse,
    ChatRequest,
    ChatResponse,
    IdeaNode,
)
from services import firestore_service, discovery_engine, gemini_service, omni_orchestrator
from services.firestore_service import SEED_TIMELINE


# ── Lifespan ───────────────────────────────────────────────

@asynccontextmanager
async def lifespan(app: FastAPI):
    """Startup: seed initial data. Shutdown: cleanup."""
    print("🎬 Vortex Previz Backend starting up...")
    await firestore_service.seed_initial_data()
    print("🎬 Vortex Previz Backend ready!")
    yield
    print("🎬 Vortex Previz Backend shutting down.")


# ── App ────────────────────────────────────────────────────

app = FastAPI(
    title="Vortex Previz API",
    description="AI-powered cinematic semantic sequencer using Gemini",
    version="1.0.0",
    lifespan=lifespan,
)


def _cors_origins() -> list[str]:
    origins = [
        "http://localhost:5173",
        "http://localhost:5174",
        "http://localhost:3000",
        "http://localhost:8080",
    ]
    extra_origins = os.getenv("CORS_ORIGINS", "")
    origins.extend(
        origin.strip()
        for origin in extra_origins.split(",")
        if origin.strip()
    )
    return origins

# CORS — allow frontend dev server and production
app.add_middleware(
    CORSMiddleware,
    allow_origins=_cors_origins(),
    allow_origin_regex=r"https://.*\.vercel\.app",
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ── Health ─────────────────────────────────────────────────

@app.get("/api/health")
async def health():
    """Health check endpoint for Cloud Run."""
    return {
        "status": "healthy",
        "service": "vortex-previz-backend",
        "models": {
            "agent": "gemini-3.1-pro-preview",
            "generation": omni_orchestrator.SCRIPT_MODEL,
            "scoring": "gemini-3-flash-preview",
            "chat": "gemini-3-flash-preview",
            "image_demo": omni_orchestrator.IMAGEN_MODEL_DEMO,
            "image_live": omni_orchestrator.IMAGEN_MODEL_LIVE,
            "video": omni_orchestrator.VEO_MODEL,
        },
        "engine": "Google ADK + Gemini",
    }


# ── Ideas ──────────────────────────────────────────────────

@app.get("/api/search")
async def search_ideas(query: str):
    """Simple text search over node labels."""
    all_ideas = await firestore_service.get_all_ideas()
    results = [
        node for node in all_ideas 
        if query.lower() in node.get("label", "").lower()
        or query.lower() in node.get("description", "").lower()
    ]
    return {"results": results}

@app.get("/api/ideas")
async def get_ideas():
    """Fetch all idea nodes from the knowledge graph."""
    ideas = await firestore_service.get_all_ideas()
    return {"ideas": ideas, "count": len(ideas)}


@app.post("/api/ideas")
async def add_idea(idea: dict):
    """Add a new idea to the knowledge graph (typically a discovered one)."""
    try:
        saved = await discovery_engine.add_discovered_idea_to_graph(idea)
        return {"success": True, "idea": saved}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))




# ── Sub-Graph Compilation ─────────────────────────────────

class SequenceGenerateRequest(BaseModel):
    sequenceNodes: List[dict]
    generationMode: str = "demo"

@app.post("/api/generate-sequence")
async def generate_sequence(request: SequenceGenerateRequest):
    """
    Sub-Graph Compilation Endpoint.
    Takes the raw JSON topology of a sequence, sends it to the omni_orchestrator,
    and returns a Server-Sent Events (SSE) stream.
    """
    if len(request.sequenceNodes) < 1:
        raise HTTPException(status_code=400, detail="Sequence must contain at least 1 node.")
    
    return StreamingResponse(
        omni_orchestrator.orchestrate_sequence_stream(request.sequenceNodes, request.generationMode),
        media_type="text/event-stream"
    )

@app.post("/api/extract-style")
async def extract_style(file: UploadFile = File(...)):
    """
    Style Genome Extraction Engine.
    Receives an uploaded movie still from the drag-and-drop canvas,
    uses Gemini Vision to extract lighting, color grade, and vibe,
    and returns a new 'Style Node' to inject into the graph.
    """
    try:
        contents = await file.read()
        mime_type = file.content_type
        
        # Call Gemini Vision to extract the genome
        style_idea = await gemini_service.extract_style_from_image(contents, mime_type)
        
        # Save to DB
        saved_node = await discovery_engine.add_discovered_idea_to_graph(style_idea)
        return {"success": True, "idea": saved_node}
    except Exception as e:
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Style Extraction error: {str(e)}")




# ── Timeline ──────────────────────────────────────────────

@app.get("/api/timeline")
async def get_timeline():
    """Fetch the idea evolution timeline."""
    return {"events": SEED_TIMELINE}





# ── Static Frontend Serving ────────────────────────────────

if STATIC_DIR.exists():
    # Serve static assets (JS, CSS, images)
    app.mount("/assets", StaticFiles(directory=STATIC_DIR / "assets"), name="assets")

    @app.get("/{full_path:path}")
    async def serve_frontend(full_path: str):
        """Serve the React SPA for any non-API route."""
        # Try to serve the exact file first
        file_path = STATIC_DIR / full_path
        if file_path.is_file():
            return FileResponse(file_path)
        # Fall back to index.html for SPA routing
        return FileResponse(STATIC_DIR / "index.html")


# ── Run ────────────────────────────────────────────────────

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)

"""Firestore service — CRUD operations for ideas, discoveries, and chat history.

Falls back to in-memory storage if Firestore is not configured,
so the backend works without GCP credentials for local development.
"""

import os
import uuid
from typing import Optional
from models.schemas import IdeaNode, TimelineEvent


# In-memory fallback store
_memory_store: dict[str, dict] = {
    "ideas": {},
    "discoveries": {},
    "chat_sessions": {},
}

_firestore_client = None
_use_firestore = False


def _get_db():
    """Get Firestore client, or None if not configured."""
    global _firestore_client, _use_firestore

    if _firestore_client is not None:
        return _firestore_client

    project = os.getenv("GOOGLE_CLOUD_PROJECT")
    if project:
        try:
            from google.cloud import firestore
            _firestore_client = firestore.Client(project=project)
            _use_firestore = True
            print(f"[Firestore] Connected to project: {project}")
            return _firestore_client
        except Exception as e:
            print(f"[Firestore] Failed to connect: {e}. Using in-memory store.")
            _use_firestore = False
            return None
    else:
        print("[Firestore] No GOOGLE_CLOUD_PROJECT set. Using in-memory store.")
        _use_firestore = False
        return None


# ── Ideas ──────────────────────────────────────────────────

async def get_all_ideas() -> list[dict]:
    """Fetch all idea nodes."""
    db = _get_db()
    if db and _use_firestore:
        docs = db.collection("ideas").stream()
        return [doc.to_dict() for doc in docs]
    else:
        return list(_memory_store["ideas"].values())


async def get_idea(idea_id: str) -> Optional[dict]:
    """Fetch a single idea node by ID."""
    db = _get_db()
    if db and _use_firestore:
        doc = db.collection("ideas").document(idea_id).get()
        return doc.to_dict() if doc.exists else None
    else:
        return _memory_store["ideas"].get(idea_id)


async def save_idea(idea: dict) -> dict:
    """Save an idea node (create or update)."""
    db = _get_db()
    idea_id = idea["id"]

    if db and _use_firestore:
        db.collection("ideas").document(idea_id).set(idea)
    else:
        _memory_store["ideas"][idea_id] = idea

    return idea


async def delete_idea(idea_id: str) -> bool:
    """Delete an idea node."""
    db = _get_db()
    if db and _use_firestore:
        db.collection("ideas").document(idea_id).delete()
    else:
        _memory_store["ideas"].pop(idea_id, None)
    return True


async def save_many_ideas(ideas: list[dict]) -> int:
    """Bulk save idea nodes. Returns count saved."""
    db = _get_db()
    if db and _use_firestore:
        batch = db.batch()
        for idea in ideas:
            ref = db.collection("ideas").document(idea["id"])
            batch.set(ref, idea)
        batch.commit()
    else:
        for idea in ideas:
            _memory_store["ideas"][idea["id"]] = idea
    return len(ideas)


# ── Discoveries ────────────────────────────────────────────

async def save_discovery(discovery: dict) -> dict:
    """Save a discovery record."""
    db = _get_db()
    disc_id = discovery.get("id", str(uuid.uuid4()))
    discovery["id"] = disc_id

    if db and _use_firestore:
        db.collection("discoveries").document(disc_id).set(discovery)
    else:
        _memory_store["discoveries"][disc_id] = discovery

    return discovery


async def get_discoveries() -> list[dict]:
    """Fetch all discovery records."""
    db = _get_db()
    if db and _use_firestore:
        docs = db.collection("discoveries").stream()
        return [doc.to_dict() for doc in docs]
    else:
        return list(_memory_store["discoveries"].values())


# ── Chat Sessions ──────────────────────────────────────────

async def get_chat_history(session_id: str) -> list[dict]:
    """Get chat messages for a session."""
    db = _get_db()
    if db and _use_firestore:
        doc = db.collection("chat_sessions").document(session_id).get()
        if doc.exists:
            return doc.to_dict().get("messages", [])
        return []
    else:
        session = _memory_store["chat_sessions"].get(session_id, {})
        return session.get("messages", [])


async def save_chat_message(session_id: str, role: str, content: str) -> str:
    """Append a chat message to a session. Returns session_id."""
    db = _get_db()

    if db and _use_firestore:
        from google.cloud import firestore
        ref = db.collection("chat_sessions").document(session_id)
        ref.set(
            {"messages": firestore.ArrayUnion([{"role": role, "content": content}])},
            merge=True,
        )
    else:
        if session_id not in _memory_store["chat_sessions"]:
            _memory_store["chat_sessions"][session_id] = {"messages": []}
        _memory_store["chat_sessions"][session_id]["messages"].append(
            {"role": role, "content": content}
        )

    return session_id


# ── Seed Data ──────────────────────────────────────────────

# The canonical initial idea set — matches the frontend KnowledgeGraph.tsx
SEED_IDEAS: list[dict] = [
    {
        "id": "neural-networks",
        "label": "Neural Networks",
        "x": 0, "y": 0, "size": 34,
        "color": "hsl(180, 80%, 50%)",
        "glowColor": "hsl(180, 80%, 50%)",
        "category": "AI",
        "connections": ["deep-learning", "backpropagation", "transformers"],
        "traits": {"complexity": 85, "adoption": 95, "scalability": 90, "influence": 98},
        "description": "Computing systems inspired by biological neural networks, forming the foundation of modern AI.",
        "year": 1943,
        "fields": ["AI", "Neuroscience", "Mathematics"],
        "isDiscovered": False,
        "genome_traits": ["biological inspiration", "weight learning", "universal approximation", "distributed representations"],
    },
    {
        "id": "deep-learning",
        "label": "Deep Learning",
        "x": 220, "y": -160, "size": 28,
        "color": "hsl(270, 60%, 55%)",
        "glowColor": "hsl(270, 60%, 55%)",
        "category": "AI",
        "connections": ["neural-networks", "transformers", "generative-ai"],
        "traits": {"complexity": 90, "adoption": 92, "scalability": 88, "influence": 95},
        "description": "Multi-layered neural networks that learn hierarchical representations of data.",
        "year": 2006,
        "fields": ["AI", "Computer Vision", "NLP"],
        "isDiscovered": False,
        "genome_traits": ["hierarchical features", "end-to-end training", "representation learning", "transfer learning"],
    },
    {
        "id": "transformers",
        "label": "Transformers",
        "x": -200, "y": -220, "size": 30,
        "color": "hsl(320, 70%, 55%)",
        "glowColor": "hsl(320, 70%, 55%)",
        "category": "AI",
        "connections": ["neural-networks", "deep-learning", "attention"],
        "traits": {"complexity": 92, "adoption": 88, "scalability": 95, "influence": 97},
        "description": "Architecture using self-attention mechanisms, revolutionizing NLP and beyond.",
        "year": 2017,
        "fields": ["NLP", "AI", "Sequence Modeling"],
        "isDiscovered": False,
        "genome_traits": ["self-attention", "parallel computation", "positional encoding", "sequence modeling"],
    },
    {
        "id": "backpropagation",
        "label": "Backpropagation",
        "x": 280, "y": 130, "size": 23,
        "color": "hsl(170, 70%, 45%)",
        "glowColor": "hsl(170, 70%, 45%)",
        "category": "Mathematics",
        "connections": ["neural-networks", "gradient-descent"],
        "traits": {"complexity": 70, "adoption": 98, "scalability": 85, "influence": 90},
        "description": "Algorithm for computing gradients in neural networks via the chain rule.",
        "year": 1986,
        "fields": ["Mathematics", "AI", "Optimization"],
        "isDiscovered": False,
        "genome_traits": ["gradient computation", "chain rule", "error propagation", "weight updates"],
    },
    {
        "id": "attention",
        "label": "Attention Mechanism",
        "x": -370, "y": -60, "size": 25,
        "color": "hsl(210, 80%, 55%)",
        "glowColor": "hsl(210, 80%, 55%)",
        "category": "AI",
        "connections": ["transformers", "generative-ai"],
        "traits": {"complexity": 80, "adoption": 85, "scalability": 92, "influence": 88},
        "description": "Mechanism allowing models to focus on relevant parts of input sequences.",
        "year": 2014,
        "fields": ["AI", "NLP", "Computer Vision"],
        "isDiscovered": False,
        "genome_traits": ["dynamic weighting", "context awareness", "selective focus", "query-key-value"],
    },
    {
        "id": "generative-ai",
        "label": "Generative AI",
        "x": -140, "y": 220, "size": 29,
        "color": "hsl(45, 80%, 55%)",
        "glowColor": "hsl(45, 80%, 55%)",
        "category": "AI",
        "connections": ["deep-learning", "attention", "diffusion"],
        "traits": {"complexity": 88, "adoption": 80, "scalability": 90, "influence": 92},
        "description": "AI systems capable of generating novel content: text, images, code, and more.",
        "year": 2014,
        "fields": ["AI", "Creative Computing", "NLP"],
        "isDiscovered": False,
        "genome_traits": ["content creation", "latent space sampling", "distribution modeling", "creative synthesis"],
    },
    {
        "id": "gradient-descent",
        "label": "Gradient Descent",
        "x": 430, "y": 40, "size": 21,
        "color": "hsl(140, 60%, 45%)",
        "glowColor": "hsl(140, 60%, 45%)",
        "category": "Mathematics",
        "connections": ["backpropagation"],
        "traits": {"complexity": 50, "adoption": 99, "scalability": 80, "influence": 85},
        "description": "Iterative optimization algorithm for minimizing loss functions.",
        "year": 1847,
        "fields": ["Mathematics", "Optimization"],
        "isDiscovered": False,
        "genome_traits": ["loss minimization", "iterative optimization", "learning rate", "convergence"],
    },
    {
        "id": "diffusion",
        "label": "Diffusion Models",
        "x": -310, "y": 240, "size": 24,
        "color": "hsl(290, 65%, 50%)",
        "glowColor": "hsl(290, 65%, 50%)",
        "category": "AI",
        "connections": ["generative-ai"],
        "traits": {"complexity": 88, "adoption": 70, "scalability": 82, "influence": 78},
        "description": "Generative models that learn to reverse a noise diffusion process.",
        "year": 2020,
        "fields": ["AI", "Computer Vision", "Generative Models"],
        "isDiscovered": False,
        "genome_traits": ["noise scheduling", "denoising process", "score matching", "iterative refinement"],
    },
    {
        "id": "quantum-ml",
        "label": "Quantum ML",
        "x": 360, "y": -220, "size": 22,
        "color": "hsl(200, 90%, 55%)",
        "glowColor": "hsl(200, 90%, 55%)",
        "category": "Quantum",
        "connections": ["neural-networks"],
        "traits": {"complexity": 98, "adoption": 15, "scalability": 60, "influence": 45},
        "description": "Intersection of quantum computing and machine learning for exponential speedups.",
        "year": 2014,
        "fields": ["Quantum Computing", "AI", "Physics"],
        "isDiscovered": False,
        "genome_traits": ["superposition", "entanglement", "quantum gates", "exponential state space"],
    },
    {
        "id": "neuro-symbolic",
        "label": "Neuro-Symbolic AI",
        "x": 140, "y": -300, "size": 23,
        "color": "hsl(30, 80%, 55%)",
        "glowColor": "hsl(30, 80%, 55%)",
        "category": "AI",
        "connections": ["neural-networks", "deep-learning"],
        "traits": {"complexity": 85, "adoption": 30, "scalability": 70, "influence": 55},
        "description": "Combining neural networks with symbolic reasoning for more robust AI.",
        "year": 2019,
        "fields": ["AI", "Logic", "Cognitive Science"],
        "isDiscovered": False,
        "genome_traits": ["logical reasoning", "symbolic grounding", "rule extraction", "hybrid inference"],
    },
]

# Domain-specific additional nodes (matches frontend DOMAIN_NODES)
DOMAIN_IDEAS: dict[str, list[dict]] = {
    "neuroscience": [
        {
            "id": "brain-plasticity", "label": "Brain Plasticity",
            "x": -180, "y": 350, "size": 24,
            "color": "hsl(160, 70%, 50%)", "glowColor": "hsl(160, 70%, 50%)",
            "category": "Neuroscience",
            "connections": ["neural-networks"],
            "traits": {"complexity": 80, "adoption": 60, "scalability": 50, "influence": 85},
            "description": "The brain's ability to reorganize itself by forming new neural connections.",
            "year": 1948, "fields": ["Neuroscience", "Psychology"],
            "isDiscovered": False,
            "genome_traits": ["neural reorganization", "adaptive connectivity", "learning plasticity", "structural adaptation"],
        },
        {
            "id": "consciousness", "label": "Consciousness",
            "x": 180, "y": 350, "size": 26,
            "color": "hsl(280, 60%, 60%)", "glowColor": "hsl(280, 60%, 60%)",
            "category": "Neuroscience",
            "connections": ["neural-networks", "brain-plasticity"],
            "traits": {"complexity": 99, "adoption": 40, "scalability": 30, "influence": 95},
            "description": "The hard problem — understanding subjective experience and awareness.",
            "year": 1994, "fields": ["Neuroscience", "Philosophy"],
            "isDiscovered": False,
            "genome_traits": ["subjective experience", "self-awareness", "integrated information", "phenomenal states"],
        },
    ],
    "robotics": [
        {
            "id": "reinforcement-learning", "label": "Reinforcement Learning",
            "x": -400, "y": 350, "size": 25,
            "color": "hsl(100, 70%, 45%)", "glowColor": "hsl(100, 70%, 45%)",
            "category": "Robotics",
            "connections": ["neural-networks", "deep-learning"],
            "traits": {"complexity": 85, "adoption": 70, "scalability": 75, "influence": 80},
            "description": "Learning through interaction with environments via rewards and penalties.",
            "year": 1992, "fields": ["AI", "Robotics", "Game Theory"],
            "isDiscovered": False,
            "genome_traits": ["reward optimization", "policy learning", "exploration-exploitation", "temporal difference"],
        },
        {
            "id": "embodied-ai", "label": "Embodied AI",
            "x": 400, "y": 350, "size": 22,
            "color": "hsl(50, 80%, 50%)", "glowColor": "hsl(50, 80%, 50%)",
            "category": "Robotics",
            "connections": ["reinforcement-learning", "neural-networks"],
            "traits": {"complexity": 90, "adoption": 30, "scalability": 55, "influence": 65},
            "description": "AI that learns through physical interaction with the real world.",
            "year": 2018, "fields": ["Robotics", "AI", "Embodiment"],
            "isDiscovered": False,
            "genome_traits": ["physical interaction", "sensorimotor learning", "world modeling", "tactile intelligence"],
        },
    ],
    "physics": [
        {
            "id": "quantum-computing", "label": "Quantum Computing",
            "x": 450, "y": -100, "size": 26,
            "color": "hsl(220, 90%, 60%)", "glowColor": "hsl(220, 90%, 60%)",
            "category": "Physics",
            "connections": ["quantum-ml"],
            "traits": {"complexity": 99, "adoption": 10, "scalability": 95, "influence": 90},
            "description": "Computing using quantum-mechanical phenomena like superposition and entanglement.",
            "year": 1980, "fields": ["Physics", "Computing"],
            "isDiscovered": False,
            "genome_traits": ["superposition computing", "entanglement channels", "quantum error correction", "qubit manipulation"],
        },
        {
            "id": "string-theory", "label": "String Theory",
            "x": 500, "y": -300, "size": 20,
            "color": "hsl(340, 70%, 55%)", "glowColor": "hsl(340, 70%, 55%)",
            "category": "Physics",
            "connections": ["quantum-computing"],
            "traits": {"complexity": 99, "adoption": 20, "scalability": 40, "influence": 70},
            "description": "Theoretical framework where point-like particles are replaced by one-dimensional strings.",
            "year": 1970, "fields": ["Physics", "Mathematics"],
            "isDiscovered": False,
            "genome_traits": ["dimensional vibration", "brane dynamics", "unified forces", "extra dimensions"],
        },
    ],
}


SEED_TIMELINE: list[dict] = [
    {"year": 1943, "title": "McCulloch-Pitts Neuron", "description": "First mathematical model of neural networks", "type": "origin", "color": "hsl(180, 80%, 50%)"},
    {"year": 1957, "title": "Perceptron", "description": "Single-layer learning algorithm emerges", "type": "branch", "color": "hsl(170, 70%, 45%)"},
    {"year": 1986, "title": "Backpropagation", "description": "Training deep networks becomes feasible", "type": "mutation", "color": "hsl(210, 80%, 55%)"},
    {"year": 1997, "title": "LSTM Networks", "description": "Long-term memory in sequential models", "type": "branch", "color": "hsl(270, 60%, 55%)"},
    {"year": 2012, "title": "AlexNet Revolution", "description": "Deep learning dominates computer vision", "type": "mutation", "color": "hsl(320, 70%, 55%)"},
    {"year": 2014, "title": "GANs Emerge", "description": "Generative adversarial networks create synthetic data", "type": "branch", "color": "hsl(45, 80%, 55%)"},
    {"year": 2017, "title": "Attention Is All You Need", "description": "Transformer architecture transforms NLP", "type": "merge", "color": "hsl(180, 80%, 50%)"},
    {"year": 2020, "title": "Diffusion Models", "description": "New paradigm for generative AI", "type": "branch", "color": "hsl(290, 65%, 50%)"},
    {"year": 2023, "title": "Foundation Models", "description": "Large-scale multi-modal AI systems", "type": "merge", "color": "hsl(200, 90%, 55%)"},
    {"year": 2025, "title": "Agentic AI", "description": "Autonomous AI agents that plan, reason, and act", "type": "merge", "color": "hsl(160, 80%, 50%)"},
]


async def seed_initial_data():
    """Seed the database with initial idea nodes if empty."""
    existing = await get_all_ideas()
    if len(existing) >= 10:
        print(f"[Seed] Already have {len(existing)} ideas. Skipping seed.")
        return

    print("[Seed] Seeding initial idea nodes...")

    # Seed base ideas
    await save_many_ideas(SEED_IDEAS)

    # Seed domain ideas
    for domain, ideas in DOMAIN_IDEAS.items():
        await save_many_ideas(ideas)

    total = len(SEED_IDEAS) + sum(len(v) for v in DOMAIN_IDEAS.values())
    print(f"[Seed] Seeded {total} idea nodes.")

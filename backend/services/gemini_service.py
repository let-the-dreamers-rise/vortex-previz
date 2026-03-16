"""Gemini service — wraps google.genai SDK for concept generation and scoring."""

import json
import os
from google import genai
from google.genai import types

_GLOBAL_CLIENT = None

def _get_client() -> genai.Client:
    """Get a cached Gemini client using API key or Vertex AI."""
    global _GLOBAL_CLIENT
    if _GLOBAL_CLIENT is not None:
        return _GLOBAL_CLIENT

    api_key = os.getenv("GOOGLE_API_KEY")
    use_vertex = os.getenv("GOOGLE_GENAI_USE_VERTEXAI", "false").lower() == "true"

    if use_vertex:
        _GLOBAL_CLIENT = genai.Client(
            vertexai=True,
            project=os.getenv("GOOGLE_CLOUD_PROJECT"),
            location=os.getenv("GOOGLE_CLOUD_LOCATION", "us-central1"),
            http_options={"api_version": "v1beta"}
        )
    else:
        _GLOBAL_CLIENT = genai.Client(
            api_key=api_key,
            http_options={"api_version": "v1beta"}
        )
    
    return _GLOBAL_CLIENT
# Use the latest Gemini models for maximum capability
MODEL_PRO = "gemini-3.1-pro-preview"   # Best for creative concept generation
MODEL_FLASH = "gemini-3-flash-preview"  # Fast for scoring and chat
IMAGEN_MODEL_DEMO = os.getenv("IMAGEN_MODEL_DEMO", "imagen-4.0-fast-generate-001")
IMAGEN_MODEL_LIVE = os.getenv("IMAGEN_MODEL_LIVE", IMAGEN_MODEL_DEMO)
VEO_MODEL = os.getenv("VEO_MODEL", "veo-3.1-fast-generate-preview")


def _json_config(**kwargs) -> types.GenerateContentConfig:
    """Prefer deterministic JSON output and disable hidden reasoning for stability."""
    config = {
        "response_mime_type": "application/json",
        "thinking_config": types.ThinkingConfig(
            include_thoughts=False,
            thinking_budget=int(os.getenv("GEMINI_THINKING_BUDGET", "256")),
        ),
    }
    config.update(kwargs)
    return types.GenerateContentConfig(**config)


def _clean_json_text(text: str) -> str:
    text = text.strip()
    if text.startswith("```"):
        text = text.split("\n", 1)[1]
    if text.endswith("```"):
        text = text.rsplit("```", 1)[0]
    return text.strip()


def _extract_response_text(response) -> str | None:
    text = getattr(response, "text", None)
    if text:
        return text

    candidates = getattr(response, "candidates", None) or []
    for candidate in candidates:
        content = getattr(candidate, "content", None)
        parts = getattr(content, "parts", None) or []
        chunks = [part.text for part in parts if getattr(part, "text", None)]
        if chunks:
            return "".join(chunks)

    return None


def _parse_json_response(response):
    text = _extract_response_text(response)
    if not text:
        raise ValueError(f"Gemini returned empty response. Structure: {response}")
    return json.loads(_clean_json_text(text))


def _normalize_style_node(parsed: dict) -> dict:
    """Ensure style extraction always returns a graph-ready node."""
    import random
    import uuid

    style_node = dict(parsed)
    style_node["id"] = style_node.get("id") or f"style-{uuid.uuid4().hex[:8]}"
    style_node["label"] = style_node.get("label") or style_node.get("name") or "Custom Style Node"
    style_node.setdefault("x", (random.random() - 0.5) * 400)
    style_node.setdefault("y", (random.random() - 0.5) * 400)
    style_node.setdefault("size", 28)
    style_node.setdefault("color", "hsl(280, 100%, 60%)")
    style_node.setdefault("glowColor", style_node["color"])
    style_node["category"] = "Style"
    style_node.setdefault("connections", [])
    style_node.setdefault(
        "traits",
        {
            "complexity": 80,
            "adoption": 80,
            "scalability": 80,
            "influence": 95,
        },
    )
    style_node.setdefault("year", 2026)
    style_node["isDiscovered"] = True
    style_node.setdefault(
        "fields",
        ["Cinematography", "Color Grading", "Art Direction"],
    )
    style_node.setdefault(
        "description",
        "A reusable cinematic style profile extracted from a reference image.",
    )
    style_node.setdefault("genome_traits", style_node.get("combined_traits", []))
    return style_node


async def generate_concept(parent_ideas: list[dict]) -> dict:
    """
    Generate a new hybrid concept by fusing traits from parent ideas.
    Returns: {name, description, architecture_layers, combined_traits, color}
    """
    client = _get_client()

    parent_descriptions = []
    all_traits = []
    for p in parent_ideas:
        parent_descriptions.append(
            f"- **{p['label']}** ({p['year']}): {p['description']}. "
            f"Traits: complexity={p['traits']['complexity']}, "
            f"adoption={p['traits']['adoption']}, "
            f"influence={p['traits']['influence']}. "
            f"Fields: {', '.join(p.get('fields', []))}"
        )
        all_traits.extend(p.get("genome_traits", []))

    prompt = f"""You are the IdeaGenome Discovery Engine — a scientific AI that synthesizes novel research concepts by fusing ideas from the knowledge graph.

Given these parent ideas:
{chr(10).join(parent_descriptions)}

{"Known traits: " + ", ".join(all_traits) if all_traits else ""}

Generate a NEW hybrid concept that emerges from combining these parent ideas. The concept should be:
- Scientifically plausible but pushing boundaries
- A genuine intellectual synthesis, not just a combination of words
- Something a research lab might actually explore in 2026-2030

Respond with ONLY valid JSON (no markdown):
{{
  "name": "Concept Name (2-4 words, compelling)",
  "description": "A 2-3 sentence scientific description of what this concept is and why it matters. Be specific about mechanisms.",
  "architecture_layers": ["Layer 1 Name", "Layer 2 Name", "Layer 3 Name", "Layer 4 Name", "Layer 5 Name", "Layer 6 Name"],
  "combined_traits": ["trait1", "trait2", "trait3", "trait4", "trait5"],
  "category": "AI or Physics or Neuroscience or Mathematics or Quantum or Robotics",
  "fields": ["field1", "field2", "field3"]
}}

architecture_layers should represent the conceptual pipeline/stack of this new idea (6 layers, from input to output).
combined_traits should be conceptual capabilities inherited/synthesized from parents.
"""

    response = client.models.generate_content(
        model=MODEL_PRO,
        contents=prompt,
        config=_json_config(
            temperature=0.9,
            max_output_tokens=1024,
        ),
    )

    return _parse_json_response(response)


async def score_concept(concept: dict, parent_ideas: list[dict]) -> dict:
    """
    Score a generated concept on novelty, feasibility, and impact.
    Returns: {novelty: int, feasibility: int, impact: int}
    """
    client = _get_client()

    parent_names = [p["label"] for p in parent_ideas]

    prompt = f"""You are an expert research evaluator for the IdeaGenome Discovery Engine.

Evaluate this newly synthesized concept:

**{concept['name']}**: {concept['description']}

Parent ideas: {', '.join(parent_names)}
Combined traits: {', '.join(concept.get('combined_traits', []))}

Score the concept on three dimensions (each 1-99):

1. **Novelty** — How original is this concept? Does it represent a genuine new direction?
   - 90+ = Paradigm-shifting, never proposed before
   - 70-89 = Highly novel combination with unique mechanisms
   - 50-69 = Interesting but somewhat expected synthesis
   - Below 50 = Incremental or already explored

2. **Feasibility** — Could this be built/researched with current or near-future technology?
   - 90+ = Could start building today with existing tools
   - 70-89 = Feasible with modest technical advances
   - 50-69 = Requires significant breakthroughs
   - Below 50 = Speculative, decades away

3. **Impact** — If successful, how transformative would this be?
   - 90+ = Would reshape entire industries
   - 70-89 = Major impact on multiple fields
   - 50-69 = Significant but focused impact
   - Below 50 = Niche or limited impact

Respond with ONLY valid JSON (no markdown):
{{"novelty": <int>, "feasibility": <int>, "impact": <int>}}
"""

    response = client.models.generate_content(
        model=MODEL_FLASH,
        contents=prompt,
        config=_json_config(
            temperature=0.3,
            max_output_tokens=128,
        ),
    )

    return _parse_json_response(response)


async def extract_style_from_image(image_bytes: bytes, mime_type: str) -> dict:
    """
    Uses Gemini 3.1 Pro (Vision) to analyze an uploaded cinematic still
    and extract its 'Style Genome' into a reusable node.
    """
    client = _get_client()

    prompt = """You are an expert Director of Photography and Colorist. The user has uploaded a still image from a film, commercial, or art piece.
Your job is to mathematically extract its "Style Genome"—the precise visual DNA (lighting, color grade, film stock, lens characteristics, vibe) so we can apply this exact style to AI video generators (Imagen 3 and Veo).

Analyze the image deeply, and output a JSON object representing a "Style Node" to be added to our 3D graph sequencer.

Respond with ONLY valid JSON (no markdown):
{
  "name": "A 2-4 word evocative name for this style (e.g. 'Neon Noir', '70s Panavision', 'Bleach Bypass')",
  "description": "A 2-3 sentence technical description of the exact lighting setup, color palette, and lens characteristics.",
  "architecture_layers": ["Lighting", "Color Grade", "Lens & Focus", "Film Stock/Grain", "Vibe/Mood"],
  "combined_traits": ["list", "of", "4-6", "key", "visual", "keywords"],
  "category": "Style",
  "fields": ["Cinematography", "Color Grading", "Art Direction"]
}
"""
    
    try:
        response = client.models.generate_content(
            model=MODEL_PRO,
            contents=[
                types.Part.from_bytes(data=image_bytes, mime_type=mime_type),
                prompt
            ],
            config=_json_config(
                temperature=0.4,
                max_output_tokens=768,
            ),
        )

        parsed = _parse_json_response(response)
    except Exception as e:
        print(f"Style Extraction Failed or Blocked: {e}. Falling back to default cinematic profile.")
        parsed = {
            "name": "Arri Alexa Cinematic",
            "description": "High contrast teal and orange color grade with heavy film grain, shot on 35mm anamorphic lenses.",
            "architecture_layers": ["High Contrast Lighting", "Teal/Orange Grade", "Anamorphic Lens", "35mm Film Grain", "Gritty Vibe"],
            "combined_traits": ["cinematic", "gritty", "teal-and-orange", "anamorphic"],
            "category": "Style",
            "fields": ["Cinematography", "Color Grading"]
        }

    return _normalize_style_node(parsed)


async def chat_response(message: str, graph_context: list[dict], history: list[dict] | None = None) -> dict:
    """
    Generate a conversational response about the knowledge graph.
    Returns: {response: str, suggested_explorations: list[str], discovered_domain: str|None}
    """
    client = _get_client()

    node_summaries = []
    for n in graph_context[:15]:  # Limit context size
        node_summaries.append(f"- {n['label']} ({n['year']}): {n['description'][:80]}...")

    history_text = ""
    if history:
        for h in history[-6:]:  # Last 6 messages
            role = "User" if h["role"] == "user" else "IdeaGenome AI"
            history_text += f"\n{role}: {h['content']}"

    prompt = f"""You are the **IdeaGenome AI** — an expert guide to the knowledge universe. You help users explore how ideas evolve, connect, and combine across disciplines.

The knowledge graph currently contains these ideas:
{chr(10).join(node_summaries)}

{f"Conversation so far:{history_text}" if history_text else "This is the start of the conversation."}

User says: {message}

Respond conversationally. If the user asks to "explore" a domain (neuroscience, robotics, physics, etc.), guide them into that domain. Use **bold** for important terms. Use emojis sparingly for domain shifts (🧠 neuroscience, 🤖 robotics, ⚛️ physics).

Also detect if the user is asking to explore a specific domain and include it.

Respond with ONLY valid JSON (no markdown):
{{
  "response": "Your conversational response using **bold** for key terms",
  "suggested_explorations": ["domain1", "domain2"],
  "discovered_domain": "neuroscience or robotics or physics or null"
}}

discovered_domain should only be set if the user explicitly asks to explore/shift to a domain.
"""

    response = client.models.generate_content(
        model=MODEL_FLASH,
        contents=prompt,
        config=_json_config(
            temperature=0.7,
            max_output_tokens=1024,
        ),
    )

    return _parse_json_response(response)


async def explore_domain(domain: str, existing_ideas: list[dict]) -> list[dict]:
    """
    Generate a set of 5-8 idea nodes for ANY domain using Gemini.
    
    This makes the knowledge graph truly universal — works for automobiles,
    medicine, space, music, cooking, anything the user asks about.
    
    Returns: list of idea node dicts ready to be added to the graph
    """
    client = _get_client()

    existing_names = [n["label"] for n in existing_ideas]

    prompt = f"""You are the IdeaGenome Discovery Engine. The user wants to explore the domain: **{domain}**

Generate 5-8 foundational ideas/concepts from this domain that would form an interesting knowledge graph. Each idea should be a real, significant concept from this field.

Already in the graph (avoid duplicates): {', '.join(existing_names[:20])}

For EACH idea, provide:
- A real concept name (not made up)
- What year it originated or became significant
- A 1-2 sentence description
- Which category/field it belongs to
- 4 genome traits (conceptual DNA of this idea)
- Which other ideas in THIS batch it connects to (by name)

Respond with ONLY valid JSON (no markdown):
{{
  "domain": "{domain}",
  "ideas": [
    {{
      "label": "Concept Name",
      "year": 1990,
      "description": "What this concept is and why it matters.",
      "category": "{domain.title()}",
      "fields": ["{domain.title()}", "Related Field"],
      "genome_traits": ["trait1", "trait2", "trait3", "trait4"],
      "connections_by_name": ["Other Concept Name"]
    }}
  ]
}}

Make these genuinely interesting and educational. Think of the most important, paradigm-shifting ideas in {domain}.
"""

    response = client.models.generate_content(
        model=MODEL_PRO,
        contents=prompt,
        config=_json_config(
            temperature=0.85,
            max_output_tokens=2048,
        ),
    )

    data = _parse_json_response(response)
    return data.get("ideas", [])

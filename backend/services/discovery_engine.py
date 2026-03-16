"""Discovery Engine — orchestrates the full idea discovery pipeline.

Pipeline:
1. Select parent ideas from the graph
2. Extract their genome traits
3. Call Gemini to generate a new hybrid concept
4. Score the concept on novelty/feasibility/impact
5. Create a new IdeaNode and optionally save to graph
"""

import math
import random
import re
from services import gemini_service, firestore_service


async def run_discovery(parent_ids: list[str]) -> dict:
    """
    Run the full AI discovery pipeline.

    Args:
        parent_ids: List of idea IDs to use as parents (2-5 ideas)

    Returns:
        Full discovery result with idea node, scores, traits, architecture, parents
    """
    # Step 1: Fetch parent ideas from store
    all_ideas = await firestore_service.get_all_ideas()
    idea_map = {idea["id"]: idea for idea in all_ideas}

    parents = []
    for pid in parent_ids:
        idea = idea_map.get(pid)
        if idea:
            parents.append(idea)

    if len(parents) < 2:
        raise ValueError(f"Need at least 2 valid parent ideas. Found {len(parents)} for IDs: {parent_ids}")

    # Step 2: Generate new concept via Gemini
    concept = await gemini_service.generate_concept(parents)

    # Step 3: Score the concept
    scores = await gemini_service.score_concept(concept, parents)

    # Step 4: Calculate node position (center of parents with offset)
    avg_x = sum(p.get("x", 0) for p in parents) / len(parents)
    avg_y = sum(p.get("y", 0) for p in parents) / len(parents)
    offset_x = (random.random() - 0.5) * 120
    offset_y = 120 + random.random() * 60

    # Step 5: Calculate color (average hue of parents)
    hues = []
    for p in parents:
        match = re.search(r"hsl\((\d+)", p.get("color", "hsl(180, 80%, 50%)"))
        if match:
            hues.append(int(match.group(1)))
        else:
            hues.append(180)
    avg_hue = round(sum(hues) / len(hues))
    # Shift hue slightly for uniqueness
    new_hue = (avg_hue + random.randint(-15, 15)) % 360
    color = f"hsl({new_hue}, 75%, 55%)"

    # Step 6: Build the new IdeaNode
    idea_id = f"discovered-{concept['name'].lower().replace(' ', '-').replace('/', '-')}"

    new_idea = {
        "id": idea_id,
        "label": concept["name"],
        "x": avg_x + offset_x,
        "y": avg_y + offset_y,
        "size": 26,
        "color": color,
        "glowColor": color,
        "category": concept.get("category", "Discovered"),
        "connections": parent_ids,
        "traits": {
            "complexity": scores.get("novelty", 75),
            "adoption": scores.get("feasibility", 65),
            "scalability": round((scores.get("novelty", 75) + scores.get("impact", 70)) / 2),
            "influence": scores.get("impact", 70),
        },
        "description": concept["description"],
        "year": 2026,
        "fields": concept.get("fields", ["AI", "Emerging"]),
        "isDiscovered": True,
        "genome_traits": concept.get("combined_traits", []),
    }

    # Step 7: Build response
    result = {
        "idea": new_idea,
        "scores": {
            "novelty": scores.get("novelty", 75),
            "feasibility": scores.get("feasibility", 65),
            "impact": scores.get("impact", 70),
        },
        "combined_traits": concept.get("combined_traits", []),
        "architecture_layers": concept.get("architecture_layers", []),
        "parents": parents,
    }

    # Step 8: Save discovery to store
    await firestore_service.save_discovery({
        "idea_id": idea_id,
        "parent_ids": parent_ids,
        "scores": result["scores"],
        "concept_name": concept["name"],
        "concept_description": concept["description"],
    })

    return result


async def add_discovered_idea_to_graph(idea: dict) -> dict:
    """Add a discovered idea to the persistent graph."""
    saved = await firestore_service.save_idea(idea)

    # Also update parent nodes' connections to include this new idea
    all_ideas = await firestore_service.get_all_ideas()
    for parent_id in idea.get("connections", []):
        for node in all_ideas:
            if node["id"] == parent_id and idea["id"] not in node.get("connections", []):
                node["connections"].append(idea["id"])
                await firestore_service.save_idea(node)

    return saved

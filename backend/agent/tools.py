"""Agent tools — functions exposed to the ADK agent as callable tools."""

from services import firestore_service, discovery_engine, gemini_service


async def scan_knowledge_graph() -> dict:
    """Scan the knowledge graph and return all idea nodes with their connections.
    
    Returns a summary of the current knowledge graph including node count,
    link count, and details of each idea node.
    """
    ideas = await firestore_service.get_all_ideas()
    
    total_links = sum(len(idea.get("connections", [])) for idea in ideas)
    
    node_summaries = []
    for idea in ideas:
        node_summaries.append({
            "id": idea["id"],
            "label": idea["label"],
            "category": idea.get("category", "Unknown"),
            "year": idea.get("year", 0),
            "description": idea.get("description", ""),
            "connections": idea.get("connections", []),
            "traits": idea.get("traits", {}),
            "genome_traits": idea.get("genome_traits", []),
            "isDiscovered": idea.get("isDiscovered", False),
        })
    
    return {
        "node_count": len(ideas),
        "link_count": total_links,
        "nodes": node_summaries,
    }


async def extract_genome(idea_id: str) -> dict:
    """Extract the conceptual genome (traits) from a specific idea node.
    
    Args:
        idea_id: The ID of the idea to extract genome from.
    
    Returns the idea's genome traits, trait scores, and metadata.
    """
    idea = await firestore_service.get_idea(idea_id)
    if not idea:
        return {"error": f"Idea '{idea_id}' not found in the knowledge graph."}
    
    return {
        "id": idea["id"],
        "label": idea["label"],
        "genome_traits": idea.get("genome_traits", []),
        "trait_scores": idea.get("traits", {}),
        "fields": idea.get("fields", []),
        "connections": idea.get("connections", []),
        "year": idea.get("year", 0),
        "description": idea.get("description", ""),
    }


async def fuse_concepts(parent_ids: list[str]) -> dict:
    """Fuse multiple idea genomes to discover a new hybrid concept.
    
    Args:
        parent_ids: List of 2-5 idea IDs to combine.
    
    Uses Gemini to generate a novel concept by combining the selected
    parent ideas' genomes. Returns the full discovery including name,
    description, scores, and architecture.
    """
    try:
        result = await discovery_engine.run_discovery(parent_ids)
        return {
            "success": True,
            "discovered_concept": result["idea"]["label"],
            "description": result["idea"]["description"],
            "scores": result["scores"],
            "combined_traits": result["combined_traits"],
            "architecture_layers": result["architecture_layers"],
            "parent_names": [p["label"] for p in result["parents"]],
        }
    except Exception as e:
        return {"success": False, "error": str(e)}


async def score_discovery(concept_name: str, concept_description: str, parent_ids: list[str]) -> dict:
    """Score a concept on novelty, feasibility, and impact.
    
    Args:
        concept_name: Name of the concept to score.
        concept_description: Description of the concept.
        parent_ids: IDs of parent ideas that inspired this concept.
    
    Returns scores from 1-99 on three dimensions.
    """
    all_ideas = await firestore_service.get_all_ideas()
    idea_map = {i["id"]: i for i in all_ideas}
    parents = [idea_map[pid] for pid in parent_ids if pid in idea_map]
    
    concept = {
        "name": concept_name,
        "description": concept_description,
        "combined_traits": [],
    }
    
    scores = await gemini_service.score_concept(concept, parents)
    return scores


async def add_to_graph(idea_data: dict) -> dict:
    """Add a newly discovered idea to the persistent knowledge graph.
    
    Args:
        idea_data: Full idea node data including id, label, traits, etc.
    
    Saves the idea to the graph and updates parent connections.
    """
    try:
        saved = await discovery_engine.add_discovered_idea_to_graph(idea_data)
        return {"success": True, "idea_id": saved["id"], "message": f"'{saved['label']}' added to the knowledge graph."}
    except Exception as e:
        return {"success": False, "error": str(e)}

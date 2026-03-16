"""Pydantic models for IdeaGenome — matches frontend IdeaNode interface exactly."""

from pydantic import BaseModel, Field
from typing import Optional


class TraitScores(BaseModel):
    complexity: int = Field(ge=0, le=100, description="Conceptual complexity score")
    adoption: int = Field(ge=0, le=100, description="Current adoption/usage score")
    scalability: int = Field(ge=0, le=100, description="Scalability potential score")
    influence: int = Field(ge=0, le=100, description="Cross-field influence score")


class IdeaNode(BaseModel):
    id: str
    label: str
    x: float = 0.0
    y: float = 0.0
    size: int = 24
    color: str = "hsl(180, 80%, 50%)"
    glowColor: str = "hsl(180, 80%, 50%)"
    category: str = "AI"
    connections: list[str] = []
    traits: TraitScores
    description: str
    year: int
    fields: list[str] = []
    isDiscovered: bool = False

    class Config:
        populate_by_name = True


class GenomeTrait(BaseModel):
    name: str
    source_idea: str
    weight: float = 1.0


class DiscoveryScores(BaseModel):
    novelty: int = Field(ge=0, le=99)
    feasibility: int = Field(ge=0, le=99)
    impact: int = Field(ge=0, le=99)


class DiscoveryRequest(BaseModel):
    parent_ids: list[str] = Field(min_length=2, max_length=5)


class DiscoveryResponse(BaseModel):
    idea: IdeaNode
    scores: DiscoveryScores
    combined_traits: list[str]
    architecture_layers: list[str]
    parents: list[IdeaNode]


class ChatRequest(BaseModel):
    message: str
    session_id: Optional[str] = None


class ChatResponse(BaseModel):
    response: str
    session_id: str
    suggested_explorations: list[str] = []
    discovered_domain: Optional[str] = None


class TimelineEvent(BaseModel):
    year: int
    title: str
    description: str
    type: str  # origin, mutation, merge, branch
    color: str

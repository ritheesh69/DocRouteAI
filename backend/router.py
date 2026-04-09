
from dataclasses import dataclass, field
from typing import List, Optional
import re

from models import LLMChoice


FINANCIAL_KEYWORDS = {
    "revenue", "ebitda", "profit", "loss", "balance sheet", "income statement",
    "cash flow", "dividend", "equity", "debt", "interest rate", "fiscal",
    "quarterly", "annual report", "eps", "earnings", "ipo", "valuation",
    "amortization", "depreciation", "capex", "opex", "margin", "liquidity",
    "solvency", "leverage", "hedge", "derivative", "portfolio", "asset",
    "liability", "invoice", "tax", "audit",
}

LEGAL_KEYWORDS = {
    "whereas", "hereinafter", "pursuant", "indemnify", "arbitration",
    "jurisdiction", "plaintiff", "defendant", "affidavit", "statute",
    "litigation", "covenant", "breach", "warranty", "liability", "clause",
    "contract", "agreement", "termination", "penalty",
}

SCIENTIFIC_KEYWORDS = {
    "methodology", "hypothesis", "p-value", "statistical significance",
    "regression", "cohort", "double-blind", "placebo", "abstract",
    "peer-reviewed", "literature review", "algorithm", "dataset",
    "neural network", "training loss",
}


@dataclass
class RoutingDecision:
    llm: str
    reasons: List[str] = field(default_factory=list)
    confidence: float = 1.0  # 0-1; surfaced in future UI iterations



def _check_low_text_density(text: str, page_count: int) -> Optional[RoutingDecision]:
    words = len(text.split())
    if page_count == 0:
        return None
    words_per_page = words / page_count
    if words_per_page < 80:
        return RoutingDecision(
            llm=LLMChoice.GEMINI,
            reasons=[
                f"Very low text density detected ({words_per_page:.0f} words/page)",
                "Document appears to be scanned or image-heavy",
                "Gemini Pro Vision selected for its OCR and visual understanding capabilities",
            ],
            confidence=0.95,
        )
    return None


def _check_financial_content(text: str) -> Optional[RoutingDecision]:
    """Route to GPT-4 when financial terminology is prominent."""
    lower = text.lower()
    hits = [kw for kw in FINANCIAL_KEYWORDS if kw in lower]
    if len(hits) >= 3:
        return RoutingDecision(
            llm=LLMChoice.GPT4,
            reasons=[
                f"Financial keywords detected: {', '.join(hits[:5])}{'...' if len(hits) > 5 else ''}",
                "Document contains quantitative financial data",
                "GPT-4 selected for superior numerical reasoning and financial domain expertise",
            ],
            confidence=0.9,
        )
    return None


def _check_document_length(page_count: int) -> Optional[RoutingDecision]:

    if page_count > 10:
        return RoutingDecision(
            llm=LLMChoice.CLAUDE,
            reasons=[
                f"Document has {page_count} pages (threshold: >10)",
                "Large context window required for full-document comprehension",
                "Claude 3 Opus selected for its 200K-token context and superior long-doc reasoning",
            ],
            confidence=0.88,
        )
    return None


def _check_legal_content(text: str) -> Optional[RoutingDecision]:
    lower = text.lower()
    hits = [kw for kw in LEGAL_KEYWORDS if kw in lower]
    if len(hits) >= 4:
        return RoutingDecision(
            llm=LLMChoice.GPT4,
            reasons=[
                f"Legal terminology detected: {', '.join(hits[:5])}",
                "Document contains structured legal language",
                "GPT-4 selected for its strength in clause-level legal comprehension",
            ],
            confidence=0.82,
        )
    return None


def _has_table_structure(text: str) -> bool:
    """Heuristic: look for repeated pipe characters or consistent whitespace columns."""
    pipe_lines = sum(1 for line in text.splitlines() if line.count("|") >= 2)
    return pipe_lines >= 3


def route_document(text: str, page_count: int, filename: str) -> RoutingDecision:

    rules = [
        _check_low_text_density(text, page_count),
        _check_financial_content(text),
        _check_document_length(page_count),
        _check_legal_content(text),
    ]

    for decision in rules:
        if decision is not None:
            # Enrich with table-structure signal when present
            if _has_table_structure(text):
                decision.reasons.append("Table-like structure detected in document")
            return decision

    reasons = [
        "No dominant domain signals detected",
        "Document length within standard range",
        "Claude 3 Haiku selected as cost-efficient general-purpose fallback",
    ]
    if _has_table_structure(text):
        reasons.append("Minor table-like structure detected")

    return RoutingDecision(
        llm=LLMChoice.FALLBACK,
        reasons=reasons,
        confidence=0.70,
    )

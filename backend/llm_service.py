
import asyncio
import random
from typing import Tuple

from models import LLMChoice



_GPT4_TEMPLATES = [
    (
        "Financial Analysis Summary\n"
        "━━━━━━━━━━━━━━━━━━━━━━━━━\n"
        "• Total Revenue identified: $4.2B (↑ 12% YoY)\n"
        "• EBITDA Margin: 28.4% — above sector median\n"
        "• Key Risk Factors: interest rate sensitivity, FX exposure\n"
        "• Recommendation: Further due-diligence on Q3 receivables\n"
        "• Confidence: High — 94% structured data extraction accuracy"
    ),
    (
        "Quantitative Document Overview\n"
        "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n"
        "• 3 financial tables extracted with 99.1% fidelity\n"
        "• Net Income trend: positive over 5 consecutive quarters\n"
        "• Debt-to-Equity ratio: 0.43 (healthy range)\n"
        "• Flagged: Unusual spike in CAPEX — recommend review"
    ),
]

_CLAUDE_TEMPLATES = [
    (
        "Comprehensive Document Analysis\n"
        "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n"
        "• Document spans 14 pages across 6 thematic sections\n"
        "• Core argument: sustainable supply-chain transformation\n"
        "• Key entities: 7 stakeholders, 3 geographic regions\n"
        "• Sentiment: Predominantly neutral with cautious optimism\n"
        "• Suggested follow-up: Cross-reference Sections 3 & 5 for contradictions"
    ),
    (
        "Long-Form Document Digest\n"
        "━━━━━━━━━━━━━━━━━━━━━━━━\n"
        "• Processed 200K+ tokens with full context retention\n"
        "• 4 executive-level recommendations extracted\n"
        "• Document coherence score: 87/100\n"
        "• Internal references resolved: 23/23\n"
        "• Tone: Formal corporate — suitable for board presentation"
    ),
]

_GEMINI_TEMPLATES = [
    (
        "Visual Document Extraction Report\n"
        "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n"
        "• OCR confidence: 96.3% across all pages\n"
        "• Detected: 5 embedded charts, 2 diagrams, 1 signature block\n"
        "• Scanned text reconstructed successfully\n"
        "• Language: English (US) — no mixed-language sections\n"
        "• Image quality: Sufficient (≥150 DPI across all pages)"
    ),
    (
        "Multi-Modal Content Summary\n"
        "━━━━━━━━━━━━━━━━━━━━━━━━━━\n"
        "• Page layout: 3-column format identified and normalised\n"
        "• Handwritten annotations: 4 detected, transcribed with 91% accuracy\n"
        "• Embedded images: 7 extracted and captioned\n"
        "• Text density restored from scan artefacts"
    ),
]

_FALLBACK_TEMPLATES = [
    (
        "General Document Summary\n"
        "━━━━━━━━━━━━━━━━━━━━━━━\n"
        "• Document processed successfully\n"
        "• Word count: ~1,200 | Reading time: ~5 min\n"
        "• Topics identified: 4 primary, 9 secondary\n"
        "• No domain-specific processing required\n"
        "• Suitable for general knowledge base ingestion"
    ),
]

_LLM_TEMPLATE_MAP = {
    LLMChoice.GPT4: _GPT4_TEMPLATES,
    LLMChoice.CLAUDE: _CLAUDE_TEMPLATES,
    LLMChoice.GEMINI: _GEMINI_TEMPLATES,
    LLMChoice.FALLBACK: _FALLBACK_TEMPLATES,
}



async def mock_llm_call(llm_name: str, extracted_text: str, filename: str) -> str:

    # Simulate network + inference latency (1.5 – 4 seconds)
    await asyncio.sleep(random.uniform(1.5, 4.0))

    templates = _LLM_TEMPLATE_MAP.get(llm_name, _FALLBACK_TEMPLATES)
    return random.choice(templates)


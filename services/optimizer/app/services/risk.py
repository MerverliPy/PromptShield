from ..schemas.contracts import Message, Risk

def estimate_risk(category: str, original: list[Message], compressed: list[Message]) -> Risk:
    changed_messages = sum(1 for a, b in zip(original, compressed) if a.content != b.content)
    level = "low"
    explanation = "No material edits detected."

    if changed_messages > 0:
        level = "medium" if category == "general" else "low"
        explanation = "Conservative compression applied outside protected sections."

    return Risk(level=level, explanation=explanation)

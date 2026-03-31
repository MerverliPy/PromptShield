from ..schemas.contracts import OptimizeRequest

def classify_request(request: OptimizeRequest) -> str:
    text = " ".join(message.content.lower() for message in request.messages)
    if "summarize" in text:
        return "summarization"
    if "extract" in text:
        return "extraction"
    return "general"

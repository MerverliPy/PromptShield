from fastapi import APIRouter
from ..schemas.contracts import OptimizeRequest, OptimizeResponse
from ..services.classifier import classify_request
from ..services.compressor import compress_messages
from ..services.risk import estimate_risk

router = APIRouter()

@router.post("/optimize", response_model=OptimizeResponse)
def optimize(request: OptimizeRequest) -> OptimizeResponse:
    category = classify_request(request)
    compressed, actions = compress_messages(request.messages, request.protected_sections)
    risk = estimate_risk(category=category, original=request.messages, compressed=compressed)

    return OptimizeResponse(
        category=category,
        compressed_messages=compressed,
        actions=actions,
        risk=risk,
    )

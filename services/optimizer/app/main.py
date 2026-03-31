from fastapi import FastAPI
from .api.routes import router

app = FastAPI(title="PromptShield Optimizer")
app.include_router(router)

@app.get("/health")
def health() -> dict[str, str | bool]:
    return {"ok": True, "service": "optimizer"}

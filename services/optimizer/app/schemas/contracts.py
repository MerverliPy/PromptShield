from pydantic import BaseModel

# Mirrors shared message semantics from `packages/contracts/src/messages.ts`.
# Replace with generated schemas once the optimizer HTTP contract stabilizes.

class Message(BaseModel):
    role: str
    content: str

class Action(BaseModel):
    type: str
    before_chars: int
    after_chars: int
    reason: str

class Risk(BaseModel):
    level: str
    explanation: str

class OptimizeRequest(BaseModel):
    messages: list[Message]
    protected_sections: list[str] = []

class OptimizeResponse(BaseModel):
    category: str
    compressed_messages: list[Message]
    actions: list[Action]
    risk: Risk

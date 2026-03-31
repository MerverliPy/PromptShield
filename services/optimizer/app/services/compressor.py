from ..schemas.contracts import Action, Message

def compress_messages(messages: list[Message], protected_sections: list[str]) -> tuple[list[Message], list[Action]]:
    compressed: list[Message] = []
    actions: list[Action] = []

    for message in messages:
        content = message.content
        if any(section in content for section in protected_sections):
            compressed.append(message)
            continue

        squashed = " ".join(content.split())
        if squashed != content:
            actions.append(Action(
                type="whitespace_compaction",
                before_chars=len(content),
                after_chars=len(squashed),
                reason="Removed redundant whitespace only",
            ))
        compressed.append(Message(role=message.role, content=squashed))

    return compressed, actions

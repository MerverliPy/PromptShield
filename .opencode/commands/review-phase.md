---
description: Review the active phase without editing
agent: review
subtask: true
model: openai/gpt-5.4-mini
---

Review only the files changed for the active phase.

Focus on:
- scope drift
- coupling
- contract drift
- token waste
- missing validation
- unnecessary complexity

Return:
1. pass or fail
2. issues found
3. exact fixes required
4. blocker status

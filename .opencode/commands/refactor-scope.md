---
description: Reduce token waste and tighten scope without changing behavior
agent: refactor
subtask: true
model: openai/gpt-5.4-mini
---

Read only files named by the controller.

Focus on:
- duplication
- oversized phases
- unrelated instruction loading
- opportunities to split work into smaller bounded phases

Return:
1. token waste issues
2. scope reduction opportunities
3. recommended phase split
4. files to stop loading by default

---
id: "1.3"
title: "Context Windows & Token Economy"
module: "AI Fundamentals"
moduleId: "module-1"
keywords:
  - context window
  - tokens
  - memory
  - cost
  - concise
  - capacity
---

# UNDERSTANDING LIMITS

Context Windows & Token Economy.

What this lesson is: A simple, accurate breakdown of LLM limits (capacity and cost). It covers how AI providers handle memory and the constraints students must work within.

## Context Window

Definition: The amount of information an LLM can process at once.

Mental Model: Works like short-term memory with a fixed cap. If you overload it, earlier parts get dropped or the reply cuts off.

> Practical Behavior: Keep conversations focused. Start a fresh thread when switching to a new project or when the chat gets bloated to avoid "forgetting."

# TOKEN ECONOMY

## Token Economy

Definition: LLMs process and bill on tokens, not characters or words.

Mental Model: Roughly 4 characters or 0.75 words per token.

Impact: Longer inputs and outputs cost more and eat into the context window.

> Strategy: Be concise but specific. Remove fluff, but keep high-signal context.

# COST MANAGEMENT

## Cost & Quality Tradeoff

The Balance: Longer conversations cost more tokens. Good context is worth spending tokens on; random background noise is not.

> Goal: Aim for "minimum tokens that still give the model exactly what it needs."

## Learning Outcomes

- Explain simply what a context window is and why it matters
- Recognize that even if it seems like the memory is all there, it might have gone away due to context compression
- Start managing your context better immediately

---
id: "1.2"
title: "LLM Fundamentals"
module: "AI Fundamentals"
moduleId: "module-1"
keywords:
  - token
  - prediction
  - context
  - bias
  - autocomplete
  - sequence
  - LLM
---

# THE PROBLEM

LLM Fundamentals - this is what makes context important for every AI task.

The Outcome You Want: Use AI to help you in business. Building an automation workflow, creating a customer support agent, generating marketing assets.

The Blocker: They do not understand what "token prediction" does and the implications of prediction. Which means you can't engineer the context they need, for the outcome they want. Since LLMs power every AI tool, agent, automation etc - context engineering is a core dependency in all AI use.

# TOKEN PREDICTION

Fundamental 1: Token-by-token prediction.

What it is: The model takes the input it has in its context window, then using essentially a very advanced autocomplete trained on great amounts of data.

For the next position (first letter in the reply you get after a prompt), it assigns probabilities to possible tokens. Once a token is selected (based on decoding settings), that token is added to the sequence. The process repeats until a stop signal.

Best for understanding that: The model is not "planning paragraphs" ahead of time. Every word you see is a local choice conditioned on the current sequence. Small changes to input can change the entire continuation.

Why it matters for context engineering: Whatever is in the input right now can influence every next step. If an important detail isn't inside the sequence, it cannot affect prediction. Your structure and ordering of information change how the continuation unfolds.

> Practical implications: You can steer the flow by controlling what appears earlier vs later. You can reduce drift by keeping instructions and constraints close to where the work happens. You can debug outputs by asking yourself: "what additional context would have made it impossible to get this reply"

# MODEL BIAS

Fundamental 2: Bias.

What it is: The model has internal "bias". Models from different providers like Claude, OpenAI and Grok have noticeable different behaviors. Languages, stacks, styles, social scripts, patterns of explanation. Alignment layers add safety and tone preferences.

Bias affects the output a lot: It affects how to interpret your prompt. It affects which approach it picks to solve a task. It affects what level of detail and rigor it defaults to.

Best for understanding that: If you say nothing about style, it will default to whatever it considers is "most common" in its training. If you're vague about constraints, it will use typical patterns, not your specific reality. If you don't define what "good" looks like, it will invent its own standard.

# CONTEXT DEFINITION

Fundamental 3: What the model actually sees as "context".

System instructions, your latest message, recent chat history that fits, and any text you inject (docs, snippets, tool output, profiles, etc.).

> Context is: what other info does the model have besides straight from factory.

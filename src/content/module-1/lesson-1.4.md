---
id: "1.4"
title: "Context Engineering"
module: "AI Fundamentals"
moduleId: "module-1"
keywords:
  - control context
  - information context
  - behavior
  - style
  - facts
---

# THE QUESTION

Context Engineering.

So you now know how LLMs actually generate text (token-by-token) and that they only work with what fits inside their context window.

The question is: how do you control what the model sees and how it behaves so you get the outcome you actually want?

Two Categories of Context:

# CONTROL CONTEXT

## Control Context (How it should "behave")

What it does: Controls how the LLM generates.

Examples: Brand voice samples, Style guidelines, Constraints like "be concise", "short sentences", "no fluff", Examples showing good vs. bad outputs.

> Mechanism: Provides patterns for the LLM to match and bias toward. Steers tone, depth, pacing, and structure.

# INFORMATION CONTEXT

## Information Context (Factual Grounding)

What it does: Provides the "what" for the LLM to work with.

Examples: Business details and offer specifics, Product features and pricing, Target market, positioning, constraints, Code architecture, APIs, data to analyze.

> Mechanism: Gives the LLM concrete facts and constraints to incorporate. Reduces guessing about your actual situation.

# PUTTING IT TOGETHER

The Key Insight: You need both for every task.

Example: Writing a landing page.

Control Context: "Write in a direct, no-BS style. Short sentences. Punchy headlines."

Information Context: "Our product is an AI automation tool for e-commerce brands doing $1M-$10M/year. It saves around 20 hours/week."

Result with both: Copy that sounds like you and accurately describes your product.

Result with only control context: Copy that sounds like you, but gets product details wrong.

Result with only information context: Copy that lists correct facts but feels generic and off-brand.

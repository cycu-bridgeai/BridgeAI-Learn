---
title: How Transformers Actually Work
description: A visual and intuitive explanation of the attention mechanism that powers modern LLMs.
date: 2026-03-20
tags:
  - transformers
  - deep-learning
  - nlp
---

## The Attention Mechanism

Before transformers, sequence models (RNNs, LSTMs) processed tokens one by one. The core problem: long-range dependencies were hard to learn.

**Attention** solves this by letting each token look at every other token simultaneously.

## Self-Attention in Three Steps

Given an input sequence of tokens, self-attention computes:

1. **Query (Q)**, **Key (K)**, **Value (V)** — linear projections of each token's embedding
2. **Scores** — dot product of Q with all Ks, scaled by √d
3. **Weighted sum** — softmax(scores) × V gives the attended output

```python
import torch
import torch.nn.functional as F

def self_attention(Q, K, V):
    d = Q.shape[-1]
    scores = Q @ K.transpose(-2, -1) / d ** 0.5
    weights = F.softmax(scores, dim=-1)
    return weights @ V
```

## Multi-Head Attention

Instead of one attention operation, transformers run several in parallel (heads), each learning different relationships:

- Head 1 might track subject-verb agreement
- Head 2 might track coreference (which pronoun refers to which noun)
- Head 3 might capture position

::youtube-embed{id="eMlx5fFNoYc" title="Transformers, explained"}
::

## Positional Encoding

Transformers have no built-in sense of order. Positional encodings are added to embeddings to inject position information.

Modern models (like LLaMA) use **Rotary Position Embedding (RoPE)** instead, which bakes position into the attention scores directly.

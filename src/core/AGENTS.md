# src/core guidance

Core owns configuration, dispatch, consent, privacy filtering, logging, and queues. Every event must pass consent and data minimization before a provider sees it. Keep reads bounded, errors actionable, and singleton cleanup deterministic. Last context pass: 2026-10-20; next routine pass: 2026-11-19.

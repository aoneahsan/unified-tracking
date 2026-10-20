# src/providers/error-handling guidance

Error providers must preserve error causes and stacks without leaking secrets. Guard vendor globals, keep initialization failures actionable, and distinguish WebView delivery from unverified native SDK delivery. Last context pass: 2026-10-20; next routine pass: 2026-11-19.

# Compare AI — Product brief

## Problem and evidence

ERP selection, fit-gap, and design work involves reconciling multiple sources: requirements, vendor responses, process documents, configuration decisions, and meeting outputs. Teams commonly compare them by hand in spreadsheets and decks. This takes analyst time, weakens traceability between a claim and its source, and can leave unresolved differences hidden until a later workshop or decision.

This is a workflow hypothesis based on typical implementation analysis. No completed participant pilot, measured baseline, or customer endorsement is documented in this repository. There are no substantiated time-saving claims.

## Product choice and prioritization

Prioritize an evidence-first comparison matrix across 2–10 documents. Show source evidence, differences, clarification needs, and potential risks, and let the user make the decision. Local parsing and bounded extracted text keep the initial workflow practical while retaining explicit user control over provider disclosure.

## Success criteria

Time an implementation analyst comparing a representative document set using the current process and Compare AI. Review results with a second practitioner against a manually prepared reference. Measure:

- elapsed time to a decision-ready comparison;
- material differences and clarification questions found versus the reference;
- unsupported statements or source-attribution errors;
- reviewer corrections and confidence in traceability;
- number and type of documents the workflow cannot parse or safely disclose.

Set acceptable thresholds with participants before the pilot. Faster output is not success if material differences are missed or evidence cannot be traced.

## Deferred

- selecting a winning vendor or making autonomous design decisions;
- integrations with requirements, ticketing, or ERP configuration systems;
- collaborative annotations, access control, and audit history;
- OCR guarantees for image-only scans and unrestricted document sizes.

## Learning to capture

Capture which document pairings create the most rework, what evidence format practitioners trust, how often they need clarifications versus summaries, parsing failures, and provider-data restrictions. Keep source documents and confidential findings out of Git.

# Component Spec: TraceUI

## Purpose
Visual debugging and transparency for the multi-agent LangGraph execution.

## Routes
- `/trace/:run_id`

## Behavior
- Polls `GET /api/runs/:run_id/events` and `GET /api/runs/:run_id/state` every 2s.
- Renders agent nodes with status indicators (WAIT, ACTIVE, OK).
- Live event stream with timestamps.
- JSON state viewer using JetBrains Mono font.

## Design Tokens
- Colors: Dark mode (Navy #001F3F), Electric highlights.
- Typography: JetBrains Mono for technical data.
- Motion: Pulsing active nodes, progress bar animations.

# AGENTS.md

## Project
TypeNow is a production-grade, offline-first desktop typing test and typing-learning application for Windows, macOS, and Linux.

## Product principles
- Build real, complete functionality. No demos, mock flows, fake statistics, placeholder content, or repeated sample text presented as real content.
- Prioritize correctness, responsiveness, accessibility, privacy, and a polished desktop experience.
- Keep the interface deliberate and professionally designed. Avoid generic dashboard layouts, excessive cards, gradients, glows, glassmorphism, decorative animation, and unnecessary visual effects.
- Make status and progress clear wherever users need them.
- English is the first supported language. Design content and data models so additional languages can be added without rewriting core systems.

## Technology
- Use the existing Tauri 2, Rust, React, TypeScript, Vite, and shadcn/ui setup.
- Use the existing project conventions and dependencies where practical. Do not replace the stack or introduce a competing framework.
- Use Rust for native capabilities, persistence boundaries, and performance-sensitive or security-sensitive operations.
- Use React and TypeScript for the application interface.
- Use SQLite for durable local application data when persistence is introduced.
- Keep core typing tests usable offline. Do not make core functionality depend on a remote API.

## Engineering rules
- Follow KISS and DRY. Prefer the simplest maintainable implementation that satisfies the requirement.
- Keep modules cohesive and responsibilities clear. Avoid giant components, giant files, unnecessary abstractions, speculative generality, and premature plugin systems.
- Reuse existing utilities and components before creating alternatives.
- Use strict TypeScript. Avoid `any`; model domain states and data explicitly.
- Handle errors deliberately. Never silently swallow errors or report success when an operation failed.
- Validate data at system boundaries.
- Keep UI state, domain logic, persistence, and platform integration separated.
- Avoid unnecessary dependencies. Explain the concrete need before adding one.
- Do not add code comments by default. Add a comment only when the reason or behavior cannot be made clear through naming and structure; keep such comments minimal and useful.
- Do not leave TODOs, placeholder implementations, dead code, unused assets, or temporary debug output in completed work.
- Do not change unrelated files or rewrite working code without a clear reason.

## UI and interaction
- Use accessible semantic controls, keyboard navigation, visible focus states, and appropriate contrast.
- Design for desktop window resizing and the three target operating systems.
- Use consistent spacing, typography, color tokens, borders, and interaction states.
- Prefer purposeful transitions; respect reduced-motion preferences.
- Every visible control must work. Do not render inert buttons or fake settings.
- Provide useful empty, loading, error, disabled, and success states where applicable.

## Typing experience
- Typing input must remain responsive and must not be delayed by rendering, persistence, or audio work.
- Measure WPM, accuracy, elapsed time, correct characters, incorrect characters, and completion consistently. Define calculation rules once and reuse them.
- Handle paste, navigation keys, modifier keys, IME/composition input, focus loss, and platform differences intentionally.
- Do not count unsupported input or control keys as typed characters.
- Keep test generation separate from test measurement. Content selection must be reproducible when seeded and must not repeat content unnecessarily within a session.
- Do not fabricate typing content. Use verified, appropriately licensed datasets or authored lesson content, with source and license metadata where applicable.

## Audio assets
- Treat `keyboard-sounds/` as source assets until inspected and integrated.
- Preserve original recordings. Do not overwrite or destructively edit source WAV files.
- Inspect each pack's `pack.json` and actual audio files before relying on their naming or semantics.
- Verify licensing and attribution requirements before redistributing any sound pack in application builds.
- Use a configurable sound-pack manifest and explicit mappings for regular, wide/special, press, and release sounds based on the actual asset metadata.
- Preload/cache audio appropriately, avoid allocating a new player for every keystroke, and prevent repeated samples from sounding mechanical.
- Audio must be optional, have a volume control, and never block typing input.
- Do not claim that different letters have unique recordings unless the assets actually provide per-key recordings.

## Data and reliability
- Persist user settings and progress safely. Use schema migrations for database changes.
- Make operations safe to retry where appropriate.
- Keep user data local by default and provide clear data-loss behavior for destructive actions.
- Test domain logic independently of the UI and cover important edge cases.

## Workflow
1. Inspect the existing repository, package scripts, dependencies, Tauri configuration, and assets before editing.
2. Preserve the existing project structure unless there is a clear improvement with a concrete benefit.
3. Implement in small, coherent steps and keep the application runnable.
4. Run relevant formatting, linting, type-checking, tests, and production builds after changes.
5. Fix issues caused by the implementation. Do not claim checks passed unless they were actually run.
6. At completion, summarize what changed, important decisions, commands run and their results, and any genuine remaining limitations.
7. After completion add and commit with appropriate message

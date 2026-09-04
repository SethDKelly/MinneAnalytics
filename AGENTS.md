# Repository Agent Entry Point

For Concept Design or design-documentation work, start at [`docs/concept-design/knowledge/index.md`](docs/concept-design/knowledge/index.md).

Obey the canonical [Documentation Authority & Cross-Reference Rules](docs/concept-design/knowledge/rules/documentation-authority.md) and [Concept Design Authority](docs/concept-design/knowledge/rules/concept-design-authority.md) rather than reproducing those rules here.

Use numbered phase/evidence records only when the task requires provenance, alternatives, historical reasoning, or contradiction resolution. Prefer progressive disclosure over loading the entire discovery history into context.

Do not refactor application/domain code merely to mirror Concept Design or OKF document structure. Application changes require explicit implementation reconciliation.

After changing the OKF knowledge bundle, run `npm run docs:validate` and update the relevant `log.md` when canonical knowledge changes materially.

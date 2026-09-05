export const IMPLEMENTATION_GATES = {
  revisionEvaluationWrites: "MINNE_V0_WRITE_REVISION_EVALUATION",
  selectionParticipationWrites: "MINNE_V0_WRITE_SELECTION_PARTICIPATION",
  lifecycleDisclosureWrites: "MINNE_V0_WRITE_LIFECYCLE_DISCLOSURE",
  publicationWrites: "MINNE_V0_WRITE_PUBLICATION",
  scheduleWrites: "MINNE_V0_WRITE_SCHEDULE",
  dispatchWrites: "MINNE_V0_WRITE_DISPATCH",
  semanticReads: "MINNE_V0_SEMANTIC_READS",
} as const;

export type ImplementationGate = keyof typeof IMPLEMENTATION_GATES;

const TRUE_VALUES = new Set(["1", "true", "yes", "on"]);
const WRITE_AUTHORITY_GATES = new Set<ImplementationGate>([
  "revisionEvaluationWrites",
  "selectionParticipationWrites",
  "lifecycleDisclosureWrites",
  "publicationWrites",
  "scheduleWrites",
  "dispatchWrites",
]);

/**
 * Phase 004-G retires writer feature flags as authority rollback switches.
 *
 * Once canonical history-bearing writes became active, turning a write flag off
 * could reactivate independent legacy mutation paths and violate rollback floors.
 * Those write gates therefore remain logically ON regardless of environment.
 *
 * Semantic reads remain reversible for controlled read rollback. They default to
 * ON after 004-F and may be explicitly disabled without changing write authority.
 */
export function isImplementationGateEnabled(
  gate: ImplementationGate,
  env: NodeJS.ProcessEnv = process.env
): boolean {
  if (WRITE_AUTHORITY_GATES.has(gate)) return true;

  const raw = env[IMPLEMENTATION_GATES[gate]];
  if (raw == null) return true;
  return TRUE_VALUES.has(raw.trim().toLowerCase());
}

export function getImplementationGateSnapshot(
  env: NodeJS.ProcessEnv = process.env
): Record<ImplementationGate, boolean> {
  return Object.fromEntries(
    (Object.keys(IMPLEMENTATION_GATES) as ImplementationGate[]).map((gate) => [
      gate,
      isImplementationGateEnabled(gate, env),
    ])
  ) as Record<ImplementationGate, boolean>;
}

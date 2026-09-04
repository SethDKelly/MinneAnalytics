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

export function isImplementationGateEnabled(
  gate: ImplementationGate,
  env: NodeJS.ProcessEnv = process.env
): boolean {
  const raw = env[IMPLEMENTATION_GATES[gate]];
  return raw ? TRUE_VALUES.has(raw.trim().toLowerCase()) : false;
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

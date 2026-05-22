export type CapacityConfig = {
  rooms: number;
  sessionsPerRoom: number;
  eodTrim: number;
  graemeSlots: number;
  sponsorMin: number;
  sponsorMax: number;
};

export type CapacitySnapshot = {
  rawSlots: number;
  afterTrim: number;
  sponsorMin: number;
  sponsorMax: number;
  communityTargetMin: number;
  communityTargetMax: number;
  approvedCount: number;
  backupCount: number;
  pendingCount: number;
  sponsorSessionCount: number;
};

export function computeCapacity(
  config: CapacityConfig,
  counts: {
    approved: number;
    backup: number;
    pending: number;
    sponsorSessions: number;
  }
): CapacitySnapshot {
  const rawSlots = config.rooms * config.sessionsPerRoom;
  const afterTrim = rawSlots - config.eodTrim - config.graemeSlots;
  const communityTargetMin = afterTrim - config.sponsorMax;
  const communityTargetMax = afterTrim - config.sponsorMin;

  return {
    rawSlots,
    afterTrim,
    sponsorMin: config.sponsorMin,
    sponsorMax: config.sponsorMax,
    communityTargetMin,
    communityTargetMax,
    approvedCount: counts.approved,
    backupCount: counts.backup,
    pendingCount: counts.pending,
    sponsorSessionCount: counts.sponsorSessions,
  };
}

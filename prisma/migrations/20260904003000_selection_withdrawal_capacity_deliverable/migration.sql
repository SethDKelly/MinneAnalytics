-- 004-C: Selection, Withdrawal, Capacity & Deliverable canonicalization.
--
-- 004-A created the additive semantic structures. This migration adds only the
-- database constraints required for safe 004-C write authority.

-- A Pool/Proposal pair may have historical allocations, but at most one may be
-- active at a time. SQLite partial uniqueness gives the active-state invariant
-- database enforcement while allowing released history to remain immutable.
CREATE UNIQUE INDEX "CapacityAllocation_pool_id_submission_id_active_key"
ON "CapacityAllocation"("pool_id", "submission_id")
WHERE "released_at" IS NULL;

-- DeckFile version is the retained compatibility ordinal for ArtifactVersion.
-- Prevent concurrent/native writes from creating two logical versions with the
-- same ordinal for one Proposal.
CREATE UNIQUE INDEX "DeckFile_submission_id_version_key"
ON "DeckFile"("submission_id", "version");

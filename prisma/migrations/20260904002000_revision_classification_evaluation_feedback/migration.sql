-- 004-B: Revision, Classification, Evaluation & Feedback canonicalization foundation.
--
-- This migration changes only constraints/metadata required for the first semantic
-- write cutover. Existing legacy rows remain representable: exact Evaluation and
-- Revision migration fields are nullable so unresolved historical truth is not
-- fabricated.

-- Revision command idempotency and migration provenance.
ALTER TABLE "SubmissionRevision" ADD COLUMN "command_key" TEXT;
ALTER TABLE "SubmissionRevision" ADD COLUMN "migration_provenance" TEXT;
ALTER TABLE "SubmissionRevision" ADD COLUMN "migration_observed_at" DATETIME;

CREATE UNIQUE INDEX "SubmissionRevision_command_key_key"
ON "SubmissionRevision"("command_key");

-- Exact Evaluation identity. The key is implementation infrastructure derived
-- from reviewerAccessId + exact SubmissionRevision.id. NULL is reserved for
-- unresolved legacy rows and therefore remains allowed.
ALTER TABLE "Score" ADD COLUMN "exact_evaluation_key" TEXT;

-- The legacy uniqueness constraint erased prior Revision-specific Evaluation
-- history by forcing one Score per reviewer + Submission. Retain a normal index
-- for compatibility lookups, but move uniqueness to exact Evaluation identity.
DROP INDEX "Score_submission_id_reviewer_access_id_key";
CREATE INDEX "Score_submission_id_reviewer_access_id_idx"
ON "Score"("submission_id", "reviewer_access_id");
CREATE UNIQUE INDEX "Score_exact_evaluation_key_key"
ON "Score"("exact_evaluation_key");

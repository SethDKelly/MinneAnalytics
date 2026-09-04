-- 004-A additive reconciliation foundation.
-- No semantic writer is switched by this migration. All new references on legacy
-- rows are nullable and are populated only by later validated backfill/cutover
-- packages.

PRAGMA foreign_keys=OFF;
BEGIN TRANSACTION;

CREATE TABLE "AvailabilityWindow" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "conference_id" TEXT NOT NULL,
  "opportunity_key" TEXT NOT NULL,
  "opens_at" DATETIME NOT NULL,
  "closes_at" DATETIME NOT NULL,
  "provenance" TEXT NOT NULL DEFAULT 'NATIVE',
  "observed_at" DATETIME,
  "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "AvailabilityWindow_conference_id_fkey" FOREIGN KEY ("conference_id") REFERENCES "Conference" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT "AvailabilityWindow_interval_check" CHECK ("opens_at" < "closes_at")
);
CREATE UNIQUE INDEX "AvailabilityWindow_conference_id_opportunity_key_key" ON "AvailabilityWindow"("conference_id", "opportunity_key");

CREATE TABLE "SelectionDecision" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "conference_id" TEXT NOT NULL,
  "submission_id" TEXT NOT NULL,
  "disposition" TEXT,
  "decided_by_ref" TEXT,
  "decided_at" DATETIME,
  "predecessor_decision_id" TEXT,
  "provenance" TEXT NOT NULL DEFAULT 'NATIVE',
  "recorded_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "SelectionDecision_conference_id_fkey" FOREIGN KEY ("conference_id") REFERENCES "Conference" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT "SelectionDecision_submission_id_fkey" FOREIGN KEY ("submission_id") REFERENCES "Submission" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT "SelectionDecision_predecessor_decision_id_fkey" FOREIGN KEY ("predecessor_decision_id") REFERENCES "SelectionDecision" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
CREATE UNIQUE INDEX "SelectionDecision_predecessor_decision_id_key" ON "SelectionDecision"("predecessor_decision_id");
CREATE INDEX "SelectionDecision_conference_id_submission_id_idx" ON "SelectionDecision"("conference_id", "submission_id");

CREATE TABLE "WithdrawalRecord" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "submission_id" TEXT NOT NULL,
  "withdrawn_by_ref" TEXT,
  "withdrawn_at" DATETIME,
  "provenance" TEXT NOT NULL DEFAULT 'NATIVE',
  "recorded_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "WithdrawalRecord_submission_id_fkey" FOREIGN KEY ("submission_id") REFERENCES "Submission" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
CREATE UNIQUE INDEX "WithdrawalRecord_submission_id_key" ON "WithdrawalRecord"("submission_id");

CREATE TABLE "CapacityPool" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "conference_id" TEXT NOT NULL,
  "key" TEXT NOT NULL,
  "limit_units" INTEGER NOT NULL,
  "provenance" TEXT NOT NULL DEFAULT 'NATIVE',
  "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" DATETIME NOT NULL,
  CONSTRAINT "CapacityPool_conference_id_fkey" FOREIGN KEY ("conference_id") REFERENCES "Conference" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT "CapacityPool_limit_check" CHECK ("limit_units" >= 0)
);
CREATE UNIQUE INDEX "CapacityPool_conference_id_key_key" ON "CapacityPool"("conference_id", "key");

CREATE TABLE "CapacityClassRate" (
  "pool_id" TEXT NOT NULL,
  "class_ref" TEXT NOT NULL,
  "units" INTEGER NOT NULL,
  "updated_at" DATETIME NOT NULL,
  PRIMARY KEY ("pool_id", "class_ref"),
  CONSTRAINT "CapacityClassRate_pool_id_fkey" FOREIGN KEY ("pool_id") REFERENCES "CapacityPool" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT "CapacityClassRate_units_check" CHECK ("units" > 0)
);

CREATE TABLE "CapacityAllocation" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "pool_id" TEXT NOT NULL,
  "submission_id" TEXT NOT NULL,
  "class_ref" TEXT NOT NULL,
  "units_applied" INTEGER NOT NULL,
  "allocated_by_ref" TEXT,
  "allocated_at" DATETIME,
  "released_by_ref" TEXT,
  "released_at" DATETIME,
  "provenance" TEXT NOT NULL DEFAULT 'NATIVE',
  "recorded_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "CapacityAllocation_pool_id_fkey" FOREIGN KEY ("pool_id") REFERENCES "CapacityPool" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT "CapacityAllocation_submission_id_fkey" FOREIGN KEY ("submission_id") REFERENCES "Submission" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT "CapacityAllocation_units_check" CHECK ("units_applied" > 0)
);
CREATE INDEX "CapacityAllocation_pool_id_submission_id_idx" ON "CapacityAllocation"("pool_id", "submission_id");
CREATE INDEX "CapacityAllocation_pool_id_released_at_idx" ON "CapacityAllocation"("pool_id", "released_at");

CREATE TABLE "CoverageTarget" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "conference_id" TEXT NOT NULL,
  "dimension_key" TEXT NOT NULL,
  "bucket_ref" TEXT NOT NULL,
  "measure_key" TEXT NOT NULL,
  "lower_bound" REAL,
  "upper_bound" REAL,
  "provenance" TEXT NOT NULL DEFAULT 'NATIVE',
  "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" DATETIME NOT NULL,
  CONSTRAINT "CoverageTarget_conference_id_fkey" FOREIGN KEY ("conference_id") REFERENCES "Conference" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT "CoverageTarget_bounds_check" CHECK (
    ("lower_bound" IS NOT NULL OR "upper_bound" IS NOT NULL) AND
    ("lower_bound" IS NULL OR "lower_bound" >= 0) AND
    ("upper_bound" IS NULL OR "upper_bound" >= 0) AND
    ("lower_bound" IS NULL OR "upper_bound" IS NULL OR "lower_bound" <= "upper_bound")
  )
);
CREATE UNIQUE INDEX "CoverageTarget_conference_id_dimension_key_bucket_ref_measure_key_key" ON "CoverageTarget"("conference_id", "dimension_key", "bucket_ref", "measure_key");

CREATE TABLE "TermState" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "theme_id" TEXT NOT NULL,
  "label" TEXT NOT NULL,
  "availability" TEXT NOT NULL,
  "recorded_by_ref" TEXT,
  "recorded_at" DATETIME,
  "predecessor_state_id" TEXT,
  "provenance" TEXT NOT NULL DEFAULT 'NATIVE',
  "observed_at" DATETIME,
  "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "TermState_theme_id_fkey" FOREIGN KEY ("theme_id") REFERENCES "Theme" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT "TermState_predecessor_state_id_fkey" FOREIGN KEY ("predecessor_state_id") REFERENCES "TermState" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
CREATE UNIQUE INDEX "TermState_predecessor_state_id_key" ON "TermState"("predecessor_state_id");
CREATE INDEX "TermState_theme_id_idx" ON "TermState"("theme_id");

CREATE TABLE "RevisionTerm" (
  "submission_revision_id" TEXT NOT NULL,
  "theme_id" TEXT NOT NULL,
  PRIMARY KEY ("submission_revision_id", "theme_id"),
  CONSTRAINT "RevisionTerm_submission_revision_id_fkey" FOREIGN KEY ("submission_revision_id") REFERENCES "SubmissionRevision" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT "RevisionTerm_theme_id_fkey" FOREIGN KEY ("theme_id") REFERENCES "Theme" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
CREATE INDEX "RevisionTerm_theme_id_idx" ON "RevisionTerm"("theme_id");

CREATE TABLE "DeliverableRequirement" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "submission_id" TEXT NOT NULL,
  "responsible_ref" TEXT,
  "kind_key" TEXT NOT NULL,
  "current_artifact_id" TEXT,
  "provenance" TEXT NOT NULL DEFAULT 'NATIVE',
  "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "DeliverableRequirement_submission_id_fkey" FOREIGN KEY ("submission_id") REFERENCES "Submission" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT "DeliverableRequirement_current_artifact_id_fkey" FOREIGN KEY ("current_artifact_id") REFERENCES "DeckFile" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
CREATE UNIQUE INDEX "DeliverableRequirement_current_artifact_id_key" ON "DeliverableRequirement"("current_artifact_id");
CREATE UNIQUE INDEX "DeliverableRequirement_submission_id_kind_key_key" ON "DeliverableRequirement"("submission_id", "kind_key");

CREATE TABLE "DeliverableAssessment" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "artifact_version_id" TEXT NOT NULL,
  "disposition" TEXT NOT NULL,
  "detail" TEXT,
  "reviewed_by_ref" TEXT,
  "reviewed_at" DATETIME,
  "predecessor_assessment_id" TEXT,
  "provenance" TEXT NOT NULL DEFAULT 'NATIVE',
  "recorded_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "DeliverableAssessment_artifact_version_id_fkey" FOREIGN KEY ("artifact_version_id") REFERENCES "DeckFile" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT "DeliverableAssessment_predecessor_assessment_id_fkey" FOREIGN KEY ("predecessor_assessment_id") REFERENCES "DeliverableAssessment" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
CREATE UNIQUE INDEX "DeliverableAssessment_predecessor_assessment_id_key" ON "DeliverableAssessment"("predecessor_assessment_id");
CREATE INDEX "DeliverableAssessment_artifact_version_id_idx" ON "DeliverableAssessment"("artifact_version_id");

CREATE TABLE "ControlledDisclosure" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "conference_id" TEXT NOT NULL,
  "reviewer_access_id" TEXT NOT NULL,
  "submission_id" TEXT NOT NULL,
  "submission_revision_id" TEXT,
  "information_key" TEXT NOT NULL,
  "subject_key" TEXT NOT NULL,
  "staged_at" DATETIME,
  "revealed_by_ref" TEXT,
  "revealed_at" DATETIME,
  "provenance" TEXT NOT NULL DEFAULT 'NATIVE',
  "recorded_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "ControlledDisclosure_conference_id_fkey" FOREIGN KEY ("conference_id") REFERENCES "Conference" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT "ControlledDisclosure_reviewer_access_id_fkey" FOREIGN KEY ("reviewer_access_id") REFERENCES "ReviewerAccess" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT "ControlledDisclosure_submission_id_fkey" FOREIGN KEY ("submission_id") REFERENCES "Submission" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT "ControlledDisclosure_submission_revision_id_fkey" FOREIGN KEY ("submission_revision_id") REFERENCES "SubmissionRevision" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
CREATE UNIQUE INDEX "ControlledDisclosure_reviewer_access_id_submission_id_information_key_subject_key_key" ON "ControlledDisclosure"("reviewer_access_id", "submission_id", "information_key", "subject_key");
CREATE INDEX "ControlledDisclosure_conference_id_submission_revision_id_idx" ON "ControlledDisclosure"("conference_id", "submission_revision_id");

CREATE TABLE "Publication" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "conference_id" TEXT NOT NULL,
  "deck_file_id" TEXT NOT NULL,
  "public_surface_key" TEXT NOT NULL,
  "provenance" TEXT NOT NULL DEFAULT 'NATIVE',
  "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "Publication_conference_id_fkey" FOREIGN KEY ("conference_id") REFERENCES "Conference" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT "Publication_deck_file_id_fkey" FOREIGN KEY ("deck_file_id") REFERENCES "DeckFile" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
CREATE UNIQUE INDEX "Publication_deck_file_id_public_surface_key_key" ON "Publication"("deck_file_id", "public_surface_key");
CREATE INDEX "Publication_conference_id_public_surface_key_idx" ON "Publication"("conference_id", "public_surface_key");

CREATE TABLE "PublicationState" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "publication_id" TEXT NOT NULL,
  "availability" TEXT NOT NULL,
  "recorded_by_ref" TEXT,
  "recorded_at" DATETIME,
  "predecessor_state_id" TEXT,
  "provenance" TEXT NOT NULL DEFAULT 'NATIVE',
  "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "PublicationState_publication_id_fkey" FOREIGN KEY ("publication_id") REFERENCES "Publication" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT "PublicationState_predecessor_state_id_fkey" FOREIGN KEY ("predecessor_state_id") REFERENCES "PublicationState" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
CREATE UNIQUE INDEX "PublicationState_predecessor_state_id_key" ON "PublicationState"("predecessor_state_id");
CREATE INDEX "PublicationState_publication_id_idx" ON "PublicationState"("publication_id");

CREATE TABLE "ShareEligibilityChange" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "submission_id" TEXT NOT NULL,
  "eligible" BOOLEAN NOT NULL,
  "changed_by_ref" TEXT,
  "changed_at" DATETIME,
  "predecessor_change_id" TEXT,
  "provenance" TEXT NOT NULL DEFAULT 'NATIVE',
  "recorded_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "ShareEligibilityChange_submission_id_fkey" FOREIGN KEY ("submission_id") REFERENCES "Submission" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT "ShareEligibilityChange_predecessor_change_id_fkey" FOREIGN KEY ("predecessor_change_id") REFERENCES "ShareEligibilityChange" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
CREATE UNIQUE INDEX "ShareEligibilityChange_predecessor_change_id_key" ON "ShareEligibilityChange"("predecessor_change_id");
CREATE INDEX "ShareEligibilityChange_submission_id_idx" ON "ShareEligibilityChange"("submission_id");

CREATE TABLE "ArchiveRecord" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "conference_id" TEXT NOT NULL,
  "archived_by_ref" TEXT,
  "archived_at" DATETIME,
  "provenance" TEXT NOT NULL DEFAULT 'NATIVE',
  "observed_at" DATETIME,
  "recorded_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "ArchiveRecord_conference_id_fkey" FOREIGN KEY ("conference_id") REFERENCES "Conference" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
CREATE UNIQUE INDEX "ArchiveRecord_conference_id_key" ON "ArchiveRecord"("conference_id");

CREATE TABLE "SynchronizationWork" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "sync_id" TEXT NOT NULL,
  "source_ref" TEXT NOT NULL,
  "effect_key" TEXT NOT NULL,
  "state" TEXT NOT NULL DEFAULT 'PENDING',
  "attempts" INTEGER NOT NULL DEFAULT 0,
  "last_attempt_at" DATETIME,
  "last_error" TEXT,
  "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "completed_at" DATETIME
);
CREATE UNIQUE INDEX "SynchronizationWork_sync_id_source_ref_effect_key_key" ON "SynchronizationWork"("sync_id", "source_ref", "effect_key");
CREATE INDEX "SynchronizationWork_state_created_at_idx" ON "SynchronizationWork"("state", "created_at");

CREATE TABLE "DispatchAttempt" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "batch_id" TEXT NOT NULL,
  "conference_id" TEXT NOT NULL,
  "template_key" TEXT NOT NULL,
  "round" INTEGER NOT NULL,
  "submission_id" TEXT,
  "attendee_id" TEXT,
  "email" TEXT NOT NULL,
  "rendered_subject" TEXT NOT NULL,
  "rendered_body" TEXT NOT NULL,
  "content_hash" TEXT,
  "provider_attempt_key" TEXT NOT NULL,
  "state" TEXT NOT NULL DEFAULT 'PREPARED',
  "last_error" TEXT,
  "send_record_id" TEXT,
  "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "resolved_at" DATETIME,
  CONSTRAINT "DispatchAttempt_batch_id_fkey" FOREIGN KEY ("batch_id") REFERENCES "ConferenceEmailBatch" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT "DispatchAttempt_conference_id_fkey" FOREIGN KEY ("conference_id") REFERENCES "Conference" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT "DispatchAttempt_submission_id_fkey" FOREIGN KEY ("submission_id") REFERENCES "Submission" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT "DispatchAttempt_attendee_id_fkey" FOREIGN KEY ("attendee_id") REFERENCES "ConferenceAttendee" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT "DispatchAttempt_send_record_id_fkey" FOREIGN KEY ("send_record_id") REFERENCES "EmailSendRecord" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
CREATE UNIQUE INDEX "DispatchAttempt_provider_attempt_key_key" ON "DispatchAttempt"("provider_attempt_key");
CREATE UNIQUE INDEX "DispatchAttempt_send_record_id_key" ON "DispatchAttempt"("send_record_id");
CREATE INDEX "DispatchAttempt_conference_id_template_key_round_idx" ON "DispatchAttempt"("conference_id", "template_key", "round");
CREATE INDEX "DispatchAttempt_state_created_at_idx" ON "DispatchAttempt"("state", "created_at");

CREATE TABLE "MigrationRun" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "version" TEXT NOT NULL,
  "kind" TEXT NOT NULL,
  "environment" TEXT NOT NULL,
  "context_ref" TEXT,
  "application_commit" TEXT,
  "schema_version" TEXT,
  "status" TEXT NOT NULL,
  "started_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "completed_at" DATETIME,
  "source_counts_json" TEXT,
  "target_counts_json" TEXT,
  "provenance_counts_json" TEXT,
  "issue_counts_json" TEXT,
  "invariant_results_json" TEXT,
  "parity_summary_json" TEXT,
  "notes" TEXT
);
CREATE INDEX "MigrationRun_version_environment_started_at_idx" ON "MigrationRun"("version", "environment", "started_at");

CREATE TABLE "MigrationIssue" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "run_id" TEXT NOT NULL,
  "category" TEXT NOT NULL,
  "disposition" TEXT NOT NULL,
  "context_ref" TEXT,
  "record_ref" TEXT,
  "gap_id" TEXT,
  "detail" TEXT NOT NULL,
  "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "MigrationIssue_run_id_fkey" FOREIGN KEY ("run_id") REFERENCES "MigrationRun" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE INDEX "MigrationIssue_run_id_category_disposition_idx" ON "MigrationIssue"("run_id", "category", "disposition");

-- Add nullable exact-reference and compatibility-pointer columns to legacy tables.
ALTER TABLE "SubmissionRevision" ADD COLUMN "predecessor_revision_id" TEXT REFERENCES "SubmissionRevision"("id") ON DELETE SET NULL ON UPDATE CASCADE;
CREATE UNIQUE INDEX "SubmissionRevision_predecessor_revision_id_key" ON "SubmissionRevision"("predecessor_revision_id");

ALTER TABLE "Submission" ADD COLUMN "current_revision_id" TEXT REFERENCES "SubmissionRevision"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "Submission" ADD COLUMN "current_selection_decision_id" TEXT REFERENCES "SelectionDecision"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "Submission" ADD COLUMN "current_share_eligibility_change_id" TEXT REFERENCES "ShareEligibilityChange"("id") ON DELETE SET NULL ON UPDATE CASCADE;
CREATE UNIQUE INDEX "Submission_current_revision_id_key" ON "Submission"("current_revision_id");
CREATE UNIQUE INDEX "Submission_current_selection_decision_id_key" ON "Submission"("current_selection_decision_id");
CREATE UNIQUE INDEX "Submission_current_share_eligibility_change_id_key" ON "Submission"("current_share_eligibility_change_id");

ALTER TABLE "Theme" ADD COLUMN "current_term_state_id" TEXT REFERENCES "TermState"("id") ON DELETE SET NULL ON UPDATE CASCADE;
CREATE UNIQUE INDEX "Theme_current_term_state_id_key" ON "Theme"("current_term_state_id");

ALTER TABLE "Score" ADD COLUMN "submission_revision_id" TEXT REFERENCES "SubmissionRevision"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
CREATE INDEX "Score_submission_revision_id_reviewer_access_id_idx" ON "Score"("submission_revision_id", "reviewer_access_id");

ALTER TABLE "PresenterFeedback" ADD COLUMN "submission_revision_id" TEXT REFERENCES "SubmissionRevision"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
CREATE INDEX "PresenterFeedback_submission_revision_id_idx" ON "PresenterFeedback"("submission_revision_id");

ALTER TABLE "DeckFile" ADD COLUMN "deliverable_id" TEXT REFERENCES "DeliverableRequirement"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "DeckFile" ADD COLUMN "predecessor_artifact_id" TEXT REFERENCES "DeckFile"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "DeckFile" ADD COLUMN "current_assessment_id" TEXT REFERENCES "DeliverableAssessment"("id") ON DELETE SET NULL ON UPDATE CASCADE;
CREATE UNIQUE INDEX "DeckFile_predecessor_artifact_id_key" ON "DeckFile"("predecessor_artifact_id");
CREATE UNIQUE INDEX "DeckFile_current_assessment_id_key" ON "DeckFile"("current_assessment_id");

ALTER TABLE "Publication" ADD COLUMN "current_state_id" TEXT REFERENCES "PublicationState"("id") ON DELETE SET NULL ON UPDATE CASCADE;
CREATE UNIQUE INDEX "Publication_current_state_id_key" ON "Publication"("current_state_id");

ALTER TABLE "EmailSendRecord" ADD COLUMN "rendered_subject" TEXT;
ALTER TABLE "EmailSendRecord" ADD COLUMN "rendered_body" TEXT;
ALTER TABLE "EmailSendRecord" ADD COLUMN "content_hash" TEXT;

COMMIT;
PRAGMA foreign_keys=ON;

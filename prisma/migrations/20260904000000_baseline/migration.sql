-- 004-A baseline migration
--
-- This migration represents the schema that existed at the 003-G implementation
-- handoff. Existing persistent databases that already have this schema must mark
-- this migration as applied with `prisma migrate resolve --applied
-- 20260904000000_baseline` before running `prisma migrate deploy`.
-- Fresh databases may apply this migration normally.

PRAGMA foreign_keys=OFF;
BEGIN TRANSACTION;

CREATE TABLE "Conference" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "slug" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "status" TEXT NOT NULL DEFAULT 'ACTIVE',
  "archived_at" DATETIME,
  "timezone" TEXT NOT NULL DEFAULT 'America/Chicago',
  "submissions_open" BOOLEAN NOT NULL DEFAULT true,
  "submissions_open_at" DATETIME,
  "submissions_close_at" DATETIME,
  "rooms" INTEGER NOT NULL DEFAULT 8,
  "sessions_per_room" INTEGER NOT NULL DEFAULT 8,
  "eod_trim" INTEGER NOT NULL DEFAULT 6,
  "graeme_slots" INTEGER NOT NULL DEFAULT 4,
  "sponsor_min" INTEGER NOT NULL DEFAULT 7,
  "sponsor_max" INTEGER NOT NULL DEFAULT 11,
  "decks_published" BOOLEAN NOT NULL DEFAULT false,
  "decks_published_at" DATETIME,
  "blind_review_enabled" BOOLEAN NOT NULL DEFAULT true,
  "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" DATETIME NOT NULL
);

CREATE UNIQUE INDEX "Conference_slug_key" ON "Conference"("slug");

CREATE TABLE "Submission" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "conference_id" TEXT NOT NULL,
  "presenter_token_hash" TEXT NOT NULL,
  "program_status" TEXT NOT NULL DEFAULT 'PENDING',
  "deck_status" TEXT,
  "deck_shareable" BOOLEAN NOT NULL DEFAULT true,
  "vip_registered" BOOLEAN NOT NULL DEFAULT false,
  "is_sponsor_session" BOOLEAN NOT NULL DEFAULT false,
  "is_soft_skill" BOOLEAN NOT NULL DEFAULT false,
  "approved_at" DATETIME,
  "withdrawn_at" DATETIME,
  "abstract_review_status" TEXT NOT NULL DEFAULT 'CURRENT',
  "abstract_version" INTEGER NOT NULL DEFAULT 1,
  "abstract_version_acknowledged_at" DATETIME,
  "last_presenter_edit_at" DATETIME,
  "first_name" TEXT NOT NULL,
  "last_name" TEXT NOT NULL,
  "degrees" TEXT NOT NULL,
  "job_title" TEXT NOT NULL,
  "organization" TEXT NOT NULL,
  "title" TEXT NOT NULL,
  "abstract" TEXT NOT NULL,
  "technical_level" INTEGER NOT NULL,
  "bio" TEXT NOT NULL,
  "email" TEXT NOT NULL,
  "zip_code" TEXT NOT NULL,
  "phone" TEXT NOT NULL,
  "linkedin_url" TEXT NOT NULL,
  "linkedin_has_photo" BOOLEAN NOT NULL,
  "has_co_presenter" BOOLEAN NOT NULL DEFAULT false,
  "co_presenter_name" TEXT,
  "co_presenter_email" TEXT,
  "co_presenter_degrees" TEXT,
  "co_presenter_job_title" TEXT,
  "co_presenter_organization" TEXT,
  "co_presenter_bio" TEXT,
  "co_presenter_linkedin_url" TEXT,
  "co_presenter_linkedin_has_photo" BOOLEAN,
  "travel_restriction" TEXT,
  "travel_reimbursement_required" BOOLEAN NOT NULL DEFAULT false,
  "additional_info" TEXT,
  "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" DATETIME NOT NULL,
  CONSTRAINT "Submission_conference_id_fkey" FOREIGN KEY ("conference_id") REFERENCES "Conference" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE UNIQUE INDEX "Submission_presenter_token_hash_key" ON "Submission"("presenter_token_hash");

CREATE TABLE "Theme" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "conference_id" TEXT NOT NULL,
  "slug" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "source" TEXT NOT NULL DEFAULT 'ADMIN',
  "proposed_by_submission_id" TEXT,
  "proposed_at" DATETIME,
  "removed_at" DATETIME,
  "target_min" INTEGER NOT NULL DEFAULT 0,
  "target_max" INTEGER NOT NULL DEFAULT 0,
  "sort_order" INTEGER NOT NULL DEFAULT 0,
  CONSTRAINT "Theme_conference_id_fkey" FOREIGN KEY ("conference_id") REFERENCES "Conference" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE UNIQUE INDEX "Theme_conference_id_slug_key" ON "Theme"("conference_id", "slug");

CREATE TABLE "SubmissionTheme" (
  "submission_id" TEXT NOT NULL,
  "theme_id" TEXT NOT NULL,
  PRIMARY KEY ("submission_id", "theme_id"),
  CONSTRAINT "SubmissionTheme_submission_id_fkey" FOREIGN KEY ("submission_id") REFERENCES "Submission" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "SubmissionTheme_theme_id_fkey" FOREIGN KEY ("theme_id") REFERENCES "Theme" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE "ScheduleRoom" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "conference_id" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "sort_order" INTEGER NOT NULL,
  CONSTRAINT "ScheduleRoom_conference_id_fkey" FOREIGN KEY ("conference_id") REFERENCES "Conference" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE UNIQUE INDEX "ScheduleRoom_conference_id_sort_order_key" ON "ScheduleRoom"("conference_id", "sort_order");

CREATE TABLE "ScheduleSlot" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "conference_id" TEXT NOT NULL,
  "label" TEXT NOT NULL,
  "slot_type" TEXT NOT NULL,
  "sort_order" INTEGER NOT NULL,
  CONSTRAINT "ScheduleSlot_conference_id_fkey" FOREIGN KEY ("conference_id") REFERENCES "Conference" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE UNIQUE INDEX "ScheduleSlot_conference_id_sort_order_key" ON "ScheduleSlot"("conference_id", "sort_order");

CREATE TABLE "SchedulePlacement" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "conference_id" TEXT NOT NULL,
  "slot_id" TEXT NOT NULL,
  "room_id" TEXT NOT NULL,
  "submission_id" TEXT,
  CONSTRAINT "SchedulePlacement_conference_id_fkey" FOREIGN KEY ("conference_id") REFERENCES "Conference" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "SchedulePlacement_slot_id_fkey" FOREIGN KEY ("slot_id") REFERENCES "ScheduleSlot" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "SchedulePlacement_room_id_fkey" FOREIGN KEY ("room_id") REFERENCES "ScheduleRoom" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "SchedulePlacement_submission_id_fkey" FOREIGN KEY ("submission_id") REFERENCES "Submission" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

CREATE UNIQUE INDEX "SchedulePlacement_submission_id_key" ON "SchedulePlacement"("submission_id");
CREATE UNIQUE INDEX "SchedulePlacement_slot_id_room_id_key" ON "SchedulePlacement"("slot_id", "room_id");

CREATE TABLE "SubmissionRevision" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "submission_id" TEXT NOT NULL,
  "version" INTEGER NOT NULL,
  "title" TEXT NOT NULL,
  "abstract" TEXT NOT NULL,
  "bio" TEXT NOT NULL,
  "technical_level" INTEGER NOT NULL,
  "theme_ids" TEXT NOT NULL,
  "changed_fields" TEXT NOT NULL,
  "change_note" TEXT,
  "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "SubmissionRevision_submission_id_fkey" FOREIGN KEY ("submission_id") REFERENCES "Submission" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE UNIQUE INDEX "SubmissionRevision_submission_id_version_key" ON "SubmissionRevision"("submission_id", "version");

CREATE TABLE "ReviewerAccess" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "conference_id" TEXT NOT NULL,
  "token_hash" TEXT NOT NULL,
  "role" TEXT NOT NULL,
  "label" TEXT,
  "expires_at" DATETIME,
  "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "ReviewerAccess_conference_id_fkey" FOREIGN KEY ("conference_id") REFERENCES "Conference" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE UNIQUE INDEX "ReviewerAccess_token_hash_key" ON "ReviewerAccess"("token_hash");

CREATE TABLE "PresenterFeedback" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "submission_id" TEXT NOT NULL,
  "reviewer_access_id" TEXT NOT NULL,
  "kind" TEXT NOT NULL,
  "body" TEXT NOT NULL,
  "abstract_version" INTEGER,
  "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "PresenterFeedback_submission_id_fkey" FOREIGN KEY ("submission_id") REFERENCES "Submission" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "PresenterFeedback_reviewer_access_id_fkey" FOREIGN KEY ("reviewer_access_id") REFERENCES "ReviewerAccess" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE "EmailTemplate" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "template_key" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "description" TEXT NOT NULL,
  "subject_template" TEXT NOT NULL,
  "body_template" TEXT NOT NULL,
  "updated_at" DATETIME NOT NULL
);

CREATE UNIQUE INDEX "EmailTemplate_template_key_key" ON "EmailTemplate"("template_key");

CREATE TABLE "ConferenceEmailBatch" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "conference_id" TEXT NOT NULL,
  "template_key" TEXT NOT NULL,
  "round" INTEGER NOT NULL DEFAULT 1,
  "sent_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "sent_by_reviewer_access_id" TEXT NOT NULL,
  "recipient_count" INTEGER NOT NULL,
  "custom_intro" TEXT,
  CONSTRAINT "ConferenceEmailBatch_conference_id_fkey" FOREIGN KEY ("conference_id") REFERENCES "Conference" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "ConferenceEmailBatch_sent_by_reviewer_access_id_fkey" FOREIGN KEY ("sent_by_reviewer_access_id") REFERENCES "ReviewerAccess" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE INDEX "ConferenceEmailBatch_conference_id_template_key_idx" ON "ConferenceEmailBatch"("conference_id", "template_key");

CREATE TABLE "ConferenceAttendee" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "conference_id" TEXT NOT NULL,
  "email" TEXT NOT NULL,
  "first_name" TEXT NOT NULL,
  "last_name" TEXT NOT NULL,
  "registered_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "cancelled_at" DATETIME,
  CONSTRAINT "ConferenceAttendee_conference_id_fkey" FOREIGN KEY ("conference_id") REFERENCES "Conference" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE UNIQUE INDEX "ConferenceAttendee_conference_id_email_key" ON "ConferenceAttendee"("conference_id", "email");

CREATE TABLE "EmailSendRecord" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "batch_id" TEXT NOT NULL,
  "conference_id" TEXT NOT NULL,
  "template_key" TEXT NOT NULL,
  "round" INTEGER NOT NULL,
  "submission_id" TEXT,
  "attendee_id" TEXT,
  "email" TEXT NOT NULL,
  "sent_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "EmailSendRecord_batch_id_fkey" FOREIGN KEY ("batch_id") REFERENCES "ConferenceEmailBatch" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "EmailSendRecord_conference_id_fkey" FOREIGN KEY ("conference_id") REFERENCES "Conference" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "EmailSendRecord_submission_id_fkey" FOREIGN KEY ("submission_id") REFERENCES "Submission" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT "EmailSendRecord_attendee_id_fkey" FOREIGN KEY ("attendee_id") REFERENCES "ConferenceAttendee" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

CREATE UNIQUE INDEX "EmailSendRecord_conference_id_template_key_round_submission_id_key" ON "EmailSendRecord"("conference_id", "template_key", "round", "submission_id");
CREATE UNIQUE INDEX "EmailSendRecord_conference_id_template_key_round_attendee_id_key" ON "EmailSendRecord"("conference_id", "template_key", "round", "attendee_id");
CREATE INDEX "EmailSendRecord_conference_id_template_key_round_idx" ON "EmailSendRecord"("conference_id", "template_key", "round");

CREATE TABLE "Score" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "submission_id" TEXT NOT NULL,
  "reviewer_access_id" TEXT NOT NULL,
  "value" REAL NOT NULL,
  "notes" TEXT,
  "scored_abstract_version" INTEGER,
  "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" DATETIME NOT NULL,
  CONSTRAINT "Score_submission_id_fkey" FOREIGN KEY ("submission_id") REFERENCES "Submission" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "Score_reviewer_access_id_fkey" FOREIGN KEY ("reviewer_access_id") REFERENCES "ReviewerAccess" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE UNIQUE INDEX "Score_submission_id_reviewer_access_id_key" ON "Score"("submission_id", "reviewer_access_id");

CREATE TABLE "DeckFile" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "submission_id" TEXT NOT NULL,
  "public_id" TEXT NOT NULL,
  "version" INTEGER NOT NULL,
  "filename" TEXT NOT NULL,
  "storage_path" TEXT NOT NULL,
  "mime_type" TEXT NOT NULL,
  "size_bytes" INTEGER NOT NULL,
  "uploaded_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "DeckFile_submission_id_fkey" FOREIGN KEY ("submission_id") REFERENCES "Submission" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE UNIQUE INDEX "DeckFile_public_id_key" ON "DeckFile"("public_id");

COMMIT;
PRAGMA foreign_keys=ON;

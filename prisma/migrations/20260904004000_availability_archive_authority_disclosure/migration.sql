CREATE TABLE "ConferencePolicyCutover" (
  "conference_id" TEXT NOT NULL PRIMARY KEY,
  "disclosure_cutover_at" DATETIME NOT NULL,
  "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "ConferencePolicyCutover_conference_id_fkey"
    FOREIGN KEY ("conference_id") REFERENCES "Conference" ("id")
    ON DELETE RESTRICT ON UPDATE CASCADE
);

CREATE TABLE "RevisionExceptionPolicy" (
  "submission_id" TEXT NOT NULL PRIMARY KEY,
  "revision_id" TEXT NOT NULL,
  "granted_by_ref" TEXT NOT NULL,
  "granted_at" DATETIME NOT NULL,
  CONSTRAINT "RevisionExceptionPolicy_submission_id_fkey"
    FOREIGN KEY ("submission_id") REFERENCES "Submission" ("id")
    ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT "RevisionExceptionPolicy_revision_id_fkey"
    FOREIGN KEY ("revision_id") REFERENCES "SubmissionRevision" ("id")
    ON DELETE RESTRICT ON UPDATE CASCADE
);

CREATE INDEX "RevisionExceptionPolicy_revision_id_idx"
  ON "RevisionExceptionPolicy"("revision_id");

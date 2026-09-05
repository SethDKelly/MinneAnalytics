CREATE TABLE "PublicationPolicyCutover" (
  "conference_id" TEXT NOT NULL PRIMARY KEY,
  "cutover_at" DATETIME NOT NULL,
  "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "PublicationPolicyCutover_conference_id_fkey"
    FOREIGN KEY ("conference_id") REFERENCES "Conference" ("id")
    ON DELETE RESTRICT ON UPDATE CASCADE
);

CREATE UNIQUE INDEX "DispatchAttempt_submission_semantic_key"
  ON "DispatchAttempt"("conference_id", "template_key", "round", "submission_id")
  WHERE "submission_id" IS NOT NULL;

CREATE UNIQUE INDEX "DispatchAttempt_attendee_semantic_key"
  ON "DispatchAttempt"("conference_id", "template_key", "round", "attendee_id")
  WHERE "attendee_id" IS NOT NULL;

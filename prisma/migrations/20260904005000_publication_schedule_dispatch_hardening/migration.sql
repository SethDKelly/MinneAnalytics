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

-- 004-C owns participation-exit source transactions. Once a Conference has crossed
-- the 004-E Publication cutover, enqueue SYNC-008 in that same transaction whenever
-- the compatibility participation projection leaves APPROVED. The sourceRef resolves
-- to the Withdrawal identity when present, otherwise the new Selection Decision.
CREATE TRIGGER "Submission_participation_exit_publication_cleanup"
AFTER UPDATE OF "program_status" ON "Submission"
WHEN OLD."program_status" = 'APPROVED'
  AND NEW."program_status" <> 'APPROVED'
  AND EXISTS (
    SELECT 1 FROM "PublicationPolicyCutover" pc
    WHERE pc."conference_id" = NEW."conference_id"
  )
  AND COALESCE(
    CASE WHEN NEW."program_status" = 'WITHDRAWN'
      THEN (SELECT wr."id" FROM "WithdrawalRecord" wr WHERE wr."submission_id" = NEW."id" LIMIT 1)
    END,
    NEW."current_selection_decision_id"
  ) IS NOT NULL
BEGIN
  INSERT OR IGNORE INTO "SynchronizationWork" (
    "id", "sync_id", "source_ref", "effect_key", "state", "attempts", "created_at"
  ) VALUES (
    'sync8_' || lower(hex(randomblob(16))),
    'SYNC-008',
    COALESCE(
      CASE WHEN NEW."program_status" = 'WITHDRAWN'
        THEN (SELECT wr."id" FROM "WithdrawalRecord" wr WHERE wr."submission_id" = NEW."id" LIMIT 1)
      END,
      NEW."current_selection_decision_id"
    ),
    'publication-unpublish-submission:' || NEW."id",
    'PENDING',
    0,
    CURRENT_TIMESTAMP
  );
END;

-- A replacement ArtifactVersion immediately makes the superseded exact current deck
-- ineligible on the v0 deck-archive surface. Enqueue the exact old ArtifactVersion
-- cleanup in the same Deliverable current-head transaction, but only after cutover.
CREATE TRIGGER "Deliverable_artifact_replacement_publication_cleanup"
AFTER UPDATE OF "current_artifact_id" ON "DeliverableRequirement"
WHEN OLD."current_artifact_id" IS NOT NULL
  AND NEW."current_artifact_id" IS NOT NULL
  AND NEW."current_artifact_id" IS NOT OLD."current_artifact_id"
  AND EXISTS (
    SELECT 1
    FROM "Submission" s
    JOIN "PublicationPolicyCutover" pc ON pc."conference_id" = s."conference_id"
    WHERE s."id" = NEW."submission_id"
  )
BEGIN
  INSERT OR IGNORE INTO "SynchronizationWork" (
    "id", "sync_id", "source_ref", "effect_key", "state", "attempts", "created_at"
  ) VALUES (
    'sync8_' || lower(hex(randomblob(16))),
    'SYNC-008',
    NEW."current_artifact_id",
    'publication-unpublish-artifact:' || OLD."current_artifact_id",
    'PENDING',
    0,
    CURRENT_TIMESTAMP
  );
END;

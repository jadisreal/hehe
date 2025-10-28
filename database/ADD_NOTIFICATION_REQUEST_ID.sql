/*
  ADD_NOTIFICATION_REQUEST_ID.sql

  - Adds a nullable `request_id` INT column to the `notifications` table (if it doesn't already exist).
  - Provides a preview SELECT that extracts request ids embedded in message text using the token format: [req:123]
  - Applies an UPDATE in a transaction to populate `request_id` for existing notifications where possible.
  - Adds a foreign key constraint FK_notifications_branch_request to `branch_requests(branch_request_id)` if it doesn't already exist.

  USAGE:
  1. Open this file in SSMS and run the PREVIEW SELECT first to verify rows and extracted ids.
  2. If preview looks correct, run the UPDATE transaction block.
  3. Finally run the ALTER TABLE to add the FK constraint (it will be skipped if already present).

  NOTE: Run on a development or staging DB first. Backup your DB before running on production.
*/

-- 1) Add the column if missing
IF COL_LENGTH('notifications', 'request_id') IS NULL
BEGIN
    PRINT 'Adding column notifications.request_id';
    ALTER TABLE notifications ADD request_id INT NULL;
END
ELSE
BEGIN
    PRINT 'Column notifications.request_id already exists';
END

-- 2) PREVIEW: show notification rows that contain a [req:123] token and the extracted id
PRINT 'Preview of messages with [req:...] token and the extracted request id (no changes yet)';
IF COL_LENGTH('notifications', 'request_id') IS NOT NULL
BEGIN
    DECLARE @preview_sql NVARCHAR(MAX) = N'
;WITH Candidate AS (
    SELECT
        notification_id,
        message,
        CHARINDEX(''[req:'', message) AS token_start,
        CASE WHEN CHARINDEX(''[req:'', message) > 0 THEN CHARINDEX('']'', message, CHARINDEX(''[req:'', message)) ELSE 0 END AS token_end
    FROM notifications
    WHERE message LIKE ''%[req:%'' AND (request_id IS NULL)
)
SELECT
    notification_id,
    message,
    TRY_CAST(
        SUBSTRING(
            message,
            token_start + 5,
            CASE WHEN token_end > token_start THEN token_end - (token_start + 5) ELSE 0 END
        ) AS INT
    ) AS extracted_request_id
FROM Candidate
WHERE token_start > 0 AND token_end > token_start;';

    PRINT 'Previewing tokens (dynamic SQL)';
    EXEC sp_executesql @preview_sql;
END
ELSE
BEGIN
    PRINT 'Skipping preview: notifications.request_id column not present yet.';
END

-- 3) UPDATE: populate request_id within a transaction (only if preview looks good)
PRINT 'Updating notifications.request_id from message tokens (transactional)';
IF COL_LENGTH('notifications', 'request_id') IS NOT NULL
BEGIN
    DECLARE @update_sql NVARCHAR(MAX) = N'
BEGIN TRY
    BEGIN TRANSACTION;

    WITH ToSet AS (
        SELECT
            notification_id,
            TRY_CAST(
                SUBSTRING(
                    message,
                    CHARINDEX(''[req:'', message) + 5,
                    CASE WHEN CHARINDEX('']'', message, CHARINDEX(''[req:'', message)) > CHARINDEX(''[req:'', message)
                         THEN CHARINDEX('']'', message, CHARINDEX(''[req:'', message)) - (CHARINDEX(''[req:'', message) + 5)
                         ELSE 0 END
                ) AS INT
            ) AS extracted_request_id
        FROM notifications
        WHERE message LIKE ''%[req:%'' AND (request_id IS NULL)
    )
    UPDATE n
    SET n.request_id = t.extracted_request_id
    FROM notifications n
    INNER JOIN ToSet t ON n.notification_id = t.notification_id
    WHERE t.extracted_request_id IS NOT NULL;

    COMMIT TRANSACTION;
    PRINT ''Update committed.'';
END TRY
BEGIN CATCH
    PRINT ''Error during update, rolling back.'';
    IF XACT_STATE() <> 0
        ROLLBACK TRANSACTION;
    DECLARE @ErrMsg NVARCHAR(4000) = ERROR_MESSAGE();
    PRINT @ErrMsg;
END CATCH
';

    EXEC sp_executesql @update_sql;
END
ELSE
BEGIN
    PRINT 'Skipping update: notifications.request_id column not present yet.';
END

-- 4) Add foreign key constraint to branch_requests if it doesn't exist
IF NOT EXISTS (
    SELECT 1 FROM sys.foreign_keys WHERE name = 'FK_notifications_branch_request'
)
BEGIN
    PRINT 'Adding FK: FK_notifications_branch_request -> branch_requests(branch_request_id)';
    ALTER TABLE notifications
        ADD CONSTRAINT FK_notifications_branch_request FOREIGN KEY (request_id)
        REFERENCES branch_requests(branch_request_id);
END
ELSE
BEGIN
    PRINT 'FK FK_notifications_branch_request already exists';
END

-- Helpful verification queries you can run after this script
-- SELECT * FROM notifications WHERE request_id IS NOT NULL AND type = 'request';
-- SELECT COUNT(*) AS CountWithToken FROM notifications WHERE message LIKE '%[req:%' AND (request_id IS NULL);

/* End of file */

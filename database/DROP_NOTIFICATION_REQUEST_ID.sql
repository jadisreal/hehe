/*
  DROP_NOTIFICATION_REQUEST_ID.sql

  - Safely drops the foreign key FK_notifications_branch_request (if it exists)
    and then drops the notifications.request_id column (if it exists).

  USAGE:
  1. Run on development or staging first. Backup your DB before running on production.
  2. The script checks for the constraint and column before attempting to drop them.

  NOTES:
  - If other database objects (indexes, triggers, constraints) reference request_id,
    you'll need to drop or alter them first.
*/

PRINT 'Starting DROP_NOTIFICATION_REQUEST_ID.sql';

-- Ensure the notifications table exists
IF OBJECT_ID('notifications', 'U') IS NULL
BEGIN
    PRINT 'Table notifications does not exist - nothing to do.';
    RETURN;
END

-- Drop foreign key constraint if it exists (named FK_notifications_branch_request)
IF EXISTS (SELECT 1 FROM sys.foreign_keys WHERE name = 'FK_notifications_branch_request')
BEGIN
    PRINT 'Dropping foreign key FK_notifications_branch_request...';
    ALTER TABLE notifications DROP CONSTRAINT FK_notifications_branch_request;
END
ELSE
BEGIN
    PRINT 'Foreign key FK_notifications_branch_request not found.';
END

-- If there is any other foreign key referencing request_id with a different name, attempt to find and drop it safely
DECLARE @fkName NVARCHAR(256);
SELECT TOP 1 @fkName = fk.name
FROM sys.foreign_keys fk
JOIN sys.foreign_key_columns fkc ON fk.object_id = fkc.constraint_object_id
JOIN sys.columns c ON fkc.parent_object_id = c.object_id AND fkc.parent_column_id = c.column_id
WHERE fk.parent_object_id = OBJECT_ID('notifications') AND c.name = 'request_id';

IF @fkName IS NOT NULL
BEGIN
    PRINT 'Dropping additional foreign key: ' + @fkName;
    DECLARE @dropFkSql NVARCHAR(MAX) = N'ALTER TABLE notifications DROP CONSTRAINT ' + QUOTENAME(@fkName) + N';';
    EXEC sp_executesql @dropFkSql;
END
ELSE
BEGIN
    PRINT 'No additional foreign keys found that reference notifications.request_id.';
END

-- Drop the column if it exists
IF COL_LENGTH('notifications', 'request_id') IS NOT NULL
BEGIN
    PRINT 'Dropping column notifications.request_id...';
    ALTER TABLE notifications DROP COLUMN request_id;
    PRINT 'Column dropped.';
END
ELSE
BEGIN
    PRINT 'Column notifications.request_id does not exist - nothing to drop.';
END

PRINT 'DROP_NOTIFICATION_REQUEST_ID.sql finished.';

-- Verification: (run manually)
-- SELECT TOP 10 * FROM notifications;
-- SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'notifications';

/* End of file */

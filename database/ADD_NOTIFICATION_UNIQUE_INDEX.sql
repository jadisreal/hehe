/*
  ADD_NOTIFICATION_UNIQUE_INDEX.sql

  - Adds a filtered unique index to ensure at most one 'request' notification
    per (branch_id, reference_id) when reference_id IS NOT NULL.

  USAGE:
  - Run in development/staging first. SQL Server only supports filtered indexes on supported editions.
*/

IF NOT EXISTS (
    SELECT 1 FROM sys.indexes WHERE name = 'ux_notifications_branch_ref_request' AND object_id = OBJECT_ID('notifications')
)
BEGIN
    PRINT 'Creating filtered unique index ux_notifications_branch_ref_request';
    CREATE UNIQUE INDEX ux_notifications_branch_ref_request ON notifications(branch_id, reference_id)
    WHERE reference_id IS NOT NULL AND type = 'request';
END
ELSE
BEGIN
    PRINT 'Index ux_notifications_branch_ref_request already exists';
END

-- Verification:
-- SELECT * FROM sys.indexes WHERE object_id = OBJECT_ID('notifications');
/* End of file */

-- =============================================
-- Complete History Triggers Setup for All Modal Operations
-- This script creates all triggers needed for automatic history logging
-- Run this script in your MSSQL database
-- =============================================

PRINT '=== Setting up History Triggers for All Modal Operations ===';

-- =============================================
-- 1. Enhanced Stock In Trigger (Add + Reorder)
-- =============================================
PRINT 'Creating Stock In trigger (handles Add + Reorder)...';

IF EXISTS (SELECT * FROM sys.triggers WHERE name = 'trg_stock_in_history')
    DROP TRIGGER trg_stock_in_history;

GO

CREATE TRIGGER trg_stock_in_history
ON medicine_stock_in
AFTER INSERT
AS
BEGIN
    SET NOCOUNT ON;
    
    INSERT INTO history_log (medicine_id, branch_id, user_id, activity, quantity, description)
    SELECT 
        i.medicine_id,
        i.branch_id,
        i.user_id,
        CASE 
            WHEN EXISTS (
                SELECT 1 FROM medicine_stock_in msi 
                WHERE msi.medicine_id = i.medicine_id 
                AND msi.branch_id = i.branch_id 
                AND msi.medicine_stock_in_id != i.medicine_stock_in_id
            ) 
            THEN 'restocked' 
            ELSE 'added' 
        END,
        i.quantity,
        CASE 
            WHEN EXISTS (
                SELECT 1 FROM medicine_stock_in msi 
                WHERE msi.medicine_id = i.medicine_id 
                AND msi.branch_id = i.branch_id 
                AND msi.medicine_stock_in_id != i.medicine_stock_in_id
            )
            THEN 'Medicine restocked'
            ELSE 'Medicine added'
        END
    FROM inserted i
    JOIN medicines m ON i.medicine_id = m.medicine_id;
END;

GO

-- =============================================
-- 2. Stock Out Trigger (Dispense)
-- =============================================
PRINT 'Creating Stock Out trigger (handles Dispense)...';

IF EXISTS (SELECT * FROM sys.triggers WHERE name = 'trg_stock_out_history')
    DROP TRIGGER trg_stock_out_history;

GO

CREATE TRIGGER trg_stock_out_history
ON medicine_stock_out
AFTER INSERT
AS
BEGIN
    SET NOCOUNT ON;
    
    INSERT INTO history_log (medicine_id, branch_id, user_id, activity, quantity, description)
    SELECT 
        msi.medicine_id,
        i.branch_id,
        i.user_id,
        'dispensed',
        i.quantity_dispensed,
        'Medicine dispensed'
    FROM inserted i
    JOIN medicine_stock_in msi ON i.medicine_stock_in_id = msi.medicine_stock_in_id
    JOIN medicines m ON msi.medicine_id = m.medicine_id;
END;

GO

-- =============================================
-- 3. Medicine Deleted Trigger (Remove)
-- =============================================
PRINT 'Creating Medicine Deleted trigger (handles Remove)...';

IF EXISTS (SELECT * FROM sys.triggers WHERE name = 'trg_medicine_deleted_history')
    DROP TRIGGER trg_medicine_deleted_history;

GO

/* CREATE TRIGGER trg_medicine_deleted_history
ON medicine_deleted
AFTER INSERT
AS
BEGIN
    SET NOCOUNT ON;
    
    INSERT INTO history_log (medicine_id, branch_id, user_id, activity, quantity, description)
    SELECT 
        msi.medicine_id,
        i.branch_id,
        msi.user_id, -- Get user_id from the original stock_in record
        'removed',
        i.quantity,
        'Medicine removed'
    FROM inserted i
    JOIN medicine_stock_in msi ON i.medicine_stock_in_id = msi.medicine_stock_in_id
    JOIN medicines m ON msi.medicine_id = m.medicine_id;
END;

GO 

-- remove the delete 
IF EXISTS (SELECT * FROM sys.triggers WHERE name = 'trg_medicine_deleted_history')
    DROP TRIGGER trg_medicine_deleted_history;
GO

PRINT '✅ Trigger trg_medicine_deleted_history dropped successfully.'; */


-- =============================================
-- Verification
-- =============================================
PRINT '=== Verifying All Triggers ===';

SELECT 
    t.name AS TriggerName,
    OBJECT_NAME(t.parent_id) AS TableName,
    t.is_disabled AS IsDisabled,
    t.create_date AS CreatedDate
FROM sys.triggers t
WHERE t.name IN ('trg_stock_in_history', 'trg_stock_out_history', 'trg_medicine_deleted_history')
ORDER BY t.name;

-- Check if all triggers are created
DECLARE @trigger_count INT;
SELECT @trigger_count = COUNT(*) 
FROM sys.triggers 
WHERE name IN ('trg_stock_in_history', 'trg_stock_out_history', 'trg_medicine_deleted_history');

IF @trigger_count = 3
BEGIN
    PRINT '? SUCCESS: All 3 triggers created successfully!';
    PRINT '';
    PRINT 'Modal Operations ? History Logging:';
    PRINT '1. Add Medicine ? trg_stock_in_history ? "Medicine added"';
    PRINT '2. Reorder Medicine ? trg_stock_in_history ? "Medicine restocked"';
    PRINT '3. Dispense Medicine ? trg_stock_out_history ? "Medicine dispensed"';
    PRINT '4. Remove Medicine ? trg_medicine_deleted_history ? "Medicine removed"';
END
ELSE
BEGIN
    PRINT '? ERROR: Only ' + CAST(@trigger_count AS VARCHAR) + ' out of 3 triggers created!';
END

PRINT '=== Setup Complete ===';


-- =============================================
-- Drop History Triggers for All Modal Operations
-- =============================================

PRINT '=== Dropping History Triggers ===';

IF EXISTS (SELECT * FROM sys.triggers WHERE name = 'trg_stock_in_history')
    DROP TRIGGER trg_stock_in_history;
GO

IF EXISTS (SELECT * FROM sys.triggers WHERE name = 'trg_stock_out_history')
    DROP TRIGGER trg_stock_out_history;
GO

IF EXISTS (SELECT * FROM sys.triggers WHERE name = 'trg_medicine_deleted_history')
    DROP TRIGGER trg_medicine_deleted_history;
GO

PRINT '? All history triggers dropped successfully!';
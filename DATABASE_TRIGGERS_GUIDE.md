# Database Triggers Implementation Guide

## Overview
This guide will help you set up database triggers that automatically insert records into the `history_log` table whenever medicine stock operations occur. This eliminates the need for manual history logging in your frontend code.

## Prerequisites
- MSSQL Server database with your HIMS schema
- Admin access to execute DDL statements (CREATE TRIGGER)
- Your existing tables: `medicine_stock_in`, `medicine_stock_out`, `medicine_deleted`, `history_log`, `medicines`

## Available Implementation Files
1. **`database/update_stock_in_trigger.sql`** - Stock in trigger for add/reorder operations
2. **`database/update_dispense_trigger.sql`** - Stock out trigger for dispense operations  
3. **`database/check_triggers.sql`** - Verification script to check if triggers exist
4. **`database/troubleshoot_triggers.sql`** - Comprehensive debugging and testing script

## Implementation Steps

### Step 1: Execute the Individual Trigger Update Scripts
Run the specific trigger update scripts:

**For Stock In Trigger (Add Medicine):**
```sql
-- Run this file in your MSSQL database:
-- database/update_stock_in_trigger.sql
```

**For Stock Out Trigger (Dispense Medicine):**
```sql
-- Run this file in your MSSQL database:
-- database/update_dispense_trigger.sql
```

### Step 2: Verify Triggers Are Created
After execution, run this query to verify:

```sql
SELECT 
    t.name AS TriggerName,
    OBJECT_NAME(t.parent_id) AS TableName,
    t.is_disabled AS IsDisabled,
    t.create_date AS CreatedDate
FROM sys.triggers t
WHERE t.name IN ('trg_stock_in_history', 'trg_stock_out_history', 'trg_medicine_deleted_history')
ORDER BY t.name;
```

You should see 3 triggers:
- `trg_stock_in_history` on `medicine_stock_in`
- `trg_stock_out_history` on `medicine_stock_out`  
- `trg_medicine_deleted_history` on `medicine_deleted`

## How It Works

### Trigger 1: Stock In History (`trg_stock_in_history`)
- **Fires when**: New record inserted into `medicine_stock_in`
- **Creates history entry with**:
  - `activity`: 'added'
  - `quantity`: The quantity added
  - `description`: "New medicine added: [medicine_name]"

### Trigger 2: Stock Out History (`trg_stock_out_history`)
- **Fires when**: New record inserted into `medicine_stock_out`
- **Creates history entry with**:
  - `activity`: 'dispensed'
  - `quantity`: The quantity dispensed
  - `description`: "dispensed ([quantity] units) of [medicine_name]"

### Trigger 3: Medicine Deleted History (`trg_medicine_deleted_history`)
- **Fires when**: New record inserted into `medicine_deleted`
- **Creates history entry with**:
  - `activity`: 'removed'
  - `quantity`: The quantity removed
  - `description`: "Medicine removed: [Name] ([Qty] units). Reason: [Reason]"

## Benefits

### 1. **Automatic Logging**
- No need for manual API calls from frontend
- Guaranteed history tracking (can't be forgotten)
- Atomic operations (triggers execute within the same transaction)

### 2. **Data Consistency**
- History entries are created even if called from external systems
- Uniform logging format across all operations
- No duplicate entries from multiple sources

### 3. **Performance**
- Reduced network calls from frontend
- Faster modal operations
- Database-level efficiency

### 4. **Reliability**
- History logging cannot fail independently of the main operation
- If the main operation fails, history is not created (transaction rollback)
- If the main operation succeeds, history is guaranteed to be created

## Testing

### Test Stock In (Add Medicine)
```sql
-- Test adding medicine (should create history with activity='added')
INSERT INTO medicine_stock_in (medicine_id, branch_id, quantity, date_received, expiration_date, user_id)
VALUES (1, 1, 50, GETDATE(), DATEADD(YEAR, 2, GETDATE()), 1);

-- Check history (should show: "New medicine added: Medicine Name")
SELECT TOP 1 * FROM history_log WHERE activity = 'added' ORDER BY created_at DESC;
```

### Test Stock Out (Dispense Medicine)
```sql
-- Test dispensing medicine (should create history with activity='dispensed')
INSERT INTO medicine_stock_out (medicine_stock_in_id, branch_id, user_id, quantity_dispensed)
VALUES (1, 1, 1, 5);

-- Check history (should show: "dispensed (5 units) of Medicine Name")
SELECT TOP 1 * FROM history_log WHERE activity = 'dispensed' ORDER BY created_at DESC;
```

### Test Medicine Removal
```sql
-- Test removing medicine (should create history with activity='removed')
INSERT INTO medicine_deleted (medicine_stock_in_id, branch_id, quantity, description, deleted_by)
VALUES (1, 1, 10, 'Expired medicine', 1);

-- Check history
SELECT TOP 1 * FROM history_log WHERE activity = 'removed' ORDER BY created_at DESC;
```

## Important Notes

### 1. **Frontend Changes**
- Manual history logging has been removed from all modals
- Operations are now cleaner and faster
- History logging is handled transparently by the database

### 2. **User ID Handling**
- Stock in and stock out operations use the `user_id` from the operation
- Medicine deletion uses `deleted_by` field or defaults to user ID 1
- Ensure your operations always include valid user IDs

### 3. **Activity Values**
- All activity values match your CHECK constraint: 'added', 'restocked', 'dispensed', 'removed'
- Currently all stock in operations use 'added' (you can modify to differentiate 'restocked')

### 4. **Error Handling**
- If triggers fail, the entire operation fails (transaction rollback)
- This ensures data consistency but requires proper error handling
- Monitor trigger performance to avoid timeout issues

## Troubleshooting

### If Triggers Don't Fire
1. Check if triggers are enabled: `SELECT * FROM sys.triggers WHERE is_disabled = 0`
2. Verify table names match exactly (case-sensitive)
3. Check for syntax errors in trigger definitions

### If History Entries Are Missing Data
1. Verify foreign key relationships exist
2. Check if `medicines` table has the referenced records
3. Ensure JOIN conditions are correct

### Performance Issues
1. Add indexes on frequently joined columns
2. Monitor trigger execution time
3. Consider batching if processing large volumes

## Migration Notes

### From Manual to Automatic Logging
- ✅ Frontend code updated (manual logging removed)
- ✅ Database triggers created
- ✅ Activity values standardized
- ✅ No data loss during transition

### Rollback Plan
If you need to rollback to manual logging:
1. Drop the triggers: `DROP TRIGGER trg_stock_in_history, trg_stock_out_history, trg_medicine_deleted_history`
2. Restore previous frontend code from version control
3. Clear any duplicate history entries if needed

Your system now has robust, automatic history logging at the database level!
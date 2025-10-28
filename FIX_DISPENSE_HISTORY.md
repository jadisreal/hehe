# Fix: History Log Not Inserting on Dispense

## Issue
When dispensing medicine, no entries are being created in the `history_log` table.

## Root Cause
The database triggers have not been created yet. The frontend calls the API which inserts into `medicine_stock_out`, but without triggers, no history entry is created.

## Solution Steps

### Step 1: Create the Database Triggers
Execute the trigger creation script in your MSSQL database:

**File to run**: `database/setup_history_triggers.sql`

**How to run**:
1. Open SQL Server Management Studio (SSMS) or Azure Data Studio
2. Connect to your HIMS database
3. Open the `setup_history_triggers.sql` file
4. Execute the entire script

### Step 2: Verify Triggers Were Created
Run this query to check:

```sql
SELECT 
    t.name AS TriggerName,
    OBJECT_NAME(t.parent_id) AS TableName,
    t.is_disabled AS IsDisabled
FROM sys.triggers t
WHERE t.name IN ('trg_stock_out_history', 'trg_stock_in_history', 'trg_medicine_deleted_history');
```

You should see 3 triggers listed.

### Step 3: Check Your Table Schema
Make sure your `medicine_stock_out` table has a `reason` column:

```sql
SELECT COLUMN_NAME, DATA_TYPE 
FROM INFORMATION_SCHEMA.COLUMNS 
WHERE TABLE_NAME = 'medicine_stock_out';
```

If the `reason` column is missing, add it:

```sql
ALTER TABLE medicine_stock_out 
ADD reason VARCHAR(255) NULL;
```

### Step 4: Test the Trigger
After creating triggers, test by dispensing a medicine from your frontend, then check:

```sql
-- Check recent dispense operations
SELECT TOP 5 * FROM medicine_stock_out ORDER BY timestamp_dispensed DESC;

-- Check corresponding history entries
SELECT TOP 5 * FROM history_log WHERE activity = 'dispensed' ORDER BY created_at DESC;
```

### Step 5: Troubleshoot if Still Not Working
Run the troubleshooting script: `database/troubleshoot_triggers.sql`

This will help identify:
- Missing triggers
- Table structure issues
- Recent operations vs history entries

## What Was Fixed in the Code

### Frontend Changes
✅ **Fixed branch ID**: Now passes actual `branchId` instead of hardcoded `1`
✅ **Added reason field**: Dispense requests now include a reason
✅ **Updated interface**: `DispenseRequest` now includes `branchId` field

### Backend Changes  
✅ **Added reason handling**: Controller now saves the `reason` field to database
✅ **Proper validation**: All required fields are validated

## Expected Behavior After Fix

1. **User dispenses medicine** → Frontend calls `/api/dispense`
2. **Backend inserts record** → Into `medicine_stock_out` table
3. **Trigger fires automatically** → `trg_stock_out_history` executes
4. **History entry created** → New record in `history_log` with `activity = 'dispensed'`
5. **History page shows entry** → Dispense operation appears in history

## Verification Steps

1. **Dispense a medicine** from the frontend
2. **Check history_log table**:
   ```sql
   SELECT * FROM history_log 
   WHERE activity = 'dispensed' 
   ORDER BY created_at DESC;
   ```
3. **Check History page** in the application
4. **Verify data consistency** between `medicine_stock_out` and `history_log`

## Important Notes

- **Triggers are database-level**: They work regardless of how data is inserted
- **Automatic operation**: No frontend code needed once triggers are created  
- **Transactional safety**: If dispense fails, no history entry is created
- **Consistent format**: All history entries will have the same format

The key is **creating the database triggers first** - without them, the automatic history logging won't work!
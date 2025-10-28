-- This query shows exactly what the backend sees for branch 1
SELECT 
    m.medicine_id,
    m.medicine_name,
    m.medicine_category,
    SUM(msi.quantity) as stock_in_total,
    COALESCE(SUM(mso.quantity_dispensed), 0) as dispensed_total,
    COALESCE(SUM(ma.quantity), 0) as archived_total,
    (SUM(msi.quantity) - COALESCE(SUM(mso.quantity_dispensed), 0) - COALESCE(SUM(ma.quantity), 0)) as available_quantity
FROM medicine_stock_in msi
JOIN medicines m ON msi.medicine_id = m.medicine_id
LEFT JOIN medicine_stock_out mso ON msi.medicine_stock_in_id = mso.medicine_stock_in_id
LEFT JOIN medicine_archived ma ON msi.medicine_stock_in_id = ma.medicine_stock_in_id
WHERE msi.branch_id = 1
GROUP BY m.medicine_id, m.medicine_name, m.medicine_category
ORDER BY available_quantity ASC;

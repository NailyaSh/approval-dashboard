export function buildDashboard(rows) {
  const byApprover = new Map();

  for (const row of rows) {
    const approver = row['Согласующий из группы'] || 'Не указан';
    const duration = String(row['Продолжительность согласования'] || '').trim();
    const result = row['Результат согласования'] || 'Неизвестно';

    if (!byApprover.has(approver)) {
      byApprover.set(approver, {
        approver,
        docs: 0,
        durations: [],
        approved: 0,
        rejected: 0
      });
    }

    const item = byApprover.get(approver);
    item.docs += 1;
    if (duration) item.durations.push(duration);
    if (result === 'Согласовано') item.approved += 1;
    if (result === 'Не согласовано') item.rejected += 1;
  }

  return Array.from(byApprover.values()).map(item => ({
    ...item,
    avgDuration: item.durations.length ? item.durations.join(', ') : ''
  }));
}

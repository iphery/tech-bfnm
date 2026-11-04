export function calculateWorkingHours(start, end, requestTime) {
  if (!start || !end) return 0;

  const startDate = new Date(start);
  const endDate = new Date(end);
  const reqDate = requestTime ? new Date(requestTime) : null;

  if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) return 0;
  if (startDate >= endDate) return 0;

  let totalHours = 0;
  let current = new Date(startDate);

  while (current < endDate) {
    const isSunday = current.getDay() === 0;
    const isRequestDate = reqDate
      ? current.toDateString() === reqDate.toDateString()
      : false;

    // Skip Sunday unless it is the request date
    if (isSunday && !isRequestDate) {
      current.setDate(current.getDate() + 1);
      current.setHours(0, 0, 0, 0);
      continue;
    }

    const dayStart = new Date(current);
    dayStart.setHours(8, 0, 0, 0);

    const dayEnd = new Date(current);
    dayEnd.setHours(16, 0, 0, 0);

    const periodStart = current > dayStart ? current : dayStart;
    const periodEnd = endDate < dayEnd ? endDate : dayEnd;

    if (periodStart < periodEnd) {
      totalHours += (periodEnd.getTime() - periodStart.getTime()) / (1000 * 60 * 60);
    }

    current.setDate(current.getDate() + 1);
    current.setHours(0, 0, 0, 0);
  }

  return Number(totalHours.toFixed(2));
}


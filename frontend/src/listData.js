// Core list endpoints return { data, pagination }; training still returns an array.
export function listData(payload) {
  if (Array.isArray(payload)) return payload;
  return Array.isArray(payload?.data) ? payload.data : [];
}

export function listCount(payload) {
  const total = Number(payload?.pagination?.total);
  return Number.isFinite(total) && total >= 0 ? total : listData(payload).length;
}

export function toNumberId(value) {
  const numberValue = Number(value);
  return Number.isFinite(numberValue) ? numberValue : null;
}

export function toStringId(value) {
  if (value === null || value === undefined) return '';
  return String(value);
}

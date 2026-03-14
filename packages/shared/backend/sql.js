export function pushParam(params, value) {
  params.push(value);
  return `$${params.length}`;
}

export function buildWhereClause(clauses) {
  const active = clauses.filter(Boolean);
  if (active.length === 0) return '';
  return `WHERE ${active.join(' AND ')}`;
}

export function toSqlOrder(sortOrder) {
  return String(sortOrder).toLowerCase() === 'asc' ? 'ASC' : 'DESC';
}


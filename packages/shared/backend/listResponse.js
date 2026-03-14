export function buildListResponse({
  items,
  total,
  page,
  perPage,
  summary = {},
}) {
  return {
    items,
    total,
    page,
    per_page: perPage,
    summary,
  };
}


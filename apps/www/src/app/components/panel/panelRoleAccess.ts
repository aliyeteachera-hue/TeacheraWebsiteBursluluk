const ROLE_NORMALIZATION_MAP: Record<string, string> = {
  ADMIN: 'OPERATIONS',
  EDUCATION_ADVISOR: 'OPERATIONS',
};

const OPERATE_ROLES = new Set(['SUPER_ADMIN', 'OPERATIONS']);
const EXPORT_ROLES = new Set(['SUPER_ADMIN', 'OPERATIONS', 'READ_ONLY']);

export function normalizePanelRole(role?: string) {
  const normalized = String(role || '')
    .trim()
    .toUpperCase();
  if (!normalized) return '';
  return ROLE_NORMALIZATION_MAP[normalized] || normalized;
}

export function canOperatePanelActions(role?: string) {
  return OPERATE_ROLES.has(normalizePanelRole(role));
}

export function canExportPanelData(role?: string) {
  return EXPORT_ROLES.has(normalizePanelRole(role));
}

export function isReadOnlyPanelRole(role?: string) {
  return normalizePanelRole(role) === 'READ_ONLY';
}

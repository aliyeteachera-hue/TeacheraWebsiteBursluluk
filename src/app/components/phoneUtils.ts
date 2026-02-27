export const TR_MOBILE_PATTERN = '5[0-9]{2} [0-9]{3} [0-9]{2} [0-9]{2}';
export const TR_MOBILE_TITLE = 'Telefon numarasi 5XX XXX XX XX formatinda olmalidir.';

export function normalizeTrMobileInput(value: string): string {
  const rawDigits = value.replace(/\D/g, '');
  let digits = rawDigits.replace(/^0+/, '');

  if (digits.startsWith('90')) {
    digits = digits.slice(2);
  }

  if (digits && digits[0] !== '5') {
    digits = ''
  }

  digits = digits.slice(0, 10);

  let formatted = '';
  if (digits.length > 0) formatted += digits.slice(0, 3);
  if (digits.length > 3) formatted += ` ${digits.slice(3, 6)}`;
  if (digits.length > 6) formatted += ` ${digits.slice(6, 8)}`;
  if (digits.length > 8) formatted += ` ${digits.slice(8, 10)}`;
  return formatted;
}

export function isValidTrMobilePhone(value: string): boolean {
  return new RegExp(`^${TR_MOBILE_PATTERN}$`).test(value.trim());
}

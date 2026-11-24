/**
 * Utility to normalize and format Indian vehicle registration numbers consistently.
 * Standard format: SS-DD-LL-NNNN (e.g., MH-04-AB-1234, RJ-14-GB-1234, DL-01-CD-5678)
 * Also handles formats like:
 * - Bharat Series: 22-BH-1234-AA
 * - Single letter series: DL-1C-1234 -> DL-01-C-1234
 */

export const normalizeRegistrationNumber = (input) => {
  if (!input || typeof input !== 'string') return input || '';
  
  const raw = input.trim().toUpperCase();
  if (!raw) return '';

  // Remove all non-alphanumeric characters
  const clean = raw.replace(/[^A-Z0-9]/g, '');

  // Check Bharat (BH) Series: e.g. 22BH1234XX (2 digits, BH, 4 digits, 1-2 letters)
  const bhMatch = clean.match(/^(\d{2})(BH)(\d{1,4})([A-Z]{1,2})$/);
  if (bhMatch) {
    const [, year, bh, num, series] = bhMatch;
    return `${year}-${bh}-${num.padStart(4, '0')}-${series}`;
  }

  // Standard Indian State Format: 2 state letters + 1-2 RTO digits + 0-3 series letters + 1-4 digits
  // Example: MH04AB1234, RJ14GB1234, DL1C9999, MP091234
  const standardMatch = clean.match(/^([A-Z]{2})(\d{1,2})([A-Z]{0,3})(\d{1,4})$/);
  if (standardMatch) {
    const [, state, rto, series, num] = standardMatch;
    const formattedRto = rto.length === 1 ? `0${rto}` : rto;
    const formattedNum = num.padStart(4, '0');
    
    if (series) {
      return `${state}-${formattedRto}-${series}-${formattedNum}`;
    } else {
      return `${state}-${formattedRto}-${formattedNum}`;
    }
  }

  // If already hyphenated or spaced reasonably, normalize hyphens
  const parts = raw.split(/[\s-]+/).filter(Boolean);
  if (parts.length >= 3 && parts.length <= 4) {
    return parts.join('-');
  }

  return raw;
};

export default normalizeRegistrationNumber;

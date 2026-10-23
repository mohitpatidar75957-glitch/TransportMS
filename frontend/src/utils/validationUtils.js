/**
 * Validation utilities for TMS application
 * Enforces correct data patterns across forms:
 * - GSTIN: 15-character alphanumeric (e.g. 23AADCR1234F1Z5)
 * - PAN: 10-character alphanumeric (e.g. ABCDE1234F)
 * - Name: Letters, spaces, dots, dashes (no digits / symbols)
 * - Phone / Mobile: 10 digits
 * - Aadhar: 12 digits
 */

// GST format: 2 numbers, 5 letters, 4 numbers, 1 letter, 1 number/letter, Z, 1 number/letter
export const GST_REGEX = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;

// PAN format: 5 letters, 4 numbers, 1 letter
export const PAN_REGEX = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;

// Phone / Mobile format: 10 digits (optionally with +91)
export const PHONE_REGEX = /^(?:\+91|0)?[6-9]\d{9}$/;

// Aadhar format: 12 digits
export const AADHAR_REGEX = /^\d{12}$/;

// Name format: Alphabets, spaces, dots, dashes
export const NAME_REGEX = /^[A-Za-z\s.'-]+$/;

/**
 * Validates GST Number
 * Returns true if valid or empty (when optional). If required=true, empty returns false.
 */
export const isValidGST = (gst, required = false) => {
  if (!gst || !gst.trim()) return !required;
  const clean = gst.trim().toUpperCase();
  return clean.length === 15 && GST_REGEX.test(clean);
};

/**
 * Validates PAN Number
 */
export const isValidPAN = (pan, required = false) => {
  if (!pan || !pan.trim()) return !required;
  const clean = pan.trim().toUpperCase();
  return clean.length === 10 && PAN_REGEX.test(clean);
};

/**
 * Validates Indian 10-digit mobile number
 */
export const isValidPhone = (phone, required = false) => {
  if (!phone || !phone.trim()) return !required;
  const clean = phone.trim().replace(/[\s-]/g, '');
  return PHONE_REGEX.test(clean);
};

/**
 * Validates Person / Business Name (letters & spaces only)
 */
export const isValidName = (name, required = false) => {
  if (!name || !name.trim()) return !required;
  return NAME_REGEX.test(name.trim());
};

/**
 * Validates Aadhar number (12 digits)
 */
export const isValidAadhar = (aadhar, required = false) => {
  if (!aadhar || !aadhar.trim()) return !required;
  const clean = aadhar.trim().replace(/[\s-]/g, '');
  return clean.length === 12 && AADHAR_REGEX.test(clean);
};

/**
 * Sanitizes input live while typing:
 * - for name: keeps only letters, spaces, dots, dashes
 * - for numbers: keeps only digits
 * - for pan/gst: uppercase and alphanumeric only
 */
export const sanitizeNameInput = (val) => val.replace(/[^A-Za-z\s.'-]/g, '');
export const sanitizeDigitsOnly = (val, maxLen) => {
  const digits = val.replace(/\D/g, '');
  return maxLen ? digits.slice(0, maxLen) : digits;
};
export const sanitizeAlphaNumericUpper = (val, maxLen) => {
  const upper = val.toUpperCase().replace(/[^A-Z0-9]/g, '');
  return maxLen ? upper.slice(0, maxLen) : upper;
};

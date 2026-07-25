/**
 * Validation utility for transaction proof reference IDs in Yemen bank networks.
 * Handles Al-Kuraimi, Al-Basiri, Al-Najm, Al-Yemeni, and local exchange networks.
 */
export function validateTransactionRef(ref: string): { isValid: boolean; errorMsg?: string } {
  const cleanRef = ref.trim();
  if (!cleanRef) {
    return { isValid: false, errorMsg: "يرجى إدخال رقم العملية أو رمز التحويل لتوثيق السداد." };
  }
  
  // Format 1: 7 to 12 digits (e.g., Al-Kuraimi/Al-Basiri direct transfer id like 1029384752)
  const digitsRegex = /^\d{7,12}$/;
  
  // Format 2: hyphenated pattern like 90281-002 or 1234-5678 (Express transfer id format)
  const hyphenRegex = /^\d{3,6}-\d{2,5}$/;
  
  // Format 3: alphanumeric starting with 2-4 letters + hyphen + 5-9 digits (e.g. KRM-123456)
  const alphaRegex = /^[A-Z]{2,4}-\d{5,9}$/i;

  if (digitsRegex.test(cleanRef) || hyphenRegex.test(cleanRef) || alphaRegex.test(cleanRef)) {
    return { isValid: true };
  }

  return {
    isValid: false,
    errorMsg: "تنسيق رمز العملية غير صالح. يرجى إدخال رقم عملية صحيح يتكون من 7 إلى 12 رقماً، أو بالتنسيق المعتمد مثل (90281-002) أو (KRM-123456)."
  };
}

export interface ValidationError {
  field: string;
  message: string;
}

/** 태블릿 로그인 폼 검증 */
export function validateLoginForm(
  storeCode: string,
  tableNumber: string,
  password: string,
): ValidationError[] {
  const errors: ValidationError[] = [];

  if (!storeCode.trim()) {
    errors.push({ field: 'storeCode', message: '매장 코드를 입력해주세요' });
  } else if (storeCode.length > 50) {
    errors.push({ field: 'storeCode', message: '매장 코드는 50자 이내로 입력해주세요' });
  }

  if (!tableNumber.trim()) {
    errors.push({ field: 'tableNumber', message: '테이블 번호를 입력해주세요' });
  } else if (tableNumber.length > 20) {
    errors.push({ field: 'tableNumber', message: '테이블 번호는 20자 이내로 입력해주세요' });
  }

  if (!password) {
    errors.push({ field: 'password', message: '비밀번호를 입력해주세요' });
  } else if (password.length < 8) {
    errors.push({ field: 'password', message: '비밀번호는 8자 이상이어야 합니다' });
  }

  return errors;
}

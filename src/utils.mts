import { Logger } from "./logger.mjs";
import { I18nConfig } from "./types.mjs";

/**
 * 테스트 환경인지 확인
 */
export const isTestEnvironment = (): boolean => {
  return process.env.NODE_ENV === "test" || process.env.CI === "true";
};

/**
 * 테스트 설정 반환
 */
export const getTestConfig = (): I18nConfig => {
  return {
    GOOGLE_API_KEY: "test-api-key",
    GOOGLE_SHEET_ID: "test-sheet-id",
    targetDir: "./locales",
    languages: ["ko", "en"],
  };
};

/**
 * 설정 에러 처리
 */
export const handleConfigError = (): void => {
  Logger.error("CONFIG_NOT_FOUND");
  Logger.error("CONFIG_GUIDE");
  Logger.showConfigExample();
  Logger.error("MORE_INFO");
  Logger.error("INFO_LINK");
};

/**
 * 숫자를 알파벳으로 변환 (스프레드시트 열 표기용)
 */
export const numberToAlphabet = (number: number): string => {
  return String.fromCharCode(64 + number);
};

/**
 * API 에러 생성 헬퍼 함수
 */
export const createApiError = (prefix: string, error: unknown): Error => {
  if (error instanceof Error) {
    return new Error(`${prefix} ${error.message}`);
  }
  return new Error(`${prefix} Unknown error`);
};

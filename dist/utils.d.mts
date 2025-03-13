import { I18nConfig } from "./types.mjs";
/**
 * 테스트 환경인지 확인
 */
export declare const isTestEnvironment: () => boolean;
/**
 * 테스트 설정 반환
 */
export declare const getTestConfig: () => I18nConfig;
/**
 * 설정 에러 처리
 */
export declare const handleConfigError: () => void;
/**
 * 숫자를 알파벳으로 변환 (스프레드시트 열 표기용)
 */
export declare const numberToAlphabet: (number: number) => string;
/**
 * API 에러 생성 헬퍼 함수
 */
export declare const createApiError: (prefix: string, error: unknown) => Error;

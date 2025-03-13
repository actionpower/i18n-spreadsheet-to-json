import { ERROR_MESSAGES } from "./constants.mjs";
export declare class Logger {
    static error(errorType: keyof typeof ERROR_MESSAGES): void;
    static showConfigExample(): void;
    static info(message: string): void;
    static success(message: string): void;
    static folderCreated(path: string): void;
}

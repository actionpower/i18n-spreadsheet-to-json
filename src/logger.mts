import { ERROR_MESSAGES } from "./constants.mjs";

export class Logger {
  static error(errorType: keyof typeof ERROR_MESSAGES): void {
    const errorInfo = ERROR_MESSAGES[errorType];

    if (typeof errorInfo === "string") {
      console.error(errorInfo);
      return;
    }

    if ("title" in errorInfo && "message" in errorInfo) {
      console.error(errorInfo.title, errorInfo.message);
    }
  }

  static showConfigExample(): void {
    console.error(ERROR_MESSAGES.CONFIG_EXAMPLE);
  }

  static info(message: string): void {
    console.log(message);
  }

  static success(message: string): void {
    console.log(`✨ ${message}`);
  }

  static folderCreated(path: string): void {
    console.log(`📁 ${path} Folder created.`);
  }
}

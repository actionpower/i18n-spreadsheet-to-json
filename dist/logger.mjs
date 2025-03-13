import { ERROR_MESSAGES } from "./constants.mjs";
export class Logger {
    static error(errorType) {
        const errorInfo = ERROR_MESSAGES[errorType];
        if (typeof errorInfo === "string") {
            console.error(errorInfo);
            return;
        }
        if ("title" in errorInfo && "message" in errorInfo) {
            console.error(errorInfo.title, errorInfo.message);
        }
    }
    static showConfigExample() {
        console.error(ERROR_MESSAGES.CONFIG_EXAMPLE);
    }
    static info(message) {
        console.log(message);
    }
    static success(message) {
        console.log(`✨ ${message}`);
    }
    static folderCreated(path) {
        console.log(`📁 ${path} Folder created.`);
    }
}

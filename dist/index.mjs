import fs from "fs";
import prettier from "prettier";
import setWith from "lodash-es/setWith.js";
import merge from "lodash-es/merge.js";
import { CONSTANTS, ERROR_MESSAGES } from "./constants.mjs";
import { isTestEnvironment, getTestConfig, handleConfigError, numberToAlphabet, createApiError, } from "./utils.mjs";
import { Logger } from "./logger.mjs";
export class I18nSpreadsheetConverter {
    constructor(config) {
        const parsedConfig = config || this.parseConfig();
        this.GOOGLE_API_KEY = parsedConfig.GOOGLE_API_KEY;
        this.GOOGLE_SHEET_ID = parsedConfig.GOOGLE_SHEET_ID;
        this.targetDir = parsedConfig.targetDir || CONSTANTS.DEFAULT_TARGET_DIR;
        this.languages = parsedConfig.languages || CONSTANTS.DEFAULT_LANGUAGES;
        this.customIncludedSheets = parsedConfig.customIncludedSheets;
    }
    parseConfig() {
        try {
            const configString = fs.readFileSync("i18nconfig.json", "utf8");
            const config = JSON.parse(configString);
            if (!config.GOOGLE_API_KEY || !config.GOOGLE_SHEET_ID) {
                throw new Error("Missing required configuration");
            }
            return {
                GOOGLE_API_KEY: config.GOOGLE_API_KEY,
                GOOGLE_SHEET_ID: config.GOOGLE_SHEET_ID,
                targetDir: config.targetDir || CONSTANTS.DEFAULT_TARGET_DIR,
                languages: config.languages || CONSTANTS.DEFAULT_LANGUAGES,
                customIncludedSheets: config.customIncludedSheets,
            };
        }
        catch (error) {
            if (isTestEnvironment()) {
                return getTestConfig();
            }
            handleConfigError();
            process.exit(1);
        }
    }
    formatRawDataToObject(rawDatas, locale) {
        return rawDatas
            .map((rawData) => {
            const keyPath = rawData[CONSTANTS.COLUMN_OF_KEYS];
            const valueIndex = this.languages.indexOf(locale) + 1;
            const value = rawData[valueIndex] || "";
            if (!keyPath || this.shouldSkipKey(keyPath, value)) {
                return {};
            }
            return setWith({}, keyPath, value);
        })
            .reverse()
            .reduce((acc, localeObject) => merge(localeObject, acc), {});
    }
    shouldSkipKey(keyPath, value) {
        return keyPath.startsWith("//") || value === CONSTANTS.NON_VALUE;
    }
    async fetchSpreadsheetMetadata() {
        try {
            const url = `${CONSTANTS.GOOGLE_SHEET_BASE_URL}/${this.GOOGLE_SHEET_ID}?key=${this.GOOGLE_API_KEY}`;
            const response = await fetch(url);
            if (!response.ok) {
                const errorData = (await response.json());
                throw new Error(errorData?.error?.message || "API Error");
            }
            const data = (await response.json());
            if (!data.sheets) {
                throw new Error(ERROR_MESSAGES.GOOGLE_API_ERROR);
            }
            return data;
        }
        catch (error) {
            throw createApiError(ERROR_MESSAGES.FETCH_METADATA_ERROR, error);
        }
    }
    async fetchSheetData(rangesParams) {
        try {
            const url = `${CONSTANTS.GOOGLE_SHEET_BASE_URL}/${this.GOOGLE_SHEET_ID}/values:batchGet?${rangesParams}&key=${this.GOOGLE_API_KEY}`;
            const response = await fetch(url);
            if (!response.ok) {
                const errorData = (await response.json());
                throw new Error(errorData.error?.message || "API Error");
            }
            return (await response.json());
        }
        catch (error) {
            throw createApiError(ERROR_MESSAGES.FETCH_BATCH_DATA_ERROR, error);
        }
    }
    async createJsonFile(title, locale, data) {
        const formattedData = JSON.stringify(data, null, 2);
        const localePath = `${this.targetDir}/${locale}`;
        await this.ensureDirectoryExists(localePath);
        const filePath = `${localePath}/${title}.json`;
        const formattedCode = await prettier.format(formattedData, {
            filepath: filePath,
        });
        fs.writeFileSync(filePath, formattedCode, "utf-8");
    }
    async ensureDirectoryExists(dirPath) {
        if (!fs.existsSync(dirPath)) {
            fs.mkdirSync(dirPath, { recursive: true });
            Logger.folderCreated(dirPath);
        }
    }
    async processSheetData(fileName, data) {
        const promises = this.languages.map(async (locale) => {
            const formattedData = this.formatRawDataToObject(data, locale);
            await this.createJsonFile(fileName, locale, formattedData);
        });
        await Promise.all(promises);
    }
    getSelectedSheetTitles(fileName, allSheetTitles) {
        if (fileName === "--all") {
            return allSheetTitles ?? [];
        }
        if (fileName) {
            return [fileName];
        }
        if (this.customIncludedSheets && allSheetTitles) {
            return allSheetTitles.filter((title) => this.customIncludedSheets?.includes(title));
        }
        return allSheetTitles ?? [];
    }
    buildRangesParams(sheetTitles) {
        return sheetTitles
            .map((sheetTitle) => {
            const lastColumn = numberToAlphabet(this.languages.length + 1);
            return `ranges=${sheetTitle}!A2:${lastColumn}`;
        })
            .join("&");
    }
    async generateI18nFiles(fileName) {
        try {
            const { sheets } = await this.fetchSpreadsheetMetadata();
            const allSheetTitles = sheets.map(({ properties }) => properties.title);
            const selectedSheetTitles = this.getSelectedSheetTitles(fileName, allSheetTitles);
            if (selectedSheetTitles.length === 0) {
                Logger.info("No sheets to process.");
                return;
            }
            const rangesParams = this.buildRangesParams(selectedSheetTitles);
            const { valueRanges } = await this.fetchSheetData(rangesParams);
            const processPromises = valueRanges.map(async (sheetValue, index) => {
                if (!sheetValue.values || sheetValue.values.length === 0) {
                    Logger.info(`Sheet "${selectedSheetTitles[index]}" has no data.`);
                    return;
                }
                await this.processSheetData(selectedSheetTitles[index], sheetValue.values);
            });
            await Promise.all(processPromises);
            Logger.success(`Updated ${selectedSheetTitles.length} sheets: ${selectedSheetTitles.join(", ")}`);
        }
        catch (error) {
            console.error("Error generating i18n files:", error instanceof Error ? error.message : error);
            process.exit(1);
        }
    }
}
export const createI18n = async (fileName) => {
    const converter = new I18nSpreadsheetConverter();
    await converter.generateI18nFiles(fileName);
};

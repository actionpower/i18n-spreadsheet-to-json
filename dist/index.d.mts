import { I18nConfig, LocaleData } from "./types.mjs";
export declare class I18nSpreadsheetConverter {
    private GOOGLE_API_KEY;
    private GOOGLE_SHEET_ID;
    private targetDir;
    private languages;
    private customIncludedSheets?;
    constructor(config?: I18nConfig);
    private parseConfig;
    private formatRawDataToObject;
    private shouldSkipKey;
    private fetchSpreadsheetMetadata;
    private fetchSheetData;
    createJsonFile(title: string, locale: string, data: LocaleData): Promise<void>;
    private ensureDirectoryExists;
    private processSheetData;
    private getSelectedSheetTitles;
    private buildRangesParams;
    generateI18nFiles(fileName?: string): Promise<void>;
}
export declare const createI18n: (fileName?: string) => Promise<void>;

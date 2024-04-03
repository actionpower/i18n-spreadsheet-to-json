declare type LocaleData = {
    [key: string]: string | LocaleData | LocaleData[];
};
declare const rawDataToObjectFormatter: (rawDatas: string[][], locale: string) => LocaleData;
export declare const createJsonFile: (title: string, locale: string, data: LocaleData) => Promise<void>;
declare const createI18n: (fileName?: string | undefined) => Promise<void>;
export { rawDataToObjectFormatter, createI18n };

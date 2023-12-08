type LocaleData = {
    [key: string]: string | LocaleData | LocaleData[];
};
declare const columnOfLocale: {
    ko: number;
    en: number;
};
export declare const createJsonFile: (title: string, locale: keyof typeof columnOfLocale, data: LocaleData) => Promise<void>;
declare const createI18n: (fileName?: string) => Promise<void>;
export { createI18n };

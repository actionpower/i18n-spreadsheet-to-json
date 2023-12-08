var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import axios from "axios";
import fs from "fs";
import prettier from "prettier";
import { merge, setWith } from "lodash-es";
const GOOGLE_SHEET_BASE_URL = "https://sheets.googleapis.com/v4/spreadsheets";
const columnOfKeys = 0;
const columnOfLocale = {
    ko: 1,
    en: 2,
};
const rawDataToObjectFormatter = (rawDatas, locale) => rawDatas
    .map((rawData) => {
    const keyPath = rawData[columnOfKeys];
    const value = rawData[columnOfLocale[locale]] || "";
    return setWith({}, keyPath, value);
})
    .reverse()
    .reduce((acc, localeObject) => merge(localeObject, acc), {});
const getI18nMetaFromSpreedSheet = () => __awaiter(void 0, void 0, void 0, function* () {
    const configString = fs.readFileSync("i18nconfig.json", "utf8");
    const config = JSON.parse(configString);
    const response = yield axios.get(`${GOOGLE_SHEET_BASE_URL}/${config.GOOGLE_SHEET_ID}?key=${config.GOOGLE_API_KEY}`);
    return response.data;
});
const getI18nDataFromSheet = (fileName) => __awaiter(void 0, void 0, void 0, function* () {
    const configString = fs.readFileSync("i18nconfig.json", "utf8");
    const config = JSON.parse(configString);
    const GOOGLE_SHEET_ID = config.GOOGLE_SHEET_ID;
    const response = yield axios.get(`${GOOGLE_SHEET_BASE_URL}/${GOOGLE_SHEET_ID}/values/${fileName}!A2:C`, {
        params: {
            key: config.GOOGLE_API_KEY,
            valueRenderOption: "FORMATTED_VALUE",
        },
    });
    return response.data.values;
});
const getAllData = (rangesParams) => __awaiter(void 0, void 0, void 0, function* () {
    const configString = fs.readFileSync("i18nconfig.json", "utf8");
    const config = JSON.parse(configString);
    const response = yield axios.get(`${GOOGLE_SHEET_BASE_URL}/${config.GOOGLE_SHEET_ID}/values:batchGet?${rangesParams}`, {
        params: {
            key: config.GOOGLE_API_KEY,
        },
    });
    return response.data;
});
export const createJsonFile = (title, locale, data) => __awaiter(void 0, void 0, void 0, function* () {
    const formattedData = JSON.stringify(data, null, 2);
    const formattedCode = yield prettier.format(formattedData, {
        filepath: `./${locale}/${title}.json`,
    });
    fs.writeFileSync(`./${locale}/${title}.json`, formattedCode, "utf-8");
});
const formattingAndCreateLocaleFile = (fileName, data) => {
    const formattedKo = rawDataToObjectFormatter(data, "ko");
    const formattedEn = rawDataToObjectFormatter(data, "en");
    createJsonFile(fileName, "ko", formattedKo);
    createJsonFile(fileName, "en", formattedEn);
};
const createI18n = (fileName) => __awaiter(void 0, void 0, void 0, function* () {
    if (fileName) {
        const i18nArrayData = yield getI18nDataFromSheet(fileName);
        formattingAndCreateLocaleFile(fileName, i18nArrayData);
        return;
    }
    const { sheets } = yield getI18nMetaFromSpreedSheet();
    const sheetTitles = sheets.map((sheet) => sheet.properties.title);
    const rangesParams = sheetTitles
        .map((sheetTitle) => {
        return `ranges=${sheetTitle}!A2:C`;
    })
        .join("&");
    const { valueRanges: sheetsValues } = yield getAllData(rangesParams);
    sheetsValues.forEach((sheetsValue, index) => {
        formattingAndCreateLocaleFile(sheetTitles[index], sheetsValue.values);
    });
});
// createI18n(process.argv[2]);
export { createI18n };

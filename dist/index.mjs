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
import setWith from "lodash-es/setWith.js";
import merge from "lodash-es/merge.js";
const GOOGLE_SHEET_BASE_URL = "https://sheets.googleapis.com/v4/spreadsheets";
const columnOfKeys = 0;
const NON_VALUE = "_N/A";
const parseConfig = () => {
    try {
        const configString = fs.readFileSync("i18nconfig.json", "utf8");
        const config = JSON.parse(configString);
        return config;
    }
    catch (error) {
        if (process.env.NODE_ENV === "test" || process.env.CI === "true") {
            return {
                GOOGLE_API_KEY: "test-api-key",
                GOOGLE_SHEET_ID: "test-sheet-id",
                targetDir: "./locales",
                languages: ["ko", "en"],
            };
        }
        console.error("\x1b[31m%s\x1b[0m", "Error: 🔺i18nconfig.json file not found!");
        console.error("\x1b[33m%s\x1b[0m", "Please create an i18nconfig.json file in your project root with the following structure:");
        console.error(`
{
  "GOOGLE_API_KEY": "YOUR_GOOGLE_API_KEY",
  "GOOGLE_SHEET_ID": "YOUR_GOOGLE_SPREADSHEET_ID",
  "targetDir": "./locales",
  "languages": ["ko", "en"]
}
`);
        console.error("\x1b[33m%s\x1b[0m", "For more information, please refer to:");
        console.error("\x1b[36m%s\x1b[0m", "https://github.com/actionpower/i18n-spreadsheet-to-json?tab=readme-ov-file#i18nconfigjson");
        process.exit(1);
    }
};
const { GOOGLE_API_KEY, GOOGLE_SHEET_ID, targetDir, languages } = parseConfig();
const rawDataToObjectFormatter = (rawDatas, locale) => rawDatas
    .map((rawData) => {
    const keyPath = rawData[columnOfKeys];
    const value = rawData[languages.indexOf(locale) + 1] || "";
    if (!keyPath || (keyPath === null || keyPath === void 0 ? void 0 : keyPath.startsWith("//")) || value === NON_VALUE) {
        return {};
    }
    return setWith({}, keyPath, value);
})
    .reverse()
    .reduce((acc, localeObject) => merge(localeObject, acc), {});
const getI18nMetaFromSpreedSheet = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const response = yield axios.get(`${GOOGLE_SHEET_BASE_URL}/${GOOGLE_SHEET_ID}?key=${GOOGLE_API_KEY}`);
        return response.data;
    }
    catch (error) {
        console.log(error.response.data.error);
    }
});
const numberToAlphabet = (number) => {
    return String.fromCharCode(64 + number);
};
const getI18nDataFromSheet = (fileName) => __awaiter(void 0, void 0, void 0, function* () {
    const cellColumn = numberToAlphabet(languages.length + 1);
    try {
        const response = yield axios.get(`${GOOGLE_SHEET_BASE_URL}/${GOOGLE_SHEET_ID}/values/${fileName}!A2:${cellColumn}`, { params: { key: GOOGLE_API_KEY, valueRenderOption: "FORMATTED_VALUE" } });
        return response.data.values;
    }
    catch (error) {
        console.log(error.response.data.error);
    }
});
const getAllData = (rangesParams) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const response = yield axios.get(`${GOOGLE_SHEET_BASE_URL}/${GOOGLE_SHEET_ID}/values:batchGet?${rangesParams}`, { params: { key: GOOGLE_API_KEY } });
        return response.data;
    }
    catch (error) {
        console.log(error.response.data.error);
    }
});
export const createJsonFile = (title, locale, data) => __awaiter(void 0, void 0, void 0, function* () {
    const formattedData = JSON.stringify(data, null, 2);
    const targetDirectory = targetDir !== null && targetDir !== void 0 ? targetDir : "locales";
    if (!fs.existsSync(`${targetDirectory}/${locale}`)) {
        fs.mkdirSync(`${targetDirectory}/${locale}`, { recursive: true });
        console.log(`📁 ${targetDirectory}/${locale} Folder created.`);
    }
    const formattedCode = yield prettier.format(formattedData, {
        filepath: `${targetDirectory}/${locale}/${title}.json`,
    });
    fs.writeFileSync(`${targetDirectory}/${locale}/${title}.json`, formattedCode, "utf-8");
});
const formattingAndCreateLocaleFile = (fileName, data) => {
    languages.forEach((locale) => {
        const formattedData = rawDataToObjectFormatter(data, locale);
        createJsonFile(fileName, locale, formattedData);
    });
};
const createI18n = (fileName) => __awaiter(void 0, void 0, void 0, function* () {
    const { sheets } = yield getI18nMetaFromSpreedSheet();
    const sheetTitles = sheets.map((sheet) => sheet.properties.title);
    if (fileName !== undefined && !sheetTitles.includes(fileName)) {
        throw new Error("🛑 Please check the sheet name. The sheet name should be on the spreadsheet list.");
    }
    if (fileName) {
        const i18nArrayData = yield getI18nDataFromSheet(fileName);
        if (!i18nArrayData) {
            return;
        }
        formattingAndCreateLocaleFile(fileName, i18nArrayData);
        console.log("✨ Updated", fileName);
        return;
    }
    const rangesParams = sheetTitles
        .map((sheetTitle) => {
        return `ranges=${sheetTitle}!A2:${numberToAlphabet(languages.length + 1)}`;
    })
        .join("&");
    const { valueRanges: sheetsValues } = yield getAllData(rangesParams);
    sheetsValues.forEach((sheetsValue, index) => {
        if (!sheetsValue.values) {
            return;
        }
        formattingAndCreateLocaleFile(sheetTitles[index], sheetsValue.values);
    });
    console.log("✨ Updated all sheets.");
});
export { rawDataToObjectFormatter, createI18n };

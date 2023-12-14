import axios from "axios";
import fs from "fs";
import prettier from "prettier";
import { merge, setWith } from "lodash-es";

const GOOGLE_SHEET_BASE_URL = "https://sheets.googleapis.com/v4/spreadsheets";

type SheetProperties = {
  sheetId: number;
  title: string;
  index: number;
  sheetType: string;
  gridProperties: object;
};

type Sheet = {
  properties: SheetProperties;
};

type SheetValue = {
  range: string;
  majorDimension: "ROWS" | "COLUMNS";
  values: string[][];
};

type LocaleData = {
  [key: string]: string | LocaleData | LocaleData[];
};

const columnOfKeys = 0;
const columnOfLocale = {
  ko: 1,
  en: 2,
};

const configString = fs.readFileSync("i18nconfig.json", "utf8");
const { GOOGLE_API_KEY, GOOGLE_SHEET_ID, outDir } = JSON.parse(configString);

const rawDataToObjectFormatter = (
  rawDatas: string[][],
  locale: keyof typeof columnOfLocale
) =>
  rawDatas
    .map((rawData) => {
      const keyPath = rawData[columnOfKeys];
      const value = rawData[columnOfLocale[locale]] || "";
      return setWith({} as LocaleData, keyPath, value);
    })
    .reverse()
    .reduce(
      (acc: LocaleData, localeObject: LocaleData) => merge(localeObject, acc),
      {} as LocaleData
    );

const getI18nMetaFromSpreedSheet = async () => {
  try {
    const response = await axios.get(
      `${GOOGLE_SHEET_BASE_URL}/${GOOGLE_SHEET_ID}?key=${GOOGLE_API_KEY}`
    );
    return response.data;
  } catch (error: any) {
    console.log(error.response.data.error);
  }
};

const getI18nDataFromSheet = async (fileName: string) => {
  try {
    const response = await axios.get(
      `${GOOGLE_SHEET_BASE_URL}/${GOOGLE_SHEET_ID}/values/${fileName}!A2:C`,
      {
        params: {
          key: GOOGLE_API_KEY,
          valueRenderOption: "FORMATTED_VALUE",
        },
      }
    );
    return response.data.values;
  } catch (error: any) {
    console.log(error.response.data.error);
  }
};

const getAllData = async (rangesParams: string) => {
  try {
    const response = await axios.get(
      `${GOOGLE_SHEET_BASE_URL}/${GOOGLE_SHEET_ID}/values:batchGet?${rangesParams}`,
      {
        params: {
          key: GOOGLE_API_KEY,
        },
      }
    );
    return response.data;
  } catch (error: any) {
    console.log(error.response.data.error);
  }
};

export const createJsonFile = async (
  title: string,
  locale: keyof typeof columnOfLocale,
  data: LocaleData
) => {
  const formattedData = JSON.stringify(data, null, 2);

  if (!fs.existsSync(`${outDir}/${locale}`)) {
    fs.mkdirSync(`${outDir}/${locale}`, { recursive: true });
  }

  const formattedCode = await prettier.format(formattedData, {
    filepath: `${outDir}/${locale}/${title}.json`,
  });
  fs.writeFileSync(`${outDir}/${locale}/${title}.json`, formattedCode, "utf-8");
};

const formattingAndCreateLocaleFile = (fileName: string, data: string[][]) => {
  const formattedKo = rawDataToObjectFormatter(data, "ko");
  const formattedEn = rawDataToObjectFormatter(data, "en");
  createJsonFile(fileName, "ko", formattedKo);
  createJsonFile(fileName, "en", formattedEn);
};

const createI18n = async (fileName?: string) => {
  if (fileName) {
    const i18nArrayData = await getI18nDataFromSheet(fileName);

    if (i18nArrayData === undefined) return;

    formattingAndCreateLocaleFile(fileName, i18nArrayData);
    return;
  }

  const { sheets } = await getI18nMetaFromSpreedSheet();
  const sheetTitles = sheets.map((sheet: Sheet) => sheet.properties.title);
  const rangesParams = sheetTitles
    .map((sheetTitle: string) => {
      return `ranges=${sheetTitle}!A2:C`;
    })
    .join("&");
  const { valueRanges: sheetsValues } = await getAllData(rangesParams);

  sheetsValues.forEach((sheetsValue: SheetValue, index: number) => {
    formattingAndCreateLocaleFile(sheetTitles[index], sheetsValue.values);
  });
};

export { createI18n };

import axios from "axios";
import fs from "fs";
import prettier from "prettier";
import merge from "lodash.merge";
import setWith from "lodash.setwith";

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
  values: string[][] | undefined;
};

type LocaleData = {
  [key: string]: string | LocaleData | LocaleData[];
};

const columnOfKeys = 0;
type ParseConfig = {
  GOOGLE_API_KEY: string;
  GOOGLE_SHEET_ID: string;
  targetDir: string;
  languages: string[];
};

const parseConfig = (): ParseConfig => {
  const configString = fs.readFileSync("i18nconfig.json", "utf8");

  const config = JSON.parse(configString);
  const defaultLanguages = ["ko", "en"];

  if (!config.languages) {
    return { ...config, languages: defaultLanguages } as ParseConfig;
  }

  if (!Array.isArray(config.languages)) {
    throw new Error(
      "🛑 Please check the 'languages' field in the i18nconfig file, it must be an array",
    );
  }

  return { ...config } as ParseConfig;
};

const { GOOGLE_API_KEY, GOOGLE_SHEET_ID, targetDir, languages } = parseConfig();

const rawDataToObjectFormatter = (rawDatas: string[][], locale: string) =>
  rawDatas
    .map((rawData) => {
      const keyPath = rawData[columnOfKeys];
      const value = rawData[languages.indexOf(locale) + 1] || "";
      if (!keyPath || keyPath?.startsWith("//")) {
        return {};
      }

      return setWith({} as LocaleData, keyPath, value);
    })
    .reverse()
    .reduce(
      (acc: LocaleData, localeObject: LocaleData) => merge(localeObject, acc),
      {} as LocaleData,
    );

const getI18nMetaFromSpreedSheet = async () => {
  try {
    const response = await axios.get(
      `${GOOGLE_SHEET_BASE_URL}/${GOOGLE_SHEET_ID}?key=${GOOGLE_API_KEY}`,
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
      },
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
      },
    );
    return response.data;
  } catch (error: any) {
    console.log(error.response.data.error);
  }
};

export const createJsonFile = async (
  title: string,
  locale: string,
  data: LocaleData,
) => {
  const formattedData = JSON.stringify(data, null, 2);
  const targetDirectory = targetDir ?? "locales";

  if (!fs.existsSync(`${targetDirectory}/${locale}`)) {
    fs.mkdirSync(`${targetDirectory}/${locale}`, { recursive: true });
    console.log(`📁 ${targetDirectory}/${locale} Folder created.`);
  }

  const formattedCode = await prettier.format(formattedData, {
    filepath: `${targetDirectory}/${locale}/${title}.json`,
  });
  fs.writeFileSync(
    `${targetDirectory}/${locale}/${title}.json`,
    formattedCode,
    "utf-8",
  );
};

const formattingAndCreateLocaleFile = (fileName: string, data: string[][]) => {
  languages.forEach((locale) => {
    const formattedData = rawDataToObjectFormatter(data, locale);
    createJsonFile(fileName, locale, formattedData);
  });
};

const createI18n = async (fileName?: string) => {
  if (fileName) {
    const i18nArrayData = await getI18nDataFromSheet(fileName);

    if (!i18nArrayData) {
      return;
    }

    formattingAndCreateLocaleFile(fileName, i18nArrayData);
    console.log("✨ Updated", fileName);
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
    if (!sheetsValue.values) {
      return;
    }
    formattingAndCreateLocaleFile(sheetTitles[index], sheetsValue.values);
  });
  console.log("✨ Updated all sheets.");
};

export { rawDataToObjectFormatter, createI18n };

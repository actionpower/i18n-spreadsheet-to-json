import fs from "fs";
import prettier from "prettier";
import setWith from "lodash-es/setWith.js";
import merge from "lodash-es/merge.js";

const ERROR_MESSAGES = {
  CONFIG_NOT_FOUND: {
    title: "\x1b[31m%s\x1b[0m",
    message: "Error: 🔺i18nconfig.json file not found!",
  },
  CONFIG_GUIDE: {
    title: "\x1b[33m%s\x1b[0m",
    message:
      "Please create an i18nconfig.json file in your project root with the following structure:",
  },
  CONFIG_EXAMPLE: `
{
  "GOOGLE_API_KEY": "YOUR_GOOGLE_API_KEY",
  "GOOGLE_SHEET_ID": "YOUR_GOOGLE_SPREADSHEET_ID",
  "targetDir": "./locales",
  "languages": ["ko", "en"]
}
`,
  MORE_INFO: {
    title: "\x1b[33m%s\x1b[0m",
    message: "For more information, please refer to:",
  },
  INFO_LINK: {
    title: "\x1b[36m%s\x1b[0m",
    message:
      "https://github.com/actionpower/i18n-spreadsheet-to-json?tab=readme-ov-file#i18nconfigjson",
  },
};
// type SheetResponse = {
//   properties: {
//     sheetId: number;
//     title: string;
//     index: number;
//     sheetType: string;
//     gridProperties: object[];
//   };
// }[];

type I18nConfig = {
  GOOGLE_API_KEY: string;
  GOOGLE_SHEET_ID: string;
  targetDir: string;
  languages: string[];
  sheetNames?: string[];
};

type LocaleData = { [key: string]: string | LocaleData | LocaleData[] };
type SheetProperties = {
  sheetId: number;
  title: string;
  index: number;
  sheetType: string;
  gridProperties: object;
};
type Sheet = { sheets: { properties: SheetProperties }[] };

type SheetValue = {
  range: string;
  majorDimension: "ROWS" | "COLUMNS";
  values: string[][] | undefined;
};

const COLUMN_OF_KEYS = 0;
const NON_VALUE = "_N/A";
const GOOGLE_SHEET_BASE_URL = "https://sheets.googleapis.com/v4/spreadsheets";

class I18nSpreadsheetConverter {
  private GOOGLE_API_KEY: string;
  private GOOGLE_SHEET_ID: string;
  private targetDir: string;
  private languages: string[];
  private sheetNames?: string[];

  constructor(config?: I18nConfig) {
    const parsedConfig = config || this.parseConfig();
    this.GOOGLE_API_KEY = parsedConfig.GOOGLE_API_KEY;
    this.GOOGLE_SHEET_ID = parsedConfig.GOOGLE_SHEET_ID;
    this.targetDir = parsedConfig.targetDir;
    this.languages = parsedConfig.languages;
    this.sheetNames = parsedConfig.sheetNames;
  }

  private parseConfig(): I18nConfig {
    try {
      const configString = fs.readFileSync("i18nconfig.json", "utf8");
      const config = JSON.parse(configString);
      const defaultLanguages = ["ko", "en"];

      if (!config.languages) {
        return { ...config, languages: defaultLanguages } as I18nConfig;
      }
      return config;
    } catch (error) {
      if (process.env.NODE_ENV === "test" || process.env.CI === "true") {
        return {
          GOOGLE_API_KEY: "test-api-key",
          GOOGLE_SHEET_ID: "test-sheet-id",
          targetDir: "./locales",
          languages: ["ko", "en"],
        };
      }
      console.error(
        ERROR_MESSAGES.CONFIG_NOT_FOUND.title,
        ERROR_MESSAGES.CONFIG_NOT_FOUND.message
      );
      console.error(
        ERROR_MESSAGES.CONFIG_GUIDE.title,
        ERROR_MESSAGES.CONFIG_GUIDE.message
      );
      console.error(ERROR_MESSAGES.CONFIG_EXAMPLE);
      console.error(
        ERROR_MESSAGES.MORE_INFO.title,
        ERROR_MESSAGES.MORE_INFO.message
      );
      console.error(
        ERROR_MESSAGES.INFO_LINK.title,
        ERROR_MESSAGES.INFO_LINK.message
      );
      process.exit(1);
    }
  }

  private rawDataToObjectFormatter(
    rawDatas: string[][],
    locale: string
  ): LocaleData {
    return rawDatas
      .map((rawData) => {
        const keyPath = rawData[COLUMN_OF_KEYS];
        const value = rawData[this.languages.indexOf(locale) + 1] || "";
        if (!keyPath || keyPath?.startsWith("//") || value === NON_VALUE) {
          return {};
        }

        return setWith({} as LocaleData, keyPath, value);
      })
      .reverse()
      .reduce(
        (acc: LocaleData, localeObject: LocaleData) => merge(localeObject, acc),
        {} as LocaleData
      );
  }

  private async getI18nMetaFromSpreedSheet(): Promise<Sheet> {
    try {
      const response = await fetch(
        `${GOOGLE_SHEET_BASE_URL}/${this.GOOGLE_SHEET_ID}?key=${this.GOOGLE_API_KEY}`
      );
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error);
      }
      const data = await response.json();
      if (!data.sheets) {
        throw new Error(
          "🛑 Please check the GOOGLE_SHEET_ID or GOOGLE_API_KEY."
        );
      }
      return data;
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(
          `Failed to fetch spreadsheet metadata: ${error.message}`
        );
      } else {
        throw new Error("Failed to fetch spreadsheet metadata: Unknown error");
      }
    }
  }

  private numberToAlphabet(number: number): string {
    return String.fromCharCode(64 + number);
  }

  private async getI18nData(rangesParams: string) {
    try {
      const response = await fetch(
        `${GOOGLE_SHEET_BASE_URL}/${this.GOOGLE_SHEET_ID}/values:batchGet?${rangesParams}&key=${this.GOOGLE_API_KEY}`
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData);
      }

      const data = await response.json();
      return data;
    } catch (error: unknown) {
      if (error instanceof Error) {
        throw new Error(`Failed to fetch batch data: ${error.message}`);
      } else {
        throw new Error("Failed to fetch batch data");
      }
    }
  }

  public async createJsonFile(
    title: string,
    locale: string,
    data: LocaleData
  ): Promise<void> {
    const formattedData = JSON.stringify(data, null, 2);
    const targetDirectory = this.targetDir ?? "locales";

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
      "utf-8"
    );
  }

  private formattingAndCreateLocaleFile(
    fileName: string,
    data: string[][]
  ): void {
    this.languages.forEach((locale) => {
      const formattedData = this.rawDataToObjectFormatter(data, locale);
      this.createJsonFile(fileName, locale, formattedData);
    });
  }

  private getSelectedSheetTitles = (
    fileName?: string,
    allSheetTitles?: string[]
  ) => {
    if (fileName === "--all") {
      return allSheetTitles ?? [];
    }
    if (fileName) {
      return [fileName];
    }
    if (this.sheetNames) {
      return (
        allSheetTitles?.filter(
          (title: string) => this.sheetNames?.includes(title)
        ) ?? []
      );
    }
    return allSheetTitles ?? [];
  };

  public async createI18n(fileName?: string): Promise<void> {
    const { sheets } = await this.getI18nMetaFromSpreedSheet();

    const allSheetTitles = sheets.map(({ properties }) => properties.title);
    const selectedSheetTitles = this.getSelectedSheetTitles(
      fileName,
      allSheetTitles
    );

    console.log(selectedSheetTitles, "selectedSheetTitles");
    const rangesParams = selectedSheetTitles
      .map((sheetTitle: string) => {
        return `ranges=${sheetTitle}!A2:${this.numberToAlphabet(
          this.languages.length + 1
        )}`;
      })
      .join("&");

    if (rangesParams === "") {
      console.log("No sheets to process.");
      return;
    }

    const { valueRanges: sheetsValues } = await this.getI18nData(rangesParams);

    sheetsValues.forEach((sheetsValue: SheetValue, index: number) => {
      if (!sheetsValue.values) {
        return;
      }
      this.formattingAndCreateLocaleFile(
        selectedSheetTitles[index],
        sheetsValue.values
      );
    });

    console.log(
      `✨ Updated ${selectedSheetTitles.length} sheets: ${selectedSheetTitles}`
    );
  }
}

export const createI18n = async (fileName?: string): Promise<void> => {
  const converter = new I18nSpreadsheetConverter();
  await converter.createI18n(fileName);
};
// export { I18nSpreadsheetConverter };

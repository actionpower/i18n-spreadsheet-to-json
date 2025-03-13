export const CONSTANTS = {
    COLUMN_OF_KEYS: 0,
    NON_VALUE: "_N/A",
    GOOGLE_SHEET_BASE_URL: "https://sheets.googleapis.com/v4/spreadsheets",
    DEFAULT_LANGUAGES: ["ko", "en"],
    DEFAULT_TARGET_DIR: "./locales",
};
export const ERROR_MESSAGES = {
    CONFIG_NOT_FOUND: {
        title: "\x1b[31m%s\x1b[0m",
        message: "Error: 🔺i18nconfig.json file not found!",
    },
    CONFIG_GUIDE: {
        title: "\x1b[33m%s\x1b[0m",
        message: "Please create an i18nconfig.json file in your project root with the following structure:",
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
        message: "https://github.com/actionpower/i18n-spreadsheet-to-json?tab=readme-ov-file#i18nconfigjson",
    },
    GOOGLE_API_ERROR: "🛑 Please check the GOOGLE_SHEET_ID or GOOGLE_API_KEY.",
    FETCH_METADATA_ERROR: "Failed to fetch spreadsheet metadata:",
    FETCH_BATCH_DATA_ERROR: "Failed to fetch batch data:",
};

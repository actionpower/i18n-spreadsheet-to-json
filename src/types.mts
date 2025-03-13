export interface I18nConfig {
  GOOGLE_API_KEY: string;
  GOOGLE_SHEET_ID: string;
  targetDir: string;
  languages?: string[];
  customIncludedSheets?: string[];
}

export interface LocaleData {
  [key: string]: string | LocaleData | LocaleData[];
}

export interface GridProperties {
  rowCount: number;
  columnCount: number;
}

export interface SheetProperties {
  sheetId: number;
  title: string;
  index: number;
  sheetType: string;
  gridProperties: GridProperties;
}

export interface Sheet {
  sheets: { properties: SheetProperties }[];
}

export interface SheetValue {
  range: string;
  majorDimension: "ROWS" | "COLUMNS";
  values: string[][] | undefined;
}

export interface BatchGetResponse {
  valueRanges: SheetValue[];
}

export interface ErrorResponse {
  error?: {
    message?: string;
  };
}

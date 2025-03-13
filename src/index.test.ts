import fs from "fs";
import { Logger } from "./logger.mjs";
import { CONSTANTS } from "./constants.mjs";
import * as i18nFromSpreedSheet from "../src/index.mjs";

jest.mock("fs");
jest.mock("prettier", () => ({
  format: jest.fn().mockImplementation((data) => Promise.resolve(data)),
}));
jest.mock("../src/logger.mjs", () => ({
  Logger: {
    info: jest.fn(),
    success: jest.fn(),
    folderCreated: jest.fn(),
    error: jest.fn(),
  },
}));

describe("i18nFromSpreedSheet.I18nSpreadsheetConverter", () => {
  const testData = [
    [
      "information.fileUpload.title",
      "내 파일을 클릭하거나 끌어오세요",
      "Click here to select a file or drag & drop.",
    ],
    ["time.insufficientTime", "부족한 시간", "You need"],
    ["time.remainTime", "사용 후 남은 시간", "Time remaining"],
    ["available.title", "업로드 가능한 파일", "Filetypes we support"],
    ["available.youtube", "YouTube 링크", "YouTube links"],
    ["available.video", "비디오", "Video"],
    ["available.audio.one", "오디오1", "Audio"],
    ["available.audio.two", "오디오2", "Audio"],
  ];

  const mockConfig = {
    GOOGLE_API_KEY: "test-api-key",
    GOOGLE_SHEET_ID: "test-sheet-id",
    targetDir: "test-target-dir",
    languages: ["ko", "en"],
  };

  const mockSpreadsheetMetadata = {
    sheets: [
      { properties: { title: "Sheet1" } },
      { properties: { title: "Sheet2" } },
      { properties: { title: "Sheet3" } },
    ],
  };

  const mockBatchGetResponse = {
    valueRanges: [
      {
        values: testData,
      },
      {
        values: testData,
      },
    ],
  };

  afterEach(() => {
    jest.restoreAllMocks();
  });

  function setupFetchMock() {
    global.fetch = jest
      .fn()
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockSpreadsheetMetadata),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockBatchGetResponse),
      });
  }

  describe("generateI18nFiles", () => {
    test("should process sheets specified in config.customIncludedSheets when no fileName is provided", async () => {
      setupFetchMock();
      const configWithCustomIncludedSheets = {
        ...mockConfig,
        customIncludedSheets: ["Sheet1", "Sheet3"],
      };
      const converter = new i18nFromSpreedSheet.I18nSpreadsheetConverter(
        configWithCustomIncludedSheets
      );

      await converter.generateI18nFiles();

      expect(fetch).toHaveBeenCalledTimes(2);

      expect(fs.writeFileSync).toHaveBeenCalledTimes(4);

      const writeFileCalls = (fs.writeFileSync as jest.Mock).mock.calls;
      const sheet1Files = writeFileCalls.filter((call) =>
        call[0].includes("Sheet1")
      );
      const sheet3Files = writeFileCalls.filter((call) =>
        call[0].includes("Sheet3")
      );

      expect(sheet1Files.length).toBe(2);
      expect(sheet3Files.length).toBe(2);
      expect(Logger.success).toHaveBeenCalledWith(
        "Updated 2 sheets: Sheet1, Sheet3"
      );
    });

    test("should create target directories if they do not exist", async () => {
      setupFetchMock();
      jest.spyOn(fs, "existsSync").mockReturnValue(false);

      const configWithcustomIncludedSheets = {
        ...mockConfig,
        customIncludedSheets: ["Sheet1", "Sheet3"],
      };
      const converter = new i18nFromSpreedSheet.I18nSpreadsheetConverter(
        configWithcustomIncludedSheets
      );

      await converter.generateI18nFiles();

      expect(fs.writeFileSync).toHaveBeenCalledTimes(4);
    });

    test("should handle empty sheet data gracefully", async () => {
      const emptyBatchResponse = {
        valueRanges: [{ values: [] }, { values: [] }],
      };

      global.fetch = jest
        .fn()
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve(mockSpreadsheetMetadata),
        })
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve(emptyBatchResponse),
        });

      const configWithcustomIncludedSheets = {
        ...mockConfig,
        customIncludedSheets: ["Sheet1", "Sheet3"],
      };
      const converter = new i18nFromSpreedSheet.I18nSpreadsheetConverter(
        configWithcustomIncludedSheets
      );

      await converter.generateI18nFiles();

      expect(fs.writeFileSync).not.toHaveBeenCalled();
      expect(Logger.info).toHaveBeenCalledTimes(2);
    });

    test("should handle API errors properly", async () => {
      const errorResponse = {
        ok: false,
        json: () => Promise.resolve({ error: { message: "API Error" } }),
      };

      global.fetch = jest.fn().mockResolvedValueOnce(errorResponse);

      const configWithcustomIncludedSheets = {
        ...mockConfig,
        customIncludedSheets: ["Sheet1", "Sheet3"],
      };
      const converter = new i18nFromSpreedSheet.I18nSpreadsheetConverter(
        configWithcustomIncludedSheets
      );

      const consoleErrorSpy = jest
        .spyOn(console, "error")
        .mockImplementation(() => {});
      const processExitSpy = jest
        .spyOn(process, "exit")
        .mockImplementation((() => {}) as any);

      await converter.generateI18nFiles();

      expect(consoleErrorSpy).toHaveBeenCalled();
      expect(processExitSpy).toHaveBeenCalledWith(1);

      consoleErrorSpy.mockRestore();
      processExitSpy.mockRestore();
    });

    test("should handle keys with NON_VALUE constant", async () => {
      const dataWithNonValue = [
        ...testData,
        ["skipme.key", CONSTANTS.NON_VALUE, "Skip this value"],
      ];

      const batchResponseWithNonValue = {
        valueRanges: [
          { values: dataWithNonValue },
          { values: dataWithNonValue },
        ],
      };

      global.fetch = jest
        .fn()
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve(mockSpreadsheetMetadata),
        })
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve(batchResponseWithNonValue),
        });

      const configWithcustomIncludedSheets = {
        ...mockConfig,
        customIncludedSheets: ["Sheet1", "Sheet3"],
      };
      const converter = new i18nFromSpreedSheet.I18nSpreadsheetConverter(
        configWithcustomIncludedSheets
      );

      await converter.generateI18nFiles();

      expect(fs.writeFileSync).toHaveBeenCalledTimes(4);

      const allWriteCalls = (fs.writeFileSync as jest.Mock).mock.calls;
      const skipMeKeyFound = allWriteCalls.some((call) => {
        const fileContent = call[1];
        return (
          typeof fileContent === "string" && fileContent.includes("skipme.key")
        );
      });

      expect(skipMeKeyFound).toBe(false);
    });

    test("should handle config loading from file when no config is provided", async () => {
      setupFetchMock();

      jest.spyOn(fs, "readFileSync").mockReturnValueOnce(
        JSON.stringify({
          ...mockConfig,
          customIncludedSheets: ["Sheet1", "Sheet3"],
        })
      );

      const converter = new i18nFromSpreedSheet.I18nSpreadsheetConverter();

      expect(fs.readFileSync).toHaveBeenCalledWith("i18nconfig.json", "utf8");
      expect(converter["GOOGLE_API_KEY"]).toBe(mockConfig.GOOGLE_API_KEY);
      expect(converter["GOOGLE_SHEET_ID"]).toBe(mockConfig.GOOGLE_SHEET_ID);
    });

    test("should handle network failures gracefully", async () => {
      global.fetch = jest.fn().mockImplementation(() => {
        throw new Error("Network failure");
      });

      const configWithcustomIncludedSheets = {
        ...mockConfig,
        customIncludedSheets: ["Sheet1", "Sheet3"],
      };
      const converter = new i18nFromSpreedSheet.I18nSpreadsheetConverter(
        configWithcustomIncludedSheets
      );

      const consoleErrorSpy = jest
        .spyOn(console, "error")
        .mockImplementation(() => {});
      const processExitSpy = jest
        .spyOn(process, "exit")
        .mockImplementation((() => {}) as any);

      await converter.generateI18nFiles();

      expect(consoleErrorSpy).toHaveBeenCalled();
      expect(processExitSpy).toHaveBeenCalledWith(1);

      consoleErrorSpy.mockRestore();
      processExitSpy.mockRestore();
    });
  });
});

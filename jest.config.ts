import type { Config } from "jest";

const config: Config = {
  verbose: true,
  preset: "ts-jest",
  testEnvironment: "node",
  extensionsToTreatAsEsm: [".ts", ".mts"],
  moduleFileExtensions: ["ts", "mts", "js", "mjs", "json"],
  transform: {
    "^.+\\.m?ts$": [
      "ts-jest",
      {
        useESM: true,
      },
    ],
  },
  testPathIgnorePatterns: ["/node_modules/", "/dist/"],
  moduleDirectories: ["node_modules", "<rootDir>/"],
  moduleNameMapper: {
    "^axios/$": "axios/dist/node/axios.cjs",
    "^lodash-es/(.*)$": "lodash/$1",
    "^@/(.*)$": "<rootDir>/src/$1",
    "^(\\.{1,2}/.*)\\.m?js$": "$1",
  },
  resetMocks: true,
  clearMocks: true,
  testMatch: ["**/__test__/**/*.test.(ts|js)", "**/*.test.(ts|js)"],
};

export default config;

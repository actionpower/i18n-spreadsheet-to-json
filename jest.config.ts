import type { Config } from "jest";

const config: Config = {
  verbose: true,
  preset: "ts-jest",
  testEnvironment: "node",
  moduleFileExtensions: ["js", "json", "mts", "ts", "tsx", "mjs"],
  transform: {
    "^.+\\.mts$": "ts-jest",
  },
  moduleDirectories: ["node_modules", "<rootDir>/"],
  moduleNameMapper: {
    "^axios/$": "axios/dist/node/axios.cjs",
  },
  resetMocks: true,
  clearMocks: true,
  testMatch: ["**/__test__/**/*.test.(ts|js)"],
  transformIgnorePatterns: ["<rootDir>/node_modules/(?!lodash-es)"],
};

export default config;

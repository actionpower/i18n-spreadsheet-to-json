import type { Config } from "jest";

const config: Config = {
  verbose: true,
  preset: "ts-jest",
  testEnvironment: "node",
  moduleFileExtensions: ["js", "json", "mts", "ts", "tsx", "mjs"],
  transform: { "^.+\\.mts$": "ts-jest" },
  transformIgnorePatterns: ["node_modules/(?!(lodash-es)/)"],
  moduleDirectories: ["node_modules", "<rootDir>/"],
  moduleNameMapper: {
    "^axios/$": "axios/dist/node/axios.cjs",
    "^lodash-es/(.*)$": "lodash/$1",
  },
  resetMocks: true,
  clearMocks: true,
  testMatch: ["**/__test__/**/*.test.(ts|js)"],
};

export default config;

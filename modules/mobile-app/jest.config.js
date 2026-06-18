/** @type {import('jest').Config} */
module.exports = {
  preset: "ts-jest",
  testEnvironment: "node",
  testMatch: ["**/__tests__/**/*.test.ts"],
  moduleNameMapper: {
    "@react-native-async-storage/async-storage": "<rootDir>/__mocks__/asyncStorage.ts",
  },
  transform: {
    "^.+\\.tsx?$": [
      "ts-jest",
      {
        tsconfig: {
          module: "commonjs",
          esModuleInterop: true,
          allowSyntheticDefaultImports: true,
          types: ["jest", "node"],
        },
      },
    ],
  },
  setupFiles: ["<rootDir>/__mocks__/env.ts"],
};

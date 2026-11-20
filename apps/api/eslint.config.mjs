import { baseConfig } from "@origo/config/eslint/base";

export default [
  ...baseConfig,
  {
    rules: {
      // Nest's DI needs real (value) imports for constructor parameter types.
      "@typescript-eslint/consistent-type-imports": "off",
      "@typescript-eslint/no-extraneous-class": "off",
    },
  },
];

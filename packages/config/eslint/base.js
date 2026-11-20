import js from "@eslint/js";
import tseslint from "typescript-eslint";

/** Shared lint rules for every TypeScript package in the repo. */
export const baseConfig = tseslint.config(
  { ignores: ["dist/**", ".next/**", "node_modules/**", "**/*.config.*"] },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    rules: {
      "@typescript-eslint/no-explicit-any": "error",
      "@typescript-eslint/consistent-type-imports": ["error", { fixStyle: "inline-type-imports" }],
      "@typescript-eslint/no-unused-vars": ["error", { argsIgnorePattern: "^_", varsIgnorePattern: "^_" }],
      "func-style": ["error", "expression"],
      "no-console": "error",
      eqeqeq: ["error", "always"],
    },
  },
);

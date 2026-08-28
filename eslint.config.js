import js from "@eslint/js";
import globals from "globals";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";
import tseslint from "typescript-eslint";
import eslintConfigPrettier from "eslint-config-prettier/flat";

// Lint policy:
//
// 1. Dist artifacts are ignored.
// 2. Generated / scaffold code under `src/components/ui/`, the vly
//    toolbar (`vly-toolbar-readonly.tsx`), and Firebase Functions
//    source under `functions/` is excluded from the strict react-hooks
//    and react-refresh rules because (a) we don't own that code and
//    shouldn't rewrite it just to pass lint, and (b) it is a known
//    source of false positives from the strict purity rules. Hand-
//    written application code is linted with the full set of rules.
const STRICT_EXCLUDES = [
  "src/components/ui/**",
  "vly-toolbar-readonly.tsx",
  "functions/**",
];

export default tseslint.config(
  { ignores: ["dist", "src/convex/_generated/**"] },
  {
    extends: [
      js.configs.recommended,
      ...tseslint.configs.recommended,
      eslintConfigPrettier,
    ],
    files: ["**/*.{ts,tsx}"],
    ignores: STRICT_EXCLUDES,
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
    },
    plugins: {
      "react-hooks": reactHooks,
      "react-refresh": reactRefresh,
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      "react-refresh/only-export-components": [
        "warn",
        { allowConstantExport: true },
      ],
    },
  },
  // Vendor / generated files: type-check and catch real bugs but do
  // not enforce the strict react-hooks purity / fast-refresh rules.
  {
    files: STRICT_EXCLUDES,
    extends: [
      js.configs.recommended,
      ...tseslint.configs.recommended,
      eslintConfigPrettier,
    ],
    plugins: {
      "react-hooks": reactHooks,
    },
    languageOptions: {
      ecmaVersion: 2020,
      globals: {
        ...globals.browser,
        ...globals.node,
      },
    },
    rules: {
      "react-hooks/rules-of-hooks": "error",
      "react-hooks/exhaustive-deps": "warn",
    },
  },
);

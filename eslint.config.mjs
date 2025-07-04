import { defineConfig, globalIgnores } from "eslint/config";
import jest from "eslint-plugin-jest";
import tsEslint from "@typescript-eslint/eslint-plugin";
import globals from "globals";
import tsParser from "@typescript-eslint/parser";
import path from "node:path";
import { fileURLToPath } from "node:url";
import eslint from "@eslint/js";
import { FlatCompat } from "@eslint/eslintrc";
import github from "eslint-plugin-github";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const compat = new FlatCompat({
    baseDirectory: __dirname,
    recommendedConfig: eslint.configs.recommended,
    allConfig: eslint.configs.all
});

export default defineConfig([globalIgnores([
    "!**/.*",
    "**/node_modules/.*",
    "**/dist/.*",
    "**/coverage/.*",
    "**/*.json",
    "**/lib/",
    "**/dist/",
    "**/node_modules/",
    "**/eslint.config.mjs",
]), {
    extends: compat.extends(
        "eslint:recommended",
        "plugin:@typescript-eslint/eslint-recommended",
        "plugin:@typescript-eslint/recommended",
        "plugin:jest/recommended",
        "plugin:prettier/recommended",
    ),

    plugins: {
        jest,
        "@typescript-eslint": tsEslint,
        "eslint-plugin-github": github,
    },

    languageOptions: {
        globals: {
            ...globals.node,
            ...globals.jest,
            Atomics: "readonly",
            SharedArrayBuffer: "readonly",
        },

        parser: tsParser,
        ecmaVersion: 2023,
        sourceType: "module",

        parserOptions: {
            project: ["./__tests__/tsconfig.json", "./tsconfig.json"],
        },
    },

    rules: {
        camelcase: "off",
        "eslint-comments/no-use": "off",
        "eslint-comments/no-unused-disable": "off",
        "i18n-text/no-en": "off",
        "import/no-namespace": "off",
        "no-console": "off",
        "no-unused-vars": "off",
        "prettier/prettier": "error",
        semi: "off",
        "@typescript-eslint/array-type": "error",
        "@typescript-eslint/await-thenable": "error",
        "@typescript-eslint/ban-ts-comment": "error",
        "@typescript-eslint/consistent-type-assertions": "error",
        "@typescript-eslint/explicit-member-accessibility": ["error", {
            accessibility: "no-public",
        }],
        "@typescript-eslint/explicit-function-return-type": ["error", {
            allowExpressions: true,
        }],
        "@typescript-eslint/no-array-constructor": "error",
        "@typescript-eslint/no-empty-interface": "error",
        "@typescript-eslint/no-explicit-any": "error",
        "@typescript-eslint/no-extraneous-class": "error",
        "@typescript-eslint/no-for-in-array": "error",
        "@typescript-eslint/no-inferrable-types": "error",
        "@typescript-eslint/no-misused-new": "error",
        "@typescript-eslint/no-namespace": "error",
        "@typescript-eslint/no-non-null-assertion": "warn",
        "@typescript-eslint/no-require-imports": "error",
        "@typescript-eslint/no-unnecessary-qualifier": "error",
        "@typescript-eslint/no-unnecessary-type-assertion": "error",
        "@typescript-eslint/no-unused-vars": "error",
        "@typescript-eslint/no-useless-constructor": "error",
        "@typescript-eslint/no-var-requires": "error",
        "@typescript-eslint/prefer-for-of": "warn",
        "@typescript-eslint/prefer-function-type": "warn",
        "@typescript-eslint/prefer-includes": "error",
        "@typescript-eslint/prefer-string-starts-ends-with": "error",
        "@typescript-eslint/promise-function-async": "error",
        "@typescript-eslint/require-array-sort-compare": "error",
        "@typescript-eslint/restrict-plus-operands": "error",
        "@typescript-eslint/space-before-function-paren": "off",
        "@typescript-eslint/unbound-method": "error",
        'eslint-plugin-github/array-foreach': 'error',
        'eslint-plugin-github/async-preventdefault': 'warn',
        'eslint-plugin-github/no-then': 'error',
        'eslint-plugin-github/no-blur': 'error',

    },
}]);
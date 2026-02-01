import { defineConfig } from "eslint/config";
import js from "@eslint/js";
import ts from "typescript-eslint";
import tseslint from "typescript-eslint";
import stylistic from "@stylistic/eslint-plugin";
import globals from "globals";
import reactPlugin from "eslint-plugin-react";
import { globalIgnores } from "@eslint/config-helpers";
import css from "@eslint/css";

export default defineConfig([
  js.configs.recommended,
  ...tseslint.configs.recommended,
  ...ts.configs.stylistic,
  stylistic.configs.customize({}),
  { files: [ "**/*.css" ], plugins: { css }, language: "css/css", extends: [ "css/recommended" ] },
  {
    files: [ "**/*.{js,mjs,cjs,ts,mts,cts,jsx,tsx}" ],
    settings: {
      react: {
        version: "detect"
      }
    },
    ...reactPlugin.configs.flat.recommended,
    languageOptions: {
      globals: globals.node,
      parser: ts.parser,
      parserOptions: {
        ecmaFeatures: {
          jsx: true,
        },
      },
    },
    rules: {
      // See https://eslint.org/docs/latest/rules
      "eqeqeq": [ "warn", "smart" ],
      "no-var": [ "warn" ],
      "object-shorthand": [ "warn", "always", { avoidExplicitReturnArrows: true } ],
      "@typescript-eslint/one-var": [ "off" ],
      "prefer-arrow-callback": [ "warn" ],
      "@typescript-eslint/no-unused-vars": [ "warn", { argsIgnorePattern: "^_" } ],

      // See https://eslint.style/rules
      "@stylistic/array-bracket-newline": [ "warn", "consistent" ],
      "@stylistic/array-bracket-spacing": [ "warn", "always", { arraysInArrays: false } ],
      "@stylistic/arrow-parens": [ "warn", "as-needed" ],
      "@stylistic/arrow-spacing": "warn",
      "@stylistic/block-spacing": "warn",
      "@stylistic/brace-style": [ "warn", "1tbs", { allowSingleLine: true } ],
      "@stylistic/comma-dangle": "off",
      "@stylistic/comma-spacing": [ "warn", { before: false, after: true } ],
      "@stylistic/computed-property-spacing": "off",
      "@stylistic/curly-newline": "off",
      "@stylistic/dot-location": [ "warn", "property" ],
      "@stylistic/eol-last": [ "warn", "always" ],
      "@stylistic/function-call-argument-newline": "off",
      "@stylistic/generator-star-spacing": "off",
      "@stylistic/implicit-arrow-linebreak": "off",
      "@stylistic/indent": [ "warn", 2 ],
      "@stylistic/indent-binary-ops": [ "warn", 2 ],
      "@stylistic/jsx-child-element-spacing": "warn",
      "@stylistic/jsx-closing-bracket-location": [ "warn", "line-aligned" ],
      "@stylistic/jsx-closing-tag-location": [ "warn", "line-aligned" ],
      "@stylistic/jsx-curly-brace-presence": "off",
      "@stylistic/jsx-curly-newline": "warn",
      "@stylistic/jsx-curly-spacing": "off",
      "@stylistic/jsx-equals-spacing": [ "warn", "always" ],
      "@stylistic/jsx-first-prop-new-line": "off",
      "@stylistic/jsx-function-call-newline": "off",
      "@stylistic/jsx-indent-props": [ "warn", 2 ],
      "@stylistic/jsx-newline": [ "warn", { prevent: true } ],
      "@stylistic/jsx-one-expression-per-line": "off",
      "@stylistic/jsx-pascal-case": [ "warn", { allowNamespace: true } ],
      "@stylistic/jsx-quotes": [ "warn", "prefer-double" ],
      "@stylistic/jsx-tag-spacing": [ "warn", { beforeSelfClosing: "always" } ],
      "@stylistic/jsx-wrap-multilines": [ "warn", {
        declaration: "parens-new-line",
        assignment: "parens-new-line",
        return: "parens-new-line",
        arrow: "parens-new-line",
        condition: "parens-new-line",
        logical: "parens-new-line",
        prop: "parens-new-line",
        propertyValue: "parens-new-line"
      } ],
      "@stylistic/key-spacing": [ "warn", { mode: "minimum" } ],
      "@stylistic/keyword-spacing": "warn",
      "@stylistic/line-comment-position": "off",
      "@stylistic/linebreak-style": [ "warn", "unix" ],
      "@stylistic/lines-around-comment": "off",
      "@stylistic/lines-between-class-members": "off",
      "@stylistic/max-len": "off",
      "@stylistic/max-statements-per-line": "off",
      "@stylistic/member-delimiter-style": "warn",
      "@stylistic/multiline-comment-style": "off",
      "@stylistic/multiline-ternary": [ "warn", "always-multiline" ],
      "@stylistic/new-parens": "warn",
      "@stylistic/newline-per-chained-call": [ "warn", { ignoreChainWithDepth: 2 } ],
      "@stylistic/no-confusing-arrow": "off",
      "@stylistic/no-extra-parens": "off",
      "@stylistic/no-extra-semi": "warn",
      "@stylistic/no-floating-decimal": "warn",
      "@stylistic/no-mixed-operators": "warn",
      "@stylistic/no-mixed-spaces-and-tabs": "warn",
      "@stylistic/no-multi-spaces": "warn",
      "@stylistic/no-multiple-empty-lines": [ "warn", { max: 2, maxEOF: 0 } ],
      "@stylistic/no-tabs": "warn",
      "@stylistic/no-trailing-spaces": "warn",
      "@stylistic/no-whitespace-before-property": "warn",
      "@stylistic/nonblock-statement-body-position": "off",
      "@stylistic/object-curly-newline": "off",
      "@stylistic/object-curly-spacing": [ "warn", "always" ],
      "@stylistic/object-property-newline": "off",
      "@stylistic/one-var-declaration-per-line": "off",
      "@stylistic/operator-linebreak": [ "warn", "after", { overrides: { "?": "before", ":": "before" } } ],
      "@stylistic/padded-blocks": "off",
      "@stylistic/padding-line-between-statements": "off",
      "@stylistic/quote-props": [ "warn", "consistent-as-needed" ],
      "@stylistic/quotes": [ "warn", "double" ],
      "@stylistic/semi": [ "warn", "always" ],
      "@stylistic/semi-spacing": "warn",
      "@stylistic/space-before-blocks": "warn",
      "@stylistic/space-before-function-paren": [ "warn", "never" ],
      "@stylistic/space-in-parens": [ "warn", "never" ],
      "@stylistic/space-infix-ops": "warn",
      "@stylistic/space-unary-ops": "warn",
      "@stylistic/spaced-comment": [ "warn", "always" ],
      "@stylistic/switch-colon-spacing": "warn",
      "@stylistic/template-curly-spacing": "warn",
      "@stylistic/template-tag-spacing": "off",
      "@stylistic/type-annotation-spacing": "warn",
      "@stylistic/type-generic-spacing": "off",
      "@stylistic/type-named-tuple-spacing": [ "warn" ],
      "@stylistic/wrap-iife": [ "warn", "outside" ],
      "@stylistic/wrap-regex": "off",
      "@stylistic/yield-star-spacing": "warn",
    }
  },
  globalIgnores([
    "**/node_modules",
    "**/dist",
  ]),
]);

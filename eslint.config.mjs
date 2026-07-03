import globals from "globals";
import pluginJs from "@eslint/js";

export default [
  pluginJs.configs.recommended,
  {
    rules: {
      semi: ["error", "always"],
      quotes: ["error", "double"],
      eqeqeq: ["error", "always"],
      "no-var": "error",
      "prefer-const": "error",
    },
  },
  {
    // Content scripts are classic scripts sharing one isolated world, so
    // functions defined in one file are globals in the files loaded after it
    // (see the "js" arrays in manifest.json).
    files: ["src/content/**/*.js"],
    languageOptions: {
      sourceType: "script",
      globals: {
        ...globals.browser,
        ...globals.webextensions,
        showNestleWarning: "readonly",
        matchBrand: "readonly",
        findNestleBrand: "readonly",
        scanAndWarn: "readonly",
        findFirstElement: "readonly",
        getTextByIds: "readonly",
        getHeadingText: "readonly",
      },
    },
    rules: {
      // The defining file necessarily "redeclares" the shared globals above.
      "no-redeclare": ["error", { builtinGlobals: false }],
    },
  },
  {
    // matcher.js exposes its functions to Node for unit testing.
    files: ["src/content/matcher.js"],
    languageOptions: {
      globals: {
        module: "readonly",
      },
    },
  },
  {
    files: ["tests/**/*.js"],
    languageOptions: {
      globals: {
        ...globals.node,
      },
    },
  },
];

import globals from "globals";
import pluginJs from "@eslint/js";


export default [
  {
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.webextensions,
        showNestleWarning: 'readonly'
      }
    },
    rules: {
      semi: ["error", "always"],
      quotes: ["error", "double"],
    },
  },
  pluginJs.configs.recommended,
];
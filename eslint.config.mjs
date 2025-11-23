// eslint.config.mjs
import js from "@eslint/js"
import globals from "globals"

export default [
  {
    // .eslintignore ka kaam yahi se hoga
    ignores: ["node_modules/**", "dist/**", "build/**"],
  },

  {
    ...js.configs.recommended,
    languageOptions: {
      ...js.configs.recommended.languageOptions,
      ecmaVersion: 2022,        // top-level await support
      sourceType: "module",     // kyunki tu import/export use kar raha hai
      globals: {
        // jo bhi already hai + node ke globals (process, console, __dirname, etc.)
        ...js.configs.recommended.languageOptions?.globals,
        ...globals.node,
      },
    },
    rules: {
      ...js.configs.recommended.rules,
      "no-console": "off", // backend me console allowed
      "no-unused-vars": ["warn", { argsIgnorePattern: "^_" }],
    },
  },
]

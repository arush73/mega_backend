// .eslintrc.cjs
module.exports = {
  root: true,
  env: {
    node: true,
    es2021: true,
  },
  parserOptions: {
    ecmaVersion: 2021,
    sourceType: "module", // tu import/export use kar raha hai
  },
  extends: [
    "eslint:recommended",
    "plugin:import/recommended",
    "plugin:promise/recommended",
    "plugin:node/recommended",
    "prettier", // ALWAYS last
  ],
  rules: {
    // yahan apni marzi ke rules:
    "no-unused-vars": ["warn", { argsIgnorePattern: "^_" }],
    "no-console": "off", // backend me console.log allowed hai
    "import/order": [
      "warn",
      {
        groups: ["builtin", "external", "internal", "parent", "sibling", "index"],
        "newlines-between": "always",
      },
    ],
  },
  settings: {
    // agar tu src/ se import karta hai relative ke bina
  },
};

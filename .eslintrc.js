module.exports = {
  env: {
    browser: true,
    es2021: true,
    node: true,
  },
  extends: ["airbnb-base"],
  parserOptions: {
    ecmaVersion: "latest",
    sourceType: "module",
  },
  rules: {
    "no-console": "off",
    "comma-dangle": ["error", "only-multiline"],
    "max-len": ["error", { code: 120, ignoreUrls: true, ignoreStrings: true }],
    "camelcase": "off",
    "no-plusplus": "off",
    "no-underscore-dangle": ["error", { "allow": ["_json"] }],
    "radix": ["error", "always"],
    "no-unused-vars": ["error", { "argsIgnorePattern": "^_" }],
  },
};

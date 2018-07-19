module.exports = {
  root: true,
  env: {
    node: true
  },
  extends: ["plugin:vue/essential", "@vue/prettier"],
  rules: {
    "no-console": "off",
    "no-debugger": "off",
    "vue/require-default-prop": "error",
    "vue/html-quotes": ["error", "double"],
    "vue/order-in-components": "error"
  },
  parserOptions: {
    parser: "babel-eslint"
  }
};

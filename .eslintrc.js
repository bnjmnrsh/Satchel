module.exports = {
  env: {
    browser: true,
    es2022: true
  },
  extends: [
    'plugin:import/recommended',
    'plugin:promise/recommended',
    'prettier-standard'
  ],
  _parserOptions: {
    sourceType: 'module'
  },
  get parserOptions() {
    return this._parserOptions
  },
  set parserOptions(value) {
    this._parserOptions = value
  },
  plugins: ['json-format', 'import', 'promise'],
  rules: {
    'import/named': 2,
    'import/namespace': 2,
    'import/default': 2,
    'import/export': 2
  },
  settings: {
    'json/sort-package-json': 'standard',
    'json/ignore-files': ['**/package-lock.json'],
    'json/json-with-comments-files': ['**/tsconfig.json', '.vscode/**']
  }
}

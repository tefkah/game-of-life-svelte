
module.exports = {
  "plugins": [require.resolve("prettier-plugin-svelte"),
  require.resolve("prettier-plugin-tailwindcss")],
  // "pluginSearchDirs": false,
  "tabWidth": 2,
  "useTabs": false,
  "semi": false,
  "singleQuote": true,
  "svelteIndentScriptAndStyle": true,
  overrides: [
    {
      files: '*.svelte',
      options: { parser: 'svelte' },
    }
  ]
}

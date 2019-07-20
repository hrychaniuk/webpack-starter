module.exports = {
  plugins: {
    'postcss-alias': {},
    'postcss-preset-env': {
      stage: 0,
      importFrom: [
        './variables.config.js',
      ]
    }
  }
}

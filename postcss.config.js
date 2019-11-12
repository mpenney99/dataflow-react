/* eslint-disable */

const purgecss = require('@fullhuman/postcss-purgecss')({
    content: [
        './src/**/*.ts',
        './src/**/*.tsx',
    ],
    defaultExtractor: content => content.match(/[\w-/:]+(?<!:)/g) || []
})


module.exports = {
    plugins: [
      require('tailwindcss'),
      require('autoprefixer'),
      ...process.env.NODE_ENV === 'production'
        ? [purgecss] : []
    ]
}
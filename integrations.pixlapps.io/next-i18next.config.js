/** @type {import('next-i18next').UserConfig} */

// @ts-ignore
const path = require('path');

module.exports = {
  i18n: {
    defaultLocale: 'en',
    locales: ['en'],
  },
  // @ts-ignore
  localePath: path.resolve('./public/locales'),
  reloadOnPrerender: process.env.NODE_ENV === 'development',
};

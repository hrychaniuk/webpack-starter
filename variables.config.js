const toKebab = require("./helpers/functions/to-kebab");
const breakpoints = require("./webpack/breakpoints");
const mbf = breakpoints._MOBILE_FIRST;
const unit = Number(breakpoints._UNIT) || 'px';

module.exports = {
    breakpoints,
    properties: {},
    /** */
    defaultCustomMedia: {
      '--print': '(print)'
    },
    defaultCustomProperties: {
      '--color': 'pink',
    },
    defaultCustomSelectors: {
      ':--heading': 'h1, h2, h3',
      ':--inline': 'p, li'
    },
    defaultEnvironmentVariables: {
      '--branding-padding': '20px'
    },
    /*
    ** computing
    */
    get customMedia() {
      const ins = this;
      /*
      **  computed based on { this.breakpoints }
      */
      const mediaQueries = Object.entries(ins.breakpoints)
        .reduce((accum, [name, value]) => {
            if(typeof value !== 'number') return accum;

            value = value + unit;
            /*
            **  old named (max-width)
            */
            accum[`--${toKebab(name) + (() => mbf ? '-max' : '')()}`] = `(width <= ${value})`;
            /*
            **  old named (min-width)
            */
            accum[`--${toKebab(name) + (() => mbf ? '' : '-min')()}`] = `(width > ${value})`;
            return accum;
        }, {});
      return Object.assign(ins.defaultCustomMedia, mediaQueries);
    },
    get customProperties() {
      const ins = this;
      const cp = Object.entries(ins.properties)
        .reduce((accum, [name, value]) => {
            accum[`--${toKebab(name)}`] = value;
            return accum;
        }, {}) || {};
      return Object.assign(ins.defaultCustomProperties, cp);
    },
    get customSelectors() {
      return this.defaultCustomSelectors;
    },
    get environmentVariables() {
      return this.defaultEnvironmentVariables;
    },
  }

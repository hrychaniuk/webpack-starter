const isNode = new Function("try {return this===global;}catch(e){return false;}")();

const fs = require("fs");
const breakpointrc = isNode ? fs.readFileSync("./.breakpointrc", 'utf-8') : '';
const breakpoints = !isNode ? process.env.MEDIA : breakpointrc
  .toString()
  .split("\n")
  .filter(Boolean)
  .reduce((acc, i) => {
    let [name, value] = i.trim().split("=");
    if(value === "true") value = true;
    if(value === "false") value = false;

    if(typeof value === 'string' && String(parseInt(value)).length === value.length) acc[name] = parseInt(value);
    else acc[name] = value;
    return acc;
  }, {});

module.exports = breakpoints;

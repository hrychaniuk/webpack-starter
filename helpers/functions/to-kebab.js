module.exports = function (string) {
  return string.replace(/([a-z])([A-Z])/g, "$1-$2")
               .replace(/\s+/g, '-')
               .replace('_', '-')
               .toLowerCase();
}

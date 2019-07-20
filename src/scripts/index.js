import '../styles/index.scss';
const variables = require("root::/variables.config.js");

document.addEventListener("DOMContentLoaded", function(event) {
  document.body.classList.add(Math.random() >= 0.5 ? "yes" : "no");
  console.log(variables, process.env.MEDIA.SM_PLUS);
});

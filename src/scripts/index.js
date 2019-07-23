import '../styles/index.scss';
import variables from "root::/variables.config.js";
import { Observer } from "help::/observer";

const ob = Observer.new`classes.infinity.callback`
        .collection('[data-callback]')
        .watch();

window.addEventListener("load", function(event) {
  document.body.classList.add(Math.random() >= 0.5 ? "yes" : "no");
});

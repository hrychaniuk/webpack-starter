import '../styles/index.scss';
import variables from "root::/variables.config.js";
import { Observer } from "help::/observer";

const callbackOb = Observer.callback;

callbackOb.cbs.create("deleteImage", e => {
  if(e.visible) console.log(e.name)
});

window.addEventListener("load", function(event) {
  document.body.classList.add(Math.random() >= 0.5 ? "yes" : "no");

  callbackOb
    .collection('[data-callback]')
    .watch();
});

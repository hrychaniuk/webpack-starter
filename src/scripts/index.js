import '../styles/index.scss';
import variables from "root::/variables.config.js";
import { Observer } from "help::/observer";


const observer = Observer.classes;
observer.cbs.create("hello", e => {
  // if(e.visible) alert(e)
});
observer.cbs.create("deleteImage", e => {
  // if(e.visible) alert(e)
});

console.log(observer);

window.addEventListener("load", function(event) {
  document.body.classList.add(Math.random() >= 0.5 ? "yes" : "no");

  observer
    .collection(document.querySelectorAll("[data-lazy]"))
    .collection(document.body.children)
    .watch();
});

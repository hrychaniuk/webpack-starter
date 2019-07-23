import '../styles/index.scss';
import variables from "root::/variables.config.js";
import { Observer } from "help::/observer";

Observer.create("my_observer", `classes.reverse`);
const observer = Observer.my_observer;

console.dir(Observer);

window.addEventListener("load", function(event) {
    observer.simple('[data-callback]');
    observer.collection('[data-lazy]');
    observer.watch();
});

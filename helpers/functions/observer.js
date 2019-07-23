const isNode = new Function("try {return this===global;}catch(e){return false;}")();

const sizes = {
  height: Math.max(document.documentElement.clientHeight, window.innerHeight || 0),
};

const once = function(fn, context) {
    var result;
    return function() {
        if (fn) {
            result = fn.apply(context || this, arguments);
            fn = null;
        }
        return result;
    };
}

const safeOptions = {
  enumerable: false,
  configurable: false,
  writable: false,
};

const errors = {
  CREATE_NOT_VALID_CALLED: "CREATE_NOT_VALID_CALLED",
  NOT_VALID_ARGUMENTS: "%arg IS_NOT_VALID_ARGUMENT",
  GLOBAL_ERROR: "ERROR_IN_INTERSECTION_OBSERVER",
  SSR_ERROR: "SSR_MODE_NOT_SUPPORT",
}

let DEFAULT_OBSERVER_PARAMS = `classes.callback.lazy`;

const defaultParams = {
  /*
  **  Nums
  */
  percentObserve: 0.15,
  threshold: 0.01,
  /*
  **  Bools
  */
  reverse: false,
  callbackMode: false,
  callbackOnce: false,
  setClassMode: false,
  lazyMode: false,
  /*
  **  Names
  */
  observeClass: "ob",
  observedClass: 'vis',
  dataAttrObserve: 'observe',
  dataAttrStartValue: '',
  dataAttrCompleteValue: 'vis',
  imgLoadClass: 'ob-load',
  imgWrapLoadClass: 'ob-load-wrap',
  imgLoadComplete: 'ob-load-c',
  imgWrapLoadComplete: 'ob-load-wrap-c',
};

class Observer {
  constructor(
    params = {},
  ) {
    let errorParams;
    if(isNode) throw new Error(errors.SSR_ERROR);

    const me = this;

    if(Object.keys(params).some(i => {
      errorParams = i;
      return !Object.keys(defaultParams).includes(i);
    })) throw new Error(errors.NOT_VALID_ARGUMENTS.replace('%arg', errorParams));
    /*
    ** observe settings
    */

    this.params = Object.assign({}, defaultParams, params);
    this.items = [];
    this.ob = null;
    this.init = false;
    this.config = {
      threshold: this.params.threshold,
      rootMargin: `-${Math.floor(sizes.height * this.params.percentObserve)}px`,
    };
    /*
    ** functional settings
    */
    this.cbs = {};

    Object.defineProperty(this.cbs, 'create', Object.assign(safeOptions, {
      value(name, callback) {
        if(!name || typeof callback !== 'function') {
          throw new Error(errors.CREATE_NOT_VALID_CALLED);
        }
        me.params.callbackOnce ?
          this[name] = once(callback) :
          this[name] = callback;
        return {
          delete: () => delete this[name]
        };
      }
    }));
  }

  disconnect() {
    this.ob ? this.ob.disconnect() : this.ob = null;
    this.cbs = {};
    this.items = [];
    this.init = false;

    return this;
  }

  watch(callback) {
    const me = this;
    const config = this.config;

    return new Promise((resolve, reject) => {
      try {
        // create the observer
        me.ob = new IntersectionObserver((entries, ob) => {
          entries.forEach(entry => processingObserved.call(me, entry, ob));
          me.init = true;
          setTimeout(() => resolve(me));
        }, config);

        me.items.forEach(item => {
          if(me.params.setClassMode) {
            item.dataset[me.params.dataAttrObserve] = me.params.dataAttrStartValue;
            item.classList.add(me.params.observeClass);
          }

          if(me.params.lazyMode) {
            item.classList.add(me.params.imgLoadClass);
            item.parentElement.classList.add(me.params.imgWrapLoadClass);
          }

          me.ob.observe(item);
        });

        if(typeof callback === "function") callback(me);

      } catch (e) {
        reject(errors.GLOBAL_ERROR);
        console.error(e.message);
      }
    });
  }

  simple(ref) {
    if(typeof ref === "string") {
        ref = document.querySelector(ref);
    }

    this.items.push(ref);
    return this;
  }

  collection(refs) {
    if(typeof refs === "string") {
        refs = document.querySelectorAll(refs);
    }

    this.items = this.items.concat(Array.from(refs));
    return this;
  }

  /*
  **
  ** Creating custom observers
  */
  
  static changeDefault(string = DEFAULT_OBSERVER_PARAMS) {
    DEFAULT_OBSERVER_PARAMS = string;
    return Observer;
  }

  static create(string, params = {}) {
    if(typeof string === "string" && string) {
      Object.defineProperty(Observer, string, {
        get: function() {
          if(typeof params === "string" && params) {
            return Observer.new`${params}`;
          }
          return new Observer(params);
        },
      });
    }
    return Observer;
  }

  static get default() {
    return Observer.new`${DEFAULT_OBSERVER_PARAMS}`;
  }

  static get relatives() {
    return {
      "zero": [ "percentObserve", 0 ],
      "reverse": [ "reverse", true ],
      "callback": [ "callbackMode", true ],
      "classes": [ "setClassMode", true ],
      "lazy": [ "lazyMode", true ],
      "once": [ "callbackOnce", true ],
    };
  }

  static new(strings, ...values) {
    let string = "";
    for(let i = 0; i < values.length; i++) {
      string += strings[i];
      string += values[i];
    }
    string += strings[strings.length - 1];

    let errorParams;
    const paramsForGet = string.trim().split(".").filter(Boolean);

    if(Object.values(paramsForGet).some(i => {
      errorParams = i;
      return !Object.keys(Observer.relatives).includes(i);
    })) throw new Error(errors.NOT_VALID_ARGUMENTS.replace('%arg', errorParams));

    const settingParams = paramsForGet.reduce((acc, item) => {
      const [name, value] = Observer.relatives[item];
      acc[name] = value;
      return acc;
    }, {});

    return new Observer(settingParams);
  }
}

Object.keys(Observer.relatives).forEach(i => {
    Observer.create(i, i);
});


function processingObserved (entry, ob) {
  const me = this;
  const target = entry.target;

  const isCallback = Boolean(target.dataset.callback && /*me.init &&*/
    me.cbs[target.dataset.callback] && me.params.callbackMode);

  const callbackArg = isCallback ? {
    target,
    name: target.dataset.callback
  } : {};

  if (entry.intersectionRatio > me.params.threshold) {
    /*
    **  There are visible here
    */
    if(me.params.lazyMode) {
      (() => {
        if(target.dataset.loaded === "1") return;

        target.src = target.dataset.lazy;
        target.addEventListener("load", function() {
          this.classList.add(me.params.imgLoadComplete);
          this.dataset.loaded = "1";
          delete this.dataset.lazy;
          this.parentElement.classList.add(me.params.imgWrapLoadComplete);
        }, { once: true });
      })();
    }

    if(me.params.setClassMode) {
      target.classList.add(me.params.observedClass);
      target.dataset[me.params.dataAttrObserve] = me.params.dataAttrCompleteValue;
    }

    if (isCallback) {
      me.cbs[target.dataset.callback](Object.assign(callbackArg, {
        visible: true
      }));
    }
  }
  else {
    if (me.params.reverse) {

      if(me.params.setClassMode) {
        target.classList.remove(me.params.observedClass);
        target.dataset[me.params.dataAttrObserve] = me.params.dataAttrStartValue;
      }

      if (isCallback) {
        me.cbs[target.dataset.callback](Object.assign(callbackArg, {
          visible: false
        }));
      }
    } else {
      if (me.init && ob) {
        ob.unobserve(target);
      }
    }
  }
}

export { Observer };
const defaultObserver = Observer.default;
export default defaultObserver;

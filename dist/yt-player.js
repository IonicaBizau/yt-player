"use strict";
var YTPlayer = (() => {
  var __getOwnPropNames = Object.getOwnPropertyNames;
  var __commonJS = (cb, mod) => function __require() {
    return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
  };

  // node_modules/cb-buffer/lib/index.js
  var require_lib = __commonJS({
    "node_modules/cb-buffer/lib/index.js"(exports, module) {
      "use strict";
      var _createClass = /* @__PURE__ */ (function() {
        function defineProperties(target, props) {
          for (var i = 0; i < props.length; i++) {
            var descriptor = props[i];
            descriptor.enumerable = descriptor.enumerable || false;
            descriptor.configurable = true;
            if ("value" in descriptor) descriptor.writable = true;
            Object.defineProperty(target, descriptor.key, descriptor);
          }
        }
        return function(Constructor, protoProps, staticProps) {
          if (protoProps) defineProperties(Constructor.prototype, protoProps);
          if (staticProps) defineProperties(Constructor, staticProps);
          return Constructor;
        };
      })();
      function _classCallCheck(instance, Constructor) {
        if (!(instance instanceof Constructor)) {
          throw new TypeError("Cannot call a class as a function");
        }
      }
      module.exports = (function() {
        function CbBuffer() {
          _classCallCheck(this, CbBuffer);
          this.buffer = [];
          this.undone();
        }
        _createClass(CbBuffer, [{
          key: "check",
          value: function check(fn) {
            if (this.is_done) {
              this.call(fn);
              return true;
            }
            this.buffer.push(fn);
            if (this.waiting) {
              return true;
            } else {
              this.waiting = true;
            }
            return false;
          }
          /**
           * call
           * Calls the provided function with the callback arguments.
           *
           * @name call
           * @function
           * @param {Function} fn The function to call.
           */
        }, {
          key: "call",
          value: function call(fn) {
            fn.apply(this, this.args);
          }
          /**
           * clear
           * CLears the callback array.
           *
           * @name clear
           * @function
           */
        }, {
          key: "clear",
          value: function clear() {
            this.buffer = [];
          }
          /**
           * undone
           * Resets the internal data.
           *
           * @name undone
           * @function
           */
        }, {
          key: "undone",
          value: function undone() {
            this.waiting = false;
            this.is_done = false;
            this.args = [];
          }
          /**
           * done
           * Calls all the functions from the buffer.
           *
           * @name done
           * @function
           */
        }, {
          key: "done",
          value: function done() {
            var _this = this;
            this.is_done = true;
            this.args = arguments;
            this.buffer.forEach(function(fn) {
              return _this.call(fn);
            });
            this.clear();
          }
        }]);
        return CbBuffer;
      })();
    }
  });

  // node_modules/iterate-object/lib/index.js
  var require_lib2 = __commonJS({
    "node_modules/iterate-object/lib/index.js"(exports, module) {
      "use strict";
      var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function(obj) {
        return typeof obj;
      } : function(obj) {
        return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj;
      };
      function iterateObject(obj, fn) {
        var i = 0, keys = [];
        if (Array.isArray(obj)) {
          for (; i < obj.length; ++i) {
            if (fn(obj[i], i, obj) === false) {
              break;
            }
          }
        } else if ((typeof obj === "undefined" ? "undefined" : _typeof(obj)) === "object" && obj !== null) {
          keys = Object.keys(obj);
          for (; i < keys.length; ++i) {
            if (fn(obj[keys[i]], keys[i], obj) === false) {
              break;
            }
          }
        }
      }
      module.exports = iterateObject;
    }
  });

  // node_modules/lc-first/lib/index.js
  var require_lib3 = __commonJS({
    "node_modules/lc-first/lib/index.js"(exports, module) {
      "use strict";
      module.exports = function lcFirst(input) {
        if (!input || !input.length || typeof input !== "string") {
          return "";
        }
        return input.charAt(0).toLowerCase() + input.slice(1);
      };
    }
  });

  // node_modules/class-methods/lib/index.js
  var require_lib4 = __commonJS({
    "node_modules/class-methods/lib/index.js"(exports, module) {
      "use strict";
      var IGNORE_STATIC = {
        name: true,
        length: true,
        prototype: true
      };
      function getStaticMethods(input) {
        const names = Object.getOwnPropertyNames(input);
        const output = [];
        for (let i = 0; i < names.length; ++i) {
          const name = names[i];
          if (!IGNORE_STATIC[name] && typeof input[name] === "function") {
            output.push(name);
          }
        }
        return output;
      }
      module.exports = function classMethods(input, options) {
        options = {
          deep: true,
          includeStatic: false,
          ...options
        };
        const deep = options.deep !== false;
        const includeStatic = options.includeStatic === true;
        const methods = [];
        for (let current = input; current; current = deep ? Object.getPrototypeOf(current) : null) {
          if (current.prototype) {
            const ownMethods = Object.getOwnPropertyNames(current.prototype);
            for (let i = 0; i < ownMethods.length; ++i) {
              const name = ownMethods[i];
              if (name !== "constructor") {
                methods.push(name);
              }
            }
          }
          if (includeStatic && current.name) {
            const ownStaticMethods = getStaticMethods(current);
            for (let i = 0; i < ownStaticMethods.length; ++i) {
              methods.push(ownStaticMethods[i]);
            }
          }
        }
        return methods;
      };
    }
  });

  // lib/emitter.js
  var require_emitter = __commonJS({
    "lib/emitter.js"(exports, module) {
      "use strict";
      var Emitter = class {
        constructor() {
          this._events = /* @__PURE__ */ Object.create(null);
        }
        on(event, listener) {
          if (typeof listener !== "function") {
            throw new TypeError("Listener must be a function.");
          }
          ;
          (this._events[event] = this._events[event] || []).push(listener);
          return this;
        }
        once(event, listener) {
          if (typeof listener !== "function") {
            throw new TypeError("Listener must be a function.");
          }
          const onceListener = (...args) => {
            this.removeListener(event, onceListener);
            listener.apply(this, args);
          };
          onceListener._originalListener = listener;
          return this.on(event, onceListener);
        }
        emit(event, ...args) {
          const listeners = this._events[event];
          if (!listeners || !listeners.length) {
            if (event === "error") {
              const err = args[0];
              console.error("Unhandled error event:", err instanceof Error ? err : new Error(err || "Unhandled error event."));
            }
            return false;
          }
          listeners.slice().forEach((listener) => listener.apply(this, args));
          return true;
        }
        removeListener(event, listener) {
          const listeners = this._events[event];
          if (!listeners || !listeners.length) {
            return this;
          }
          this._events[event] = listeners.filter((currentListener) => {
            return currentListener !== listener && currentListener._originalListener !== listener;
          });
          if (!this._events[event].length) {
            delete this._events[event];
          }
          return this;
        }
      };
      module.exports = Emitter;
    }
  });

  // lib/constants.js
  var require_constants = __commonJS({
    "lib/constants.js"(exports, module) {
      "use strict";
      var isAndroidOrIOS = typeof navigator !== "undefined" && /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
      var STATES = {
        "-1": "UNSTARTED",
        "0": "ENDED",
        "1": "PLAYING",
        "2": "PAUSED",
        "3": "BUFFERING",
        "5": "CUED"
      };
      var YT_EVENTS = [
        ["onReady", "ready"],
        ["onStateChange", "stateChange"],
        ["onPlaybackQualityChange", "playbackQualityChange"],
        ["onPlaybackRateChange", "playbackRateChange"],
        ["onError", "error"],
        ["onApiChange", "apiChange"]
      ];
      var YT_FUNCS = "cueVideoById loadVideoById cueVideoByUrl loadVideoByUrl pauseVideo stopVideo clearVideo getVideoBytesLoaded getVideoBytesTotal getVideoLoadedFraction getVideoStartBytes cuePlaylist loadPlaylist nextVideo previousVideo playVideoAt setShuffle setLoop getPlaylist getPlaylistIndex getPlaylistId loadModule unloadModule setOption mute unMute isMuted setVolume getVolume seekTo getPlayerState getPlaybackRate setPlaybackRate getAvailablePlaybackRates getPlaybackQuality setPlaybackQuality getAvailableQualityLevels getCurrentTime getDuration removeEventListener addEventListener getVideoUrl getDebugText getVideoData addCueRange removeCueRange getApiInterface showVideoInfo hideVideoInfo getVideoEmbedCode getOptions getOption setSize getIframe".split(" ");
      module.exports = {
        isAndroidOrIOS,
        STATES,
        YT_EVENTS,
        YT_FUNCS
      };
    }
  });

  // lib/index.js
  var require_index = __commonJS({
    "lib/index.js"(exports, module) {
      var CbBuffer = require_lib();
      var iterateObject = require_lib2();
      var lcFirst = require_lib3();
      var classMethods = require_lib4();
      var Emitter = require_emitter();
      var { isAndroidOrIOS, STATES, YT_EVENTS, YT_FUNCS } = require_constants();
      var noop = () => {
      };
      var YTPlayer = module.exports = class YTPlayer2 extends Emitter {
        static _onIframeApiLoadError(err) {
          if (YTPlayer2._iframeApiError) {
            return;
          }
          YTPlayer2._iframeApiError = err;
          YTPlayer2.loading_state = "error";
          YTPlayer2.ytReadyBuff.done(err);
        }
        /**
         * Extract the YouTube video ID from a URL.
         *
         * @static
         * @param {string} url The YouTube video URL.
         * @returns {string|boolean} The video ID if valid (11 characters), false otherwise.
         */
        static getIdFromURL(url) {
          let regExp = /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#\&\?]*).*/;
          let match = url.match(regExp);
          return match && match[7].length == 11 ? match[7] : false;
        }
        static _loadIframeApi() {
          const scriptUrl = "https://www.youtube.com/iframe_api";
          const loadTimeout = 15e3;
          const YT2 = window["YT"] || { loading: 0, loaded: 0 };
          const YTConfig = window["YTConfig"] || { "host": "https://www.youtube.com" };
          if (!YT2.loading) {
            YT2.loading = 1;
            (function() {
              const l = [];
              let readyTimeout = null;
              YT2.ready = function(f) {
                if (YT2.loaded)
                  f();
                else
                  l.push(f);
              };
              YT2.setConfig = function(c) {
                for (const k in c)
                  if (c.hasOwnProperty(k))
                    YTConfig[k] = c[k];
              };
              const a = document.createElement("script");
              a.type = "text/javascript";
              a.id = "www-widgetapi-script";
              a.src = scriptUrl;
              a.async = true;
              a.onerror = () => {
                if (readyTimeout) {
                  clearTimeout(readyTimeout);
                  readyTimeout = null;
                }
                YT2.loading = 0;
                YTPlayer2._onIframeApiLoadError(new Error("Failed to load the YouTube Iframe API script."));
              };
              const currentScript = document.currentScript;
              if (currentScript) {
                const n = currentScript.nonce || currentScript.getAttribute("nonce");
                if (n)
                  a.setAttribute("nonce", n);
              }
              const b = document.getElementsByTagName("script")[0];
              b.parentNode.insertBefore(a, b);
              readyTimeout = window._ytReadyTimeout = setTimeout(() => {
                if (window.YT.loaded) {
                  return;
                }
                window.YT.loading = 0;
                YTPlayer2._onIframeApiLoadError(new Error("Timed out while loading the YouTube Iframe API script."));
              }, loadTimeout);
            })();
          }
          ;
        }
        static onYTReady(cb) {
          if (YTPlayer2.ytReadyBuff.check(cb)) {
            return;
          }
          if (typeof document === "undefined") {
            return;
          }
          if (YTPlayer2._iframeApiError) {
            cb(YTPlayer2._iframeApiError);
            return;
          }
          if (typeof YT !== "undefined") {
            throw new Error("Please do not load the YouTube Iframe API manually. This will happen automagically.");
          }
          window.onYouTubeIframeAPIReady = () => {
            YTPlayer2.loaded = true;
            YTPlayer2.loading_state = "loaded";
            clearTimeout(window._ytReadyTimeout);
            YTPlayer2.ytReadyBuff.done(null);
          };
          YTPlayer2._loadIframeApi();
        }
        constructor(id, options) {
          super();
          this.player = null;
          this.iframe = null;
          this.isFullscreen = false;
          this._fullscreenChangeHandler = null;
          this.buffs = {
            ready: new CbBuffer()
          };
          this.executedFuncs = [];
          options = {
            events: {},
            handleFullscreen: false,
            fullscreenIntervalCheck: 500,
            ...options
          };
          if (options.handleFullscreen) {
            this._fullscreenChangeHandler = () => {
              let fullscreenEl = document.fullscreenElement || document.webkitFullscreenElement || document.mozFullScreenElement || document.msFullscreenElement;
              let isFullscreen = !!(this.iframe && fullscreenEl && (fullscreenEl === this.iframe || fullscreenEl.contains(this.iframe)));
              if (isFullscreen === this.isFullscreen) {
                return;
              }
              this.isFullscreen = isFullscreen;
              this.emit(isFullscreen ? "fullscreen-enter" : "fullscreen-exit", this);
            };
            document.addEventListener("fullscreenchange", this._fullscreenChangeHandler);
            document.addEventListener("webkitfullscreenchange", this._fullscreenChangeHandler);
            document.addEventListener("mozfullscreenchange", this._fullscreenChangeHandler);
            document.addEventListener("MSFullscreenChange", this._fullscreenChangeHandler);
          }
          let events = {
            ...options.events
          };
          let _libEvents = {};
          YT_EVENTS.forEach((c) => {
            options.events[c[0]] = (e) => {
              this.emit(c[1], e, e.data);
            };
          });
          _libEvents.onReady = (e) => this.buffs.ready.done(e);
          _libEvents.onStateChange = (e) => this._onStateChange(e, e.data);
          delete options.events;
          let appendEvents = () => {
            iterateObject(_libEvents, (fn, c) => {
              this.player.addEventListener(c, fn);
            });
          };
          iterateObject(events, (fn, ev) => this.on(ev, fn));
          let YtPlayerWrapper = (id2, options2) => {
            let el = typeof id2 === "string" ? document.getElementById(id2) : id2;
            if (!el) {
              throw new Error("No video container found.");
            }
            if (el.tagName === "IFRAME") {
              if (!options2.videoId) {
                options2.videoId = YTPlayer2.getIdFromURL(el.getAttribute("src"));
              }
              el.outerHTML = "<div id='" + id2 + "'></div>";
            }
            return new YT.Player(id2, options2);
          };
          let firstLoaded = false;
          YTPlayer2.onYTReady((err) => {
            if (err) {
              this.emit("error", err);
              return;
            }
            let iframe = null, initializePlayer = () => {
              this.player = YtPlayerWrapper(id, options);
              this.iframe = iframe = this.player.getIframe();
              this.emit("iframeSet", this.iframe);
              appendEvents();
            };
            initializePlayer();
            let handleIframeReload = () => {
              this.buffs.ready.undone();
              if (firstLoaded) {
                let funcsToExec = this.executedFuncs;
                this.executedFuncs = [];
                funcsToExec.forEach((c) => this[c[0]].apply(this, c[1]));
              } else {
                firstLoaded = true;
              }
              let iframeLoaded = false;
              iframe.addEventListener("load", () => {
                setTimeout(() => {
                  iframeLoaded = true;
                }, 0);
              });
              this.once("ready", () => {
                let loadHandler = () => {
                  if (!iframeLoaded) {
                    return;
                  }
                  initializePlayer();
                  iframe.removeEventListener("load", loadHandler);
                  handleIframeReload();
                };
                iframe.addEventListener("load", loadHandler);
              });
            };
            handleIframeReload();
          });
        }
        _onStateChange(e, data) {
          this.emit(STATES[data].toLowerCase(), e);
        }
        on(ev, cb) {
          ev = lcFirst(ev.replace(/^on/, ""));
          if (ev === "ready") {
            return this.ready(cb.bind(this));
          }
          return super.on(ev, cb);
        }
        off(ev, cb) {
          ev = lcFirst(ev.replace(/^on/, ""));
          return super.removeListener(ev, cb);
        }
        playVideo() {
          if (isAndroidOrIOS) {
            return this;
          }
          this.ready((e) => {
            setTimeout(() => {
              this.player.playVideo();
            }, 0);
          });
          return this;
        }
        ready(cb) {
          this.buffs.ready.check(cb);
          return this;
        }
        destroy() {
          if (this._fullscreenChangeHandler && typeof document !== "undefined") {
            document.removeEventListener("fullscreenchange", this._fullscreenChangeHandler);
            document.removeEventListener("webkitfullscreenchange", this._fullscreenChangeHandler);
            document.removeEventListener("mozfullscreenchange", this._fullscreenChangeHandler);
            document.removeEventListener("MSFullscreenChange", this._fullscreenChangeHandler);
            this._fullscreenChangeHandler = null;
          }
          if (this.player && typeof this.player.destroy === "function") {
            this.player.destroy();
          }
          return this;
        }
        async safePlay() {
          if (isAndroidOrIOS) return this;
          const player = this.player;
          let tries = 10;
          let timeoutId;
          let finished = false;
          let bufferingSince = null;
          let bufferingCheckId;
          return new Promise((resolve, reject) => {
            const cleanup = () => {
              finished = true;
              clearTimeout(timeoutId);
              clearInterval(bufferingCheckId);
              player.removeEventListener("onStateChange", onStateChange);
              player.removeEventListener("onError", onError);
            };
            const success = () => {
              if (finished) return;
              cleanup();
              resolve(this);
            };
            const fail = (err) => {
              if (finished) return;
              cleanup();
              reject(err);
            };
            const restartPlayback = () => {
              try {
                player.stopVideo();
                setTimeout(() => {
                  player.playVideo();
                }, 100);
              } catch (e) {
              }
            };
            const tryPlay = () => {
              if (finished) return;
              try {
                player.playVideo();
              } catch (e) {
              }
              timeoutId = setTimeout(() => {
                if (finished) return;
                if (tries-- <= 0) {
                  return fail(new Error("Playback timeout"));
                }
                setTimeout(tryPlay, 300);
              }, 3e3);
            };
            const onStateChange = (e) => {
              const state = e.data;
              if (state === YT.PlayerState.PLAYING) {
                bufferingSince = null;
                success();
              }
              if (state === YT.PlayerState.BUFFERING) {
                if (!bufferingSince) {
                  bufferingSince = Date.now();
                }
              } else {
                bufferingSince = null;
              }
            };
            const onError = (e) => {
              fail(new Error(`YouTube error: ${e.data}`));
            };
            bufferingCheckId = setInterval(() => {
              if (finished || !bufferingSince) return;
              const elapsed = Date.now() - bufferingSince;
              if (elapsed > 1e4) {
                console.warn("Buffering too long \u2192 restarting playback");
                bufferingSince = Date.now();
                restartPlayback();
              }
            }, 1e3);
            player.addEventListener("onStateChange", onStateChange);
            player.addEventListener("onError", onError);
            tryPlay();
          });
        }
      };
      YT_FUNCS.forEach((c) => {
        YTPlayer.prototype[c] = function(...args) {
          this.executedFuncs.push([c, args]);
          const res = {
            cb: noop,
            __inst: this.__inst || this,
            resolve: function(...resolvedArgs) {
              if (resolvedArgs.length) {
                this.data = resolvedArgs[0];
              }
              this.cb(this.data, this.__inst);
            },
            then: function(cb) {
              if (this.data) {
                return this.resolve();
              }
              this.cb = cb;
              return this.__inst;
            }
          };
          const meths = Object.keys(this.__proto__).concat(Object.keys(this.__proto__.__proto__)).concat(classMethods(YTPlayer, { deep: false }));
          meths.forEach((c2) => {
            let cField = res.__inst[c2];
            res[c2] = typeof cField === "function" ? cField.bind(res.__inst) : cField;
          });
          this.ready((e) => {
            setTimeout(() => {
              let retVal = null;
              let retry = () => {
                try {
                  retVal = this.player[c].apply(this.player, args);
                } catch (e2) {
                  console.error(e2);
                  return setTimeout(() => retry(), 50);
                }
                res.resolve(retVal);
              };
              retry();
            }, 0);
          });
          return res;
        };
      });
      YTPlayer.loading_state = "loading";
      YTPlayer.loaded = false;
      YTPlayer.ytReadyBuff = new CbBuffer();
      YTPlayer._iframeApiError = null;
      YTPlayer.onYTReady(noop);
      YTPlayer.version = "2026.3.25.22.07";
    }
  });
  return require_index();
})();
//# sourceMappingURL=yt-player.js.map

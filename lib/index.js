"use strict"

const CbBuffer = require("cb-buffer");
const iterateObject = require("iterate-object");
const lcFirst = require("lc-first");
const classMethods = require("class-methods");
const Emitter = require("./emitter")
const { isAndroidOrIOS, STATES, YT_EVENTS, YT_FUNCS } = require("./constants")

const noop = () => { };

/**
 * YTPlayer
 * A friendly wrapper around the YouTube Iframe API.
 *
 * @class YTPlayer
 * @extends Emitter
 * @param {string} id The ID of the container element or the element itself.
 * @param {Object} options Configuration options for the player.
 */
let YTPlayer = module.exports = class YTPlayer extends Emitter {

    static _onIframeApiLoadError(err) {
        if (YTPlayer._iframeApiError) { return }
        YTPlayer._iframeApiError = err
        YTPlayer.loading_state = "error"
        YTPlayer.ytReadyBuff.done(err)
    }

    /**
     * Extract the YouTube video ID from a URL.
     *
     * @static
     * @param {string} url The YouTube video URL.
     * @returns {string|boolean} The video ID if valid (11 characters), false otherwise.
     */
    static getIdFromURL(url) {
        let regExp = /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#\&\?]*).*/
        let match = url.match(regExp)
        return (match && match[7].length == 11) ? match[7] : false
    }

    static _loadIframeApi() {
        // https://www.youtube.com/iframe_api
        //const scriptUrl = 'https:\/\/www.youtube.com\/s\/player\/408be03a\/www-widgetapi.vflset\/www-widgetapi.js';
        const scriptUrl = "https://www.youtube.com/iframe_api";
        const loadTimeout = 15000;
        const YT = window["YT"] || { loading: 0, loaded: 0 };
        const YTConfig = window["YTConfig"] || { "host": "https://www.youtube.com" };
        if (!YT.loading) {
            YT.loading = 1;
            (function () {
                const l = [];
                let readyTimeout = null;
                YT.ready = function (f) {
                    if (YT.loaded)
                        f();
                    else
                        l.push(f)
                };

                YT.setConfig = function (c) {
                    for (const k in c)
                        if (c.hasOwnProperty(k))
                            YTConfig[k] = c[k]
                }
                    ;
                const a = document.createElement("script");
                a.type = "text/javascript";
                a.id = "www-widgetapi-script";
                a.src = scriptUrl;
                a.async = true;
                a.onerror = () => {
                    if (readyTimeout) {
                        clearTimeout(readyTimeout)
                        readyTimeout = null
                    }
                    YT.loading = 0
                    YTPlayer._onIframeApiLoadError(new Error("Failed to load the YouTube Iframe API script."))
                }
                const currentScript = document.currentScript;
                if (currentScript) {
                    const n = currentScript.nonce || currentScript.getAttribute("nonce");
                    if (n)
                        a.setAttribute("nonce", n)
                }
                const b = document.getElementsByTagName("script")[0];
                b.parentNode.insertBefore(a, b)

                readyTimeout = window._ytReadyTimeout = setTimeout(() => {
                    if (window.YT.loaded) { return }
                    window.YT.loading = 0
                    YTPlayer._onIframeApiLoadError(new Error("Timed out while loading the YouTube Iframe API script."))
                }, loadTimeout)
            }
            )()
        };
    }

    static onYTReady(cb) {
        if (YTPlayer.ytReadyBuff.check(cb)) { return }
        if (typeof document === "undefined") { return }
        if (YTPlayer._iframeApiError) {
            cb(YTPlayer._iframeApiError)
            return
        }
        if (typeof YT !== "undefined") {
            throw new Error("Please do not load the YouTube Iframe API manually. This will happen automagically.")
        }
        window.onYouTubeIframeAPIReady = () => {
            YTPlayer.loaded = true
            YTPlayer.loading_state = "loaded"
            clearTimeout(window._ytReadyTimeout)
            YTPlayer.ytReadyBuff.done(null)
        }
        YTPlayer._loadIframeApi()
    }

    constructor(id, options) {
        super()
        this.player = null
        this.iframe = null
        this.isFullscreen = false
        this._fullscreenChangeHandler = null
        this.buffs = {
            ready: new CbBuffer()
        }

        this.executedFuncs = []
        options = {
            events: {},
            handleFullscreen: false,
            fullscreenIntervalCheck: 500,
            ...options,
        }

        if (options.handleFullscreen) {
            this._fullscreenChangeHandler = () => {
                let fullscreenEl = document.fullscreenElement
                    || document.webkitFullscreenElement
                    || document.mozFullScreenElement
                    || document.msFullscreenElement

                let isFullscreen = !!(this.iframe && fullscreenEl && (fullscreenEl === this.iframe || fullscreenEl.contains(this.iframe)))
                if (isFullscreen === this.isFullscreen) { return }

                this.isFullscreen = isFullscreen
                this.emit(isFullscreen ? "fullscreen-enter" : "fullscreen-exit", this)
            }

            document.addEventListener("fullscreenchange", this._fullscreenChangeHandler)
            document.addEventListener("webkitfullscreenchange", this._fullscreenChangeHandler)
            document.addEventListener("mozfullscreenchange", this._fullscreenChangeHandler)
            document.addEventListener("MSFullscreenChange", this._fullscreenChangeHandler)
        }

        let events = {
            ...options.events
        }

        // Append the new events
        let _libEvents = {}
        YT_EVENTS.forEach(c => {
            options.events[c[0]] = e => {
                this.emit(c[1], e, e.data)
            }
        })
        _libEvents.onReady = e => this.buffs.ready.done(e)
        _libEvents.onStateChange = e => this._onStateChange(e, e.data)
        delete options.events

        let appendEvents = () => {
            iterateObject(_libEvents, (fn, c) => {
                this.player.addEventListener(c, fn)
            })
        }

        // Listen for the user's events
        iterateObject(events, (fn, ev) => this.on(ev, fn))

        let YtPlayerWrapper = (id, options) => {
            let el = typeof id === "string" ? document.getElementById(id) : id
            if (!el) { throw new Error("No video container found.") }
            if (el.tagName === "IFRAME") {
                if (!options.videoId) {
                    options.videoId = YTPlayer.getIdFromURL(el.getAttribute("src"))
                }
                el.outerHTML = "<div id='" + id + "'></div>"
            }
            return new YT.Player(id, options)
        }

        let firstLoaded = false
        YTPlayer.onYTReady(err => {

            if (err) {
                this.emit("error", err)
                return
            }

            let iframe = null
                , initializePlayer = () => {
                    this.player = YtPlayerWrapper(id, options)
                    this.iframe = iframe = this.player.getIframe()
                    this.emit("iframeSet", this.iframe)
                    appendEvents()
                }


            initializePlayer()
            let handleIframeReload = () => {

                this.buffs.ready.undone()
                if (firstLoaded) {
                    let funcsToExec = this.executedFuncs
                    this.executedFuncs = []
                    funcsToExec.forEach(c => this[c[0]].apply(this, c[1]))
                } else {
                    firstLoaded = true
                }

                let iframeLoaded = false
                iframe.addEventListener("load", () => {
                    setTimeout(() => {
                        iframeLoaded = true
                    }, 0)
                })

                this.once("ready", () => {
                    let loadHandler = () => {
                        if (!iframeLoaded) { return }
                        initializePlayer()
                        iframe.removeEventListener("load", loadHandler)
                        handleIframeReload()
                    }
                    iframe.addEventListener("load", loadHandler)
                })
            }

            handleIframeReload()
        })
    }

    _onStateChange(e, data) {
        this.emit(STATES[data].toLowerCase(), e)
    }

    on(ev, cb) {
        ev = lcFirst(ev.replace(/^on/, ""))
        if (ev === "ready") {
            return this.ready(cb.bind(this))
        }
        return super.on(ev, cb)
    }

    off(ev, cb) {
        ev = lcFirst(ev.replace(/^on/, ""))
        return super.removeListener(ev, cb)
    }

    playVideo() {
        if (isAndroidOrIOS) { return this }
        this.ready(e => {
            setTimeout(() => {
                this.player.playVideo()
            }, 0)
        })
        return this
    }

    ready(cb) {
        this.buffs.ready.check(cb)
        return this
    }

    destroy() {
        if (this._fullscreenChangeHandler && typeof document !== "undefined") {
            document.removeEventListener("fullscreenchange", this._fullscreenChangeHandler)
            document.removeEventListener("webkitfullscreenchange", this._fullscreenChangeHandler)
            document.removeEventListener("mozfullscreenchange", this._fullscreenChangeHandler)
            document.removeEventListener("MSFullscreenChange", this._fullscreenChangeHandler)
            this._fullscreenChangeHandler = null
        }

        if (this.player && typeof this.player.destroy === "function") {
            this.player.destroy()
        }

        return this
    }
}

YT_FUNCS.forEach(c => {
    YTPlayer.prototype[c] = function (...args) {
        this.executedFuncs.push([c, args])

        let res = {
            cb: noop
            , __inst: this.__inst || this
            , resolve: function (...resolvedArgs) {
                if (resolvedArgs.length) {
                    this.data = resolvedArgs[0]
                }
                this.cb(this.data, this.__inst)
            }
            , then: function (cb) {
                if (this.data) { return this.resolve() }
                this.cb = cb
                return this.__inst
            }
        }

        const meths = Object.keys(this.__proto__)
            .concat(Object.keys(this.__proto__.__proto__))
            .concat(classMethods(YTPlayer, { deep: false }))

        meths.forEach(c => {
            let cField = res.__inst[c]
            res[c] = typeof cField === "function" ? cField.bind(res.__inst) : cField
        })

        this.ready(e => {
            setTimeout(() => {
                let retVal = null
                let retry = () => {
                    try {
                        retVal = this.player[c].apply(this.player, args)
                    } catch (e) {
                        console.error(e)
                        return setTimeout(() => retry(), 50)
                    }
                    res.resolve(retVal)
                }
                retry()
            }, 0)
        })

        return res
    }
})

YTPlayer.loading_state = "loading";
YTPlayer.loaded = false
YTPlayer.ytReadyBuff = new CbBuffer()
YTPlayer._iframeApiError = null

// Load the YT Player script
YTPlayer.onYTReady(noop)

YTPlayer.version = "2026.3.25.22.07";
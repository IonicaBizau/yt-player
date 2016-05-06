"use strict";

require("function.name")

const EventEmitter = require("events").EventEmitter
    , CbBuffer = require("cb-buffer")
    , ul = require("ul")
    , iterateObject = require("iterate-object")
    , lcFirst = require("lc-first")
    , noop = require("noop6")
    , isiOS = require("is-ios")
    , isAndroid = require("is-android")
    , classMethods = require("class-methods")
    ;

const STATES = {
    "-1": "UNSTARTED"
  , "0": "ENDED"
  , "1": "PLAYING"
  , "2": "PAUSED"
  , "3": "BUFFERING"
  , "5": "CUED"
};

const YT_EVENTS = [
    ["onReady", "ready"]
  , ["onStateChange", "stateChange"]
  , ["onPlaybackQualityChange", "playbackQualityChange"]
  , ["onPlaybackRateChange", "playbackRateChange"]
  , ["onError", "error"]
  , ["onApiChange", "apiChange"]
];

const YT_FUNCS = [
    "cueVideoById", "loadVideoById",
    "cueVideoByUrl", "loadVideoByUrl",
    "pauseVideo", "stopVideo", "clearVideo",
    "getVideoBytesLoaded", "getVideoBytesTotal",
    "getVideoLoadedFraction", "getVideoStartBytes",
    "cuePlaylist", "loadPlaylist",
    "nextVideo", "previousVideo",
    "playVideoAt", "setShuffle", "setLoop",
    "getPlaylist", "getPlaylistIndex", "getPlaylistId",
    "loadModule", "unloadModule",
    "setOption", "mute", "unMute", "isMuted",
    "setVolume", "getVolume",
    "seekTo", "getPlayerState",
    "getPlaybackRate", "setPlaybackRate", "getAvailablePlaybackRates",
    "getPlaybackQuality", "setPlaybackQuality", "getAvailableQualityLevels",
    "getCurrentTime", "getDuration",
    "removeEventListener", "addEventListener",
    "getVideoUrl", "getDebugText",
    "getVideoData", "addCueRange", "removeCueRange",
    "getApiInterface", "showVideoInfo", "hideVideoInfo",
    "getVideoEmbedCode", "getOptions", "getOption",
    "destroy", "setSize", "getIframe"
];

/**
 * ytPlayer
 * A friendly wrapper around the YouTube Iframe API.
 *
 * @name ytPlayer
 * @function
 * @param {Number} a Param descrpition.
 * @param {Number} b Param descrpition.
 * @return {Number} Return description.
 */
let YTPlayer = module.exports = class YTPlayer extends EventEmitter {
    static getIdFromURL (url){
        let regExp = /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#\&\?]*).*/;
        let match = url.match(regExp);
        return (match && match[7].length == 11) ? match[7] : false;
    }

    static onYTReady (cb) {
        if (YTPlayer.ytReadyBuff.check(cb)) { return; }
        if (typeof YT !== "undefined") {
            throw new Error("Please do not load the YouTube Iframe API manually. This will happen automagically.");
        }
        let tag = document.createElement("script");
	tag.src = "https://www.youtube.com/iframe_api";
	let firstScriptTag = document.getElementsByTagName('script')[0];
  	firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
        window.onYouTubeIframeAPIReady = () => {
            YTPlayer.ytReadyBuff.done();
        };
    }

    constructor (id, options) {
        super();
        this.player = null;
        this.iframe = null;
        this.buffs = {
            ready: new CbBuffer()
        };

        this.executedFuncs = [];
        options = ul.deepMerge(options, {
            events: {}
          , handleFullscreen: false
          , fullscreenIntervalCheck: 500
        });

        if (options.handleFullscreen) {
            this.isFullscreen = false;
            this.fullscreenInterval = setInterval(() => {
                if (!this.iframe) { return; }
                if (this.iframe.offsetHeight === window.innerHeight && this.iframe.offsetWidth === window.innerWidth) {
                    if (this.isFullscreen) { return; }
                    this.isFullscreen = true;
                    this.emit("fullscreen-enter", this);
                } else {
                    if (!this.isFullscreen) { return; }
                    this.isFullscreen = false;
                    this.emit("fullscreen-exit", this);
                }

            }, options.fullscreenIntervalCheck);
        }

        let events = options.events;

        // Append the new events
        let _libEvents = {};
        YT_EVENTS.forEach(c => {
            options.events[c[0]] = e => {
                this.emit(c[1], e, e.data);
            };
        });
        _libEvents.onReady = e => this.buffs.ready.done(e);
        _libEvents.onStateChange = e => this._onStateChange(e, e.data);
        delete options.events;

        let appendEvents = () => {
            iterateObject(_libEvents, (fn, c) => {
                this.player.addEventListener(c, fn);
            });
        };

        // Listen for the user's events
        iterateObject(events, (fn, ev) => this.on(ev, fn));

        let YtPlayerWrapper = (id, options) => {
	    let el = typeof id === "string" ? document.getElementById(id) : id;
            if (!el) { throw new Error("No video container found."); }
            if (el.tagName === "IFRAME") {
                if (!options.videoId) {
                    options.videoId = YTPlayer.getIdFromURL(el.getAttribute("src"));
                }
                el.outerHTML = "<div id='" + id + "'></div>";
            }
	    return new YT.Player(id, options);
	};

        let firstLoaded = false;
        YTPlayer.onYTReady(_ => {
            let iframe = null
              , initializePlayer = () => {
                    this.player = YtPlayerWrapper(id, options)
                    this.iframe = iframe = this.player.getIframe();
                    this.emit("iframeSet", this.iframe);
                    appendEvents();
                }
              ;

            initializePlayer();
            let handleIframeReload = () => {

                this.buffs.ready.undone();
                if (firstLoaded) {
                    let funcsToExec = this.executedFuncs;
                    this.executedFuncs = [];
                    funcsToExec.forEach(c => this[c[0]].apply(this, c[1]));
                } else {
                    firstLoaded = true;
                }

                let iframeLoaded = false;
                iframe.addEventListener("load", () => {
                    process.nextTick(() => {
                        iframeLoaded = true;
                    });
                });

                this.once("ready", () => {
                    let loadHandler = () => {
                        if (!iframeLoaded) { return; }
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

    _onStateChange (e, data) {
        console.log(STATES[data]);
        this.emit(STATES[data].toLowerCase(), e);
    }

    on (ev, cb) {
        ev = lcFirst(ev.replace(/^on/, ""));
        if (ev === "ready") {
            return this.ready(cb.bind(this));
        }
        return super.on(ev, cb);
    }

    playVideo () {
        if (isiOS || isAndroid) { return this; }
        this.ready(e => {
            process.nextTick(_ => {
                this.player.playVideo();
            });
        });
        return this;
    }

    ready (cb) {
        this.buffs.ready.check(cb);
        return this;
    }
};

YT_FUNCS.forEach(c => {
    YTPlayer.prototype[c] = function () {
        this.executedFuncs.push([c, arguments]);
        let args = arguments
          , res = {
                cb: noop
              , __inst: this.__inst || this
              , resolve: function (data) {
                    if (arguments.length) {
                        this.data = data;
                    }
                    this.cb(this.data, this.__inst);
                }
              , then: function (cb) {
                    if (this.data) { return this.resolve(); }
                    this.cb = cb;
                    return this.__inst;
                }
            }
          , meths = Object.keys(this.__proto__).concat(Object.keys(this.__proto__.__proto__)).concat(classMethods(YTPlayer, { deep: false }))
          ;

        meths.forEach(c => {
            let cField = res.__inst[c];
            res[c] = typeof cField === "function" ? cField.bind(res.__inst) : cField;
        });

        this.ready(e => {
            process.nextTick(_ => {
                let retVal = null;
                let retry = () => {
                    try {
                        retVal = this.player[c].apply(this.player, args);
                    } catch (e) { console.log(e); return setTimeout(_ => retry(), 50); }
                    res.resolve(retVal);
                };
                retry();
            });
        });

        return res;
    };
});

YTPlayer.loaded = false;
YTPlayer.ytReadyBuff= new CbBuffer();

// Load the YT Player script
YTPlayer.onYTReady(noop);

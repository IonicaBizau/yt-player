"use strict";

const EventEmitter = require("events").EventEmitter
    , CbBuffer = require("cb-buffer")
    , ul = require("ul")
    , iterateObject = require("iterate-object")
    , lcFirst = require("lc-first")
    , noop = require("noop6")
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
    "playVideo", "pauseVideo", "stopVideo", "clearVideo",
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
        this.buffs = {
            ready: new CbBuffer()
        };
        options = ul.deepMerge(options, {
            events: {}
        });

        let events = options.events;

        // Append the new events
        options.events = {};
        YT_EVENTS.forEach(c => {
            options.events[c[0]] = e => {
                this.emit(c[1], e, e.data);
            };
        });
        options.events.onReady = e => this.buffs.ready.done(e);
        options.events.onStateChange = e => this._onStateChange(e, e.data);

        // Listen for the user's events
        iterateObject(events, (fn, ev) => this.on(ev, fn));

        YTPlayer.onYTReady(_ => {
            // TODO Support iframe
            let videoPlayer = new YT.Player(id, options);
            this.player = videoPlayer;
        });
    }

    _onStateChange (e, data) {
        this.emit(STATES[data].toLowerCase(), e);
    }

    on (ev, cb) {
        ev = lcFirst(ev.replace(/^on/, ""));
        if (ev === "ready") {
            return this.ready(cb);
        }
        return super.on(ev, cb);
    }

    ready (cb) {
        this.buffs.ready.check(cb);
        return this;
    }
};

YT_FUNCS.forEach(c => {
    YTPlayer.prototype[c] = function () {
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
          , meths = Object.keys(this.__proto__).concat(Object.keys(this.__proto__.__proto__))
          ;

        meths.forEach(c => {
            let cField = res.__inst[c];
            res[c] = typeof cField === "function" ? cField.bind(res.__inst) : cField;
        });

        this.ready(e => {
            process.nextTick(_ => {
                res.resolve(this.player[c].apply(this.player, args));
            });
        });

        return res;
    };
});

YTPlayer.loaded = false;
YTPlayer.ytReadyBuff= new CbBuffer();

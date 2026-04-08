"use strict"

const isAndroidOrIOS = typeof navigator !== "undefined" && /Android|iPhone|iPad|iPod/i.test(navigator.userAgent)

const STATES = {
    "-1": "UNSTARTED",
    "0": "ENDED",
    "1": "PLAYING",
    "2": "PAUSED",
    "3": "BUFFERING",
    "5": "CUED"
}

const YT_EVENTS = [
    ["onReady", "ready"],
    ["onStateChange", "stateChange"],
    ["onPlaybackQualityChange", "playbackQualityChange"],
    ["onPlaybackRateChange", "playbackRateChange"],
    ["onError", "error"],
    ["onApiChange", "apiChange"]
]

const YT_FUNCS = "cueVideoById loadVideoById cueVideoByUrl loadVideoByUrl pauseVideo stopVideo clearVideo getVideoBytesLoaded getVideoBytesTotal getVideoLoadedFraction getVideoStartBytes cuePlaylist loadPlaylist nextVideo previousVideo playVideoAt setShuffle setLoop getPlaylist getPlaylistIndex getPlaylistId loadModule unloadModule setOption mute unMute isMuted setVolume getVolume seekTo getPlayerState getPlaybackRate setPlaybackRate getAvailablePlaybackRates getPlaybackQuality setPlaybackQuality getAvailableQualityLevels getCurrentTime getDuration removeEventListener addEventListener getVideoUrl getDebugText getVideoData addCueRange removeCueRange getApiInterface showVideoInfo hideVideoInfo getVideoEmbedCode getOptions getOption setSize getIframe".split(" ")

module.exports = {
    isAndroidOrIOS,
    STATES,
    YT_EVENTS,
    YT_FUNCS
}
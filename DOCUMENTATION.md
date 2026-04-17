## Documentation

You can see below the API reference of this module.

### YTPlayer

A friendly wrapper around the YouTube Iframe API.

#### Params

- **string** `id`: The ID of the container element or the element itself.
- **Object** `options`: Configuration options for the player.

### `_onIframeApiLoadError(err)`

Handle errors that occur while loading the YouTube Iframe API.

#### Params

- **Error** `err`: The error that occurred.

#### Return
- **void**

### `getIdFromURL(url)`
Extract the YouTube video ID from a URL.

#### Params

- **string** `url`: The YouTube video URL.

#### Return
- **string|boolean** The video ID if valid (11 characters), false otherwise.

### `_loadIframeApi()`

Load the YouTube Iframe API script and set up the YouTube ready callback.

#### Return
- **void**

### `onYTReady(cb)`

Register a callback to be invoked when the YouTube Iframe API is ready.

#### Params

- **Function** `cb`: The callback function to invoke when the API is ready.

#### Return
- **void**

### `constructor(id, options, [options.events={}], [options.handleFullscreen=false], [options.fullscreenIntervalCheck=500])`

Initialize a new YTPlayer instance.

#### Params

- **string|HTMLElement** `id`: The ID of the container element or the element itself.
- **Object** `options`: Configuration options for the player.
- **Object** `[options.events={}]`: Event handlers to attach to the player.
- **boolean** `[options.handleFullscreen=false]`: Whether to handle fullscreen changes.
- **number** `[options.fullscreenIntervalCheck=500]`: Interval in ms for fullscreen checks.

#### Return
- **void**

### `_onStateChange(e, data)`

Handle YouTube player state change events.

#### Params

- **Object** `e`: The YouTube state change event object.
- **number** `data`: The player state code.

#### Return
- **void**

### `on(ev, cb)`

Register an event listener on the player.

#### Params

- **string** `ev`: The event name to listen for.
- **Function** `cb`: The callback function to invoke when the event fires.

#### Return
- **YTPlayer** This instance for chaining.

### `off(ev, cb)`

Remove an event listener from the player.

#### Params

- **string** `ev`: The event name to stop listening for.
- **Function** `cb`: The callback function to remove.

#### Return
- **YTPlayer** The result of the parent removeListener method.

### `playVideo()`

Play the video (schedules play on Android/iOS after ready).

#### Return
- **YTPlayer** This instance for chaining.

### `ready(cb)`

Register a callback to be invoked when the player is ready.

#### Params

- **Function** `cb`: The callback function to invoke when the player is ready.

#### Return
- **YTPlayer** This instance for chaining.

### `destroy()`

Destroy the player and clean up all event listeners.

#### Return
- **YTPlayer** This instance for chaining.

### `safePlay()`
Safely play the video with retry logic, buffering detection, and error handling.

#### Return
- **Promise\<YTPlayer>** A promise that resolves to this instance when playback succeeds, or rejects with an error.


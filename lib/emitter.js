"use strict"

class Emitter {
    constructor() {
        this._events = Object.create(null)
    }

    on(event, listener) {
        if (typeof listener !== "function") {
            throw new TypeError("Listener must be a function.")
        }

        ;(this._events[event] = this._events[event] || []).push(listener)
        return this
    }

    once(event, listener) {
        if (typeof listener !== "function") {
            throw new TypeError("Listener must be a function.")
        }

        const onceListener = (...args) => {
            this.removeListener(event, onceListener)
            listener.apply(this, args)
        }

        onceListener._originalListener = listener
        return this.on(event, onceListener)
    }

    emit(event, ...args) {
        const listeners = this._events[event]
        if (!listeners || !listeners.length) {
            if (event === "error") {
                const err = args[0]
                console.error("Unhandled error event:", err instanceof Error ? err : new Error(err || "Unhandled error event."))
            }
            return false
        }

        listeners.slice().forEach(listener => listener.apply(this, args))
        return true
    }

    removeListener(event, listener) {
        const listeners = this._events[event]
        if (!listeners || !listeners.length) { return this }

        this._events[event] = listeners.filter(currentListener => {
            return currentListener !== listener && currentListener._originalListener !== listener
        })

        if (!this._events[event].length) {
            delete this._events[event]
        }

        return this
    }
}

module.exports = Emitter
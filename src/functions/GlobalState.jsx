import * as Func from '../functions/functions';

export class GlobalState {
    constructor() {
        this.data = {
            x: null,
            y: null,
            hoverX: null,
            hoverY: null,
            pressX: null,
            pressY: null,
            pressTime: null,
            canvasTopOffset: null,
            canvasLeftOffset: null,
            advancedMode: true,
            screenWidth: 100,
            screenHeight: 100,
        };
        this.limiters = {
            
        };
        this.listeners = {

        };
        this.setLimiter('x', (x) => {
            if (x === '') return x;
            return Func.Clamp(1, 100, x);
        });
        this.setLimiter('y', (y) => {
            if (y === '') return y;
            return Func.Clamp(1, 100, y);
        });
    }

    setLimiter(key, limiterFunction) {
        this.limiters[key] = limiterFunction;
    }

    setData(key, value) {
        if (this.listeners[key] == null) {
            this.addNewEvent(key);
        }
        if (this.limiters[key] != null) {
            this.data[key] = this.limiters[key](value);
        } else {
            this.data[key] = value;
        }
        this.notify(key);
    }

    getData(key) {
        return this.data[key];
    }

    addNewEvent(key) {
        this.listeners[key] = {};
    }

    listen(key, id, callback) {
        if (this.listeners[key] == null)
            this.addNewEvent(key);
        this.listeners[key][id] = callback;
        if (this.data[key] != null)
            callback(this.data[key]);
    }

    close(key, id) {
        delete this.listeners[key][id];
    }

    closeAll(id) {
        Object.keys(this.listeners).map((i) => {
            delete this.listeners[i][id];
        })
    }

    notify(key) {
        Object.keys(this.listeners[key]).map((i) => {
            this.listeners[key][i](this.data[key]);
        })
    }
}

export const GFD = new GlobalState();
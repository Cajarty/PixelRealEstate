import * as Func from '../functions/functions';

export const TUTORIAL_STATE = {
    NONE: {
        index: 0,
        className: ' tutorialStep step0',
        showNext: true,
    },
    CANVAS: {
        index: 1,
        className: ' tutorialStep step1',
        showNext: false,
    },
    DESCBOXDETAILS: {
        index: 2,
        className: ' tutorialStep step2',
        showNext: true,
    },
    DESCBOXACTIONS: {
        index: 3,
        className: ' tutorialStep step3',
        showNext: false,
    },
    UPDATEFORM: {
        index: 4,
        className: ' tutorialStep step4',
        showNext: true,
    },
    BUYFORM: {
        index: 5,
        className: ' tutorialStep step5',
        showNext: true,
    },
    DONEMETAMASK: {
        index: 6,
        className: ' tutorialStep step6',
        showNext: true,
    },
    DONENOTMETAMASK: {
        index: 7,
        className: ' tutorialStep step7',
        showNext: true,
    },
    getClassName(currID, checkID) {
        if (currID == checkID)
            return TUTORIAL_STATE[Object.keys(TUTORIAL_STATE)[currID]].className;
        return '';
    }
};

export class GlobalState {
    constructor() {
        this.data = {
            x: null,
            y: null,
            hoverX: null,
            hoverY: null,
            pressX: null,
            pressY: null,
            advancedMode: false,
            noAccount: false, //user isnt logged in
            noMetaMask: false, //metamask isnt installed
            screenWidth: 100,
            screenHeight: 100,
            balance: 0, //total amount of PXL owned.
            ServerDataManagerInit: 0, //has the data from the server been loaded? 0 = no, 1 = yes but no events because we have no metamask, 2 = yes
            tutorialStateIndex: 0,
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
        this.setLimiter('tutorialStateIndex', move => {
            if (move != -1 && move != 1)
                throw 'Tutorial State change must be -1 or 1 to indicate a step.';
            let oldId = GFD.getData('tutorialStateIndex');
            let newIndex = oldId;
                switch(oldId) {
                    case TUTORIAL_STATE.NONE.index:
                        if (move > 0)
                            newIndex = TUTORIAL_STATE.CANVAS.index;
                        break;
                    case TUTORIAL_STATE.CANVAS.index:
                        if (move > 0)
                            newIndex = TUTORIAL_STATE.DESCBOXDETAILS.index;
                        else
                            newIndex = TUTORIAL_STATE.NONE.index
                        break;
                    case TUTORIAL_STATE.DESCBOXDETAILS.index:
                        if (move > 0)
                            newIndex = TUTORIAL_STATE.DESCBOXACTIONS.index;
                        else
                            newIndex = TUTORIAL_STATE.CANVAS.index;
                        break;
                    case TUTORIAL_STATE.DESCBOXACTIONS.index:
                        if (move > 0)
                            newIndex = TUTORIAL_STATE.UPDATEFORM.index;
                        else
                            newIndex = TUTORIAL_STATE.DESCBOXDETAILS.index;
                        break;
                    case TUTORIAL_STATE.UPDATEFORM.index:
                        if (move > 0)
                            newIndex = TUTORIAL_STATE.BUYFORM.index;
                        else
                            newIndex = TUTORIAL_STATE.DESCBOXACTIONS.index;
                        break;
                    case TUTORIAL_STATE.BUYFORM.index:
                        if (move > 0) {
                            if (GFD.getData('noMetaMask'))
                                newIndex = TUTORIAL_STATE.DONENOTMETAMASK.index;
                            else
                                newIndex = TUTORIAL_STATE.DONEMETAMASK.index;
                        } else {
                            newIndex = TUTORIAL_STATE.UPDATEFORM.index;
                        }
                        break;
                    case TUTORIAL_STATE.DONEMETAMASK.index:
                    case TUTORIAL_STATE.DONENOTMETAMASK.index:
                        if (move < 0) {
                            newIndex = TUTORIAL_STATE.BUYFORM.index;
                            break;
                        }
                    default:
                        newIndex = TUTORIAL_STATE.NONE.index;
                        break;

                }
                return newIndex;
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
        //console.info('trigger: ', key, this.listeners[key])
        Object.keys(this.listeners[key]).map((i) => {
            this.listeners[key][i](this.data[key]);
        })
    }
}

export const GFD = new GlobalState();
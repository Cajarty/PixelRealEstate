import axios from 'axios';

const SERVER_URL = 'http://localhost:6500';

/*
Wrapper class for axios.

Includes default setup and globally accessable singleton instance.

Authentication is handled by this wrapper as well, including listener for
when the auth state changes.
*/
export default class Axios {
    constructor() {
        if (Axios.instance != null)
            throw new Error('Axios instance exists, request usage through "Axios.instace".');

        Axios.instance = this;
        Axios.instance.axios = axios.create({
            baseURL: SERVER_URL,
            timeout: 10000,
            headers: {
                'Accept': 'application/jsonp',
                'Content-Type': 'application/x-www-form-urlencoded',
            }
        });

    }

    static getInstance() {
        if (Axios.instance == null) {
            Axios.instance = new Axios();
        } else {
            return Axios.instance;
        }
           
    }

    /*
    Converts a request object to a FormData object to process
    */
    toFormData(object) {
        let formData = new FormData();
        for (let key in object) {
            if (Object.prototype.toString.call(object[key]) == '[object Array]') {
                formData.append(key, JSON.stringify(object[key]));
            } else {
                formData.append(key, object[key]);
            }
        }
        return formData;
    }

    /*
    Makes a Cancel Token Source to be used to attatch to requests and
    allow cancelling network requests.
    */
    getCancelToken() {
        return axios.CancelToken.source();
    }

    /*
    Sends get request, returns a promise.
    */
    get(url, cancelToken) {
        if (typeof (dataObject) === Object)
            throw new Error('Incorrect request data.');
        return this.axios.get(url, {
            cancelToken: cancelToken,
        });
    }

    /*
    Sends post request, returns a promise.
    */
    post(url, dataObject = {}, cancelToken) {
        if (typeof (dataObject) === Object)
            throw new Error('Incorrect request data.');
        return this.axios.post(url, this.toFormData(dataObject), {
            cancelToken: cancelToken,
        });
    }

    /*
    Sends patch request, returns a promise.
    */
    patch(url, dataObject = {}, cancelToken) {
        if (typeof (dataObject) === Object)
            throw new Error('Incorrect request data.');
        dataObject['_method'] = 'patch';
        return this.axios.post(url, this.toFormData(dataObject), {
            cancelToken: cancelToken,
        });
    }
}
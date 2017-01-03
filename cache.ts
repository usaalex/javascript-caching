/** Client-Side caching
 * localStorage, sessionStorage or Cookies.
 * local and session storages expiration support enabled.
 */

export { IClientCache, LocalCache, SessionCache, CookiesCache };

interface IClientCache {        
    add(key: string, item: any, expirationMins?: number): void;
    remove(key: string): void;    
    get<T>(key: string): T;
}

let jsonDateReviver = (key, value) => {    
    var datePattern = /^(\d{4})(?:-?W(\d+)(?:-?(\d+)D?)?|(?:-(\d+))?-(\d+))(?:[T ](\d+):(\d+)(?::(\d+)(?:\.(\d+))?)?)?(?:Z(-?\d*))?$/;
    if (typeof value === 'string') {
        var dateStr = value.match(datePattern);
        if (!!dateStr) {
            var date = new Date(dateStr[0]);
            if (!isNaN(+date)) return date;
        }
    }
    return value;
};

abstract class BrowserCache implements IClientCache {
    
    constructor(private prefix: string = '') {
        
    }

    abstract getStorage(): Storage;

    add(key: string, item: any, expirationMins?: number) {
        let expiration;
        if (typeof expirationMins == 'number' && isFinite(expirationMins) && expirationMins > -1) {
            expiration = new Date();
            expiration.setMinutes(expiration.getMinutes() + expirationMins);
        }
        this.getStorage().setItem(this.prefix + key, JSON.stringify({
            v: item,
            e: expiration
        }));
    }

    remove(key: string) {
        this.getStorage().removeItem(this.prefix + key);
    }

    get(key: string) {
        let expiration;
        let item = this.getStorage().getItem(this.prefix + key);
        try {
            let parsed = JSON.parse(item, jsonDateReviver);
            if (parsed.e && new Date() > new Date(parsed.e)) { // check expiration               
                this.remove(key);
                return null;                            
            }
            return parsed.v;
        }
        catch(e) {
            return null;
        }        
    }

}

class LocalCache extends BrowserCache {

    constructor(prefix: string = '') {
        super(prefix);        
    }

    getStorage(): Storage {
        return window.localStorage;
    }

}

class SessionCache extends BrowserCache {

    constructor(prefix: string = '') {
        super(prefix);        
    }

    getStorage(): Storage {
        return window.sessionStorage;
    }

}

class CookiesCache implements IClientCache {

    constructor(private prefix: string = '') {

    }

    add(key: string, item: any, expirationMins?: number) {
        let expiration;
        if (typeof expirationMins == 'number' && isFinite(expirationMins) && expirationMins > -1) {
            expiration = new Date();
            expiration.setMinutes(expiration.getMinutes() + expirationMins);
        }
        document.cookie = `${this.prefix + key}=${JSON.stringify(item)};path=/;expires=${(expiration || new Date('01/01/2099')).toUTCString()};`;
    }

    remove(key: string) {
        document.cookie = this.prefix + key + '=;expires=Thu, 01 Jan 1970 00:00:01 GMT;path=/;';
    }

    get(key: string) {
        var value = "; " + document.cookie;
        var parts = value.split("; " + this.prefix + key + "=");
        if (parts.length == 2) {
            var value = parts.pop().split(";").shift();
            try {
                return JSON.parse(value, jsonDateReviver);
            }
            catch(e) { }
        }
        return null;        
    }

}
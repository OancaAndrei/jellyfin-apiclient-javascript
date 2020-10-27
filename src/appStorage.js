function onCachePutFail(e) {
    console.log(e);
}

function updateCache(instance) {
    const cache = instance.cache;
    if (cache) {
        cache.put('data', new Response(JSON.stringify(instance.localData))).catch(onCachePutFail);
    }
}

function onCacheOpened(result) {
    this.cache = result;
    this.localData = {};
}

function isChromecast() {
    const { userAgent } = window.navigator;
    return userAgent.includes('CrKey');
}

class AppStore {
    constructor() {
        // FIXME: Remove this specific Chromecast check when Google decides to fix its issues.
        // Issue: https://bugs.chromium.org/p/chromium/issues/detail?id=1018902
        // Check: https://issuetracker.google.com/issues/36189456
        try {
            if (!isChromecast() && self && self.caches) {
                caches.open('embydata').then(onCacheOpened.bind(this));
            }
        } catch (err) {
            console.log(`Error opening cache: ${err}`);
        }
    }

    setItem(name, value) {
        localStorage.setItem(name, value);
        const localData = this.localData;
        if (localData) {
            const changed = localData[name] !== value;
            if (changed) {
                localData[name] = value;
                updateCache(this);
            }
        }
    }

    static getInstance() {
        if (!AppStore.instance) {
            AppStore.instance = new AppStore();
        }

        return AppStore.instance;
    }

    getItem(name) {
        return localStorage.getItem(name);
    }

    removeItem(name) {
        localStorage.removeItem(name);
        const localData = this.localData;
        if (localData) {
            localData[name] = null;
            delete localData[name];
            updateCache(this);
        }
    }
}

export default AppStore.getInstance();

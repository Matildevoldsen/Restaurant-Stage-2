const staticCacheName = 'mws-static-v1';

const allCaches = [
    staticCacheName
];

self.addEventListener('install', function (event) {
    event.waitUntil(
        caches.open(staticCacheName).then(function (cache) {
            cache.addAll([
                'index.html',
                'restaurant.html',
                'https://maps.googleapis.com/maps/api/js?key=AIzaSyAAQFNiTlyjhoMPR7UpazuoAWKl1b3fKdw&libraries=places&callback=initMap',
                'js/dbhelper.js',
                'js/main.js',
                'js/idb.js',
                'js/restaurant_info.js',
                'sw.js',
                'favicon.ico',
                'manifest.json',
                'css/styles.css',
                'css/responsive.css',
                'img/1.jpg',
                'img/2.jpg',
                'img/3.jpg',
                'img/4.jpg',
                'img/5.jpg',
                'img/6.jpg',
                'img/7.jpg',
                'img/8.jpg',
                'img/9.jpg',
                'img/10.jpg',
                'img/48x.png',
                'img/96x.png',
                'img/192x.png',
                'img/512.png',
                'img/p.png'
            ]);
        })
    );
});

/**
 * Clean unwanted cache.
 */
self.addEventListener('activate', function (event) {
    event.waitUntil(
        caches.keys().then(function (cacheNames) {
            return Promise.all(
                cacheNames.filter(function (cacheName) {
                    return cacheName.startsWith('mws-') &&
                        !allCaches.includes(cacheName);
                }).map(function (cacheName) {
                    return caches.delete(cacheName);
                })
            );
        })
    );
});

/**
 * Intercept requests and respond with cache or make a request to the server.
 */
self.addEventListener('fetch', function (event) {
    /*
      DevTools opening will trigger these o-i-c requests,
      which this SW can't handle.
      https://github.com/paulirish/caltrainschedule.io/pull/51
    */
    if ((event.request.cache === 'only-if-cached')
        && (event.request.mode !== 'same-origin')) {
        return;
    }
    // Caching Files
    var requestUrl = new URL(event.request.url);
    const index = event.request.url + "index.html";

    if (requestUrl.origin === location.origin) {
        if (requestUrl.pathname === '/') {
            event.respondWith(servePage(event.request, index));
            return;
        }
        if (requestUrl.pathname.endsWith("restaurant.html")) {
            event.respondWith(serveRestuarantPage(event.request));
            return;
        }

        // if cache was removed update it
        event.respondWith(servePage(event.request, requestUrl.href));
        return;
    }

    event.respondWith(
        caches.match(event.request).then(function (response) {
            return response || fetch(event.request);
        })
    );
});

/**
 * Return the retuarant html template, ignoring id
 */
function serveRestuarantPage(request, url) {
    var storageUrl = request.url.replace(/\?id=\d/, ''); // Ensuring that id's isn't relevant for service worker
    return servePage(request, storageUrl);
}

/**
 * Serve a page with custom url that should match an existing cache url, fetch
 * from network oherwise.
 */
function servePage(request, customUrl) {
    return caches.open(staticCacheName).then(function (cache) {
        return cache.match(customUrl).then(function (response) {
            var networkFetch = fetch(request).then(function (networkResponse) {
                cache.put(customUrl, networkResponse.clone());
                return networkResponse;
            });
            return response || networkFetch;
        });
    });
}

/**
 *  Respond to messages.
 */
self.addEventListener('message', function (event) {
    if (event.data.action === 'skipWaiting') {
        self.skipWaiting();
    }
});
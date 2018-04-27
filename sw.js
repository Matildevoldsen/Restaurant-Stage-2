var version = 'v1::'; //Version of cache
let cachedFiles = [
    '/css/styles.css',
    '/js/main.js',
    '/index.html',
    '/restaurant.html',
    '/img/1.jpg',
    '/img/2.jpg',
    '/img/3.jpg',
    '/img/4.jpg',
    '/img/5.jpg',
    '/img/6.jpg',
    '/img/7.jpg',
    '/img/8.jpg',
    '/img/9.jpg',
    '/img/10.jpg',
    '/js/dbhelper.js',
    'data/restaurants.json',
    '/js/restaurant_info.js',
];

if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/sw.js').then(function () {
        console.log('service worker registration complete.');
    }, function () {
        console.log('service worker registration failure.');
    });
} else {
    // console.log('service worker is not supported.');
}

self.addEventListener("install", function (event) {
    // console.log('install event in progress.');
    event.waitUntil(
        caches.open(version + 'fundamentals')
            .then(function (cache) {
                return cache.addAll(cachedFiles);
            })
    );
});

self.addEventListener('fetch', function(event) {
    console.log("Service Worker fetch");
    event.respondWith(
        caches.open(version).then(function(cache) {
            return cache.match(event.request).then(function (response) {
                return response || fetch(event.request).then(function(response) {
                    cache.put(event.request, response.clone());
                    return response;
                });
            });
        }).catch(function (err) {
            console.log("Error: Service worker fetch failed: ", err);
        })
    );
});

self.addEventListener('activate', function(event){
    console.log('Service Worker activated');
    event.waitUntil(
        caches.keys().then(function(cache){
            return Promise.all(cache.map(function(currentCacheName){
                if (currentCacheName !== version ) {
                    caches.delete(currentCacheName);
                }
            }))
        })
    )
});

function fromCache(request) {
    return caches.open(version).then(function (cache) {
        return cache.match(request).then(function (matching) {
            return matching || fetch(request);
        });
    });
}

function update(request) {
    return caches.open(version).then(function (cache) {
        return fetch(request).then(function (response) {
            return cache.put(request, response);
        });
    });
}

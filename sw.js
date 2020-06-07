const CACHE_NAME = "offline";
const urlsToCache = [".", "styles.css", "main.js","data/correct.mp3", "data/incorrect.mp3"];






self.addEventListener("install",  event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(urlsToCache))
      .then(self.skipWaiting())
  );
});





self.addEventListener('fetch', e => { 
    console.log('Service Worker: Fetching'); 
    e.respondWith( 
        fetch(e.request) 
        .then(res => { 
            // The response is a stream and in order the browser  
            // to consume the response and in the same time the  
            // cache consuming the response it needs to be  
            // cloned in order to have two streams. 
            const resClone = res.clone(); 
            // Open cache 
            caches.open(CACHE_NAME) 
                .then(cache => { 
                    // Add response to cache 
                    cache.put(e.request, resClone); 
                }); 
            return res; 
        }).catch( 
            err => caches.match(e.request) 
            .then(res => res) 
        ) 
    ); 
});

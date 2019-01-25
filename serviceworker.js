//the static files need to be cached
const filesToCache = [
'index.html',
'css/reset.css',
'css/style.css',
'app.js'
];

//install serviceworker
self.addEventListener('install', async e=>{
	console.log('install');
	const cache = await caches.open('cache-v1');
	cache.addAll(filesToCache);
})



let util = {
    fetchPut: function (request, callback) {
        return fetch(request).then(response => {
            // if cross-origin resources, return
            if (!response || response.status !== 200 || response.type !== "basic") {
                return response;
            }
            util.putCache(request, response.clone());
            typeof callback === "function" && callback();
            return response;
        });
    },
    putCache: function (request, resource) {
        // do not cache server data，preview url
        if (request.method === "GET" && request.url.indexOf("wp-admin") < 0 
              && request.url.indexOf("preview_id") < 0) {
            caches.open('cache-v1').then(cache => {
                cache.put(request, resource);
            });
        }
    }
};

this.addEventListener("fetch", function(event) {
    event.respondWith(
        caches.match(event.request).then(response => {
            // cache hit
            //return the cached static files
            if (response) {
                return response;
            }
 			//cached other resources and save them to the cache files
            return util.fetchPut(event.request.clone());
        })
    );
});




//received the pushed subscription and show notification
self.addEventListener('push',e=>{
	const data = e.data.json();
	console.log('push received',data);
	self.registration.showNotification(data.title,{
		body:data.msg,
		icon:'img/1.jpg',
		actions:[
			{action: 'explore', title: 'Check deals'},
			{action: 'close', title: 'No thank you'}
		]
	})

})


self.addEventListener('notificationclick', function(event) {
  var notification = event.notification;
  var action = event.action;
  if (action === 'close') {
    notification.close();
  } else {
    clients.openWindow('https://www.google.com/');
  }
});
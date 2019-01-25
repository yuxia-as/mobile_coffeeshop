

//register serviceworker
if ('serviceWorker' in navigator) {
	navigator.serviceWorker.register('serviceworker.js').then(function(registration) {
		// Registration was successful
		console.log('ServiceWorker registration successful with scope: ',	registration.scope);
	});
}

//check if user permit the notification
Notification.requestPermission(function(status) {
 console.log('Notification permission status:', status);
});

var client = getUserFromCookie();
console.log(client);
//check user has logged in
if(client){
	send().catch(err=>console.log(err));
	//register service worker, register push, send push
	async function send(){
		//register service worker
		console.log('registering service worker');
		const register = await navigator.serviceWorker.register('serviceworker.js');
		
		//if get permission
		if(Notification.permission=== 'granted'){
			//get user name from cookie
			var user = getUserFromCookie();
			
			console.log(user);
			//send user info to server to retrieve vapid publickey
			if(user != "undefined"){
				$.ajax({
					url:'/getVapidKey',
					type:'post',
					data:{user:user},
					success:async function(data){
						var publicKey = data.publicKey;
						//register push
						console.log('register push');
						const subscription = await register.pushManager.subscribe({
							userVisibleOnly:true,
							applicationServerKey:urlBase64ToUint8Array(publicKey)
						});
						console.log('sending push');
						//send subscription to server
						await fetch('/subscribe',{
							method:'POST',
							body:JSON.stringify(subscription),
							headers:{
								'content-type':'application/json'
							}
						});
						console.log('push send');
					}
				})
			}
		}
		
		
	}
}



function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding)
    .replace(/\-/g, '+')
    .replace(/_/g, '/');

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}
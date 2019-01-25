let hxRouter={
	'routes':[]
};
hxRouter.init=function(){
	let hash=window.location.hash;
	if(hash==undefined || hash.length<3){
		hash=this.routes[0]['key'];
		this.hashChanged(hash);
		if(history.pushState) window.history.replaceState({},null,'#/'+hash);
		else location.hash='#/'+hash;
	}else this.hashChanged(hash);
};
hxRouter.hashChanged=function(hash){
	hash=hash.replace(/^#\//,'');
	for(let i=0;i<this.routes.length;i++){
		if(hash.match(this.routes[i]['pattern'])){
			this.routes[i]['action']();
			break;
		}
	}
};
hxRouter.addRoute=function(route){
	this.routes.push(route);
};
hxRouter.cleanHash=function(hash=undefined){
	if(hash==undefined) hash=window.location.hash;
	return hash.replace(/^#\/?/,'');
};
hxRouter.toPath=function(hash){
	if(hash==undefined) hash=window.location.hash;
	return this.cleanHash(hash).split(/[\/+]/);
};
hxRouter.getGroups=function(pattern,hash=undefined,group=undefined){
	let groups=this.cleanHash(hash).match(pattern).groups;
	if(group!=undefined) return groups[group];
	return groups;
};
$(function(){
	hxRouter.init();
});
$(window).on('hashchange',function(){
	hxRouter.hashChanged(window.location.hash);
});
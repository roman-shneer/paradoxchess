function inIframe () {
    try {
        return window.self !== window.top;
    } catch (e) {
        return true;
    }
}
function redirect(href){
	window.location.href=href;
	
	
}
function reload(){
	window.location.reload();
	
}
function message_alert(message){
	var div=document.createElement('div');
	div.style.cssText="box-shadow:2px 2px 7px 0px black;border-radius:10px;position:absolute;top:40%;left:50%;background:red;color:white;border:solid black 1px;padding:20px;font-size:100%;";
	div.id='message_alert';
	div.innerHTML=message;
	document.getElementsByTagName('body')[0].append(div);
	
	setTimeout(function (){
		document.getElementsByTagName('body')[0].removeChild(document.getElementById('message_alert'));
	},3000);
}
function saveUserKey(key){
	localStorage.setItem('mdkey', key);
	return localStorage.getItem('mdkey');	
}
function getUserKey(){
	
	return localStorage.getItem('mdkey');	
}
function makeid(length) {
	var result           = '';
	var characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
	var charactersLength = characters.length;
	for ( var i = 0; i < length; i++ ) {
		result += characters.charAt(Math.floor(Math.random() * charactersLength));
	}
	return result;
}
function get_config(){
	if(location.hostname=='paradoxchess.test'){
		//debug
		var config={
			'socket_port':8888,
			'socket_host':"ws://192.168.1.22:8888",
			'email':'paradoxchess@gmail.com',
			'static_url':'',
			'dev':true,
		};
	}else{
		//production
		var config={
			'socket_port':8888,
			'socket_host':"ws://192.168.1.22:8888",
			'email':'paradoxchess@gmail.com',
			'static_url':'',
			'dev':false,
		};
	} 
	return config;
} 


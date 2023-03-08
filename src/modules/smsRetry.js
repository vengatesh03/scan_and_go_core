var	HTTPCli         = require('./HTTPClient.js'),
	SMSRetry		= {},
	editJsonFile  	= require("edit-json-file"),
	conf  			= editJsonFile(__root+__core+'config.json'),
	sms_retry       = editJsonFile(__root+__core+'modules/smsRetry.json');

SMSRetry.RETRY = function(){
	var data = sms_retry.get('');
	for(var i in data){
		make_http_request(data[i].sms_host,data[i].sms_port,'POST',data[i],data[i].api,data[i].sms_token);
	}
	
	function make_http_request(ip,port,method,payload,api,token,sucess_cb,error_cb){
		var obj=HTTPCli.M2MReq(ip,port,method,payload,api,token);
		HTTPCli.https_to_SMS(obj,sucess_cb,error_cb);
		function error_cb(err){
		}
		function sucess_cb(datas){
			sms_retry.unset(datas);
			sms_retry.save();
		}
	}
}

module.exports = SMSRetry;

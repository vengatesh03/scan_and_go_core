var request 	= require('request'),
    Razorpay 	= {};

var method_post ="POST"
	method_get  ="GET"

var map ={
	"POST" :request.post,
	"GET"  :request.get
}

function getRazorpayCredentials(payment_details,callback) {
	var credential={}
	const paymentField = payment_details.payment_fields;
	for (var i = paymentField.length - 1; i >= 0; i--) {
		credential[paymentField[i].key] = paymentField[i].value;
	}
    	var base64encodedData = new Buffer(credential.key_id + ':' + credential.key_secret).toString('base64');
   	callback(base64encodedData);
}

function makeRequest(method,url,payload,payment_details,callback) {
	getRazorpayCredentials(payment_details,function(base64encodedData){
		if(base64encodedData){
			const options = {
			  	url: url,
			  	headers: {
			    	'User-Agent': 'request',
			    	'Content-Type': 'application/json',
			    	'Authorization': 'Basic '+base64encodedData
			  	},
			  	form:payload
			};

			map[method](options, function optionalCallback(error, response, body){
				if(response.statusCode==200){
					callback(JSON.parse(body))
				}else{
					callback(0)
				}
			});			
		}
	})
}

function changePayloadFormat(payload){
	var modified_payload={
		customer:payload.customer,
		type:'link',
		amount:payload.amount,
		currency:payload.currency,
		callback_url:payload.callback_url,
		callback_method:payload.callback_method,
		sms_notify:1,
		email_notify:1,
		description:"Payment Link from Skie"
	}

	return modified_payload;
}
	

Razorpay.createPaymentLink=function (payload,payment_details,callback) {
	var create_payment_link_url="https://api.razorpay.com/v1/invoices/";
	var payload_for_payment_link=changePayloadFormat(payload);
	makeRequest(method_post,create_payment_link_url,payload_for_payment_link,payment_details,callback)
}

Razorpay.isPaymentSuccess=function(invoice_id,payment_details,callback){
	var fetch_payment_link_url="https://api.razorpay.com/v1/invoices/"+invoice_id
	makeRequest(method_get,fetch_payment_link_url,"{}",payment_details,callback)
}

Razorpay.cancelPaymentLink=function(invoice_id,payment_details,callback){
	var cancel_payment_link_url="https://api.razorpay.com/v1/invoices/"+invoice_id+"/cancel"
	makeRequest(method_post,cancel_payment_link_url,{},payment_details,callback)
}

module.exports=Razorpay


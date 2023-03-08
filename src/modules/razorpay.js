const Razorpay 	= {};

const RPay = require('razorpay');

const getRPInstance = function(payment_details) {
	const paymentField = payment_details.payment_fields;
	const credential = {};
	for (var i = paymentField.length - 1; i >= 0; i--) {
		credential[paymentField[i].key] = paymentField[i].value;
	}
	return new RPay(credential);
}

Razorpay.isPaymentSuccess = function (id,payment_details,callback) {
	getRPInstance(payment_details).payments.fetch(id).then((data) => {
		callback(data);
	}).catch((error) => {
		callback(false);
	});
}

Razorpay.createPaymentLink = function (payload,payment_details,callback) {
	getRPInstance(payment_details).paymentLink.create(payload).then((data) => {
		callback(data);
	}).catch((error) => {
		callback(0);
	});
}

Razorpay.cancelPaymentLink = function (id,payment_details,callback) {
	getRPInstance(payment_details).paymentLink.cancel(id).then((data) => {
		callback(data);
	}).catch((error) => {
		callback(false);
	});
}


module.exports=Razorpay;

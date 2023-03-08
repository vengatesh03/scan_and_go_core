var pdf = require("pdf-creator-node");
var fs = require('fs');
var transactionReceipt={};
var editJsonFile= require("edit-json-file"),
    conf        = editJsonFile(__root+__core+'config.json'),
    handlebars  = require('handlebars');
transactionReceipt.create=function(title,org,trans,callback){
	var org_address = org.city+', '+org.state+', '+org.pincode
	var details = conf.get('receipt_details')
	var template, out;
	var time = new Date();
	var source = {
		'infyn_name' 	  : details.infyn_name,
		'infyn_place'	  : details.infyn_place,
		'infyn_state'	  : details.infyn_state,
		'infyn_gst'  	  : details.infyn_gst,
		'infyn_email' 	  : details.infyn_email,
		'infyn_phone'  	  : details.infyn_phone,
		'infyn_website'	  : details.infyn_website,
		'customer_company': org.org_name,
		'customer_address': org_address,
		'receipt_date'	  : (time.getFullYear()+'-'+(time.getMonth()+1)+'-'+time.getDate()),
		'line_item'		  : trans.bundle,
		'amount'		  : trans.paid_amount,
		'receipt_no' 	  : trans.receipt_number
	}
	fs.readFile(__root+__core+"modules/receipt.html", {encoding: 'utf-8'}, function (err, html) {
		template = handlebars.compile(html);
		out = template(source)
		var payload = [];
		var document = {
            html: out,
            data: {
                payload: payload
            },
            path: './receipt.pdf'
        };

        var options = {format: "A3", orientation: "portrait"};
        pdf.create(document, options).then(res => {
            callback(res)
        })
        .catch(error => {
            callback(0);
        });
	})
}

module.exports=transactionReceipt;

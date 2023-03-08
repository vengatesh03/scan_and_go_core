var pdf = require("pdf-creator-node");
var fs = require('fs');
var transactionPDF={};
var editJsonFile= require("edit-json-file"),
    conf        = editJsonFile(__core+'config.json'),
    report_path = conf.get("report_path"),
    handlebars  = require('handlebars'),
    converter   = require('number-to-words'),
    BillSetting= __db_model.BillSetting,
    State       = __db_model.State;

transactionPDF.create=function(title,payload,org,invoice,callback){

    if (!fs.existsSync(report_path+'cloud_ott')) {
        fs.mkdirSync(report_path+'cloud_ott');
    }
    var org_address = org.city+', '+org.state+', '+org.pincode
    var html_content='',file_path, img_src='';
    var time = new Date(invoice.time_stamp)

    State.findOne({raw:true,where:{name:org.state}}).then(function(state){
        BillSetting.findAll({raw:true}).then(function(bill){
            fs.readFile(__root+__core+'modules/image002.png','base64',function(err,data){
                img_src = data
                var words = converter.toWords(invoice.paid_amount) + " only";
                var source = {
                    "company_name":"Infynect",
                    "company_address":'Bangalore, Karnataka - 560095',
                    "to_company_name":org.org_name,
                    "to_company_address":org_address,
                    "invoice_id":invoice.invoice_id,
                    "state":org.state,
                    "code":state.code,
                    "img_src":'data:image/png;base64'+' ,'+img_src,
                    "invoice_date":(time.getFullYear()+'-'+(time.getMonth()+1)+'-'+time.getDate())
                }
                if(org.gst_number){
                    source["to_gst"] = 'GSTIN '+org.gst_number
                }

                var pdfData='',header,list,footer,finalAmt,cost = 0, adjust = 0, cgst,igst,sgst;
                var out = '';
                fs.readFile(__root+__core+"modules/header.html", {encoding: 'utf-8'}, function (err, html) {
                    header = handlebars.compile(html);
                    out = out+header(source)
                    fs.readFile(__root+__core+"modules/list.html", {encoding: 'utf-8'}, function (err, list) {
                        var lineItems = '', items='';
                        invoice.invoices.map(function (args) {
                            if(args.status == 'Payment'){
                                var input = {
                                    "bundle"  : args.bund_name+"-"+args.mode,
                                    "rate"    : args.rate,
                                    "quantity": args.quantity,
                                    "amt_without_gst": args.amt,
                                    "sac_code" : bill[0].sac_code,
                                    "prorated_day": args.prorated_day,
                                    "discount"    : args.discount
                                }

                                cost = cost + args.amt
                                lineItems = lineItems + list
                                html_content = handlebars.compile(lineItems);
                                items = html_content(input)
                                out = out + items
                                items = '';
                                lineItems = ''
                            }else if(args.status == 'Adjustment'){
                                adjust = adjust + args.amt
                            }
                        })
                        fs.readFile(__root+__core+"modules/total.html", {encoding: 'utf-8'}, function (err, total) {
                            pdfData = pdfData + total
                            var gst = ((cost * 18) / 100)
                            if(bill[0].state==org.state){
                                sgst =(gst/2).toFixed(2)
                                cgst =(gst/2).toFixed(2)
                                file_path = __root+__core+"modules/gst.html"
                            }else{
                                igst =gst.toFixed(2)
                                file_path = __root+__core+"modules/igst.html"
                            }
                            fs.readFile(file_path, {encoding: 'utf-8'}, function (err, gst) {
                                pdfData = pdfData + gst
                                fs.readFile(__root+__core+"modules/footer.html", {encoding: 'utf-8'}, function (err, footer) {
                                    pdfData = pdfData + footer
                                    html_content = handlebars.compile(pdfData);
                                    
                                    source["igst"] = igst
                                    source["cgst"] = cgst
                                    source["sgst"] = sgst
                                    source["cost"] = cost
                                    source["adjustments"] = adjust
                                    source["total_amount"] = invoice.paid_amount
                                    source["words"] = words
                                        
                                    out = out + html_content(source);
                                    var document = {
                                        html: out,
                                        data: {
                                            payload: payload
                                        },
                                        path: './mail_pdf/'+invoice.transaction_id+'_invoice.pdf'
                                    };
                                    var options = {format: "A3", orientation: "portrait"};
                                    pdf.create(document, options).then(res => {
                                        callback(res)
                                    })
                                    .catch(error => {
                                        callback(0);
                                    });
                                })
                            })
                        })
                    })
                })
            })
        })
    })
}
module.exports=transactionPDF;

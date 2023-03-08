//Required package
var pdf         = require("pdf-creator-node"),
    fs          = require('fs'),
    PDF         = {},
    editJsonFile= require("edit-json-file"),
    fs          = require('fs');
    
PDF.create=function(title,payload,rowkeys,index_count,callback){
    // Read HTML Template
    var conf        = editJsonFile(__root+__core+'config.json'),
        header      = conf.get("report_header"),
        report_path = conf.get("report_path");
    if (!fs.existsSync(report_path)) {
        fs.mkdirSync(report_path);
    }

    var header_content,sub_content,sub_content_data,sub_content_gst,current_date,date,time;
    header_content      = header.header_content;
    sub_content         = header.sub_content;
    sub_content_data    = header.sub_content_data;
    sub_content_gst     = header.sub_content_gst;
    current_date        = new Date();
    date                = current_date.getDate()+'/'+(current_date.getMonth()+1)+'/'+current_date.getFullYear();
    time                = current_date.getHours()+':'+current_date.getMinutes()+':'+current_date.getSeconds();
    var active_count = deactive_count =0;
    var header_data = (
        '<div style="html_content-align: right;font-size:12px;font-weight: bold;">'+header_content+'</div>\
        <div style="html_content-align: right;font-size:10px;line-height:15px">'+sub_content+'</div><br>\
        <div style="html_content-align: right;font-size:8px;line-height:15px">'+sub_content_data+'</div>\
        <div style="html_content-align: right;font-size:8px;line-height:15px">'+sub_content_gst+'</div>\
        <div style="border-bottom: 1px dashed"></div>\
        <div style="font-weight: bold; font-size: 8px;line-height:15px">'+title+'</div>');
        
    var options = {
        format: "A4",
        orientation: "landscape",
        header: {
            height: "50mm",
            contents:  header_data,
        },
        footer: {
            height: "22mm",
            contents: {
                default:'<div class="col-md-12">\
                            <span style="font-size:8px">Printing Date & Time</span>\
                            <span style="margin-left:30px;font-size:8px">'+date+'</span>\
                            <span style="margin-left:30px;font-size:8px">'+time+'</span>\
                            <span style="margin-left:470px;font-size:8px">Page {{page}} of {{pages}}</span>\
                        </div>'
            }
        }
    };

    var html_content = "<table style='table-layout: fixed;width: 100%;word-wrap:break-word;border-spacing: 0 0px;width: 100%;'><thead>";

    for(headers in rowkeys){
        html_content += "<th style='padding: 5px;text-align: left;border-bottom: 1px solid black;font-size:10px'>"+rowkeys[headers]+"</th>";
    }

    html_content+= "</thead><thead>";
    if(Object.keys(index_count).length > 0){
        for(headers in index_count){
            html_content += "<th style='padding: 5px;text-align: left;border-bottom: 1px solid black;font-size:10px'>"+index_count[headers]+"</th>";
        }    
        html_content+= "</thead>";
    }

    for (var j = 0; j < payload.length; j++) {
	   if(payload[j].status){
            if(payload[j].status.toLowerCase() == 'active'){
                active_count++;
            }else if(payload[j].status.toLowerCase() == 'deactive'){
                deactive_count++;
            } 
        }
        html_content += '<tr>';

        for(key in rowkeys){
            var row_values=payload[j][key]==null ?' ':payload[j][key];
            html_content += "<td style='padding: 5px;text-align: left;border-bottom: 1px solid black;font-size:8px'>"+row_values+"</td>";
        }
        html_content += '</tr>';
    }
    
    html_content+= "</table>";
    if(title=='Subscriber Detail'){
        html_content+= '<b style="font-size:8px;margin-left:20px">Total Record Count :</b>\
        <b style="font-size:8px;margin-left:20px">'+payload.length+'</b>\
        <b style="font-size:8px;margin-left:20px">ACTIVE :</b>\
        <b style="font-size:8px;margin-left:20px">'+active_count+'</b>\
        <b style="font-size:8px;margin-left:20px">DEACTIVE :</b>\
        <b style="font-size:8px;margin-left:20px">'+deactive_count+'</b><br><br>\
        <b style="font-size:8px;margin-left:20px">'+payload.length+'</b></b><br><br>\
        <label style="font-size:8px;">We are Considering the last status of the given period</label>';
    }else{
        html_content+= '<b style="font-size:8px;margin-left:20px">Total Record Count :</b>\
            <b style="font-size:8px;margin-left:20px">'+payload.length+'</b></b><br><br>\
            <label style="font-size:8px;">We are Considering the last status of the given period</label>';
    }

    var document = {
        html: html_content,
        data: {
            payload: payload,
            total_count : payload.length
        },
        path:report_path+'zee/'+title+".pdf"
    };

    pdf.create(document, options)
    .then(res => {
        callback(res);
    })
    .catch(error => {
        callback(0);
    });
}
 
module.exports=PDF;

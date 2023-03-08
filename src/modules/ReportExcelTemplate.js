var fs 				= require('fs'),
	Excel 			= {},
	editJsonFile    = require("edit-json-file"),
	conf            = editJsonFile(__root+__core+'config.json'),
	report_header 	= conf.get("report_header");

Excel.create=function(payload,rowKeys,callback){
    var conf        = editJsonFile(__root+__core+'config.json'),
    report_header   = conf.get("report_header");
	var result, ctr, keys, columnDelimiter, lineDelimiter, data, fileData, count = 0;
		columnDelimiter = ',';
		lineDelimiter ='\n';
		result = '';     

	var header =report_header.header_content+lineDelimiter+report_header.sub_content+lineDelimiter+report_header.sub_content_data+lineDelimiter+report_header.sub_content_gst;
	var test_data = '"'+header+'"';

	result += test_data;
	result += lineDelimiter;

	if(Array.isArray(payload)){
		execute(payload, false);
	}else{
		for(var a in payload){
			execute(payload[a], true);
		}
	}

	function execute(params, arr_flag){ 
		data = params;
		if(arr_flag){
			keys = Object.keys(data[0]);
			var mapper=keys.map(function(item){
				return rowKeys[item] || item;
			})

			function arraysEqual(arr1, arr2) {
				if(arr1.length !== arr2.length)
				return false;
				for(var i = arr1.length; i--;) {
					if(arr1[i] !== arr2[i])
					return false;
				}
				return true;
			}
			
			if(!mapper.includes('Header')){
				if((!arraysEqual(old_key,mapper))){
					result += mapper.join(columnDelimiter);
				}
			}

			old_key = mapper;
			if(count ==0){
				result += lineDelimiter;
				count++;
			}else{
				result+=lineDelimiter;
			}
		}else{ 
			keys = Object.keys(rowKeys);

			result += Object.values(rowKeys).join(columnDelimiter);
			result += lineDelimiter;
		}
		if(data.length > 0){
			data.forEach(function(item) {
				ctr = 0;
				keys.forEach(function(key) {
					if (ctr > 0) result += columnDelimiter;
					if(item[key] != undefined){
						result += ((typeof(item[key]) == 'string') && (item[key].includes('\t'))) ?  item[key] : '"' + item[key] + '"';
					}
					ctr++;
				});
				result += lineDelimiter;
				fileData = result;
			});
		}else{
			fileData = result;
		}
	}
    
	callback(fileData);
}


module.exports=Excel;

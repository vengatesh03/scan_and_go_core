const editJsonFile = require("edit-json-file");
var fs = require('fs');
var config = editJsonFile(__root+__core+'config.json');
var conf,secret,conf_path=config.get("config_path");

if(fs.existsSync(conf_path+'config.json')){
	conf = editJsonFile(conf_path+'config.json');
	secret = conf.get("secret");
}else{
	secret = config.get("secret");
}

module.exports = {
  'secret': secret
};
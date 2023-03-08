var http = require("http");
const editJsonFile = require("edit-json-file");
var conf = editJsonFile('/etc/ec/config/conf.json');
var request = require("request");
var fs = require("fs");
var https=require("https")

var HTTPCli={};


HTTPCli.M2MReq=function(host, port, method, payload, uri, token, request_type){
    this.host=host;
    this.port=port;
    this.method=method;
    this.payload=payload;
    this.token=token;
    this.uri=uri;
    this.request_type=request_type;
    return HTTPCli;
}

HTTPCli.http_m2m=function(m2m,scb,ecb){
    if(m2m.method == "GET"){
            request.get({url:"http://"+m2m.host+":"+m2m.port+m2m.uri,
                /*agentOptions: {
                    key : fs.readFileSync(conf.get("secure_m2mcloud")+'/sm2mclient-key.pem').toString(),
                    cert: fs.readFileSync(conf.get("cert")+m2m.dev_id+'/cert.pem').toString(),
                    ca  : fs.readFileSync(conf.get("cert")+m2m.dev_id+'/ca-cert.pem').toString(),
                    checkServerIdentity: function(hostname, cert){
                        return undefined;
                    }
                } */
            },function optionalCallback(err, httpResponse, body) {
                if (err || httpResponse.statusCode!=200) {
                    ecb && ecb(err);
                }
                if(body && httpResponse.statusCode==200){
                    scb && scb(body);
                }
            });
    }else{
        var opt = {
            host: m2m.host,
            port: m2m.port,
            path: m2m.uri,
            method : m2m.method,
            // key: fs.readFileSync(conf.get("enact_path")+'/client-key.pem').toString(),
            // cert: fs.readFileSync(conf.get("enact_path")+'/enact-crt.pem').toString(),
            headers: {
              'Content-Type'  : 'application/json',
            }
        }
        if(m2m.token){
            opt.headers['x-access-token'] = m2m.token;
        }
        var req = http.request(opt, function(res){
            res.setEncoding('utf8');
            res.on('data', function(data) {
                if(res.statusCode == 200){
                    scb && scb(data);
                }else{
                    ecb && ecb(data);
                }
            });
        });
        req.on("error",function(err){
            ecb && ecb(err);
        });
        if((m2m.method.toLowerCase()=="post") || (m2m.method.toLowerCase()=="put")){
            req.write(JSON.stringify(m2m.payload));
        }
        req.end();
    }
}

HTTPCli.https_m2m=function(m2m,scb,ecb){
    if(m2m.method == "GET"){
            request.get({url:"https://"+m2m.host+":"+m2m.port+m2m.uri,
                /*agentOptions: {
                    key : fs.readFileSync(conf.get("secure_m2mcloud")+'/sm2mclient-key.pem').toString(),
                    cert: fs.readFileSync(conf.get("cert")+m2m.dev_id+'/cert.pem').toString(),
                    ca  : fs.readFileSync(conf.get("cert")+m2m.dev_id+'/ca-cert.pem').toString(),
                    checkServerIdentity: function(hostname, cert){
                        return undefined;
                    }
                } */
            },function optionalCallback(err, httpResponse, body) {
                if (err || httpResponse.statusCode!=200) {
                    ecb && ecb(err);
                }
                if(body && httpResponse.statusCode==200){
                    scb && scb(body);
                }
            });
    }else if(m2m.method == "DELETE"){
            request.delete({url:"https://"+m2m.host+":"+m2m.port+m2m.uri,
                /*agentOptions: {
                    key : fs.readFileSync(conf.get("secure_m2mcloud")+'/sm2mclient-key.pem').toString(),
                    cert: fs.readFileSync(conf.get("cert")+m2m.dev_id+'/cert.pem').toString(),
                    ca  : fs.readFileSync(conf.get("cert")+m2m.dev_id+'/ca-cert.pem').toString(),
                    checkServerIdentity: function(hostname, cert){
                        return undefined;
                    }
                } */
            },function optionalCallback(err, httpResponse, body) {
                if (err || httpResponse.statusCode!=200) {
                    ecb && ecb(err);
                }
                if(body && httpResponse.statusCode==200){
                    scb && scb(body);
                }
            });
    }else{
        var opt = {
            host: m2m.host,
            port: m2m.port,
            path: m2m.uri,
            method : m2m.method,
            // key: fs.readFileSync(conf.get("enact_path")+'/client-key.pem').toString(),
            // cert: fs.readFileSync(conf.get("enact_path")+'/enact-crt.pem').toString(),
            headers: {
              'Content-Type'  : 'application/json'
            }
        }
	process.env["NODE_TLS_REJECT_UNAUTHORIZED"] = 0;
         if(m2m.token){
		opt.headers['Authorization'] = 'Basic ' + m2m.token;        
	}
        var req = https.request(opt, function(res){
            res.setEncoding('utf8');
            res.on('data', function(data) {
                if(res.statusCode == 200){
                    scb && scb(data);
                }else{
                    ecb && ecb(data);
                }
            });
        });
        req.on("error",function(err){
            ecb && ecb(err);
        });
        if((m2m.method.toLowerCase()=="post") || (m2m.method.toLowerCase()=="put")){
            req.write(JSON.stringify(m2m.payload));
        }
        req.end();
    }
}


HTTPCli.https_to_SMS = function(m2m,scb,ecb){
    if(m2m.method == "GET"){
            request.get({url:"https://"+m2m.host+":"+m2m.port+m2m.uri,
                /*agentOptions: {
                    key : fs.readFileSync(conf.get("secure_m2mcloud")+'/sm2mclient-key.pem').toString(),
                    cert: fs.readFileSync(conf.get("cert")+m2m.dev_id+'/cert.pem').toString(),
                    ca  : fs.readFileSync(conf.get("cert")+m2m.dev_id+'/ca-cert.pem').toString(),
                    checkServerIdentity: function(hostname, cert){
                        return undefined;
                    }
                } */
		agentOptions: {
	    		rejectUnauthorized: false
  		}

            },function optionalCallback(err, httpResponse, body) {
                if (err || httpResponse.statusCode!=200) {
                    ecb && ecb(err);
                }
                if(body && httpResponse.statusCode==200){
                    scb && scb(httpResponse.socket._httpMessage.path,body);
                }
            });
    }
    else{
        var opt = {
            host: m2m.host,
            port: m2m.port,
            path: m2m.uri,
            method : m2m.method,
            // key: fs.readFileSync(conf.get("enact_path")+'/client-key.pem').toString(),
            // cert: fs.readFileSync(conf.get("enact_path")+'/enact-crt.pem').toString(),
            headers: {
              'Content-Type'  : 'application/json'
            }
        }
        process.env["NODE_TLS_REJECT_UNAUTHORIZED"] = 0;
         if(m2m.token){
        opt.headers['x-access-token'] = m2m.token;
        }
        var req = https.request(opt, function(res){
            res.setEncoding('utf8');
            res.on('data', function(data) {
                if(res.statusCode == 200){
                    scb && scb(data);
                }else{
                    ecb && ecb(data);
                }
            });
        });
        req.on("error",function(err){
            ecb && ecb(err);
        });
        if((m2m.method.toLowerCase()=="post") || (m2m.method.toLowerCase()=="put")){
            req.write(JSON.stringify(m2m.payload));
        }
        req.end();
    }

}

HTTPCli.SMS_OTP = function(m2m,cb){
    var opt = {
        host: m2m.host,
        path: m2m.uri
    };
    callback = function(response) {
        var str = '';
        response.on('data', function (chunk) {
            str += chunk;
        });
        response.on('end', function () {
            cb && cb(str);
        });
    }
    var protocol = (m2m.request_type == 'http') ? http : https;
    protocol.request(opt, callback).end();
}

HTTPCli.whatsapp=function(payload,api_key,secret_key,scb,ecb){
request.post({
    url: 'https://server.gallabox.com/devapi/messages/whatsapp',
    headers: {
              'Content-Type'  : 'application/json',
              'apiKey'       : api_key,
              'apiSecret'    : secret_key
             },
    body: payload,
    json: true
  }, function(error, response, body){
    if(response.statusCode >=200 && response.statusCode <=299){
	scb(response.body,response.statusCode)
     }
     else{
	ecb(response.body,response.statusCode)
     }
});
}

module.exports = HTTPCli;

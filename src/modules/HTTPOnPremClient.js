var http         = require("http"),
    request       = require("request"),
    https         =require("https");

var HTTPCli={};

HTTPCli.M2MReq=function(host, port, method, payload,token,uri){
    this.host=host;
    this.port=port;
    this.method=method;
    this.payload=payload;
    this.token=token;
    this.uri=uri;
    return HTTPCli;
}

HTTPCli.https_m2m=function(m2m,proto,scb,ecb){
    if(m2m.method == "GET"){
        request.get({
            url:`http://${m2m.host}:${m2m.port}${m2m.uri}`,
             headers: {
                'x-access-token':m2m.token,
             },
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
            method : m2m.method.toUpperCase(),
            headers: {
	'Content-Type'  : 'application/json'}
        }
	
          opt.headers['x-access-token'] = m2m.token
	  process.env["NODE_TLS_REJECT_UNAUTHORIZED"] = 0; 
        if (proto=="https"){
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
        }else{
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
        }
        req.on("error",function(err){
            ecb && ecb(err);
        });
        if((m2m.method.toLowerCase()=="post") || (m2m.method.toLowerCase()=="put")){
            req.write(JSON.stringify(m2m.payload));
        }
        req.end();
    }
}

module.exports = HTTPCli;

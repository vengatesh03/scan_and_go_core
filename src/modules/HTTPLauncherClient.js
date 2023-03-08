var https = require("http");
var request = require("request");
var FormData = require('form-data'),
    editJsonFile  = require('edit-json-file'),
    conf          = editJsonFile("/etc/ec/data/platform.json"),
    token         = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJtc29fb3JnX2lkIjoiMzQ0NTQ1NDUiLCJpYXQiOjE2MjMwNDUzNjksImV4cCI6MjM3NDE0NDUzNjl9.aeOgDLeLQfFVEt6HdtwRncuW6PJjxMvnXLdqjE4fcvI"
var HTTPCli={};

HTTPCli.M2MReq=function(host, port, method, payload, payloadFiles,uri){
    this.host=host;
    this.port=port;
    this.method=method;
    this.payload=payload;
    this.payloadFiles=payloadFiles;
    this.uri=uri;
    return HTTPCli;
}

HTTPCli.https_m2m=function(m2m,scb,ecb){
    if(m2m.method == "GET"){
        request.get({
            url:`http://${m2m.host}:${m2m.port}${m2m.uri}`,
             headers: {
                'x-access-token':token,
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
        var formData = new FormData();
        if (m2m.payloadFiles) {
            Object.keys(m2m.payload).forEach(key => formData.append(key, m2m.payload[key]));
            if (m2m.payloadFiles.logo) {
                formData.append('logo',m2m.payloadFiles.logo.data)
            }
            if (m2m.payloadFiles.banner) {
                formData.append('banner',m2m.payloadFiles.banner.data)   
            }
            if (m2m.payloadFiles.brand_logo) {
                formData.append('brand_logo',m2m.payloadFiles.brand_logo.data)   
            }
            if (m2m.payloadFiles.playstore_banner) {
                formData.append('playstore_banner',m2m.payloadFiles.playstore_banner.data)   
            }
            if (m2m.payloadFiles.tv_splash_video) {
                formData.append('tv_splash_video',m2m.payloadFiles.tv_splash_video.data)   
            }
            if (m2m.payloadFiles.mobile_splash_video) {
                formData.append('mobile_splash_video',m2m.payloadFiles.mobile_splash_video.data)   
            }
            if (m2m.payloadFiles.loader) {
                formData.append('loader',m2m.payloadFiles.loader.data)   
            }
            if (m2m.payloadFiles.google_json) {
                formData.append('google_json',m2m.payloadFiles.google_json.data)
            }
	    if (m2m.payloadFiles.Video) {
		formData.append('video',m2m.payloadFiles.Video.data)
	    }
        }
        var opt = {
            host: m2m.host,
            port: m2m.port,
            path: m2m.uri,
            method : m2m.method.toUpperCase(),
            headers: 'application/json'
        }
        if (m2m.payloadFiles) {
            opt.headers = formData.getHeaders();
        }
        opt.headers['x-access-token'] = token
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
            if (m2m.payloadFiles) {
                formData.pipe(req)
            } else {
                req.write(JSON.stringify(m2m.payload));
            }
        }
        req.end();
    }
}

HTTPCli.https_m2m_play=function(m2m,scb,ecb){
        var formData = new FormData();
        if (m2m.payloadFiles) {
            Object.keys(m2m.payload).forEach(key => formData.append(key, m2m.payload[key]));
            if (m2m.payloadFiles.key) {
                formData.append('key',m2m.payloadFiles.key.data)
            }
        }
        var opt = {
            host: m2m.host,
            port: m2m.port,
            path: m2m.uri,
            method : m2m.method.toUpperCase(),
            headers: 'application/json'
        }
        if (m2m.payloadFiles) {
            opt.headers = formData.getHeaders();
        }
         process.env["NODE_TLS_REJECT_UNAUTHORIZED"] = 0; 
        opt.headers['x-access-token'] = token
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
            if (m2m.payloadFiles) {
                formData.pipe(req)
            } else {
                req.write(JSON.stringify(m2m.payload));
            }
        }
        req.end();
    }
module.exports = HTTPCli;

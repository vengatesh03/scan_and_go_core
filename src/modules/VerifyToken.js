var jwt           = require('jsonwebtoken'),
    editJsonFile  = require('edit-json-file'),
    fs            = require('fs');
var config        = require('../config.js'),
    url_conf      = editJsonFile(__root+__core+'api_mapper.json');

var User    = __db_model.User,
    Org     = __db_model.Org,
    ApiLog  = __db_model.ApiLog;

function verifyToken(req, res, next) {
  var token = req.headers['x-access-token'];
    if (!token) {
    return res.status(403).send({ auth: false, message: 'No token provided.' });
  }
  jwt.verify(token, config.secret, function(err, decoded) {      
      if (err) {
        return res.status(401).send({ auth: false, message: 'Failed to authenticate token.' });    
      }
      req.userId = decoded.id;
      req.orgId = decoded.org_id; 
      var url = req.baseUrl;

      var methods = req.method;
      var access_roles = url_conf.get("roles."+url+"."+methods);
      if(!access_roles){
        res.status(500).send({ auth: false, message: 'No route found!' }); 
      }
      var reseller_id = '';
      User.findAll({raw:true,where:{user_id:decoded.id,status:decoded.user_status}}).then(function(user){
	      reseller_id = user[0].reseller_org_id;
        if((user == 0) || (user == null) || (!user)){
          res.status(403).send("No permission  to access");
        }else{
          req.role = user[0].roles
    	  req.username = user[0].username;
          var has_access = false;
          var user_role = user[0]['roles'].split(",");
          loop1:
          for (var i = 0; i < user_role.length; i++) {
             for (var j =0; j < access_roles.length; j++) {
                if(user_role[i] == access_roles[j]){
                  if(methods != 'GET') ApiLog.create({ method : methods , url : url , role : user_role[i]}).then(function(apilog){});
                   getreseller();
                   has_access = true;
                   break loop1; 
                }
             }
          }
	        function getreseller(){
		        if(req.role == 'OPERATOR'){
              Org.findOne({raw:true,where:{reseller_org_id:reseller_id,org_type:"RESELLER"}}).then(function(res_org){
                req.resellerOrgId = res_org.org_id
				        next()
              })
        	  }else{
			        next()
		        }
	        }
          if (!has_access) {
            res.status(403).send({message: 'No permission to access'});
          }
        }
      },function(err){
	console.log("err")
        return res.status(404).send({ auth: false, message: 'No user Found.' });    
      });
  });
}

module.exports = verifyToken;

var jwt           = require('jsonwebtoken'),
    editJsonFile  = require('edit-json-file'),
    conf        = editJsonFile(__root+'config.json');
var Provider    = __db_model.Provider;

function verifySmsToken(req, res, next) {
  var token = req.headers['x-access-token'];
    if (!token) {
    return res.status(403).send({ auth: false, message: 'No token provided.' });
  }
  jwt.verify(token, conf.get("secret"), function(err, decoded) {      
      if (err) {
        return res.status(401).send({ auth: false, message: 'Failed to authenticate token.' });    
      }
      req.provider_id = decoded.provider_id;

      Provider.findOne({raw:true,where:{provider_id:decoded.provider_id}}).then(function(providers){
	if(providers){
             next();
	}else{
		return res.status(404).send({ auth: false, message: 'No provider Found.' }); 
	}
      },function(err){
        return res.status(404).send({ auth: false, message: 'No Provider Found' });    
      });
  });
}

module.exports = verifySmsToken;

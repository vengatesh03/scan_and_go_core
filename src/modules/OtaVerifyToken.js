var jwt           = require('jsonwebtoken'),
    editJsonFile  = require('edit-json-file'),
    fs            = require('fs');
var config        = require('../config.js'),
    url_conf      = editJsonFile(__root+__core+'api_mapper.json');

var EMM    = __db_model.EMM;

function OtaVerifyToken(req, res, next) {
  var token = req.headers['x-access-token'];
    if (!token) {
    return res.status(403).send({ auth: false, message: 'No token provided.' });
  }
  jwt.verify(token, config.secret, function(err, decoded) {      
      if (err) {
        return res.status(401).send({ auth: false, message: 'Failed to authenticate token.' });    
      }
      var unique_id=decoded.unique_id;
      var vendor_code=decoded.vendor_code;
      req.unique_id = unique_id
      EMM.findOne({raw:true,where:{unique_id:unique_id} } ).then(function(emm_data){
        if((emm_data == 0) || (emm_data == null) || (!emm_data)){
          res.status(403).send("No permission  to access");
        }else{
          next();
        }
      },function(err){
        return res.status(404).send({ auth: false, message: 'No Emm Found.' });    
      });
  });
}

module.exports = OtaVerifyToken;



var jwt           = require('jsonwebtoken'),
    editJsonFile  = require('edit-json-file'),
    config        = require(__root+__core+'config.js'),
    fs            = require('fs'),
    Subscription  = __db_model.Subscription,
    AccessLogin   = __db_model.AccessLogin;

function verifyToken(req, res, next) {
	var token = req.headers['x-access-token'];
	if (!token) {
		return res.status(403).send({ auth: false, message: 'No token provided.' });
	}
	jwt.verify(token, config.secret, function(err, decoded) {
		if (err) {
        	return res.status(403).send({ auth: false, message: 'Failed to verify token. Restart the STB. If the problem persists, contact your operator' });
      	}
      	req.subscription_id = decoded.subscription_id;
	req.device_type=req.headers['device-type']
	req.package_name=req.headers['package_name']
	req.device_id=decoded.device_id
	var current_date=new Date()
      	Subscription.findOne({raw:true,where:{subscription_id:decoded.subscription_id}}).then(function(customer){
			if(customer){
				if(customer.status=='Deactive'){return res.status(403).send('Your subscription has expired. Contact your operator')}
				AccessLogin.findOne({raw:true,where:{subscription_id:decoded.subscription_id,device_id:req.device_id,device_type:req.device_type}}).then(function(accesslogin){
					if(accesslogin || req.device_type=='STB'){
						req.operator_id=customer.org_id;
						req.subscriber_name=customer.name;
						next();
					}else{
						res.status(403).send("Inactive Subscription");
					}
				})
			}else {
		            res.status(403).send('No subscriptions found. Please contact your operator');
			}
      	})
	});
}
module.exports = verifyToken;

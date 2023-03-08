var logoutAndDelete = {};
var OperatorToken = __db_model.OperatorToken,
    AccessLogin   = __db_model.AccessLogin,
    Token         = __db_model.Token,
    Subscription  = __db_model.Subscription;

logoutAndDelete.execute = function(subscription_id,device_type,device_id,cb){
  var current_time = new Date()
  var obj = {
    subscription_id:subscription_id,
    expire_on:{[Op.gte]:current_time}        
  }
  OperatorToken.findAll({where:obj,include:[{model:Token,as:'tokenData'}]}).then(function(operatortoken){
    operatortoken.map(function(thing){
      var data = {}
      var ValidFlatScreen = thing.tokenData && thing.tokenData.screen_type == "flat"
      var ValidVariableScreen = thing.tokenData && thing.tokenData.screen_type == 'variable'
      if(ValidFlatScreen){
        data['screens_used'] = (thing.tokenData.screens_used > 0) ? (thing.tokenData.screens_used - 1) : 0
      }else if (ValidVariableScreen){
        if(device_type == 'mobile'){
          data['mobile_screens_used'] = (thing.tokenData.mobile_screens_used > 0) ? (thing.tokenData.mobile_screens_used - 1) : 0
        }else if(device_type == 'tv'){
          data['tv_screens_used'] = (thing.tokenData.tv_screens_used > 0) ? (thing.tokenData.tv_screens_used - 1) : 0
        }
      }
      if(ValidFlatScreen || ValidVariableScreen){
      	Token.update(data,{where:{token_id:thing.tokenData.token_id}}).then(function(update_token){
          if(thing.tokenData.token_mode != 'Default'){
            op_token_obj = {
              subscription_id:subscription_id,
              expire_on:{[Op.gte]:current_time},
              provider_id:thing.tokenData.provider_id
            }
            OperatorToken.destroy({where:op_token_obj}).then(function(optoken){})
          }
      	})
      }
    })
    AccessLogin.destroy({where:{subscription_id:subscription_id,device_id:device_id}}).then(function(access){
    	Subscription.update({status:'Inactive'},{where:{subscription_id:subscription_id}}).then(function(upadte_status){
        	cb(1)
       	})
    }) 
  },function(err){
    cb(0)
  })
}


module.exports = logoutAndDelete;

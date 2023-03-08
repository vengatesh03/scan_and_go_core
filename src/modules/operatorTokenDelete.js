var OperatorTokenDelete={};
var OperatorToken = __db_model.OperatorToken;

OperatorTokenDelete.Remove = function (){
	var current_time = new Date()
	OperatorToken.destroy({where:{expire_on:{[Op.lte]:current_time}}}).then(function(operator_token){
	})
}

module.exports = OperatorTokenDelete;
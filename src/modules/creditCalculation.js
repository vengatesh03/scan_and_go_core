var creditCalculation = {};
var Transaction = __db_model.Transaction;
var OperatorSetting = __db_model.OperatorSetting;
creditCalculation.Calculate = function(obj, cb){
  function isEmpty(obj) {
    for(var key in obj) {
      if(obj.hasOwnProperty(key))
      return false;
    }
    return true;
  }
  
  var flag = false
  obj['criteria']='Direct'
  var current_date = new Date()
  OperatorSetting.findOne({raw:true,where:{org_id:obj.org_id}}).then(function(oper){
    if(!oper){
       cb({status:500,msg:"No OperatorSetting found for this reseller. Please contact them"});
     }
     else{
      oper.moq_slab_list = oper.moq_slab_list
      if(oper.moq_slab_list && oper.moq_slab_list.length > 0){
        loop1:
        for (var i = 0; i < (oper.moq_slab_list).length; i++) {
          var data = oper.moq_slab_list[i];
          if((current_date.getTime() >= (new Date(data.start_date)).getTime()) && (current_date.getTime() <= (new Date(data.end_date)).getTime())){
            var object = {
              'criteria'  : 'Direct',
              'status'    : 'Approved',
              'org_id'    : obj.org_id,
              'time_stamp': {
                [Op.between]: [data.start_date, data.end_date]
              },
            }
            flag = true
            get_transaction(object, data, oper);
            break loop1;
          }
          if(i == (oper.moq_slab_list.length-1)){
            if(!flag){
              get_transaction({},{},{});
            }
          }
        }
      }else{
        get_transaction({},{},{});
      }
    }
  })
  function get_transaction(input, oper_data, oper) {
    if (input && !isEmpty(input)){
      Transaction.findAll({raw:true,where:input,order:[['createdAt','ASC']]}).then(function(trans){
        var array = {credit:0,debit:0}
        if(trans.length > 0){
          var moq_flag = false
          trans.map(function(item){
            if(item.type == 'Credit'){
              if(item.is_moq) moq_flag = true
              array.credit = array.credit + item.total_amount;
            }
            else if(item.type == 'Debit'){
              array.debit = array.debit + item.total_amount;
            }
          })
          var available_amount = (array.credit - array.debit)
          cb({status:200,msg:{'object':available_amount,'status':'success'}});
          
          if(!moq_flag) {
            creditCalculation.getCarryForward(oper_data,oper,callbk)
            function callbk(output) {
              cb(output);
            }
          }
        }else{
          creditCalculation.getCarryForward(oper_data,oper,callbk)
          function callbk(output) {
            cb(output);
          }
        }
      },function(err){
        cb({status:500,msg:"There was a problem in finding the Transaction"});
      })
    }else{
      cb({status:200,msg:{'object':{},'status':'failed'}});
    }
  }
}

creditCalculation.getCarryForward = function(oper_data,oper,callbk){
  var previous_date =  (new Date(oper_data.start_date)).getTime()-1*24*60*60*1000;//next date
  previous_date = new Date(previous_date).setHours(23,59,59,999);
  if(oper.moq_slab_list.length>0){
    var previous_slab_flag = false;
    oper.moq_slab_list.map(function (argument, i) {
      if(new Date(argument.end_date).getTime() == new Date(previous_date).getTime()){
        previous_slab_flag = true;
        var previous_slab = argument;
        var previous_object = {
          'criteria'  : 'Direct',
          'status'    : 'Approved',
          'org_id'    : oper.org_id,
          'time_stamp': {
            [Op.between]: [argument.start_date, argument.end_date]
          }
        }
        Transaction.findAll({raw:true,where:previous_object}).then(function(trans_list){
          var carry_forwarded = 0;
          var previous_moq_cost = 0, previous_debit = 0, previous_credit = 0, previous_not_moq_cost = 0;
          trans_list.map(function(item, i) {
            if(item.is_moq){
              previous_moq_cost = item.total_amount;
            }
            if(!item.is_moq && (item.type == 'Credit')) {
              previous_not_moq_cost = previous_not_moq_cost + item.total_amount;
            }
            if(item.type == 'Debit') {
              previous_debit = previous_debit + item.total_amount;
            }
            if(item.type == 'Credit') {
              previous_credit = previous_credit + item.total_amount;
            }
          })
          if(oper.type == 'OPERATOR' || oper.type == 'HEPI_OPERATOR') {
            if(previous_moq_cost - previous_debit >= 0){
              carry_forwarded = (previous_not_moq_cost);
              callbk({status:200,msg:{'object':{},'carry_forwarded':carry_forwarded,'status':'failed'}});
            }
            else {
              carry_forwarded = (previous_credit-previous_debit);
              callbk({status:200,msg:{'object':{},'carry_forwarded':carry_forwarded,'status':'failed'}});
            }
          }else{
            if(oper.moq_carry_forward){
              carry_forwarded = (previous_credit-previous_debit);
              callbk({status:200,msg:{'object':{},'carry_forwarded':carry_forwarded,'status':'failed'}});
            }else{
              if(previous_moq_cost - previous_debit >= 0){
                carry_forwarded = (previous_not_moq_cost);
                callbk({status:200,msg:{'object':{},'carry_forwarded':carry_forwarded,'status':'failed'}});
              }
              else {
                carry_forwarded = (previous_credit-previous_debit);
                callbk({status:200,msg:{'object':{},'carry_forwarded':carry_forwarded,'status':'failed'}});
              }
            }
          }
        })
      }
      if((i == (oper.moq_slab_list.length -1)) && !previous_slab_flag){
        callbk({status:200,msg:{'object':{},'carry_forwarded':0,'status':'failed'}});
      }
    })
  }else{
    callbk({status:200,msg:{'object':{},'status':'failed'}});
  }
}
module.exports = creditCalculation;


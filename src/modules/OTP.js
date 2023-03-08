var digits       = '0123456789',
    alphabets    = 'abcdefghijklmnopqrstuvwxyz',
    upperCase    = alphabets.toUpperCase(),
    specialChars = '#!&@',
    OTP          = {};

function rand (min, max) {
  var random = Math.random()
  return Math.floor(random * (max - min) + min)
}

 OTP.generate=function(length, options){
    length = length || 10
    var generateOptions = options || {}

    generateOptions.digits = generateOptions.hasOwnProperty('digits') ? options.digits : true
    // generateOptions.alphabets = generateOptions.hasOwnProperty('alphabets') ? options.alphabets : true
    // generateOptions.upperCase = generateOptions.hasOwnProperty('upperCase') ? options.upperCase : true
//    generateOptions.specialChars = generateOptions.hasOwnProperty('specialChars') ? options.specialChars : true

    var allowsChars = ((generateOptions.digits || '') && digits) +
      ((generateOptions.alphabets || '') && alphabets) +
      ((generateOptions.upperCase || '') && upperCase) 
  //    ((generateOptions.specialChars || '') && specialChars)
    var password = ''
    for (var index = 0; index < length; ++index) {
      var charIndex = rand(0, allowsChars.length - 1)
      password += allowsChars[charIndex]
    }
    return password
  }
module.exports=OTP;

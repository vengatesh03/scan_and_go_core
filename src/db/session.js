const Sequelize = require('sequelize-views-support');

module.exports = (sequelize,query,cb) => {
    const Session = sequelize.define('session_info',{
        session_name:Sequelize.STRING,
        contents:Sequelize.JSON
    },{
        timestamps: false,
        createdAt: false,
        updatedAt: false,
        treatAsView: true,      
        viewDefinition: query
    });
    sequelize.sync().then(function() {
        cb(1, Session)
    },function(err){
        cb(0)
    });   
};

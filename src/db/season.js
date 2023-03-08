const Sequelize = require('sequelize-views-support');

module.exports = (sequelize,query,cb) => {
    const Session = sequelize.define('season_data',{
        season:{type:Sequelize.STRING,primaryKey:true},
        contents:{type:Sequelize.JSON}
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

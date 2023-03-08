const Sequelize = require('sequelize-views-support');

module.exports = (sequelize,query,cb) => {
    const Foo = sequelize.define('wt_data',{
        genres:Sequelize.STRING,
        contents:Sequelize.JSON
    },{
        timestamps: false,
        createdAt: false,
        updatedAt: false,
        treatAsView: true,      
        viewDefinition: query
    });
    sequelize.sync().then(function() {
        cb(1, Foo)
    },function(err){
        cb(0)
    });   
};

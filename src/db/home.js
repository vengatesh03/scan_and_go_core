const Sequelize = require('sequelize-views-support');

module.exports = (sequelize,query,cb) => {
    const Home = sequelize.define('homes',{
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
        cb(1, Home)
    },function(err){
        cb(0)
    });
};
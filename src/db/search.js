const Sequelize = require('sequelize-views-support');

module.exports = (sequelize,query,cb) => {
    const Search = sequelize.define('search_data',{
        sc_type:Sequelize.STRING,
        contents:Sequelize.JSON
    },{
        timestamps: false,
        createdAt: false,
        updatedAt: false,
        treatAsView: true,	
        viewDefinition: query
    });
    sequelize.sync().then(function() {
        cb(1, Search)
    },function(err){
        cb(0)
    });   
};
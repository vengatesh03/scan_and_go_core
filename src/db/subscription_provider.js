
const Sequelize = require('sequelize-views-support');

module.exports = (sequelize,query,cb) => {
    const ProviderView = sequelize.define('provider_vws',{
        provider_id:{type:Sequelize.UUID,primaryKey:true},
	brand:{type:Sequelize.STRING},
        screen_type:{type:Sequelize.STRING},
        screens:{type:Sequelize.INTEGER},
        mobile_screens:{type:Sequelize.INTEGER},
        tv_screens:{type:Sequelize.INTEGER},
        method:{type:Sequelize.STRING},
        logo:{type:Sequelize.STRING},
        logo_attached:{type:Sequelize.BOOLEAN},
        expire_on:{type:Sequelize.DATE}
    },{
        timestamps: false,
        createdAt: false,
        updatedAt: false,
        treatAsView: true,	
        viewDefinition: query
    });
    sequelize.sync().then(function() {
        cb(1, ProviderView)
    },function(err){
        cb(0)
    });   
};

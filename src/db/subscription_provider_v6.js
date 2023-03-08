const Sequelize = require('sequelize-views-support');

function getQuery(subscription_id) {
var query ="CREATE OR REPLACE VIEW provider_v6_vws AS "+
"SELECT ps.provider_id as provider_id, "+
"ps.brand as brand, "+
"ps.screen_type as screen_type, "+
"ps.method as method, "+
"ps.logo_url as logo, "+
"ps.attach_logo as logo_attached, "+
"ps.screens as screens, "+
"ps.mobile_screens as mobile_screens, "+
"ps.tv_screens as tv_screens, "+
"ps.default_method as default_method, "+
"s.expires_on as expire_on, "+
"s.mode as mode "+
"FROM (subscriptions s "+
"INNER JOIN subscription_packages sp on s.subscription_id="+"'"+subscription_id+"'"+" and "+
"sp.subscription_id="+"'"+subscription_id+"' "+
"INNER JOIN packages p on p.package_id=sp.package_id "+
"INNER JOIN providers ps ON p.provider_id=ps.provider_id)";
return query;
}

module.exports = (sequelize,subscription_id,cb) => {
    const ProviderView = sequelize.define('provider_v6_vws',{
        provider_id:{type:Sequelize.UUID,primaryKey:true},
        brand:{type:Sequelize.STRING},
        screen_type:{type:Sequelize.STRING},
        screens:{type:Sequelize.INTEGER},
        mobile_screens:{type:Sequelize.INTEGER},
        tv_screens:{type:Sequelize.INTEGER},
        method:{type:Sequelize.STRING},
        logo:{type:Sequelize.STRING},
        logo_attached:{type:Sequelize.BOOLEAN},
        default_method:{type:Sequelize.STRING},
        expire_on:{type:Sequelize.DATE},
        mode:{type:Sequelize.STRING}
    },{
        timestamps: false,
        createdAt: false,
        updatedAt: false,
        treatAsView: true,	
        viewDefinition: getQuery(subscription_id)
    });
    sequelize.sync().then(function() {
        cb(1, ProviderView)
    },function(err){
        cb(0)
    });   
};

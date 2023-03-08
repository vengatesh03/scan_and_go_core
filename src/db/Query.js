const Sequelize = require('sequelize-views-support');
const sequelize =__db_model.sequelize
var provider_sc_type_query='create or replace view provider_sc_types as select bp.id,s.subscription_id as subscription_id,bp.provider_id as provider_id,bp.provider_category as sc_type from subscriptions s inner join subscription_bundles sb on sb.subscription_id=s.subscription_id inner join bundlepackages bp on bp.bundle_id=sb.bundle_id';

var provider_sc_type_package_query='create or replace view provider_sc_type_packages as select sp.id,s.subscription_id as subscription_id,p.provider_id as provider_id,p.provider_category as sc_type from subscriptions s inner join subscription_packages sp on sp.subscription_id=s.subscription_id inner join packages p on sp.package_id=p.package_id';

const ProviderScTypePackage = sequelize.define('provider_sc_type_packages',{
    subscription_id:{type:Sequelize.UUID},
    provider_id:{type:Sequelize.UUID},
    sc_type:{type:Sequelize.STRING}
},{
    timestamps: false,
    createdAt: false,
    updatedAt: false,
    treatAsView: true,
    viewDefinition: provider_sc_type_package_query
});


const ProviderScType = sequelize.define('provider_sc_types',{
        subscription_id:{type:Sequelize.UUID},
    provider_id:{type:Sequelize.UUID},
    sc_type:{type:Sequelize.STRING}
},{
    timestamps: false,
    createdAt: false,
    updatedAt: false,
    treatAsView: true,
    viewDefinition: provider_sc_type_query
});

    const Tvshows_view = sequelize.define('tvshows',{
        genres:Sequelize.STRING,
        contents:Sequelize.JSON
    });
    const Webshows_view = sequelize.define('webshows',{
        genres:Sequelize.STRING,
        contents:Sequelize.JSON
    });
    const Movie_view = sequelize.define('movies', {
        genres: Sequelize.STRING,
        contents: Sequelize.JSON
    });
    const Home_view = sequelize.define('home',{
        sc_type:{type:Sequelize.STRING},
        contents:{type:Sequelize.JSON}
    });
    const Live_view = sequelize.define('live',{
        genres:Sequelize.STRING,
        contents:Sequelize.JSON
    });     
   const Season_view = sequelize.define('seasons',{
        season:{type:Sequelize.STRING,primaryKey:true},
        contents:{type:Sequelize.JSON}
    });
   const Recommentation_view = sequelize.define('recommentation',{
        contents:{type:Sequelize.JSON}
    });
   const Search_view = sequelize.define('search',{
       	genres:Sequelize.STRING,
        contents:Sequelize.JSON
    });
   const OpLive_view = sequelize.define('oplive',{
        genres:Sequelize.STRING,
        contents:Sequelize.JSON
    });
   const OpMovie_view = sequelize.define('opmovies', {
        genres: Sequelize.STRING,
        contents: Sequelize.JSON
    });

module.exports = {
    "Movie_view"    : Movie_view,
    "Tvshows_view"  : Tvshows_view,
    "Webshows_view"  : Webshows_view,
    "Home_view"     : Home_view,
    "Live_view"	    : Live_view,
    "ProviderScType": ProviderScType,
    "Season_view"   : Season_view,
    "Search_view"   : Search_view,
    "Recommentation_view":Recommentation_view,
    "OpLive_view":OpLive_view,
    "OpMovie_view":OpMovie_view,
    "ProviderScTypePackage" : ProviderScTypePackage
}

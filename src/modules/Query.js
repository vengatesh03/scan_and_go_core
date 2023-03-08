const Sequelize = require('sequelize-views-support');
const sequelize =__db_model.sequelize

var provider_sc_type_query=`create or replace view "provider_sc_types" as 
select bp.id,s.subscription_id as subscription_id,
bp.provider_id as provider_id,
bp.provider_category as sc_type
 from subscriptions s
  inner join bundles b on b.bundle_name=s.bundle
   inner join bundlepackages bp on bp.bundle_id=b.bundle_id`;

var movies_query = `
    CREATE OR REPLACE VIEW "movies_data" AS 
SELECT info.id,
    info.genres,
    array_agg(info.contents) AS contents
   FROM ( SELECT genres.id,
            genres.genres,
            contents.rating,
            contents.epoch,
            row_to_json(contents.*) AS contents
           FROM (genres
             JOIN contents ON (contents.language='ta' or contents.language='hi') and (contents.genres LIKE CONCAT('%',genres.genres,'%') AND contents.sc_type='MV'))
          ORDER BY contents.epoch DESC) info
  GROUP BY info.id, info.genres
`;
var tvshows_query= `
CREATE OR REPLACE VIEW "tv_data" AS SELECT info.id,
    info.genres,
    array_agg(info.episodes) AS contents
   FROM ( SELECT genres.id,
            genres.genres,
            episodes.releasedate,
            row_to_json(episodes.*) AS episodes
           FROM (genres
             JOIN episodes ON (episodes.language='ta' or episodes.language='en') and (episodes.genres LIKE CONCAT('%',genres.genres,'%')))ORDER BY episodes.releasedate DESC)
             info GROUP BY info.id, info.genres `;
var webshows_query= `
    CREATE OR REPLACE VIEW "web_data" AS 
    SELECT id,genres,array_agg(contents) as contents FROM ( 
    SELECT 
         Genres.id as id,
         Genres.genres,
         Contents.rating,
	 Contents.epoch,
         row_to_json(Contents) as Contents 
    FROM Genres 
    INNER JOIN Contents ON Contents.genres LIKE CONCAT('%',Genres.genres,'%') AND Contents.sc_type='WS' AND Contents.shows_data_episode=1  ORDER BY Contents.epoch DESC) 
    AS info GROUP BY info.id,info.genres`;        

var homes_query= `
        CREATE OR REPLACE VIEW "home_data"  AS
	SELECT id,sc_type,array_agg(Contents) as Contents FROM (
    	SELECT
            Servicecategorys.id as id,
            Servicecategorys.short_code as sc_type,
            row_to_json(Contents) as Contents
    FROM Servicecategorys INNER JOIN Contents ON Contents.sc_type='MV' OR Contents.sc_type='TS' OR Contents.sc_type='WS' OR Contents.sc_type='LV' ORDER BY Contents.epoch DESC LIMIT 10)
    AS info GROUP BY info.id,info.sc_type ORDER BY info.id ASC LIMIT 40`;

var live_query = `
    CREATE OR REPLACE VIEW "live_data" AS 
SELECT info.id,
    info.genres,
    array_agg(info.contents) AS contents
   FROM ( SELECT genres.id,
            genres.genres,
            contents.rating,
            contents.epoch,
            row_to_json(contents.*) AS contents
           FROM (genres
             JOIN contents ON (contents.genres LIKE CONCAT('%',genres.genres,'%') AND contents.sc_type='LIVE'))) info
  GROUP BY info.id, info.genres
`;
var season_query=`CREATE OR REPLACE VIEW season_data AS
SELECT shows_data_season as season,array_agg(row_to_json(contents) ORDER BY shows_data_episode DESC ) as contents FROM
    contents where (title=title) and (sc_type='TS') group by shows_data_season`;

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
    const Tvshows_view = sequelize.define('tv_data',{
        genres:Sequelize.STRING,
        contents:Sequelize.JSON
    },{
        timestamps: false,
        createdAt: false,
        updatedAt: false,
        treatAsView: true,  
        viewDefinition: tvshows_query
    });
    sequelize.sync().then(function() {
    },function(err){
    });       

    const Webshows_view = sequelize.define('web_data',{
        genres:Sequelize.STRING,
        contents:Sequelize.JSON
    },{
        timestamps: false,
        createdAt: false,
        updatedAt: false,
        treatAsView: true,  
        viewDefinition: webshows_query
    });
    sequelize.sync().then(function() {
    },function(err){
    });       

    const Movie_view = sequelize.define('movies_data', {
        genres: Sequelize.STRING,
        contents: Sequelize.JSON
    }, {
        timestamps: false,
        createdAt: false,
        updatedAt: false,
        treatAsView: true,
        viewDefinition: movies_query
    });
    sequelize.sync().then(function () {
    }, function (err) {
    });
    const Home_view = sequelize.define('home_data',{
        sc_type:{type:Sequelize.STRING},
        contents:{type:Sequelize.JSON}
    },{
        timestamps: false,
        createdAt: false,
        updatedAt: false,
        treatAsView: true,  
        viewDefinition: homes_query
    });
    sequelize.sync().then(function() {
    },function(err){
    });
    const Live_view = sequelize.define('live_data',{
        genres:Sequelize.STRING,
        contents:Sequelize.JSON
    },{
        timestamps: false,
        createdAt: false,
        updatedAt: false,
        treatAsView: true,  
        viewDefinition: live_query
    });
    sequelize.sync().then(function() {
    },function(err){
    });     

const Season_view = sequelize.define('season_data',{
        season:{type:Sequelize.STRING,primaryKey:true},
        contents:{type:Sequelize.JSON}
    },{
        timestamps: false,
        createdAt: false,
        updatedAt: false,
        treatAsView: true,      
        viewDefinition: season_query
    });
    sequelize.sync().then(function() {
    },function(err){
    }); 

module.exports = {
    "movie_view"    : Movie_view,
    "tvshows_view"  : Tvshows_view,
    "webshows_view"  : Webshows_view,
    "home_view"     : Home_view,
    "live_view"	    : Live_view,
    "ProviderScType": ProviderScType,
    "Season_view"   : Season_view,
}

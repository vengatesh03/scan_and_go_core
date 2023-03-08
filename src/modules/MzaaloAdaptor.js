var Adapter_mzaalo={}
var editJsonFile=require('edit-json-file');
var mzaalo_movies = editJsonFile(__root + __core + 'mzaalo_movies.json')
var movie_content=mzaalo_movies.get('data');
var language_conf=editJsonFile(__root + __core +'language.json');
var language_mapper=language_conf.get("");
var provider_name='mzaalo';
var Provider=__db_model.Provider;
var Content=__db_model.Content;

function guid() {
    function s4() {
        return Math.floor((1 + Math.random()) * 0x10000)
            .toString(16)
            .substring(1);
    }
    return s4() + s4() + '-' + s4() + '-' + s4() + '-' + s4() + '-' + s4() + s4() + s4();
}

function generateReleaseDateByYear(year){
	const d = new Date();
	d.setDate(1);
	d.setMonth(0);
	d.setFullYear(year);
	return new Date(d).getTime();
}

function converthmstoSeconds(duration_in_hms){	
	var hms = duration_in_hms.split(':'); // split it at the colons
	// minutes are worth 60 seconds. Hours are worth 60 minutes.
	var seconds = (+hms[0]) * 60 * 60 + (+hms[1]) * 60 + (+hms[2]); 
	return seconds;
}

Adapter_mzaalo.saveMovies=function(){
		Provider.findOne({raw:true,where:{brand:{[Op.like]:'%'+provider_name+'%'}}}).then(function(provider_info){
			if(provider_info){
				var provider_id=provider_info.provider_id
				Content.findOne({raw:true,where:{provider_id:provider_id}}).then(function(exist_provider_content){
					if(!exist_provider_content){
						var array=[]
						for (var i = movie_content.length - 1; i >= 0; i--) {
							var index=movie_content[i]
							var language=language_mapper[index.language]
							var images=index.images
							var obj={
								content_id:guid(),
								provider_cid:index.id,
								provider_id:provider_id,
								description:index.description,								
								service_type:'DL',
								language:language,
								audio_lang:language,
								languages_title:language,
								business_type:'basic',
								country:'India',							
								releasedate:generateReleaseDateByYear(index.release_year),
								deeplink_url:index.assetId,
								vertical_image:images['8'],
								horizontal_image:images['13'],								
								banner:images['17'],
								rating:index.rating,
								watchcount:0,
								rank:0,								
								live_status:'ACTIVE',
								is_available:true,
								is_subtitle:false,								
								title:index.title,
								sc_type:'MV',
								genres:index.genre.toString(),
								duration:converthmstoSeconds(index.duration)
							}
							array.push(obj);
						}
						Content.bulkCreate(array).then(function(mzaalo_movie_content){
						},function(err){
						})
					}

				})

			}
		})
}

module.exports=Adapter_mzaalo;

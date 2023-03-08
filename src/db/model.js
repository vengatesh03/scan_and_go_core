const Sequelize = require('sequelize-views-support');
const editJsonFile = require("edit-json-file");
const fs = require('fs');

//Initialize variables
var     conf = require(__root+__core+'config.json');

var db_username         =       conf.db_username,
        db_password             =       conf.db_password,
        db_name                 =       conf.db_name;
if(conf.environment == 'production'){
        var port                =       conf.port,
                host            =   conf.host;
}else{
        var port                =       5432,
                host            =   'localhost';
}


//Declare OperatorAliases
global.Op = Sequelize.Op;

const operatorsAliases = {
	$notIn	: Op.likenotIn,
	$like   : Op.like,
	$gte  	: Op.gte,
	$lte	: Op.lte,
	$lt   	: Op.lt,
	$gt   	: Op.gt,
	$ne   	: Op.ne,
	$or 	: Op.or,
	$eq 	: Op.eq,
	$col    : Op.col,
	$in     : Op.in,
	$any	: Op.any,
	$contains : Op.contains
}

var pool= {
        max: 4,
        min: 0,
        acquire: 120000,
        idle: 10000
    }

var retry= {  
      match: [/Deadlock/i],
      max: 3, // Maximum rety 3 times
      backoffBase: 1000, // Initial backoff duration in ms. Default: 100,
      backoffExponent: 1.5, // Exponent to increase backoff each try. Default: 1.1
    };

var sequelize = new Sequelize('mysql://'+db_username+':'+db_password+'@'+host+':'+port+'/'+db_name,{ define: {charset: 'utf8',collate: 'utf8_general_ci', timestamps: true},logging:false,dialectOptions: {dateStrings: true,typeCast: true},timezone: '+05:30',operatorsAliases,pool:pool,retry:retry});
//Model Initialization
sequelize.sync().then(function() {});


//Location

var Location = sequelize.define('location', {
	location_id     :  {type  :Sequelize.UUID,  defaultValue : Sequelize.UUIDV1, primaryKey : true},
        name             : {type  :Sequelize.STRING },
        image            : {type  : Sequelize.STRING },
        video            : {type  : Sequelize.STRING },
        duration         : {type  :Sequelize.STRING },
        description      : {type  :Sequelize.STRING(1000) },
        horizontal_image : {type  : Sequelize.STRING },
        vertical_image   : {type  : Sequelize.STRING },
	org_id           : { type : Sequelize.UUID}

})




//User Model
var User = sequelize.define('users', {
        user_id                 : { type : Sequelize.UUID, defaultValue : Sequelize.UUIDV1, primaryKey : true},
        org_id                  : { type : Sequelize.UUID },
        reseller_org_id : { type : Sequelize.UUID },
        org_name        : { type : Sequelize.STRING },
        roles           : { type : Sequelize.STRING },
        first_name              : { type : Sequelize.STRING },
        last_name               : { type : Sequelize.STRING },
        password                : { type : Sequelize.STRING },
        username        : { type : Sequelize.STRING, unique : true },
        phone_number    : { type : Sequelize.STRING },
	partner_code	: { type : Sequelize.STRING},
        status                  : { type : Sequelize.BOOLEAN }
});

var Org = sequelize.define('orgs', {
	org_id 			: { type : Sequelize.UUID, defaultValue : Sequelize.UUIDV1, primaryKey : true },
	reseller_org_id : { type : Sequelize.UUID },
	org_name        : { type : Sequelize.STRING, unique : true },
	org_type		: { type : Sequelize.STRING },
	technical_email	: { type : Sequelize.STRING },
	report_email 	: { type : Sequelize.STRING },
	phone_no    	: { type : Sequelize.STRING },
	state			: { type : Sequelize.STRING },
	city			: { type : Sequelize.STRING },
	pincode			: { type : Sequelize.STRING },
	gst_number		: { type : Sequelize.STRING },
	status 			: { type : Sequelize.BOOLEAN },
	set_moq 		: { type : Sequelize.BOOLEAN },
	free_credit  	: { type : Sequelize.BOOLEAN },
	sub_operators   : { type : Sequelize.BOOLEAN },
	enable_vod  	: { type : Sequelize.BOOLEAN },
	ad_provision  	: { type : Sequelize.BOOLEAN },
	short_code  	: { type : Sequelize.STRING },
	ott 			: { type : Sequelize.BOOLEAN },
        iptv 			: { type : Sequelize.BOOLEAN },
	enable_iptv                    : { type : Sequelize.BOOLEAN },
	mso_provider             : { type: Sequelize.STRING} ,
	provider_id		:{ type : Sequelize.UUID },
        access_type_mobile	: { type : Sequelize.BOOLEAN },
        access_type_stb 	: { type : Sequelize.BOOLEAN },
	access_type_tv 	        : { type : Sequelize.BOOLEAN },
	allowed_app 		: { type: Sequelize.BOOLEAN},
        mso                     : { type: Sequelize.BOOLEAN},
        provider_type           : { type: Sequelize.STRING},
	forced_reseller         : { type: Sequelize.BOOLEAN },
	org_status              : { type : Sequelize.BOOLEAN }

});

// Provider Model
var Provider = sequelize.define('providers', {
        provider_id              : { type : Sequelize.UUID, defaultValue : Sequelize.UUIDV1, primaryKey : true },
        company_name     : { type : Sequelize.STRING },
        brand                    : { type : Sequelize.STRING },
        service_type     : { type : Sequelize.STRING },
        service_category : { type : Sequelize.STRING },
        screen_type      : { type : Sequelize.STRING },
        screens                  : { type : Sequelize.INTEGER, defaultValue: 0 },
        mobile_screens   : { type : Sequelize.INTEGER, defaultValue: 0 },
        tv_screens               : { type : Sequelize.INTEGER, defaultValue: 0 },
        method                   : { type : Sequelize.STRING },
        attach_logo      : { type : Sequelize.BOOLEAN },
        logo_url                 : { type : Sequelize.STRING },
        iptv                     : { type : Sequelize.BOOLEAN },        
        sms_host                 : { type : Sequelize.STRING },
        sms_port                 : { type : Sequelize.STRING },
        sms_token                : { type : Sequelize.STRING },
        default_method   : { type : Sequelize.STRING },
        provider_type    : { type : Sequelize.STRING }
});

var LinkAccess = sequelize.define('link_access', {
        link_field                              : { type : Sequelize.STRING },
        link_format                                     : { type : Sequelize.STRING },
        web_link_field                  : { type : Sequelize.STRING },
        web_link_format                         : { type : Sequelize.STRING },
        tv_native_link_field        : { type : Sequelize.STRING },
        tv_native_link_format           : { type : Sequelize.STRING },
        mobile_native_link_field    : { type : Sequelize.STRING },
        mobile_native_link_format       : { type : Sequelize.STRING },
        invoking_method                         : { type : Sequelize.STRING },
        allow_sites                         : { type : Sequelize.STRING(10000) },
        default_screen                          : { type : Sequelize.INTEGER, defaultValue: 0 },
        default_token_mode                      : { type : Sequelize.STRING }
});

var DirectAccess = sequelize.define('direct_access', {
        link_field      : { type : Sequelize.STRING },
        link_format             : { type : Sequelize.STRING },
        play_format             : { type : Sequelize.STRING },
        encrypted       : { type : Sequelize.BOOLEAN },
        drm_license_url : { type : Sequelize.STRING }
});

var InvokingMethod = sequelize.define('invoking_method', {
        org_name                 : { type : Sequelize.STRING },
        org_id                   : { type : Sequelize.UUID },
        mode                     : { type : Sequelize.STRING },
        device_type      : { type : Sequelize.STRING },
        invoking_method  : { type : Sequelize.STRING },
        token_mode               : { type : Sequelize.STRING },
        invoke_screen    : { type : Sequelize.INTEGER },
        service_category : { type : Sequelize.STRING },
    method           : { type : Sequelize.STRING }
});

Provider.hasMany(LinkAccess,{foreignKey:'provider_id',onUpdate:'CASCADE',onDelete:'CASCADE'});
Provider.hasMany(DirectAccess,{foreignKey:'provider_id',onUpdate:'CASCADE',onDelete:'CASCADE'});
Provider.hasMany(InvokingMethod,{foreignKey:'provider_id',onUpdate:'CASCADE',onDelete:'CASCADE'});

// Service Type Model
var ServiceType = sequelize.define('servicetypes', {
        type_id                  : { type : Sequelize.UUID, defaultValue : Sequelize.UUIDV1 },
        type                 : { type : Sequelize.STRING },
        short_code               : { type : Sequelize.STRING }
});

// Service Category Model
var ServiceCategory = sequelize.define('servicecategorys', {
        category_id              : { type : Sequelize.UUID, defaultValue : Sequelize.UUIDV1 },
        type                 : { type : Sequelize.STRING },
        short_code               : { type : Sequelize.STRING },
        filter                   : { type : Sequelize.STRING },
        sort_by                  : { type : Sequelize.STRING }
});

//State & City Model
var State=sequelize.define('states',{
        state_id        : { type:Sequelize.INTEGER,autoIncrement:true,primaryKey:true},
        name            : { type:Sequelize.STRING},
        code            : { type:Sequelize.STRING}
})

var City=sequelize.define('cities',{
        name    : {     type:Sequelize.STRING }
})

State.hasMany(City,{foreignKey:'state_id',onUpdate:'CASCADE',onDelete:'CASCADE'});

var Package = sequelize.define('packages', {
        package_id                      : { type : Sequelize.UUID, defaultValue : Sequelize.UUIDV1 },
        provider_id                     : { type : Sequelize.UUID },
        package_name            : { type : Sequelize.STRING },
        provider_name           : { type : Sequelize.STRING },
        provider_category       : { type : Sequelize.JSON },
        provider_type           : { type : Sequelize.STRING },
        amount                          : { type : Sequelize.FLOAT, defaultValue :0 },
});

var Bundle = sequelize.define('bundle', {
	bundle_id			: { type : Sequelize.UUID, defaultValue : Sequelize.UUIDV1 ,primaryKey:true},
	bundle_name			: { type : Sequelize.STRING(10000) },
	price_one_month		: { type : Sequelize.INTEGER },
	price_three_month	: { type : Sequelize.INTEGER },
	price_six_month		: { type : Sequelize.INTEGER },
	price_twelve_month	: { type : Sequelize.INTEGER },
	moq					: { type : Sequelize.INTEGER },
	add_on 				: { type : Sequelize.BOOLEAN },
	iptv 				: { type : Sequelize.BOOLEAN },
	bundle_type			: { type : Sequelize.STRING, defaultValue :'bundlepackage' },
	bundle_mode 		: { type : Sequelize.STRING },
	bundle_cost 		: { type : Sequelize.INTEGER, defaultValue : 0},
	is_external_packages: { type : Sequelize.BOOLEAN },
        ott_price            :{ type : Sequelize.FLOAT },
        recommend_cost             :{ type : Sequelize.FLOAT },
        seller_cost                :{ type : Sequelize.FLOAT },
	reseller_bundle_type     : { type : Sequelize.STRING },
	org_id                   : { type : Sequelize.UUID },
	operator_margin 	: {type: Sequelize.FLOAT},
	allowed_device		: { type: Sequelize.STRING }
});

var BundlePackage = sequelize.define('bundlepackage', {
        package_id       : {type :Sequelize.UUID },
        package_name     : {type :Sequelize.STRING },
        provider_name    : {type :Sequelize.STRING },
        provider_id      : {type :Sequelize.UUID },
        provider_category: {type :Sequelize.STRING }
})

var BundleExternalPackage = sequelize.define('bundle_external_package', {
        external_app_id : {type :Sequelize.UUID, defaultValue : Sequelize.UUIDV1 },
        name                    : {type :Sequelize.STRING },
        link                    : {type :Sequelize.STRING },
        logo                    : {type :Sequelize.STRING },
        package_name    : {type :Sequelize.STRING }
})

var BundleCustomPackage = sequelize.define('bundle_custom_package', {
        bundle_id               : {type :Sequelize.UUID },
        custom_bundle_id: {type :Sequelize.UUID },
        bundle_name     : {type :Sequelize.STRING },
        bundle_mode     : {type :Sequelize.STRING }
})

var BundleCustomExternalPackage = sequelize.define('bundle_custom_external_package', {
	bundle_id  				 : {type :Sequelize.UUID },
	custom_external_bundle_id: {type :Sequelize.UUID },
	bundle_name 			 : {type :Sequelize.STRING }
})

var BundleResellerCustomPackage = sequelize.define('bundle_reseller_custom_package', {
        bundle_id                : {type :Sequelize.UUID },
        reseller_custom_bundle_id: {type :Sequelize.UUID },
        bundle_name              : {type :Sequelize.STRING },
        bundle_mode              : {type :Sequelize.STRING },
        reseller_bundle_type     : {type :Sequelize.STRING },
	iptv      		 : {type :Sequelize.BOOLEAN }
})

var BundleGroupedPackage = sequelize.define('bundle_grouped_package', {
	bundle_id		: { type :Sequelize.UUID },
	grouped_bundle_id	: { type :Sequelize.UUID },
	bundle_name		: { type :Sequelize.STRING },
	bundle_mode		: { type :Sequelize.STRING },
	iptv			: { type :Sequelize.BOOLEAN }
})

Bundle.hasMany(BundlePackage,{foreignKey:'bundle_id',onUpdate:'CASCADE',onDelete:'CASCADE'});
Bundle.hasMany(BundleExternalPackage,{foreignKey:'bundle_id',onUpdate:'CASCADE',onDelete:'CASCADE'});
Bundle.hasMany(BundleCustomPackage,{foreignKey:'bundle_id',onUpdate:'CASCADE',onDelete:'CASCADE'});
BundleCustomPackage.belongsTo(Bundle,{foreignKey:'custom_bundle_id'});
BundlePackage.belongsTo(Bundle,{foreignKey:'bundle_id'});
Bundle.hasMany(BundleCustomExternalPackage,{foreignKey:'bundle_id',onUpdate:'CASCADE',onDelete:'CASCADE'});
Bundle.hasMany(BundleResellerCustomPackage,{foreignKey:'bundle_id',onUpdate:'CASCADE',onDelete:'CASCADE'});
Bundle.hasMany(BundleGroupedPackage,{foreignKey:'bundle_id',onUpdate:'CASCADE',onDelete:'CASCADE'});

var OperatorSetting = sequelize.define('operatorsetting', {
        org_name                  : { type : Sequelize.STRING, primaryKey : true },
        org_id                    : { type : Sequelize.STRING },
        reseller_org_id           : { type : Sequelize.STRING },
        feed_domain               : { type : Sequelize.STRING},
    sms_host                      : { type : Sequelize.STRING},
    sms_method                    : { type : Sequelize.STRING},
    sms_template                  : { type : Sequelize.STRING(1000) },
        package_name              : { type : Sequelize.STRING},
        concurrent_login      : { type : Sequelize.INTEGER},
        custom_fields             : { type : Sequelize.JSON },
        sms_property              : { type : Sequelize.STRING},
        sms_api_context           : { type : Sequelize.STRING},
        sms_template_key          : { type : Sequelize.STRING},
        type                              : { type : Sequelize.STRING},
        ncf_bundle_id             : { type : Sequelize.UUID},
        ncf                               : { type : Sequelize.FLOAT,defaultValue : 0 },
        ncf_flag                          : { type : Sequelize.BOOLEAN},
        bundle                    : { type : Sequelize.JSON},
        addonbundle               : { type : Sequelize.JSON},
        moqbundle                         : { type : Sequelize.JSON},
        ad_operator_margin        : { type : Sequelize.INTEGER,defaultValue : 0 },
        ad_mso_margin             : { type : Sequelize.INTEGER,defaultValue : 0 },
        ad_sys_margin             : { type : Sequelize.INTEGER,defaultValue : 0 },
        allow_notification    : { type : Sequelize.BOOLEAN},
        reference_name            : { type : Sequelize.STRING},
        allow_operator_content: { type : Sequelize.BOOLEAN},
        allow_essentials          : { type : Sequelize.BOOLEAN, defaultValue : false},
        essential_msg             : { type : Sequelize.STRING},
        short_code                : { type : Sequelize.STRING },
        language                  : { type : Sequelize.JSON },
        request_type              : { type : Sequelize.STRING},
        technical_data            : { type : Sequelize.JSON},
        external_apps             : { type : Sequelize.BOOLEAN},
        allow_for_subscription: { type : Sequelize.BOOLEAN},
        discount                          : { type : Sequelize.INTEGER,defaultValue : 0 },
        enable_bundle_creation: { type : Sequelize.BOOLEAN, defaultValue : false},
        payment_fields            : { type : Sequelize.JSON },
        api_get_payment_link   : { type : Sequelize.STRING },
        api_payment_link_status: { type : Sequelize.STRING },
        moq_slab_name              : { type : Sequelize.STRING },
        moq_cost                           : { type : Sequelize.INTEGER },
        moq_duration               : { type : Sequelize.STRING },
        moq_slab_list              : { type : Sequelize.JSON },
        moq_carry_forward          : { type : Sequelize.BOOLEAN, defaultValue : false },
	enable_reseller_bundle_creation : { type : Sequelize.BOOLEAN },
	whatsapp_number            : { type : Sequelize.STRING },
        pre_activation_flag        : { type : Sequelize.BOOLEAN },
        pre_activation             : { type : Sequelize.JSON },
        is_fixed_rate              : { type : Sequelize.BOOLEAN, defaultValue : false }
})

var SupportSetting = sequelize.define('support_settings', {
        org_name                                        : { type : Sequelize.STRING, primaryKey : true },
        org_id                                          : { type : Sequelize.STRING },
        reseller_org_id                         : { type : Sequelize.STRING },
        description                             : { type : Sequelize.STRING },
        fb_link                                         : { type : Sequelize.STRING },
        youtube_link                            : { type : Sequelize.STRING },
        website_link                            : { type : Sequelize.STRING },
        support_mobile_number           : { type : Sequelize.STRING },
        support_email                           : { type : Sequelize.STRING }
});

//Advertisement Model
var AdvertisementTime = sequelize.define('advertisementtimings', {
                start_time              : { type : Sequelize.TIME },
                end_time                        : { type : Sequelize.TIME },
                duration                        : { type : Sequelize.INTEGER },
                amount                          : { type : Sequelize.INTEGER },
                repetitive_count        : { type : Sequelize.INTEGER },
                displayed_count         : { type : Sequelize.INTEGER ,defaultValue: 0}
        }),

        Timing = sequelize.define('timings', {
                "time"           : Sequelize.STRING
        }),

        OperatorAdvertisementSlot = sequelize.define('operatoradvertisementslots', {
                org_id                      : { type : Sequelize.STRING },
                org_name                        : { type : Sequelize.STRING },
                slot_time                       : { type : Sequelize.STRING },
                duration                        : { type : Sequelize.INTEGER },
                amount                          : { type : Sequelize.INTEGER },
                repetitive_count        : { type : Sequelize.INTEGER }
        }),

        AdvertisementSlot = sequelize.define('advertisementslots', {
                ad_slot_id                      : { type : Sequelize.UUID, defaultValue : Sequelize.UUIDV1,primaryKey : true },
                slot_time                       : { type : Sequelize.STRING, unique : true },
                duration                        : { type : Sequelize.INTEGER },
                amount                          : { type : Sequelize.INTEGER },
                repetitive_count        : { type : Sequelize.INTEGER }
        });

        AdvertisementSlot.hasMany(OperatorAdvertisementSlot,{foreignKey:'ad_slot_id'});

var     Advertisement = sequelize.define('advertisements', {
                advertisement_id                        : { type : Sequelize.UUID, defaultValue : Sequelize.UUIDV1, primaryKey                                                                      : true },
                title                                   : { type : Sequelize.STRING },
            img_url_left                        : { type : Sequelize.STRING },
            img_url_bottom                      : { type : Sequelize.STRING },
                operator_id                             : { type : Sequelize.STRING },
                status                                  : { type : Sequelize.STRING },
                start_date                              : { type : Sequelize.DATE },
                end_date                                : { type : Sequelize.DATE },
                user_id                                 : { type : Sequelize.STRING },
                time                                    : { type : Sequelize.JSON },
                org_name                                        : { type : Sequelize.STRING },
                transaction_id                          : { type : Sequelize.STRING},
                total_amount                            : { type : Sequelize.FLOAT, defaultValue : 0 },
                payable                                         : { type : Sequelize.FLOAT, defaultValue : 0 },
                operator_margin                         : { type : Sequelize.FLOAT, defaultValue : 0 },
                mso_margin                                      : { type : Sequelize.FLOAT, defaultValue : 0 },
                sys_margin                                      : { type : Sequelize.FLOAT, defaultValue : 0 },
                total_amount_include_gst        : { type : Sequelize.FLOAT, defaultValue : 0 },
                payable_include_gst                     : { type : Sequelize.FLOAT, defaultValue : 0 },
                operator_margin_include_gst : { type : Sequelize.FLOAT, defaultValue : 0 },
                mso_margin_include_gst          : { type : Sequelize.FLOAT, defaultValue : 0 },
                sys_margin_include_gst          : { type : Sequelize.FLOAT, defaultValue : 0 }
        });

        Advertisement.hasMany(AdvertisementTime,{foreignKey:'advertisement_id',onDelete: 'CASCADE',onUpdate: 'CASCADE'});

var Transaction = sequelize.define('transaction', {
        trans_id                                : { type : Sequelize.INTEGER, autoIncrement: true , primaryKey : true},
        transaction_id                  : { type : Sequelize.UUID, defaultValue : Sequelize.UUIDV1, primaryKey : true },
        org_id                                  : { type : Sequelize.UUID },
        org_name                                : { type : Sequelize.STRING },
        reseller_org_id                 : { type : Sequelize.UUID },
        bundle                                  : { type : Sequelize.STRING(10000) },
        type                                    : { type : Sequelize.STRING },
        moq                                     : { type : Sequelize.STRING },
        reference_number                : { type : Sequelize.STRING },
        payment_method                  : { type : Sequelize.STRING },
        total_amount                    : { type : Sequelize.FLOAT, defaultValue :0 },
        paid_amount                     : { type : Sequelize.FLOAT, defaultValue :0 },
        receipt_number                  : { type : Sequelize.INTEGER, defaultValue :0 },
        status                                  : { type : Sequelize.STRING },
        retainer_invoice_id     : { type : Sequelize.STRING},
        criteria                                : { type : Sequelize.STRING},
        invoice_acc_id                  : { type : Sequelize.INTEGER},
        invoice_year                    : { type : Sequelize.INTEGER},
        invoice_id                              : { type : Sequelize.STRING},
        time_stamp                              : { type : Sequelize.DATE, defaultValue: Sequelize.NOW() },
        subscription_payment    : { type : Sequelize.INTEGER },
        subscription_payment_id : { type : Sequelize.STRING },
        is_moq                                  : { type : Sequelize.BOOLEAN, defaultValue: false },
        carry_forwarded                 : { type : Sequelize.FLOAT, defaultValue: 0 },
	enable_reseller_bundle_creation : { type : Sequelize.BOOLEAN },
        mobile                                  : { type : Sequelize.STRING},
        mac_address                             : { type :Sequelize.STRING},
        serial_no                               : { type : Sequelize.STRING},
	name					: { type : Sequelize.STRING}

});

var Subscription = sequelize.define('subscription', {
	subscription_id 		: { type : Sequelize.UUID, defaultValue : Sequelize.UUIDV1, primaryKey : true },
	org_id 					: { type : Sequelize.UUID },
	reseller_org_id   		: { type : Sequelize.UUID },
	name 					: { type : Sequelize.STRING },
	mobile 					: { type : Sequelize.STRING ,unique : true},
	email 					: { type : Sequelize.STRING ,unique : true},
	bundle 			 		: { type : Sequelize.STRING },
	mode 			 		: { type : Sequelize.STRING },
	activated_on 		 	: { type : Sequelize.DATE, defaultValue: Sequelize.NOW()},
        expires_on 		 		: { type : Sequelize.DATE },
	status 		 			: { type : Sequelize.STRING },
	serial_no 			    : { type : Sequelize.STRING, unique : true },
	retainer_invoice_id     : { type : Sequelize.STRING },
	autorenewal 		    : { type : Sequelize.BOOLEAN },
	amount 					: { type : Sequelize.FLOAT, defaultValue :0 },
	is_new 		 		    : { type: Sequelize.BOOLEAN,defaultValue:true},
	checkIptv 				: { type :Sequelize.BOOLEAN},
	stb_type             	: { type : Sequelize.STRING },
	mac_address 	  		: { type:Sequelize.STRING},
	stb 	 	 		    : { type : Sequelize.BOOLEAN },
	notification_token      : { type:Sequelize.STRING(1000) },
	app 		 		    : { type  : Sequelize.BOOLEAN },
	renewal_type 			: { type : Sequelize.STRING},
	allowed_device 			: { type : Sequelize.STRING},
	is_active			: { type : Sequelize.BOOLEAN},
        stb_login                       :{ type : Sequelize.INTEGER, defaultValue :0}
});

var SubscriptionBundle = sequelize.define('subscription_bundle', {
        bundle_name                             : { type : Sequelize.STRING },
        bundle_id                               : { type : Sequelize.UUID },
        addon                                   : { type : Sequelize.BOOLEAN },
        base                                    : { type : Sequelize.BOOLEAN },
        addon_status                    : { type : Sequelize.STRING },
        non_iptv_status                 : { type : Sequelize.STRING, defaultValue : 'Active' },
        retainer_invoice_id     : { type : Sequelize.STRING },
        iptv                                : { type : Sequelize.BOOLEAN },
        org_id                                  : { type : Sequelize.UUID },
        bundle_status                   : { type : Sequelize.STRING}
});

var SubscriptionPackage = sequelize.define('subscription_package', {
        subscription_id                 : { type : Sequelize.UUID },
        package_id                              : { type : Sequelize.UUID },
        bundle_id                               : { type : Sequelize.UUID },
        provider_id                             : { type : Sequelize.UUID },
        expiry_date                             : { type : Sequelize.DATE }
});

var AccessLogin = sequelize.define("accesslogin",{
        otp                      : { type : Sequelize.STRING },
        device_id                : { type : Sequelize.STRING },
        device_type              : { type : Sequelize.STRING },
        expires_on               : { type : Sequelize.DATE },
        phone_number             : { type : Sequelize.STRING },
        org_id                   : { type : Sequelize.UUID }
});

var ActiveLogin = sequelize.define("activelogin",{
    device_type             : { type : Sequelize.STRING },
    device_id               : { type : Sequelize.STRING },
    phone_number            : { type : Sequelize.STRING },
    serial_no               : { type : Sequelize.STRING },
    org_id                  : { type : Sequelize.UUID }
})

Subscription.hasMany(AccessLogin,{foreignKey:'subscription_id',onDelete:'CASCADE',onUpdate:'CASCADE'})
Subscription.hasMany(SubscriptionBundle,{foreignKey:'subscription_id',onDelete:'CASCADE',onUpdate:'CASCADE'})
SubscriptionBundle.belongsTo(Subscription,{foreignKey:'subscription_id'})
Subscription.belongsTo(Org,{foreignKey:'org_id', as:'subscriberOrg'});
SubscriptionBundle.belongsTo(Bundle,{foreignKey:'bundle_id'});
Subscription.hasMany(SubscriptionPackage,{foreignKey:'subscription_id',onDelete:'CASCADE',onUpdate:'CASCADE'})
var Renewal = sequelize.define('renewal', {
        subscription_id                 : { type : Sequelize.UUID, defaultValue : Sequelize.UUIDV1 },
        org_id                                  : { type : Sequelize.UUID },
        reseller_org_id                 : { type : Sequelize.UUID },
        name                                    : { type : Sequelize.STRING },
        email                                   : { type : Sequelize.STRING },
        mobile                                  : { type : Sequelize.STRING },
        bundle                                  : { type : Sequelize.STRING },
        mode                                    : { type : Sequelize.STRING },
        activated_on                    : { type : Sequelize.DATE, defaultValue: Sequelize.NOW()},
        expires_on                              : { type : Sequelize.DATE },
        status                                  : { type : Sequelize.STRING },
        retainer_invoice_id     : { type : Sequelize.STRING },
        autorenewal                 : { type : Sequelize.BOOLEAN },
        amount                                  : { type : Sequelize.INTEGER, defaultValue :0 }
});

var OperatorApp=sequelize.define("operatorapp",{
	app_name			: { type:Sequelize.STRING},
	operator_id         : { type:Sequelize.STRING},
	reseller_org_id     : { type:Sequelize.STRING}, 
	package_name		: { type:Sequelize.STRING, unique : true },
	cdn_domain		    : { type:Sequelize.STRING},
	logo_name			: { type:Sequelize.STRING},
	banner_name 		: { type:Sequelize.STRING},
	version_code        : { type:Sequelize.INTEGER},
	version_name        : { type:Sequelize.FLOAT},
	port      	    	: { type:Sequelize.STRING},
	protocol            : { type:Sequelize.STRING},
	brand_color         : { type:Sequelize.STRING},
	app_url             : { type:Sequelize.STRING},
	status			    : { type:Sequelize.STRING},
	splash_screen	    : { type:Sequelize.STRING},
	apk_url 			: { type:Sequelize.STRING},
	org_name			: { type:Sequelize.STRING},
	play_auto_update 	: { type: Sequelize.BOOLEAN,defaultValue:false},
	play_console_account: { type:Sequelize.STRING},
	code_type           : { type:Sequelize.STRING},
	token    			: { type:Sequelize.STRING(1000)},
	dynamic_conf  		: {type:Sequelize.JSON},
	ott_url    : { type:Sequelize.STRING},
        current_version :  { type:Sequelize.STRING}
})


//Notification Model
var Notification = sequelize.define('notifications', {
	notification_id : { type : Sequelize.UUID, defaultValue : Sequelize.UUIDV1 },
	operator_id 	: { type : Sequelize.STRING },
	operator_name 	: { type : Sequelize.STRING },
 	title 	        : { type : Sequelize.STRING },
	notification 	: { type : Sequelize.STRING },
	flag 	        : { type : Sequelize.STRING }
});


var PlayAccount = sequelize.define('playaccount', {
        id             : { type:Sequelize.INTEGER, autoIncrement: true, primaryKey : true},
        account_id     : { type : Sequelize.UUID, defaultValue : Sequelize.UUIDV1, primaryKey:true},
        account_name   : { type : Sequelize.STRING , unique:true }
});

var Language = sequelize.define('languages',{
    language_id    : { type : Sequelize.UUID, defaultValue : Sequelize.UUIDV1 },
        language       : { type : Sequelize.STRING },
        native         : { type : Sequelize.STRING },
        short_code     : { type : Sequelize.STRING },
        logo_url           : { type : Sequelize.STRING },
        selected       : {type : Sequelize.BOOLEAN , defaultValue:false}
});


var Genres = sequelize.define('genres', {
        genres_id      : { type : Sequelize.UUID, defaultValue : Sequelize.UUIDV1},
        genres         : { type : Sequelize.STRING , primaryKey:true},
        order          : { type : Sequelize.INTEGER }
});

var Content = sequelize.define('content', {
        content_id              : { type : Sequelize.STRING, unique:true  },
        provider_cid            : { type : Sequelize.STRING},
        title                   : { type : Sequelize.TEXT},
        description             : { type : Sequelize.TEXT},
        actors                  : { type : Sequelize.STRING(10000)},
        genres                  : { type : Sequelize.STRING},
        sc_type                 : { type : Sequelize.STRING},
        language                : { type : Sequelize.STRING},
        languages_title         : { type : Sequelize.BLOB },
        business_type           : { type : Sequelize.STRING ,defaultValue:'basic'},
        country                 : { type : Sequelize.STRING },
        audio_lang              : { type : Sequelize.STRING },
        provider_id             : { type : Sequelize.UUID },
        link_url                : { type : Sequelize.TEXT},
        web_url                 : { type : Sequelize.TEXT},
        deeplink_url            : { type : Sequelize.TEXT},
        actor_name              : { type : Sequelize.TEXT},
        vertical_image          : { type : Sequelize.TEXT},
        horizontal_image        : { type : Sequelize.TEXT},
                epoch                           : { type : Sequelize.INTEGER},
        releasedate             : { type : Sequelize.BIGINT},
        on_air                  : { type : Sequelize.BOOLEAN},
        banner                  : { type : Sequelize.TEXT},
        rating                  : { type : Sequelize.FLOAT},
        watchcount              : { type : Sequelize.INTEGER},
        rank                    : { type : Sequelize.INTEGER},
        director                : { type : Sequelize.TEXT},
        age_limit               : { type : Sequelize.STRING },
        tags                    : { type : Sequelize.TEXT},
        duration                : { type : Sequelize.INTEGER},
        is_subtitle             : { type : Sequelize.BOOLEAN},
        yt_link                 : { type: Sequelize.STRING},
        yt_upstream             : { type: Sequelize.JSON},
        yt                      : { type: Sequelize.BOOLEAN},
                live_status                     : { type: Sequelize.STRING},
                is_active                       : { type: Sequelize.BOOLEAN,defaultValue:true},
                presets                 : {type: Sequelize.JSON},
                is_banner                       : { type: Sequelize.BOOLEAN,defaultValue:false},
                is_playable             : { type: Sequelize.BOOLEAN,defaultValue:true},
                is_home                         : { type: Sequelize.BOOLEAN,defaultValue:false},
                is_unique                         : { type: Sequelize.BOOLEAN,defaultValue:false},
                media_url:{type:Sequelize.STRING},
                media_url_expire:{type:Sequelize.DATE},
                lcn_number : {type:Sequelize.INTEGER},
		codec     : {type:Sequelize.STRING}
});

var MVMeta = sequelize.define('mv_metas', {
        content_id              : { type : Sequelize.STRING, unique:true  },
        provider_cid            : { type : Sequelize.STRING},
        title                   : { type : Sequelize.TEXT},
        description             : { type : Sequelize.TEXT},
        actors                  : { type : Sequelize.STRING(10000)},
        genres                  : { type : Sequelize.STRING},
        sc_type                 : { type : Sequelize.STRING},
        language                : { type : Sequelize.STRING},
        languages_title         : { type : Sequelize.BLOB },
        business_type           : { type : Sequelize.STRING ,defaultValue:'basic'},
        country                 : { type : Sequelize.STRING },
        audio_lang              : { type : Sequelize.STRING },
        provider_id             : { type : Sequelize.UUID },
        link_url                : { type : Sequelize.TEXT},
        web_url                 : { type : Sequelize.TEXT},
        deeplink_url            : { type : Sequelize.TEXT},
        actor_name              : { type : Sequelize.TEXT},
        vertical_image          : { type : Sequelize.TEXT},
        horizontal_image        : { type : Sequelize.TEXT},
        epoch                   : { type : Sequelize.INTEGER},
        releasedate             : { type : Sequelize.BIGINT},
        on_air                  : { type : Sequelize.BOOLEAN},
        banner                  : { type : Sequelize.TEXT},
        rating                  : { type : Sequelize.FLOAT},
        watchcount              : { type : Sequelize.INTEGER},
        rank                    : { type : Sequelize.INTEGER},
        director                : { type : Sequelize.TEXT},
        age_limit               : { type : Sequelize.STRING },
        tags                    : { type : Sequelize.TEXT},
        duration                : { type : Sequelize.INTEGER},
        is_subtitle             : { type : Sequelize.BOOLEAN},
        yt_link                 : { type: Sequelize.STRING},
        yt                      : { type: Sequelize.BOOLEAN},
        live_status             : { type: Sequelize.STRING},
        is_active               : { type: Sequelize.BOOLEAN,defaultValue:true},
        is_banner               : { type: Sequelize.BOOLEAN,defaultValue:false},
        is_playable             : { type: Sequelize.BOOLEAN,defaultValue:true},
        is_home                 : { type: Sequelize.BOOLEAN,defaultValue:false},
        is_unique               : { type: Sequelize.BOOLEAN,defaultValue:false},
});


var Episode = sequelize.define('episodes', {
        content_id              : { type : Sequelize.STRING, unique:true  },
        provider_cid            : { type : Sequelize.STRING},
        title                   : { type : Sequelize.TEXT},
        description             : { type : Sequelize.TEXT},
        actors                  : { type : Sequelize.STRING(10000)},
        genres                  : { type : Sequelize.STRING},
        service_type            : { type : Sequelize.STRING},
        sc_type                 : { type : Sequelize.STRING},
        language                : { type : Sequelize.STRING},
        languages_title         : { type : Sequelize.BLOB },
        business_type           : { type : Sequelize.STRING ,defaultValue:'basic'},
        country                 : { type : Sequelize.STRING },
        audio_lang              : { type : Sequelize.STRING },
        provider_id             : { type : Sequelize.UUID },
        link_url                : { type : Sequelize.TEXT},
        web_url                 : { type : Sequelize.TEXT},
        deeplink_url            : { type : Sequelize.TEXT},
        actor_name              : { type : Sequelize.TEXT},
        vertical_image          : { type : Sequelize.TEXT},
        horizontal_image        : { type : Sequelize.TEXT},
                epoch                           : { type : Sequelize.INTEGER},
        releasedate             : { type : Sequelize.BIGINT},
        on_air                  : { type : Sequelize.BOOLEAN},
        banner                  : { type : Sequelize.TEXT},
        rating                  : { type : Sequelize.FLOAT},
        watchcount              : { type : Sequelize.INTEGER},
        rank                    : { type : Sequelize.INTEGER},
        director                : { type : Sequelize.TEXT},
        age_limit               : { type : Sequelize.STRING },
        tags                    : { type : Sequelize.TEXT},
        duration                : { type : Sequelize.INTEGER},
        is_subtitle             : { type : Sequelize.BOOLEAN},
        shows_data_title        : { type : Sequelize.TEXT},
        shows_data_season       : { type : Sequelize.TEXT},
        shows_data_episode      : { type : Sequelize.INTEGER},
        shows_data_id           : { type : Sequelize.STRING},
        yt_link                 : { type: Sequelize.STRING},
                live_status                     : { type: Sequelize.STRING},
                is_active                       : { type: Sequelize.BOOLEAN,defaultValue:true},
                is_banner                       : { type: Sequelize.BOOLEAN,defaultValue:false},
                is_playable             : { type: Sequelize.BOOLEAN,defaultValue:true},
                is_home                         : { type: Sequelize.BOOLEAN,defaultValue:false},
                is_unique                         : { type: Sequelize.BOOLEAN,defaultValue:false},
});


var WSMeta = sequelize.define('ws_metas', {
        content_id              : { type : Sequelize.STRING },
        provider_cid            : { type : Sequelize.STRING },
        provider_id             : { type : Sequelize.UUID },
        shows_data_title        : { type : Sequelize.STRING(1000)},
        original_title          : { type : Sequelize.TEXT},
        description             : { type : Sequelize.TEXT },
        actors                  : { type : Sequelize.TEXT},
        genres                  : { type : Sequelize.STRING},
        language                : { type : Sequelize.STRING},
        languages_title         : { type : Sequelize.BLOB },
        business_type           : { type : Sequelize.STRING ,defaultValue:'basic'},
        country                 : { type : Sequelize.STRING },
        audio_lang              : { type : Sequelize.STRING },
        link_url                : { type : Sequelize.TEXT },
        web_url                 : { type : Sequelize.TEXT },
        deeplink_url            : { type : Sequelize.TEXT },
        actor_name              : { type : Sequelize.TEXT },
        vertical_image          : { type : Sequelize.TEXT },
        horizontal_image        : { type : Sequelize.TEXT },
        epoch                   : { type : Sequelize.INTEGER},
        releasedate             : { type : Sequelize.BIGINT},
        on_air                  : { type : Sequelize.BOOLEAN},
        banner                  : { type : Sequelize.TEXT },
        rating                  : { type : Sequelize.FLOAT},
        watchcount              : { type : Sequelize.INTEGER},
        rank                    : { type : Sequelize.INTEGER},
        director                : { type : Sequelize.TEXT },
        age_limit               : { type : Sequelize.STRING },
        tags                    : { type : Sequelize.TEXT },
        duration                : { type : Sequelize.INTEGER},
        is_subtitle             : { type : Sequelize.BOOLEAN},
        sc_type                                 : { type : Sequelize.STRING,defaultValue:'WS'},
        is_active                               : { type: Sequelize.BOOLEAN,defaultValue:true},
        is_banner                               : { type: Sequelize.BOOLEAN,defaultValue:false},
        is_playable                     : { type: Sequelize.BOOLEAN,defaultValue:true},
        is_home                                 : { type: Sequelize.BOOLEAN,defaultValue:false},
        is_unique                         : { type: Sequelize.BOOLEAN,defaultValue:false},
	yt_link                         : { type : Sequelize.STRING}


});

var TSMeta = sequelize.define('ts_metas', {
        content_id              : { type : Sequelize.STRING, unique:true  },
        provider_cid            : { type : Sequelize.STRING},
        title                   : { type : Sequelize.TEXT},
        description             : { type : Sequelize.TEXT},
        actors                  : { type : Sequelize.TEXT},
        genres                  : { type : Sequelize.STRING},
        sc_type                 : { type : Sequelize.STRING,defaultValue:'TS'},
        language                : { type : Sequelize.STRING},
        languages_title         : { type : Sequelize.BLOB },
        business_type           : { type : Sequelize.STRING ,defaultValue:'basic'},
        country                 : { type : Sequelize.STRING },
        audio_lang              : { type : Sequelize.STRING },
        provider_id             : { type : Sequelize.UUID },
        link_url                : { type : Sequelize.TEXT},
        web_url                 : { type : Sequelize.TEXT},
        deeplink_url            : { type : Sequelize.TEXT},
        actor_name              : { type : Sequelize.TEXT},
        vertical_image          : { type : Sequelize.TEXT},
        horizontal_image        : { type : Sequelize.TEXT},
        epoch                   : { type : Sequelize.INTEGER},
        releasedate             : { type : Sequelize.BIGINT},
        on_air                  : { type : Sequelize.BOOLEAN},
        banner                  : { type : Sequelize.TEXT},
        rating                  : { type : Sequelize.FLOAT},
        watchcount              : { type : Sequelize.INTEGER},
        rank                    : { type : Sequelize.INTEGER},
        director                : { type : Sequelize.TEXT},
        age_limit               : { type : Sequelize.STRING },
        tags                    : { type : Sequelize.TEXT},
        duration                : { type : Sequelize.INTEGER},
        is_subtitle             : { type : Sequelize.BOOLEAN},
        shows_data_title        : { type : Sequelize.STRING(1000)},
        shows_data_season       : { type : Sequelize.TEXT},
        shows_data_episode      : { type : Sequelize.INTEGER},
        shows_data_id           : { type : Sequelize.STRING},
        yt_link                 : { type: Sequelize.STRING},
                live_status                     : { type: Sequelize.STRING},
                is_active                       : { type: Sequelize.BOOLEAN,defaultValue:true},
                is_banner                       : { type: Sequelize.BOOLEAN,defaultValue:false},
                is_playable             : { type: Sequelize.BOOLEAN,defaultValue:true},
                is_home                         : { type: Sequelize.BOOLEAN,defaultValue:false},
                is_unique                         : { type: Sequelize.BOOLEAN,defaultValue:false},
});



Genres.hasMany(Content,{foreignKey:'genres'});
Genres.hasMany(WSMeta,{foreignKey:'genres'});
Genres.hasMany(TSMeta,{foreignKey:'genres'});
Genres.hasMany(MVMeta,{foreignKey:'genres'});
Genres.hasMany(Episode,{foreignKey:'genres'});

var Token = sequelize.define('tokens', {
        token_id                        : { type : Sequelize.UUID, defaultValue: Sequelize.UUIDV1, primaryKey:true},
        email                           : { type : Sequelize.STRING},
        token                           : { type : Sequelize.STRING},
        provider_id                     : { type : Sequelize.STRING},
        operator_id                     : { type : Sequelize.UUID},
        screen_type                     : { type : Sequelize.STRING},
        screens                         : { type : Sequelize.INTEGER,defaultValue:0},
        screens_used            : { type : Sequelize.INTEGER,defaultValue:0},
        mobile_screens          : { type : Sequelize.INTEGER,defaultValue:0},
        tv_screens                      : { type : Sequelize.INTEGER,defaultValue:0},
        mobile_screens_used     : { type : Sequelize.INTEGER,defaultValue:0},
        tv_screens_used         : { type : Sequelize.INTEGER,defaultValue:0},
        activated_on            : { type : Sequelize.DATE},
        expire_on                       : { type : Sequelize.DATE},
        service_type            : { type : Sequelize.STRING},
        token_mode          : { type : Sequelize.STRING},
        mode                : { type : Sequelize.STRING}
});

Token.belongsTo(Org,{foreignKey:'operator_id', as:'tokenOrg'});

var OperatorToken = sequelize.define('operator_tokens', {
        token_id                        : { type : Sequelize.UUID},
        token                           : { type : Sequelize.STRING},
        provider_id                     : { type : Sequelize.UUID},
        operator_id                     : { type : Sequelize.UUID},
        subscription_id         : { type : Sequelize.UUID},
        device_type                     : { type : Sequelize.STRING},
        activated_on            : { type : Sequelize.DATE},
        expire_on                       : { type : Sequelize.DATE},
        brand    :{type:Sequelize.STRING}
});

Provider.hasMany(OperatorToken,{foreignKey:'provider_id',onUpdate:'CASCADE',onDelete:'CASCADE'});
OperatorToken.belongsTo(Provider,{foreignKey:'provider_id'});

Token.hasMany(OperatorToken,{foreignKey:'token_id',onUpdate:'CASCADE',onDelete:'CASCADE'});
OperatorToken.belongsTo(Token,{foreignKey:'token_id', as:'tokenData'});

var DirectPlay = sequelize.define('direct_play', {
        direct_play_id          : { type : Sequelize.UUID, defaultValue : Sequelize.UUIDV1 },
        provider                        : { type : Sequelize.STRING},
        context                         : { type : Sequelize.STRING},
        play_template           : { type : Sequelize.STRING(15000)}
});

var Invoice = sequelize.define('invoice', {
        bund_name                       : { type : Sequelize.STRING(10000) },
        mode                            : { type : Sequelize.STRING},
        rate                            : { type : Sequelize.INTEGER, defaultValue :0 },
        quantity                        : { type : Sequelize.INTEGER, defaultValue :0 },
        amt                             : { type : Sequelize.FLOAT, defaultValue :0 },
        status                          : { type : Sequelize.STRING},
        prorated_day            : { type : Sequelize.STRING},
        discount                        : { type : Sequelize.STRING}
});
Transaction.hasMany(Invoice,{foreignKey:'transaction_id',onUpdate:'CASCADE',onDelete:'CASCADE'});
Invoice.belongsTo(Transaction,{foreignKey:'transaction_id'});

var AdminSetting = sequelize.define('admin_setting', {
        admin_setting_id: { type : Sequelize.UUID, defaultValue : Sequelize.UUIDV1 },
        content                 : { type : Sequelize.TEXT }
});


var BillSetting = sequelize.define('bill_setting', {
    bill_setting_id 	   : { type : Sequelize.UUID, defaultValue : Sequelize.UUIDV1 },
    tax_name      		   : { type : Sequelize.STRING },
    sac_code    	       : { type : Sequelize.STRING },
    state         		   : { type : Sequelize.STRING },
    payment_fields 		   : { type : Sequelize.JSON },
	api_get_payment_link   : { type : Sequelize.STRING },
	api_payment_link_status: { type : Sequelize.STRING },
	custom_fields    	   : { type : Sequelize.JSON },
	request_type           : { type : Sequelize.STRING },
	sms_host               : { type : Sequelize.STRING },
    sms_method             : { type : Sequelize.STRING },
    sms_property           : { type : Sequelize.STRING },
    sms_template           : { type : Sequelize.STRING },
    sms_template_key       : { type : Sequelize.STRING },
    sms_api_context        : { type : Sequelize.STRING }
});

var OperatorContent = sequelize.define('operator_content', {
        operator_id              : { type : Sequelize.UUID },
        provider_id              : { type : Sequelize.UUID },
    sc_type                      : { type : Sequelize.STRING },
    title                        : { type : Sequelize.STRING },
    description                  : { type : Sequelize.STRING },
    language                     : { type : Sequelize.STRING },
    genres                       : { type : Sequelize.STRING },
    director                     : { type : Sequelize.STRING },
    actor                        : { type : Sequelize.STRING },
    url                          : { type : Sequelize.STRING },
    url_type                     : { type : Sequelize.STRING },
    age_limit                    : { type : Sequelize.STRING },
    releasedate                  : { type : Sequelize.BIGINT },
    horizontal_image     : { type : Sequelize.STRING },
    vertical_image       : { type : Sequelize.STRING },
    banner_image         : { type : Sequelize.STRING },
    link_url                     : { type : Sequelize.STRING },
    web_url                      : { type : Sequelize.STRING },
    deeplink_url                 : { type : Sequelize.STRING },
    horizontal_image     : { type : Sequelize.STRING },
    vertical_image               : { type : Sequelize.STRING },
    banner_image                 : { type : Sequelize.STRING },
    movie_url                    : { type : Sequelize.STRING },
    content_id                   : { type : Sequelize.UUID },
    is_active                    : { type : Sequelize.BOOLEAN,defaultValue:false}
});

Genres.hasMany(OperatorContent,{foreignKey:'genres'});


var BannerImage = sequelize.define('banner_image', {
        banner_image_id  : { type : Sequelize.UUID, defaultValue : Sequelize.UUIDV1 },
        org_id                   : { type : Sequelize.UUID },
        org_name                 : { type : Sequelize.STRING },
        category         : { type : Sequelize.STRING },
    url                          : { type : Sequelize.JSON },
    is_banner        : { type: Sequelize.BOOLEAN,defaultValue:true},
        is_playable      : { type: Sequelize.BOOLEAN,defaultValue:false},
        is_home                  : { type: Sequelize.BOOLEAN,defaultValue:false}
});

var ProviderPackage = sequelize.define('provider_package', {
        package_id    : { type : Sequelize.UUID , primaryKey : true},
        package_name  : { type : Sequelize.STRING, unique : true },
        provider_id   : { type : Sequelize.UUID },
        amount            : { type : Sequelize.FLOAT, defaultValue:0 },
        status            : { type : Sequelize.BOOLEAN }
});

var ProviderPackageContent = sequelize.define('provider_package_content', {
        is_deleted   : { type : Sequelize.BOOLEAN },
        channel_id   : { type : Sequelize.INTEGER },
        name         : { type : Sequelize.STRING },
	channel_logo : { type : Sequelize.STRING}
});
ProviderPackage.hasMany(ProviderPackageContent,{foreignKey:'package_id',onUpdate:'CASCADE',onDelete:'CASCADE'});

var SyncEvent = sequelize.define('syncevents',{
        provider_id                     : { type : Sequelize.UUID },
        from_sync_time          : { type : Sequelize.DATE },
        stb_created_sync_time   : { type : Sequelize.DATE },
        pack_created_sync_time  : { type : Sequelize.DATE },
        stb_updated_sync_time   : { type : Sequelize.DATE },
        pack_updated_sync_time  : { type : Sequelize.DATE }
})

var EMM=sequelize.define('emms',{
	org_id 			: { type: Sequelize.UUID },
	provider_id			: { type: Sequelize.UUID },
	skie_token  		:  { type:Sequelize.STRING}, 
	vendor_code	  		: { type:Sequelize.STRING},
	unique_id	  		: { type:Sequelize.STRING, unique:true },
	secret_key	  		: { type:Sequelize.STRING},
	subscriber_id 		: { type:Sequelize.STRING },
	subscriber_name   	: { type:Sequelize.STRING},
	location 		  	: { type:Sequelize.STRING},
	org_name   			: { type:Sequelize.STRING},
	model 		  	: { type:Sequelize.STRING},
	make			  	: { type:Sequelize.STRING},
	mac_address 	  	: { type:Sequelize.STRING},
	status 			: { type:Sequelize.STRING,defaultValue:'Fresh'},
	created_timestamp		: { type:Sequelize.DATE,defaultValue:Sequelize.NOW},
	updated_timestamp		: { type:Sequelize.DATE,defaultValue:Sequelize.NOW},
	box_id			: { type:Sequelize.STRING},
	box_no			: {type:Sequelize.STRING},
	version 		: {type:Sequelize.STRING},
	ott_supported           : {type:Sequelize.BOOLEAN},
	resellers_org_id        : { type:Sequelize.UUID},
        resellers_org_name      : { type:Sequelize.STRING},
        roles                   : { type:Sequelize.STRING}
}) 

var ExternalApp=sequelize.define('external_app',{
	external_app_id 	: { type: Sequelize.UUID, defaultValue : Sequelize.UUIDV1 },
	name				: { type: Sequelize.STRING },
	logo	  			: { type:Sequelize.STRING },
	package_name 		: { type:Sequelize.STRING },
	is_mobile 			: { type:Sequelize.BOOLEAN },
	is_tv 				: { type:Sequelize.BOOLEAN },
	mobile_link 		: { type:Sequelize.STRING },
	tv_link 			: { type:Sequelize.STRING },
	monthly_code 		: { type:Sequelize.STRING },
	quarterly_code 		: { type:Sequelize.STRING },
	halfyearly_code		: { type:Sequelize.STRING },
	yearly_code 		: { type:Sequelize.STRING },
	activation_type     : { type:Sequelize.STRING },
	sms_template		  : { type : Sequelize.STRING(1000) },
	instruction_link          : { type:Sequelize.STRING }

}) 

var ExternalAppSubscription = sequelize.define('external_app_subscription', {
        subscription_id : {type :Sequelize.UUID },
        org_id                  : {type :Sequelize.UUID },
        mobile                  : {type :Sequelize.STRING },
        plan                    : {type :Sequelize.STRING },
        email                   : {type :Sequelize.STRING },
        vendor_code     : {type :Sequelize.STRING },
        username                : {type :Sequelize.STRING },
        reference_number: {type :Sequelize.STRING }
})

var CustomerOrganization = sequelize.define('customer_organization', {
        customer_org_id : { type : Sequelize.UUID, defaultValue : Sequelize.UUIDV1, primaryKey : true },
        org_name        : { type : Sequelize.STRING, unique : true },
        technical_email : { type : Sequelize.STRING },
        report_email    : { type : Sequelize.STRING },
        phone_no        : { type : Sequelize.STRING },
        state                   : { type : Sequelize.STRING },
        city                    : { type : Sequelize.STRING },
        pincode                 : { type : Sequelize.STRING },
        gst_number              : { type : Sequelize.STRING },
        short_code      : { type : Sequelize.STRING }
});

var Coupon = sequelize.define('coupon', {
	external_package_name : {type :Sequelize.STRING },
	code 				  : {type :Sequelize.STRING },
	coupon 			   	  : {type :Sequelize.STRING },
	coupon_validity    	  : {type :Sequelize.STRING },
	coupon_inserted_at    : {type :Sequelize.DATE },
	coupon_expired_at 	  : {type :Sequelize.DATE },
	subscribed 			  : {type :Sequelize.BOOLEAN, defaultValue : false },
	issued 				  : {type :Sequelize.BOOLEAN, defaultValue : false },
	external_app_name 	:  {type :Sequelize.STRING }
})

var SubscriberExternalApp = sequelize.define('subscriber_external_app', {
	subscriber_id         : {type :Sequelize.UUID },
	mobile                : {type :Sequelize.STRING },
	external_app_name     : {type :Sequelize.STRING },
	external_package_name : {type :Sequelize.STRING },
	activation_type       : {type :Sequelize.STRING },
	coupon                : {type :Sequelize.STRING },
	mode                  : {type :Sequelize.STRING },
	expiry_date           : {type :Sequelize.DATE },
	is_issued 	      : {type :Sequelize.BOOLEAN} 
})

var Vendor = sequelize.define('vendor', {
	vendor_id			  : { type : Sequelize.UUID, defaultValue : Sequelize.UUIDV1 },
	vendor_name			  : {type :Sequelize.STRING},
	vendor_code			  : {type :Sequelize.STRING},
	make				  : {type :Sequelize.STRING},
	model 				  : {type :Sequelize.STRING},
	ip 					  : {type :Sequelize.STRING},
	manufacture_serial_no : {type :Sequelize.STRING},
    prefix                : {type :Sequelize.STRING},
    starting_serial_no    : {type :Sequelize.STRING}
})
var ReleaseManagement = sequelize.define('release_management', {
	release_id 		 : {type :Sequelize.UUID ,defaultValue: Sequelize.UUIDV1},
	release_platforms: {type :Sequelize.STRING },
	platforms 		 : {type :Sequelize.STRING },
	release_patch 	 : {type :Sequelize.JSON },
	release_version  : {type :Sequelize.STRING },
	release_notes	 : {type :Sequelize.STRING },
	release_date	 : {type :Sequelize.STRING },
	release_priority : {type :Sequelize.STRING },
	tested_production_environment : {type :Sequelize.JSON },
	versions 		 : {type :Sequelize.JSON }
})
var LauncherApp=sequelize.define('launcherapp',{
	otaid 					: { type: Sequelize.UUID },
	org_id 					: { type : Sequelize.STRING,unique: true},
	operator_id             : { type:Sequelize.STRING},
	mso_org_id              : { type:Sequelize.STRING}, 
	org_name				: { type : Sequelize.STRING },
	operator_domain_prefix	: { type : Sequelize.STRING },
	brand_color				: { type : Sequelize.STRING },
	secondary_color			: { type : Sequelize.STRING },
	text_color 				: { type : Sequelize.STRING },
	is_splash_video			: { type : Sequelize.BOOLEAN },
	time_zone 				: { type : Sequelize.STRING},
	type                                : { type : Sequelize.STRING},
	cdn_url 				: { type : Sequelize.STRING},
	timestamp 				: { type : Sequelize.DATE,defaultValue:Sequelize.NOW},
	version 				: { type : Sequelize.STRING},
	status 					: { type : Sequelize.STRING},
	ott_url    				: { type : Sequelize.STRING}
})
var OnPrem=sequelize.define('onprem',{
	onprem_id 		 		: {type :Sequelize.UUID ,defaultValue: Sequelize.UUIDV1},
	operator_id             : { type:Sequelize.STRING},
	mso_org_id              : { type:Sequelize.STRING}, 
	org_name				: { type : Sequelize.STRING },
	access_ip				: { type : Sequelize.STRING },
	access_port				: { type : Sequelize.STRING },
	version					: { type : Sequelize.STRING },
	access_token 			: { type : Sequelize.STRING },
	platform 				: { type : Sequelize.STRING },
	status 					: { type : Sequelize.STRING},
    provider_name           : { type : Sequelize.STRING},
    provider_id             : { type : Sequelize.STRING}
})
var Cloud=sequelize.define('cloud',{
	cloud_id 		 		: {type :Sequelize.UUID ,defaultValue: Sequelize.UUIDV1},
	instance_name           : { type:Sequelize.STRING},
	access_ip				: { type : Sequelize.STRING },
	access_port				: { type : Sequelize.STRING },
	version					: { type : Sequelize.STRING },
	backup_infra_id			: { type : Sequelize.STRING },
	backup_db_id			: { type : Sequelize.STRING },
	version					: { type : Sequelize.STRING },
	access_token 			: { type : Sequelize.STRING },
	platform 				: { type : Sequelize.STRING },
	status 					: { type : Sequelize.STRING}
})

var AllowedApp = sequelize.define('allowedapps' ,{
	app_id    	        : { type :Sequelize.UUID, defaultValue: Sequelize.UUIDV1, primaryKey : true},
	app_name  		: { type : Sequelize.STRING },
	apk_url 	        : { type : Sequelize.STRING },
	app_description   	: { type : Sequelize.STRING },
        version                 : { type : Sequelize.STRING },
	banner_url	        : { type : Sequelize.STRING },
	background_url		: { type : Sequelize.STRING },
	package_name      	: { type : Sequelize.STRING },
	allowed_default   	: { type : Sequelize.BOOLEAN },
	is_allow_all_operator	: { type : Sequelize.BOOLEAN },
        version                 : { type : Sequelize.STRING}
})

var AllowedAppOperator = sequelize.define('allowedappsoperator' , {
	org_id 		: { type : Sequelize.UUID },
 	reseller_org_id   : { type : Sequelize.UUID },
 	org_name 		: { type : Sequelize.STRING },
 	org_type 		: { type : Sequelize.STRING },
})
AllowedApp.hasMany(AllowedAppOperator,{foreignKey:'app_id',onUpdate:'CASCADE',onDelete:'CASCADE'});


var Food = sequelize.define('food' , {
        food_id                 : { type :Sequelize.UUID, defaultValue: Sequelize.UUIDV1, primaryKey : true },        
        name                    : { type : Sequelize.STRING},
        description             : { type : Sequelize.STRING(10000) },
        category                : { type : Sequelize.JSON },
        type                    : { type : Sequelize.STRING },
        price                   : { type : Sequelize.FLOAT },
        horizontal_image        : { type : Sequelize.STRING },
        vertical_image          : { type : Sequelize.STRING },
        video                   : { type : Sequelize.STRING },
        banner                  : { type : Sequelize.STRING },
        image                   : { type : Sequelize.STRING },
	org_id                  : { type : Sequelize.UUID},
	menu_of_the_day		: { type : Sequelize.BOOLEAN }
})

var Service = sequelize.define('service' , {
        service_id              : { type :Sequelize.UUID, defaultValue: Sequelize.UUIDV1, primaryKey : true },
        type                    : { type : Sequelize.STRING },        
        name                    : { type : Sequelize.STRING },
        image                   : { type : Sequelize.STRING },
	org_id                  : { type : Sequelize.UUID}
})

var Room = sequelize.define('room' , {
        room_id              : { type :Sequelize.UUID, defaultValue: Sequelize.UUIDV1, primaryKey : true },
        room_no                    : { type : Sequelize.STRING, unique : true },        
        category                    : { type : Sequelize.STRING },
        stb                   : { type : Sequelize.STRING },
        org_id                  : { type : Sequelize.UUID}
})

var RoomReservation = sequelize.define('room_reservation' , {
        room_reservation_id             : { type :Sequelize.UUID, defaultValue: Sequelize.UUIDV1, primaryKey : true },
        guest_name                      : { type : Sequelize.STRING },        
        room_no                         : { type : Sequelize.STRING },
        mobile_number                   : { type : Sequelize.STRING },
        checkin_time                    : { type : Sequelize.DATE },
        checkout_time                   : { type : Sequelize.DATE },
	org_id                          : { type : Sequelize.UUID}
})

var FoodMeta = sequelize.define('food_meta' , {
    food_meta_id     : { type :Sequelize.UUID, defaultValue: Sequelize.UUIDV1, primaryKey : true },        
    name             : { type : Sequelize.STRING, unique : true},
    description      : { type : Sequelize.STRING(10000) },
    category         : { type : Sequelize.JSON },
    type             : { type : Sequelize.STRING },
    price            : { type : Sequelize.FLOAT },
    horizontal_image : { type : Sequelize.STRING },
    vertical_image   : { type : Sequelize.STRING },
    banner_video     : { type : Sequelize.STRING },
    banner           : { type : Sequelize.STRING },
    image            : { type : Sequelize.STRING }
}) 

var LocationMeta =  sequelize.define('location_meta' , {
    location_meta_id : { type :Sequelize.UUID, defaultValue: Sequelize.UUIDV1, primaryKey : true }, 
    name             : { type : Sequelize.STRING, unique : true},
    image            : { type : Sequelize.STRING },
    horizontal_image : { type : Sequelize.STRING },
    vertical_image   : { type : Sequelize.STRING },  
    video            : { type : Sequelize.STRING },
    banner           : { type : Sequelize.STRING },
    duration         : { type : Sequelize.STRING },
    description      : { type : Sequelize.STRING(1000) },
})       

var ServiceMeta = sequelize.define('service_meta' , {
    service_meta_id : { type :Sequelize.UUID, defaultValue: Sequelize.UUIDV1, primaryKey : true },
    type            : { type : Sequelize.STRING },        
    name            : { type : Sequelize.STRING },
    image           : { type : Sequelize.STRING }
})

var HepiSetting = sequelize.define('hepi_setting', {
    hepi_setting_id : { type :Sequelize.UUID, defaultValue: Sequelize.UUIDV1, primaryKey : true },
    home_welcome    : { type : Sequelize.STRING },
    home_intro      : { type : Sequelize.STRING },
    food_intro      : { type : Sequelize.STRING },
    food_video      : { type : Sequelize.STRING },
    home_video      : { type : Sequelize.STRING },
    org_id          : { type : Sequelize.UUID },
    foodVideoName   : { type : Sequelize.STRING },
    homeVideoName   : { type : Sequelize.STRING },
})


var AllowedAppVendor = sequelize.define('allowedappsvendor', {
	org_id  	    : { type : Sequelize.UUID },
	vendor_code     : { type : Sequelize.STRING },
	vendor_name     : { type : Sequelize.STRING }
})
AllowedApp.hasMany(AllowedAppVendor,{foreignKey:'app_id',onUpdate:'CASCADE',onDelete:'CASCADE'});


var Command = sequelize.define('command' , {
    cmd_id          : { type : Sequelize.UUID, defaultValue: Sequelize.UUIDV1 },
    reference_name  : { type : Sequelize.STRING },
    command         : { type : Sequelize.STRING },
    serial_no       : { type : Sequelize.STRING },
    role            : { type : Sequelize.STRING },
    username        : { type : Sequelize.STRING },
    status          : { type : Sequelize.STRING, defaultValue : 'Initiated'},
    type            : { type : Sequelize.STRING }
})

var PreActiveSubscription = sequelize.define('pre_active_subscription', {
    subscription_id        : { type : Sequelize.UUID, defaultValue : Sequelize.UUIDV1, primaryKey : true},
    entry                  : { type : Sequelize.JSON }
});

var ApiLog = sequelize.define('apilog',  {
        method         :  { type : Sequelize.STRING },
        role           :  { type : Sequelize.STRING },
        url            :  { type : Sequelize.STRING }
})

var PartnerZeeSubscription = sequelize.define('partner_zee_subscription', {
       mobile          : { type : Sequelize.STRING },
       mode            : { type : Sequelize.STRING },
       response        : { type : Sequelize.JSON }
})


module.exports = {
    "User"                                          : User,
    "Org"                                           : Org,
    "State"                                         : State,
    "City"                                          : City,
    "Provider"                                      : Provider,
    "Renewal"                                       : Renewal,
    "ServiceType"                           : ServiceType,
    "ServiceCategory"                       : ServiceCategory,
    "Package"                                       : Package,
    "OperatorApp"                   : OperatorApp,
    "Notification"                  : Notification,
    "Content"                       : Content,
    "Genres"                        : Genres,
    "Bundle"                                        : Bundle,
    "BundlePackage"                         : BundlePackage,
    "OperatorSetting"               : OperatorSetting,
    "SupportSetting"                        : SupportSetting,
    "Timing"                                        : Timing,
    "AdvertisementTime"             : AdvertisementTime,
    "Advertisement"                         : Advertisement,
    "AdvertisementSlot"                     : AdvertisementSlot,
    "OperatorAdvertisementSlot" : OperatorAdvertisementSlot,
    "Transaction"                           : Transaction,
    "Subscription"                          : Subscription,
    "Token"                                         : Token,
    "OperatorToken"                         : OperatorToken,
    "AccessLogin"               : AccessLogin,
    "Language"                  : Language,
    "LinkAccess"                : LinkAccess,
    "DirectAccess"              : DirectAccess,
    "sequelize"                     : sequelize,
    "DirectPlay"                            : DirectPlay,
    "Invoice"                                       : Invoice,
    "AdminSetting"                          : AdminSetting,
    "BillSetting"                           : BillSetting,
    "WSMeta"                                        : WSMeta,
    "OperatorContent"                       : OperatorContent,
    "BannerImage"                           : BannerImage,
    "ProviderPackage"                       : ProviderPackage,
    "SubscriptionBundle"            : SubscriptionBundle,
    "SyncEvent"                                     : SyncEvent,
    "EMM"                                           : EMM,
    "ProviderPackageContent"        : ProviderPackageContent,
    "ExternalApp"                           : ExternalApp,
    "BundleExternalPackage"         : BundleExternalPackage,
    "ExternalAppSubscription"       : ExternalAppSubscription,
	"PlayAccount"               : PlayAccount,
	"InvokingMethod" 			: InvokingMethod,
	"BundleCustomPackage"		: BundleCustomPackage,
	"SubscriptionPackage"		: SubscriptionPackage,
	"BundleCustomExternalPackage":BundleCustomExternalPackage,
	"Coupon" 				    : Coupon,
	"SubscriberExternalApp"		: SubscriberExternalApp,
	"TSMeta"			: TSMeta,
	"MVMeta"			: MVMeta,
	"Episode"			: Episode,
	"Vendor"			: Vendor,
	"LauncherApp"   			: LauncherApp,
	"OnPrem"   					: OnPrem,
	"Cloud"   					: Cloud,
	"ReleaseManagement"			: ReleaseManagement,
	"AllowedApp" 		: AllowedApp,
	"AllowedAppOperator"	: AllowedAppOperator,
	"AllowedAppVendor"      : AllowedAppVendor,
	"CustomerOrganization" 		: CustomerOrganization,
    "ActiveLogin"           : ActiveLogin,
    "BundleResellerCustomPackage": BundleResellerCustomPackage,
	"BundleGroupedPackage"		: BundleGroupedPackage,
    "Command"               : Command,
    "PreActiveSubscription" : PreActiveSubscription,
    "Food"                          : Food,
    "Service"                       : Service,
    "Room"                          : Room,
    "RoomReservation"               : RoomReservation,
    "FoodMeta"                      : FoodMeta,
    "LocationMeta"                  : LocationMeta,
    "ServiceMeta"                   : ServiceMeta,
    "HepiSetting"                   : HepiSetting,
    "ApiLog"                        : ApiLog,
    "Location"                      : Location,
	"LocationMeta"			:LocationMeta,
	"PartnerZeeSubscription" 	: PartnerZeeSubscription
};

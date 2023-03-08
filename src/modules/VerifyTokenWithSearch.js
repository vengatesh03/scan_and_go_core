var jwt = require('jsonwebtoken'),
	config = require(__root + __core + 'config.js'),
	Subscription = __db_model.Subscription,
	OperatorSetting = __db_model.OperatorSetting,
	query_info = require(__root + __core + 'db/Query'),
	ProviderScType = query_info.ProviderScType,
	AccessLogin = __db_model.AccessLogin,
	BundlePackage = __db_model.BundlePackage,
	SubscriptionBundle = __db_model.SubscriptionBundle,
	SubscriptionPackage = __db_model.SubscriptionPackage,
	Package = __db_model.Package,
	BundleResellerCustomPackage = __db_model.BundleResellerCustomPackage;

var D = 'false';


var MAP = {
	'/v1/movies': 'MV',
	'/v1/tvshows': 'TS',
	'/v1/live': 'LIVE',
	'/v1/webseries': 'WS',
	'/v1/recommendation': 'MV',
	'v1/hepi_ott': 'MV,WS',
	'v1/hepi_tv': 'TS'
}

var HOME = '/v1/home'
var SEARCH = '/v1/search'
var SEASON = '/v1/season'
var RECOMMENDATION = '/v1/recommendation'
var SC_LIVE = 'LIVE'
var SC_MV = 'MV'
var SC_TS = 'TS'
var SC_WS = 'WS'


function verifyToken(req, res, next) {
	var context = req.route.path
	var sc_type = MAP[context]
	var token = req.headers['x-access-token'];
	var child_lock = req.headers['child-lock'];
	if (!token) {
		return res.status(403).send({ auth: false, message: 'No token provided.' });
	}
	jwt.verify(token, config.secret, function (err, decoded) {
		if (err) {
			return res.status(403).send({ auth: false, message: 'Failed to verify token. Restart the STB. If the problem persists, contact your operator.' });
		}
		req.userId = decoded.subscription_id;
		var current_date = new Date()
		req.device_type = req.headers['device-type']
		Subscription.findOne({ where: { subscription_id: decoded.subscription_id, expires_on: { [Op.gt]: current_date } }, include: [{ model: SubscriptionBundle }, { model: SubscriptionPackage }] }).then(function (customer) {
			if(!customer) { return res.status(403).send("No subscriptions found. Please contact your operator") }
			if (customer.status.toLowerCase() == 'deactive') return res.status(403).send("Your subscription has expired. Contact your operator")
			OperatorSetting.findOne({ raw: true, where: { org_id: customer.org_id } }).then(function (oper) {
				BundleResellerCustomPackage.findAll({ raw: true }).then(function (bundle_reseller) {
					BundlePackage.findAll({ raw: true }).then(function (bundle_pack) {
						// Package.findAll({raw:true}).then(function(all_package){
						var reseller_flag = (oper.enable_reseller_bundle_creation) ? true : false
						if (customer && (customer.mobile==decoded.phone_number)) {
							var ott_provider_list = [], iptv_provider_list = [], ott_provider = [];
							customer.subscription_bundles.map(function (bundle) {
								if (reseller_flag) {
									var bun_res_filter = bundle_reseller.filter(function (bund_res) {
										return (bund_res.bundle_id == bundle.bundle_id)
									})
									if (bun_res_filter.length > 0) {
										bun_res_filter.map(function (items, y) {
											var pack_filter = bundle_pack.filter(function (packs) {
												return (packs.bundle_id == items.bundle_id)
											})
											if (pack_filter.length > 0) {
												pack_filter.map(function (argument) {
													if (items.iptv) {
														iptv_provider_list.push(argument.provider_id)
													} else {
														ott_provider_list.push(argument.provider_id)
													}
												})
											}
										})
									} else {
										customer.subscription_packages.map(function (package) {
											if (bundle.bundle_id == package.bundle_id) {
												if (bundle.base && ((package.provider_id!='a34ad7f0-5911-11ec-914f-e73555aef273') || req.device_type.toLowerCase()!='stb') ){
													ott_provider_list.push(package.provider_id)
												} else if (bundle.iptv) {
													iptv_provider_list.push(package.provider_id)
												}
											}
										})
									}
								} else {
									customer.subscription_packages.map(function (package) {
										if (bundle.bundle_id == package.bundle_id) {
											if (bundle.base && ((package.provider_id!='a34ad7f0-5911-11ec-914f-e73555aef273') || req.device_type.toLowerCase()!='stb') ){
												ott_provider_list.push(package.provider_id)
											} else if (bundle.iptv) {
												iptv_provider_list.push(package.provider_id)
											}
										}
									})
								}
							})
							if (iptv_provider_list.length > 0) {
								ott_provider_list.map(function (ott) {
									if (iptv_provider_list.length > 0) {
										iptv_provider_list.map(function (iptv) {
											if (ott_provider.indexOf(ott) < 0) {
												if (req.device_type == 'STB') {
													if (iptv != ott) {
														ott_provider.push(ott)
													}
												} else {
													ott_provider.push(ott)
												}
											}
										})
									} else {
										ott_provider.push(ott)
									}
								})
							} else {
								ott_provider = ott_provider_list
							}

							if (customer.status.toLowerCase() == 'deactive') return res.status(403).send("Inactive Subscription,Please contact your operator")
							OperatorSetting.findOne({ raw: true, where: { org_id: customer.org_id } }).then(function (op_setting) {
								var operator_providers = []
								var op_bundle_ids = op_setting.bundle.map(function (item) { return item.bundle_id });
								if (op_setting.addonbundle.length > 0) {
									op_setting.addonbundle.map(function (item) {
										op_bundle_ids.push(item.bundle_id);
									})
								}
								BundlePackage.findAll({ raw: true, where: { bundle_id: op_bundle_ids } }).then(function (op_providers) {
									if (op_providers.length > 0) {
										operator_providers = op_providers.map(function (item) { return item.provider_id });
									}
									AccessLogin.findOne({ raw: true, where: { subscription_id: decoded.subscription_id, device_id: decoded.device_id, device_type: req.device_type } }).then(function (accesslogin) {
										if (accesslogin || req.device_type == 'STB') {
											if (child_lock == "false") {
												var age_limit = ['U', 'U/A', 'A', 'U/A 7+', 'U/A 13+', 'U/A 16+'];
											} else {
												var age_limit = ['U', 'U/A'];
											}
											if (context == SEASON) { return next(); }
											else if (context == HOME || context == SEARCH) {
												var provider_search_obj = {};
												if (!op_setting.allow_essentials) {
													provider_search_obj = { subscription_id: customer.subscription_id };
												}
												ProviderScType.findAll({ where: provider_search_obj }).then(function (providers) {
													var live_provider_ids = []
													var mv_provider_ids = []
													var ts_provider_ids = []
													var ws_provider_ids = []
													if (providers && providers.length > 0) {
														for (var i = providers.length - 1; i >= 0; i--) {
															var index = providers[i]
															var sc_type = index.sc_type
															var provider_id = index.provider_id
															if (ott_provider.includes(provider_id)) {
																if (operator_providers.length == 0 || operator_providers.indexOf(provider_id) > -1) {
																	if (sc_type.includes(SC_LIVE) && live_provider_ids.indexOf(provider_id) === -1) {
																		if (!((customer.mobile == '9888888888' && provider_id == '68ca2410-c793-11eb-b432-cb42e2783b26') ||
																			(customer.mobile == '6565656565' && provider_id == '68ca2410-c793-11eb-b432-cb42e2783b26'))) {
																			live_provider_ids.push(provider_id)
																		}
																	}
																	if (sc_type.includes(SC_MV) && mv_provider_ids.indexOf(provider_id) === -1) {
																		mv_provider_ids.push(provider_id)
																	}
																	if (sc_type.includes(SC_TS) && ts_provider_ids.indexOf(provider_id) === -1) {
																		ts_provider_ids.push(provider_id)
																	}
																	if (sc_type.includes(SC_WS) && ws_provider_ids.indexOf(provider_id) === -1) {
																		ws_provider_ids.push(provider_id)
																	}
																}
															}
														}
														req.live_provider_ids = live_provider_ids;
														req.mv_provider_ids = mv_provider_ids;
														req.ts_provider_ids = ts_provider_ids;
														req.ws_provider_ids = ws_provider_ids;
														if (op_setting.allow_operator_content) {
															req.operator_id = op_setting.org_id
														}
														req.age_limit = age_limit;
														D && console.log("context", context)
														D && console.log("live_provider_ids", live_provider_ids)
														D && console.log("mv_provider_ids", mv_provider_ids)
														D && console.log("ts_provider_ids", ts_provider_ids)
														D && console.log("ws_provider_ids", ws_provider_ids)
														next();

													} else {
														res.status(400).send("Invalid Request!");
													}
												})
											} else {
												var provider_search_obj = {};
												if (!op_setting.allow_essentials) {
													provider_search_obj = { subscription_id: customer.subscription_id, sc_type: { [Op.like]: "%" + sc_type + "%" } };
												}
												ProviderScType.findAll({ where: provider_search_obj, group: ['provider_id'], attributes: ['provider_id'] }).then(function (provider_ids) {
													var provider_id_arr = []
													D && console.log("context", context)
													/*provider_id_arr=provider_ids.map(function(item){
													return item.provider_id
													});*/
													provider_ids.map(function (item) {
														if (ott_provider.includes(item.provider_id)) {
															if (operator_providers.indexOf(item.provider_id) > -1) {
																if (!((customer.mobile == '9888888888' && item.provider_id == '68ca2410-c793-11eb-b432-cb42e2783b26') ||
																	(customer.mobile == '6565656565' && item.provider_id == '68ca2410-c793-11eb-b432-cb42e2783b26'))) {
																	provider_id_arr.push(item.provider_id);
																}
															}
														}
													});
													req.provider_ids = provider_id_arr;
													D && console.log("provider_id_arr", provider_id_arr);
													if (op_setting.allow_operator_content) {
														req.operator_id = op_setting.org_id
													}
													req.age_limit = age_limit;
													if (context != RECOMMENDATION && (!req.query.language || !req.provider_ids)) {
														res.status(400).send("Invalid Request!");
													} else {
														next();
													}
												});
											}
										} else {
											res.status(403).send('Inactive Subscription');
										}
									})
								})
							})
						} else {
							res.status(403).send('No permission to access');
						}
						// })
					})
				})
			})
		},function(err){D && console.log("err",err)})
	});
}

module.exports = verifyToken;

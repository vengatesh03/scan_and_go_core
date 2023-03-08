var jwt = require('jsonwebtoken'),
    editJsonFile = require('edit-json-file'),
    config = require(__root + __core + 'config.js'),
    fs = require('fs'),
    Subscription = __db_model.Subscription,
    AccessLogin = __db_model.AccessLogin,
    OperatorSetting = __db_model.OperatorSetting,
    Provider = __db_model.Provider,
    DirectAccess = __db_model.DirectAccess,
    LinkAccess = __db_model.LinkAccess,
    query_info = require(__root + __core + 'db/Query'),
    ProviderScType = query_info.ProviderScType,
    Org = __db_model.Org,
    SubscriptionBundle = __db_model.SubscriptionBundle,
    Bundle = __db_model.Bundle;

var expired_msg = "You haven't subscribed to this package.Please change the plan and try again!"
function verifyToken(req, res, next) {
    var token = req.headers['x-access-token'];
    if (!token) {
        return res.status(403).send({ auth: false, message: 'No token provided.' });
    }
    jwt.verify(token, config.secret, function (err, decoded) {
        if (err) {
            return res.status(403).send({ auth: false, message: 'Failed to verify token. Restart the STB. If the problem persists, contact your operator' });
        }
        req.subscription_id = decoded.subscription_id;
        req.device_type = req.headers['device-type'];
        req.device_id = decoded.device_id;
        var current_date = new Date();
        var iptv_flag = false;
        var app_flag = true;
        Subscription.findOne({ where: { subscription_id: decoded.subscription_id }, include: [SubscriptionBundle] }).then(function (customer) {
	    if(!customer) { return res.status(403).send("No subscriptions found. Please contact your operator") }
            if (customer && customer.status != 'Pending' && customer.status != 'Deactive' && (customer.mobile==decoded.phone_number)) {
                req.mobile = customer.mobile;
                req.expiry_date = customer.expires_on;
                req.serial_number = customer.serial_no;
                if (customer.status == 'Deactive') { return res.status(403).send('Your subscription has expired. Contact your operator') }
                AccessLogin.findOne({ raw: true, where: { subscription_id: decoded.subscription_id, device_id: decoded.device_id, device_type: req.device_type } }).then(function (accesslogin) {
                    if (accesslogin || req.device_type == 'STB') {
                        var arr = [];
                        customer.subscription_bundles.map(function (bundles) {
                            if (bundles.base) {
                                arr.push(bundles.bundle_id)
                            }
                        })
                        Bundle.findOne({ raw: true, where: { bundle_id: arr } }).then(function (sub_bundle) {
                            var stbAppBundleFlag = sub_bundle && (sub_bundle.allowed_device == 'stb_app') ? true : false;
                            var appBundleFlag = sub_bundle && (sub_bundle.allowed_device == 'only_app') ? true : false;
                            var stbBundleFlag = sub_bundle && (sub_bundle.allowed_device == 'only_stb') ? true : false;
                            if (req.device_type == 'STB') {
                                if(customer.allowed_device == 'mobile+tv+stb'){
                                    app_flag = (stbBundleFlag || stbAppBundleFlag) ? true : false
                                    provider_data(app_flag);
                                }
                                else if(customer.allowed_device == 'stb'){
                                    app_flag = stbBundleFlag ? true : false
                                    provider_data(app_flag);
                                }
                                else{
                                    app_flag = true;
                                    provider_data(app_flag);
                                }
                            } else {
                                if (customer.allowed_device == 'mobile+tv') {
                                    provider_data(app_flag);
                                } else {
                                    app_flag = (appBundleFlag || stbAppBundleFlag) ? true : false
                                    provider_data(app_flag);
                                }
                            }
                            function provider_data(app_flag) {
                                req.operator_id = customer.org_id;
                                OperatorSetting.findOne({ raw: true, where: { org_id: customer.org_id } }).then(function (operatorsetting) {
                                    Org.findOne({ raw: true, where: { org_id: customer.org_id } }).then(function (org) {
                                        var isAllowAll = operatorsetting && operatorsetting.allow_essentials ? true : false;
                                        var support_no = org && org.phone_no ? org.phone_no : null;
                                        var msg = operatorsetting && operatorsetting.essential_msg ? operatorsetting.essential_msg : "";
                                        if (support_no) { msg = msg.replace("[SUPPORT_NO]", support_no) }
                                        Provider.findAll({ include: [{ model: DirectAccess }, { model: LinkAccess }], attributes: ['provider_id', 'method', 'brand', ['attach_logo', 'logo_attached'], ['logo_url', 'logo']] }).then(function (all_providers) {
                                            ProviderScType.findAll({ where: { subscription_id: customer.subscription_id } }).then(function (available_providers) {
                                                var avail_provider_obj = {};

                                                if (available_providers && available_providers.length > 0) {
                                                    for (var j = available_providers.length - 1; j >= 0; j--) {
                                                        var avail_provider_index = available_providers[j]
                                                        var sc_type = avail_provider_index.sc_type.replace(/ /g, '').split(',');
                                                        var provider_id = avail_provider_index.provider_id;
                                                        if (!avail_provider_obj[provider_id]) {
                                                            avail_provider_obj[provider_id] = sc_type;
                                                        }
                                                    }
                                                }

                                                var unallowed_providers = [];
                                                if (operatorsetting && isAllowAll) {
                                                    for (var i = all_providers.length - 1; i >= 0; i--) {
                                                        var all_provider_index = all_providers[i].dataValues;
                                                        var all_providers_provider_id = all_provider_index.provider_id;
                                                        if (!unallowed_providers.some(function (item) { return item.provider_id == all_providers_provider_id }) && !avail_provider_obj[all_providers_provider_id]) {
                                                            var final_obj = {
                                                                "provider_id": all_provider_index.provider_id,
                                                                "token": '',
                                                                "activated_on": new Date(),
                                                                "expire_on": new Date(),
                                                                "method": all_provider_index.method,
                                                                "logo": all_provider_index.logo,
                                                                "logo_attached": all_provider_index.logo_attached ? true : false,
                                                                "brand": all_provider_index.brand,
                                                                "cdn_domain": operatorsetting.feed_domain,
                                                                "link": all_provider_index.link_accesses.length > 0 ? all_provider_index.link_accesses[0] : null,
                                                                "direct": all_provider_index.direct_accesses.length > 0 ? all_provider_index.direct_accesses[0] : null,
                                                                "allowed_service_types": operatorsetting && operatorsetting.allow_operator_content ? ['MV', 'LIVE'] : [],
                                                                "message": msg
                                                            }
                                                            if (all_provider_index.method.toLowerCase().includes('link')) {
                                                                var provider_link_method_info = all_provider_index.link_accesses[0];
                                                                var default_setting = {
                                                                    method: 'Link',
                                                                    link: {
                                                                        invoking_method: provider_link_method_info.invoking_method,
                                                                        allow_sites: provider_link_method_info.allow_sites,
                                                                        link_field: provider_link_method_info.web_link_field,
                                                                        link_format: provider_link_method_info.web_link_format
                                                                    }
                                                                }
                                                                var invoke_methods = {
                                                                    live: default_setting,
                                                                    ws: default_setting,
                                                                    ts: default_setting,
                                                                    mv: default_setting
                                                                }
                                                                final_obj.invoke_methods = invoke_methods

                                                            } else {
                                                                var default_setting = {
                                                                    method: 'Direct',
                                                                    direct: all_provider_index.direct_accesses[0]
                                                                }
                                                                var invoke_methods = {
                                                                    live: default_setting,
                                                                    ws: default_setting,
                                                                    ts: default_setting,
                                                                    mv: default_setting
                                                                }
                                                                final_obj.invoke_methods = invoke_methods

                                                            }
                                                            unallowed_providers.push(final_obj);
                                                        }
                                                    }
                                                } else {
                                                    Provider.findOne({ where: { brand: 'operator' }, include: [{ model: DirectAccess }, { model: LinkAccess }], attributes: ['provider_id', 'method', 'brand', ['attach_logo', 'logo_attached'], ['logo_url', 'logo']] }).then(function (given_provider) {
                                                        var final_content = {
                                                            "provider_id": given_provider.provider_id,
                                                            "token": '',
                                                            "activated_on": new Date(),
                                                            "expire_on": new Date(),
                                                            "method": given_provider.method,
                                                            "logo": given_provider.logo,
                                                            "logo_attached": given_provider.logo_attached ? true : false,
                                                            "brand": given_provider.brand,
                                                            "cdn_domain": operatorsetting.feed_domain,
                                                            "link": given_provider.link_accesses.length > 0 ? given_provider.link_accesses[0] : null,
                                                            "direct": given_provider.direct_accesses.length > 0 ? given_provider.direct_accesses[0] : null,
                                                            "allowed_service_types": operatorsetting && operatorsetting.allow_operator_content ? ['MV', 'LIVE'] : [],
                                                            "message": operatorsetting && operatorsetting.enable_bundle_creation ? expired_msg : msg
                                                        }
                                                        if (given_provider.method.toLowerCase().includes('link')) {
                                                            var provider_link_method_info = given_provider.link_accesses[0];
                                                            var default_setting = {
                                                                method: 'Link',
                                                                link: {
                                                                    invoking_method: provider_link_method_info.invoking_method,
                                                                    allow_sites: provider_link_method_info.allow_sites,
                                                                    link_field: provider_link_method_info.web_link_field,
                                                                    link_format: provider_link_method_info.web_link_format
                                                                }
                                                            }
                                                            var invoke_methods = {
                                                                live: default_setting,
                                                                ws: default_setting,
                                                                ts: default_setting,
                                                                mv: default_setting
                                                            }
                                                            final_content.invoke_methods = invoke_methods
                                                        } else {
                                                            var default_setting = {
                                                                method: 'Direct',
                                                                direct: given_provider.direct_accesses[0]
                                                            }
                                                            var invoke_methods = {
                                                                live: default_setting,
                                                                ws: default_setting,
                                                                ts: default_setting,
                                                                mv: default_setting
                                                            }
                                                            final_content.invoke_methods = invoke_methods
                                                        }
                                                        unallowed_providers.push(final_content);
                                                    })

                                                }
                                                req.allowed_provider_scs = avail_provider_obj;
                                                req.unallowed_providers = unallowed_providers;
                                                req.msg = msg;
                                                if (!app_flag) {
                                                    for (var i in avail_provider_obj) {
                                                        var filter = all_providers.filter(function (prop) {
                                                            return (prop.provider_id == i)
                                                        })
                                                        var plain_data = filter[0].get({ plain: true })
                                                        var final_object = {
                                                            "provider_id": filter[0].provider_id,
                                                            "token": '',
                                                            "activated_on": new Date(),
                                                            "expire_on": new Date(),
                                                            "method": filter[0].method,
                                                            "logo": plain_data.logo,
                                                            "logo_attached": plain_data.logo_attached ? true : false,
                                                            "brand": filter[0].brand,
                                                            "cdn_domain": operatorsetting.feed_domain,
                                                            "link": filter[0].link_accesses.length > 0 ? filter[0].link_accesses[0] : null,
                                                            "direct": filter[0].direct_accesses.length > 0 ? filter[0].direct_accesses[0] : null,
                                                            "allowed_service_types": operatorsetting && operatorsetting.allow_operator_content ? ['MV', 'LIVE'] : [],
                                                            "message": msg
                                                        }
                                                        if (filter && filter.length > 0 && filter[0].method.toLowerCase().includes('link')) {
                                                            var provider_link_method_info = filter[0].link_accesses
                                                            var default_setting = {
                                                                method: 'Link',
                                                                link: {
                                                                    invoking_method: provider_link_method_info.invoking_method,
                                                                    allow_sites: provider_link_method_info.allow_sites,
                                                                    link_field: provider_link_method_info.web_link_field,
                                                                    link_format: provider_link_method_info.web_link_format
                                                                }
                                                            }
                                                            var invoke_methods = {
                                                                live: default_setting,
                                                                ws: default_setting,
                                                                ts: default_setting,
                                                                mv: default_setting
                                                            }
                                                            final_object.invoke_methods = invoke_methods

                                                        } else {
                                                            var default_setting = {
                                                                method: 'Direct',
                                                                direct: filter[0].direct_accesses
                                                            }
                                                            var invoke_methods = {
                                                                live: default_setting,
                                                                ws: default_setting,
                                                                ts: default_setting,
                                                                mv: default_setting
                                                            }
                                                            final_object.invoke_methods = invoke_methods

                                                        }

                                                        unallowed_providers.push(final_object);
                                                    }
                                                    req.allowed_provider_scs = {};
                                                    next();
                                                } else {
                                                    next();
                                                }
                                            })
                                        })
                                    })
                                })

                            }
                        })
                    } else {
                        res.status(403).send('Inactive subscription');
                    }
                });
            } else {
                res.status(403).send('Subscription expired, Please contact your operator');
            }
        })
    });
}
module.exports = verifyToken;

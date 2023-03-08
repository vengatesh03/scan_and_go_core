# To change the datatype of particular column
ALTER TABLE table_name ALTER COLUMN column_name TYPE new_data_type USING column_name::new_data_type;

# Example
ALTER TABLE tokens ALTER COLUMN operator_id TYPE uuid USING operator_id::uuid;

ALTER TABLE operatorapps ADD COLUMN "play_console_account" varchar(255);
ALTER TABLE operatorapps ADD COLUMN "play_auto_update" BOOLEAN DEFAULT FALSE;
ALTER TABLE operatorapps ADD COLUMN "code_type" varchar(255);


ALTER TABLE orgs ADD COLUMN "access_type_mobile" BOOLEAN DEFAULT FALSE;
ALTER TABLE orgs ADD COLUMN "access_type_tv" BOOLEAN DEFAULT FALSE;
ALTER TABLE orgs ADD COLUMN "access_type_stb" BOOLEAN DEFAULT FALSE;

alter table contents add column codec varchar(255);

alter table orgs add column provider_type varchar(255);
alter table packages add column provider_type varchar(255);
alter table providers add column provider_type varchar(255);
alter table bundles add column ott_price float;
alter table bundles add column allowed_device varchar(255);
alter table bundles add column operator_margin float;
alter table bundles add column  recommend_cost float;
alter table bundles add column seller_cost float;
alter table bundles add column reseller_bundle_type varchar(255);
alter table bundles add column org_id uuid;
alter table bundles add column ncf_price float;
alter table operatorsettings add column enable_reseller_bundle_creation tinyint(1);
alter table subscriptions add column allowed_device varchar(255);
alter table emms add column ott_supported tinyint(1);

alter table contents add column codec varchar(255);

New Alter command write in below

Hepi merge
Userselfcare merge

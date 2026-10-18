const { REWARDED_AD_UNIT_PROD, NATIVE_AD_UNIT_PROD } = require('./lib/ads-config');
const { ADS_BANNER_UNIT_ID, ADS_INTERSTITIAL_UNIT_ID } = require('./lib/ads');
console.log('Banner', ADS_BANNER_UNIT_ID);
console.log('Interstitial', ADS_INTERSTITIAL_UNIT_ID);
console.log('Rewarded', REWARDED_AD_UNIT_PROD);
console.log('Native', NATIVE_AD_UNIT_PROD);

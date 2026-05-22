/* ===========================
   Site Configuration
   ===========================
   Update these values when deploying to your domain.
   =========================== */

var SITE_CONFIG = {
  // Update this to your actual domain when deployed
  domain: 'tradingtoolkit.com',
  
  // Google AdSense Publisher ID - update when you get yours
  adsenseId: 'ca-pub-XXXXXXXXXXXXXXXX',
  
  // Site name
  siteName: 'Trading Toolkit',
  
  // Social / Contact email
  contactEmail: 'gamemastergameplayss@gmail.com',
  
  // Whether Google AdSense is enabled
  adsenseEnabled: false,
  
  // Get full URL for a path
  getUrl: function(path) {
    return 'https://' + this.domain + (path || '/');
  }
};

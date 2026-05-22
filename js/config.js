/* ===========================
   Site Configuration
   ===========================
   Update these values when deploying to your domain.
   =========================== */

var SITE_CONFIG = {
  // Live domain
  domain: 'tradingtoolkit.online',
  basePath: '',
  
  // Google AdSense Publisher ID - update when you get yours
  adsenseId: 'ca-pub-8228373593966913',
  
  // Site name
  siteName: 'Trading Toolkit',
  
  // Social / Contact email
  contactEmail: 'gamemastergameplayss@gmail.com',
  
  // Whether Google AdSense is enabled
  adsenseEnabled: true,
  
  // Get full URL for a path
  getUrl: function(path) {
    return 'https://' + this.domain + this.basePath + (path || '/');
  }
};

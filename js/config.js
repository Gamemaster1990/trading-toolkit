/* ===========================
   Site Configuration
   ===========================
   Update these values when deploying to your domain.
   =========================== */

var SITE_CONFIG = {
  // Current live URL (update when you get a custom domain)
  domain: 'gamemaster1990.github.io',
  basePath: '/trading-toolkit',
  
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
    return 'https://' + this.domain + this.basePath + (path || '/');
  }
};

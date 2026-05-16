/**
 * Vercel Speed Insights middleware for Express.js
 * 
 * This middleware injects the Speed Insights script into HTML responses.
 * Since this is primarily a REST API server, this middleware will only
 * activate when HTML content is served.
 * 
 * Usage:
 *   const speedInsights = require('./middleware/speedInsights');
 *   app.use(speedInsights());
 * 
 * For programmatic access to the script tag:
 *   const { getSpeedInsightsScript } = require('./middleware/speedInsights');
 *   const scriptTag = getSpeedInsightsScript();
 */

/**
 * Get the Speed Insights script tag
 * @returns {string} HTML script tag for Speed Insights
 */
function getSpeedInsightsScript() {
  // Use the beforeSend option to enable data collection
  // The script will be loaded from Vercel's CDN after deployment
  return `<script>
  window.si = window.si || function () { (window.siq = window.siq || []).push(arguments); };
</script>
<script defer src="/_vercel/speed-insights/script.js"></script>`;
}

/**
 * Create Speed Insights middleware
 * Injects Speed Insights script into HTML responses
 * 
 * @param {Object} options - Configuration options
 * @param {boolean} options.enabled - Enable/disable the middleware (default: true)
 * @returns {Function} Express middleware function
 */
function createSpeedInsights(options = {}) {
  const enabled = options.enabled !== false;

  return function speedInsightsMiddleware(req, res, next) {
    if (!enabled) {
      return next();
    }

    // Store the original send function
    const originalSend = res.send;

    // Override the send function
    res.send = function (data) {
      // Check if the response is HTML
      const contentType = res.get('Content-Type') || '';
      const isHtml = contentType.includes('text/html');

      // Only inject script into HTML responses
      if (isHtml && typeof data === 'string' && data.includes('</head>')) {
        // Inject the Speed Insights script before </head>
        const scriptTag = getSpeedInsightsScript();
        data = data.replace('</head>', `${scriptTag}\n</head>`);
      }

      // Call the original send function
      return originalSend.call(this, data);
    };

    next();
  };
}

module.exports = createSpeedInsights;
module.exports.getSpeedInsightsScript = getSpeedInsightsScript;

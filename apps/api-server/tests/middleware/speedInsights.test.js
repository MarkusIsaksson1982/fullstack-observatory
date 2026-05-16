const createSpeedInsights = require('../../src/middleware/speedInsights');
const { getSpeedInsightsScript } = require('../../src/middleware/speedInsights');

describe('Speed Insights Middleware', () => {
  describe('getSpeedInsightsScript', () => {
    it('should return the Speed Insights script tag', () => {
      const script = getSpeedInsightsScript();
      expect(script).toContain('window.si');
      expect(script).toContain('/_vercel/speed-insights/script.js');
      expect(script).toContain('<script');
    });
  });

  describe('middleware', () => {
    it('should inject script into HTML responses', () => {
      const middleware = createSpeedInsights();
      const req = {};
      let sentData;
      const res = {
        get: jest.fn(() => 'text/html'),
        send: jest.fn(function(data) {
          sentData = data;
          return this;
        })
      };
      const next = jest.fn();

      // Store original send
      const originalSend = res.send;

      // Call middleware
      middleware(req, res, next);

      // Verify next was called
      expect(next).toHaveBeenCalled();

      // Verify send was replaced
      expect(res.send).not.toBe(originalSend);

      // Test HTML injection
      const html = '<html><head></head><body>Test</body></html>';
      res.send(html);

      // Verify script was injected
      expect(sentData).toContain('window.si');
      expect(sentData).toContain('/_vercel/speed-insights/script.js');
      expect(sentData).toContain('</head>');
    });

    it('should not modify non-HTML responses', () => {
      const middleware = createSpeedInsights();
      const req = {};
      let sentData;
      const res = {
        get: jest.fn(() => 'application/json'),
        send: jest.fn(function(data) {
          sentData = data;
          return this;
        })
      };
      const next = jest.fn();

      // Call middleware
      middleware(req, res, next);

      // Test JSON response
      const json = JSON.stringify({ data: 'test' });
      res.send(json);

      // Verify script was NOT injected
      expect(sentData).toBe(json);
      expect(sentData).not.toContain('window.si');
    });

    it('should not modify HTML without head tag', () => {
      const middleware = createSpeedInsights();
      const req = {};
      let sentData;
      const res = {
        get: jest.fn(() => 'text/html'),
        send: jest.fn(function(data) {
          sentData = data;
          return this;
        })
      };
      const next = jest.fn();

      // Call middleware
      middleware(req, res, next);

      // Test HTML without head tag
      const html = '<div>Test</div>';
      res.send(html);

      // Verify script was NOT injected
      expect(sentData).toBe(html);
      expect(sentData).not.toContain('window.si');
    });

    it('should respect enabled option', () => {
      const middleware = createSpeedInsights({ enabled: false });
      const req = {};
      const res = {
        get: jest.fn(),
        send: jest.fn()
      };
      const next = jest.fn();

      // Store original send
      const originalSend = res.send;

      // Call middleware
      middleware(req, res, next);

      // Verify next was called
      expect(next).toHaveBeenCalled();

      // Verify send was NOT replaced when disabled
      expect(res.send).toBe(originalSend);
      expect(res.get).not.toHaveBeenCalled();
    });
  });
});

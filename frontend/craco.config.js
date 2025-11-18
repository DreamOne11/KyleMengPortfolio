module.exports = {
  webpack: {
    configure: (webpackConfig) => {
      // 忽略特定包的 source map 警告
      webpackConfig.ignoreWarnings = [
        function ignoreSourcemapsloaderWarnings(warning) {
          return (
            warning.module &&
            warning.module.resource.includes('@mediapipe/tasks-vision') &&
            warning.details &&
            warning.details.includes('source map')
          );
        },
      ];
      
      return webpackConfig;
    }
  },
  devServer: {
    proxy: {
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true,
        secure: false,
        onError: function (err, req, res) {
          console.log('Proxy Error:', err);
        },
        onProxyReq: function (proxyReq, req, res) {
          console.log('Proxying request:', req.method, req.url);
        }
      }
    }
  }
}; 
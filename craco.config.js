const config = {
    webpack: {
      configure: {
        module: {
          rules: [
            {
              test: /\.m?js/,
              resolve: {
                fullySpecified: false,
              },
            },
          ],
        },
        ignoreWarnings: [/Failed to parse source map/],
      },
    },
  };

  module.exports = config;
  
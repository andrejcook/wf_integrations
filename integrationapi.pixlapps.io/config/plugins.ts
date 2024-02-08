module.exports = ({ env }) => ({
  // ..
  transformer: {
    enabled: true,
    config: {
      responseTransforms: {
        removeAttributesKey: true,
        removeDataKey: true,
      },
    },
  },
  ckeditor: {
    enabled: true,
  },
  "strapi-plugin-content-manager": {
    visible: false,
  },
  email: {
    config: {
      provider: "sendgrid",
      providerOptions: {
        apiKey: env("SENDGRID_API_KEY"),
      },
      settings: {
        defaultFrom: "noreply@pixlapps.io",
        defaultReplyTo: "noreply@pixlapps.io",
      },
    },
  },
  upload: {
    config: {
      breakpoints: {},
    },
  },
  // ..
});

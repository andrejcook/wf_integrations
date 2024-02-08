export default ({ env }) => [
  "strapi::errors",
  "strapi::security",
  "strapi::cors",
  "strapi::logger",
  "strapi::query",
  "strapi::body",
  "strapi::session",
  "strapi::favicon",
  "strapi::public",
  { resolve: "./src/middlewares/rebored" },
];

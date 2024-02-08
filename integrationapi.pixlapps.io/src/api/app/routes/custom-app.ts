"use strict";

module.exports = {
  routes: [
    {
      method: "GET",
      path: "/webflow/sites/:credentialId",
      handler: "app.sites",
      config: {
        policies: [],
      },
    },
    {
      method: "GET",
      path: "/webflow/authURL/:clientId",
      handler: "app.getAuthUrl",
      config: {
        policies: [],
      },
    },
    {
      method: "GET",
      path: "/webflow_redirect/:clientId",
      handler: "app.webflowRedirect",
      config: {
        policies: [],
      },
    },
    {
      method: "GET",
      path: "/oauth/callback",
      handler: "app.oauthCallback",
      config: {
        policies: [],
      },
    },
    {
      method: "GET",
      path: "/webflow/sites/collections/:credentialId/:siteId",
      handler: "app.getSitecollections",
      config: {
        policies: [],
      },
    },
    {
      method: "GET",
      path: "/webflow/collections/:credentialId/:collection_id",
      handler: "app.getCollectionDetails",
      config: {
        policies: [],
      },
    },
    {
      method: "GET",
      path: "/webflow/items/:collection_id",
      handler: "app.items",
      config: {
        policies: [],
      },
    },
    {
      method: "GET",
      path: "/webflow/images/:collection_id",
      handler: "app.getImages",
      config: {
        policies: [],
      },
    },
    {
      method: "POST",
      path: "/webflow/copyCollection/:siteId",
      handler: "app.copyCollection",
      config: {
        policies: [],
      },
    },
    {
      method: "POST",
      path: "/verifySession",
      handler: "app.verifySession",
      config: {
        policies: [],
      },
    },
    {
      method: "GET",
      path: "/getData/:url",
      handler: "app.getData",
      config: {
        policies: [],
      },
    },
  ],
};

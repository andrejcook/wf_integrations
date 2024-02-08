"use strict";

module.exports = {
  routes: [
    {
      method: "POST",
      path: "/createCollections",
      handler: "collection.createCollections",
      config: {
        policies: [],
      },
    },
  ],
};

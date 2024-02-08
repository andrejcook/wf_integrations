"use strict";

/**
 * `rebored` middleware
 */

module.exports = (config: any, { strapi }: { strapi }) => {
  const redirects = ["/", "/index.html", "/admin"].map((path: string) => ({
    method: "GET",
    path,
    handler: (ctx: any) => ctx.redirect("/admin/content-manager"),
    config: { auth: false },
  }));

  strapi.server.routes(redirects);
};

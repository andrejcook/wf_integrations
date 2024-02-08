/**
 * app-credential controller
 */

import { factories } from "@strapi/strapi";
import { getAccessToken } from "../../../utils/webflow";

module.exports = factories.createCoreController(
  "api::app-credential.app-credential",
  ({ strapi }) => ({
    async create(ctx) {
      const values = ctx.request.body.data;

      const app = await strapi.db.query(`api::app.app`).findOne({
        where: { id: values.appId },
        select: ["id", "client_id", "client_secret"],
      });

      const webflow_token = await getAccessToken(
        ctx,
        values.code,
        app.client_id,
        app.client_secret
      );

      const appCredentials = await strapi.db
        .query(`api::app-credential.app-credential`)
        .create({
          data: {
            name: values.name,
            token: webflow_token,
            app: app.id,
          },
        });

      return appCredentials;
    },

    async update(ctx) {
      const { id } = ctx.request.params;

      const values = ctx.request.body.data;
      const app = await strapi.db.query(`api::app.app`).findOne({
        where: { id: values.appId },
        select: ["id", "client_id", "client_secret"],
      });

      const webflow_token = await getAccessToken(
        ctx,
        values.code,
        app.client_id,
        app.client_secret
      );

      const appCredentials = await strapi.db
        .query(`api::app-credential.app-credential`)
        .update({
          where: { id: id },
          data: {
            name: values.name,
            token: webflow_token,
          },
        });

      return appCredentials;
    },
  })
);

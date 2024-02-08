/**
 * collection controller
 */

import { factories } from "@strapi/strapi";

export default factories.createCoreController("api::collection.collection");

module.exports = factories.createCoreController(
  "api::collection.collection",
  ({ strapi }) => ({
    async find(ctx) {
      const { user } = ctx.state;
      ctx.query.filters = {
        ...(ctx.query.filters || {}),
        user: user.id,
      };

      const entity = await super.find(ctx);
      return entity;
    },
    async createCollections(ctx) {
      const { data } = ctx.request.body;
      const { user } = ctx.state;

      let responseBody = [];

      for (let i = 0; i < data.length; i++) {
        const collectionDetail = data[i];
        const collection = await strapi.entityService.create(
          "api::collection.collection",
          {
            data: {
              user: user,
              webflow_collection_id: collectionDetail.id,
              displayName: collectionDetail.displayName,
              singularName: collectionDetail.singularName,
              slug: collectionDetail.slug,
            },
          }
        );
        let obj: any = collection;
        let fields = [];

        for (let j = 0; j < collectionDetail.fields.length; j++) {
          const field = collectionDetail.fields[j];
          const fieldObj = await strapi.entityService.create(
            "api::field.field",
            {
              data: {
                collection: collection.id,
                isEditable: field.isEditable,
                isRequired: field.isRequired,
                type: field.type,
                slug: field.slug,
                displayName: field.displayName,
                helpText: field.helpText,
              },
            }
          );
          fields.push(fieldObj);
        }
        obj.fields = fields;
        responseBody.push(obj);
      }

      ctx.body = responseBody;
    },
  })
);

/**
 * credential controller
 */

import { factories } from "@strapi/strapi";
import _ from "lodash";
import { handleError } from "../../../utils/errorHandling";
import {
  createAuthUrl,
  getAPIClient,
  getAccessToken,
  getPublicAPIClient,
} from "../../../utils/webflow";

import axios from "axios";
import moment from "moment";
import {
  createCollection,
  getAllItems,
  getCollectionDetail,
  removeIdFromObject,
  retryAsyncOperation,
} from "../../../utils/webflow/lib";

const model = "app";
module.exports = factories.createCoreController(
  `api::${model}.${model}`,
  ({ strapi }) => ({
    async sites(ctx) {
      const { credentialId } = ctx.params;

      const credential = await strapi.db
        .query(`api::app-credential.app-credential`)
        .findOne({
          where: { id: credentialId },
          select: ["*"],
        });

      const webflowAPI = await getPublicAPIClient(credential.token);
      try {
        const { data } = await webflowAPI.get("/sites");
        ctx.body = data.sites;
      } catch (ex) {
        handleError(ctx, ex);
      }
    },
    async getSitecollections(ctx) {
      const { siteId, credentialId } = ctx.params;

      const credential = await strapi.db
        .query(`api::app-credential.app-credential`)
        .findOne({
          where: { id: credentialId },
          select: ["*"],
        });
      try {
        const webflowAPI = await getPublicAPIClient(credential.token);
        const { data: collectionData } = await webflowAPI.get(
          `/sites/${siteId}/collections`
        );
        ctx.body = collectionData.collections;
      } catch (ex) {
        handleError(ctx, ex);
      }
    },

    async getCollectionDetails(ctx) {
      const { collection_id, credentialId } = ctx.params;

      const credential = await strapi.db
        .query(`api::app-credential.app-credential`)
        .findOne({
          where: { id: credentialId },
          select: ["*"],
        });
      try {
        const webflowAPI = await getPublicAPIClient(credential.token);
        const { data: collectionData } = await webflowAPI.get(
          `/collections/${collection_id}`
        );
        ctx.body = collectionData;
      } catch (ex) {
        handleError(ctx, ex);
      }
    },

    async items(ctx) {
      const { collection_id } = ctx.params;
      try {
        const webflowAPI = await getAPIClient(ctx);
        const { data } = await webflowAPI.get(
          `/collections/${collection_id}/items`
        );
        ctx.body = data.items;
      } catch (ex) {
        handleError(ctx, ex);
      }
    },

    async getImages(ctx) {
      const { collection_id } = ctx.params;
      try {
        const webflowAPI = await getAPIClient(ctx);
        const itemList = await getAllItems(webflowAPI, collection_id);

        const { data: collectionData } = await getCollectionDetail(
          webflowAPI,
          collection_id
        );
        const pick =
          collectionData.fields
            .filter(
              (item) => item.type === "Image" || item.type === "MultiImage"
            )
            .map((item) => item.slug) || [];

        function removeAttributes(originalData: any): any {
          const modifyImageItem = (item: any): any => {
            return { url: item.url };
          };

          const modifyItem = (item: any): any => {
            if (Array.isArray(item)) {
              return item.map(modifyImageItem);
            } else {
              return modifyImageItem(item);
            }
          };

          const modifiedData: any = {};

          for (const key in originalData) {
            if (originalData.hasOwnProperty(key)) {
              modifiedData[key] = modifyItem(originalData[key]);
            }
          }

          return modifiedData;
        }

        let filterItem = [];
        if (itemList && itemList && itemList.length > 0) {
          for (let i = 0; i < itemList.length; i++) {
            let pickData = _.pick(itemList[i].fieldData, pick);

            filterItem.push({
              [itemList[i].id]: removeAttributes(pickData),
            });
          }
        }
        return filterItem;
      } catch (ex) {
        handleError(ctx, ex);
      }
    },

    async copyCollection(ctx) {
      const { siteId } = ctx.params;
      const { collectionDetail, copyItem } = ctx.request.body;
      try {
        const collectionDetailsObj = removeIdFromObject(collectionDetail);
        const webflowAPI = await getAPIClient(ctx);
        let collection = await createCollection(
          webflowAPI,
          collectionDetail,
          siteId
        );
        if (copyItem && collection) {
          const { data: itemList } = await webflowAPI.get(
            `/collections/${collectionDetail.id}/items`
          );
          if (itemList && itemList.items && itemList.items.length > 0) {
            for (let i = 0; i < itemList.items.length; i++) {
              const item = itemList.items[i];
              const createItem = async () => {
                return await webflowAPI.post(
                  `/collections/${collection.id}/items`,
                  {
                    isArchived: item.isArchived,
                    isDraft: item.isDraft,
                    fieldData: item.fieldData,
                  }
                );
              };
              const itemResponse = await retryAsyncOperation(createItem);
            }
          }
        }
        ctx.body = collectionDetailsObj;
      } catch (ex) {
        handleError(ctx, ex);
      }
    },

    async webflowRedirect(ctx) {
      const url = decodeURIComponent(ctx.request.url);
      const urlParts: string[] = url.split("?");
      const parameters: string[] = urlParts[1].split("&");
      const paramsObject: Record<string, string> = {};

      parameters.forEach((param) => {
        const [key, value] = param.split("=");
        paramsObject[key] = value;
      });

      const code = paramsObject["code"];
      const state = paramsObject["state"];
      let clientId = state || ctx.request.params?.clientId;

      const app = await strapi.db.query(`api::app.app`).findOne({
        where: { client_id: clientId },
        select: ["*"],
      });

      const webflow_token = await getAccessToken(
        ctx,
        code,
        app.client_id,
        app.client_secret
      );

      const webflowPublicAPI = getPublicAPIClient(webflow_token);
      try {
        const { data } = await webflowPublicAPI.get("/token/authorized_by");
        const email = data.email;

        let tokenDataPayload = {
          app: app.id,
          token: webflow_token,
        };

        ctx.cookies.set("auth_token", webflow_token, {
          httpOnly: true,
          secure: ctx.secure,
          maxAge: 1000 * 60 * 5,
        });

        return { sucess: true };
      } catch (ex) {
        console.log(ex);
        handleError(ctx, ex);
      }
    },

    async oauthCallback(ctx) {
      const url = decodeURIComponent(ctx.request.url);
      const urlParts: string[] = url.split("?");
      const parameters: string[] = urlParts[1].split("&");
      const paramsObject: Record<string, string> = {};
      parameters.forEach((param) => {
        const [key, value] = param.split("=");
        paramsObject[key] = value;
      });

      const code = paramsObject["code"];
      const state = paramsObject["state"];

      ctx.redirect("http://localhost:3002/callback?code=" + code);
    },

    async getAuthUrl(ctx) {
      const { clientId } = ctx.request.params;
      const app = await strapi.db.query(`api::app.app`).findOne({
        where: { client_id: clientId },
        select: ["*"],
      });
      const scope = app.scope.split(",");

      ctx.redirect(createAuthUrl(app.client_id, scope));
    },

    async verifySession(ctx) {
      try {
        const token = ctx.cookies.get("auth_token");
        if (token) {
          ctx.body = { status: "authorized", token: token };
        } else ctx.body = { status: "unauthorized" };
      } catch (ex) {
        ctx.body = { status: "unauthorized" };
      }
    },

    async create(ctx) {
      const values = ctx.request.body.data;
      const webflow_token = await getAccessToken(
        ctx,
        values.code,
        values.client_id,
        values.client_secret
      );
      const webflowPublicAPI = getPublicAPIClient(webflow_token);
      const { data } = await webflowPublicAPI.get("/token/introspect");

      const payload = {
        client_id: values.client_id,
        client_secret: values.client_secret,
        details: values.details,
        scope: values.scope,
        name: data.application.displayName,
      };

      const entity = await strapi.db.query(`api::app.app`).create({
        data: payload,
      });
      const slug = moment(new Date()).format("YYYY-MM-DD HH:mm:ss");

      await strapi.db.query(`api::app-credential.app-credential`).create({
        data: {
          name: `${data.application.displayName}_${slug}`,
          token: webflow_token,
          app: entity.id,
        },
      });

      return entity;
    },
    async update(ctx) {
      const { id } = ctx.request.params;

      const values = ctx.request.body.data;
      const webflow_token = await getAccessToken(
        ctx,
        values.code,
        values.client_id,
        values.client_secret
      );
      const webflowPublicAPI = getPublicAPIClient(webflow_token);
      const { data } = await webflowPublicAPI.get("/token/introspect");

      const payload = {
        client_id: values.client_id,
        client_secret: values.client_secret,
        details: values.details,
        scope: values.scope,
        name: data.application.displayName,
      };

      const slug = moment(new Date()).format("YYYY-MM-DD HH:mm:ss");

      const entity = await strapi.db.query(`api::app.app`).update({
        where: { id: id },
        data: payload,
      });
      await strapi.db.query(`api::app-credential.app-credential`).create({
        data: {
          name: `${data.application.displayName}_${slug}`,
          token: webflow_token,
          app: entity.id,
        },
      });
      return entity;
    },

    async getData(ctx) {
      const { url } = ctx.params;

      const response = await axios({
        url: url,
      });
      return response.data;
    },
  })
);

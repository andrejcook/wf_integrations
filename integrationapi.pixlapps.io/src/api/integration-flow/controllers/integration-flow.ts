/**
 * integration-flow controller
 */

import { factories } from "@strapi/strapi";
import cronParser from "cron-parser";
import _ from "lodash";
import {
  compareTixerdata,
  deepCompareItem,
} from "../../../utils/component/tixr";
import {
  getExpressionResult,
  getResponseData,
  getTransFormData,
} from "../../../utils/integrationHelper";
import {
  compareCurrentAndPreviousData,
  searchSpotify,
} from "../../../utils/spotify";
import { getPublicAPIClient } from "../../../utils/webflow";
import {
  createItem,
  getAllItems,
  getSiteDetail,
  updateItem,
} from "../../../utils/webflow/lib";
const { createDeepComparer } = require("deep-comparer");

const currentAPIModel = "integration-flow";
function getKeys(arr: any) {
  // Check if input is an array and not empty
  if (!Array.isArray(arr) || arr.length === 0) {
    return "";
  }

  // Map the "value" property of each object in the array
  const values = arr.map((item) => item.value);

  // Join the values with commas and return as a string
  return values;
}
async function getFlowDetailsById(id: number) {
  const flow = await strapi.db
    .query(`api::${currentAPIModel}.${currentAPIModel}`)
    .findOne({
      select: [
        "id",
        "steps",
        "integrationType",
        "ref_key_field",
        "snapshot_field",
        "cron",
      ],
      where: { id: id },
      populate: {
        app_credential: {
          select: ["id", "token"],
        },
        integration_flow_detail: {
          select: ["id", "last_transform_data", "snapshot_value"],
        },
      },
    });

  const currentDateTime = new Date().toISOString();
  const interval = cronParser.parseExpression(flow.cron);
  let nextRun;

  try {
    nextRun = interval.next().toISOString();
  } catch (e) {
    let currentDate: Date = new Date();
    currentDate.setMinutes(currentDate.getMinutes() + 5);
    nextRun = currentDate.toISOString();
  }

  await strapi.db
    .query(`api::integration-flow-detail.integration-flow-detail`)
    .update({
      where: { id: flow.integration_flow_detail.id },
      data: {
        last_run_date: currentDateTime,
        next_run_date: nextRun,
        status: "Running",
      },
    });

  return flow;
}

async function getSyncData(
  apiURL: string,
  headers: any,
  splitter: string,
  expression: string,
  refKey: string,
  prevSouceData: any
) {
  const apiResponse = await getResponseData(apiURL, headers);
  let sourceData = await getTransFormData(apiResponse, expression, splitter);
  const syncedData = await compareTixerdata(refKey, sourceData, prevSouceData);
  return { sourceData, syncedData, apiResponse };
}

let enableLogging = true;

module.exports = factories.createCoreController(
  `api::${currentAPIModel}.${currentAPIModel}`,
  ({ strapi }) => ({
    async processRequest(ctx) {
      const { flowId } = ctx.params;

      let details = {
        created: [],
        updated: [],
        failed: [],
      };
      const start_date = new Date().toISOString();
      let flowDetailId = 0;
      try {
        const flowDetail: any = await getFlowDetailsById(flowId);

        if (
          ["tixr", "restapi", "rapidapi"].includes(flowDetail.integrationType)
        ) {
          const flow = {
            id: flowDetail.id,
            flowDetailId: flowDetail.integration_flow_detail.id,
            exterApiDetail: {
              apiURL: flowDetail.steps.step1.apiURL,
              headers: flowDetail.steps.step1.headers,
            },
            webflow: {
              token: flowDetail.app_credential.token,
              siteId: flowDetail.steps.step2.site.id,
              collectionId: flowDetail.steps.step2.collection.id,
            },
            splitter: flowDetail.steps.splitter.value,
            expression: flowDetail.steps.expression,
            last_transform_data:
              flowDetail.integration_flow_detail.last_transform_data,
            snapshot_value:
              flowDetail.integration_flow_detail.last_transform_data,
            ref_key_field: flowDetail.ref_key_field,
            integrationType: flowDetail.integrationType,
          };

          flowDetailId = flow.flowDetailId;
          const apiURL = flow.exterApiDetail.apiURL;
          const headers = flow.exterApiDetail.headers;
          const splitter = flow.splitter;
          const expression = flow.expression;
          const prevSouceData = flow.last_transform_data;
          const refKey = flow.ref_key_field;
          const integrationType = flow.integrationType;
          const webflow = flow.webflow;

          const { sourceData, syncedData } = await getSyncData(
            apiURL,
            headers,
            splitter,
            expression,
            refKey,
            prevSouceData
          );

          if (syncedData && syncedData.length > 0) {
            const webflowAPI = await getPublicAPIClient(webflow.token);
            const { data: siteData } = await getSiteDetail(
              webflowAPI,
              webflow.siteId
            );
            const isPublish = siteData.lastPublished ? true : false;
            const webFlowItems = await getAllItems(
              webflowAPI,
              webflow.collectionId
            );

            for (let i = 0; i < syncedData.length; i++) {
              const sourceItem = syncedData[i];
              const correspondingDestItem = webFlowItems.find(
                (destItem) => destItem.fieldData[refKey] === sourceItem[refKey]
              );

              if (details.failed.length > 1) {
                throw { message: "Getting multiple errors" };
              }

              if (correspondingDestItem) {
                const data = {
                  isArchived: false,
                  isDraft: false,
                  fieldData: sourceItem,
                };

                try {
                  const isSame = deepCompareItem(
                    sourceItem,
                    correspondingDestItem.fieldData
                  );

                  if (!isSame) {
                    await updateItem(
                      webflowAPI,
                      webflow.collectionId,
                      correspondingDestItem.id,
                      data,
                      isPublish
                    );
                    details.updated.push({
                      ...data,
                      id: correspondingDestItem.id,
                    });
                  }
                } catch (error) {
                  details.failed.push(error);
                }
              } else {
                const data = {
                  isArchived: false,
                  isDraft: false,
                  fieldData: sourceItem,
                };

                try {
                  await createItem(
                    webflowAPI,
                    webflow.collectionId,
                    data,
                    isPublish
                  );
                  details.created.push(data);
                } catch (error) {
                  details.failed.push(error);
                }
              }
            }
            await strapi.db
              .query(`api::integration-flow-detail.integration-flow-detail`)
              .update({
                where: { id: flowDetailId },
                data: {
                  last_transform_data:
                    details.failed.length === 0 ? sourceData : [],
                  status: "Sleeping",
                },
              });

            const dataSync = details.created.length + details.updated.length;
            await strapi.db
              .query(`api::integration-log.integration-log`)
              .create({
                data: {
                  integration_flow: flowId,
                  details: details,
                  status: details.failed.length > 0 ? "Failed" : "Completed",
                  start_date,
                  end_date: new Date().toISOString(),
                  dataSync: dataSync,
                },
              });
          } else {
            await strapi.db
              .query(`api::integration-flow-detail.integration-flow-detail`)
              .update({
                where: { id: flowDetailId },
                data: {
                  status: "Sleeping",
                },
              });
          }
        } else if (["spotify"].includes(flowDetail.integrationType)) {
          const flow = {
            id: flowDetail.id,
            flowDetailId: flowDetail.integration_flow_detail.id,
            spotify: {
              action: flowDetail.steps.step1.action.value,
              parameter: {
                query: flowDetail.steps.step1.parameter.query,
                limit: flowDetail.steps.step1.parameter.limit,
                type: getKeys(flowDetail.steps.step1.parameter.type),
                market:
                  (flowDetail.steps.step1.parameter.market &&
                    flowDetail.steps.step1.parameter.market.value) ||
                  "",
                include_external:
                  (flowDetail.steps.step1.parameter.include_external &&
                    flowDetail.steps.step1.parameter.include_external.value) ||
                  "",
              },
            },
            webflow: {
              token: flowDetail.app_credential.token,
              siteId: flowDetail.steps.step2.site.id,
              collectionId: flowDetail.steps.step2.collection.id,
            },
            splitter: flowDetail.steps.splitter.value,
            expression: flowDetail.steps.expression,
            last_transform_data:
              flowDetail.integration_flow_detail.last_transform_data,
            snapshot_value:
              flowDetail.integration_flow_detail.last_transform_data,
            ref_key_field: flowDetail.ref_key_field,
            integrationType: flowDetail.integrationType,
            mapFields: flowDetail.steps.mapFields,
          };

          flowDetailId = flow.flowDetailId;
          const splitter = flow.splitter;
          const expression = flow.expression;
          const prevSouceData = flow.last_transform_data;
          const refKey = flow.ref_key_field;
          const integrationType = flow.integrationType;
          const webflow = flow.webflow;
          const spotify = flow.spotify;

          const mapFields = flow.mapFields;
          let pickFields: string[] = [];

          // Collect empty fields
          for (const key in mapFields) {
            if (
              mapFields.hasOwnProperty(key) &&
              mapFields[key as keyof typeof mapFields] !== ""
            ) {
              pickFields.push(key);
            }
          }

          const webflowAPI = await getPublicAPIClient(webflow.token);
          const { data: siteData } = await getSiteDetail(
            webflowAPI,
            webflow.siteId
          );
          const isPublish = siteData.lastPublished ? true : false;

          const webFlowItems = await getAllItems(
            webflowAPI,
            webflow.collectionId
          );

          const { syncedData: webFlowCollectionItems } =
            await compareCurrentAndPreviousData(
              webFlowItems,
              prevSouceData,
              pickFields
            );

          if (webFlowCollectionItems.length > 0) {
            for (let i = 0; i < webFlowCollectionItems.length; i++) {
              const webFlowCollectionItem = webFlowCollectionItems[i];
              let parameter: any = spotify.parameter;
              const queryResult = await getExpressionResult(
                parameter.query,
                webFlowCollectionItem.fieldData
              );
              if (!queryResult || typeof queryResult !== "string") {
                details.failed.push({
                  error: "Invalid Query",
                  query_result: queryResult || "",
                  query: parameter.query,
                  webflowData: webFlowCollectionItem,
                });
              } else {
                parameter.q = encodeURIComponent(queryResult);
                const spotify_search_Items = await searchSpotify(parameter);
                let sourceData = await getTransFormData(
                  spotify_search_Items,
                  expression,
                  ""
                );

                if (sourceData && sourceData.length > 0) {
                  try {
                    const updateField = _.pick(sourceData[0], pickFields);
                    const data = {
                      isArchived: false,
                      isDraft: false,
                      fieldData: updateField,
                    };
                    await updateItem(
                      webflowAPI,
                      webflow.collectionId,
                      webFlowCollectionItem.id,
                      data,
                      isPublish
                    );
                    details.updated.push({
                      ...data,
                      id: webFlowCollectionItem.id,
                    });
                  } catch (error) {
                    details.failed.push(error);
                  }
                }
              }
            }

            const synced_sourceData = await getAllItems(
              webflowAPI,
              webflow.collectionId
            );

            await strapi.db
              .query(`api::integration-flow-detail.integration-flow-detail`)
              .update({
                where: { id: flowDetailId },
                data: {
                  last_transform_data:
                    details.failed.length === 0 ? synced_sourceData : [],
                  status: "Sleeping",
                },
              });

            const dataSync = details.created.length + details.updated.length;
            await strapi.db
              .query(`api::integration-log.integration-log`)
              .create({
                data: {
                  integration_flow: flowId,
                  details: details,
                  status: details.failed.length > 0 ? "Failed" : "Completed",
                  start_date,
                  end_date: new Date().toISOString(),
                  dataSync: dataSync,
                },
              });
          } else {
            await strapi.db
              .query(`api::integration-flow-detail.integration-flow-detail`)
              .update({
                where: { id: flowDetailId },
                data: {
                  status: "Sleeping",
                },
              });
          }
        }
      } catch (error) {
        if (flowDetailId) {
          await strapi.db
            .query(`api::integration-flow-detail.integration-flow-detail`)
            .update({
              where: { id: flowDetailId },
              data: {
                status: "Terminated",
              },
            });
        }

        let requstData = "";
        try {
          requstData = JSON.parse(error?.response?.config?.data);
        } catch (ex) {
          requstData = error?.response?.config?.data;
        }

        const parseError = {
          status: error?.response?.status || "",
          code: error?.code || "",
          requestData: requstData || "",
          ...error?.response?.data,
        };
        details.failed.push({
          message: error?.message,
          parseError: parseError,
        });
        await strapi.db.query(`api::integration-log.integration-log`).create({
          data: {
            integration_flow: flowId,
            details: details,
            dataSync: details.created.length + details.updated.length,
            status: "Failed",
            start_date,
            end_date: new Date().toISOString(),
          },
        });
      }

      return "";
    },

    async create(ctx) {
      const payload = {
        ...ctx.request.body.data,
      };

      const entity = await strapi.db
        .query(`api::${currentAPIModel}.${currentAPIModel}`)
        .create({
          data: payload,
        });

      if (entity && entity.id) {
        await strapi.db
          .query(`api::integration-flow-detail.integration-flow-detail`)
          .create({
            data: { integration_flow: { id: entity.id } },
          });
      }

      return entity;
    },

    async delete(ctx) {
      const { id } = ctx.request.params;

      const flow = await strapi.db
        .query(`api::${currentAPIModel}.${currentAPIModel}`)
        .findOne({
          select: ["id"],
          where: { id: id },
          populate: {
            integration_flow_detail: {
              select: ["id"],
            },
            integration_logs: {
              select: ["id"],
            },
          },
        });

      const entity = await strapi.db
        .query(`api::${currentAPIModel}.${currentAPIModel}`)
        .delete({
          where: { id: flow.id },
        });

      await strapi.db
        .query(`api::integration-flow-detail.integration-flow-detail`)
        .delete({
          where: { id: flow.integration_flow_detail.id },
        });

      if (flow.integration_logs.length > 0) {
        flow.integration_logs.forEach(async (element) => {
          await strapi.db.query(`api::integration-log.integration-log`).delete({
            where: { id: element.id },
          });
        });
      }

      return entity;
    },

    async clearsnapshot(ctx) {
      const { flowId } = ctx.params;

      const flow = await strapi.db
        .query(`api::${currentAPIModel}.${currentAPIModel}`)
        .findOne({
          select: ["id"],
          where: { id: flowId },
          populate: {
            integration_flow_detail: {
              select: ["id"],
            },
          },
        });

      if (flow && flow.id) {
        await strapi.db
          .query(`api::integration-flow-detail.integration-flow-detail`)
          .update({
            where: { id: flow.integration_flow_detail.id },
            data: {
              last_transform_data: "",
              snapshot_value: "",
            },
          });
      }

      return flow;
    },

    async startStopFlow(ctx) {
      const { flowId } = ctx.params;

      const flow = await strapi.db
        .query(`api::${currentAPIModel}.${currentAPIModel}`)
        .findOne({
          select: ["id"],
          where: { id: flowId },
          populate: {
            integration_flow_detail: {
              select: ["id", "status"],
            },
          },
        });

      if (flow && flow.id) {
        const status = flow.integration_flow_detail.status;
        const detail = await strapi.db
          .query(`api::integration-flow-detail.integration-flow-detail`)
          .update({
            where: { id: flow.integration_flow_detail.id },
            data: {
              status: status === "Stopped" ? "Running" : "Stopped",
            },
          });

        if (status === "Stopped") this.processRequest(ctx);

        return { status: detail.status };
      }

      return {};
    },

    async getFlowSummery(ctx) {
      const sql = `SELECT
      CASE
          WHEN status = 'Stopped' THEN 'Stopped'
          WHEN status = 'Sleeping' THEN 'Sleeping'
      WHEN status = 'Terminated' THEN 'Terminated'
      WHEN status = 'Running' THEN 'Running'
          ELSE 'Other'
      END AS grouped_status,
      COUNT(*) AS status_count
      FROM integration_flow_details
      GROUP BY grouped_status`;

      let result = await strapi.db.connection.raw(sql);
      const output_dict: { [key: string]: number } = {};
      if (result && result[0]) {
        result[0].forEach((item) => {
          const status = item.grouped_status;
          const count = parseInt(item.status_count, 10); // Assuming status_count is a string, convert it to a number

          output_dict[status] = count;
        });
        return {
          Stopped: output_dict?.Stopped || 0,
          Terminated: output_dict?.Terminated || 0,
          Sleeping: output_dict?.Sleeping || 0,
          Running: output_dict?.Running || 0,
        };
      }

      return { Stopped: 0, Terminated: 0, Sleeping: 0, Running: 0 };
    },
  })
);

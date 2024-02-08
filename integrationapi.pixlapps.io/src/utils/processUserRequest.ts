import axios from "axios";
import sharp, { WebpOptions } from "sharp";

import fs from "fs";
import _ from "lodash";
import mime from "mime-types";
import path from "path";
import { promisify } from "util";
import { handleError } from "./errorHandling";
import { calculateReductionPercentage, formatSize } from "./util";
import { getPublicAPIClient } from "./webflow";
import {
  PaginationInfo,
  createCollection,
  createCollectionFields,
  getCollectionDetail,
  getItem,
  getItems,
  removeIdFromObject,
  replacer,
  retryAsyncOperation,
  updateItem,
} from "./webflow/lib";

const { SERVER_URL, EMAIL_FORM } = process.env;
const directory = "public/temp/";

const writeFileAsync = promisify(fs.writeFile);
export async function processCopyCollectionsRequest(ctx, userRequestData) {
  const model = "user-request";
  let responseJson = {};
  let copyDataType = undefined;

  try {
    if (userRequestData) {
      await strapi.db.query(`api::${model}.${model}`).update({
        where: { id: userRequestData.id },
        data: {
          status: "running",
          startDate: new Date().toISOString(),
        },
      });

      const {
        requestBody: { siteId, copyItem, collectionDetails },
        user: { email },
        webflow_token: { token },
      } = userRequestData;

      for (let i = 0; i < collectionDetails.length; i++) {
        const collectionDetail = collectionDetails[i];
        const collectionDetailsObj = removeIdFromObject(collectionDetail);
        const webflowAPI = getPublicAPIClient(token);
        copyDataType = "collection";
        const collection = await createCollection(
          webflowAPI,
          collectionDetail,
          siteId
        );
        copyDataType = "collection_fields";
        await createCollectionFields(
          webflowAPI,
          collectionDetail,
          collection.id
        );

        responseJson[collection.id] = {
          displayName: collection.displayName,
          copyItemCount: 0,
        };

        if (copyItem && collection) {
          async function copyAllItems(
            webflowAPI: any,
            copyItemCollectionId: string,
            newCollectionId: string
          ) {
            const limitPerPage = 100;
            let offset = 0;
            async function fetchData(
              collection_id: string,
              limit: number,
              offset: number
            ) {
              const { data } = await getItems(
                webflowAPI,
                collection_id,
                offset,
                limit
              );

              const {
                items,
                pagination,
              }: { items: any[]; pagination: PaginationInfo } = data;

              // Return fetched items and pagination info for further processing if needed
              return { items, pagination };
            }
            let allItems: any[] = [];
            let pagination: PaginationInfo;

            do {
              const { items, pagination: page } = await fetchData(
                copyItemCollectionId,
                limitPerPage,
                offset
              );

              const { data: collectionData } = await getCollectionDetail(
                webflowAPI,
                newCollectionId
              );

              const pick = collectionData.fields.map((item) => item.slug) || [];

              if (items && items.length > 0) {
                copyDataType = "collection_Items";
                for (let i = 0; i < items.length; i++) {
                  const item = items[i];
                  const createItem = async () => {
                    return await webflowAPI.post(
                      `/collections/${collection.id}/items`,
                      {
                        isArchived: item.isArchived,
                        isDraft: item.isDraft,
                        fieldData: _.pick(item.fieldData, pick),
                      }
                    );
                  };
                  const itemResponse = await retryAsyncOperation(createItem);
                  if (itemResponse?.data) {
                    responseJson[collection.id]["copyItemCount"] = i + 1;
                  }
                }
              }

              pagination = page;
              offset += limitPerPage;
            } while (pagination.offset + limitPerPage <= pagination.total);
          }

          await copyAllItems(webflowAPI, collectionDetail.id, collection.id);
        }
      }
      var data1 = await strapi.db.query(`api::${model}.${model}`).update({
        where: { id: userRequestData.id },
        data: {
          status: "completed",
          endDate: new Date().toISOString(),
          responseBody: responseJson,
        },
      });

      function getDisplayNames(collection: any) {
        if (!collection && !collection[0].displayName) return "";
        return Object.values(collection)
          .map((item: any) => item.displayName)
          ?.join(", ");
      }

      responseJson["collections"] = getDisplayNames(responseJson);

      await sendCollectionsEmail(userRequestData.user.email, responseJson);

      ctx.body = data1;
    }
  } catch (ex) {
    console.log(ex?.response?.data);
    let error = {};
    try {
      error = JSON.parse(
        JSON.stringify(
          {
            status: ex?.response?.status,
            code: ex?.code,
            copyDataType: copyDataType,
            requestData: JSON.parse(ex?.config?.data),
            error: ex?.response?.data,
          },
          replacer,
          1
        )
      );
    } catch (ex) {
      console.log(error);
    }

    await strapi.db.query(`api::${model}.${model}`).update({
      where: { id: userRequestData.id },
      data: {
        status: "failed",
        endDate: new Date().toISOString(),
        errorBody: error,
        responseBody: responseJson,
      },
    });
    handleError(ctx, ex);
  }
}

export async function processImageConversionRequest(ctx, userRequestData) {
  const model = "user-request";
  let responseJson: any = {
    imagesOptimized: 0,
    totalSizeOfUnOptimizedImages: 0,
    totalSizeOfOptimizedImages: 0,
  };
  let copyDataType = undefined;

  try {
    if (userRequestData) {
      await strapi.db.query(`api::${model}.${model}`).update({
        where: { id: userRequestData.id },
        data: {
          status: "running",
          startDate: new Date().toISOString(),
        },
      });

      const {
        requestBody,
        user: { email },
        webflow_token: { token },
      } = userRequestData;

      const webflowAPI = getPublicAPIClient(token);
      responseJson = await convertImages(webflowAPI, requestBody);

      var data1 = await strapi.db.query(`api::${model}.${model}`).update({
        where: { id: userRequestData.id },
        data: {
          status: "completed",
          endDate: new Date().toISOString(),
          responseBody: responseJson,
        },
      });
      await sendImageConversationEmail(
        userRequestData.user.email,
        responseJson
      );
      ctx.body = data1;
    }
  } catch (ex) {
    console.log(ex?.response?.data);
    let error = {};
    try {
      error = JSON.parse(
        JSON.stringify(
          {
            status: ex?.response?.status,
            code: ex?.code,
            copyDataType: copyDataType,
            requestData: JSON.parse(ex?.config?.data),
            error: ex?.response?.data,
          },
          replacer,
          1
        )
      );
    } catch (ex) {
      console.log(error);
    }

    await strapi.db.query(`api::${model}.${model}`).update({
      where: { id: userRequestData.id },
      data: {
        status: "failed",
        endDate: new Date().toISOString(),
        errorBody: error,
        responseBody: responseJson,
      },
    });
    handleError(ctx, ex);
  }
}

async function convertImages(webflowAPI, requestBody) {
  const { settings, images: inputJsonArray } = requestBody;
  let responseJson = {
    imagesOptimized: 0,
    totalSizeOfUnOptimizedImages: 0,
    totalSizeOfOptimizedImages: 0,
  };
  for (const nestedItem of inputJsonArray) {
    const collectionId = Object.keys(nestedItem)[0];
    const collectionData = nestedItem[collectionId];

    for (const item of collectionData) {
      const itemId = Object.keys(item)[0];
      let updatedField = {};
      let fileIds = [];

      const fields = item[itemId];
      const { data: itemInfo } = await getItem(
        webflowAPI,
        collectionId,
        itemId
      );

      let itemFieldData = itemInfo.fieldData;

      for (const fieldId of Object.keys(fields)) {
        const fieldData = fields[fieldId];

        if (fieldData && typeof fieldData === "object") {
          if (!Array.isArray(fieldData)) {
            const convertImage = await convertToWebp(fieldData.url, settings);
            responseJson.imagesOptimized = responseJson.imagesOptimized + 1;
            responseJson.totalSizeOfUnOptimizedImages =
              responseJson.totalSizeOfUnOptimizedImages +
              convertImage.unoptimizedImageSize;
            responseJson.totalSizeOfOptimizedImages =
              responseJson.totalSizeOfOptimizedImages +
              convertImage.optimizedImageSize;

            fileIds.push(convertImage.id);
            if (Array.isArray(itemFieldData[fieldId])) {
              itemFieldData[fieldId] = [
                {
                  url: `${SERVER_URL}${convertImage.url}`,
                },
              ];
            } else {
              itemFieldData[fieldId].url = `${SERVER_URL}${convertImage.url}`;
            }
          } else {
            updatedField[fieldId] = [];
            for (let i = 0; i < fieldData.length; i++) {
              const convertImage = await convertToWebp(
                fieldData[i].url,
                settings
              );
              responseJson.imagesOptimized = responseJson.imagesOptimized + 1;
              responseJson.totalSizeOfUnOptimizedImages =
                responseJson.totalSizeOfUnOptimizedImages +
                convertImage.unoptimizedImageSize;
              responseJson.totalSizeOfOptimizedImages =
                responseJson.totalSizeOfOptimizedImages +
                convertImage.optimizedImageSize;
              fileIds.push(convertImage.id);

              let index = itemFieldData[fieldId].findIndex(
                (item) => item.url === fieldData[i].url
              );
              if (index !== -1) {
                itemFieldData[fieldId][
                  index
                ].url = `${SERVER_URL}${convertImage.url}`;
              }
            }
          }

          if (Array.isArray(itemFieldData[fieldId])) {
            const urls = itemFieldData[fieldId].map((item) => item.url);
            updatedField[fieldId] = urls;
          } else {
            updatedField[fieldId] = itemFieldData[fieldId];
          }
        }
      }
      let updatedData = {
        isArchived: item.isArchived,
        isDraft: item.isDraft,
        fieldData: updatedField,
      };
      const { data: update } = await updateItem(
        webflowAPI,
        collectionId,
        itemId,
        updatedData
      );

      for (let i = 0; i < fileIds.length; i++) {
        const imageEntry = await strapi.db.query("plugin::upload.file").delete({
          where: { id: fileIds[i] },
        });
        strapi.plugins.upload.services.upload.remove(imageEntry);
      }
    }
  }
  return responseJson;
}

async function sendImageConversationEmail(userEmail, responseJson) {
  try {
    const emailTemplateData = await strapi.db
      .query("api::email-template.email-template")
      .findOne({
        where: { template_id: 1 },
      });

    const replacements = {
      Images_Optimized: responseJson.imagesOptimized,
      Total_Size: formatSize(responseJson.totalSizeOfUnOptimizedImages),
      Total_Optimized_Size: formatSize(responseJson.totalSizeOfOptimizedImages),
      Images_Size_reduction: calculateReductionPercentage(
        responseJson.totalSizeOfUnOptimizedImages,
        responseJson.totalSizeOfOptimizedImages
      ),
    };

    let template = replaceEmailTemplatePlaceholders(
      emailTemplateData.template,
      replacements
    );

    const emailTemplate = {
      subject: emailTemplateData.subject,
      text: "",
      html: template,
    };

    await strapi.plugins["email"].services.email.sendTemplatedEmail(
      {
        to: userEmail,
        from: EMAIL_FORM,
      },
      emailTemplate
    );
  } catch (ex) {
    console.log(ex);
  }
}

async function sendCollectionsEmail(userEmail, responseJson) {
  try {
    const emailTemplateData = await strapi.db
      .query("api::email-template.email-template")
      .findOne({
        where: { template_id: 2 },
      });

    const replacements = {
      Collections: responseJson.collections,
    };

    let template = replaceEmailTemplatePlaceholders(
      emailTemplateData.template,
      replacements
    );

    const emailTemplate = {
      subject: emailTemplateData.subject,
      text: "",
      html: template,
    };
    console.log(userEmail);

    await strapi.plugins["email"].services.email.sendTemplatedEmail(
      {
        to: userEmail,
        from: EMAIL_FORM,
      },
      emailTemplate
    );
  } catch (ex) {
    console.log(ex);
  }
}

function replaceEmailTemplatePlaceholders(template, replacements) {
  const replacementobj = {
    Images_Optimized: "",
    Total_Size: "",
    Total_Optimized_Size: "",
    Images_Size_reduction: "",
    Collections: "",
  };

  const mergedObj = Object.assign({}, replacementobj, replacements);
  for (const placeholder in mergedObj) {
    if (mergedObj.hasOwnProperty(placeholder)) {
      const value = mergedObj[placeholder];
      const regex = new RegExp(`{{${placeholder}}}`, "g");
      template = template.replace(regex, value);
    }
  }
  return template;
}

async function convertToWebp(src, settings) {
  function getFileNameWithoutExtension(url: string): string | null {
    const match = url.match(/\/([^\/?#.]+)[^\/]*$/);
    return match ? match[1] : null;
  }

  function getFileDetails(filePath) {
    return new Promise((resolve, reject) => {
      fs.stat(filePath, (err, stats) => {
        if (err) reject(err.message);
        resolve(stats);
      });
    });
  }

  function deleteFile(filePath) {
    return new Promise((resolve, reject) => {
      fs.unlink(filePath, (err) => {
        if (err) reject(err.message);
        resolve("deleted");
      });
    });
  }

  try {
    const response = await axios({
      url: src,
      responseType: "arraybuffer",
    });
    const buffer = Buffer.from(response.data);
    const unoptimizedImageSize = buffer.length;

    const outputFilePath = `${directory}${getFileNameWithoutExtension(
      src
    )}.webp`;

    let WebPConfig: WebpOptions = {
      quality: parseInt(settings.quality) || 80,
      alphaQuality: parseInt(settings.alphaQuality) || 100,
      lossless: settings.lossless ? true : false,
      nearLossless: settings.nearLossless ? true : false,
      smartSubsample: settings.smartSubsample ? true : false,
      mixed: settings.mixed ? true : false,
    };

    const webpData = await sharp(buffer).webp(WebPConfig).toBuffer();
    const optimizedImageSize = webpData.length;
    try {
      fs.mkdirSync(directory, { recursive: true });
    } catch (err) {
      if (err.code !== "EEXIST") {
        console.error("Error creating directory:", err);
      }
    }
    await writeFileAsync(outputFilePath, webpData);
    const stats: any = await getFileDetails(outputFilePath);
    const fileName = path.parse(outputFilePath).base;

    const res = await strapi.plugins.upload.services.upload.upload({
      data: { path: "uploads/temp" },
      files: {
        path: outputFilePath,
        name: fileName,
        type: mime.lookup(outputFilePath),
        size: stats.size,
      },
    });

    deleteFile(outputFilePath);
    return { ...res[0], unoptimizedImageSize, optimizedImageSize };
  } catch (error) {
    console.error("Error converting remote image to WebP:", error);
  }
  return undefined;
}

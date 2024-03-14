import { SpotifyApi } from "@spotify/web-api-ts-sdk";
import _ from "lodash";
const { createDeepComparer } = require("deep-comparer");

export async function searchSpotify(parameter) {
  const { SPOTIFY_CLIENT_ID, SPOTIFY_CLIENT_SECRET } = process.env;
  const sdk = SpotifyApi.withClientCredentials(
    SPOTIFY_CLIENT_ID,
    SPOTIFY_CLIENT_SECRET
  );

  const query = parameter.q;
  const type = parameter.type;
  const market = parameter.market;
  const limit = parameter.limit || 20;
  const include_external = parameter.include_external
    ? parameter.include_external
    : "";

  const items = await sdk.search(
    query,
    type,
    market,
    limit,
    0,
    include_external
  );
  return items;
}

export async function compareCurrentAndPreviousData(
  sourceData: any,
  prevSouceData: any,
  pickFields: string[]
) {
  const syncedData = await comparedata(
    "id",
    sourceData,
    prevSouceData,
    pickFields
  );
  return { sourceData, syncedData };
}

async function comparedata(
  refKey: string,
  sourceData: any,
  destData: any,
  pickFields: string[]
) {
  if (!destData || destData.length === 0) {
    return sourceData;
  }

  const syncedData = [];

  const deepCompare = createDeepComparer();
  for (let i = 0; i < sourceData.length; i++) {
    const sourceItem = sourceData[i];
    const correspondingDestItem = destData.find(
      (destItem) => destItem[refKey] === sourceItem[refKey]
    );
    if (!correspondingDestItem) {
      syncedData.push(sourceItem);
    } else {
      const sourceItemFieldData = _.pick(sourceItem.filterData, pickFields);
      const correspondingDestItemFieldData = _.pick(
        correspondingDestItem.filterData,
        pickFields
      );

      const changelog = await deepCompare(
        sourceItemFieldData,
        correspondingDestItemFieldData
      );

      if (changelog.length > 0) {
        syncedData.push(sourceItem);
      }
    }
  }
  return syncedData;
}

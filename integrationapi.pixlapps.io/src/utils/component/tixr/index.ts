const { createDeepComparer } = require("deep-comparer");

async function compareTixerdata(
  refKey: string,
  sourceData: any,
  destData: any
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
      const changelog = await deepCompare(sourceItem, correspondingDestItem);
      if (changelog.length > 0) {
        syncedData.push(sourceItem);
      }
    }
  }
  return syncedData;
}

function deepCompareItem(sourceData: any, destData: any) {
  for (let key in sourceData) {
    // Check if the property exists in destData and has the same value
    if (sourceData[key] !== destData[key]) {
      return false;
    }
  }
  // All properties in sourceData have matching values in destData
  return true;
}

export { compareTixerdata, deepCompareItem };

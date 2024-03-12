import axios from "axios";
import jsonata from "jsonata";

function getValueByKey(obj: any, targetKey: string): any | null {
  const keys = targetKey.split(".");
  let currentObject = obj;

  for (const key of keys) {
    if (
      currentObject &&
      typeof currentObject === "object" &&
      key in currentObject
    ) {
      currentObject = currentObject[key];
    } else {
      return undefined;
    }
  }

  return currentObject;
}
async function getResponseData(apiURL, headers) {
  try {
    const response = await axios({
      url: apiURL,
      headers: headers || {},
    });
    return response.data;
  } catch (ex) {
    throw ex;
  }
}

function getArrayDataBasedonKey(data, key) {
  const allSalesRecords = [];

  if (key) {
    for (const entry of data) {
      allSalesRecords.push(...entry[key]);
    }
    return allSalesRecords;
  } else {
    return data;
  }
}

function getObjectDataBasedonKey(data, key) {
  console.log(key);
  if (key) {
    return data[key];
  } else {
    return data;
  }
}

async function getExpressionResult(expression, data) {
  try {
    const expressionObj = jsonata(expression, {
      recover: true,
    });
    return await expressionObj.evaluate(data);
  } catch (ex) {
    return "";
  }
}

async function getTransFormData(data, expression, splitter) {
  let items = [];
  if (Array.isArray(data)) {
    const filterData = getArrayDataBasedonKey(
      data,
      splitter.replace("0.", "").replace(".0", "").replace("0", "")
    );

    if (Array.isArray(filterData)) {
      for (let i = 0; i < filterData.length; i++) {
        const previewObject = filterData[i];
        const result = await getExpressionResult(expression, previewObject);
        items.push(result);
      }
    } else {
      const result = await getExpressionResult(expression, filterData);
      items.push(result);
    }
  } else {
    const filterData = getObjectDataBasedonKey(
      data,
      splitter.replace("0.", "").replace(".0", "").replace("0", "")
    );
    if (Array.isArray(filterData)) {
      for (let i = 0; i < filterData.length; i++) {
        const previewObject = filterData[i];
        const result = await getExpressionResult(expression, previewObject);
        items.push(result);
      }
    } else {
      const result = await getExpressionResult(expression, filterData);
      items.push(result);
    }
  }
  return items;
}

export { getResponseData, getTransFormData };

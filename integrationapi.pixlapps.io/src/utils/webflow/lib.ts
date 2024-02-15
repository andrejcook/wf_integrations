import _ from "lodash";

export interface PaginationInfo {
  limit: number;
  offset: number;
  total: number;
}
export async function getItems(webflowAPI, collection_id, offset, limit) {
  const get = async () => {
    return await webflowAPI.get(
      `/collections/${collection_id}/items?offset=${offset}&limit=${limit}`
    );
  };
  return await retryAsyncOperation(get);
}

// Function to paginate through items
export async function getAllItems(webflowAPI: any, collection_id: string) {
  const limitPerPage = 100;
  let offset = 0;
  async function fetchData(
    collection_id: string,
    limit: number,
    offset: number
  ) {
    const get = async () => {
      return await webflowAPI.get(
        `/collections/${collection_id}/items?offset=${offset}&limit=${limit}`
      );
    };

    const { data } = await retryAsyncOperation(get);

    const { items, pagination }: { items: any[]; pagination: PaginationInfo } =
      data;

    // Return fetched items and pagination info for further processing if needed
    return { items, pagination };
  }
  let allItems: any[] = [];
  let pagination: PaginationInfo;

  do {
    const { items, pagination: page } = await fetchData(
      collection_id,
      limitPerPage,
      offset
    );

    allItems = allItems.concat(items);
    pagination = page;
    offset += limitPerPage;
  } while (pagination.offset + limitPerPage <= pagination.total);

  // Process or return allItems when pagination is completed
  return allItems;
}

export async function getItem(webflowAPI, collection_id, item_id) {
  const get = async () => {
    return await webflowAPI.get(
      `/collections/${collection_id}/items/${item_id}`
    );
  };
  return await retryAsyncOperation(get);
}

export async function getCollectionDetail(webflowAPI, collection_id) {
  const get = async () => {
    return await webflowAPI.get(`/collections/${collection_id}`);
  };
  return await retryAsyncOperation(get);
}

export async function createItems(webflowAPI, collection_id, items) {
  items.forEach(async (item) => {
    const createField = async () => {
      return await webflowAPI.post(`/collections/${collection_id}/items`, item);
    };
    await retryAsyncOperation(createField);
  });

  return {};
}

export async function createItem(webflowAPI, collection_id, item) {
  const createField = async () => {
    return await webflowAPI.post(`/collections/${collection_id}/items`, item);
  };
  return await retryAsyncOperation(createField);
}

export async function updateItem(webflowAPI, collection_id, item_id, data) {
  const updateItem = async () => {
    return await webflowAPI.patch(
      `/collections/${collection_id}/items/${item_id}`,
      data
    );
  };
  return await retryAsyncOperation(updateItem);
}

export function removeIdFromObject(obj: any): any {
  if (obj && typeof obj === "object") {
    if (Array.isArray(obj)) {
      return obj.map(removeIdFromObject);
    } else {
      const { id, ...rest } = obj;
      for (const key in rest) {
        rest[key] = removeIdFromObject(rest[key]);
      }
      return rest;
    }
  }
  return obj;
}

export function slugToDisplayName(slug) {
  // Replace dashes with spaces and capitalize each word
  const displayName = slug
    .replace(/[-_]/g, " ")
    .replace(/\w\S*/g, (word) => word.charAt(0).toUpperCase() + word.slice(1))
    .trim();
  return displayName;
}

export const replacer = (key, value, seen = new Set()) => {
  // Check for circular references
  if (typeof value === "object" && value !== null) {
    if (seen.has(value)) {
      return "[Circular Reference]";
    }
    seen.add(value);
  }
  return value;
};

export async function retryAsyncOperation<T>(
  asyncOperation: () => Promise<T>,
  maxRetries: number = 3,
  retryInterval: number = 10000
): Promise<T | undefined> {
  let retryCount = 0;

  while (retryCount < maxRetries) {
    try {
      return await asyncOperation();
    } catch (error) {
      console.log(error?.response?.data);

      console.log(
        `Error: ${error.response.status} - ${error.code} - ${error.message}`
      );

      if (error.response.status === 500 || error.response.status === 429) {
        console.log(`Retry attempt ${retryCount + 1} of ${maxRetries}`);
        if (retryCount < maxRetries - 1) {
          await new Promise((resolve) => setTimeout(resolve, retryInterval));
        }

        retryCount++;
      } else {
        let requstData = "";

        try {
          requstData = JSON.parse(error?.response?.config?.data);
        } catch (ex) {
          requstData = error?.response?.config?.data;
        }

        const parseError = {
          status: error?.response?.status,
          code: error?.code,
          requestData: requstData,
          ...error?.response?.data,
        };
        throw parseError;
      }
    }
  }

  return undefined;
}

export async function createCollection(webflowAPI, collectionDetail, siteId) {
  const createCollectionOperation = async () => {
    return await webflowAPI.post(`/sites/${siteId}/collections`, {
      displayName: collectionDetail.displayName,
      singularName: collectionDetail.singularName,
    });
  };

  const createCollectionResponse = await retryAsyncOperation(
    createCollectionOperation
  );

  return createCollectionResponse.data;
}

export async function createCollectionFields(
  webflowAPI,
  collectionDetail,
  collection_id
) {
  for (let i = 0; i < collectionDetail.fields.length; i++) {
    let field = collectionDetail.fields[i];
    if (
      field.slug !== "slug" &&
      field.slug !== "name" &&
      field.type !== "Option" &&
      field.type !== "Reference" &&
      field.type !== "MultiReference"
    ) {
      const createField = async () => {
        return await webflowAPI.post(
          `/collections/${collection_id}/fields`,
          _.omit({ ...field, displayName: slugToDisplayName(field.slug) }, [
            "id",
          ])
        );
      };
      await retryAsyncOperation(createField);
    }
  }
}

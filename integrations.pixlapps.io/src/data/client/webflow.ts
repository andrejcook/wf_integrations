import { API_ENDPOINTS } from '@/data/client/api-endpoints';
import { crudFactory } from '@/data/client/curd-factory';
import { HttpClient } from '@/data/client/http-client';
import { QueryOptions } from '@/types';

export const client = {
  ...crudFactory<any, QueryOptions, any>(API_ENDPOINTS.APPS),
  getSite: (id: number) => {
    const url = `${API_ENDPOINTS.SITES}/${id}`;
    return HttpClient.get<string>(url);
  },
  getCollectionBySiteId: (credentialId: number, siteId: string) => {
    const url = `${API_ENDPOINTS.SITE_COLLECTIONS}/${credentialId}/${siteId}`;
    return HttpClient.get<string>(url);
  },
  getSingleItemByCollectionId: (credentialId: number, collectionId: string) => {
    const url = `${API_ENDPOINTS.getSingleItem}/${credentialId}/${collectionId}`;
    return HttpClient.get<string>(url);
  },

  getCollectionById: (credentialId: number, collectionId: string) => {
    const url = `${API_ENDPOINTS.SITE_COLLECTION}/${credentialId}/${collectionId}`;
    return HttpClient.get<string>(url);
  },

  getData: (url: string) => {
    const query = `${API_ENDPOINTS.getData}/${url}`;
    return HttpClient.get<string>(query);
  },
};

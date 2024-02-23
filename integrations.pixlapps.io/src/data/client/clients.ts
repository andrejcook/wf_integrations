import { API_ENDPOINTS } from '@/data/client/api-endpoints';
import { crudFactory } from '@/data/client/curd-factory';
import { HttpClient } from '@/data/client/http-client';
import { QueryOptions } from '@/types';
const ENDPOINTS = API_ENDPOINTS.CLIENTS;

export const client = {
  ...crudFactory<any, QueryOptions, any>(ENDPOINTS),
  getAllWithChild: () => {
    const url = `${ENDPOINTS}?populate=*`;
    return HttpClient.get<string>(url);
  },
  getOptions() {
    const queryParams = {
      publicationState: 'live',
      fields: ['name', 'id'],
    };
    return HttpClient.get<any>(ENDPOINTS, queryParams);
  },
};

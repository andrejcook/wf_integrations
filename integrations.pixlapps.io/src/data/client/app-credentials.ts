import { API_ENDPOINTS } from '@/data/client/api-endpoints';
import { crudFactory } from '@/data/client/curd-factory';
import { HttpClient } from '@/data/client/http-client';
import { QueryOptions } from '@/types';
import qs from 'qs';
const ENDPOINTS = API_ENDPOINTS.APP_CREDENTIALS;

export const client = {
  ...crudFactory<any, QueryOptions, any>(ENDPOINTS),
  getAllWithChild: () => {
    const url = `${ENDPOINTS}?populate=*`;
    return HttpClient.get<string>(url);
  },

  getByAppId: (id: number) => {
    let queryParam: any = {
      filters: {
        app: { id: id },
      },
      fields: ['name'],
      populate: {
        app: { fields: ['name'] },
      },
    };

    const query = qs.stringify(queryParam, { encode: false });
    const url = `${ENDPOINTS}?${query}`;
    return HttpClient.get<string>(url);
  },
};

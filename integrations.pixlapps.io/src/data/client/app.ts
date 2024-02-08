import { API_ENDPOINTS } from '@/data/client/api-endpoints';
import { crudFactory } from '@/data/client/curd-factory';
import { HttpClient } from '@/data/client/http-client';
import { QueryOptions } from '@/types';

export const client = {
  ...crudFactory<any, QueryOptions, any>(API_ENDPOINTS.APPS),
  paginated: ({ type, name, ...params }: Partial<any>) => {
    return HttpClient.get<any>(API_ENDPOINTS.APPS, {
      searchJoin: 'and',
      ...params,
      search: HttpClient.formatSearchParams({ type, name }),
    });
  },
  getAllIntegrations() {
    const queryParams = {
      publicationState: 'live',
      fields: ['name'],
      populate: {
        app_credentials: {
          fields: ['id'],
        },
        integration_flows: {
          fields: ['id'],
        },
      },
    };
    return HttpClient.get<any>(API_ENDPOINTS.APPS, queryParams);
  },

  getAppOptions() {
    const queryParams = {
      publicationState: 'live',
      fields: ['name', 'client_id', 'client_secret', 'scope'],
    };
    return HttpClient.get<any>(API_ENDPOINTS.APPS, queryParams);
  },
};

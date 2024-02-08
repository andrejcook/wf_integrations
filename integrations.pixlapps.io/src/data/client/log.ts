import { API_ENDPOINTS } from '@/data/client/api-endpoints';
import { crudFactory } from '@/data/client/curd-factory';
import { QueryOptions } from '@/types';
import { HttpClient } from './http-client';

export const client = {
  ...crudFactory<any, QueryOptions, any>(API_ENDPOINTS.INTEGRATION_LOGS),
  paginated: (params: Partial<QueryOptions>) => {
    let queryParams: any = {
      publicationState: 'live',
      fields: ['start_date', 'end_date', 'status', 'dataSync'],
      sort: [`${params.orderBy}:${params.sortedBy}`],

      pagination: {
        pageSize: `${params.limit}`,
        page: `${params.page}`,
      },
      populate: {
        integration_flow: {
          fields: ['name'],
        },
      },
    };

    if (params.search) {
      queryParams.filters = {
        integration_flow: { name: { $contains: params.search.trim() } },
      };
    }

    return HttpClient.get<any>(API_ENDPOINTS.INTEGRATION_LOGS, queryParams);
  },
};

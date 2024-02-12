import { API_ENDPOINTS } from '@/data/client/api-endpoints';
import { crudFactory } from '@/data/client/curd-factory';
import { QueryOptions } from '@/types';
import { HttpClient } from './http-client';

export const client = {
  ...crudFactory<any, QueryOptions, any>(API_ENDPOINTS.FLOWS),
  clearSnpShot({ id }: { id: string }) {
    return HttpClient.post<boolean>(`clearsnapshot/${id}`, {});
  },
  useStartStopFlow({ id }: { id: string }) {
    return HttpClient.get<boolean>(`StartStopFlow/${id}`);
  },
  getAllFlow() {
    const queryParams = {
      publicationState: 'live',
      populate: {
        integration_flow_detail: {
          fields: ['last_run_date', 'next_run_date', 'status'],
        },
      },
    };
    return HttpClient.get<any>(API_ENDPOINTS.FLOWS, queryParams);
  },

  getFlowSummery() {
    return HttpClient.get<any>('getFlowSummery');
  },
  paginated: (params: Partial<QueryOptions>) => {
    let queryParams: any = {
      publicationState: 'live',
     fields: ['id', 'name','cron'],
      //sort: [`${params.orderBy}:${params.sortedBy}`],

      pagination: {
        pageSize: `${params.limit}`,
        page: `${params.page}`,
      },
      populate: {
        integration_flow_detail: {
         fields: ['status','last_run_date','next_run_date'],
        },
     },
    };

    if (params.search) {
      queryParams.filters = {
         name: { $contains: params.search.trim() } ,
      };
    }

    return HttpClient.get<any>(API_ENDPOINTS.FLOWS, queryParams);
  },
};

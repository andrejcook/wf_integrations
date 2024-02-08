import type { NextPage } from 'next';

export type NextPageWithLayout<P = {}> = NextPage<P> & {
  authorization?: boolean;
  getLayout?: (page: React.ReactElement) => React.ReactNode;
};

export enum SortOrder {
  Asc = 'asc',
  Desc = 'desc',
}

export interface NameAndValueType {
  name: string;
  value: string;
}
export enum Permission {
  SuperAdmin = 'super_admin',
}

export interface GetParams {
  slug: string;
  language: string;
}

export interface GetQueryParams {
  id?: string;
}

export interface QueryOptions {
  language: string;
  limit?: number;
  page?: number;
  orderBy?: string;
  sortedBy?: SortOrder;
  search?: string;
}

export interface PaginatorInfo<T> {
  current_page: number;
  data: T[];
  first_page_url: string;
  from: number;
  last_page: number;
  last_page_url: string;
  links: any[];
  next_page_url: string | null;
  path: string;
  per_page: number;
  prev_page_url: string | null;
  to: number;
  total: number;
}

export interface LoginInput {
  identifier: string;
  password: string;
}

export interface AuthResponse {
  jwt: string;
  user: User;
  permissions: string[];
  role: string;
}

export interface User {
  id: string;
  username: string;
  email: string;
  provider: string;
  confirmed: boolean;
  blocked: boolean;
  created_at: string;
  updated_at: string;
}

export interface Log {
  id: number;
  start_date: string;
  end_date: string;
  createdAt: string;
  updatedAt: string;
  details: {
    failed: string[];
    created: string[];
    updated: string[];
  };
  summary: null;
  status: string;
  integration_flow: {
    id: number;
    name: string;
  };
}

export interface App {
  id: string;
  name: string;
  client_id: string;
  created_at?: string;
  updated_at?: string;
  app_credentials: any;
  integration_flows: any;
}

export interface UserPaginator extends PaginatorInfo<User> {}

export interface AppPaginator extends PaginatorInfo<App> {}

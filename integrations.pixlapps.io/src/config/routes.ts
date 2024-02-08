export const Routes = {
  dashboard: '/',
  login: '/login',
  logout: '/logout',
  app: {
    ...routesFactory('/apps'),
  },
  flow: {
    ...routesFactory('/flows'),
  },
  credentials: {
    ...routesFactory('/credentials'),
  },
  logs: {
    ...routesFactory('/logs'),
  },
};

function routesFactory(endpoint: string) {
  return {
    list: `${endpoint}`,
    create: `${endpoint}/create`,
    editWithoutLang: (slug: string, shop?: string) => {
      return shop
        ? `/${shop}${endpoint}/${slug}/edit`
        : `${endpoint}/${slug}/edit`;
    },
    edit: (id: string) => {
      return `${endpoint}/${id}/edit`;
    },
    details: (slug: string) => `${endpoint}/${slug}`,
  };
}

import { Routes } from '@/config/routes';
import { adminOwnerAndStaffOnly } from '@/utils/auth-utils';

export const siteSettings = {
  name: 'Pixl Apps',
  description: '',
  logo: {
    url: '/logo.png',
    alt: 'Pixl Apps',
    href: '/',
    width: '100px',
    height: '80px',
  },
  avatar: {
    url: '/avatar-placeholder.svg',
  },
  collapseLogo: {
    url: '/logo.png',
    alt: 'P',
    href: '/',
    width: '50px',
    height: '80px',
  },
  defaultLanguage: 'en',

  authorizedLinks: [
    {
      href: Routes.logout,
      labelTransKey: 'authorized-nav-item-logout',
      icon: 'LogOutIcon',
      permission: adminOwnerAndStaffOnly,
    },
  ],
  sidebarLinks: {
    admin: {
      root: {
        href: Routes.dashboard,
        label: 'Main',
        icon: 'DashboardIcon',
        childMenu: [
          {
            href: Routes.dashboard,
            label: 'sidebar-nav-item-dashboard',
            icon: 'DashboardIcon',
          },
        ],
      },
      app: {
        href: '',
        label: 'text-app-management',
        icon: 'DashboardIcon',
        childMenu: [
          {
            href: Routes.app.list,
            label: 'sidebar-nav-item-my-apps',
            icon: 'DashboardIcon',
          },
          {
            href: Routes.flow.list,
            label: 'sidebar-nav-item-integrations',
            icon: 'DashboardIcon',
          },
          {
            href: Routes.credentials.list,
            label: 'sidebar-nav-item-credentials',
            icon: 'DashboardIcon',
          },
          {
            href: Routes.logs.list,
            label: 'sidebar-nav-item-logs',
            icon: 'DashboardIcon',
          },
        ],
      },
    },
  },
};

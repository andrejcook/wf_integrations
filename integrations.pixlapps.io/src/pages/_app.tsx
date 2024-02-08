import '@/assets/css/main.css';
import { SettingsProvider } from '@/contexts/settings.context';
import { UIProvider } from '@/contexts/ui.context';
import type { NextPageWithLayout } from '@/types';
import PrivateRoute from '@/utils/private-route';
import { appWithTranslation } from 'next-i18next';
import type { AppProps } from 'next/app';
import { DefaultOptions, QueryClient, QueryClientProvider } from 'react-query';
import { ReactQueryDevtools } from 'react-query/devtools';
import { Hydrate } from 'react-query/hydration';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const Noop: React.FC<{ children?: React.ReactNode }> = ({ children }) => (
  <>{children}</>
);

const AppSettings: React.FC<{ children?: React.ReactNode }> = (props) => {
  return <SettingsProvider initialValue={undefined} {...props} />;
};

type AppPropsWithLayout = AppProps & {
  Component: NextPageWithLayout;
};
const queryConfig: DefaultOptions = {
  queries: {
    useErrorBoundary: true,
    refetchOnWindowFocus: false,
    retry: false,
  },
};
export const queryClient = new QueryClient({ defaultOptions: queryConfig });

const CustomApp = ({ Component, pageProps }: AppPropsWithLayout) => {
  const Layout = (Component as any).Layout || Noop;
  const authProps = (Component as any).authenticate;

  return (
    <div>
      <QueryClientProvider client={queryClient}>
        <Hydrate state={pageProps?.dehydratedState}>
          <AppSettings>
            <UIProvider>
              <>
                {authProps ? (
                  <PrivateRoute authProps={authProps}>
                    <Layout {...pageProps}>
                      <Component {...pageProps} />
                    </Layout>
                  </PrivateRoute>
                ) : (
                  <Layout {...pageProps}>
                    <Component {...pageProps} />
                  </Layout>
                )}
                <ToastContainer autoClose={2000} theme="colored" />
              </>
            </UIProvider>
          </AppSettings>
          <ReactQueryDevtools />
        </Hydrate>
      </QueryClientProvider>
    </div>
  );
};

export default appWithTranslation(CustomApp);

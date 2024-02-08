import Loader from '@/components/ui/loader/loader';
import StickerCard from '@/components/widgets/sticker-card';
import { useGetFlowSummery } from '@/data/flow';
import { useTranslation } from 'next-i18next';

export default function Dashboard() {
  const { t } = useTranslation();
  const { data, loading, error } = useGetFlowSummery();
  if (loading) {
    return <Loader text={'Loading...'} />;
  }

  return (
    <div className="grid gap-7 md:gap-8 lg:grid-cols-2 2xl:grid-cols-12">
      <div className="col-span-full rounded-lg bg-light p-6 md:p-7">
        <div className="mb-5 flex items-center justify-between md:mb-7">
          <h3 className="before:content-'' relative mt-1 bg-light text-lg font-semibold text-heading before:absolute before:-top-px before:h-7 before:w-1 before:rounded-tr-md before:rounded-br-md before:bg-accent ltr:before:-left-6 rtl:before:-right-6 md:before:-top-0.5 md:ltr:before:-left-7 md:rtl:before:-right-7 lg:before:h-8">
            {t('text-summary')}
          </h3>
        </div>

        <div className="grid w-full grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-5">
          <StickerCard
            titleTransKey="Flow Running"
            color="green"
            price={data?.Running}
          />
          <StickerCard
            titleTransKey="Flow Sleeping"
            color="orange"
            price={data?.Sleeping}
          />
          <StickerCard
            titleTransKey="Flow Terminated"
            color="red"
            price={data?.Terminated}
          />
        </div>
      </div>
    </div>
  );
}

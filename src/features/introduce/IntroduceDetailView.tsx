import Reveal from '../../components/Reveal';
import { withApiBase } from '../../api/client';
import type { IntroduceDetailPayload } from '../../api/intro';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

type FallbackDetail = {
  brandTitle?: string;
  brandSubtitle?: string;
  introTitle?: string;
  introSlogan?: string;
  introBody?: string;
  purposeTitle?: string;
  purposeDescription?: string;
  currentLogoTitle?: string;
  currentLogoDescription?: string;
  currentLogoImageKey?: string;
  logoHistories?: Array<{
    year?: string;
    imageKey?: string;
    imageUrl?: string;
    description?: string;
  }>;
};

type Props = {
  data: IntroduceDetailPayload | null;
  fallback?: FallbackDetail;
  useReveal?: boolean;
};

function resolvePublicImageUrl(key?: string): string | null {
  if (!key) return null;
  if (key.startsWith('http')) return key;
  const normalized = key.startsWith('/') ? key : `/${key}`;
  return withApiBase(normalized);
}

function Markdown({ value }: { value?: string }) {
  if (!value) return null;

  return (
    <div className="prose prose-slate max-w-none text-sm">
      <ReactMarkdown remarkPlugins={[remarkGfm]}>{value}</ReactMarkdown>
    </div>
  );
}

export default function IntroduceDetailView({ data, fallback, useReveal = true }: Props) {
  const hasData = data !== null;

  const title = hasData
    ? data?.intro?.title ?? data?.brand?.title ?? ''
    : fallback?.introTitle ?? fallback?.brandTitle ?? '';

  const subtitle = hasData
    ? data?.intro?.slogan ?? data?.brand?.subtitle ?? ''
    : fallback?.introSlogan ?? fallback?.brandSubtitle ?? '';

  const body = hasData ? data?.intro?.body ?? '' : fallback?.introBody ?? '';

  const purposeTitle = hasData ? data?.purpose?.title ?? '' : fallback?.purposeTitle ?? '';
  const purposeDesc = hasData ? data?.purpose?.description ?? '' : fallback?.purposeDescription ?? '';

  const currentLogoTitle = hasData ? data?.currentLogo?.title ?? '' : fallback?.currentLogoTitle ?? '';
  const currentLogoDesc = hasData ? data?.currentLogo?.description ?? '' : fallback?.currentLogoDescription ?? '';

  const currentLogoUrl = hasData
    ? data?.currentLogo?.imageUrl ?? resolvePublicImageUrl(data?.currentLogo?.imageKey)
    : resolvePublicImageUrl(fallback?.currentLogoImageKey);

  const histories = hasData ? data?.logoHistories ?? [] : fallback?.logoHistories ?? [];

  const Top = (
    <div className="grid grid-cols-1 gap-8 md:grid-cols-[1.1fr_0.9fr] md:items-start">
      <div className="order-1 rounded-3xl border border-slate-200 bg-white p-8 md:order-none md:col-start-1 md:row-start-1">
        <h1 className="font-heading text-2xl text-primary">{title}</h1>
        {subtitle ? <p className="mt-2 text-sm text-slate-700">{subtitle}</p> : null}
        {body ? (
          <div className="mt-5">
            <Markdown value={body} />
          </div>
        ) : null}
      </div>

      <div className="order-2 rounded-3xl border border-slate-200 bg-white p-6 md:order-none md:col-start-2 md:row-span-2">
        <h2 className="font-heading text-lg text-slate-900">{currentLogoTitle}</h2>

        {currentLogoUrl ? (
          <div className="mt-4">
            <img
              src={currentLogoUrl}
              alt="로고"
              className="h-64 w-full rounded-2xl object-contain"
            />
          </div>
        ) : null}

        {currentLogoDesc ? (
          <div className={currentLogoUrl ? 'mt-4' : 'mt-3'}>
            <Markdown value={currentLogoDesc} />
          </div>
        ) : null}
      </div>

      <div className="order-3 rounded-3xl border border-slate-200 bg-white p-8 md:order-none md:col-start-1 md:row-start-2">
        <h2 className="font-heading text-xl text-slate-900">{purposeTitle}</h2>
        {purposeDesc ? (
          <div className="mt-4">
            <Markdown value={purposeDesc} />
          </div>
        ) : null}
      </div>
    </div>
  );

  const History = (
    <div className="mt-12">
      {histories.length > 0 ? (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {histories.map((history, idx) => {
            const imageUrl = history.imageUrl ?? resolvePublicImageUrl(history.imageKey);
  
            return (
              <div
                key={`history-${idx}`}
                className="rounded-3xl border border-slate-200 bg-white p-6"
              >
                {imageUrl ? (
                  <img
                    src={imageUrl}
                    alt={history.year ? `${history.year} 로고` : '로고'}
                    className="h-40 w-full rounded-2xl object-contain"
                  />
                ) : null}
  
                {history.year ? (
                  <p
                    className={
                      imageUrl
                        ? 'mt-3 text-sm font-bold text-primary'
                        : 'text-sm font-bold text-primary'
                    }
                  >
                    {history.year}
                  </p>
                ) : null}
  
                {history.description ? (
                  <div className={history.year || imageUrl ? 'mt-2' : ''}>
                    <Markdown value={history.description} />
                  </div>
                ) : null}
              </div>
            );
          })}
        </div>
      ) : (
        <div className="rounded-3xl border border-slate-200 bg-white p-8 text-sm text-slate-500">
          준비중
        </div>
      )}
    </div>
  );

  if (!useReveal) {
    return (
      <>
        {Top}
        {History}
      </>
    );
  }

  return (
    <>
      <Reveal>{Top}</Reveal>
      <Reveal delayMs={120}>{History}</Reveal>
    </>
  );
}
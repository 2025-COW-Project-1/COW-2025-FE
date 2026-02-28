import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Calendar, ChevronLeft, ChevronRight, Clock } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkBreaks from 'remark-breaks';
import remarkGfm from 'remark-gfm';
import Reveal from '../../components/Reveal';
import StatusBadge from '../../components/StatusBadge';
import { useToast } from '../../components/toast/useToast';
import { projectsApi } from '../../api/projects';
import type { Project } from '../../api/projects';
import { itemsApi } from '../../api/items';
import type { ItemResponse } from '../../api/items';

const STATUS_LABELS: Record<string, string> = {
  PREPARING: '준비중',
  OPEN: '진행중',
  CLOSED: '마감',
};

const SALETYPE_LABELS: Record<string, string> = {
  NORMAL: '일반',
  GROUPBUY: '공구',
};

function formatMoney(value?: number | null) {
  if (value === null || value === undefined) return '-';
  return value.toLocaleString();
}

export default function ProjectDetailPage() {
  const { projectId } = useParams();
  const toast = useToast();
  const [project, setProject] = useState<Project | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [items, setItems] = useState<ItemResponse[]>([]);
  const [itemsLoading, setItemsLoading] = useState(false);
  const [itemsError, setItemsError] = useState<string | null>(null);
  const [downloadingId, setDownloadingId] = useState<string | number | null>(null);
  const [carouselIndex, setCarouselIndex] = useState(0);

  useEffect(() => {
    let active = true;
    setNotFound(false);
    setProject(null);
    setItems([]);
    setItemsError(null);
    setItemsLoading(false);

    if (!projectId) {
      setNotFound(true);
      return () => {
        active = false;
      };
    }

    (async () => {
      try {
        const p = await projectsApi.getById(projectId);
        if (!active) return;
        if (!p) {
          setNotFound(true);
          return;
        }
        setProject(p);

        const itemsFromProject = (p as Project & { items?: ItemResponse[] })
          .items;
        if (Array.isArray(itemsFromProject)) {
          setItems(itemsFromProject);
          return;
        }

        setItemsLoading(true);
        try {
          const list = await itemsApi.listByProject(projectId);
          if (!active) return;
          setItems(Array.isArray(list) ? list : []);
        } catch (err) {
          if (!active) return;
          setItemsError(
            err instanceof Error ? err.message : '상품을 불러오지 못했어요.',
          );
        } finally {
          if (active) setItemsLoading(false);
        }
      } catch (err) {
        if (!active) return;
        console.error(err);
        setNotFound(true);
      }
    })();

    return () => {
      active = false;
    };
  }, [projectId]);

  useEffect(() => {
    setCarouselIndex(0);
  }, [projectId]);

  const handleJournalDownload = useCallback(
    async (target: ItemResponse) => {
      if (!target.id) return;
      if (downloadingId === target.id) return;

      setDownloadingId(target.id);
      try {
        const data = await itemsApi.getJournalDownloadUrl(String(target.id));
        if (!data.downloadUrl) throw new Error('다운로드 URL이 없어요');
        window.open(data.downloadUrl, '_blank', 'noopener,noreferrer');
      } catch (err) {
        const message =
          err instanceof Error ? err.message : '파일 다운로드에 실패했어요.';
        toast.error(message);
      } finally {
        setDownloadingId(null);
      }
    },
    [downloadingId, toast],
  );

  const carouselImages = useMemo(() => {
    if (!project) return [];
    const list: string[] = [];
    if (project.thumbnailUrl) list.push(project.thumbnailUrl);
    if (project.imageUrls?.length) list.push(...project.imageUrls);
    return list;
  }, [project]);

  if (notFound) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-12">
        <h1 className="font-heading text-2xl text-slate-900">
          프로젝트를 찾을 수 없어요
        </h1>
        <Link
          to="/projects"
          className="mt-4 inline-block text-primary hover:underline"
        >
          목록으로 돌아가기 →
        </Link>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-12 text-slate-600">
        로딩 중...
      </div>
    );
  }

  const deadlineText = project.deadlineDate || project.endAt || '';
  const dDayLabel =
    typeof project.dDay === 'number'
      ? project.dDay === 0
        ? 'D-Day'
        : project.dDay > 0
        ? `D-${project.dDay}`
        : `D+${Math.abs(project.dDay)}`
      : null;

  const emptyItemsMessage = itemsLoading
    ? '불러오는 중...'
    : itemsError
    ? itemsError
    : items.length === 0
    ? '등록된 상품이 없어요'
    : null;

  const canCarouselPrev = carouselImages.length > 1 && carouselIndex > 0;
  const canCarouselNext =
    carouselImages.length > 1 && carouselIndex < carouselImages.length - 1;

  return (
    <div className="mx-auto max-w-6xl px-4 py-12">
      <Reveal>
        <div className="mt-6 rounded-3xl border border-slate-200 bg-white p-6">
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2 md:items-start">
            <div>
              <Link
                to="/projects"
                className="text-sm font-bold text-primary hover:underline"
              >
                ← 프로젝트 목록
              </Link>
              <div className="mt-3 flex flex-wrap items-center gap-3 md:gap-4">
                <StatusBadge
                  status={project.status}
                  className="px-4 py-2 text-sm"
                />
                {project.status === 'CLOSED' ? (
                  <span className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700">
                    마감됨
                  </span>
                ) : (
                  <>
                    {deadlineText && (
                      <span className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700">
                        <Calendar className="h-4 w-4 shrink-0 text-slate-500" />
                        마감일 {deadlineText}
                      </span>
                    )}
                    {dDayLabel && (
                      <span
                        className={[
                          'inline-flex items-center gap-1 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700',
                          typeof project.dDay === 'number' && project.dDay <= 7
                            ? 'text-rose-600 font-bold'
                            : '',
                        ].join(' ')}
                      >
                        <Clock className="h-4 w-4 shrink-0 text-slate-500" />
                        {dDayLabel}
                      </span>
                    )}
                  </>
                )}
              </div>
              <h1 className="mt-4 font-heading text-3xl text-slate-900">
                {project.title}
              </h1>
              {project.description && project.description.trim().length > 0 ? (
                <div className="mt-2 text-sm text-slate-700">
                  <ReactMarkdown
                    remarkPlugins={[remarkGfm, remarkBreaks]}
                    components={{
                      h1: ({ ...props }) => (
                        <h3 className="mt-5 text-lg font-heading text-slate-900 first:mt-0" {...props} />
                      ),
                      h2: ({ ...props }) => (
                        <h4 className="mt-4 text-base font-heading text-slate-900 first:mt-0" {...props} />
                      ),
                      p: ({ ...props }) => (
                        <p className="mt-3 whitespace-normal break-words leading-relaxed first:mt-0" {...props} />
                      ),
                      ul: ({ ...props }) => (
                        <ul className="mt-3 list-disc space-y-1 pl-5 first:mt-0" {...props} />
                      ),
                      ol: ({ ...props }) => (
                        <ol className="mt-3 list-decimal space-y-1 pl-5 first:mt-0" {...props} />
                      ),
                      a: ({ ...props }) => (
                        <a
                          className="text-primary underline decoration-slate-300 underline-offset-4 break-words"
                          target="_blank"
                          rel="noreferrer noopener"
                          {...props}
                        />
                      ),
                      code: ({ className, ...props }) => {
                        const isBlock = Boolean(className);
                        if (isBlock) {
                          return <code className="block whitespace-pre-wrap break-words" {...props} />;
                        }
                        return (
                          <code
                            className="rounded bg-slate-100 px-1.5 py-0.5 text-xs font-mono text-slate-700"
                            {...props}
                          />
                        );
                      },
                      pre: ({ ...props }) => (
                        <pre
                          className="mt-4 overflow-x-auto rounded-2xl border border-slate-200 bg-slate-50 p-4 text-xs text-slate-700"
                          {...props}
                        />
                      ),
                    }}
                  >
                    {project.description}
                  </ReactMarkdown>
                </div>
              ) : (
                <p className="mt-2 text-sm font-semibold text-slate-400">
                  등록된 상세 설명이 없어요
                </p>
              )}
            </div>

            <div className="relative overflow-hidden rounded-3xl border border-slate-200 bg-slate-100">
              {carouselImages.length > 0 ? (
                <>
                  <div
                    className="flex h-72 md:h-80"
                    style={{
                      width: `${carouselImages.length * 100}%`,
                      transform: `translateX(-${(carouselIndex / carouselImages.length) * 100}%)`,
                      transition: 'transform 300ms ease-out',
                    }}
                  >
                    {carouselImages.map((url, idx) => (
                      <div
                        key={`carousel-${idx}`}
                        className="h-full shrink-0"
                        style={{ width: `${100 / carouselImages.length}%` }}
                      >
                        <img
                          src={url}
                          alt={
                            idx === 0
                              ? project.title
                              : `${project.title} 상세 이미지 ${idx}`
                          }
                          className="h-full w-full object-cover"
                        />
                      </div>
                    ))}
                  </div>
                  {carouselImages.length > 1 && (
                    <>
                      <button
                        type="button"
                        onClick={() =>
                          setCarouselIndex((i) => Math.max(0, i - 1))
                        }
                        disabled={!canCarouselPrev}
                        className="absolute left-2 top-1/2 -translate-y-1/2 flex h-10 w-10 items-center justify-center rounded-full bg-white/90 text-slate-700 shadow-md transition hover:bg-white disabled:opacity-30 disabled:pointer-events-none"
                        aria-label="이전 이미지"
                      >
                        <ChevronLeft className="h-6 w-6" />
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          setCarouselIndex((i) =>
                            Math.min(carouselImages.length - 1, i + 1),
                          )
                        }
                        disabled={!canCarouselNext}
                        className="absolute right-2 top-1/2 -translate-y-1/2 flex h-10 w-10 items-center justify-center rounded-full bg-white/90 text-slate-700 shadow-md transition hover:bg-white disabled:opacity-30 disabled:pointer-events-none"
                        aria-label="다음 이미지"
                      >
                        <ChevronRight className="h-6 w-6" />
                      </button>
                      <div className="absolute bottom-3 left-1/2 flex -translate-x-1/2 gap-1.5">
                        {carouselImages.map((_, idx) => (
                          <button
                            key={idx}
                            type="button"
                            onClick={() => setCarouselIndex(idx)}
                            className={`h-2 rounded-full transition ${
                              idx === carouselIndex
                                ? 'w-6 bg-white'
                                : 'w-2 bg-white/60 hover:bg-white/80'
                            }`}
                            aria-label={`이미지 ${idx + 1}`}
                          />
                        ))}
                      </div>
                    </>
                  )}
                </>
              ) : (
                <div className="flex h-72 items-center justify-center text-sm font-semibold text-slate-400 md:h-80">
                  대표 이미지 없음
                </div>
              )}
            </div>
          </div>
        </div>
      </Reveal>

      <div id="apply" className="mt-10">
        <Reveal className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="font-heading text-xl font-bold text-slate-900">
            상품 목록
            {items.length > 0 && (
              <span className="ml-2 text-base font-normal text-slate-500">
                {items.length}개 상품
              </span>
            )}
          </h2>

          {emptyItemsMessage ? (
            <p
              className={[
                'mt-6 text-sm font-semibold',
                itemsError ? 'text-rose-600' : 'text-slate-500',
              ].join(' ')}
            >
              {emptyItemsMessage}
            </p>
          ) : (
            <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {items.map((item) => {
                const saleTypeLabel =
                  SALETYPE_LABELS[item.saleType] ?? item.saleType;
                const statusLabel = STATUS_LABELS[item.status] ?? item.status;
                const isMuted = item.status !== 'OPEN';
                const isGroupbuy = item.saleType === 'GROUPBUY';
                const isJournal = item.itemType === 'DIGITAL_JOURNAL';
                const isJournalDownloadable = isJournal && item.status === 'OPEN';

                if (isJournal) {
                  return (
                    <div
                      key={item.id}
                      className={[
                        'group flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:shadow-md',
                        isMuted ? 'opacity-75' : '',
                      ].join(' ')}
                    >
                      <div className="aspect-square w-full overflow-hidden bg-slate-100">
                        {item.thumbnailUrl ? (
                          <img
                            src={item.thumbnailUrl}
                            alt={item.name}
                            className="h-full w-full object-cover transition duration-200 group-hover:scale-105"
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center text-xs font-semibold text-slate-400">
                            대표 이미지 없음
                          </div>
                        )}
                      </div>
                      <div className="flex flex-1 flex-col p-4">
                        <p className="line-clamp-2 text-sm font-bold text-slate-900">
                          {item.name}
                        </p>
                        {item.summary && (
                          <p className="mt-1 line-clamp-1 text-xs text-slate-500">
                            {item.summary}
                          </p>
                        )}
                        <p className="mt-2 text-base font-bold text-slate-900">
                          {formatMoney(item.price)}원
                        </p>
                        <div className="mt-3 flex flex-wrap items-center gap-1.5">
                          <span
                            className={[
                              'inline-flex rounded-md px-2 py-0.5 text-[10px] font-bold',
                              item.status === 'OPEN'
                                ? 'bg-emerald-50 text-emerald-700'
                                : 'bg-slate-100 text-slate-600',
                            ].join(' ')}
                          >
                            {statusLabel}
                          </span>
                        </div>
                        <div className="mt-3">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              if (isJournalDownloadable) {
                                void handleJournalDownload(item);
                              }
                            }}
                            disabled={
                              downloadingId === item.id || !isJournalDownloadable
                            }
                            title={
                              isJournalDownloadable
                                ? undefined
                                : '진행중일 때만 다운로드 가능'
                            }
                            className="w-full rounded-xl bg-primary py-2.5 text-sm font-bold text-white transition hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            {downloadingId === item.id
                              ? '다운로드 중...'
                              : '다운로드'}
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                }

                return (
                  <Link
                    key={item.id}
                    to={`/projects/${project.id}/items/${item.id}`}
                    className={[
                      'group flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:shadow-md',
                      isMuted ? 'opacity-75' : '',
                    ].join(' ')}
                  >
                    <div className="aspect-square w-full overflow-hidden bg-slate-100">
                      {item.thumbnailUrl ? (
                        <img
                          src={item.thumbnailUrl}
                          alt={item.name}
                          className="h-full w-full object-cover transition duration-200 group-hover:scale-105"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-xs font-semibold text-slate-400">
                          대표 이미지 없음
                        </div>
                      )}
                    </div>
                    <div className="flex flex-1 flex-col p-4">
                      <p className="line-clamp-2 text-sm font-bold text-slate-900">
                        {item.name}
                      </p>
                      {item.summary && (
                        <p className="mt-1 line-clamp-1 text-xs text-slate-500">
                          {item.summary}
                        </p>
                      )}
                      <p className="mt-2 text-base font-bold text-slate-900">
                        {formatMoney(item.price)}원
                      </p>
                      <div className="mt-3 flex flex-wrap items-center gap-1.5">
                        <span
                          className={[
                            'inline-flex rounded-md px-2 py-0.5 text-[10px] font-bold',
                            isGroupbuy
                              ? 'bg-amber-50 text-amber-700'
                              : 'bg-slate-100 text-slate-600',
                          ].join(' ')}
                        >
                          {saleTypeLabel}
                        </span>
                        <span
                          className={[
                            'inline-flex rounded-md px-2 py-0.5 text-[10px] font-bold',
                            item.status === 'OPEN'
                              ? 'bg-emerald-50 text-emerald-700'
                              : item.status === 'PREPARING'
                              ? 'bg-slate-100 text-slate-600'
                              : 'bg-rose-50 text-rose-600',
                          ].join(' ')}
                        >
                          {statusLabel}
                        </span>
                      </div>
                      <p className="mt-3 text-center text-xs font-semibold text-primary">
                        상품 보기 →
                      </p>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </Reveal>
      </div>
    </div>
  );
}

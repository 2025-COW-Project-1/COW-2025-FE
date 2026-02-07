import { useCallback, useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Calendar, Clock } from 'lucide-react';
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
              {project.summary ? (
                <p className="mt-2 line-clamp-2 text-sm text-slate-700">
                  {project.summary}
                </p>
              ) : (
                <p className="mt-2 text-sm font-semibold text-slate-400">
                  한줄 설명이 없어요
                </p>
              )}
            </div>

            <div className="overflow-hidden rounded-3xl border border-slate-200 bg-slate-100">
              {project.thumbnailUrl ? (
                <img
                  src={project.thumbnailUrl}
                  alt={project.title}
                  className="h-72 w-full object-cover md:h-80"
                />
              ) : (
                <div className="flex h-72 items-center justify-center text-sm font-semibold text-slate-400 md:h-80">
                  대표 이미지 없음
                </div>
              )}
            </div>
          </div>
        </div>
      </Reveal>

      <div className="mt-8">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {project.imageUrls && project.imageUrls.length > 0 ? (
            project.imageUrls.map((url, idx) => (
              <div
                key={`${project.id}-image-${idx}`}
                className="overflow-hidden rounded-2xl border border-slate-200 bg-slate-50"
              >
                <img
                  src={url}
                  alt={`${project.title} 상세 이미지 ${idx + 1}`}
                  className="h-64 w-full object-cover"
                />
              </div>
            ))
          ) : (
            <div className="col-span-full flex h-40 items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-white/70 text-sm font-semibold text-slate-400">
              업로드된 이미지가 없어요
            </div>
          )}
        </div>
      </div>

      <div id="apply" className="mt-10">
        <Reveal className="rounded-3xl border border-slate-200 bg-white p-6">
          <h2 className="font-heading text-xl text-slate-900">상품 목록</h2>

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
            <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
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
                        'group overflow-hidden rounded-2xl border border-slate-200 bg-white transition hover:border-primary/40 hover:shadow-sm',
                        isMuted ? 'opacity-75' : '',
                      ].join(' ')}
                    >
                      <div className="h-40 w-full overflow-hidden bg-slate-100">
                        {item.thumbnailUrl ? (
                          <img
                            src={item.thumbnailUrl}
                            alt={item.name}
                            className="h-full w-full object-cover transition duration-200 group-hover:scale-[1.02]"
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center text-xs font-semibold text-slate-400">
                            대표 이미지 없음
                          </div>
                        )}
                      </div>
                      <div className="flex flex-1 flex-col gap-2 p-4">
                        <div className="flex flex-wrap items-start justify-between gap-2">
                          <div>
                            <p className="text-sm font-bold text-slate-900">
                              {item.name}
                            </p>
                            {item.summary && (
                              <p className="text-xs text-slate-500">
                                {item.summary}
                              </p>
                            )}
                          </div>
                          <div className="flex flex-wrap items-center gap-1">
                            <span
                              className={[
                                'inline-flex rounded-full px-2 py-1 text-[10px] font-bold',
                                isGroupbuy
                                  ? 'bg-amber-50 text-amber-700'
                                  : 'bg-slate-100 text-slate-600',
                              ].join(' ')}
                            >
                              {saleTypeLabel}
                            </span>
                            <span
                              className={[
                                'inline-flex rounded-full px-2 py-1 text-[10px] font-bold',
                                item.status === 'OPEN'
                                  ? 'bg-emerald-50 text-emerald-600'
                                  : item.status === 'PREPARING'
                                  ? 'bg-slate-100 text-slate-600'
                                  : 'bg-rose-50 text-rose-600',
                              ].join(' ')}
                            >
                              {statusLabel}
                            </span>
                          </div>
                        </div>

                        <div className="mt-2 flex justify-end">
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
                            className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-bold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
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
                      'group overflow-hidden rounded-2xl border border-slate-200 bg-white transition hover:border-primary/40 hover:shadow-sm',
                      isMuted ? 'opacity-75' : '',
                    ].join(' ')}
                  >
                    <div className="h-40 w-full overflow-hidden bg-slate-100">
                      {item.thumbnailUrl ? (
                        <img
                          src={item.thumbnailUrl}
                          alt={item.name}
                          className="h-full w-full object-cover transition duration-200 group-hover:scale-[1.02]"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-xs font-semibold text-slate-400">
                          대표 이미지 없음
                        </div>
                      )}
                    </div>
                    <div className="flex flex-1 flex-col gap-2 p-4">
                      <div className="flex flex-wrap items-start justify-between gap-2">
                        <div>
                          <p className="text-sm font-bold text-slate-900">
                            {item.name}
                          </p>
                          {item.summary && (
                            <p className="text-xs text-slate-500">
                              {item.summary}
                            </p>
                          )}
                          <p className="text-xs text-slate-500">
                            {formatMoney(item.price)}원
                          </p>
                        </div>
                        <div className="flex flex-wrap items-center gap-1">
                          <span
                            className={[
                              'inline-flex rounded-full px-2 py-1 text-[10px] font-bold',
                              isGroupbuy
                                ? 'bg-amber-50 text-amber-700'
                                : 'bg-slate-100 text-slate-600',
                            ].join(' ')}
                          >
                            {saleTypeLabel}
                          </span>
                          <span
                            className={[
                              'inline-flex rounded-full px-2 py-1 text-[10px] font-bold',
                              item.status === 'OPEN'
                                ? 'bg-emerald-50 text-emerald-600'
                                : item.status === 'PREPARING'
                                ? 'bg-slate-100 text-slate-600'
                                : 'bg-rose-50 text-rose-600',
                            ].join(' ')}
                          >
                            {statusLabel}
                          </span>
                        </div>
                      </div>
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

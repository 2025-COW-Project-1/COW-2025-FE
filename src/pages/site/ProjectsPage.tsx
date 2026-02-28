import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import Reveal from '../../components/Reveal';
import ProjectCard from '../../components/ProjectCard';
import { projectsApi } from '../../api/projects';
import type { Project, ProjectStatus } from '../../api/projects';
import { sortProjects } from '../../utils/projectSort';

type TabValue = ProjectStatus | 'all';

const TABS: { label: string; value: TabValue }[] = [
  { label: '전체', value: 'all' },
  { label: '진행 중', value: 'OPEN' },
  { label: '준비중', value: 'PREPARING' },
  { label: '마감', value: 'CLOSED' },
];
function isProjectStatus(v: string): v is ProjectStatus {
  return v === 'OPEN' || v === 'PREPARING' || v === 'CLOSED';
}

function getYearFromProject(project: Project): string | null {
  const raw = project.deadlineDate ?? project.endAt;
  if (!raw) return null;
  if (Array.isArray(raw)) return raw[0] ? String(raw[0]) : null;
  if (typeof raw === 'string' && raw.length >= 4) return raw.slice(0, 4);
  return null;
}

function sortPinned(items: Project[]) {
  const base = sortProjects(items);
  const index = new Map(base.map((p, i) => [p.id, i]));
  return [...items].sort((a, b) => {
    const ao = a.pinnedOrder ?? Number.POSITIVE_INFINITY;
    const bo = b.pinnedOrder ?? Number.POSITIVE_INFINITY;
    if (ao !== bo) return ao - bo;
    return (index.get(a.id) ?? 0) - (index.get(b.id) ?? 0);
  });
}

export default function ProjectsPage() {
  const [sp, setSp] = useSearchParams();
  const [projects, setProjects] = useState<Project[]>([]);

  useEffect(() => {
    projectsApi.list().then(setProjects).catch(console.error);
  }, []);

  const raw = sp.get('status');
  const status: TabValue = raw ? (isProjectStatus(raw) ? raw : 'all') : 'all';

  const filtered = useMemo(() => {
    const list =
      status === 'all' ? projects : projects.filter((p) => p.status === status);
    return list;
  }, [projects, status]);

  const { pinnedProjects, yearSections } = useMemo(() => {
    const pinned = filtered.filter((p) => p.pinned);
    const unpinned = filtered.filter((p) => !p.pinned);
    const grouped = unpinned.reduce<Record<string, Project[]>>(
      (acc, project) => {
        const year = getYearFromProject(project) ?? '기타';
        if (!acc[year]) acc[year] = [];
        acc[year].push(project);
        return acc;
      },
      {},
    );

    const yearEntries = Object.entries(grouped).sort((a, b) => {
      if (a[0] === '기타') return 1;
      if (b[0] === '기타') return -1;
      return Number(b[0]) - Number(a[0]);
    });

    return {
      pinnedProjects: sortPinned(pinned),
      yearSections: yearEntries.map(
        ([year, items]) => [year, sortProjects(items)] as const,
      ),
    };
  }, [filtered]);

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:py-10">
        <Reveal>
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <h1 className="font-heading text-2xl font-bold text-slate-900 sm:text-3xl">
                컬렉션
              </h1>
              <p className="mt-1.5 text-sm text-slate-500">
                진행 중인 프로젝트와 상품을 만나보세요
              </p>
            </div>
          </div>
        </Reveal>

        <Reveal delayMs={60} className="mt-6">
          <div className="inline-flex rounded-2xl border border-slate-200 bg-white p-1 shadow-sm">
            {TABS.map((t) => {
              const active = status === t.value;
              return (
                <button
                  key={t.value}
                  onClick={() => {
                    if (t.value === 'all') setSp({});
                    else setSp({ status: t.value });
                  }}
                  className={[
                    'rounded-xl px-4 py-2.5 text-sm font-bold transition-all',
                    active
                      ? 'bg-primary text-white shadow-sm'
                      : 'text-slate-600 hover:bg-slate-50',
                  ].join(' ')}
                >
                  {t.label}
                </button>
              );
            })}
          </div>
        </Reveal>

        {pinnedProjects.length > 0 && (
          <section className="mt-8">
            <h2 className="text-lg font-bold text-slate-800">추천 프로젝트</h2>
            <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {pinnedProjects.map((p, i) => (
                <Reveal key={p.id} delayMs={i * 40}>
                  <div className="overflow-hidden rounded-2xl bg-white shadow-sm transition hover:shadow-md">
                    <ProjectCard project={p} size="large" showApplyAction={false} />
                  </div>
                </Reveal>
              ))}
            </div>
          </section>
        )}

        {yearSections.map(([year, items], sectionIndex) => (
          <section key={year} className="mt-10 first:mt-8">
            <h2 className="text-lg font-bold text-slate-800">
              {year === '기타' ? '기타' : `${year} 컬렉션`}
            </h2>
            <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {items.map((p, i) => (
                <Reveal key={p.id} delayMs={(sectionIndex + i) * 30}>
                  <div className="overflow-hidden rounded-2xl bg-white shadow-sm transition hover:shadow-md">
                    <ProjectCard project={p} size="large" showApplyAction={false} />
                  </div>
                </Reveal>
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}

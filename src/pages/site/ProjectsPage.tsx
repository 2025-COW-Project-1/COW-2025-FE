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
    <div className="mx-auto max-w-6xl px-4 py-12">
      <Reveal>
        <h1 className="font-heading text-3xl text-primary">프로젝트</h1>
        <p className="mt-2 text-slate-600">
          진행 상태에 따라 프로젝트를 확인할 수 있어요.
        </p>
      </Reveal>

      <Reveal delayMs={80} className="mt-6 flex flex-wrap gap-2">
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
                'rounded-full px-4 py-2 text-sm font-bold transition-colors',
                'border border-slate-200',
                active
                  ? 'bg-primary text-white'
                  : 'bg-white text-slate-700 hover:bg-slate-100',
              ].join(' ')}
            >
              {t.label}
            </button>
          );
        })}
      </Reveal>

      {pinnedProjects.length > 0 && (
        <div className="mt-8 grid grid-cols-1 gap-5 md:grid-cols-3">
          {pinnedProjects.map((p, i) => (
            <Reveal key={p.id} delayMs={i * 40}>
              <ProjectCard project={p} />
            </Reveal>
          ))}
        </div>
      )}

      {yearSections.map(([year, items], sectionIndex) => (
        <div key={year} className="mt-10">
          <div className="mt-12 text-2xl font-heading text-slate-900">
            {year}
          </div>
          <div className="mt-4 border-t border-slate-200" />
          <div className="mt-8 grid grid-cols-1 gap-5 md:grid-cols-3">
            {items.map((p, i) => (
              <Reveal key={p.id} delayMs={(sectionIndex + i) * 40}>
                <ProjectCard project={p} />
              </Reveal>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

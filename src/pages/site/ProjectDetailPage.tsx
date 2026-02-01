import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Calendar, Clock } from 'lucide-react';
import Reveal from '../../components/Reveal';
import StatusBadge from '../../components/StatusBadge';
import ApplyForm from '../../components/ApplyForm';
import { projectsApi } from '../../api/projects';
import type { Project } from '../../api/projects';

export default function ProjectDetailPage() {
  const { projectId } = useParams();
  const [project, setProject] = useState<Project | null>(null);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    let active = true;
    setNotFound(false);
    setProject(null);

    if (!projectId) {
      setNotFound(true);
      return () => {
        active = false;
      };
    }

    projectsApi
      .getById(projectId)
      .then((p) => {
        if (!active) return;
        if (!p) setNotFound(true);
        else setProject(p);
      })
      .catch((err) => {
        if (!active) return;
        console.error(err);
        setNotFound(true);
      });

    return () => {
      active = false;
    };
  }, [projectId]);

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

      <div className="mt-8 space-y-6">
        <div className="rounded-3xl border border-slate-200 bg-white p-6">
          <h2 className="font-heading text-xl text-slate-900">상세 설명</h2>
          {project.description && project.description.trim().length > 0 ? (
            <p className="mt-2 text-sm leading-relaxed text-slate-700 whitespace-pre-wrap">
              {project.description}
            </p>
          ) : (
            <p className="mt-2 text-sm font-semibold text-slate-400">
              등록된 상세 설명이 없어요
            </p>
          )}
        </div>

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
          <h2 className="font-heading text-xl text-slate-900">신청</h2>
          <p className="mt-2 text-sm text-slate-600">
            프로젝트 신청 정보를 입력해 주세요.
          </p>
          <ApplyForm project={project} />
        </Reveal>
      </div>
    </div>
  );
}

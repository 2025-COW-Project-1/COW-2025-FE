import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import Reveal from '../components/Reveal';
import StatusBadge from '../components/StatusBadge';
import ApplyForm from '../components/ApplyForm';
import { projectsApi } from '../api/projects';
import type { Project } from '../api/projects';

export default function ProjectDetailPage() {
  const { projectId } = useParams();
  const [project, setProject] = useState<Project | null>(null);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!projectId) return;
    projectsApi
      .getById(projectId)
      .then((p) => {
        if (!p) setNotFound(true);
        else setProject(p);
      })
      .catch(console.error);
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

  return (
    <div className="mx-auto max-w-6xl px-4 py-12">
      <Reveal>
        <Link
          to="/projects"
          className="text-sm font-bold text-primary hover:underline"
        >
          ← 프로젝트 목록
        </Link>

        <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
          <h1 className="font-heading text-3xl text-slate-900">
            {project.title}
          </h1>
          <StatusBadge status={project.status} />
        </div>

        <p className="mt-2 text-slate-600">{project.summary}</p>
        <p className="mt-1 text-sm text-slate-500">
          {project.startAt} ~ {project.endAt}
        </p>
      </Reveal>

      <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-2">
        <Reveal className="rounded-3xl border border-slate-200 bg-white p-6">
          <div className="h-56 rounded-2xl bg-slate-100" />
          <p className="mt-3 text-sm text-slate-600">
            프로젝트 이미지/설명 자리
          </p>
        </Reveal>

        <Reveal
          delayMs={100}
          className="rounded-3xl border border-slate-200 bg-white p-6"
        >
          <h2 className="font-heading text-xl text-slate-900">안내</h2>
          <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-slate-600">
            <li>수령/배송 방식은 프로젝트별로 달라요.</li>
            <li>수익 사용 목적과 정산은 종료 후 공개합니다.</li>
            <li>마감 이후에는 신청이 불가해요.</li>
          </ul>
        </Reveal>
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

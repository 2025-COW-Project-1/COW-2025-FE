import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import Reveal from '../components/Reveal';
import ProjectCard from '../components/ProjectCard';
import { projectsApi } from '../api/projects';
import type { Project } from '../api/projects';
import mjucraftLogo from '../assets/mjucraftLogo.png';

export default function MainPage() {
  const [projects, setProjects] = useState<Project[]>([]);

  useEffect(() => {
    projectsApi.list().then(setProjects).catch(console.error);
  }, []);

  const active = useMemo(
    () => projects.filter((p) => p.status === 'active').slice(0, 3),
    [projects]
  );

  return (
    <div>
      <section className="bg-white">
        <div className="mx-auto grid max-w-6xl grid-cols-1 items-center gap-10 px-4 py-16 md:grid-cols-2">
          <Reveal className="space-y-6">
            <h1 className="font-heading text-4xl leading-tight tracking-tight md:text-5xl">
              "우리의 손끝에서, <br /> 명지가 피어납니다."
              <span className="block text-primary">명지공방</span>
            </h1>

            <p className="text-base leading-relaxed text-slate-600">
              명지공방은 프로젝트 단위로 굿즈를 기획·제작하고, 수익 사용 방향을
              투명하게 공유합니다.
            </p>

            <div className="flex flex-wrap gap-3">
              <Link
                to="/projects?status=active"
                className="rounded-xl bg-primary px-5 py-3 text-sm font-bold text-white"
              >
                진행 중인 프로젝트 보기
              </Link>
              <Link
                to="/about"
                className="rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-bold text-slate-800 hover:bg-slate-50"
              >
                명지공방 소개
              </Link>
            </div>
          </Reveal>

          <Reveal
            delayMs={120}
            className="rounded-3xl border border-slate-200 bg-slate-50 p-10"
          >
            <div className="rounded-2xl bg-white p-8 shadow-sm">
              <div className="text-sm font-semibold text-slate-700">
                명지공방 로고
              </div>
              <div className="mt-3 h-48 rounded-xl bg-slate-100">
                <Link to="/about">
                  <img
                    src={mjucraftLogo}
                    alt="명지공방 소개 페이지로 이동"
                    className="w-full h-full object-contain"
                  />
                </Link>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-14">
        <Reveal>
          <div className="flex items-end justify-between gap-4">
            <div>
              <h2 className="font-heading text-2xl text-slate-900">
                진행 중인 프로젝트
              </h2>
              <p className="mt-2 text-sm text-slate-600">
                지금 신청 가능한 굿즈를 확인하세요.
              </p>
            </div>
            <Link
              to="/projects?status=active"
              className="text-sm font-bold text-primary hover:underline"
            >
              전체 보기 →
            </Link>
          </div>
        </Reveal>

        <div className="mt-8 grid grid-cols-1 gap-5 md:grid-cols-3">
          {active.map((p, i) => (
            <Reveal key={p.id} delayMs={i * 70}>
              <ProjectCard project={p} />
            </Reveal>
          ))}
        </div>
      </section>
    </div>
  );
}

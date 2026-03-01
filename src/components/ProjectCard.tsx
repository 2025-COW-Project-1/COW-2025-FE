// src/components/ProjectCard.tsx
import { Link } from "react-router-dom";
import { Calendar, Pin } from "lucide-react";
import StatusBadge from "./StatusBadge";
import type { Project } from "../api/projects";

type ProjectCardProps = {
  project: Project;
  showApplyAction?: boolean;
  size?: "default" | "large" | "main";
};

export default function ProjectCard({
  project,
  showApplyAction = true,
  size = "default",
}: ProjectCardProps) {
  const canApply = project.status === "OPEN";
  const deadlineText = project.endAt || "";
  const isLarge = size === "large";
  const isMain = size === "main";

  return (
    <div
      className="group flex h-full flex-col overflow-hidden rounded-3xl border border-slate-200 bg-white transition-all duration-300 ease-out hover:border-primary/25 hover:shadow-lg hover:shadow-slate-200/60"
      role="article"
      aria-label={project.title}
    >
      <Link
        to={`/projects/${project.id}`}
        className="flex min-h-0 flex-1 flex-col outline-none focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:ring-offset-2 focus-visible:ring-offset-white"
      >
        <div
          className={`relative overflow-hidden bg-slate-100 ${isMain ? "h-56" : isLarge ? "h-48" : "h-40"}`}
        >
          {project.thumbnailUrl ? (
            <img
              src={project.thumbnailUrl}
              alt={project.title}
              className="h-full w-full object-cover transition-transform duration-300 ease-out group-hover:scale-105"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-sm font-semibold text-slate-400">
              대표 이미지 없음
            </div>
          )}
          {project.pinned && (
            <div className="absolute left-3 top-3 inline-flex items-center gap-1 rounded-full border border-slate-200 bg-white/90 px-2.5 py-1 text-xs font-bold text-slate-700 shadow-sm">
              <Pin className="h-3.5 w-3.5 text-slate-700" aria-hidden="true" />
              고정
            </div>
          )}
        </div>
        <div className="flex flex-1 flex-col p-5">
          <div className="flex items-center justify-between">
            <StatusBadge status={project.status} />
            {project.status === "CLOSED" ? (
              <span className="inline-flex items-center gap-1 text-sm text-slate-600 leading-none">
                <Calendar className="h-4 w-4 text-slate-500" />
                <span className="font-medium text-slate-700">마감됨</span>
              </span>
            ) : deadlineText ? (
              <span className="inline-flex items-center gap-1 text-sm text-slate-600 leading-none">
                <Calendar className="h-4 w-4 text-slate-400" />
                마감:{" "}
                <span className="font-medium text-slate-700">
                  {deadlineText}
                </span>
              </span>
            ) : null}
          </div>
          <div className="mt-3 flex flex-1 flex-col">
            <div className="text-lg font-bold text-slate-900 transition-colors group-hover:text-primary">
              {project.title}
            </div>
            <p className="mt-2 line-clamp-2 text-sm text-slate-600">
              {project.summary}
            </p>
            <div className="h-4" />
          </div>
        </div>
      </Link>

      <div className="flex gap-2 p-5 pt-0">
        <Link
          to={`/projects/${project.id}`}
          className="flex-1 rounded-xl border border-slate-200 px-4 py-2.5 text-center text-sm font-bold text-slate-800 transition-colors hover:border-primary/40 hover:bg-primary/5 hover:text-primary"
        >
          상품 보러 가기
        </Link>
        {showApplyAction &&
          (canApply ? (
            <Link
              to={`/projects/${project.id}#apply`}
              onClick={(e) => e.stopPropagation()}
              className="rounded-xl bg-primary px-4 py-2.5 text-sm font-bold text-white transition-all hover:opacity-95 hover:shadow-md active:scale-[0.98]"
            >
              신청하기
            </Link>
          ) : (
            <button
              disabled
              className="rounded-xl bg-slate-200 px-4 py-2.5 text-sm font-bold text-slate-500"
            >
              {project.status === "CLOSED" ? "마감" : "준비중"}
            </button>
          ))}
      </div>
    </div>
  );
}

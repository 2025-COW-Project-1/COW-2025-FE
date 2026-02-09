import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import Reveal from '../../components/Reveal';
import { introApi, type IntroduceMainSummary } from '../../api/intro';
import IntroduceMainView from '../../features/introduce/IntroduceMainView';
import { projectsApi, type Project } from '../../api/projects';
import { sortProjects } from '../../utils/projectSort';
import ProjectCard from '../../components/ProjectCard';

const CAROUSEL_PEEK = false;

export default function MainPage() {
  const [introMain, setIntroMain] = useState<IntroduceMainSummary | null>(null);
  const [introLoading, setIntroLoading] = useState(true);
  const [projects, setProjects] = useState<Project[]>([]);
  const [projectsLoading, setProjectsLoading] = useState(true);
  const [projectsError, setProjectsError] = useState(false);
  const [isScrollable, setIsScrollable] = useState(false);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const fetchedRef = useRef(false);
  const projectsFetchedRef = useRef(false);
  const scrollerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (fetchedRef.current) return;
    fetchedRef.current = true;

    introApi
      .getMain()
      .then((data) => setIntroMain(data ?? null))
      .catch(() => setIntroMain(null))
      .finally(() => setIntroLoading(false));
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    const updatePreference = () => setPrefersReducedMotion(mediaQuery.matches);
    updatePreference();
    if (typeof mediaQuery.addEventListener === 'function') {
      mediaQuery.addEventListener('change', updatePreference);
      return () => mediaQuery.removeEventListener('change', updatePreference);
    }
    mediaQuery.addListener(updatePreference);
    return () => mediaQuery.removeListener(updatePreference);
  }, []);

  useEffect(() => {
    if (projectsFetchedRef.current) return;
    projectsFetchedRef.current = true;

    projectsApi
      .list()
      .then((list) => setProjects(list))
      .catch(() => setProjectsError(true))
      .finally(() => setProjectsLoading(false));
  }, []);

  const orderedProjects = useMemo(() => {
    const sorted = sortProjects(projects);
    const order: Project['status'][] = ['OPEN', 'PREPARING', 'CLOSED'];
    const grouped = order.flatMap((status) =>
      sorted.filter((project) => project.status === status),
    );
    const pinnedFirst = [
      ...grouped.filter((project) => project.pinned),
      ...grouped.filter((project) => !project.pinned),
    ];
    return pinnedFirst.slice(0, 9);
  }, [projects]);

  const scrollByCard = useCallback(
    (direction: 'left' | 'right') => {
      const el = scrollerRef.current;
      if (!el) return;
      const cards = Array.from(el.querySelectorAll<HTMLElement>('[data-card]'));
      if (cards.length === 0) return;
      const scrollLeft = el.scrollLeft;
      let activeIndex = 0;
      let minDistance = Number.POSITIVE_INFINITY;
      for (let i = 0; i < cards.length; i += 1) {
        const distance = Math.abs(cards[i].offsetLeft - scrollLeft);
        if (distance < minDistance) {
          minDistance = distance;
          activeIndex = i;
        }
      }
      const targetIndex =
        direction === 'right'
          ? Math.min(activeIndex + 1, cards.length - 1)
          : Math.max(activeIndex - 1, 0);
      el.scrollTo({
        left: cards[targetIndex].offsetLeft,
        behavior: prefersReducedMotion ? 'auto' : 'smooth',
      });
    },
    [prefersReducedMotion],
  );

  const updateScrollState = useCallback(() => {
    const el = scrollerRef.current;
    if (!el) return;
    const maxScrollLeft = el.scrollWidth - el.clientWidth;
    const scrollLeft = el.scrollLeft;
    const scrollable = maxScrollLeft > 1;
    setIsScrollable(scrollable);
    setCanScrollLeft(scrollable && scrollLeft > 1);
    setCanScrollRight(scrollable && scrollLeft < maxScrollLeft - 1);
  }, []);

  useEffect(() => {
    updateScrollState();
    const el = scrollerRef.current;
    if (!el) return;
    const observer = new ResizeObserver(() => updateScrollState());
    observer.observe(el);
    return () => observer.disconnect();
  }, [updateScrollState, orderedProjects.length]);

  return (
    <div>
      <IntroduceMainView data={introMain} loading={introLoading} variant="public" linkToAbout />

      <section className="mx-auto max-w-7xl px-4 py-14">
        <Reveal>
          <div className="flex items-end justify-between gap-4">
            <div>
              <h2 className="font-heading text-2xl text-slate-900">프로젝트</h2>
              <p className="mt-2 text-sm text-slate-600">곧 공개되거나 진행 중인 프로젝트를 확인하세요</p>
            </div>
            <Link to="/projects" className="text-sm font-bold text-primary hover:underline">
              전체 보기 →
            </Link>
          </div>
        </Reveal>

        <div className="mt-8">
          {projectsLoading ? (
            <p className="text-sm text-slate-500">불러오는 중</p>
          ) : projectsError ? (
            <p className="text-sm text-rose-600">프로젝트를 불러오지 못했어요</p>
          ) : orderedProjects.length === 0 ? (
            <p className="text-sm text-slate-500">등록된 프로젝트가 없어요</p>
          ) : (
            <div className="relative overflow-visible group">
              <div
                ref={scrollerRef}
                className={`no-scrollbar flex flex-nowrap snap-x snap-mandatory gap-6 md:gap-8 scroll-smooth pb-4 ${
                  CAROUSEL_PEEK ? 'overflow-x-auto pr-12 md:pr-16' : 'overflow-x-hidden pr-0'
                }`}
                onScroll={updateScrollState}
              >
                {orderedProjects.map((project, index) => (
                  <div
                    key={project.id}
                    data-card
                    className="shrink-0 snap-start w-[290px] sm:w-[330px] md:w-[370px] lg:w-[calc((100%-2rem)/3)]"
                  >
                    <Reveal delayMs={index * 80}>
                      <ProjectCard project={project} showApplyAction={false} size="main" />
                    </Reveal>
                  </div>
                ))}
              </div>

              {isScrollable && (
                <>
                  {canScrollLeft && (
                    <button
                      type="button"
                      onClick={() => scrollByCard('left')}
                      className="absolute left-2 top-1/2 -translate-y-1/2 hidden items-center justify-center rounded-full border border-slate-200 bg-white/90 p-2 text-slate-600 shadow-sm transition-opacity duration-200 hover:bg-white z-10 md:inline-flex md:opacity-0 md:group-hover:opacity-100"
                      aria-label="이전 프로젝트"
                    >
                      <ChevronLeft className="h-5 w-5" />
                    </button>
                  )}
                  {canScrollRight && (
                    <button
                      type="button"
                      onClick={() => scrollByCard('right')}
                      className="absolute right-2 top-1/2 -translate-y-1/2 hidden items-center justify-center rounded-full border border-slate-200 bg-white/90 p-2 text-slate-600 shadow-sm transition-opacity duration-200 hover:bg-white z-10 md:inline-flex md:opacity-0 md:group-hover:opacity-100"
                      aria-label="다음 프로젝트"
                    >
                      <ChevronRight className="h-5 w-5" />
                    </button>
                  )}
                </>
              )}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

import { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Reveal from '../../components/Reveal';
import {
  loadAdminContent,
  saveAdminContent,
  type AdminContent,
} from '../../utils/adminContent';
import {
  loadFeedbackEntries,
  type FeedbackEntry,
} from '../../utils/feedbackStore';
import { loadAdminSettlements } from '../../utils/adminSettlements';
import type { SettlementReport } from '../../types/settlements';
import AdminFeedbackFormSection from './sections/AdminFeedbackFormSection';
import AdminFeedbackListSection from './sections/AdminFeedbackListSection';
import AdminLinktreeSection from './sections/AdminLinktreeSection';
import AdminLinksSection from './sections/AdminLinksSection';
import AdminProjectsSection from './sections/AdminProjectsSection';
import AdminSettlementsSection from './sections/AdminSettlementsSection';
import AdminEditSection from './sections/AdminEditSection';
import AdminIntroduceEditorPage from './sections/AdminIntroduceEditorPage';

const LOCAL_SAVE_SECTIONS = new Set(['links', 'linktree', 'projects', 'form']);

export default function AdminDashboardPage() {
  const navigate = useNavigate();
  const location = useLocation();

  const rawHash = location.hash.replace('#', '');
  const [hashPath, hashQuery = ''] = rawHash.split('?');
  const section = hashPath || 'edit';

  const tabParam = new URLSearchParams(hashQuery).get('tab');
  const aboutTab = tabParam === 'detail' ? 'detail' : 'main';

  const [content, setContent] = useState<AdminContent>(() =>
    loadAdminContent()
  );
  const [dirty, setDirty] = useState(false);

  const [entries, setEntries] = useState<FeedbackEntry[]>(() =>
    loadFeedbackEntries()
  );

  const [settlements, setSettlements] = useState<SettlementReport[]>(() =>
    loadAdminSettlements()
  );
  const [settlementsDirty, setSettlementsDirty] = useState(false);

  const projectOptionsByTerm = useMemo(() => {
    const map: Record<string, string[]> = {};

    content.projectsIntro.forEach((project) => {
      const term = project.term.trim();
      const title = project.title.trim();

      if (!term || !title) return;

      const list = map[term] ?? [];
      if (!list.includes(title)) list.push(title);
      map[term] = list;
    });

    return map;
  }, [content.projectsIntro]);

  const updateContent = (next: AdminContent) => {
    setContent(next);
    setDirty(true);
  };

  useEffect(() => {
    if (section === 'about-main') {
      navigate('/admin#about?tab=main', { replace: true });
      return;
    }

    if (section === 'about-detail') {
      navigate('/admin#about?tab=detail', { replace: true });
      return;
    }

    if (section === 'about' && !tabParam) {
      navigate('/admin#about?tab=main', { replace: true });
    }
  }, [navigate, section, tabParam]);

  const showLocalSaveButton = LOCAL_SAVE_SECTIONS.has(section);

  return (
    <div className="mx-auto max-w-6xl px-4 py-12">
      <Reveal>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="font-heading text-3xl text-primary">
              관리자 대시보드
            </h1>
            <p className="mt-2 text-sm text-slate-600">관리자 권한</p>
          </div>

          {showLocalSaveButton ? (
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => {
                  saveAdminContent(content);
                  setDirty(false);
                }}
                className="rounded-xl bg-primary px-4 py-2 text-sm font-bold text-white"
              >
                {dirty ? '변경사항 저장' : '저장됨'}
              </button>
            </div>
          ) : null}
        </div>
      </Reveal>

      {section === 'edit' && <AdminEditSection />}

      {section === 'about' && (
        <AdminIntroduceEditorPage
          activeTab={aboutTab}
          onTabChange={(nextTab) => {
            navigate(`/admin#about?tab=${nextTab}`);
          }}
        />
      )}

      {section === 'links' && (
        <AdminLinksSection
          content={content}
          updateContent={updateContent}
        />
      )}

      {section === 'linktree' && (
        <AdminLinktreeSection
          content={content}
          updateContent={updateContent}
        />
      )}

      {section === 'projects' && (
        <AdminProjectsSection
          content={content}
          updateContent={updateContent}
        />
      )}

      {section === 'settlements' && (
        <AdminSettlementsSection
          settlements={settlements}
          setSettlements={setSettlements}
          settlementsDirty={settlementsDirty}
          setSettlementsDirty={setSettlementsDirty}
          projectOptionsByTerm={projectOptionsByTerm}
        />
      )}

      {section === 'form' && (
        <AdminFeedbackFormSection
          content={content}
          updateContent={updateContent}
        />
      )}

      {section === 'feedback' && (
        <AdminFeedbackListSection
          entries={entries}
          setEntries={setEntries}
        />
      )}
    </div>
  );
}
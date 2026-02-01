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
import { saveLinksToApi } from './sections/linksSave';
import AdminSettlementsSection from './sections/AdminSettlementsSection';
import AdminEditSection from './sections/AdminEditSection';
import AdminIntroduceEditorPage from './sections/AdminIntroduceEditorPage';

// const LOCAL_SAVE_SECTIONS = new Set(['links', 'linktree', 'projects', 'form']);

export default function AdminDashboardPage() {
  const navigate = useNavigate();
  const location = useLocation();

  const rawHash = location.hash.replace('#', '');
  const [hashPath, hashQuery = ''] = rawHash.split('?');
  const section = hashPath || 'edit';

  const tabParam = new URLSearchParams(hashQuery).get('tab');
  const aboutTab = tabParam === 'detail' ? 'detail' : 'main';

  const [content, setContent] = useState<AdminContent>(() => loadAdminContent());
  const [dirty, setDirty] = useState(false);

  const [entries, setEntries] = useState<FeedbackEntry[]>(() =>
    loadFeedbackEntries(),
  );

  const [settlements, setSettlements] = useState<SettlementReport[]>(() =>
    loadAdminSettlements(),
  );
  const [settlementsDirty, setSettlementsDirty] = useState(false);

  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState<string | null>(null);
  const [saveMsgTone, setSaveMsgTone] = useState<'success' | 'error' | null>(
    null,
  );

  useEffect(() => {
    setSaveMsg(null);
    setSaveMsgTone(null);
  }, [section]);

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
    setSaveMsg(null);
    setSaveMsgTone(null);
  };

  const handleSave = async () => {
    setSaving(true);
    setSaveMsg(null);
    setSaveMsgTone(null);

    try {
      saveAdminContent(content);
      setDirty(false);

      if (section === 'links') {
        const result = await saveLinksToApi(content);
        setSaveMsg(result.message);
      } else {
        setSaveMsg('저장했어요.');
      }

      setSaveMsgTone('success');
    } catch (e) {
      const message = e instanceof Error ? e.message : String(e);
      setSaveMsg(message || '저장에 실패했어요.');
      setSaveMsgTone('error');
    } finally {
      setSaving(false);
    }
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

          <div className="flex flex-col items-end gap-2">
            <button
              type="button"
              onClick={handleSave}
              disabled={saving}
              className={[
                'rounded-xl bg-primary px-4 py-2 text-sm font-bold text-white transition',
                saving ? 'opacity-60' : 'hover:opacity-95',
              ].join(' ')}
            >
              {saving ? '저장 중...' : dirty ? '변경사항 저장' : '저장'}
            </button>

            <div className="min-h-[18px]">
              {saveMsg && saveMsgTone === 'success' && (
                <p className="text-xs font-semibold text-emerald-600">
                  {saveMsg}
                </p>
              )}
              {saveMsg && saveMsgTone === 'error' && (
                <p className="text-xs font-semibold text-rose-600">
                  {saveMsg}
                </p>
              )}
            </div>
          </div>
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

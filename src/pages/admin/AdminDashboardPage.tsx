import { useEffect, useMemo, useState } from 'react';
import { useLocation } from 'react-router-dom';
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
import AdminAboutSection from './sections/AdminAboutSection';
import AdminFeedbackFormSection from './sections/AdminFeedbackFormSection';
import AdminFeedbackListSection from './sections/AdminFeedbackListSection';
import AdminLinktreeSection from './sections/AdminLinktreeSection';
import AdminLinksSection from './sections/AdminLinksSection';
import { saveLinksToApi } from './sections/linksSave';
import AdminProjectsSection from './sections/AdminProjectsSection';
import AdminSettlementsSection from './sections/AdminSettlementsSection';
import AdminEditSection from './sections/AdminEditSection';

export default function AdminDashboardPage() {
  const location = useLocation();
  const section = location.hash.replace('#', '') || 'edit';

  const [content, setContent] = useState<AdminContent>(() =>
    loadAdminContent(),
  );
  const [, setDirty] = useState(false);

  const [entries, setEntries] = useState<FeedbackEntry[]>(() =>
    loadFeedbackEntries(),
  );
  const [settlements, setSettlements] = useState<SettlementReport[]>(() =>
    loadAdminSettlements(),
  );
  const [settlementsDirty, setSettlementsDirty] = useState(false);

  // ✅ 저장 상태/메시지 (색상 구분)
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState<string | null>(null);
  const [saveMsgTone, setSaveMsgTone] = useState<'success' | 'error' | null>(
    null,
  );

  // ✅ 섹션 이동 시 메시지 숨김
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
    // 입력 중엔 메시지 지워주기(원하면 유지해도 됨)
    setSaveMsg(null);
    setSaveMsgTone(null);
  };

  const handleSave = async () => {
    setSaving(true);
    setSaveMsg(null);
    setSaveMsgTone(null);

    try {
      // 1) 기존 로컬 저장
      saveAdminContent(content);
      setDirty(false);

      // 2) links 섹션일 때만 SNS API 반영
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
              {saving ? '저장 중...' : '저장'}
            </button>

            {/* ✅ 저장 결과 메시지 (성공=녹색 / 실패=빨강) */}
            <div className="min-h-[18px]">
              {saveMsg && saveMsgTone === 'success' && (
                <p className="text-xs font-semibold text-emerald-600">
                  {saveMsg}
                </p>
              )}
              {saveMsg && saveMsgTone === 'error' && (
                <p className="text-xs font-semibold text-rose-600">{saveMsg}</p>
              )}
            </div>

            {/* (선택) 변경사항 표시가 꼭 필요하면 아래처럼 아주 작게 표시할 수 있음
            <p className="text-[11px] font-semibold text-slate-400">
              {dirty ? '변경사항 있음' : '최신 상태'}
            </p>
            */}
          </div>
        </div>
      </Reveal>

      {section === 'edit' && <AdminEditSection />}
      {section === 'about' && (
        <AdminAboutSection content={content} updateContent={updateContent} />
      )}
      {section === 'links' && (
        <AdminLinksSection content={content} updateContent={updateContent} />
      )}
      {section === 'linktree' && (
        <AdminLinktreeSection content={content} updateContent={updateContent} />
      )}
      {section === 'projects' && (
        <AdminProjectsSection content={content} updateContent={updateContent} />
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
        <AdminFeedbackListSection entries={entries} setEntries={setEntries} />
      )}
    </div>
  );
}

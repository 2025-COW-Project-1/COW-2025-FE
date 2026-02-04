import { useMemo } from 'react';
import type { ProfileForm } from './Types';

const REQUIRED = 'text-rose-500 ml-1';

type Props = {
  form: ProfileForm;
  loading?: boolean;
  profileSavedAt?: string | null;
  profileDirty?: boolean;
  profileError?: boolean;
  onSaveProfile?: () => void;
  updateField: (key: keyof ProfileForm, value: string) => void;
};

export default function MyPageProfileSection({
  form,
  loading,
  profileSavedAt,
  profileDirty,
  profileError,
  onSaveProfile,
  updateField,
}: Props) {
  const headerText = useMemo(
    () => ({
      title: '기본 정보',
      desc: '학교/연락처 정보를 입력해 주세요.',
    }),
    []
  );

  const isStaffExternal =
    form.academicStatus === 'STAFF' || form.academicStatus === 'EXTERNAL';
  const gradeEnabled =
    form.academicStatus === 'ENROLLED' || form.academicStatus === 'LEAVE';
  const isExternal = form.academicStatus === 'EXTERNAL';

  return (
    <section className="animate-fade-in rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="font-heading text-lg text-slate-900 sm:text-xl">
            {headerText.title}
          </h2>
          <p className="mt-1 text-sm text-slate-500">{headerText.desc}</p>
        </div>

        <div className="flex flex-col items-end gap-1">
          <button
            type="button"
            onClick={onSaveProfile}
            disabled={loading || !profileDirty}
            className="rounded-2xl bg-primary px-4 py-2 text-xs font-semibold text-white shadow-sm transition hover:opacity-95 disabled:opacity-60"
          >
            {loading ? '저장 중...' : '저장'}
          </button>
          {profileError && (
            <span className="text-xs font-semibold text-rose-600">
              필수 항목을 입력해주세요.
            </span>
          )}
          {profileSavedAt && (
            <span className="text-xs text-emerald-600">
              임시 저장됨: {profileSavedAt}
            </span>
          )}
        </div>
      </div>

      <div className="mt-6 grid grid-cols-2 gap-4">
        <div>
          <label className="text-sm font-medium text-slate-800">
            이름 <span className={REQUIRED}>*</span>
          </label>
          <input
            className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 text-[13px] outline-none transition focus:border-primary/60 focus:ring-4 focus:ring-primary/10 sm:text-sm"
            value={form.name}
            onChange={(e) => updateField('name', e.target.value)}
            placeholder="홍길동"
            required
          />
        </div>

        <div>
          <label className="text-sm font-medium text-slate-800">생년월일</label>
          <input
            type="date"
            className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 text-[13px] outline-none transition focus:border-primary/60 focus:ring-4 focus:ring-primary/10 sm:text-sm"
            value={form.birthDate}
            onChange={(e) => updateField('birthDate', e.target.value)}
          />
        </div>

        <div>
          <label className="text-sm font-medium text-slate-800">
            전화번호 <span className={REQUIRED}>*</span>
          </label>
          <input
            className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 text-[13px] outline-none transition focus:border-primary/60 focus:ring-4 focus:ring-primary/10 sm:text-sm"
            value={form.phoneNumber}
            onChange={(e) => updateField('phoneNumber', e.target.value)}
            placeholder="010-0000-0000"
            required
          />
        </div>

        <div>
          <label className="text-sm font-medium text-slate-800">
            학적 상태 <span className={REQUIRED}>*</span>
          </label>
          <select
            className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 text-[13px] outline-none transition focus:border-primary/60 focus:ring-4 focus:ring-primary/10 sm:text-sm"
            value={form.academicStatus}
            onChange={(e) => updateField('academicStatus', e.target.value)}
            required
          >
            <option value="">선택</option>
            <option value="ENROLLED">재학</option>
            <option value="LEAVE">휴학</option>
            <option value="GRADUATED">졸업</option>
            <option value="STAFF">교직원</option>
            <option value="EXTERNAL">외부인</option>
          </select>
        </div>

        <div>
          <label className="text-sm font-medium text-slate-800">
            학번 {!isStaffExternal && <span className={REQUIRED}>*</span>}
          </label>
          <input
            className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 text-[13px] outline-none transition focus:border-primary/60 focus:ring-4 focus:ring-primary/10 sm:text-sm"
            value={form.studentId}
            onChange={(e) => updateField('studentId', e.target.value)}
            placeholder={isStaffExternal ? '해당 없음' : '60260000'}
            required={!isStaffExternal}
            disabled={isStaffExternal}
          />
        </div>

        <div>
          <label className="text-sm font-medium text-slate-800">
            캠퍼스 {!isExternal && <span className={REQUIRED}>*</span>}
          </label>

          {isExternal ? (
            <input
              className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none disabled:bg-slate-100 disabled:text-slate-400"
              value="해당 없음"
              disabled
            />
          ) : (
            <select
              className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-primary/60 focus:ring-4 focus:ring-primary/10"
              value={form.campus}
              onChange={(e) => updateField('campus', e.target.value)}
              required
            >
              <option value="">선택</option>
              <option value="SEOUL">인문캠퍼스</option>
              <option value="YONGIN">자연캠퍼스</option>
            </select>
          )}
        </div>

        <div>
          <label className="text-sm font-medium text-slate-800">
            학과 {!isStaffExternal && <span className={REQUIRED}>*</span>}
          </label>
          <input
            className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 text-[13px] outline-none transition focus:border-primary/60 focus:ring-4 focus:ring-primary/10 sm:text-sm"
            value={form.major}
            onChange={(e) => updateField('major', e.target.value)}
            placeholder={isStaffExternal ? '해당 없음' : '융합소프트웨어학부'}
            required={!isStaffExternal}
            disabled={isStaffExternal}
          />
        </div>

        <div>
          <label className="text-sm font-medium text-slate-800">
            학년{' '}
            {form.academicStatus === 'ENROLLED' && (
              <span className={REQUIRED}>*</span>
            )}
          </label>

          {gradeEnabled && !isStaffExternal ? (
            <select
              className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 text-[13px] outline-none transition focus:border-primary/60 focus:ring-4 focus:ring-primary/10 sm:text-sm"
              value={form.grade}
              onChange={(e) => updateField('grade', e.target.value)}
              required={form.academicStatus === 'ENROLLED'}
            >
              <option value="">선택</option>
              <option value="1학년">1학년</option>
              <option value="2학년">2학년</option>
              <option value="3학년">3학년</option>
              <option value="4학년">4학년</option>
            </select>
          ) : (
            <input
              className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 text-[13px] outline-none transition focus:border-primary/60 focus:ring-4 focus:ring-primary/10 sm:text-sm"
              value="해당 없음"
              disabled
            />
          )}
        </div>

        <div>
          <label className="text-sm font-medium text-slate-800">
            성별 (선택)
          </label>
          <select
            className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 text-[13px] outline-none transition focus:border-primary/60 focus:ring-4 focus:ring-primary/10 sm:text-sm"
            value={form.gender}
            onChange={(e) => updateField('gender', e.target.value)}
          >
            <option value="">선택 안 함</option>
            <option value="MALE">남성</option>
            <option value="FEMALE">여성</option>
            <option value="NONE">기타</option>
          </select>
        </div>

        <div className="col-span-2 grid grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium text-slate-800">
              이메일 <span className={REQUIRED}>*</span>
            </label>
            <input
              className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 text-[13px] outline-none transition focus:border-primary/60 focus:ring-4 focus:ring-primary/10 sm:text-sm"
              value={form.email}
              onChange={(e) => updateField('email', e.target.value)}
              placeholder="user@example.com"
              required
            />
          </div>

          <div>
            <label className="text-sm font-medium text-slate-800">
              소셜 제공자 (읽기 전용)
            </label>
            <input
              className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-500"
              value={form.socialProvider}
              readOnly
            />
          </div>
        </div>
      </div>
    </section>
  );
}

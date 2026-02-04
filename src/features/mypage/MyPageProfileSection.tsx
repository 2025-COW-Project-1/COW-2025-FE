import Reveal from '../../components/Reveal';
import type { ProfileForm } from './Types';

const REQUIRED = 'text-rose-500 ml-1';

const formatPhoneWithCursor = (value: string, cursor: number) => {
  const digits = value.replace(/\D/g, '').slice(0, 11);
  const build = () => {
    if (digits.length <= 3) return digits;
    if (digits.length <= 7) return `${digits.slice(0, 3)}-${digits.slice(3)}`;
    return `${digits.slice(0, 3)}-${digits.slice(3, 7)}-${digits.slice(7)}`;
  };

  const formatted = build();
  const beforeCursor = value.slice(0, cursor).replace(/\D/g, '').length;
  if (beforeCursor === 0) return { formatted, nextCursor: 0 };

  let digitsSeen = 0;
  let nextCursor = formatted.length;
  for (let i = 0; i < formatted.length; i += 1) {
    if (/\d/.test(formatted[i])) digitsSeen += 1;
    if (digitsSeen === beforeCursor) {
      nextCursor = i + 1;
      break;
    }
  }

  return { formatted, nextCursor };
};

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
  const isStaffExternal =
    form.academicStatus === 'STAFF' || form.academicStatus === 'EXTERNAL';
  const gradeEnabled =
    form.academicStatus === 'ENROLLED' || form.academicStatus === 'LEAVE';
  const isExternal = form.academicStatus === 'EXTERNAL';

  return (
    <Reveal delayMs={80}>
      <section className="animate-fade-in rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="font-heading text-lg text-slate-900 sm:text-xl">
              기본 정보
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              학교/연락처 정보를 입력해 주세요.
            </p>
          </div>
          <div className="flex items-center gap-3">
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
            <button
              type="button"
              onClick={onSaveProfile}
              disabled={loading || !profileDirty}
              className="rounded-2xl bg-primary px-4 py-2 text-xs font-semibold text-white shadow-sm transition hover:opacity-95 disabled:opacity-60"
            >
              {loading ? '저장 중...' : '저장'}
            </button>
          </div>
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <div>
            <label className="text-sm font-medium text-slate-800">
              이름 <span className={REQUIRED}>*</span>
            </label>
            <input
              className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-primary/60 focus:ring-4 focus:ring-primary/10"
              value={form.name}
              onChange={(e) => updateField('name', e.target.value)}
              placeholder="홍길동"
              required
            />
          </div>

          <div>
            <label className="text-sm font-medium text-slate-800">
              생년월일
            </label>
            <input
              type="date"
              className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-primary/60 focus:ring-4 focus:ring-primary/10"
              value={form.birthDate}
              onChange={(e) => updateField('birthDate', e.target.value)}
            />
          </div>

          <div>
            <label className="text-sm font-medium text-slate-800">
              전화번호 <span className={REQUIRED}>*</span>
            </label>
            <input
              className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-primary/60 focus:ring-4 focus:ring-primary/10"
              value={form.phoneNumber}
              onChange={(e) => {
                const input = e.currentTarget;
                const cursor = input.selectionStart ?? input.value.length;
                const { formatted, nextCursor } = formatPhoneWithCursor(
                  input.value,
                  cursor
                );
                updateField('phoneNumber', formatted);
                requestAnimationFrame(() => {
                  input.setSelectionRange(nextCursor, nextCursor);
                });
              }}
              placeholder="010-0000-0000"
              required
            />
          </div>

          <div>
            <label className="text-sm font-medium text-slate-800">
              학적 상태 <span className={REQUIRED}>*</span>
            </label>
            <select
              className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-primary/60 focus:ring-4 focus:ring-primary/10"
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
              className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-primary/60 focus:ring-4 focus:ring-primary/10 disabled:bg-slate-100 disabled:text-slate-400"
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
              className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-primary/60 focus:ring-4 focus:ring-primary/10 disabled:bg-slate-100 disabled:text-slate-400"
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
                className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-primary/60 focus:ring-4 focus:ring-primary/10"
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
                className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none disabled:bg-slate-100 disabled:text-slate-400"
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
              className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-primary/60 focus:ring-4 focus:ring-primary/10"
              value={form.gender}
              onChange={(e) => updateField('gender', e.target.value)}
            >
              <option value="">선택 안 함</option>
              <option value="MALE">남성</option>
              <option value="FEMALE">여성</option>
              <option value="NONE">기타</option>
            </select>
          </div>
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <div>
            <label className="text-sm font-medium text-slate-800">
              이메일 <span className={REQUIRED}>*</span>
            </label>
            <input
              className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-primary/60 focus:ring-4 focus:ring-primary/10"
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
      </section>
    </Reveal>
  );
}

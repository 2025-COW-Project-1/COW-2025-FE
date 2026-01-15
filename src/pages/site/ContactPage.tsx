import { useMemo, useState } from 'react';
import Reveal from '../../components/Reveal';
import BrandIcon from '../../components/BrandIcon';
import { addFeedbackEntry } from '../../utils/feedbackStore';
import { loadAdminContent } from '../../utils/adminContent';

export default function ContactPage() {
  const content = useMemo(() => loadAdminContent(), []);
  const [isStudent, setIsStudent] = useState('');
  const [message, setMessage] = useState('');
  const [submitted, setSubmitted] = useState(false);

  return (
    <div className="mx-auto max-w-6xl px-4 py-12">
      <Reveal>
        <h1 className="font-heading text-3xl text-primary">문의</h1>
        <p className="mt-2 text-slate-600">
          링크트리 정보를 한 곳에 모으고, 피드백을 제출할 수 있어요.
        </p>
      </Reveal>

      <Reveal delayMs={80} className="mt-8 rounded-3xl bg-white p-8">
        <h2 className="font-heading text-xl text-slate-900">바로가기</h2>
        <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-2">
          {content.linktree.filter((item) => item.url.trim().length > 0)
            .length === 0 ? (
            <div className="rounded-2xl border border-slate-200 bg-white p-4 text-sm text-slate-500">
              등록된 링크가 없어요.
            </div>
          ) : (
            content.linktree
              .filter((item) => item.url.trim().length > 0)
              .map((item) => (
                <a
                  key={item.id}
                  href={item.url}
                  target={item.url.startsWith('/') ? undefined : '_blank'}
                  rel={item.url.startsWith('/') ? undefined : 'noreferrer'}
                  className="flex items-center gap-3 rounded-2xl border border-slate-200 px-4 py-4 text-sm font-bold text-slate-700 hover:bg-slate-50"
                >
                  <BrandIcon kind={item.kind} />
                  <div>
                    <div>{item.title}</div>
                    {item.description && (
                      <div className="mt-1 text-xs font-normal text-slate-500">
                        {item.description}
                      </div>
                    )}
                  </div>
                </a>
              ))
          )}
        </div>
      </Reveal>

      <Reveal
        id="feedback"
        delayMs={120}
        className="mt-10 rounded-3xl bg-white p-8"
      >
        <h2 className="font-heading text-xl text-slate-900">피드백 제출 폼</h2>
        <p className="mt-2 text-sm text-slate-600">
          명지공방에게 전하고 싶은 이야기를 들려주세요.
        </p>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (!isStudent || !message.trim()) return;
            addFeedbackEntry({ isStudent, message: message.trim() });
            setSubmitted(true);
            setMessage('');
          }}
          className="mt-6 space-y-5"
        >
          <div>
            <div className="text-sm font-bold text-slate-700">
              {content.feedbackForm.question1}
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              {content.feedbackForm.question1Options.map((opt) => (
                <button
                  type="button"
                  key={opt}
                  onClick={() => {
                    setIsStudent(opt);
                    if (submitted) setSubmitted(false);
                  }}
                  className={[
                    'rounded-full border px-4 py-2 text-sm font-bold transition-colors',
                    isStudent === opt
                      ? 'border-primary bg-primary text-white'
                      : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50',
                  ].join(' ')}
                >
                  {opt}
                </button>
              ))}
            </div>
          </div>

          <label className="block">
            <div className="text-sm font-bold text-slate-700">
              {content.feedbackForm.question2}
            </div>
            <textarea
              value={message}
              onChange={(e) => {
                setMessage(e.target.value);
                if (submitted) setSubmitted(false);
              }}
              rows={5}
              required
              className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-primary/60"
              placeholder="자유롭게 작성해주세요."
            />
          </label>

          <button
            type="submit"
            className="rounded-xl bg-primary px-5 py-3 text-sm font-bold text-white"
          >
            제출하기
          </button>

          {submitted && (
            <div className="rounded-2xl bg-primary/10 p-4 text-sm font-bold text-primary">
              제출이 완료되었습니다. 소중한 의견 감사합니다.
            </div>
          )}
        </form>
      </Reveal>
    </div>
  );
}

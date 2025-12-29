import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import logo from '../assets/logo1.png';

const LoginPage = () => {
  const navigate = useNavigate();
  const { login, isAuthenticated } = useAuth();
  const [studentId, setStudentId] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // 이미 로그인된 경우 메인 페이지로 리다이렉트
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/main', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  const isStudentIdValid = useMemo(() => studentId.length === 8, [studentId]);
  const isFormValid = isStudentIdValid && password.length > 0;

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // 클라이언트 측 유효성 검사
    if (!isFormValid) {
      setError(
        !isStudentIdValid
          ? '학번 8자리를 입력해주세요.'
          : '비밀번호를 입력해주세요.'
      );
      return;
    }

    setIsLoading(true);
    try {
      // ============================================
      // 서버 연결 시 사용: 실제 로그인 API 호출
      // ============================================
      await login(studentId, password);
      navigate('/main');

      // ============================================
      // 개발용 임시 코드 (서버 연결 전까지 사용)
      // 서버 연결 후 위의 코드를 사용하고 아래 코드 삭제
      // ============================================
      // 임시로 로그인 성공 처리 (실제 API 호출 전까지)
      // setTimeout(() => {
      //   navigate('/main');
      // }, 500);
    } catch (err) {
      // ============================================
      // 서버 연결 시: 백엔드에서 반환하는 에러 메시지 표시
      // ============================================
      setError(err instanceof Error ? err.message : '로그인에 실패했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-white px-4">
      <div className="mb-10">
        <a
          href="https://www.mju.ac.kr/sites/mjukr/intro/intro.html"
          target="_blank"
          rel="noopener noreferrer"
          className="cursor-pointer hover:opacity-80 transition-opacity"
        >
          <img
            src={logo}
            alt="Myongji University"
            className="w-60 h-auto object-contain"
          />
        </a>
      </div>

      <form
        onSubmit={handleLogin}
        className="w-full max-w-md space-y-6 bg-white/80 backdrop-blur-sm p-6 rounded-2xl shadow-md border border-gray-100"
      >
        <div className="space-y-2">
          <label className="block text-sm font-semibold text-gray-700">
            학번
          </label>
          <div className="relative">
            <input
              type="text"
              inputMode="numeric"
              maxLength={8}
              placeholder="학번 8자리를 입력하세요"
              value={studentId}
              onChange={(e) => {
                const onlyDigits = e.target.value.replace(/\\D/g, '');
                setStudentId(onlyDigits.slice(0, 8));
              }}
              className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#003366] focus:border-transparent outline-none transition-all text-black pr-12"
              required
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400">
              {studentId.length}/8
            </span>
          </div>
          <p className="text-xs text-gray-500">
            * 숫자만 입력 가능합니다. (모의 로그인: 8자리 숫자면 통과)
          </p>
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-semibold text-gray-700">
            비밀번호
          </label>
          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              placeholder="비밀번호를 입력하세요"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#003366] focus:border-transparent outline-none transition-all text-black pr-24"
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword((prev) => !prev)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-gray-500 hover:text-[#003366] transition-colors"
            >
              {showPassword ? '숨기기' : '표시'}
            </button>
          </div>
        </div>

        {error && (
          <div className="text-red-500 text-sm text-center bg-red-50 py-2 rounded-lg border border-red-100">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={isLoading || !isFormValid}
          className="w-full bg-[#003366] text-white p-4 rounded-xl font-bold hover:bg-[#002244] transform active:scale-[0.98] transition-all shadow-lg cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? '로그인 중...' : '로그인'}
        </button>

        <div className="text-xs text-gray-400 space-y-1">
          <p>• 현재는 목업 로그인입니다. 학번 8자리만 맞으면 통과합니다.</p>
          <p>
            • 서버 연결 시에는 실제 비밀번호 검증이 수행되며, 주석 처리된 API
            호출 코드를 활성화 할 예정입니다.
          </p>
        </div>
      </form>

      <button
        onClick={() => navigate('/signup')}
        className="mt-8 text-sm text-gray-500 hover:text-[#003366] transition-colors"
      >
        처음이신가요?{' '}
        <span className="text-[#003366] font-bold underline underline-offset-4">
          학번 인증하기
        </span>
      </button>
    </div>
  );
};

export default LoginPage;

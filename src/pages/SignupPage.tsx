import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

const SignupPage = () => {
  const navigate = useNavigate();
  const { signup } = useAuth();
  const [name, setName] = useState('');
  const [studentId, setStudentId] = useState('');
  const [department, setDepartment] = useState('');
  const [password, setPassword] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [studentIdVerified, setStudentIdVerified] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [verifyMessage, setVerifyMessage] = useState('');

  const isStep1Done = useMemo(() => name.trim().length > 0, [name]);
  const isStep2Done = useMemo(
    () => studentIdVerified && studentId.length === 8,
    [studentId, studentIdVerified]
  );
  const isStep3Done = useMemo(() => !!department, [department]);
  const isStep4Done = useMemo(() => password.length >= 4, [password]);

  const allStepsDone = isStep1Done && isStep2Done && isStep3Done && isStep4Done;

  const handleVerifyStudentId = async () => {
    setError('');
    setVerifyMessage('');

    if (studentId.length !== 8) {
      setError('학번 8자리를 입력한 후 인증을 진행해주세요.');
      return;
    }

    setIsVerifying(true);
    try {
      // ============================================
      // 서버 연동 시 사용: 학번 유효성 + 중복/미인증 여부 확인
      // 예시:
      // const res = await axios.get('/api/student/verify', { params: { studentId } });
      // if (!res.data.valid) throw new Error('유효하지 않은 학번입니다.');
      // if (res.data.verified) throw new Error('이미 인증된 학번입니다.');
      // ============================================

      // 목업: 8자리이면 인증 성공 처리
      setStudentIdVerified(true);
      setVerifyMessage('학번 인증이 완료되었습니다.');
    } catch (err) {
      setStudentIdVerified(false);
      setError(
        err instanceof Error ? err.message : '학번 인증에 실패했습니다.'
      );
    } finally {
      setIsVerifying(false);
    }
  };

  const handleSignup = async () => {
    setError('');
    setVerifyMessage('');

    // 클라이언트 측 유효성 검사
    if (!name.trim()) {
      setError('이름을 입력해주세요.');
      return;
    }

    if (studentId.length !== 8 || !studentIdVerified) {
      setError('학번 8자리 입력 후 인증을 완료해주세요.');
      return;
    }

    if (!department) {
      setError('학과를 선택해주세요.');
      return;
    }

    if (password.length < 4) {
      setError('비밀번호는 최소 4자 이상이어야 합니다.');
      return;
    }

    setIsLoading(true);
    try {
      // ============================================
      // 서버 연결 시 사용: 실제 회원가입 API 호출
      // ============================================
      await signup(name, studentId, department, password);
      alert('회원가입이 완료되었습니다.');
      navigate('/');

      // ============================================
      // 개발용 임시 코드 (서버 연결 전까지 사용)
      // 서버 연결 후 위의 코드를 사용하고 아래 코드 삭제
      // ============================================
      // 임시로 회원가입 성공 처리 (실제 API 호출 전까지)
      // setTimeout(() => {
      //   alert('회원가입이 완료되었습니다.');
      //   navigate('/');
      // }, 500);
    } catch (err) {
      // ============================================
      // 서버 연결 시: 백엔드에서 반환하는 에러 메시지 표시
      // ============================================
      setError(err instanceof Error ? err.message : '가입에 실패했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-white px-4">
      <h1 className="text-3xl font-extrabold mb-10 text-gray-900">계정 생성</h1>

      <div className="flex items-center space-x-4 mb-12 w-full max-w-md justify-center">
        {[
          { label: '이름 입력', active: isStep1Done },
          { label: '학번 인증', active: isStep2Done },
          { label: '학과 선택', active: isStep3Done },
          { label: '비밀번호', active: isStep4Done },
        ].map((step, idx) => (
          <div key={step.label} className="flex items-center">
            <div className="flex flex-col items-center">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center font-bold shadow-md transition-colors ${
                  step.active
                    ? 'bg-[#003366] text-white'
                    : 'bg-gray-200 text-gray-500'
                }`}
              >
                {idx + 1}
              </div>
              <span
                className={`text-xs mt-2 font-bold whitespace-nowrap ${
                  step.active ? 'text-[#003366]' : 'text-gray-500 opacity-70'
                }`}
              >
                {step.label}
              </span>
            </div>
            {idx < 3 && <div className="w-20 h-0.5 bg-gray-200 mx-2 md:mx-4" />}
          </div>
        ))}
      </div>

      <div className="w-full max-w-md space-y-4 bg-white/80 backdrop-blur-sm p-6 rounded-2xl shadow-md border border-gray-100">
        <div className="space-y-2">
          <label className="block text-sm font-semibold text-gray-700">
            이름
          </label>
          <input
            type="text"
            placeholder="이름을 입력하세요"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full p-4 border border-gray-100 bg-gray-50 rounded-2xl outline-none focus:bg-white focus:ring-2 focus:ring-[#003366] transition-all text-black"
          />
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-semibold text-gray-700">
            학번
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              inputMode="numeric"
              maxLength={8}
              placeholder="학번 8자리를 입력하세요"
              value={studentId}
              onChange={(e) => {
                const onlyDigits = e.target.value.replace(/\\D/g, '');
                setStudentId(onlyDigits.slice(0, 8));
                setStudentIdVerified(false);
                setVerifyMessage('');
              }}
              className="flex-1 p-4 border border-gray-100 bg-gray-50 rounded-2xl outline-none focus:bg-white focus:ring-2 focus:ring-[#003366] transition-all text-black"
            />
            <button
              type="button"
              onClick={handleVerifyStudentId}
              disabled={isVerifying || studentId.length !== 8}
              className="px-4 py-3 rounded-2xl bg-[#003366] text-white font-bold hover:bg-[#002244] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isVerifying ? '인증중' : '인증'}
            </button>
          </div>
          {verifyMessage && (
            <div className="text-xs text-green-600">{verifyMessage}</div>
          )}
          <p className="text-xs text-gray-500">
            * 숫자만 입력 가능합니다. (임시 가입: 8자리 숫자 인증 시 통과)
          </p>
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-semibold text-gray-700">
            학과 선택
          </label>
          <select
            value={department}
            onChange={(e) => setDepartment(e.target.value)}
            disabled={!studentIdVerified}
            className="w-full p-4 border border-gray-100 bg-gray-50 rounded-2xl outline-none focus:bg-white focus:ring-2 focus:ring-[#003366] transition-all text-black disabled:opacity-60"
          >
            <option value="">학과를 선택하세요</option>
            {['학과1', '학과2', '학과3', '학과4'].map((dept) => (
              <option key={dept} value={dept}>
                {dept}
              </option>
            ))}
          </select>
          <p className="text-xs text-gray-500">
            * 서버 연동 시 학과 목록을 API로 교체할 예정입니다.
          </p>
          {/* 
            // 서버 연동 예시
            // const { data } = await axios.get('/api/departments');
            // setDepartments(data); // 받아온 학과 리스트로 교체
          */}
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-semibold text-gray-700">
            비밀번호
          </label>
          <input
            type="password"
            placeholder="비밀번호를 설정하세요 (4자 이상)"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full p-4 border border-gray-100 bg-gray-50 rounded-2xl outline-none focus:bg-white focus:ring-2 focus:ring-[#003366] transition-all text-black"
          />
        </div>

        {error && (
          <div className="text-red-500 text-sm text-center mt-2 bg-red-50 py-2 rounded-lg border border-red-100">
            {error}
          </div>
        )}

        <button
          type="button"
          onClick={handleSignup}
          disabled={isLoading || !allStepsDone}
          className="w-full bg-[#003366] text-white p-4 rounded-full font-bold mt-4 hover:bg-[#002244] hover:shadow-lg transition-all transform active:scale-95 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? '처리 중...' : '가입 완료'}
        </button>
      </div>

      <button
        onClick={() => navigate('/')}
        className="mt-8 text-sm text-gray-400 hover:text-gray-600 transition-colors"
      >
        이미 학번 인증을 완료하셨나요?{' '}
        <span className="font-bold border-b border-gray-400">로그인</span>
      </button>
    </div>
  );
};

export default SignupPage;

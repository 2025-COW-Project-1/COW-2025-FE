import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const LoginPage = () => {
  const navigate = useNavigate();

  // 1. 입력값을 저장할 상태 연결
  const [studentId, setStudentId] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    // API 연결 예시
    try {
      console.log('Send to Backend:', { studentId, password });

      // 실제 연결 시 사용될 코드 흐름 (지금은 주석 처리)
      /*
      const response = await fetch('백엔드가_줄_서버_주소/login', {
        method: 'POST',
        body: JSON.stringify({ studentId, password })
      });
      if (response.ok) navigate('/main');
      */

      // TEST: 8자리면 바로 통과되게 설정
      if (studentId.length === 8) {
        navigate('/main');
      } else {
        alert('학번 8자리를 입력해주세요.');
      }
    } catch (error) {
      console.error('로그인 중 에러 발생:', error);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-white px-4">
      <div className="mb-8">
        <img
          src="/src/assets/logo.png"
          alt="Myongji University"
          className="w-32 h-32 object-contain"
        />
      </div>

      <form onSubmit={handleLogin} className="w-full max-w-md space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            학번
          </label>
          <input
            type="text"
            placeholder="학번 8자리를 입력하세요"
            value={studentId}
            onChange={(e) => setStudentId(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#003366] outline-none"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            비밀번호
          </label>
          <input
            type="password"
            placeholder="비밀번호를 입력하세요"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#003366] outline-none"
            required
          />
        </div>

        <button
          type="submit"
          className="w-full bg-[#003366] text-white p-3 rounded-lg font-bold hover:bg-[#002244] transition-colors"
        >
          로그인
        </button>
      </form>

      <button
        onClick={() => navigate('/signup')}
        className="mt-6 text-sm text-gray-600"
      >
        처음이신가요?{' '}
        <span className="text-[#003366] font-bold">회원가입 하기</span>
      </button>
    </div>
  );
};

export default LoginPage;

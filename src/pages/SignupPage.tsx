import { useNavigate } from 'react-router-dom';

const SignupPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-white px-4">
      <h1 className="text-3xl font-bold mb-8">계정 생성</h1>

      {/* 첨부파일의 프로세스 바 형태 구현 */}
      <div className="flex items-center space-x-4 mb-10 w-full max-w-md justify-center">
        <div className="flex flex-col items-center">
          <div className="w-8 h-8 bg-[#003366] text-white rounded-full flex items-center justify-center text-xs">
            1
          </div>
          <span className="text-[10px] mt-1 text-[#003366]">정보입력</span>
        </div>
        <div className="w-16 h-[1px] bg-gray-300"></div>
        <div className="flex flex-col items-center">
          <div className="w-8 h-8 bg-gray-200 text-gray-500 rounded-full flex items-center justify-center text-xs">
            2
          </div>
          <span className="text-[10px] mt-1 text-gray-400">학번인증</span>
        </div>
      </div>

      <form className="w-full max-w-md space-y-4">
        <input
          type="text"
          placeholder="이름을 입력하세요"
          className="w-full p-3 border border-gray-200 rounded-lg outline-none"
        />
        <input
          type="text"
          placeholder="학번을 입력하세요"
          className="w-full p-3 border border-gray-200 rounded-lg outline-none"
        />
        <input
          type="password"
          placeholder="비밀번호를 설정하세요"
          className="w-full p-3 border border-gray-200 rounded-lg outline-none"
        />

        <button
          onClick={() => navigate('/')} // 성공 시 다시 로그인으로 이동
          className="w-full bg-[#c0c0c0] text-white p-4 rounded-full font-bold mt-6 hover:bg-[#003366] transition-all"
        >
          가입 완료
        </button>
      </form>

      <button
        onClick={() => navigate('/')}
        className="mt-6 text-sm text-gray-500 hover:underline"
      >
        이미 계정이 있나요? <span className="font-bold">로그인</span>
      </button>
    </div>
  );
};

export default SignupPage;

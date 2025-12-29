# 서버 연결 가이드

백엔드 API와 연결할 때 확인하고 수정해야 할 사항들을 정리한 문서입니다.

## 📋 체크리스트

### 1. 환경 변수 설정

`.env.local` 파일을 생성하고 다음 변수들을 설정하세요:

```env
VITE_API_BASE_URL=/api
VITE_API_TIMEOUT=5000
VITE_TOKEN_KEY=access_token
```

**확인 사항:**

- 백엔드 API 베이스 URL이 다르면 `VITE_API_BASE_URL` 수정
- 개발 환경과 프로덕션 환경의 URL이 다른지 확인

### 2. API 엔드포인트 확인

`src/api/auth.ts` 파일에서 다음 엔드포인트들이 백엔드와 일치하는지 확인:

- [ ] `POST /auth/login` - 로그인
- [ ] `POST /auth/signup` - 회원가입
- [ ] `GET /auth/me` - 현재 사용자 정보 조회
- [ ] `POST /auth/logout` - 로그아웃

**엔드포인트가 다르면:**

- `src/api/auth.ts` 파일의 각 함수에서 엔드포인트 경로 수정

### 3. API 응답 형식 확인

백엔드 API 응답 형식이 다음과 같은지 확인:

```typescript
{
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
  code?: string | number;
}
```

**응답 형식이 다르면:**

- `src/types/api.ts`의 `ApiResponse` 인터페이스 수정
- `src/api/auth.ts`의 각 함수에서 응답 처리 로직 수정

### 4. 인증 토큰 형식 확인

**확인 사항:**

- 토큰이 JWT 형식인지 확인
- 토큰이 `Authorization: Bearer {token}` 형식으로 전송되는지 확인
- 다른 형식이면 `src/api/axios.ts`의 요청 인터셉터 수정

**예시 (다른 형식인 경우):**

```typescript
// Token 형식인 경우
config.headers.Authorization = `Token ${token}`;

// 커스텀 헤더인 경우
config.headers['X-Auth-Token'] = token;
```

### 5. 에러 처리 확인

**확인 사항:**

- 401 에러가 토큰 만료/인증 실패를 의미하는지 확인
- 다른 상태 코드를 사용하면 `src/api/axios.ts`의 응답 인터셉터 수정
- 에러 응답 형식이 예상과 일치하는지 확인

### 6. 사용자 정보 타입 확인

`src/types/api.ts`의 `UserInfo` 인터페이스가 백엔드 응답과 일치하는지 확인:

```typescript
export interface UserInfo {
  id: number;
  studentId: string;
  name: string;
  email?: string;
  role?: string;
}
```

**필드가 다르면:**

- `UserInfo` 인터페이스 수정
- 추가 필드가 있으면 추가

### 7. 코드 활성화

서버 연결 준비가 완료되면 다음 파일들에서 주석을 해제하세요:

#### `src/contexts/AuthContext.tsx`

1. **초기 사용자 정보 조회** (line 24-25):

```typescript
// 주석 해제
const userInfo = await authApi.getCurrentUser();
setUser(userInfo);
```

2. **로그아웃 API 호출** (line 45-50):

```typescript
// 주석 해제
try {
  await authApi.logout();
} catch (error) {
  console.error('Logout API error:', error);
}
```

#### `src/pages/LoginPage.tsx` & `src/pages/SignupPage.tsx`

개발용 임시 코드가 있다면 삭제하고 실제 API 호출 코드만 사용하세요.

## 🔧 수정이 필요한 경우

### API 엔드포인트가 다른 경우

`src/api/auth.ts` 파일에서 엔드포인트 경로 수정:

```typescript
// 예: /api/v1/auth/login인 경우
const response = await axiosInstance.post<ApiResponse<LoginResponse>>(
  '/api/v1/auth/login', // 여기 수정
  data
);
```

### 응답 형식이 다른 경우

`src/api/auth.ts` 파일에서 응답 처리 로직 수정:

```typescript
// 예: response.data가 직접 데이터인 경우
if (response.data) {
  return response.data; // response.data.data 대신
}
```

### 토큰 형식이 다른 경우

`src/api/axios.ts` 파일의 요청 인터셉터 수정:

```typescript
// 예: Token 형식인 경우
config.headers.Authorization = `Token ${token}`;
```

## 🧪 테스트

서버 연결 후 다음 기능들을 테스트하세요:

1. ✅ 로그인 기능
2. ✅ 회원가입 기능
3. ✅ 로그아웃 기능
4. ✅ 페이지 새로고침 시 사용자 정보 유지
5. ✅ 토큰 만료 시 자동 로그아웃
6. ✅ 에러 메시지 표시

## 📝 참고사항

- 모든 API 호출은 `src/api/` 폴더에 모듈화되어 있습니다
- 타입 정의는 `src/types/api.ts`에 있습니다
- 환경 변수는 `import.meta.env.VITE_*` 형식으로 접근합니다
- CORS 설정은 백엔드에서 처리해야 합니다

## 🆘 문제 해결

### CORS 에러가 발생하는 경우

백엔드에서 CORS 설정을 확인하세요:

- 프론트엔드 도메인이 허용 목록에 있는지 확인
- `Access-Control-Allow-Origin` 헤더 확인

### 401 에러가 계속 발생하는 경우

- 토큰이 올바르게 저장되고 있는지 확인 (`localStorage` 확인)
- 토큰 형식이 올바른지 확인
- 백엔드에서 토큰 검증 로직 확인

### 응답 형식이 맞지 않는 경우

브라우저 개발자 도구의 Network 탭에서 실제 응답 형식을 확인하고, `src/types/api.ts`와 `src/api/auth.ts`를 수정하세요.

# COW-2025-FE

명지대학교 2025 COW 프로젝트 프론트엔드

## 기술 스택

- React 19.2.0
- TypeScript 5.9.3
- Vite 7.2.4
- Tailwind CSS 4.1.18
- React Router DOM 7.11.0
- Axios 1.13.2

## 프로젝트 구조

```
src/
├── api/              # API 서비스 함수들
│   ├── axios.ts      # Axios 인스턴스 및 인터셉터 설정
│   └── auth.ts       # 인증 관련 API 함수
├── assets/           # 정적 파일 (이미지 등)
├── components/       # 재사용 가능한 컴포넌트
│   └── ProtectedRoute.tsx  # 인증이 필요한 라우트 보호
├── contexts/         # React Context
│   └── AuthContext.tsx      # 인증 상태 전역 관리
├── hooks/            # 커스텀 훅
├── pages/            # 페이지 컴포넌트
│   ├── LoginPage.tsx
│   ├── SignupPage.tsx
│   └── MainPage.tsx
├── types/            # TypeScript 타입 정의
│   └── api.ts        # API 관련 타입
└── utils/            # 유틸리티 함수
    └── storage.ts    # 로컬 스토리지 관리
```

## 환경 변수 설정

프로젝트 루트에 `.env.local` 파일을 생성하고 다음 변수들을 설정하세요:

```env
# API Base URL
VITE_API_BASE_URL=/api

# API Timeout (ms)
VITE_API_TIMEOUT=5000

# Token Storage Key
VITE_TOKEN_KEY=access_token
```

## 시작하기

### 설치

```bash
npm install
```

### 개발 서버 실행

```bash
npm run dev
```

### 빌드

```bash
npm run build
```

### 린트

```bash
npm run lint
```

## 백엔드 연동 준비사항

### API 응답 형식

백엔드 API는 다음 형식을 따라야 합니다:

```typescript
{
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
  code?: string | number;
}
```

### 인증

- JWT 토큰 기반 인증 사용
- 토큰은 `localStorage`에 저장됩니다
- 요청 시 `Authorization: Bearer {token}` 헤더 자동 추가
- 401 에러 발생 시 자동으로 로그인 페이지로 리다이렉트

### API 엔드포인트

현재 준비된 엔드포인트:

- `POST /api/auth/login` - 로그인
- `POST /api/auth/signup` - 회원가입
- `GET /api/auth/me` - 현재 사용자 정보 조회
- `POST /api/auth/logout` - 로그아웃

## 주요 기능

### 인증 시스템

- 로그인/회원가입
- JWT 토큰 관리
- Protected Route (인증 필요 페이지 보호)
- 자동 로그아웃 (토큰 만료 시)

### API 통신

- Axios 인터셉터를 통한 자동 토큰 추가
- 공통 에러 처리
- 타입 안전성 보장

## 개발 가이드

### 새로운 API 추가하기

1. `src/types/api.ts`에 타입 정의 추가
2. `src/api/` 폴더에 새로운 서비스 파일 생성
3. `src/api/axios.ts`의 인스턴스 사용

예시:

```typescript
// src/api/notice.ts
import axiosInstance from './axios';
import { ApiResponse } from '../types/api';

export const getNotices = async () => {
  const response = await axiosInstance.get<ApiResponse>('/notices');
  return response.data;
};
```

### Protected Route 사용하기

```typescript
<Route
  path="/protected"
  element={
    <ProtectedRoute>
      <YourComponent />
    </ProtectedRoute>
  }
/>
```

### 인증 상태 사용하기

```typescript
import { useAuth } from '../contexts/AuthContext';

const YourComponent = () => {
  const { user, isAuthenticated, login, logout } = useAuth();
  // ...
};
```

## 라이선스

MIT

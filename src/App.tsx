import { Route, Routes } from 'react-router-dom';
import SiteLayout from './components/SiteLayout';
import AdminLayout from './components/AdminLayout';
import MainPage from './pages/site/MainPage';
import AboutPage from './pages/site/AboutPage';
import FormPage from './pages/site/FormPage';
import ContactPage from './pages/site/ContactPage';
import MyPage from './pages/site/MyPage';
import ProjectsPage from './pages/site/ProjectsPage';
import ProjectDetailPage from './pages/site/ProjectDetailPage';
import ProjectItemDetailPage from './pages/site/ProjectItemDetailPage';
import ResourcesPage from './pages/site/ResourcesPage';
import SettlementsPage from './pages/site/SettlementsPage';
import LoginPage from './pages/site/LoginPage';
import OAuthCallbackPage from './pages/site/OAuthCallbackPage';
import NoticesPage from './pages/site/NoticesPage';
import NoticeDetailPage from './pages/site/NoticeDetailPage';
import AdminDashboardPage from './pages/admin/AdminDashboardPage';
import AdminProjectsListPage from './pages/admin/AdminProjectsListPage';
import AdminProjectEditorPage from './pages/admin/AdminProjectEditorPage';
import AdminProjectItemsListPage from './pages/admin/AdminProjectItemsListPage';
import AdminProjectItemCreatePage from './pages/admin/AdminProjectItemCreatePage';
import AdminItemDetailPage from './pages/admin/AdminItemDetailPage';
import AdminNoticesListPage from './pages/admin/AdminNoticesListPage';
import AdminNoticeEditorPage from './pages/admin/AdminNoticeEditorPage';
import AdminNoticeDetailPage from './pages/admin/AdminNoticeDetailPage';
import FloatingSns from './components/FloatingSns';

export default function App() {
  return (
    <>
      <Routes>
        <Route element={<SiteLayout />}>
          <Route path="/" element={<MainPage />} />
          <Route path="/projects" element={<ProjectsPage />} />
          <Route path="/projects/:projectId" element={<ProjectDetailPage />} />
          <Route
            path="/projects/:projectId/items/:itemId"
            element={<ProjectItemDetailPage />}
          />
          <Route path="/resources" element={<ResourcesPage />} />
          <Route path="/settlements" element={<SettlementsPage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/forms" element={<FormPage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/mypage" element={<MyPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/oauth/kakao/callback" element={<OAuthCallbackPage />} />
          <Route path="/oauth/naver/callback" element={<OAuthCallbackPage />} />
          <Route path="/notices" element={<NoticesPage />} />
          <Route path="/notices/:noticeId" element={<NoticeDetailPage />} />
        </Route>

        <Route element={<AdminLayout />}>
          <Route path="/admin" element={<AdminDashboardPage />} />
          <Route path="/admin/projects" element={<AdminProjectsListPage />} />
          <Route
            path="/admin/projects/new"
            element={<AdminProjectEditorPage />}
          />
          <Route
            path="/admin/projects/:projectId/edit"
            element={<AdminProjectEditorPage />}
          />
          <Route
            path="/admin/projects/:projectId/items"
            element={<AdminProjectItemsListPage />}
          />
          <Route
            path="/admin/projects/:projectId/items/new"
            element={<AdminProjectItemCreatePage />}
          />
          <Route
            path="/admin/items/:itemId"
            element={<AdminItemDetailPage />}
          />
          <Route path="/admin/notices" element={<AdminNoticesListPage />} />
          <Route
            path="/admin/notices/new"
            element={<AdminNoticeEditorPage />}
          />
          <Route
            path="/admin/notices/:noticeId"
            element={<AdminNoticeDetailPage />}
          />
          <Route
            path="/admin/notices/:noticeId/edit"
            element={<AdminNoticeEditorPage />}
          />
        </Route>
      </Routes>

      <FloatingSns />
    </>
  );
}

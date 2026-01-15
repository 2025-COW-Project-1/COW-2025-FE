// src/App.tsx
import { Route, Routes } from 'react-router-dom';
import SiteLayout from './components/SiteLayout';
import AdminLayout from './components/AdminLayout';
import MainPage from './pages/site/MainPage';
import ProjectsPage from './pages/site/ProjectsPage';
import ProjectDetailPage from './pages/site/ProjectDetailPage';
import ResourcesPage from './pages/site/ResourcesPage';
import SettlementsPage from './pages/site/SettlementsPage';
import AdminLoginPage from './pages/admin/AdminLoginPage';
import AdminDashboardPage from './pages/admin/AdminDashboardPage';
import AboutPage from './pages/site/AboutPage';
import FormPage from './pages/site/FormPage';
import ContactPage from './pages/site/ContactPage';

export default function App() {
  return (
    <Routes>
      <Route element={<SiteLayout />}>
        <Route path="/" element={<MainPage />} />
        <Route path="/projects" element={<ProjectsPage />} />
        <Route path="/projects/:projectId" element={<ProjectDetailPage />} />
        <Route path="/resources" element={<ResourcesPage />} />
        <Route path="/settlements" element={<SettlementsPage />} />
        <Route path="/admin/login" element={<AdminLoginPage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/forms" element={<FormPage />} />
        <Route path="/contact" element={<ContactPage />} />
      </Route>
      <Route element={<AdminLayout />}>
        <Route path="/admin" element={<AdminDashboardPage />} />
      </Route>
    </Routes>
  );
}


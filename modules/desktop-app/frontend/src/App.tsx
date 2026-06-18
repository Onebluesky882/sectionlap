import { useEffect } from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Layout } from "./components/Layout";
import { SectionListPage } from "./pages/section-list/page";
import { SectionDetailPage } from "./pages/section-detail/page";
import { CheckoutPage } from "./pages/checkout/page";
import { MyEnrollmentsPage } from "./pages/my-enrollments/page";
import { FeedbackPage } from "./pages/feedback/page";
import { LiveClassPage } from "./pages/live-class/page";
import TeacherDashboardPage from "./pages/teacher-dashboard/page";
import { AuthPage } from "./pages/auth/page";
import { ConfirmModal } from "./components/ConfirmModal";
import { useAppStore } from "./store/useAppStore";

function AppInitializer() {
  const initialize = useAppStore((s) => s.initialize);
  useEffect(() => {
    initialize();
  }, [initialize]);
  return null;
}

function App() {
  return (
    <BrowserRouter>
      <AppInitializer />
      <ConfirmModal />
      <Routes>
        <Route path="/auth" element={<AuthPage />} />
        <Route element={<Layout />}>
          <Route index element={<SectionListPage />} />
          <Route path="sections/:sectionId" element={<SectionDetailPage />} />
          <Route path="sections/:sectionId/checkout" element={<CheckoutPage />} />
          <Route path="sections/:sectionId/live-class" element={<LiveClassPage />} />
          <Route path="dashboard" element={<TeacherDashboardPage />} />
          <Route path="my-enrollments" element={<MyEnrollmentsPage />} />
          <Route path="feedback" element={<FeedbackPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;

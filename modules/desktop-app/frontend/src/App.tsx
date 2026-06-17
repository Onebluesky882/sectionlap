import { useEffect } from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Layout } from "./components/Layout";
import { SectionListPage } from "./pages/SectionListPage";
import { SectionDetailPage } from "./pages/SectionDetailPage";
import { CheckoutPage } from "./pages/CheckoutPage";
import { MyEnrollmentsPage } from "./pages/MyEnrollmentsPage";
import { LiveClassPage } from "./pages/LiveClassPage";
import TeacherDashboardPage from "./pages/TeacherDashboardPage";
import { AuthPage } from "./pages/AuthPage";
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
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;

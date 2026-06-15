import { HashRouter, Route, Routes } from "react-router-dom";
import "./App.css";
import { Layout } from "./components/Layout";
import { SectionListPage } from "./pages/SectionListPage";
import { SectionDetailPage } from "./pages/SectionDetailPage";
import { CheckoutPage } from "./pages/CheckoutPage";
import { TeacherDashboardPage } from "./pages/TeacherDashboardPage";
import { LiveClassPage } from "./pages/LiveClassPage";

function App() {
  return (
    <HashRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route index element={<SectionListPage />} />
          <Route path="sections/:sectionId" element={<SectionDetailPage />} />
          <Route path="sections/:sectionId/checkout" element={<CheckoutPage />} />
          <Route path="sections/:sectionId/live-class" element={<LiveClassPage />} />
          <Route path="dashboard" element={<TeacherDashboardPage />} />
        </Route>
      </Routes>
    </HashRouter>
  );
}

export default App;

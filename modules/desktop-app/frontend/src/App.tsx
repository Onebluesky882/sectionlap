import { HashRouter, Route, Routes } from "react-router-dom";
import "./App.css";
import { Layout } from "./components/Layout";
import { SectionListPage } from "./pages/SectionListPage";
import { SectionDetailPage } from "./pages/SectionDetailPage";
import { CheckoutPage } from "./pages/CheckoutPage";
import { TeacherDashboardPage } from "./pages/TeacherDashboardPage";

function App() {
  return (
    <HashRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route index element={<SectionListPage />} />
          <Route path="sections/:sectionId" element={<SectionDetailPage />} />
          <Route path="sections/:sectionId/checkout" element={<CheckoutPage />} />
          <Route path="dashboard" element={<TeacherDashboardPage />} />
        </Route>
      </Routes>
    </HashRouter>
  );
}

export default App;

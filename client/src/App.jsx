import { Navigate, Route, Routes } from "react-router-dom";
import AppLayout from "@/components/layout/AppLayout";
import ProductMenuPage from "@/pages/ProductMenuPage";

const App = () => {
  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route index element={<Navigate to="/product-menu" replace />} />
        <Route path="product-menu" element={<ProductMenuPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
};

export default App;

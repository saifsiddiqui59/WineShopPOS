import { Route, Routes } from "react-router-dom";
import Layout from "./components/Layout";
import Dashboard from "./pages/Dashboard";
import Inventory from "./pages/Inventory";
import POS from "./pages/POS";
import Placeholder from "./pages/Placeholder";
import Products from "./pages/Products";
import Sales from "./pages/Sales";
import Settings from "./pages/Settings";

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<Dashboard />} />

        <Route path="pos" element={<POS />} />

        <Route path="products" element={<Products />} />

        <Route path="inventory" element={<Inventory />} />

        <Route
          path="purchases"
          element={
            <Placeholder
              title="Purchases"
              description="Supplier purchases and receive-stock workflow"
            />
          }
        />

        <Route path="sales" element={<Sales />} />

        <Route
          path="reports"
          element={
            <Placeholder
              title="Reports"
              description="Sales, inventory and performance reporting"
            />
          }
        />

        <Route path="settings" element={<Settings />} />
      </Route>
    </Routes>
  );
}

import { Route, Routes } from "react-router-dom";
import Layout from "./components/Layout";
import AddProduct from "./pages/AddProduct";
import Dashboard from "./pages/Dashboard";
import EditProduct from "./pages/EditProduct";
import Inventory from "./pages/Inventory";
import POS from "./pages/POS";
import Products from "./pages/Products";
import Purchases from "./pages/Purchases";
import Reports from "./pages/Reports";
import SaleDetails from "./pages/SaleDetails";
import Sales from "./pages/Sales";
import Settings from "./pages/Settings";

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<Dashboard />} />
        <Route path="pos" element={<POS />} />

        <Route path="products" element={<Products />} />
        <Route path="products/new" element={<AddProduct />} />
        <Route path="products/:id/edit" element={<EditProduct />} />

        <Route path="inventory" element={<Inventory />} />
        <Route path="purchases" element={<Purchases />} />

        <Route path="sales" element={<Sales />} />
        <Route path="sales/:id" element={<SaleDetails />} />

        <Route path="reports" element={<Reports />} />
        <Route path="settings" element={<Settings />} />
      </Route>
    </Routes>
  );
}

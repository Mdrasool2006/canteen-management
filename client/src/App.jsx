import { Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';
import Landing from './pages/Landing.jsx';
import Login from './pages/Login.jsx';
import Register from './pages/Register.jsx';
import Verify from './pages/Verify.jsx';
import CustomerHome from './pages/customer/CustomerHome.jsx';
import ShopMenu from './pages/customer/ShopMenu.jsx';
import MyOrders from './pages/customer/MyOrders.jsx';
import SellerDashboard from './pages/seller/SellerDashboard.jsx';

export default function App() {
  return (
    <>
      <Navbar />
      <Routes>
        {/* Public */}
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/verify" element={<Verify />} />

        {/* Customer */}
        <Route
          path="/customer"
          element={<ProtectedRoute role="customer"><CustomerHome /></ProtectedRoute>}
        />
        <Route
          path="/customer/shops/:id"
          element={<ProtectedRoute role="customer"><ShopMenu /></ProtectedRoute>}
        />
        <Route
          path="/customer/orders"
          element={<ProtectedRoute role="customer"><MyOrders /></ProtectedRoute>}
        />

        {/* Seller */}
        <Route
          path="/seller"
          element={<ProtectedRoute role="seller"><SellerDashboard /></ProtectedRoute>}
        />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
}

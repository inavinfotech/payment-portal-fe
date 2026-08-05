import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import Layout from "./components/Layout";
import Dashboard from "./pages/Dashboard";
import Apps from "./pages/Apps";
import Payments from "./pages/Payments";
import Settings from "./pages/Settings";
import RazorpayAccounts from "./pages/RazorpayAccounts";
import Login from "./pages/Login";
import ProtectedRoute from "./components/ProtectedRoute";

function App() {
  const basename = import.meta.env.VITE_ROUTER_BASENAME ?? import.meta.env.VITE_BASENAME ?? "/payment";

  return (
    <Router basename={basename}>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route
          path="/*"
          element={
            <ProtectedRoute>
              <Layout>
                <Routes>
                  <Route path="/" element={<Navigate to="/dashboard" />} />
                  <Route path="/dashboard" element={<Dashboard />} />
                  <Route path="/apps" element={<Apps />} />
                  <Route path="/payments" element={<Payments />} />
                  <Route path="/razorpay-accounts" element={<RazorpayAccounts />} />
                  <Route path="/settings" element={<Settings />} />
                </Routes>
              </Layout>
            </ProtectedRoute>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;

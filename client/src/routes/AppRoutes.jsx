import { Routes, Route, Navigate } from 'react-router-dom';

import Home from '../pages/Home.jsx';
import About from '../pages/About.jsx';
import Services from '../pages/Services.jsx';
import Products from '../pages/Products.jsx';
import ProductDetail from '../pages/ProductDetail.jsx';
import Contact from '../pages/Contact.jsx';
import AdminLogin from '../pages/AdminLogin.jsx';
import AdminDashboard from '../pages/AdminDashboard.jsx';
import WorkDetail from '../pages/WorkDetail.jsx';
import PrivacyPolicy from '../pages/PrivacyPolicy.jsx';
import TermsAndConditions from '../pages/TermsAndConditions.jsx';

import useScrollToTop from '../hooks/useScrollToTop.js';

export default function AppRoutes() {
  useScrollToTop();

  return (
    <Routes>
      <Route path="/" element={<Home />} />

      <Route path="/about" element={<About />} />

      <Route
        path="/services"
        element={<Navigate to="/services/music" replace />}
      />
      <Route path="/services/:serviceSlug" element={<Services />} />

      <Route path="/products" element={<Products />} />
      <Route path="/products/:id" element={<ProductDetail />} />

      <Route path="/contact" element={<Contact />} />

      <Route path="/works/:id" element={<WorkDetail />} />

      <Route path="/privacy-policy" element={<PrivacyPolicy />} />
      <Route path="/terms-and-conditions" element={<TermsAndConditions />} />

      <Route path="/admin/login" element={<AdminLogin />} />
      <Route path="/admin/dashboard" element={<AdminDashboard />} />
    </Routes>
  );
}
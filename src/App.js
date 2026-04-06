import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Layout from './components/layout/Layout';
import { ThemeProvider } from './context/ThemeContext';
import Dashboard from './pages/Dashboard';
import Events from './pages/Events';
import Workers from './pages/Workers';
import Expenses from './pages/Expenses';
import Payments from './pages/Payments';
import Equipment from './pages/Equipment';
import Packages from './pages/Packages';
import Leads from './pages/Leads';
import Documents from './pages/Documents';
import Reports from './pages/Reports';
import Settings from './pages/Settings';

function App() {
  return (
    <ThemeProvider>
      <Router>
        <Layout>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/events" element={<Events />} />
            <Route path="/workers" element={<Workers />} />
            <Route path="/expenses" element={<Expenses />} />
            <Route path="/payments" element={<Payments />} />
            <Route path="/equipment" element={<Equipment />} />
            <Route path="/packages" element={<Packages />} />
            <Route path="/leads" element={<Leads />} />
            <Route path="/documents" element={<Documents />} />
            <Route path="/reports" element={<Reports />} />
            <Route path="/settings" element={<Settings />} />
          </Routes>
        </Layout>
        <ToastContainer position="top-right" theme="dark" autoClose={3000} />
      </Router>
    </ThemeProvider>
  );
}

export default App;

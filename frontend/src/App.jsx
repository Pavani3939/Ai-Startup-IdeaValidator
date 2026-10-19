import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';

import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import AnalyzeIdea from './pages/AnalyzeIdea';
import AnalysisResults from './pages/AnalysisResults';
import MyIdeas from './pages/MyIdeas';
import CompetitorAnalysis from './pages/CompetitorAnalysis';
import FinancialFeasibility from './pages/FinancialFeasibility';
import StartupRoadmap from './pages/StartupRoadmap';
import NotFound from './pages/NotFound';

import './App.css';

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public routes */}
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Protected routes */}
          <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/analyze" element={<ProtectedRoute><AnalyzeIdea /></ProtectedRoute>} />
          <Route path="/analysis/:id" element={<ProtectedRoute><AnalysisResults /></ProtectedRoute>} />
          <Route path="/ideas" element={<ProtectedRoute><MyIdeas /></ProtectedRoute>} />

          {/* Competitor Analysis routes */}
          <Route path="/competitors" element={<ProtectedRoute><CompetitorAnalysis /></ProtectedRoute>} />
          <Route path="/ideas/:id/competitors" element={<ProtectedRoute><CompetitorAnalysis /></ProtectedRoute>} />

          {/* Financial Feasibility routes */}
          <Route path="/financial" element={<ProtectedRoute><FinancialFeasibility /></ProtectedRoute>} />
          <Route path="/ideas/:id/financial" element={<ProtectedRoute><FinancialFeasibility /></ProtectedRoute>} />

          {/* Startup Roadmap routes */}
          <Route path="/roadmap" element={<ProtectedRoute><StartupRoadmap /></ProtectedRoute>} />
          <Route path="/ideas/:id/roadmap" element={<ProtectedRoute><StartupRoadmap /></ProtectedRoute>} />

          {/* Catch-all 404 */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

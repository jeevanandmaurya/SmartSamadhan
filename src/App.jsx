import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { DatabaseProvider, AuthProvider } from './contexts';
import { ProtectedRoute, MapTest } from './components/common';
import { Navbar } from './components/layout';
import { Login, Signup, AdminLogin } from './pages/auth';
import { UserDashboard, AdminDashboard } from './pages/dashboard';
import { Homepage, About, ContactUs, Sitemap } from './pages/public';
import { ViewStatus } from './features/complaints/components';
import './styles/App.css';

function App() {
  return (
    <DatabaseProvider>
      <AuthProvider>
        <Router>
          <div className="App">
            <Navbar />
            <main className="main">
              <div className="container">
                <Routes>
                  <Route path="/" element={<Homepage />} />
                  <Route path="/about" element={<About />} />
                  <Route path="/login" element={<Login />} />
                  <Route path="/signup" element={<Signup />} />
                  <Route path="/admin-login" element={<AdminLogin />} />
                  <Route path="/view-status" element={<ViewStatus />} />
                  <Route path="/contact-us" element={<ContactUs />} />
                  <Route path="/sitemap" element={<Sitemap />} />
                  <Route path="/map-test" element={<MapTest />} />
                  <Route path="/user-dashboard" element={<ProtectedRoute requiredRole="user"><UserDashboard /></ProtectedRoute>} />
                  <Route path="/admin-dashboard" element={<ProtectedRoute requiredRole="admin"><AdminDashboard /></ProtectedRoute>} />
                </Routes>
              </div>
            </main>
          </div>
        </Router>
      </AuthProvider>
    </DatabaseProvider>
  );
}

export default App;

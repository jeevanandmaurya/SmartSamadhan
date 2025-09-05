import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { DatabaseProvider } from './DatabaseContext';
import { AuthProvider } from './AuthContext';
import ProtectedRoute from './ProtectedRoute';
import Homepage from './Homepage';
import About from './About';
import Login from './Login';
import Signup from './Signup';
import AdminLogin from './AdminLogin';
import UserDashboard from './UserDashboard';
import AdminDashboard from './AdminDashboard';
import ViewStatus from './ViewStatus';
import ContactUs from './ContactUs';
import Sitemap from './Sitemap';
import MapTest from './MapTest';
import Navbar from './Navbar';
import './App.css';

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

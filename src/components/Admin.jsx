import React, { useState, useEffect } from 'react';
import AdminLogin from './AdminLogin';
import AdminDashboard from './AdminDashboard';

export default function Admin() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Verifica se já existe um token válido ao carregar
  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('adminToken');
      const storedUser = localStorage.getItem('adminUser');

      if (token && storedUser) {
        try {
          // Verifica se o token ainda é válido
          const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/api/auth/verify`, {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });

          if (response.ok) {
            const data = await response.json();
            if (data.valid) {
              setUser(JSON.parse(storedUser));
              setIsAuthenticated(true);
            } else {
              // Token inválido, limpa o localStorage
              localStorage.removeItem('adminToken');
              localStorage.removeItem('adminUser');
            }
          } else {
            // Token inválido, limpa o localStorage
            localStorage.removeItem('adminToken');
            localStorage.removeItem('adminUser');
          }
        } catch (err) {
          console.error('Erro ao verificar autenticação:', err);
          localStorage.removeItem('adminToken');
          localStorage.removeItem('adminUser');
        }
      }

      setLoading(false);
    };

    checkAuth();
  }, []);

  const handleLogin = (data) => {
    setUser(data.user);
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminUser');
    setUser(null);
    setIsAuthenticated(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-white text-center">
          <div className="w-16 h-16 border-4 border-white border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-zinc-500 uppercase tracking-widest text-sm">Carregando...</p>
        </div>
      </div>
    );
  }

  return isAuthenticated ? (
    <AdminDashboard user={user} onLogout={handleLogout} />
  ) : (
    <AdminLogin onLogin={handleLogin} />
  );
}

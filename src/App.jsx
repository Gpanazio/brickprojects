import React from 'react';
import BrickScrollytelling from './components/BrickScrollytelling';
import Admin from './components/Admin';

function App() {
  // Roteamento manual simples baseado na URL
  const path = window.location.pathname;

  // Rota de Admin
  if (path === '/admin' || path === '/admin/') {
    return <Admin />;
  }

  // Rota de Seleções (ex: /s/netflix)
  if (path.startsWith('/s/')) {
    const selectionSlug = path.split('/s/')[1];
    if (selectionSlug) {
      return (
        <div className="App">
          <BrickScrollytelling selectionSlug={selectionSlug} />
        </div>
      );
    }
  }

  // Home Page padrão
  return (
    <div className="App">
      <BrickScrollytelling />
    </div>
  );
}

export default App;

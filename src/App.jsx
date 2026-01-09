import React from 'react';
import BrickScrollytelling from './components/BrickScrollytelling';
import Admin from './components/Admin';

function App() {
  // Roteamento manual simples baseado na URL
  const path = window.location.pathname;

  if (path === '/admin' || path === '/admin/') {
    return <Admin />;
  }

  return (
    <div className="App">
      <BrickScrollytelling />
    </div>
  );
}

export default App;

import React from 'react';
import ReactDOM from 'react-dom/client';
import { StackGame } from './components/game/StackGame';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <StackGame />
  </React.StrictMode>,
);
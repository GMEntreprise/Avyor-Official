import { createRoot } from 'react-dom/client';
import { AdminApp } from './AdminApp';
import '../styles.css';
import './admin.css';

// The admin exists on the local development server only (vite.config.ts).
createRoot(document.getElementById('admin')!).render(<AdminApp />);

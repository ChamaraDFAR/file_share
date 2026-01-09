import { Link, useLocation } from 'react-router-dom';
import './Layout.css';

interface LayoutProps {
  children: React.ReactNode;
}

function Layout({ children }: LayoutProps) {
  const location = useLocation();

  return (
    <div className="layout">
      <header className="header">
        <div className="container">
          <h1 className="logo">File Share</h1>
          <nav className="nav">
            <Link 
              to="/" 
              className={location.pathname === '/' ? 'active' : ''}
            >
              Dashboard
            </Link>
            <Link 
              to="/logs" 
              className={location.pathname === '/logs' ? 'active' : ''}
            >
              Logs
            </Link>
          </nav>
        </div>
      </header>
      <main className="main">
        <div className="container">
          {children}
        </div>
      </main>
    </div>
  );
}

export default Layout;

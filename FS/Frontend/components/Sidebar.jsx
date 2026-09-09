import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

import {
  LayoutDashboard,
  CreditCard,
  Target,
  User,
  LogOut,
  ChevronLeft,
  ChevronRight,
  AlertTriangle,
  Sun,
  Moon,
} from "lucide-react";

import logo from "../asset/logo.png";
import "../style/sidebar.css";

const NAV_ITEMS = [
  { id: "dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { id: "transactions", icon: CreditCard, label: "Transaksi" },
];

const FEATURE_ITEMS = [
  { id: "savings", icon: Target, label: "Dream Savings" },
];

const ACCOUNT_ITEMS = [
  { id: "profile", icon: User, label: "Profil" },
];

export default function Sidebar({ activePage }) {
  const [collapsed, setCollapsed] = useState(false);
  const [page, setPage] = useState(activePage || "dashboard");
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [user, setUser] = useState(() => JSON.parse(localStorage.getItem("userData")));
  const [isDarkMode, setIsDarkMode] = useState(() => {
    return localStorage.getItem("cerminsaku_theme") === "dark";
  });

  const navigate = useNavigate();

  useEffect(() => {
    if (activePage) setPage(activePage);
  }, [activePage]);

  useEffect(() => {
    const handleUserUpdate = () => {
      setUser(JSON.parse(localStorage.getItem("userData")));
    };

    window.addEventListener("userUpdated", handleUserUpdate);
    return () => window.removeEventListener("userUpdated", handleUserUpdate);
  }, []);

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.setAttribute("data-theme", "dark");
      localStorage.setItem("cerminsaku_theme", "dark");
    } else {
      document.documentElement.removeAttribute("data-theme");
      localStorage.setItem("cerminsaku_theme", "light");
    }
  }, [isDarkMode]);

  const routes = {
    dashboard: "/dashboard",
    transactions: "/transactions",
    savings: "/savings",
    profile: "/profile",
  };

  const handleNav = (id) => {
    setPage(id);
    if (routes[id]) navigate(routes[id]);
  };

  const handleConfirmLogout = () => {
    localStorage.removeItem("isLogin");
    localStorage.removeItem("userData");
    setShowLogoutModal(false);
    navigate("/");
  };

  return (
    <>
      <aside className={`sidebar-container ${collapsed ? "is-collapsed" : ""}`}>
        
        <div className="brand-header">
          <div className="brand-wrapper">
            <div className="brand-logo"><img src={logo} alt="Sakuin" /></div>
            {!collapsed && <span className="brand-title">Sakuin</span>}
          </div>
          <button className="collapse-trigger" onClick={() => setCollapsed(!collapsed)}>
            {collapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
          </button>
        </div>

        <nav className="nav-workspace">
          
          <div className="nav-group">
            {!collapsed && <span className="group-label">Utama</span>}
            {NAV_ITEMS.map((item) => (
              <NavigationItem key={item.id} item={item} page={page} collapsed={collapsed} onClick={handleNav} />
            ))}
          </div>

          <div className="nav-group">
            {!collapsed && <span className="group-label">Fitur</span>}
            {FEATURE_ITEMS.map((item) => (
              <NavigationItem key={item.id} item={item} page={page} collapsed={collapsed} onClick={handleNav} />
            ))}
          </div>

          <div className="nav-group">
            {!collapsed && <span className="group-label">Akun</span>}
            {ACCOUNT_ITEMS.map((item) => (
              <NavigationItem key={item.id} item={item} page={page} collapsed={collapsed} onClick={handleNav} />
            ))}
          </div>

          <div className="nav-group" style={{ marginTop: "auto" }}>
            <button className="nav-link" onClick={() => setIsDarkMode(!isDarkMode)}>
              <div className="icon-holder">
                {isDarkMode ? <Sun size={18} strokeWidth={2} /> : <Moon size={18} strokeWidth={2} />}
              </div>
              {!collapsed && <span className="link-text">{isDarkMode ? "Mode Terang" : "Mode Gelap"}</span>}
            </button>
          </div>

        </nav>

        <div className="account-footer">
          <div className="account-card">
            
            <div className="user-avatar" style={{ overflow: 'hidden', padding: 0 }}>
              {user?.avatar ? (
                <img src={user.avatar} alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                user?.name?.charAt(0)?.toUpperCase() || "U"
              )}
            </div>

            {!collapsed && (
              <div className="account-meta">
                <span className="account-name">{user?.name || "Pengguna"}</span>
                <span className="account-role">{user?.phone && user.phone !== "-" ? user.phone : user?.email || "email@domain.com"}</span>
              </div>
            )}

            <button className="action-logout" title="Log Out" onClick={() => setShowLogoutModal(true)}>
              <LogOut size={15} />
            </button>
          </div>
        </div>

      </aside>

      {/* MODAL LOGOUT */}
      {showLogoutModal && (
        <div className="sidebar-popup-backdrop-blur">
          <div className="sidebar-popup-modal-body">
            <div className="popup-icon-warning-wrapper"><AlertTriangle size={24} /></div>
            <div className="popup-text-content">
              <h3>Konfirmasi Keluar Akun</h3>
              <p>Apakah Anda yakin ingin keluar dari sesi CerminSaku?</p>
            </div>
            <div className="popup-action-btn-row">
              <button className="popup-btn-dismiss" onClick={() => setShowLogoutModal(false)}>Batal</button>
              <button className="popup-btn-execute" onClick={handleConfirmLogout}>Keluar Akun</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function NavigationItem({ item, page, collapsed, onClick }) {
  const Icon = item.icon;
  const isActive = page === item.id;
  return (
    <button className={`nav-link ${isActive ? "is-active" : ""}`} onClick={() => onClick(item.id)}>
      <div className="icon-holder"><Icon size={18} strokeWidth={isActive ? 2.2 : 1.8} /></div>
      {!collapsed && <span className="link-text">{item.label}</span>}
    </button>
  );
}
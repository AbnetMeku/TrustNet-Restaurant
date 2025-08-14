import React, { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { FaTable, FaUserPlus, FaUtensils, FaBars, FaTimes } from "react-icons/fa";
import "../styles/AdminDashboard.css";
import UsersList from "../components/admin/UsersList"; // <-- import the new component

export default function AdminDashboard() {
  const { user, logout } = useAuth();
  const [active, setActive] = useState("addUser");
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 900);
  const [sidebarOpen, setSidebarOpen] = useState(!isMobile);

  useEffect(() => {
    const onResize = () => {
      const mobile = window.innerWidth <= 900;
      setIsMobile(mobile);
      setSidebarOpen(!mobile);
    };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  const toggleSidebar = () => setSidebarOpen((prev) => !prev);

  const handleSelect = (id) => {
    setActive(id);
    if (isMobile) setSidebarOpen(false);
  };

  return (
    <div className="admin-dashboard">
      {/* Sidebar */}
      <aside
        className={
          "sidebar " +
          (isMobile ? (sidebarOpen ? "open" : "") : sidebarOpen ? "" : "collapsed")
        }
      >
        <div className="logo">
          <img src="/logo.png" alt="Logo" />
          {!(!isMobile && !sidebarOpen) && <h2>Admin Panel</h2>}
        </div>
        <nav>
          <ul>
            <li
              className={active === "addUser" ? "active" : ""}
              onClick={() => handleSelect("addUser")}
            >
              <FaUserPlus />
              {!(!isMobile && !sidebarOpen) && <span>Users</span>}
            </li>
            <li
              className={active === "addTable" ? "active" : ""}
              onClick={() => handleSelect("addTable")}
            >
              <FaTable />
              {!(!isMobile && !sidebarOpen) && <span>Tables</span>}
            </li>
            <li
              className={active === "addMenu" ? "active" : ""}
              onClick={() => handleSelect("addMenu")}
            >
              <FaUtensils />
              {!(!isMobile && !sidebarOpen) && <span>Menu</span>}
            </li>
          </ul>
        </nav>
      </aside>

      {isMobile && sidebarOpen && <div className="overlay" onClick={() => setSidebarOpen(false)} />}

      {/* Main */}
      <div className="main-content">
        <header className="topbar">
          <div className="left">
            <button className="icon-btn" onClick={toggleSidebar} aria-label="Toggle menu">
              {isMobile && sidebarOpen ? <FaTimes /> : <FaBars />}
            </button>
            <span className="welcome">
              Welcome, <strong>{user?.username || "Admin"}</strong>
            </span>
          </div>
          <button onClick={logout} className="logout-btn">Logout</button>
        </header>

        <div className="content-area">
          {active === "addUser" && <UsersList />} {/* <-- render UsersList here */}

          {active === "addTable" && (
            <section className="card">
              <h2>Tables</h2>
              <p className="muted">All Tables</p>
              <div className="placeholder">List Table</div>
            </section>
          )}

          {active === "addMenu" && (
            <section className="card">
              <h2>Menu Items</h2>
              <p className="muted">Menu item (name, price, category, availability).</p>
              <div className="placeholder">List Menu Form goes here</div>
            </section>
          )}
        </div>
      </div>
    </div>
  );
}

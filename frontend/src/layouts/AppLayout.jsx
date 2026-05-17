import { Bell, ClipboardCheck, FileSpreadsheet, Gauge, LogOut, Menu, Target, Users } from "lucide-react";
import { useState } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext.jsx";

const rolePath = { employee: "/employee", manager: "/manager", admin: "/admin" };

export default function AppLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const nav = [
    { to: rolePath[user.role], label: "Dashboard", icon: Gauge },
    { to: "/goals", label: "Goals", icon: Target },
    { to: "/check-ins", label: "Check-ins", icon: ClipboardCheck },
    { to: "/reports", label: "Reports", icon: FileSpreadsheet },
    { to: "/notifications", label: "Notifications", icon: Bell }
  ];
  if (user.role !== "employee") nav.splice(2, 0, { to: "/admin", label: user.role === "admin" ? "Admin" : "Team", icon: Users });

  function signOut() {
    logout();
    navigate("/login");
  }

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,#dbeafe,transparent_36%),linear-gradient(180deg,#f8fbff,#eef3f8)]">
      <aside className={`fixed inset-y-0 left-0 z-40 w-72 border-r border-line bg-white/90 p-5 backdrop-blur transition lg:translate-x-0 ${open ? "translate-x-0" : "-translate-x-full"}`}>
        <div className="flex items-center gap-3">
          <div className="grid h-11 w-11 place-items-center rounded-lg bg-brand text-lg font-black text-white">AX</div>
          <div>
            <p className="text-xl font-black text-ink">AlignX</p>
            <p className="text-xs text-graphite">Drive Performance</p>
          </div>
        </div>
        <nav className="mt-8 space-y-2">
          {nav.map((item) => (
            <NavLink key={item.to} to={item.to} onClick={() => setOpen(false)} className={({ isActive }) => `flex items-center gap-3 rounded-md px-3 py-3 text-sm font-semibold transition ${isActive ? "bg-blue-50 text-brand" : "text-graphite hover:bg-mist hover:text-ink"}`}>
              <item.icon size={18} />
              {item.label}
            </NavLink>
          ))}
        </nav>
        <div className="absolute bottom-5 left-5 right-5 rounded-lg bg-mist p-4">
          <p className="font-bold text-ink">{user.name}</p>
          <p className="text-sm capitalize text-graphite">{user.role} · {user.department}</p>
          <button onClick={signOut} className="mt-4 flex items-center gap-2 text-sm font-bold text-red-600"><LogOut size={16} />Logout</button>
        </div>
      </aside>
      <main className="lg:pl-72">
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-line bg-white/75 px-4 backdrop-blur lg:px-8">
          <button className="rounded-md p-2 hover:bg-mist lg:hidden" onClick={() => setOpen(true)} aria-label="Open navigation"><Menu size={22} /></button>
          <div>
            <p className="text-sm font-bold uppercase tracking-wide text-brand">Align Goals. Track Progress. Drive Performance.</p>
          </div>
          <div className="rounded-full border border-line bg-white px-3 py-1 text-sm font-semibold capitalize text-graphite">{user.role}</div>
        </header>
        <div className="p-4 lg:p-8"><Outlet /></div>
      </main>
    </div>
  );
}

import { ArrowRight, BarChart3, Eye, EyeOff, ShieldCheck, Sparkles } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Button from "../components/Button.jsx";
import { useAuth } from "../contexts/AuthContext.jsx";

const accounts = [
  ["Employee", "employee@alignx.com"],
  ["Manager", "manager@alignx.com"],
  ["Admin / HR", "admin@alignx.com"]
];

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("employee@alignx.com");
  const [password, setPassword] = useState("AlignX@123");
  const [showPassword, setShowPassword] = useState(true);
  const [error, setError] = useState("");

  async function submit(e) {
    e.preventDefault();
    setError("");
    try {
      const user = await login(email.trim(), password);
      navigate(user.role === "admin" ? "/admin" : user.role === "manager" ? "/manager" : "/employee");
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <div className="min-h-screen bg-[linear-gradient(135deg,#f8fbff,#eaf2fb_45%,#f5f9fc)] p-4">
      <div className="mx-auto grid min-h-[calc(100vh-2rem)] max-w-6xl items-center gap-8 lg:grid-cols-[1.1fr_.9fr]">
        <section>
          <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-line bg-white px-4 py-2 text-sm font-bold text-brand shadow-sm"><Sparkles size={16} /> Enterprise KPI Portal</div>
          <h1 className="max-w-3xl text-5xl font-black leading-tight text-ink md:text-7xl">AlignX</h1>
          <p className="mt-4 max-w-2xl text-2xl font-semibold text-graphite">Align Goals. Track Progress. Drive Performance.</p>
          <div className="mt-10 grid gap-4 sm:grid-cols-3">
            {[
              ["Role governance", ShieldCheck],
              ["Live analytics", BarChart3],
              ["Approval workflows", ArrowRight]
            ].map(([label, Icon]) => (
              <div key={label} className="rounded-lg border border-line bg-white/75 p-4 shadow-sm">
                <Icon className="text-brand" size={22} />
                <p className="mt-3 font-bold text-ink">{label}</p>
              </div>
            ))}
          </div>
        </section>
        <form onSubmit={submit} className="glass rounded-lg p-6">
          <h2 className="text-2xl font-black text-ink">Sign in</h2>
          <p className="mt-1 text-sm text-graphite">Demo password: <b className="text-ink">AlignX@123</b></p>
          <div className="mt-6 grid gap-2">
            {accounts.map(([role, value]) => (
              <button key={value} type="button" onClick={() => setEmail(value)} className={`rounded-md border px-4 py-3 text-left text-sm font-bold transition ${email === value ? "border-brand bg-blue-50 text-brand" : "border-line bg-white text-graphite hover:bg-mist"}`}>
                {role}<span className="block text-xs font-medium">{value}</span>
              </button>
            ))}
          </div>
          <label className="mt-6 block text-sm font-bold text-ink">Email</label>
          <input className="mt-2 w-full rounded-md border border-line px-4 py-3 outline-none focus:border-brand" value={email} onChange={(e) => setEmail(e.target.value)} />
          <label className="mt-4 block text-sm font-bold text-ink">Password</label>
          <div className="mt-2 flex rounded-md border border-line bg-white focus-within:border-brand">
            <input
              className="min-w-0 flex-1 rounded-l-md px-4 py-3 outline-none"
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <button
              type="button"
              className="grid w-12 place-items-center rounded-r-md text-graphite transition hover:bg-mist hover:text-ink"
              onClick={() => setShowPassword((visible) => !visible)}
              aria-label={showPassword ? "Hide password" : "Show password"}
              title={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
          {error && <div className="mt-4 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">{error}</div>}
          <Button className="mt-6 w-full" type="submit">Enter AlignX <ArrowRight size={16} /></Button>
        </form>
      </div>
    </div>
  );
}

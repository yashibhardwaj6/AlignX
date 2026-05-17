export default function Button({ children, variant = "primary", className = "", ...props }) {
  const styles = {
    primary: "bg-brand text-white hover:bg-blue-700",
    subtle: "bg-white text-ink border border-line hover:bg-mist",
    danger: "bg-red-600 text-white hover:bg-red-700",
    success: "bg-green-600 text-white hover:bg-green-700"
  };
  return (
    <button className={`inline-flex items-center justify-center gap-2 rounded-md px-4 py-2 text-sm font-semibold shadow-sm transition disabled:cursor-not-allowed disabled:opacity-50 ${styles[variant]} ${className}`} {...props}>
      {children}
    </button>
  );
}

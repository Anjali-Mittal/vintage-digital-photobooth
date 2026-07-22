import { Outlet } from "react-router";

export default function Layout() {
  return (
    <div className="relative min-h-screen bg-background text-foreground overflow-x-hidden">
      {/* Film grain — very subtle */}
      <div
        className="pointer-events-none fixed inset-0 z-50 opacity-[0.04] mix-blend-overlay"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
          backgroundRepeat: "repeat",
          backgroundSize: "128px 128px",
        }}
      />
      {/* Warm vignette */}
      <div
        className="pointer-events-none fixed inset-0 z-40"
        style={{
          background: "radial-gradient(ellipse at center, transparent 55%, rgba(10,8,6,0.38) 100%)",
        }}
      />
      <div className="relative z-10">
        <Outlet />
      </div>
    </div>
  );
}

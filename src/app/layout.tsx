import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";

export const metadata: Metadata = {
  title: "GrowthReady Algebra",
  description: "Turn MyOpenMath data into Algebra 1 growth insights.",
};

const navItems = [
  ["/", "Home"],
  ["/upload", "Upload"],
  ["/teks-mapping", "Mapping"],
  ["/classes", "Classes"],
  ["/working-teks-list", "TEKS"],
  ["/staar-blueprint", "Blueprint"],
  ["/teks-library", "Library"],
  ["/breakouts", "Breakouts"],
  ["/groups", "Groups"],
  ["/students", "Students"],
  ["/grade-structure", "Grades"],
  ["/settings", "Settings"],
];

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>
        <div className="min-h-screen">
          <header className="sticky top-0 z-20 border-b border-[#e4dccb] bg-[#fbf8ef]/90 backdrop-blur">
            <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-4 md:flex-row md:items-center md:justify-between">
              <Link href="/" className="display-font text-2xl font-black tracking-tight text-[#174a36]">
                GrowthReady Algebra
              </Link>
              <nav className="flex flex-wrap gap-2 text-sm font-semibold text-[#405247]">
                {navItems.map(([href, label]) => (
                  <Link key={href} href={href} className="rounded-full border border-[#d6cdbb] bg-white/55 px-3 py-1.5 transition hover:bg-[#dbe8d2]">
                    {label}
                  </Link>
                ))}
              </nav>
            </div>
          </header>
          <main className="mx-auto max-w-7xl px-4 py-8">{children}</main>
        </div>
      </body>
    </html>
  );
}

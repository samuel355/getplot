import PublicHeader from "@/app/_components/nav/PublicHeader";
import Footer from "@/app/_components/Footer";

export default function PublicLayout({ children }) {
  return (
    <div className="flex flex-col min-h-screen">
      <PublicHeader />
      <main className="flex-1 pt-16">{children}</main>
      <Footer />
    </div>
  );
}

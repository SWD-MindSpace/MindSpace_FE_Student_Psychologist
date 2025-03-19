import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function PaymentSuccessLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col min-h-screen">
      <main className="flex-grow">{children}</main>
    </div>
  );
}

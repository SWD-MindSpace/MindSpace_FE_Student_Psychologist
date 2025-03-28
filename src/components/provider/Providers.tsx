"use client";

import { HeroUIProvider } from "@heroui/react";
import React, { ReactNode } from "react";
import Navbar from "../Navbar";
import Footer from "../Footer";
import { usePathname } from "next/navigation";
import { AuthProvider } from "@/context/AuthContext";
import ProgressBar from "../ProgressBar";
import NextTopLoader from "nextjs-toploader";
import NavBarForPsychologist from "../NavBarForPsychologist";
import FooterForPsychologist from "../FooterForPsychologist";

export default function Providers({ children }: { children: ReactNode }) {
  const idToken = localStorage.getItem("idToken");
  const decodedToken = idToken
    ? JSON.parse(atob(idToken.split(".")[1]))
    : "Student";
  const userRole = decodedToken?.role;
  const pathname = usePathname();
  const hideLayout = ["/login", "/register"].some((route) =>
    pathname.startsWith(route)
  );

  return (
    <HeroUIProvider>
      <AuthProvider>
        <div className="flex flex-col min-h-screen">
          <NextTopLoader
            speed={200}
            height={8}
            easing="ease"
            color="black"
            showSpinner={false}
          />

          <ProgressBar />

          {!hideLayout &&
            (userRole === "Psychologist" ? (
              <NavBarForPsychologist />
            ) : (
              <Navbar />
            ))}

          <main className="flex-grow">{children}</main>

          {!hideLayout && userRole === "Psychologist" ? (
            <FooterForPsychologist />
          ) : (
            <Footer />
          )}
        </div>
      </AuthProvider>
    </HeroUIProvider>
  );
}

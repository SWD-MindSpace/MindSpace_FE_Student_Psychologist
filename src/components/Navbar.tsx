"use client";

import {
  Button,
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownTrigger,
  Navbar,
  NavbarBrand,
  NavbarContent,
  NavbarItem,
} from "@heroui/react";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { FiChevronDown, FiMenu, FiX, FiUser, FiVideo } from "react-icons/fi";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { motion } from "framer-motion";
import { FaSquarespace } from "react-icons/fa";

export default function TopNav() {
  const router = useRouter();
  const { user, logout } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [userRole, setUserRole] = useState<string | null>(null);

  useEffect(() => {
    setUserRole(localStorage.getItem("userRole"));
  }, []);

  return (
    <Navbar
      shouldHideOnScroll
      maxWidth="2xl"
      className="bg-sixth-color h-24 px-4 shadow-md md:px-4 font-noto-sans"
    >
      <NavbarBrand className="gap-2">
        <motion.div
          whileHover={{
            y: [-4, 4, -4, 0],
            transition: {
              duration: 1,
              repeat: Infinity,
              repeatType: "reverse",
            },
          }}
        >
          <Link
            href="/"
            className="text-2xl font-bold font-bevnpro flex items-center gap-2"
          >
            <FaSquarespace size={24} /> MindSpace
          </Link>
        </motion.div>
      </NavbarBrand>

      {/* Mobile Menu Toggle */}
      <div className="md:hidden">
        <Button variant="light" onPress={() => setIsMenuOpen(!isMenuOpen)}>
          {isMenuOpen ? <FiX size={24} /> : <FiMenu size={24} />}
        </Button>
      </div>

      {/* Desktop Menu */}
      <NavbarContent className="hidden md:flex gap-10">
        {user && (
          <Dropdown>
            <DropdownTrigger>
              <Button variant="light">Cuộc hẹn</Button>
            </DropdownTrigger>
            <DropdownMenu>
              <DropdownItem key="book-appointment">
                <Link href="/psychologists">Đặt cuộc hẹn</Link>
              </DropdownItem>
              <DropdownItem key="appointment-history">
                <Link href="/appointment-history">Lịch sử cuộc hẹn</Link>
              </DropdownItem>
            </DropdownMenu>
          </Dropdown>
        )}
        <NavbarItem>
          <Link
            href="/supporting-programs"
            className="hover:text-secondary-blue transition-all"
          >
            Chương trình hỗ trợ
          </Link>
        </NavbarItem>
        {user && (
          <NavbarItem>
            <Link
              href="/alltests"
              className="hover:text-secondary-blue transition-all"
            >
              Bài kiểm tra
            </Link>
          </NavbarItem>
        )}
        <NavbarItem>
          <Link
            href="/resources"
            className="hover:text-secondary-blue transition-all"
          >
            Tài nguyên
          </Link>
        </NavbarItem>
        {user && (
          <NavbarItem>
            <Link
              href="/psychologists"
              className="hover:text-secondary-blue transition-all"
            >
              Chuyên gia tâm lí
            </Link>
          </NavbarItem>
        )}
        <NavbarItem>
          <Link
            href="/about-us"
            className="hover:text-secondary-blue transition-all"
          >
            Về chúng tôi
          </Link>
        </NavbarItem>
        {user && (
          <NavbarItem>
            <Link
              href="/video-chat"
              className="flex items-center gap-2 hover:text-secondary-blue transition-all"
            >
              <FiVideo size={40} />
              Video Chat
            </Link>
          </NavbarItem>
        )}
      </NavbarContent>

      {/* User Actions (Desktop) */}
      <NavbarContent
        justify="end"
        className="hidden md:flex font-bold pl-20 items-center gap-4"
      >
        {user ? (
          <Dropdown>
            <DropdownTrigger>
              <Button variant="light" className="flex items-center gap-2">
                <FiUser size={18} /> Tài khoản <FiChevronDown size={16} />
              </Button>
            </DropdownTrigger>
            <DropdownMenu>
              <DropdownItem key="profile">
                <Link href="/profile">Hồ sơ</Link>
              </DropdownItem>
              {userRole !== "Parent" ? (
                <DropdownItem key="history-program">
                  <Link href="/supporting-programs/programs-history">
                    Lịch sử đăng kí
                  </Link>
                </DropdownItem>
              ) : null}
              <DropdownItem
                key="logout"
                onPress={logout}
                className="text-red-500"
              >
                Đăng xuất
              </DropdownItem>
            </DropdownMenu>
          </Dropdown>
        ) : (
          <div className="flex gap-3 w-1/2">
            <Button
              onPress={() => router.push("/login")}
              className="bg-black text-white px-4 py-2 rounded-lg hover:scale-105 transition-all shadow-md"
            >
              Đăng nhập
            </Button>
            <Button
              onPress={() => router.push("/register")}
              className="bg-white px-4 py-2 rounded-lg hover:scale-105 transition-all shadow-md"
            >
              Đăng ký
            </Button>
          </div>
        )}
      </NavbarContent>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="absolute top-24 left-0 w-full bg-white shadow-md z-50 flex flex-col p-4 md:hidden">
          <Link href="/supporting-programs" className="py-2 text-center">
            Chương trình hỗ trợ
          </Link>
          {user && (
            <Link href="/alltests" className="py-2 text-center">
              Bài kiểm tra
            </Link>
          )}
          <Link href="/resources" className="py-2 text-center">
            Tài nguyên
          </Link>
          <Link href="/psychologists" className="py-2 text-center">
            Chuyên gia tâm lí
          </Link>
          <Link href="/about-us" className="py-2 text-center">
            Về chúng tôi
          </Link>
          {user && (
            <Link
              href="/video-chat"
              className="py-2 text-center flex items-center justify-center gap-2"
            >
              <FiVideo size={40} />
              Video Chat
            </Link>
          )}

          {user ? (
            <Dropdown>
              <DropdownTrigger>
                <Button
                  variant="light"
                  className="flex items-center gap-2 self-center"
                >
                  <FiUser size={18} /> Tài khoản <FiChevronDown size={16} />
                </Button>
              </DropdownTrigger>
              <DropdownMenu>
                <DropdownItem key="profile">
                  <Link href="/profile">Hồ sơ</Link>
                </DropdownItem>
                {userRole !== "Parent" ? (
                  <DropdownItem key="history-program">
                    <Link href="/supporting-programs/programs-history">
                      Lịch sử đăng kí
                    </Link>
                  </DropdownItem>
                ) : null}
                <DropdownItem
                  key="logout"
                  onPress={logout}
                  className="text-red-500"
                >
                  Đăng xuất
                </DropdownItem>
              </DropdownMenu>
            </Dropdown>
          ) : (
            <div className="flex flex-col gap-3 mt-4">
              <Button
                onPress={() => router.push("/login")}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-all shadow-md"
              >
                Đăng nhập
              </Button>
              <Button
                onPress={() => router.push("/register")}
                className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-all shadow-md"
              >
                Đăng ký
              </Button>
            </div>
          )}
        </div>
      )}
    </Navbar>
  );
}

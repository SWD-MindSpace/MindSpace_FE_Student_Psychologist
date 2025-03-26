import React from "react";
import { FiUser } from "react-icons/fi";

export default function AdminHeader() {
    return (
        <header className="fixed top-0 left-64 right-0 bg-white shadow-md py-4 px-6 flex justify-end">
            <div className="flex items-start">
                <FiUser className="w-6 h-6 text-primary-blue" />
                <span className="ml-2 font-bevnpro text-lg text-primary-blue">Name</span>
            </div>
        </header>
    );
}

"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import NavBar from "../components/ui/NavBar";
import ThirdNavBar from "../components/ui/ThirdNavBar";
import ThirdNavItem from "../components/ui/ThirdNavItem";

export default function AdminLayout({ children }) {
    const pathname = usePathname();
    const router = useRouter();
    const [loading, setLoading] = useState(false);

    const menuItems = [
        // { name: "Dashboard", path: "/admin", icon: "📊" }, // Vamos deixar apenas os CRUDs por enquanto
        { name: "Usuários", path: "/admin/usuarios" },
        { name: "Produtos", path: "/admin/produtos" },
        { name: "Setores", path: "/admin/setores" },
    ];

    const handleLogout = async () => {
        setLoading(true);
        await fetch("/api/auth/logout", { method: "POST" });
        router.push("/login");
    };

    return (
        <div className="bg-gray-100 h-screen overflow-hidden flex flex-col">
            <NavBar />
            <div className="flex flex-col flex-1 overflow-hidden mt-[100px]">
                {/* Main Content */}
                <main className="flex-1 overflow-hidden">
                    {children}
                </main>
            </div>
        </div>

    );
}

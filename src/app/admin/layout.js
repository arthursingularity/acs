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
        <div>
            <NavBar />
            <div className="flex h-screen bg-gray-100 mt-[100px]">
                <ThirdNavBar>
                    <ThirdNavItem label="Produtos" link="/admin/produtos" />
                    <ThirdNavItem label="Setores" link="/admin/setores" />
                    <ThirdNavItem label="Usuários" link="/admin/usuarios" />
                </ThirdNavBar>

                {/* Main Content */}
                <main className="flex-1 overflow-auto mt-5">
                    <div className="p-8 max-w-6xl mx-auto">
                        {children}
                    </div>
                </main>
            </div>
        </div>

    );
}

"use client";

import { createContext, useContext, useState, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";

const TabsContext = createContext();

export function TabsProvider({ children }) {
    const [tabs, setTabs] = useState([]);
    const pathname = usePathname();
    const router = useRouter();

    const getTitle = (path) => {
        if (path.includes("/buscarendereco")) return "Buscar Endereço";
        if (path.includes("/admin/produtos")) return "Admin - Produtos";
        if (path.includes("/admin/setores")) return "Admin - Setores";
        if (path.includes("/admin/usuarios")) return "Admin - Usuários";
        // Se for login ou home, talvez não queiramos adicionar, ou tratamos diferente
        // Mas se o usuário pediu tabs para páginas abertas:
        return "Controle de Endereçamento";
    };

    useEffect(() => {
        if (!pathname || pathname === "/login" || pathname === "/") return;

        setTabs((prev) => {
            // Se já existe a aba, não faz nada
            if (prev.some((t) => t.path === pathname)) return prev;

            // Se não existe, adiciona
            const title = getTitle(pathname);
            return [...prev, { path: pathname, title }];
        });
    }, [pathname]);

    const closeTab = (pathToRemove) => {
        // Calculate navigation target before updating state
        const currentTabs = tabs;
        const newTabs = currentTabs.filter((t) => t.path !== pathToRemove);
        let navigateTo = null;

        // If we're closing the active tab, determine where to navigate
        if (pathname === pathToRemove) {
            if (newTabs.length > 0) {
                navigateTo = newTabs[newTabs.length - 1].path;
            } else {
                navigateTo = "/";
            }
        }

        // Update tabs state
        setTabs(newTabs);

        // Navigate after state update (using setTimeout to avoid render conflict)
        if (navigateTo) {
            setTimeout(() => {
                router.push(navigateTo);
            }, 0);
        }
    };

    return (
        <TabsContext.Provider value={{ tabs, closeTab }}>
            {children}
        </TabsContext.Provider>
    );
}

export function useTabs() {
    return useContext(TabsContext);
}

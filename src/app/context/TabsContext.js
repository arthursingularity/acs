"use client";

import { createContext, useContext, useState, useEffect, useCallback } from "react";
import { usePathname, useRouter } from "next/navigation";

const TabsContext = createContext();

export function TabsProvider({ children }) {
    const [tabs, setTabs] = useState([]);
    const pathname = usePathname();
    const router = useRouter();

    // Atualiza o título de uma tab existente
    const updateTabTitle = useCallback((path, title) => {
        setTabs((prev) =>
            prev.map((t) =>
                t.path === path ? { ...t, title } : t
            )
        );
    }, []);

    // Quando muda de página, adiciona a tab se não existir
    useEffect(() => {
        if (!pathname || pathname === "/login" || pathname === "/") return;

        setTabs((prev) => {
            if (prev.some((t) => t.path === pathname)) return prev;
            // Título temporário até a página setar o document.title
            return [...prev, { path: pathname, title: "Carregando..." }];
        });
    }, [pathname]);

    // Observar mudanças no document.title para atualizar a tab ativa
    useEffect(() => {
        if (!pathname || pathname === "/login" || pathname === "/") return;

        // Atualizar quando o document.title muda
        const updateFromDocTitle = () => {
            const title = document.title;
            if (title && title !== "Carregando...") {
                updateTabTitle(pathname, title);
            }
        };

        // Tentar pegar o título imediatamente (caso já esteja setado)
        const timeout = setTimeout(updateFromDocTitle, 100);

        // Observar mudanças no <title> via MutationObserver
        const titleElement = document.querySelector("title");
        let observer;
        if (titleElement) {
            observer = new MutationObserver(updateFromDocTitle);
            observer.observe(titleElement, { childList: true, characterData: true, subtree: true });
        }

        return () => {
            clearTimeout(timeout);
            observer?.disconnect();
        };
    }, [pathname, updateTabTitle]);

    const closeTab = (pathToRemove) => {
        const currentTabs = tabs;
        const newTabs = currentTabs.filter((t) => t.path !== pathToRemove);
        let navigateTo = null;

        if (pathname === pathToRemove) {
            if (newTabs.length > 0) {
                navigateTo = newTabs[newTabs.length - 1].path;
            } else {
                navigateTo = "/";
            }
        }

        setTabs(newTabs);

        if (navigateTo) {
            setTimeout(() => {
                router.push(navigateTo);
            }, 0);
        }
    };

    return (
        <TabsContext.Provider value={{ tabs, closeTab, updateTabTitle }}>
            {children}
        </TabsContext.Provider>
    );
}

export function useTabs() {
    return useContext(TabsContext);
}

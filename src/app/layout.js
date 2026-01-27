import "./globals.css";
import { TabsProvider } from "./context/TabsContext";

export const metadata = {
  title: "Sistema de Controle de Endereçamento",
  description: "Sistema de controle de endereçamento de almoxarifado",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Endereçamento",
  },
  icons: {
    icon: "/imagens/icon.jpg",
    shortcut: "/imagens/icon.jpg",
    apple: [
      { url: "/imagens/icon.jpg", sizes: "180x180", type: "image/jpeg" },
    ],
  },
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#00659A",
};

export default function RootLayout({ children }) {
  return (
    <html lang="pt-BR">
      <head>
        <link rel="apple-touch-icon" href="/imagens/icon.jpg" />
        <link rel="apple-touch-icon" sizes="180x180" href="/imagens/icon.jpg" />
        <link rel="apple-touch-icon" sizes="152x152" href="/imagens/icon.jpg" />
        <link rel="apple-touch-icon" sizes="120x120" href="/imagens/icon.jpg" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="Endereçamento" />
      </head>
      <body className="">
        <TabsProvider>
          {children}
        </TabsProvider>
      </body>
    </html>
  );
}

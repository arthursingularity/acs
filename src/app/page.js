"use client";

import { useState } from "react";
import NavBar from "./components/ui/NavBar";
import SelectSetorModal from "./components/system/SelectSetorModal";
import Link from "next/link";

export default function Home() {
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <div className="bg-gray-100 h-screen overflow-hidden flex flex-col">
      {/* Use NavBar without specific sector props to trigger 'Home' view */}
      <NavBar almos="" setor="" centroCusto="" />

      {/* Main Layout Container - Adjust top margin for NavBar (approx 100px) */}
      <div className="flex flex-1 mt-[102px] h-[calc(100vh-102px)]">
        <div>
          {/* Sidebar */}
          <div className="w-[240px] bg-[#EEEEEE] border-r border-gray-300 flex flex-col">
            {/* Logo Area */}
            <div className="border-[3px] border-black p-8 inline-block">
              <div className="flex flex-col items-center space-y-3">
                <img src="/imagens/logo.png" alt="TOTVS" className="w-[100px]" />
                <h1 className="text-red-600 font-bold text-4xl tracking-tighter" style={{ fontFamily: 'Arial, sans-serif' }}>
                  ICS
                </h1>
              </div>
            </div>
            {/* Module Header */}
            <div className="bg-[#E3E3E3] p-1 border-b border-white">
              <h2 className="text-[#0079B8] font-bold text-[15px] px-2 py-1 cursor-pointer hover:underline">
                Estoque/Custos
              </h2>
              <div
                className="flex items-center text-gray-600 text-[12px] px-2 py-1 cursor-pointer hover:bg-gray-200"
              >
                <span className="mr-1">≡</span>
                <span>Trocar módulo</span>
              </div>
            </div>

            {/* Search */}
            <div className="p-2 border-b border-gray-300">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Pesquisar"
                  className="w-full border border-gray-400 rounded pl-2 pr-7 py-0.5 text-sm focus:outline-none focus:border-blue-500"
                />
                <div className="absolute right-1 top-1 text-gray-500">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
              </div>
            </div>

            {/* Menu Links */}
            <div className="flex-1 overflow-y-auto py-2">
              <div onClick={() => setModalOpen(true)}>
                <MenuLink text="Controle de Endereçamento" />
              </div>
              <Link href={"/buscarendereco"}>
                <MenuLink text="Buscar Endereço" />
              </Link>
            </div>
          </div>
        </div>

        {/* Main Workspace */}
        <div className="flex-1 bg-white p-6 justify-center flex items-start pt-[50px]">
        </div>
      </div>

      <SelectSetorModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
      />
    </div>
  );
}

function MenuLink({ text, link }) {
  return (
    <div className={`px-4 py-1.5 text-[13px] hover:underline cursor-pointer ${link ? 'text-[#005a9c] decoration-[#005a9c]' : 'text-[#0079B8] decoration-[#0079B8]'}`}>
      {text}
    </div>
  );
}

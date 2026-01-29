"use client";

import { useState, useEffect } from "react";
import NavBar from "./components/ui/NavBar";
import SelectSetorModal from "./components/system/SelectSetorModal";
import Link from "next/link";

export default function Home() {
  const [modalOpen, setModalOpen] = useState(false);
  const [hoveredSetor, setHoveredSetor] = useState(null);
  const [inventarioStatus, setInventarioStatus] = useState({});

  // Buscar status do inventário
  const fetchInventarioStatus = async () => {
    try {
      const response = await fetch('/api/inventario');
      if (response.ok) {
        const data = await response.json();
        setInventarioStatus(data);
      }
    } catch (error) {
      console.error('Erro ao buscar status do inventário:', error);
    }
  };

  useEffect(() => {
    document.title = "Home - Sistema de Endereçamento";
    fetchInventarioStatus();

    // Atualizar a cada 5 segundos para sincronizar com outros usuários
    const interval = setInterval(fetchInventarioStatus, 5000);
    return () => clearInterval(interval);
  }, []);

  // Função para determinar a imagem correta
  const getImageSrc = (setorCodigo, folder, baseName) => {
    const isHovered = hoveredSetor === setorCodigo;
    const emInventario = inventarioStatus[setorCodigo];

    if (isHovered) {
      return `/imagens/${folder}/${baseName}hover.png`;
    } else if (emInventario) {
      return `/imagens/${folder}/${baseName}Inv.png`;
    } else {
      return `/imagens/${folder}/${baseName}White.png`;
    }
  };

  return (
    <div className="bg-gray-100 h-screen overflow-hidden flex flex-col">
      {/* Use NavBar without specific sector props to trigger 'Home' view */}
      <NavBar almos="" setor="" centroCusto="" />

      {/* Main Layout Container - Adjust top margin for NavBar (approx 100px) */}
      <div className="flex flex-1 mt-[101px] h-[calc(100vh-102px)]">
        <div>
          {/* Sidebar */}
          <div className="w-[240px] bg-[#EEEEEE] border-r border-gray-300 flex flex-col">
            {/* Logo Area */}
            <div className="border-[3px] border-black p-8 inline-block">
              <div className="flex flex-col items-center space-y-3">
                <img src="/imagens/logo.png" alt="TOTVS" className="" />
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
              <Link href={"/admin/produtos"}>
                <MenuLink text="Admin" />
              </Link>
            </div>
          </div>
        </div>

        {/* Main Workspace */}
        <div className="relative flex-1 bg-white justify-center flex items-center">
          <Link href={"/319111"} className="absolute z-10 left-[340px] mt-[315px] w-[65.5px] ">
            <img
              src={getImageSrc('319111', 'Guarni', 'Guarni')}
              className="cursor-pointer buttonAnimation"
              onMouseEnter={() => setHoveredSetor('319111')}
              onMouseLeave={() => setHoveredSetor(null)}
            />
          </Link>
          <Link href={"/324111"} className="absolute z-10 left-[142px] mb-[8px] w-[46.5px] ">
            <img
              src={getImageSrc('324111', 'Vidro', 'Vidro')}
              className="cursor-pointer buttonAnimation"
              onMouseEnter={() => setHoveredSetor('324111')}
              onMouseLeave={() => setHoveredSetor(null)}
            />
          </Link>
          <Link href={"/316111"} className="absolute z-10 left-[142px] mt-[98px] w-[52px] ">
            <img
              src={getImageSrc('316111', 'B', 'B')}
              className="cursor-pointer buttonAnimation"
              onMouseEnter={() => setHoveredSetor('316111')}
              onMouseLeave={() => setHoveredSetor(null)}
            />
          </Link>
          <Link href={"/313111"} className="absolute z-10 left-[142px] mt-[247px] w-[52px] ">
            <img
              src={getImageSrc('313111', 'Cad', 'Cad')}
              className="cursor-pointer buttonAnimation"
              onMouseEnter={() => setHoveredSetor('313111')}
              onMouseLeave={() => setHoveredSetor(null)}
            />
          </Link>
          <Link href={"/323111"} className="absolute z-10 left-[193px] mt-[292px] w-[74.5px] ">
            <img
              src={getImageSrc('323111', 'Emb', 'Emb')}
              className="cursor-pointer buttonAnimation"
              onMouseEnter={() => setHoveredSetor('323111')}
              onMouseLeave={() => setHoveredSetor(null)}
            />
          </Link>
          <Link href={"/314111"} className="absolute z-20 left-[242px] mt-[305px] w-[24px] ">
            <img
              src={getImageSrc('314111', 'Cil', 'Cil')}
              className="cursor-pointer buttonAnimation"
              onMouseEnter={() => setHoveredSetor('314111')}
              onMouseLeave={() => setHoveredSetor(null)}
            />
          </Link>
          <Link href={"/317111"} className="absolute z-10 left-[245px] mt-[304px] w-[47px] ">
            <img
              src={getImageSrc('317111', 'C', 'C')}
              className="cursor-pointer buttonAnimation"
              onMouseEnter={() => setHoveredSetor('317111')}
              onMouseLeave={() => setHoveredSetor(null)}
            />
          </Link>
          <Link href={"/315111"} className="absolute z-10 left-[291px] mt-[317px] w-[50px] ">
            <img
              src={getImageSrc('315111', 'A', 'A')}
              className="cursor-pointer buttonAnimation"
              onMouseEnter={() => setHoveredSetor('315111')}
              onMouseLeave={() => setHoveredSetor(null)}
            />
          </Link>
          <img src="/imagens/planta.png" className="absolute left-10 max-w-[1200px] max-h-[600px]" />
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

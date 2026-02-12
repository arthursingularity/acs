import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { useTabs } from "../../context/TabsContext";
import SelectSetorModal from "../system/SelectSetorModal";
import NavBarButton from "./NavBarButton";

export default function NavBar({ almo, setor, centroCusto, titulo, onExportExcel, gridRows, gridCols, onAdjustGrid, onIniciarInventario, onFinalizarInventario, manutencaoButtons, almoxarifadoButtons, onIncluirOS, onAlterarOS, onWebMobile, onAtribuirOS, onFiltro, onCadastrarProduto, onAlterarProduto, onNecessidades }) {
  const [openModal, setOpenModal] = useState(false);
  const [username, setUsername] = useState("Visitante");
  const [currentDate, setCurrentDate] = useState("");
  const router = useRouter();
  const pathname = usePathname();
  const { tabs, closeTab } = useTabs();

  useEffect(() => {
    // Carregar usuário
    const storedUser = localStorage.getItem("username");
    if (storedUser) {
      setUsername(storedUser.toUpperCase());
    }

    // Carregar data atual
    const today = new Date();
    setCurrentDate(today.toLocaleDateString("pt-BR"));
  }, []);

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      localStorage.removeItem("username");
      router.push("/login");
    } catch (error) {
      console.error("Erro ao fazer logout:", error);
    }
  };

  return (
    <>
      <SelectSetorModal
        isOpen={openModal}
        onClose={() => setOpenModal(false)}
      />
      <div className="fixed top-0 left-0 right-0 z-50">
        <div className="bg-primary2 pb-[1px] flex justify-between items-center h-[36px]">
          <div className="flex items-center h-full">
            <Link href="/">
              <div className="bg-primary-2 overflow-hidden rounded">
                <img src="/imagens/stamS.png" className="w-[35px] border-1 border-primary p-1.5 rounded buttonHover" />
              </div>
            </Link>
            {tabs.map((tab) => (
              <div
                key={tab.path}
                onClick={() => router.push(tab.path)}
                className={`h-full flex items-center px-2.5 rounded-t cursor-pointer border-r border-primary ${pathname === tab.path ? "bg-primary4" : "bg-primary3 hover:opacity-90"
                  }`}
              >
                <div className="text-white text-sm flex items-center justify-center whitespace-nowrap">
                  {tab.title}
                  <img
                    src="/imagens/close.svg"
                    className="border border-border rounded w-[16px] ml-2 cursor-pointer hover:bg-red-500"
                    onClick={(e) => {
                      e.stopPropagation();
                      closeTab(tab.path);
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
          <div className="flex">
            <img src="/imagens/mail.svg" className="w-[40px] border-1 border-primary p-2 rounded buttonHover" />
            <img src="/imagens/help.svg" className="w-[40px] border-1 border-primary p-2 rounded buttonHover" />
          </div>
        </div>

        <div className="bg-lightGray h-[35px] flex justify-between">
          <div className="pl-1 pt-[1px] text-primary3 font-medium text-[20px]">
            <p>Suprimentos</p>
          </div>
          <div className="flex">
            <div className="mt-1.5 mb-1.5 font-medium text-[13px] border-l rounded flex items-center border-border px-4">
              <p>{username}</p>
            </div>
            <div className="mt-1.5 mb-1.5 font-medium text-[13px] border-l rounded flex items-center border-border px-4">
              <p>{currentDate}</p>
            </div>
            <div
              onClick={handleLogout}
              className="font-medium space-x-1 buttonHover bg-lightGray text-gray-600 text-[13px] border-l rounded flex items-center border-border px-4 cursor-pointer"
            >
              <img src="/imagens/close2.svg" className="w-[20px]" />
              <p>Sair</p>
            </div>
          </div>
        </div>

        <div className="bg-blackGradient pl-1 pt-[1px] h-[30px] space-x-2 font-bold text-white tracking-wide flex items-center pl-3 text-[13px]">
          {titulo ? (
            <p>{titulo}</p>
          ) : centroCusto ? (
            <p>
              Controle de endereçamento - Setor: {setor} - C. Custo: {centroCusto}
            </p>
          ) : (
            <p>Home</p>
          )}
          <div className="hidden">{almo}</div>
        </div>

        {/* Botões de Manutenção */}
        {manutencaoButtons && (
          <div className="bg-white h-[24px] font-bold tracking-wide flex items-center text-[11px] border-b border-gray-300">
            <NavBarButton onClick={onIncluirOS}>Incluir</NavBarButton>
            <NavBarButton onClick={onAlterarOS}>Alterar</NavBarButton>
            <NavBarButton onClick={onAtribuirOS}>Atribuir</NavBarButton>
            <NavBarButton href="/manutencao/bens">Equipamentos/Bens</NavBarButton>
            <NavBarButton href="/manutencao/mobile">Web</NavBarButton>
            <NavBarButton href="/manutencao/painel-tv">Painel TV</NavBarButton>
            <NavBarButton href="/manutencao/tecnicos">Técnicos</NavBarButton>
            <NavBarButton href="/stamconecta">Stam Conecta</NavBarButton>
            <NavBarButton onClick={onFiltro} hasDropdown>Filtro</NavBarButton>
            <NavBarButton onClick={() => window.location.reload()}>Atualizar</NavBarButton>
          </div>
        )}

        {almoxarifadoButtons && (
          <div className="bg-white h-[24px] font-bold tracking-wide flex items-center text-[11px] border-b border-gray-300">
            <NavBarButton onClick={onCadastrarProduto}>Incluir Produto</NavBarButton>
            <NavBarButton onClick={onAlterarProduto}>Alterar</NavBarButton>
            <NavBarButton onClick={onNecessidades}>Necessidades</NavBarButton>
            <NavBarButton onClick={() => window.location.reload()}>Atualizar</NavBarButton>
          </div>
        )}

        {centroCusto && (
          <div className="bg-white h-[24px] font-bold tracking-wide flex items-center justify-between text-[11px] border-b border-gray-300">
            <div>
              <NavBarButton onClick={() => setOpenModal(true)}>Mudar Setor</NavBarButton>
              <NavBarButton onClick={onIniciarInventario}>Iniciar Inv</NavBarButton>
              <NavBarButton onClick={onFinalizarInventario}>Finalizar Inv</NavBarButton>
              <NavBarButton onClick={onExportExcel}>Excel</NavBarButton>
            </div>
            {/* Controles de Grid */}
            <div className="flex items-center space-x-2 px-2 border-l border-r border-gray-200 h-full mx-2">
              <div className="flex items-center space-x-1">
                <span className="text-gray-600 text-[11px] font-bold">Altura:</span>
                <span className="text-primary3 font-bold text-xs w-6 text-center">{gridRows}</span>
                <button
                  onClick={() => onAdjustGrid(1, 0)}
                  className="w-5 h-full flex items-center justify-center bg-gray-100 hover:bg-gray-200 rounded text-gray-700 text-xs font-bold border"
                  title="Adicionar 10 linhas"
                >
                  +
                </button>
                <button
                  onClick={() => onAdjustGrid(-1, 0)}
                  className="w-5 h-full flex items-center justify-center bg-gray-100 hover:bg-gray-200 rounded text-gray-700 text-xs font-bold border"
                  title="Remover 10 linhas"
                >
                  -
                </button>
              </div>

              <div className="w-[1px] h-[15px] bg-gray-300"></div>

              <div className="flex items-center space-x-1">
                <span className="text-gray-600 text-[11px] font-bold">Largura:</span>
                <span className="text-primary3 font-bold text-xs w-6 text-center">{gridCols}</span>
                <button
                  onClick={() => onAdjustGrid(0, 1)}
                  className="w-5 h-full flex items-center justify-center bg-gray-100 hover:bg-gray-200 rounded text-gray-700 text-xs font-bold border"
                  title="Adicionar 10 colunas"
                >
                  +
                </button>
                <button
                  onClick={() => onAdjustGrid(0, -1)}
                  className="w-5 h-full flex items-center justify-center bg-gray-100 hover:bg-gray-200 rounded text-gray-700 text-xs font-bold border"
                  title="Remover 10 colunas"
                >
                  -
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}

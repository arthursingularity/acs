import { useState } from "react";
import SelectSetorModal from "../system/SelectSetorModal";

export default function NavBar({ almo, setor, centroCusto, onExportExcel }) {
  const [openModal, setOpenModal] = useState(false);

  return (
    <>
      <SelectSetorModal
        isOpen={openModal}
        onClose={() => setOpenModal(false)}
      />
      <div className="fixed top-0 left-0 right-0 z-50">
        <div className="bg-primary2 pb-[1px] flex justify-between items-center h-[42px]">
          <div className="flex items-center h-full">
            <div>
              <img src="/imagens/logo.png" className="w-[40px] border-1 border-primary p-1.5 rounded buttonHover" />
            </div>
            <div className="bg-primary4 h-full flex items-center px-2.5 rounded-t">
              <div className="text-white text-sm flex items-center justify-center">Controle de Endereçamento
                <img src="/imagens/close.svg" className="border border-border rounded w-[16px] ml-2 cursor-pointer" />
              </div>
            </div>
          </div>
          <div className="flex">
            <img src="/imagens/mail.svg" className="w-[40px] border-1 border-primary p-2 rounded buttonHover" />
            <img src="/imagens/help.svg" className="w-[40px] border-1 border-primary p-2 rounded buttonHover" />
          </div>
        </div>

        <div className="bg-lightGray h-[42px] flex justify-between">
          <div className="pl-1 pt-[1px] text-primary3 font-medium text-[20px]">
            <p>TOTVS | Suprimentos</p>
          </div>
          <div className="flex">
            <div className="mt-1.5 mb-1.5 font-medium text-[13px] border-l rounded flex items-center border-border px-4">
              <p>TOTVS Manufatura MSSQL Html</p>
            </div>
            <div className="mt-1.5 mb-1.5 font-medium text-[13px] border-l rounded flex items-center border-border px-4">
              <p>ARTHURM</p>
            </div>
            <div className="mt-1.5 mb-1.5 font-medium text-[13px] border-l rounded flex items-center border-border px-4">
              <p>21/01/2026</p>
            </div>
            <div className="mt-1.5 mb-1.5 font-medium text-[13px] border-l rounded flex items-center border-border px-4">
              <p>Stam/Matriz</p>
            </div>
            <div className="mt-1.5 mb-1.5 font-medium text-[13px] border-l rounded flex items-center border-border px-4">
              <p>F4 | F8</p>
            </div>
            <div className="mt-1.5 mb-1.5 font-medium text-[13px] border-l rounded flex items-center border-border px-4">
              <p>F4 | F8 | F12</p>
            </div>
            <div className="mt-1.5 mb-1.5 font-medium text-[13px] border-l rounded flex items-center border-border px-4">
              <p>Stam/Matriz</p>
            </div>
            <div className="font-medium space-x-1 buttonHover bg-lightGray text-gray-600 text-[13px] border-l rounded flex items-center border-border px-4">
              <img src="/imagens/close2.svg" className="w-[20px]" />
              <p>Sair</p>
            </div>
          </div>
        </div>

        <div className="bg-blackGradient pl-1 pt-[1px] h-[35px] space-x-2 font-bold text-white tracking-wide flex items-center pl-3 text-[14px]">
          <p>
            Controle de endereçamento - Setor: {setor} - C. Custo: {centroCusto}
          </p>
          <div className="hidden">{almo}</div>
        </div>
        <div className="bg-white h-[30px] font-bold tracking-wide flex items-center text-[15px]">
          <button
            onClick={() => setOpenModal(true)}
            className="border-2 border-primary3 h-full rounded text-primary3 px-2 buttonHover2"
          >
            Mudar Setor
          </button>
          <button
            onClick={onExportExcel}
            className="border-2 border-primary3 h-full rounded text-primary3 px-2 buttonHover2"
          >
            Excel
          </button>
        </div>
      </div>
    </>
  );
}

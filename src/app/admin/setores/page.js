"use client";

import { useEffect, useState } from "react";
import ModalWrapper from "../../components/ui/ModalWrapper";
import Input from "../../components/ui/Input";
import DataTable from "../../components/ui/DataTable";
import NavBarButton from "../../components/ui/NavBarButton";

export default function SetoresPage() {
    const [setores, setSetores] = useState([]);
    const [formData, setFormData] = useState({
        centroCusto: "",
        descricao: "",
        almoxarifado: "",
    });
    const [loading, setLoading] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [modalAberto, setModalAberto] = useState(false);
    const [setorSelecionado, setSetorSelecionado] = useState(null);

    useEffect(() => {
        fetchSetores();
        document.title = "Gerenciar Setores";
    }, []);

    const fetchSetores = async () => {
        const res = await fetch("/api/setores");
        if (res.ok) setSetores(await res.json());
    };

    const handleSubmit = async () => {
        if (!formData.centroCusto || !formData.descricao) {
            alert("Preencha todos os campos obrigatórios");
            return;
        }
        setLoading(true);

        const method = isEditing ? "PUT" : "POST";

        try {
            const res = await fetch("/api/setores", {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData),
            });
            if (res.ok) {
                resetForm();
                setModalAberto(false);
                fetchSetores();
            } else {
                alert("Erro ao salvar setor");
            }
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async () => {
        if (!setorSelecionado) {
            alert("Selecione um setor para excluir");
            return;
        }
        if (!confirm("Tem certeza? Isso apagará todos os endereços deste setor!")) return;
        await fetch(`/api/setores/${setorSelecionado.centroCusto}`, { method: "DELETE" });
        setSetorSelecionado(null);
        fetchSetores();
    };

    const handleIncluir = () => {
        resetForm();
        setModalAberto(true);
    };

    const handleEditar = () => {
        if (!setorSelecionado) {
            alert("Selecione um setor para alterar");
            return;
        }
        setIsEditing(true);
        setFormData({
            centroCusto: setorSelecionado.centroCusto,
            descricao: setorSelecionado.descricao,
            almoxarifado: setorSelecionado.almoxarifado,
        });
        setModalAberto(true);
    };

    const resetForm = () => {
        setIsEditing(false);
        setFormData({ centroCusto: "", descricao: "", almoxarifado: "" });
    };

    const handleSelectSetor = (setor) => {
        if (setorSelecionado?.id === setor.id) {
            setSetorSelecionado(null);
        } else {
            setSetorSelecionado(setor);
        }
    };

    return (
        <div className="flex flex-col h-full">
            {/* Barra de Ferramentas - estilo ERP */}
            <div className="bg-white h-[24px] font-bold tracking-wide flex items-center justify-between text-[11px] border-b border-gray-300">
                <div className="flex items-center">
                    <NavBarButton onClick={handleIncluir}>Incluir</NavBarButton>
                    <NavBarButton onClick={handleEditar}>Alterar</NavBarButton>
                    <NavBarButton onClick={handleDelete}>Excluir</NavBarButton>
                    <NavBarButton onClick={fetchSetores}>Atualizar</NavBarButton>
                </div>

                <div className="flex items-center pr-3">
                    <span className="text-[11px] text-gray-500 font-medium">{setores.length} setor(es)</span>
                </div>
            </div>

            {/* Tabela de Dados - estilo ERP */}
            <div className="tabelaNova flex-1 overflow-hidden mt-[3px]">
                <DataTable
                    data={setores}
                    selectedId={setorSelecionado?.id}
                    onSelect={handleSelectSetor}
                    onDoubleClick={(setor) => {
                        setIsEditing(true);
                        setFormData({
                            centroCusto: setor.centroCusto,
                            descricao: setor.descricao,
                            almoxarifado: setor.almoxarifado,
                        });
                        setModalAberto(true);
                    }}
                    columns={[
                        { key: "centroCusto", label: "Centro de Custo" },
                        { key: "descricao", label: "Descrição" },
                        { key: "almoxarifado", label: "Almoxarifado" },
                    ]}
                />
            </div>

            {/* Modal Cadastro/Edição - estilo ERP */}
            <ModalWrapper
                isOpen={modalAberto}
                onClose={() => { setModalAberto(false); resetForm(); }}
                title={isEditing ? "Alterar Setor" : "Incluir Setor"}
                className="w-[450px]"
            >
                <div className="space-y-3">
                    <div>
                        <label className="block text-[11px] font-bold text-gray-600 mb-0.5">
                            Centro de Custo *
                        </label>
                        <Input
                            value={formData.centroCusto}
                            onChange={(e) => setFormData({ ...formData, centroCusto: e.target.value })}
                            placeholder="EX: 314111"
                            className="w-full h-[28px] text-[12px]"
                            disabled={isEditing}
                        />
                    </div>
                    <div>
                        <label className="block text-[11px] font-bold text-gray-600 mb-0.5">
                            Descrição *
                        </label>
                        <Input
                            value={formData.descricao}
                            onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
                            placeholder="DESCRIÇÃO DO SETOR"
                            className="w-full h-[28px] text-[12px]"
                        />
                    </div>
                    <div>
                        <label className="block text-[11px] font-bold text-gray-600 mb-0.5">
                            Almoxarifado
                        </label>
                        <Input
                            value={formData.almoxarifado}
                            onChange={(e) => setFormData({ ...formData, almoxarifado: e.target.value })}
                            placeholder="ALMOXARIFADO"
                            className="w-full h-[28px] text-[12px]"
                        />
                    </div>

                    {/* Botões de ação - estilo ERP */}
                    <div className="flex justify-end space-x-2 pt-3 border-t border-gray-200">
                        <button
                            onClick={() => { setModalAberto(false); resetForm(); }}
                            className="border-2 border-gray-400 h-[28px] rounded text-gray-600 px-4 font-bold text-[11px] hover:bg-gray-100 cursor-pointer transition-colors"
                        >
                            Cancelar
                        </button>
                        <button
                            onClick={handleSubmit}
                            disabled={loading}
                            className="border-2 border-primary3 h-[28px] rounded bg-primary3 text-white px-4 font-bold text-[11px] hover:brightness-110 cursor-pointer transition-all disabled:opacity-50"
                        >
                            {loading ? "Salvando..." : (isEditing ? "Salvar" : "Cadastrar")}
                        </button>
                    </div>
                </div>
            </ModalWrapper>
        </div>
    );
}

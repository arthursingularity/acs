"use client";

import { useEffect, useState, useRef } from "react";
import ModalWrapper from "../../components/ui/ModalWrapper";
import Input from "../../components/ui/Input";
import DataTable from "../../components/ui/DataTable";
import NavBarButton from "../../components/ui/NavBarButton";

export default function ProdutosPage() {
    const [produtos, setProdutos] = useState([]);
    const [filtered, setFiltered] = useState([]);
    const [search, setSearch] = useState("");
    const [formData, setFormData] = useState({ codigo: "", descricao: "" });
    const [loading, setLoading] = useState(false);
    const [page, setPage] = useState(1);
    const itemsPerPage = 50;
    const [isEditing, setIsEditing] = useState(false);
    const [modalAberto, setModalAberto] = useState(false);
    const [produtoSelecionado, setProdutoSelecionado] = useState(null);

    useEffect(() => {
        fetchProdutos();
        document.title = "Gerenciar Produtos";
    }, []);

    useEffect(() => {
        const term = search.toUpperCase();
        setFiltered(produtos.filter(p =>
            p.codigo.includes(term) || p.descricao.toUpperCase().includes(term)
        ));
        setPage(1);
    }, [search, produtos]);

    const fetchProdutos = async () => {
        const res = await fetch("/api/produtos");
        if (res.ok) {
            const data = await res.json();
            setProdutos(data);
        }
    };

    const handleSubmit = async () => {
        if (!formData.codigo || !formData.descricao) {
            alert("Preencha todos os campos obrigatórios");
            return;
        }
        setLoading(true);

        try {
            let res;
            if (isEditing) {
                res = await fetch("/api/produtos", {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify([formData]),
                });
            } else {
                res = await fetch("/api/produtos", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(formData),
                });
            }

            if (res.ok) {
                resetForm();
                setModalAberto(false);
                fetchProdutos();
            } else {
                alert("Erro ao salvar produto");
            }
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async () => {
        if (!produtoSelecionado) {
            alert("Selecione um produto para excluir");
            return;
        }
        if (!confirm("Tem certeza que deseja excluir este produto?")) return;
        await fetch(`/api/produtos?codigo=${produtoSelecionado.codigo}`, { method: "DELETE" });
        setProdutoSelecionado(null);
        fetchProdutos();
    };

    const handleIncluir = () => {
        resetForm();
        setModalAberto(true);
    };

    const handleEditar = () => {
        if (!produtoSelecionado) {
            alert("Selecione um produto para alterar");
            return;
        }
        setIsEditing(true);
        setFormData({
            codigo: produtoSelecionado.codigo,
            descricao: produtoSelecionado.descricao,
        });
        setModalAberto(true);
    };

    const resetForm = () => {
        setIsEditing(false);
        setFormData({ codigo: "", descricao: "" });
    };

    const handleSelectProduto = (produto) => {
        if (produtoSelecionado?.id === produto.id) {
            setProdutoSelecionado(null);
        } else {
            setProdutoSelecionado(produto);
        }
    };

    const paginated = filtered.slice((page - 1) * itemsPerPage, page * itemsPerPage);
    const totalPages = Math.ceil(filtered.length / itemsPerPage);

    return (
        <div className="flex flex-col h-full">
            {/* Barra de Ferramentas - estilo ERP */}
            <div className="bg-white h-[24px] font-bold tracking-wide flex items-center justify-between text-[11px] border-b border-gray-300">
                <div className="flex items-center">
                    <NavBarButton onClick={handleIncluir}>Incluir</NavBarButton>
                    <NavBarButton onClick={handleEditar}>Alterar</NavBarButton>
                    <NavBarButton onClick={handleDelete}>Excluir</NavBarButton>
                    <NavBarButton onClick={fetchProdutos}>Atualizar</NavBarButton>

                    {/* Separador */}
                    <div className="w-[1px] h-[16px] bg-gray-300 mx-2"></div>

                    {/* Campo de pesquisa inline - estilo ERP */}
                    <div className="flex items-center">
                        <span className="text-[11px] text-gray-500 font-bold mr-1">Pesquisar:</span>
                        <input
                            value={search}
                            onChange={(e) => setSearch(e.target.value.toUpperCase())}
                            placeholder="CÓDIGO OU DESCRIÇÃO..."
                            className="border border-gray-300 rounded h-[18px] px-2 text-[11px] w-[220px] outline-none focus:border-primary3 uppercase"
                        />
                    </div>
                </div>

                <div className="flex items-center pr-3">
                    <span className="text-[11px] text-gray-500 font-medium">
                        {filtered.length} produto(s) | Pág. {page}/{totalPages || 1}
                    </span>
                </div>
            </div>

            {/* Tabela de Dados - estilo ERP */}
            <div className="tabelaNova flex-1 overflow-hidden mt-[3px]">
                <DataTable
                    data={paginated}
                    selectedId={produtoSelecionado?.id}
                    onSelect={handleSelectProduto}
                    onDoubleClick={(produto) => {
                        setIsEditing(true);
                        setFormData({
                            codigo: produto.codigo,
                            descricao: produto.descricao,
                        });
                        setModalAberto(true);
                    }}
                    columns={[
                        {
                            key: "codigo",
                            label: "Código",
                            width: "w-[1px]",
                            render: (val) => <span className="font-mono font-bold text-primary3">{val}</span>
                        },
                        { key: "descricao", label: "Descrição" },
                        { key: "centroCusto", label: "C. Custo" },
                        { key: "saldo", label: "Saldo", render: (val) => val || 0 },
                    ]}
                />
            </div>

            {/* Paginação - estilo ERP */}
            {totalPages > 1 && (
                <div className="bg-white h-[24px] flex items-center justify-center border-t border-gray-300 space-x-2">
                    <button
                        disabled={page === 1}
                        onClick={() => setPage(p => p - 1)}
                        className={`border border-gray-300 rounded h-[18px] px-2 text-[11px] font-bold ${page === 1 ? "text-gray-300 cursor-not-allowed" : "text-primary3 hover:bg-primarySoft cursor-pointer"}`}
                    >
                        ◀ Anterior
                    </button>
                    <span className="text-[11px] font-bold text-gray-600">Página {page} de {totalPages}</span>
                    <button
                        disabled={page >= totalPages}
                        onClick={() => setPage(p => p + 1)}
                        className={`border border-gray-300 rounded h-[18px] px-2 text-[11px] font-bold ${page >= totalPages ? "text-gray-300 cursor-not-allowed" : "text-primary3 hover:bg-primarySoft cursor-pointer"}`}
                    >
                        Próxima ▶
                    </button>
                </div>
            )}

            {/* Modal Cadastro/Edição - estilo ERP */}
            <ModalWrapper
                isOpen={modalAberto}
                onClose={() => { setModalAberto(false); resetForm(); }}
                title={isEditing ? "Alterar Produto" : "Incluir Produto"}
                className="w-[450px]"
            >
                <div className="space-y-3">
                    <div>
                        <label className="block text-[11px] font-bold text-gray-600 mb-0.5">
                            Código *
                        </label>
                        <Input
                            value={formData.codigo}
                            onChange={(e) => setFormData({ ...formData, codigo: e.target.value.toUpperCase() })}
                            placeholder="CÓDIGO DO PRODUTO"
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
                            onChange={(e) => setFormData({ ...formData, descricao: e.target.value.toUpperCase() })}
                            placeholder="DESCRIÇÃO DO PRODUTO"
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

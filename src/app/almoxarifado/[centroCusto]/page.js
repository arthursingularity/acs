"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import NavBar from "../../components/ui/NavBar";
import ModalWrapper from "../../components/ui/ModalWrapper";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";
import DataTable from "../../components/ui/DataTable";

const ALMOXARIFADOS = {
    "111111": { nome: "ELÉTRICA", centroCusto: "111111" },
    "222222": { nome: "MECÂNICA", centroCusto: "222222" },
};

export default function AlmoxarifadoPage() {
    const params = useParams();
    const centroCusto = params.centroCusto;
    const almoInfo = ALMOXARIFADOS[centroCusto] || { nome: centroCusto, centroCusto };

    // Estados
    const [produtos, setProdutos] = useState([]);
    const [filtered, setFiltered] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");

    // Modal Cadastrar Produto
    const [modalCadastrar, setModalCadastrar] = useState(false);
    const [formProduto, setFormProduto] = useState({ codigo: "", descricao: "", saldo: 0 });
    const [isEditing, setIsEditing] = useState(false);

    // Modal Gerar Saldo
    const [modalSaldo, setModalSaldo] = useState(false);
    const [produtoSelecionado, setProdutoSelecionado] = useState(null);
    const [novoSaldo, setNovoSaldo] = useState("");

    // Produto selecionado na tabela
    const [produtoAtivo, setProdutoAtivo] = useState(null);

    // Paginação
    const [page, setPage] = useState(1);
    const itemsPerPage = 50;

    useEffect(() => {
        document.title = `Almoxarifado ${almoInfo.nome}`;
        fetchProdutos();
    }, [centroCusto]);

    useEffect(() => {
        const term = search.toUpperCase();
        setFiltered(produtos.filter(p =>
            p.codigo.includes(term) || p.descricao.toUpperCase().includes(term)
        ));
        setPage(1);
    }, [search, produtos]);

    const fetchProdutos = async () => {
        setLoading(true);
        try {
            const res = await fetch(`/api/produtos?centroCusto=${centroCusto}`);
            if (res.ok) {
                const data = await res.json();
                setProdutos(data);
            }
        } catch (error) {
            console.error("Erro ao buscar produtos:", error);
        } finally {
            setLoading(false);
        }
    };

    // ---- Cadastrar / Editar Produto ----
    const handleOpenCadastrar = () => {
        setIsEditing(false);
        setFormProduto({ codigo: "", descricao: "", saldo: 0 });
        setModalCadastrar(true);
    };

    const handleOpenAlterar = () => {
        if (!produtoAtivo) {
            alert("Selecione um produto na tabela para alterar.");
            return;
        }
        setIsEditing(true);
        setFormProduto({
            codigo: produtoAtivo.codigo,
            descricao: produtoAtivo.descricao,
            saldo: produtoAtivo.saldo || 0,
        });
        setModalCadastrar(true);
    };

    const handleSalvarProduto = async () => {
        if (!formProduto.codigo || !formProduto.descricao) {
            alert("Código e descrição são obrigatórios.");
            return;
        }

        try {
            if (isEditing) {
                const res = await fetch("/api/produtos", {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify([{
                        codigo: formProduto.codigo,
                        descricao: formProduto.descricao.toUpperCase(),
                        centroCusto,
                        saldo: parseInt(formProduto.saldo) || 0,
                    }]),
                });
                if (res.ok) {
                    setModalCadastrar(false);
                    fetchProdutos();
                } else {
                    alert("Erro ao atualizar produto.");
                }
            } else {
                const res = await fetch("/api/produtos", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        codigo: formProduto.codigo.toUpperCase(),
                        descricao: formProduto.descricao.toUpperCase(),
                        centroCusto,
                        saldo: parseInt(formProduto.saldo) || 0,
                    }),
                });
                if (res.ok) {
                    setModalCadastrar(false);
                    fetchProdutos();
                } else {
                    alert("Erro ao cadastrar produto. Verifique se o código já existe.");
                }
            }
        } catch (error) {
            console.error("Erro:", error);
            alert("Erro ao salvar produto.");
        }
    };

    const handleExcluirProduto = async () => {
        if (!produtoAtivo) return;
        if (!confirm(`Deseja excluir o produto ${produtoAtivo.codigo} - ${produtoAtivo.descricao}?`)) return;

        try {
            await fetch(`/api/produtos?codigo=${produtoAtivo.codigo}`, { method: "DELETE" });
            setProdutoAtivo(null);
            fetchProdutos();
        } catch (error) {
            console.error("Erro ao excluir:", error);
        }
    };

    // ---- Gerar Saldo ----
    const handleOpenGerarSaldo = () => {
        if (!produtoAtivo) {
            alert("Selecione um produto na tabela para gerar saldo.");
            return;
        }
        setProdutoSelecionado(produtoAtivo);
        setNovoSaldo(String(produtoAtivo.saldo || 0));
        setModalSaldo(true);
    };

    const handleSalvarSaldo = async () => {
        if (!produtoSelecionado) return;
        const saldoInt = parseInt(novoSaldo);
        if (isNaN(saldoInt) || saldoInt < 0) {
            alert("Informe um saldo válido (número inteiro >= 0).");
            return;
        }

        try {
            const res = await fetch("/api/produtos", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    codigo: produtoSelecionado.codigo,
                    saldo: saldoInt,
                }),
            });
            if (res.ok) {
                setModalSaldo(false);
                fetchProdutos();
            } else {
                alert("Erro ao atualizar saldo.");
            }
        } catch (error) {
            console.error("Erro:", error);
            alert("Erro ao atualizar saldo.");
        }
    };

    const paginated = filtered.slice((page - 1) * itemsPerPage, page * itemsPerPage);
    const totalPages = Math.ceil(filtered.length / itemsPerPage);

    return (
        <div className="bg-gray-100 h-screen overflow-hidden flex flex-col">
            <NavBar
                titulo={`Almoxarifado ${almoInfo.nome} - C. Custo: ${almoInfo.centroCusto}`}
                almoxarifadoButtons
                onCadastrarProduto={handleOpenCadastrar}
                onAlterarProduto={handleOpenAlterar}
                onGerarSaldo={handleOpenGerarSaldo}
            />

            {/* Conteúdo */}
            <div className="flex-1 mt-[128px] overflow-hidden flex flex-col">

                {/* Tabela */}
                <div className="flex-1 overflow-auto tabelaNova">
                    <DataTable
                        data={paginated}
                        columns={[
                            {
                                key: "codigo",
                                label: "Produto",
                                width: "w-[120px]",
                            },
                            {
                                key: "descricao",
                                label: "Descrição",
                            },
                            {
                                key: "saldo",
                                label: "Saldo",
                                width: "w-[100px]",
                                render: (val) => val || 0,
                            },
                        ]}
                        onSelect={(row) => setProdutoAtivo(row)}
                        selectedId={produtoAtivo?.id}
                        loading={loading}
                        emptyMessage="Nenhum produto cadastrado neste almoxarifado"
                    />
                </div>

                {/* Paginação */}
                {totalPages > 1 && (
                    <div className="px-4 py-2 border-t border-gray-300 bg-white flex items-center justify-between">
                        <span className="text-sm text-gray-600">
                            Mostrando {paginated.length} de {filtered.length} produtos
                        </span>
                        <div className="flex space-x-2">
                            <Button
                                variant="outline"
                                disabled={page === 1}
                                onClick={() => setPage(p => p - 1)}
                                className="h-7 text-xs px-3"
                            >
                                Anterior
                            </Button>
                            <div className="flex items-center px-3 text-sm">
                                Página {page} de {totalPages}
                            </div>
                            <Button
                                variant="outline"
                                disabled={page >= totalPages}
                                onClick={() => setPage(p => p + 1)}
                                className="h-7 text-xs px-3"
                            >
                                Próxima
                            </Button>
                        </div>
                    </div>
                )}
            </div>

            {/* ==================== MODAIS ==================== */}

            {/* Modal Cadastrar / Editar Produto */}
            <ModalWrapper
                isOpen={modalCadastrar}
                onClose={() => setModalCadastrar(false)}
                title={isEditing ? `Alterar Produto - ${formProduto.codigo}` : "Cadastrar Produto"}
                className="w-[450px]"
            >
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Código do Produto *
                        </label>
                        <Input
                            value={formProduto.codigo}
                            onChange={(e) => setFormProduto({ ...formProduto, codigo: e.target.value.toUpperCase() })}
                            disabled={isEditing}
                            className={isEditing ? "bg-gray-100 cursor-not-allowed" : ""}
                            placeholder="Ex: MAT001"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Descrição *
                        </label>
                        <Input
                            value={formProduto.descricao}
                            onChange={(e) => setFormProduto({ ...formProduto, descricao: e.target.value.toUpperCase() })}
                            placeholder="Descrição do produto"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Saldo Inicial
                        </label>
                        <Input
                            type="number"
                            min="0"
                            value={formProduto.saldo}
                            onChange={(e) => setFormProduto({ ...formProduto, saldo: e.target.value })}
                            placeholder="0"
                        />
                    </div>

                    <div className="flex justify-between pt-2">
                        <div className="flex space-x-2">
                            <Button variant="outline" className="px-4 py-2" onClick={() => setModalCadastrar(false)}>
                                Cancelar
                            </Button>
                            {isEditing && (
                                <Button
                                    variant="outline"
                                    className="px-4 py-2 text-red-600 border-red-300 hover:bg-red-50"
                                    onClick={() => {
                                        setModalCadastrar(false);
                                        handleExcluirProduto();
                                    }}
                                >
                                    Excluir
                                </Button>
                            )}
                        </div>
                        <Button
                            variant="primary"
                            className="px-6 py-2"
                            onClick={handleSalvarProduto}
                        >
                            {isEditing ? "Salvar Alterações" : "Cadastrar"}
                        </Button>
                    </div>
                </div>
            </ModalWrapper>

            {/* Modal Gerar Saldo */}
            <ModalWrapper
                isOpen={modalSaldo}
                onClose={() => setModalSaldo(false)}
                title={`Gerar Saldo - ${produtoSelecionado?.codigo || ""}`}
                className="w-[400px]"
            >
                {produtoSelecionado && (
                    <div className="space-y-4">
                        <div className="bg-gray-50 rounded p-3 border">
                            <p className="text-xs text-gray-500 font-bold uppercase">Produto</p>
                            <p className="font-bold text-gray-800">{produtoSelecionado.codigo}</p>
                            <p className="text-sm text-gray-600">{produtoSelecionado.descricao}</p>
                        </div>

                        <div className="bg-gray-50 rounded p-3 border">
                            <p className="text-xs text-gray-500 font-bold uppercase">Saldo Atual</p>
                            <p className="text-2xl font-bold text-primary3">{produtoSelecionado.saldo || 0}</p>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Novo Saldo
                            </label>
                            <Input
                                type="number"
                                min="0"
                                value={novoSaldo}
                                onChange={(e) => setNovoSaldo(e.target.value)}
                                autoFocus
                                className="text-lg font-bold"
                            />
                        </div>

                        <div className="flex justify-between pt-2">
                            <Button variant="outline" className="px-4 py-2" onClick={() => setModalSaldo(false)}>
                                Cancelar
                            </Button>
                            <Button
                                variant="primary"
                                className="px-6 py-2"
                                onClick={handleSalvarSaldo}
                            >
                                Confirmar Saldo
                            </Button>
                        </div>
                    </div>
                )}
            </ModalWrapper>
        </div>
    );
}

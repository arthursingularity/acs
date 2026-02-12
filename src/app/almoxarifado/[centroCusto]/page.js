"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import NavBar from "../../components/ui/NavBar";
import ModalWrapper from "../../components/ui/ModalWrapper";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";
import DataTable from "../../components/ui/DataTable";

const ALMOXARIFADOS = {
    "204131": { nome: "MANUTENCAO ELETRICA", centroCusto: "204131" },
    "204111": { nome: "MANUTENCAO MECANICA", centroCusto: "204111" },
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

    // Necessidades (solicitações ao almoxarifado)
    const [necessidades, setNecessidades] = useState([]); // agrupado por produtoId
    const [modalNecessidades, setModalNecessidades] = useState(false);
    const [necessidadeDetalhe, setNecessidadeDetalhe] = useState(null); // produto selecionado no modal
    const [qtdAtender, setQtdAtender] = useState({});

    useEffect(() => {
        document.title = `${almoInfo.nome}`;
        fetchProdutos();
        fetchNecessidades();

        // Auto-refresh a cada 30s
        const interval = setInterval(() => {
            fetchProdutos();
            fetchNecessidades();
        }, 30000);
        return () => clearInterval(interval);
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

    const fetchNecessidades = async () => {
        try {
            const res = await fetch(`/api/almoxarifado/solicitacoes?centroCusto=${centroCusto}&tipo=necessidades`);
            if (res.ok) {
                const data = await res.json();
                setNecessidades(data);
            }
        } catch (error) {
            console.error("Erro ao buscar necessidades:", error);
        }
    };

    // Mapeia produtoId -> total pendente para a coluna
    const necessidadesMap = {};
    necessidades.forEach(n => {
        necessidadesMap[n.produtoId] = n.totalSolicitado - n.totalAtendido;
    });

    // Adiciona coluna necessidade aos produtos filtrados
    const produtosComNecessidade = filtered.map(p => ({
        ...p,
        necessidade: necessidadesMap[p.id] || 0,
    }));

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

    // ---- Necessidades ----
    const handleOpenNecessidades = () => {
        setNecessidadeDetalhe(null);
        setQtdAtender({});
        setModalNecessidades(true);
    };

    const handleAtenderSolicitacao = async (solicitacaoId, qtd) => {
        if (!qtd || qtd < 1) {
            alert("Informe uma quantidade válida.");
            return;
        }
        try {
            const res = await fetch("/api/almoxarifado/solicitacoes", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    id: solicitacaoId,
                    acao: "atender",
                    quantidadeAtender: parseInt(qtd),
                }),
            });
            if (res.ok) {
                fetchNecessidades();
                fetchProdutos(); // Atualizar saldo
                setQtdAtender(prev => ({ ...prev, [solicitacaoId]: "" }));
            } else {
                const errData = await res.json();
                alert(errData.error || "Erro ao atender solicitação.");
            }
        } catch (error) {
            console.error("Erro:", error);
            alert("Erro ao atender solicitação.");
        }
    };

    const formatDate = (dateStr) => {
        const d = new Date(dateStr);
        return d.toLocaleDateString("pt-BR") + " " + d.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
    };

    const paginated = produtosComNecessidade.slice((page - 1) * itemsPerPage, page * itemsPerPage);

    return (
        <div className="bg-gray-100 h-screen overflow-hidden flex flex-col">
            <NavBar
                titulo={`${almoInfo.nome} - C. Custo: ${almoInfo.centroCusto}`}
                almoxarifadoButtons
                onCadastrarProduto={handleOpenCadastrar}
                onAlterarProduto={handleOpenAlterar}
                onNecessidades={handleOpenNecessidades}
            />

            {/* Conteúdo */}
            <div className="flex-1 mt-[128px] overflow-hidden flex flex-col">

                {/* Tabela */}
                <div className="flex-1 overflow-hidden tabelaNova">
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
                            {
                                key: "necessidade",
                                label: "Necessidades",
                                width: "w-[120px]",
                                render: (val) => val > 0 ? (
                                    <span>
                                        {val}
                                    </span>
                                ) : (
                                    <span>0</span>
                                ),
                            },
                            {
                                key: "mediaMensal",
                                label: "Méd. Mensal",
                                width: "w-[95px]",
                                render: (val) => val != null ? val.toLocaleString("pt-BR", { minimumFractionDigits: 1, maximumFractionDigits: 1 }) : "-",
                            },
                            {
                                key: "mediaDiaria",
                                label: "Média Diária",
                                width: "w-[90px]",
                                render: (val) => val != null ? val.toLocaleString("pt-BR", { minimumFractionDigits: 1, maximumFractionDigits: 1 }) : "-",
                            },
                        ]}
                        onSelect={(row) => setProdutoAtivo(row)}
                        selectedId={produtoAtivo?.id}
                        loading={loading}
                        emptyMessage="Nenhum produto cadastrado neste almoxarifado"
                    />
                </div>
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
                            Saldo
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

            {/* Modal Necessidades */}
            <ModalWrapper
                isOpen={modalNecessidades}
                onClose={() => { setModalNecessidades(false); setNecessidadeDetalhe(null); }}
                title="Necessidades"
                className="w-[700px] max-h-[80vh]"
            >
                <div className="max-h-[65vh] overflow-auto">
                    {necessidades.length === 0 ? (
                        <div className="text-center py-8 text-gray-500">
                            Nenhuma necessidade pendente.
                        </div>
                    ) : !necessidadeDetalhe ? (
                        /* Lista de produtos com necessidades */
                        <div className="space-y-2">
                            <p className="text-sm text-gray-500 mb-3">
                                Clique em um produto para ver os solicitantes:
                            </p>
                            {necessidades.map((n) => {
                                const pendente = n.totalSolicitado - n.totalAtendido;
                                if (pendente <= 0) return null;
                                return (
                                    <button
                                        key={n.produtoId}
                                        onClick={() => setNecessidadeDetalhe(n)}
                                        className="w-full cursor-pointer text-left p-3 bg-gray-50 rounded border hover:bg-blue-50 hover:border-blue-300 transition-colors flex justify-between items-center"
                                    >
                                        <div>
                                            <div className="font-bold text-gray-800 text-sm">{n.produtoDescricao}</div>
                                            <div className="text-xs text-gray-500">Cód: {n.produtoCodigo}</div>
                                        </div>
                                        <div className="text-right">
                                            <span className="bg-red-100 text-red-700 px-3 py-1 rounded-full font-bold text-sm">
                                                {pendente} pend.
                                            </span>
                                        </div>
                                    </button>
                                );
                            })}
                        </div>
                    ) : (
                        /* Detalhe: solicitantes do produto selecionado */
                        <div>
                            <div className="bg-gray-50 rounded p-3 border mb-4">
                                <p className="text-xs text-gray-500 font-bold uppercase">Produto</p>
                                <p className="font-bold text-gray-800">{necessidadeDetalhe.produtoDescricao}</p>
                                <p className="text-xs text-gray-500">Cód: {necessidadeDetalhe.produtoCodigo}</p>
                            </div>

                            <div className="space-y-3">
                                {necessidadeDetalhe.solicitacoes
                                    .filter(s => s.status === "pendente" || s.status === "parcial")
                                    .map((sol) => {
                                        const restante = sol.quantidade - sol.quantidadeAtendida;
                                        return (
                                            <div key={sol.id} className="border rounded-lg p-3 bg-white">
                                                <div className="flex justify-between items-start mb-2">
                                                    <div>
                                                        <div className="font-bold text-sm text-gray-800">
                                                            {sol.tecnico?.nome}
                                                        </div>
                                                        {sol.bemDescricao && (
                                                            <div className="mt-1 text-sm text-gray-800 font-bold">
                                                                Equipamento: {sol.bemDescricao}
                                                            </div>
                                                        )}
                                                        {sol.bemLocalizacao && (
                                                            <div className="text-xs text-gray-500">
                                                                Local: {sol.bemLocalizacao}
                                                            </div>
                                                        )}
                                                        {sol.centroCusto && (
                                                            <div className="text-xs text-gray-500">
                                                                C.C: {sol.centroCusto}
                                                            </div>
                                                        )}
                                                    </div>
                                                    <div className="text-right">
                                                        <span className={`px-2 py-0.5 rounded text-xs font-bold ${sol.status === "pendente" ? "bg-yellow-100 text-yellow-800" : "bg-blue-100 text-blue-800"}`}>
                                                            {sol.status === "pendente" ? "Pendente" : "Parcial"}
                                                        </span>
                                                    </div>
                                                </div>

                                                <div className="grid grid-cols-3 gap-2 text-center mb-3">
                                                    <div className="bg-gray-50 rounded p-2 border">
                                                        <div className="text-[10px] font-bold text-gray-400 uppercase">Solicitado</div>
                                                        <div className="text-lg font-bold text-gray-800">{sol.quantidade}</div>
                                                    </div>
                                                    <div className="bg-gray-50 rounded p-2 border">
                                                        <div className="text-[10px] font-bold text-gray-400 uppercase">Atendido</div>
                                                        <div className="text-lg font-bold text-green-600">{sol.quantidadeAtendida}</div>
                                                    </div>
                                                    <div className="bg-gray-50 rounded p-2 border">
                                                        <div className="text-[10px] font-bold text-gray-400 uppercase">Restante</div>
                                                        <div className="text-lg font-bold text-red-600">{restante}</div>
                                                    </div>
                                                </div>

                                                <div className="text-[10px] text-gray-400 mb-2">
                                                    {formatDate(sol.criadoEm)}
                                                </div>

                                                <div className="flex gap-2 items-center">
                                                    <Input
                                                        type="number"
                                                        min="1"
                                                        max={restante}
                                                        value={qtdAtender[sol.id] || ""}
                                                        onChange={(e) => setQtdAtender(prev => ({
                                                            ...prev,
                                                            [sol.id]: e.target.value
                                                        }))}
                                                        placeholder={`Qtd (max ${restante})`}
                                                        className="flex-1 text-center font-bold"
                                                    />
                                                    <Button
                                                        variant="primary"
                                                        className="px-4 py-2 text-xs whitespace-nowrap"
                                                        onClick={() => handleAtenderSolicitacao(sol.id, qtdAtender[sol.id])}
                                                    >
                                                        Atender
                                                    </Button>
                                                </div>
                                            </div>
                                        );
                                    })}
                            </div>
                        </div>
                    )}
                </div>
            </ModalWrapper>
        </div>
    );
}

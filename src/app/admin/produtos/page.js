"use client";

import { useEffect, useState } from "react";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";

export default function ProdutosPage() {
    const [produtos, setProdutos] = useState([]);
    const [filtered, setFiltered] = useState([]);
    const [search, setSearch] = useState("");
    const [formData, setFormData] = useState({ codigo: "", descricao: "" });
    const [loading, setLoading] = useState(false);
    const [page, setPage] = useState(1);
    const itemsPerPage = 50;
    const [isEditing, setIsEditing] = useState(false);

    useEffect(() => {
        fetchProdutos();
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

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            let res;
            if (isEditing) {
                // PUT espera um array para bulk update, mas serve para um só
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
                fetchProdutos();
            } else {
                alert("Erro ao salvar produto");
            }
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (codigo) => {
        if (!confirm("Tem certeza?")) return;
        await fetch(`/api/produtos?codigo=${codigo}`, { method: "DELETE" });
        fetchProdutos();
    };

    const handleEdit = (produto) => {
        setIsEditing(true);
        setFormData({
            codigo: produto.codigo,
            descricao: produto.descricao,
        });
        // Rola para o topo para ver o formulário
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const resetForm = () => {
        setIsEditing(false);
        setFormData({ codigo: "", descricao: "" });
    };

    const paginated = filtered.slice((page - 1) * itemsPerPage, page * itemsPerPage);
    const totalPages = Math.ceil(filtered.length / itemsPerPage);

    return (
        <div className="pb-20">
            <h2 className="text-2xl font-bold mb-6">Gerenciar Produtos</h2>

            {/* Form de Criação/Edição */}
            <div className="bg-white p-6 rounded-lg shadow-sm mb-8 border border-gray-100">
                <h3 className="text-lg font-semibold mb-4">{isEditing ? "Editar Produto" : "Novo Produto"}</h3>
                <form onSubmit={handleSubmit} className="flex gap-4 items-end">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Código</label>
                        <Input
                            value={formData.codigo}
                            onChange={(e) => setFormData({ ...formData, codigo: e.target.value.toUpperCase() })}
                            required
                            disabled={isEditing}
                            className={isEditing ? "bg-gray-100 cursor-not-allowed" : "w-[150px]"}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Descrição</label>
                        <Input
                            value={formData.descricao}
                            onChange={(e) => setFormData({ ...formData, descricao: e.target.value.toUpperCase() })}
                            required
                            className="w-full"
                        />
                    </div>
                    <div className="md:col-span-1 flex gap-2">
                        <Button type="submit" className="flex-1 bg-blue-600 hover:bg-blue-500 justify-center h-9 px-3" disabled={loading}>
                            {loading ? "Salvando..." : (isEditing ? "Atualizar" : "Cadastrar Produto")}
                        </Button>
                        {isEditing && (
                            <Button type="button" onClick={resetForm} variant="outline" className="h-10 px-4">
                                ✕
                            </Button>
                        )}
                    </div>
                </form>
            </div>

            {/* Buscador */}
            <div className="mb-4">
                <Input
                    placeholder="Buscar produto por código ou descrição..."
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    className="w-full max-w-md"
                />
            </div>

            {/* Lista de Produtos */}
            <div className="bg-white rounded-lg shadow-sm overflow-hidden border border-gray-100">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs text-black uppercase tracking-wider">Código</th>
                                <th className="px-6 py-3 text-left text-xs text-black uppercase tracking-wider">Descrição</th>
                                <th className="px-6 py-3 text-right text-xs text-black uppercase tracking-wider">Ações</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {paginated.map((p) => (
                                <tr key={p.id}>
                                    <td className="px-6 py-2 whitespace-nowrap text-sm font-medium text-gray-900">{p.codigo}</td>
                                    <td className="px-6 py-2 whitespace-nowrap text-sm text-gray-500">{p.descricao}</td>
                                    <td className="px-6 py-2 whitespace-nowrap text-right text-sm font-medium space-x-3">
                                        <button onClick={() => handleEdit(p)} className="border-2 border-primary3 h-[27px] rounded text-primary3 px-2 buttonHover2">Editar</button>
                                        <button onClick={() => handleDelete(p.codigo)} className="text-red-600 hover:text-red-900">Excluir</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Paginação */}
                <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
                    <span className="text-sm text-gray-600">
                        Mostrando {paginated.length} de {filtered.length} produtos
                    </span>
                    <div className="flex space-x-2">
                        <Button
                            variant="outline"
                            disabled={page === 1}
                            onClick={() => setPage(p => p - 1)}
                        >
                            Anterior
                        </Button>
                        <div className="flex items-center px-4">
                            Página {page} de {totalPages}
                        </div>
                        <Button
                            variant="outline"
                            disabled={page >= totalPages}
                            onClick={() => setPage(p => p + 1)}
                        >
                            Próxima
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}

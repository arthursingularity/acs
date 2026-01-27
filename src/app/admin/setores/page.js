"use client";

import { useEffect, useState } from "react";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";

export default function SetoresPage() {
    const [setores, setSetores] = useState([]);
    const [formData, setFormData] = useState({
        centroCusto: "",
        descricao: "",
        almoxarifado: "",
    });
    const [loading, setLoading] = useState(false);
    const [isEditing, setIsEditing] = useState(false);

    useEffect(() => {
        fetchSetores();
        document.title = "Gerenciar Setores - Admin";
    }, []);

    const fetchSetores = async () => {
        const res = await fetch("/api/setores");
        if (res.ok) setSetores(await res.json());
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
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
                fetchSetores();
            } else {
                alert("Erro ao salvar setor");
            }
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (centroCusto) => {
        if (!confirm("Tem certeza? Isso apagará todos os endereços deste setor!")) return;
        await fetch(`/api/setores/${centroCusto}`, { method: "DELETE" });
        fetchSetores();
    };

    const handleEdit = (setor) => {
        setIsEditing(true);
        setFormData({
            centroCusto: setor.centroCusto,
            descricao: setor.descricao,
            almoxarifado: setor.almoxarifado,
        });
    };

    const resetForm = () => {
        setIsEditing(false);
        setFormData({ centroCusto: "", descricao: "", almoxarifado: "" });
    };

    return (
        <div>
            <h2 className="text-2xl font-bold mb-6">Gerenciar Setores</h2>

            {/* Form de Criação/Edição */}
            <div className="bg-white p-6 rounded-lg shadow-sm mb-8 border border-gray-100">
                <h3 className="text-lg font-semibold mb-4">{isEditing ? "Editar Setor" : "Novo Setor"}</h3>
                <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Centro de Custo</label>
                        <Input
                            value={formData.centroCusto}
                            onChange={(e) => setFormData({ ...formData, centroCusto: e.target.value })}
                            required
                            disabled={isEditing}
                            className={isEditing ? "bg-gray-100 cursor-not-allowed" : ""}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Descrição</label>
                        <Input
                            value={formData.descricao}
                            onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Almoxarifado</label>
                        <Input
                            value={formData.almoxarifado}
                            onChange={(e) => setFormData({ ...formData, almoxarifado: e.target.value })}
                            required
                        />
                    </div>
                    <div className="md:col-span-1 flex gap-2">
                        <Button type="submit" className="flex-1 bg-blue-600 hover:bg-blue-500 justify-center h-10" disabled={loading}>
                            {loading ? "Salvando..." : (isEditing ? "Atualizar" : "Criar Setor")}
                        </Button>
                        {isEditing && (
                            <Button type="button" onClick={resetForm} variant="outline" className="h-10 px-4">
                                ✕
                            </Button>
                        )}
                    </div>
                </form>
            </div>

            {/* Lista de Setores */}
            <div className="bg-white rounded-lg shadow-sm overflow-hidden border border-gray-100">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Centro de Custo</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Descrição</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Almoxarifado</th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Ações</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {setores.map((setor) => (
                            <tr key={setor.id}>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{setor.centroCusto}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{setor.descricao}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{setor.almoxarifado}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-3">
                                    <button onClick={() => handleEdit(setor)} className="text-blue-600 hover:text-blue-900">Editar</button>
                                    <button onClick={() => handleDelete(setor.centroCusto)} className="text-red-600 hover:text-red-900">Excluir</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

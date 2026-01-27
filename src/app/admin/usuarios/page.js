"use client";

import { useEffect, useState } from "react";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";

export default function UsersPage() {
    const [users, setUsers] = useState([]);
    const [formData, setFormData] = useState({
        username: "",
        password: "",
        name: "",
        role: "user",
    });
    const [loading, setLoading] = useState(false);
    const [editingId, setEditingId] = useState(null);

    useEffect(() => {
        fetchUsers();
        document.title = "Gerenciar Usuários - Admin";
    }, []);

    const fetchUsers = async () => {
        const res = await fetch("/api/users");
        if (res.ok) setUsers(await res.json());
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        const method = editingId ? "PUT" : "POST";
        const body = editingId ? { ...formData, id: editingId } : formData;

        try {
            const res = await fetch("/api/users", {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(body),
            });
            if (res.ok) {
                resetForm();
                fetchUsers();
            } else {
                alert("Erro ao salvar usuário");
            }
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (!confirm("Tem certeza?")) return;
        await fetch(`/api/users?id=${id}`, { method: "DELETE" });
        fetchUsers();
    };

    const handleEdit = (user) => {
        setEditingId(user.id);
        setFormData({
            username: user.username,
            password: "", // Senha vazia para não alterar, a menos que digite
            name: user.name || "",
            role: user.role,
        });
    };

    const resetForm = () => {
        setEditingId(null);
        setFormData({ username: "", password: "", name: "", role: "user" });
    };

    return (
        <div>
            <h2 className="text-2xl font-bold mb-6">Gerenciar Usuários</h2>

            {/* Form de Criação/Edição */}
            <div className="bg-white p-6 rounded-lg shadow-sm mb-8 border border-gray-100">
                <h3 className="text-lg font-semibold mb-4">{editingId ? "Editar Usuário" : "Novo Usuário"}</h3>
                <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Nome</label>
                        <Input
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Usuário</label>
                        <Input
                            value={formData.username}
                            onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            {editingId ? "Nova Senha (opcional)" : "Senha"}
                        </label>
                        <Input
                            type="password"
                            value={formData.password}
                            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                            required={!editingId}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Nível</label>
                        <select
                            value={formData.role}
                            onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                            className="w-full h-10 px-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="user">Usuário</option>
                            <option value="admin">Administrador</option>
                        </select>
                    </div>
                    <div className="md:col-span-1 flex gap-2">
                        <Button type="submit" className="flex-1 bg-green-600 hover:bg-green-500 justify-center h-10" disabled={loading}>
                            {loading ? "Salvando..." : (editingId ? "Atualizar" : "Criar")}
                        </Button>
                        {editingId && (
                            <Button type="button" onClick={resetForm} variant="outline" className="h-10 px-4">
                                ✕
                            </Button>
                        )}
                    </div>
                </form>
            </div>

            {/* Lista de Usuários */}
            <div className="bg-white rounded-lg shadow-sm overflow-hidden border border-gray-100">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nome</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Usuário</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nível</th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Ações</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {users.map((user) => (
                            <tr key={user.id}>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{user.name}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{user.username}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${user.role === 'admin' ? 'bg-purple-100 text-purple-800' : 'bg-green-100 text-green-800'}`}>
                                        {user.role}
                                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-3">
                                    <button onClick={() => handleEdit(user)} className="text-blue-600 hover:text-blue-900">Editar</button>
                                    <button onClick={() => handleDelete(user.id)} className="text-red-600 hover:text-red-900">Excluir</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

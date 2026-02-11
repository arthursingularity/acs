"use client";

import { useEffect, useState } from "react";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";
import DataTable from "../../components/ui/DataTable";

export default function UsersPage() {
    const [users, setUsers] = useState([]);
    const [requests, setRequests] = useState([]);

    // Form Usuários
    const [formData, setFormData] = useState({
        username: "",
        password: "",
        name: "",
        role: "user",
    });
    const [loading, setLoading] = useState(false);
    const [editingId, setEditingId] = useState(null);

    useEffect(() => {
        fetchData();
        document.title = "Gerenciar Usuários";
    }, []);

    const fetchData = async () => {
        await Promise.all([fetchUsers(), fetchRequests()]);
    };

    const fetchUsers = async () => {
        const res = await fetch("/api/users");
        if (res.ok) setUsers(await res.json());
    };

    const fetchRequests = async () => {
        const res = await fetch("/api/auth/register-request");
        if (res.ok) setRequests(await res.json());
    };

    // --- Gestão de Usuários ---

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
        if (!confirm("Tem certeza que deseja excluir este usuário?")) return;
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

    // --- Gestão de Solicitações ---

    const handleApprove = async (reqId) => {
        if (!confirm("Aprovar solicitação e criar usuário?")) return;
        try {
            const res = await fetch("/api/auth/register-request", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ id: reqId }),
            });
            if (res.ok) {
                fetchData(); // Atualiza users e requests
            } else {
                alert("Erro ao aprovar solicitação");
            }
        } catch (error) {
            console.error(error);
        }
    };

    const handleReject = async (reqId) => {
        if (!confirm("Recusar solicitação?")) return;
        try {
            const res = await fetch(`/api/auth/register-request?id=${reqId}`, { method: "DELETE" });
            if (res.ok) {
                fetchRequests();
            } else {
                alert("Erro ao recusar solicitação");
            }
        } catch (error) {
            console.error(error);
        }
    };

    return (
        <div>
            <h2 className="text-2xl font-bold mb-6">Gerenciar Usuários</h2>

            {/* Seção de Solicitações Pendentes */}
            {requests.length > 0 && (
                <div className="mb-8">
                    <div className="bg-white border border-gray-200 rounded-lg p-4 mb-4">
                        <h3 className="font-bold mb-2">Solicitações de Cadastro Pendentes</h3>
                        <div className="bg-white rounded border border-gray-300 overflow-hidden">
                            <table
                                className="w-full border-collapse text-[12px]"
                                style={{ fontFamily: "Segoe UI, Tahoma, sans-serif" }}
                            >
                                <thead className="datatable-thead">
                                    <tr className="bg-[#E5E5E5] ">
                                        <th className="px-2 py-1 text-left font-bold text-black whitespace-nowrap">Nome</th>
                                        <th className="px-2 py-1 text-left font-bold text-black whitespace-nowrap">Usuário</th>
                                        <th className="px-2 py-1 text-left font-bold text-black whitespace-nowrap">Data da Solicitação</th>
                                        <th className="px-2 py-1 text-left font-bold text-black whitespace-nowrap">Ações</th>
                                    </tr>
                                </thead>
                                <tbody className="">
                                    {requests.map((req) => (
                                        <tr key={req.id} className="border-b font-medium text-[12px] border-[#ddd] cursor-pointer buttonHover bg-white">
                                            <td className="px-2 border-r border-[#CCCCCC] text-black whitespace-nowrap">{req.name}</td>
                                            <td className="px-2 border-r border-[#CCCCCC] text-black whitespace-nowrap">{req.username}</td>
                                            <td className="px-2 border-r border-[#CCCCCC] text-black whitespace-nowrap">
                                                {new Date(req.createdAt).toLocaleDateString('pt-BR')}
                                            </td>
                                            <td className="px-2 border-r border-[#CCCCCC] text-black whitespace-nowrap">
                                                <button
                                                    onClick={() => handleApprove(req.id)}
                                                    className="text-white cursor-pointer bg-primary3 buttonHover px-2 py-[3px] rounded text-xs font-bold transition-colors"
                                                >
                                                    Aceitar
                                                </button>
                                                <button
                                                    onClick={() => handleReject(req.id)}
                                                    className="text-red-500 cursor-pointer px-3 py-1 text-xs buttonHover font-bold"
                                                >
                                                    Recusar
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}

            {/* Form de Criação/Edição */}
            <div className="bg-white p-6 rounded-lg mb-8 border border-gray-200">
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
            <div className="bg-white rounded-lg overflow-hidden border border-gray-300">
                <DataTable
                    data={users}
                    columns={[
                        { key: "name", label: "Nome" },
                        { key: "username", label: "Usuário" },
                        {
                            key: "role",
                            label: "Nível",
                            render: (val) => (
                                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${val === 'admin' ? 'text-purple-800' : 'text-green-600'}`}>
                                    {val}
                                </span>
                            )
                        },
                        {
                            key: "id",
                            label: "Ações",
                            render: (val, row) => (
                                <div className="text-left space-x-3">
                                    <button onClick={(e) => { e.stopPropagation(); handleEdit(row); }} className="text-blue-600 hover:text-blue-900">Editar</button>
                                    <button onClick={(e) => { e.stopPropagation(); handleDelete(row.id); }} className="text-red-600 hover:text-red-900">Excluir</button>
                                </div>
                            )
                        }
                    ]}
                />
            </div>
        </div>
    );
}

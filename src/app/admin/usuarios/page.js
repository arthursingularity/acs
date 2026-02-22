"use client";

import { useEffect, useState } from "react";
import ModalWrapper from "../../components/ui/ModalWrapper";
import Input from "../../components/ui/Input";
import DataTable from "../../components/ui/DataTable";
import NavBarButton from "../../components/ui/NavBarButton";

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
    const [modalAberto, setModalAberto] = useState(false);
    const [userSelecionado, setUserSelecionado] = useState(null);

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

    const handleSubmit = async () => {
        if (!formData.username || !formData.name || (!editingId && !formData.password)) {
            alert("Preencha todos os campos obrigatórios");
            return;
        }
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
                setModalAberto(false);
                fetchUsers();
            } else {
                alert("Erro ao salvar usuário");
            }
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async () => {
        if (!userSelecionado) {
            alert("Selecione um usuário para excluir");
            return;
        }
        if (!confirm("Tem certeza que deseja excluir este usuário?")) return;
        await fetch(`/api/users?id=${userSelecionado.id}`, { method: "DELETE" });
        setUserSelecionado(null);
        fetchUsers();
    };

    const handleIncluir = () => {
        resetForm();
        setModalAberto(true);
    };

    const handleEditar = () => {
        if (!userSelecionado) {
            alert("Selecione um usuário para alterar");
            return;
        }
        setEditingId(userSelecionado.id);
        setFormData({
            username: userSelecionado.username,
            password: "",
            name: userSelecionado.name || "",
            role: userSelecionado.role,
        });
        setModalAberto(true);
    };

    const resetForm = () => {
        setEditingId(null);
        setFormData({ username: "", password: "", name: "", role: "user" });
    };

    const handleSelectUser = (user) => {
        if (userSelecionado?.id === user.id) {
            setUserSelecionado(null);
        } else {
            setUserSelecionado(user);
        }
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
                fetchData();
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

    const getRoleBadge = (role) => {
        if (role === "admin") {
            return <span className="py-0.5 rounded-full text-[10px] text-purple-700">ADMIN</span>;
        }
        return <span className="py-0.5 rounded-full text-[10px] text-green-700">USUÁRIO</span>;
    };

    return (
        <div className="flex flex-col h-full">
            {/* Seção de Solicitações Pendentes */}
            {requests.length > 0 && (
                <div className="bg-yellow-50 border-b border-primary3">
                    <div className="bg-blackGradient px-3 py-1 text-[11px] font-bold text-white">
                        SOLICITAÇÕES DE CADASTRO PENDENTES ({requests.length})
                    </div>
                    <div className="overflow-hidden">
                        <table
                            className="w-full border-collapse text-[12px]"
                            style={{ fontFamily: "Segoe UI, Tahoma, sans-serif" }}
                        >
                            <thead className="datatable-thead">
                                <tr className="bg-[#E5E5E5]">
                                    <th className="px-2 py-1 text-left font-bold text-black whitespace-nowrap">Nome</th>
                                    <th className="px-2 py-1 text-left font-bold text-black whitespace-nowrap">Usuário</th>
                                    <th className="px-2 py-1 text-left font-bold text-black whitespace-nowrap">Data</th>
                                    <th className="px-2 py-1 text-left font-bold text-black whitespace-nowrap">Ações</th>
                                </tr>
                            </thead>
                            <tbody>
                                {requests.map((req) => (
                                    <tr key={req.id} className="border-b font-medium text-[12px] border-[#ddd] bg-white">
                                        <td className="px-2 border-r border-[#CCCCCC] text-black whitespace-nowrap">{req.name}</td>
                                        <td className="px-2 border-r border-[#CCCCCC] text-black whitespace-nowrap">{req.username}</td>
                                        <td className="px-2 border-r border-[#CCCCCC] text-black whitespace-nowrap">
                                            {new Date(req.createdAt).toLocaleDateString('pt-BR')}
                                        </td>
                                        <td className="px-2 border-r border-[#CCCCCC] text-black whitespace-nowrap space-x-2">
                                            <button
                                                onClick={() => handleApprove(req.id)}
                                                className="border-2 border-primary3 h-[20px] rounded bg-primary3 text-white px-2 text-[10px] font-bold hover:brightness-110 cursor-pointer transition-all"
                                            >
                                                Aceitar
                                            </button>
                                            <button
                                                onClick={() => handleReject(req.id)}
                                                className="border-2 border-red-500 h-[20px] rounded text-red-500 px-2 text-[10px] font-bold hover:bg-red-50 cursor-pointer transition-colors"
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
            )}

            {/* Barra de Ferramentas - estilo ERP */}
            <div className="bg-white h-[24px] font-bold tracking-wide flex items-center justify-between text-[11px] border-b border-gray-300">
                <div className="flex items-center">
                    <NavBarButton onClick={handleIncluir}>Incluir</NavBarButton>
                    <NavBarButton onClick={handleEditar}>Alterar</NavBarButton>
                    <NavBarButton onClick={handleDelete}>Excluir</NavBarButton>
                    <NavBarButton onClick={fetchData}>Atualizar</NavBarButton>
                </div>

                <div className="flex items-center pr-3">
                    <span className="text-[11px] text-gray-500 font-medium">{users.length} usuário(s)</span>
                </div>
            </div>

            {/* Tabela de Dados - estilo ERP */}
            <div className="tabelaNova flex-1 overflow-hidden mt-[3px]">
                <DataTable
                    data={users}
                    selectedId={userSelecionado?.id}
                    onSelect={handleSelectUser}
                    onDoubleClick={(user) => {
                        setEditingId(user.id);
                        setFormData({
                            username: user.username,
                            password: "",
                            name: user.name || "",
                            role: user.role,
                        });
                        setModalAberto(true);
                    }}
                    columns={[
                        { key: "name", label: "Nome" },
                        { key: "username", label: "Usuário" },
                        {
                            key: "role",
                            label: "Nível",
                            render: (val) => getRoleBadge(val)
                        },
                    ]}
                />
            </div>

            {/* Modal Cadastro/Edição - estilo ERP */}
            <ModalWrapper
                isOpen={modalAberto}
                onClose={() => { setModalAberto(false); resetForm(); }}
                title={editingId ? "Alterar Usuário" : "Incluir Usuário"}
                className="w-[450px]"
            >
                <div className="space-y-3">
                    <div>
                        <label className="block text-[11px] font-bold text-gray-600 mb-0.5">
                            Nome *
                        </label>
                        <Input
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            placeholder="NOME COMPLETO"
                            className="w-full h-[28px] text-[12px]"
                        />
                    </div>
                    <div>
                        <label className="block text-[11px] font-bold text-gray-600 mb-0.5">
                            Usuário *
                        </label>
                        <Input
                            value={formData.username}
                            onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                            placeholder="NOME DE USUÁRIO"
                            className="w-full h-[28px] text-[12px]"
                        />
                    </div>
                    <div>
                        <label className="block text-[11px] font-bold text-gray-600 mb-0.5">
                            {editingId ? "Nova Senha (opcional)" : "Senha *"}
                        </label>
                        <Input
                            type="password"
                            value={formData.password}
                            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                            placeholder={editingId ? "DEIXE VAZIO PARA MANTER" : "SENHA"}
                            className="w-full h-[28px] text-[12px]"
                            uppercase={false}
                        />
                    </div>
                    <div>
                        <label className="block text-[11px] font-bold text-gray-600 mb-0.5">
                            Nível
                        </label>
                        <select
                            value={formData.role}
                            onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                            className="w-full border border-gray-300 rounded h-[28px] px-2 text-[12px] outline-none focus:border-primary3 bg-white uppercase"
                        >
                            <option value="user">USUÁRIO</option>
                            <option value="admin">ADMINISTRADOR</option>
                        </select>
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
                            {loading ? "Salvando..." : (editingId ? "Salvar" : "Cadastrar")}
                        </button>
                    </div>
                </div>
            </ModalWrapper>
        </div>
    );
}

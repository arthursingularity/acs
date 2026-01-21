"use client";

import { useRouter } from "next/navigation";
import { SETORES_DB } from "./components/system/Database";

export default function Home() {
  const router = useRouter();

  return (
    <div className="p-6 space-y-4">
      <h1 className="text-xl font-bold">Selecione o setor</h1>

      {SETORES_DB.map((setor) => (
        <button
          key={setor.centroCusto}
          onClick={() => router.push(`/${setor.centroCusto}`)}
          className="block border p-3 rounded hover:bg-gray-100"
        >
          <strong>{setor.descricao}</strong>
          <div>C. Custo: {setor.centroCusto}</div>
          <div>Almox: {setor.almoxarifado}</div>
        </button>
      ))}
    </div>
  );
}

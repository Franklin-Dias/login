import React, { useState, useEffect } from "react";
import { FaTrash } from "react-icons/fa";
import "./CadastroConjunto.css";

const CadastroConjunto = ({ onCancel }) => {
  // Carrega dados do localStorage
  const [conjuntos, setConjuntos] = useState(() =>
    JSON.parse(localStorage.getItem("conjuntos") || "[]")
  );

  const [formData, setFormData] = useState({
    placaCavalo: "",
    placaCarreta: "",
    motoristaTitular: "",
  });

  // Salva conjuntos no localStorage sempre que houver alteração
  useEffect(() => {
    localStorage.setItem("conjuntos", JSON.stringify(conjuntos));
  }, [conjuntos]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name.includes("placa") ? value.toUpperCase() : value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!formData.placaCavalo || !formData.motoristaTitular) {
      alert("Por favor, selecione pelo menos o Cavalo e o Motorista.");
      return;
    }

    // Verifica se já existe um conjunto com este cavalo
    const existe = conjuntos.some(
      (c) => c.placaCavalo === formData.placaCavalo
    );
    if (existe) {
      alert("Já existe um conjunto formado com este cavalo.");
      return;
    }

    // 1. Cria o objeto do Conjunto
    const novoConjunto = {
      id: Date.now(),
      ...formData,
    };

    // Atualiza a lista de conjuntos
    setConjuntos([...conjuntos, novoConjunto]);

    // --- INTEGRAÇÃO COM LISTA DE DESCARGA ---
    // Adiciona automaticamente à lista de descarga com status "Disponível"
    const listaDescargaAtual = JSON.parse(
      localStorage.getItem("listaDescarga") || "[]"
    );

    const novoItemDescarga = {
      id: Date.now() + 1, // ID único (diferente do conjunto)
      dataHora: new Date().toISOString(),
      placa: formData.placaCavalo,
      placaCarreta: formData.placaCarreta,
      motorista: formData.motoristaTitular,
      gestor: "",
      cliente: "",
      status: "Disponível", // Status solicitado
    };

    const novaListaDescarga = [...listaDescargaAtual, novoItemDescarga];
    localStorage.setItem("listaDescarga", JSON.stringify(novaListaDescarga));

    // Dispara evento para atualizar outros componentes se necessário
    window.dispatchEvent(new Event("storage"));
    // ----------------------------------------

    alert("Conjunto criado e adicionado à Lista de Descarga como Disponível!");
    setFormData({ placaCavalo: "", placaCarreta: "", motoristaTitular: "" });
  };

  const handleDelete = (id) => {
    if (window.confirm("Deseja desfazer este conjunto?")) {
      setConjuntos(conjuntos.filter((c) => c.id !== id));
    }
  };

  return (
    <div className="cadastro-container">
      <h2>Formação de Conjunto</h2>
      <form onSubmit={handleSubmit} className="cadastro-form">
        <div className="form-group">
          <label>Cavalo / Truck</label>
          <input
            type="text"
            name="placaCavalo"
            value={formData.placaCavalo}
            onChange={handleChange}
            placeholder="Digite a placa (Ex: ABC-1234)"
            maxLength="8"
            required
          />
        </div>

        <div className="form-group">
          <label>Carreta (Opcional)</label>
          <input
            type="text"
            name="placaCarreta"
            value={formData.placaCarreta}
            onChange={handleChange}
            placeholder="Digite a placa da carreta"
            maxLength="8"
          />
        </div>

        <div className="form-group">
          <label>Motorista Titular</label>
          <input
            type="text"
            name="motoristaTitular"
            value={formData.motoristaTitular}
            onChange={handleChange}
            placeholder="Nome do Motorista"
            required
          />
        </div>

        <div className="form-actions">
          <button type="button" className="btn-cancel" onClick={onCancel}>
            Cancelar
          </button>
          <button type="submit" className="btn-save">
            Salvar Conjunto
          </button>
        </div>
      </form>

      <div className="list-container">
        <h3>Conjuntos Formados</h3>
        <table className="list-table">
          <thead>
            <tr>
              <th>Cavalo</th>
              <th>Carreta</th>
              <th>Motorista</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {conjuntos.length > 0 ? (
              conjuntos.map((c) => (
                <tr key={c.id}>
                  <td>{c.placaCavalo}</td>
                  <td>{c.placaCarreta || "-"}</td>
                  <td>{c.motoristaTitular}</td>
                  <td>
                    <button
                      className="btn-delete"
                      onClick={() => handleDelete(c.id)}
                      title="Excluir Conjunto"
                    >
                      <FaTrash />
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="4" style={{ textAlign: "center" }}>
                  Nenhum conjunto formado.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default CadastroConjunto;

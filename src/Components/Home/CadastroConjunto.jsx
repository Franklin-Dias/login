import React, { useState, useEffect } from "react";
import { FaTrash } from "react-icons/fa";
import "./CadastroConjunto.css";

const CadastroConjunto = ({ onCancel }) => {
  const [conjuntos, setConjuntos] = useState(() => {
    const saved = localStorage.getItem("conjuntos");
    return saved ? JSON.parse(saved) : [];
  });

  const [formData, setFormData] = useState({
    placaCavalo: "",
    placaCarreta: "",
    motoristaTitular: "",
  });

  useEffect(() => {
    localStorage.setItem("conjuntos", JSON.stringify(conjuntos));
  }, [conjuntos]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevState) => ({
      ...prevState,
      [name]: name.startsWith("placa") ? value.toUpperCase() : value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (
      !formData.placaCavalo ||
      !formData.placaCarreta ||
      !formData.motoristaTitular
    ) {
      alert("Por favor, preencha todos os campos.");
      return;
    }
    const novoConjunto = {
      id: Date.now(),
      ...formData,
    };
    setConjuntos((prevConjuntos) => [...prevConjuntos, novoConjunto]);
    alert("Conjunto cadastrado com sucesso!");
    // Reset form
    setFormData({
      placaCavalo: "",
      placaCarreta: "",
      motoristaTitular: "",
    });
  };

  const handleDelete = (id) => {
    if (window.confirm("Tem certeza que deseja excluir este conjunto?")) {
      setConjuntos((prevConjuntos) => prevConjuntos.filter((c) => c.id !== id));
    }
  };

  return (
    <div className="cadastro-container">
      <h2>Cadastro de Conjunto</h2>
      <form onSubmit={handleSubmit} className="cadastro-form">
        <div className="form-group">
          <label htmlFor="placaCavalo">Placa do Cavalo</label>
          <input
            type="text"
            id="placaCavalo"
            name="placaCavalo"
            value={formData.placaCavalo}
            onChange={handleChange}
            required
            placeholder="AAA-0A00"
            maxLength="8"
          />
        </div>

        <div className="form-group">
          <label htmlFor="placaCarreta">Placa da Carreta</label>
          <input
            type="text"
            id="placaCarreta"
            name="placaCarreta"
            value={formData.placaCarreta}
            onChange={handleChange}
            required
            placeholder="BBB-1B11"
            maxLength="8"
          />
        </div>

        <div className="form-group">
          <label htmlFor="motoristaTitular">Motorista Titular</label>
          <input
            type="text"
            id="motoristaTitular"
            name="motoristaTitular"
            value={formData.motoristaTitular}
            onChange={handleChange}
            required
            placeholder="Digite o nome do motorista"
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
        <h3>Conjuntos Cadastrados</h3>
        <table className="list-table">
          <thead>
            <tr>
              <th>Cavalo</th>
              <th>Carreta</th>
              <th>Motorista Titular</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {conjuntos.length > 0 ? (
              conjuntos.map((conjunto) => (
                <tr key={conjunto.id}>
                  <td>{conjunto.placaCavalo}</td>
                  <td>{conjunto.placaCarreta}</td>
                  <td>{conjunto.motoristaTitular}</td>
                  <td>
                    <button
                      className="btn-delete"
                      onClick={() => handleDelete(conjunto.id)}
                      title="Excluir"
                    >
                      <FaTrash />
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="4" style={{ textAlign: "center" }}>
                  Nenhum conjunto cadastrado.
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

import React, { useState, useEffect } from "react";
import { FaTrash } from "react-icons/fa";
import "./CadastroVeiculo.css";

const CadastroVeiculo = ({ onCancel }) => {
  // Estado para a lista de veículos
  const [veiculos, setVeiculos] = useState(() => {
    const saved = localStorage.getItem("veiculos");
    return saved ? JSON.parse(saved) : [];
  });

  // Estado para o formulário
  const [formData, setFormData] = useState({
    placa: "",
    modelo: "",
    ano: "",
    tipo: "",
    latitude: "",
    longitude: "",
  });

  // Salva no localStorage sempre que a lista de veículos mudar
  useEffect(() => {
    localStorage.setItem("veiculos", JSON.stringify(veiculos));
  }, [veiculos]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevState) => ({
      ...prevState,
      // Converte a placa para maiúsculas automaticamente
      [name]: name === "placa" ? value.toUpperCase() : value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (
      !formData.placa ||
      !formData.modelo ||
      !formData.ano ||
      !formData.tipo
    ) {
      alert("Por favor, preencha todos os campos.");
      return;
    }

    // Verifica se a placa já existe
    if (veiculos.some((v) => v.placa === formData.placa)) {
      alert("Esta placa já está cadastrada!");
      return;
    }

    const novoVeiculo = { ...formData, id: Date.now() };
    setVeiculos([...veiculos, novoVeiculo]);

    alert("Veículo cadastrado com sucesso!");
    setFormData({ placa: "", modelo: "", ano: "", tipo: "" });
  };

  const handleDelete = (id) => {
    if (window.confirm("Tem certeza que deseja excluir este veículo?")) {
      setVeiculos(veiculos.filter((v) => v.id !== id));
    }
  };

  return (
    <div className="cadastro-container">
      <h2>Cadastro de Veículo</h2>
      <form onSubmit={handleSubmit} className="cadastro-form">
        <div className="form-group">
          <label htmlFor="placa">Placa</label>
          <input
            type="text"
            id="placa"
            name="placa"
            value={formData.placa}
            onChange={handleChange}
            placeholder="ABC-1234"
            maxLength="8"
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="tipo">Tipo de Veículo</label>
          <select
            id="tipo"
            name="tipo"
            value={formData.tipo}
            onChange={handleChange}
            required
          >
            <option value="">Selecione...</option>
            <option value="Cavalo">Cavalo</option>
            <option value="Carreta">Carreta</option>
            <option value="Truck">Truck</option>
          </select>
        </div>
        <div className="form-group">
          <label htmlFor="modelo">Modelo</label>
          <input
            type="text"
            id="modelo"
            name="modelo"
            value={formData.modelo}
            onChange={handleChange}
            placeholder="Ex: Scania R450"
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="ano">Ano</label>
          <input
            type="number"
            id="ano"
            name="ano"
            value={formData.ano}
            onChange={handleChange}
            placeholder="2024"
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="latitude">Latitude</label>
          <input
            type="text"
            id="latitude"
            name="latitude"
            value={formData.latitude}
            onChange={handleChange}
            placeholder="Ex: -19.9191"
          />
        </div>
        <div className="form-group">
          <label htmlFor="longitude">Longitude</label>
          <input
            type="text"
            id="longitude"
            name="longitude"
            value={formData.longitude}
            onChange={handleChange}
            placeholder="Ex: -43.9386"
          />
        </div>
        <div className="form-actions">
          <button type="button" className="btn-cancel" onClick={onCancel}>
            Cancelar
          </button>
          <button type="submit" className="btn-save">
            Salvar Veículo
          </button>
        </div>
      </form>

      <div className="lista-veiculos">
        <h3>Veículos Cadastrados</h3>
        <table className="veiculos-table-cadastro">
          <thead>
            <tr>
              <th>Placa</th>
              <th>Tipo</th>
              <th>Modelo</th>
              <th>Ano</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {veiculos.length > 0 ? (
              veiculos.map((veiculo) => (
                <tr key={veiculo.id}>
                  <td>{veiculo.placa}</td>
                  <td>{veiculo.tipo}</td>
                  <td>{veiculo.modelo}</td>
                  <td>{veiculo.ano}</td>
                  <td>
                    <button
                      className="btn-delete"
                      onClick={() => handleDelete(veiculo.id)}
                      title="Excluir"
                    >
                      <FaTrash />
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan="5"
                  style={{ textAlign: "center", padding: "15px" }}
                >
                  Nenhum veículo cadastrado.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default CadastroVeiculo;

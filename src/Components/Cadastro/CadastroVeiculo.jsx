import { useState } from "react";
import "./CadastroVeiculos.css";

function CadastroVeiculo() {
  const [placa, setPlaca] = useState("");
  const [modelo, setModelo] = useState("");
  const [ano, setAno] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    // Aqui você enviaria os dados para o backend ou salvaria no estado global
    console.log("Veículo Cadastrado:", { placa, modelo, ano });
    alert("Veículo cadastrado com sucesso!");
  };

  return (
    <div className="cadastro-container">
      <h1>Cadastro de Veículo</h1>
      <form onSubmit={handleSubmit} className="cadastro-form">
        <div className="input-group">
          <label>Placa</label>
          <input
            type="text"
            placeholder="ABC-1234"
            value={placa}
            onChange={(e) => setPlaca(e.target.value)}
            required
          />
        </div>
        <div className="input-group">
          <label>Modelo</label>
          <input
            type="text"
            placeholder="Ex: Volvo FH 540"
            value={modelo}
            onChange={(e) => setModelo(e.target.value)}
            required
          />
        </div>
        <div className="input-group">
          <label>Ano</label>
          <input
            type="number"
            placeholder="Ex: 2023"
            value={ano}
            onChange={(e) => setAno(e.target.value)}
            required
          />
        </div>
        <button type="submit">Salvar</button>
      </form>
    </div>
  );
}

export default CadastroVeiculo;

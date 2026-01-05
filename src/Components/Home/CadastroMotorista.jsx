import React, { useState } from "react";
import "./CadastroMotorista.css";

const CadastroMotorista = ({ onCancel }) => {
  const [formData, setFormData] = useState({
    nome: "",
    cpf: "",
    celular: "",
    filial: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    let newValue = value;

    if (name === "cpf") {
      newValue = newValue.replace(/\D/g, "").slice(0, 11);
      newValue = newValue.replace(/(\d{3})(\d)/, "$1.$2");
      newValue = newValue.replace(/(\d{3})(\d)/, "$1.$2");
      newValue = newValue.replace(/(\d{3})(\d{1,2})$/, "$1-$2");
    } else if (name === "celular") {
      newValue = newValue.replace(/\D/g, "").slice(0, 11);
      newValue = newValue.replace(/^(\d{2})(\d)/g, "($1) $2");
      newValue = newValue.replace(/(\d{5})(\d)/, "$1-$2");
    }

    setFormData((prevState) => ({
      ...prevState,
      [name]: newValue,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // Salvar no localStorage
    const motoristasSalvos = JSON.parse(
      localStorage.getItem("motoristas") || "[]"
    );
    const novoMotorista = { ...formData, id: Date.now() };
    localStorage.setItem(
      "motoristas",
      JSON.stringify([...motoristasSalvos, novoMotorista])
    );

    alert("Motorista cadastrado com sucesso!");
    if (onCancel) onCancel();
  };

  return (
    <div className="cadastro-container">
      <h2>Cadastro de Motorista</h2>
      <form onSubmit={handleSubmit} className="cadastro-form">
        <div className="form-group">
          <label htmlFor="nome">Nome Completo</label>
          <input
            type="text"
            id="nome"
            name="nome"
            value={formData.nome}
            onChange={handleChange}
            required
            placeholder="Digite o nome do motorista"
          />
        </div>

        <div className="form-group">
          <label htmlFor="cpf">CPF</label>
          <input
            type="text"
            id="cpf"
            name="cpf"
            value={formData.cpf}
            onChange={handleChange}
            required
            maxLength="14"
            placeholder="000.000.000-00"
          />
        </div>

        <div className="form-group">
          <label htmlFor="celular">Número de Celular</label>
          <input
            type="tel"
            id="celular"
            name="celular"
            value={formData.celular}
            onChange={handleChange}
            required
            maxLength="15"
            placeholder="(00) 00000-0000"
          />
        </div>

        <div className="form-group">
          <label htmlFor="filial">Filial de Cadastro</label>
          <select
            id="filial"
            name="filial"
            value={formData.filial}
            onChange={handleChange}
            required
          >
            <option value="">Selecione uma filial</option>
            <option value="Matriz">0101</option>
            <option value="Filial SP">0102</option>
            <option value="Filial RJ">0105</option>
            <option value="Filial MG">0106</option>
            <option value="Filial ES">0110</option>
            <option value="Filial PR">0103</option>
          </select>
        </div>

        <div className="form-actions">
          <button type="button" className="btn-cancel" onClick={onCancel}>
            Cancelar
          </button>
          <button type="submit" className="btn-save">
            Salvar Motorista
          </button>
        </div>
      </form>
    </div>
  );
};

export default CadastroMotorista;

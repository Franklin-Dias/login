import React, { useState } from "react";
import "./Placas.css";

const Placas = () => {
  const [veiculos] = useState(() => {
    return JSON.parse(localStorage.getItem("veiculos") || "[]");
  });

  // Função para verificar se o veículo está em alguma escala ativa
  const verificarStatus = (placa) => {
    const escalas = JSON.parse(localStorage.getItem("escalas") || "[]");

    // Verifica se a placa aparece em alguma escala (como veículo principal, cavalo, etc.)
    const estaEmEscala = escalas.some(
      (escala) =>
        escala.veiculo === placa ||
        escala.placa === placa ||
        escala.cavalo === placa
    );

    return estaEmEscala;
  };

  return (
    <div className="placas-container">
      <h2>Controle de Placas</h2>
      <table className="placas-table">
        <thead>
          <tr>
            <th>Número da Placa</th>
            <th>Tipo</th>
            <th>Modelo</th>
            <th>Ano</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {veiculos.length > 0 ? (
            veiculos.map((veiculo, index) => {
              const ocupado = verificarStatus(veiculo.placa);
              return (
                <tr key={index}>
                  <td>{veiculo.placa || "-"}</td>
                  <td>{veiculo.tipo || "-"}</td>
                  <td>{veiculo.modelo || "-"}</td>
                  <td>{veiculo.ano || "-"}</td>
                  <td>
                    <span
                      className={`badge ${ocupado ? "warning" : "success"}`}
                    >
                      {ocupado ? "Em Carregamento" : "Disponível"}
                    </span>
                  </td>
                </tr>
              );
            })
          ) : (
            <tr>
              <td colSpan="5" style={{ textAlign: "center", padding: "20px" }}>
                Nenhum veículo encontrado na base de dados.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default Placas;

import React, { useState, useEffect } from "react";
import {
  FaTools,
  FaClock,
  FaCalendarAlt,
  FaExclamationTriangle,
  FaDownload,
  FaCheckCircle,
} from "react-icons/fa";
import "./Manutencao.css";

const Manutencao = () => {
  const [veiculos, setVeiculos] = useState([]);
  const [dataInicio, setDataInicio] = useState("");
  const [dataFim, setDataFim] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const [currentTime, setCurrentTime] = useState(new Date()); // Estado para o tempo atual

  useEffect(() => {
    const carregarDados = () => {
      const lista = JSON.parse(localStorage.getItem("listaDescarga") || "[]");
      // Filtra apenas os veículos com status "Manutenção"
      const emManutencao = lista.filter((item) => item.status === "Manutenção");
      setVeiculos(emManutencao);
    };

    carregarDados();

    // Atualiza o contador a cada segundo
    const interval = setInterval(() => setCurrentTime(new Date()), 1000);

    // Escuta alterações no localStorage (caso outra aba atualize)
    window.addEventListener("storage", carregarDados);

    return () => {
      clearInterval(interval);
      window.removeEventListener("storage", carregarDados);
    };
  }, []);

  const calcularTempo = (dataInicio) => {
    if (!dataInicio) return "N/A";
    const inicio = new Date(dataInicio);
    const agora = currentTime;
    const diff = agora - inicio;

    if (diff < 0) return "0s";

    const dias = Math.floor(diff / (1000 * 60 * 60 * 24));
    const horas = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutos = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const segundos = Math.floor((diff % (1000 * 60)) / 1000);

    if (dias > 0) return `${dias}d ${horas}h ${minutos}m`;
    return `${horas}h ${minutos}m ${segundos}s`;
  };

  const veiculosFiltrados = veiculos.filter((item) => {
    const dataItem = new Date(item.inicioManutencao || item.dataHora);

    if (dataInicio) {
      const [ano, mes, dia] = dataInicio.split("-");
      const inicio = new Date(ano, mes - 1, dia);
      if (dataItem < inicio) return false;
    }

    if (dataFim) {
      const [ano, mes, dia] = dataFim.split("-");
      const fim = new Date(ano, mes - 1, dia);
      fim.setHours(23, 59, 59, 999); // Inclui o dia inteiro
      if (dataItem > fim) return false;
    }

    return true;
  });

  // Lógica de Paginação
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = veiculosFiltrados.slice(
    indexOfFirstItem,
    indexOfLastItem
  );
  const totalPages = Math.ceil(veiculosFiltrados.length / itemsPerPage);

  const handleExportExcel = () => {
    if (veiculosFiltrados.length === 0) {
      alert("Não há dados para exportar.");
      return;
    }

    const csvContent = [
      "Veículo;Carreta;Motorista;Início;Tempo Decorrido;Status",
      ...veiculosFiltrados.map((item) => {
        const inicio = new Date(
          item.inicioManutencao || item.dataHora
        ).toLocaleString("pt-BR");
        const tempo = calcularTempo(item.inicioManutencao || item.dataHora);
        return `${item.placa};${item.placaCarreta || ""};${
          item.motorista
        };"${inicio}";"${tempo}";Em Oficina`;
      }),
    ].join("\n");

    const blob = new Blob(["\uFEFF" + csvContent], {
      type: "text/csv;charset=utf-8;",
    });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "relatorio_manutencao.csv";
    link.click();
  };

  const handleFinalizar = (id) => {
    if (!window.confirm("Deseja finalizar a manutenção deste veículo?")) return;

    const lista = JSON.parse(localStorage.getItem("listaDescarga") || "[]");
    const itemIndex = lista.findIndex((i) => i.id === id);

    if (itemIndex !== -1) {
      const item = lista[itemIndex];
      const dataInicio = new Date(item.inicioManutencao || item.dataHora);
      const dataFim = new Date();
      const diff = dataFim - dataInicio;

      const dias = Math.floor(diff / (1000 * 60 * 60 * 24));
      const horas = Math.floor(
        (diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
      );
      const minutos = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const segundos = Math.floor((diff % (1000 * 60)) / 1000);

      const duracao =
        dias > 0
          ? `${dias}d ${horas}h ${minutos}m`
          : `${horas}h ${minutos}m ${segundos}s`;

      // Salvar no histórico
      const historico = JSON.parse(
        localStorage.getItem("historicoManutencao") || "[]"
      );
      const novoRegistro = {
        id: new Date().getTime(),
        placa: item.placa,
        motorista: item.motorista,
        inicio: item.inicioManutencao || item.dataHora,
        fim: dataFim.toISOString(),
        duracao: duracao,
      };
      localStorage.setItem(
        "historicoManutencao",
        JSON.stringify([novoRegistro, ...historico])
      );

      // Atualizar status na lista principal
      lista[itemIndex] = { ...item, status: "Disponível" };
      localStorage.setItem("listaDescarga", JSON.stringify(lista));
      setVeiculos(lista.filter((i) => i.status === "Manutenção"));
      window.dispatchEvent(new Event("storage"));
    }
  };

  return (
    <div className="manutencao-container">
      <header className="manutencao-header">
        <div>
          <h1 className="manutencao-title">
            <FaTools /> Gestão de Manutenção
          </h1>
          <p className="manutencao-subtitle">
            Acompanhamento em tempo real dos veículos em oficina.
          </p>
        </div>
        <button onClick={handleExportExcel} className="btn-export-excel">
          <FaDownload /> Exportar Excel
        </button>
      </header>

      <div className="filters-container">
        <div className="filter-group">
          <label>Data Início:</label>
          <input
            type="date"
            value={dataInicio}
            onChange={(e) => {
              setDataInicio(e.target.value);
              setCurrentPage(1);
            }}
            className="filter-input"
          />
        </div>
        <div className="filter-group">
          <label>Data Fim:</label>
          <input
            type="date"
            value={dataFim}
            onChange={(e) => {
              setDataFim(e.target.value);
              setCurrentPage(1);
            }}
            className="filter-input"
          />
        </div>
      </div>

      <div className="table-responsive">
        <table className="manutencao-table">
          <thead className="manutencao-thead">
            <tr>
              <th className="manutencao-th">Veículo / Placa</th>
              <th className="manutencao-th">Motorista</th>
              <th className="manutencao-th">Início da Manutenção</th>
              <th className="manutencao-th">Tempo Decorrido</th>
              <th className="manutencao-th">Status</th>
              <th className="manutencao-th">Ações</th>
            </tr>
          </thead>
          <tbody>
            {currentItems.length > 0 ? (
              currentItems.map((item) => (
                <tr key={item.id} className="manutencao-tr">
                  <td className="manutencao-td">
                    <div className="placa-text">{item.placa}</div>
                    {item.placaCarreta && (
                      <div className="carreta-text">
                        Carreta: {item.placaCarreta}
                      </div>
                    )}
                  </td>
                  <td className="manutencao-td">{item.motorista}</td>
                  <td className="manutencao-td">
                    <div className="date-info">
                      <FaCalendarAlt />
                      {new Date(
                        item.inicioManutencao || item.dataHora
                      ).toLocaleDateString("pt-BR")}
                    </div>
                    <div className="time-info">
                      <FaClock />
                      {new Date(
                        item.inicioManutencao || item.dataHora
                      ).toLocaleTimeString("pt-BR")}
                    </div>
                  </td>
                  <td className="manutencao-td">
                    <span className="time-badge">
                      {calcularTempo(item.inicioManutencao || item.dataHora)}
                    </span>
                  </td>
                  <td className="manutencao-td">
                    <div className="status-info">
                      <FaExclamationTriangle />
                      Em Oficina
                    </div>
                  </td>
                  <td className="manutencao-td">
                    <button
                      onClick={() => handleFinalizar(item.id)}
                      className="btn-finalizar"
                      title="Finalizar Manutenção"
                    >
                      <FaCheckCircle /> Finalizar
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="5" className="empty-message">
                  Nenhum veículo em manutenção no momento.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="pagination-container">
          <button
            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
            className="pagination-btn"
          >
            Anterior
          </button>
          <span className="pagination-info">
            Página {currentPage} de {totalPages}
          </span>
          <button
            onClick={() =>
              setCurrentPage((prev) => Math.min(prev + 1, totalPages))
            }
            disabled={currentPage === totalPages}
            className="pagination-btn"
          >
            Próximo
          </button>
        </div>
      )}
    </div>
  );
};

export default Manutencao;

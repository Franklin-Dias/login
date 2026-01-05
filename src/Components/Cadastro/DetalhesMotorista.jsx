import React, { useState, useEffect } from "react";
import { FaTrash, FaDownload } from "react-icons/fa";
import "./DetalhesMotorista.css";

const DetalhesMotorista = () => {
  const [motoristas] = useState(() =>
    JSON.parse(localStorage.getItem("motoristas") || "[]")
  );
  const [selectedDriverId, setSelectedDriverId] = useState("");
  const [escalas] = useState(() =>
    JSON.parse(localStorage.getItem("escalas") || "[]")
  );
  const [searchTerm, setSearchTerm] = useState("");
  const [eventos, setEventos] = useState(() =>
    JSON.parse(localStorage.getItem("eventosMotorista") || "[]")
  );

  // Estado para o formulário de registro (Folga/Falta)
  const [novoEvento, setNovoEvento] = useState({
    tipo: "Folga",
    data: "",
    obs: "",
  });

  // Salva eventos no localStorage sempre que a lista de eventos mudar
  useEffect(() => {
    localStorage.setItem("eventosMotorista", JSON.stringify(eventos));
  }, []);

  // Motorista selecionado
  const selectedDriver = motoristas.find(
    (m) => m.id.toString() === selectedDriverId
  );

  // Cálculos baseados na Escala
  const driverEscalas = selectedDriver
    ? escalas.filter((e) => e.motorista === selectedDriver.nome)
    : [];

  // Verifica se está escalado (se tem alguma viagem pendente ou aceita)
  const ultimaEscala =
    driverEscalas.length > 0 ? driverEscalas[driverEscalas.length - 1] : null;
  const estaEscalado =
    ultimaEscala &&
    (ultimaEscala.status === "Pendente" ||
      ultimaEscala.status === "Enviado" ||
      ultimaEscala.status === "Aceito");

  // Conta domingos trabalhados
  const domingosTrabalhados = driverEscalas.filter((e) => {
    if (!e.dataHora) return false;
    const date = new Date(e.dataHora);
    return date.getDay() === 0; // 0 = Domingo
  }).length;

  // Eventos do motorista selecionado
  const driverEventos = selectedDriver
    ? eventos.filter((e) => e.motoristaId === selectedDriver.id)
    : [];

  const handleAddEvento = (e) => {
    e.preventDefault();
    if (!selectedDriver || !novoEvento.data) {
      alert("Selecione um motorista e uma data.");
      return;
    }

    const evento = {
      id: Date.now(),
      motoristaId: selectedDriver.id,
      ...novoEvento,
    };

    const updatedEventos = [...eventos, evento];
    setEventos(updatedEventos);

    setNovoEvento({ tipo: "Folga", data: "", obs: "" });
    alert("Registro adicionado com sucesso!");
  };

  const handleDeleteEvento = (id) => {
    if (window.confirm("Deseja excluir este registro?")) {
      const updatedEventos = eventos.filter((e) => e.id !== id);
      setEventos(updatedEventos);
    }
  };

  const handleExportCSV = () => {
    if (!driverEventos.length) {
      alert("Não há dados para exportar.");
      return;
    }

    const csvContent = [
      "Data,Tipo,Observação",
      ...driverEventos.map((ev) => {
        const data = new Date(ev.data).toLocaleDateString("pt-BR");
        const obs = ev.obs ? `"${ev.obs.replace(/"/g, '""')}"` : "";
        return `${data},${ev.tipo},${obs}`;
      }),
    ].join("\n");

    const blob = new Blob(["\uFEFF" + csvContent], {
      type: "text/csv;charset=utf-8;",
    });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `historico_${selectedDriver.nome.replace(/\s+/g, "_")}.csv`;
    link.click();
  };

  return (
    <div className="detalhes-container">
      {/* Coluna da Esquerda: Lista de Motoristas */}
      <div className="lista-section">
        <h3>Motoristas</h3>
        <input
          type="text"
          placeholder="Buscar motorista..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="search-input"
        />
        <div className="lista-items">
          {motoristas
            .filter((m) =>
              m.nome.toLowerCase().includes(searchTerm.toLowerCase())
            )
            .map((m) => (
              <div
                key={m.id}
                className={`motorista-item ${
                  selectedDriverId === m.id.toString() ? "active" : ""
                }`}
                onClick={() => setSelectedDriverId(m.id.toString())}
              >
                {m.nome}
              </div>
            ))}
        </div>
      </div>

      {/* Coluna da Direita: Detalhes */}
      <div className="detalhes-section">
        {selectedDriver ? (
          <>
            <h2 style={{ marginTop: 0, marginBottom: "1.5rem" }}>
              {selectedDriver.nome}
            </h2>
            <div className="info-grid">
              <div className="info-card">
                <h4>CPF</h4>
                <p>{selectedDriver.cpf}</p>
              </div>
              <div className="info-card">
                <h4>Celular</h4>
                <p>{selectedDriver.celular}</p>
              </div>
              <div className="info-card">
                <h4>Filial</h4>
                <p>{selectedDriver.filial}</p>
              </div>
              <div className={`info-card ${estaEscalado ? "success" : ""}`}>
                <h4>Status Atual</h4>
                <p>{estaEscalado ? "EM VIAGEM / ESCALADO" : "Disponível"}</p>
              </div>
              <div className="info-card alert">
                <h4>Domingos Trabalhados</h4>
                <p>{domingosTrabalhados}</p>
              </div>
            </div>

            <div className="registro-section">
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <h3>Registrar Ocorrência / Ponto</h3>
                <button onClick={handleExportCSV} className="btn-export">
                  <FaDownload /> Exportar CSV
                </button>
              </div>
              <form onSubmit={handleAddEvento} className="registro-form">
                <div className="form-group">
                  <label>Tipo</label>
                  <select
                    value={novoEvento.tipo}
                    onChange={(e) =>
                      setNovoEvento({ ...novoEvento, tipo: e.target.value })
                    }
                  >
                    <option value="Folga">Folga</option>
                    <option value="Falta">Falta</option>
                    <option value="Dia Trabalhado">Dia Trabalhado</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Data</label>
                  <input
                    type="date"
                    value={novoEvento.data}
                    onChange={(e) =>
                      setNovoEvento({ ...novoEvento, data: e.target.value })
                    }
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Observação</label>
                  <input
                    type="text"
                    placeholder="Detalhes..."
                    value={novoEvento.obs}
                    onChange={(e) =>
                      setNovoEvento({ ...novoEvento, obs: e.target.value })
                    }
                  />
                </div>
                <button type="submit" className="btn-add">
                  Adicionar
                </button>
              </form>

              <table className="historico-table">
                <thead>
                  <tr>
                    <th>Data</th>
                    <th>Tipo</th>
                    <th>Observação</th>
                    <th>Ação</th>
                  </tr>
                </thead>
                <tbody>
                  {driverEventos.length > 0 ? (
                    driverEventos.map((ev) => (
                      <tr key={ev.id}>
                        <td>{new Date(ev.data).toLocaleDateString("pt-BR")}</td>
                        <td>{ev.tipo}</td>
                        <td>{ev.obs}</td>
                        <td>
                          <button
                            className="btn-delete"
                            onClick={() => handleDeleteEvento(ev.id)}
                          >
                            <FaTrash />
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="4" style={{ textAlign: "center" }}>
                        Nenhum registro encontrado.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </>
        ) : (
          <div
            style={{ textAlign: "center", color: "#888", marginTop: "2rem" }}
          >
            <h3>Selecione um motorista na lista ao lado</h3>
            <p>Os detalhes, histórico e opções aparecerão aqui.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default DetalhesMotorista;

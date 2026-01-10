import React, { useState, useEffect } from "react";
import {
  FaTrash,
  FaEdit,
  FaSort,
  FaSortUp,
  FaSortDown,
  FaExchangeAlt,
} from "react-icons/fa";
import "./ListadeDescarga.css";

const ListadeDescarga = () => {
  const [lista, setLista] = useState(() => {
    const saved = localStorage.getItem("listaDescarga");
    return saved ? JSON.parse(saved) : [];
  });

  const [novoItem, setNovoItem] = useState({
    dataHora: "",
    placa: "",
    placaCarreta: "",
    motorista: "",
    gestor: "",
    cliente: "",
    status: "Aguardando",
  });

  const [editingId, setEditingId] = useState(null);
  const [filtro, setFiltro] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const [sortConfig, setSortConfig] = useState({
    key: null,
    direction: "ascending",
  });
  const [activeStatusMenu, setActiveStatusMenu] = useState(null);
  const [showFolgaModal, setShowFolgaModal] = useState(false);
  const [folgaData, setFolgaData] = useState({ itemId: null, start: "", end: "" });

  useEffect(() => {
    localStorage.setItem("listaDescarga", JSON.stringify(lista));
  }, [lista]);

  // Verifica se o motorista foi escalado por outro gestor e o remove da lista de descarga
  useEffect(() => {
    const verificarEscalas = () => {
      const escalas = JSON.parse(localStorage.getItem("escalas") || "[]");
      const motoristasEscalados = escalas
        .filter((e) => e.status !== "Finalizada")
        .map((e) => e.motorista?.toLowerCase());

      setLista((prevLista) => {
        const novaLista = prevLista.filter(
          (item) => !motoristasEscalados.includes(item.motorista?.toLowerCase())
        );
        return novaLista.length !== prevLista.length ? novaLista : prevLista;
      });
    };

    verificarEscalas();
    // Adiciona listener para reagir a mudanças no localStorage (outras abas/gestores)
    window.addEventListener("storage", verificarEscalas);
    return () => window.removeEventListener("storage", verificarEscalas);
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    let updates = {};

    // Lógica para puxar placas do conjunto ao digitar o motorista
    if (name === "motorista") {
      const conjuntos = JSON.parse(localStorage.getItem("conjuntos") || "[]");
      const conjunto = conjuntos.find(
        (c) => c.motoristaTitular.toLowerCase() === value.toLowerCase()
      );
      if (conjunto) {
        updates.placa = conjunto.placaCavalo;
        updates.placaCarreta = conjunto.placaCarreta;
      }
    }

    // Lógica para puxar motorista e carreta ao digitar a placa do cavalo
    if (name === "placa") {
      const conjuntos = JSON.parse(localStorage.getItem("conjuntos") || "[]");
      const conjunto = conjuntos.find(
        (c) => c.placaCavalo.toLowerCase() === value.toLowerCase()
      );
      if (conjunto) {
        updates.motorista = conjunto.motoristaTitular;
        updates.placaCarreta = conjunto.placaCarreta;
      }
    }

    setNovoItem((prev) => ({
      ...prev,
      [name]: name.includes("placa") ? value.toUpperCase() : value,
      ...updates,
    }));
  };

  const adicionarFila = (e) => {
    e.preventDefault();
    if (!novoItem.placa || !novoItem.motorista || !novoItem.dataHora) {
      alert("Preencha os campos obrigatórios.");
      return;
    }

    if (editingId) {
      setLista(
        lista.map((item) =>
          item.id === editingId ? { ...item, ...novoItem } : item
        )
      );
      setEditingId(null);
    } else {
      const item = {
        id: Date.now(),
        ...novoItem,
      };
      setLista([...lista, item]);
    }

    setNovoItem({
      dataHora: "",
      placa: "",
      placaCarreta: "",
      motorista: "",
      gestor: "",
      cliente: "",
      status: "Descarregado",
    });
  };

  const alterarStatus = (id, novoStatus) => {
    if (novoStatus === "Folga") {
      setFolgaData({ itemId: id, start: "", end: "" });
      setShowFolgaModal(true);
      return;
    }

    // Lógica para salvar histórico de manutenção ao finalizar (parar o tempo)
    const item = lista.find((i) => i.id === id);
    if (item && item.status === "Manutenção" && novoStatus !== "Manutenção") {
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

      const historico = JSON.parse(
        localStorage.getItem("historicoManutencao") || "[]"
      );
      const novoRegistro = {
        id: Date.now(),
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
    }

    setLista(
      lista.map((item) =>
        item.id === id
          ? {
              ...item,
              status: novoStatus,
              inicioManutencao:
                novoStatus === "Manutenção"
                  ? new Date().toISOString()
                  : item.inicioManutencao,
            }
          : item
      )
    );
  };

  const handleConfirmarFolga = () => {
    const { itemId, start, end } = folgaData;
    if (!start) {
      alert("Por favor, selecione a data de início.");
      return;
    }

    const dataInicio = new Date(start + "T12:00:00");
    const dataFim = end ? new Date(end + "T12:00:00") : dataInicio;

    // Validação: Data de início não pode ser no passado
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const checkStart = new Date(dataInicio);
    checkStart.setHours(0, 0, 0, 0);

    if (checkStart < today) {
      alert("A data de início da folga não pode ser anterior à data atual.");
      return;
    }

    if (dataFim < dataInicio) {
      alert("A data final não pode ser anterior à inicial.");
      return;
    }

    // Atualiza status na Lista de Descarga
    setLista(
      lista.map((item) =>
        item.id === itemId ? { ...item, status: "Folga" } : item
      )
    );

    // Atualiza Motoristas no localStorage
    const itemDescarga = lista.find((i) => i.id === itemId);
    if (itemDescarga && itemDescarga.motorista) {
      const motoristas = JSON.parse(localStorage.getItem("motoristas") || "[]");
      const novosMotoristas = motoristas.map((m) => {
        if (m.nome && m.nome.toLowerCase() === itemDescarga.motorista.toLowerCase()) {
          const novaFolga = {
            inicio: dataInicio.toISOString(),
            fim: dataFim.toISOString(),
            registradoEm: new Date().toISOString(),
          };
          return {
            ...m,
            inicioFolga: dataInicio.toISOString(),
            ultimaFolga: dataFim.toISOString(),
            historicoFolgas: [novaFolga, ...(m.historicoFolgas || [])],
          };
        }
        return m;
      });
      localStorage.setItem("motoristas", JSON.stringify(novosMotoristas));
      window.dispatchEvent(new Event("storage"));
    }

    setShowFolgaModal(false);
    setFolgaData({ itemId: null, start: "", end: "" });
  };

  const editarItem = (item) => {
    setNovoItem({
      dataHora: item.dataHora,
      placa: item.placa,
      placaCarreta: item.placaCarreta || "",
      motorista: item.motorista,
      gestor: item.gestor,
      cliente: item.cliente,
      status: item.status,
    });
    setEditingId(item.id);
  };

  const removerItem = (id) => {
    if (window.confirm("Deseja remover este veículo da lista?")) {
      setLista(lista.filter((item) => item.id !== id));
    }
  };

  const filteredLista = lista.filter(
    (item) =>
      (item.placa && item.placa.toLowerCase().includes(filtro.toLowerCase())) ||
      (item.motorista &&
        item.motorista.toLowerCase().includes(filtro.toLowerCase()))
  );

  // Lógica de Ordenação
  const requestSort = (key) => {
    let direction = "ascending";
    if (sortConfig.key === key && sortConfig.direction === "ascending") {
      direction = "descending";
    }
    setSortConfig({ key, direction });
  };

  const sortedLista = [...filteredLista].sort((a, b) => {
    if (!sortConfig.key) return 0;
    const valA = (a[sortConfig.key] || "").toString().toLowerCase();
    const valB = (b[sortConfig.key] || "").toString().toLowerCase();

    if (valA < valB) {
      return sortConfig.direction === "ascending" ? -1 : 1;
    }
    if (valA > valB) {
      return sortConfig.direction === "ascending" ? 1 : -1;
    }
    return 0;
  });

  // Lógica de Paginação
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = sortedLista.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(sortedLista.length / itemsPerPage);

  const getSortIcon = (name) => {
    if (sortConfig.key !== name)
      return <FaSort className="sort-icon inactive" />;
    return sortConfig.direction === "ascending" ? (
      <FaSortUp className="sort-icon" />
    ) : (
      <FaSortDown className="sort-icon" />
    );
  };

  // Função auxiliar para gerar classes CSS seguras (sem acentos/espaços)
  const getStatusClass = (status) => {
    return (status || "Descarregado")
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/\s+/g, "-");
  };

  // Contagem de status para o painel superior
  const statusCounts = lista.reduce((acc, item) => {
    const status = item.status || "Descarregado";
    acc[status] = (acc[status] || 0) + 1;
    return acc;
  }, {});

  const statusOrder = [
    "Disponível",
    "Aguardando",
    "Carregando",
    "Descarregado",
    "Folga",
    "Manutenção",
    "Afastado",
  ];

  return (
    <div className="descarga-container">
      <h2>Lista de Descarga</h2>

      <div className="status-summary">
        {statusOrder.map((status) => (
          <div
            key={status}
            className={`status-card-summary ${getStatusClass(status)}`}
          >
            <span className="status-label">{status}</span>
            <span className="status-count">{statusCounts[status] || 0}</span>
          </div>
        ))}
      </div>

      <form onSubmit={adicionarFila} className="descarga-form">
        <input
          type="datetime-local"
          name="dataHora"
          value={novoItem.dataHora}
          onChange={handleChange}
          required
          title="Data e Hora"
        />
        <input
          type="text"
          name="placa"
          placeholder="Placa Cavalo"
          value={novoItem.placa}
          onChange={handleChange}
          maxLength="8"
          required
        />
        <input
          type="text"
          name="placaCarreta"
          placeholder="Placa Carreta"
          value={novoItem.placaCarreta}
          onChange={handleChange}
          maxLength="8"
        />
        <input
          type="text"
          name="motorista"
          placeholder="Motorista"
          value={novoItem.motorista}
          onChange={handleChange}
          required
        />
        <input
          type="text"
          name="gestor"
          placeholder="Gestor da Viagem"
          value={novoItem.gestor}
          onChange={handleChange}
        />
        <input
          type="text"
          name="cliente"
          placeholder="Cliente"
          value={novoItem.cliente}
          onChange={handleChange}
        />
        <button type="submit" className="btn-add">
          {editingId ? "Salvar Alteração" : "Adicionar à Fila"}
        </button>
      </form>

      <input
        type="text"
        placeholder="Buscar por placa ou motorista..."
        value={filtro}
        onChange={(e) => {
          setFiltro(e.target.value);
          setCurrentPage(1);
        }}
        className="search-filter"
      />

      <table className="descarga-table">
        <thead>
          <tr>
            <th onClick={() => requestSort("status")}>
              <div className="th-content">Status {getSortIcon("status")}</div>
            </th>
            <th onClick={() => requestSort("dataHora")}>
              <div className="th-content">
                Data e Hora {getSortIcon("dataHora")}
              </div>
            </th>
            <th onClick={() => requestSort("motorista")}>
              <div className="th-content">
                Motorista {getSortIcon("motorista")}
              </div>
            </th>
            <th onClick={() => requestSort("placa")}>
              <div className="th-content">Cavalo {getSortIcon("placa")}</div>
            </th>
            <th onClick={() => requestSort("placaCarreta")}>
              <div className="th-content">
                Carreta {getSortIcon("placaCarreta")}
              </div>
            </th>
            <th onClick={() => requestSort("gestor")}>
              <div className="th-content">Gestor {getSortIcon("gestor")}</div>
            </th>
            <th onClick={() => requestSort("cliente")}>
              <div className="th-content">Cliente {getSortIcon("cliente")}</div>
            </th>
            <th>Ações</th>
          </tr>
        </thead>
        <tbody>
          {currentItems.length > 0 ? (
            currentItems.map((item) => (
              <tr key={item.id}>
                <td>
                  <span
                    className={`badge-status ${getStatusClass(item.status)}`}
                  >
                    {item.status || "Aguardando"}
                  </span>
                </td>
                <td>{new Date(item.dataHora).toLocaleString("pt-BR")}</td>
                <td>{item.motorista}</td>
                <td>{item.placa}</td>
                <td>{item.placaCarreta || "-"}</td>
                <td>{item.gestor || "-"}</td>
                <td>{item.cliente || "-"}</td>
                <td className="actions-cell">
                  <button
                    className="btn-action edit"
                    title="Editar"
                    onClick={() => editarItem(item)}
                  >
                    <FaEdit />
                  </button>

                  <div className="status-dropdown-container">
                    <button
                      className="btn-action change-status"
                      title="Alterar Status"
                      onClick={() =>
                        setActiveStatusMenu(
                          activeStatusMenu === item.id ? null : item.id
                        )
                      }
                    >
                      <FaExchangeAlt />
                    </button>
                    {activeStatusMenu === item.id && (
                      <div className="status-menu">
                        <button
                          onClick={() => {
                            alterarStatus(item.id, "Disponível");
                            setActiveStatusMenu(null);
                          }}
                        >
                          Disponível
                        </button>
                        <button
                          onClick={() => {
                            alterarStatus(item.id, "Folga");
                            setActiveStatusMenu(null);
                          }}
                        >
                          Folga
                        </button>
                        <button
                          onClick={() => {
                            alterarStatus(item.id, "Manutenção");
                            setActiveStatusMenu(null);
                          }}
                        >
                          Manutenção
                        </button>
                        <button
                          onClick={() => {
                            alterarStatus(item.id, "Afastado");
                            setActiveStatusMenu(null);
                          }}
                        >
                          Afastado
                        </button>
                        <button
                          onClick={() => {
                            alterarStatus(item.id, "Carregando");
                            setActiveStatusMenu(null);
                          }}
                        >
                          Carregando
                        </button>
                        <button
                          onClick={() => {
                            alterarStatus(item.id, "Descarregado");
                            setActiveStatusMenu(null);
                          }}
                        >
                          Descarregado
                        </button>
                        <button
                          onClick={() => {
                            alterarStatus(item.id, "Aguardando");
                            setActiveStatusMenu(null);
                          }}
                        >
                          Aguardando
                        </button>
                      </div>
                    )}
                  </div>

                  <button
                    className="btn-action delete"
                    title="Remover"
                    onClick={() => removerItem(item.id)}
                  >
                    <FaTrash />
                  </button>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="8" className="empty-state">
                Nenhum veículo na fila de descarga.
              </td>
            </tr>
          )}
        </tbody>
      </table>

      {/* Controles de Paginação */}
      {totalPages > 1 && (
        <div className="pagination">
          <button
            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
          >
            Anterior
          </button>
          <span>
            Página {currentPage} de {totalPages}
          </span>
          <button
            onClick={() =>
              setCurrentPage((prev) => Math.min(prev + 1, totalPages))
            }
            disabled={currentPage === totalPages}
          >
            Próximo
          </button>
        </div>
      )}

      {/* Modal de Registro de Folga */}
      {showFolgaModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>Registrar Folga</h3>
            <div className="form-group-modal">
              <label>Início da Folga:</label>
              <input
                type="date"
                value={folgaData.start}
                onChange={(e) =>
                  setFolgaData({ ...folgaData, start: e.target.value })
                }
              />
            </div>
            <div className="form-group-modal">
              <label>Fim da Folga:</label>
              <input
                type="date"
                value={folgaData.end}
                onChange={(e) =>
                  setFolgaData({ ...folgaData, end: e.target.value })
                }
              />
            </div>
            <div className="modal-actions">
              <button
                onClick={() => setShowFolgaModal(false)}
                className="btn-cancel-modal"
              >
                Cancelar
              </button>
              <button onClick={handleConfirmarFolga} className="btn-confirm-modal">
                Confirmar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ListadeDescarga;

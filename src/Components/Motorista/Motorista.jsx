import React, { useState, useEffect } from "react";
import {
  FaUserTie,
  FaCalendarCheck,
  FaWhatsapp,
  FaSearch,
  FaEdit,
  FaSave,
  FaTimes,
  FaHistory,
  FaDownload,
} from "react-icons/fa";
import "./Motorista.css";

const Motorista = () => {
  const [motoristas, setMotoristas] = useState([]);
  const [escalas, setEscalas] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [editFormData, setEditFormData] = useState({
    celular: "",
    filial: "",
    funcao: "",
  });
  const [folgaDates, setFolgaDates] = useState({});
  const [historyModalOpen, setHistoryModalOpen] = useState(false);
  const [selectedDriver, setSelectedDriver] = useState(null);

  const filialMap = {
    Matriz: "0101",
    "Filial SP": "0102",
    "Filial RJ": "0105",
    "Filial MG": "0106",
    "Filial ES": "0110",
    "Filial PR": "0103",
  };

  useEffect(() => {
    const carregarDados = () => {
      const motoristasSalvos = JSON.parse(
        localStorage.getItem("motoristas") || "[]"
      );
      const escalasSalvas = JSON.parse(localStorage.getItem("escalas") || "[]");
      setMotoristas(motoristasSalvos);
      setEscalas(escalasSalvas);
    };

    carregarDados();
    window.addEventListener("storage", carregarDados);

    return () => {
      window.removeEventListener("storage", carregarDados);
    };
  }, []);

  const calcularDomingos = (nomeMotorista, ultimaFolga) => {
    let count = 0;
    const dataCorte = ultimaFolga ? new Date(ultimaFolga) : new Date(0);

    escalas.forEach((escala) => {
      if (
        escala.motorista === nomeMotorista &&
        escala.status !== "Cancelado" &&
        escala.dataHora
      ) {
        const dataViagem = new Date(escala.dataHora);
        // 0 é Domingo. Conta apenas se a viagem for após a última folga.
        if (dataViagem.getDay() === 0 && dataViagem > dataCorte) {
          count++;
        }
      }
    });
    return count;
  };

  const handleRegistrarFolga = (id) => {
    const dates = folgaDates[id] || {};
    const dataInicio = dates.start
      ? new Date(dates.start + "T12:00:00")
      : new Date();
    const dataFim = dates.end ? new Date(dates.end + "T12:00:00") : dataInicio; // Se não informar fim, considera 1 dia

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
      alert("A data final da folga não pode ser anterior à data inicial.");
      return;
    }

    if (
      window.confirm(
        `Deseja registrar folga de ${dataInicio.toLocaleDateString(
          "pt-BR"
        )} até ${dataFim.toLocaleDateString(
          "pt-BR"
        )} para este motorista? Isso irá zerar a contagem de domingos atuais.`
      )
    ) {
      const novosMotoristas = motoristas.map((m) => {
        if (m.id === id) {
          const novaFolga = {
            inicio: dataInicio.toISOString(),
            fim: dataFim.toISOString(),
            registradoEm: new Date().toISOString(),
          };

          // Salva inicioFolga para histórico e ultimaFolga (fim) para o cálculo de domingos
          return {
            ...m,
            inicioFolga: dataInicio.toISOString(),
            ultimaFolga: dataFim.toISOString(),
            historicoFolgas: [novaFolga, ...(m.historicoFolgas || [])],
          };
        }
        return m;
      });

      setMotoristas(novosMotoristas);
      localStorage.setItem("motoristas", JSON.stringify(novosMotoristas));

      // Atualizar status na Lista de Descarga para "Folga"
      const motoristaAlvo = motoristas.find((m) => m.id === id);
      if (motoristaAlvo) {
        const listaDescarga = JSON.parse(
          localStorage.getItem("listaDescarga") || "[]"
        );
        const novaListaDescarga = listaDescarga.map((item) => {
          if (item.motorista === motoristaAlvo.nome) {
            return { ...item, status: "Folga" };
          }
          return item;
        });
        localStorage.setItem(
          "listaDescarga",
          JSON.stringify(novaListaDescarga)
        );
        window.dispatchEvent(new Event("storage"));
      }

      // Limpa a data selecionada após registrar
      setFolgaDates((prev) => {
        const n = { ...prev };
        delete n[id];
        return n;
      });
    }
  };

  const handleWhatsapp = (celular) => {
    if (!celular) return;
    const numero = celular.replace(/\D/g, "");
    window.open(`https://wa.me/55${numero}`, "_blank");
  };

  const handleEditClick = (motorista) => {
    setEditingId(motorista.id);
    setEditFormData({
      celular: motorista.celular,
      filial: motorista.filial,
      funcao: motorista.funcao || "Motorista",
    });
  };

  const handleSaveClick = () => {
    const updatedMotoristas = motoristas.map((m) => {
      if (m.id === editingId) {
        return { ...m, ...editFormData };
      }
      return m;
    });
    setMotoristas(updatedMotoristas);
    localStorage.setItem("motoristas", JSON.stringify(updatedMotoristas));
    setEditingId(null);
  };

  const handleCancelClick = () => {
    setEditingId(null);
  };

  const handleOpenHistory = (motorista) => {
    setSelectedDriver(motorista);
    setHistoryModalOpen(true);
  };

  const handleExportDrivers = () => {
    if (motoristas.length === 0) {
      alert("Não há dados para exportar.");
      return;
    }

    const csvContent = [
      "Nome;Função;CPF;Celular;Filial;Domingos Trabalhados;Início Folga;Fim Folga",
      ...motoristas.map((m) => {
        const domingos = calcularDomingos(m.nome, m.ultimaFolga);
        const inicioFolga = m.inicioFolga
          ? new Date(m.inicioFolga).toLocaleDateString("pt-BR")
          : "-";
        const fimFolga = m.ultimaFolga
          ? new Date(m.ultimaFolga).toLocaleDateString("pt-BR")
          : "-";
        return `${m.nome};${m.funcao || "Motorista"};${m.cpf || ""};${
          m.celular || ""
        };${
          filialMap[m.filial] || m.filial || ""
        };${domingos};${inicioFolga};${fimFolga}`;
      }),
    ].join("\n");

    const blob = new Blob(["\uFEFF" + csvContent], {
      type: "text/csv;charset=utf-8;",
    });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "relatorio_motoristas.csv";
    link.click();
  };

  const filteredMotoristas = motoristas.filter(
    (m) =>
      m.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (m.cpf && m.cpf.includes(searchTerm))
  );

  return (
    <div className="motorista-container">
      <header className="motorista-header">
        <h1 className="motorista-title">
          <FaUserTie /> Gestão de Motoristas
        </h1>
        <p className="motorista-subtitle">
          Controle de cadastro, contatos e folgas.
        </p>
      </header>

      <div className="controls-container">
        <div className="search-box">
          <FaSearch className="search-icon" />
          <input
            type="text"
            placeholder="Buscar por nome ou CPF..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>
        <button onClick={handleExportDrivers} className="btn-export-report">
          <FaDownload /> Exportar Relatório
        </button>
      </div>

      <div className="table-responsive">
        <table className="motorista-table">
          <thead className="motorista-thead">
            <tr>
              <th className="motorista-th">Nome</th>
              <th className="motorista-th">Função</th>
              <th className="motorista-th">CPF</th>
              <th className="motorista-th">Celular</th>
              <th className="motorista-th">Filial</th>
              <th className="motorista-th">Domingos Trab.</th>
              <th className="motorista-th">Última Folga</th>
              <th className="motorista-th">Ações</th>
            </tr>
          </thead>
          <tbody>
            {filteredMotoristas.length > 0 ? (
              filteredMotoristas.map((motorista) => {
                const domingos = calcularDomingos(
                  motorista.nome,
                  motorista.ultimaFolga
                );
                const isEditing = motorista.id === editingId;

                // Verifica se o motorista está de folga hoje
                const isFolgaHoje = () => {
                  if (!motorista.inicioFolga || !motorista.ultimaFolga)
                    return false;
                  const today = new Date();
                  today.setHours(0, 0, 0, 0);
                  const start = new Date(motorista.inicioFolga);
                  start.setHours(0, 0, 0, 0);
                  const end = new Date(motorista.ultimaFolga);
                  end.setHours(0, 0, 0, 0);
                  return today >= start && today <= end;
                };
                const emFolga = isFolgaHoje();

                return (
                  <tr
                    key={motorista.id}
                    className={`motorista-tr ${emFolga ? "em-folga-row" : ""}`}
                  >
                    <td className="motorista-td">
                      <div className="nome-text">
                        {motorista.nome}
                        {emFolga && (
                          <span className="badge-alert">EM FOLGA</span>
                        )}
                      </div>
                    </td>
                    <td className="motorista-td">
                      {isEditing ? (
                        <select
                          value={editFormData.funcao}
                          onChange={(e) =>
                            setEditFormData({
                              ...editFormData,
                              funcao: e.target.value,
                            })
                          }
                          className="edit-input"
                        >
                          <option value="Motorista">Motorista</option>
                          <option value="Operador">Operador</option>
                          <option value="Manobra">Manobra</option>
                        </select>
                      ) : (
                        motorista.funcao || "Motorista"
                      )}
                    </td>
                    <td className="motorista-td">{motorista.cpf}</td>
                    <td className="motorista-td">
                      {isEditing ? (
                        <input
                          type="text"
                          value={editFormData.celular}
                          onChange={(e) => {
                            let val = e.target.value
                              .replace(/\D/g, "")
                              .slice(0, 11);
                            val = val.replace(/^(\d{2})(\d)/g, "($1) $2");
                            val = val.replace(/(\d{5})(\d)/, "$1-$2");
                            setEditFormData({ ...editFormData, celular: val });
                          }}
                          className="edit-input"
                        />
                      ) : (
                        <div className="celular-container">
                          {motorista.celular}
                          <button
                            onClick={() => handleWhatsapp(motorista.celular)}
                            className="btn-icon-whatsapp"
                            title="Chamar no WhatsApp"
                          >
                            <FaWhatsapp />
                          </button>
                        </div>
                      )}
                    </td>
                    <td className="motorista-td">
                      {isEditing ? (
                        <select
                          value={editFormData.filial}
                          onChange={(e) =>
                            setEditFormData({
                              ...editFormData,
                              filial: e.target.value,
                            })
                          }
                          className="edit-input"
                        >
                          <option value="Matriz">0101</option>
                          <option value="Filial SP">0102</option>
                          <option value="Filial RJ">0105</option>
                          <option value="Filial MG">0106</option>
                          <option value="Filial ES">0110</option>
                          <option value="Filial PR">0103</option>
                        </select>
                      ) : (
                        filialMap[motorista.filial] || motorista.filial
                      )}
                    </td>
                    <td className="motorista-td">
                      <span
                        className={`badge-domingos ${
                          domingos >= 3 ? "danger" : "success"
                        }`}
                      >
                        {domingos}
                      </span>
                    </td>
                    <td className="motorista-td">
                      {motorista.inicioFolga && motorista.ultimaFolga ? (
                        <div className="folga-range">
                          <span>
                            {new Date(motorista.inicioFolga).toLocaleDateString(
                              "pt-BR"
                            )}
                          </span>
                          <span className="folga-separator">até</span>
                          <span>
                            {new Date(motorista.ultimaFolga).toLocaleDateString(
                              "pt-BR"
                            )}
                          </span>
                        </div>
                      ) : motorista.ultimaFolga ? (
                        new Date(motorista.ultimaFolga).toLocaleDateString(
                          "pt-BR"
                        )
                      ) : (
                        "-"
                      )}
                    </td>
                    <td className="motorista-td">
                      <div className="actions-group">
                        {isEditing ? (
                          <>
                            <button
                              onClick={handleSaveClick}
                              className="btn-action save"
                              title="Salvar"
                            >
                              <FaSave />
                            </button>
                            <button
                              onClick={handleCancelClick}
                              className="btn-action cancel"
                              title="Cancelar"
                            >
                              <FaTimes />
                            </button>
                          </>
                        ) : (
                          <>
                            <button
                              onClick={() => handleEditClick(motorista)}
                              className="btn-action edit"
                              title="Editar"
                            >
                              <FaEdit />
                            </button>
                            <div className="folga-date-group">
                              <input
                                type="date"
                                className="date-input-folga small"
                                title="Início da Folga"
                                value={folgaDates[motorista.id]?.start || ""}
                                onChange={(e) =>
                                  setFolgaDates({
                                    ...folgaDates,
                                    [motorista.id]: {
                                      ...folgaDates[motorista.id],
                                      start: e.target.value,
                                    },
                                  })
                                }
                              />
                              <input
                                type="date"
                                className="date-input-folga small"
                                title="Fim da Folga"
                                value={folgaDates[motorista.id]?.end || ""}
                                onChange={(e) =>
                                  setFolgaDates({
                                    ...folgaDates,
                                    [motorista.id]: {
                                      ...folgaDates[motorista.id],
                                      end: e.target.value,
                                    },
                                  })
                                }
                              />
                            </div>
                            <button
                              onClick={() => handleOpenHistory(motorista)}
                              className="btn-action history"
                              title="Ver Histórico de Folgas"
                            >
                              <FaHistory />
                            </button>
                            <button
                              onClick={() => handleRegistrarFolga(motorista.id)}
                              className="btn-folga"
                              title="Registrar Folga (Zera Domingos)"
                            >
                              <FaCalendarCheck /> Registrar Folga
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan="8" className="empty-message">
                  Nenhum motorista encontrado.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {historyModalOpen && selectedDriver && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>Histórico de Folgas: {selectedDriver.nome}</h3>
              <button onClick={() => setHistoryModalOpen(false)}>
                <FaTimes />
              </button>
            </div>
            <ul className="history-list">
              {selectedDriver.historicoFolgas &&
              selectedDriver.historicoFolgas.length > 0 ? (
                selectedDriver.historicoFolgas.map((folga, index) => (
                  <li key={index}>
                    <span>
                      {new Date(folga.inicio).toLocaleDateString("pt-BR")} até{" "}
                      {new Date(folga.fim).toLocaleDateString("pt-BR")}
                    </span>
                  </li>
                ))
              ) : (
                <li className="history-empty">Nenhum histórico registrado.</li>
              )}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};

export default Motorista;

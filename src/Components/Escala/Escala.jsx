import { useState, useEffect } from "react";
import {
  FaEdit,
  FaTrash,
  FaWhatsapp,
  FaCheckCircle,
  FaPlus,
  FaFlagCheckered,
  FaChevronUp,
  FaChevronDown,
  FaMapMarkerAlt,
  FaEye,
  FaEyeSlash,
  FaArchive,
  FaUndo,
} from "react-icons/fa";
import "./Escala.css";

function Escala({ initialContract }) {
  // Estado para contratos (carrega do localStorage ou usa padrão)
  const [listaContratos, setListaContratos] = useState(() => {
    const saved = localStorage.getItem("listaContratos");
    if (saved) {
      return JSON.parse(saved);
    }
    return ["P-9", "Vale", "Gerdau", "Cemig", "Usiminas"];
  });

  // Estado para contratos arquivados
  const [contratosArquivados, setContratosArquivados] = useState(() => {
    const saved = localStorage.getItem("contratosArquivados");
    return saved ? JSON.parse(saved) : [];
  });

  // Estado para armazenar a lista de escalas (simulando dados iniciais)
  const [escalas, setEscalas] = useState(() => {
    const saved = localStorage.getItem("escalas");
    if (saved) {
      return JSON.parse(saved);
    }
    return [
      {
        id: 1,
        cliente: "Supermercados BH",
        localCarga: "CD Contagem",
        fazenda: "",
        numeroViagem: "1001",
        filial: "Matriz",
        motorista: "João da Silva",
        telefone: "31999999999",
        cavalo: "ABC-1234",
        carreta: "XYZ-9876",
        dataHora: "2023-10-27T08:00",
        notaFiscal: "123456",
        cte: "789012",
        ocorrencias: "Nenhuma",
        status: "Pendente",
      },
    ];
  });

  // Estado para o formulário
  const [formData, setFormData] = useState({
    cliente: listaContratos[0],
    localCarga: "",
    fazenda: "",
    numeroViagem: "",
    filial: "",
    motorista: "",
    telefone: "",
    cavalo: "",
    carreta: "",
    dataHora: "",
    notaFiscal: "",
    cte: "",
    ocorrencias: "",
    status: "Pendente",
  });

  // Estado para a lista de conjuntos
  const [conjuntos] = useState(() => {
    const saved = localStorage.getItem("conjuntos");
    return saved ? JSON.parse(saved) : [];
  });

  // Estado para controlar qual item está sendo editado
  const [editingId, setEditingId] = useState(null);

  // Estado para o campo de busca
  const [searchTerm, setSearchTerm] = useState("");

  // Estado para o filtro de data
  const [filterDate, setFilterDate] = useState("");

  // Estado para a aba ativa (Contrato selecionado)
  const [activeTab, setActiveTab] = useState(
    initialContract || listaContratos[0]
  );

  // Estado para o filtro de status
  const [statusFilter, setStatusFilter] = useState("All");

  // Estado para controlar a visibilidade do formulário
  const [isFormExpanded, setIsFormExpanded] = useState(true);

  // Estado para ocultar viagens finalizadas (padrão: oculto para economizar espaço)
  const [hideFinalized, setHideFinalized] = useState(true);

  // Estado para mostrar/ocultar lista de arquivados
  const [showArchived, setShowArchived] = useState(false);

  // Estado para detalhes do contrato (metadados do cliente)
  const [contratoDetalhes, setContratoDetalhes] = useState(() => {
    const saved = localStorage.getItem("contratoDetalhes");
    return saved ? JSON.parse(saved) : {};
  });

  useEffect(() => {
    localStorage.setItem("contratoDetalhes", JSON.stringify(contratoDetalhes));
  }, [contratoDetalhes]);

  const handleDetalheChange = (e) => {
    const { name, value } = e.target;
    setContratoDetalhes((prev) => ({
      ...prev,
      [activeTab]: {
        ...prev[activeTab],
        [name]: value,
      },
    }));
  };

  const currentDetalhes = contratoDetalhes[activeTab] || {};

  // Salvar no localStorage sempre que escalas mudar
  useEffect(() => {
    localStorage.setItem("escalas", JSON.stringify(escalas));
  }, [escalas]);

  // Salvar contratos no localStorage
  useEffect(() => {
    localStorage.setItem("listaContratos", JSON.stringify(listaContratos));
  }, [listaContratos]);

  // Salvar contratos arquivados no localStorage
  useEffect(() => {
    localStorage.setItem(
      "contratosArquivados",
      JSON.stringify(contratosArquivados)
    );
  }, [contratosArquivados]);

  const handleAddContrato = () => {
    const nome = prompt("Digite o nome do novo contrato:");
    if (nome && nome.trim() !== "") {
      if (listaContratos.includes(nome)) {
        alert("Este contrato já existe!");
        return;
      }
      setListaContratos([...listaContratos, nome]);
      setActiveTab(nome);
      setFormData((prev) => ({ ...prev, cliente: nome }));
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    if (name === "telefone") {
      let v = value.replace(/\D/g, "");
      v = v.substring(0, 11);

      if (v.length > 10) {
        v = v.replace(/^(\d{2})(\d{5})(\d{4})/, "($1) $2-$3");
      } else if (v.length > 6) {
        v = v.replace(/^(\d{2})(\d{4})(\d{0,4})/, "($1) $2-$3");
      } else if (v.length > 2) {
        v = v.replace(/^(\d{2})(\d{0,5})/, "($1) $2");
      } else if (v.length > 0) {
        v = v.replace(/^(\d*)/, "($1");
      }
      setFormData({ ...formData, [name]: v });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleConjuntoChange = (e) => {
    const conjuntoId = e.target.value;
    if (conjuntoId) {
      const selectedConjunto = conjuntos.find(
        (c) => c.id.toString() === conjuntoId
      );
      if (selectedConjunto) {
        setFormData((prevData) => ({
          ...prevData,
          motorista: selectedConjunto.motoristaTitular,
          cavalo: selectedConjunto.placaCavalo,
          carreta: selectedConjunto.placaCarreta,
        }));
      }
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // Validação: Impedir duplicidade de motorista no mesmo dia
    if (formData.dataHora && formData.motorista) {
      const dataViagem = formData.dataHora.split("T")[0];
      const duplicidade = escalas.some((item) => {
        // Ignora o item atual se estiver editando
        if (editingId && item.id === editingId) return false;

        const itemData = item.dataHora ? item.dataHora.split("T")[0] : "";
        return (
          item.motorista === formData.motorista &&
          itemData === dataViagem &&
          item.status !== "Cancelado"
        );
      });

      if (duplicidade) {
        alert("Este motorista já está escalado para esta data.");
        return;
      }
    }

    if (editingId) {
      // Atualizar escala existente
      setEscalas(
        escalas.map((item) =>
          item.id === editingId ? { ...item, ...formData } : item
        )
      );
      alert("Escala atualizada com sucesso!");
      setEditingId(null);
    } else {
      // Criar nova escala
      const novaEscala = {
        id: Date.now(),
        ...formData,
      };
      setEscalas([...escalas, novaEscala]);
      alert("Motorista escalado com sucesso!");
    }

    setFormData({
      cliente: activeTab, // Mantém o contrato da aba atual ou padrão
      localCarga: "",
      fazenda: "",
      numeroViagem: "",
      filial: "",
      motorista: "",
      telefone: "",
      cavalo: "",
      carreta: "",
      dataHora: "",
      notaFiscal: "",
      cte: "",
      ocorrencias: "",
      status: "Pendente",
    });
  };

  const handleEdit = (item) => {
    setFormData({
      cliente: item.cliente,
      localCarga: item.localCarga || "",
      fazenda: item.fazenda || "",
      numeroViagem: item.numeroViagem || "",
      filial: item.filial || "",
      motorista: item.motorista,
      telefone: item.telefone || "",
      cavalo: item.cavalo,
      carreta: item.carreta,
      dataHora: item.dataHora,
      notaFiscal: item.notaFiscal,
      cte: item.cte,
      ocorrencias: item.ocorrencias,
      status: item.status || "Pendente",
    });
    setEditingId(item.id);
    // Opcional: mudar para a aba do item sendo editado
    if (listaContratos.includes(item.cliente)) {
      setActiveTab(item.cliente);
    }
    setIsFormExpanded(true);
  };

  const handleDelete = (id) => {
    if (window.confirm("Tem certeza que deseja excluir esta escala?")) {
      setEscalas(escalas.filter((item) => item.id !== id));
      if (editingId === id) {
        handleCancel();
      }
    }
  };

  const handleCancel = () => {
    setEditingId(null);
    setFormData({
      cliente: activeTab,
      localCarga: "",
      fazenda: "",
      numeroViagem: "",
      filial: "",
      motorista: "",
      telefone: "",
      cavalo: "",
      carreta: "",
      dataHora: "",
      notaFiscal: "",
      cte: "",
      ocorrencias: "",
      status: "Pendente",
    });
  };

  const handleSendWhatsapp = (item) => {
    const text = `*Nova Escala de Viagem*
Motorista: ${item.motorista}
Viagem Nº: ${item.numeroViagem || "N/A"}
Filial: ${item.filial || "N/A"}
Cliente: ${item.cliente}
Local de Carga: ${item.localCarga || "N/A"}
Fazenda: ${item.fazenda || "N/A"}
Data/Hora: ${new Date(item.dataHora).toLocaleString("pt-BR")}
Veículo: ${item.cavalo} / ${item.carreta}
NF: ${item.notaFiscal || "N/A"}
CTe: ${item.cte || "N/A"}
Obs: ${item.ocorrencias || ""}

Por favor, confirme o recebimento.`;

    const phone = item.telefone ? item.telefone.replace(/\D/g, "") : "";
    const url = `https://wa.me/${phone}?text=${encodeURIComponent(text)}`;

    window.open(url, "_blank");

    // Atualiza status para Enviado se estiver Pendente
    if (item.status === "Pendente") {
      setEscalas(
        escalas.map((i) => (i.id === item.id ? { ...i, status: "Enviado" } : i))
      );
    }
  };

  const handleAccept = (id) => {
    setEscalas(
      escalas.map((item) =>
        item.id === id ? { ...item, status: "Aceito" } : item
      )
    );
    alert("Notificação: O motorista aceitou a viagem!");
  };

  const handleFinalize = (id) => {
    if (window.confirm("Deseja finalizar esta viagem?")) {
      const viagem = escalas.find((item) => item.id === id);

      setEscalas(
        escalas.map((item) =>
          item.id === id ? { ...item, status: "Finalizada" } : item
        )
      );

      if (viagem) {
        // Adiciona automaticamente à Lista de Descarga
        const listaDescargaAtual = JSON.parse(
          localStorage.getItem("listaDescarga") || "[]"
        );

        const novoItemDescarga = {
          id: Date.now(),
          dataHora: new Date().toISOString(),
          placa: viagem.cavalo,
          placaCarreta: viagem.carreta,
          motorista: viagem.motorista,
          gestor: "",
          cliente: viagem.cliente,
          status: "Aguardando", // Define status inicial ao retornar
        };

        localStorage.setItem(
          "listaDescarga",
          JSON.stringify([...listaDescargaAtual, novoItemDescarga])
        );
        window.dispatchEvent(new Event("storage"));
      }
    }
  };

  const handleSyncFinalized = () => {
    if (
      window.confirm(
        "Deseja enviar todas as viagens 'Finalizadas' que não estão na Lista de Descarga?"
      )
    ) {
      const listaDescargaAtual = JSON.parse(
        localStorage.getItem("listaDescarga") || "[]"
      );
      const motoristasNaFila = new Set(
        listaDescargaAtual.map((item) => item.motorista)
      );

      const novosItens = [];
      // Processa do mais recente para o mais antigo para pegar os dados da última viagem
      [...escalas].reverse().forEach((viagem, index) => {
        if (
          viagem.status === "Finalizada" &&
          !motoristasNaFila.has(viagem.motorista)
        ) {
          novosItens.push({
            id: Date.now() + index,
            dataHora: new Date().toISOString(),
            placa: viagem.cavalo,
            placaCarreta: viagem.carreta,
            motorista: viagem.motorista,
            gestor: "",
            cliente: viagem.cliente,
            status: "Aguardando",
          });
          motoristasNaFila.add(viagem.motorista);
        }
      });

      if (novosItens.length > 0) {
        localStorage.setItem(
          "listaDescarga",
          JSON.stringify([...listaDescargaAtual, ...novosItens])
        );
        window.dispatchEvent(new Event("storage"));
        alert(
          `${novosItens.length} motoristas enviados para a Lista de Descarga.`
        );
      } else {
        alert("Todos os motoristas finalizados já estão na lista.");
      }
    }
  };

  const handleFinalizeContract = () => {
    if (
      window.confirm(
        `Deseja finalizar o contrato "${activeTab}"? Ele será arquivado e poderá ser restaurado posteriormente.`
      )
    ) {
      setContratosArquivados([...contratosArquivados, activeTab]);
      const novaLista = listaContratos.filter((c) => c !== activeTab);
      setListaContratos(novaLista);
      if (novaLista.length > 0) {
        setActiveTab(novaLista[0]);
        setFormData((prev) => ({ ...prev, cliente: novaLista[0] }));
      } else {
        setActiveTab("");
      }
    }
  };

  const handleRestoreContract = (contrato) => {
    if (window.confirm(`Deseja restaurar o contrato "${contrato}"?`)) {
      setListaContratos([...listaContratos, contrato]);
      setContratosArquivados(contratosArquivados.filter((c) => c !== contrato));
      if (!activeTab) {
        setActiveTab(contrato);
        setFormData((prev) => ({ ...prev, cliente: contrato }));
      }
    }
  };

  const filteredEscalas = escalas.filter(
    (item) =>
      item.cliente === activeTab &&
      (statusFilter === "All" || item.status === statusFilter) &&
      (item.motorista.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.cliente.toLowerCase().includes(searchTerm.toLowerCase())) &&
      (!filterDate || item.dataHora.startsWith(filterDate)) &&
      (!hideFinalized || item.status !== "Finalizada")
  );

  // Cálculo do resumo para o contrato ativo
  const summary = escalas
    .filter((item) => item.cliente === activeTab)
    .reduce(
      (acc, item) => {
        const status = item.status || "Pendente";
        acc[status] = (acc[status] || 0) + 1;
        acc.total += 1;
        return acc;
      },
      { total: 0, Pendente: 0, Enviado: 0, Aceito: 0 }
    );

  return (
    <div className="escala-container">
      <header className="escala-header">
        <h1>Gestão de Escala</h1>
      </header>

      <div className="escala-content">
        <div className="contratos-actions">
          <button className="btn-new-contract" onClick={handleAddContrato}>
            <FaPlus /> Criar Novo Contrato
          </button>
          <button
            className="btn-new-contract"
            onClick={handleSyncFinalized}
            style={{
              marginLeft: "10px",
              backgroundColor: "#6f42c1",
              color: "#fff",
            }}
            title="Sincronizar Finalizadas com Lista de Descarga"
          >
            <FaFlagCheckered /> Sincronizar Finalizadas
          </button>
          <button
            className="btn-new-contract"
            onClick={() => setShowArchived(!showArchived)}
            style={{
              marginLeft: "10px",
              backgroundColor: "#17a2b8",
              color: "#fff",
            }}
            title="Ver Contratos Arquivados"
          >
            <FaArchive />{" "}
            {showArchived ? "Ocultar Arquivados" : "Ver Arquivados"}
          </button>
        </div>

        {/* Lista de Contratos Arquivados */}
        {showArchived && (
          <div
            style={{
              marginBottom: "20px",
              padding: "15px",
              backgroundColor: "rgba(0, 0, 0, 0.2)",
              borderRadius: "8px",
              border: "1px solid #444",
            }}
          >
            <h3
              style={{ color: "#fff", marginBottom: "10px", fontSize: "1rem" }}
            >
              Contratos Arquivados
            </h3>
            {contratosArquivados.length === 0 ? (
              <p style={{ color: "#ccc", fontSize: "0.9rem" }}>
                Nenhum contrato arquivado.
              </p>
            ) : (
              <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
                {contratosArquivados.map((c) => (
                  <div
                    key={c}
                    style={{
                      backgroundColor: "#333",
                      padding: "8px 12px",
                      borderRadius: "4px",
                      display: "flex",
                      alignItems: "center",
                      gap: "10px",
                      color: "#fff",
                      border: "1px solid #555",
                    }}
                  >
                    <span>{c}</span>
                    <button
                      onClick={() => handleRestoreContract(c)}
                      title="Restaurar Contrato"
                      style={{
                        background: "none",
                        border: "none",
                        color: "#05f26c",
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                      }}
                    >
                      <FaUndo />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Abas de Contratos */}
        <div className="tabs">
          {listaContratos.map((contrato) => (
            <button
              key={contrato}
              className={`tab-btn ${activeTab === contrato ? "active" : ""}`}
              onClick={() => {
                setActiveTab(contrato);
                setFormData({ ...formData, cliente: contrato });
                setStatusFilter("All");
              }}
            >
              {contrato}
            </button>
          ))}
        </div>

        {/* Resumo de Status */}
        <div className="summary-cards">
          <div
            className={`summary-card total ${
              statusFilter === "All" ? "selected" : ""
            }`}
            onClick={() => setStatusFilter("All")}
          >
            <h3>{summary.total}</h3>
            <p>Total</p>
          </div>
          <div
            className={`summary-card pendente ${
              statusFilter === "Pendente" ? "selected" : ""
            }`}
            onClick={() => setStatusFilter("Pendente")}
          >
            <h3>{summary.Pendente}</h3>
            <p>Pendentes</p>
          </div>
          <div
            className={`summary-card enviado ${
              statusFilter === "Enviado" ? "selected" : ""
            }`}
            onClick={() => setStatusFilter("Enviado")}
          >
            <h3>{summary.Enviado}</h3>
            <p>Enviados</p>
          </div>
          <div
            className={`summary-card aceito ${
              statusFilter === "Aceito" ? "selected" : ""
            }`}
            onClick={() => setStatusFilter("Aceito")}
          >
            <h3>{summary.Aceito}</h3>
            <p>Aceitos</p>
          </div>
        </div>

        {/* Formulário de Escala */}
        <section className="escala-form-section">
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-start",
            }}
          >
            <h2 style={{ flex: 1 }}>
              {editingId ? "Editar Escala" : "Nova Escala"}
            </h2>
            <button
              onClick={() => setIsFormExpanded(!isFormExpanded)}
              style={{
                background: "none",
                border: "none",
                color: "#fff",
                cursor: "pointer",
                fontSize: "1.2rem",
              }}
              title={isFormExpanded ? "Minimizar" : "Expandir"}
            >
              {isFormExpanded ? <FaChevronUp /> : <FaChevronDown />}
            </button>
          </div>
          {isFormExpanded && (
            <form onSubmit={handleSubmit} className="escala-form">
              <div className="form-row">
                <div className="form-group">
                  <label>Selecionar Conjunto (Opcional)</label>
                  <select onChange={handleConjuntoChange}>
                    <option value="">Puxar conjunto automático</option>
                    {conjuntos.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.placaCavalo} / {c.placaCarreta} -{" "}
                        {c.motoristaTitular}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div
                style={{
                  borderTop: "1px solid #eee",
                  margin: "20px 0",
                  paddingTop: "20px",
                }}
              ></div>

              <div className="form-row">
                <div className="form-group">
                  <label>Contrato / Cliente</label>
                  <select
                    name="cliente"
                    value={formData.cliente}
                    onChange={handleInputChange}
                    required
                  >
                    {listaContratos.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label>Nº Viagem</label>
                  <input
                    type="text"
                    name="numeroViagem"
                    value={formData.numeroViagem}
                    onChange={handleInputChange}
                    placeholder="Ex: 12345"
                  />
                </div>
                <div className="form-group">
                  <label>Filial</label>
                  <input
                    type="text"
                    name="filial"
                    value={formData.filial}
                    onChange={handleInputChange}
                    placeholder="Ex: Matriz"
                  />
                </div>
                <div className="form-group">
                  <label>Data e Hora da Viagem</label>
                  <input
                    type="datetime-local"
                    name="dataHora"
                    value={formData.dataHora}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Local de Carga</label>
                  <input
                    type="text"
                    name="localCarga"
                    value={formData.localCarga}
                    onChange={handleInputChange}
                    placeholder="Onde irá carregar"
                  />
                </div>
                <div className="form-group">
                  <label>Fazenda</label>
                  <input
                    type="text"
                    name="fazenda"
                    value={formData.fazenda}
                    onChange={handleInputChange}
                    placeholder="Nome da Fazenda"
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Motorista</label>
                  <input
                    type="text"
                    name="motorista"
                    value={formData.motorista}
                    onChange={handleInputChange}
                    required
                    placeholder="Nome do Motorista"
                  />
                </div>
                <div className="form-group">
                  <label>WhatsApp / Telefone</label>
                  <input
                    type="text"
                    name="telefone"
                    value={formData.telefone}
                    onChange={handleInputChange}
                    maxLength={15}
                    placeholder="(99) 99999-9999"
                  />
                </div>
                <div className="form-group">
                  <label>Placa Cavalo</label>
                  <input
                    type="text"
                    name="cavalo"
                    value={formData.cavalo}
                    onChange={handleInputChange}
                    required
                    placeholder="AAA-0000"
                  />
                </div>
                <div className="form-group">
                  <label>Placa Carreta</label>
                  <input
                    type="text"
                    name="carreta"
                    value={formData.carreta}
                    onChange={handleInputChange}
                    required
                    placeholder="BBB-1111"
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Nota Fiscal</label>
                  <input
                    type="text"
                    name="notaFiscal"
                    value={formData.notaFiscal}
                    onChange={handleInputChange}
                    placeholder="Nº NF"
                  />
                </div>
                <div className="form-group">
                  <label>CTe</label>
                  <input
                    type="text"
                    name="cte"
                    value={formData.cte}
                    onChange={handleInputChange}
                    placeholder="Nº CTe"
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Ocorrências</label>
                <textarea
                  name="ocorrencias"
                  value={formData.ocorrencias}
                  onChange={handleInputChange}
                  rows="3"
                  placeholder="Observações..."
                ></textarea>
              </div>

              <button type="submit" className="btn-escalar">
                {editingId ? "Salvar Alterações" : "Adicionar à Escala"}
              </button>
              {editingId && (
                <button
                  type="button"
                  className="btn-cancel"
                  onClick={handleCancel}
                >
                  Cancelar
                </button>
              )}
            </form>
          )}
        </section>

        {/* Detalhes do Cliente / Operação */}
        <section className="client-info-section">
          <h3>Dados da Operação: {activeTab}</h3>
          <div className="client-info-grid">
            <div className="info-group">
              <label>Produtor</label>
              <input
                type="text"
                name="produtor"
                value={currentDetalhes.produtor || ""}
                onChange={handleDetalheChange}
                placeholder="Nome do Produtor"
              />
            </div>
            <div className="info-group">
              <label>Fazenda</label>
              <input
                type="text"
                name="fazenda"
                value={currentDetalhes.fazenda || ""}
                onChange={handleDetalheChange}
                placeholder="Nome da Fazenda"
              />
            </div>
            <div className="info-group">
              <label>Município</label>
              <input
                type="text"
                name="municipio"
                value={currentDetalhes.municipio || ""}
                onChange={handleDetalheChange}
                placeholder="Cidade/UF"
              />
            </div>
            <div className="info-group">
              <label>Destino / Carga</label>
              <input
                type="text"
                name="destinoCarga"
                value={currentDetalhes.destinoCarga || ""}
                onChange={handleDetalheChange}
                placeholder="Destino da Carga"
              />
            </div>
            <div className="info-group">
              <label>Tipo de Serviço</label>
              <input
                type="text"
                name="tipoServico"
                value={currentDetalhes.tipoServico || ""}
                onChange={handleDetalheChange}
                placeholder="Ex: Colheita, Transporte"
              />
            </div>
            <div className="info-group">
              <label>Início da Colheita</label>
              <input
                type="date"
                name="inicioColheita"
                value={currentDetalhes.inicioColheita || ""}
                onChange={handleDetalheChange}
              />
            </div>
            <div className="info-group">
              <label>Contrato Jurídico</label>
              <input
                type="text"
                name="contratoJuridico"
                value={currentDetalhes.contratoJuridico || ""}
                onChange={handleDetalheChange}
                placeholder="Nº Contrato Jurídico"
              />
            </div>
            <div className="info-group">
              <label>Filial / TMS</label>
              <input
                type="text"
                name="filialTMS"
                value={currentDetalhes.filialTMS || ""}
                onChange={handleDetalheChange}
                placeholder="Filial"
              />
            </div>
            <div className="info-group">
              <label>Hectares</label>
              <input
                type="number"
                name="hectares"
                value={currentDetalhes.hectares || ""}
                onChange={handleDetalheChange}
                placeholder="Área (ha)"
              />
            </div>
            <div className="info-group">
              <label>Contrato</label>
              <input
                type="text"
                name="contrato"
                value={currentDetalhes.contrato || ""}
                onChange={handleDetalheChange}
                placeholder="Código Contrato"
              />
            </div>
            <div className="info-group">
              <label>Distância do Pivô</label>
              <input
                type="text"
                name="distanciaPivo"
                value={currentDetalhes.distanciaPivo || ""}
                onChange={handleDetalheChange}
                placeholder="Km / Metros"
              />
            </div>
            <div className="info-group">
              <label>Latitude</label>
              <input
                type="text"
                name="latitude"
                value={currentDetalhes.latitude || ""}
                onChange={handleDetalheChange}
                placeholder="Lat"
              />
            </div>
            <div className="info-group">
              <label>Longitude</label>
              <div style={{ display: "flex", gap: "5px" }}>
                <input
                  type="text"
                  name="longitude"
                  value={currentDetalhes.longitude || ""}
                  onChange={handleDetalheChange}
                  placeholder="Long"
                  style={{ flex: 1 }}
                />
                <button
                  type="button"
                  onClick={() => {
                    const lat = currentDetalhes.latitude;
                    const lng = currentDetalhes.longitude;
                    if (lat && lng) {
                      window.open(
                        `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`,
                        "_blank"
                      );
                    } else {
                      alert("Preencha Latitude e Longitude para abrir o mapa.");
                    }
                  }}
                  title="Abrir no Google Maps"
                  style={{
                    backgroundColor: "#05f26c",
                    border: "none",
                    borderRadius: "4px",
                    cursor: "pointer",
                    padding: "0 10px",
                    color: "#132426",
                  }}
                >
                  <FaMapMarkerAlt />
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Lista de Escalados */}
        <section className="escala-list-section">
          <h2>Escalas: {activeTab}</h2>
          <div style={{ marginBottom: "20px", display: "flex", gap: "10px" }}>
            <input
              type="text"
              placeholder="Filtrar por Motorista ou Cliente..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                flex: 1,
                padding: "10px",
                border: "1px solid #ddd",
                borderRadius: "4px",
                fontSize: "14px",
              }}
            />
            <input
              type="date"
              value={filterDate}
              onChange={(e) => setFilterDate(e.target.value)}
              title="Filtrar por Data"
              style={{
                padding: "10px",
                border: "1px solid #ddd",
                borderRadius: "4px",
                fontSize: "14px",
              }}
            />
            <button
              onClick={() => setHideFinalized(!hideFinalized)}
              title={
                hideFinalized ? "Mostrar Finalizadas" : "Ocultar Finalizadas"
              }
              style={{
                padding: "10px",
                border: "1px solid #444",
                borderRadius: "4px",
                fontSize: "14px",
                backgroundColor: hideFinalized ? "#1e3a3d" : "#05f26c",
                color: hideFinalized ? "#fff" : "#132426",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: "8px",
                whiteSpace: "nowrap",
              }}
            >
              {hideFinalized ? <FaEyeSlash /> : <FaEye />}
              {hideFinalized ? "Ocultas" : "Visíveis"}
            </button>
          </div>
          <div className="table-container">
            <table className="escala-table">
              <thead>
                <tr>
                  <th>Data/Hora</th>
                  <th>Cliente</th>
                  <th>Viagem / Filial</th>
                  <th>Local / Fazenda</th>
                  <th>Motorista</th>
                  <th>Conjunto (Cavalo/Carreta)</th>
                  <th>Documentos</th>
                  <th>Ocorrências</th>
                  <th>Status</th>
                  <th>Ações</th>
                </tr>
              </thead>
              <tbody>
                {filteredEscalas.map((item) => (
                  <tr key={item.id}>
                    <td>{new Date(item.dataHora).toLocaleString("pt-BR")}</td>
                    <td>{item.cliente}</td>
                    <td>
                      <div>
                        <strong>V:</strong> {item.numeroViagem}
                      </div>
                      <div>
                        <strong>F:</strong> {item.filial}
                      </div>
                    </td>
                    <td>
                      <div>{item.localCarga}</div>
                      <small>{item.fazenda}</small>
                    </td>
                    <td>{item.motorista}</td>
                    <td>
                      <div>
                        <strong>C:</strong> {item.cavalo}
                      </div>
                      <div>
                        <strong>R:</strong> {item.carreta}
                      </div>
                    </td>
                    <td>
                      <div>NF: {item.notaFiscal}</div>
                      <div>CTe: {item.cte}</div>
                    </td>
                    <td>{item.ocorrencias}</td>
                    <td>
                      <span
                        className={`status-badge ${item.status?.toLowerCase()}`}
                      >
                        {item.status || "Pendente"}
                      </span>
                    </td>
                    <td>
                      <button
                        className="action-btn btn-whatsapp"
                        onClick={() => handleSendWhatsapp(item)}
                        title="Enviar WhatsApp"
                      >
                        <FaWhatsapp />
                      </button>
                      <button
                        className="action-btn btn-accept"
                        onClick={() => handleAccept(item.id)}
                        title="Confirmar Aceite"
                      >
                        <FaCheckCircle />
                      </button>
                      <button
                        className="action-btn btn-finalize"
                        onClick={() => handleFinalize(item.id)}
                        title="Finalizar Viagem"
                      >
                        <FaFlagCheckered />
                      </button>
                      <button
                        className="action-btn edit-btn"
                        onClick={() => handleEdit(item)}
                        title="Editar"
                      >
                        <FaEdit />
                      </button>
                      <button
                        className="action-btn delete-btn"
                        onClick={() => handleDelete(item.id)}
                        title="Excluir"
                      >
                        <FaTrash />
                      </button>
                    </td>
                  </tr>
                ))}
                {filteredEscalas.length === 0 && (
                  <tr>
                    <td colSpan="10" style={{ textAlign: "center" }}>
                      {escalas.length === 0
                        ? "Nenhuma escala registrada."
                        : "Nenhum registro encontrado."}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>

        {/* Botão de Finalizar Contrato */}
        {activeTab && (
          <div
            style={{
              marginTop: "20px",
              display: "flex",
              justifyContent: "flex-end",
            }}
          >
            <button
              onClick={handleFinalizeContract}
              style={{
                backgroundColor: "#dc3545",
                color: "#fff",
                padding: "12px 24px",
                border: "none",
                borderRadius: "4px",
                cursor: "pointer",
                fontSize: "16px",
                fontWeight: "bold",
                display: "flex",
                alignItems: "center",
                gap: "10px",
              }}
            >
              <FaFlagCheckered /> Contrato Finalizado
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default Escala;

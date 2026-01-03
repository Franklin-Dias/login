import { useState, useEffect } from "react";
import {
  FaEdit,
  FaTrash,
  FaWhatsapp,
  FaCheckCircle,
  FaPlus,
} from "react-icons/fa";
import "./Escala.css";

function Escala() {
  // Estado para contratos (carrega do localStorage ou usa padrão)
  const [listaContratos, setListaContratos] = useState(() => {
    const saved = localStorage.getItem("listaContratos");
    if (saved) {
      return JSON.parse(saved);
    }
    return ["P-9", "Vale", "Gerdau", "Cemig", "Usiminas"];
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

  // Estado para controlar qual item está sendo editado
  const [editingId, setEditingId] = useState(null);

  // Estado para o campo de busca
  const [searchTerm, setSearchTerm] = useState("");

  // Estado para a aba ativa (Contrato selecionado)
  const [activeTab, setActiveTab] = useState(listaContratos[0]);

  // Estado para o filtro de status
  const [statusFilter, setStatusFilter] = useState("All");

  // Salvar no localStorage sempre que escalas mudar
  useEffect(() => {
    localStorage.setItem("escalas", JSON.stringify(escalas));
  }, [escalas]);

  // Salvar contratos no localStorage
  useEffect(() => {
    localStorage.setItem("listaContratos", JSON.stringify(listaContratos));
  }, [listaContratos]);

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

  const handleSubmit = (e) => {
    e.preventDefault();

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

  const filteredEscalas = escalas.filter(
    (item) =>
      item.cliente === activeTab &&
      (statusFilter === "All" || item.status === statusFilter) &&
      (item.motorista.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.cliente.toLowerCase().includes(searchTerm.toLowerCase()))
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
        </div>

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
          <h2>{editingId ? "Editar Escala" : "Nova Escala"}</h2>
          <form onSubmit={handleSubmit} className="escala-form">
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
        </section>

        {/* Lista de Escalados */}
        <section className="escala-list-section">
          <h2>Escalas: {activeTab}</h2>
          <div style={{ marginBottom: "20px" }}>
            <input
              type="text"
              placeholder="Filtrar por Motorista ou Cliente..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                width: "100%",
                padding: "10px",
                border: "1px solid #ddd",
                borderRadius: "4px",
                fontSize: "14px",
              }}
            />
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
      </div>
    </div>
  );
}

export default Escala;

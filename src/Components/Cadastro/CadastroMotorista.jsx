import React, { useState } from "react";
import { FaFileUpload, FaDownload } from "react-icons/fa";
import "./CadastroMotorista.css";

const CadastroMotorista = ({ onCancel }) => {
  const [formData, setFormData] = useState({
    nome: "",
    cpf: "",
    celular: "",
    filial: "",
    funcao: "Motorista",
  });
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);

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

  const handleFileUpload = (e) => {
    const fileInput = e.target;
    const file = fileInput.files[0];
    if (!file) return;

    setIsUploading(true);
    setUploadProgress(0);

    const reader = new FileReader();

    reader.onprogress = (event) => {
      if (event.lengthComputable) {
        const percent = Math.round((event.loaded / event.total) * 100);
        setUploadProgress(percent);
      }
    };

    reader.onload = (event) => {
      setTimeout(() => {
        const text = event.target.result;
        const lines = text.split("\n");
        const newDrivers = [];
        const existingDrivers = JSON.parse(
          localStorage.getItem("motoristas") || "[]"
        );
        let duplicadosCount = 0;

        // Tenta identificar se a primeira linha é cabeçalho
        const startIndex = lines[0].toLowerCase().includes("nome") ? 1 : 0;

        for (let i = startIndex; i < lines.length; i++) {
          const line = lines[i].trim();
          if (!line) continue;

          // Divide por ponto e vírgula ou vírgula
          const parts = line.split(/[;,]/);

          if (parts.length >= 4) {
            let nome, funcao, cpf, celular, filial;

            if (parts.length >= 5) {
              [nome, funcao, cpf, celular, filial] = parts;
            } else {
              [nome, cpf, celular, filial] = parts;
              funcao = "Motorista";
            }

            nome = nome ? nome.trim() : "";
            funcao = funcao ? funcao.trim() : "Motorista";
            cpf = cpf ? cpf.replace(/\D/g, "") : "";
            celular = celular ? celular.replace(/\D/g, "") : "";
            filial = filial ? filial.trim() : "";

            if (nome && cpf) {
              // Formata CPF
              if (cpf.length > 11) cpf = cpf.slice(0, 11);
              const formattedCpf = cpf.replace(
                /(\d{3})(\d{3})(\d{3})(\d{2})/,
                "$1.$2.$3-$4"
              );

              // Formata Celular
              if (celular.length > 11) celular = celular.slice(0, 11);
              const formattedCelular = celular.replace(
                /^(\d{2})(\d{5})(\d{4})/,
                "($1) $2-$3"
              );

              // Verifica duplicidade (no sistema ou no próprio arquivo)
              const jaExiste = existingDrivers.some(
                (d) => d.cpf === formattedCpf
              );
              const duplicadoNoArquivo = newDrivers.some(
                (d) => d.cpf === formattedCpf
              );

              if (!jaExiste && !duplicadoNoArquivo) {
                newDrivers.push({
                  id: Date.now() + i,
                  nome,
                  cpf: formattedCpf,
                  celular: formattedCelular,
                  filial,
                  funcao,
                });
              } else {
                duplicadosCount++;
              }
            }
          }
        }

        if (newDrivers.length > 0) {
          localStorage.setItem(
            "motoristas",
            JSON.stringify([...existingDrivers, ...newDrivers])
          );
          alert(
            `${newDrivers.length} motoristas importados com sucesso!` +
              (duplicadosCount > 0
                ? ` (${duplicadosCount} duplicados ignorados)`
                : "")
          );
          if (onCancel) onCancel();
        } else if (duplicadosCount > 0) {
          alert(
            `Todos os registros encontrados (${duplicadosCount}) já estão cadastrados ou duplicados.`
          );
        } else {
          alert(
            "Nenhum registro válido encontrado. Verifique o formato: Nome, Função, CPF, Celular, Filial"
          );
        }

        setIsUploading(false);
        setUploadProgress(0);
        fileInput.value = "";
      }, 100);
    };
    reader.readAsText(file);
  };

  const handleDownloadTemplate = () => {
    const csvContent =
      "Nome;Função;CPF;Celular;Filial\nExemplo Motorista;Motorista;000.000.000-00;(00) 00000-0000;Matriz";
    const blob = new Blob(["\uFEFF" + csvContent], {
      type: "text/csv;charset=utf-8;",
    });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "modelo_importacao_motoristas.csv";
    link.click();
  };

  return (
    <div className="cadastro-container">
      <h2>Cadastro de Motorista</h2>

      <div
        style={{
          marginBottom: "20px",
          padding: "15px",
          backgroundColor: "#1e3a3d",
          border: "1px dashed #444",
          borderRadius: "8px",
        }}
      >
        <h3
          style={{
            marginTop: 0,
            fontSize: "1rem",
            color: "#fff",
            display: "flex",
            alignItems: "center",
            gap: "10px",
          }}
        >
          <FaFileUpload /> Importar em Massa (CSV)
        </h3>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "10px",
          }}
        >
          <p style={{ fontSize: "0.85rem", color: "#ccc", margin: 0 }}>
            Formato: <strong>Nome, Função, CPF, Celular, Filial</strong>
          </p>
          <button
            type="button"
            onClick={handleDownloadTemplate}
            style={{
              background: "none",
              border: "1px solid #05f26c",
              borderRadius: "4px",
              color: "#05f26c",
              cursor: "pointer",
              fontSize: "0.8rem",
              padding: "4px 8px",
              display: "flex",
              alignItems: "center",
              gap: "5px",
            }}
          >
            <FaDownload /> Baixar Modelo
          </button>
        </div>
        <input
          type="file"
          accept=".csv"
          onChange={handleFileUpload}
          style={{ color: "#fff", width: "100%" }}
          disabled={isUploading}
        />
        {isUploading && (
          <div className="progress-container">
            <div
              className="progress-bar"
              style={{ width: `${uploadProgress}%` }}
            ></div>
            <span className="progress-text">{uploadProgress}%</span>
          </div>
        )}
      </div>

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
          <label htmlFor="funcao">Função</label>
          <select
            id="funcao"
            name="funcao"
            value={formData.funcao}
            onChange={handleChange}
            required
          >
            <option value="Motorista">Motorista</option>
            <option value="Operador">Operador</option>
            <option value="Manobra">Manobra</option>
          </select>
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

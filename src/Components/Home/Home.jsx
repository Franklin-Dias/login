import {
  FaTruck,
  FaRoute,
  FaExclamationTriangle,
  FaGasPump,
  FaSignOutAlt,
  FaUserCircle,
  FaChevronDown,
  FaChevronUp,
} from "react-icons/fa";
import { useState } from "react";
import CadastroVeiculo from "../Cadastro/CadastroVeiculo";
import Escala from "../Escala/Escala";
import "./Home.css";

const Home = () => {
  const [showSubmenu, setShowSubmenu] = useState(false);
  const [activeView, setActiveView] = useState("dashboard");

  // Dados simulados para o dashboard
  const stats = [
    { title: "Total de Veículos", value: 45, icon: <FaTruck />, color: "blue" },
    { title: "Em Rota", value: 28, icon: <FaRoute />, color: "green" },
    {
      title: "Manutenção",
      value: 4,
      icon: <FaExclamationTriangle />,
      color: "orange",
    },
    {
      title: "Combustível (Mês)",
      value: "R$ 12k",
      icon: <FaGasPump />,
      color: "red",
    },
  ];

  return (
    <div className="home-container">
      <aside className="sidebar">
        <div className="sidebar-header">
          <h2>Gestão de Frotas</h2>
        </div>
        <nav>
          <a
            href="#"
            className={activeView === "dashboard" ? "active" : ""}
            onClick={() => setActiveView("dashboard")}
          >
            Dashboard
          </a>
          <a
            href="#"
            onClick={(e) => {
              e.preventDefault();
              setShowSubmenu(!showSubmenu);
            }}
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            Cadastrar
            {showSubmenu ? (
              <FaChevronUp size={12} />
            ) : (
              <FaChevronDown size={12} />
            )}
          </a>
          {showSubmenu && (
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                paddingLeft: "20px",
                backgroundColor: "rgba(0, 0, 0, 0.1)",
              }}
            >
              <a
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  setActiveView("cadastroVeiculo");
                }}
              >
                Veículos
              </a>
              <a href="#">Motoristas</a>
            </div>
          )}
          <a
            href="./Escala/Escala.jsx"
            className={activeView === "escala" ? "active" : ""}
            onClick={(e) => {
              e.preventDefault();
              setActiveView("escala");
            }}
          >
            Escala
          </a>
          <a href="#">Lista de Descarga</a>
          <a href="#">Manutenção</a>
          <a href="#">Relatórios</a>
          <a href="#">Configurações</a>
        </nav>
      </aside>

      <main className="main-content">
        {activeView === "dashboard" && (
          <>
            <header className="topbar">
              <h1>Visão Geral</h1>
              <div className="user-info">
                <span>Olá, Gestor</span>
                <FaUserCircle className="avatar" />
                <button className="logout-btn" title="Sair">
                  <FaSignOutAlt />
                </button>
              </div>
            </header>

            <div className="stats-grid">
              {stats.map((stat, index) => (
                <div key={index} className={`stat-card ${stat.color}`}>
                  <div className="stat-icon">{stat.icon}</div>
                  <div className="stat-details">
                    <h3>{stat.value}</h3>
                    <p>{stat.title}</p>
                  </div>
                </div>
              ))}
            </div>

            <section className="recent-activity">
              <h2>Atividades Recentes</h2>
              <div className="table-container">
                <table>
                  <thead>
                    <tr>
                      <th>Veículo</th>
                      <th>Motorista</th>
                      <th>Status</th>
                      <th>Horário</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td>ABC-1234</td>
                      <td>Carlos Silva</td>
                      <td>
                        <span className="badge success">Iniciou Rota</span>
                      </td>
                      <td>08:30</td>
                    </tr>
                    <tr>
                      <td>XYZ-9876</td>
                      <td>Ana Souza</td>
                      <td>
                        <span className="badge warning">Abastecimento</span>
                      </td>
                      <td>09:15</td>
                    </tr>
                    <tr>
                      <td>DEF-5678</td>
                      <td>Roberto Dias</td>
                      <td>
                        <span className="badge danger">Alerta de Motor</span>
                      </td>
                      <td>10:45</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </section>
          </>
        )}

        {activeView === "cadastroVeiculo" && (
          <CadastroVeiculo onCancel={() => setActiveView("dashboard")} />
        )}

        {activeView === "escala" && <Escala />}
      </main>
    </div>
  );
};

export default Home;

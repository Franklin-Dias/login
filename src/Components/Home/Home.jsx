
import {
  FaTruck,
  FaRoute,
  FaExclamationTriangle,
  FaGasPump,
  FaSignOutAlt,
  FaUserCircle,
} from "react-icons/fa";
import "./Home.css";

const Home = () => {
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
          <a href="#" className="active">
            Dashboard
          </a>
          <a href="#">Veículos</a>
          <a href="#">Motoristas</a>
          <a href="#">Rotas</a>
          <a href="#">Manutenção</a>
          <a href="#">Relatórios</a>
          <a href="#">Configurações</a>
        </nav>
      </aside>

      <main className="main-content">
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
      </main>
    </div>
  );
};

export default Home;

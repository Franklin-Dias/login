import {
  FaTruck,
  FaRoute,
  FaExclamationTriangle,
  FaSignOutAlt,
  FaUserCircle,
  FaChevronDown,
  FaChevronUp,
  FaDownload,
  FaCalendarCheck,
  FaTimes,
  FaSatellite,
  FaMap,
  FaSearchLocation,
  FaSearch,
  FaList,
  FaMoneyBillWave,
} from "react-icons/fa";
import { useState, useEffect } from "react";
import { renderToStaticMarkup } from "react-dom/server";
// Importações do Leaflet (Requer: npm install leaflet react-leaflet)
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  useMap,
  Polyline,
  useMapEvents,
} from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

import CadastroVeiculo from "../Cadastro/CadastroVeiculo";
import CadastroMotorista from "../Cadastro/CadastroMotorista";
import CadastroConjunto from "../Cadastro/CadastroConjunto";
import DetalhesMotorista from "../Cadastro/DetalhesMotorista";
import Escala from "../Escala/Escala";
import ListadeDescarga from "../ListadeDescarga/ListadeDescarga";
import Placas from "../Placas/Placas";
import "./Home.css";

// Correção para ícones do Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png",
});

// Ícone personalizado para Caminhão (Cavalo)
const truckIconMarkup = renderToStaticMarkup(
  <div
    style={{
      fontSize: "24px",
      color: "#007bff",
      filter: "drop-shadow(2px 2px 2px rgba(0,0,0,0.5))",
    }}
  >
    <FaTruck />
  </div>
);

const truckIcon = L.divIcon({
  html: truckIconMarkup,
  className: "custom-truck-icon", // Remove estilos padrão de quadrado branco
  iconSize: [30, 30],
  iconAnchor: [15, 15],
  popupAnchor: [0, -15],
});

// Ícone personalizado para Pedágio
const tollIconMarkup = renderToStaticMarkup(
  <div
    style={{
      fontSize: "24px",
      color: "#ffc107",
      filter: "drop-shadow(2px 2px 2px rgba(0,0,0,0.5))",
    }}
  >
    <FaMoneyBillWave />
  </div>
);

const tollIcon = L.divIcon({
  html: tollIconMarkup,
  className: "custom-toll-icon",
  iconSize: [30, 30],
  iconAnchor: [15, 15],
  popupAnchor: [0, -15],
});

// Componente para controlar o movimento do mapa
function MapController({ center }) {
  const map = useMap();
  useEffect(() => {
    if (center) {
      map.flyTo(center, 16, { duration: 1.5 });
    }
  }, [center, map]);
  return null;
}

// Componente para capturar cliques no mapa e criar rota manual
function MapEvents({
  isRouteMode,
  setRoutePoints,
  setRouteGeometry,
  setRouteInfo,
  setRouteInstructions,
  setTollMarkers,
}) {
  useMapEvents({
    click(e) {
      if (isRouteMode) {
        setRoutePoints((prev) => [...prev, [e.latlng.lat, e.latlng.lng]]);
        setRouteGeometry([]); // Limpa rota calculada ao adicionar pontos manualmente
        setRouteInfo(null);
        setRouteInstructions([]);
        setTollMarkers([]);
      }
    },
  });
  return null;
}

const Home = () => {
  const [showSubmenu, setShowSubmenu] = useState(false);
  const [activeView, setActiveView] = useState("dashboard");
  const [targetContract, setTargetContract] = useState(null);

  // Estado para veículos em manutenção
  const [veiculosManutencao, setVeiculosManutencao] = useState([]);
  const [historicoManutencao, setHistoricoManutencao] = useState([]);
  const [showMaintenanceHistory, setShowMaintenanceHistory] = useState(true);
  const [sundayDrivers, setSundayDrivers] = useState([]);
  const [veiculosMap, setVeiculosMap] = useState([]);
  const [totalSundays, setTotalSundays] = useState(0);
  const [showSundayPopup, setShowSundayPopup] = useState(false);
  const [currentMaintenancePage, setCurrentMaintenancePage] = useState(1);
  const maintenanceItemsPerPage = 5;
  const [, setTick] = useState(0); // Para atualizar o tempo em tempo real
  const [mapCenter, setMapCenter] = useState([-19.9191, -43.9386]);
  const [isSatellite, setIsSatellite] = useState(false);
  const [isRouteMode, setIsRouteMode] = useState(false);
  const [routePoints, setRoutePoints] = useState([]);
  const [routeGeometry, setRouteGeometry] = useState([]);
  const [routeInfo, setRouteInfo] = useState(null);
  const [routeInstructions, setRouteInstructions] = useState([]);
  const [tollMarkers, setTollMarkers] = useState([]);
  const [showInstructions, setShowInstructions] = useState(false);
  const [originInput, setOriginInput] = useState("");
  const [destinationInput, setDestinationInput] = useState("");
  const [avoidTolls, setAvoidTolls] = useState(false);
  const [fuelPrice, setFuelPrice] = useState(6.0);
  const [fuelConsumption, setFuelConsumption] = useState(2.5);

  useEffect(() => {
    const carregarDados = () => {
      const lista = JSON.parse(localStorage.getItem("listaDescarga") || "[]");
      const emManutencao = lista.filter((item) => item.status === "Manutenção");
      setVeiculosManutencao(emManutencao);

      const historico = JSON.parse(
        localStorage.getItem("historicoManutencao") || "[]"
      );
      setHistoricoManutencao(historico);

      // Carregar veículos para o mapa
      const veiculos = JSON.parse(localStorage.getItem("veiculos") || "[]");
      setVeiculosMap(veiculos);

      // Calcular domingos trabalhados
      const escalas = JSON.parse(localStorage.getItem("escalas") || "[]");
      const driverSundayCounts = {};
      let totalS = 0;

      escalas.forEach((e) => {
        if (e.dataHora && e.status !== "Cancelado") {
          const date = new Date(e.dataHora);
          if (date.getDay() === 0) {
            const driver = e.motorista;
            if (driver) {
              driverSundayCounts[driver] =
                (driverSundayCounts[driver] || 0) + 1;
              totalS++;
            }
          }
        }
      });
      setTotalSundays(totalS);
      const critical = Object.entries(driverSundayCounts)
        .map(([name, count]) => ({ name, count }))
        .filter((d) => d.count > 3)
        .sort((a, b) => b.count - a.count);
      setSundayDrivers(critical);
    };

    carregarDados();
    window.addEventListener("storage", carregarDados);

    // Atualiza o contador de tempo a cada segundo
    const interval = setInterval(() => setTick((t) => t + 1), 1000);

    return () => {
      window.removeEventListener("storage", carregarDados);
      clearInterval(interval);
    };
  }, [activeView]);

  const calcularTempo = (dataInicio) => {
    if (!dataInicio) return "N/A";
    const diff = new Date() - new Date(dataInicio);
    const dias = Math.floor(diff / (1000 * 60 * 60 * 24));
    const horas = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutos = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const segundos = Math.floor((diff % (1000 * 60)) / 1000);

    return dias > 0
      ? `${dias}d ${horas}h ${minutos}m`
      : `${horas}h ${minutos}m ${segundos}s`;
  };

  const handleExportMaintenance = () => {
    if (historicoManutencao.length === 0) {
      alert("Não há dados para exportar.");
      return;
    }

    const csvContent = [
      "Veículo,Motorista,Início,Fim,Duração",
      ...historicoManutencao.map((item) => {
        const inicio = new Date(item.inicio).toLocaleString("pt-BR");
        const fim = new Date(item.fim).toLocaleString("pt-BR");
        return `${item.placa},${item.motorista},"${inicio}","${fim}",${item.duracao}`;
      }),
    ].join("\n");

    const blob = new Blob(["\uFEFF" + csvContent], {
      type: "text/csv;charset=utf-8;",
    });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "historico_manutencao.csv";
    link.click();
  };

  const handleExportSundayDrivers = () => {
    if (sundayDrivers.length === 0) {
      alert("Não há dados para exportar.");
      return;
    }

    const csvContent = [
      "Motorista,Domingos Trabalhados",
      ...sundayDrivers.map((d) => `${d.name},${d.count}`),
    ].join("\n");

    const blob = new Blob(["\uFEFF" + csvContent], {
      type: "text/csv;charset=utf-8;",
    });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "motoristas_domingos.csv";
    link.click();
  };

  const handleLocateVehicle = (placa) => {
    const veiculo = veiculosMap.find((v) => v.placa === placa);
    if (veiculo && veiculo.latitude && veiculo.longitude) {
      const lat = parseFloat(veiculo.latitude);
      const lng = parseFloat(veiculo.longitude);
      if (!isNaN(lat) && !isNaN(lng)) {
        setMapCenter([lat, lng]);
        const mapElement = document.querySelector(".map-section");
        if (mapElement) {
          mapElement.scrollIntoView({ behavior: "smooth" });
        }
      }
    } else {
      alert("Localização deste veículo não cadastrada ou inválida.");
    }
  };

  const getCoordinates = async (input) => {
    // Verifica se é coordenada (lat, lng)
    // Permite espaços opcionais
    const coordRegex = /^-?\d+(\.\d+)?,\s*-?\d+(\.\d+)?$/;
    if (coordRegex.test(input)) {
      const [lat, lng] = input.split(",").map((n) => parseFloat(n.trim()));
      return [lat, lng];
    }

    // Geocodificação via Nominatim (OpenStreetMap)
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
          input
        )}`
      );
      const data = await response.json();
      if (data && data.length > 0) {
        return [parseFloat(data[0].lat), parseFloat(data[0].lon)];
      }
    } catch (error) {
      console.error("Erro na geocodificação:", error);
    }
    return null;
  };

  const getRoadRoute = async (start, end, avoidTolls) => {
    try {
      // OSRM usa lon,lat
      const excludeParam = avoidTolls ? "&exclude=toll" : "";
      const response = await fetch(
        `https://router.project-osrm.org/route/v1/driving/${start[1]},${start[0]};${end[1]},${end[0]}?overview=full&geometries=geojson&steps=true${excludeParam}`
      );
      const data = await response.json();
      if (data.routes && data.routes[0]) {
        const route = data.routes[0];

        // Identifica locais de pedágio e extrai coordenadas
        const tollLocations = [];
        route.legs[0].steps.forEach((step) => {
          const name = step.name ? step.name.toLowerCase() : "";
          if (name.includes("pedágio") || name.includes("pedagio")) {
            if (step.maneuver && step.maneuver.location) {
              // OSRM retorna [lon, lat], Leaflet precisa de [lat, lon]
              tollLocations.push([
                step.maneuver.location[1],
                step.maneuver.location[0],
              ]);
            }
          }
        });
        const hasTolls = tollLocations.length > 0;

        // Formata instruções simples para PT-BR
        const formatInstruction = (step) => {
          const type = step.maneuver.type;
          const modifier = step.maneuver.modifier;
          const name = step.name;
          let text = "";

          switch (type) {
            case "turn":
              text = "Vire";
              break;
            case "new name":
              text = "Siga por";
              break;
            case "depart":
              text = "Saia";
              break;
            case "arrive":
              text = "Chegue ao destino";
              break;
            case "merge":
              text = "Entre";
              break;
            case "ramp":
              text = "Pegue a rampa";
              break;
            case "on ramp":
              text = "Na rampa";
              break;
            case "off ramp":
              text = "Saída";
              break;
            case "fork":
              text = "Bifurcação";
              break;
            case "end of road":
              text = "Fim da rua";
              break;
            case "continue":
              text = "Continue";
              break;
            case "roundabout":
              text = "Na rotatória";
              break;
            default:
              text = "Siga";
          }

          if (modifier) {
            const modMap = {
              uturn: "faça o retorno",
              "sharp right": "acentuada à direita",
              right: "à direita",
              "slight right": "levemente à direita",
              straight: "em frente",
              "slight left": "levemente à esquerda",
              left: "à esquerda",
              "sharp left": "acentuada à esquerda",
            };
            if (modMap[modifier]) text += " " + modMap[modifier];
          }
          if (name) text += ` em ${name}`;
          return text;
        };

        return {
          geometry: route.geometry.coordinates.map((c) => [c[1], c[0]]),
          distance: route.distance,
          duration: route.duration,
          hasTolls: hasTolls,
          tolls: tollLocations,
          steps: route.legs[0].steps.map((s) => ({
            instruction: formatInstruction(s),
            distance: s.distance,
          })),
        };
      }
    } catch (error) {
      console.error("Erro ao buscar rota:", error);
    }
    return null;
  };

  const handleRouteSearch = async () => {
    if (!originInput || !destinationInput) {
      alert("Por favor, preencha origem e destino.");
      return;
    }

    const start = await getCoordinates(originInput);
    const end = await getCoordinates(destinationInput);

    if (start && end) {
      setRoutePoints([start, end]);

      // Busca rota exata seguindo estradas
      const routeData = await getRoadRoute(start, end, avoidTolls);
      if (routeData) {
        setRouteGeometry(routeData.geometry);
        setRouteInfo({
          distance: routeData.distance,
          duration: routeData.duration,
          hasTolls: routeData.hasTolls,
        });
        setRouteInstructions(routeData.steps);
        setTollMarkers(routeData.tolls);
      } else {
        setRouteGeometry([]);
        setRouteInfo(null);
        setRouteInstructions([]);
        setTollMarkers([]);
      }
      setMapCenter(start); // Centraliza no início
    } else {
      alert("Não foi possível localizar um ou ambos os endereços.");
    }
  };

  // Dados simulados para o dashboard
  const stats = [
    { title: "Total de Veículos", value: 45, icon: <FaTruck />, color: "blue" },
    { title: "Em Rota", value: 28, icon: <FaRoute />, color: "green" },
    {
      title: "Manutenção",
      value: veiculosManutencao.length,
      icon: <FaExclamationTriangle />,
      color: "orange",
    },
    {
      title: "Domingos Trabalhados",
      value: totalSundays,
      icon: <FaCalendarCheck />,
      color: "red",
      onClick: () => setShowSundayPopup(true),
    },
  ];

  // Lógica de Paginação para Histórico de Manutenção
  const indexOfLastMaintenance =
    currentMaintenancePage * maintenanceItemsPerPage;
  const indexOfFirstMaintenance =
    indexOfLastMaintenance - maintenanceItemsPerPage;
  const currentMaintenanceItems = historicoManutencao.slice(
    indexOfFirstMaintenance,
    indexOfLastMaintenance
  );
  const totalMaintenancePages = Math.ceil(
    historicoManutencao.length / maintenanceItemsPerPage
  );

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
              <a
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  setActiveView("cadastroMotorista");
                }}
              >
                Cadastrar Motorista
              </a>
              <a
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  setActiveView("cadastroConjunto");
                }}
              >
                Conjunto
              </a>
            </div>
          )}
          <a
            href="#"
            className={activeView === "escala" ? "active" : ""}
            onClick={(e) => {
              e.preventDefault();
              setTargetContract(null);
              setActiveView("escala");
            }}
          >
            Escala
          </a>
          <a
            href="#"
            className={activeView === "placas" ? "active" : ""}
            onClick={(e) => {
              e.preventDefault();
              setActiveView("placas");
            }}
          >
            Placas
          </a>
          <a
            href="#"
            className={activeView === "listaDescarga" ? "active" : ""}
            onClick={(e) => {
              e.preventDefault();
              setActiveView("listaDescarga");
            }}
          >
            Lista de Descarga
          </a>
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
                <div
                  key={index}
                  className={`stat-card ${stat.color}`}
                  onClick={stat.onClick}
                  style={{ cursor: stat.onClick ? "pointer" : "default" }}
                >
                  <div className="stat-icon">{stat.icon}</div>
                  <div className="stat-details">
                    <h3>{stat.value}</h3>
                    <p>{stat.title}</p>
                  </div>
                </div>
              ))}
            </div>

            {showSundayPopup && (
              <div className="popup-overlay">
                <div className="popup-content">
                  <div className="popup-header">
                    <h3>Motoristas com &gt; 3 Domingos</h3>
                    <button onClick={() => setShowSundayPopup(false)}>
                      <FaTimes />
                    </button>
                  </div>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "flex-end",
                      marginBottom: "10px",
                    }}
                  >
                    <button
                      onClick={handleExportSundayDrivers}
                      style={{
                        backgroundColor: "#08401b",
                        color: "#05f26c",
                        border: "1px solid #05f26c",
                        padding: "6px 12px",
                        borderRadius: "4px",
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        gap: "6px",
                        fontSize: "0.85rem",
                        fontWeight: "bold",
                      }}
                    >
                      <FaDownload /> Exportar CSV
                    </button>
                  </div>
                  {sundayDrivers.length > 0 ? (
                    <ul className="sunday-list">
                      {sundayDrivers.map((d, i) => (
                        <li key={i}>
                          <span>{d.name}</span>
                          <span className="sunday-count">{d.count}</span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p
                      style={{
                        textAlign: "center",
                        padding: "20px",
                        color: "#ccc",
                      }}
                    >
                      Nenhum motorista excedeu o limite de 3 domingos.
                    </p>
                  )}
                </div>
              </div>
            )}

            <section
              className="map-section"
              style={{
                marginBottom: "30px",
                background: "#132426",
                padding: "20px",
                borderRadius: "8px",
                boxShadow: "0 2px 5px rgba(0, 0, 0, 0.12)",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: "15px",
                }}
              >
                <h2 style={{ margin: 0 }}>Localização da Frota</h2>
                <div style={{ display: "flex", gap: "10px" }}>
                  {routePoints.length > 0 && (
                    <button
                      onClick={() => {
                        setRoutePoints([]);
                        setRouteGeometry([]);
                        setRouteInfo(null);
                        setRouteInstructions([]);
                        setShowInstructions(false);
                        setTollMarkers([]);
                      }}
                      style={{
                        backgroundColor: "#dc3545",
                        color: "#fff",
                        border: "1px solid #444",
                        padding: "8px 12px",
                        borderRadius: "4px",
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                      }}
                    >
                      <FaTimes /> Limpar Rota
                    </button>
                  )}
                  <button
                    onClick={() => setIsRouteMode(!isRouteMode)}
                    style={{
                      backgroundColor: isRouteMode ? "#e74c3c" : "#1e3a3d",
                      color: "#fff",
                      border: "1px solid #444",
                      padding: "8px 12px",
                      borderRadius: "4px",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                    }}
                  >
                    <FaRoute /> {isRouteMode ? "Parar Rota" : "Criar Rota"}
                  </button>
                  <button
                    onClick={() => setIsSatellite(!isSatellite)}
                    style={{
                      backgroundColor: "#1e3a3d",
                      color: "#fff",
                      border: "1px solid #444",
                      padding: "8px 12px",
                      borderRadius: "4px",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                    }}
                  >
                    {isSatellite ? <FaMap /> : <FaSatellite />}
                    {isSatellite ? "Modo Mapa" : "Modo Satélite"}
                  </button>
                </div>
              </div>

              {/* Inputs para Rota por Texto/Coordenada */}
              <div
                style={{
                  display: "flex",
                  gap: "10px",
                  marginBottom: "15px",
                  flexWrap: "wrap",
                }}
              >
                <input
                  type="text"
                  placeholder="Origem (Cidade ou Lat,Long)"
                  value={originInput}
                  onChange={(e) => setOriginInput(e.target.value)}
                  style={{
                    flex: 1,
                    minWidth: "200px",
                    padding: "10px",
                    borderRadius: "4px",
                    border: "1px solid #444",
                    background: "#1e3a3d",
                    color: "#fff",
                  }}
                />
                <input
                  type="text"
                  placeholder="Destino (Cidade ou Lat,Long)"
                  value={destinationInput}
                  onChange={(e) => setDestinationInput(e.target.value)}
                  style={{
                    flex: 1,
                    minWidth: "200px",
                    padding: "10px",
                    borderRadius: "4px",
                    border: "1px solid #444",
                    background: "#1e3a3d",
                    color: "#fff",
                  }}
                />
                <button
                  onClick={handleRouteSearch}
                  className="btn-new-contract" // Reutilizando estilo de botão verde
                  style={{ whiteSpace: "nowrap" }}
                >
                  <FaSearch /> Traçar Rota
                </button>
                <button
                  onClick={() => setAvoidTolls(!avoidTolls)}
                  style={{
                    backgroundColor: avoidTolls ? "#e74c3c" : "#1e3a3d",
                    color: "#fff",
                    border: "1px solid #444",
                    padding: "10px",
                    borderRadius: "4px",
                    cursor: "pointer",
                    whiteSpace: "nowrap",
                    display: "flex",
                    alignItems: "center",
                    gap: "5px",
                  }}
                  title={avoidTolls ? "Evitando Pedágios" : "Permitir Pedágios"}
                >
                  <FaMoneyBillWave />{" "}
                  {avoidTolls ? "Sem Pedágio" : "Com Pedágio"}
                </button>
              </div>

              {routeInfo && (
                <div style={{ marginBottom: "15px" }}>
                  <div
                    style={{
                      display: "flex",
                      gap: "15px",
                      marginBottom: "10px",
                      alignItems: "center",
                      flexWrap: "wrap",
                      fontSize: "0.9rem",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "5px",
                      }}
                    >
                      <label>Preço Diesel (R$):</label>
                      <input
                        type="number"
                        value={fuelPrice}
                        onChange={(e) =>
                          setFuelPrice(parseFloat(e.target.value))
                        }
                        style={{
                          width: "70px",
                          padding: "5px",
                          borderRadius: "4px",
                          border: "1px solid #444",
                          background: "#1e3a3d",
                          color: "#fff",
                        }}
                        step="0.01"
                      />
                    </div>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "5px",
                      }}
                    >
                      <label>Consumo (km/l):</label>
                      <input
                        type="number"
                        value={fuelConsumption}
                        onChange={(e) =>
                          setFuelConsumption(parseFloat(e.target.value))
                        }
                        style={{
                          width: "60px",
                          padding: "5px",
                          borderRadius: "4px",
                          border: "1px solid #444",
                          background: "#1e3a3d",
                          color: "#fff",
                        }}
                        step="0.1"
                      />
                    </div>
                  </div>

                  <div
                    style={{
                      padding: "10px",
                      backgroundColor: "rgba(5, 242, 108, 0.1)",
                      border: "1px solid #05f26c",
                      borderRadius: "4px",
                      color: "#fff",
                      display: "flex",
                      gap: "20px",
                      alignItems: "center",
                      justifyContent: "space-between",
                      flexWrap: "wrap",
                    }}
                  >
                    <div style={{ display: "flex", gap: "20px" }}>
                      <span>
                        <strong>Distância:</strong>{" "}
                        {(routeInfo.distance / 1000).toFixed(2)} km
                      </span>
                      <span>
                        <strong>Tempo Estimado:</strong>{" "}
                        {Math.floor(routeInfo.duration / 3600)}h{" "}
                        {Math.floor((routeInfo.duration % 3600) / 60)}m
                      </span>
                      <span>
                        <strong>Custo Est.:</strong>{" "}
                        {(
                          (routeInfo.distance / 1000 / fuelConsumption) *
                          fuelPrice
                        ).toLocaleString("pt-BR", {
                          style: "currency",
                          currency: "BRL",
                        })}
                      </span>
                      <span
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "5px",
                          color: routeInfo.hasTolls ? "#ffc107" : "#fff",
                        }}
                      >
                        {routeInfo.hasTolls && <FaMoneyBillWave />}
                        <strong>Pedágios:</strong>{" "}
                        {routeInfo.hasTolls ? "Provável" : "Não detectado"}
                      </span>
                    </div>
                    <button
                      onClick={() => setShowInstructions(!showInstructions)}
                      style={{
                        background: "none",
                        border: "none",
                        color: "#05f26c",
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        gap: "5px",
                      }}
                    >
                      <FaList />{" "}
                      {showInstructions ? "Ocultar Passos" : "Ver Passos"}
                    </button>
                  </div>

                  {showInstructions && routeInstructions.length > 0 && (
                    <div
                      style={{
                        marginTop: "10px",
                        backgroundColor: "#1e3a3d",
                        padding: "10px",
                        borderRadius: "4px",
                        maxHeight: "200px",
                        overflowY: "auto",
                        border: "1px solid #444",
                      }}
                    >
                      <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
                        {routeInstructions.map((step, idx) => (
                          <li
                            key={idx}
                            style={{
                              padding: "8px 0",
                              borderBottom: "1px solid #333",
                              display: "flex",
                              justifyContent: "space-between",
                              fontSize: "0.9rem",
                            }}
                          >
                            <span>
                              {idx + 1}. {step.instruction}
                            </span>
                            <span style={{ color: "#ccc", fontSize: "0.8rem" }}>
                              {step.distance < 1000
                                ? `${Math.round(step.distance)} m`
                                : `${(step.distance / 1000).toFixed(1)} km`}
                            </span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}

              <div
                style={{
                  width: "100%",
                  height: "400px",
                  borderRadius: "8px",
                  overflow: "hidden",
                }}
              >
                <MapContainer
                  center={mapCenter}
                  zoom={12}
                  style={{ height: "100%", width: "100%" }}
                >
                  <MapController center={mapCenter} />
                  <MapEvents
                    isRouteMode={isRouteMode}
                    setRoutePoints={setRoutePoints}
                    setRouteGeometry={setRouteGeometry}
                    setRouteInfo={setRouteInfo}
                    setRouteInstructions={setRouteInstructions}
                    setTollMarkers={setTollMarkers}
                  />
                  <TileLayer
                    url={
                      isSatellite
                        ? "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
                        : "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    }
                    attribution={
                      isSatellite
                        ? "Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community"
                        : '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    }
                  />
                  {routePoints.length > 1 && (
                    <Polyline
                      positions={
                        routeGeometry.length > 0 ? routeGeometry : routePoints
                      }
                      color="red"
                      weight={4}
                    />
                  )}
                  {routePoints.map((pos, idx) => (
                    <Marker key={`route-${idx}`} position={pos}>
                      <Popup>Ponto {idx + 1}</Popup>
                    </Marker>
                  ))}
                  {tollMarkers.map((pos, idx) => (
                    <Marker key={`toll-${idx}`} position={pos} icon={tollIcon}>
                      <Popup>Pedágio Detectado</Popup>
                    </Marker>
                  ))}
                  {veiculosMap.map((v) => {
                    const lat = parseFloat(v.latitude);
                    const lng = parseFloat(v.longitude);
                    if (!isNaN(lat) && !isNaN(lng)) {
                      return (
                        <Marker
                          key={v.id}
                          position={[lat, lng]}
                          icon={
                            v.tipo === "Cavalo"
                              ? truckIcon
                              : new L.Icon.Default()
                          }
                        >
                          <Popup>
                            <strong>{v.placa}</strong>
                            <br />
                            {v.modelo}
                            <br />
                            {v.tipo}
                          </Popup>
                        </Marker>
                      );
                    }
                    return null;
                  })}
                </MapContainer>
              </div>
            </section>

            <div
              style={{
                display: "flex",
                gap: "20px",
                flexWrap: "wrap",
                marginBottom: "30px",
              }}
            >
              <section
                className="recent-activity"
                style={{ flex: 1, minWidth: "300px", marginBottom: 0 }}
              >
                <h2>Veículos em Manutenção</h2>
                <div className="table-container">
                  <table>
                    <thead>
                      <tr>
                        <th>Veículo</th>
                        <th>Motorista</th>
                        <th>Início da Manutenção</th>
                        <th>Tempo Decorrido</th>
                        <th>Ação</th>
                      </tr>
                    </thead>
                    <tbody>
                      {veiculosManutencao.length > 0 ? (
                        veiculosManutencao.map((item) => (
                          <tr key={item.id}>
                            <td>{item.placa}</td>
                            <td>{item.motorista}</td>
                            <td>
                              {new Date(
                                item.inicioManutencao || item.dataHora
                              ).toLocaleString("pt-BR")}
                            </td>
                            <td>
                              <span className="badge danger">
                                {calcularTempo(
                                  item.inicioManutencao || item.dataHora
                                )}
                              </span>
                            </td>
                            <td>
                              <button
                                onClick={() => handleLocateVehicle(item.placa)}
                                title="Ver no Mapa"
                                style={{
                                  background: "none",
                                  border: "none",
                                  color: "#05f26c",
                                  cursor: "pointer",
                                }}
                              >
                                <FaSearchLocation />
                              </button>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan="5" style={{ textAlign: "center" }}>
                            Nenhum veículo em manutenção no momento.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </section>

              <section
                className="recent-activity"
                style={{ flex: 1, minWidth: "300px", marginBottom: 0 }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: "20px",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "10px",
                    }}
                  >
                    <h2 style={{ margin: 0 }}>
                      Histórico de Manutenção (Finalizadas)
                    </h2>
                    <button
                      onClick={() =>
                        setShowMaintenanceHistory(!showMaintenanceHistory)
                      }
                      style={{
                        background: "none",
                        border: "none",
                        color: "#fff",
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                      }}
                      title={showMaintenanceHistory ? "Minimizar" : "Expandir"}
                    >
                      {showMaintenanceHistory ? (
                        <FaChevronUp />
                      ) : (
                        <FaChevronDown />
                      )}
                    </button>
                  </div>
                  <button
                    onClick={handleExportMaintenance}
                    style={{
                      backgroundColor: "#08401b",
                      color: "#05f26c",
                      border: "1px solid #05f26c",
                      padding: "8px 16px",
                      borderRadius: "4px",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                      fontWeight: "bold",
                    }}
                  >
                    <FaDownload /> Exportar CSV
                  </button>
                </div>
                {showMaintenanceHistory && (
                  <>
                    <div className="table-container">
                      <table>
                        <thead>
                          <tr>
                            <th>Veículo</th>
                            <th>Motorista</th>
                            <th>Início</th>
                            <th>Fim</th>
                            <th>Duração Total</th>
                          </tr>
                        </thead>
                        <tbody>
                          {currentMaintenanceItems.length > 0 ? (
                            currentMaintenanceItems.map((item) => (
                              <tr key={item.id}>
                                <td>{item.placa}</td>
                                <td>{item.motorista}</td>
                                <td>
                                  {new Date(item.inicio).toLocaleString(
                                    "pt-BR"
                                  )}
                                </td>
                                <td>
                                  {new Date(item.fim).toLocaleString("pt-BR")}
                                </td>
                                <td>
                                  <span className="badge success">
                                    {item.duracao}
                                  </span>
                                </td>
                              </tr>
                            ))
                          ) : (
                            <tr>
                              <td colSpan="5" style={{ textAlign: "center" }}>
                                Nenhum histórico de manutenção registrado.
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                    {totalMaintenancePages > 1 && (
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "center",
                          alignItems: "center",
                          gap: "15px",
                          marginTop: "15px",
                        }}
                      >
                        <button
                          onClick={() =>
                            setCurrentMaintenancePage((prev) =>
                              Math.max(prev - 1, 1)
                            )
                          }
                          disabled={currentMaintenancePage === 1}
                          style={{
                            padding: "5px 10px",
                            cursor: "pointer",
                            borderRadius: "4px",
                            border: "1px solid #444",
                            background: "#1e3a3d",
                            color: "#fff",
                          }}
                        >
                          Anterior
                        </button>
                        <span style={{ fontSize: "0.9rem" }}>
                          Página {currentMaintenancePage} de{" "}
                          {totalMaintenancePages}
                        </span>
                        <button
                          onClick={() =>
                            setCurrentMaintenancePage((prev) =>
                              Math.min(prev + 1, totalMaintenancePages)
                            )
                          }
                          disabled={
                            currentMaintenancePage === totalMaintenancePages
                          }
                          style={{
                            padding: "5px 10px",
                            cursor: "pointer",
                            borderRadius: "4px",
                            border: "1px solid #444",
                            background: "#1e3a3d",
                            color: "#fff",
                          }}
                        >
                          Próximo
                        </button>
                      </div>
                    )}
                  </>
                )}
              </section>
            </div>
          </>
        )}

        {activeView === "cadastroVeiculo" && (
          <CadastroVeiculo onCancel={() => setActiveView("dashboard")} />
        )}

        {activeView === "cadastroMotorista" && (
          <CadastroMotorista onCancel={() => setActiveView("dashboard")} />
        )}

        {activeView === "cadastroConjunto" && (
          <CadastroConjunto onCancel={() => setActiveView("dashboard")} />
        )}

        {activeView === "detalhesMotorista" && <DetalhesMotorista />}

        {activeView === "escala" && <Escala initialContract={targetContract} />}

        {activeView === "placas" && <Placas />}

        {activeView === "listaDescarga" && <ListadeDescarga />}
      </main>
    </div>
  );
};

export default Home;

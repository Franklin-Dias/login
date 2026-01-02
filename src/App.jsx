import { BrowserRouter, Route, Routes } from "react-router-dom";
import "./App.css";
import Login from "./Components/Login/Login";
import Home from "./Components/Home/Home";
import CadastroVeiculo from "./Components/Cadastro/CadastroVeiculo";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/home" element={<Home />} />
        <Route path="/cadastro-veiculo" element={<CadastroVeiculo />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;

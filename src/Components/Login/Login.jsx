import { FaUser, FaLock } from "react-icons/fa";
import { useState } from "react";
import "./Login.css";

const Login = () => {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");

    const handleSubmit = (event) => {
        event.preventDefault();
        alert(`Username: ${username}, Password: ${password}`);
    
    };


  return (
    <div className="container">
      <form onSubmit={handleSubmit}>
        <h1>Acesse o Sistema</h1>
        <div className="input-field">
          <input
            required
            type="email"
            placeholder="E-mail"
            onChange={(e) => setUsername(e.target.value)}
          />
          <FaUser className="icon" />
        </div>
        <div className="input-field">
          <input
            required
            type="password"
            placeholder="Senha"
            onChange={(e) => setPassword(e.target.value)}
          />
          <FaLock className="icon" />
        </div>

        <div className="recall-forget">
          <label htmlFor="">
            <input type="checkbox" />
            <span>Lembrar de mim</span>
          </label>
          <a href="#">Esqueceu a senha?</a>
        </div>

        <button>Entrar</button>
        <div className="signup-link">
          <p>
            Não tem uma conta? <a href="#">Cadastre-se</a>
          </p>
        </div>
      </form>
    </div>
  );
};

export default Login;

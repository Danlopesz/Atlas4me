import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import api from "../services/api";
import Navbar from "../components/Navbar"; // Importando a Navbar nova

function Login() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [erro, setErro] = useState("");
    const navigate = useNavigate();

    async function handleLogin(e) {
        e.preventDefault();
        setErro("");
        try {
            const response = await api.post("api/auth/login", { email, password });
            const token = response.data.token;
            const userName = response.data.firstName || "Viajante";

            localStorage.setItem("token", token);
            localStorage.setItem("userName", userName);

            alert("Login realizado com sucesso!");
            navigate("/jogar");
        } catch (error) {
            console.error(error);
            setErro("Email ou senha incorretos!");
        }
    }

    return (
        <>
            <Navbar />
            <div className="main-content">
                <div className="glass-card">
                    <h1>Login</h1>
                    <form onSubmit={handleLogin}>
                        <div className="input-box">
                            <label htmlFor="login">Email</label>
                            <input
                                type="text"
                                placeholder="Digite seu email"
                                id="login"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                        </div>
                        <div className="input-box">
                            <label htmlFor="senha">Senha</label>
                            <input
                                type="password"
                                placeholder="Digite sua senha"
                                id="senha"
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                        </div>

                        {erro && <p style={{ color: '#ff4757', margin: '10px 0' }}>{erro}</p>}

                        <button type="submit">Entrar</button>

                        <div style={{ marginTop: '20px' }}>
                            <Link to="/cadastro" className="small-link">Não tem conta? Cadastre-se</Link>
                        </div>
                    </form>
                </div>
            </div>
        </>
    );
}

export default Login;
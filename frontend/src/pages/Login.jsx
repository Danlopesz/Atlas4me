import { Link, useNavigate } from "react-router-dom"; // Adicionei useNavigate
import { useState } from "react"; // Adicionei useState
import api from "../services/api"; // Importe o arquivo criado no Passo 2
import "../assets/Auth.css";

function Login() {
    // 1. Estados para guardar o que o usuário digita
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [erro, setErro] = useState("");

    const navigate = useNavigate(); // Para redirecionar após login

    // 2. Função que dispara quando clica em "Entrar"
    async function handleLogin(e) {
        e.preventDefault(); // Evita que a página recarregue
        setErro("");

        try {
            // ... dentro do try {
            const response = await api.post("api/auth/login", {
                email: email,
                password: password,
            });

            const token = response.data.token;
            // O seu backend provavelmente devolve o firstName também. 
            // Vamos supor que venha response.data.firstName
            const userName = response.data.firstName || "Viajante";

            localStorage.setItem("token", token);
            localStorage.setItem("userName", userName); // <--- SALVANDO O NOME!

            alert("Login realizado com sucesso!");
            navigate("/jogar");
        } catch (error) {
            console.error(error);
            setErro("Email ou senha incorretos!");
        }
    }

    return (
        <>
            <header>
                <div className="inner">
                    <div className="logo">
                        <img src="/src/assets/img/thumbnail_logooriginal.png" alt="Logo" />
                    </div>
                    <nav>
                        <Link to="/">Inicio</Link>
                        <Link to="/como-jogar">Como Jogar</Link>
                        <Link to="/sobre-nos">Sobre nós</Link>
                        <Link to="/login">Login</Link>
                        <Link to="/cadastro">Cadastro</Link>
                    </nav>
                </div>
            </header>

            <div className="auth-container">
                <div className="form-image">
                    <img src="/src/assets/img/thumbnail_logooriginal.png" alt="Login Image" />
                </div>
                <div className="form-content">
                    {/* Adicionei o onSubmit aqui */}
                    <form id="loginForm" onSubmit={handleLogin}>
                        <div className="form-header">
                            <div className="title">
                                <h1>Login</h1>
                            </div>
                        </div>

                        <div className="input-group">
                            <div className="input-box">
                                <label htmlFor="login">Usuário (Email)</label>
                                {/* Liguei o input ao estado 'email' */}
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
                                {/* Liguei o input ao estado 'password' */}
                                <input
                                    type="password"
                                    placeholder="Digite sua senha"
                                    id="senha"
                                    required
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                />
                            </div>
                        </div>

                        {/* Mensagem de Erro (Aparece só se falhar) */}
                        {erro && <p style={{ color: 'red', textAlign: 'center', margin: '10px 0' }}>{erro}</p>}

                        <div className="continue-button">
                            <button type="submit">Entrar</button>
                        </div>
                        <br />
                        <a href="#" className="small-link">Esqueci minha senha</a>
                    </form>
                </div>
            </div>
        </>
    );
}

export default Login;
import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import api from "../services/api";
import "../assets/Auth.css";

function Cadastro() {
    const navigate = useNavigate();
    
    // Removido o campo 'gender' do estado
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        password: ''
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        try {
            // Agora enviamos o formData direto, pois não precisa tratar o gênero
            await api.post('/api/auth/register', formData);
            
            alert('Cadastro realizado com sucesso! Faça login.');
            navigate('/login');

        } catch (error) {
            console.error('Erro ao cadastrar:', error);
            const mensagemErro = error.response?.data?.message || 'Erro ao realizar cadastro. Verifique os dados.';
            alert(mensagemErro);
        }
    };

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
                      <img src="/src/assets/img/thumbnail_logooriginal.png" alt="Imagem Cadastro" />
                </div>

                <div className="form-content">
                    <form onSubmit={handleSubmit}>
                        <div className="form-header">
                            <div className="title">
                                <h1>Cadastre-se</h1>
                            </div>
                            <div className="login-button">
                                <Link to="/login" className="login-link">Já tem conta? Entrar</Link>
                            </div>
                        </div>

                        <div className="input-group">
                            <div className="input-box">
                                <label htmlFor="firstName">Primeiro Nome</label>
                                <input 
                                    id="firstName" 
                                    name="firstName"
                                    type="text" 
                                    placeholder="Digite seu primeiro nome" 
                                    value={formData.firstName}
                                    onChange={handleChange}
                                    required 
                                />
                            </div>

                            <div className="input-box">
                                <label htmlFor="lastName">Sobrenome</label>
                                <input 
                                    id="lastName" 
                                    name="lastName"
                                    type="text" 
                                    placeholder="Digite seu sobrenome" 
                                    value={formData.lastName}
                                    onChange={handleChange}
                                    required 
                                />
                            </div>

                            <div className="input-box">
                                <label htmlFor="email">E-mail</label>
                                <input 
                                    id="email" 
                                    name="email"
                                    type="email" 
                                    placeholder="Digite seu e-mail" 
                                    value={formData.email}
                                    onChange={handleChange}
                                    required 
                                />
                            </div>

                            <div className="input-box">
                                <label htmlFor="password">Senha</label>
                                <input 
                                    id="password" 
                                    name="password"
                                    type="password" 
                                    placeholder="Digite sua senha" 
                                    value={formData.password}
                                    onChange={handleChange}
                                    required 
                                />
                            </div>
                        </div>

                        {/* Removido o bloco de input-box do Gênero aqui */}

                        <div className="continue-button">
                            <button type="submit">Cadastrar</button>
                        </div>
                    </form>
                </div>
            </div>
        </>
    );
}

export default Cadastro;
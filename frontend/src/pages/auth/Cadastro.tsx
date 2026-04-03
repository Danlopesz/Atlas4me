import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import api from "../../services/api";
import Navbar from "../../components/navbar/Navbar";
import axios from 'axios';


function Cadastro() {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        firstName: '', lastName: '', email: '', password: ''
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await api.post('/api/auth/register', formData);
            alert('Cadastro realizado com sucesso! Faça login.');
            navigate('/login');
        } catch (error) {
            console.error('Erro ao cadastrar:', error);

            let mensagemErro = 'Erro ao realizar cadastro.';

            // Verifica se o erro veio do Axios (requisição HTTP)
            if (axios.isAxiosError(error)) {
                mensagemErro = error.response?.data?.message || mensagemErro;
            } else if (error instanceof Error) {
                // Caso seja um erro genérico do JavaScript
                mensagemErro = error.message;
            }

            alert(mensagemErro);
        }
    }

    return (
        <>
            <Navbar />
            <div className="main-content">
                <div className="glass-card">
                    <h1>Cadastre-se</h1>
                    <form onSubmit={handleSubmit}>
                        <div className="input-box">
                            <label>Primeiro Nome</label>
                            <input name="firstName" type="text" placeholder="Seu nome"
                                value={formData.firstName} onChange={handleChange} required />
                        </div>
                        <div className="input-box">
                            <label>Sobrenome</label>
                            <input name="lastName" type="text" placeholder="Seu sobrenome"
                                value={formData.lastName} onChange={handleChange} required />
                        </div>
                        <div className="input-box">
                            <label>E-mail</label>
                            <input name="email" type="email" placeholder="seu@email.com"
                                value={formData.email} onChange={handleChange} required />
                        </div>
                        <div className="input-box">
                            <label>Senha</label>
                            <input name="password" type="password" placeholder="Crie uma senha"
                                value={formData.password} onChange={handleChange} required />
                        </div>

                        <button type="submit">Cadastrar</button>
                        <Link to="/login" className="small-link">Já tem conta? Entrar</Link>
                    </form>
                </div>
            </div>
        </>
    );
}

export default Cadastro;
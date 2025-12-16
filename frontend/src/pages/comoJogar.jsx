import { Link } from "react-router-dom";

function ComoJogar() {
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

            <section className="main-content">
                <div className="hero-text">
                    <h3>AS INSTRUÇÕES SÃO SIMPLES:</h3>
                </div>
                <ul className="instructions">
                    <li>🤔 Pense em um País da América do Sul.</li>
                    <li>🖱️ Clique em <strong>Iniciar Jogo</strong>.</li>
                    <li>✅ Responda as perguntas com <strong>Sim</strong> ou <strong>Não</strong>.</li>
                    <li>🌎 O Atlas tentará adivinhar qual país você pensou!</li>
                </ul>
            </section>
        </>
    );
}

export default ComoJogar;
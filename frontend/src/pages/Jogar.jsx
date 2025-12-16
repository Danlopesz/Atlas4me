import { Link } from "react-router-dom";

function Jogar() {
    return (
        <>
            <header>
                <div className="inner">
                    <div className="logo">
                        <img src="/src/assets/img/thumbnail_logooriginal.png" alt="Logo" />
                    </div>
                    <nav>
                        <Link to="/">Inicio</Link>
                        <Link to="/como-jogar" id="btnComoJogar" className="nav-link">Como Jogar</Link>
                        <Link to="/sobre-nos">Sobre nós</Link>
                        <Link to="/login" id="btnSair">Sair</Link>
                    </nav>
                </div>
            </header>

            <section className="main-content">
                <div className="game-container">
                    <h1 className="game-title">Adivinhando o País</h1>

                    <div id="questionText" className="question">
                        Clique em Iniciar para começar!
                    </div>

                    <div>
                        <button id="startBtn" className="btn-primary">Iniciar Jogo</button>
                    </div>

                    <div id="buttonGroup" className="btn-group" style={{ display: "none" }}>
                        <button id="btnSim" className="btn-yes">Sim</button>
                        <button id="btnNao" className="btn-no">Não</button>
                    </div>

                    <div id="restartBtn" style={{ display: "none", marginTop: 20 }}>
                        <button className="btn-primary">Jogar Novamente</button>
                    </div>
                </div>
            </section>

            <div id="modalComoJogar" className="modal">
                <div className="modal-content">
                    <span className="close-modal">&times;</span>
                    <h2>Como Jogar 🎮</h2>
                    <ul className="instructions-list">
                        <li>🤔 Pense em um País da América do Sul.</li>
                        <li>🖱️ Clique em <strong>Iniciar Jogo</strong>.</li>
                        <li>✅ Responda as perguntas com <strong>Sim</strong> ou <strong>Não</strong>.</li>
                        <li>🌎 O Atlas tentará adivinhar qual país você pensou!</li>
                    </ul>
                </div>
            </div>
        </>
    );
}

export default Jogar;
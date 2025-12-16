import { Link } from "react-router-dom";

function SobreNos() {
    return (
        <>
            <header>
                <div className="inner">
                    <div className="logo">
                        <img src="/img/thumbnail_logooriginal.png" alt="Logo" />
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
            <section>
                <h4>
                    O projeto Atlas4Me está sendo desenvolvido por um grupo de alunos da PUC Minas; o objetivo é construir um jogo que, mediante um número de perguntas respondidas, o algoritmo irá descobrir o país que o usuário está pensando.
                </h4>
            </section>
        </>
    );
}

export default SobreNos;
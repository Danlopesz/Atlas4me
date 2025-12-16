import { Link } from "react-router-dom";

function Home() {
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
                    <h2>PENSE EM UM PAÍS E NÓS IREMOS ADIVINHÁ-LO</h2>
                </div>
                <Link to="/jogar" className="cta-button">Jogar</Link>
            </section>
        </>
    );
}

export default Home;
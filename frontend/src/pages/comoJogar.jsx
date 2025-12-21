import Navbar from '../components/Navbar';

function ComoJogar() {
    return (
        <>
            <Navbar />
            <div className="main-content">
                <div className="glass-card" style={{textAlign: 'left'}}>
                    <h1 style={{textAlign: 'center'}}>Como Jogar</h1>
                    
                    <ul style={{ listStyle: 'none', padding: 0, marginTop: '20px' }}>
                        <li style={{marginBottom: '15px', color: '#ddd'}}>
                            <span style={{color: '#00e5ff', fontWeight: 'bold'}}>1.</span> Pense em um País da América do Sul.
                        </li>
                        <li style={{marginBottom: '15px', color: '#ddd'}}>
                            <span style={{color: '#00e5ff', fontWeight: 'bold'}}>2.</span> Clique em <strong>Iniciar Jogo</strong>.
                        </li>
                        <li style={{marginBottom: '15px', color: '#ddd'}}>
                            <span style={{color: '#00e5ff', fontWeight: 'bold'}}>3.</span> Responda as perguntas com <strong>Sim</strong> ou <strong>Não</strong>.
                        </li>
                        <li style={{marginBottom: '15px', color: '#ddd'}}>
                            <span style={{color: '#00e5ff', fontWeight: 'bold'}}>4.</span> O Atlas tentará adivinhar qual país você pensou!
                        </li>
                    </ul>
                </div>
            </div>
        </>
    );
}

export default ComoJogar;
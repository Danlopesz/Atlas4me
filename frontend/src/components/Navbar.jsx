import { Link } from 'react-router-dom';
import '../assets/Navbar.css'; // Vamos criar o CSS específico abaixo

const Navbar = () => {
  return (
    <header className="navbar">
      <div className="logo">ATLAS4ME</div>
      <nav>
        <ul>
          <li><Link to="/">Início</Link></li>
          <li><Link to="/como-jogar">Como Jogar</Link></li>
          <li><Link to="/login">Login</Link></li>
          <li><Link to="/cadastro" className="btn-outline">Cadastro</Link></li>
        </ul>
      </nav>
    </header>
  );
};

export default Navbar;
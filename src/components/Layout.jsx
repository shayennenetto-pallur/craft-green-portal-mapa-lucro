import { useState } from 'react';
import logoSvg from '../assets/logo.svg';
import AnaliseTime from './sistemas/AnaliseTime';
import FarolLucro from './sistemas/FarolLucro';
import CentralInteligencia from './sistemas/CentralInteligencia';
import Cultura from './sistemas/Cultura';
import Rituais from './sistemas/Rituais';
import OrcamentoFinanceiro from './sistemas/OrcamentoFinanceiro';

const NAV_ITEMS = [
  { id: 'analise-time', letter: 'L', name: 'Análise de Time', sub: 'Liderança' },
  { id: 'farol-lucro', letter: 'L', name: 'Farol do L.U.C.R.O.', sub: 'Liderança', sep: true },
  { id: 'central-inteligencia', letter: 'U', name: 'Central de Inteligência', sub: 'Uniformidade', sep: true },
  { id: 'cultura', letter: 'C', name: 'A Única Coisa Incopiável', sub: 'Cultura', sep: true },
  { id: 'rituais', letter: 'R', name: 'Calendário de Rituais', sub: 'Rituais', sep: true },
  { id: 'orcamento', letter: 'O', name: 'Onboarding Financeiro', sub: 'Orçamento', sep: true },
];

const COMPONENTS = {
  'analise-time': AnaliseTime,
  'farol-lucro': FarolLucro,
  'central-inteligencia': CentralInteligencia,
  'cultura': Cultura,
  'rituais': Rituais,
  'orcamento': OrcamentoFinanceiro,
};

export default function Layout() {
  const [active, setActive] = useState('analise-time');
  const [apiKey, setApiKey] = useState('');

  const ActiveComponent = COMPONENTS[active];

  return (
    <>
      {/* HEADER */}
      <header className="header">
        <div className="header-logo-placeholder">
          <img src={logoSvg} alt="Craft Green" className="header-logo" />
        </div>

        <div className="header-divider" />

        <div className="header-title">
          Mapa do <span>L.U.C.R.O.</span>
        </div>

        <div className="api-key-wrapper">
          <span className="api-key-label">API Key</span>
          <input
            type="password"
            className="api-key-input"
            placeholder="sk-ant-..."
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
          />
        </div>
      </header>

      {/* SIDEBAR */}
      <aside className="sidebar">
        <nav className="sidebar-nav">
          {NAV_ITEMS.map((item) => (
            <div key={item.id}>
              {item.sep && <div className="sidebar-separator" />}
              <div
                className={`nav-item${active === item.id ? ' active' : ''}`}
                onClick={() => setActive(item.id)}
              >
                <div className="nav-icon">{item.letter}</div>
                <div className="nav-text">
                  <span className="nav-name">{item.name}</span>
                  <span className="nav-sub">{item.sub}</span>
                </div>
              </div>
            </div>
          ))}
        </nav>
      </aside>

      {/* MAIN */}
      <main className="main-content">
        <ActiveComponent apiKey={apiKey} />
      </main>

    </>
  );
}

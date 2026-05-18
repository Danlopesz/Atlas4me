import { useState } from 'react';
import './ZoomTutorialPopup.css';

export const ZOOM_TIP_STORAGE_KEY = 'atlas4me_zoom_tip_seen';

interface ZoomTutorialPopupProps {
    onClose: () => void;
}

export function ZoomTutorialPopup({ onClose }: ZoomTutorialPopupProps) {
    const [neverShow, setNeverShow] = useState(false);

    const handleClose = () => {
        if (neverShow) {
            localStorage.setItem(ZOOM_TIP_STORAGE_KEY, '1');
        }
        onClose();
    };

    const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
        if (e.target === e.currentTarget) {
            handleClose();
        }
    };

    return (
        <div className="zoom-tip-backdrop" onClick={handleBackdropClick} role="dialog" aria-modal="true" aria-label="Dica do globo">
            <div className="zoom-tip-card">
                <button
                    className="zoom-tip-close"
                    onClick={handleClose}
                    aria-label="Fechar dica"
                >
                    ✕
                </button>

                <span className="zoom-tip-icon" aria-hidden="true">
                    <svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="#00d4ff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="11" cy="11" r="7.5" />
                        <line x1="20.5" y1="20.5" x2="16.3" y2="16.3" />
                        <line x1="8.5" y1="11" x2="13.5" y2="11" />
                        <line x1="11" y1="8.5" x2="11" y2="13.5" />
                    </svg>
                </span>

                <h2 className="zoom-tip-title">Dica: Use o Globo!</h2>

                <p className="zoom-tip-text">
                    Você pode dar <strong>zoom</strong> e <strong>girar</strong> o globo 3D
                    para visualizar os países destacados. Os países em destaque (iluminados)
                    são os que responderiam <strong>SIM</strong> à pergunta atual.
                    Se o país que você pensou estiver entre os destacados, a resposta é SIM!
                </p>

                <div className="zoom-tip-never-show">
                    <input
                        type="checkbox"
                        id="zoom-tip-never"
                        checked={neverShow}
                        onChange={(e) => setNeverShow(e.target.checked)}
                    />
                    <label htmlFor="zoom-tip-never">Não mostrar novamente</label>
                </div>
            </div>
        </div>
    );
}

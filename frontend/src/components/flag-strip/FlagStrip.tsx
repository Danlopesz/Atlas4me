import './FlagStrip.css';

interface FlagStripProps {
    validIsoCodes: string[];
    /** ISO → URL da bandeira (vindo do campo flag_url do banco via /api/countries) */
    flagUrls: Record<string, string>;
    /** ISO → display name */
    countryNames?: Record<string, string>;
}

export function FlagStrip({ validIsoCodes, flagUrls, countryNames }: FlagStripProps) {
    const N = validIsoCodes.length;

    // 10–50 candidatos: mostrar só contador
    if (N >= 10) {
        if (N > 50 || N === 0) return null;
        return (
            <div className="flag-strip-counter">
                {N} países possíveis
            </div>
        );
    }

    // 0 candidatos: nada
    if (N === 0) return null;

    const isSingle = N === 1;
    const cellPx = isSingle ? 80 : 40;
    const flagH = Math.round(cellPx * 0.75);

    return (
        <div className={`flag-strip${isSingle ? ' flag-strip--single' : ''}`}>
            {validIsoCodes.map((iso) => {
                const url = flagUrls[iso];
                if (!url) return null;
                const label = countryNames?.[iso] ?? iso;

                return (
                    <div key={iso} className="flag-strip-item">
                        <img
                            className="flag-strip-flag"
                            src={url}
                            alt={label}
                            width={cellPx}
                            height={flagH}
                            style={{ objectFit: 'cover', display: 'block' }}
                        />
                        <span className="flag-strip-name">{label}</span>
                    </div>
                );
            })}
        </div>
    );
}

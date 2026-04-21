import { useState, useRef, useEffect, useCallback } from 'react';

interface Country {
    id: number;
    namePt: string;
    isoCode?: string;
    flagUrl?: string;
}

interface CountryComboboxProps {
    countries: Country[];
    value: string | number | null;
    onChange: (id: string | number) => void;
    placeholder?: string;
}

const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: '10px 12px',
    background: 'rgba(255, 255, 255, 0.05)',
    border: '1px solid rgba(0, 229, 255, 0.3)',
    borderRadius: '8px',
    color: 'white',
    fontFamily: 'inherit',
    fontSize: '0.95rem',
    outline: 'none',
    boxSizing: 'border-box',
};

const dropdownStyle: React.CSSProperties = {
    position: 'absolute',
    top: 'calc(100% + 4px)',
    left: 0,
    width: '100%',
    maxHeight: '240px',
    overflowY: 'auto',
    background: 'rgba(5, 7, 22, 0.97)',
    border: '1px solid rgba(0, 229, 255, 0.2)',
    borderRadius: '8px',
    zIndex: 100,
    scrollbarWidth: 'thin' as const,
    scrollbarColor: 'rgba(0, 229, 255, 0.3) transparent',
};

function CountryCombobox({
    countries,
    value,
    onChange,
    placeholder = 'Digite ou selecione um país',
}: CountryComboboxProps) {
    const selectedCountry = countries.find(c => String(c.id) === String(value));
    const [inputText, setInputText] = useState(selectedCountry?.namePt ?? '');
    const [isOpen, setIsOpen] = useState(false);
    const [highlightedIndex, setHighlightedIndex] = useState(0);

    const wrapperRef = useRef<HTMLDivElement>(null);
    const listRef = useRef<HTMLUListElement>(null);

    const filtered = countries.filter(c =>
        c.namePt.toLowerCase().includes(inputText.toLowerCase())
    );

    const selectItem = useCallback((country: Country) => {
        setInputText(country.namePt);
        onChange(country.id);
        setIsOpen(false);
        setHighlightedIndex(0);
    }, [onChange]);

    // Close on outside click
    useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    // Scroll highlighted item into view
    useEffect(() => {
        if (!isOpen || !listRef.current) return;
        const item = listRef.current.children[highlightedIndex] as HTMLElement | undefined;
        item?.scrollIntoView({ block: 'nearest' });
    }, [highlightedIndex, isOpen]);

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (!isOpen) {
            if (e.key === 'ArrowDown' || e.key === 'Enter') setIsOpen(true);
            return;
        }
        if (e.key === 'Escape') {
            setIsOpen(false);
        } else if (e.key === 'ArrowDown') {
            e.preventDefault();
            setHighlightedIndex(i => (i + 1) % Math.max(filtered.length, 1));
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            setHighlightedIndex(i => (i - 1 + Math.max(filtered.length, 1)) % Math.max(filtered.length, 1));
        } else if (e.key === 'Enter') {
            e.preventDefault();
            if (filtered[highlightedIndex]) selectItem(filtered[highlightedIndex]);
        }
    };

    return (
        <div ref={wrapperRef} style={{ position: 'relative', marginBottom: '18px' }}>
            <input
                type="text"
                style={inputStyle}
                value={inputText}
                placeholder={placeholder}
                onFocus={() => setIsOpen(true)}
                onChange={e => {
                    setInputText(e.target.value);
                    setIsOpen(true);
                    setHighlightedIndex(0);
                }}
                onKeyDown={handleKeyDown}
                autoComplete="off"
            />

            {isOpen && (
                <ul ref={listRef} style={{ ...dropdownStyle, listStyle: 'none', margin: 0, padding: '4px 0' }}>
                    {filtered.length === 0 ? (
                        <li style={{ padding: '10px 12px', color: 'rgba(255,255,255,0.4)', fontSize: '0.9rem' }}>
                            Nenhum país encontrado
                        </li>
                    ) : (
                        filtered.map((country, idx) => (
                            <li
                                key={country.id}
                                onMouseDown={() => selectItem(country)}
                                onMouseEnter={() => setHighlightedIndex(idx)}
                                style={{
                                    padding: '10px 12px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '8px',
                                    cursor: 'pointer',
                                    color: 'white',
                                    fontSize: '0.95rem',
                                    background: idx === highlightedIndex
                                        ? 'rgba(0, 229, 255, 0.15)'
                                        : 'transparent',
                                    transition: 'background 0.1s ease',
                                }}
                            >
                                {country.flagUrl && (
                                    <img
                                        src={country.flagUrl}
                                        alt=""
                                        height={16}
                                        style={{ borderRadius: 2, flexShrink: 0 }}
                                    />
                                )}
                                {country.namePt}
                            </li>
                        ))
                    )}
                </ul>
            )}
        </div>
    );
}

export default CountryCombobox;

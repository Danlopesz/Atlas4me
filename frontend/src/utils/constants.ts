

export interface CountryCoordData {
  lat: number;
  lng: number;
  name: string;
  rank: number;
}

export const COUNTRY_COORDS: Record<string, CountryCoordData> = {
  // --- AMÉRICA DO SUL (Base Inicial) ---
  // Rank 1: Brasil, Argentina
  // Rank 2: Colômbia, Peru, Venezuela, Chile, Bolívia
  // Rank 3: Equador, Paraguai, Uruguai, Guianas
  'BR': { lat: -14.235, lng: -51.9253, name: 'Brasil', rank: 1 },
  'AR': { lat: -35.000, lng: -65.000, name: 'Argentina', rank: 1 },
  'UY': { lat: -32.5228, lng: -55.7658, name: 'Uruguai', rank: 3 },
  'PY': { lat: -23.4425, lng: -58.4438, name: 'Paraguai', rank: 3 },
  'BO': { lat: -16.2902, lng: -63.5887, name: 'Bolívia', rank: 2 },
  'CL': { lat: -35.6751, lng: -71.543, name: 'Chile', rank: 2 },
  'PE': { lat: -9.19, lng: -75.0152, name: 'Peru', rank: 2 },
  'EC': { lat: -1.8312, lng: -78.1834, name: 'Equador', rank: 3 },
  'CO': { lat: 4.5709, lng: -74.2973, name: 'Colômbia', rank: 2 },
  'VE': { lat: 6.4238, lng: -66.5897, name: 'Venezuela', rank: 2 },
  'GY': { lat: 4.8604, lng: -58.9302, name: 'Guiana', rank: 3 },
  'SR': { lat: 3.9193, lng: -56.0278, name: 'Suriname', rank: 3 },
  'GF': { lat: 3.9339, lng: -53.1258, name: 'Guiana Francesa', rank: 3 },

  // --- AMÉRICA DO NORTE ---
  'US': { lat: 37.0902, lng: -95.7129, name: 'Estados Unidos', rank: 1 },
  'CA': { lat: 56.1304, lng: -106.3468, name: 'Canadá', rank: 1 },
  'MX': { lat: 23.6345, lng: -102.5528, name: 'México', rank: 2 },

  // --- EUROPA ---
  // Europa tem países territorialmente pequenos, mas densos. 
  // Rússia é 1. França/Espanha são 2. Restante majoritariamente 3.
  'DE': { lat: 51.1657, lng: 10.4515, name: 'Alemanha', rank: 3 },
  'FR': { lat: 46.2276, lng: 2.2137, name: 'França', rank: 2 },
  'ES': { lat: 40.4637, lng: -3.7492, name: 'Espanha', rank: 2 },
  'CH': { lat: 46.8182, lng: 8.2275, name: 'Suíça', rank: 3 },
  'IT': { lat: 41.8719, lng: 12.5674, name: 'Itália', rank: 3 },
  'GB': { lat: 55.3781, lng: -3.436, name: 'Reino Unido', rank: 3 },
  'RU': { lat: 61.524, lng: 105.3188, name: 'Rússia', rank: 1 },

  // --- ÁSIA E OCEANIA ---
  'CN': { lat: 35.8617, lng: 104.1954, name: 'China', rank: 1 },
  'IN': { lat: 20.5937, lng: 78.9629, name: 'Índia', rank: 1 },
  'JP': { lat: 36.2048, lng: 138.2529, name: 'Japão', rank: 3 },
  'KR': { lat: 35.9078, lng: 127.7669, name: 'Coreia do Sul', rank: 3 },
  'TH': { lat: 15.87, lng: 100.9925, name: 'Tailândia', rank: 2 },
  'ID': { lat: -0.7893, lng: 113.9213, name: 'Indonésia', rank: 2 },
  'NZ': { lat: -40.9006, lng: 174.886, name: 'Nova Zelândia', rank: 3 },
  'AU': { lat: -25.2744, lng: 133.7751, name: 'Austrália', rank: 1 },

  // --- ÁFRICA E ORIENTE MÉDIO ---
  'EG': { lat: 26.8206, lng: 30.8025, name: 'Egito', rank: 2 },
  'ZA': { lat: -30.5595, lng: 22.9375, name: 'África do Sul', rank: 2 },
  'TR': { lat: 38.9637, lng: 35.2433, name: 'Turquia', rank: 2 },
  'NG': { lat: 9.082, lng: 8.6753, name: 'Nigéria', rank: 2 },
  'SA': { lat: 23.8859, lng: 45.0792, name: 'Arábia Saudita', rank: 2 }
};
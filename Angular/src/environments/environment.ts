// Entorno de desarrollo - GameStore Online
export const environment = {
  production: false,
  // API key de RAWG (https://rawg.io/apidocs)
  rawgApiKey: '65b5aa01ae9c4b4c9a991a4699cb8244',
  rawgBaseUrl: 'https://api.rawg.io/api',
  // Nombre visible de la tienda
  storeName: 'GameStore Online',
  // Porcentaje de IVA aplicado (RD)
  taxRate: 0.18,
  // Multiplicador para simular precios en RD$ desde un rating base
  priceBaseUsd: 350,
  // Traducción con MiniMax (https://api.MiniMax.io/v1/chat/completions)
  // NOTA: en producción esta key queda visible en el bundle del navegador;
  // considera moverla a un backend proxy si despliegas la app públicamente.
  traduccion: {
    apiKey: 'sk-cp-OC5es2MIQwswqs9Kzl2rvA5hp65knrTHT6Q2HosrfjHprcSaBd5IQJOP2tKrm-9TmiYJMxi7feoop-D2y2bivAi7D2FGaxb5CL971Gt2J0dUEuwN4EUy7jk',
    baseUrl: 'https://api.MiniMax.io/v1',
    modelo: 'MiniMax-M3',
    timeoutMs: 20_000,
  },
};

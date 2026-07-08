// Entorno de producción - GameStore Online
export const environment = {
  production: true,
  rawgApiKey: '65b5aa01ae9c4b4c9a991a4699cb8244',
  rawgBaseUrl: 'https://api.rawg.io/api',
  storeName: 'GameStore Online',
  taxRate: 0.18,
  priceBaseUsd: 350,
  // Traducción con MiniMax
  traduccion: {
    apiKey: 'sk-cp-OC5es2MIQwswqs9Kzl2rvA5hp65knrTHT6Q2HosrfjHprcSaBd5IQJOP2tKrm-9TmiYJMxi7feoop-D2y2bivAi7D2FGaxb5CL971Gt2J0dUEuwN4EUy7jk',
    baseUrl: 'https://api.MiniMax.io/v1',
    modelo: 'MiniMax-M3',
    timeoutMs: 20_000,
  },
};

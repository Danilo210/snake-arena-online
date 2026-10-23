# Snake Arena Online
Jogo multiplayer para navegador de celular, com servidor Node.js e WebSocket.

## Executar localmente
1. Instale Node.js 20+.
2. Abra o terminal nesta pasta.
3. Execute `npm install` e `npm start`.
4. Abra `http://localhost:3000`.

## Publicar
Publique a pasta completa em uma hospedagem Node.js com suporte a WebSocket (por exemplo, Render, Railway ou VPS). Comando de build: `npm install`. Comando de inicialização: `npm start`. Configure o serviço como Web Service, não hospedagem estática. O serviço deve expor a variável PORT automaticamente.

Compartilhe a URL HTTPS com amigos: todos os jogadores conectados ao mesmo servidor entrarão na mesma arena. A partida e a pontuação ficam na memória e reiniciam quando o servidor é reiniciado. Para produção em escala, implemente salas, autenticação, limites de conexão e sincronização otimizada.

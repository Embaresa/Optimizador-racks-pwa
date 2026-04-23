# Otimizador de Racks — PWA

Aplicação web progressiva (PWA) que combina o **Conversor de OT** e o **Otimizador de Racks** numa única app instalável.

## Conteúdo do pacote

```
ot-racks-pwa/
├── index.html              Menu home com atalhos para as duas apps
├── converter.html          Conversor de OT (PDF → Excel)
├── optimizer.html          Otimizador de distribuição em racks
├── manifest.webmanifest    Metadados da PWA
├── sw.js                   Service worker (cache offline)
├── icon-192.png            Ícone 192×192
├── icon-512.png            Ícone 512×512
├── icon-maskable.png       Ícone maskable (Android)
└── README.md               Este ficheiro
```

## Como fazer deploy (3 opções gratuitas)

Para funcionar como PWA (instalável + offline), a app precisa de ser servida por HTTPS. Abrir `index.html` diretamente do disco **não** funciona como PWA.

### Opção A — Netlify Drop (mais fácil, 30 segundos)

1. Aceder a <https://app.netlify.com/drop>
2. Arrastar a pasta `ot-racks-pwa` inteira para a janela do browser
3. Copiar o URL gerado (ex: `https://random-name-12345.netlify.app`)
4. Abrir no telemóvel/desktop — prompt de instalação aparece automaticamente

### Opção B — GitHub Pages (mais permanente)

1. Criar repositório novo no GitHub (ex: `ot-racks-pwa`)
2. Upload de todos os ficheiros da pasta para o repositório
3. Settings → Pages → Source: `main` branch, folder `/root`
4. Aguardar ~1 minuto; URL fica em `https://<user>.github.io/ot-racks-pwa/`

### Opção C — Servidor local (teste rápido)

```bash
cd ot-racks-pwa
python3 -m http.server 8000
```

Abrir <http://localhost:8000> — funciona como PWA em localhost (exceção ao requisito HTTPS).

## Instalar como aplicação

Após abrir o URL num browser moderno:

- **Desktop (Chrome/Edge)**: clicar no ícone de instalação (➕) na barra de endereços, ou no botão "Instalar" que aparece no topo do menu
- **Android (Chrome)**: menu ⋮ → "Adicionar ao ecrã principal"
- **iOS (Safari)**: botão Partilhar (⬆️) → "Adicionar ao Ecrã Principal"

Depois de instalada, a app abre em janela própria (sem barra do browser) e funciona offline após a primeira visita.

## Funcionamento offline

O service worker (`sw.js`) faz cache de:
- Todos os HTMLs e ícones na primeira visita
- Bibliotecas externas (pdf.js, SheetJS, Three.js, jsPDF, fontes Google) conforme vão sendo usadas

Após a primeira utilização online de cada feature, a app continua a funcionar sem internet.

## Atualizar a app

Se fizer alterações a qualquer ficheiro, incrementar a variável `CACHE_VERSION` em `sw.js` (ex: de `'v1'` para `'v2'`). Isto força o browser a buscar os ficheiros novos. Sem este passo, o cache antigo prevalece.

## Limites guardados

Os limites de corte de madeira (barrote máximo, tábua máxima) são guardados em `localStorage` do browser — persistem entre visitas no mesmo dispositivo. Não são sincronizados entre dispositivos.

## Desinstalar

- Desktop: botão direito no ícone → Desinstalar
- Android: pressão longa no ícone → Desinstalar
- iOS: pressão longa → Remover App

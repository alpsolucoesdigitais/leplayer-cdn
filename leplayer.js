class LePlayer extends HTMLElement {
    async connectedCallback() {
        const userName = this.getAttribute('user');
        const playerName = this.getAttribute('player');
        if (!userName || !playerName) {
            console.error('<le-player> requer os atributos: user e player');
            return;
        }

        const container = document.createElement('div');
        container.id = 'temp-player';
        this.appendChild(container);

        const css = document.createElement('link');
        css.rel = 'stylesheet';
        css.href = 'https://cdn.leplayer.com.br/vidstack-bundle.css';
        document.head.appendChild(css);

        const url = `https://flow.leplayer.com.br/webhook/player-request?user=${encodeURIComponent(userName)}&player=${encodeURIComponent(playerName)}`;
        const res = await fetch(url);
        const config = await res.json();

        const module = await import('https://cdn.leplayer.com.br/vidstack-bundle.js');
        const { PlyrLayout, VidstackPlayer, setupGestures } = module;

        // Extrai configurações (igual ao original)
        const srcVideo = config?.['videosrc'];
        const posterVideo = config?.['poster'];
        const tituloVideo = config?.['nome_player'] || 'Player Customizável';
        const ytSource = config?.['url_youtube'];
        const isAutoplay = config?.['autoplay'] || false;
        const isLoop = config?.['forcar_loop'] || false;
        const inicioMudo = config?.['iniciar_mudo'] || false;
        const tempoInicialRaw = config?.['tempo_inicial'];
        const velocidadeRaw = config?.['velocidade_reproducao'] || 1;
        const ocultarControles = config?.['ocultar_controles'] || false;
        const ocultarBotaoCentral = config?.['ocultar_btn_central'] || false;
        const ocultarTempoVideo = config?.['ocultar_tempo_video'] || false;
        const ocultarVolume = config?.['ocultar_ctrl_vol'] || false;
        const ocultarLegendas = config?.['ocultar_btn_legendas'] || false;
        const ocultarConfiguracoes = config?.['ocultar_configs'] || false;
        const desabilitarTelaCheia = config?.['desabilitar_tela-cheia'] || false;
        const ativarBotaoLoop = config?.['btn_loop'] || false;
        const ativarBotaoStop = config?.['btn_stop'] || false;
        const ativarVoltarAvancar = config?.['ativar_btn_voltar-e-avancar'] || false;
        const legendaUrl = config?.['arquivo_legenda'];
        const logoUrl = config?.['watermark'];
        const corPrincipal = config?.['cor_principal'] || '#3cc3ba';
        const corSecundaria = config?.['cor_secundaria'] || '#ffffff';
        const raioBorda = config?.['raio_borda'] || 0;
        const fonteLegenda = config?.['fonte_legenda'] || 'Montserrat';
        const tamanhoLegenda = config?.['tamanho_legenda'] || 'xlarge';
        const negritoLegenda = config?.['negrito'] || false;
        const italicoLegenda = config?.['italico'] || false;
        const sublinhadoLegenda = config?.['sublinhado'] || false;
        const corLegenda = config?.['cor_legenda'] || '#ffffff';
        const corBgLegenda = config?.['cor_bg_legenda'] || '#000000';
        const opacidadeBgLegenda = config?.['opacidade_bg_legenda'] || 0.5;

        const styleGlobal = document.createElement('style');
        styleGlobal.textContent = `
  #temp-player, .plyr { 
    width: 100%;
    height: 100%;
    aspect-ratio: 16 / 9;
    object-fit: contain;
    max-width: 100%;
    margin-left: auto;
    margin-right: auto;
    border-radius: 0px;
    overflow: hidden;
    
  }

  :root {
    --plyr-color-main: #3b82f6;
    --plyr-video-controls-background: linear-gradient(rgba(0, 0, 0, 0), rgba(0, 0, 0, 0.8));
  }

  
   .plyr__control--overlaid svg {
    width: 22px !important;
    height: 22px !important;
    
    }


  .plyr__control--overlaid {
    background: var(--plyr-color-main) !important;
    border-radius: 50% !important;
    padding: 18px !important;
    opacity: 1 !important;
    
  }

  .plyr--playing .plyr__control--overlaid {
    opacity: 0 !important;
    visibility: hidden !important;
  }

  
  .plyr__controls {
    padding-bottom: 10px !important;
    padding-left: 20px !important;
    padding-right: 20px !important;
    flex-wrap: wrap !important;
    justify-content: flex-start !important;
  }

  .plyr__controls .plyr__control {
    background: transparent !important;
    padding: 8px !important;
    transition: background 0.2s ease;
    border-radius: 4px;
  }

  .plyr__controls .plyr__control:hover {
    background: var(--plyr-color-main) !important;
  }

  .plyr__slider__track {
    height: 6px !important;
    border-radius: 3px !important;
  }

  .plyr__slider__thumb {
    background: #ffffff !important;
    height: 16px !important;
    width: 16px !important;
  }

  .plyr__controls>.plyr__control,
  .plyr__controls>.plyr__volume,
  .plyr__controls>.plyr__progress__container,
  .plyr__controls>.plyr__time,
  .plyr__controls>.plyr__menu {
    order: 2;
    margin-left: 1px !important;
    margin-right: 1px !important;
    margin-top: 10px !important;
  }

  .plyr__controls>.plyr__progress__container {
    order: 0;
    flex: calc(100% + 16px) !important;
    margin-left: -8px !important;
    margin-right: -8px !important;
    margin-top: 5px !important;
    margin-bottom: 0px !important;
    align-items: center !important;
    padding-right: 12px !important;
    z-index: 0 !important;
  }

  .plyr__controls>[data-plyr="play"] {
    order: 1;
    margin-left: 0 !important;
  }

  .plyr__controls>.plyr__volume {
    order: 2;
  }

  .plyr__controls>.plyr__time--current {
    order: 3;
    margin-left: 10px !important;
    font-size: 14px !important;
    font-weight: 500 !important;
    margin-right: auto !important;
  }

  .plyr__controls::after {
    content: "";
    flex-grow: 1;
    order: 4;
  }

  .plyr__controls>[data-plyr="captions"] {
    order: 5;
  }

  #vidstack-custom-yt-btn {
    order: 6;
  }

  .plyr__controls>.plyr__menu {
    order: 7;
  }

  .plyr__controls>[data-plyr="fullscreen"] {
    order: 8;
    margin-right: 0 !important;
  }

  .plyr__controls>[data-plyr="pip"],
  .plyr__controls>[data-plyr="airplay"] {
    display: none !important;
  }

  .plyr__menu__container {
    zoom: 0.9 !important;
    bottom: 100% !important;
    top: auto !important;
  }

  .plyr__menu__container .plyr__control--forward {
    padding-right: calc(calc(var(--plyr-control-spacing, 10px) * .7) * 4) !important;
  }

  .plyr__menu__container .plyr__control--back {
    padding-left: calc(calc(var(--plyr-control-spacing, 10px) * .7) * 4) !important;
  }

  #novo-player .plyr__progress { 
    display: flex !important;
    width: 100% !important;
  }

  @media (max-width: 480px) {

    .plyr__control--overlaid {
    width: 56px !important;
    height: 56px !important;
    display: flex !important;
    align-items: center !important;
    justify-content: center !important;
    }

    .plyr__control--overlaid svg {
    width: 24px !important;
    height: 24px !important;
   

    }
    
    .plyr__controls {
      padding: 10px !important;
    }

    .plyr__progress {
      transform: translateY(4px) !important;
    }

    .plyr__slider__track {
      height: 4px !important;
      border-radius: 3px !important;
    }

    .plyr__slider__thumb {
      background: #ffffff !important;
      height: 12px !important;
      width: 12px !important;
    }

    media-volume-slider[data-media-volume-slider] {
      display: none !important;
      width: 0 !important;
      min-width: 0 !important;
      flex: 0 0 0 !important;
    }

    .plyr__controls__item.plyr__volume {
      width: auto !important;
      min-width: 0 !important;
      max-width: 24px !important;
      display: flex !important;
      gap: 0 !important;
    }

    .plyr__controls__item.plyr__time.plyr__time--current {
      margin-left: 0 !important;
      margin-right: 0 !important;
      padding-left: 0 !important;
      padding-right: 0 !important;
    }

    .plyr__controls>.plyr__control, 
    .plyr__controls>.plyr__volume, 
    .plyr__controls>.plyr__progress__container, 
    .plyr__controls>.plyr__time, 
    .plyr__controls>.plyr__menu {
      margin-top: 4px !important;
    }

    .plyr__control--overlaid {
      background: var(--plyr-color-main) !important;
      border-radius: 50% !important;
      padding: 12px !important;
      opacity: 1 !important;
    }

    .plyr__controls .plyr__control {
      background: transparent !important;
      padding: 6px !important;
      transition: background 0.2s ease;
      border-radius: 4px;
    }

    .plyr__controls .plyr__control svg {
      width: 14px !important;
      height: 14px !important;
    }

    #vidstack-custom-loop-btn {
      width: 22px !important;
      height: 22px !important;
    }

    .plyr__controls>.plyr__time--current {
      font-size: 14px !important;
      text-align: left !important;
      margin-left: 2px !important;
    }

    #novo-player .plyr__progress { 
      display: flex !important;
      width: 100% !important;
    }

    .plyr__menu__container {
      zoom: 0.5 !important;
      bottom: 100% !important;
      top: auto !important;
    }

    .plyr__menu__container .plyr__control--forward {
      padding-right: calc(calc(var(--plyr-control-spacing, 10px) * .7) * 4) !important;
    }

    .plyr__menu__container .plyr__control--back {
      padding-left: calc(calc(var(--plyr-control-spacing, 10px) * .7) * 4) !important;
      margin-bottom: 24px !important;
    }

    /* CORRIGE BUG BARRA DE PROGRESSO SOME */

    #temp-player .plyr__progress { 
    display: flex !important; 
    }
}
`;
        document.head.appendChild(styleGlobal);

        const containerEl = document.getElementById('temp-player');
        containerEl.innerHTML = '';
        containerEl.style.borderRadius = `${raioBorda}px`;
        const video = document.createElement('video');
        video.src = srcVideo;
        video.poster = posterVideo;
        video.title = tituloVideo;
        video.controls = !ocultarControles;
        video.setAttribute('playsinline', '');
        video.style.width = '100%';
        video.style.height = '100%';
        if (isAutoplay) { video.autoplay = true; video.muted = true; }
        if (!isAutoplay && inicioMudo) { video.muted = true; }
        if (isLoop) { video.loop = true; }
        containerEl.appendChild(video);

        // RENOMEADO: 'player' para 'vidstackPlayer'
        const vidstackPlayer = await VidstackPlayer.create({
            target: video, src: video.src, title: tituloVideo,
            autoPlay: video.autoplay, muted: video.muted, loop: video.loop, playsInline: true,
            viewType: 'video', streamType: 'on-demand', liveEdgeTolerance: 0, clipStartTime: 0.01,
            onPlayFail: (d, n) => { if (n.isOriginTrusted) n.remote.play(); },
            layout: new PlyrLayout({ speed: [0.5, 0.75, 1, 1.25, 1.5, 2], thumbnails: '', ...(ativarBotaoStop && { stopButton: true }), ...(ativarBotaoLoop && { loopButton: true }) })
        });
        window.meuPlayerVidstack = vidstackPlayer;
        setupGestures(vidstackPlayer);

        function hmsToSeconds(str) { if (!str) return 0; const p = str.split(':'); let s = 0, m = 1; while (p.length) { s += m * parseInt(p.pop(), 10); m *= 60; } return s; }
        const targetSec = hmsToSeconds(tempoInicialRaw);
        const targetRate = parseFloat(velocidadeRaw);
        if (targetSec > 0 || (targetRate > 0 && targetRate !== 1)) {
            let attempts = 0, max = 20;
            const enforcer = setInterval(() => {
                attempts++;
                let needs = false;
                if (!isNaN(targetRate) && targetRate > 0 && Math.abs(vidstackPlayer.playbackRate - targetRate) > 0.01) {
                    vidstackPlayer.playbackRate = targetRate; vidstackPlayer.defaultPlaybackRate = targetRate; needs = true;
                }
                if (!isNaN(targetSec) && targetSec > 0 && Math.abs(vidstackPlayer.currentTime - targetSec) > 0.5 && !vidstackPlayer.live) {
                    if (vidstackPlayer.currentTime < targetSec + 2) vidstackPlayer.currentTime = targetSec; needs = true;
                }
                if (attempts >= max) clearInterval(enforcer);
                else if (!needs && attempts > 8) clearInterval(enforcer);
            }, 200);
        }

        vidstackPlayer.addEventListener('provider-change', () => {
            if (legendaUrl && legendaUrl !== 'URL_DA_SUA_LEGENDA.vtt') {
                vidstackPlayer.textTracks.add({ src: legendaUrl, label: 'Ativado', kind: 'subtitles', language: 'auto', default: !ocultarLegendas });
            }
        });

        setTimeout(() => {
            if (logoUrl && logoUrl.trim()) {
                const wm = document.createElement('div');
                wm.className = 'custom-watermark';
                wm.style.cssText = `position:absolute; bottom:48px; right:1.5%; width:10%; max-width:150px; aspect-ratio:2.5/1; background-image:url('${logoUrl}'); background-size:contain; background-repeat:no-repeat; z-index:9999; pointer-events:none; opacity:0; transition:0.3s;`;
                containerEl.style.position = 'relative';
                containerEl.appendChild(wm);
                vidstackPlayer.addEventListener('time-update', () => { wm.style.opacity = vidstackPlayer.currentTime <= 0.1 ? '0' : '0.7'; });
            }
        }, 500);

        setTimeout(() => {
            const inject = () => {
                const bar = document.querySelector('#temp-player .plyr__controls');
                if (bar && ytSource && !document.getElementById('yt-btn')) {
                    const btn = document.createElement('button');
                    btn.id = 'yt-btn';
                    btn.className = 'plyr__controls__item plyr__control';
                    btn.innerHTML = `<svg viewBox="0 0 24 24" width="18" height="18"><path fill="currentColor" d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg><span class="plyr__tooltip">YouTube</span>`;
                    btn.onclick = () => window.open(ytSource, '_blank');
                    bar.insertBefore(btn, bar.lastElementChild);
                    return true;
                }
                return false;
            };
            const i = setInterval(() => { if (inject()) clearInterval(i); }, 200);
            setTimeout(() => clearInterval(i), 5000);
        }, 500);
    }
}
customElements.define('le-player', LePlayer);

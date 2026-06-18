class LePlayer extends HTMLElement {
  async connectedCallback() {
    const userName = this.getAttribute('user');
    const playerName = this.getAttribute('player');
    if (!userName || !playerName) {
      console.error('<le-player> requer os atributos: user e player');
      return;
    }

    const videoId = this.getAttribute('video');
    if (!videoId) {
        console.error('<le-player> requer o atributo video');
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

    // Extrai configurações do banco
    const srcVideo = `youtube/${videoId}`;
    const posterVideo = config?.['poster'];
    const tituloVideo = config?.['nome_player'] || 'Vídeo';
    const ytSource = `https://www.youtube.com/watch?v=${videoId}`;
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
    const ocultarBotaoYT = config?.['ocultar_btn_yt'] ?? false;
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

    // CSS dinâmico (layout sem cores fixas + variáveis dinâmicas)
    const styleGlobal = document.createElement('style');
    styleGlobal.textContent = `
      
    :root {
        --plyr-video-control-color: ${corSecundaria};
        --plyr-video-control-color-hover: ${corSecundaria};
    }   
    
    /* --- LAYOUT FIXO (sem cores fixas) --- */
      #temp-player, .plyr {
        width: 100%;
        height: 100%;
        aspect-ratio: 16 / 9;
        object-fit: contain;
        max-width: 100%;
        margin-left: auto;
        margin-right: auto;
        border-radius: ${raioBorda}px !important;
        overflow: hidden;
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
      #yt-btn {
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
        #temp-player .plyr__progress {
          display: flex !important;
        }
      }

      /* --- REGRAS DINÂMICAS (cores, legendas, condicionais) --- */
      #temp-player {
        --plyr-color-main: ${corPrincipal};
        --plyr-video-control-color: ${corSecundaria};
        --plyr-video-control-color-hover: ${corSecundaria}
      }
      
      ${ocultarControles ? '#temp-player .plyr__controls { display: none !important; }' : ''}
      ${ocultarBotaoCentral ? '#temp-player .plyr__control--overlaid { display: none !important; }' : ''}
      ${ocultarTempoVideo ? '#temp-player .plyr__time { display: none !important; }' : ''}
      ${ocultarVolume ? '#temp-player .plyr__volume { display: none !important; }' : ''}
      ${ocultarLegendas ? '#temp-player [data-plyr="captions"] { display: none !important; }' : ''}
      ${ocultarConfiguracoes ? '#temp-player [data-plyr="settings"] { display: none !important; }' : ''}
      ${desabilitarTelaCheia ? '#temp-player [data-plyr="fullscreen"] { display: none !important; }' : ''}
      ${!ativarVoltarAvancar ? '#temp-player .plyr__rewind, #temp-player .plyr__fast-forward { display: none !important; }' : ''}

      /* Watermark via CSS (fundo da barra de controles) */
      .custom-watermark {
        display: none !important;
      }

      .plyr--video .plyr__controls {
        background: url('${logoUrl}') 96.5% 0px no-repeat,
          linear-gradient(rgba(0, 0, 0, 0), rgba(0, 0, 0, .5)) !important;
          background-size: 100px auto, auto !important;
        }

    @media (max-width: 480px) {
      .plyr--video .plyr__controls {
      background: url('${logoUrl}') 96.5% 0px no-repeat,
                linear-gradient(rgba(0, 0, 0, 0), rgba(0, 0, 0, .5)) !important;
      background-size: 53px auto, auto !important;
      }
    }

    `;
    document.head.appendChild(styleGlobal);

    // Criação do elemento de vídeo e do player (igual ao seu código)
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
    if (inicioMudo) { video.muted = true; }
    if (!isAutoplay && inicioMudo) { video.muted = true; }
    if (isLoop) { video.loop = true; }
    containerEl.appendChild(video);

    const vidstackPlayer = await VidstackPlayer.create({
      target: video, src: video.src, title: tituloVideo,
      autoPlay: video.autoplay, muted: video.muted, loop: video.loop, playsInline: true,
      viewType: 'video', streamType: 'on-demand', liveEdgeTolerance: 0, clipStartTime: 0.01,
      onPlayFail: (d, n) => { if (n.isOriginTrusted) n.remote.play(); },
      layout: new PlyrLayout({ speed: [0.5,0.75,1,1.25,1.5,2], thumbnails: '', ...(ativarBotaoStop && { stopButton: true }), ...(ativarBotaoLoop && { loopButton: true }) })
    });
    window.meuPlayerVidstack = vidstackPlayer;

    // INICIO MUDO
    const tentativaMudo = setInterval(() => {
    const player = window.meuPlayerVidstack;
    const videoElement = document.querySelector('#temp-player video');

    if (!player) return;

    if (inicioMudo) {
    player.muted = true;
    if (videoElement) {
      videoElement.muted = true;
      videoElement.setAttribute('muted', '');
    }
    }

    clearInterval(tentativaMudo);
    }, 200);

    setTimeout(() => clearInterval(tentativaMudo), 5000);

    setupGestures(vidstackPlayer);


    // --- Aplica estilos de legendas ---
    function applyCaptionStyles() {
    // Limpa estilos anteriores
    const oldStyle = document.getElementById('custom-caption-style');
    if (oldStyle) oldStyle.remove();

    const captionConfig = {
        font: config?.['fonte_legenda'] || 'Roboto',
        bold: config?.['negrito'] ?? false,
        italic: config?.['italico'] ?? false,
        underline: config?.['sublinhado'] ?? false,
        size: config?.['tamanho_legenda'] || 'medium',
        textColor: config?.['cor_legenda'] || '#FFFFFF',
        colorBG: config?.['cor_bg_legenda'] || '#000000',
        opacityBG: config?.['opacidade_bg_legenda'] ?? 0.75
    };

    const sizePixelMap = { 'small': '14px', 'medium': '18px', 'large': '24px', 'xlarge': '32px' };
    const fw = captionConfig.bold ? '700' : '400';
    const fs = captionConfig.italic ? 'italic' : 'normal';
    const td = captionConfig.underline ? 'underline' : 'none';
    const fSize = sizePixelMap[captionConfig.size] || '18px';

    // Calcula cor de fundo com opacidade
    let r = 0, g = 0, b = 0;
    let hex = captionConfig.colorBG.replace('#', '');
    if (hex.length === 3) {
        r = parseInt(hex[0] + hex[0], 16);
        g = parseInt(hex[1] + hex[1], 16);
        b = parseInt(hex[2] + hex[2], 16);
    } else {
        r = parseInt(hex.substring(0, 2), 16);
        g = parseInt(hex.substring(2, 4), 16);
        b = parseInt(hex.substring(4, 6), 16);
    }
    const finalBG = `rgba(${r}, ${g}, ${b}, ${captionConfig.opacityBG})`;

    // Carrega a fonte do Google Fonts
    const fontId = 'custom-caption-font-' + captionConfig.font.replace(/\s+/g, '-');
    if (!document.getElementById(fontId)) {
        const link = document.createElement('link');
        link.id = fontId;
        link.rel = 'stylesheet';
        link.href = `https://fonts.googleapis.com/css2?family=${captionConfig.font.replace(/\s+/g, '+')}:wght@400;700&display=swap`;
        document.head.appendChild(link);
    }

    // Cria o estilo
    const style = document.createElement('style');
    style.id = 'custom-caption-style';
    style.textContent = `
        #temp-player ::cue, #temp-player video::cue {
            font-family: '${captionConfig.font}', sans-serif !important;
            font-weight: ${fw} !important;
            font-style: ${fs} !important;
            text-decoration: ${td} !important;
            font-size: ${fSize} !important;
            color: ${captionConfig.textColor} !important;
            background-color: ${finalBG} !important;
        }
        #temp-player .plyr__caption:empty,
        #temp-player .plyr__caption__text:empty {
            display: none !important;
            opacity: 0 !important;
            background: transparent !important;
            padding: 0 !important;
            margin: 0 !important;
        }
        #temp-player .plyr__caption, #temp-player .plyr__caption__text {
            font-family: '${captionConfig.font}', sans-serif !important;
            font-weight: ${fw} !important;
            font-style: ${fs} !important;
            text-decoration: ${td} !important;
            font-size: ${fSize} !important;
            color: ${captionConfig.textColor} !important;
            background: ${finalBG} !important;
            line-height: 1.4 !important;
            padding: 4px 10px !important;
            border-radius: 4px !important;
            display: inline-block !important;
        }
    `;
    document.head.appendChild(style);
  }


  setTimeout(() => {
    applyCaptionStyles();
  }, 100);

    // Injeção manual do botão stop
    if (ativarBotaoStop) {
    const stopBtnId = 'vidstack-custom-stop-btn';
    const injectStop = () => {
        const playBtn = document.querySelector('#temp-player .plyr__controls [data-plyr="play"]');
        if (!playBtn) return false;
        if (document.getElementById(stopBtnId)) return true;
        const stopBtn = document.createElement('button');
        stopBtn.id = stopBtnId;
        stopBtn.type = 'button';
        stopBtn.className = 'plyr__controls__item plyr__control';
        stopBtn.setAttribute('aria-label', 'Stop');
        stopBtn.innerHTML = `<svg viewBox="0 0 18 18"><rect x="2" y="2" width="14" height="14" fill="currentColor"></rect></svg><span class="plyr__tooltip" role="tooltip">Parar</span>`;
        stopBtn.onclick = () => {
            if (window.meuPlayerVidstack) {
                window.meuPlayerVidstack.pause();
                window.meuPlayerVidstack.currentTime = 0;
            }
        };
        playBtn.insertAdjacentElement('afterend', stopBtn);
        return true;
    };
    const stopInterval = setInterval(() => { if (injectStop()) clearInterval(stopInterval); }, 200);
    setTimeout(() => clearInterval(stopInterval), 5000);
    }

    // Injeção manual do botão de loop (com SVG direto)
    if (ativarBotaoLoop) {
    const loopBtnId = 'vidstack-custom-loop-btn';
    let isClicking = false;

    // Updater de cores (sincroniza cor principal/secundária e estado)
    if (!window.loopIconColorUpdaterNovoPlayer) {
        window.loopIconColorUpdaterNovoPlayer = setInterval(() => {
            if (isClicking) return;

            const loopBtn = document.getElementById(loopBtnId);
            const container = document.getElementById('temp-player');
            if (!loopBtn || loopBtn.style.display === 'none' || !container?.contains(loopBtn)) return;

            const corPrincipal = config?.['cor_principal'] || '#4755F2';
            const corSecundaria = config?.['cor_secundaria'] || '#ffffff';

            const icon = loopBtn.querySelector('svg');
            if (icon && icon.style.fill !== corSecundaria) {
                icon.style.fill = corSecundaria;
            }

            let dynamicStyle = document.getElementById('vidstack-loop-btn-colors-temp-player');
            if (!dynamicStyle) {
                dynamicStyle = document.createElement('style');
                dynamicStyle.id = 'vidstack-loop-btn-colors-temp-player';
                document.head.appendChild(dynamicStyle);
            }

            const newCSS = `
                #temp-player button#${loopBtnId}.plyr__control:hover {
                    background-color: ${corPrincipal} !important;
                }
                #temp-player button#${loopBtnId}.plyr__control[aria-pressed="true"] {
                    background-color: ${corPrincipal} !important;
                }
            `;

            if (dynamicStyle.innerHTML !== newCSS) {
                dynamicStyle.innerHTML = newCSS;
            }
        }, 100);
    }

    const injectLoop = () => {
        const controlsBar = document.querySelector('#temp-player .plyr__controls');
        if (!controlsBar) return false;

        const forwardBtn = document.querySelector('#temp-player .plyr__controls [data-plyr="fast-forward"]');
        const rewindBtn = document.querySelector('#temp-player .plyr__controls [data-plyr="rewind"]');
        const stopBtn = document.getElementById('vidstack-custom-stop-btn');
        const playBtn = document.querySelector('#temp-player .plyr__controls [data-plyr="play"]');
        const lastNavBtn = forwardBtn || rewindBtn || stopBtn || playBtn;
        if (!lastNavBtn) return false;

        let loopBtn = document.getElementById(loopBtnId);
        if (loopBtn) {
            loopBtn.style.display = 'flex';
            if (window.meuPlayerVidstack) {
                const estadoReal = window.meuPlayerVidstack.loop;
                loopBtn.setAttribute('aria-pressed', estadoReal);
                loopBtn.style.backgroundColor = estadoReal ? (config?.['cor_principal'] || '#4755F2') : 'transparent';
            }
            return true;
        }

        // Cria o botão
        loopBtn = document.createElement('button');
        loopBtn.id = loopBtnId;
        loopBtn.type = 'button';
        loopBtn.className = 'plyr__controls__item plyr__control';
        loopBtn.setAttribute('aria-label', 'Loop');

        const isLoopActive = window.meuPlayerVidstack ? window.meuPlayerVidstack.loop : false;
        loopBtn.setAttribute('aria-pressed', isLoopActive);

        Object.assign(loopBtn.style, {
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '32px',
            height: '32px',
            padding: '0',
            backgroundColor: isLoopActive ? (config?.['cor_principal'] || '#4755F2') : 'transparent'
        });

        // Ícone SVG (mesmo do script original)
        loopBtn.innerHTML = `
            <svg viewBox="0 0 18 18" role="presentation" focusable="false" style="width:18px; height:18px; pointer-events:none; fill: ${config?.['cor_secundaria'] || '#ffffff'};">
                <path d="M9 1C4.6 1 1 4.6 1 9s3.6 8 8 8 8-3.6 8-8h-2c0 3.3-2.7 6-6 6s-6-2.7-6-6 2.7-6 6-6v3l5-4-5-4v3z"></path>
            </svg>
            <span class="plyr__tooltip" role="tooltip">Loop</span>
        `;

        loopBtn.onclick = () => {
            if (window.meuPlayerVidstack) {
                isClicking = true;
                const newLoopState = !window.meuPlayerVidstack.loop;
                window.meuPlayerVidstack.loop = newLoopState;
                loopBtn.setAttribute('aria-pressed', newLoopState);
                loopBtn.style.backgroundColor = newLoopState ? (config?.['cor_principal'] || '#4755F2') : 'transparent';
                setTimeout(() => { isClicking = false; }, 250);
            }
        };

        lastNavBtn.insertAdjacentElement('afterend', loopBtn);

        // Sincroniza com forçar loop
        if (window.meuPlayerVidstack && config?.['forcar_loop']) {
            window.meuPlayerVidstack.loop = true;
            loopBtn.setAttribute('aria-pressed', 'true');
            loopBtn.style.backgroundColor = config?.['cor_principal'] || '#4755F2';
        }

        return true;
    };

    const loopInterval = setInterval(() => {
        if (injectLoop()) clearInterval(loopInterval);
    }, 200);
    setTimeout(() => clearInterval(loopInterval), 5000);
    }


    // Injeção manual dos botões de avançar/voltar (seek)
    if (ativarVoltarAvancar) {
    const rewindBtnId = 'vidstack-custom-rewind-btn';
    const forwardBtnId = 'vidstack-custom-forward-btn';

    const injectSeek = () => {
        const controlsBar = document.querySelector('#temp-player .plyr__controls');
        if (!controlsBar) return false;

        const stopBtn = document.getElementById('vidstack-custom-stop-btn');
        const isStopVisible = stopBtn && stopBtn.style.display !== 'none';
        const referenceBtn = isStopVisible
            ? stopBtn
            : document.querySelector('#temp-player .plyr__controls [data-plyr="play"]');

        if (!referenceBtn) return false;

        let rewindBtn = document.getElementById(rewindBtnId);
        if (rewindBtn) {
            rewindBtn.style.display = 'flex';
        } else {
            rewindBtn = document.createElement('button');
            rewindBtn.id = rewindBtnId;
            rewindBtn.type = 'button';
            rewindBtn.className = 'plyr__controls__item plyr__control';
            rewindBtn.setAttribute('aria-label', 'Voltar 10 segundos');
            rewindBtn.innerHTML = `
                <svg viewBox="0 0 18 18"><path d="M16.5 2.5V15.5L9.5 9L16.5 2.5Z" fill="currentColor" opacity="0.6"></path><path d="M9.5 2.5V15.5L2.5 9L9.5 2.5Z" fill="currentColor"></path></svg>
                <span class="plyr__tooltip" role="tooltip">Voltar 10 seg.</span>
            `;
            rewindBtn.onclick = () => {
                if (window.meuPlayerVidstack) {
                    window.meuPlayerVidstack.currentTime = Math.max(0, window.meuPlayerVidstack.currentTime - 10);
                }
            };
            referenceBtn.insertAdjacentElement('afterend', rewindBtn);
        }

        let forwardBtn = document.getElementById(forwardBtnId);
        if (forwardBtn) {
            forwardBtn.style.display = 'flex';
        } else {
            forwardBtn = document.createElement('button');
            forwardBtn.id = forwardBtnId;
            forwardBtn.type = 'button';
            forwardBtn.className = 'plyr__controls__item plyr__control';
            forwardBtn.setAttribute('aria-label', 'Avançar 10 segundos');
            forwardBtn.innerHTML = `
                <svg viewBox="0 0 18 18"><path d="M1.5 2.5V15.5L8.5 9L1.5 2.5Z" fill="currentColor" opacity="0.6"></path><path d="M8.5 2.5V15.5L15.5 9L8.5 2.5Z" fill="currentColor"></path></svg>
                <span class="plyr__tooltip" role="tooltip">Avançar 10 seg.</span>
            `;
            forwardBtn.onclick = () => {
                if (window.meuPlayerVidstack) {
                    const duration = window.meuPlayerVidstack.duration;
                    window.meuPlayerVidstack.currentTime = Math.min(duration, window.meuPlayerVidstack.currentTime + 10);
                }
            };
            rewindBtn.insertAdjacentElement('afterend', forwardBtn);
        }

        return true;
    };

    const seekInterval = setInterval(() => {
        if (injectSeek()) clearInterval(seekInterval);
    }, 200);
    setTimeout(() => clearInterval(seekInterval), 5000);
    }
    

    // Enforcer de tempo/velocidade
    function hmsToSeconds(str) { if (!str) return 0; const p = str.split(':'); let s=0, m=1; while(p.length) { s += m * parseInt(p.pop(),10); m*=60; } return s; }
    const targetSec = hmsToSeconds(tempoInicialRaw);
    const targetRate = parseFloat(velocidadeRaw);
    if (targetSec>0 || (targetRate>0 && targetRate!==1)) {
      let attempts=0, max=20;
      const enforcer = setInterval(() => {
        attempts++;
        let needs = false;
        if (!isNaN(targetRate) && targetRate>0 && Math.abs(vidstackPlayer.playbackRate - targetRate)>0.01) {
          vidstackPlayer.playbackRate = targetRate; vidstackPlayer.defaultPlaybackRate = targetRate; needs = true;
        }
        if (!isNaN(targetSec) && targetSec>0 && Math.abs(vidstackPlayer.currentTime - targetSec)>0.5 && !vidstackPlayer.live) {
          if (vidstackPlayer.currentTime < targetSec+2) vidstackPlayer.currentTime = targetSec; needs = true;
        }
        if (attempts>=max) clearInterval(enforcer);
        else if (!needs && attempts>8) clearInterval(enforcer);
      },200);
    }

    // Legendas
    vidstackPlayer.addEventListener('provider-change', () => {
      if (legendaUrl && legendaUrl!=='URL_DA_SUA_LEGENDA.vtt') {
        vidstackPlayer.textTracks.add({ src: legendaUrl, label: 'Ativado', kind: 'subtitles', language: 'auto', default: !ocultarLegendas });
      }
    });

   
    // Botão YouTube
    setTimeout(() => {
      const inject = () => {
        const bar = document.querySelector('#temp-player .plyr__controls');
        if (bar && ytSource && !document.getElementById('yt-btn') && !ocultarBotaoYT) {
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
      const i = setInterval(() => { if(inject()) clearInterval(i); }, 200);
      setTimeout(() => clearInterval(i), 5000);
    }, 500);


    // Controle de tela cheia (bloqueio + ocultação)
    function applyFullscreenSettings() {
    const controlsBar = document.querySelector('#temp-player .plyr__controls');
    if (!controlsBar) return false;

    const desabilitarTelaCheia = config?.['desabilitar_tela-cheia'] ?? false;

    const fullscreenBtn = document.querySelector('#temp-player [data-plyr="fullscreen"]');
    if (!fullscreenBtn) return false;

    if (desabilitarTelaCheia) {
        window.lePlayerFullscreenBlocked = true;
        fullscreenBtn.style.setProperty('display', 'none', 'important');
    } else {
        window.lePlayerFullscreenBlocked = false;
        fullscreenBtn.style.setProperty('display', 'flex', 'important');
    }

    return true;
    }

    const tentativaTelaCheia = setInterval(() => {
    if (applyFullscreenSettings()) {
        clearInterval(tentativaTelaCheia);
    }
    }, 200);

    setTimeout(() => clearInterval(tentativaTelaCheia), 5000);



    // Força aplicação do raio da borda (igual ao script original)
    function applyBorderRadius() {
    const el = document.getElementById('temp-player');
    if (!el) return false;

    const raw = config['raio_borda'];
    const s = (raw === undefined || raw === null) ? '' : String(raw).trim();
    const normalized = (function(v) {
        if (v === '') return '0px';
        if (/^\d+(\.\d+)?\s*(px|rem|%)?$/.test(v)) {
            return /[a-z%]/i.test(v) ? v.replace(/\s+/g, '') : `${v}px`;
        }
        return v;
    })(s);

    el.style.setProperty('--plyr-border-radius', normalized, 'important');
    el.style.setProperty('border-radius', normalized, 'important');
    el.style.overflow = 'hidden';

    return true;
    }

    let attemptsBorder = 0;
    const maxBorderAttempts = 20;
    const borderInterval = setInterval(() => {
      if (applyBorderRadius()) {
        clearInterval(borderInterval);
        } else if (++attemptsBorder >= maxBorderAttempts) {
        clearInterval(borderInterval);
        }
      }, 200);
      setTimeout(() => clearInterval(borderInterval), 5000);




  }
}
customElements.define('le-player', LePlayer);

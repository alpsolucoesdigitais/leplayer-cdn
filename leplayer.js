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
        css.href = 'https://cdn.leplayer.com.br/leplayer-bundle.css';
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
            #temp-player { border-radius: ${raioBorda}px !important; --plyr-color-main: ${corPrincipal}; --plyr-video-background: ${corSecundaria}; }
            ::cue { font-family: '${fonteLegenda}', sans-serif; font-size: ${tamanhoLegenda === 'xlarge' ? '1.5em' : tamanhoLegenda === 'large' ? '1.2em' : '1em'}; color: ${corLegenda} !important; background-color: ${corBgLegenda}${Math.round(opacidadeBgLegenda * 255).toString(16).padStart(2, '0')} !important; font-weight: ${negritoLegenda ? 'bold' : 'normal'}; font-style: ${italicoLegenda ? 'italic' : 'normal'}; text-decoration: ${sublinhadoLegenda ? 'underline' : 'none'}; }
            ${ocultarControles ? '#temp-player .plyr__controls { display: none !important; }' : ''}
            ${ocultarBotaoCentral ? '#temp-player .plyr__control--overlaid { display: none !important; }' : ''}
            ${ocultarTempoVideo ? '#temp-player .plyr__progress, #temp-player .plyr__duration, #temp-player .plyr__current-time { display: none !important; }' : ''}
            ${ocultarVolume ? '#temp-player .plyr__volume { display: none !important; }' : ''}
            ${ocultarLegendas ? '#temp-player .plyr__menu--captions { display: none !important; }' : ''}
            ${ocultarConfiguracoes ? '#temp-player .plyr__settings { display: none !important; }' : ''}
            ${desabilitarTelaCheia ? '#temp-player .plyr__fullscreen { display: none !important; }' : ''}
            ${!ativarVoltarAvancar ? '#temp-player .plyr__rewind, #temp-player .plyr__fast-forward { display: none !important; }' : ''}
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
            layout: new PlyrLayout({ speed: [0.5,0.75,1,1.25,1.5,2], thumbnails: '', ...(ativarBotaoStop && { stopButton: true }), ...(ativarBotaoLoop && { loopButton: true }) })
        });
        window.meuPlayerVidstack = vidstackPlayer;
        setupGestures(vidstackPlayer);

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

        vidstackPlayer.addEventListener('provider-change', () => {
            if (legendaUrl && legendaUrl!=='URL_DA_SUA_LEGENDA.vtt') {
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
            const i = setInterval(() => { if(inject()) clearInterval(i); }, 200);
            setTimeout(() => clearInterval(i), 5000);
        }, 500);
    }
}
customElements.define('le-player', LePlayer);

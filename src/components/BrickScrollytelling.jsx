import React, { useState, useEffect, useRef } from 'react';
import { Play, X, ChevronDown, MousePointer2, Mail, Instagram, Youtube, ArrowRight, Grid, Plus, Download, ChevronLeft, ChevronRight } from 'lucide-react';

// --- DADOS DOS PROJETOS (Ordem Alfabética) ---
// As imagens devem estar na pasta /public/assets/ do seu projeto.
// Os PDFs devem estar na pasta /public/projetos/ do seu projeto.

const projectsData = [
  {
    id: 2,
    title: "100% ATUALIZADO",
    category: "Documentário",
    genre: "Doc-Série Pop / Games",
    format: "6 episódios de 26 min",
    status: "Finalizado",
    description: "Da clonagem de cartuchos aos campeonatos milionários: a história não oficial de como a pirataria e a \"gambiarra\" construíram a cultura gamer no Brasil.",
    longDescription: "Uma viagem no tempo mostrando como o mercado cinza, a pirataria e a paixão dos brasileiros transformaram o país em uma potência dos games.",
    videoLabel: "Ver Teaser",
    bgImage: "/assets/100hor.webp",
    monolithImage: "/assets/100atuverti.webp",
    vimeoId: "1060607336",
    pdfUrl: "/projetos/PITCH_DECK_100_ATUALIZADO.pdf"
  },
  {
    id: 4,
    title: "BASTIDORES DA MEMÓRIA",
    category: "Documentário",
    genre: "História / Cultura",
    format: "Diversos",
    status: "Exibido (History)",
    description: "Os tesouros ocultos nas reservas técnicas dos museus brasileiros que ajudam a recontar nossa história.",
    longDescription: "Uma série documental que revela o que o público não vê: as reservas técnicas dos museus. Já exibida no History Channel em reedição exclusiva, com a primeira temporada completa disponível na Bandplay e no UOL. Aberta para licenciamento e novas temporadas.",
    videoLabel: "Assistir Episódio 1",
    bgImage: "/assets/bmhorizontal.webp", 
    monolithImage: "/assets/bmvertical.webp",
    vimeoId: "1147440138",
    vimeoHash: "4b6785c3fc",
    pdfUrl: "/projetos/PITCH_DECK_BASTIDORES.pdf"
  },
  {
    id: 6,
    title: "MISTÉRIOS DA BOLA",
    category: "Documentário",
    genre: "Esportes / Mistério",
    format: "TV aberta: 8 min\nPay TV e Streaming: 26 min",
    status: "Em Desenvolvimento",
    description: "Investigação do lado oculto do futebol: maldições, fraudes e histórias que transcendem o campo.",
    longDescription: "O futebol é uma caixinha de surpresas, ou seria uma caixinha de mistérios? Uma série documental com tom de suspense noir sobre o esporte mais amado do mundo.",
    videoLabel: "Ver Pitch",
    bgImage: "/assets/mbhor.webp",
    monolithImage: "/assets/mbverti.webp",
    vimeoId: null, 
    pdfUrl: "/projetos/PITCH_DECK_MISTERIOS_DA_BOLA.pdf"
  },
  {
    id: 5,
    title: "NÃO VAI ZICAR",
    category: "Factual",
    genre: "Humor Esportivo",
    format: "Episódios de 4 min",
    status: "Piloto Disponível",
    host: "Andrey Raychtock",
    description: "Uma sátira inteligente ao mundo das bets que usa estatísticas reais para dar sentido às coincidências mais incríveis do futebol.",
    longDescription: "Andrey Raychtock comanda este formato curto e ágil, perfeito para redes sociais e intervalos comerciais, desvendando as curiosidades do esporte.",
    videoLabel: "Ver Piloto",
    bgImage: "/assets/nvzhorizontal.webp",
    monolithImage: "/assets/nvzvert.webp",
    vimeoId: "1091855463",
    vimeoHash: "fb313f7730",
    pdfUrl: "/projetos/PITCH_DECK_NAO_VAI_ZICAR.pdf"
  },
  {
    id: 7,
    title: "SUPER CORPO",
    category: "Documentário",
    genre: "Saúde / Lifestyle",
    format: "TV aberta: 8 min\nPay TV e Streaming: 26 min",
    status: "Em Captação",
    host: "Mari Goldfarb",
    description: "Estamos vivendo mais, mas como viver melhor? Uma jornada em busca da longevidade.",
    longDescription: "Mari Goldfarb conduz entrevistas e experiências em busca dos segredos para uma vida longa, saudável e equilibrada.",
    videoLabel: "Ver Manifesto",
    bgImage: "/assets/schor.webp",
    monolithImage: "/assets/scorvert.webp",
    vimeoId: "1110052878",
    vimeoHash: "deca249548",
    pdfUrl: "/projetos/PITCH_DECK_SUPERCORPO.pdf"
  },
  {
    id: 3,
    title: "TROCA DE CHEFIA",
    category: "Reality",
    genre: "Empreendedorismo",
    format: "Episódios de 26 ou 56 min",
    status: "Formato Pronto",
    description: "Dois donos de negócios vivem por um dia os desafios um do outro. Empatia e gestão na prática.",
    longDescription: "O que acontece quando um dono de padaria troca de lugar com a dona de uma oficina mecânica? Um reality show ágil sobre os desafios reais de empreender.",
    videoLabel: "Ver Teaser",
    bgImage: "/assets/tcfhor.webp",
    monolithImage: "/assets/tfvert.webp",
    vimeoId: "1110027782",
    vimeoHash: "6295e6a248",
    pdfUrl: "/projetos/PITCH_DECK_TROCA_DE_CHEFIA.pdf"
  },
  {
    id: 1,
    title: "TU TÁ NO RJ",
    category: "Documentário",
    genre: "True Crime de Humor",
    format: "TV aberta: 8 min\nPay TV e Streaming: 26 min",
    status: "Em Desenvolvimento",
    description: "Esqueça o serial killer. Uma investigação irreverente sobre os crimes mais surreais, criativos e ilógicos que só poderiam acontecer no Rio de Janeiro.",
    longDescription: "Uma investigação irreverente sobre os crimes mais surreais que aconteceram no Rio de Janeiro. Um True Crime à brasileira que foge do óbvio e mergulha no caos urbano carioca.",
    videoLabel: "Ver Promo", 
    bgImage: "/assets/TTRJHOR.webp",
    monolithImage: "/assets/ttrjvert.webp",
    vimeoId: "1091288426",
    vimeoHash: "59bc6e3eb4",
    pdfUrl: "/projetos/PITCH_DECK_TU_TA_NO_RJ.pdf"
  }
];

// --- COMPONENTES AUXILIARES ---

const ScrollIndicator = () => (
  <div className="absolute bottom-12 left-1/2 transform -translate-x-1/2 flex flex-col items-center gap-2 z-20 mix-blend-difference pointer-events-none">
    <div className="h-16 w-[1px] bg-white animate-pulse"></div>
    <span className="text-[10px] uppercase tracking-[0.3em] text-white font-bold">Scroll</span>
  </div>
);

const ModularGridBackground = () => (
  <div className="absolute inset-0 pointer-events-none z-0">
    <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:40px_40px]"></div>
    <div className="absolute inset-0 bg-black/80"></div> 
  </div>
);

const VideoModal = ({ project, onClose, onNext, onPrev }) => {
  if (!project) return null;

  // URL do Vimeo sem Autoplay
  const videoSrc = project.vimeoId 
    ? `https://player.vimeo.com/video/${project.vimeoId}?autoplay=0&title=0&byline=0&portrait=0${project.vimeoHash ? `&h=${project.vimeoHash}` : ''}`
    : null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-8 bg-black/95 backdrop-blur-xl animate-in fade-in duration-300">
      <div className="relative w-full max-w-5xl h-full md:h-auto max-h-[90vh] bg-zinc-950 border border-zinc-800 flex flex-col shadow-2xl overflow-hidden rounded-lg">
        
        {/* Header do Modal */}
        <div className="flex justify-between items-center p-6 border-b border-zinc-900 bg-zinc-950 z-50">
          <div className="flex flex-col">
             <span className="text-red-600 font-bold text-xs tracking-widest uppercase mb-1">Brick Originals</span>
             <h2 className="text-2xl font-black text-white uppercase tracking-tighter">{project.title}</h2>
          </div>
          <button 
            onClick={onClose}
            className="group flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-zinc-500 hover:text-white transition-colors bg-zinc-900 hover:bg-zinc-800 px-3 py-2 rounded-full border border-zinc-800"
          >
            Fechar <X size={18} className="group-hover:text-red-600 transition-colors" />
          </button>
        </div>

        <div className="flex flex-col md:flex-row h-full overflow-hidden">
            {/* ÁREA PRINCIPAL: PLAYER E CONTEÚDO MOBILE */}
            <div className="w-full md:w-2/3 bg-black flex flex-col relative group overflow-y-auto md:overflow-y-visible">
               {/* Container do Vídeo (Aspect Ratio 16:9) */}
               <div className="w-full aspect-video relative bg-zinc-900 overflow-hidden flex-shrink-0">
                   {project.vimeoId ? (
                     <iframe 
                       src={videoSrc} 
                       className="absolute inset-0 w-full h-full" 
                       frameBorder="0" 
                       allow="fullscreen; picture-in-picture; clipboard-write; encrypted-media; web-share" 
                       allowFullScreen
                       title={project.title}
                     ></iframe>
                   ) : (
                     // Fallback para projetos sem vídeo
                     <div className="absolute inset-0 w-full h-full">
                        <div 
                          className="absolute inset-0 bg-cover bg-center transition-transform duration-[10s] hover:scale-105"
                          style={{ backgroundImage: `url(${project.bgImage})` }}
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-zinc-900/80 via-transparent to-transparent" />
                        <div className="absolute bottom-6 left-6 right-6">
                           <span className="inline-block px-3 py-1 bg-white/10 backdrop-blur-md border border-white/20 rounded text-xs text-white uppercase tracking-wider mb-2">
                             Em Desenvolvimento
                           </span>
                           <p className="text-zinc-400 text-sm italic">
                             Material de vídeo confidencial ou em produção. Baixe o projeto para saber mais.
                           </p>
                        </div>
                     </div>
                   )}
               </div>
               
               {/* CONTEÚDO MOBILE (Abaixo do vídeo) */}
               <div className="md:hidden bg-zinc-950 p-6 flex flex-col gap-6">
                  
                  {/* Gênero (Topo) */}
                  <div className="pb-4 border-b border-zinc-900">
                      <span className="block text-zinc-500 text-[10px] uppercase tracking-widest mb-1 font-bold">Gênero</span>
                      <span className="text-white text-sm font-bold">{project.genre}</span>
                  </div>

                  {/* Sinopse */}
                  <div>
                      <span className="block text-zinc-500 text-[10px] uppercase tracking-widest mb-2 font-bold">Sinopse</span>
                      <p className="text-zinc-300 text-sm leading-relaxed">{project.longDescription}</p>
                  </div>

                  {/* Formato e Host (Restante) */}
                  <div className="space-y-4 pt-4 border-t border-zinc-900">
                      <div>
                          <span className="block text-zinc-500 text-[10px] uppercase tracking-widest mb-1 font-bold">Formato</span>
                          <span className="text-white text-sm font-bold whitespace-pre-line">{project.format}</span>
                      </div>
                      {project.host && (
                          <div>
                              <span className="block text-zinc-500 text-[10px] uppercase tracking-widest mb-1 font-bold">Apresentação</span>
                              <span className="text-white text-sm font-bold">{project.host}</span>
                          </div>
                      )}
                  </div>

                  {/* Navegação Mobile */}
                  <div className="flex gap-2 mt-2">
                      <button onClick={onPrev} className="flex-1 py-3 bg-zinc-900 border border-zinc-800 text-white text-[10px] font-bold uppercase tracking-widest hover:bg-zinc-800 flex items-center justify-center gap-2 rounded-sm">
                          <ChevronLeft size={14} /> Ant
                      </button>
                      <button onClick={onNext} className="flex-1 py-3 bg-zinc-900 border border-zinc-800 text-white text-[10px] font-bold uppercase tracking-widest hover:bg-zinc-800 flex items-center justify-center gap-2 rounded-sm">
                          Próx <ChevronRight size={14} />
                      </button>
                  </div>

                  {/* Botão de Download Mobile */}
                  {project.pdfUrl ? (
                      <a 
                        href={project.pdfUrl}
                        download
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full py-4 bg-white text-black text-xs font-black uppercase tracking-widest rounded-sm flex items-center justify-center gap-2 cursor-pointer active:scale-95 transition-transform shadow-lg"
                      >
                          <Download size={16} />
                          BAIXAR PROJETO
                      </a>
                  ) : (
                      <button disabled className="w-full py-4 bg-zinc-800 text-zinc-500 text-xs font-black uppercase tracking-widest rounded-sm flex items-center justify-center gap-2 cursor-not-allowed">
                          <Download size={16} />
                          INDISPONÍVEL
                      </button>
                  )}
               </div>
            </div>

            {/* BARRA LATERAL: INFORMAÇÕES (DESKTOP) */}
            <div className="hidden md:flex w-1/3 flex-col border-l border-zinc-900 bg-zinc-950 overflow-y-auto">
               <div className="p-8 flex-1">
                  
                  {/* 1. Gênero (Topo) */}
                  <div className="mb-8">
                      <span className="block text-zinc-500 text-[10px] uppercase tracking-widest mb-1 font-bold">Gênero</span>
                      <span className="text-white text-sm font-bold">{project.genre}</span>
                  </div>

                  {/* 2. Sinopse */}
                  <div className="mb-8">
                    <span className="block text-zinc-500 text-[10px] uppercase tracking-widest mb-2 font-bold">Sinopse</span>
                    <p className="text-zinc-300 text-sm leading-relaxed">{project.longDescription}</p>
                  </div>

                  {/* 3. Formato e Apresentação (Restante) */}
                  <div className="space-y-6">
                    <div>
                        <span className="block text-zinc-500 text-[10px] uppercase tracking-widest mb-1 font-bold">Formato</span>
                        <span className="text-white text-sm font-bold whitespace-pre-line">{project.format}</span>
                    </div>
                    {project.host && (
                        <div>
                            <span className="block text-zinc-500 text-[10px] uppercase tracking-widest mb-1 font-bold">Apresentação</span>
                            <span className="text-white text-sm font-bold">{project.host}</span>
                        </div>
                    )}
                  </div>
               </div>

               {/* Rodapé da Sidebar: Navegação e Ação */}
               <div className="p-8 border-t border-zinc-900 bg-zinc-900/50 backdrop-blur-sm sticky bottom-0">
                  {/* Navegação */}
                  <div className="flex gap-3 mb-4">
                      <button onClick={onPrev} className="flex-1 py-3 bg-transparent border border-zinc-700 hover:border-white text-zinc-400 hover:text-white text-[10px] font-bold uppercase tracking-widest transition-all flex items-center justify-center gap-2 rounded-sm group">
                          <ChevronLeft size={14} className="group-hover:-translate-x-1 transition-transform" /> Anterior
                      </button>
                      <button onClick={onNext} className="flex-1 py-3 bg-transparent border border-zinc-700 hover:border-white text-zinc-400 hover:text-white text-[10px] font-bold uppercase tracking-widest transition-all flex items-center justify-center gap-2 rounded-sm group">
                          Próximo <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform" />
                      </button>
                  </div>

                  {/* Botão de Download */}
                  {project.pdfUrl ? (
                    <a 
                      href={project.pdfUrl}
                      download
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full py-4 bg-white hover:bg-gray-200 text-black text-xs font-black uppercase tracking-widest transition-all flex items-center justify-center gap-3 rounded-sm shadow-lg hover:shadow-xl hover:-translate-y-1 cursor-pointer"
                    >
                      <Download size={16} />
                      BAIXAR PROJETO
                    </a>
                  ) : (
                    <button disabled className="w-full py-4 bg-zinc-800 text-zinc-500 text-xs font-black uppercase tracking-widest flex items-center justify-center gap-3 rounded-sm cursor-not-allowed">
                      <Download size={16} />
                      INDISPONÍVEL
                    </button>
                  )}
               </div>
            </div>
        </div>
      </div>
    </div>
  );
};

const Slide = ({ project, isActive, onPlay }) => {
  return (
    <section className="relative h-screen w-full overflow-hidden snap-start flex items-center border-b border-zinc-900 bg-black">
      <ModularGridBackground />

      {/* Background Image */}
      <div className="absolute inset-0 z-0">
         <div 
           className="absolute inset-0 bg-cover bg-center transition-transform duration-[2000ms] ease-out opacity-20 grayscale"
           style={{ 
             backgroundImage: `url(${project.bgImage})`,
             transform: isActive ? 'scale(1.0)' : 'scale(1.1)' 
           }} 
         />
         <div className="absolute inset-0 bg-gradient-to-r from-black via-black/90 to-transparent" />
      </div>

      <div className={`container mx-auto px-6 md:px-12 relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-12 h-full items-center`}>
        
        {/* Text Content */}
        <div className={`lg:col-span-6 flex flex-col justify-center transition-all duration-1000 delay-300 relative z-30 pointer-events-none ${isActive ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-10'}`}>
          <div className="pointer-events-auto">
            <div className="flex items-center gap-3 mb-8">
               <div className="h-[1px] w-12 bg-red-600"></div>
               <span className="text-red-600 text-xs font-bold uppercase tracking-[0.2em]">
                 {project.category}
               </span>
            </div>

            <h2 className="text-5xl md:text-7xl lg:text-8xl font-black tracking-tighter text-white mb-6 leading-[0.85] uppercase drop-shadow-2xl">
              {project.title}
            </h2>

            <div className="max-w-xl pl-1 border-l-2 border-zinc-800 hover:border-red-600 transition-colors duration-500 pl-6 py-2 mb-10 bg-black/40 backdrop-blur-sm lg:bg-transparent lg:backdrop-blur-none">
              <p className="text-lg md:text-xl text-zinc-400 font-light leading-relaxed">
                {project.description}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-6">
              {/* Botão VER AGORA */}
              <button 
                onClick={() => onPlay(project)}
                className="group relative px-8 py-4 bg-white text-black font-black text-sm uppercase tracking-widest hover:bg-gray-200 transition-all flex items-center gap-3 shadow-lg shadow-white/5"
              >
                {project.vimeoId ? <Play size={16} className="fill-black" /> : <Grid size={16} />}
                {project.vimeoId ? "VER AGORA" : "VER PROJETO"}
              </button>
            </div>
          </div>
        </div>

        {/* Visual Element - Monolito */}
        <div className={`lg:col-span-6 h-full flex items-center justify-center lg:justify-end transition-all duration-1000 delay-500 relative z-20 ${isActive ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-20'}`}>
           <div 
             className="relative w-[300px] md:w-[400px] aspect-[1/2] max-h-[85vh] bg-zinc-950 overflow-hidden shadow-2xl group cursor-pointer border border-zinc-900 transition-transform duration-500 hover:scale-[1.02]" 
             onClick={() => onPlay(project)}
           >
              {/* Imagem Colorida no Monolito */}
              <div 
                className="absolute inset-0 bg-cover bg-center transition-all duration-700 opacity-100" 
                style={{ 
                  backgroundImage: `url(${project.monolithImage})`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center'
                }}
              />
              
              <div className="absolute inset-0 bg-white/0 group-hover:bg-white/5 transition-colors duration-500 pointer-events-none"></div>
              <div className="absolute inset-0 bg-red-900/0 group-hover:bg-red-900/5 transition-colors duration-500 mix-blend-overlay"></div>
              <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-tr from-white/10 via-transparent to-transparent pointer-events-none"></div>

              <div className="absolute bottom-8 left-8 transform -rotate-90 origin-bottom-left transition-opacity duration-300 group-hover:opacity-80">
                 <span className="text-6xl font-black text-transparent stroke-white text-stroke opacity-30 select-none">
                    {String(project.id).padStart(2, '0')}
                 </span>
              </div>
           </div>
        </div>

      </div>
    </section>
  );
};

// --- COMPONENTE PRINCIPAL (App) ---

export default function BrickScrollytelling() {
  const [activeSlide, setActiveSlide] = useState(0);
  const [selectedProject, setSelectedProject] = useState(null);
  const sectionsRef = useRef([]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const index = sectionsRef.current.indexOf(entry.target);
            if (index !== -1) setActiveSlide(index);
          }
        });
      },
      { threshold: 0.5 }
    );
    sectionsRef.current.forEach((section) => section && observer.observe(section));
    return () => observer.disconnect();
  }, []);

  const scrollToSection = (index) => {
    sectionsRef.current[index]?.scrollIntoView({ behavior: 'smooth' });
  };

  // Funções de Navegação
  const handleNextProject = () => {
    if (!selectedProject) return;
    const currentIndex = projectsData.findIndex(p => p.id === selectedProject.id);
    const nextIndex = (currentIndex + 1) % projectsData.length;
    setSelectedProject(projectsData[nextIndex]);
  };

  const handlePrevProject = () => {
    if (!selectedProject) return;
    const currentIndex = projectsData.findIndex(p => p.id === selectedProject.id);
    const prevIndex = (currentIndex - 1 + projectsData.length) % projectsData.length;
    setSelectedProject(projectsData[prevIndex]);
  };

  return (
    <div className="bg-black text-white font-sans selection:bg-red-600 selection:text-white h-screen overflow-y-scroll snap-y snap-mandatory scroll-smooth hide-scrollbar cursor-default">
      
      {/* Navigation - Minimalista e Numérica */}
      <div className="fixed right-8 top-1/2 transform -translate-y-1/2 z-50 hidden lg:flex flex-col gap-6">
        {['INTRO', ...projectsData.map((_, i) => String(i + 1).padStart(2, '0')), 'CONTATO'].map((label, idx) => (
          <div key={idx} className="group flex items-center justify-end gap-3 cursor-pointer" onClick={() => scrollToSection(idx)}>
            <span className={`text-[9px] font-bold tracking-widest transition-all duration-300 ${activeSlide === idx ? 'text-red-600 opacity-100' : 'text-zinc-600 opacity-0 group-hover:opacity-100'}`}>
              {label}
            </span>
            <div className={`w-[2px] transition-all duration-300 ${activeSlide === idx ? 'h-8 bg-red-600' : 'h-4 bg-zinc-800 group-hover:bg-zinc-600'}`} />
          </div>
        ))}
      </div>

      {/* --- HERO SLIDE --- */}
      <section 
        ref={el => sectionsRef.current[0] = el}
        className="relative h-screen w-full snap-start flex flex-col items-center justify-center bg-black overflow-hidden"
      >
        <ModularGridBackground />
        
        {/* Ajuste de centralização e margem */}
        <div className="relative z-10 text-center flex flex-col items-center justify-center h-full pb-20"> 
          
          <img 
            src="/assets/brick_logo_rgb-1.png" 
            alt="Brick Filmmaking House" 
            className="w-64 md:w-80 mb-8 mix-blend-difference hover:scale-105 transition-transform duration-500"
          />
          
          <div className="flex items-center gap-4 mb-12">
            <div className="h-[1px] w-12 bg-zinc-700"></div>
            <p className="text-sm md:text-base text-zinc-400 font-mono tracking-[0.2em] uppercase">
              Projetos Originais
            </p>
            <div className="h-[1px] w-12 bg-zinc-700"></div>
          </div>

          <button 
            onClick={() => scrollToSection(1)}
            className="px-10 py-4 bg-white hover:bg-red-600 text-black hover:text-white font-black text-sm tracking-[0.2em] uppercase transition-all duration-300 transform hover:scale-105"
          >
            Explorar Catálogo
          </button>
        </div>

        <div className="absolute bottom-8 left-8 text-[10px] text-zinc-600 uppercase tracking-widest font-mono hidden md:block">
          Do Zero ao Todo
        </div>
        
        <ScrollIndicator />
      </section>

      {/* --- PROJECT SLIDES --- */}
      {projectsData.map((project, index) => (
        <div key={project.id} ref={el => sectionsRef.current[index + 1] = el}>
          <Slide 
            project={project} 
            isActive={activeSlide === index + 1}
            onPlay={setSelectedProject}
          />
        </div>
      ))}

      {/* --- CONTACT SLIDE --- */}
      <section 
        ref={el => sectionsRef.current[projectsData.length + 1] = el}
        className="relative h-screen w-full snap-start flex items-center justify-center bg-zinc-950"
      >
        <ModularGridBackground />
        
        <div className="container mx-auto px-6 relative z-10 grid md:grid-cols-2 gap-16 items-center">
          <div>
            <span className="text-red-600 font-bold text-xs tracking-[0.3em] uppercase mb-4 block">Contato</span>
            <h2 className="text-6xl md:text-8xl font-black tracking-tighter mb-8 leading-[0.9] uppercase text-white">
              Vamos<br />Criar<br /><span className="text-transparent stroke-white text-stroke">Juntos?</span>
            </h2>
            <p className="text-zinc-400 text-lg leading-relaxed max-w-md mb-12 border-l border-zinc-800 pl-6">
              Do zero ao todo. Nós conceituamos, desenvolvemos e entregamos conteúdo audiovisual extraordinário.
            </p>
            <a 
              href="mailto:brick@brick.mov"
              className="inline-flex items-center gap-4 text-white hover:text-red-600 transition-colors group"
            >
              <span className="text-2xl font-bold tracking-widest uppercase border-b-2 border-white group-hover:border-red-600 pb-1">Fale Conosco</span>
              <ArrowRight className="transform group-hover:translate-x-2 transition-transform" />
            </a>
          </div>

          {/* Elemento Visual Final - Monolito Vermelho Puro com a proporção 1:2 */}
          <div className="hidden md:flex justify-center items-center">
             <div className="w-[300px] md:w-[400px] aspect-[1/2] bg-red-600 shadow-[0_0_100px_rgba(220,38,38,0.3)] relative overflow-hidden flex items-center justify-center transition-all duration-500 hover:scale-[1.02] hover:shadow-[0_0_150px_rgba(220,38,38,0.5)]">
             </div>
          </div>
        </div>

        <footer className="absolute bottom-0 w-full border-t border-zinc-900 bg-black py-6">
          <div className="container mx-auto px-6 flex justify-between items-center text-[10px] text-zinc-500 uppercase tracking-widest font-mono">
            <span>© Brick Filmmaking House</span>
            <div className="flex gap-6">
               <a href="#" className="hover:text-white transition-colors">Instagram</a>
               <a href="#" className="hover:text-white transition-colors">Linkedin</a>
            </div>
          </div>
        </footer>
      </section>

      <VideoModal 
        project={selectedProject} 
        onClose={() => setSelectedProject(null)} 
        onNext={handleNextProject}
        onPrev={handlePrevProject}
      />
    </div>
  );
}

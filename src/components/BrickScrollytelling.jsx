import React, { useState, useEffect, useRef } from 'react';
import { Play, X, ArrowRight, Plus } from 'lucide-react';

// --- Dados dos Projetos ---
// As imagens DEVEM estar em /public/assets/

const projectsData = [
  {
    id: 1,
    title: "TU TÁ NO RJ",
    category: "Documentário",
    genre: "True Crime / Humor",
    format: "10 EPISÓDIOS DE 8 MIN",
    status: "Em Desenvolvimento",
    description: "Esqueça o serial killer! Uma investigação irreverente sobre os crimes mais surreais que aconteceram no Rio de Janeiro.",
    longDescription: "Uma investigação irreverente sobre os crimes mais surreais que aconteceram no Rio de Janeiro. Um True Crime à brasileira que foge do óbvio e mergulha no caos urbano carioca.",
    bgImage: "/assets/TTRJHOR.webp",
    monolithImage: "/assets/ttrjvert.webp",
    vimeoId: "76979871"
  },
  {
    id: 2,
    title: "100% ATUALIZADO",
    category: "Documentário",
    genre: "Games / Cultura Pop",
    format: "6 EPISÓDIOS DE 30 MIN",
    status: "Finalizado",
    description: "Da clonagem aos campeonatos milionários: a controversa e fascinante história do videogame no Brasil.",
    longDescription: "Uma viagem no tempo mostrando como o mercado cinza, a pirataria e a paixão dos brasileiros transformaram o país em uma potência dos games.",
    bgImage: "/assets/100hor.webp",
    monolithImage: "/assets/100atuverti.webp",
    vimeoId: "76979871"
  },
  {
    id: 3,
    title: "TROCA DE CHEFIA",
    category: "Reality",
    genre: "Empreendedorismo",
    format: "10 EPISÓDIOS DE 10 MIN",
    status: "Formato Pronto",
    description: "Dois donos de negócios vivem por um dia os desafios um do outro. Empatia e gestão na prática.",
    longDescription: "O que acontece quando um dono de padaria troca de lugar com a dona de uma oficina mecânica? Um reality show ágil sobre os desafios reais de empreender.",
    bgImage: "/assets/tcfhor.webp",
    monolithImage: "/assets/tfvert.webp",
    vimeoId: "76979871"
  },
  {
    id: 4,
    title: "BASTIDORES DA MEMÓRIA",
    category: "Documentário",
    genre: "História / Cultura",
    format: "10 EPISÓDIOS DE 6 MIN",
    status: "Exibido (History)",
    description: "Os tesouros ocultos nas reservas técnicas dos museus brasileiros que ajudam a recontar nossa história.",
    longDescription: "Uma série documental que entra onde o público não pode ir: as reservas técnicas dos museus.",
    bgImage: "/assets/bmhorizontal.webp",
    monolithImage: "/assets/bmvertical.webp",
    vimeoId: "76979871"
  },
  {
    id: 5,
    title: "NÃO VAI ZICAR",
    category: "Factual",
    genre: "Esportes",
    format: "10 EPISÓDIOS DE 4 MIN",
    status: "Piloto Disponível",
    description: "Um mergulho factual, rápido e divertido no mundo dos esportes.",
    longDescription: "Um formato ágil e direto sobre esportes, superstições e estatísticas.",
    bgImage: "/assets/nvzhorizontal.webp",
    monolithImage: "/assets/nvzvert.webp",
    vimeoId: "76979871"
  },
  {
    id: 6,
    title: "MISTÉRIOS DA BOLA",
    category: "Documentário",
    genre: "Esportes / Mistério",
    format: "10 EPISÓDIOS DE 10 MIN",
    status: "Em Desenvolvimento",
    description: "Investigação do lado oculto do futebol.",
    longDescription: "Uma série documental com tom de suspense noir sobre o esporte.",
    bgImage: "/assets/mbhor.webp",
    monolithImage: "/assets/mbverti.webp",
    vimeoId: "76979871"
  },
  {
    id: 7,
    title: "SUPER CORPO",
    category: "Documentário",
    genre: "Saúde / Lifestyle",
    format: "10 EPISÓDIOS DE 26 MIN",
    status: "Em Captação",
    description: "Uma jornada em busca da longevidade.",
    longDescription: "Entrevistas e experiências em busca de uma vida longa e equilibrada.",
    bgImage: "/assets/schor.webp",
    monolithImage: "/assets/scorvert.webp",
    vimeoId: "76979871"
  }
];

// ---------------- COMPONENTES ----------------

export default function BrickScrollytelling() {
  const [activeSlide, setActiveSlide] = useState(0);
  const sectionsRef = useRef([]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const index = sectionsRef.current.indexOf(entry.target);
            if (index !== -1) setActiveSlide(index);
          }
        });
      },
      { threshold: 0.5 }
    );

    sectionsRef.current.forEach(section => section && observer.observe(section));
    return () => observer.disconnect();
  }, []);

  return (
    <div className="h-screen overflow-y-scroll snap-y snap-mandatory bg-black text-white">

      {/* HERO */}
      <section
        ref={el => sectionsRef.current[0] = el}
        className="h-screen snap-start flex flex-col items-center justify-center"
      >
        <img
          src="/assets/brick_logo_rgb-1.png"
          alt="Brick"
          className="w-72 mb-12"
        />
        <button
          onClick={() => sectionsRef.current[1]?.scrollIntoView({ behavior: 'smooth' })}
          className="px-10 py-4 bg-white text-black font-bold uppercase"
        >
          Explorar Catálogo
        </button>
      </section>

      {/* SLIDES */}
      {projectsData.map((project, index) => (
        <section
          key={project.id}
          ref={el => sectionsRef.current[index + 1] = el}
          className="h-screen snap-start relative flex items-center"
        >
          <div
            className="absolute inset-0 bg-cover bg-center opacity-20"
            style={{ backgroundImage: `url(${project.bgImage})` }}
          />
          <div className="relative z-10 max-w-xl px-12">
            <h2 className="text-6xl font-black uppercase mb-6">{project.title}</h2>
            <p className="text-zinc-400 mb-8">{project.description}</p>
            <img
              src={project.monolithImage}
              alt={project.title}
              className="w-64"
            />
          </div>
        </section>
      ))}

      {/* CONTATO */}
      <section
        ref={el => sectionsRef.current[projectsData.length + 1] = el}
        className="h-screen snap-start flex items-center justify-center"
      >
        <a
          href="mailto:contato@brick.com.br"
          className="text-4xl font-black uppercase flex items-center gap-4"
        >
          Fale Conosco <ArrowRight />
        </a>
      </section>
    </div>
  );
}

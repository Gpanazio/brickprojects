import pg from 'pg';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

dotenv.config();

const { Pool } = pg;

// Extrair os dados da string de conexão (URL) para evitar o erro SASL
const connectionString = process.env.DATABASE_URL;
const url = new URL(connectionString);

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? {
    rejectUnauthorized: false
  } : false
});

const projectsData = [
  {
    id: 1,
    title: "TU TÁ NO RJ",
    category: "Documentário",
    genre: "True Crime de Humor",
    format: "TV aberta: 8 min\nPay TV e Streaming: 26 min",
    status: "Em Desenvolvimento",
    description: "Esqueça o serial killer. Uma investigação irreverente sobre os crimes mais surreais, criativos e ilógicos que só poderiam acontecer no Rio de Janeiro.",
    long_description: "Uma investigação irreverente sobre os crimes mais surreais que aconteceram no Rio de Janeiro. Um True Crime à brasileira que foge do óbvio e mergulha no caos urbano carioca.",
    video_label: "Ver Promo",
    bg_image: "/assets/TTRJHOR.webp",
    monolith_image: "/assets/ttrjvert.webp",
    vimeo_id: "1091288426",
    vimeo_hash: "59bc6e3eb4",
    pdf_url: "/projetos/PITCH_DECK_TU_TA_NO_RJ.pdf",
    display_order: 7
  },
  {
    id: 2,
    title: "100% ATUALIZADO",
    category: "Documentário",
    genre: "Doc-Série Pop / Games",
    format: "6 episódios de 26 min",
    status: "Finalizado",
    description: "Da clonagem de cartuchos aos campeonatos milionários: a história não oficial de como a pirataria e a \"gambiarra\" construíram a cultura gamer no Brasil.",
    long_description: "Uma viagem no tempo mostrando como o mercado cinza, a pirataria e a paixão dos brasileiros transformaram o país em uma potência dos games.",
    video_label: "Ver Teaser",
    bg_image: "/assets/100hor.webp",
    monolith_image: "/assets/100atuverti.webp",
    vimeo_id: "1060607336",
    pdf_url: "/projetos/PITCH_DECK_100_ATUALIZADO.pdf",
    display_order: 1
  },
  {
    id: 3,
    title: "TROCA DE CHEFIA",
    category: "Reality",
    genre: "Empreendedorismo",
    format: "Episódios de 26 ou 56 min",
    status: "Formato Pronto",
    description: "Dois donos de negócios vivem por um dia os desafios um do outro. Empatia e gestão na prática.",
    long_description: "O que acontece quando um dono de padaria troca de lugar com a dona de uma oficina mecânica? Um reality show ágil sobre os desafios reais de empreender.",
    video_label: "Ver Teaser",
    bg_image: "/assets/tcfhor.webp",
    monolith_image: "/assets/tfvert.webp",
    vimeo_id: "1110027782",
    vimeo_hash: "6295e6a248",
    pdf_url: "/projetos/PITCH_DECK_TROCA_DE_CHEFIA.pdf",
    display_order: 6
  },
  {
    id: 4,
    title: "BASTIDORES DA MEMÓRIA",
    category: "Documentário",
    genre: "História / Cultura",
    format: "Diversos",
    status: "Exibido (History)",
    description: "Os tesouros ocultos nas reservas técnicas dos museus brasileiros que ajudam a recontar nossa história.",
    long_description: "Uma série documental que revela o que o público não vê: as reservas técnicas dos museus. Já exibida no History Channel em reedição exclusiva, com a primeira temporada completa disponível na Bandplay e no UOL. Aberta para licenciamento e novas temporadas.",
    video_label: "Assistir Episódio 1",
    bg_image: "/assets/bmhorizontal.webp",
    monolith_image: "/assets/bmvertical.webp",
    vimeo_id: "1147440138",
    vimeo_hash: "4b6785c3fc",
    pdf_url: "/projetos/PITCH_DECK_BASTIDORES.pdf",
    display_order: 2
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
    long_description: "Andrey Raychtock comanda este formato curto e ágil, perfeito para redes sociais e intervalos comerciais, desvendando as curiosidades do esporte.",
    video_label: "Ver Piloto",
    bg_image: "/assets/nvzhorizontal.webp",
    monolith_image: "/assets/nvzvert.webp",
    vimeo_id: "1091855463",
    vimeo_hash: "fb313f7730",
    pdf_url: "/projetos/PITCH_DECK_NAO_VAI_ZICAR.pdf",
    display_order: 4
  },
  {
    id: 6,
    title: "MISTÉRIOS DA BOLA",
    category: "Documentário",
    genre: "Esportes / Mistério",
    format: "TV aberta: 8 min\nPay TV e Streaming: 26 min",
    status: "Em Desenvolvimento",
    description: "Investigação do lado oculto do futebol: maldições, fraudes e histórias que transcendem o campo.",
    long_description: "O futebol é uma caixinha de surpresas, ou seria uma caixinha de mistérios? Uma série documental com tom de suspense noir sobre o esporte mais amado do mundo.",
    video_label: "Ver Pitch",
    bg_image: "/assets/mbhor.webp",
    monolith_image: "/assets/mbverti.webp",
    vimeo_id: null,
    pdf_url: "/projetos/PITCH_DECK_MISTERIOS_DA_BOLA.pdf",
    display_order: 3
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
    long_description: "Mari Goldfarb conduz entrevistas e experiências em busca dos segredos para uma vida longa, saudável e equilibrada.",
    video_label: "Ver Manifesto",
    bg_image: "/assets/schor.webp",
    monolith_image: "/assets/scorvert.webp",
    vimeo_id: "1110052878",
    vimeo_hash: "deca249548",
    pdf_url: "/projetos/PITCH_DECK_SUPERCORPO.pdf",
    display_order: 5
  }
];

export async function migrateInternal() {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    
    for (const project of projectsData) {
      await client.query(`
        INSERT INTO originais_projects (
          id, title, category, genre, format, status, description, 
          long_description, video_label, bg_image, monolith_image, 
          vimeo_id, vimeo_hash, pdf_url, host, display_order
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16)
        ON CONFLICT (id) DO UPDATE SET
          title = EXCLUDED.title,
          category = EXCLUDED.category,
          genre = EXCLUDED.genre,
          format = EXCLUDED.format,
          status = EXCLUDED.status,
          description = EXCLUDED.description,
          long_description = EXCLUDED.long_description,
          video_label = EXCLUDED.video_label,
          bg_image = EXCLUDED.bg_image,
          monolith_image = EXCLUDED.monolith_image,
          vimeo_id = EXCLUDED.vimeo_id,
          vimeo_hash = EXCLUDED.vimeo_hash,
          pdf_url = EXCLUDED.pdf_url,
          host = EXCLUDED.host,
          display_order = EXCLUDED.display_order;
      `, [
        project.id, project.title, project.category, project.genre, project.format, 
        project.status, project.description, project.long_description, 
        project.video_label, project.bg_image, project.monolith_image, 
        project.vimeo_id, project.vimeo_hash, project.pdf_url, project.host || null,
        project.display_order
      ]);
    }
    
    await client.query("SELECT setval('originais_projects_id_seq', (SELECT MAX(id) FROM originais_projects))");

    await client.query('COMMIT');
    console.log('✅ Migração concluída com sucesso');
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('❌ Erro na migração:', err);
  } finally {
    client.release();
  }
}


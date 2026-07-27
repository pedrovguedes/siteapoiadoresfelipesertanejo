/* ============================================================
   dados-comites.js — ÚNICA fonte de dados da busca de comitês
   Edite apenas este arquivo para atualizar a campanha.
   Estrutura de cada cidade:
   { cidade, possuiComite, descricao, lideranca, endereco,
     whatsapp, googleMaps, proximosEventos: [] }
============================================================ */

/* ---------- Modelo padrão (todas as demais cidades de SP) ----------
   Campos vazios ("") usam o placeholder padrão abaixo. */
const PADRAO = {
  possuiComite: true,
  lideranca: "Coordenação regional (em definição)",
  endereco: "Ponto de apoio em atualização — fale com a coordenação",
  whatsapp: "5511999990000", // WhatsApp geral da campanha
  googleMaps: "",            // vazio = busca pelo endereço no Maps
  proximosEventos: ["Agenda da região em breve — acompanhe nossos canais oficiais"],
};

/* ---------- Cidades com conteúdo personalizado ---------- */
const CIDADES_ESPECIAIS = [
  {
    cidade: "São José dos Campos",
    possuiComite: true,
    descricao:
      "Maior cidade da região, principal polo tecnológico do Brasil, sede da Embraer, do CTA e do ITA.",
    lideranca: "Liderança local (a definir)",
    endereco: "Av. Exemplo, 100 — Centro, São José dos Campos - SP",
    whatsapp: "5512999990001",
    googleMaps: "",
    proximosEventos: [
      "Encontro de apoiadores — data a confirmar",
      "Caminhada no Centro — data a confirmar",
    ],
  },
  {
    cidade: "Taubaté",
    possuiComite: true,
    descricao:
      "Importante polo industrial automotivo e universitário, conhecida como a terra de Monteiro Lobato.",
    lideranca: "Liderança local (a definir)",
    endereco: "Rua Exemplo, 200 — Centro, Taubaté - SP",
    whatsapp: "5512999990002",
    googleMaps: "",
    proximosEventos: ["Reunião com voluntários — data a confirmar"],
  },
  {
    cidade: "Guaratinguetá",
    possuiComite: true,
    descricao:
      "Cidade com forte indústria química e têxtil e importante polo do turismo religioso, terra de Frei Galvão.",
    lideranca: "Liderança local (a definir)",
    endereco: "Rua Exemplo, 300 — Centro, Guaratinguetá - SP",
    whatsapp: "5512999990003",
    googleMaps: "",
    proximosEventos: ["Ação de rua — data a confirmar"],
  },
  {
    cidade: "Jacareí",
    possuiComite: true,
    descricao: "Polo industrial com destaque para papel, celulose e bebidas.",
    lideranca: "Liderança local (a definir)",
    endereco: "Av. Exemplo, 400 — Centro, Jacareí - SP",
    whatsapp: "5512999990004",
    googleMaps: "",
    proximosEventos: ["Encontro de apoiadores — data a confirmar"],
  },
  {
    cidade: "Pindamonhangaba",
    possuiComite: true,
    descricao:
      "Maior polo de reciclagem de alumínio da América Latina e importante centro metalúrgico.",
    lideranca: "Liderança local (a definir)",
    endereco: "Rua Exemplo, 500 — Centro, Pindamonhangaba - SP",
    whatsapp: "5512999990005",
    googleMaps: "",
    proximosEventos: ["Reunião regional — data a confirmar"],
  },
];

/* ---------- Regiões SEM comitê ----------
   Praia Grande + Vale do Paraíba (exceto as cidades especiais acima,
   que têm atuação própria). Adicione ou remova nomes livremente. */
const SEM_COMITE = [
  "Praia Grande",
  // Vale do Paraíba
  "Aparecida", "Arapeí", "Areias", "Bananal", "Caçapava", "Cachoeira Paulista",
  "Campos do Jordão", "Canas", "Cruzeiro", "Cunha", "Igaratá", "Jambeiro",
  "Lagoinha", "Lavrinhas", "Lorena", "Monteiro Lobato", "Natividade da Serra",
  "Paraibuna", "Piquete", "Potim", "Queluz", "Redenção da Serra", "Roseira",
  "Santa Branca", "Santo Antônio do Pinhal", "São Bento do Sapucaí",
  "São José do Barreiro", "São Luiz do Paraitinga", "Silveiras", "Tremembé",
];

const MSG_SEM_COMITE =
  "No momento ainda não temos um comitê ativo nesta região. Continue acompanhando nossos canais oficiais para saber quando realizaremos novas ações por aí.";

/* ---------- Sugestões do autocomplete ----------
   Principais cidades de SP + todas as citadas acima.
   Qualquer cidade paulista digitada (mesmo fora da lista)
   cai no modelo padrão — a lista só alimenta as sugestões. */
const CIDADES_SP = [
  "Adamantina","Americana","Amparo","Andradina","Araçatuba","Araraquara","Araras",
  "Assis","Atibaia","Avaré","Barretos","Barueri","Bauru","Bebedouro","Bertioga",
  "Birigui","Botucatu","Bragança Paulista","Caieiras","Cajamar","Campinas",
  "Capão Bonito","Caraguatatuba","Carapicuíba","Catanduva","Cerquilho","Cotia",
  "Cubatão","Diadema","Dracena","Embu das Artes","Fernandópolis","Ferraz de Vasconcelos",
  "Franca","Francisco Morato","Franco da Rocha","Guarujá","Guarulhos","Hortolândia",
  "Ilhabela","Indaiatuba","Itanhaém","Itapecerica da Serra","Itapetininga","Itapeva",
  "Itapevi","Itaquaquecetuba","Itatiba","Itu","Jaboticabal","Jaguariúna","Jales",
  "Jandira","Jaú","Jundiaí","Leme","Limeira","Lins","Mairiporã","Marília","Matão",
  "Mauá","Mogi das Cruzes","Mogi Guaçu","Mogi Mirim","Mongaguá","Ourinhos","Osasco",
  "Paulínia","Penápolis","Peruíbe","Piracicaba","Poá","Presidente Prudente",
  "Ribeirão Pires","Ribeirão Preto","Rio Claro","Salto","Santa Bárbara d'Oeste",
  "Santana de Parnaíba","Santo André","Santos","São Bernardo do Campo",
  "São Caetano do Sul","São Carlos","São João da Boa Vista","São José do Rio Preto",
  "São Paulo","São Roque","São Sebastião","São Vicente","Sertãozinho","Sorocaba",
  "Sumaré","Suzano","Taboão da Serra","Tatuí","Tupã","Ubatuba","Valinhos",
  "Vargem Grande Paulista","Várzea Paulista","Vinhedo","Votorantim","Votuporanga",
  ...CIDADES_ESPECIAIS.map((c) => c.cidade),
  ...SEM_COMITE,
];

/* Exposto globalmente para o main.js */
window.DADOS_CAMPANHA = { PADRAO, CIDADES_ESPECIAIS, SEM_COMITE, MSG_SEM_COMITE, CIDADES_SP };

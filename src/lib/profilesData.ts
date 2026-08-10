export interface ProfileDetail {
  id: string;
  name: string;
  description: string;
  characteristics: string[];
  strengths: string[];
  attention_points: string[];
  recommended_environments: string[];
  adaptation_environments: string[];
  naturally_favored_competencies: string[];
  suggested_interview_questions: string[];
}

export const PROFILES_CATALOG: Record<string, ProfileDetail> = {
  'Executor Adaptável': {
    id: 'executor-adaptavel',
    name: 'Executor Adaptável',
    description: 'Apresenta elevada flexibilidade perante mudanças de procedimento, aliando foco em resultados operacionais com rápida assimilação de novos scripts.',
    characteristics: [
      'Facilidade de reorientação diante de imprevistos',
      'Boa retenção de novas orientações normativas',
      'Orientação prática para resolução de problemas em tempo real',
      'Equilíbrio entre velocidade e aderência às regras'
    ],
    strengths: [
      'Rápida curva de aprendizagem em trocas de sistema ou fluxo',
      'Manutenção de ritmo em dias de alta demanda e mudanças de escala',
      'Capacidade de transitar suavemente entre diferentes tipos de fila ou produtos'
    ],
    attention_points: [
      'Pode eventualmente antecipar conclusões antes de verificar detalhes do procedimento',
      'Recomenda-se assegurar alinhamento frequente quanto às normas vigentes'
    ],
    recommended_environments: [
      'Operações de atendimento dinâmicas com frequentes atualizações de produto',
      'Equipes multiskill com diversidade de chamados e demandas simultâneas'
    ],
    adaptation_environments: [
      'Processos extremamente rígidos e repetitivos que não permitam qualquer variação procedural'
    ],
    naturally_favored_competencies: [
      'Adaptabilidade Operacional',
      'Agilidade de Aprendizagem',
      'Foco em Soluções'
    ],
    suggested_interview_questions: [
      'Conte sobre um dia em que uma norma de atendimento mudou durante o seu turno. Como reagiu?',
      'Como você lida com situações em que a prioridade da sua fila é alterada subitamente?',
      'Qual estratégia você utiliza para fixar rapidamente um novo roteiro de atendimento?'
    ]
  },
  'Executor Estruturado': {
    id: 'executor-estruturado',
    name: 'Executor Estruturado',
    description: 'Perfil caracterizado pela consistência, respeito rigoroso aos processos operacionais padrão e elevado padrão de qualidade técnica.',
    characteristics: [
      'Falta de tolerância com inconsistências e desvios de processo',
      'Alta pontualidade e organização com registros de histórico',
      'Postura metódica e focada na conformidade das regras',
      'Comportamento previsível e altamente confiável'
    ],
    strengths: [
      'Rigoroso cumprimento de scripts e compliance regulatório',
      'Excelente detalhamento no preenchimento de chamados e CRM',
      'Baixo índice de erros procedimentais'
    ],
    attention_points: [
      'Pode sentir desconforto se instruído a agir sem norma formal correspondente',
      'Pode necessitar de tempo adicional para assimilar mudanças sem manual prévio'
    ],
    recommended_environments: [
      'Operações reguladas (Bancário, Saúde, Jurídico) que exigem estrito cumprimento de normas',
      'Filas de suporte técnico nível 2 ou ouvidoria procedural'
    ],
    adaptation_environments: [
      'Ambientes informais com regras ambíguas ou constantes decisões ad-hoc'
    ],
    naturally_favored_competencies: [
      'Conformidade Procedimental',
      'Atenção aos Detalhes',
      'Organização e Disciplina'
    ],
    suggested_interview_questions: [
      'Como você procede quando identifica que uma regra de atendimento não cobre exatamente a dúvida do cliente?',
      'O que você faz se percebe que um colega está utilizando um atalho informal no sistema?',
      'Descreva sua rotina para garantir que nenhum histórico de atendimento fique pendente ao final do turno.'
    ]
  },
  'Analista Investigativo': {
    id: 'analista-investigativo',
    name: 'Analista Investigativo',
    description: 'Demonstra acentuado interesse em compreender as causas de problemas complexos, priorizando diagnósticos precisos e auditoria de chamados.',
    characteristics: [
      'Raciocínio analítico voltado para a identificação da causa-raiz',
      'Persistência na investigação de pendências operacionais complexas',
      'Gosto por consulta a bases de conhecimento e documentações técnicas',
      'Postura ponderada antes de tomar decisões'
    ],
    strengths: [
      'Elevada eficiência na resolução de reclamações de segundo nível',
      'Capacidade de propor melhorias nos processos a partir de erros observados',
      'Excelente desempenho na análise de casos críticos ou em triagem'
    ],
    attention_points: [
      'Pode despender tempo além do habitual na investigação de casos simples',
      'Recomenda-se ponderar o tempo médio de atendimento (TMA) em filas de grande volume'
    ],
    recommended_environments: [
      'Canais de Ouvidoria, Backoffice, Suporte Técnico Especializado ou Fraudes',
      'Análise de contestações e tratamento de pendências regulatórias'
    ],
    adaptation_environments: [
      'Atendimento receptivo de altíssima rotatividade focado unicamente em TMA rápido'
    ],
    naturally_favored_competencies: [
      'Pensamento Analítico',
      'Diagnóstico de Problemas',
      'Orientação para a Qualidade'
    ],
    suggested_interview_questions: [
      'Qual o caso mais difícil de investigar que você já atendeu? Como chegou à solução?',
      'Como você equilibra a necessidade de pesquisar a fundo um problema com a demanda da fila acumulada?',
      'O que você faz quando não encontra a resposta imediata na base de conhecimento?'
    ]
  },
  'Comunicador Relacional': {
    id: 'comunicador-relacional',
    name: 'Comunicador Relacional',
    description: 'Destaca-se pela empatia natural, fluência verbal e facilidade para construir conexões positivas e acolhedoras com os cidadãos e colegas.',
    characteristics: [
      'Facilidade de expressão e tom de voz engajador e cortês',
      'Escuta ativa voltada para as necessidades emocionais do atendido',
      'Habilidade para acalmar conversas inicialmente tensas',
      'Preferência por interações interpessoais dinâmicas'
    ],
    strengths: [
      'Altas pontuações na percepção de cordialidade e humanização do atendimento',
      'Facilidade para desarmar hostilidades através da escuta empática',
      'Promove um clima positivo de cooperação no ambiente de trabalho'
    ],
    attention_points: [
      'Pode estender conversas além do necessário motivado pela empatia',
      'Recomenda-se acompanhar o equilíbrio entre simpatia e objetividade operacional'
    ],
    recommended_environments: [
      'Filas de Relacionamento com Cliente, SAC Humanizado, VIP e Pesquisa de Satisfação',
      'Atendimento receptivo focado na retenção e fidelização'
    ],
    adaptation_environments: [
      'Ambientes estritamente técnicos sem contato com o público ou orientados apenas a dados numéricos'
    ],
    naturally_favored_competencies: [
      'Empatia e Humanização',
      'Comunicação Assertiva',
      'Relacionamento Interpessoal'
    ],
    suggested_interview_questions: [
      'Como você age quando o cidadão quer desabafar sobre um problema pessoal antes de falar da solicitação?',
      'Fale sobre uma situação em que seu tom de voz amigável foi decisivo para contornar uma crise.',
      'Como você mantém a cordialidade mesmo após atender várias chamadas difíceis consecutivas?'
    ]
  },
  'Negociador Assertivo': {
    id: 'negociador-assertivo',
    name: 'Negociador Assertivo',
    description: 'Perfil focado em persuasão, contorno de objeções e condução firme de conversas voltadas para acordos, cobrança ou retenção.',
    characteristics: [
      'Firmeza na argumentação sem perder a postura profissional',
      'Foco em atingimento de metas e superação de objeções',
      'Capacidade de conduzir o diálogo de forma diretiva',
      'Boa tolerância a rejeições e posicionamentos contrários'
    ],
    strengths: [
      'Excelente desempenho em operações de Cobrança, Retenção e Vendas',
      'Rapidez na identificação do ponto-chave de objeção do cliente',
      'Determinação para fechar acordos dentro dos parâmetros permitidos'
    ],
    attention_points: [
      'Pode assumir tom excessivamente diretivo se não dosar a flexibilidade',
      'Recomenda-se garantir que a busca pelo acordo respeite os limites de satisfação do cliente'
    ],
    recommended_environments: [
      'Operações de Vendas Receptivas/Ativas, Retenção, Cobrança e Negociação de Débitos'
    ],
    adaptation_environments: [
      'Atendimento puramente informativo ou assistencial de saúde/emergência'
    ],
    naturally_favored_competencies: [
      'Persuasão e Negociação',
      'Orientação para Resultados',
      'Contorno de Objeções'
    ],
    suggested_interview_questions: [
      'Qual abordagem você utiliza quando o cliente afirma categoricamente que não tem interesse na proposta?',
      'Como você lida com a pressão por metas em operações de retenção ou vendas?',
      'Descreva um momento em que precisou ser firme mantendo o respeito e o tom profissional.'
    ]
  },
  'Facilitador de Equipe': {
    id: 'facilitador-de-equipe',
    name: 'Facilitador de Equipe',
    description: 'Orientado para a cooperação grupal, suporte aos colegas e harmonização do clima operacional na PA (Posição de Atendimento).',
    characteristics: [
      'Espírito colaborativo e disposição genuína para auxiliar outros operadores',
      'Mediação informal de pequenos conflitos na equipe',
      'Facilidade de integração e acolhimento de novos colaboradores',
      'Valorização do sucesso coletivo da operação'
    ],
    strengths: [
      'Fortalece o engajamento e a coesão da equipe de atendimento',
      'Disposição para auxiliar na tirada de dúvidas operacionais da PA ao lado',
      'Contribui para a redução do turnover por promover bom clima de trabalho'
    ],
    attention_points: [
      'Pode hesitar em posicionar opiniões divergentes em reuniões de grupo',
      'Deve atentar para não deixar sua própria produção cair enquanto auxilia colegas'
    ],
    recommended_environments: [
      'Equipes de atendimento colaborativas com células de apoio e padrinhos de treinamento',
      'Grupos de atendimento multicanal com demandas compartilhadas'
    ],
    adaptation_environments: [
      'Ambientes com extrema competição individualista entre operadores'
    ],
    naturally_favored_competencies: [
      'Trabalho em Equipe',
      'Cooperação e Suporte Interpessoal',
      'Construção de Clima'
    ],
    suggested_interview_questions: [
      'Como você apoia um colega que está visivelmente sobrecarregado ao seu lado?',
      'O que você faz quando a equipe precisa bater uma meta coletiva e o tempo está acabando?',
      'Como lida com opiniões muito divergentes em uma reunião de alinhameto da operação?'
    ]
  },
  'Controlador de Qualidade': {
    id: 'controlador-de-qualidade',
    name: 'Controlador de Qualidade',
    description: 'Foco incisivo na precisão da informação, conformidade regulatória e erradicação de desvios operacionais ou erros de registro.',
    characteristics: [
      'Atenção minuciosa aos detalhes do script e cadastros',
      'Elevada estabilidade sob rotinas rigorosas de auditoria',
      'Preferência por padrões claros de avaliação de desempenho',
      'Orientação para a excelência procedural'
    ],
    strengths: [
      'Zero ou quase nulo índice de erros em auditorias de qualidade (Monitoria)',
      'Alta confiabilidade na digitação de dados críticos e conferência de documentos',
      'Fidelidade absoluta aos critérios estabelecidos pela contratante'
    ],
    attention_points: [
      'Pode demonstrar rigidez quando deparado com situações atípicas sem jurisprudência clara',
      'Recomenda-se incentivar a tolerância a ambiguidades operacionais inevitáveis'
    ],
    recommended_environments: [
      'Células de Monitoria de Qualidade, Compliance, Auditoria de Chamados e Validação Cadastral'
    ],
    adaptation_environments: [
      'Operações informais com regras que mudam diariamente sem aviso documental'
    ],
    naturally_favored_competencies: [
      'Compliance e Qualidade',
      'Precisão Informacional',
      'Conformidade Técnica'
    ],
    suggested_interview_questions: [
      'Como você garante que 100% dos dados coletados durante a chamada estão corretos?',
      'Como você reage quando recebe um feedback de monitoria com o qual concorda ou discorda?',
      'Qual a sua estratégia para manter a atenção aos detalhes durante longas horas de rotina?'
    ]
  },
  'Especialista de Atendimento': {
    id: 'especialista-de-atendimento',
    name: 'Especialista de Atendimento',
    description: 'Combina empatia no tratamento do cidadão com domínio pragmático dos procedimentos, oferecendo soluções completas na primeira interação (FCR).',
    characteristics: [
      'Orientação para a resolução completa no primeiro contato (First Contact Resolution)',
      'Equilíbrio harmonioso entre agilidade e acolhimento',
      'Postura profissional de autoridade confiável e cortês',
      'Domínio das ferramentas operacionais e dos sistemas de consulta'
    ],
    strengths: [
      'Altíssima taxa de satisfação dos cidadãos combinada com eficiência operacional',
      'Capacidade de simplificar explicações burocráticas para o público final',
      'Baixo índice de rechamadas pelo mesmo motivo'
    ],
    attention_points: [
      'Pode assumir a responsabilidade por problemas sistêmicos fora do seu alcance',
      'Recomenda-se orientar sobre os limites operacionais da função'
    ],
    recommended_environments: [
      'Atendimento Receptivo Premium, SAC Geral, Central 156 / Serviços Públicos, Help Desk'
    ],
    adaptation_environments: [
      'Células exclusivas de telemarketing ativo agressivo sem foco em serviço'
    ],
    naturally_favored_competencies: [
      'Resolução de Problemas (FCR)',
      'Orientação para o Cidadão/Cliente',
      'Domínio Procedimental'
    ],
    suggested_interview_questions: [
      'O que é para você um atendimento de excelência no contact center?',
      'Como você lida com um atendimento em que o sistema está lento mas o cidadão precisa de resposta urgente?',
      'Como garante que o cidadão entendeu perfeitamente os passos que precisa seguir?'
    ]
  },
  'Operador de Alta Pressão': {
    id: 'operador-de-alta-pressao',
    name: 'Operador de Alta Pressão',
    description: 'Elevada resiliência emocional para suportar ambientes de alto estresse, chamadas de emergência, conflitos agudos ou filas saturadas.',
    characteristics: [
      'Estabilidade emocional sob forte pressão situacional',
      'Capacidade de "zerar a mente" entre atendimentos desgastantes',
      'Foco objetivo mesmo diante de manifestações agressivas de terceiros',
      'Baixa sensibilidade ao estresse ambiental e barulho de operação'
    ],
    strengths: [
      'Excelente desempenho em momentos de pico de tráfego e crises operacionais',
      'Capacidade de manter a calma e a clareza em chamadas altamente emotivas ou urgentes',
      'Resistência ao desgaste psicológico acumulado'
    ],
    attention_points: [
      'Pode parecer por vezes excessivamente impassível ou reservado',
      'Recomenda-se garantir que a objetividade não elimine o tom caloroso quando necessário'
    ],
    recommended_environments: [
      'Centrais de Emergência, Cancelamento, Retenção Crítica, Sinistros e Suporte a Crises'
    ],
    adaptation_environments: [
      'Operações de ambiente muito calmo onde se exija bate-papo prolongado de cortesia'
    ],
    naturally_favored_competencies: [
      'Resiliência Operacional',
      'Autocontrole sob Pressão',
      'Estabilidade Emocional'
    ],
    suggested_interview_questions: [
      'Como você se recupera emocionalmente após atender uma ligação extremamente agressiva?',
      'O que você faz para manter a concentração quando a fila está no nível máximo e todos estão agitados?',
      'Como você evita que problemas do trabalho afetem seu estado de espírito fora dele?'
    ]
  },
  'Inovador Operacional': {
    id: 'inovador-operacional',
    name: 'Inovador Operacional',
    description: 'Perfil curioso, proativo na busca por métodos alternativos mais eficientes de trabalho e adepto a novas tecnologias e atalhos produtivos.',
    characteristics: [
      'Curiosidade e iniciativa para testar novas ferramentas',
      'Aversão a processos redundantes ou desnecessariamente burocráticos',
      'Proposição contínua de sugestões de melhoria para a supervisão',
      'Facilidade de aprendizado autodidata'
    ],
    strengths: [
      'Identificação rápida de gargalos de navegabilidade no CRM e sistemas',
      'Sugere atalhos e melhorias que podem otimizar o TMA de toda a equipe',
      'Entusiasmo com a implementação de bots, IA e novas interfaces'
    ],
    attention_points: [
      'Pode tentar desviar do procedimento formal em busca de atalhos antes da aprovação da liderança',
      'Recomenda-se direcionar a proatividade para os canais corretos de sugestão'
    ],
    recommended_environments: [
      'Células de Teste/Piloto, Operações Digitais (Chatbot, WhatsApp, Mídias Sociais) e Implantações'
    ],
    adaptation_environments: [
      'Ambientes altamente burocráticos e engessados com tolerância zero a sugestões'
    ],
    naturally_favored_competencies: [
      'Inovação Prática',
      'Orientação para Eficiência',
      'Abertura a Novas Tecnologias'
    ],
    suggested_interview_questions: [
      'Você já encontrou uma forma mais rápida de realizar uma tarefa no sistema? O que fez a respeito?',
      'Como reage quando uma ferramenta nova é lançada mas apresenta alguns bugs iniciais?',
      'O que você costuma fazer quando percebe um procedimento repetitivo que poderia ser simplificado?'
    ]
  },
  'Líder de Operação': {
    id: 'lider-de-operacao',
    name: 'Líder de Operação',
    description: 'Apresenta visão ampla da operação, senso de propriedade, habilidade natural de influência e equilíbrio entre metas numéricas e gestão de pessoas.',
    characteristics: [
      'Visão sistêmica da cadeia de atendimento e indicadores operacionais',
      'Iniciativa para assumir responsabilidades e apoiar o supervisor',
      'Comunicação clara, motivadora e direcionada a metas',
      'Maturidade social e postura de exemplo para os pares'
    ],
    strengths: [
      'Potencial imediato para desenvolvimento em funções de Monitoria, Multiplicador ou Supervisão',
      'Capacidade de orientar a equipe em momentos de dúvida procedimental',
      'Forte compromisso com os KPIs globais da operação (TMA, TMO, FCR, CSAT)'
    ],
    attention_points: [
      'Deve tomar cuidado para não exercer autoridade informal sem o devido respaldo',
      'Recomenda-se canalizar a liderança para o desenvolvimento colaborativo dos colegas'
    ],
    recommended_environments: [
      'Operações com plano de carreira estruturado, células de suporte a piso e pós-treinamento'
    ],
    adaptation_environments: [
      'Funções isoladas sem perspectiva de crescimento ou interação com a equipe'
    ],
    naturally_favored_competencies: [
      'Visão Sistêmica',
      'Liderança e Influência',
      'Orientação a Resultados e Pessoas'
    ],
    suggested_interview_questions: [
      'Como você ajuda seu supervisor a manter a equipe motivada nos dias de meta difícil?',
      'Se você nota um colega descumprindo uma regra que prejudica os indicadores do grupo, como procede?',
      'Qual sua visão de futuro e como enxerga sua evolução em uma estrutura de Contact Center?'
    ]
  },
  'Mediador': {
    id: 'mediador',
    name: 'Mediador',
    description: 'Excelência no equilíbrio de conflitos, ponderação imparcial e conciliação entre exigências regulatórias e expectativas do público.',
    characteristics: [
      'Ponderação e imparcialidade ao analisar reclamações e divergências',
      'Habilidade para encontrar denominadores comuns em impasses',
      'Escuta atenta aliada à clareza nas explicações procedimentais',
      'Postura pacificadora e mediadora'
    ],
    strengths: [
      'Resolução de disputas complexas em instâncias de segunda análise (Ouvidoria)',
      'Excelente capacidade de reverter insatisfações graves convertendo-as em confiança',
      'Harmonização de relações desgastadas entre cliente e instituição'
    ],
    attention_points: [
      'Pode prolongar a tomada de decisão em busca de um consenso perfeito',
      'Recomenda-se ponderar os prazos limite de resposta regulatória (ex: prazos de ouvidoria)'
    ],
    recommended_environments: [
      'Ouvidoria, Mediação de Conflitos, Tratamento de Procon/ReclameAqui e Casos Especiais'
    ],
    adaptation_environments: [
      'Atendimento ativo automatizado focado em disparos em massa e curtíssimo tempo de contato'
    ],
    naturally_favored_competencies: [
      'Mediação de Conflitos',
      'Ponderação e Imparcialidade',
      'Solução Consensual'
    ],
    suggested_interview_questions: [
      'Como você procede ao atender alguém que esgotou todas as tentativas anteriores sem sucesso?',
      'Qual a diferença entre dar razão ao cliente e acolher a insatisfação dele mantendo a regra?',
      'Como lida com situações em que ambas as partes (operação e cidadão) possuem argumentos válidos?'
    ]
  }
};

export const JOB_TARGET_PROFILES = [
  {
    id: 'operador-padrao',
    title: 'Operador de Atendimento Geral',
    expected_openness: 50,
    expected_conscientiousness: 75,
    expected_extraversion: 60,
    expected_agreeableness: 75,
    expected_emotional_stability: 70,
    description: 'Atendimento receptivo padrão focado em cortejo, precisão de registro e cumprimento de script.'
  },
  {
    id: 'operador-critico',
    title: 'Operador de Atendimento Crítico / Emergência',
    expected_openness: 45,
    expected_conscientiousness: 80,
    expected_extraversion: 55,
    expected_agreeableness: 70,
    expected_emotional_stability: 90,
    description: 'Centrais de emergência, sinistros ou saúde exigindo elevadíssimo autocontrole e resiliência.'
  },
  {
    id: 'vendas-retencao',
    title: 'Operador de Vendas / Retenção / Cobrança',
    expected_openness: 50,
    expected_conscientiousness: 70,
    expected_extraversion: 85,
    expected_agreeableness: 50,
    expected_emotional_stability: 80,
    description: 'Operações focadas em metas comerciais, persuasão, firmeza e superação de objeções.'
  },
  {
    id: 'monitoria-qualidade',
    title: 'Monitoria / Analyst de Qualidade',
    expected_openness: 60,
    expected_conscientiousness: 90,
    expected_extraversion: 40,
    expected_agreeableness: 60,
    expected_emotional_stability: 80,
    description: 'Auditoria de chamados, compliance, checagem minuciosa e aplicação de critérios de monitoria.'
  },
  {
    id: 'supervisor-operacao',
    title: 'Supervisor / Líder de Equipe',
    expected_openness: 65,
    expected_conscientiousness: 80,
    expected_extraversion: 80,
    expected_agreeableness: 70,
    expected_emotional_stability: 80,
    description: 'Gestão de piso, acompanhamento de KPIs de equipe, motivação e mediação situacional.'
  }
];

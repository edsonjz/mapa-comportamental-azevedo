/**
 * MÓDULO 3 — JULGAMENTO SITUACIONAL (SJT) — V2
 * 15 perguntas por função, 4 alternativas cada, com pontuação 0-3.
 *
 * 3 = resposta mais adequada
 * 2 = resposta aceitável
 * 1 = resposta parcialmente adequada
 * 0 = resposta inadequada
 *
 * A ordem das alternativas (chaves A, B, C, D e pontuações 0-3) é distribuída
 * de forma variada em cada questão no dataset para evitar viés posicional fixo.
 */

export interface SjtOption {
  key: 'A' | 'B' | 'C' | 'D';
  text: string;
  score: number;
  competencies: string[];
}

export interface V2SjtQuestion {
  code: string;
  questionNumber: number;
  text: string;
  situation: string;
  options: SjtOption[];
  evaluates: string[];
}

// ============================================================
// OPERADOR DE ATENDIMENTO — 15 situações
// ============================================================
export const SJT_OPERADOR: V2SjtQuestion[] = [
  {
    code: 'SJT_OP_01', questionNumber: 1,
    text: 'Cidadão irritado',
    situation: 'Um cidadão liga extremamente irritado porque já tentou resolver seu problema três vezes sem sucesso. Ele começa a gritar antes mesmo de você terminar a saudação.',
    options: [
      { key: 'A', text: 'Solicito que o cidadão se acalme para conseguir registrar a demanda.', score: 1, competencies: ['comunicação'] },
      { key: 'B', text: 'Retomo o histórico dos chamados anteriores para agilizar a solução.', score: 2, competencies: ['procedimento', 'resolução'] },
      { key: 'C', text: 'Acolho a frustração em tom calmo antes de direcionar o atendimento.', score: 3, competencies: ['escuta', 'estabilidade', 'comunicação'] },
      { key: 'D', text: 'Interrompo a fala para informar as regras de atendimento do canal.', score: 0, competencies: [] }
    ],
    evaluates: ['escuta', 'estabilidade', 'comunicação']
  },
  {
    code: 'SJT_OP_02', questionNumber: 2,
    text: 'Informação incompleta',
    situation: 'O cidadão solicita uma informação, mas os dados no sistema estão incompletos. Você não encontra a resposta na base de conhecimento.',
    options: [
      { key: 'A', text: 'Oriento o cidadão a retornar a ligação mais tarde para novo teste.', score: 0, competencies: [] },
      { key: 'B', text: 'Anoto a demanda detalhada para pesquisar e dar o retorno em seguida.', score: 3, competencies: ['resolução', 'responsabilidade', 'procedimento'] },
      { key: 'C', text: 'Respondo com base no que me recordo de casos semelhantes.', score: 1, competencies: ['comunicação'] },
      { key: 'D', text: 'Deixo a ligação em espera enquanto consulto o supervisor do turno.', score: 2, competencies: ['procedimento', 'julgamento'] }
    ],
    evaluates: ['resolução', 'procedimento', 'responsabilidade']
  },
  {
    code: 'SJT_OP_03', questionNumber: 3,
    text: 'Sistema indisponível',
    situation: 'No meio de um atendimento, o sistema principal cai. Você tem o cidadão na linha esperando.',
    options: [
      { key: 'A', text: 'Solicito que o cidadão desligue e tente contato em outro horário.', score: 0, competencies: [] },
      { key: 'B', text: 'Mantenho a linha em espera enquanto aguardo a normalização da rede.', score: 1, competencies: ['procedimento'] },
      { key: 'C', text: 'Presto as orientações gerais e encaminho a demanda para retaguarda.', score: 2, competencies: ['resolução', 'julgamento'] },
      { key: 'D', text: 'Anoto os dados essenciais para concluir o registro assim que o sistema retornar.', score: 3, competencies: ['resolução', 'comunicação', 'responsabilidade'] }
    ],
    evaluates: ['resolução', 'comunicação', 'julgamento']
  },
  {
    code: 'SJT_OP_04', questionNumber: 4,
    text: 'Dúvida sobre procedimento',
    situation: 'Você recebe uma solicitação que não está claramente coberta pelo procedimento. Não tem certeza de como proceder.',
    options: [
      { key: 'A', text: 'Consulto a base de conhecimento ou apoio técnico antes de confirmar.', score: 3, competencies: ['procedimento', 'responsabilidade', 'julgamento'] },
      { key: 'B', text: 'Decido pelo caminho que parece mais ágil para liberar o atendimento.', score: 1, competencies: ['julgamento'] },
      { key: 'C', text: 'Sigo o fluxo da demanda mais similar já existente no catálogo.', score: 2, competencies: ['julgamento', 'resolução'] },
      { key: 'D', text: 'Encaminho a ligação para a fila geral de atendimento especializado.', score: 0, competencies: [] }
    ],
    evaluates: ['procedimento', 'julgamento', 'responsabilidade']
  },
  {
    code: 'SJT_OP_05', questionNumber: 5,
    text: 'Cidadão estruturalmente insatisfeito',
    situation: 'Um cidadão insiste em uma solução que não está prevista nos procedimentos. Ele já foi informado, mas continua pedindo.',
    options: [
      { key: 'A', text: 'Repito o texto padrão do script até a aceitação do cidadão.', score: 0, competencies: [] },
      { key: 'B', text: 'Esclareço a vedação do procedimento e indico o canal de ouvidoria.', score: 2, competencies: ['comunicação', 'procedimento'] },
      { key: 'C', text: 'Apresento as opções normativas viáveis para mitigar a insatisfação.', score: 3, competencies: ['comunicação', 'escuta', 'procedimento'] },
      { key: 'D', text: 'Concedo a solicitação atípica para evitar o desgaste no contato.', score: 0, competencies: [] }
    ],
    evaluates: ['comunicação', 'procedimento', 'estabilidade']
  },
  {
    code: 'SJT_OP_06', questionNumber: 6,
    text: 'Erro de registro',
    situation: 'Você percebe, ao revisar um atendimento que acabou de concluir, que registrou uma informação incorreta no sistema.',
    options: [
      { key: 'A', text: 'Ajusto o dado no formulário sem realizar notificação adicional.', score: 1, competencies: ['resolução'] },
      { key: 'B', text: 'Atualizo o registro no sistema e reporto a correção à supervisão.', score: 3, competencies: ['responsabilidade', 'procedimento'] },
      { key: 'C', text: 'Corrijo o campo incorreto e insiro uma observação explicativa.', score: 2, competencies: ['responsabilidade', 'procedimento'] },
      { key: 'D', text: 'Mantenho o registro atual pelo receio de alterar histórico encerrado.', score: 0, competencies: [] }
    ],
    evaluates: ['responsabilidade', 'procedimento']
  },
  {
    code: 'SJT_OP_07', questionNumber: 7,
    text: 'Pressão de fila',
    situation: 'A fila está muito grande, o TMA está alto e seu supervisor pede para acelerar os atendimentos. Porém, o próximo cidadão tem um caso complexo.',
    options: [
      { key: 'A', text: 'Foco nas perguntas objetivas para manter a precisão do registro em tempo hábil.', score: 3, competencies: ['julgamento', 'prioridade', 'comunicação'] },
      { key: 'B', text: 'Reduzo as explicações necessárias para diminuir o tempo de tela.', score: 0, competencies: [] },
      { key: 'C', text: 'Mantenho a rotina detalhada de atendimento sem alterar o ritmo habitual.', score: 2, competencies: ['estabilidade', 'resolução'] },
      { key: 'D', text: 'Direciono a solicitação complexa para tratamento na retaguarda.', score: 1, competencies: ['julgamento'] }
    ],
    evaluates: ['julgamento', 'prioridade', 'estabilidade']
  },
  {
    code: 'SJT_OP_08', questionNumber: 8,
    text: 'Colega pedindo ajuda',
    situation: 'Um colega ao lado pede sua ajuda com uma dúvida enquanto você está em atendimento.',
    options: [
      { key: 'A', text: 'Mantenho o foco exclusivo na chamada sem fazer contato visual.', score: 1, competencies: ['prioridade'] },
      { key: 'B', text: 'Respondo a dúvida em voz baixa mantendo a escuta no cidadão.', score: 2, competencies: ['comunicação'] },
      { key: 'C', text: 'Pauso o atendimento em andamento para pesquisar a dúvida do colega.', score: 0, competencies: [] },
      { key: 'D', text: 'Gesticulo que darei suporte ao colega logo após finalizar o protocolo.', score: 3, competencies: ['prioridade', 'comunicação', 'responsabilidade'] }
    ],
    evaluates: ['prioridade', 'comunicação', 'responsabilidade']
  },
  {
    code: 'SJT_OP_09', questionNumber: 9,
    text: 'Conflito procedimento vs expectativa',
    situation: 'O cidadão pede algo que faz sentido do ponto de vista dele, mas que contraria o procedimento.',
    options: [
      { key: 'A', text: 'Informo a negativa diretamente citando o código da instrução.', score: 1, competencies: ['procedimento'] },
      { key: 'B', text: 'Contextualizo a razão da regra e indico o caminho regulamentar disponível.', score: 3, competencies: ['comunicação', 'procedimento', 'escuta'] },
      { key: 'C', text: 'Anoto a divergência como ressalva no chamado e sigo a norma.', score: 2, competencies: ['procedimento', 'comunicação'] },
      { key: 'D', text: 'Atendo o pedido do cidadão registrando como caso extraordinário.', score: 0, competencies: [] }
    ],
    evaluates: ['comunicação', 'procedimento', 'julgamento']
  },
  {
    code: 'SJT_OP_10', questionNumber: 10,
    text: 'Necessidade de investigação',
    situation: 'O cidadão relata um problema que você nunca viu antes. Não há instrução específica para esse caso.',
    options: [
      { key: 'A', text: 'Repasso o chamado para a área técnica sem triagem aprofundada.', score: 1, competencies: ['procedimento'] },
      { key: 'B', text: 'Adoto a solução utilizada em protocolos de natureza semelhante.', score: 2, competencies: ['resolução', 'julgamento'] },
      { key: 'C', text: 'Levanto os detalhes do caso e encaminho com o diagnóstico preenchido.', score: 3, competencies: ['resolução', 'julgamento', 'responsabilidade'] },
      { key: 'D', text: 'Comunico a ausência de previsão para essa demanda específica.', score: 0, competencies: [] }
    ],
    evaluates: ['resolução', 'julgamento', 'responsabilidade']
  },
  {
    code: 'SJT_OP_11', questionNumber: 11,
    text: 'Atendimento prolongado',
    situation: 'Você já está há 20 minutos com o mesmo cidadão. O caso está avançando, mas lentamente.',
    options: [
      { key: 'A', text: 'Atualizo o cidadão sobre as etapas finais para concluir com clareza.', score: 3, competencies: ['comunicação', 'estabilidade', 'resolução'] },
      { key: 'B', text: 'Encerro os esclarecimentos de forma resumida para liberar a linha.', score: 1, competencies: ['prioridade'] },
      { key: 'C', text: 'Conduzo o atendimento no ritmo necessário até esgotar todas as dúvidas.', score: 2, competencies: ['estabilidade', 'resolução'] },
      { key: 'D', text: 'Sugiro a continuidade do atendimento em um momento de menor fluxo.', score: 0, competencies: [] }
    ],
    evaluates: ['comunicação', 'estabilidade', 'prioridade']
  },
  {
    code: 'SJT_OP_12', questionNumber: 12,
    text: 'Informação contraditória',
    situation: 'O cidadão afirma que recebeu uma informação diferente da que está no sistema. Ele tem um protocolo anterior.',
    options: [
      { key: 'A', text: 'Reafirmo a instrução atual orientando a desconsiderar o histórico.', score: 1, competencies: ['procedimento'] },
      { key: 'B', text: 'Abro um chamado de apuração sobre a orientação divergente anterior.', score: 2, competencies: ['procedimento', 'responsabilidade'] },
      { key: 'C', text: 'Sigo a orientação trazida pelo cidadão para evitar contestação.', score: 0, competencies: [] },
      { key: 'D', text: 'Checo o protocolo citado e pontuo com transparência a regra vigente.', score: 3, competencies: ['resolução', 'procedimento', 'comunicação'] }
    ],
    evaluates: ['resolução', 'procedimento', 'comunicação']
  },
  {
    code: 'SJT_OP_13', questionNumber: 13,
    text: 'Receber crítica',
    situation: 'Ao final do atendimento, o cidadão diz que achou o serviço demorado e que esperava mais agilidade.',
    options: [
      { key: 'A', text: 'Justifico que o tempo elevado foi necessário devido ao nível de detalhamento.', score: 2, competencies: ['comunicação'] },
      { key: 'B', text: 'Agradeço o comentário com cortesia e enfatizo a busca pela solução.', score: 3, competencies: ['comunicação', 'estabilidade', 'escuta'] },
      { key: 'C', text: 'Finalizo o protocolo com a saudação padrão sem mencionar o comentário.', score: 1, competencies: ['estabilidade'] },
      { key: 'D', text: 'Atribuo o tempo de espera à alta demanda no sistema de atendimento.', score: 0, competencies: [] }
    ],
    evaluates: ['comunicação', 'estabilidade', 'escuta']
  },
  {
    code: 'SJT_OP_14', questionNumber: 14,
    text: 'Mudança de procedimento',
    situation: 'No início do turno, você é informado de que o procedimento para uma demanda frequente foi alterado. Você não teve tempo de estudar a mudança.',
    options: [
      { key: 'A', text: 'Mantenho o padrão anterior até ter disponibilidade para estudo completo.', score: 1, competencies: ['procedimento'] },
      { key: 'B', text: 'Esclareço as alterações com um colega de equipe no início da jornada.', score: 2, competencies: ['julgamento', 'comunicação'] },
      { key: 'C', text: 'Consulto os pontos chave da instrução atualizada antes do primeiro contato.', score: 3, competencies: ['responsabilidade', 'procedimento', 'julgamento'] },
      { key: 'D', text: 'Realizo os atendimentos aplicando o fluxo conforme as dúvidas surgirem.', score: 0, competencies: [] }
    ],
    evaluates: ['responsabilidade', 'procedimento', 'julgamento']
  },
  {
    code: 'SJT_OP_15', questionNumber: 15,
    text: 'Fechamento correto',
    situation: 'Você resolveu o problema do cidadão. Ele parece satisfeito. O que faz antes de encerrar?',
    options: [
      { key: 'A', text: 'Valido o entendimento final e concluo a documentação do protocolo.', score: 3, competencies: ['procedimento', 'comunicação', 'responsabilidade'] },
      { key: 'B', text: 'Pergunto se há dúvidas remanescentes antes da despedida.', score: 2, competencies: ['comunicação'] },
      { key: 'C', text: 'Registro a síntese no formulário e fecho a tela sem revisão.', score: 1, competencies: ['procedimento'] },
      { key: 'D', text: 'Finalizo a chamada logo após passar a resposta principal.', score: 0, competencies: [] }
    ],
    evaluates: ['procedimento', 'comunicação', 'responsabilidade']
  }
];

// ============================================================
// MONITOR DE QUALIDADE — 15 situações
// ============================================================
export const SJT_MONITOR: V2SjtQuestion[] = [
  {
    code: 'SJT_MQ_01', questionNumber: 1,
    text: 'Operador contestando monitoria',
    situation: 'Um operador contesta sua avaliação de monitoria, afirmando que a nota foi injusta e que ele seguiu o procedimento.',
    options: [
      { key: 'A', text: 'Reafirmo o resultado formulado declarando o caso como encerrado.', score: 0, competencies: [] },
      { key: 'B', text: 'Repasso a contestação para validação direta da supervisão operacional.', score: 1, competencies: ['disciplina'] },
      { key: 'C', text: 'Apresento a gravação confrontando a pontuação com a régua do formulário.', score: 3, competencies: ['comunicação', 'imparcialidade', 'assertividade'] },
      { key: 'D', text: 'Reconsidero a pontuação apontada para preservar o clima de equipe.', score: 0, competencies: [] }
    ],
    evaluates: ['imparcialidade', 'assertividade', 'comunicação']
  },
  {
    code: 'SJT_MQ_02', questionNumber: 2,
    text: 'Erro pequeno mas recorrente',
    situation: 'Ao monitorar atendimentos, você percebe que vários operadores cometem o mesmo erro pequeno na saudação.',
    options: [
      { key: 'A', text: 'Mapeio a reincidência técnica e reporto o desvio coletivo à supervisão.', score: 3, competencies: ['análise', 'comunicação', 'orientação_qualidade'] },
      { key: 'B', text: 'Limito-me a registrar os descontos individuais nas fichas de avaliação.', score: 1, competencies: ['disciplina'] },
      { key: 'C', text: 'Oriento os atendentes pontualmente durante as sessões de feedback.', score: 2, competencies: ['comunicação', 'assertividade'] },
      { key: 'D', text: 'Desconsidero o apontamento no indicador pelo baixo impacto aparente.', score: 0, competencies: [] }
    ],
    evaluates: ['análise', 'orientação_qualidade', 'comunicação']
  },
  {
    code: 'SJT_MQ_03', questionNumber: 3,
    text: 'Conflito TMA vs qualidade',
    situation: 'Um operador tem TMA alto, mas a qualidade dos atendimentos é excelente. O supervisor pressiona para reduzir o TMA.',
    options: [
      { key: 'A', text: 'Aplico critérios de avaliação mais rígidos para induzir agilidade.', score: 0, competencies: [] },
      { key: 'B', text: 'Mantenho a nota técnica e apresento o histórico de qualidade à gestão.', score: 2, competencies: ['imparcialidade', 'assertividade'] },
      { key: 'C', text: 'Recomendo ao atendente a redução do tempo nas etapas de diálogo.', score: 1, competencies: ['comunicação'] },
      { key: 'D', text: 'Indico oportunidades de objetividade sem comprometer os itens normativos.', score: 3, competencies: ['análise', 'imparcialidade', 'tomada_decisao'] }
    ],
    evaluates: ['análise', 'imparcialidade', 'tomada_decisao']
  },
  {
    code: 'SJT_MQ_04', questionNumber: 4,
    text: 'Divergência entre monitores',
    situation: 'Você e outro monitor avaliam o mesmo atendimento e chegam a notas diferentes.',
    options: [
      { key: 'A', text: 'Sustento meu parecer inicial considerando minha experiência de escuta.', score: 1, competencies: ['assertividade'] },
      { key: 'B', text: 'Alinho a interpretação dos critérios com o colega perante o manual.', score: 3, competencies: ['consistência', 'comunicação', 'disciplina'] },
      { key: 'C', text: 'Submeto o áudio para alinhamento definitivo da supervisão de qualidade.', score: 2, competencies: ['disciplina'] },
      { key: 'D', text: 'Calculo a pontuação intermediária entre os dois pareceres divergentes.', score: 0, competencies: [] }
    ],
    evaluates: ['consistência', 'comunicação', 'disciplina']
  },
  {
    code: 'SJT_MQ_05', questionNumber: 5,
    text: 'Operador excelente contestando nota',
    situation: 'O melhor operador da equipe contesta uma nota 85 que você deu. Ele argumenta que sempre tira acima de 90.',
    options: [
      { key: 'A', text: 'Concedo a pontuação pleiteada para incentivar o histórico positivo.', score: 0, competencies: [] },
      { key: 'B', text: 'Enfatizo que o apontamento pontual não compromete seu histórico alto.', score: 2, competencies: ['comunicação'] },
      { key: 'C', text: 'Demonstro com trechos do áudio a desconformidade isolada observada.', score: 3, competencies: ['imparcialidade', 'assertividade', 'comunicação'] },
      { key: 'D', text: 'Reitero a aplicação estrita da régua sem detalhar os trechos.', score: 1, competencies: ['imparcialidade'] }
    ],
    evaluates: ['imparcialidade', 'assertividade', 'comunicação']
  },
  {
    code: 'SJT_MQ_06', questionNumber: 6,
    text: 'Necessidade de feedback',
    situation: 'Você precisa dar feedback para um operador que teve nota baixa em monitoria pela terceira vez consecutiva.',
    options: [
      { key: 'A', text: 'Conduzo feedback focado no diagnóstico das dificuldades e metas claras.', score: 3, competencies: ['comunicação', 'assertividade', 'orientação_qualidade'] },
      { key: 'B', text: 'Transmito os formulários com os apontamentos via e-mail corporativo.', score: 1, competencies: ['disciplina'] },
      { key: 'C', text: 'Alerto a supervisão sobre o histórico de queda para tomada de medidas.', score: 2, competencies: ['disciplina', 'comunicação'] },
      { key: 'D', text: 'Aguardo o próximo ciclo de monitorias para verificar reação natural.', score: 0, competencies: [] }
    ],
    evaluates: ['comunicação', 'assertividade', 'orientação_qualidade']
  },
  {
    code: 'SJT_MQ_07', questionNumber: 7,
    text: 'Comportamento inadequado',
    situation: 'Durante a escuta de uma gravação, você percebe que o operador usou um tom irônico com o cidadão.',
    options: [
      { key: 'A', text: 'Registro o desconto na ficha sem abordar a postura no feedback.', score: 1, competencies: ['disciplina'] },
      { key: 'B', text: 'Reporto a conduta grave direto à supervisão da operação.', score: 2, competencies: ['disciplina', 'comunicação'] },
      { key: 'C', text: 'Aplico a penalização cabível e executo feedback focado no tom de voz.', score: 3, competencies: ['imparcialidade', 'disciplina', 'comunicação'] },
      { key: 'D', text: 'Relevo a atitude isolada diante do bom desempenho procedimental.', score: 0, competencies: [] }
    ],
    evaluates: ['imparcialidade', 'disciplina', 'comunicação']
  },
  {
    code: 'SJT_MQ_08', questionNumber: 8,
    text: 'Erro de procedimento',
    situation: 'O operador seguiu um procedimento antigo que já foi atualizado. O atendimento fluiu bem, mas o procedimento está errado.',
    options: [
      { key: 'A', text: 'Isento a penalização haja vista a resolução satisfatória do caso.', score: 0, competencies: [] },
      { key: 'B', text: 'Pontuo e informo ao supervisor sobre o gap de comunicação.', score: 2, competencies: ['orientação_qualidade', 'comunicação'] },
      { key: 'C', text: 'Aplico o desconto de nota sem detalhar a mudança normativa.', score: 1, competencies: ['disciplina'] },
      { key: 'D', text: 'Pontuo o descumprimento e checo o nível de alcance da nova instrução.', score: 3, competencies: ['orientação_qualidade', 'análise', 'comunicação'] }
    ],
    evaluates: ['orientação_qualidade', 'análise', 'comunicação']
  },
  {
    code: 'SJT_MQ_09', questionNumber: 9,
    text: 'Avaliação ambígua',
    situation: 'Ao avaliar um atendimento, você percebe que a situação é ambígua — o operador poderia ter agido de duas formas, ambas defensáveis.',
    options: [
      { key: 'A', text: 'Aplico a norma vigente e proponho alinhamento na calibração de equipe.', score: 3, competencies: ['consistência', 'análise', 'tomada_decisao'] },
      { key: 'B', text: 'Valido a conduta do operador considerando a margem de interpretação.', score: 2, competencies: ['imparcialidade'] },
      { key: 'C', text: 'Adoto a diretriz de maior penalidade para resguardar o indicador.', score: 1, competencies: ['disciplina'] },
      { key: 'D', text: 'Descarto a amostragem ambígua substituindo por nova gravação.', score: 0, competencies: [] }
    ],
    evaluates: ['consistência', 'análise', 'tomada_decisao']
  },
  {
    code: 'SJT_MQ_10', questionNumber: 10,
    text: 'Pressão da operação',
    situation: 'O supervisor pede que você reduza o tempo gasto em monitorias para ajudar na operação, pois a fila está grande.',
    options: [
      { key: 'A', text: 'Reduzo o tempo de análise técnica para cumprir a cota de formulários.', score: 1, competencies: ['disciplina'] },
      { key: 'B', text: 'Redireciono a amostragem para focos críticos preservando o rigor técnico.', score: 3, competencies: ['assertividade', 'tomada_decisao', 'disciplina'] },
      { key: 'C', text: 'Mantenho o plano semanal de auditorias sem alterar a rotina agendada.', score: 2, competencies: ['disciplina', 'assertividade'] },
      { key: 'D', text: 'Interrompo as atividades de qualidade para assumir a fila de atendimento.', score: 0, competencies: [] }
    ],
    evaluates: ['assertividade', 'tomada_decisao', 'disciplina']
  },
  {
    code: 'SJT_MQ_11', questionNumber: 11,
    text: 'Manter imparcialidade',
    situation: 'Você precisa avaliar o atendimento de um colega com quem tem boa amizade. A monitoria revelou alguns erros.',
    options: [
      { key: 'A', text: 'Relevo inconsistências menores devido ao vínculo de amizade.', score: 0, competencies: [] },
      { key: 'B', text: 'Solicito a redistribuição da gravação a outro membro da equipe.', score: 2, competencies: ['imparcialidade', 'tomada_decisao'] },
      { key: 'C', text: 'Aplico os critérios formais independentemente da relação pessoal.', score: 3, competencies: ['imparcialidade', 'disciplina', 'consistência'] },
      { key: 'D', text: 'Concluo a avaliação técnica omitindo minha autoria no feedback.', score: 1, competencies: ['imparcialidade'] }
    ],
    evaluates: ['imparcialidade', 'disciplina', 'consistência']
  },
  {
    code: 'SJT_MQ_12', questionNumber: 12,
    text: 'Padrão de erro descoberto',
    situation: 'Você identifica que todos os operadores de uma célula específica cometem o mesmo tipo de erro no registro.',
    options: [
      { key: 'A', text: 'Limito o tratamento às penalizações individuais de cada ficha.', score: 1, competencies: ['disciplina'] },
      { key: 'B', text: 'Notifico informalmente a supervisão sobre o vício operacional.', score: 2, competencies: ['comunicação'] },
      { key: 'C', text: 'Acompanho o comportamento da métrica na amostragem seguinte.', score: 0, competencies: [] },
      { key: 'D', text: 'Consolido os dados de falha e apresento plano de contenção à gestão.', score: 3, competencies: ['análise', 'orientação_qualidade', 'comunicação'] }
    ],
    evaluates: ['análise', 'orientação_qualidade', 'comunicação']
  },
  {
    code: 'SJT_MQ_13', questionNumber: 13,
    text: 'Operador produtivo com baixa qualidade',
    situation: 'Um operador tem o melhor TMA da equipe, mas a qualidade das interações está consistentemente abaixo da meta.',
    options: [
      { key: 'A', text: 'Oriento sobre os pontos de atrito entre a agilidade e a conformidade.', score: 3, competencies: ['análise', 'comunicação', 'orientação_qualidade'] },
      { key: 'B', text: 'Aplico a régua de auditoria sem ponderar o ganho de produtividade.', score: 2, competencies: ['disciplina', 'imparcialidade'] },
      { key: 'C', text: 'Encaminho o caso à supervisão para definição de diretriz de nota.', score: 1, competencies: ['disciplina'] },
      { key: 'D', text: 'Flexibilizo os erros técnicos para manter o volume de atendimento.', score: 0, competencies: [] }
    ],
    evaluates: ['análise', 'orientação_qualidade', 'comunicação']
  },
  {
    code: 'SJT_MQ_14', questionNumber: 14,
    text: 'Qualidade alta mas baixa produtividade',
    situation: 'Um operador tem qualidade excelente (nota 98), mas produtividade muito abaixo da meta.',
    options: [
      { key: 'A', text: 'Restringo o feedback aos aspectos de aderência ao formulário.', score: 2, competencies: ['disciplina'] },
      { key: 'B', text: 'Elogio a precisão técnica e aponto atalhos operacionais seguros.', score: 3, competencies: ['comunicação', 'análise', 'orientação_qualidade'] },
      { key: 'C', text: 'Recomendo à supervisão o acompanhamento focado em velocidade.', score: 1, competencies: ['comunicação'] },
      { key: 'D', text: 'Pontuo com maior rigor em busca de aceleração de ritmo.', score: 0, competencies: [] }
    ],
    evaluates: ['comunicação', 'análise', 'orientação_qualidade']
  },
  {
    code: 'SJT_MQ_15', questionNumber: 15,
    text: 'Priorização de monitorias',
    situation: 'Você tem 30 monitorias para fazer esta semana, mas só tem tempo para 20. Como prioriza?',
    options: [
      { key: 'A', text: 'Executo as avaliações por ordem cronológica até o limite de tempo.', score: 0, competencies: [] },
      { key: 'B', text: 'Reduzo proporcionalmente a cota de monitoria de todos os grupos.', score: 2, competencies: ['imparcialidade', 'disciplina'] },
      { key: 'C', text: 'Foco o saldo de auditorias nos perfis de maior risco operacional.', score: 3, competencies: ['tomada_decisao', 'análise', 'disciplina'] },
      { key: 'D', text: 'Seleciono amostras de profissionais veteranos para agilizar.', score: 1, competencies: ['disciplina'] }
    ],
    evaluates: ['tomada_decisao', 'análise', 'disciplina']
  }
];

// ============================================================
// INSTRUTOR DE TREINAMENTO — 15 situações
// ============================================================
export const SJT_INSTRUTOR: V2SjtQuestion[] = [
  {
    code: 'SJT_IT_01', questionNumber: 1,
    text: 'Aluno com dificuldade',
    situation: 'Um aluno está visivelmente perdido durante a explicação de um procedimento novo. O restante da turma parece acompanhando.',
    options: [
      { key: 'A', text: 'Sigo com a exposição e me coloco à disposição no intervalo.', score: 2, competencies: ['didática'] },
      { key: 'B', text: 'Reviso a explicação completa do módulo para todo o grupo.', score: 1, competencies: ['paciência'] },
      { key: 'C', text: 'Retomo o conceito usando um exemplo prático sem expor o participante.', score: 3, competencies: ['didática', 'empatia', 'flexibilidade'] },
      { key: 'D', text: 'Reforço a necessidade de concentração com o aluno em sala.', score: 0, competencies: [] }
    ],
    evaluates: ['didática', 'empatia', 'flexibilidade']
  },
  {
    code: 'SJT_IT_02', questionNumber: 2,
    text: 'Aluno muito participativo',
    situation: 'Um aluno é muito participativo e faz perguntas constantemente, às vezes tirando o foco da turma.',
    options: [
      { key: 'A', text: 'Acolho as colocações e direciono as dúvidas pontuais para a pauta final.', score: 3, competencies: ['controle_grupo', 'comunicação', 'paciência'] },
      { key: 'B', text: 'Solicito que as intervenções sejam guardadas para o bloco de dúvidas.', score: 2, competencies: ['controle_grupo'] },
      { key: 'C', text: 'Atendo a cada questionamento estendendo o tempo previsto por tópico.', score: 1, competencies: ['paciência'] },
      { key: 'D', text: 'Prossigo com o material sem dar vazão às interrupções frequentes.', score: 0, competencies: [] }
    ],
    evaluates: ['controle_grupo', 'comunicação', 'paciência']
  },
  {
    code: 'SJT_IT_03', questionNumber: 3,
    text: 'Aluno resistente',
    situation: 'Um aluno afirma que "já sabe tudo isso" e demonstra resistência ao conteúdo do treinamento.',
    options: [
      { key: 'A', text: 'Relembro a obrigatoriedade da presença e conclusão da carga horária.', score: 1, competencies: ['comunicação'] },
      { key: 'B', text: 'Valido a vivência prévia do aluno conectando-a às atualizações da sala.', score: 3, competencies: ['influência', 'comunicação', 'domínio_social'] },
      { key: 'C', text: 'Convido o participante a apoiar os colegas nos exercícios em dupla.', score: 2, competencies: ['influência', 'criatividade'] },
      { key: 'D', text: 'Ministro o conteúdo ignorando as manifestações de desinteresse.', score: 0, competencies: [] }
    ],
    evaluates: ['influência', 'comunicação', 'domínio_social']
  },
  {
    code: 'SJT_IT_04', questionNumber: 4,
    text: 'Turma heterogênea',
    situation: 'Sua turma tem pessoas com experiências muito diferentes: algumas já trabalharam em contact center, outras nunca tiveram contato.',
    options: [
      { key: 'A', text: 'Conduzo a apresentação no ritmo médio previsto na ementa.', score: 1, competencies: ['didática'] },
      { key: 'B', text: 'Dedico maior tempo de explicação às bases fundamentais da função.', score: 2, competencies: ['empatia', 'didática'] },
      { key: 'C', text: 'Divido a turma propondo dinâmicas com níveis de desafio distintos.', score: 1, competencies: ['criatividade'] },
      { key: 'D', text: 'Formo duplas mistas para favorecer a troca de experiências práticas.', score: 3, competencies: ['flexibilidade', 'didática', 'criatividade'] }
    ],
    evaluates: ['flexibilidade', 'didática', 'criatividade']
  },
  {
    code: 'SJT_IT_05', questionNumber: 5,
    text: 'Mudança de procedimento durante treinamento',
    situation: 'No meio do treinamento, você é informado de que um procedimento que acabou de ensinar foi alterado.',
    options: [
      { key: 'A', text: 'Finalizo o módulo no formato antigo para não confundir os alunos.', score: 0, competencies: [] },
      { key: 'B', text: 'Comunico o ajuste imediatamente destacando a comparação prática.', score: 3, competencies: ['comunicação', 'flexibilidade', 'aprendizagem'] },
      { key: 'C', text: 'Pauso a apresentação para assimilar os novos detalhes técnicos.', score: 2, competencies: ['aprendizagem'] },
      { key: 'D', text: 'Oriento a turma a consultar a versão atualizada na documentação.', score: 1, competencies: ['comunicação'] }
    ],
    evaluates: ['comunicação', 'flexibilidade', 'aprendizagem']
  },
  {
    code: 'SJT_IT_06', questionNumber: 6,
    text: 'Erro cometido pelo instrutor',
    situation: 'Durante uma explicação, você percebe que passou uma informação incorreta para a turma.',
    options: [
      { key: 'A', text: 'Faço o alinhamento do ponto correto na revisão sem enfatizar a falha.', score: 2, competencies: ['comunicação'] },
      { key: 'B', text: 'Esclareço o equívoco na hora e reafirmo a informação correta.', score: 3, competencies: ['comunicação', 'aprendizagem', 'domínio_social'] },
      { key: 'C', text: 'Deixo a correção para o momento de encerramento no dia seguinte.', score: 0, competencies: [] },
      { key: 'D', text: 'Encaminho uma nota formal com o ajuste de conteúdo após a sessão.', score: 1, competencies: ['comunicação'] }
    ],
    evaluates: ['comunicação', 'aprendizagem', 'domínio_social']
  },
  {
    code: 'SJT_IT_07', questionNumber: 7,
    text: 'Aluno lento no aprendizado',
    situation: 'Um aluno precisa de mais tempo e repetições para absorver o conteúdo. O cronograma está apertado.',
    options: [
      { key: 'A', text: 'Forneço guias de apoio e agendo acompanhamento no intervalo.', score: 3, competencies: ['paciência', 'didática', 'empatia'] },
      { key: 'B', text: 'Sigo o cronograma recomendando a revisão do conteúdo em casa.', score: 1, competencies: ['didática'] },
      { key: 'C', text: 'Diminuo a velocidade das explicatórias para nivelar o grupo.', score: 1, competencies: ['paciência'] },
      { key: 'D', text: 'Disponibilizo tempo pós-aula para tirar as dúvidas pendentes.', score: 2, competencies: ['paciência', 'flexibilidade'] }
    ],
    evaluates: ['paciência', 'didática', 'empatia']
  },
  {
    code: 'SJT_IT_08', questionNumber: 8,
    text: 'Aluno que domina o assunto',
    situation: 'Um aluno claramente domina o conteúdo e está ficando entediado.',
    options: [
      { key: 'A', text: 'Mantenho a condução sem alterar a dinâmica de exercícios.', score: 1, competencies: [] },
      { key: 'B', text: 'Autorizo o avanço individual nos estudos dos módulos seguintes.', score: 2, competencies: ['flexibilidade'] },
      { key: 'C', text: 'Proponho casos de maior complexidade para manter seu engajamento.', score: 3, competencies: ['criatividade', 'influência', 'controle_grupo'] },
      { key: 'D', text: 'Solicito reservadamente que aguarde o ritmo dos demais alunos.', score: 0, competencies: [] }
    ],
    evaluates: ['criatividade', 'influência', 'controle_grupo']
  },
  {
    code: 'SJT_IT_09', questionNumber: 9,
    text: 'Conflito na turma',
    situation: 'Dois alunos discordam publicamente sobre a melhor forma de abordar um atendimento e o clima fica tenso.',
    options: [
      { key: 'A', text: 'Corto os debates e imponho a resposta prescrita no manual.', score: 1, competencies: ['controle_grupo'] },
      { key: 'B', text: 'Acalmo os ânimos ancorando a solução no procedimento oficial.', score: 3, competencies: ['domínio_social', 'comunicação', 'controle_grupo'] },
      { key: 'C', text: 'Peço que apliquem os dois pontos de vista numa simulação prática.', score: 2, competencies: ['criatividade', 'domínio_social'] },
      { key: 'D', text: 'Permito a livre discussão até que cheguem a um acordo próprio.', score: 0, competencies: [] }
    ],
    evaluates: ['domínio_social', 'comunicação', 'controle_grupo']
  },
  {
    code: 'SJT_IT_10', questionNumber: 10,
    text: 'Adaptar explicação',
    situation: 'Você percebe que a forma como explicou um conceito não funcionou. A maioria da turma não entendeu.',
    options: [
      { key: 'A', text: 'Recomponho a abordagem pedagógica utilizando uma analogia simples.', score: 3, competencies: ['didática', 'flexibilidade', 'aprendizagem'] },
      { key: 'B', text: 'Reitero o mesmo texto explicativo reduzindo a velocidade de fala.', score: 1, competencies: ['paciência'] },
      { key: 'C', text: 'Convido um participante que absorveu para compartilhar sua visão.', score: 2, competencies: ['criatividade', 'influência'] },
      { key: 'D', text: 'Avanço o conteúdo programático deixando a dúvida para o final.', score: 0, competencies: [] }
    ],
    evaluates: ['didática', 'flexibilidade', 'aprendizagem']
  },
  {
    code: 'SJT_IT_11', questionNumber: 11,
    text: 'Pouco tempo para conteúdo',
    situation: 'Faltam 2 horas para terminar o treinamento e ainda restam 3 tópicos importantes.',
    options: [
      { key: 'A', text: 'Acelero a transmissão dos conceitos para expor todos os slides.', score: 1, competencies: ['didática'] },
      { key: 'B', text: 'Apresento os conteúdos na ordem até o limite exato do horário.', score: 2, competencies: ['flexibilidade'] },
      { key: 'C', text: 'Foco nos pontos essenciais e disponibilizo o restante em guia digital.', score: 3, competencies: ['didática', 'flexibilidade', 'controle_grupo'] },
      { key: 'D', text: 'Prolongo o tempo de aula até concluir a grade integralmente.', score: 0, competencies: [] }
    ],
    evaluates: ['didática', 'flexibilidade', 'controle_grupo']
  },
  {
    code: 'SJT_IT_12', questionNumber: 12,
    text: 'Avaliar aprendizagem',
    situation: 'Ao final de um módulo, você precisa avaliar se a turma absorveu o conteúdo.',
    options: [
      { key: 'A', text: 'Conduzo role-playing simulando os casos reais do atendimento.', score: 3, competencies: ['didática', 'criatividade', 'comunicação'] },
      { key: 'B', text: 'Aplico teste de múltipla escolha para checagem de memorização.', score: 1, competencies: ['didática'] },
      { key: 'C', text: 'Realizo quiz interativo de perguntas e respostas com o grupo.', score: 2, competencies: ['didática', 'comunicação'] },
      { key: 'D', text: 'Consulto abertamente a turma se todos se sentem preparados.', score: 0, competencies: [] }
    ],
    evaluates: ['didática', 'criatividade', 'comunicação']
  },
  {
    code: 'SJT_IT_13', questionNumber: 13,
    text: 'Aluno que não participa',
    situation: 'Um aluno permanece calado durante todo o treinamento. Não interage, não faz perguntas.',
    options: [
      { key: 'A', text: 'Solicito que o aluno responda a uma questão perante toda a sala.', score: 0, competencies: [] },
      { key: 'B', text: 'Preservo o espaço do aluno sem fazer solicitações diretas.', score: 1, competencies: ['paciência'] },
      { key: 'C', text: 'Faço uma abordagem individual no intervalo para acolher o participante.', score: 3, competencies: ['empatia', 'comunicação', 'domínio_social'] },
      { key: 'D', text: 'Insiro dinâmicas em trios para incentivar a interação espontânea.', score: 2, competencies: ['criatividade', 'domínio_social'] }
    ],
    evaluates: ['empatia', 'comunicação', 'domínio_social']
  },
  {
    code: 'SJT_IT_14', questionNumber: 14,
    text: 'Dúvida que não sabe responder',
    situation: 'Um aluno faz uma pergunta técnica que você não sabe responder no momento.',
    options: [
      { key: 'A', text: 'Forneço uma hipótese provável para não deixar o questionamento em aberto.', score: 0, competencies: [] },
      { key: 'B', text: 'Pontuo que a questão foge do escopo do programa de capacitação.', score: 1, competencies: ['controle_grupo'] },
      { key: 'C', text: 'Abro a base de conhecimento junto com a turma para buscar o dado.', score: 2, competencies: ['aprendizagem', 'criatividade'] },
      { key: 'D', text: 'Assumo a necessidade de consulta técnica e retorno com a resposta oficial.', score: 3, competencies: ['comunicação', 'aprendizagem', 'domínio_social'] }
    ],
    evaluates: ['comunicação', 'aprendizagem', 'domínio_social']
  },
  {
    code: 'SJT_IT_15', questionNumber: 15,
    text: 'Problema operacional no treinamento',
    situation: 'Durante um treinamento remoto, a plataforma cai e você perde a conexão com a turma.',
    options: [
      { key: 'A', text: 'Restabelaço a sala virtual e alinho o ponto de retomada dos estudos.', score: 3, competencies: ['flexibilidade', 'comunicação', 'controle_grupo'] },
      { key: 'B', text: 'Abro chamado no suporte de TI e aguardo o restabelecimento.', score: 0, competencies: [] },
      { key: 'C', text: 'Comunico o encerramento do encontro síncrono enviando a leitura.', score: 1, competencies: ['comunicação'] },
      { key: 'D', text: 'Envio avisos no canal de mensagens do grupo orientando a espera.', score: 2, competencies: ['flexibilidade', 'criatividade'] }
    ],
    evaluates: ['flexibilidade', 'comunicação', 'controle_grupo']
  }
];

// ============================================================
// SUPERVISOR DE EQUIPE — 15 situações
// ============================================================
export const SJT_SUPERVISOR: V2SjtQuestion[] = [
  {
    code: 'SJT_SE_01', questionNumber: 1,
    text: 'Fila aumentando',
    situation: 'É 14h e a fila de espera aumentou 40% nas últimas 2 horas. O time está completo, mas o TMA subiu.',
    options: [
      { key: 'A', text: 'Emito alerta geral na operação exigindo redução imediata de TMA.', score: 0, competencies: [] },
      { key: 'B', text: 'Escalono o gargalo de atendimento para conhecimento da gerência.', score: 1, competencies: ['comunicação'] },
      { key: 'C', text: 'Assumo atendimentos na fila principal para auxílio no escoamento.', score: 2, competencies: ['liderança', 'resiliência'] },
      { key: 'D', text: 'Reaprovisiono os atendentes de menor demanda para equilibrar a espera.', score: 3, competencies: ['gestao_indicadores', 'tomada_decisao', 'liderança'] }
    ],
    evaluates: ['gestao_indicadores', 'tomada_decisao', 'liderança']
  },
  {
    code: 'SJT_SE_02', questionNumber: 2,
    text: 'TMA elevado',
    situation: 'O TMA médio da equipe está 30% acima da meta. Você precisa apresentar um plano de ação.',
    options: [
      { key: 'A', text: 'Fixo teto máximo de tempo por chamada acompanhando no painel.', score: 1, competencies: ['gestao_indicadores'] },
      { key: 'B', text: 'Mapeio os causadores de TMA e aplico orientação focada na causa raiz.', score: 3, competencies: ['gestao_indicadores', 'liderança', 'organizacao'] },
      { key: 'C', text: 'Recomendo verbalmente maior agilidade nos encerramentos.', score: 0, competencies: [] },
      { key: 'D', text: 'Solicito reciclagem técnica para os operadores com desvio de tempo.', score: 2, competencies: ['liderança', 'gestao_indicadores'] }
    ],
    evaluates: ['gestao_indicadores', 'liderança', 'organizacao']
  },
  {
    code: 'SJT_SE_03', questionNumber: 3,
    text: 'NPS baixo',
    situation: 'O NPS da sua equipe caiu significativamente no último mês. A gerência pede providências.',
    options: [
      { key: 'A', text: 'Examano o teor das avaliações ruins construindo plano de correção.', score: 3, competencies: ['gestao_indicadores', 'liderança', 'visao_sistemica'] },
      { key: 'B', text: 'Realizo alinhamento com a equipe enfatizando a meta do indicador.', score: 1, competencies: ['comunicação'] },
      { key: 'C', text: 'Encomendo relatório de auditoria detalhado junto ao time de Qualidade.', score: 2, competencies: ['visao_sistemica'] },
      { key: 'D', text: 'Justifico a variação pelo aumento de instabilidades nos sistemas.', score: 0, competencies: [] }
    ],
    evaluates: ['gestao_indicadores', 'liderança', 'visao_sistemica']
  },
  {
    code: 'SJT_SE_04', questionNumber: 4,
    text: 'Monitoria baixa',
    situation: 'Um operador que era referência da equipe teve queda acentuada na monitoria nos últimos 3 ciclos.',
    options: [
      { key: 'A', text: 'Aplico medida disciplinar devido à queda contínua de rendimento.', score: 0, competencies: [] },
      { key: 'B', text: 'Solicito que a monitoria efetue o feedback presencial de orientação.', score: 1, competencies: ['gestao_pessoas'] },
      { key: 'C', text: 'Realizo alinhamento individual para entender causas e traçar metas.', score: 3, competencies: ['gestao_pessoas', 'comunicação', 'liderança'] },
      { key: 'D', text: 'Recomendo a escuta de seus próprios áudios de alto desempenho.', score: 2, competencies: ['gestao_pessoas', 'liderança'] }
    ],
    evaluates: ['gestao_pessoas', 'comunicação', 'liderança']
  },
  {
    code: 'SJT_SE_05', questionNumber: 5,
    text: 'Absenteísmo',
    situation: 'Três operadores faltaram no mesmo dia. A equipe está sobrecarregada.',
    options: [
      { key: 'A', text: 'Reorganizo a distribuição das filas focando nos serviços essenciais.', score: 3, competencies: ['organizacao', 'tomada_decisao', 'resiliência'] },
      { key: 'B', text: 'Contato os profissionais ausentes exigindo justificativa imediata.', score: 1, competencies: ['assertividade'] },
      { key: 'C', text: 'Notifico a coordenação solicitando remanejamento intersetorial.', score: 1, competencies: ['comunicação'] },
      { key: 'D', text: 'Solicito esforço adicional do time presente para cobrir a escala.', score: 2, competencies: ['organizacao', 'comunicação'] }
    ],
    evaluates: ['organizacao', 'tomada_decisao', 'resiliência']
  },
  {
    code: 'SJT_SE_06', questionNumber: 6,
    text: 'Operador contestando feedback',
    situation: 'Um operador reage de forma defensiva ao receber feedback sobre seu atendimento. Ele se sente injustiçado.',
    options: [
      { key: 'A', text: 'Encerro o diálogo reforçando a autoridade da avaliação realizada.', score: 0, competencies: [] },
      { key: 'B', text: 'Reagendo a devolutiva para um momento de maior receptividade.', score: 2, competencies: ['gestao_conflitos', 'comunicação'] },
      { key: 'C', text: 'Acolho as divergências e fundamento o feedback nas evidências técnicas.', score: 3, competencies: ['gestao_conflitos', 'comunicação', 'assertividade'] },
      { key: 'D', text: 'Retiro as pontuações críticas da pauta para preservar o clima.', score: 0, competencies: [] }
    ],
    evaluates: ['gestao_conflitos', 'comunicação', 'assertividade']
  },
  {
    code: 'SJT_SE_07', questionNumber: 7,
    text: 'Conflito entre operadores',
    situation: 'Dois operadores estão em conflito porque um acusa o outro de não ajudar nos intervalos.',
    options: [
      { key: 'A', text: 'Determino que o atrito pessoal não deve impactar o ambiente.', score: 0, competencies: [] },
      { key: 'B', text: 'Altero as escalas de pausa eliminando o contato direto entre ambos.', score: 1, competencies: ['organizacao'] },
      { key: 'C', text: 'Escuto as partes isoladamente e promovo mediação focada em acordos.', score: 3, competencies: ['gestao_conflitos', 'liderança', 'comunicação'] },
      { key: 'D', text: 'Reúno os dois profissionais para que esclareçam as pendências.', score: 2, competencies: ['gestao_conflitos'] }
    ],
    evaluates: ['gestao_conflitos', 'liderança', 'comunicação']
  },
  {
    code: 'SJT_SE_08', questionNumber: 8,
    text: 'Operador excelente com problema disciplinar',
    situation: 'Seu melhor operador chega atrasado com frequência. O desempenho é excelente, mas o exemplo é ruim para a equipe.',
    options: [
      { key: 'A', text: 'Elogio as entregas técnicas e reforço o alinhamento com a pontualidade.', score: 3, competencies: ['assertividade', 'liderança', 'gestao_pessoas'] },
      { key: 'B', text: 'Desconsidero a impontualidade em razão da alta entrega operacional.', score: 0, competencies: [] },
      { key: 'C', text: 'Aplico a penalização de advertência formal conforme o regimento.', score: 2, competencies: ['assertividade', 'disciplina_operacional'] },
      { key: 'D', text: 'Faço lembretes orientativos no início do turno de trabalho.', score: 1, competencies: ['comunicação'] }
    ],
    evaluates: ['assertividade', 'liderança', 'gestao_pessoas']
  },
  {
    code: 'SJT_SE_09', questionNumber: 9,
    text: 'Aplicar consequência',
    situation: 'Um operador cometeu uma infração que exige aplicação de consequência (advertência), mas ele é querido pela equipe.',
    options: [
      { key: 'A', text: 'Efetuo advertência verbal sem formalização no prontuário.', score: 1, competencies: ['comunicação'] },
      { key: 'B', text: 'Aplico a sanção cabível em particular resguardando o respeito.', score: 3, competencies: ['assertividade', 'liderança', 'disciplina_operacional'] },
      { key: 'C', text: 'Comunico a penalidade enfatizando o cumprimento de ordem superior.', score: 2, competencies: ['assertividade'] },
      { key: 'D', text: 'Delego a condução da medida disciplinar para a equipe de RH.', score: 0, competencies: [] }
    ],
    evaluates: ['assertividade', 'liderança', 'disciplina_operacional']
  },
  {
    code: 'SJT_SE_10', questionNumber: 10,
    text: 'Pressão da gestão',
    situation: 'Sua gerência pede que você cobre resultados agressivos da equipe em um momento que o time está desmotivado.',
    options: [
      { key: 'A', text: 'Transmito a exigência da diretoria exigindo cumprimento imediato.', score: 0, competencies: [] },
      { key: 'B', text: 'Apresento contraproposta de metas graduais amparada em dados da fila.', score: 3, competencies: ['liderança', 'resiliência', 'comunicação'] },
      { key: 'C', text: 'Repasso os números definidos cobrando engajamento diário.', score: 1, competencies: ['disciplina_operacional'] },
      { key: 'D', text: 'Foco em ações motivacionais internas negociando extensão de prazos.', score: 2, competencies: ['liderança', 'comunicação'] }
    ],
    evaluates: ['liderança', 'resiliência', 'comunicação']
  },
  {
    code: 'SJT_SE_11', questionNumber: 11,
    text: 'Problema sistêmico',
    situation: 'Um problema de sistema está afetando o TMA e o NPS, mas a área técnica não tem previsão de solução.',
    options: [
      { key: 'A', text: 'Notifico a coordenação técnica e aguardo o restabelecimento.', score: 1, competencies: ['comunicação'] },
      { key: 'B', text: 'Registro as evidências de sistema e oriento plano de contorno formal.', score: 3, competencies: ['visao_sistemica', 'tomada_decisao', 'organizacao'] },
      { key: 'C', text: 'Oriento a equipe a buscar alternativas manuais durante os atendimentos.', score: 2, competencies: ['liderança'] },
      { key: 'D', text: 'Informo ao time que as oscilações fogem à governança do setor.', score: 0, competencies: [] }
    ],
    evaluates: ['visao_sistemica', 'tomada_decisao', 'organizacao']
  },
  {
    code: 'SJT_SE_12', questionNumber: 12,
    text: 'Operador emocionalmente abalado',
    situation: 'Um operador está visivelmente abalado após uma ligação difícil e não consegue continuar atendendo.',
    options: [
      { key: 'A', text: 'Recomendo o rápido retorno à PA enfatizando a resiliência diária.', score: 0, competencies: [] },
      { key: 'B', text: 'Autorizo a saída antecipada do operador no restante do turno.', score: 1, competencies: ['gestao_pessoas'] },
      { key: 'C', text: 'Ofereço acolhimento reservado para recomposição antes do retorno.', score: 3, competencies: ['gestao_pessoas', 'liderança', 'resiliência'] },
      { key: 'D', text: 'Concedo pausa extraordinária remanejando temporariamente a fila.', score: 2, competencies: ['gestao_pessoas', 'organizacao'] }
    ],
    evaluates: ['gestao_pessoas', 'liderança', 'resiliência']
  },
  {
    code: 'SJT_SE_13', questionNumber: 13,
    text: 'Priorização de tarefas',
    situation: 'Você tem ao mesmo tempo: reunião de resultado, feedback pendente, relatório atrasado e fila alta. O que prioriza?',
    options: [
      { key: 'A', text: 'Tento conduzir as demandas em paralelo para não atrasar nenhuma.', score: 0, competencies: [] },
      { key: 'B', text: 'Cumpro a sequência dos compromissos agendados no calendário.', score: 1, competencies: ['organizacao'] },
      { key: 'C', text: 'Dedico-me à entrega do relatório estratégico cobrado pela gestão.', score: 2, competencies: ['organizacao'] },
      { key: 'D', text: 'Priorizo o suporte à operação represada reajustando os demais compromissos.', score: 3, competencies: ['organizacao', 'tomada_decisao', 'orientacao_resultado'] }
    ],
    evaluates: ['organizacao', 'tomada_decisao', 'orientacao_resultado']
  },
  {
    code: 'SJT_SE_14', questionNumber: 14,
    text: 'Redistribuir equipe',
    situation: 'Você precisa redistribuir operadores entre filas, mas alguns vão resistir por preferirem a fila atual.',
    options: [
      { key: 'A', text: 'Apresento os dados operacionais que fundamentam o remanejamento.', score: 3, competencies: ['liderança', 'comunicação', 'gestao_pessoas'] },
      { key: 'B', text: 'Publico a nova escala de posições sem alinhamento prévio.', score: 0, competencies: [] },
      { key: 'C', text: 'Solicito a movimentação voluntária de profissionais para as novas filas.', score: 2, competencies: ['liderança'] },
      { key: 'D', text: 'Realizo a transição de forma gradual e informal no decorrer dos dias.', score: 1, competencies: ['organizacao'] }
    ],
    evaluates: ['liderança', 'comunicação', 'gestao_pessoas']
  },
  {
    code: 'SJT_SE_15', questionNumber: 15,
    text: 'Produtividade vs qualidade',
    situation: 'A gerência pressiona por produtividade. A equipe de qualidade pressiona por melhores notas de monitoria. Você está no meio.',
    options: [
      { key: 'A', text: 'Direciono os esforços da equipe para o cumprimento do TMA.', score: 1, competencies: ['orientacao_resultado'] },
      { key: 'B', text: 'Foco a atuação do time no cumprimento integral dos scripts.', score: 1, competencies: ['orientacao_resultado'] },
      { key: 'C', text: 'Estabeleço metas equilibradas demonstrando a sinergia entre TMA e NPS.', score: 3, competencies: ['visao_sistemica', 'tomada_decisao', 'orientacao_resultado'] },
      { key: 'D', text: 'Informo a impossibilidade técnica de atender ambos os indicadores.', score: 0, competencies: [] }
    ],
    evaluates: ['visao_sistemica', 'tomada_decisao', 'orientacao_resultado']
  }
];

/** Map job_id to its SJT question set */
export const SJT_QUESTIONS_BY_JOB: Record<string, V2SjtQuestion[]> = {
  'operador-atendimento': SJT_OPERADOR,
  'monitor-qualidade': SJT_MONITOR,
  'instrutor-treinamento': SJT_INSTRUTOR,
  'supervisor-equipe': SJT_SUPERVISOR
};

/**
 * MÓDULO 3 — JULGAMENTO SITUACIONAL (SJT) — V2
 * 15 perguntas por função, 4 alternativas cada, com pontuação 0-3.
 *
 * 3 = resposta mais adequada
 * 2 = resposta aceitável
 * 1 = resposta parcialmente adequada
 * 0 = resposta inadequada
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
      { key: 'A', text: 'Permito que ele desabafe, demonstro que entendi a frustração e reforço que vou ajudá-lo dessa vez.', score: 3, competencies: ['escuta', 'estabilidade', 'comunicação'] },
      { key: 'B', text: 'Peço que ele se acalme para que eu possa ajudá-lo adequadamente.', score: 1, competencies: ['comunicação'] },
      { key: 'C', text: 'Informo que entendo a situação e peço os dados para abrir um novo chamado.', score: 2, competencies: ['procedimento', 'resolução'] },
      { key: 'D', text: 'Transfiro a ligação para um supervisor, pois o cidadão está agressivo.', score: 0, competencies: [] }
    ],
    evaluates: ['escuta', 'estabilidade', 'comunicação']
  },
  {
    code: 'SJT_OP_02', questionNumber: 2,
    text: 'Informação incompleta',
    situation: 'O cidadão solicita uma informação, mas os dados no sistema estão incompletos. Você não encontra a resposta na base de conhecimento.',
    options: [
      { key: 'A', text: 'Informo que não tenho a resposta e peço que ligue novamente.', score: 0, competencies: [] },
      { key: 'B', text: 'Explico a situação, busco em fontes alternativas e, se necessário, registro para retorno.', score: 3, competencies: ['resolução', 'responsabilidade', 'procedimento'] },
      { key: 'C', text: 'Passo uma informação parcial baseada no que encontrei.', score: 1, competencies: ['comunicação'] },
      { key: 'D', text: 'Consulto um colega ou supervisor antes de dar qualquer resposta.', score: 2, competencies: ['procedimento', 'julgamento'] }
    ],
    evaluates: ['resolução', 'procedimento', 'responsabilidade']
  },
  {
    code: 'SJT_OP_03', questionNumber: 3,
    text: 'Sistema indisponível',
    situation: 'No meio de um atendimento, o sistema principal cai. Você tem o cidadão na linha esperando.',
    options: [
      { key: 'A', text: 'Informo ao cidadão sobre a instabilidade, anoto os dados manualmente e garanto retorno quando o sistema voltar.', score: 3, competencies: ['resolução', 'comunicação', 'responsabilidade'] },
      { key: 'B', text: 'Peço que o cidadão ligue novamente em alguns minutos.', score: 0, competencies: [] },
      { key: 'C', text: 'Coloco em espera até o sistema voltar.', score: 1, competencies: ['procedimento'] },
      { key: 'D', text: 'Tento resolver o que for possível sem o sistema e encaminho o restante.', score: 2, competencies: ['resolução', 'julgamento'] }
    ],
    evaluates: ['resolução', 'comunicação', 'julgamento']
  },
  {
    code: 'SJT_OP_04', questionNumber: 4,
    text: 'Dúvida sobre procedimento',
    situation: 'Você recebe uma solicitação que não está claramente coberta pelo procedimento. Não tem certeza de como proceder.',
    options: [
      { key: 'A', text: 'Tomo a decisão que parece mais lógica para não atrasar o atendimento.', score: 1, competencies: ['julgamento'] },
      { key: 'B', text: 'Informo ao cidadão que preciso verificar e consulto o supervisor ou a base de conhecimento antes de responder.', score: 3, competencies: ['procedimento', 'responsabilidade', 'julgamento'] },
      { key: 'C', text: 'Aplico o procedimento mais parecido que conheço.', score: 2, competencies: ['julgamento', 'resolução'] },
      { key: 'D', text: 'Transfero para outro setor que possa ter mais informações.', score: 0, competencies: [] }
    ],
    evaluates: ['procedimento', 'julgamento', 'responsabilidade']
  },
  {
    code: 'SJT_OP_05', questionNumber: 5,
    text: 'Cidadão insistente',
    situation: 'Um cidadão insiste em uma solução que não está prevista nos procedimentos. Ele já foi informado, mas continua pedindo.',
    options: [
      { key: 'A', text: 'Reforço a explicação com empatia, apresento alternativas viáveis e registro a insatisfação.', score: 3, competencies: ['comunicação', 'escuta', 'procedimento'] },
      { key: 'B', text: 'Repito a mesma informação até ele aceitar.', score: 0, competencies: [] },
      { key: 'C', text: 'Faço o que ele pede para encerrar o atendimento.', score: 0, competencies: [] },
      { key: 'D', text: 'Explico que entendo sua posição, mas que o procedimento não permite, e ofereço o canal de ouvidoria.', score: 2, competencies: ['comunicação', 'procedimento'] }
    ],
    evaluates: ['comunicação', 'procedimento', 'estabilidade']
  },
  {
    code: 'SJT_OP_06', questionNumber: 6,
    text: 'Erro de registro',
    situation: 'Você percebe, ao revisar um atendimento que acabou de concluir, que registrou uma informação incorreta no sistema.',
    options: [
      { key: 'A', text: 'Corrijo imediatamente e informo ao supervisor sobre o ocorrido.', score: 3, competencies: ['responsabilidade', 'procedimento'] },
      { key: 'B', text: 'Corrijo e sigo normalmente, já que ninguém percebeu.', score: 1, competencies: ['resolução'] },
      { key: 'C', text: 'Deixo como está, pois o impacto parece pequeno.', score: 0, competencies: [] },
      { key: 'D', text: 'Corrijo o registro e faço uma anotação interna para referência.', score: 2, competencies: ['responsabilidade', 'procedimento'] }
    ],
    evaluates: ['responsabilidade', 'procedimento']
  },
  {
    code: 'SJT_OP_07', questionNumber: 7,
    text: 'Pressão de fila',
    situation: 'A fila está muito grande, o TMA está alto e seu supervisor pede para acelerar os atendimentos. Porém, o próximo cidadão tem um caso complexo.',
    options: [
      { key: 'A', text: 'Atendo com atenção, mas foco no essencial, garantindo qualidade sem prolongar desnecessariamente.', score: 3, competencies: ['julgamento', 'prioridade', 'comunicação'] },
      { key: 'B', text: 'Apresso o atendimento para reduzir o TMA.', score: 0, competencies: [] },
      { key: 'C', text: 'Trato o caso normalmente, independente da pressão da fila.', score: 2, competencies: ['estabilidade', 'resolução'] },
      { key: 'D', text: 'Encaminho o caso para outro setor para liberar a fila.', score: 1, competencies: ['julgamento'] }
    ],
    evaluates: ['julgamento', 'prioridade', 'estabilidade']
  },
  {
    code: 'SJT_OP_08', questionNumber: 8,
    text: 'Colega pedindo ajuda',
    situation: 'Um colega ao lado pede sua ajuda com uma dúvida enquanto você está em atendimento.',
    options: [
      { key: 'A', text: 'Sinalizo que posso ajudar assim que encerrar meu atendimento atual.', score: 3, competencies: ['prioridade', 'comunicação', 'responsabilidade'] },
      { key: 'B', text: 'Ajudo rapidamente sem interromper meu atendimento.', score: 2, competencies: ['comunicação'] },
      { key: 'C', text: 'Ignoro, pois estou em atendimento.', score: 1, competencies: ['prioridade'] },
      { key: 'D', text: 'Coloco meu cidadão em espera e ajudo o colega.', score: 0, competencies: [] }
    ],
    evaluates: ['prioridade', 'comunicação', 'responsabilidade']
  },
  {
    code: 'SJT_OP_09', questionNumber: 9,
    text: 'Conflito procedimento vs expectativa',
    situation: 'O cidadão pede algo que faz sentido do ponto de vista dele, mas que contraria o procedimento.',
    options: [
      { key: 'A', text: 'Explico o motivo do procedimento com transparência e ofereço a melhor alternativa dentro das regras.', score: 3, competencies: ['comunicação', 'procedimento', 'escuta'] },
      { key: 'B', text: 'Aplico o procedimento sem explicar o motivo.', score: 1, competencies: ['procedimento'] },
      { key: 'C', text: 'Abro uma exceção por conta própria.', score: 0, competencies: [] },
      { key: 'D', text: 'Registro a sugestão do cidadão e sigo o procedimento.', score: 2, competencies: ['procedimento', 'comunicação'] }
    ],
    evaluates: ['comunicação', 'procedimento', 'julgamento']
  },
  {
    code: 'SJT_OP_10', questionNumber: 10,
    text: 'Necessidade de investigação',
    situation: 'O cidadão relata um problema que você nunca viu antes. Não há instrução específica para esse caso.',
    options: [
      { key: 'A', text: 'Investigo o máximo possível, consulto ferramentas disponíveis e, se não resolver, encaminho com todas as informações coletadas.', score: 3, competencies: ['resolução', 'julgamento', 'responsabilidade'] },
      { key: 'B', text: 'Transfiro para um setor especializado imediatamente.', score: 1, competencies: ['procedimento'] },
      { key: 'C', text: 'Tento resolver com base em casos similares.', score: 2, competencies: ['resolução', 'julgamento'] },
      { key: 'D', text: 'Informo que não há solução disponível no momento.', score: 0, competencies: [] }
    ],
    evaluates: ['resolução', 'julgamento', 'responsabilidade']
  },
  {
    code: 'SJT_OP_11', questionNumber: 11,
    text: 'Atendimento prolongado',
    situation: 'Você já está há 20 minutos com o mesmo cidadão. O caso está avançando, mas lentamente.',
    options: [
      { key: 'A', text: 'Informo o status da resolução, mantenho o cidadão atualizado e concluo o atendimento com qualidade.', score: 3, competencies: ['comunicação', 'estabilidade', 'resolução'] },
      { key: 'B', text: 'Apresso a conclusão para não impactar mais o TMA.', score: 1, competencies: ['prioridade'] },
      { key: 'C', text: 'Peço que ele retorne amanhã para continuar.', score: 0, competencies: [] },
      { key: 'D', text: 'Mantenho o atendimento normalmente sem me preocupar com o tempo.', score: 2, competencies: ['estabilidade', 'resolução'] }
    ],
    evaluates: ['comunicação', 'estabilidade', 'prioridade']
  },
  {
    code: 'SJT_OP_12', questionNumber: 12,
    text: 'Informação contraditória',
    situation: 'O cidadão afirma que recebeu uma informação diferente da que está no sistema. Ele tem um protocolo anterior.',
    options: [
      { key: 'A', text: 'Verifico o protocolo anterior, comparo as informações e esclareço o que é válido atualmente, com transparência.', score: 3, competencies: ['resolução', 'procedimento', 'comunicação'] },
      { key: 'B', text: 'Digo que a informação atual é a correta e desconsidero a anterior.', score: 1, competencies: ['procedimento'] },
      { key: 'C', text: 'Registro uma reclamação sobre a informação anterior.', score: 2, competencies: ['procedimento', 'responsabilidade'] },
      { key: 'D', text: 'Assumo que ele está certo e sigo com base na informação dele.', score: 0, competencies: [] }
    ],
    evaluates: ['resolução', 'procedimento', 'comunicação']
  },
  {
    code: 'SJT_OP_13', questionNumber: 13,
    text: 'Receber crítica',
    situation: 'Ao final do atendimento, o cidadão diz que achou o serviço demorado e que esperava mais agilidade.',
    options: [
      { key: 'A', text: 'Agradeço o feedback, peço desculpas pela demora e reforço que a prioridade é resolver adequadamente.', score: 3, competencies: ['comunicação', 'estabilidade', 'escuta'] },
      { key: 'B', text: 'Explico que a demora foi causada pela complexidade do caso.', score: 2, competencies: ['comunicação'] },
      { key: 'C', text: 'Encerro normalmente sem comentar.', score: 1, competencies: ['estabilidade'] },
      { key: 'D', text: 'Digo que a culpa não foi minha.', score: 0, competencies: [] }
    ],
    evaluates: ['comunicação', 'estabilidade', 'escuta']
  },
  {
    code: 'SJT_OP_14', questionNumber: 14,
    text: 'Mudança de procedimento',
    situation: 'No início do turno, você é informado de que o procedimento para uma demanda frequente foi alterado. Você não teve tempo de estudar a mudança.',
    options: [
      { key: 'A', text: 'Leio rapidamente a atualização antes do primeiro atendimento e tiro dúvidas com o supervisor se necessário.', score: 3, competencies: ['responsabilidade', 'procedimento', 'julgamento'] },
      { key: 'B', text: 'Sigo o procedimento antigo até ter tempo de ler o novo.', score: 1, competencies: ['procedimento'] },
      { key: 'C', text: 'Peço ajuda ao colega que já leu a atualização.', score: 2, competencies: ['julgamento', 'comunicação'] },
      { key: 'D', text: 'Improviso conforme aparecerem os casos.', score: 0, competencies: [] }
    ],
    evaluates: ['responsabilidade', 'procedimento', 'julgamento']
  },
  {
    code: 'SJT_OP_15', questionNumber: 15,
    text: 'Fechamento correto',
    situation: 'Você resolveu o problema do cidadão. Ele parece satisfeito. O que faz antes de encerrar?',
    options: [
      { key: 'A', text: 'Confirmo se há mais alguma necessidade, faço o resumo do que foi feito e registro corretamente no sistema.', score: 3, competencies: ['procedimento', 'comunicação', 'responsabilidade'] },
      { key: 'B', text: 'Encerro a ligação rapidamente para liberar a fila.', score: 0, competencies: [] },
      { key: 'C', text: 'Pergunto se ficou tudo certo e encerro.', score: 2, competencies: ['comunicação'] },
      { key: 'D', text: 'Faço o registro e encerro sem verificar.', score: 1, competencies: ['procedimento'] }
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
      { key: 'A', text: 'Reviso a gravação junto com ele, explico cada ponto da avaliação com base nos critérios definidos.', score: 3, competencies: ['comunicação', 'imparcialidade', 'assertividade'] },
      { key: 'B', text: 'Mantenho a nota sem discutir.', score: 0, competencies: [] },
      { key: 'C', text: 'Altero a nota para evitar conflito.', score: 0, competencies: [] },
      { key: 'D', text: 'Encaminho a contestação para o supervisor decidir.', score: 1, competencies: ['disciplina'] }
    ],
    evaluates: ['imparcialidade', 'assertividade', 'comunicação']
  },
  {
    code: 'SJT_MQ_02', questionNumber: 2,
    text: 'Erro pequeno mas recorrente',
    situation: 'Ao monitorar atendimentos, você percebe que vários operadores cometem o mesmo erro pequeno na saudação.',
    options: [
      { key: 'A', text: 'Documento o padrão de erro, informo ao supervisor e sugiro reciclagem pontual.', score: 3, competencies: ['análise', 'comunicação', 'orientação_qualidade'] },
      { key: 'B', text: 'Pontuo cada operador individualmente sem comentar o padrão.', score: 1, competencies: ['disciplina'] },
      { key: 'C', text: 'Ignoro por ser um erro menor.', score: 0, competencies: [] },
      { key: 'D', text: 'Falo individualmente com cada operador sobre o erro.', score: 2, competencies: ['comunicação', 'assertividade'] }
    ],
    evaluates: ['análise', 'orientação_qualidade', 'comunicação']
  },
  {
    code: 'SJT_MQ_03', questionNumber: 3,
    text: 'Conflito TMA vs qualidade',
    situation: 'Um operador tem TMA alto, mas a qualidade dos atendimentos é excelente. O supervisor pressiona para reduzir o TMA.',
    options: [
      { key: 'A', text: 'Apresento os dados de qualidade e sugiro um equilíbrio, identificando onde o operador pode ser mais objetivo sem perder qualidade.', score: 3, competencies: ['análise', 'imparcialidade', 'tomada_decisao'] },
      { key: 'B', text: 'Reduzo a nota de qualidade para pressionar o TMA.', score: 0, competencies: [] },
      { key: 'C', text: 'Mantenho a avaliação de qualidade intacta e informo ao supervisor.', score: 2, competencies: ['imparcialidade', 'assertividade'] },
      { key: 'D', text: 'Peço ao operador para ser mais rápido.', score: 1, competencies: ['comunicação'] }
    ],
    evaluates: ['análise', 'imparcialidade', 'tomada_decisao']
  },
  {
    code: 'SJT_MQ_04', questionNumber: 4,
    text: 'Divergência entre monitores',
    situation: 'Você e outro monitor avaliam o mesmo atendimento e chegam a notas diferentes.',
    options: [
      { key: 'A', text: 'Reviso junto com o outro monitor, comparo critérios e buscamos consenso baseado na régua de avaliação.', score: 3, competencies: ['consistência', 'comunicação', 'disciplina'] },
      { key: 'B', text: 'Mantenho minha nota, pois confio na minha avaliação.', score: 1, competencies: ['assertividade'] },
      { key: 'C', text: 'Faço a média das duas notas.', score: 0, competencies: [] },
      { key: 'D', text: 'Encaminho para o supervisor decidir.', score: 2, competencies: ['disciplina'] }
    ],
    evaluates: ['consistência', 'comunicação', 'disciplina']
  },
  {
    code: 'SJT_MQ_05', questionNumber: 5,
    text: 'Operador excelente contestando nota',
    situation: 'O melhor operador da equipe contesta uma nota 85 que você deu. Ele argumenta que sempre tira acima de 90.',
    options: [
      { key: 'A', text: 'Mostro exatamente os pontos que geraram a diferença, com evidência da gravação, independente do histórico dele.', score: 3, competencies: ['imparcialidade', 'assertividade', 'comunicação'] },
      { key: 'B', text: 'Aumento a nota para manter o bom relacionamento.', score: 0, competencies: [] },
      { key: 'C', text: 'Explico que uma avaliação isolada não define seu desempenho geral.', score: 2, competencies: ['comunicação'] },
      { key: 'D', text: 'Digo que a régua é a mesma para todos.', score: 1, competencies: ['imparcialidade'] }
    ],
    evaluates: ['imparcialidade', 'assertividade', 'comunicação']
  },
  {
    code: 'SJT_MQ_06', questionNumber: 6,
    text: 'Necessidade de feedback',
    situation: 'Você precisa dar feedback para um operador que teve nota baixa em monitoria pela terceira vez consecutiva.',
    options: [
      { key: 'A', text: 'Convoco uma conversa individual, mostro a evolução (ou falta dela), identifico causas e proponho um plano de ação.', score: 3, competencies: ['comunicação', 'assertividade', 'orientação_qualidade'] },
      { key: 'B', text: 'Envio o resultado por escrito.', score: 1, competencies: ['disciplina'] },
      { key: 'C', text: 'Informo ao supervisor para que ele tome providências.', score: 2, competencies: ['disciplina', 'comunicação'] },
      { key: 'D', text: 'Espero que a nota melhore naturalmente.', score: 0, competencies: [] }
    ],
    evaluates: ['comunicação', 'assertividade', 'orientação_qualidade']
  },
  {
    code: 'SJT_MQ_07', questionNumber: 7,
    text: 'Comportamento inadequado',
    situation: 'Durante a escuta de uma gravação, você percebe que o operador usou um tom irônico com o cidadão.',
    options: [
      { key: 'A', text: 'Registro o incidente na avaliação, pontuo adequadamente e trago para feedback com o trecho da gravação.', score: 3, competencies: ['imparcialidade', 'disciplina', 'comunicação'] },
      { key: 'B', text: 'Desconto pontos sem comentar sobre o tom.', score: 1, competencies: ['disciplina'] },
      { key: 'C', text: 'Deixo passar porque o restante do atendimento foi bom.', score: 0, competencies: [] },
      { key: 'D', text: 'Informo ao supervisor imediatamente.', score: 2, competencies: ['disciplina', 'comunicação'] }
    ],
    evaluates: ['imparcialidade', 'disciplina', 'comunicação']
  },
  {
    code: 'SJT_MQ_08', questionNumber: 8,
    text: 'Erro de procedimento',
    situation: 'O operador seguiu um procedimento antigo que já foi atualizado. O atendimento fluiu bem, mas o procedimento está errado.',
    options: [
      { key: 'A', text: 'Pontuo o desvio, informo o operador sobre a atualização e verifico se outros também estão usando o procedimento antigo.', score: 3, competencies: ['orientação_qualidade', 'análise', 'comunicação'] },
      { key: 'B', text: 'Não desconto pontos porque o resultado foi bom.', score: 0, competencies: [] },
      { key: 'C', text: 'Desconto os pontos sem explicação adicional.', score: 1, competencies: ['disciplina'] },
      { key: 'D', text: 'Pontuo e informo ao supervisor sobre o gap de comunicação.', score: 2, competencies: ['orientação_qualidade', 'comunicação'] }
    ],
    evaluates: ['orientação_qualidade', 'análise', 'comunicação']
  },
  {
    code: 'SJT_MQ_09', questionNumber: 9,
    text: 'Avaliação ambígua',
    situation: 'Ao avaliar um atendimento, você percebe que a situação é ambígua — o operador poderia ter agido de duas formas, ambas defensáveis.',
    options: [
      { key: 'A', text: 'Avalio com base nos critérios definidos, documento a ambiguidade e discuto com a equipe para padronizar casos futuros.', score: 3, competencies: ['consistência', 'análise', 'tomada_decisao'] },
      { key: 'B', text: 'Dou o benefício da dúvida ao operador.', score: 2, competencies: ['imparcialidade'] },
      { key: 'C', text: 'Aplico a interpretação mais rígida.', score: 1, competencies: ['disciplina'] },
      { key: 'D', text: 'Pulo essa avaliação e escolho outra gravação.', score: 0, competencies: [] }
    ],
    evaluates: ['consistência', 'análise', 'tomada_decisao']
  },
  {
    code: 'SJT_MQ_10', questionNumber: 10,
    text: 'Pressão da operação',
    situation: 'O supervisor pede que você reduza o tempo gasto em monitorias para ajudar na operação, pois a fila está grande.',
    options: [
      { key: 'A', text: 'Negocio: proponho priorizar as monitorias mais críticas e adiar as demais, sem comprometer a qualidade das que fizer.', score: 3, competencies: ['assertividade', 'tomada_decisao', 'disciplina'] },
      { key: 'B', text: 'Faço as monitorias mais rapidamente.', score: 1, competencies: ['disciplina'] },
      { key: 'C', text: 'Paro as monitorias e vou para a operação.', score: 0, competencies: [] },
      { key: 'D', text: 'Mantenho meu ritmo de monitoria normal.', score: 2, competencies: ['disciplina', 'assertividade'] }
    ],
    evaluates: ['assertividade', 'tomada_decisao', 'disciplina']
  },
  {
    code: 'SJT_MQ_11', questionNumber: 11,
    text: 'Manter imparcialidade',
    situation: 'Você precisa avaliar o atendimento de um colega com quem tem boa amizade. A monitoria revelou alguns erros.',
    options: [
      { key: 'A', text: 'Avalio exatamente como faria com qualquer outro operador, aplicando os mesmos critérios.', score: 3, competencies: ['imparcialidade', 'disciplina', 'consistência'] },
      { key: 'B', text: 'Suavizo os apontamentos por ser amigo.', score: 0, competencies: [] },
      { key: 'C', text: 'Peço que outro monitor avalie para evitar conflito de interesse.', score: 2, competencies: ['imparcialidade', 'tomada_decisao'] },
      { key: 'D', text: 'Avalio normalmente, mas não dou o feedback pessoalmente.', score: 1, competencies: ['imparcialidade'] }
    ],
    evaluates: ['imparcialidade', 'disciplina', 'consistência']
  },
  {
    code: 'SJT_MQ_12', questionNumber: 12,
    text: 'Padrão de erro descoberto',
    situation: 'Você identifica que todos os operadores de uma célula específica cometem o mesmo tipo de erro no registro.',
    options: [
      { key: 'A', text: 'Documento o padrão com evidências, analiso a causa provável (treinamento, sistema, procedimento) e apresento ao supervisor com sugestão de ação.', score: 3, competencies: ['análise', 'orientação_qualidade', 'comunicação'] },
      { key: 'B', text: 'Pontuo cada operador individualmente.', score: 1, competencies: ['disciplina'] },
      { key: 'C', text: 'Informo ao supervisor verbalmente.', score: 2, competencies: ['comunicação'] },
      { key: 'D', text: 'Espero para ver se o padrão se repete no próximo ciclo.', score: 0, competencies: [] }
    ],
    evaluates: ['análise', 'orientação_qualidade', 'comunicação']
  },
  {
    code: 'SJT_MQ_13', questionNumber: 13,
    text: 'Operador produtivo com baixa qualidade',
    situation: 'Um operador tem o melhor TMA da equipe, mas a qualidade das interações está consistentemente abaixo da meta.',
    options: [
      { key: 'A', text: 'Analiso onde a velocidade está comprometendo a qualidade, dou feedback específico e sugiro ajustes para equilibrar.', score: 3, competencies: ['análise', 'comunicação', 'orientação_qualidade'] },
      { key: 'B', text: 'Desconto pontos em qualidade normalmente.', score: 2, competencies: ['disciplina', 'imparcialidade'] },
      { key: 'C', text: 'Perdoo por causa da produtividade.', score: 0, competencies: [] },
      { key: 'D', text: 'Informo ao supervisor para decidir o que fazer.', score: 1, competencies: ['disciplina'] }
    ],
    evaluates: ['análise', 'orientação_qualidade', 'comunicação']
  },
  {
    code: 'SJT_MQ_14', questionNumber: 14,
    text: 'Qualidade alta mas baixa produtividade',
    situation: 'Um operador tem qualidade excelente (nota 98), mas produtividade muito abaixo da meta.',
    options: [
      { key: 'A', text: 'Reconheço a qualidade no feedback e identifico oportunidades para ganhar eficiência sem perder o padrão.', score: 3, competencies: ['comunicação', 'análise', 'orientação_qualidade'] },
      { key: 'B', text: 'Foco apenas na nota de qualidade, que é minha responsabilidade.', score: 2, competencies: ['disciplina'] },
      { key: 'C', text: 'Reduzo a nota para pressionar a produtividade.', score: 0, competencies: [] },
      { key: 'D', text: 'Sugiro ao supervisor um coaching de produtividade.', score: 1, competencies: ['comunicação'] }
    ],
    evaluates: ['comunicação', 'análise', 'orientação_qualidade']
  },
  {
    code: 'SJT_MQ_15', questionNumber: 15,
    text: 'Priorização de monitorias',
    situation: 'Você tem 30 monitorias para fazer esta semana, mas só tem tempo para 20. Como prioriza?',
    options: [
      { key: 'A', text: 'Priorizo operadores com nota baixa recorrente, novatos e casos flaggeados, garantindo cobertura mínima para os demais.', score: 3, competencies: ['tomada_decisao', 'análise', 'disciplina'] },
      { key: 'B', text: 'Faço as 20 primeiras da lista.', score: 0, competencies: [] },
      { key: 'C', text: 'Distribuo igualmente entre todas as células.', score: 2, competencies: ['imparcialidade', 'disciplina'] },
      { key: 'D', text: 'Foco nos operadores com melhores notas para validar o bom desempenho.', score: 1, competencies: ['disciplina'] }
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
      { key: 'A', text: 'Verifico discretamente se entendeu, uso um exemplo prático e, se necessário, ofereço apoio individual no intervalo.', score: 3, competencies: ['didática', 'empatia', 'flexibilidade'] },
      { key: 'B', text: 'Continuo a explicação e ofereço ajuda depois.', score: 2, competencies: ['didática'] },
      { key: 'C', text: 'Paro a turma e repito toda a explicação.', score: 1, competencies: ['paciência'] },
      { key: 'D', text: 'Peço que o aluno preste mais atenção.', score: 0, competencies: [] }
    ],
    evaluates: ['didática', 'empatia', 'flexibilidade']
  },
  {
    code: 'SJT_IT_02', questionNumber: 2,
    text: 'Aluno muito participativo',
    situation: 'Um aluno é muito participativo e faz perguntas constantemente, às vezes tirando o foco da turma.',
    options: [
      { key: 'A', text: 'Valorizo a participação, mas redireciono dizendo que voltaremos ao ponto, e reservo momento para suas dúvidas.', score: 3, competencies: ['controle_grupo', 'comunicação', 'paciência'] },
      { key: 'B', text: 'Peço que ele aguarde o momento de perguntas.', score: 2, competencies: ['controle_grupo'] },
      { key: 'C', text: 'Respondo todas as perguntas mesmo que desvie o conteúdo.', score: 1, competencies: ['paciência'] },
      { key: 'D', text: 'Ignoro algumas perguntas para manter o ritmo.', score: 0, competencies: [] }
    ],
    evaluates: ['controle_grupo', 'comunicação', 'paciência']
  },
  {
    code: 'SJT_IT_03', questionNumber: 3,
    text: 'Aluno resistente',
    situation: 'Um aluno afirma que "já sabe tudo isso" e demonstra resistência ao conteúdo do treinamento.',
    options: [
      { key: 'A', text: 'Reconheço a experiência dele, convido-o a contribuir com exemplos práticos e mostro o valor do conteúdo atualizado.', score: 3, competencies: ['influência', 'comunicação', 'domínio_social'] },
      { key: 'B', text: 'Explico que o treinamento é obrigatório.', score: 1, competencies: ['comunicação'] },
      { key: 'C', text: 'Ignoro a resistência e continuo.', score: 0, competencies: [] },
      { key: 'D', text: 'Proponho que ele ajude os colegas que têm dificuldade.', score: 2, competencies: ['influência', 'criatividade'] }
    ],
    evaluates: ['influência', 'comunicação', 'domínio_social']
  },
  {
    code: 'SJT_IT_04', questionNumber: 4,
    text: 'Turma heterogênea',
    situation: 'Sua turma tem pessoas com experiências muito diferentes: algumas já trabalharam em contact center, outras nunca tiveram contato.',
    options: [
      { key: 'A', text: 'Adapto a didática: uso exemplos básicos e avançados, e proponho atividades em duplas para que os mais experientes ajudem.', score: 3, competencies: ['flexibilidade', 'didática', 'criatividade'] },
      { key: 'B', text: 'Sigo o conteúdo padrão para todos.', score: 1, competencies: ['didática'] },
      { key: 'C', text: 'Foco nos menos experientes, pois precisam mais.', score: 2, competencies: ['empatia', 'didática'] },
      { key: 'D', text: 'Separo em dois grupos e dou conteúdos diferentes.', score: 1, competencies: ['criatividade'] }
    ],
    evaluates: ['flexibilidade', 'didática', 'criatividade']
  },
  {
    code: 'SJT_IT_05', questionNumber: 5,
    text: 'Mudança de procedimento durante treinamento',
    situation: 'No meio do treinamento, você é informado de que um procedimento que acabou de ensinar foi alterado.',
    options: [
      { key: 'A', text: 'Informo a turma com transparência, explico a diferença entre o antigo e o novo, e ajusto o material.', score: 3, competencies: ['comunicação', 'flexibilidade', 'aprendizagem'] },
      { key: 'B', text: 'Continuo com o procedimento antigo e corrijo depois.', score: 0, competencies: [] },
      { key: 'C', text: 'Paro a aula e estudo o novo procedimento antes de continuar.', score: 2, competencies: ['aprendizagem'] },
      { key: 'D', text: 'Informo a mudança e peço que os alunos verifiquem na base de conhecimento.', score: 1, competencies: ['comunicação'] }
    ],
    evaluates: ['comunicação', 'flexibilidade', 'aprendizagem']
  },
  {
    code: 'SJT_IT_06', questionNumber: 6,
    text: 'Erro cometido pelo instrutor',
    situation: 'Durante uma explicação, você percebe que passou uma informação incorreta para a turma.',
    options: [
      { key: 'A', text: 'Corrijo imediatamente, reconheço o erro e aproveito para reforçar a importância de verificar informações.', score: 3, competencies: ['comunicação', 'aprendizagem', 'domínio_social'] },
      { key: 'B', text: 'Corrijo discretamente sem chamar atenção para o erro.', score: 2, competencies: ['comunicação'] },
      { key: 'C', text: 'Continuo e corrijo na próxima aula.', score: 0, competencies: [] },
      { key: 'D', text: 'Envio um e-mail de correção depois da aula.', score: 1, competencies: ['comunicação'] }
    ],
    evaluates: ['comunicação', 'aprendizagem', 'domínio_social']
  },
  {
    code: 'SJT_IT_07', questionNumber: 7,
    text: 'Aluno lento no aprendizado',
    situation: 'Um aluno precisa de mais tempo e repetições para absorver o conteúdo. O cronograma está apertado.',
    options: [
      { key: 'A', text: 'Ofereço material complementar, reforço individual e ajusto atividades práticas para que ele pratique mais.', score: 3, competencies: ['paciência', 'didática', 'empatia'] },
      { key: 'B', text: 'Mantenho o ritmo da turma e sugiro que ele estude por conta.', score: 1, competencies: ['didática'] },
      { key: 'C', text: 'Reduzo o ritmo de toda a turma para acompanhá-lo.', score: 1, competencies: ['paciência'] },
      { key: 'D', text: 'Combino com ele um reforço fora do horário principal.', score: 2, competencies: ['paciência', 'flexibilidade'] }
    ],
    evaluates: ['paciência', 'didática', 'empatia']
  },
  {
    code: 'SJT_IT_08', questionNumber: 8,
    text: 'Aluno que domina o assunto',
    situation: 'Um aluno claramente domina o conteúdo e está ficando entediado.',
    options: [
      { key: 'A', text: 'Aproveito sua experiência como exemplo positivo, proponho desafios extras ou peço que apoie colegas.', score: 3, competencies: ['criatividade', 'influência', 'controle_grupo'] },
      { key: 'B', text: 'Deixo que ele participe normalmente.', score: 1, competencies: [] },
      { key: 'C', text: 'Libero-o para adiantar o próximo módulo.', score: 2, competencies: ['flexibilidade'] },
      { key: 'D', text: 'Peço que tenha paciência com o grupo.', score: 0, competencies: [] }
    ],
    evaluates: ['criatividade', 'influência', 'controle_grupo']
  },
  {
    code: 'SJT_IT_09', questionNumber: 9,
    text: 'Conflito na turma',
    situation: 'Dois alunos discordam publicamente sobre a melhor forma de abordar um atendimento e o clima fica tenso.',
    options: [
      { key: 'A', text: 'Medeia a discussão, valido ambas as perspectivas e direciono para o que o procedimento define, mantendo o clima construtivo.', score: 3, competencies: ['domínio_social', 'comunicação', 'controle_grupo'] },
      { key: 'B', text: 'Interrompo a discussão e digo qual é a forma correta.', score: 1, competencies: ['controle_grupo'] },
      { key: 'C', text: 'Deixo que eles resolvam entre si.', score: 0, competencies: [] },
      { key: 'D', text: 'Proponho uma simulação para que ambos testem suas abordagens.', score: 2, competencies: ['criatividade', 'domínio_social'] }
    ],
    evaluates: ['domínio_social', 'comunicação', 'controle_grupo']
  },
  {
    code: 'SJT_IT_10', questionNumber: 10,
    text: 'Adaptar explicação',
    situation: 'Você percebe que a forma como explicou um conceito não funcionou. A maioria da turma não entendeu.',
    options: [
      { key: 'A', text: 'Reconheço que a explicação não ficou clara, uso uma analogia ou exemplo prático diferente e verifico a compreensão.', score: 3, competencies: ['didática', 'flexibilidade', 'aprendizagem'] },
      { key: 'B', text: 'Repito a mesma explicação mais devagar.', score: 1, competencies: ['paciência'] },
      { key: 'C', text: 'Passo para o próximo tópico e retorno depois.', score: 0, competencies: [] },
      { key: 'D', text: 'Peço que um aluno que entendeu explique para os demais.', score: 2, competencies: ['criatividade', 'influência'] }
    ],
    evaluates: ['didática', 'flexibilidade', 'aprendizagem']
  },
  {
    code: 'SJT_IT_11', questionNumber: 11,
    text: 'Pouco tempo para conteúdo',
    situation: 'Faltam 2 horas para terminar o treinamento e ainda restam 3 tópicos importantes.',
    options: [
      { key: 'A', text: 'Priorizo os tópicos mais críticos, resumo os demais com material de apoio e combino reforço complementar.', score: 3, competencies: ['didática', 'flexibilidade', 'controle_grupo'] },
      { key: 'B', text: 'Acelero tudo para cobrir os 3 tópicos.', score: 1, competencies: ['didática'] },
      { key: 'C', text: 'Cubro apenas o que der tempo.', score: 2, competencies: ['flexibilidade'] },
      { key: 'D', text: 'Estendo o treinamento além do horário.', score: 0, competencies: [] }
    ],
    evaluates: ['didática', 'flexibilidade', 'controle_grupo']
  },
  {
    code: 'SJT_IT_12', questionNumber: 12,
    text: 'Avaliar aprendizagem',
    situation: 'Ao final de um módulo, você precisa avaliar se a turma absorveu o conteúdo.',
    options: [
      { key: 'A', text: 'Aplico atividade prática simulando situações reais e observo a aplicação do conteúdo.', score: 3, competencies: ['didática', 'criatividade', 'comunicação'] },
      { key: 'B', text: 'Faço uma prova teórica.', score: 1, competencies: ['didática'] },
      { key: 'C', text: 'Pergunto se ficou alguma dúvida.', score: 0, competencies: [] },
      { key: 'D', text: 'Faço uma rodada de perguntas e respostas interativa.', score: 2, competencies: ['didática', 'comunicação'] }
    ],
    evaluates: ['didática', 'criatividade', 'comunicação']
  },
  {
    code: 'SJT_IT_13', questionNumber: 13,
    text: 'Aluno que não participa',
    situation: 'Um aluno permanece calado durante todo o treinamento. Não interage, não faz perguntas.',
    options: [
      { key: 'A', text: 'Aproximo-me discretamente, faço perguntas leves para incluí-lo e busco entender se há algum motivo para o silêncio.', score: 3, competencies: ['empatia', 'comunicação', 'domínio_social'] },
      { key: 'B', text: 'Forço a participação chamando-o publicamente.', score: 0, competencies: [] },
      { key: 'C', text: 'Respeito o silêncio e sigo normalmente.', score: 1, competencies: ['paciência'] },
      { key: 'D', text: 'Proponho uma atividade em pequenos grupos para facilitar a participação.', score: 2, competencies: ['criatividade', 'domínio_social'] }
    ],
    evaluates: ['empatia', 'comunicação', 'domínio_social']
  },
  {
    code: 'SJT_IT_14', questionNumber: 14,
    text: 'Dúvida que não sabe responder',
    situation: 'Um aluno faz uma pergunta técnica que você não sabe responder no momento.',
    options: [
      { key: 'A', text: 'Reconheço que não sei, anoto a dúvida, comprometo-me a pesquisar e trago a resposta na próxima sessão.', score: 3, competencies: ['comunicação', 'aprendizagem', 'domínio_social'] },
      { key: 'B', text: 'Tento responder com base no que sei, mesmo sem certeza.', score: 0, competencies: [] },
      { key: 'C', text: 'Digo que não é o foco do treinamento.', score: 1, competencies: ['controle_grupo'] },
      { key: 'D', text: 'Proponho que pesquisemos juntos rapidamente.', score: 2, competencies: ['aprendizagem', 'criatividade'] }
    ],
    evaluates: ['comunicação', 'aprendizagem', 'domínio_social']
  },
  {
    code: 'SJT_IT_15', questionNumber: 15,
    text: 'Problema operacional no treinamento',
    situation: 'Durante um treinamento remoto, a plataforma cai e você perde a conexão com a turma.',
    options: [
      { key: 'A', text: 'Reconecto rapidamente, informo o ocorrido, verifico se todos estão de volta e retomo de onde paramos.', score: 3, competencies: ['flexibilidade', 'comunicação', 'controle_grupo'] },
      { key: 'B', text: 'Aguardo a área técnica resolver.', score: 0, competencies: [] },
      { key: 'C', text: 'Envio o material por e-mail e cancelo a sessão.', score: 1, competencies: ['comunicação'] },
      { key: 'D', text: 'Busco uma alternativa (WhatsApp, ligação) para manter a turma informada enquanto reconecto.', score: 2, competencies: ['flexibilidade', 'criatividade'] }
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
      { key: 'A', text: 'Analiso os motivos do TMA alto, redireciono operadores de filas menores e comunico a equipe sobre a priorização.', score: 3, competencies: ['gestao_indicadores', 'tomada_decisao', 'liderança'] },
      { key: 'B', text: 'Peço que todos atendam mais rápido.', score: 0, competencies: [] },
      { key: 'C', text: 'Informo a gerência sobre a situação.', score: 1, competencies: ['comunicação'] },
      { key: 'D', text: 'Coloco-me em atendimento para ajudar a reduzir a fila.', score: 2, competencies: ['liderança', 'resiliência'] }
    ],
    evaluates: ['gestao_indicadores', 'tomada_decisao', 'liderança']
  },
  {
    code: 'SJT_SE_02', questionNumber: 2,
    text: 'TMA elevado',
    situation: 'O TMA médio da equipe está 30% acima da meta. Você precisa apresentar um plano de ação.',
    options: [
      { key: 'A', text: 'Analiso por operador e tipo de chamada, identifico os maiores ofensores, proponho ações específicas (coaching, simplificação de script) e defino metas intermediárias.', score: 3, competencies: ['gestao_indicadores', 'liderança', 'organizacao'] },
      { key: 'B', text: 'Estabeleço uma meta de TMA e cobro diariamente.', score: 1, competencies: ['gestao_indicadores'] },
      { key: 'C', text: 'Peço ao time para ser mais objetivo.', score: 0, competencies: [] },
      { key: 'D', text: 'Solicito apoio do treinamento para reciclar a equipe.', score: 2, competencies: ['liderança', 'gestao_indicadores'] }
    ],
    evaluates: ['gestao_indicadores', 'liderança', 'organizacao']
  },
  {
    code: 'SJT_SE_03', questionNumber: 3,
    text: 'NPS baixo',
    situation: 'O NPS da sua equipe caiu significativamente no último mês. A gerência pede providências.',
    options: [
      { key: 'A', text: 'Analiso os comentários dos detratores, cruzo com dados de monitoria, identifico padrões e crio plano de ação com metas e acompanhamento semanal.', score: 3, competencies: ['gestao_indicadores', 'liderança', 'visao_sistemica'] },
      { key: 'B', text: 'Reforço a importância do NPS em reunião de equipe.', score: 1, competencies: ['comunicação'] },
      { key: 'C', text: 'Peço ao time de qualidade para investigar.', score: 2, competencies: ['visao_sistemica'] },
      { key: 'D', text: 'Culpo fatores externos (sistema, demanda).', score: 0, competencies: [] }
    ],
    evaluates: ['gestao_indicadores', 'liderança', 'visao_sistemica']
  },
  {
    code: 'SJT_SE_04', questionNumber: 4,
    text: 'Monitoria baixa',
    situation: 'Um operador que era referência da equipe teve queda acentuada na monitoria nos últimos 3 ciclos.',
    options: [
      { key: 'A', text: 'Convoco uma conversa individual, investigo possíveis causas (pessoais, desmotivação, mudança de procedimento) e construo um plano de recuperação juntos.', score: 3, competencies: ['gestao_pessoas', 'comunicação', 'liderança'] },
      { key: 'B', text: 'Aplico advertência por baixo desempenho.', score: 0, competencies: [] },
      { key: 'C', text: 'Peço para o monitor dar feedback.', score: 1, competencies: ['gestao_pessoas'] },
      { key: 'D', text: 'Coloco para escutar gravações de atendimentos anteriores bons como referência.', score: 2, competencies: ['gestao_pessoas', 'liderança'] }
    ],
    evaluates: ['gestao_pessoas', 'comunicação', 'liderança']
  },
  {
    code: 'SJT_SE_05', questionNumber: 5,
    text: 'Absenteísmo',
    situation: 'Três operadores faltaram no mesmo dia. A equipe está sobrecarregada.',
    options: [
      { key: 'A', text: 'Redistribuo as filas, priorizo os atendimentos mais críticos, comunico a situação à equipe e registro as faltas para acompanhamento.', score: 3, competencies: ['organizacao', 'tomada_decisao', 'resiliência'] },
      { key: 'B', text: 'Ligo para os faltantes para cobrar.', score: 1, competencies: ['assertividade'] },
      { key: 'C', text: 'Informo à gerência e espero orientação.', score: 1, competencies: ['comunicação'] },
      { key: 'D', text: 'Peço para a equipe presente absorver o volume.', score: 2, competencies: ['organizacao', 'comunicação'] }
    ],
    evaluates: ['organizacao', 'tomada_decisao', 'resiliência']
  },
  {
    code: 'SJT_SE_06', questionNumber: 6,
    text: 'Operador contestando feedback',
    situation: 'Um operador reage de forma defensiva ao receber feedback sobre seu atendimento. Ele se sente injustiçado.',
    options: [
      { key: 'A', text: 'Escuto primeiro, reconheço os sentimentos, depois apresento os fatos e evidências de forma objetiva e empática.', score: 3, competencies: ['gestao_conflitos', 'comunicação', 'assertividade'] },
      { key: 'B', text: 'Mantenho o feedback e digo que não há discussão.', score: 0, competencies: [] },
      { key: 'C', text: 'Recuo para evitar o confronto.', score: 0, competencies: [] },
      { key: 'D', text: 'Marco outra reunião quando ele estiver mais calmo.', score: 2, competencies: ['gestao_conflitos', 'comunicação'] }
    ],
    evaluates: ['gestao_conflitos', 'comunicação', 'assertividade']
  },
  {
    code: 'SJT_SE_07', questionNumber: 7,
    text: 'Conflito entre operadores',
    situation: 'Dois operadores estão em conflito porque um acusa o outro de não ajudar nos intervalos.',
    options: [
      { key: 'A', text: 'Converso separadamente com cada um, entendo as perspectivas, depois medeia uma conversa conjunta focando em acordos e responsabilidades.', score: 3, competencies: ['gestao_conflitos', 'liderança', 'comunicação'] },
      { key: 'B', text: 'Digo que são adultos e devem resolver sozinhos.', score: 0, competencies: [] },
      { key: 'C', text: 'Redistribuo os intervalos para evitar que se encontrem.', score: 1, competencies: ['organizacao'] },
      { key: 'D', text: 'Falo com os dois juntos e peço que resolvam.', score: 2, competencies: ['gestao_conflitos'] }
    ],
    evaluates: ['gestao_conflitos', 'liderança', 'comunicação']
  },
  {
    code: 'SJT_SE_08', questionNumber: 8,
    text: 'Operador excelente com problema disciplinar',
    situation: 'Seu melhor operador chega atrasado com frequência. O desempenho é excelente, mas o exemplo é ruim para a equipe.',
    options: [
      { key: 'A', text: 'Converso individualmente, reconheço o bom desempenho, mas sou claro sobre a importância do exemplo e as consequências dos atrasos.', score: 3, competencies: ['assertividade', 'liderança', 'gestao_pessoas'] },
      { key: 'B', text: 'Ignoro os atrasos pelo bom desempenho.', score: 0, competencies: [] },
      { key: 'C', text: 'Aplico as medidas disciplinares padrão imediatamente.', score: 2, competencies: ['assertividade', 'disciplina_operacional'] },
      { key: 'D', text: 'Comento informalmente para ele chegar no horário.', score: 1, competencies: ['comunicação'] }
    ],
    evaluates: ['assertividade', 'liderança', 'gestao_pessoas']
  },
  {
    code: 'SJT_SE_09', questionNumber: 9,
    text: 'Aplicar consequência',
    situation: 'Um operador cometeu uma infração que exige aplicação de consequência (advertência), mas ele é querido pela equipe.',
    options: [
      { key: 'A', text: 'Aplico a consequência de forma justa e privada, explico o motivo com respeito e mantenho o mesmo padrão para todos.', score: 3, competencies: ['assertividade', 'liderança', 'disciplina_operacional'] },
      { key: 'B', text: 'Dou apenas uma bronca verbal e deixo passar.', score: 1, competencies: ['comunicação'] },
      { key: 'C', text: 'Peço ao RH para aplicar para eu não ser o "vilão".', score: 0, competencies: [] },
      { key: 'D', text: 'Aplico, mas suavizo dizendo que "sou obrigado".', score: 2, competencies: ['assertividade'] }
    ],
    evaluates: ['assertividade', 'liderança', 'disciplina_operacional']
  },
  {
    code: 'SJT_SE_10', questionNumber: 10,
    text: 'Pressão da gestão',
    situation: 'Sua gerência pede que você cobre resultados agressivos da equipe em um momento que o time está desmotivado.',
    options: [
      { key: 'A', text: 'Apresento a realidade do time à gerência, proponho metas graduais realistas e trabalho a motivação com ações concretas.', score: 3, competencies: ['liderança', 'resiliência', 'comunicação'] },
      { key: 'B', text: 'Repasso a pressão diretamente para a equipe.', score: 0, competencies: [] },
      { key: 'C', text: 'Aceito as metas e cobro o time.', score: 1, competencies: ['disciplina_operacional'] },
      { key: 'D', text: 'Foco em motivar o time e negocio prazos com a gerência.', score: 2, competencies: ['liderança', 'comunicação'] }
    ],
    evaluates: ['liderança', 'resiliência', 'comunicação']
  },
  {
    code: 'SJT_SE_11', questionNumber: 11,
    text: 'Problema sistêmico',
    situation: 'Um problema de sistema está afetando o TMA e o NPS, mas a área técnica não tem previsão de solução.',
    options: [
      { key: 'A', text: 'Documento o impacto com dados, escalo formalmente, crio workaround para a equipe e comunico transparentemente.', score: 3, competencies: ['visao_sistemica', 'tomada_decisao', 'organizacao'] },
      { key: 'B', text: 'Informo a gerência e espero a solução.', score: 1, competencies: ['comunicação'] },
      { key: 'C', text: 'Peço ao time para contornar como puder.', score: 2, competencies: ['liderança'] },
      { key: 'D', text: 'Considero o problema como fora do meu controle.', score: 0, competencies: [] }
    ],
    evaluates: ['visao_sistemica', 'tomada_decisao', 'organizacao']
  },
  {
    code: 'SJT_SE_12', questionNumber: 12,
    text: 'Operador emocionalmente abalado',
    situation: 'Um operador está visivelmente abalado após uma ligação difícil e não consegue continuar atendendo.',
    options: [
      { key: 'A', text: 'Retiro-o brevemente da posição, acolho, verifico se precisa de suporte e, quando se sentir pronto, o reintegro gradualmente.', score: 3, competencies: ['gestao_pessoas', 'liderança', 'resiliência'] },
      { key: 'B', text: 'Digo que faz parte do trabalho e peço que continue.', score: 0, competencies: [] },
      { key: 'C', text: 'Libero para ir embora.', score: 1, competencies: ['gestao_pessoas'] },
      { key: 'D', text: 'Ofereço um intervalo e redistribuo os atendimentos momentaneamente.', score: 2, competencies: ['gestao_pessoas', 'organizacao'] }
    ],
    evaluates: ['gestao_pessoas', 'liderança', 'resiliência']
  },
  {
    code: 'SJT_SE_13', questionNumber: 13,
    text: 'Priorização de tarefas',
    situation: 'Você tem ao mesmo tempo: reunião de resultado, feedback pendente, relatório atrasado e fila alta. O que prioriza?',
    options: [
      { key: 'A', text: 'Atendo a fila alta primeiro (impacto imediato), delego o que for possível, reorganizo reunião e feedback, e faço o relatório no fim do dia.', score: 3, competencies: ['organizacao', 'tomada_decisao', 'orientacao_resultado'] },
      { key: 'B', text: 'Faço tudo ao mesmo tempo.', score: 0, competencies: [] },
      { key: 'C', text: 'Sigo a ordem da agenda.', score: 1, competencies: ['organizacao'] },
      { key: 'D', text: 'Foco no relatório, pois a gerência está cobrando.', score: 2, competencies: ['organizacao'] }
    ],
    evaluates: ['organizacao', 'tomada_decisao', 'orientacao_resultado']
  },
  {
    code: 'SJT_SE_14', questionNumber: 14,
    text: 'Redistribuir equipe',
    situation: 'Você precisa redistribuir operadores entre filas, mas alguns vão resistir por preferirem a fila atual.',
    options: [
      { key: 'A', text: 'Explico o motivo da redistribuição com transparência, apresento os dados que justificam e ofereço suporte na transição.', score: 3, competencies: ['liderança', 'comunicação', 'gestao_pessoas'] },
      { key: 'B', text: 'Faço a mudança sem explicar.', score: 0, competencies: [] },
      { key: 'C', text: 'Peço voluntários.', score: 2, competencies: ['liderança'] },
      { key: 'D', text: 'Mudo gradualmente sem formalizar.', score: 1, competencies: ['organizacao'] }
    ],
    evaluates: ['liderança', 'comunicação', 'gestao_pessoas']
  },
  {
    code: 'SJT_SE_15', questionNumber: 15,
    text: 'Produtividade vs qualidade',
    situation: 'A gerência pressiona por produtividade. A equipe de qualidade pressiona por melhores notas de monitoria. Você está no meio.',
    options: [
      { key: 'A', text: 'Analiso onde produtividade e qualidade se complementam, proponho equilíbrio com dados e defino com o time quais ações atacam ambas.', score: 3, competencies: ['visao_sistemica', 'tomada_decisao', 'orientacao_resultado'] },
      { key: 'B', text: 'Priorizo a produtividade porque a gerência pesa mais.', score: 1, competencies: ['orientacao_resultado'] },
      { key: 'C', text: 'Priorizo a qualidade porque é o correto.', score: 1, competencies: ['orientacao_resultado'] },
      { key: 'D', text: 'Comunico a ambos que é impossível atender os dois ao mesmo tempo.', score: 0, competencies: [] }
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

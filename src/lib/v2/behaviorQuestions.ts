/**
 * MÓDULO 1 — MAPA COMPORTAMENTAL (V2)
 * 15 perguntas com duas alternativas igualmente aceitáveis.
 * Cada alternativa possui pesos internos para as 11 dimensões.
 *
 * Dimensões:
 * O  = Abertura
 * C  = Conscienciosidade
 * E  = Extroversão
 * A  = Amabilidade
 * ES = Estabilidade Emocional
 * AD = Adaptabilidade
 * RA = Resiliência
 * MS = Maturidade Social
 * OR = Orientação Operacional
 * AS = Assertividade
 * FC = Flexibilidade Cognitiva
 */

export interface BehaviorQuestionWeight {
  O?: number;
  C?: number;
  E?: number;
  A?: number;
  ES?: number;
  AD?: number;
  RA?: number;
  MS?: number;
  OR?: number;
  AS?: number;
  FC?: number;
}

export interface V2BehaviorQuestion {
  code: string;
  questionNumber: number;
  text: string;
  optionA: string;
  optionB: string;
  weightsA: BehaviorQuestionWeight;
  weightsB: BehaviorQuestionWeight;
  measures: string[];
}

export const V2_BEHAVIOR_QUESTIONS: V2BehaviorQuestion[] = [
  {
    code: 'B01',
    questionNumber: 1,
    text: 'Você chega para trabalhar e percebe que o procedimento de uma demanda foi alterado naquela manhã.',
    optionA: 'Procuro entender rapidamente o que mudou e adapto minha forma de atendimento.',
    optionB: 'Prefiro conferir a orientação com cautela antes de alterar meu padrão habitual de atendimento.',
    weightsA: { AD: 2, O: 1.5, FC: 1 },
    weightsB: { C: 2, OR: 1.5 },
    measures: ['Adaptabilidade', 'Abertura']
  },
  {
    code: 'B02',
    questionNumber: 2,
    text: 'Depois de uma ligação muito difícil, você encerra o atendimento.',
    optionA: 'Procuro deixar aquela situação para trás e seguir normalmente para o próximo atendimento.',
    optionB: 'Analiso os pontos marcantes da conversa para identificar aprendizados para os próximos atendimentos.',
    weightsA: { RA: 2, ES: 1.5 },
    weightsB: { O: 2, MS: 1 },
    measures: ['Resiliência', 'Abertura', 'Autorreflexão']
  },
  {
    code: 'B03',
    questionNumber: 3,
    text: 'Um colega procura você para reclamar de uma situação que aconteceu com ele.',
    optionA: 'Primeiro procuro entender o que aconteceu antes de dar minha opinião.',
    optionB: 'Compartilho diretamente uma sugestão objetiva baseada no que deu certo para mim.',
    weightsA: { MS: 2, A: 1.5 },
    weightsB: { AS: 2, E: 1 },
    measures: ['Maturidade Social', 'Escuta', 'Assertividade']
  },
  {
    code: 'B04',
    questionNumber: 4,
    text: 'Você percebe que está realizando uma atividade repetitiva há várias horas.',
    optionA: 'Procuro uma forma de tornar o processo mais eficiente.',
    optionB: 'Mantenho o foco e o ritmo constante na execução do padrão estabelecido.',
    weightsA: { O: 2, FC: 1.5 },
    weightsB: { OR: 2, C: 1.5 },
    measures: ['Abertura', 'Orientação Operacional']
  },
  {
    code: 'B05',
    questionNumber: 5,
    text: 'Seu supervisor aponta um erro cometido por você.',
    optionA: 'Procuro entender o erro e corrigir a situação.',
    optionB: 'Contextualizo o cenário em que a decisão foi tomada para alinhar as expectativas com o supervisor.',
    weightsA: { A: 2, ES: 1, C: 1 },
    weightsB: { AS: 1.5, E: 1 },
    measures: ['Amabilidade', 'Estabilidade', 'Responsabilidade']
  },
  {
    code: 'B06',
    questionNumber: 6,
    text: 'Você percebe que um colega está tendo dificuldade para acompanhar a operação.',
    optionA: 'Ofereço ajuda mesmo que isso não faça parte diretamente da minha atividade.',
    optionB: 'Mantenho o foco nas minhas entregas para garantir que minha fila individual não seja impactada.',
    weightsA: { A: 2, MS: 1.5, E: 0.5 },
    weightsB: { C: 1.5, OR: 1.5 },
    measures: ['Amabilidade', 'Social']
  },
  {
    code: 'B07',
    questionNumber: 7,
    text: 'Durante um atendimento, o cidadão muda várias vezes o que está solicitando.',
    optionA: 'Faço perguntas para reorganizar a situação e descobrir exatamente o que ele precisa.',
    optionB: 'Solicito a confirmação do histórico completo para garantir o alinhamento de todas as informações.',
    weightsA: { FC: 2, MS: 1, AD: 1 },
    weightsB: { C: 1.5, OR: 1 },
    measures: ['Flexibilidade Cognitiva', 'Investigativo', 'Escuta']
  },
  {
    code: 'B08',
    questionNumber: 8,
    text: 'Você recebe três tarefas ao mesmo tempo.',
    optionA: 'Defino uma ordem de prioridade antes de começar.',
    optionB: 'Começo pela tarefa que parece mais simples para ganhar velocidade.',
    weightsA: { C: 2, OR: 1.5 },
    weightsB: { AD: 1.5, O: 1 },
    measures: ['Conscienciosidade', 'Organização', 'Tomada de decisão']
  },
  {
    code: 'B09',
    questionNumber: 9,
    text: 'Durante uma discussão profissional, você percebe que sua opinião está sendo questionada.',
    optionA: 'Defendo meu ponto de vista, mas considero os argumentos apresentados.',
    optionB: 'Priorizo a coesão da equipe e busco convergência com a decisão coletiva.',
    weightsA: { AS: 2, FC: 1, E: 1 },
    weightsB: { A: 1.5, ES: 1 },
    measures: ['Assertividade', 'Flexibilidade', 'Extroversão']
  },
  {
    code: 'B10',
    questionNumber: 10,
    text: 'Um cidadão demonstra irritação com você, embora o problema não tenha sido causado pela sua equipe.',
    optionA: 'Procuro manter o atendimento profissional e resolver o que estiver ao meu alcance.',
    optionB: 'Clarifico os limites institucionais do meu canal antes de direcionar os próximos passos.',
    weightsA: { ES: 2, RA: 1.5, A: 1 },
    weightsB: { AS: 1.5, E: 1 },
    measures: ['Estabilidade Emocional', 'Resiliência', 'Amabilidade']
  },
  {
    code: 'B11',
    questionNumber: 11,
    text: 'Você recebe uma tarefa sem todas as instruções.',
    optionA: 'Procuro informações e começo a estruturar uma solução.',
    optionB: 'Prefiro solicitar o detalhamento oficial do procedimento antes de iniciar a execução.',
    weightsA: { O: 2, AD: 1.5, FC: 1 },
    weightsB: { C: 1.5, OR: 1.5 },
    measures: ['Autonomia', 'Flexibilidade', 'Abertura']
  },
  {
    code: 'B12',
    questionNumber: 12,
    text: 'Você percebe que um procedimento está sendo seguido de maneira diferente por algumas pessoas da equipe.',
    optionA: 'Procuro entender por que isso está acontecendo antes de tomar uma posição.',
    optionB: 'Informo imediatamente que o procedimento precisa ser seguido conforme definido.',
    weightsA: { FC: 1.5, MS: 1.5, O: 1 },
    weightsB: { OR: 2, AS: 1.5, C: 1 },
    measures: ['Orientação Operacional', 'Flexibilidade', 'Assertividade']
  },
  {
    code: 'B13',
    questionNumber: 13,
    text: 'Você precisa aprender uma ferramenta nova.',
    optionA: 'Exploro a ferramenta e aprendo conforme utilizo.',
    optionB: 'Prefiro receber uma explicação estruturada antes de começar.',
    weightsA: { O: 2, AD: 1.5 },
    weightsB: { C: 2, OR: 1 },
    measures: ['Abertura', 'Aprendizagem', 'Conscienciosidade']
  },
  {
    code: 'B14',
    questionNumber: 14,
    text: 'Você percebe que cometeu um erro que provavelmente ninguém percebeu.',
    optionA: 'Corrijo e informo o ocorrido.',
    optionB: 'Efetuo a correção de forma ágil e dou continuidade à rotina de trabalho.',
    weightsA: { C: 2, MS: 1.5, AS: 0.5 },
    weightsB: { AD: 1, ES: 1 },
    measures: ['Responsabilidade', 'Conscienciosidade', 'Accountability']
  },
  {
    code: 'B15',
    questionNumber: 15,
    text: 'Ao final de um dia muito difícil:',
    optionA: 'Consigo deixar os problemas do trabalho para trás com relativa facilidade.',
    optionB: 'Dedico um tempo para refletir sobre os desafios enfrentados antes de me desligar.',
    weightsA: { RA: 2, ES: 2 },
    weightsB: { O: 1.5, C: 1 },
    measures: ['Resiliência', 'Estabilidade Emocional']
  }
];

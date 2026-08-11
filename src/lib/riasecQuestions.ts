import type { RiasecQuestion } from '../types/database';

export const RIASEC_QUESTIONS_CATALOG: Omit<RiasecQuestion, 'id'>[] = [
  {
    question_number: 1,
    text: 'Você recebe uma tarde livre no trabalho para aprender algo novo.',
    option_a: 'Aprender a configurar ou testar algum equipamento ou ferramenta.',
    option_b: 'Investigar por que determinado problema continua acontecendo.',
    dimension_a: 'R',
    dimension_b: 'I'
  },
  {
    question_number: 2,
    text: 'Você participa de uma melhoria no setor.',
    option_a: 'Pensar em uma maneira diferente de apresentar a informação.',
    option_b: 'Criar uma forma mais organizada de controlar o processo.',
    dimension_a: 'A',
    dimension_b: 'C'
  },
  {
    question_number: 3,
    text: 'Seu gestor oferece duas atividades para você escolher.',
    option_a: 'Ajudar a treinar uma pessoa nova.',
    option_b: 'Trabalhar em uma atividade com meta e resultado individual.',
    dimension_a: 'S',
    dimension_b: 'E'
  },
  {
    question_number: 4,
    text: 'Um sistema apresenta um comportamento estranho.',
    option_a: 'Investigar as possíveis causas até descobrir o problema.',
    option_b: 'Procurar uma solução prática para fazer o sistema voltar a funcionar.',
    dimension_a: 'I',
    dimension_b: 'R'
  },
  {
    question_number: 5,
    text: 'Você precisa melhorar uma apresentação utilizada pela equipe.',
    option_a: 'Criar uma maneira visualmente diferente de apresentar o conteúdo.',
    option_b: 'Organizar as informações para facilitar a consulta.',
    dimension_a: 'A',
    dimension_b: 'C'
  },
  {
    question_number: 6,
    text: 'A empresa oferece uma atividade voluntária.',
    option_a: 'Orientar pessoas que estão começando na empresa.',
    option_b: 'Participar da organização de uma campanha para alcançar determinado resultado.',
    dimension_a: 'S',
    dimension_b: 'E'
  },
  {
    question_number: 7,
    text: 'Você recebe uma planilha com vários dados e precisa trabalhar com ela.',
    option_a: 'Procurar padrões e informações que possam explicar os resultados.',
    option_b: 'Organizar os dados para facilitar consultas futuras.',
    dimension_a: 'I',
    dimension_b: 'C'
  },
  {
    question_number: 8,
    text: 'Durante uma reunião surge um problema operacional.',
    option_a: 'Pensar em uma solução prática que possa ser testada imediatamente.',
    option_b: 'Convencer a equipe a adotar uma determinada estratégia.',
    dimension_a: 'R',
    dimension_b: 'E'
  },
  {
    question_number: 9,
    text: 'Você precisa criar uma comunicação interna para a equipe.',
    option_a: 'Criar uma apresentação diferente e mais criativa.',
    option_b: 'Conversar com algumas pessoas para descobrir o que seria mais útil para elas.',
    dimension_a: 'A',
    dimension_b: 'S'
  },
  {
    question_number: 10,
    text: 'Você pode escolher entre duas atividades.',
    option_a: 'Analisar informações para descobrir a causa de um problema.',
    option_b: 'Organizar documentos e informações seguindo um padrão.',
    dimension_a: 'I',
    dimension_b: 'C'
  },
  {
    question_number: 11,
    text: 'Seu setor precisa melhorar um resultado.',
    option_a: 'Pensar em uma estratégia para convencer outras pessoas a participar.',
    option_b: 'Trabalhar diretamente com as pessoas envolvidas para ajudá-las a melhorar.',
    dimension_a: 'E',
    dimension_b: 'S'
  },
  {
    question_number: 12,
    text: 'Você recebe uma tarefa prática.',
    option_a: 'Testar diferentes formas de executar a atividade até encontrar uma solução.',
    option_b: 'Pensar em uma forma completamente diferente de realizar a tarefa.',
    dimension_a: 'R',
    dimension_b: 'A'
  },
  {
    question_number: 13,
    text: 'Durante um projeto você pode assumir uma responsabilidade.',
    option_a: 'Coordenar pessoas e acompanhar o resultado.',
    option_b: 'Investigar informações antes de sugerir uma solução.',
    dimension_a: 'E',
    dimension_b: 'I'
  },
  {
    question_number: 14,
    text: 'Você precisa organizar um novo processo.',
    option_a: 'Criar um procedimento detalhado para garantir padronização.',
    option_b: 'Conversar com quem executa o processo para entender as dificuldades.',
    dimension_a: 'C',
    dimension_b: 'S'
  },
  {
    question_number: 15,
    text: 'Você percebe que uma informação importante está sendo apresentada de maneira pouco interessante.',
    option_a: 'Criar uma forma mais visual e criativa de apresentá-la.',
    option_b: 'Pensar em uma maneira de utilizar aquela informação para melhorar um resultado.',
    dimension_a: 'A',
    dimension_b: 'E'
  },
  {
    question_number: 16,
    text: 'Você recebe um problema que ninguém conseguiu resolver.',
    option_a: 'Pesquisar e testar hipóteses até entender a causa.',
    option_b: 'Experimentar diferentes soluções diretamente.',
    dimension_a: 'I',
    dimension_b: 'R'
  },
  {
    question_number: 17,
    text: 'Você precisa escolher uma atividade para participar durante um projeto.',
    option_a: 'Acompanhar pessoas e ajudá-las durante o desenvolvimento.',
    option_b: 'Controlar registros, prazos e informações.',
    dimension_a: 'S',
    dimension_b: 'C'
  },
  {
    question_number: 18,
    text: 'Seu gestor apresenta uma nova meta.',
    option_a: 'Pensar em estratégias para superar a meta.',
    option_b: 'Descobrir quais informações explicam o desempenho atual.',
    dimension_a: 'E',
    dimension_b: 'I'
  },
  {
    question_number: 19,
    text: 'Você precisa melhorar uma rotina repetitiva.',
    option_a: 'Criar uma maneira diferente e mais criativa de executar a atividade.',
    option_b: 'Testar uma mudança prática diretamente na rotina.',
    dimension_a: 'A',
    dimension_b: 'R'
  },
  {
    question_number: 20,
    text: 'Você pode escolher uma atividade para desenvolver durante uma semana.',
    option_a: 'Acompanhar e orientar pessoas.',
    option_b: 'Trabalhar com informações, registros e controles.',
    dimension_a: 'S',
    dimension_b: 'C'
  },
  {
    question_number: 21,
    text: 'Uma área apresenta queda de desempenho.',
    option_a: 'Analisar os dados para entender o que está provocando a queda.',
    option_b: 'Criar uma estratégia para recuperar o resultado.',
    dimension_a: 'I',
    dimension_b: 'E'
  },
  {
    question_number: 22,
    text: 'Você precisa melhorar uma atividade operacional.',
    option_a: 'Trabalhar diretamente na execução para testar melhorias.',
    option_b: 'Criar uma nova forma de apresentar ou executar a atividade.',
    dimension_a: 'R',
    dimension_b: 'A'
  },
  {
    question_number: 23,
    text: 'Uma equipe está enfrentando dificuldades.',
    option_a: 'Conversar com as pessoas para entender suas necessidades.',
    option_b: 'Criar um método para organizar e acompanhar as atividades.',
    dimension_a: 'S',
    dimension_b: 'C'
  },
  {
    question_number: 24,
    text: 'Você recebe liberdade para escolher um projeto.',
    option_a: 'Criar algo novo e diferente.',
    option_b: 'Resolver um problema complexo que exige investigação.',
    dimension_a: 'A',
    dimension_b: 'I'
  }
];

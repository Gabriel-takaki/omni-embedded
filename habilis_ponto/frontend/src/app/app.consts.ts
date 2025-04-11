import {environment} from '../environments/environment';

export const BASE_PORT = (!environment.production) ? 2080 : window.location.port ? Number(window.location.port) : (window.location.protocol === 'http' ? 80 : 443);
export const MOBILE_PORT = 2083;
// @ts-ignore
export const SPECIAL_PORT = document.getElementById('enablespecialport')?.content === 'true';

export const BASE_IP = (!environment.production) ? 'localhost' : window.location.hostname;
export const BASE_URL = `${window.location.protocol}//${BASE_IP}:${BASE_PORT}`;
export const VERSION = '9.0.11';
export const NUMERIC_VERSION = 90011;
export const DEBUG = (!environment.production) ? true : false;


export const agentType = {
    'admin': 0,
    'supervisor': 1,
    'agent': 2,
    'bot': 3,
    'mobile': 4,
    'clockinuser': 5,
    'superadmin': 98,
    'super': 99
}

export const ivrWidgetType = {
    'message': 0,
    'question': 1,
    'options': 2,
    'info': 3,
    'terminate': 4,
    'transfer': 5,
    'http': 6,
    'marker': 7,
    'timetable': 8,
    'url': 9,
    'integrations': 10,
    'varCondition': 11,
    'request': 12,
    'protocol': 13,
    'searchContact': 14,
    'addContact': 15,
    'userAvailable': 16,
    'sleep': 17,
    'setTriggers': 18,
    'alert': 19,
    'newVar': 20,
    'jscode': 21,
    'sendAlert': 22,
    'cancelMessage': 23,
    'removeTrigger': 24,
    'lock': 25,
    'waitMessage': 26,
    'execAutomation': 27,
    'editContact': 28,
    'openChat': 29,
    'searchChat': 30,
    'openChatCloud': 31,
    'sendMail': 32,
    'sendNotification': 33,
    'createTask': 34,
    'addOpportunity': 35,
    'winOpportunity': 36,
    'loseOpportunity': 37,
    'editOpportunity': 38,
    'cloneOpportunity': 39,
    'moveOpportunity': 40,
    'searchOpportunity': 41,
    'transferOpportunity': 42,
    'insertFileOpportunity': 43,
    'showForm': 44,
    'clearOpportunityTasks': 45,
    'freezeOpportunity': 46,
    'unfreezeOpportunity': 47,
    'shareContact': 48,
    'removeAllTriggers': 49,
    'reopenOpportunity': 50,
    'addPersistent': 51,
    'searchPersistent': 52,
    'removePersistent': 53,
    'replyComment': 54,
    'searchInstance': 55,
    'createInstance': 56,
    'editInstanceContactDetails': 57,
    'markInstanceForExclusion': 58,
    'reactivateInstance': 59,
    'blockInstance': 60,
    'unblockInstance': 61,
    'restartInstance': 62,
    'restartInstanceContainer': 63,
    'updateInstance': 64,
    'getInstanceBill': 65,
    'sendTemplate': 66,
    'markTaskAsDone': 67,
    'addToWaitingList': 68,
    'removeFromWaitingList': 69,
    'addInformationCard': 70,
    'removeInformationCard': 71,
    'showSnackNotification': 72,
    'addInformationCardToMessage': 73,
    'removeInformationCardFromMessage': 74,
    'sendFlow': 75,
    'clearFlowDataFromMessage': 76,
    'aiAssistant': 77,
    'aiAddContextToAssistant': 78,
    'aiProcessFile': 79,
    'aiStopAssistant': 80,
    'aiStopMessage': 81
}

export enum AvailableAt {
    ALL = 0,
    IVR = 1,
    AUTOMATION = 2
}

export const ivrWidgetTypeArray = [
    {
        title: $localize`Enviar mensagem`,
        value: ivrWidgetType.message,
        description: $localize`Envia uma mensagem para o cliente.`,
        availableAt: AvailableAt.ALL
    },
    {
        title: $localize`Enviar pergunta`,
        value: ivrWidgetType.question,
        description: $localize`Envia uma pergunta para o cliente e aguarda uma resposta.`,
        availableAt: AvailableAt.IVR
    },
    {
        title: $localize`Enviar múltiplas opções`,
        value: ivrWidgetType.options,
        description: $localize`Envia uma mensagem com opções para o cliente e aguarda uma resposta.`,
        availableAt: AvailableAt.IVR
    },
    {
        title: $localize`Adicionar informação`,
        value: ivrWidgetType.info,
        description: $localize`Adiciona uma mensagem de informação ao atendimento. A mensagem de informação só poderá ser vista pelo atendente.`,
        availableAt: AvailableAt.ALL
    },
    {
        title: $localize`Encerrar atendimento`,
        value: ivrWidgetType.terminate,
        description: $localize`Encerra o atendimento.`,
        availableAt: AvailableAt.ALL
    },
    {
        title: $localize`Transferir atendimento`,
        value: ivrWidgetType.transfer,
        description: $localize`Transfere o atendimento para uma URA, atendente específico ou grupo de atendentes com base no filtro.`,
        availableAt: AvailableAt.ALL
    },
    {
        title: $localize`Adicionar etiqueta`,
        value: ivrWidgetType.marker,
        description: $localize`Adicionar uma etiqueta ao atendimento.`,
        availableAt: AvailableAt.ALL
    },
    {
        title: $localize`Controle de horário`,
        value: ivrWidgetType.timetable,
        description: $localize`Controla a direção do fluxo de acordo com a data / horário.`,
        availableAt: AvailableAt.ALL
    },
    {
        title: $localize`Enviar URL`,
        value: ivrWidgetType.url,
        description: $localize`Envia um botão de ação para o cliente. Esse botão pode ser uma URL ou um dado para ser copiado.`,
        availableAt: AvailableAt.ALL
    },
    // {
    //     title: $localize`Integrações`,
    //     value: ivrWidgetType.integrations,
    //     description: $localize`DEPRECATED, não deve ser utilizado`,
    //     availableAt: AvailableAt.ALL
    // },
    {
        title: $localize`Condição de variável`,
        value: ivrWidgetType.varCondition,
        description: $localize`Controla o fluxo de acordo com o valor de uma variável.`,
        availableAt: AvailableAt.ALL
    },
    {
        title: $localize`Requisição HTTP`,
        value: ivrWidgetType.request,
        description: $localize`Realiza uma requisição HTTP e salva o retorno em uma variável.`,
        availableAt: AvailableAt.ALL
    },
    {
        title: $localize`Gerar protocolo`,
        value: ivrWidgetType.protocol,
        description: $localize`Gera um protocolo e o associa ao atendimento.`,
        availableAt: AvailableAt.ALL
    },
    {
        title: $localize`Buscar contato`,
        value: ivrWidgetType.searchContact,
        description: $localize`Busca um contato na base de dados e o disponibiliza em uma variável. Se desejado também o associa ao atendimento.`,
        availableAt: AvailableAt.ALL
    },
    {
        title: $localize`Adicionar contato`,
        value: ivrWidgetType.addContact,
        description: $localize`Adiciona um contato na base de dados.`,
        availableAt: AvailableAt.ALL
    },
    {
        title: $localize`Verificar disponibilidade do usuário`,
        value: ivrWidgetType.userAvailable,
        description: $localize`Verifica o status de um atendente e o disponibiliza em uma variável.`,
        availableAt: AvailableAt.ALL
    },
    {
        title: $localize`Pausar`,
        value: ivrWidgetType.sleep,
        description: $localize`Pausa o fluxo por um determinado tempo.`,
        availableAt: AvailableAt.ALL
    },
    {
        title: $localize`Definir gatilhos`,
        value: ivrWidgetType.setTriggers,
        description: $localize`Adiciona um conjunto de gatilhos ao atendimento.`,
        availableAt: AvailableAt.ALL
    },
    {
        title: $localize`Nova variável`,
        value: ivrWidgetType.newVar,
        description: $localize`Cria uma nova variável com o valor informado.`,
        availableAt: AvailableAt.ALL
    },
    {
        title: $localize`Código JavaScript`,
        value: ivrWidgetType.jscode,
        description: $localize`Executa um código JavaScript, pode-se manipular variáveis.`,
        availableAt: AvailableAt.ALL
    },
    {
        title: $localize`Enviar alerta`,
        value: ivrWidgetType.sendAlert,
        description: $localize`Adiciona uma mensagem de alerta ao atendimento, essa mensagem só pode ser vista pelo atendente.`,
        availableAt: AvailableAt.ALL
    },
    {
        title: $localize`Cancelar mensagem`,
        value: ivrWidgetType.cancelMessage,
        description: $localize`Cancela o envio de uma mensagem.`,
        availableAt: AvailableAt.AUTOMATION
    },
    {
        title: $localize`Remover gatilho`,
        value: ivrWidgetType.removeTrigger,
        description: $localize`Remove um gatilho específico do atendimento.`,
        availableAt: AvailableAt.ALL
    },
    {
        title: $localize`Bloquear atendimento`,
        value: ivrWidgetType.lock,
        description: $localize`Bloqueia o atendimento para que somente o atendente para o qual está bloqueado possa interagir com ele.`,
        availableAt: AvailableAt.ALL
    },
    {
        title: $localize`Aguardar mensagem`,
        value: ivrWidgetType.waitMessage,
        description: $localize`Interrompe o fluxo até que uma mensagem seja recebida do cliente.`,
        availableAt: AvailableAt.IVR
    },
    {
        title: $localize`Executar automação`,
        value: ivrWidgetType.execAutomation,
        description: $localize`Executa uma automação.`,
        availableAt: AvailableAt.ALL
    },
    {
        title: $localize`Editar contato`,
        value: ivrWidgetType.editContact,
        description: $localize`Editar um contato na base de dados.`,
        availableAt: AvailableAt.ALL
    },
    {
        title: $localize`Abrir atendimento`,
        value: ivrWidgetType.openChat,
        description: $localize`Inicia um novo atendimento com um cliente quando a fila for com conexão não oficial (WAMD).`,
        availableAt: AvailableAt.AUTOMATION
    },
    {
        title: $localize`Buscar atendimento`,
        value: ivrWidgetType.searchChat,
        description: $localize`Busca um atendimento dentre os atendimentos abertos no momento e o disponibiliza em uma variável.`,
        availableAt: AvailableAt.AUTOMATION
    },
    {
        title: $localize`Abrir atendimento (Cloud)`,
        value: ivrWidgetType.openChatCloud,
        description: $localize`Inicia um novo atendimento com um cliente quando a fila for uma fila oficial.`,
        availableAt: AvailableAt.AUTOMATION
    },
    {
        title: $localize`Enviar e-mail`,
        value: ivrWidgetType.sendMail,
        description: $localize`Envia um e-mail para o cliente.`,
        availableAt: AvailableAt.ALL
    },
    {
        title: $localize`Enviar notificação`,
        value: ivrWidgetType.sendNotification,
        description: $localize`Envia uma notificação para um ou mais usuários do sistema.`,
        availableAt: AvailableAt.ALL
    },
    {
        title: $localize`Criar tarefa`,
        value: ivrWidgetType.createTask,
        description: $localize`Cria uma nova tarefa para um ou mais usuários do sistema.`,
        availableAt: AvailableAt.ALL
    },
    {
        title: $localize`Adicionar oportunidade`,
        value: ivrWidgetType.addOpportunity,
        description: $localize`Adiciona uma nova oportunidade em um funil do CRM do sistema.`,
        availableAt: AvailableAt.ALL
    },
    {
        title: $localize`Ganhar oportunidade`,
        value: ivrWidgetType.winOpportunity,
        description: $localize`Ganha uma oportunidade no CRM do sistema.`,
        availableAt: AvailableAt.ALL
    },
    {
        title: $localize`Perder oportunidade`,
        value: ivrWidgetType.loseOpportunity,
        description: $localize`Perde uma oportunidade no CRM do sistema.`,
        availableAt: AvailableAt.ALL
    },
    {
        title: $localize`Editar oportunidade`,
        value: ivrWidgetType.editOpportunity,
        description: $localize`Edita uma oportunidade no CRM do sistema.`,
        availableAt: AvailableAt.ALL
    },
    {
        title: $localize`Clonar oportunidade`,
        value: ivrWidgetType.cloneOpportunity,
        description: $localize`Clona uma oportunidade no CRM do sistema.`,
        availableAt: AvailableAt.ALL
    },
    {
        title: $localize`Mover oportunidade`,
        value: ivrWidgetType.moveOpportunity,
        description: $localize`Move uma oportunidade para outra etapa do funil no CRM do sistema.`,
        availableAt: AvailableAt.ALL
    },
    {
        title: $localize`Buscar oportunidade`,
        value: ivrWidgetType.searchOpportunity,
        description: $localize`Busca uma oportunidade no CRM do sistema e a disponibiliza em uma variável.`,
        availableAt: AvailableAt.ALL
    },
    {
        title: $localize`Transferir oportunidade`,
        value: ivrWidgetType.transferOpportunity,
        description: $localize`Transfere a responsabilidade de uma oportunidade para um usuário ou grupo de usuários do sistema.`,
        availableAt: AvailableAt.ALL
    },
    {
        title: $localize`Inserir arquivo na oportunidade`,
        value: ivrWidgetType.insertFileOpportunity,
        description: $localize`Associa um arquivo a uma oportunidade no CRM do sistema.`,
        availableAt: AvailableAt.ALL
    },
    {
        title: $localize`Exibir formulário`,
        value: ivrWidgetType.showForm,
        description: $localize`Exibe um formulário para o atendente preencher.`,
        availableAt: AvailableAt.AUTOMATION
    },
    {
        title: $localize`Limpar tarefas da oportunidade`,
        value: ivrWidgetType.clearOpportunityTasks,
        description: $localize`Limpa todas as tarefas associadas a uma oportunidade no CRM do sistema.`,
        availableAt: AvailableAt.ALL
    },
    {
        title: $localize`Congelar oportunidade`,
        value: ivrWidgetType.freezeOpportunity,
        description: $localize`Congela uma oportunidade no CRM do sistema.`,
        availableAt: AvailableAt.ALL
    },
    {
        title: $localize`Descongelar oportunidade`,
        value: ivrWidgetType.unfreezeOpportunity,
        description: $localize`Descongela uma oportunidade no CRM do sistema.`,
        availableAt: AvailableAt.ALL
    },
    {
        title: $localize`Compartilhar contato`,
        value: ivrWidgetType.shareContact,
        description: $localize`Compartilha um contato cadastrado no sistema com o cliente.`,
        availableAt: AvailableAt.ALL
    },
    {
        title: $localize`Remover todos os gatilhos`,
        value: ivrWidgetType.removeAllTriggers,
        description: $localize`Remove todos os gatilhos do atendimento.`,
        availableAt: AvailableAt.ALL
    },
    {
        title: $localize`Reabrir oportunidade`,
        value: ivrWidgetType.reopenOpportunity,
        description: $localize`Reabre uma oportunidade já encerrada (ganhada ou perdida) no CRM do sistema.`,
        availableAt: AvailableAt.ALL
    },
    {
        title: $localize`Adicionar dado persistente`,
        value: ivrWidgetType.addPersistent,
        description: $localize`Adiciona um dado persistente ao banco de dados do sistema.`,
        availableAt: AvailableAt.ALL
    },
    {
        title: $localize`Buscar dado persistente`,
        value: ivrWidgetType.searchPersistent,
        description: $localize`Busca um dado persistente no banco de dados do sistema e o disponibiliza em uma variável.`,
        availableAt: AvailableAt.ALL
    },
    {
        title: $localize`Remover dado persistente`,
        value: ivrWidgetType.removePersistent,
        description: $localize`Remove um dado persistente do banco de dados do sistema.`,
        availableAt: AvailableAt.ALL
    },
    {
        title: $localize`Responder comentário`,
        value: ivrWidgetType.replyComment,
        description: $localize`Responde um comentário de um cliente recebido em uma fila IG.`,
        availableAt: AvailableAt.ALL
    },
    {
        title: $localize`Buscar instância`,
        value: ivrWidgetType.searchInstance,
        description: $localize`Busca uma instância no sistema e a disponibiliza em uma variável.`,
        availableAt: AvailableAt.ALL
    },
    {
        title: $localize`Criar instância`,
        value: ivrWidgetType.createInstance,
        description: $localize`Cria uma nova instância no sistema.`,
        availableAt: AvailableAt.ALL
    },
    {
        title: $localize`Editar detalhes de contato da instância`,
        value: ivrWidgetType.editInstanceContactDetails,
        description: $localize`Edita os detalhes de contato de uma instância no sistema.`,
        availableAt: AvailableAt.ALL
    },
    {
        title: $localize`Marcar instância para exclusão`,
        value: ivrWidgetType.markInstanceForExclusion,
        description: $localize`Marca uma instância para exclusão.`,
        availableAt: AvailableAt.ALL
    },
    {
        title: $localize`Reativar instância`,
        value: ivrWidgetType.reactivateInstance,
        description: $localize`Reativa uma instância marcada para exclusão.`,
        availableAt: AvailableAt.ALL
    },
    {
        title: $localize`Bloquear instância`,
        value: ivrWidgetType.blockInstance,
        description: $localize`Bloqueia uma instância.`,
        availableAt: AvailableAt.ALL
    },
    {
        title: $localize`Desbloquear instância`,
        value: ivrWidgetType.unblockInstance,
        description: $localize`Desbloqueia uma instância.`,
        availableAt: AvailableAt.ALL
    },
    {
        title: $localize`Reiniciar instância`,
        value: ivrWidgetType.restartInstance,
        description: $localize`Reinicia uma instância.`,
        availableAt: AvailableAt.ALL
    },
    {
        title: $localize`Reiniciar container da instância`,
        value: ivrWidgetType.restartInstanceContainer,
        description: $localize`Reinicia o container de uma instância.`,
        availableAt: AvailableAt.ALL
    },
    {
        title: $localize`Atualizar instância`,
        value: ivrWidgetType.updateInstance,
        description: $localize`Atualiza os dados de uma instância.`,
        availableAt: AvailableAt.ALL
    },
    {
        title: $localize`Obter fatura da instância`,
        value: ivrWidgetType.getInstanceBill,
        description: $localize`Não utilizar`,
        availableAt: AvailableAt.ALL
    },
    {
        title: $localize`Enviar template`,
        value: ivrWidgetType.sendTemplate,
        description: $localize`Envia um template pré aprovado do whatsapp para o cliente.`,
        availableAt: AvailableAt.ALL
    },
    {
        title: $localize`Marcar tarefa como concluída`,
        value: ivrWidgetType.markTaskAsDone,
        description: $localize`Marca uma tarefa como concluída.`,
        availableAt: AvailableAt.ALL
    },
    {
        title: $localize`Adicionar à lista de espera`,
        value: ivrWidgetType.addToWaitingList,
        description: $localize`Adiciona o cliente a uma lista de espera da fila.`,
        availableAt: AvailableAt.ALL
    },
    {
        title: $localize`Remover da lista de espera`,
        value: ivrWidgetType.removeFromWaitingList,
        description: $localize`Remove o cliente da lista de espera da fila.`,
        availableAt: AvailableAt.ALL
    },
    {
        title: $localize`Adicionar cartão de informação`,
        value: ivrWidgetType.addInformationCard,
        description: $localize`Adiciona um cartão de informação ao atendimento.`,
        availableAt: AvailableAt.ALL
    },
    {
        title: $localize`Remover cartão de informação`,
        value: ivrWidgetType.removeInformationCard,
        description: $localize`Remove um cartão de informação do atendimento.`,
        availableAt: AvailableAt.ALL
    },
    {
        title: $localize`Exibir notificação rápida`,
        value: ivrWidgetType.showSnackNotification,
        description: $localize`Exibe uma notificação rápida para o atendente.`,
        availableAt: AvailableAt.ALL
    },
    {
        title: $localize`Adicionar cartão de informação à mensagem`,
        value: ivrWidgetType.addInformationCardToMessage,
        description: $localize`Adiciona um cartão de informação a uma mensagem.`,
        availableAt: AvailableAt.ALL
    },
    {
        title: $localize`Remover cartão de informação da mensagem`,
        value: ivrWidgetType.removeInformationCardFromMessage,
        description: $localize`Remove um cartão de informação de uma mensagem.`,
        availableAt: AvailableAt.ALL
    },
    {
        title: $localize`Enviar flow`,
        value: ivrWidgetType.sendFlow,
        description: $localize`Envia um flow do whatsapp para o cliente.`,
        availableAt: AvailableAt.ALL
    },
    {
        title: $localize`Limpar dados do flow da mensagem`,
        value: ivrWidgetType.clearFlowDataFromMessage,
        description: $localize`Limpa os dados de uma resposta de um flow do whatsapp de uma mensagem.`,
        availableAt: AvailableAt.ALL
    },
    {
        title: $localize`Assistente de IA`,
        value: ivrWidgetType.aiAssistant,
        description: $localize`Associa um assistente virtual por IA ao atendimento.`,
        availableAt: AvailableAt.IVR
    },
    {
        title: $localize`Adicionar contexto ao assistente de IA`,
        value: ivrWidgetType.aiAddContextToAssistant,
        description: $localize`Adiciona informação ao contexto ao assistente virtual por IA.`,
        availableAt: AvailableAt.ALL
    },
    {
        title: $localize`Processar arquivo por IA`,
        value: ivrWidgetType.aiProcessFile,
        description: $localize`Processa uma mensagem ou arquivo por uma LLM.`,
        availableAt: AvailableAt.ALL
    },
    {
        title: $localize`Parar assistente de IA`,
        value: ivrWidgetType.aiStopAssistant,
        description: $localize`Para a execução do assistente virtual por IA.`,
        availableAt: AvailableAt.AUTOMATION
    },
    {
        title: $localize`Parar mensagem do assistente de IA`,
        value: ivrWidgetType.aiStopMessage,
        description: $localize`Impede o envio de uma mensagem pelo assistente virtual por IA.`,
        availableAt: AvailableAt.AUTOMATION
    }
];

export const AGENT_TYPE = [
    {
        title: $localize`Agente`, value: 2
    },
    {
        title: $localize`Supervisor`, value: 1
    },
    {
        title: $localize`Administrador`, value: 0
    }
]

export const FORCE_ANSWER = [
    {
        title: $localize`Não`, value: 0
    },
    {
        title: $localize`:Chamadas recebidas:Só recebidas`, value: 2
    },
    {
        title: $localize`:Chamadas realizadas:Só realizadas`, value: 3
    },
    {
        title: $localize`Todas`, value: 4
    }
]

export const AGENT_VIEW = [
    {
        title: $localize`Cartões`, value: 0
    },
    {
        title: $localize`Tabela`, value: 1
    }
]

export const ITEM_STATUS = [
    {
        title: $localize`Ativo`, value: 1
    },
    {
        title: $localize`Inativo`, value: 0
    }
]

export const YES_NO = [
    {
        title: $localize`Sim`, value: 1
    },
    {
        title: $localize`Não`, value: 0
    }
]

export const HOUSEKEEPING_FREQ = [
    {
        title: $localize`Desabilitar`, value: 0
    },
    {
        title: $localize`Habilitar 1 vez por dia`, value: 1
    },
    {
        title: $localize`Habilitar 1 vez por semana`, value: 2
    }
]

export const PERIOD = [
    {
        title: $localize`Hoje`, value: 1
    },
    {
        title: $localize`Esta semana`, value: 2
    },
    {
        title: $localize`Este mês`, value: 3
    },
    {
        title: $localize`Personalizado`, value: 4
    }
]

export const ORDER_BY = [
    {
        title: $localize`Ordenar por nome`, value: 1
    },
    {
        title: $localize`Ordenar por número`, value: 2
    }
]

export const REASON_ACTION = [
    {
        title: $localize`Bloquear agente`, value: 0
    },
    {
        title: $localize`Alertar supervisor`, value: 1
    }
];


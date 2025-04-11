/**
 * Created by filipe on 08/10/16.
 */

import {Injectable} from "@angular/core";
import {DomSanitizer} from "@angular/platform-browser";

@Injectable({providedIn: 'root'})
export class HelpService {

    helpText = {
        'client-show-chats': $localize`Nesse modo você verá <b>todas as mensagens</b> trocadas com esse cliente pela mesma fila, em ordem cronológica, independente de em qual atendimento elas aconteceram.`,
        'show-chat-messages': $localize`Nesse modo você verá as trocadas com esse cliente neste atendimento em específico. Você pode rolar para cima na conversa para ver as mensagens de atendimentos anteriores a esse, porém não conseguirá ver mensagens trocadas em atendimentos posteriores, se houverem.`,
        'click-to-go-to-automation': $localize`Você pode pressionar <b>CTRL</b> no seu teclado e clicar neste elemento para acessar a automação / ura configurada.`,
        'disable-signature': $localize`Desabilita a adição automática do nome do agente ao cabeçalho da mensagem. <br><br>
Útil para envio de mensagens cujo conteúdo deve ser copiado pelo cliente, como códigos de barras, links, chave pix, etc.<br><br>
Desabilitar a assinatura funciona apenas para uma única mensagem, e a assinatura é reativada automaticamente após o envio da mensagem.`,
        'vartype-number': $localize`Variável numérica.`,
        'vartype-string': $localize`Variável de texto.`,
        'vartype-any': $localize`Variável que pode receber qualquer tipo de dado.`,
        'vartype-date': $localize`Variável de data. O momentjs está disponível no elemento de javascript para facilitar a manipulação de datas.`,
        'vartype-boolean': $localize`Variável booleana. Pode assumir os valores true ou false.`,
        'vartype-list': $localize`Variável de lista. Pode conter múltiplos elementos, de qualquer tipo, inclusive objetos ou outras listas,
acessíveis através de um índice que começa em 0, logo, uma lista com 10 elementos terá os índices de 0 a 9.<br><br>
<b>Exemplo:</b><br>
Para acessar o primeiro elemento da lista, use <code>{{variavel_lista[0]}}</code>, para o segundo, use
<code>{{variavel_lista[1]}}</code> e assim sucessivamente.<br><br>
<b>Exemplo prático:</b>
Para acessar o id do primeiro contato associado a uma oportunidade:
<code>{{opportunity_contacts_list[0].contact_id}}</code>.`,
        'crm-reorder': $localize`Essa função reorganiza as oportunidades já presentes na etapa. Novas oportunidades serão adicionadas
                    sempre ao topo. Você pode manualmente reorganizar as oportunidades arrastando e soltando.`,
        'crm-abs-sum': $localize`Representa a soma total do valor de todas as oportunidades da etapa, sem considerar suas probabilidades de fechamento.`,
        'crm-sum': $localize`Representa e expectativa de valor ganho, com base no valor e probabilidade de cada oportunidade. Segue a fórmula <b>soma(valor * probabilidade)</b> para as oportunidades da etapa.`,
        'message': $localize`Envia uma mensagem para o cliente. A mensagem pode ou não conter um arquivo. Pode-se utilizar variáveis, por exemplo: <code>Olá {{chat_client_name}}, tudo bem?</code>.
    <br><br>
    <span class="s10">
        <b>Exemplos de casos de uso:</b>
        <ul>
            <li>Enviar uma saudação inicial ao cliente.</li>
            <li>Enviar uma mensagem de agradecimento.</li>
            <li>Enviar informações sobre o andamento do atendimento.</li>
        </ul>
    </span>`,
        'question': $localize`Envia uma pergunta para o cliente e aguarda a resposta. A resposta do cliente é salva em uma variável para uso posterior.
    <br><br>
    <span class="s10">
        <b>Exemplos de casos de uso:</b>
        <ul>
            <li>Solicitar informações do cliente, como CPF, e-mail, número de pedido, etc.</li>
            <li>Realizar pesquisas de satisfação.</li>
            <li>Coletar dados para cadastro.</li>
            <li>Confirmar informações com o cliente.</li>
        </ul>
        <b>Exemplo:</b> Para perguntar o nome do cliente e salvar na variável "nome_cliente": configure a pergunta para "Qual o seu nome?" e a variável para "nome_cliente".
    </span>`,
        'options': $localize`Envia uma mensagem com múltiplas opções para o cliente escolher. O fluxo seguirá conforme a opção selecionada pelo cliente. Pode ser texto (disponível em todas as filas), botões ou lista (somente em filas específicas).
    <br><br>
    <span class="s10">
        <b>Exemplos de casos de uso:</b>
        <ul>
            <li>Criar menus de atendimento.</li>
            <li>Oferecer opções de produtos ou serviços.</li>
            <li>Direcionar o cliente para o setor correto.</li>
            <li>Realizar enquetes rápidas.</li>
        </ul>
        <b>Exemplo:</b> Para criar um menu com opções "1 - Vendas", "2 - Suporte", "3 - Financeiro": configure cada opção com o texto correspondente e selecione o tipo de envio. Se texto, as opções devem fazer parte da mensagem.
    </span>`,
        'info': $localize`Adiciona uma mensagem informativa ao atendimento, visível apenas para o atendente. Não envia mensagem ao cliente.
    <br><br>
    <span class="s10">
        <b>Exemplos de casos de uso:</b>
        <ul>
            <li>Registrar informações relevantes sobre o atendimento.</li>
            <li>Adicionar lembretes para o atendente.</li>
            <li>Incluir instruções para o atendente.</li>
            <li>Documentar decisões tomadas durante o atendimento.</li>
        </ul>
    </span>`,
        'terminate': $localize`Encerra o atendimento atual. Pode ser configurado para enviar mensagem de encerramento, motivo, observações e agendar reabertura.
    <br><br>
    <span class="s10">
        <b>Exemplos de casos de uso:</b>
        <ul>
            <li>Finalizar atendimentos concluídos.</li>
            <li>Encerrar atendimentos por inatividade do cliente.</li>
        </ul>
    </span>`,
        'transfer': $localize`Transfere o atendimento para uma fila, atendente específico ou URA.
    <br><br>
    <span class="s10">
        <b>Exemplos de casos de uso:</b>
        <ul>
            <li>Direcionar o cliente para o setor responsável.</li>
            <li>Transferir o atendimento para um atendente mais qualificado.</li>
            <li>Encaminhar o atendimento para outra URA para continuar o fluxo.</li>
        </ul>
    </span>`,
        'marker': $localize`Adiciona uma etiqueta ao atendimento (ex: "Urgente", "Pendente"). Serve para classificar, priorizar e identificar visualmente o estado do atendimento.
    <br><br>
    <span class="s10">
        <b>Exemplos de casos de uso:</b>
        <ul>
            <li>Marcar atendimentos que precisam de atenção especial.</li>
            <li>Identificar atendimentos com problemas.</li>
            <li>Classificar atendimentos por assunto.</li>
        </ul>
    </span>`,
        'timetable': $localize`Direciona o fluxo com base na data e hora. Permite definir diferentes fluxos para diferentes horários e dias da semana.
    <br><br>
    <span class="s10">
        <b>Exemplos de casos de uso:</b>
        <ul>
            <li>Definir horários de atendimento.</li>
            <li>Criar fluxos diferentes para dias úteis e fins de semana.</li>
            <li>Encaminhar o cliente para mensagens de fora do horário de expediente.</li>
        </ul>
    </span>`,
        'url': $localize`Envia um botão de ação com uma URL ou dado para ser copiado (disponível somente em filas WA Cloud API e Web Chat).
    <br><br>
    <span class="s10">
        <b>Exemplos de casos de uso:</b>
        <ul>
            <li>Enviar links para páginas externas.</li>
            <li>Enviar links para documentos ou arquivos.</li>
            <li>Enviar códigos de rastreamento ou cupons de desconto.</li>
            <li>Permitir que o cliente copie informações com um clique. (Ex: copy://{{protocolo}})</li>
        </ul>
    </span>`,
        'varCondition': $localize`Direciona o fluxo com base no valor de uma variável. Permite criar condições lógicas (ex: =, !=, >, <, contém).
    <br><br>
    <span class="s10">
        <b>Exemplos de casos de uso:</b>
        <ul>
            <li>Verificar se o cliente é VIP, segundo os dados do contato.</li>
            <li>Verificar se o cliente tem débitos pendentes.</li>
            <li>Verificar a idade do cliente.</li>
            <li>Criar fluxos diferentes com base nas respostas do cliente.</li>
        </ul>
    </span>`,
        'request': $localize`Faz uma requisição HTTP para um servidor externo e salva o resultado em variáveis.
    <br><br>
    <span class="s10">
        <b>Exemplos de casos de uso:</b>
        <ul>
            <li>Consultar informações em sistemas externos.</li>
            <li>Integrar com APIs de terceiros.</li>
            <li>Enviar dados para outros sistemas.</li>
            <li>Obter dados em tempo real (ex: cotação de moedas).</li>
        </ul>
    </span>`,
        'protocol': $localize`Gera ou associa um protocolo ao atendimento.
    <br><br>
    <span class="s10">
        <b>Exemplos de casos de uso:</b>
        <ul>
            <li>Gerar números de protocolo para controle e rastreamento.</li>
            <li>Informar o protocolo ao cliente.</li>
        </ul>
    </span>`,
        'searchContact': $localize`Busca um contato na base de dados e disponibiliza os dados em uma variável. Pode-se associar o contato encontrado ao atendimento. Um busca pelo identificador do cliente (número de telefone, usuário ou e-mail conforme a fila) já acontece automaticamente no início de todos os atendimentos. Esse elemento deve ser utilizado quando se deseja buscar um contato por outro campo.
    <br><br>
    <span class="s10">
        <b>Exemplos de casos de uso:</b>
        <ul>
            <li>Identificar o cliente pelo número de telefone, e-mail ou documento.</li>
            <li>Obter informações do cliente antes de iniciar o atendimento.</li>
            <li>Atualizar o cadastro do cliente.</li>
        </ul>
    </span>`,
        'addContact': $localize`Adiciona um novo contato à base de dados. Pode associar o contato criado ao atendimento.
    <br><br>
    <span class="s10">
        <b>Exemplos de casos de uso:</b>
        <ul>
            <li>Cadastrar novos clientes.</li>
            <li>Coletar dados de contato durante o atendimento.</li>
        </ul>
    </span>`,
        'editContact': $localize`Edita um contato existente na base de dados.
    <br><br>
    <span class="s10">
        <b>Exemplos de casos de uso:</b>
        <ul>
            <li>Atualizar informações do cliente.</li>
            <li>Corrigir dados incorretos.</li>
        </ul>
    </span>`,
        'shareContact': $localize`Compartilha os dados de um contato cadastrado com o cliente, como uma mensagem.
    <br><br>
    <span class="s10">
        <b>Exemplos de casos de uso:</b>
        <ul>
            <li>Compartilhar o contato de um vendedor.</li>
            <li>Compartilhar o contato de um suporte técnico.</li>
        </ul>
    </span>`,
        'userAvailable': $localize`Verifica o status de um atendente (online, ocupado, etc.) e disponibiliza o resultado em uma variável.
    <br><br>
    <span class="s10">
        <b>Exemplos de casos de uso:</b>
        <ul>
            <li>Verificar se um atendente específico está disponível.</li>
        </ul>
    </span>`,
        'sleep': $localize`Pausa o fluxo por um tempo determinado (em segundos).
    <br><br>
    <span class="s10">
        <b>Exemplos de casos de uso:</b>
        <ul>
            <li>Aguardar um tempo antes de enviar uma mensagem.</li>
            <li>Criar intervalos entre ações.</li>
            <li>Simular tempo de processamento.</li>
        </ul>
    </span>`,
        'setTriggers': $localize`Aplica um conjunto de gatilhos ao atendimento.
    <br><br>
    <span class="s10">
        <b>Exemplos de casos de uso:</b>
        <ul>
            <li>Configurar gatilhos para ações específicas (ex: envio de mensagem, encerramento do atendimento).</li>
        </ul>
    </span>`,
        'newVar': $localize`Cria uma nova variável com um valor inicial.
    <br><br>
    <span class="s10">
        <b>Exemplos de casos de uso:</b>
        <ul>
            <li>Inicializar variáveis para uso em outros elementos.</li>
            <li>Armazenar valores temporários, como chaves de APIs externas.</li>
        </ul>
    </span>`,
        'jscode': $localize`Executa um código JavaScript. Permite manipular variáveis e realizar operações complexas. (Acesso restrito, sem acesso a recursos externos).
    <br><br>
    <span class="s10">
        <b>Exemplos de casos de uso:</b>
        <ul>
            <li>Realizar cálculos complexos.</li>
            <li>Manipular strings e datas.</li>
            <li>Criar lógicas personalizadas.</li>
        </ul>
        <b>Exemplo:</b> <code>vars.resultado = vars.valor1 + vars.valor2;</code>
    </span>`,
        'sendAlert': $localize`Envia um alerta para um ou mais usuários do sistema.
    <br><br>
    <span class="s10">
        <b>Exemplos de casos de uso:</b>
        <ul>
            <li>Notificar atendentes sobre atendimentos urgentes.</li>
            <li>Alertar supervisores sobre problemas.</li>
        </ul>
    </span>`,
        'cancelMessage': $localize`Cancela o envio de uma mensagem (usado em automações de gatilho de mensagem).
    <br><br>
    <span class="s10">
        <b>Exemplos de casos de uso:</b>
        <ul>
            <li>Impedir o envio de mensagens com conteúdo ofensivo.</li>
            <li>Interromper o envio de mensagens durante processamentos específicos de fluxos de automação.</li>
        </ul>
    </span>`,
        'removeTrigger': $localize`Remove o gatilho que disparou a automação.
    <br><br>
    <span class="s10">
        <b>Exemplo de caso de uso:</b> Utilizado após a execução de gatilhos para evitar execuções repetidas ou em loop.
    </span>`,
        'lock': $localize`Bloqueia o atendimento para um atendente específico.
    <br><br>
    <span class="s10">
        <b>Exemplos de casos de uso:</b>
        <ul>
            <li>Garantir que um atendente específico receba o atendimento.</li>
            <li>Evitar que outros atendentes puxem um atendimento aguardando na fila.</li>
        </ul>
    </span>`,
        'waitMessage': $localize`Interrompe o fluxo até que o cliente envie uma nova mensagem.
    <br><br>
    <span class="s10">
        <b>Exemplos de casos de uso:</b>
        <ul>
            <li>Aguardar a resposta do cliente antes de continuar o fluxo.</li>
            <li>Criar fluxos de conversação.</li>
        </ul>
    </span>`,
        'execAutomation': $localize`Executa uma automação específica. Ao final da execução, retorna ao fluxo original.
    <br><br>
    <span class="s10">
        <b>Exemplos de casos de uso:</b>
        <ul>
            <li>Reutilizar lógicas de automação em diferentes fluxos.</li>
            <li>Criar sub-rotinas de automação.</li>
        </ul>
    </span>`,
        'openChat': $localize`Abre um novo atendimento com um cliente (somente para filas WAMD).
    <br><br>
    <span class="s10">
        <b>Exemplo de caso de uso:</b> Iniciar um novo atendimento a partir de uma automação.
    </span>`,
        'searchChat': $localize`Busca um atendimento aberto e o associa ao fluxo corrente (somente automações).
    <br><br>
    <span class="s10">
        <b>Exemplos de casos de uso:</b>
        <ul>
            <li>Continuar um atendimento existente a partir de uma automação.</li>
            <li>Encontrar o atendimento que iniciou um processo externo, que disparou uma captura de webhook (Ex. confirmação de pagamento)</li>
        </ul>
    </span>`,
        'openChatCloud': $localize`Abre um novo atendimento com um cliente (somente para filas WA Cloud API). Envia um template pré-aprovado.
    <br><br>
    <span class="s10">
        <b>Exemplo de caso de uso:</b> Iniciar um novo atendimento usando a API oficial do WhatsApp.
    </span>`,
        'sendMail': $localize`Envia um e-mail para o cliente usando um modelo pré-cadastrado.
    <br><br>
    <span class="s10">
        <b>Exemplos de casos de uso:</b>
        <ul>
            <li>Enviar e-mails de confirmação.</li>
            <li>Enviar newsletters.</li>
            <li>Enviar boletos ou faturas.</li>
        </ul>
    </span>`,
        'sendNotification': $localize`Envia uma notificação para um ou mais usuários do sistema.
    <br><br>
    <span class="s10">
        <b>Exemplos de casos de uso:</b>
        <ul>
            <li>Notificar atendentes sobre novos atendimentos.</li>
            <li>Alertar supervisores sobre eventos importantes.</li>
        </ul>
    </span>`,
        'createTask': $localize`Cria uma nova tarefa no sistema.
    <br><br>
    <span class="s10">
        <b>Exemplos de casos de uso:</b>
        <ul>
            <li>Criar tarefas para atendentes.</li>
            <li>Agendar ligações ou reuniões.</li>
        </ul>
    </span>`,
        'addOpportunity': $localize`Adiciona uma nova oportunidade no CRM.
    <br><br>
    <span class="s10">
        <b>Exemplos de casos de uso:</b>
        <ul>
            <li>Registrar novas oportunidades de venda.</li>
            <li>Registrar novos itens em processos de automação usando o CRM.</li>
        </ul>
    </span>`,
        'winOpportunity': $localize`Marca uma oportunidade como ganha.
    <br><br>
    <span class="s10">
        <b>Exemplo de caso de uso:</b> Registrar o fechamento de uma venda.
    </span>`,
        'loseOpportunity': $localize`Marca uma oportunidade como perdida.
    <br><br>
    <span class="s10">
        <b>Exemplo de caso de uso:</b> Registrar a perda de uma venda e o motivo.
    </span>`,
        'editOpportunity': $localize`Edita uma oportunidade existente.
    <br><br>
    <span class="s10">
        <b>Exemplos de casos de uso:</b>
        <ul>
            <li>Atualizar informações da oportunidade.</li>
            <li>Alterar o valor ou a probabilidade de fechamento.</li>
        </ul>
    </span>`,
        'cloneOpportunity': $localize`Clona uma oportunidade existente.
    <br><br>
    <span class="s10">
        <b>Exemplo de caso de uso:</b> Criar uma nova oportunidade a partir de uma existente no mesmo funil ou em um funil diferente.
    </span>`,
        'moveOpportunity': $localize`Move uma oportunidade para outra etapa do funil.
    <br><br>
    <span class="s10">
        <b>Exemplo de caso de uso:</b> Atualizar o estágio da negociação.
    </span>`,
        'searchOpportunity': $localize`Busca uma oportunidade no CRM.
    <br><br>
    <span class="s10">
        <b>Exemplos de casos de uso:</b>
        <ul>
            <li>Obter informações da oportunidade.</li>
            <li>Verificar o status da negociação.</li>
        </ul>
    </span>`,
        'transferOpportunity': $localize`Transfere a responsabilidade de uma oportunidade para outro usuário.
    <br><br>
    <span class="s10">
        <b>Exemplo de caso de uso:</b> Transferir a oportunidade para um vendedor mais experiente.
    </span>`,
        'insertFileOpportunity': $localize`Associa um arquivo a uma oportunidade.
    <br><br>
    <span class="s10">
        <b>Exemplos de casos de uso:</b>
        <ul>
            <li>Anexar propostas ou contratos.</li>
        </ul>
    </span>`,
        'clearOpportunityTasks': $localize`Limpa todas as tarefas associadas a uma oportunidade.
    <br><br>
    <span class="s10">
        <b>Exemplo de caso de uso:</b> Excluir tarefas de uma oportunidade cancelada.
    </span>`,
        'freezeOpportunity': $localize`Congela uma oportunidade.
     <br><br>
    <span class="s10">
        <b>Exemplo de caso de uso:</b> Ocultar temporariamente uma oportunidade da visualização.
    </span>`,
        'unfreezeOpportunity': $localize`Descongela uma oportunidade.
     <br><br>
    <span class="s10">
        <b>Exemplo de caso de uso:</b> Tornar visível novamente uma oportunidade congelada.
    </span>`,
        'reopenOpportunity': $localize`Reabre uma oportunidade fechada (ganha ou perdida).
     <br><br>
    <span class="s10">
        <b>Exemplo de caso de uso:</b> Retomar uma negociação que foi interrompida.
    </span>`,
        'showForm': $localize`Exibe um formulário para o atendente preencher (somente automações).
    <br><br>
    <span class="s10">
        <b>Exemplos de casos de uso:</b>
        <ul>
            <li>Coletar informações adicionais durante o atendimento.</li>
            <li>Executar integrações com softwares externos que necessitam de informação adicional.</li>
        </ul>
    </span>`,
        'removeAllTriggers': $localize`Remove todos os gatilhos associados ao atendimento.
      <br><br>
    <span class="s10">
        <b>Exemplo de caso de uso:</b> Cancelar gatilhos previamente configurados.
    </span>`,
        'addPersistent': $localize`Adiciona um valor persistente ao banco de dados (acessível globalmente).
      <br><br>
    <span class="s10">
        <b>Exemplos de casos de uso:</b>
        <ul>
            <li>Armazenar contadores.</li>
            <li>Armazenar chaves de autenticação dinâmicas.</li>
        </ul>
    </span>`,
        'searchPersistent': $localize`Busca um valor persistente no banco de dados.
      <br><br>
    <span class="s10">
        <b>Exemplo de caso de uso:</b> Recuperar valores armazenados pelo elemento addPersistent.
    </span>`,
        'removePersistent': $localize`Remove um valor persistente do banco de dados.
      <br><br>
    <span class="s10">
        <b>Exemplo de caso de uso:</b> Excluir valores persistentes que não são mais necessários.
    </span>`,
        'replyComment': $localize`Responde a um comentário recebido por uma fila IG. Pode-se utilizar variáveis, por exemplo: <code>Olá {{message_client_name}}, agradecemos o contato.</code> <br><br> <span class="s10"><b>Exemplo de caso de uso:</b> Em filas IG, o elemento de envio de mensagem sempre enviar uma mensagem ao direct do cliente, então, caso o cliente faça um comentário e deseje enviar uma resposta pública ao comentário, esse elemento deve ser utilizado.</span>`,
        'searchInstance': $localize`Busca uma instância de cliente (somente para parceiros).
      <br><br>
    <span class="s10">
        <b>Exemplo de caso de uso:</b> Obter informações de uma instância de cliente.
    </span>`,
        'createInstance': $localize`Cria uma nova instância de cliente (somente para parceiros).
      <br><br>
    <span class="s10">
        <b>Exemplo de caso de uso:</b> Criar uma nova instância para um novo cliente.
    </span>`,
        'editInstanceContactDetails': $localize`Edita os dados de contato de uma instância de cliente (somente para parceiros).
      <br><br>
    <span class="s10">
        <b>Exemplo de caso de uso:</b> Atualizar informações de contato da instância.
    </span>`,
        'markInstanceForExclusion': $localize`Marca uma instância para exclusão (somente para parceiros).
      <br><br>
    <span class="s10">
        <b>Exemplo de caso de uso:</b> Iniciar o processo de cancelamento de uma instância.
    </span>`,
        'reactivateInstance': $localize`Reativa uma instância marcada para exclusão (somente para parceiros).
      <br><br>
    <span class="s10">
        <b>Exemplo de caso de uso:</b> Cancelar o processo de exclusão de uma instância.
    </span>`,
        'blockInstance': $localize`Bloqueia uma instância (somente para parceiros).
      <br><br>
    <span class="s10">
        <b>Exemplo de caso de uso:</b> Bloquear o acesso de uma instância por inadimplência, por exemplo.
    </span>`,
        'unblockInstance': $localize`Desbloqueia uma instância (somente para parceiros).
      <br><br>
    <span class="s10">
        <b>Exemplo de caso de uso:</b> Liberar o acesso de uma instância bloqueada.
    </span>`,
        'restartInstance': $localize`Reinicia o serviço de uma instância (somente para parceiros).
      <br><br>
    <span class="s10">
        <b>Exemplo de caso de uso:</b> Resolver problemas de acesso de uma instância. (Reinício rápido)
    </span>`,
        'restartInstanceContainer': $localize`Reinicia o container de uma instância (somente para parceiros).
      <br><br>
    <span class="s10">
        <b>Exemplo de caso de uso:</b> Resolver problemas de acesso de uma instância. (Reinício completo)
    </span>`,
        'updateInstance': $localize`Atualiza os dados de uma instância (somente para parceiros).
      <br><br>
    <span class="s10">
        <b>Exemplo de caso de uso:</b> Alterar o plano ou os extras contratados de uma instância.
    </span>`,
        'sendTemplate': $localize`Envia um template de mensagem pré-aprovado (somente WA Cloud API).
      <br><br>
    <span class="s10">
        <b>Exemplo de caso de uso:</b> Enviar mensagens que precisam de aprovação prévia do WhatsApp.
    </span>`,
        'markTaskAsDone': $localize`Marca uma tarefa como concluída.
      <br><br>
    <span class="s10">
        <b>Exemplo de caso de uso:</b> Registrar a conclusão de uma tarefa.
    </span>`,
        'addToWaitingList': $localize`Adiciona o atendimento à lista de espera.
      <br><br>
    <span class="s10">
        <b>Exemplo de caso de uso:</b> Colocar o atendimento em espera para que um atendente o puxe manualmente.
    </span>`,
        'removeFromWaitingList': $localize`Remove o atendimento da lista de espera.
      <br><br>
    <span class="s10">
        <b>Exemplo de caso de uso:</b> Retirar o atendimento da lista de espera para que ele seja distribuído automaticamente.
    </span>`,
        'addInformationCard': $localize`Adiciona um cartão de informações ao atendimento.
      <br><br>
    <span class="s10">
        <b>Exemplos de casos de uso:</b>
        <ul>
            <li>Exibir informações relevantes sobre o atendimento.</li>
            <li>Adicionar botões de atalho para ações.</li>
        </ul>
    </span>`,
        'removeInformationCard': $localize`Remove um cartão de informações do atendimento.
      <br><br>
    <span class="s10">
        <b>Exemplo de caso de uso:</b> Remover cartões de informação que não são mais relevantes.
    </span>`,
        'showSnackNotification': $localize`Exibe uma notificação rápida para o atendente.
      <br><br>
    <span class="s10">
        <b>Exemplos de casos de uso:</b>
        <ul>
            <li>Exibir mensagens de sucesso ou erro.</li>
            <li>Informar o atendente sobre eventos importantes.</li>
        </ul>
    </span>`,
        'addInformationCardToMessage': $localize`Adiciona um cartão de informações a uma mensagem específica (somente cartões dinâmicos).
      <br><br>
    <span class="s10">
        <b>Exemplo de caso de uso:</b> Exibir informações relevantes junto à mensagem.
    </span>`,
        'removeInformationCardFromMessage': $localize`Remove um cartão de informações de uma mensagem.
      <br><br>
    <span class="s10">
        <b>Exemplo de caso de uso:</b> Remover cartões de informação que não são mais relevantes.
    </span>`,
        'sendFlow': $localize`Envia um Whatsapp Flow pré-aprovado (somente WA Cloud API).
      <br><br>
    <span class="s10">
        <b>Exemplo de caso de uso:</b> Enviar fluxos interativos do WhatsApp.
    </span>`,
        'clearFlowDataFromMessage': $localize`Limpa os dados de resposta de um Whatsapp Flow da mensagem.
      <br><br>
    <span class="s10">
        <b>Exemplo de caso de uso:</b> Excluir dados sensíveis de respostas de flow do banco de dados.
    </span>`,
        'aiAssistant': $localize`Entrega o controle do atendimento para um assistente de IA. O fluxo é pausado até que o assistente finalize, transfira ou o atendimento seja encerrado.
     <br><br>
    <span class="s10">
        <b>Exemplo de caso de uso:</b> Utilizar um assistente virtual para realizar o atendimento ao cliente.
    </span>`,
        'aiAddContextToAssistant': $localize`Adiciona informação ao contexto do assistente de IA (somente automações executadas por assistentes).
      <br><br>
    <span class="s10">
        <b>Exemplos de casos de uso:</b>
        <ul>
            <li>Informar ao assistente o resultado de uma operação.</li>
            <li>Passar informações relevantes para o assistente.</li>
        </ul>
    </span>`,
        'aiProcessFile': $localize`Processa um arquivo ou texto usando uma IA (LLM).
      <br><br>
    <span class="s10">
        <b>Exemplos de casos de uso:</b>
        <ul>
            <li>Resumir o conteúdo de um arquivo.</li>
            <li>Extrair informações de um texto.</li>
            <li>Analisar o sentimento de uma mensagem.</li>
        </ul>
    </span>`,
        'aiStopAssistant': $localize`Interrompe a execução do assistente de IA (somente automações).
    <br><br>
    <span class="s10">
        <b>Exemplo de caso de uso:</b> Forçar a interrupção do atendimento pelo assistente. Retorna a execução para o fluxo principal como se o atendimento tivesse sido transferido.
    </span>`,
        'aiStopMessage': $localize`Impede o envio de uma mensagem gerada pelo assistente de IA (somente automações).
     <br><br>
    <span class="s10">
        <b>Exemplo de caso de uso:</b> Utilizado por exemplo quando se deseja enviar um audio no lugar da mensagem de texto gerada pelo assistente, impedindo o envio da resposta original em texto.
    </span>`,
        'getInstanceBill': $localize`Função não implementada, não deve ser utilizada.`
    };

    helpGif = {};

    constructor(private domSanitizer: DomSanitizer) {

    }

    getHelp(key) {
        console.log('testo de ajuda selecionado', key, this.helpText[key]);
        return {img: this.helpGif[key], text: this.domSanitizer.bypassSecurityTrustHtml(this.helpText[key])};
    }

}

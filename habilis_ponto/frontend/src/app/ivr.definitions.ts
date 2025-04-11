import {AiModels} from "./ai.definitions";

/**
 * Definições de tipos e interfaces de elementos para a criação de URAs e Automações
 * URAs e Automações são fluxos de execução sequenciais, que podem ser configurações para automatizar tarefas de atendimento e administração
 * do sistema. Um elemento se conecta ao elemento seguinte, formando um fluxo de execução sequencial.
 * Alguns elementos podem possuir mais de uma saída, e a saída a ser seguida é determinada por condições de execução, conforme o tipo do elemento.
 *
 * URAs são fluxos de execução que sempre estão associados a um atendimento. Quando uma URA está em execução em um atendimento, este
 * é exclusivo para a URA e não pode ser atendido por um atendente humano enquanto a URA possuir o controle sobre ele, isso porque a URA
 * pode enviar perguntas para o cliente, e esperar por respostas, o que torna seu processo incompatível com um atendente humano enviando
 * mensagens e perguntas em paralelo. Um assistente de IA só pode realizar o atendimento de um cliente por dentro de uma URA, já que
 * se aplica o mesmo princípio de exclusividade. Elementos que interrompem o fluxo de execução para aguardar uma resposta do cliente
 * são exclusivos de URAs.
 *
 * Automações são fluxos de execução que não estão necessariamente associados a um atendimento, eles podem ou não estar
 * associados a um atendimento. Eles também podem estar associados a oportunidades do CRM, a tarefas, a contatos,
 * ou a qualquer outro objeto do sistema que possa acionar uma automação.
 * As automações não possuem a exclusividade de um atendimento nem de nenhum outro objeto associado a esta e podem ser
 * executadas em paralelo com outras automações, ou em atendimentos sendo respondidos por atendentes humanos ou URAs.
 * Elementos que interrompem o fluxo de execução para aguardar uma resposta do cliente não são permitidos em automações.
 */

/**
 * Explicações sobre variáveis:
 * Variáveis são utilizadas para armazenar valores que podem ser utilizados em diversos elementos de um fluxo de execução.
 * As variáveis são criadas e manipuladas por elementos específicos, como o newVar, request, searchContact, etc.
 * Variáveis só podem ser utilizadas em campos que são string e aceitam a sintaxe de variáveis.
 * As variáveis são acessadas utilizando a sintaxe {{nome_da_variavel}}, por exemplo: {{general_salutation}}.
 * As variáveis podem ser utilizadas em mensagens, opções, condições, etc.
 * Pode-se aplicar uma condição lógica OU no uso de variáveis, por exemplo:
 * {{variavel1}} || {{variavel2}}: Aplica uma condição OU às variáveis. O valor da variavel2 será utilizado se, e somente se, a variavel1 não possuir valor atribuído.
 *
 *
 * Tipos de variáveis:
 * - `string`: Representa texto.
 * - `number`: Representa números.
 * - `boolean`: Representa valores verdadeiro ou falso.
 * - `date`: Representa datas.
 * - `object`: Representa um objeto com várias propriedades.
 * - `list`: Representa uma lista de itens.
 * - `any`: Pode ser de qualquer tipo.
 *
 * Para acessar propriedades dentro de uma variável do tipo object ou list, utilize a notação de ponto (.) ou colchetes ([]) assim como acessaria em javascript.
 * Exemplo para object:
 * Suponha que você tenha uma variável 'chat_client_data' do tipo object com a seguinte estrutura:
 * {
 *   "nome": "João",
 *   "idade": 30,
 *   "endereco": {
 *      "rua": "Rua A",
 *      "numero": 123
 *   }
 * }
 * Para acessar o nome, você usaria: {{chat_client_data.nome}}
 * Para acessar a rua, você usaria: {{chat_client_data.endereco.rua}}

 * Exemplo para list:
 * Suponha que você tenha uma variável 'chat_opportunities_list' do tipo list com a seguinte estrutura:
 * [
 *   { "id": 1, "descricao": "Oportunidade 1" },
 *   { "id": 2, "descricao": "Oportunidade 2" }
 * ]
 * Para acessar a descrição da primeira oportunidade, você usaria: {{chat_opportunities_list[0].descricao}}
 * Para acessar a descrição da segunda oportunidade, você usaria: {{chat_opportunities_list[1].descricao}}
 *
 * Lista de variáveis disponíveis:
 *
 * Variáveis Gerais:
 * - `general_salutation` (string): Saudação padrão. (Bom dia, Boa tarde, Boa noite)
 * - `general_salutation_lower_case` (string): Saudação padrão em minúsculo. (bom dia, boa tarde, boa noite)
 * - `general_now_moment` (object): Objeto com Momentjs, contendo a data e hora atual.
 * - `general_now_date` (date): Data e hora atual.
 * - `general_now_timestamp` (number): Timestamp da data e hora atual.
 * - `general_now_date_YYYYMMDD` (string): Data atual em formato YYYYMMDD.
 * - `general_now_date_MMDD` (string): Data atual em formato MMDD.
 * - `general_tommorow_date` (date): Data e hora de amanhã.
 * - `general_tommorow_date_YYYYMMDD` (string): Data de amanhã em formato YYYYMMDD.
 * - `general_tommorow_date_MMDD` (string): Data de amanhã em formato MMDD.
 * - `general_in_7_days_date` (date): Data e hora daqui a 7 dias.
 * - `general_in_7_days_date_YYYYMMDD` (string): Data daqui a 7 dias em formato YYYYMMDD.
 * - `general_in_7_days_date_MMDD` (string): Data daqui a 7 dias em formato MMDD.
 * - `general_in_15_days_date` (date): Data e hora daqui a 15 dias.
 * - `general_in_15_days_date_YYYYMMDD` (string): Data daqui a 15 dias em formato YYYYMMDD.
 * - `general_in_15_days_date_MMDD` (string): Data daqui a 15 dias em formato MMDD.
 * - `general_in_1_month_date` (date): Data e hora daqui a 1 mês.
 * - `general_in_1_month_date_YYYYMMDD` (string): Data daqui a 1 mês em formato YYYYMMDD.
 * - `general_in_1_month_date_MMDD` (string): Data daqui a 1 mês em formato MMDD.
 * - `general_7_days_ago_date` (date): Data e hora de 7 dias atrás.
 * - `general_7_days_ago_date_YYYYMMDD` (string): Data de 7 dias atrás em formato YYYYMMDD.
 * - `general_7_days_ago_date_MMDD` (string): Data de 7 dias atrás em formato MMDD.
 * - `general_15_days_ago_date` (date): Data e hora de 15 dias atrás.
 * - `general_15_days_ago_date_YYYYMMDD` (string): Data de 15 dias atrás em formato YYYYMMDD.
 * - `general_15_days_ago_date_MMDD` (string): Data de 15 dias atrás em formato MMDD.
 * - `general_1_month_ago_date` (date): Data e hora de 1 mês atrás.
 * - `general_1_month_ago_date_YYYYMMDD` (string): Data de 1 mês atrás em formato YYYYMMDD.
 * - `general_1_month_ago_date_MMDD` (string): Data de 1 mês atrás em formato MMDD.
 * - `general_7_days_ago_date_timestamp` (number): Timestamp da data e hora de 7 dias atrás.
 * - `general_15_days_ago_date_timestamp` (number): Timestamp da data e hora de 15 dias atrás.
 * - `general_1_month_ago_date_timestamp` (number): Timestamp da data e hora de 1 mês atrás.

 * Variáveis de Oportunidade:
 * - `opportunity_id` (number): ID da oportunidade.
 * - `opportunity_title` (string): Título da oportunidade.
 * - `opportunity_stage_id` (number): ID da etapa atual da oportunidade.
 * - `opportunity_stage_name` (string): Nome da etapa atual da oportunidade.
 * - `opportunity_new_stage_id` (number): ID da nova etapa da oportunidade.
 * - `opportunity_new_stage_name` (string): Nome da nova etapa da oportunidade.
 * - `opportunity_old_stage_id` (number): ID da etapa anterior da oportunidade.
 * - `opportunity_old_stage_name` (string): Nome da etapa anterior da oportunidade.
 * - `opportunity_responsable_id` (number): ID do usuário responsável pela oportunidade.
 * - `opportunity_responsable_name` (string): Nome do usuário responsável pela oportunidade.
 * - `opportunity_clientid` (string): ID do cliente associado à oportunidade.
 * - `opportunity_main_phone` (string): Telefone principal do cliente associado à oportunidade.
 * - `opportunity_main_mail` (string): E-mail principal do cliente associado à oportunidade.
 * - `opportunity_value` (number): Valor da oportunidade.
 * - `opportunity_probability` (number): Probabilidade de fechamento da oportunidade.
 * - `opportunity_pipeline_id` (number): ID do funil da oportunidade.
 * - `opportunity_pipeline_name` (string): Nome do funil da oportunidade.
 * - `opportunity_stage_begin_timestamp` (number): Timestamp da data e hora de entrada na etapa atual da oportunidade.
 * - `opportunity_expected_close_date` (date): Data e hora de fechamento esperada da oportunidade.
 * - `opportunity_expected_close_date_timestamp` (number): Timestamp da data e hora de fechamento esperada da oportunidade.
 * - `opportunity_expected_close_date_YYYYMMDD` (string): Data de fechamento esperada da oportunidade em formato YYYYMMDD.
 * - `opportunity_expected_close_date_MMDD` (string): Data de fechamento esperada da oportunidade em formato MMDD.
 * - `opportunity_expected_close_date_iso` (string): Data de fechamento esperada da oportunidade em formato ISO.
 * - `opportunity_expected_close_date_moment` (object): Objeto Momentjs contendo a data de fechamento esperada da oportunidade.
 * - `opportunity_status` (number): Estado da oportunidade. 0 para aberta, 1 para ganha, 2 para perdida.
 * - `opportunity_tags` (string): Relação de tags da oportunidade, separadas por vírgula.
 * - `opportunity_tags_count` (number): Quantidade de tags da oportunidade.
 * - `opportunity_tags_ids` (string): Relação de IDs das tags da oportunidade, separadas por vírgula.
 * - `opportunity_tags_ids_list` (list): Lista com os IDs das tags da oportunidade.
 * - `opportunity_tags_list` (list): Lista com os nomes das tags da oportunidade.
 * - `opportunity_close_reason` (string): Texto com o motivo da perda da oportunidade.
 * - `opportunity_close_value` (number): Valor do fechamento da oportunidade.
 * - `opportunity_close_recurrent_value` (number): Valor recorrente do fechamento da oportunidade.
 * - `opportunity_close_obs` (string): Texto com as observações do fechamento da oportunidade.
 * - `opportunity_closed_by_id` (number): ID do usuário que fechou a oportunidade.
 * - `opportunity_closed_by_name` (string): Nome do usuário que fechou a oportunidade.
 * - `opportunity_closed_at_date` (date): Data e hora de fechamento da oportunidade.
 * - `opportunity_closed_at_date_timestamp` (number): Timestamp da data e hora de fechamento da oportunidade.
 * - `opportunity_closed_at_date_YYYYMMDD` (string): Data de fechamento da oportunidade em formato YYYYMMDD.
 * - `opportunity_closed_at_date_MMDD` (string): Data de fechamento da oportunidade em formato MMDD.
 * - `opportunity_closed_at_date_moment` (object): Objeto Momentjs contendo a data de fechamento da oportunidade.
 * - `opportunity_contacts_count` (number): Quantidade de contatos associados à oportunidade.
 * - `opportunity_contacts_list` (list): Lista com os Objetos dos contatos associados à oportunidade.
 * - `opportunity_files_count` (number): Quantidade de arquivos anexados à oportunidade.
 * - `opportunity_files_list` (list): Lista com o objetos do tipo Arquivo, representando os arquivos anexados à oportunidade.
 * - `opportunity_extradata` (object): Objeto com dados dos formulários personalizados da oportunidade.

 * Variáveis de Tarefa:
 * - `task_id` (number): ID da tarefa.
 * - `task_title` (string): Título da tarefa.
 * - `task_description` (string): Descrição da tarefa.
 * - `task_owner_id` (number): ID do usuário responsável pela tarefa.
 * - `task_owner_name` (string): Nome do usuário responsável pela tarefa.
 * - `task_priority` (number): Prioridade da tarefa.
 * - `task_duedate` (date): Data de vencimento da tarefa.
 * - `task_status` (number): Status da tarefa, 0 para parada, 1 para em execução, 2 para concluída.
 * - `task_finishdate` (date): Data de conclusão da tarefa.
 * - `task_progress` (number): Progresso da tarefa.
 * - `task_opportunity_id` (number): ID da oportunidade associada à tarefa.
 * - `task_opportunity_object` (object): Objeto com dados da oportunidade associada à tarefa. Estão disponíveis as mesmas variáveis de oportunidade como propriedades desse objeto. Nulo se nenhuma oportunidade estiver associada a tarefa.
 * - `task_schedule_begin` (date): Data de início do agendamento da tarefa.
 * - `task_schedule_end` (date): Data de fim do agendamento da tarefa.
 * - `task_action_id` (number): ID da ação personalizada associada à tarefa.
 * - `task_contacts_list` (list): Lista com os objetos dos contatos associados à tarefa.
 * - `task_contacts_count` (number): Quantidade de contatos associados à tarefa.

 * Variáveis de Contato:
 * - `contact_id` (number): ID do contato no sistema.
 * - `contact_name` (string): Nome do contato.
 * - `contact_number` (number): Número de telefone do contato.
 * - `contact_facebook` (string): Identificador do facebook do contato.
 * - `contact_instagram` (string): Identificador do instagram do contato.
 * - `contact_gbid` (string): Identificador do google business message do contato.
 * - `contact_email` (string): E-mail do contato.
 * - `contact_external` (string): Identificador externo do contato.
 * - `contact_address` (string): Endereço do contato.
 * - `contact_city` (string): Cidade do contato.
 * - `contact_housenumber` (string): Número da casa do contato.
 * - `contact_addresscomp` (string): Complemento do endereço do contato.
 * - `contact_neighborhood` (string): Bairro do contato.
 * - `contact_postal_code` (string): CEP do contato.
 * - `contact_state` (string): Estado do contato.
 * - `contact_country` (string): País do contato.
 * - `contact_document` (string): Documento do contato.
 * - `contact_free1` (string): Campo livre 1 do contato.
 * - `contact_free2` (string): Campo livre 2 do contato.
 * - `contact_birth_date` (date): Data de nascimento do contato.
 * - `contact_birth_date_YYYYMMDD` (string): Data de nascimento do contato, em formato texto YYYYMMDD.
 * - `contact_birth_date_MMDD` (string): Data de nascimento do contato, em formato texto MMDD.
 * - `contact_dot_not_disturb` (number): Se o contato está em modo não perturbe. 0 para não e 1 para sim.
 * - `contact_preferred_agents_array` (list): Lista com os IDs dos agentes preferidos do contato.
 * - `contact_preferred_agent` (number): ID do agente preferêncial com maior prioridade do contato.
 * - `contact_tags` (string): Relação de tags do contato, separadas por vírgula.
 * - `contact_extradata` (object): Objeto com dados extras do contato.

 * Variáveis de Atendimento:
 * - `chat_id` (number): ID do atendimento.
 * - `chat_remote_id` (string): ID do atendimento no serviço de mensageria.
 * - `chat_on_waiting_room` (number): Se o atendimento está ou não na sala de espera no momento. 1 para sim, 0 para não.
 * - `chat_assistant_id` (number): Se o atendimento está ou não sendo atendido por um assistente (IA). Se sim, o ID do assistante, se não, 0.
 * - `chat_client_id` (string): ID do cliente no serviço de mensageria.
 * - `chat_page_id` (string): ID da página que originou o atendimento.
 * - `chat_page_name` (string): Nome da página que originou o atendimento.
 * - `chat_client_name` (string): Nome do cliente, quando disponível.
 * - `chat_client_number` (string): Número do cliente, quando disponível.
 * - `chat_client_profile_name` (string): Nome do perfil do cliente, quando disponível.
 * - `chat_client_data` (object): Objeto com dados do atendimento, quando disponível.
 * - `chat_client_email` (string): E-mail do cliente, quando disponível.
 * - `chat_agent_id` (number): ID do agente ao qual esse atendimento foi atribuído. 0 se não houver agente atribuído.
 * - `chat_agent` (object): Objeto com dados do agente ao qual esse atendimento foi atribuído.
 * - `chat_contact_id` (number): ID do contato associado ao atendimento.
 * - `chat_contact` (object): Objeto com dados do contato associado ao atendimento.
 * - `chat_last_ext_data` (string): Último valor do campo extdata.
 * - `chat_last_ext_flag` (string): Último valor do campo extflag.
 * - `chat_protocol` (string): Protocolo do atendimento.
 * - `chat_last_chat_ai_score` (number): Nota da avaliação por IA do último atendimento realizado com esse cliente.
 * - `chat_last_chat_ai_summary` (string): Resumo gerado por IA do último atendimento realizado com esse cliente.
 * - `chat_last_chat_ai_suggestion` (string): Sugestões de melhoria geradas por IA do último atendimento realizado com esse cliente.
 * - `chat_last_agent_id` (number): ID do último agente que realizou o atendimento imediatamente anterior deste mesmo cliente.
 * - `chat_last_agent` (object): Objeto com dados do último agente que realizou o atendimento imediatamente anterior deste mesmo cliente.
 * - `chat_last_close_agent_id` (number): ID do último agente que encerrou o atendimento imediatamente anterior deste mesmo cliente.
 * - `chat_last_close_agent` (object): Objeto com dados do último agente que encerrou o atendimento imediatamente anterior deste mesmo cliente.
 * - `chat_last_chat_date` (date): Data e hora da última mensagem enviada ou recebida neste atendimento.
 * - `chat_last_chat_date_YYYYMMDD` (string): Data da última mensagem enviada ou recebida neste atendimento, em formato YYYYMMDD.
 * - `chat_last_chat_date_MMDD` (string): Data da última mensagem enviada ou recebida neste atendimento, em formato MMDD.
 * - `chat_responded` (number): Se o atendimento foi respondido. 0 para não e 1 para sim.
 * - `chat_responded_by_agent` (number): Se o atendimento foi respondido por um agente. 0 para não e 1 para sim.
 * - `chat_locked` (number): Se o atendimento está bloqueado para um agente. 0 para não e 1 para sim.
 * - `chat_locked_agent_id` (number): ID do agente para o qual esse atendimento esta bloqueado, se houver.
 * - `chat_locked_agent` (object): Objeto com dados do agente para o qual esse atendimento esta bloqueado, se houver.
 * - `chat_open_time_seconds` (number): Tempo de abertura do atendimento em segundos.
 * - `chat_open_time_minutes` (number): Tempo de abertura do atendimento em minutos.
 * - `chat_open_time_formatted` (string): Tempo de abertura do atendimento formatado.
 * - `chat_begin_timestamp` (number): Timestamp da data e hora de abertura do atendimento.
 * - `chat_agent_attr_time_seconds` (number): Tempo de atribuição do atendimento para o agente atual em segundos.
 * - `chat_agent_attr_time_minutes` (number): Tempo de atribuição do atendimento para o agente atual em minutos.
 * - `chat_agent_attr_time_formatted` (string): Tempo de atribuição do atendimento para o agente atual formatado.
 * - `chat_queue_id` (number): ID da fila do atendimento.
 * - `chat_queue_type` (string): Tipo da fila do atendimento.
 * - `chat_queue_name` (string): Nome da fila do atendimento.
 * - `chat_from_comment` (number): Se o atendimento foi aberto a partir de um comentário ou menção no Instagram. 0 se não, 1 se sim.
 * - `chat_session_locked` (number): Estado da sessão, para filas baseadas em janela de atendimento. 1 para se a sessão já estiver bloqueada, 0 para sessão livre.
 * - `chat_queue_authenticated` (number): Se a fila está autenticada no serviço de mensageria. 0 para não e 1 para sim.
 * - `chat_opportunities_count` (number): Quantidade de oportunidades associadas ao atendimento.
 * - `chat_opportunities_list` (list): Lista com os objetos das oportunidades associadas ao atendimento.
 * - `chat_end_reason` (string): Motivo do fechamento do atendimento.
 * - `chat_end_reason_obs` (string): Observações do motivo de fechamento do atendimento.
 * - `chat_end_should_reopen` (number): Se foi programada uma reabertura para esse atendimento. 1 para sim, 0 para não.
 * - `chat_end_reopen_reason` (string): Motivo para reabertura.
 * - `chat_end_reopen_date` (date): Data da reabertura programada.
 * - `chat_end_reopen_hour` (number): Hora da reabertura programada.
 * - `chat_end_reopen_minute` (number): Minuto da reabertura programada.
 *
 * Variáveis de IA:
 * - `ai_result_chat_id` (number): ID do atendimento.
 * - `ai_result_chat_client_id` (string): ID do cliente no serviço de mensageria.
 * - `ai_result_chat_client_name` (string): Nome do cliente.
 * - `ai_result_chat_client_number` (string): Número do cliente.
 * - `ai_result_chat_contact_id` (number): ID do contato associado ao atendimento.
 * - `ai_result_chat_company_id` (number): ID da empresa associada ao atendimento.
 * - `ai_result_chat_protocol` (string): Protocolo do atendimento.
 * - `ai_result_chat_end_reason` (string): Motivo de fechamento do atendimento.
 * - `ai_result_chat_end_reason_obs` (string): Observações do motivo de fechamento do atendimento.
 * - `ai_result_chat_end_should_reopen` (number): Se o atendimento deve ser reaberto. 1 para sim, 0 para não.
 * - `ai_result_chat_end_reopen_reason` (string): Motivo de reabertura do atendimento.
 * - `ai_result_chat_close_agent_id` (number): ID do agente que fechou o atendimento.
 * - `ai_result_score` (number): Pontuação da análise de inteligência artificial.
 * - `ai_result_resume` (string): Resumo da análise de inteligência artificial.
 * - `ai_result_suggestions` (string): Sugestões de melhoria da análise de inteligência artificial.
 *
 * Variáveis de agente:
 * - `agent_id` (number): ID do agente.
 * - `agent_full_name` (string): Nome completo do agente.
 * - `agent_user_name` (string): Nome de usuário do agente.
 * - `agent_sip_number` (string): Número do ramal do agente, se disponível.
 * - `agent_available` (number): Se o agente está disponível. 0 para não e 1 para sim.
 * - `agent_logged` (number): Se o agente está logado em alguma fila. 0 para não e 1 para sim.
 * - `agent_paused` (number): Se o agente está em pausa. 0 para não e 1 para sim.
 * - `agent_pause_reason_id` (number): ID do motivo de pausa do agente, se houver.
 * - `agent_pause_begin_timestamp` (number): Timestamp da data e hora de início da pausa do agente, se houver.
 * - `agent_chats_count` (number): Quantidade de atendimentos em que o agente está participando.
 * - `agent_filters` (string): Relação dos filtros que o agente possui, separados por vírgula.
 * - `agent_filters_count` (number): Quantidade de filtros que o agente possui.
 * - `agent_filters_list` (list): Lista com os filtros que o agente possui.
 * - `agent_chats_today` (number): Quantidade de atendimentos que o agente realizou hoje.
 * - `agent_calls_today` (number): Quantidade de ligações que o agente atendeu hoje.
 * - `agent_in_call` (number): Se o agente está em uma ligação. 0 para não e 1 para sim.
 * - `agent_idle` (number): Se o agente está ocioso. 0 para não e 1 para sim. Só disponível se o monitoramento estiver ativo e o agente possuir o Agente Local instalado na máquina.
 * - `agent_ext_id` (string): Identificador externo do agente.
 * - `agent_ext_data` (string): Dados extras do agente.
 *
 * Variáveis de arquivo:
 * - `file_id` (number): ID do arquivo.
 * - `file_name` (string): Nome do arquivo.
 * - `file_mimetype` (string): Mimetype do arquivo.
 * - `file_hash` (string): Hash do arquivo.
 * - `file_length` (number): Tamanho do arquivo.
 * - `file_url` (string): URL do arquivo.
 *
 * Variáveis de mensagem:
 * - `message_id` (number): ID da mensagem recebida. Normalmente o ID no serviço de mensageria.
 * - `message_client_id` (string): ID do cliente que enviou a mensagem.
 * - `message_file` (object): Objeto com dados do arquivo anexado à mensagem, caso exista.
 * - `message_service_id` (string): ID da mensagem no serviço de mensageria.
 * - `message_system_id` (string): ID da mensagem no sistema. Este é o ID que deve ser usado para operações com mensagens, como adição de informações de rodapé.
 * - `message_text` (string): Texto da mensagem.
 * - `message_subject` (string): Quando um e-mail, o assunto da mensagem.
 * - `message_footer_info` (string): Informações de rodapé associadas a mensagem.
 * - `message_direction` (string): Direção da mensagem. 'in', 'out', 'comments', 'livecomments', 'mentions'.
 * - `message_ad_url` (string): URL do anúncio enviado na mensagem, caso exista.
 * - `message_ad_title` (string): Título do anúncio enviado na mensagem, caso exista.
 * - `message_ad_body` (string): Corpo do anúncio enviado na mensagem, caso exista.
 * - `message_ad_thumb_url` (string): URL da imagem do anúncio enviado na mensagem, caso exista.
 * - `message_flow_raw` (object): Objeto com todos os dados brutos da resposta do Whatsapp Flow recebida.
 * - `message_flow_properties_count` (number): Número de propriedades da resposta de Whatsapp Flow recebida. 0 quando não for resposta de flow.
 * - `message_flow_KEY` (any): Uma variável para cada propriedade da resposta de Whatsapp Flow recebida. KEY é o nome da propriedade. Exemplo: Se o objeto de resposta do flow possuir uma propriedade email, uma variável message_flow_email será criada com o conteúdo da propriedade, e assim para todas as propriedades presentes na resposta.
 * - `message_button_id` (string): ID do botão clicado na mensagem, caso exista.
 * - `message_is_comment` (number): Se a mensagem é um comentário do instagram. 0 se não, 1 se sim.
 * - `message_comment_media_type` (string): Se a mensagem é um comentário do instagram, o tipo de mídia onde o comentário foi feito.
 * - `message_comment_media_caption` (string): Se a mensagem é um comentário do instagram, a legenda da mídia onde o comentário foi feito.
 * - `message_comment_media_url` (string): Se a mensagem é um comentário do instagram, a URL da mídia onde o comentário foi feito.
 * - `message_comment_replied` (string): Se é um comentário, se esse já foi respondido. 1 para sim, 0 para não.
 * - `message_comment_reply_text` (string): Se é um comentário e já foi respondido, o texto da resposta.
 * - `message_comment_reply_user_id` (string): Se é um comentário e já foi respondido, o ID do usuário que enviou a resposta.
 * - `message_location_latitude` (number): Caso a mensagem possua informações de localização, a latitude.
 * - `message_location_longitude` (number): Caso a mensagem possua informações de localização, a longitude.
 * - `message_audio_transcription` (string): Transcrição do áudio, quando houver.
 * - `message_ai_rewrited_by_ai` (number): Indica se a mensagem foi ou não reescrita pela IA. 1 para sim, 0 para não.
 * - `message_ai_old_text` (string): Se a mensagem foi reescrita pela IA, o texto original ficará disponível nessa variável.
 * - `message_ai_insult_detected` (number): Indica se algum insulto ou ofensa foi identificado pela IA na mensagem. 1 para sim, 0 para não.
 * - `message_ai_features_extracted` (list): Lista de strings com os trechos da mensagem destacados pela IA.
 *
 * Variáveis de instância:
 * - `instance_id` (number): ID da instância.
 * - `instance_name` (string): Nome da instância.
 * - `instance_online` (number): Se a instância está online. 1 para sim, 0 para não.
 * - `instance_status_code` (number): Código de status da instância. 0 para "Em aviso prévio", 1 para "Trial", 2 para "Ativa", 3 para "Cancelada".
 * - `instance_server_name` (string): Nome do servidor onde a instância está sendo executada.
 * - `instance_document` (string): Documento vinculado a instância.
 * - `instance_client_name` (string): Nome do cliente vinculado a instância.
 * - `instance_contact1_name` (string): Nome do primeiro contato vinculado a instância.
 * - `instance_contact1_phone` (string): Telefone do primeiro contato vinculado a instância.
 * - `instance_contact1_mail` (string): E-mail do primeiro contato vinculado a instância.
 * - `instance_contact2_name` (string): Nome do segundo contato vinculado a instância.
 * - `instance_contact2_phone` (string): Telefone do segundo contato vinculado a instância.
 * - `instance_contact2_mail` (string): E-mail do segundo contato vinculado a instância.
 * - `instance_plan_id` (number): ID do plano da instância.
 * - `instance_plan_name` (string): Nome do plano da instância.
 * - `instance_plan_included_agents` (number): Número de agentes incluídos no plano da instância.
 * - `instance_plan_included_quota` (number): Cota de armazenamento incluída no plano da instância em GB.
 * - `instance_old_plan_id` (number): ID do plano anterior da instância, só disponível no evento de atualização da instância.
 * - `instance_old_plan_name` (string): Nome do plano anterior da instância, só disponível no evento de atualização da instância.
 * - `instance_old_plan_included_agents` (number): Número de agentes incluídos no plano anterior da instância, só disponível no evento de atualização da instância.
 * - `instance_old_plan_included_quota` (number): Cota de armazenamento incluída no plano anterior da instância em GB, só disponível no evento de atualização da instância.
 * - `instance_activation_date` (date): Data de ativação da instância.
 * - `instance_deactivation_date` (date): Data de desativação da instância.
 * - `instance_end_of_trial_date` (date): Data de término do trial da instância.
 * - `instance_locked` (number): Se a instância está bloqueada. 1 para sim, 0 para não.
 * - `instance_total_chat_agents` (number): Número total de agentes da instância, incluindo os extras.
 * - `instance_extra_chat_agents` (number): Número de agentes extras da instância.
 * - `instance_extra_quotas` (number): Cota de armazenamento extra da instância em GB.
 * - `instance_used_agents` (number): Número de agentes utilizados da instância.
 * - `instance_wa_queues` (number): Número de filas de WhatsApp da instância.
 * - `instance_fb_queues` (number): Número de filas de Facebook da instância.
 * - `instance_ig_queues` (number): Número de filas de Instagram da instância.
 * - `instance_gb_queues` (number): Número de filas de Google Business da instância.
 * - `instance_tg_queues` (number): Número de filas de Telegram da instância.
 * - `instance_em_queues` (number): Número de filas de E-mail da instância.
 * - `instance_we_queues` (number): Número de filas de Webchat da instância.
 * - `instance_db_size` (number): Tamanho do banco de dados da instância em GB.
 * - `instance_db_used` (number): Tamanho do banco de dados utilizado da instância em GB.
 * - `instance_medium_monthly_cost` (number): Custo mensal médio da instância.
 * - `instance_daily_cost` (number): Custo diário da instância.
 */


// TODO Adicionar explicação de que as variáveis disponíveis na raiz irão variar conforme o contexto de execução
// TODO Adicionar explicação de que variáveis especiais serão disponibilizadas, como por exemplo, quando uma execução de uma captura de webhook, automação de sucesso de formulário, mensagem de flow, etc..


export enum IvrElementType {
    message = 0, // Envia uma mensagem simples para o cliente. Disponível em URAs e automações.
    question = 1, // Envia uma mensagem para o cliente em forma de pergunta, e interrompe o fluxo até que o cliente responda. Disponível somente em URAs.
    options = 2, // Envia uma mensagem para o cliente com opções de resposta, e interrompe o fluxo até que o cliente responda. As opções podem ser em texto, lista ou botões. Disponível somente em URAs.
    info = 3, // Adiciona uma mensagem de informação ao atendimento. A mensagem de informação só poderá ser vista pelo atendente. Disponível em URAs e automações. Utiliza a BaseMessageConfig para configuração.
    terminate = 4, // Encerra o atendimento. Disponível em URAs e automações.
    transfer = 5, // Transfere o atendimento para uma URA, atendente específico ou grupo de atendentes com base no filtro. Disponível em URAs e automações.
    marker = 7, // Adicionar uma etiqueta ao atendimento. Disponível em URAs e automações.
    timetable = 8, // Controle a direção do fluxo de acordo com a data / horário. Disponível em URAs e automações.
    url = 9, // Envia um botão de ação para o cliente. Esse botão pode ser uma URL ou um dado para ser copiado. Disponível em URAs e automações.
    integrations = 10, // DEPRECATED, não deve ser utilizado
    varCondition = 11, // Controla o fluxo de acordo com o valor de uma variável. Disponível em URAs e automações.
    request = 12, // Realiza uma requisição HTTP e salva o retorno em uma variável. Disponível em URAs e automações.
    protocol = 13, // Gera um protocolo e o associa ao atendimento. Disponível em URAs e automações.
    searchContact = 14, // Busca um contato na base de dados e o disponibiliza em uma variável. Se desejado também o associa ao atendimento. Disponível em URAs e automações.
    addContact = 15, // Adiciona um contato na base de dados. Disponível em URAs e automações.
    userAvailable = 16, // Verifica o status de um atendente e o disponibiliza em uma variável. Disponível em URAs e automações.
    sleep = 17, // Pausa o fluxo por um determinado tempo. Disponível em URAs e automações.
    setTriggers = 18, // Adiciona um conjunto de gatilhos ao atendimento. Disponível em URAs e automações.
    newVar = 20, // Cria uma nova variável com o valor informado. Disponível em URAs e automações.
    jscode = 21, // Executa um código JavaScript, pode-se manipular variáveis. Disponível em URAs e automações.
    sendAlert = 22, // Adiciona uma mensagem de alerta ao atendimento, essa mensagem só pode ser vista pelo atendente. Disponível em URAs e automações.
    cancelMessage = 23, // Cancela o envio de uma mensagem. Pode ser utilizado para cancelar o envio de mensagens com conteúdo ofensivo, por exemplo. Só tem efeito quando executada num contexto de gatilho de mensagem enviada ou similar. Disponível somente em automações.
    removeTrigger = 24, // Remove um gatilho específico do atendimento. Disponível em URAs e automações.
    lock = 25, // Bloqueia o atendimento para que somente o atendente para o qual está bloqueado possa interagir com ele. Disponível em URAs e automações.
    waitMessage = 26, // Interrompe o fluxo até que uma mensagem seja recebida do cliente. Disponível somente em URAs.
    execAutomation = 27, // Executa uma automação. Disponível em URAs e automações.
    editContact = 28, // Editar um contato na base de dados. Disponível em URAs e automações.
    openChat = 29, // Inicia um novo atendimento com um cliente quando a fila for com conexão não oficial (WAMD). Disponível somente em automações.
    searchChat = 30, // Busca um atendimento dentre os atendimentos abertos no momento e o disponibiliza em uma variável. Pode-se também associado o atendimento ao fluxo corrente. Disponível somente em automações.
    openChatCloud = 31, // Inicia um novo atendimento com um cliente quando a fila for uma fila oficial. Disponível somente em automações.
    sendMail = 32, // Envia um e-mail para o cliente. Disponível em URAs e automações.
    sendNotification = 33, // Envia uma notificação para um ou mais usuários do sistema. Disponível em URAs e automações.
    createTask = 34, // Cria uma nova tarefa para um ou mais usuários do sistema. Disponível em URAs e automações.
    addOpportunity = 35, // Adiciona uma nova oportunidade em um funil do CRM do sistema. Disponível em URAs e automações.
    winOpportunity = 36, // Ganha uma oportunidade no CRM do sistema. Disponível em URAs e automações.
    loseOpportunity = 37, // Perde uma oportunidade no CRM do sistema. Disponível em URAs e automações.
    editOpportunity = 38, // Edita uma oportunidade no CRM do sistema. Disponível em URAs e automações.
    cloneOpportunity = 39, // Clona uma oportunidade no CRM do sistema. Disponível em URAs e automações.
    moveOpportunity = 40, // Move uma oportunidade para outra etapa do funil no CRM do sistema. Disponível em URAs e automações.
    searchOpportunity = 41, // Busca uma oportunidade no CRM do sistema e a disponibiliza em uma variável. Disponível em URAs e automações.
    transferOpportunity = 42, // Transfere a responsabilidade de uma oportunidade para um usuário ou grupo de usuários do sistema. Disponível em URAs e automações.
    insertFileOpportunity = 43, // Associa um arquivo a uma oportunidade no CRM do sistema. Disponível em URAs e automações.
    showForm = 44, // Exibe um formulário para o atendente preencher. Disponível somente em automações.
    clearOpportunityTasks = 45, // Limpa todas as tarefas associadas a uma oportunidade no CRM do sistema. Disponível em URAs e automações.
    freezeOpportunity = 46, // Congela uma oportunidade no CRM do sistema. Disponível em URAs e automações.
    unfreezeOpportunity = 47, // Descongela uma oportunidade no CRM do sistema. Disponível em URAs e automações.
    shareContact = 48, // Compartilha um contato cadastrado no sistema com o cliente. Disponível em URAs e automações.
    removeAllTriggers = 49, // Remove todos os gatilhos do atendimento. Disponível em URAs e automações.
    reopenOpportunity = 50, // Reabre uma oportunidade já encerrada (ganhada ou perdida) no CRM do sistema. Disponível em URAs e automações.
    addPersistent = 51, // Adiciona um dado persistente ao banco de dados do sistema. Disponível em URAs e automações.
    searchPersistent = 52, // Busca um dado persistente no banco de dados do sistema e o disponibiliza em uma variável. Disponível em URAs e automações.
    removePersistent = 53, // Remove um dado persistente do banco de dados do sistema. Disponível em URAs e automações.
    replyComment = 54, // Responde um comentário de um cliente recebido em uma fila IG. Disponível somente em filas IG. Disponível em URAs
    searchInstance = 55, // Busca uma instância no sistema e a disponibiliza em uma variável. Disponível em URAs e automações.
    createInstance = 56, // Cria uma nova instância no sistema. Disponível em URAs e automações.
    editInstanceContactDetails = 57, // Edita os detalhes de contato de uma instância no sistema. Disponível em URAs e automações.
    markInstanceForExclusion = 58, // Marca uma instância para exclusão. Disponível em URAs e automações.
    reactivateInstance = 59, // Reativa uma instância marcada para exclusão. Disponível em URAs e automações.
    blockInstance = 60, // Bloqueia uma instância. Disponível em URAs e automações.
    unblockInstance = 61, // Desbloqueia uma instância. Disponível em URAs e automações.
    restartInstance = 62, // Reinicia uma instância. Disponível em URAs e automações.
    restartInstanceContainer = 63, // Reinicia o container de uma instância. Disponível em URAs e automações.
    updateInstance = 64, // Atualiza os dados de uma instância. Disponível em URAs e automações.
    getInstanceBill = 65, // Não utilizar
    sendTemplate = 66, // Envia um template pré aprovado do whatsapp para o cliente. Disponível somente em filas WA Cloud API. Disponível em URAs e automações.
    markTaskAsDone = 67, // Marca uma tarefa como concluída. Disponível em URAs e automações.
    addToWaitingList = 68, // Adiciona o cliente a uma lista de espera da fila. Quando na lista de espera um atendimento não é distribuído automaticamente. Disponível em URAs e automações.
    removeFromWaitingList = 69, // Remove o cliente da lista de espera da fila. Disponível em URAs e automações.
    addInformationCard = 70, // Adiciona um cartão de informação ao atendimento. O cartão de informações é um cartão que aparece na lateral da tela de atendimento do agente, pode conter informações úteis e botões de atalhos para automações. Disponível em URAs e automações.
    removeInformationCard = 71, // Remove um cartão de informação do atendimento. Disponível em URAs e automações.
    showSnackNotification = 72, // Exibe uma notificação rápida para o atendente. Disponível em URAs e automações.
    addInformationCardToMessage = 73, // Adiciona um cartão de informação a uma mensagem. O cartão de informação é exibido junto à mensagem ao invés da lateral da tela de atendimento. Disponível em URAs e automações.
    removeInformationCardFromMessage = 74, // Remove um cartão de informação de uma mensagem. Disponível em URAs e automações.
    sendFlow = 75, // Envia um flow do whatsapp para o cliente. Disponível em URAs e automações.
    clearFlowDataFromMessage = 76, // Limpa os dados de uma resposta de um flow do whatsapp de uma mensagem. Disponível em URAs e automações.
    aiAssistant = 77, // Associa um assistente virtual por IA ao atendimento, fazendo com que o cliente seja atendido pelo assistente. Interrompe o fluxo de atendimento até a finalização ou transferência do atendimento pelo assistente virtual. Disponível somente em URAs.
    aiAddContextToAssistant = 78, // Adiciona informação ao contexto ao assistente virtual por IA. Disponível em URAs e automações.
    aiProcessFile = 79, // Processa uma mensagem ou arquivo por uma LLM. Disponível em URAs e automações.
    aiStopAssistant = 80, // Para a execução do assistente virtual por IA. Disponível somente em automações.
    aiStopMessage = 81 // Impede o envio de uma mensagem pelo assistente virtual por IA. Disponível somente em automações.
}


/**
 * Estrutura base de configuração de um elemento de URA ou Automação
 */
export interface IvrElement<T extends BaseMessageConfig | QuestionConfig | OptionsConfig | TerminateConfig | MarkerConfig
    | TransferConfig | TimeTableConfig | UrlBtnConfig | VarConditionConfig | RequestConfig | ProtocolConfig
    | SearchContactConfig | AddContactConfig | EditContactConfig | ShareContactConfig | OpenChatConfig | UserAvailableConfig
    | SleepConfig | SetTriggersConfig | NewVarConfig | JsCodeConfig | SendAlertConfig | CancelMessageConfig
    | RemoveTriggerConfig | LockConfig | WaitMessageConfig | ExecAutomationConfig | SearchChatConfig
    | OpenChatCloudConfig | SendMailConfig | SendNotificationConfig | CreateTaskConfig | AddOpportunityConfig
    | EditOpportunityConfig | WinOpportunityConfig | LoseOpportunityConfig | CloneOpportunityConfig
    | MoveOpportunityConfig | SearchOpportunityConfig | TransferOpportunityConfig | InsertFileOpportunityConfig
    | ClearOpportunityTasksConfig | FreezeOpportunityConfig | UnfreezeOpportunityConfig | ReopenOpportunityConfig
    | ShowFormConfig | RemoveAllTriggersConfig | AddPersistentConfig | SearchPersistentConfig
    | RemovePersistentConfig | ReplyCommentConfig | SearchInstanceConfig | CreateInstanceConfig
    | EditInstanceContactDetailsConfig | MarkInstanceForExclusionConfig | ReactivateInstanceConfig | BlockInstanceConfig
    | UnblockInstanceConfig | RestartInstanceConfig | RestartInstanceContainerConfig | UpdateInstanceConfig
    | SendTemplateConfig | MarkTaskAsDoneConfig | AddToWaitingListConfig | RemoveFromWaitingListConfig
    | AddInformationCardConfig | RemoveInformationCardConfig | ShowSnackNotificationConfig | AddInformationCardToMessageConfig
    | RemoveInformationCardFromMessageConfig | SendFlowConfig | ClearFlowDataFromMessageConfig | AiAssistantConfig
    | AiAddContextToAssistantConfig | AiProcessFileConfig | AiStopAssistantConfig | AiStopMessageConfig> {
    id: string, // ID único do elemento no fluxo.
    type: IvrElementType, // Tipo do elemento do fluxo
    x: number, // Posição visual X do elemento no fluxograma
    y: number, // Posição visual Y do elemento no fluxograma
    info: string, // Informações adicionais sobre o elemento, qual a sua função e a descrição do porque ele foi inserido. Utilizado para documentar o fluxo.
    configured: boolean, // Indica se o elemento foi configurado corretamente. Quando false, um aviso é exibido no elemento
    config: T, // Configuração do elemento, conforme o type
    outLine?: any, // Uso interno do sistema, essa propriedade não deve ser adicionada no objeto de configuração
    transferOutLine?: any // Uso interno do sistema, essa propriedade não deve ser adicionada no objeto de configuração
}


/**
 * Configuração de um elemento do tipo message e do tipo info
 *
 * Envia uma mensagem para o cliente. Não aguarda resposta e segue para o próximo elemento imediatamente.
 * Quando utilizado em uma automação, é necessário que um atendimento esteja associado a essa.
 * Caso nenhum atendimento esteja associado a automação, esse elemento será ignorado.
 *
 * Tipos de fila: Todos
 * Tipos de fluxo: URAs e automações
 */
export interface BaseMessageConfig {
    nextElementId: string, // ID do próximo elemento no fluxograma
    text: string, // Texto da mensagem que será enviada. Pode-se utilizar variáveis no conteúdo, exemplo: "Olá {{chat_client_name}}, como posso ajudar?"
    fileChooseType: 0 | 1, // Tipo de processo de escolha do arquivo pelo usuário durante a configuração do elemento. 0 - Será apresentada uma lista de seleção de arquivos com os arquivos da galeria, 1 - Caixa de texto, para que digite o ID ou variável contendo o ID.
    fileId: string // Caso vá enviar um arquivo junto com a mensagem, ID do arquivo que deverá ser enviado. Pode-se utilizar variáveis contendo o ID do arquivo, exemplo: "{{file_id}}"
}


/**
 * Configuração de um elemento do tipo question
 *
 * Enviar uma mensagem com uma pergunta para o cliente. Interrompe o fluxo de execução da URA até que o cliente envie uma nova mensagem.
 * Salva o conteúdo da mensagem enviada pelo cliente em uma variável.
 *
 * Tipos de fila: Todos
 * Tipos de fluxo: Somente URAs
 */
export interface QuestionConfig extends BaseMessageConfig {
    varName: string, // Nome da variável que irá armazenar a resposta do cliente
    validate: 0 | 1 | 2 | 3 | 4, // Se a resposta do cliente deve ser validada. 0 - Não validar, 1 - Validar CPF / CNPJ, 2 - Validar e-mail, 3 - Validar telefone, 4 - Validar número
    validateError: string // Mensagem de erro que será enviada ao cliente caso a validação falhe. Se a validação falhar, o fluxo permanecerá no elemento question, até que uma resposta válida seja recebida.
}


/**
 * Configuração de um elemento do tipo options
 *
 * Envia uma mensagem com múltiplas opções para o cliente e segue o fluxo de execução de acordo com a opção escolhida pelo cliente.
 * Interrompe o fluxo de execução da URA até que o cliente envie uma nova mensagem com uma das opções.
 * Caso nenhum atendimento esteja associado a automação, esse elemento será ignorado.
 *
 * Tipos de fila: Todos
 * Tipos de fluxo: Somente URAs
 */
export interface OptionsConfig extends BaseMessageConfig {
    nextElementId: string, // ID do próximo elemento no fluxograma quando a resposta do usuário não corresponder a nenhuma opção e o número de retentativas for excedido
    type: OptionsConfigType, // Tipo de opções que serão enviadas para o cliente
    btnText: string, // Texto do botão de exibição da lista de opções. Só deve ser preenchido quando o type for 2 (list). Pode-se utilizar variáveis no conteúdo do botão, exemplo: "Selecione uma opção {{chat_client_name}}"
    errorRetryCount: number, // Número de tentativas que o cliente tem para enviar uma resposta válida. Caso o cliente não envie uma resposta válida após o número de tentativas, o fluxo seguirá para o nextElementId. Se 0 ou negativo, o fluxo seguirá para o nextElementId após a primeira resposta inválida.
    errorRetryMessage: string, // Mensagem que será enviada ao cliente caso a resposta não seja válida. Pode-se utilizar variáveis no conteúdo, exemplo: "Por favor, selecione uma opção válida {{chat_client_name}}"
    options: OptionsElementOption[] // Lista de opções que serão enviadas para o cliente
}

export interface OptionsElementOption {
    id: string, // ID da opção
    text: string, // Texto da opção que será exibido para o cliente. Pode-se utilizar variáveis no conteúdo, exemplo: "Opção 1 - {{chat_client_name}}". Se o elemento for do tipo text, esse mesmo texto deve ser repetido no corpo da mensagem. Se for do tipo button, o tamanho máximo desse texto é 30 caracteres.
    description: string, // Descrição da opção. Só deve ser preenchido caso o type seja 2 (list). Pode-se utilizar variáveis no conteúdo, exemplo: "Descrição da opção 1 - {{chat_client_name}}"
    buttonId: string, // ID da opção que será enviado para o cliente. O ID da opção selecionada pelo cliente será disponibilizado como uma variável caso o cliente pressione algum botão. Pode-se utilizar variáveis no conteúdo, exemplo: "{{option_id}}"
    alternativeTexts: string[], // Lista de textos alternativos que o cliente pode enviar para selecionar essa opção. Não se pode utilizar variáveis.
    nextElementId: string, // ID do próximo elemento no fluxograma que será executado caso essa opção seja selecionada
    inLine?: any, // Uso interno do sistema, essa propriedade não deve ser adicionada no objeto de configuração
    outLine?: any // Uso interno do sistema, essa propriedade não deve ser adicionada no objeto de configuração
}

export enum OptionsConfigType {
    text = 0, // Mensagem somente de texto. As opções devem ser incluídas no corpo da mensagem. Está disponível para todos os tipos de filas.
    buttons = 1, // Botões. A mensagem possuirá botões de resposta rápida como opção de resposta. Só está disponível em filas IG, FB, WA Cloud API, WAGS, WADG, WA Smarte e WEBCHAT. Demais filas devem utilizar a opção somente texto.
    list = 2 // Lista de opções. A mensagem possuirá uma lista de opções como opção de resposta. Só está disponível em filas IG, FB, WA Cloud API, WAGS, WADG, WA Smarte e WEBCHAT. Demais filas devem utilizar a opção somente texto.
}


/**
 * Configuração de um elemento do tipo terminate
 *
 * Encerra o atendimento associado, quando este existir. O elemento terminate não possui um próximo elemento, pois ele encerra o fluxo de execução.
 *
 * Tipos de fila: Todos
 * Tipos de fluxo: URAs e Automações
 */
export interface TerminateConfig {
    reason: string, // Motivo do encerramento do atendimento. Pode-se utilizar variáveis no conteúdo, exemplo: "Atendimento encerrado por {{chat_client_name}}"
    obs: string, // Observações adicionais sobre o encerramento do atendimento. Pode-se utilizar variáveis no conteúdo, exemplo: "Atendimento encerrado por {{chat_client_name}}",
    dontSendEndMsg: boolean // Se true, o atendimento será encerrado sem enviar a mensagem de encerramento automática configurada na fila para o cliente
    reopen: boolean, // Se true, o atendimento será agendada a reabertura automática desse atendimento em uma data futuro
    reopenDays: number, // Quantidade de dias para agendamento da reabertura do atendimento
    reopenHour: number, // Se agendada a reabertura, hora do dia em que o atendimento deverá ser reaberto
    reopenMinute: number, // Se agendada a reabertura, minuto da hora em que o atendimento deverá ser reaberto
    reopenAutomationId: number // Se agendada a reabertura, ID da automação que será executada no momento da reabertura. Se 0, nenhuma automação será executada.
}


/**
 * Configuração de um elemento do tipo transfer
 *
 * Transfere o atendimento associado, quando este existir. O elemento transfer não possui um próximo elemento, pois ele encerra o fluxo de execução.
 *
 * Tipos de fila: Todos
 * Tipos de fluxo: URAs e Automações
 */
export interface TransferConfig {
    destinationType: 0 | 1 | 2, // Tipo de destino para onde o atendimento será transferido. 0 - Para a fila de atendimento para distribuição automática, 1 - Para um atendente específico, 2 - Para uma URA específica
    destinationId: string, // ID do destino para onde o atendimento será transferido. Pode-se utilizar variáveis no conteúdo, exemplo: "{{ura_id}}". Só é utilizado caso o destinationType seja 1 ou 2. Caso o ID seja inválido, o atendimento será transferido para a fila.
    filter: string[] // Lista de filtros para distribuição do atendimento pela fila. Só é utilizado caso o destinationType seja 0 ou em caso de fallback se o ID do destino for inválido. O filtro é uma lista de strings que serão utilizadas para filtrar os atendentes disponíveis para transferência. Pode-se utilizar variáveis no conteúdo, exemplo: ["{{atendente_id}}"]
}


/**
 * Configuração de um elemento do tipo marker
 *
 * Adiciona uma etiqueta de atendimento ao atendimento. As etiquetas são utilizadas para classificar e priorizar os atendimentos, além de fornecer identificação visual do estado do atendimento para os atendentes e supervisores.
 * Cada atendimento só pode possuir uma etiqueta de atendimento associada. Caso o atendimento já possua uma etiqueta, essa será substituída pela nova.
 *
 * Tipos de fila: Todos
 * Tipos de fluxo: URAs e Automações
 */
export interface MarkerConfig {
    nextElementId: string, // ID do próximo elemento no fluxograma
    markerId: string // ID da etiqueta que será associada ao atendimento
}


/**
 * Configuração de um elemento do tipo timetable
 *
 * Controla o fluxo de acordo com a data / horário. Permite que o fluxo de execução siga por caminhos diferentes dependendo do dia e horário.
 *
 * Tipos de fila: Todos
 * Tipos de fluxo: URAs e Automações
 */
export interface TimeTableConfig {
    nextElementId: string, // ID do próximo elemento no fluxograma como destino padrão. Esse será o destino se nenhuma das opções da timetable for satisfeita.
    options: TimeTableElement[] // Lista de configurações de horários para controle do fluxo. O primeiro horário que for satisfeito será o caminho seguido.
}

export interface TimeTableElement {
    id: string, // ID de identificação do item
    type: 0 | 1 | 2, // Tipo de controle de horário. 0 - Por dia da semana, 1 - Data específica, 2 - Feriados
    weekDayBegin: number, // Caso o type seja 0, dia da semana em que o controle de horário começa. 0 - Domingo, 1 - Segunda, 2 - Terça, 3 - Quarta, 4 - Quinta, 5 - Sexta, 6 - Sábado
    weekDayEnd: number, // Caso o type seja 0, dia da semana em que o controle de horário termina. 0 - Domingo, 1 - Segunda, 2 - Terça, 3 - Quarta, 4 - Quinta, 5 - Sexta, 6 - Sábado
    specificDate: Date, // Caso o type seja 1, data específica em que o controle de horário será aplicado. Formato: "YYYY-MM-DD"
    hourBegin: number, // Hora do dia em que o controle de horário começa, nos dias em que o controle de horário é aplicado
    minuteBegin: number, // Minuto da hora em que o controle de horário começa, nos dias em que o controle de horário é aplicado
    hourEnd: number, // Hora do dia em que o controle de horário termina, nos dias em que o controle de horário é aplicado
    minuteEnd: number, // Minuto da hora em que o controle de horário termina, nos dias em que o controle de horário é aplicado
    nextElementId: string, // ID do próximo elemento no fluxograma caso esse horário for o selecionado.
    inLine?: any, // Uso interno do sistema, não deve ser adicionado ao objeto de configuração
    outLine?: any // Uso interno do sistema, não deve ser adicionado ao objeto de configuração
}


/**
 * Configuração de um elemento do tipo url
 *
 * Envia uma mensagem com um botão de ação para o cliente. O botão pode ser uma URL ou um dado para ser copiado.
 *
 * Tipos de fila: Só está disponível em filas WA Cloud API e Web Chat
 * Tipos de fluxo: URAs e Automações
 */
export interface UrlBtnConfig extends BaseMessageConfig {
    btnText: string, // Texto do botão de ação. Pode-se utilizar variáveis no conteúdo, exemplo: "Copiar {{tipo_do_dado}}"
    data: string // URL ou dado que será enviado ao cliente. Pode-se utilizar variáveis no conteúdo, exemplo: "https://www.boleto.com.br/{{numero_do_boleto}}". Para botão de copiar, enviar copy://{{dado_a_ser_copiado}}
}


/**
 * Configuração de um elemento do tipo varCondition
 *
 * Controla o fluxo de acordo com o valor de uma variável. Permite que o fluxo de execução siga por caminhos diferentes dependendo do valor de uma variável.
 *
 * Tipos de fila: Todos
 * Tipos de fluxo: URAs e Automações
 */
export interface VarConditionConfig {
    nextElementId: string, // ID do próximo elemento no fluxograma como destino padrão. Esse será o destino se nenhuma das opções for satisfeita.
    value: string, // Valor da variável que será comparado com as condições. Pode-se utilizar variáveis no conteúdo, exemplo: "{{variavel}}"
    options: VarConditionElement[] // Lista de configurações de condições de comparação para controle do fluxo. A primeira condição que for satisfeito será o caminho seguido.
}

export interface VarConditionElement {
    id: string, // ID da opção de comparação
    conditionOperator: "=" | "!=" | ">" | ">=" | "<" | "<=" | "in" | "not null", // Comparador que será utilizado para verificar a condição.
    conditionValue: string, // Valor para comparação com o valor da variável. Pode-se utilizar variáveis no conteúdo, exemplo: "{{valor}}". Utilizar essa propriedade sempre que o conditionOperator for diferente de "=" e "not null".
    conditionArray: string[], // Array de valores para comparação com o valor da variável. Pode-se utilizar variáveis no conteúdo, exemplo: ["{{valor1}}", "{{valor2}}"]. Essa propriedade só é utilizada quando o conditionOperator for "=", para todos os outros operadores ela será ignorada.
    nextElementId: string, // ID do próximo elemento no fluxograma que será executado caso essa condição seja verdadeira
    inLine?: any, // Uso interno do sistema, essa propriedade não deve ser adicionada no objeto de configuração
    outLine?: any // Uso interno do sistema, essa propriedade não deve ser adicionada no objeto de configuração
}


/**
 * Configuração de um elemento do tipo request
 *
 * Envia uma requisição HTTP para um servidor externo. O resultado da requisição é salvo em variáveis e pode ser utilizado em outras partes do fluxo de execução.
 * É feito um parse no retorno da requisição, se este for do tipo JSON ou multipart/form-data, o resultado é convertido para objeto JavaScript e disponibilizado em uma variável.
 * As seguintes variáveis são criadas automaticamente:
 * varPrefix + _httpStatus: Código de status da resposta da requisição. Exemplo de nome final da varíavel com prefixo: "req_response_httpStatus"
 * varPrefix + _rawBody: Corpo bruto da resposta da requisição. Exemplo de nome final da varíavel com prefixo: "req_response_rawBody"
 * varPrefix + _parsedBody: Corpo da resposta da requisição convertido para objeto JavaScript quando possível. Exemplo de nome final da varíavel com prefixo: "req_response_parsedBody"
 *
 * Adicionalmente, se o tipo de resposta (expectedContentType) estiver configurado para 2 (salvar como arquivo), também é criada a variável varPrefix + _fileId com o ID do arquivo gerado com o resultado da requisição.
 *
 * Tipos de fila: Todos
 * Tipos de fluxo: URAs e Automações
 */
export interface RequestConfig {
    varPrefix: string, // Prefixo das variáveis que receberão o resultado da requisição. Exemplo: "req_response". Todas as variáveis criadas por esse elemento durante a requisição terão esse prefixo.
    dataType: "json" | "jsonraw" | "urlencoded", // Tipo de conteúdo da requisição
    method: "get" | "post" | "put" | "delete" | "patch", // Método HTTP que será utilizado para fazer a requisição,
    retrys: number, // Número de tentativas de requisição antes de considerar que a requisição falhou. Se 0 ou negativo, apenas uma única tentativa será realizada.
    url: string, // URL completa da requisição. Pode-se utilizar variáveis no conteúdo, exemplo: "{{url}}"}
    data: { [key: string]: any }, // Dados que serão enviados na requisição. A chave da propriedade será o nome do campo que será enviado na requisição. Pode-se utilizar variáveis no conteúdo, porém não como chave, exemplo: {"name": "{{field_name}}", "document": "{{field_document}}"}. Esse campo só é utilizado caso o contentType seja json ou urlencoded. Os dados aqui serão convertidos para o formato adequado antes do envio. Para requisições GET essa propriedade será ignorada, os parâmetros devem ser passados via query params na URL.
    testData: { [key: string]: any }, // Dados que serão enviados na requisição de testes, onde variáveis não estão disponíveis e não está em produção. As chaves devem ser as mesmas do sentData porém com dados de teste da requisição, se houverem
    numberFields: string[], // Lista com as propriedades do sentData e sentDataTestData que devem ser tratadas como campos numéricos e convertidas para número antes de enviar
    dataRaw: string, // Dados brutos que serão enviados na requisição. Pode-se utilizar variáveis no conteúdo, exemplo: '{"name": "{{field_name}}", "value": "{{field_value}}"}'. Esse campo só é utilizado caso o contentType seja jsonraw.
    headers: { [key: string]: any }, // Headers da requisição. A chave da propriedade será o nome do cabeçalho. Pode-se utilizar variáveis no conteúdo, exemplo: [{"key": "{{header_key}}", "value": "{{header_value}}"}, ...]
    testHeaders: { [key: string]: any }, // Cabeçalhos que serão enviados na requisição de testes, onde variáveis não estão disponíveis e não está em produção. As chaves devem ser as mesmas do headersData porém com dados de teste da requisição, se houverem
    timeout: number, // Tempo limite para a requisição. Após esse tempo, a requisição será cancelada e considerada como falha. Se 0 ou negativo, o limite padrão de 10 segundos será utilizado.
    expectedContentType: 0 | 1 | 2, // Tipo de conteúdo esperado na resposta da requisição. 0 - JSON, 1 - Somente texto, 2 - Binário, salvar como arquivo
    textPreProcessor: number, // DEPRECATED, não utilizar
    textPreProcessorSeparator: string, // DEPRECATED, não utilizar
    textPostProcessorSeparator: string, // DEPRECATED, não utilizar
    textResponseVariable: string, // Variável onde será salvo o resultado da requisição caso o expectedContentType seja string. Adicionar somente o nome da variável, sem o prefixo. Exemplo: "response_text"
    nextElementId: string, // ID do próximo elemento no fluxograma que será executado após a requisição ser concluída
}


/**
 * Configuração de um elemento do tipo protocol
 *
 * Associa um protocolo ao atendimento. O protocolo pode ser gerado automaticamente ou pré-definido.
 *
 * Tipos de fila: Todos
 * Tipos de fluxo: URAs e Automações
 */
export interface ProtocolConfig {
    type: 0 | 1, // Forma de aplicação do protocolo ao atendimento. 0 - Gerar protocolo automaticamente, 1 - Usar protocolo pré-definido
    protocol: string // Protocolo que será associado ao atendimento, caso o type seja 1. Pode-se utilizar variáveis no conteúdo, exemplo: "{{protocol}}"
    nextElementId: string // ID do próximo elemento no fluxograma que será executado após o protocolo ser gerado
}


/**
 * Configuração de um elemento do tipo searchContact
 *
 * Busca um contato na base de dados do sistema. O contato pode ser buscado por CPF/CNPJ, telefone ou email.
 * Se encontrado, o resultado será disponibilizado em uma variável e se desejado pode ser associado ao atendimento atual.
 *
 * Tipos de fila: Todos
 * Tipos de fluxo: URAs e Automações
 */
export interface SearchContactConfig {
    resultVariableName: string, // Nome da variável que receberá o resultado da busca. Adicionar somente o nome da variável, sem o prefixo. Exemplo: "contact_result"
    searchField: "number" | "email" | "document" | "free1" | "free2" | "instagram" | "facebook" | "id", // Nome do campo que será utilizado para buscar o contato.
    searchValue: string, // Valor que será utilizado para buscar o contato. Esse valor será comparado com o valor do campo especificado em searchField. Pode-se utilizar variáveis no conteúdo, exemplo: "{{search_value}}"
    associateToCurrent: boolean, // Se true, o contato encontrado será associado ao atendimento atual.
    nextElementId: string // ID do próximo elemento no fluxograma que será executado após a busca ser concluída
}


export interface StringObjectAddEditConfig {
    enabled: number, // Só é utilizado em operações de edição. Se 1, o campo será editado. Se 0, o campo será mantido igual, sem edição e o valor de content será ignorado.
    content: string // Conteúdo do campo. Se enabled for 1, esse valor será utilizado para editar o campo. Em operações de adição, esse valor será utilizado para criar o campo. Pode-se utilizar variáveis no conteúdo, exemplo: "{{content}}"
}

export interface BooleanObjectAddEditConfig {
    enabled: number, // Só é utilizado em operações de edição. Se 1, o campo será editado. Se 0, o campo será mantido igual, sem edição e o valor de content será ignorado.
    content: boolean // Conteúdo do campo. Se enabled for 1, esse valor será utilizado para editar o campo. Em operações de adição, esse valor será utilizado para criar o campo. Pode-se utilizar variáveis no conteúdo, exemplo: "{{content}}"
}

export interface ArrayObjectAddEditConfig {
    enabled: number, // Só é utilizado em operações de edição. Se 1, o campo será editado. Se 0, o campo será mantido igual, sem edição e o valor de content será ignorado.
    content: string[] // Conteúdo do campo. Se enabled for 1, esse valor será utilizado para editar o campo. Em operações de adição, esse valor será utilizado para criar o campo. Pode-se utilizar variáveis no conteúdo, exemplo: "{{content}}"
}


// ## Configurações de elementos que realizam operações com contatos ##
export interface ContactConfig {
    name: StringObjectAddEditConfig, // Nome do contato
    number: StringObjectAddEditConfig, // Telefone do contato
    instagram: StringObjectAddEditConfig, // Instagram do contato
    facebook: StringObjectAddEditConfig, // Facebook do contato
    email: StringObjectAddEditConfig, // Email do contato
    document: StringObjectAddEditConfig, // Documento do contato (Exemplo: CPF/CNPJ)
    birthdate: StringObjectAddEditConfig, // Data de nascimento do contato
    gbid?: StringObjectAddEditConfig, // DEPRECATED, não utilizar
    tags: ArrayObjectAddEditConfig, // Lista de etiquetas do contato
    free1: StringObjectAddEditConfig, // Campo livre 1 do contato
    free2: StringObjectAddEditConfig, // Campo livre 2 do contato
    address: StringObjectAddEditConfig, // Endereço do contato
    city: StringObjectAddEditConfig, // Cidade do contato
    neighborhood: StringObjectAddEditConfig, // Bairro do contato
    postalcode: StringObjectAddEditConfig, // CEP do contato
    state: StringObjectAddEditConfig, // Estado do contato
    country: StringObjectAddEditConfig, // País do contato
    housenumber: StringObjectAddEditConfig, // Número do endereço do contato
    addresscomp: StringObjectAddEditConfig, // Complemento do endereço do contato
    preferredagents: ArrayObjectAddEditConfig, // Lista de IDs dos atendentes preferidos do contato
    groups: ArrayObjectAddEditConfig, // Lista de IDs dos grupos aos quais o contato pertence
    extradata: { [key: string]: StringObjectAddEditConfig }, // Objeto contendo campos extras personalizados do contato. Pode-se utilizar variáveis no conteúdo, exemplo: {"custom_field_1": {enabled: true, content: "{{custom_field_1_content}}"}}.
    donotdisturb: BooleanObjectAddEditConfig, // Se true, não será permitido iniciar um atendimento ativo com esse contato. A comunicação com ele deverá sempre ser passiva, ou seja, o contato precisa iniciar o atendimento.
    blockmarketingcampaigns: BooleanObjectAddEditConfig, // Se true, o contato não receberá campanhas de marketing do sistema
    blockutilitiescampaigns: BooleanObjectAddEditConfig // Se true, o contato não receberá campanhas de utilidades do sistema
}

/**
 * Configuração de um elemento do tipo addContact
 *
 * Adiciona um novo contato na base de dados do sistema.
 *
 * Tipos de fila: Todos
 * Tipos de fluxo: URAs e Automações
 */
export interface AddContactConfig {
    contact: ContactConfig, // Dados para adição do contato.
    associateToCurrent: boolean, // Se true, o novo contato criado encontrado será associado ao atendimento atual.
    nextElementId: string, // ID do próximo elemento no fluxograma que será executado após o contato ser adicionado
}

/**
 * Configuração de um elemento do tipo editContact
 *
 * Edita um contato existente na base de dados do sistema.
 *
 * Tipos de fila: Todos
 * Tipos de fluxo: URAs e Automações
 */
export interface EditContactConfig {
    id: string, // ID do contato que será editado na base de dados do sistema. Pode-se utilizar variáveis no conteúdo, exemplo: "{{contact_id}}"
    contact: ContactConfig, // Dados para edição do contato.
    nextElementId: string, // ID do próximo elemento no fluxograma que será executado após o contato ser editado
}


/**
 * Configuração de um elemento do tipo shareContact
 *
 * Compartilha um contato com o cliente, enviando seus dados na forma de uma mensagem.
 *
 * Tipos de fila: Todos
 * Tipos de fluxo: URAs e Automações
 */
export interface ShareContactConfig {
    contactId: string, // ID do contato que será compartilhado com o cliente. Pode-se utilizar variáveis no conteúdo, exemplo: "{{contact_id}}"
    contactName: string, // Nome do contato que será compartilhado com o cliente. Pode-se utilizar variáveis no conteúdo, exemplo: "{{contact_name}}"
    nextElementId: string, // ID do próximo elemento no fluxograma que será executado após o contato ser editado
}


/**
 * Configuração de um elemento do tipo userAvailable
 *
 * Verifica o estado de um agente de atendimento com base em seu ID, salvando o resultado em uma variável.
 *
 * Tipos de fila: Todos
 * Tipos de fluxo: URAs e Automações
 */
export interface UserAvailableConfig {
    variableName: string, // Nome da variável que será criada e receberá o resultado da verificação. Se o agente for encontrado, a variável conterá um objeto com todas as variáveis de agente como propriedades. Adicionar somente o nome da variável, sem chaves. Exemplo: "user_available"
    userId: string, // ID do agente de atendimento que será verificado. Pode-se utilizar variáveis no conteúdo, exemplo: "{{user_id}}"
    nextElementId: string, // ID do próximo elemento no fluxograma que será executado
}


/**
 * Configuração de um elemento do tipo sleep
 *
 * Pausa a execução do fluxo por um determinado período de tempo.
 *
 * Tipos de fila: Todos
 * Tipos de fluxo: URAs e Automações
 */
export interface SleepConfig {
    time: number, // Tempo em segundos que o fluxo ficará pausado
    nextElementId: string, // ID do próximo elemento no fluxograma que será executado
}


/**
 * Configuração de um elemento do tipo setTriggers
 *
 * Aplica um conjunto de gatilhos ao atendimento corrente. Se não houver atendimento associado, esse elemento será ignorado.
 *
 * Tipos de fila: Todos
 * Tipos de fluxo: URAs e Automações
 */
export interface SetTriggersConfig {
    triggerSetId: number, // ID do conjunto de gatilhos que será aplicado ao atendimento. Não se pode utilizar variáveis.
    nextElementId: string, // ID do próximo elemento no fluxograma que será executado
}


/**
 * Configuração de um elemento do tipo newVar
 *
 * Cria uma nova variável com um valor inicial.
 *
 * Tipos de fila: Todos
 * Tipos de fluxo: URAs e Automações
 */
export interface NewVarConfig {
    variableName: string, // Nome da variável que será criada. Adicionar somente o nome da variável, sem chaves. Exemplo: "new_var"
    value: string, // Valor inicial da variável. Pode-se utilizar variáveis no conteúdo, exemplo: "{{value}}"
    nextElementId: string, // ID do próximo elemento no fluxograma que será executado
}


/**
 * Configuração de um elemento do tipo jscode
 *
 * Executa um código JavaScript no servidor. O código pode ser utilizado para realizar operações complexas que não são possíveis com os elementos padrão.
 * O código é executado em um sandbox, sem acesso a recursos externos, como bancos de dados ou sistemas de arquivos.
 * Todas as variáveis disponíveis no contexto do atendimento estão disponíveis para serem utilizadas no código através do objeto global vars.
 * Para acessar a variável var1, por exemplo, basta utilizar vars.var1.
 * O código também pode criar novas variáveis e modificar as existentes editando o objeto vars.
 * Não é permitido requerer módulos externos ou utilizar funções que possam causar efeitos colaterais, como console.log.
 * Não é permitido realizar requisições HTTP ou acessar recursos externos.
 * O pacote momentjs para manipulação de datas está disponível como um objeto global moment. Exemplo: moment().format('YYYY-MM-DD').
 * Não é necessário encapsular o código em uma função, ele será executado diretamente. Qualquer valor retornado pelo código será ignorado.
 *
 * Tipos de fila: Todos
 * Tipos de fluxo: URAs e Automações
 */
export interface JsCodeConfig {
    code: string, // Código JavaScript que será executado no servidor. Exemplo: "vars.var1 = 1 + 1;"
    nextElementId: string, // ID do próximo elemento no fluxograma que será executado
}


/**
 * Configuração de um elemento do tipo sendAlert
 *
 * Envia um alerta para um conjunto de usuários do sistema.
 *
 * Tipos de fila: Todos
 * Tipos de fluxo: URAs e Automações
 */
export interface SendAlertConfig extends BaseMessageConfig {
    usersIds: string[], // Lista de IDs dos usuários que receberão o alerta. Não se pode utilizar variáveis.
}


/**
 * Configuração de um elemento do tipo cancelMessage
 *
 * Interrompe o envio de uma mensagem que será enviada.
 * Só possui efeitos em automações que são executadas antes da mensagem ser enviada, como por exemplo, automações executadas por gatilhos de mensagens enviadas.
 *
 * Tipos de fila: Todos
 * Tipos de fluxo: Somente automações
 */
export interface CancelMessageConfig {
    nextElementId: string, // ID do próximo elemento no fluxograma que será executado
}


/**
 * Configuração de um elemento do tipo removeTrigger
 *
 * Remove o gatilho que provocou a execução da automação.
 *
 * Tipos de fila: Todos
 * Tipos de fluxo: Somente automações
 */
export interface RemoveTriggerConfig {
    nextElementId: string, // ID do próximo elemento no fluxograma que será executado
}


/**
 * Configuração de um elemento do tipo lock
 *
 * Aplica um bloqueio ao atendimento associado, vinculando a um agente específico, de forma que o atendimento não possa ser
 * recebido por outro atendente até que a trava seja removida.
 * Só pode existir um bloqueio por atendimento. Se um novo bloqueio for aplicado, o anterior será removido.
 *
 * Tipos de fila: Todos
 * Tipos de fluxo: Somente automações
 */
export interface LockConfig {
    userId: string, // ID do agente ao qual o atendimento será vinculado. Somente esse agente poderá receber o atendimento até que ele seja desbloqueado. Pode-se utilizar variáveis no conteúdo, exemplo: "{{user_id}}"
    lockTime: number, // Tempo em segundos que o atendimento ficará bloqueado. Se 0, o atendimento será desbloqueado imediatamente, inclusive se ele possuir outro bloqueio anterior aplicado. Não se pode utilizar variáveis.
    nextElementId: string, // ID do próximo elemento no fluxograma que será executado
}


/**
 * Configuração de um elemento do tipo waitMessage
 *
 * Interrompe o fluxo de execução da automação até que o cliente envie uma nova mensagem.
 *
 * Tipos de fila: Todos
 * Tipos de fluxo: Somente URA
 */
export interface WaitMessageConfig {
    nextElementId: string, // ID do próximo elemento no fluxograma que será executado
}


/**
 * Configuração de um elemento do tipo execAutomation
 *
 * Executa uma automação específica como parte do fluxo. O fluxo de execução será transferido para a automação selecionada.
 * Ao final da execução da automação, o fluxo de execução retornará para o próximo elemento no fluxograma de origem.
 *
 * Tipos de fila: Todos
 * Tipos de fluxo: URAs e Automações
 */
export interface ExecAutomationConfig {
    automationId: string, // ID da automação que será executada. Não se pode utilizar variáveis.
    nextElementId: string, // ID do próximo elemento no fluxograma que será executado, após a execução da automação
}


/**
 * Configuração de um elemento do tipo openChat
 *
 * Abre um novo atendimento com base no número de telefone informado.
 *
 * Tipos de fila: Somente WAMD
 * Tipos de fluxo: Somente automações
 */
export interface OpenChatConfig {
    countryCode: string, // O código do país de onde o número de telefone pertence. Deve ser informado no formato ISO 3166-1 alpha-2 (ex: BR, US, ES, etc). Informar DNV se não houver correspondência ou a informação não estiver disponível. Pode-se utilizar variáveis.
    phoneNumber: string, // O número de telefone do destinatário para abertura do atendimento. Deve ser informado no formato internacional sem o + (ex: 5511987654321).
    nextElementId: string, // ID do próximo elemento no fluxograma que será executado
}


/**
 * Configuração de um elemento do tipo searchChat
 *
 * Busca um atendimento atualmente em aberto, em andamento, com base no dado informado e associa-o ao fluxo corrente.
 * Caso o fluxo de execução já esteja associado a um atendimento, esse elemento será ignorado.
 *
 * Tipos de fila: Todas
 * Tipos de fluxo: Somente automações
 */
export interface SearchChatConfig {
    searchField: "clientNumber" | "protocol" | "id" | "clientId" | "clientDocument" | "clientData" | "clientProfileName" | "clientEmail", // Campo que será utilizado para buscar o atendimento. clientNumber - Número de telefone do cliente, protocol - Protocolo do atendimento, id - ID do atendimento, clientId - ID do cliente no serviço de mensageria, clientDocument - Documento do cliente conforme cadastrado no contato, clientData - Dado livre do cliente, clientProfileName - Nome do perfil do cliente, clientEmail - Email do cliente conforme cadastrado no contato associado
    searchValue: string, // Valor que será utilizado para buscar o atendimento. Esse valor será comparado com o valor do campo especificado em searchField. Pode-se utilizar variáveis no conteúdo, exemplo: "{{search_value}}"
    nextElementId: string, // ID do próximo elemento no fluxograma que será executado
}


/**
 * Configuração de um elemento do tipo openChatCloud
 *
 * Abre um novo atendimento com base no número de telefone informado.
 * Esse elemento deve ser utilizado em filas do tipo WA Cloud API enquanto o openChat deve ser utilizado em filas WAMD.
 *
 * Tipos de fila: Somente WA Cloud API
 * Tipos de fluxo: Somente automações
 */
export interface OpenChatCloudConfig {
    countryCode: string, // O código do país de onde o número de telefone pertence. Deve ser informado no formato ISO 3166-1 alpha-2 (ex: BR, US, ES, etc). Informar DNV se não houver correspondência ou a informação não estiver disponível. Pode-se utilizar variáveis.
    phoneNumber: string, // O número de telefone do destinatário para abertura do atendimento. Deve ser informado no formato internacional sem o + (ex: 5511987654321).
    templateId: number, // ID do template de mensagem pré aprovado que será enviado ao cliente para abertura do atendimento. Não se pode utilizar variáveis.
    templateData: string[], // Lista de dados que serão utilizados para preencher o template de mensagem. Pode-se utilizar variáveis no conteúdo, exemplo: ["{{data1}}", "{{data2}}"]
    nextElementId: string, // ID do próximo elemento no fluxograma que será executado
}


/**
 * Configuração de um elemento do tipo sendMail
 *
 * Envia um e-mail para o cliente com base em um modelo pré-cadastrado.
 *
 * Tipos de fila: Todos
 * Tipos de fluxo: URAs e Automações
 */
export interface SendMailConfig {
    mailQueueId: string, // ID da fila de e-mail que será utilizada para envio do email. Pode-se utilizar variáveis no conteúdo, exemplo: "{{mail_queue_id}}"
    modelId: string, // ID do modelo de e-mail que será enviado. Pode-se utilizar variáveis no conteúdo, exemplo: "{{model_id}}"
    mails: string, // Lista de e-mails dos destinatários, separas por vírgula. Pode-se utilizar variáveis no conteúdo, exemplo: "{{mail1}}, {{mail2}}"
    nextElementId: string, // ID do próximo elemento no fluxograma que será executado
}


/**
 * Configuração de um elemento do tipo sendNotification
 *
 * Envia uma notificação para um ou mais usuários do sistema (agentes, supervisores ou administradores).
 *
 * Tipos de fila: Todos
 * Tipos de fluxo: URAs e Automações
 */
export interface SendNotificationConfig {
    selectionMode: 0 | 1, // Usuários selecionados a partir de uma lista, cujos IDs ficam salvos na lista usersIds, 0 - Um único usuário especificado pela variável userId
    userId: string, // ID do usuário de destino. Pode-se utilizar variáveis, exemplo: "{{user_id}}". Só é utilizando caso sendTo seja 0.
    usersIds: string[], // Lista de IDs dos usuários que receberão a notificação. Não se pode utilizar variáveis. Só é utilizando caso sendTo seja 1. Ao menos um usuário deve ser informado.
    text: string // Texto da notificação. Pode-se utilizar variáveis no conteúdo, exemplo: "Nova notificação para {{user_name}}"
    type: 0 | 1 | 2 | 3, // Tipo da notificação. 0 - Informação, 1 - Sucesso, 2 - Alerta, 3 - Erro
    nextElementId: string, // ID do próximo elemento no fluxograma que será executado
}


/**
 * Configuração de um elemento do tipo createTask
 *
 * Criar uma nova tarefa no sistema.
 *
 * Tipos de fila: Todos
 * Tipos de fluxo: URAs e Automações
 */
export interface CreateTaskConfig {
    dueDate: dueDateType, // Prazo para conclusão da tarefa
    action: number, // Ação associada a tarefa. 0 - Nenhuma ação, 1 - Ligação, 2 - Chat, 3 - Reunião. Esse campo também pode receber o ID de uma ação personalizada cadastrada no sistema.
    associateToCurrentContact: boolean, // Se true, a tarefa será associada ao contato atual do atendimento.
    selectionMode: 0 | 1, // Usuários selecionados a partir de uma lista, cujos IDs ficam salvos na lista responsiblesIds, 0 - Um único usuário especificado pela variável responsibleId
    responsibleId: string, // ID do responsável. Pode-se utilizar variáveis no conteúdo, exemplo: "{{user_id}}". Só é utilizando caso selectionMode seja 0.
    responsiblesIds: string[], // Lista de IDs dos responsáveis pela tarefa. Não se pode utilizar variáveis. Só é utilizando caso selectionMode seja 1. Ao menos um responsável deve ser informado.
    opportunityId: string, // ID da oportunidade associada a tarefa, se houver. Pode-se utilizar variáveis no conteúdo, exemplo: "{{opportunity_id}}". Se não houver oportunidade associada, informar 0.
    watchersIds: string[], // Lista de IDs dos observadores da tarefa. Pode-se utilizar variáveis no conteúdo, exemplo: ["{{user_id}}"]
    title: string, // Título da tarefa. Pode-se utilizar variáveis no conteúdo, exemplo: "{{task_title}}"
    description: string, // Descrição da tarefa. Pode-se utilizar variáveis no conteúdo, exemplo: "{{task_description}}"
    checklist: CheckListItem[], // Lista de itens do checklist da tarefa, se houver.
    tags: string[], // Lista de IDs das etiquetas associadas da tarefa. Pode-se utilizar variáveis no conteúdo, exemplo: ["{{tag_id}}"]
    nextElementId: string, // ID do próximo elemento no fluxograma que será executado
}

export enum dueDateType {
    "none" = 8, // A tarefa não possui vencimento
    "today" = 0, // A tarefa deve ser concluída no mesmo dia
    "tomorrow" = 1, // A tarefa deve ser concluída até o dia seguinte
    "in2Days" = 2, // A tarefa deve ser concluída em até 2 dias
    "in3Days" = 3,  // A tarefa deve ser concluída em até 3 dias
    "in4Days" = 4, // A tarefa deve ser concluída em até 4 dias
    "in1Week" = 5, // A tarefa deve ser concluída em até 1 semana
    "in2Weeks" = 6, // A tarefa deve ser concluída em até 2 semanas
    "in1Month" = 7, // A tarefa deve ser concluída em até 1 mês
}

export interface CheckListItem {
    id: string, // ID do item do checklist
    title: string, // Título do item do checklist. Pode-se utilizar variáveis no conteúdo, exemplo: "{{checklist_item_title}}"
    checked: boolean, // Se true, o item do checklist está marcado como concluído
    isNew: boolean // Se true, o item do checklist é um novo item que será adicionado à tarefa
}


/**
 * Configuração de um elemento do tipo addOpportunity
 *
 * Adiciona uma nova oportunidade no sistema.
 *
 * Tipos de fila: Todos
 * Tipos de fluxo: URAs e Automações
 */
export interface AddOpportunityConfig {
    pipelineId: number, // ID do funil de vendas ao qual a oportunidade será associada. Não se pode utilizar variáveis.
    stageId: number, // ID do estágio do funil de vendas ao qual a oportunidade será associada. Não se pode utilizar variáveis.
    resultVariableName: string, // Nome da variável que receberá o objeto com as variáveis da nova oportunidade criada. Adicionar somente o nome da variável, sem chaves. Exemplo: "opportunity_result"
    opportunity: OpportunityConfig, // Dados para adição da oportunidade
    nextElementId: string, // ID do próximo elemento no fluxograma que será executado
}


/**
 * Configuração de um elemento do tipo editOpportunity
 *
 * Edita uma oportunidade existente no sistema.
 *
 * Tipos de fila: Todos
 * Tipos de fluxo: URAs e Automações
 */
export interface EditOpportunityConfig {
    pipelineId: number, // ID do funil do CRM onde a oportunidade está associada. Não se pode utilizar variáveis.
    opportunityId: string, // ID da oportunidade que será editada. Pode-se utilizar variáveis no conteúdo, exemplo: "{{opportunity_id}}"
    opportunity: OpportunityConfig, // Dados para edição da oportunidade
    nextElementId: string, // ID do próximo elemento no fluxograma que será executado
}

export interface OpportunityConfig {
    title: StringObjectAddEditConfig, // Título da oportunidade. Pode-se utilizar variáveis no conteúdo, exemplo: "{{opportunity_title}}"
    mainphone: StringObjectAddEditConfig, // Telefone principal da oportunidade. Pode-se utilizar variáveis no conteúdo, exemplo: "{{opportunity_phone}}"
    mainmail: StringObjectAddEditConfig, // Email principal da oportunidade. Pode-se utilizar variáveis no conteúdo, exemplo: "{{opportunity_email}}"
    origin: StringObjectAddEditConfig, // ID da origem da oportunidade. Pode-se utilizar variáveis no conteúdo, exemplo: "{{opportunity_origin}}"
    value: StringObjectAddEditConfig, // Valor da oportunidade. Pode-se utilizar variáveis no conteúdo, exemplo: "{{opportunity_value}}"
    recurrentvalue: StringObjectAddEditConfig, // Valor recorrente da oportunidade. Pode-se utilizar variáveis no conteúdo, exemplo: "{{opportunity_recurrent_value}}"
    probability: StringObjectAddEditConfig, // Probabilidade de fechamento da oportunidade, entre 0 e 100. Pode-se utilizar variáveis no conteúdo, exemplo: "{{opportunity_probability}}"
    tags: ArrayObjectAddEditConfig, // Lista de IDs das etiquetas associadas da oportunidade. Pode-se utilizar variáveis no conteúdo, exemplo: ["{{tag_id}}"]
    description: StringObjectAddEditConfig, // Descrição da oportunidade. Pode-se utilizar variáveis no conteúdo, exemplo: "{{opportunity_description}}"
    associateToCurrentChat: BooleanObjectAddEditConfig, // Se true, a oportunidade será associada ao atendimento atual.
    associateToCurrentContact: BooleanObjectAddEditConfig, // Se true, a oportunidade será associada ao contato atual do atendimento, se houver.
    products: {enabled: number, content: ProductCartConfig[]}, // Lista de produtos associados à oportunidade.
    customFormsData: { [key: string]: StringObjectAddEditConfig }, // Objeto contando o conteúdo dos campos dos formulários personalizados associados ao funil da oportunidade. Contém o ID do campo personalizado como chave e o valor do campo como valor. Pode-se utilizar variáveis no conteúdo, exemplo: {"custom_field_1": {enabled: true, content: "{{custom_field_1_content}}"}}.
}

/**
 * Carrinho de produtos associados a uma oportunidade
 */
export interface ProductCartConfig {
    id: number, // ID do produto. Não se pode utilizar variáveis.
    qty: number, // Quantidade do produto. Não se pode utilizar variáveis.
    discount: number, // Desconto aplicado ao valor produto. Não se pode utilizar variáveis.
    recurrentdiscount: number // Desconto aplicado ao valor recorrente produto. Não se pode utilizar variáveis.
}

/**
 * Configuração de um elemento do tipo winOpportunity
 *
 * Encerra uma oportunidade existente marcando-a como ganha. Se o estágio onde a oportunidade está associada não for um estágio que permite o ganho, esse elemento será ignorado.
 *
 * Tipos de fila: Todos
 * Tipos de fluxo: URAs e Automações
 */
export interface WinOpportunityConfig {
    opportunityId: string, // ID da oportunidade que será encerrada. Pode-se utilizar variáveis no conteúdo, exemplo: "{{opportunity_id}}"
    value: string, // Valor de fechamento da oportunidade. Pode-se utilizar variáveis no conteúdo, exemplo: "{{opportunity_value}}"
    recurrentValue: string, // Valor recorrente de fechamento da oportunidade. Pode-se utilizar variáveis no conteúdo, exemplo: "{{opportunity_recurrent_value}}"
    nextElementId: string, // ID do próximo elemento no fluxograma que será executado
}


/**
 * Configuração de um elemento do tipo loseOpportunity
 *
 * Encerra uma oportunidade existente marcando-a como perdida.
 *
 * Tipos de fila: Todos
 * Tipos de fluxo: URAs e Automações
 */
export interface LoseOpportunityConfig {
    opportunityId: string, // ID da oportunidade que será encerrada. Pode-se utilizar variáveis no conteúdo, exemplo: "{{opportunity_id}}"
    reason: string, // Motivo pelo qual a oportunidade foi perdida. Pode-se utilizar variáveis no conteúdo, exemplo: "{{opportunity_lose_reason}}"
    obs: string, // Observações sobre a perda da oportunidade. Pode-se utilizar variáveis no conteúdo, exemplo: "{{opportunity_lose_obs}}"
    nextElementId: string, // ID do próximo elemento no fluxograma que será executado
}


/**
 * Configuração de um elemento do tipo cloneOpportunity
 *
 * Clona uma oportunidade existente, criando uma nova oportunidade com os mesmos dados da oportunidade original.
 *
 * Tipos de fila: Todos
 * Tipos de fluxo: URAs e Automações
 */
export interface CloneOpportunityConfig {
    pipelineId: number, // ID do funil do CRM onde a nova oportunidade será associada. Não se pode utilizar variáveis.
    stageId: number, // ID do estágio do funil de vendas ao qual a nova oportunidade será associada. Não se pode utilizar variáveis.
    opportunityId: string, // ID da oportunidade que será clonada. Pode-se utilizar variáveis no conteúdo, exemplo: "{{opportunity_id}}"
    resultVariableName: string, // Nome da variável que receberá o objeto com as variáveis da nova oportunidade criada. Adicionar somente o nome da variável, sem chaves. Exemplo: "opportunity_result"
    associateToCurrentChat: boolean, // Se true, a nova oportunidade será associada ao atendimento atual.
    nextElementId: string, // ID do próximo elemento no fluxograma que será executado
}


/**
 * Configuração de um elemento do tipo moveOpportunity
 *
 * Move uma oportunidade existente para um novo estágio do funil de vendas.
 *
 * Tipos de fila: Todos
 * Tipos de fluxo: URAs e Automações
 */
export interface MoveOpportunityConfig {
    opportunityId: string, // ID da oportunidade que será movida. Pode-se utilizar variáveis no conteúdo, exemplo: "{{opportunity_id}}"
    stageId: number, // ID do estágio do funil de vendas ao qual a oportunidade será movida. Não se pode utilizar variáveis.
    pipelineId: number, // ID do funil de vendas ao qual a oportunidade está associada. Não se pode utilizar variáveis.
    nextElementId: string, // ID do próximo elemento no fluxograma que será executado
}


/**
 * Configuração de um elemento do tipo searchOpportunity
 *
 * Busca uma oportunidade na base de dados do sistema e disponibiliza seus dados em uma variável.
 *
 * Tipos de fila: Todos
 * Tipos de fluxo: URAs e Automações
 */
export interface SearchOpportunityConfig {
    resultVariableName: string, // Nome da variável que receberá o resultado da busca. Adicionar somente o nome da variável, sem chaves. Exemplo: "opportunity_result"
    searchField: "id" | "mainphone" | "mainmail", // Campo que será utilizado para buscar a oportunidade.
    searchValue: string, // Valor que será utilizado para buscar a oportunidade. Esse valor será comparado com o valor do campo especificado em searchField. Pode-se utilizar variáveis no conteúdo, exemplo: "{{search_value}}"
    pipelineId: number, // Se desejar, pode-se buscar somente oportunidades de um funil específico. Se 0, buscará em todos os funis, se preenchido, só buscará oportunidades do funil especificado. Não se pode utilizar variáveis.
    associateToCurrentChat: boolean, // Se true, a oportunidade encontrada será associada ao atendimento atual.
    nextElementId: string, // ID do próximo elemento no fluxograma que será executado
}


/**
 * Configuração de um elemento do tipo transferOpportunity
 *
 * Transfere uma oportunidade para um novo responsável.
 *
 * Tipos de fila: Todos
 * Tipos de fluxo: URAs e Automações
 */
export interface TransferOpportunityConfig {
    opportunityId: string, // ID da oportunidade que será transferida. Pode-se utilizar variáveis no conteúdo, exemplo: "{{opportunity_id}}"
    transferType: 0 | 1, // Tipo de transferência. 0 - Transferir selecionando o usuário automaticamente com base nos filtros, 1 - Transferência para um usuário específico
    autoTransferStrategy: 0 | 1 | 2, // Estratégia de transferência automática. Somente se transferType for 0. 0 - Transferir para o usuário com menos oportunidades associadas, 1 - Transferência circular, 2 - Selecionar um usuário de forma aleatória
    agentsFilters: string[], // Lista de filtros para seleção do novo responsável. Somente agentes que possuem ao menos um dos itens da lista serão selecionados. Somente se transferType for 0. Pode-se utilizar variáveis no conteúdo, exemplo: ["{{filter1}}", "{{filter2}}"]
    preferOnlineAgents: boolean, // Se true, a transferência será preferencialmente para agentes online no momento da transferência. Somente se transferType for 0.
    responsibleId: string, // ID do novo responsável pela oportunidade. Somente se transferType for 1. Pode-se utilizar variáveis no conteúdo, exemplo: "{{user_id}}"
    nextElementId: string, // ID do próximo elemento no fluxograma que será executado
}


/**
 * Configuração de um elemento do tipo insertFileOpportunity
 *
 * Associa um arquivo a uma oportunidade do sistema.
 *
 * Tipos de fila: Todos
 * Tipos de fluxo: URAs e Automações
 */
export interface InsertFileOpportunityConfig {
    opportunityId: string, // ID da oportunidade que receberá o arquivo. Pode-se utilizar variáveis no conteúdo, exemplo: "{{opportunity_id}}"
    fileId: string, // ID do arquivo que será associado a oportunidade. Pode-se utilizar variáveis no conteúdo, exemplo: "{{file_id}}"
    nextElementId: string, // ID do próximo elemento no fluxograma que será executado
}


/**
 * Configuração de um elemento do tipo clearOpportunityTasks
 *
 * Limpa todas as tarefas associadas a uma oportunidade. As tarefas são excluídas.
 *
 * Tipos de fila: Todos
 * Tipos de fluxo: URAs e Automações
 */
export interface ClearOpportunityTasksConfig {
    opportunityId: string, // ID da oportunidade que terá suas tarefas excluídas. Pode-se utilizar variáveis no conteúdo, exemplo: "{{opportunity_id}}"
    nextElementId: string, // ID do próximo elemento no fluxograma que será executado
}


/**
 * Configuração de um elemento do tipo freezeOpportunity
 *
 * Congela uma oportunidade, ocultando ela da visualização do agente.
 * Uma tarefa pode ser congelada por um período de tempo, após o qual ela será descongelada automaticamente.
 *
 * Tipos de fila: Todos
 * Tipos de fluxo: URAs e Automações
 */
export interface FreezeOpportunityConfig {
    opportunityId: string, // ID da oportunidade que será congelada. Pode-se utilizar variáveis no conteúdo, exemplo: "{{opportunity_id}}"
    freezeUntil: string, // String no formato "YYYY-MM-DD" que representa a data até a qual a oportunidade ficará congelada. Pode-se utilizar variáveis no conteúdo, exemplo: "{{freeze_until}}"
    nextElementId: string, // ID do próximo elemento no fluxograma que será executado
}


/**
 * Configuração de um elemento do tipo unfreezeOpportunity
 *
 * Descongela uma oportunidade congelada.
 *
 * Tipos de fila: Todos
 * Tipos de fluxo: URAs e Automações
 */
export interface UnfreezeOpportunityConfig {
    opportunityId: string, // ID da oportunidade que será descongelada. Pode-se utilizar variáveis no conteúdo, exemplo: "{{opportunity_id}}"
    nextElementId: string, // ID do próximo elemento no fluxograma que será executado
}


/**
 * Configuração de um elemento do tipo reopenOpportunity
 *
 * Reabre uma oportunidade que foi fechada anteriormente.
 *
 * Tipos de fila: Todos
 * Tipos de fluxo: URAs e Automações
 */
export interface ReopenOpportunityConfig {
    opportunityId: string, // ID da oportunidade que será reaberta. Pode-se utilizar variáveis no conteúdo, exemplo: "{{opportunity_id}}"
    nextElementId: string, // ID do próximo elemento no fluxograma que será executado
}


/**
 * Configuração de um elemento do tipo showForm
 *
 * Exibe um formulário pré cadastrado para que o agente possa preencher.
 * O formulário é exibido para o agente responsável pelo atendimento associado ao fluxo no momento e por isso esse elemento só pode ser utilizado em automações.
 * Se o fluxo não possuir um atendimento associado ou o atendimento não possuir agente responsável esse elemento é ignorado.
 * Após preenchido esse formulário inicia a execução da automação configurada, tendo os valores preenchidos disponíveis como variáveis.
 * Também é possível selecionar uma automação para ser executada caso o agente cancele o preenchimento do formulário.
 *
 * Tipos de fila: Todos
 * Tipos de fluxo: Somente automações
 */
export interface ShowFormConfig {
    type: 0 | 1, // Tipo do formulário. 0 - Formulário pré cadastrado, 1 - Formulário dinâmico
    formId: string, // ID do formulário pré cadastrado que será exibido. Só é utilizado caso o type seja 0. Pode-se utilizar variáveis no conteúdo, exemplo: "{{form_id}}"
    dynamicFormVarName: string, // Nome da variável que contém o objeto com as configurações do formulário dinâmico. Só é utilizado caso o type seja 1. Exemplo: "{{dynamic_form_var_name}}". A variável deve conter um objeto JSON com uma estrutura válida de formulário.
    successAutomationId: string, // ID da automação que será executada após o preenchimento do formulário. Pode-se utilizar variáveis no conteúdo, exemplo: "{{success_automation_id}}"
    cancelAutomationId: string, // ID da automação que será executada caso o agente cancele o preenchimento do formulário. Pode-se utilizar variáveis no conteúdo, exemplo: "{{cancel_automation_id}}"
    nextElementId: string, // ID do próximo elemento no fluxograma que será executado
}


/**
 * Configuração de um elemento do tipo removeAllTriggers
 *
 * Remove todos os gatilhos associados ao atendimento corrente. Se não houver atendimento corrente, esse elemento é ignorado.
 *
 * Tipos de fila: Todos
 * Tipos de fluxo: URAs e Automações
 */
export interface RemoveAllTriggersConfig {
    nextElementId: string, // ID do próximo elemento no fluxograma que será executado
}


/**
 * Configuração de um elemento do tipo addPersistent
 *
 * Adiciona um valor persistente ao banco de dados. Valores persistentes são armazenados no banco de dados e podem ser acessados em qualquer, inclusive por outros atendimentos em outras filas.
 * Útil para manter registros de informações importantes que devem ser acessadas em diferentes momentos e de forma global, como por exemplo, um contador de atendimentos ou chaves de autenticação dinâmicas em serviços externos.
 *
 * Tipos de fila: Todos
 * Tipos de fluxo: URAs e Automações
 */
export interface AddPersistentConfig {
    key: string, // Chave que será utilizada para acessar o valor persistente. Pode-se utilizar variáveis no conteúdo, exemplo: "{{persistent_key}}"
    value: string, // Valor persistente que será armazenado. Pode-se utilizar variáveis no conteúdo, exemplo: "{{persistent_value}}"
    ttl: number, // Tempo em segundos que o valor persistente ficará armazenado. Se 0, o valor persistente será armazenado indefinidamente.
    nextElementId: string, // ID do próximo elemento no fluxograma que será executado
}


/**
 * Configuração de um elemento do tipo searchPersistent
 *
 * Busca um valor persistente no banco de dados e disponibiliza seu valor em uma variável.
 *
 * Tipos de fila: Todos
 * Tipos de fluxo: URAs e Automações
 */
export interface SearchPersistentConfig {
    key: string, // Chave que será utilizada para acessar o valor persistente. Pode-se utilizar variáveis no conteúdo, exemplo: "{{persistent_key}}"
    resultVariableName: string, // Nome da variável que receberá o valor persistente encontrado. Adicionar somente o nome da variável, sem chaves. Exemplo: "persistent_result"
    nextElementId: string, // ID do próximo elemento no fluxograma que será executado
}


/**
 * Configuração de um elemento do tipo removePersistent
 *
 * Remove um valor persistente do banco de dados.
 *
 * Tipos de fila: Todos
 * Tipos de fluxo: URAs e Automações
 */
export interface RemovePersistentConfig {
    key: string, // Chave que será utilizada para identificar o valor persistente que deve ser removido. Pode-se utilizar variáveis no conteúdo, exemplo: "{{persistent_key}}"
    nextElementId: string, // ID do próximo elemento no fluxograma que será executado
}


/**
 * Configuração de um elemento do tipo replyComment
 *
 * Responde a um comentário recebido em uma publicação do instagram.
 * Pode-se identificar se uma mensagem recebida é na verdade um comentário utilizando a variável {{message_is_comment}}.
 * Comentários só podem ser respondidos por esse elemento. O elemento de enviar mensagem na realidade irá enviar um direct para a conta do cliente ao invés de responder o comentário na publicação.
 *
 * Tipos de fila: Somente IG
 * Tipos de fluxo: URAs e Automações
 */
export interface ReplyCommentConfig {
    text: string, // Texto da resposta ao comentário. Pode-se utilizar variáveis no conteúdo, exemplo: "Resposta ao comentário: {{comment_text}}"
    nextElementId: string, // ID do próximo elemento no fluxograma que será executado
}


// ### Elementos de operações com Instâncias de clientes

/**
 * Configuração de um elemento do tipo searchInstance
 *
 * Esse elemento só está disponível em instâncias especiais de parceiros que realizam a revenda do sistema.
 * Busca uma instância de cliente na base de dados do sistema e disponibiliza seus dados em duas variáveis.
 * A primeira prefixo_list é uma variável do tipo lista, com os objetos de todas as instâncias encontradas, conforme documentação das variáveis de instância.
 * A segunda prefixo_count é uma variável do tipo número, com a quantidade de instâncias encontradas.
 * Em ambas "prefixo" é um prefixo que deve ser informado na configuração do elemento.
 *
 * Tipos de fila: Todos
 * Tipos de fluxo: URAs e Automações
 */
export interface SearchInstanceConfig {
    searchField: "id" | "document" | "name", // Campo que será utilizado para buscar a instância. id - ID da instância, document - Documento da instância, name - Nome da instância
    searchValue: string, // Valor que será utilizado para buscar a instância. Esse valor será comparado com o valor do campo especificado em searchField. Pode-se utilizar variáveis no conteúdo, exemplo: "{{search_value}}"
    resultVariablePrefix: string, // Prefixo que será utilizado para nomear as variáveis que receberão os resultados da busca. Adicionar somente o prefixo, sem chaves. Exemplo: "instance"
    nextElementId: string, // ID do próximo elemento no fluxograma que será executado
}


/**
 * Objeto de configuração de uma instância de cliente
 */
export interface InstanceConfig {
    name: string, // Nome da instância. Essa informação é obrigatória.
    document: string, // Documento da instância. Essa informação é obrigatória.
    planId: string, // ID do plano contratado para a instância. Essa informação é obrigatória.
    contact: InstanceContactConfig, // Dados de contato da instância. Essa informação é opcional
}

export interface InstanceContactConfig {
    clientName: string, // Nome do cliente associado a instância. Opcional.
    contactName1: string, // Nome do contato 1 associado a instância. Opcional.
    contactPhone1: string, // Telefone do contato 1 associado a instância. Opcional.
    contactMail1: string, // Email do contato 1 associado a instância. Opcional.
    contactName2: string, // Nome do contato 2 associado a instância. Opcional.
    contactPhone2: string, // Telefone do contato 2 associado a instância. Opcional.
    contactMail2: string, // Email do contato 2 associado a instância. Opcional.
}

/**
 * Configuração de um elemento do tipo createInstance
 *
 * Esse elemento só está disponível em instâncias especiais de parceiros que realizam a revenda do sistema.
 * Cria uma nova instância de cliente no sistema.
 * Cria as variáveis:
 * - prefixo_result com o resultado da criação, tendo 1 para caso a criação tenha sido criada com sucesso e 0 caso tenha havido falha.
 * - prefixo_message com a mensagem de erro, caso tenha havido falha.
 * - prefixo_instance com o objeto da instância criada, caso tenha sido criada com sucesso.
 * Em todas "prefixo" é um prefixo que deve ser informado na configuração do elemento.
 *
 * Tipos de fila: Todos
 * Tipos de fluxo: URAs e Automações
 */
export interface CreateInstanceConfig {
    instance: InstanceConfig, // Dados para criação da instância
    resultVariablePrefix: string, // Prefixo que será utilizado para nomear as variáveis que receberão os resultados da criação. Adicionar somente o prefixo, sem chaves. Exemplo: "instance"
    nextElementId: string, // ID do próximo elemento no fluxograma que será executado
}


/**
 * Configuração de um elemento do tipo editInstanceContactDetails
 *
 * Esse elemento só está disponível em instâncias especiais de parceiros que realizam a revenda do sistema.
 * Edita os dados de contato de uma instância de cliente no sistema.
 *
 * Tipos de fila: Todos
 * Tipos de fluxo: URAs e Automações
 */
export interface EditInstanceContactDetailsConfig {
    instanceId: string, // ID da instância que terá seus dados de contato editados. Pode-se utilizar variáveis no conteúdo, exemplo: "{{instance_id}}"
    contact: InstanceContactConfig, // Dados de contato da instância. Essa informação é opcional
    nextElementId: string, // ID do próximo elemento no fluxograma que será executado
}


/**
 * Configuração de um elemento do tipo markInstanceForExclusion
 *
 * Esse elemento só está disponível em instâncias especiais de parceiros que realizam a revenda do sistema.
 * Marca uma instância de cliente para exclusão do sistema. Significa que o cliente cancelou o contrato e a instância será excluída do sistema em um prazo determinado.
 * A instância será efetivamente cancelada e excluída conforme o prazo de aviso prévio previsto no plano contratado, nenhum prazo necessita ser informado aqui.
 *
 * Tipos de fila: Todos
 * Tipos de fluxo: URAs e Automações
 */
export interface MarkInstanceForExclusionConfig {
    instanceId: string, // ID da instância que será marcada para exclusão. Pode-se utilizar variáveis no conteúdo, exemplo: "{{instance_id}}"
    nextElementId: string, // ID do próximo elemento no fluxograma que será executado
}


/**
 * Configuração de um elemento do tipo reactivateInstance
 *
 * Esse elemento só está disponível em instâncias especiais de parceiros que realizam a revenda do sistema.
 * Reativa uma instância de cliente que foi marcada para exclusão porém ainda não foi efetivamente cancelada e excluída.
 *
 * Tipos de fila: Todos
 * Tipos de fluxo: URAs e Automações
 */
export interface ReactivateInstanceConfig {
    instanceId: string, // ID da instância que será reativada. Pode-se utilizar variáveis no conteúdo, exemplo: "{{instance_id}}"
    nextElementId: string, // ID do próximo elemento no fluxograma que será executado
}


/**
 * Configuração de um elemento do tipo blockInstance
 *
 * Esse elemento só está disponível em instâncias especiais de parceiros que realizam a revenda do sistema.
 * Bloqueia uma instância de cliente no sistema. Significa que o cliente não poderá mais acessar o sistema até que a instância seja desbloqueada.
 * Pode ser utilizado por exemplo para bloquear clientes inadimplentes.
 *
 * Tipos de fila: Todos
 * Tipos de fluxo: URAs e Automações
 */
export interface BlockInstanceConfig {
    instanceId: string, // ID da instância que será bloqueada. Pode-se utilizar variáveis no conteúdo, exemplo: "{{instance_id}}"
    nextElementId: string, // ID do próximo elemento no fluxograma que será executado
}


/**
 * Configuração de um elemento do tipo unblockInstance
 *
 * Esse elemento só está disponível em instâncias especiais de parceiros que realizam a revenda do sistema.
 * Desbloqueia uma instância de cliente que foi bloqueada anteriormente.
 *
 * Tipos de fila: Todos
 * Tipos de fluxo: URAs e Automações
 */
export interface UnblockInstanceConfig {
    instanceId: string, // ID da instância que será desbloqueada. Pode-se utilizar variáveis no conteúdo, exemplo: "{{instance_id}}"
    nextElementId: string, // ID do próximo elemento no fluxograma que será executado
}


/**
 * Configuração de um elemento do tipo restartInstance
 *
 * Esse elemento só está disponível em instâncias especiais de parceiros que realizam a revenda do sistema.
 * Reinicia o serviço de uma instância de cliente no sistema. Podendo ser utilizado para reiniciar o serviço de um cliente que esteja com problemas de acesso.
 * Esse elemento reinicia o serviço, porém não reinicia o container, sendo um reinício mais rápido e simples.
 *
 * Tipos de fila: Todos
 * Tipos de fluxo: URAs e Automações
 */
export interface RestartInstanceConfig {
    instanceId: string, // ID da instância que terá seu serviço reiniciado. Pode-se utilizar variáveis no conteúdo, exemplo: "{{instance_id}}"
    nextElementId: string, // ID do próximo elemento no fluxograma que será executado
}


/**
 * Configuração de um elemento do tipo restartInstanceContainer
 *
 * Esse elemento só está disponível em instâncias especiais de parceiros que realizam a revenda do sistema.
 * Reinicia o container de uma instância de cliente no sistema. Podendo ser utilizado para reiniciar o container de um cliente que esteja com problemas de acesso.
 * Esse elemento reinicia o container, sendo um mais lento, que reinícia inclusive o sistema operacional associado a instância do cliente.
 *
 * Tipos de fila: Todos
 * Tipos de fluxo: URAs e Automações
 */
export interface RestartInstanceContainerConfig {
    instanceId: string, // ID da instância que terá seu container reiniciado. Pode-se utilizar variáveis no conteúdo, exemplo: "{{instance_id}}"
    nextElementId: string, // ID do próximo elemento no fluxograma que será executado
}


/**
 * Configuração de um elemento do tipo updateInstance
 *
 * Esse elemento só está disponível em instâncias especiais de parceiros que realizam a revenda do sistema.
 * Atualiza os dados de uma instância de cliente no sistema, como seu plano e seus extras contratados.
 * Cria as variáveis:
 * - prefixo_result com o resultado da criação, tendo 1 para caso a criação tenha sido criada com sucesso e 0 caso tenha havido falha.
 * - prefixo_message com a mensagem de erro, caso tenha havido falha.
 *
 * Tipos de fila: Todos
 * Tipos de fluxo: URAs e Automações
 */
export interface UpdateInstanceConfig {
    instanceId: string, // ID da instância que terá seus dados atualizados. Pode-se utilizar variáveis no conteúdo, exemplo: "{{instance_id}}"
    planId: string, // ID do novo plano contratado para a instância. Pode-se utilizar variáveis no conteúdo, exemplo: "{{plan_id}}"
    extraAgents: string, // Quantidade de agentes extras contratados para a instância. Pode-se utilizar variáveis no conteúdo, exemplo: "{{extra_agents}}". Deve conter um número.
    extraStorage: string, // Quantidade de armazenamento extra em GB (gigabytes) contratado para a instância. Pode-se utilizar variáveis no conteúdo, exemplo: "{{extra_storage}}". Deve conter um número.
    resultVariablePrefix: string, // Prefixo que será utilizado para nomear as variáveis que receberão os resultados da atualização. Adicionar somente o prefixo, sem chaves. Exemplo: "instance"
    nextElementId: string, // ID do próximo elemento no fluxograma que será executado
}

// ### Fim dos elementos de operações com Instâncias de clientes


/**
 * Configuração de um elemento do tipo sendTemplate
 *
 * Envia um template de mensagem pré aprovada para o cliente.
 *
 * Tipos de fila: Somente WA Cloud API
 * Tipos de fluxo: URAs e Automações
 */
export interface SendTemplateConfig {
    templateId: number, // ID do template de mensagem pré aprovado que será enviado ao cliente.
    templateData: string[], // Lista de dados que serão utilizados para preencher o template de mensagem. Pode-se utilizar variáveis no conteúdo, exemplo: ["{{data1}}", "{{data2}}"]
    nextElementId: string, // ID do próximo elemento no fluxograma que será executado
}


/**
 * Configuração de um elemento do tipo markTaskAsDone
 *
 * Marca uma tarefa como concluída.
 *
 * Tipos de fila: Todos
 * Tipos de fluxo: URAs e Automações
 */
export interface MarkTaskAsDoneConfig {
    taskId: string, // ID da tarefa que será marcada como concluída. Pode-se utilizar variáveis no conteúdo, exemplo: "{{task_id}}"
    nextElementId: string, // ID do próximo elemento no fluxograma que será executado
}


/**
 * Configuração de um elemento do tipo addToWaitingList
 *
 * Envia o atendimento associado ao fluxo para a fila de espera.
 * Atendimentos na fila de espera não são distribuídos automaticamente para os agentes, sendo necessário que um agente manualmente puxe o atendimento.
 * Caso o fluxo não possua um atendimento associado esse elemento é ignorado.
 *
 * Tipos de fila: Todos
 * Tipos de fluxo: URAs e Automações
 */
export interface AddToWaitingListConfig {
    nextElementId: string, // ID do próximo elemento no fluxograma que será executado
}


/**
 * Configuração de um elemento do tipo removeFromWaitingList
 *
 * Remove o atendimento associado ao fluxo da fila de espera.
 * Caso o fluxo não possua um atendimento associado esse elemento é ignorado.
 *
 * Tipos de fila: Todos
 * Tipos de fluxo: URAs e Automações
 */
export interface RemoveFromWaitingListConfig {
    nextElementId: string, // ID do próximo elemento no fluxograma que será executado
}


/**
 * Configuração de um elemento do tipo addInformationCard
 *
 * Adiciona um cartão de informações ao atendimento associado ao fluxo.
 * Cartões de informações são exibidos no painel de atendimento e podem conter informações importantes sobre o atendimento.
 *
 * Tipos de fila: Todos
 * Tipos de fluxo: URAs e Automações
 */
export interface AddInformationCardConfig {
    type: 0 | 1, // Tipo do cartão de informações. 0 - Cartão de informações pré cadastrado, 1 - Cartão de informações dinâmico
    cardId: string, // ID do cartão de informações pré cadastrado que será exibido. Só é utilizado caso o type seja 0. Pode-se utilizar variáveis no conteúdo, exemplo: "{{card_id}}"
    dynamicCardVarName: string, // Nome da variável que contém o objeto com as configurações do cartão de informações dinâmico. Só é utilizado caso o type seja 1. Exemplo: "{{dynamic_card_var_name}}". A variável deve conter um objeto JSON com uma estrutura válida de cartão de informações.
    sessionId: string, // ID da sessão onde o cartão será exibido. Pode-se haver várias sessões com cartões. A sessão serve apenas para organização da exibição dos cartões. Pode-se utilizar variáveis no conteúdo, exemplo: "{{session_id}}"
    sessionName: string, // Nome da sessão onde o cartão será exibido. Pode-se utilizar variáveis no conteúdo, exemplo: "{{session_name}}"
    nextElementId: string, // ID do próximo elemento no fluxograma que será executado
}


/**
 * Configuração de um elemento do tipo removeInformationCard
 *
 * Remove um cartão de informações do atendimento associado ao fluxo.
 *
 * Tipos de fila: Todos
 * Tipos de fluxo: URAs e Automações
 */
export interface RemoveInformationCardConfig {
    cardId: string, // ID do cartão de informações que será removido. Pode-se utilizar variáveis no conteúdo, exemplo: "{{card_id}}"
    sessionId: string, // ID da sessão onde o cartão que será removido está. Pode-se utilizar variáveis no conteúdo, exemplo: "{{session_id}}"
    nextElementId: string, // ID do próximo elemento no fluxograma que será executado
}


/**
 * Configuração de um elemento do tipo showSnackNotification
 *
 * Exibe uma notificação de snack para o agente responsável pelo atendimento associado ao fluxo.
 * Caso o fluxo não possua um atendimento associado ou o atendimento não possua um agente esse elemento é ignorado.
 *
 * Tipos de fila: Todos
 * Tipos de fluxo: URAs e Automações
 */
export interface ShowSnackNotificationConfig {
    message: string, // Mensagem que será exibida na notificação de snack. Pode-se utilizar variáveis no conteúdo, exemplo: "Nova notificação: {{notification_message}}"
    duration: number, // Duração em milliseconds que a notificação de snack será exibida. Não se pode utilizar variáveis. Exemplo: 2000 para 2 segundos.
    buttonText: string, // Texto do botão que será exibido na notificação de snack. Pode-se utilizar variáveis no conteúdo, exemplo: "Fechar {{notification_type}}"
    style: "default" | "info" | "success" | "alert" | "warning" | "danger", // Estilo visual da notificação de snack.
    nextElementId: string, // ID do próximo elemento no fluxograma que será executado
}


/**
 * Configuração de um elemento do tipo addInformationCardToMessage
 *
 * Adiciona um cartão de informações a uma mensagem.
 * Cartões de informações são exibidos no painel de atendimento e podem conter informações importantes sobre o atendimento.
 * Esse elemento associa o cartão de informação a uma mensagem específica, sendo exibido junto a mensagem, ao invés de no painel de cartões.
 * Para cartões de informação associados a mensagens, somente cartões dinâmicos são permitidos.
 * Uma mensagem só pode possuir um único cartão de informação associado, caso um novo cartão seja associado, o anterior é removido.
 *
 * Tipos de fila: Todos
 * Tipos de fluxo: URAs e Automações
 */
export interface AddInformationCardToMessageConfig {
    messageId: string, // ID da mensagem que terá o cartão de informações associado. Pode-se utilizar variáveis no conteúdo, exemplo: "{{message_id}}"
    dynamicCardVarName: string, // Nome da variável que contém o objeto com as configurações do cartão de informações dinâmico. Exemplo: "{{dynamic_card_var_name}}". A variável deve conter um objeto JSON com uma estrutura válida de cartão de informações.
    nextElementId: string, // ID do próximo elemento no fluxograma que será executado
}


/**
 * Configuração de um elemento do tipo removeInformationCardFromMessage
 *
 * Remove um cartão de informações associado a uma mensagem.
 *
 * Tipos de fila: Todos
 * Tipos de fluxo: URAs e Automações
 */
export interface RemoveInformationCardFromMessageConfig {
    messageId: string, // ID da mensagem que terá o cartão de informações removido. Pode-se utilizar variáveis no conteúdo, exemplo: "{{message_id}}"
    nextElementId: string, // ID do próximo elemento no fluxograma que será executado
}


/**
 * Configuração de um elemento do tipo sendFlow
 *
 * Envia uma mensagem com um Whatsapp Flow pré aprovado para o cliente.
 *
 * Tipos de fila: Somente WA Cloud API
 * Tipos de fluxo: URAs e Automações
 */
export interface SendFlowConfig {
    flowId: string, // ID do Whatsapp Flow pré aprovado que será enviado ao cliente. Pode-se utilizar variáveis no conteúdo, exemplo: "{{flow_id}}"
    initialScreenId: string, // ID da tela inicial do Whatsapp Flow que será enviada ao cliente. Pode-se utilizar variáveis no conteúdo, exemplo: "{{initial_screen_id}}"
    headerText: string, // Texto que será exibido no cabeçalho do Whatsapp Flow. Pode-se utilizar variáveis no conteúdo, exemplo: "{{header_text}}"
    footerText: string, // Texto que será exibido no rodapé do Whatsapp Flow. Pode-se utilizar variáveis no conteúdo, exemplo: "{{footer_text}}"
    bodyText: string, // Texto que será exibido no corpo do Whatsapp Flow. Pode-se utilizar variáveis no conteúdo, exemplo: "{{body_text}}"
    btnText: string, // Texto que será exibido no botão de ação do Whatsapp Flow. Pode-se utilizar variáveis no conteúdo, exemplo: "{{btn_text}}"
    flowData: { key: string, value: string }[], // Lista de dados que serão utilizados para preencher o Whatsapp Flow. Necessário só quando o flow esperar dados. Pode-se utilizar variáveis no conteúdo, exemplo: [{key: "{{data1}}", value: "{{data2}}"]
    nextElementId: string, // ID do próximo elemento no fluxograma que será executado
}


/**
 * Configuração de um elemento do tipo clearFlowDataFromMessage
 *
 * Limpa os dados da resposta de um Whatsapp Flow da mensagem mais recente recebida, excluindo inclusive do banco de dados.
 * Por padrão, os dados de resposta de um Whatsapp Flow são mantidos na mensagem e salvos no banco de dados, para que possam ser utilizados em elementos subsequentes.
 * Porém podem existir situações onde não se deseja que esses dados permaneçam salvos no banco de dados, como o caso de possuir dados sensíveis ou senhas.
 *
 * Tipos de fila: Todos
 * Tipos de fluxo: URAs e Automações
 */
export interface ClearFlowDataFromMessageConfig {
    nextElementId: string, // ID do próximo elemento no fluxograma que será executado
}


/**
 * Configuração de um elemento do tipo aiAssistant
 *
 * Entrega o controle do atendimento para o assistente de IA.
 * O assistente de IA é um sistema de inteligência artificial, que pode realizar diversas operações, como responder perguntas, realizar buscas, executar automações no sistema, entre outros.
 * O fluxo permanecerá pausado até que o assistente de IA finalize o atendimento ou solicite a transferência.
 * O assistente de IA pode ser configurado para transferir o atendimento para um agente humano em caso de dúvidas ou solicitação do cliente.
 * Caso o assistente de IA transfira o atendimento para um agente humano, o fluxo será retomado. A variável assistant_transfer_reason conterá o motivo da transferência.
 *
 * Tipos de fila: Todos
 * Tipos de fluxo: Somente URA
 */
export interface AiAssistantConfig {
    assistantId: string, // ID do assistente de IA que será utilizado para o atendimento. Pode-se utilizar variáveis no conteúdo, exemplo: "{{assistant_id}}"
    nextElementId: string, // ID do próximo elemento no fluxograma que será executado caso o assistente solicite que o atendimento seja encerrado
    transferNextElementId: string // ID do próximo elemento no fluxograma que será executado caso o assistente solicite a transferência do atendimento, caso o atendimento saia por aqui, a variável assistant_transfer_reason será criada e conterá o motivo da transferência
}


/**
 * Configuração de um elemento do tipo aiAddContextToAssistant
 *
 * Esse elemento adiciona informação ao contexto do assistente de IA.
 * Pode ser utilizado para informar ao assistente de IA informações importantes sobre o atendimento, como por exemplo, o ID de uma oportunidade, o ID de um cliente, ou qualquer outra informação relevante.
 * Também pode ser utilizado para informar ao assistente sobre o retorno de uma operação realizada no fluxo, como por exemplo, o resultado de uma busca, o resultado de uma operação de banco de dados, requisições HTTP ou qualquer outro resultado relevante.
 * Será tipicamente utilizado para retornar para o assistente o resultado de uma operação quando este solicitar a execução de uma automação, sendo usado no final dessa automação para retornar o resultado ao contexto do assistente.
 * Exemplo: O assistente executa uma automação que realiza uma requisição HTTP a um serviço interno que informa se o cliente possui débito em aberto, o resultado dessa requisição é informado ao assistente para que ele possa tomar decisões baseadas nesse resultado.
 * Esse elemento só terá efeito se for usado em uma automação sendo executada por um assistente. Caso seja utilizado em um fluxo normal, será ignorado.
 *
 * Tipos de fila: Todos
 * Tipos de fluxo: Somente automações
 */
export interface AiAddContextToAssistantConfig {
    context: string, // Contexto que será adicionado ao assistente de IA. Pode-se utilizar variáveis no conteúdo, exemplo: "{{request_result}}"
    nextElementId: string // ID do próximo elemento no fluxograma que será executado
}


/**
 * Configuração de um elemento do tipo aiProcessFile
 *
 * Processa um arquivo ou uma informação de texto utilizando uma Inteligência Artificial (LLM, como gpt4o ou similar).
 * Pode-se ou não anexar um arquivo como parte do processamento.
 *
 * Tipos de fila: Todos
 * Tipos de fluxo: URAs e Automações
 */
export interface AiProcessFileConfig {
    model: AiModels, // Modelo de IA que será utilizado para processar o arquivo ou texto
    fileId: string, // ID do arquivo que será processado. Pode-se utilizar variáveis no conteúdo, exemplo: "{{file_id}}". Não é obrigatório que haja um arquivo.
    instruction: string, // Instrução que está sendo enviada para a IA. Pode-se utilizar variáveis no conteúdo, exemplo: "{{instruction}}"
    includeAllMessages: boolean, // Indica se todas as mensagens do atendimento devem ser enviadas para a IA junto com a instrução. Caso seja false, somente a instrução será enviada, junto com o arquivo, se este existir.
    resultVariableName: string, // Nome da variável que receberá o resultado do processamento. Adicionar somente o nome da variável, sem chaves. Exemplo: "ai_result"
    disableSecurity: boolean, // Se true, desabilita a segurança do modelo de IA. Pode ser utilizado para modelos que necessitam de permissões especiais.
    outputAsJson: boolean, // Se true, o resultado será retornado como um objeto JSON. Caso contrário, será retornado como texto.
    nextElementId: string, // ID do próximo elemento no fluxograma que será executado
}


/**
 * Configuração de um elemento do tipo aiStopAssistant
 *
 * Interrompe a execução do assistente de IA, mesmo que esse não tenha concluído o atendimento nem solicitado o encerramento ou transferência.
 * Esse elemento só pode ser utilizado em automações executadas por assistentes de IA.
 * Caso esse elemento seja utilizado, o fluxo original que atribuiu o atendimento ao assistente continuará a execução normalmente, saindo como se o atendimento tivesse sido transferido pelo assitente. Neste caso, a variável assistant_transfer_reason conterá "execution_stopped".
 *
 * Tipos de fila: Todos
 * Tipos de fluxo: Somente automações
 */
export interface AiStopAssistantConfig {
    nextElementId: string, // ID do próximo elemento no fluxograma que será executado
}


/**
 * Configuração de um elemento do tipo aiStopMessage
 *
 * Interrompe o envio de uma mensagem gerada pelo assistente de IA.
 * Esse elemento só tem efeito em automações sendo executadas pela etapa de pós processamento de uma mensagem gerada por um assistente de IA.
 * Ela é útil caso por algum motivo não se deseja permitir o envio da mensagem original gerada por assistente.
 * Um exemplo de uso é caso se vá converter as respostas do assistente, geradas como texto, em áudio, enviando o áudio e impedindo o envio da mensagem original em texto.
 *
 * Tipos de fila: Todos
 * Tipos de fluxo: Somente automações
 */
export interface AiStopMessageConfig {
    nextElementId: string, // ID do próximo elemento no fluxograma que será executado
}

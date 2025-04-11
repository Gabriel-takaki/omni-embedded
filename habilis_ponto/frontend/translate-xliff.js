// 'ca-ca', 'et-et',
const languages = [
    {code: 'es-es', name: 'Espanhol da Espanha'},
    {code: 'fr-fr', name: 'Frânces'},
    {code: 'en-us', name: 'Inglês dos Estados Unidos'},
    {code: 'en-gb', name: 'Inglês da Inglaterra'},
    {code: 'es-ar', name: 'Espanhol da Argentina'},
    {code: 'de-de', name: 'Alemão'},
    {code: 'nl-be', name: 'Holandês'},
    {code: 'it-it', name: 'Italiano'},
    {code: 'pt-pt', name: 'Português de Portugal'}
];

// Importar módulos necessários
const fs = require('fs');
const path = require('path');
const OpenAIApi = require('openai');
const {XMLParser, XMLBuilder} = require('fast-xml-parser');
const {VertexAI} = require('@google-cloud/vertexai');

// Configuração da API OpenAI
const openai = new OpenAIApi({
    apiKey: "sk-svcacct-AQEEytkBAHlr-RBv0AERyCZJ-SVMluGXI_9d7LcL4I0LyB4fQaQa8apynsHqslJcopXrT3BlbkFJbJS9erg7WAJh4EZfYWuWZbtdjEsATEMqg35r9eGTjbnMnDDjvcHEuGnAt69tjqphraEA",
    timeout: 720000
});

const reducedCode = ['fr-fr', 'en-us', 'es-es', 'de-de', 'nl-be', 'ca-ca', 'et-et', 'it-it'];

// Executa a tradução utilizando o Gemini do Google
async function generate_from_text_input(prompt = '') {
    const vertexAI = new VertexAI({
        project: 'coastal-emitter-237821',
        location: 'southamerica-east1',
        googleAuthOptions: {keyFile: './vertex.json'}
    });

    const generativeModel = vertexAI.getGenerativeModel({
        model: 'gemini-1.5-flash',
        generationConfig: {
            maxOutputTokens: 8192
        }
    });

    try {
        const resp = await generativeModel.generateContent(prompt);
        const contentResponse = await resp.response;
        return contentResponse;
    } catch (error) {
        console.error('Erro ao gerar conteúdo com Vertex AI:', error);
        throw new Error('Erro ao gerar conteúdo com Vertex AI');
    }

}

// Função principal
async function translateXLIFF(language) {
    try {

        // Configurações
        const inputFilePath = 'messages.xlf'; // Caminho do arquivo XLIFF de entrada
        // const inputFilePath = 'trans.test.xlf'; // Caminho do arquivo XLIFF de entrada
        const outputFilePath = `messages.${language.code}.xlf`; // Caminho do arquivo XLIFF de saída
        const targetLanguage = language; // Código do idioma alvo (por exemplo, 'fr' para francês)

        // Apaga o outputfile caso ele já exista
        if (fs.existsSync(outputFilePath)) {
            fs.unlinkSync(outputFilePath);
        }

        // Ler o arquivo XLIFF
        const xliffData = fs.readFileSync(inputFilePath, 'utf8');

        // Parsear o XML com preserveOrder: true
        const parser = new XMLParser({
            ignoreAttributes: false,
            attributeNamePrefix: '@_',
            preserveOrder: true,
        });
        const xliffObj = parser.parse(xliffData);

        // Encontrar o nó 'xliff'
        const xliffNode = findNodeByName(xliffObj, 'xliff');
        if (!xliffNode) {
            throw new Error("Nó 'xliff' não encontrado no arquivo de entrada.");
        }

        const xliffAttributes = xliffNode[0][':@'];
        if (xliffAttributes && xliffAttributes['@_source-language']) {
            xliffAttributes['@_target-language'] = reducedCode.includes(language.code) ? language.code.split('-')[0] : language.code;
        }

        // Encontrar os nós 'file'
        const fileNodes = findNodesByName(xliffNode, 'file');
        // Lista com todos os trans-units
        let transUnits = [];

        // Processar cada 'file'
        fileNodes.forEach((fileNode) => {
            // Encontrar o nó 'body'
            const bodyNode = findNodeByName(fileNode, 'body');
            if (bodyNode) {
                for (const item of bodyNode) {
                    if (item['trans-unit']) {
                        // Se o nó é um trans-unit, adiciona à lista
                        transUnits.push(item);
                    }
                }
            }
        });

        // Monta o mapa de IDs com os traduzíveis
        const idsMap = createSourcesMap(transUnits);

        // Dividir trans-units em chunks
        const chunks = chunkTransUnits(idsMap);

        // Traduzir cada chunk
        console.log('Iniciando processamento dos chunks. ', chunks.length, 'chunks encontrados. Idioma: ', language.name);
        for (let i = 0; i < chunks.length; i++) {

            console.log('Processando chunk ', i + 1, 'de', chunks.length, '. Idioma: ', language.name);
            const chunk = chunks[i];

            // Criar o prompt para a API
            const prompt = createPrompt(chunk, language);

            // Salva o prompt para facilitar revisão e resolução de problemas
            fs.writeFileSync(`./chunks/prompt-chunk-${i+1}.txt`, prompt, 'utf8');

            let time = Date.now();

            let response;
            let tryAgain = true;
            let tryCount = 0;

            // Chamar a API da OpenAI
            while (tryAgain) {
                tryAgain = false;
                tryCount++;
                try {
                    response = await openai.chat.completions.create({
                        model: 'gpt-4o-mini',
                        messages: [{role: 'user', content: prompt}],
                        max_tokens: 5000
                    });
                } catch (e) {
                    console.log('Erro no OpenAI, tentativa', tryCount, e);
                    tryAgain = true;
                }
                if (tryCount > 5) {
                    break;
                }
            }

            console.log('Tempo de resposta OpenAI: ', Date.now() - time);

            // time = Date.now();
            // const googleResponse = await generate_from_text_input(prompt);
            // console.log('Tempo de resposta Google: ', Date.now() - time);

            // Salva o retorno para facilitar revisão e resolução de problemas
            fs.writeFileSync(`./chunks/reply-chunk-${i+1}.txt`, response.choices[0].message.content.trim(), 'utf8');
            // fs.writeFileSync(`./chunks/reply-chunk-${i+1}.txt`, googleResponse.candidates[0].content.parts[0].text.trim(), 'utf8');

            // console.log('Resposta OpenAI', response.choices[0].message.content);
            // console.log('Resposta Google', googleResponse.candidates[0].content.parts[0].text);

            await new Promise(resolve => setTimeout(resolve, 10));

            // Obter a resposta
            // const translatedTexts = parseResponse(googleResponse.candidates[0].content.parts[0].text.trim());
            const translatedTexts = parseResponse(response.choices[0].message.content.trim());

            // Substituir os textos traduzidos nos objetos
            for (const translation of translatedTexts) {
                if (translation.key) {
                    const index = parseInt(translation.key) - 1;
                    const unit = chunk[index];
                    if (!unit) {
                        console.warn('Índice não encontrado:', translation.key, index, translation.text);
                        continue;
                    }
                    unit.target['#text'] = translation.text;
                }
            }

        }

        // Construir o novo XML
        const builder = new XMLBuilder({
            ignoreAttributes: false,
            attributeNamePrefix: '@_',
            preserveOrder: true,
        });
        const newXmlData = builder.build(xliffObj);

        // Escrever o arquivo de saída
        fs.writeFileSync(outputFilePath, newXmlData, 'utf8');

        console.log('Tradução concluída. Arquivo salvo em:', outputFilePath);

    } catch (error) {
        console.error('Erro durante a tradução:', error);
    }
}

function createSourcesMap(transUnits) {

    // Mapa com o ID do item como chave e o item como conteúdo
    const itensIdMap = {};

    // Processa todas as trans units alimentando o mapa
    for (let x = 0; x < transUnits.length; x++) {
        const attrs = transUnits[x][':@'];
        const id = attrs ? attrs['@_id'] : null;

        if (!id) {
            console.warn(`trans-unit sem '@_id' encontrado no índice ${x}.`);
            continue;
        }

        const sources = findNodesByName(transUnits[x]['trans-unit'], 'source');

        // Faz uma cópia do source como target e adiciona à trans-unit
        const targets = {'target': JSON.parse(JSON.stringify(sources))[0]};
        transUnits[x]['trans-unit'].push(targets);

        // Se possuir uma nota, busca a nota. Importante para manter o contexto nas traduções
        const note = findNodesByName(transUnits[x]['trans-unit'], 'note')?.[0]?.[0]?.['#text'] || '';

        // Constrói o texto de referência, que é o texto completo. A transunit pode estar dividida em várias partes
        // Atualmente não estamos utilizando o refText, mas já montamos para caso seja necessário para melhorar a qualidade das traduções futuramente
        let refText = '';
        for (let y = 0; y < targets.target.length; y++) {
            refText += targets.target[y]['#text'] || targets.target[y][':@']?.['@_equiv-text'] || '';
        }

        for (let y = 0; y < targets.target.length; y++) {
            const target = targets.target[y];
            if (target['#text']) {

                // Como a transunit pode ter vários elementos, o itemKey será a combinação do ID da transunit com a
                // posição do elemento que será traduzido no target
                const itemKey = id.toString() + '###' + y;

                // Adiciona o item ao mapa com todos os elementos relevantes
                itensIdMap[itemKey] = {
                    itemKey,
                    target,
                    refText,
                    note
                };

            }
        }
    }
    return itensIdMap;

}

// Função para encontrar um nó pelo nome (apenas o primeiro encontrado)
function findNodeByName(nodeArray, nodeName) {
    if (!Array.isArray(nodeArray)) return null;
    for (const node of nodeArray) {
        if (node[nodeName]) {
            return node[nodeName];
        } else {
            // Procurar recursivamente nos filhos
            for (const key in node) {
                const childNode = node[key];
                if (Array.isArray(childNode)) {
                    const foundNode = findNodeByName(childNode, nodeName);
                    if (foundNode) {
                        return foundNode;
                    }
                }
            }
        }
    }
    return null;
}

// Função para encontrar todos os nós com um determinado nome
function findNodesByName(nodeArray, nodeName) {
    let results = [];
    if (!Array.isArray(nodeArray)) return results;
    for (const node of nodeArray) {
        if (node[nodeName]) {
            results.push(node[nodeName]);
        } else {
            // Procurar recursivamente nos filhos
            for (const key in node) {
                const childNode = node[key];
                if (Array.isArray(childNode)) {
                    results = results.concat(findNodesByName(childNode, nodeName));
                }
            }
        }
    }
    return results;
}

/**
 * Função para dividir as transunits em chunks, de forma a respeitar o limite de tokens de entrada
 * @param units
 * @param maxTokens
 * @returns {*[]}
 */
function chunkTransUnits(units, maxTokens = 3000) {
    let chunks = [];
    let currentChunk = [];
    let currentTokens = 0;

    for (const k in units) {
        const unit = units[k];
        const sourceNode = unit.target;
        const text = sourceNode['#text'] + unit.note;
        const tokens = estimateTokens(text);
        if (currentTokens + tokens > maxTokens && currentChunk.length > 0) {
            chunks.push(currentChunk);
            currentChunk = [];
            currentTokens = 0;
        }
        currentChunk.push(unit);
        currentTokens += tokens;
    }

    if (currentChunk.length > 0) {
        chunks.push(currentChunk);
    }

    return chunks;
}

// Função para estimar o número de tokens em um texto
function estimateTokens(text) {
    return Math.ceil((text?.length || 0) / 3); // Aproximadamente 3 caracteres por token
}

// Função para criar o prompt para tradução de um chunk
function createPrompt(chunk, targetLanguage) {

    // Cria o prompt com as instruções base para o tradutor
    let prompt = `Traduza o conteúdo abaixo, do Português do Brasil (pt-BR) para o ${targetLanguage.name} (${targetLanguage.code}). 
Trata-se de frases de um software de gestão de atendimento, CRM e tickets. A palavra Funil está sempre num contexto de Funil de CRM. A palavra Adicionar está geralmente associada a um contexto de adicionar um novo item a uma lista. A palavra origem está associada à origem de um atendimento ou oportunidade de um Funil no CRM. 
O conteúdo está no formato {{chave}}: {{texto}} --> {{nota}}. A {{nota}} nem sempre está disponível, porém, quando disponível, a {{nota}} representa o contexto em que a palavra está inserida. A nota ser utilizadas para que a tradução represente a palavra no contexto correto e não devem ser traduzida ou retornada.

Retorne somente {{chave}}: {{texto}}, com o texto traduzido, não modifique a chave nem retorne a parte depois de -->. Forneça as traduções na mesma ordem, não adicione nenhuma frase no início ou fim da resposta. Mantenha a mesma chave da frase traduzida, sem modificações.
Adicione o símbolo ##!## ao final de todas as linhas traduzidas, como final de linha.\n\n`;

    // Adiciona as frases do chunk ao prompt
    for (let x = 0; x < chunk.length; x++) {
        const text = chunk[x].target['#text'];
        const note = chunk[x].note;
        const refText = chunk[x].refText;
        const finalText = `${text} ${note ? '--> ' + note : ''}`;
        prompt += `${x + 1}: ${finalText}\n`;
    }
    return prompt;

}

// Função para analisar a resposta da API, returnando um array de objetos com chave e texto
function parseResponse(responseText) {
    const lines = responseText.trim().split('##!##');
    const translations = lines.map((line) => {
        const key = line.split(': ')[0];
        // Filtra o texto, removendo a nota ao final, caso tenha sido deixada pelo modelo
        const text = line.split(': ').slice(1).join(':').split(' -->')[0];
        return {key, text};
    });
    return translations;
}

async function beginTranslation() {
    for (const language of languages) {
        // Executar a função principal para cada idioma
        await translateXLIFF(language);
    }
}

beginTranslation();

/**
 * Created by filipe on 17/09/16.
 */
import {
    AfterViewInit,
    Component,
    ElementRef,
    EventEmitter,
    Input,
    OnChanges,
    OnDestroy,
    Output,
    SimpleChanges,
    ViewChild
} from '@angular/core';
import {SelectionListComponent} from "./selection-list.component";
import {MatDialog} from "@angular/material/dialog";
import {EventsService} from "../services/events.service";
import {animate, state, style, transition, trigger} from "@angular/animations";
import {ImageSelectionListComponent} from "./image-selection-list.component";
import {DomSanitizer} from "@angular/platform-browser";
import OpusMediaRecorder from 'opus-media-recorder';
import {ConfirmAction} from "./confirmaction.decorator";
import {MatMenuTrigger} from "@angular/material/menu";
import {StatusService} from "../services/status.service";
import {BASE_URL} from "../app.consts";
import * as _ from 'lodash';
import {YesNoComponent} from "./yes-no.component";
import {texts} from '../app.texts';
import {UtilitiesService} from "../services/utilities.service";
import {MatSnackBar} from "@angular/material/snack-bar";
import {MediaRecorder, register} from 'extendable-media-recorder';
import {connect} from 'extendable-media-recorder-wav-encoder';
import {HttpClient} from '@angular/common/http';

@Component({
    selector: 'app-emoji-text-area',
    templateUrl: 'emoji-text-area.component.html',
    styleUrls: ['emoji-text-area.component.scss'],
    animations: [
        trigger('visibilityChanged', [
            transition('void => shown',
                [style({height: '0px', opacity: 0}), animate('0.25s'), style({height: 'auto', opacity: 1})]
            ),
            transition('shown => void',
                [style({height: 'auto', opacity: 1}), animate('0.25s', style({height: '0px', opacity: 0}))]
            )
        ]),
        trigger('popupVisibilityChanged', [
            state('shown', style({
                "opacity": 1
            })),
            transition('void => shown',
                [style({opacity: 0}), animate('0.25s')]
            ),
            transition('shown => void',
                [style({opacity: 1}), animate('0.25s', style({opacity: 0}))]
            )
        ]),
        trigger('textareaVisibilityChanged', [
            state('void', style({
                "opacity": 1
            })),
            transition('void => shown',
                [style({opacity: 0, position: 'absolute'}), animate('0.25s')]
            ),
            transition('shown => void',
                [style({opacity: 1, position: 'absolute'}), animate('0.25s', style({opacity: 0}))]
            )
        ])
    ]
})

export class EmojiTextAreaComponent implements OnDestroy, OnChanges, AfterViewInit {

    textsT = texts;

    @Input() enterToSend = false;
    @Input() internalChat = false;
    @Input() disabled = true;
    @Input() sending = false;
    @Input() placeholder = this.status.isMobile && !this.status.isEmbedded ? $localize`Digite uma mensagem ou toque duas vezes para atalhos.` :
        this.status.isEmbedded ? $localize`Digite uma mensagem ou / para atalhos.` :
            $localize`Digite uma mensagem ou / para atalhos. Você também pode pressionar Ctrl + Alt para visualizar os atalhos do teclado.`;
    @Input() texts = [];
    @Input() automation = [];
    @Input() disableAudio = false;
    @Input() mp4Audio = false;
    @Input() disableDocument = false;
    @Input() disableVideo = false;
    @Input() text = '';
    @Input() aiChatControl: { aiModified: boolean, oldText: string } = {aiModified: false, oldText: ''};
    @Output() textChange = new EventEmitter<string>();
    @Input() gallery = [];
    @Input() substitutionTable = {};
    @Input() isMobile = false;
    @Input() showDisableSignature = false;
    @Input() showOperationShortcuts = true;
    @Input() queueType = 1;
    @Input() chatId = ''
    @Input() replyTo: {
        id: string,
        text: string,
        mine?: boolean,
        quotedFile?: boolean,
        comment: boolean,
        previewUrl?: string
    } = {id: '', text: '', mine: false, quotedFile: false, comment: false, previewUrl: ''};
    @Output() replyToCleared = new EventEmitter();
    @Output() textSubmitted = new EventEmitter<{
        text: string,
        quotedText: string,
        quotedId: string,
        quotedMine: boolean,
        quotedFile: boolean,
        quotedComment?: boolean,
        disableSignature?: boolean,
        fk_file?: number,
        file_mimetype?: string,
        id?: number,
        automation?: boolean
    }>();
    @Output() audioSubmitted = new EventEmitter<{
        data: any,
        duration: number,
        mp4Audio: boolean,
        waveform: Array<number>
    }>();
    @Output() mediaButtonClicked = new EventEmitter<string>();
    @Output() operationEvent = new EventEmitter<string>();
    @Output() pasted = new EventEmitter<{ blob: any, type: string }>();

    messageRef;
    selectedChatKey;
    @ViewChild('hiddenButton', {read: MatMenuTrigger, static: false}) messageAreaMenu: MatMenuTrigger;
    @ViewChild('hiddenButton2', {read: MatMenuTrigger, static: false}) mobileSendMenu: MatMenuTrigger;
    @ViewChild('messageArea') messageArea: ElementRef<HTMLTextAreaElement>;
    @ViewChild('shortcutPopup') shortcutPopup: ElementRef<HTMLDivElement>;

    textAreaHeight = null;

    mobileSendMenuPressed = 0;
    disableSignature = false;
    canCloseMenu = false;

    recordingAudio = false;
    recordTime = 0;
    recording;
    recordingChunks = [];
    recordingTimer;
    audioUrl;

    lastEmojiToggle = 0;

    baseUrl = BASE_URL;

    ngxPtBr = {
        search: $localize`Procurar`,
        clear: $localize`:Limpar campo de texto:Limpar`, // Accessible label on "clear" button
        notfound: $localize`Nenhum emoji encontrado`,
        skintext: $localize`Escolha o seu tom de pele padrão`,
        categories: {
            search: $localize`Resultados da busca`,
            recent: $localize`Usados com frequência`,
            smileys: $localize`Emojis e Pessoas`,
            people: $localize`Pessoas e Corpo`,
            nature: $localize`Animais e Natureza`,
            foods: $localize`Comidas e Bebidas`,
            activity: $localize`Atividades`,
            places: $localize`Viagem e Lugares`,
            objects: $localize`Objetos`,
            symbols: $localize`Símbolos`,
            flags: $localize`Bandeiras`,
            custom: $localize`Personalizado`,
        },
        categorieslabel: $localize`Categorias`, // Accessible title for the list of categories
        skintones: {
            1: $localize`Tom de pele padrão`,
            2: $localize`Tom de pele claro`,
            3: $localize`Tom de pele médio claro`,
            4: $localize`Tom de pele médio`,
            5: $localize`Tom de pele médio escuro`,
            6: $localize`Tom de pele escuro`
        }
    }

    showEmojiPicker = false;
    subscription;
    messagesSubscription;
    gallerySubscription;
    shortcutMenuItemUpdatedSubscription;
    mediaRecorder;
    canRecord = false;
    showShortcuts = false;
    noResults = 0;
    lastSize = 0;
    selectedShortcutItemIndex = 0;
    showLimit = 12;
    instantSamples = [];
    samples = [];
    waveform = [];
    sampleTimerRef;
    analizer: AnalyserNode;
    source: MediaStreamAudioSourceNode;
    audioCtx: AudioContext;

    resizeSaveTimerRef;
    resizeObserver;
    executingAi = false;
    allItens = [];
    filteredItens = [];
    workerOptions = {
        encoderWorkerFactory: function () {
            // UMD should be used if you don't use a web worker bundler for this.
            return new Worker('assets/audio/encoderWorker.umd.js');
        },
        OggOpusEncoderWasmPath: './OggOpusEncoder.wasm',
        WebMOpusEncoderWasmPath: './WebMOpusEncoder.wasm'
    };

    constructor(private dialog: MatDialog, private events: EventsService, private snack: MatSnackBar,
                private sanitizer: DomSanitizer, public status: StatusService, private util: UtilitiesService, private http: HttpClient) {

        this.subscription = events.on('chatSelected', (() => {
            setTimeout(() => {
                this.messageArea.nativeElement.focus();
            }, 300)
        }).bind(this));

        this.messageRef = this.internalChat ? status.internalMessageRef : status.messageRef;
        this.selectedChatKey = this.internalChat ? 'internalSelectedChat' : 'selectedChat';

        this.timer();

        this.messagesSubscription = events.on('messages', this.openTextsDialog.bind(this));
        this.gallerySubscription = events.on('gallery', this.openGalleryDialog.bind(this));

        this.shortcutMenuItemUpdatedSubscription = events.on('shortcutMenuItemUpdated', this.generateMenuItems.bind(this));

        this.testRecording();

    }

    async testRecording() {
        if (navigator.mediaDevices) {

            let stream;

            try {

                stream = await navigator.mediaDevices.getUserMedia({audio: true});
                this.canRecord = true;

                try {
                    await register(await connect());
                } catch (e) {
                    console.log('Erro ao carregar wav encoder', e);
                }

                stream.getTracks().forEach(function (track) {
                    track.stop();
                });

            } catch (err) {
                this.canRecord = false;
            }

        } else {
            console.log('Gravação de áudio não disponível.');
            this.canRecord = false;
        }
    }

    ngAfterViewInit() {
        this.adjustTextAreaSize();
    }

    async adjustTextAreaSize() {

        while (!this.status.user) {
            await new Promise(resolve => setTimeout(resolve, 100));
        }

        this.textAreaHeight = Number(window.localStorage.getItem(`textarea-custom-height-${this.status.user.id}`)) || null;

        this.resizeObserver = new ResizeObserver(this.textAreaSizeChange());
        this.resizeObserver.observe(this.messageArea.nativeElement);

    }

    paste(event) {

        const items = event.clipboardData.items;

        let blob = null;
        let type = '';

        // @ts-ignore
        for (const item of items) {
            if (item.type.indexOf('image') === 0) {
                blob = item.getAsFile();
                type = 'image';
            } else if (item.type.indexOf('video') === 0) {
                blob = item.getAsFile();
                type = 'video';
            } else if (item.type.indexOf('application/whatsapp') === 0) {
                event.preventDefault();
                const paste = event.clipboardData.getData("application/whatsapp");
                const target = event.target as HTMLTextAreaElement;
                const {selectionStart: start, selectionEnd: end, value: current} = target;
                this.text = current.slice(0, start) + paste + current.slice(end);
                return;
            }
        }

        if (type && blob) {
            this.pasted.emit({blob, type});
            event.preventDefault();
        }

    }

    ngOnDestroy() {
        this.events.unsubscribe('chatSelected', this.subscription);
        this.events.unsubscribe('messages', this.messagesSubscription);
        this.events.unsubscribe('gallery', this.gallerySubscription);
        this.events.unsubscribe('shortcutMenuItemUpdated', this.shortcutMenuItemUpdatedSubscription);
        if (this.resizeObserver) {
            this.resizeObserver.disconnect();
        }
        if (this.recordingTimer) {
            clearTimeout(this.recordingTimer);
        }
        if (this.sampleTimerRef) {
            clearTimeout(this.sampleTimerRef);
        }
        if (this.recordingAudio) {
            this.mediaRecorder?.stop();
        }
    }

    async ngOnChanges(changes: SimpleChanges) {
        if (changes.hasOwnProperty('replyTo') && this.replyTo?.comment) {
            this.disableSignature = true;
            if (this.recordingAudio) {
                this.stopRecording();
                // Aguarda para que os dados da gravação sejam escritos
                // TODO: Ideal era tratar com um evento, aqui não tem garantia de que o evento de stop já foi processado
                await this.util.sleep(200);
                this.doClear();
                // Aguarda para que o messageArea seja reescrito na visão
                await this.util.sleep(100);
            }
            // Agora vai responder a um comentário, reescreve o menu para adicionar apenas os itens de texto e automação
            this.generateMenuItems();
        }
        // Estava marcado para responder um comentário e não está mais, reescreve o menu para adicionar os itens da galeria
        if (changes.replyTo?.previousValue?.comment && !this.replyTo?.comment) {
            this.generateMenuItems();
        }
        if (changes.hasOwnProperty('replyTo') && this.messageArea) {
            this.messageArea.nativeElement.focus();
        }
        if (changes.hasOwnProperty('texts') || changes.hasOwnProperty('gallery') ||
            changes.hasOwnProperty('automation')) {
            this.generateMenuItems();
        }
    }

    generateMenuItems() {

        const permittedTexts = [];

        for (const text of this.texts) {
            if (!text.accessgroups?.length || this.util.hasIntersection(text.accessgroups || [], this.status.user?.contactsgroups || [])) {
                permittedTexts.push(text);
            }
        }

        this.allItens = this.replyTo?.comment ? [].concat(permittedTexts).concat(this.automation) : [].concat(permittedTexts).concat(this.gallery).concat(this.automation);

        // Na resposta a comentários, não é permitido o envio de arquivos
        if (!this.replyTo?.comment) {
            this.allItens.push({
                createdAt: "2020-08-13T14:39:57.000Z",
                fk_file: null,
                id: 'njwjd93unx9',
                priority: null,
                text: $localize`Abre o diálogo de seleção de arquivos de imagem para envio`,
                title: $localize`Enviar imagem`,
                updatedAt: "2021-04-08T17:19:57.000Z"
            });
            this.allItens.push({
                createdAt: "2020-08-13T14:39:57.000Z",
                fk_file: null,
                id: 'njwjd93unx10',
                priority: null,
                text: $localize`Abre o diálogo de seleção de arquivos de vídeo para envio`,
                title: $localize`Enviar vídeo`,
                updatedAt: "2021-04-08T17:19:57.000Z"
            });
            this.allItens.push({
                createdAt: "2020-08-13T14:39:57.000Z",
                fk_file: null,
                id: 'njwjd93unx11',
                priority: null,
                text: $localize`Abre o diálogo de seleção de arquivos para envio`,
                title: $localize`Enviar documento`,
                updatedAt: "2021-04-08T17:19:57.000Z"
            });
            this.allItens.push({
                createdAt: "2024-02-13T14:39:57.000Z",
                fk_file: null,
                id: 'njwjd93unx15',
                priority: null,
                text: $localize`Abre o diálogo de compartilhamento de contato`,
                title: $localize`Compartilhar contato`,
                updatedAt: "2024-02-13T17:19:57.000Z"
            });
            if (this.status.enableAI && this.status.user.canrequestaisummary &&
                this.status.iaQueueTypes.includes(this.queueType)) {
                this.allItens.push({
                    createdAt: "2024-02-13T14:39:57.000Z",
                    fk_file: null,
                    id: 'njwjd93unx16',
                    priority: null,
                    text: $localize`Solicita a IA que gere uma sugestão de mensagem, dado o contexto da conversa.`,
                    title: $localize`Sugestão de mensagem`,
                    updatedAt: "2024-02-13T17:19:57.000Z"
                });
                this.allItens.push({
                    createdAt: "2024-02-13T14:39:57.000Z",
                    fk_file: null,
                    id: 'njwjd93unx17',
                    priority: null,
                    text: $localize`Solicita a IA um resumo do atendimento até o momento`,
                    title: $localize`Resumo do atendimento`,
                    updatedAt: "2024-02-13T17:19:57.000Z"
                });
            }
        }

        // Atalhos operacionais só são exibidos para atendimentos, e não são exibidos para chat interno
        if (this.showOperationShortcuts) {
            this.allItens.push({
                createdAt: "2020-08-13T14:39:57.000Z",
                fk_file: null,
                id: 'njwjd93unx12',
                priority: null,
                text: $localize`Abre o diálogo de encerramento do atendimento`,
                title: $localize`Encerrar atendimento`,
                updatedAt: "2021-04-08T17:19:57.000Z"
            });
            this.allItens.push({
                createdAt: "2020-08-13T14:39:57.000Z",
                fk_file: null,
                id: 'njwjd93unx13',
                priority: null,
                text: $localize`Abre o diálogo de transferência de atendimento`,
                title: $localize`Transferir atendimento`,
                updatedAt: "2021-04-08T17:19:57.000Z"
            });
            this.allItens.push({
                createdAt: "2020-08-13T14:39:57.000Z",
                fk_file: null,
                id: 'njwjd93unx14',
                priority: null,
                text: $localize`Inserir mensagem de informação`,
                title: $localize`Informação`,
                updatedAt: "2021-04-08T17:19:57.000Z"
            });
            if (this.status.enableFormulaCerta) {
                this.allItens.unshift({
                    createdAt: "2020-08-13T14:39:57.000Z",
                    fk_file: null,
                    id: 'njwjd93unx80',
                    priority: null,
                    text: $localize`Busca orçamento`,
                    title: $localize`Orçamento`,
                    updatedAt: "2021-04-08T17:19:57.000Z"
                });
            }
        }
    }

    changeSelectedItem(index, ignoreScroll = false) {
        this.selectedShortcutItemIndex = index;
        if (this.showLimit < this.selectedShortcutItemIndex) {
            this.showLimit = this.selectedShortcutItemIndex + 3;
        }
        if (index === this.filteredItens.length - 1 && !ignoreScroll) {
            this.shortcutPopup?.nativeElement?.scrollTo({
                top: this.shortcutPopup?.nativeElement?.scrollHeight,
                behavior: 'smooth'
            })
        } else if (index > 2 && !ignoreScroll) {
            const scroll = ((index) % 3 === 0);
            if (scroll) {
                this.shortcutPopup?.nativeElement?.scrollTo({
                    top: Math.min(index * 48, this.shortcutPopup?.nativeElement?.scrollHeight),
                    behavior: 'smooth'
                });
            } else if (this.shortcutPopup?.nativeElement?.scrollTop > index * 48) {
                this.shortcutPopup?.nativeElement?.scrollTo({top: (index - (index % 3)) * 48, behavior: 'smooth'});
            }
        } else {
            if (!ignoreScroll) {
                this.shortcutPopup?.nativeElement?.scrollTo({top: 0, behavior: 'smooth'})
            }
        }
        // console.log(this.shortcutPopup);
    }

    keyPressEventHandler(e) {
        if (e.key === '/' && (!this.text?.length || this.text === '/')) {
            this.showShortcutsPopup();
        } else if (e.key === 'Enter') {
            if (this.showShortcuts) {
                this.handleShortcutAction();
                e.preventDefault();
            } else if (this.enterToSend && !e.shiftKey && !this.audioUrl) {
                this.publish(e);
                e.preventDefault();
            }
        }
    }

    handleShortcutAction(i = 0) {

        this.selectedShortcutItemIndex = i || this.selectedShortcutItemIndex;

        // console.log('lidando com click', this.selectedShortcutItemIndex, this.filteredItens[this.selectedShortcutItemIndex]);
        if (this.filteredItens.length && this.filteredItens[this.selectedShortcutItemIndex]) {
            if (this.filteredItens[this.selectedShortcutItemIndex].automation) {

                this.text = '';
                this.showShortcuts = false;

                return this.dialog.open(YesNoComponent, {
                    autoFocus: false,
                    data: {
                        yesButtonStyle: 'success',
                        yesButtonText: $localize`Continuar`,
                        title: $localize`Executar automação`,
                        text: $localize`Tem certeza que deseja executar a automação ${this.filteredItens[this.selectedShortcutItemIndex].title}?`
                    }
                }).afterClosed().subscribe(r => {
                    if (r) {
                        this.textSubmitted.emit({
                            text: '',
                            quotedId: '',
                            quotedText: '',
                            quotedMine: false,
                            quotedFile: false,
                            automation: true,
                            id: this.filteredItens[this.selectedShortcutItemIndex].id
                        });
                    }
                });

            }
            if (this.filteredItens[this.selectedShortcutItemIndex].text) {
                switch (this.filteredItens[this.selectedShortcutItemIndex].id) {
                    case 'njwjd93unx9':
                        // Foto
                        this.mediaButtonClicked.emit('image');
                        this.text = '';
                        break;

                    case 'njwjd93unx10':
                        // Vídeo
                        this.mediaButtonClicked.emit('video');
                        this.text = '';
                        break;

                    case 'njwjd93unx11':
                        // Documento
                        this.mediaButtonClicked.emit('others');
                        this.text = '';
                        break;

                    case 'njwjd93unx12':
                        // Encerrar
                        this.operationEvent.emit('endChat');
                        this.text = '';
                        break;

                    case 'njwjd93unx13':
                        // Transfer
                        this.operationEvent.emit('transferChat');
                        this.text = '';
                        break;

                    case 'njwjd93unx14':
                        // Informação
                        this.operationEvent.emit('information');
                        this.text = '';
                        break;

                    case 'njwjd93unx15':
                        // Documento
                        this.mediaButtonClicked.emit('contact');
                        this.text = '';
                        break;

                    case 'njwjd93unx16':
                        this.text = '';
                        this.hideShortcuts();
                        this.getAiMessageSuggestion();
                        break;

                    case 'njwjd93unx17':
                        this.text = '';
                        this.hideShortcuts();
                        this.genAiSummary();
                        break;

                    case 'njwjd93unx80':
                        // Integração Fórmula Certa
                        this.operationEvent.emit('formulaCerta');
                        this.text = '';
                        this.hideShortcuts();
                        break;

                    default:
                        this.selectPredefinedText(this.filteredItens[this.selectedShortcutItemIndex].text);
                }
            }
            if (this.filteredItens[this.selectedShortcutItemIndex].fk_file) {

                this.text = '';
                this.showShortcuts = false;

                this.dialog.open(YesNoComponent, {
                    autoFocus: false,
                    data: {
                        yesButtonStyle: 'success',
                        yesButtonText: $localize`Continuar`,
                        title: $localize`Enviar arquivo`,
                        text: $localize`Tem certeza que deseja enviar o arquivo ${this.filteredItens[this.selectedShortcutItemIndex].file_name}?`
                    }
                }).afterClosed().subscribe(r => {
                    if (r) {
                        this.textSubmitted.emit({
                            text: '',
                            quotedId: '',
                            quotedText: '',
                            quotedMine: false,
                            quotedFile: false,
                            fk_file: this.filteredItens[this.selectedShortcutItemIndex].fk_file,
                            file_mimetype: this.filteredItens[this.selectedShortcutItemIndex].file_mimetype
                        });
                    }
                });

            }
        }

    }

    hideShortcuts() {
        setTimeout(() => {
            this.showShortcuts = false
        }, 100);
    }

    openShortcutFromPhone() {
        if (this.status.isMobile && !this.text) {
            this.text = '/';
            this.showShortcutsPopup();
            this.messageArea.nativeElement.focus();
        }
    }

    handleArrows(e) {
        if ((e.key === '/' || e.keyCode === 229) && (!this.text?.length || this.text === '/')) {
            this.showShortcutsPopup();
        } else if (e.key === 'Enter') {
            if (this.showShortcuts) {
                this.handleShortcutAction();
                e.preventDefault();
            } else if (this.enterToSend && !e.shiftKey && !this.audioUrl) {
                this.publish(e);
                e.preventDefault();
            }
        }
        if (this.showShortcuts) {
            if (e.key === 'ArrowDown') {
                if (this.filteredItens.length > 1) {
                    if (this.filteredItens.length > this.selectedShortcutItemIndex + 1) {
                        this.changeSelectedItem(this.selectedShortcutItemIndex + 1)
                    } else {
                        this.changeSelectedItem(0);
                    }
                }
                e.preventDefault();
            } else if (e.key === 'ArrowUp') {
                if (this.filteredItens.length > 1) {
                    if (this.selectedShortcutItemIndex - 1 >= 0) {
                        this.changeSelectedItem(this.selectedShortcutItemIndex - 1)
                    } else {
                        this.changeSelectedItem(this.filteredItens.length - 1);
                    }
                }
                e.preventDefault();
            } else if (e.key === 'PageUp') {
                const tmpIndex = this.selectedShortcutItemIndex - 3;
                const provIndex = tmpIndex - (tmpIndex % 3);
                if (provIndex >= 0) {
                    this.changeSelectedItem(provIndex);
                } else {
                    if (this.selectedShortcutItemIndex === 0) {
                        this.changeSelectedItem(this.filteredItens.length - 1);
                    } else {
                        this.changeSelectedItem(0);
                    }
                    this.changeSelectedItem(this.filteredItens.length - 1);
                }
                e.preventDefault();
            } else if (e.key === 'PageDown') {
                const tmpIndex = this.selectedShortcutItemIndex + 3;
                const provIndex = tmpIndex - (tmpIndex % 3);
                if (provIndex <= this.filteredItens.length - 1) {
                    this.changeSelectedItem(provIndex);
                } else {
                    if (this.selectedShortcutItemIndex === this.filteredItens.length - 1) {
                        this.changeSelectedItem(0);
                    } else {
                        this.changeSelectedItem(this.filteredItens.length - 1);
                    }
                }
                e.preventDefault();
            } else if (e.key === 'ArrowLeft') {
                e.preventDefault();
            } else if (e.key === 'ArrowRight') {
                e.preventDefault();
            }
        }
    }

    mediaEvent(type) {
        this.mediaButtonClicked.emit(type);
    }

    openMenuMessageArea() {
        if (this.disabled) {
            return;
        }
        if (this.isMobile) {
            navigator.vibrate(20);
            this.messageAreaMenu.openMenu();
            setTimeout(() => {
                this.canCloseMenu = true;
            }, 300);
        }
    }

    openMobileSendMenu(e: Event) {
        if (this.disabled) {
            return;
        }
        if (this.isMobile) {
            this.mobileSendMenuPressed = Date.now();
            navigator.vibrate(20);
            this.mobileSendMenu.openMenu();
            setTimeout(() => {
                this.canCloseMenu = true;
            }, 300);
        }
    }

    log(obj) {
        console.log(obj);
    }

    closeMenu() {
        if (this.canCloseMenu) {
            this.canCloseMenu = false;
            this.messageAreaMenu.closeMenu();
            this.mobileSendMenu.closeMenu();
        }
    }

    eventLogger(event) {
        console.log(event);
    }

    escKey() {
        this.clearReplyTo();
        this.showShortcuts = false;
        this.showEmojiPicker = false;
    }

    openTextsDialog() {

        if (this.disabled) {
            return;
        }

        const permittedTexts = [];

        for (const text of this.texts) {
            if (!text.accessgroups?.length || this.util.hasIntersection(text.accessgroups || [], this.status.user?.contactsgroups || [])) {
                permittedTexts.push(text);
            }
        }

        const sub = this.dialog.open(SelectionListComponent, {
            data: {
                itens: permittedTexts,
                title: $localize`Selecione uma resposta`,
                firstField: 'title',
                secondField: 'text'
            }
        }).afterClosed().subscribe(r => {
            if (r) {
                this.selectPredefinedText(r.text);
            }
            sub.unsubscribe();
        });

    }

    selectPredefinedText(text) {
        this.text = text;
        this.showShortcuts = false;

        const substitutionTable = this.util.generateSubstitutionTable();

        for (const k of Object.keys(substitutionTable)) {
            const regexp = new RegExp(k, 'g');
            this.text = this.text.replace(regexp, substitutionTable[k]);
            this.messageArea.nativeElement.focus();
        }
    }

    openGalleryDialog() {

        if (this.disabled) {
            return;
        }

        const sub = this.dialog.open(ImageSelectionListComponent, {
            data: {
                itens: this.gallery,
                title: $localize`Selecione um arquivo`,
                allowMulti: true,
                queueType: this.queueType
            }
        }).afterClosed().subscribe(r => {
            if (r) {
                if (Array.isArray(r)) {
                    for (const i of r) {
                        this.textSubmitted.emit({
                            text: '',
                            quotedId: '',
                            quotedText: '',
                            quotedMine: false,
                            quotedFile: false,
                            fk_file: i.fk_file,
                            file_mimetype: i.file_mimetype
                        });
                    }
                } else {
                    this.textSubmitted.emit({
                        text: '',
                        quotedId: '',
                        quotedText: '',
                        quotedMine: false,
                        quotedFile: false,
                        fk_file: r.fk_file,
                        file_mimetype: r.file_mimetype
                    });
                }
            }
            sub.unsubscribe();
        });

    }

    reduceArray(data) {
        if (!data.length) {
            let reduced = [];
            for (let i = 0; i < 64; i++) {
                reduced.push(5);
            }
            return reduced;
        }
        const stepSize = Math.floor(data.length / 64);
        const reduced = [];
        for (let i = 0; i < 64; i++) {
            const slice = data.splice(0, stepSize);
            // const max = _.sum(slice);
            const max = slice.reduce((acc, val) => acc + Math.min(255, Math.round(Math.abs(val - 128) * 8)), 0);
            reduced.push(Math.round(max / slice.length));
        }
        return reduced;
    }

    publish(e: Event, disableSignature = false) {
        if (this.sending) {
            return;
        }
        if (this.audioUrl) {
            this.convertToArrayBuffer(this.recording).then((data: ArrayBuffer) => {
                this.audioSubmitted.emit({
                    duration: this.recordTime,
                    mp4Audio: this.mp4Audio,
                    waveform: this.waveform,
                    data
                });
                this.doClear();
            })
        } else if (this.text && !this.disabled) {
            if (this.isMobile && Date.now() - this.mobileSendMenuPressed < 500) {
                return;
            }
            this.textSubmitted.emit({
                text: this.text,
                quotedId: this.replyTo.id,
                quotedText: this.replyTo.text,
                quotedMine: this.replyTo.mine,
                quotedFile: this.replyTo.quotedFile,
                quotedComment: this.replyTo.comment,
                disableSignature: this.disableSignature || disableSignature,
                fk_file: null,
                file_mimetype: null
            });
            this.text = '';
            this.textChange.emit('');
            this.clearReplyTo();
        } else if ([10, 16].includes(this.queueType) && this.disabled) {
            this.textSubmitted.emit();
        }
        this.disableSignature = false;
    }

    convertToArrayBuffer(blob) {
        return new Promise((resolve, reject) => {
            const fileReader = new FileReader();
            fileReader.onload = function (event) {
                return resolve(event.target.result);
            };
            fileReader.readAsArrayBuffer(blob);
        });
    }

    sampleTimer() {
        if (!this.recordingAudio || !this.analizer) {
            this.sampleTimerRef = null;
            return;
        }
        if (!this.analizer) {
            return;
        }
        const frequencyArray = new Uint8Array(64);
        this.analizer.getByteTimeDomainData(frequencyArray);
        const actualSamples = Array.from(frequencyArray);
        const averageAmplitude = (actualSamples.reduce((acc, val) => acc + Math.min(255, Math.round(Math.abs(val - 128) * 8)), 0) / 64);
        this.instantSamples = [...this.instantSamples.slice(1), averageAmplitude];
        this.samples = this.samples.concat(actualSamples);
        this.sampleTimerRef = null;
        if (this.recordingAudio) {
            // Mesmo em computadores rápidos, quero limitar a 10 fps
            setTimeout(() => {
                requestAnimationFrame(this.sampleTimer.bind(this));
            }, 125);
        }
    }

    startRecording(e: Event) {

        if (this.disabled || !this.canRecord || this.recordingAudio) {
            return;
        }

        this.recording = null;
        this.recordingChunks = [];
        this.audioUrl = null;
        this.recordTime = 0;

        this.instantSamples = [];
        this.samples = [];

        navigator.mediaDevices.getUserMedia({audio: true}).then(async (stream) => {

            for (let x = 0; x < 48; x++) {
                // Inicializa as amostras instantaneas com 0
                this.instantSamples.push(0);
            }

            if (!this.status.disableWaveform) {

                // @ts-ignore
                this.audioCtx = new AudioContext({latencyHint: 'interactive', sinkId: {type: 'none'}});
                this.source = this.audioCtx.createMediaStreamSource(stream);
                this.analizer = this.audioCtx.createAnalyser();
                this.analizer.fftSize = 64;
                this.source.connect(this.analizer);

            }

            this.mediaRecorder = this.mp4Audio ? new MediaRecorder(stream, {mimeType: 'audio/wav'}) :
                (!window.MediaRecorder?.isTypeSupported('audio/ogg;codecs=opus') ?
                    new OpusMediaRecorder(stream, {mimeType: 'audio/ogg; codecs=opus'}, this.workerOptions) :
                    new MediaRecorder(stream, {mimeType: 'audio/ogg;codecs=opus'}));

            this.mediaRecorder.ondataavailable = (event) => {
                this.recordingChunks.push(event.data);
            }

            this.mediaRecorder.onstop = (event) => {
                this.recordingAudio = false;
                this.recording = new Blob(this.recordingChunks, this.mp4Audio ? {'type': 'audio/wav'} : {'type': 'audio/ogg; codecs=opus'});
                this.audioUrl = this.sanitizer.bypassSecurityTrustResourceUrl(URL.createObjectURL(this.recording));
                this.analizer?.disconnect();
                this.analizer = null;
                this.source?.disconnect();
                this.source = null;
                this.audioCtx?.close();
                this.audioCtx = null;
                this.sampleTimerRef = null;
                stream.getTracks().forEach(function (track) {
                    track.stop();
                });
                this.waveform = this.reduceArray(this.samples);
            }

            this.mediaRecorder.onstart = (event) => {
                this.recordingAudio = true;
                if (!this.status.disableWaveform) {
                    requestAnimationFrame(this.sampleTimer.bind(this));
                }
            }

            this.mediaRecorder.start();

        }).catch(function (err) {
            console.log('Ocorreu um erro na gravação: ' + err);
            this.snack.open('Erro ao iniciar gravação de áudio', 'Fechar', {duration: 3000});
            this.canRecord = false;
        });

        e.stopPropagation();

    }

    stopRecording(e: Event = null) {
        if (this.disabled || !this.mediaRecorder) {
            return;
        }
        this.mediaRecorder?.stop();
        e?.stopPropagation();
    }

    @ConfirmAction('dialog', {
        text: $localize`Tem certeza que deseja descartar o áudio?`,
        title: $localize`Descartar áudio`,
        yesButtonText: $localize`Descartar`,
        noButtonText: 'Não'
    })
    clearRecording() {
        this.doClear();
    }

    textAreaSizeChange() {
        return (event) => {
            if (this.resizeSaveTimerRef) {
                clearTimeout(this.resizeSaveTimerRef);
            }

            this.resizeSaveTimerRef = setTimeout(() => {
                this.textAreaHeight = event[0]?.borderBoxSize[0]?.blockSize;
                window.localStorage.setItem(`textarea-custom-height-${this.status.user.id}`, this.textAreaHeight.toString())
            }, 300);
        }
    }

    adjustShowLimit(e) {
        // console.log(e);
    }

    doClear() {
        this.recording = null;
        this.recordingChunks = [];
        this.audioUrl = null;
        this.recordTime = 0;
    }

    clearReplyTo() {
        let generateMenu = false;
        if (this.replyTo?.comment) {
            this.disableSignature = false;
            generateMenu = true;
        }
        this.replyTo = {id: '', text: '', mine: false, quotedFile: false, comment: false, previewUrl: ''};
        if (generateMenu) {
            // Não é mais resposta de um comentário, reescreve para adicionar os itens da galeria
            this.generateMenuItems();
        }
        this.replyToCleared.emit();
    }

    emojiClick(e) {
        this.messageArea.nativeElement.setRangeText(e.emoji.native, this.messageArea.nativeElement.selectionStart, this.messageArea.nativeElement.selectionEnd, "end");
        const ev = new Event('input', {bubbles: true});
        this.messageArea.nativeElement.dispatchEvent(ev);
        this.messageArea.nativeElement.focus();
    }

    toggleEmoji() {
        if (!this.disabled) {
            if (Date.now() - this.lastEmojiToggle > 500) {
                this.lastEmojiToggle = Date.now();
                this.showEmojiPicker = !this.showEmojiPicker;
            }
        }
    }

    closeEmoji() {
        if (!this.disabled) {
            this.showEmojiPicker = false
        }
    }

    timer() {
        this.recordingTimer = setTimeout(() => {
            this.timer();
            if (this.recordingAudio) {
                this.recordTime++;
            }
        }, 1000);
    }

    showShortcutsPopup() {
        this.noResults = 0;
        this.lastSize = 1;
        this.showLimit = 12;
        this.filteredItens = this.allItens;
        this.showShortcuts = true;
    }

    textChanged() {
        if (!this.showShortcuts) {
            this.textChange.emit(this.text);
        } else {

            if (this.text === '') {
                this.showShortcuts = false;
                return this.textChanged();
            }

            const filter = this.text.slice(1);

            if (filter) {
                this.filteredItens = _.filter(this.allItens, this.filter(filter));
            } else {
                this.filteredItens = this.allItens;
            }

            this.showLimit = 12;

            // console.log('filter', filter, this.filteredItens, this.allItens);

            if (!this.filteredItens.length) {
                // Se é o terceiro caractere sem resultados, remove a tela de shortcut
                if (this.noResults > 2 && this.text.length > this.lastSize) {
                    this.showShortcuts = false;
                    return this.textChanged();
                }
                // Usuário está apagando, reseta a contagem
                if (this.lastSize > this.text.length) {
                    this.noResults = 0;
                } else {
                    this.noResults++;
                }
            } else {
                this.changeSelectedItem(0);
                this.noResults = 0;
            }
            this.lastSize = this.text.length;

        }
    }

    filter(filter) {
        return (o) => {
            return o.title?.toLowerCase().includes(filter.toLowerCase()) || o.text?.toLowerCase().includes(filter.toLowerCase()) ||
                o.file_name?.toLowerCase().includes(filter.toLowerCase()) || o.file_mimetype?.toLowerCase().includes(filter.toLowerCase());
        };
    }

    getAiMessageSuggestion() {
        setTimeout(() => {
            this.executingAi = true;
        }, 1);
        this.http.post(BASE_URL + '/api/callAiMessageSugestion', {id: this.chatId}).subscribe((res: any) => {
            if (res?.response) {
                if (res?.response === 'QUEUE_NOT_ALLOWED') {
                    this.snack.open($localize`Essa fila não permite a solicitação de sugestão de mensagem.`, $localize`Fechar`, {duration: 2000});
                } else if (res?.response === 'LIMIT_REACHED') {
                    this.snack.open($localize`O limite diário de solicitações para o seu usuário foi atingido.`, $localize`Fechar`, {duration: 2000});
                } else {
                    this.text = res.response;
                }
                this.messageArea?.nativeElement?.focus();
                this.executingAi = false;
            } else {
                this.executingAi = false;
                this.snack.open($localize`Não foi possível gerar sugestão de mensagem`, $localize`Fechar`, {duration: 3000});
            }
        }, err => {
            console.log(err);
            this.executingAi = false;
            this.snack.open($localize`Não foi possível gerar sugestão de mensagem`, $localize`Fechar`, {duration: 3000});
        });
    }

    genAiSummary() {
        setTimeout(() => {
            this.executingAi = true;
        }, 1);
        this.http.post(BASE_URL + '/api/genAiSummary', {id: this.chatId}).subscribe((res: any) => {
            if (res?.response === 'TOO_SHORT') {
                this.snack.open($localize`Não foi possível gerar resumo, a conversa é muito curta`, $localize`Fechar`, {duration: 2000});
            } else if (res?.response === 'LIMIT_REACHED') {
                this.snack.open($localize`O limite diário de solicitações para o seu usuário foi atingido.`, $localize`Fechar`, {duration: 2000});
            } else if (res?.response === 'QUEUE_NOT_ALLOWED') {
                this.snack.open($localize`Essa fila não permite a solicitação de resumos.`, $localize`Fechar`, {duration: 2000});
            }
            this.messageArea?.nativeElement?.focus();
            this.executingAi = false;
        }, err => {
            this.executingAi = false;
            console.log(err)
        });
    }

    requestMessageInprovement(improvementStyle = 'professional') {
        if (!this.text) {
            return;
        }
        setTimeout(() => {
            this.executingAi = true;
        }, 1);
        this.http.post(BASE_URL + '/api/improveMessage', {chatId: this.chatId, text: this.text, improvementStyle}).subscribe((res: any) => {
            if (res?.response === 'TOO_SHORT') {
                this.snack.open($localize`Não foi possível gerar resumo, a conversa é muito curta`, $localize`Fechar`, {duration: 2000});
            } else if (res?.response === 'LIMIT_REACHED') {
                this.snack.open($localize`O limite diário de solicitações para o seu usuário foi atingido.`, $localize`Fechar`, {duration: 2000});
            } else if (res?.response === 'QUEUE_NOT_ALLOWED') {
                this.snack.open($localize`Essa fila não permite a solicitação de resumos.`, $localize`Fechar`, {duration: 2000});
            }
            if (res.response) {
                this.aiChatControl.oldText = this.text;
                this.text = res.response;
                this.aiChatControl.aiModified = true;
            }
            this.messageArea?.nativeElement?.focus();
            this.executingAi = false;
        }, err => {
            this.executingAi = false;
            console.log(err)
        });
    }

    revertAiChange() {
        this.text = this.aiChatControl.oldText;
        this.aiChatControl.oldText = '';
        this.aiChatControl.aiModified = false;
    }

}

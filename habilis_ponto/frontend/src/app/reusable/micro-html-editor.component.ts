/**
 * Created by filipe on 17/09/16.
 */
import {Component, ElementRef, EventEmitter, Input, OnChanges, Output, SimpleChanges, ViewChild} from '@angular/core';
import {animate, state, style, transition, trigger} from "@angular/animations";

@Component({
  selector: 'app-micro-html-editor',
  templateUrl: 'micro-html-editor.component.html',
  styleUrls: ['micro-html-editor.component.scss'],
  animations: [
    trigger('visibilityState', [
      state('void', style({
        opacity: 0
      })),
      transition('void => visible', [
        animate('0.2s 0.2s ease-in-out'),
      ]),
      transition('visible => void', [
        animate('0.2s ease-in-out'),
      ])
    ])
  ]
})
export class MicroHtmlEditorComponent implements OnChanges {

  @Input() model = '';
  @Output() modelChange = new EventEmitter<string>();
  @Output() changed = new EventEmitter<string>();

  @Input() unFocusOnEnter = false;
  @Input() disabled = false;
  @Input() fontSize = 14;
  @Input() baseFontWeight = 'light';
  @Input() placeholder = '';

  @ViewChild('divEditor') editor: ElementRef<HTMLDivElement>;
  _showMenu = false;
  modelText = '';
  modText = '';
  hideMenuTimerRef;
  lastSelection;
  lastRange;

  bold = false;
  italic = false;
  underline = false;
  strike = false;
  markYellow = false;
  markRed = false;
  markBlue = false;
  markGreen = false;
  markOrange = false;

  constructor() {

  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.model && changes.model.currentValue !== this.modText) {
      this.modelText = changes.model.currentValue;
    }
  }

  removeFocus(e: KeyboardEvent) {
    // @ts-ignore
    e.target.blur();
    e.preventDefault();
    e.stopPropagation();
  }

  updateSelection() {
    this.lastSelection = window.getSelection();
    this.lastRange = this.lastSelection.getRangeAt(0);
    this.checkSelection();
  }

  updateModel(content) {
    this.updateSelection();
    this.modText = content;
    this.modelChange.emit(content);
    this.changed.emit('');
    return true;
  }

  preventDefault(e) {
    if (this.lastRange) {
      const selection = window.getSelection();
      selection.removeAllRanges();
      selection.addRange(this.lastRange);
    } else {
      this.editor.nativeElement.focus();
    }
  }

  hideMenu() {
    this.hideMenuTimerRef = setTimeout(() => {
      this._showMenu = false;
    }, 200);
  }

  showMenu() {
    if (this.hideMenuTimerRef) {
      clearTimeout(this.hideMenuTimerRef);
    }
    this._showMenu = true;
  }

  checkSelection() {

    const text = this.lastSelection?.anchorNode;

    if (!text) {
      return true;
    }

    const anchorElement = text instanceof Element ? text : text.parentElement;
    this.bold = anchorElement.classList.contains('editor-bold');
    this.italic = anchorElement.classList.contains('editor-italic');
    this.underline = anchorElement.classList.contains('editor-underline');

  }

  toogleBold() {

    const text = this.lastRange?.startContainer;

    if (!text) {
      return true;
    }

    if (text instanceof Element) {
      const anchorElement = text;
      anchorElement.classList.toggle('editor-bold');
      return true;
    } else {
      const selectedText = this.lastRange?.extractContents();
      if (!selectedText) {
        return true;
      }
      const span = document.createElement('span');
      span.appendChild(selectedText);
      span.classList.add('editor-bold');
      this.lastRange.insertNode(span);
    }


  }

  addMark() {
    const selectedText = this.lastRange?.extractContents();
    if (!selectedText) {
      return true;
    }
    const mark = document.createElement('mark');
    mark.appendChild(selectedText);
    this.lastRange.insertNode(mark);
    return true;
  }

}

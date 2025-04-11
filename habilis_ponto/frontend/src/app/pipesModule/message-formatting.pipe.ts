import {Pipe, PipeTransform} from '@angular/core';

@Pipe({name: 'messageFormattingPipe'})
export class MessageFormattingPipe implements PipeTransform {

  constructor() {
  }

  openUrl() {

  }

  transform(msg: string, escapeHtml = true, subject = '', highlight = '') {

    const message = escapeHtml ? msg?.replace(/</g, '&lt;').replace(/>/g, '&gt;').trim() : msg.trim();
    let finalMessage = escapeHtml ? message?.replace(
      /((http|https|ftp|ftps)\:\/\/[a-zA-Z0-9\-\.]+\.[a-zA-Z]{2,3}(\/\S*)?)/g,
      '<a data-href="$1" class="msg-link" target="_blank">$1</a>'
    ) || '' : message || '';

    if (subject) {
      finalMessage = `${subject}:<br/><br/>${finalMessage}`;
    }

    if (escapeHtml) {
      let replaces = message?.match(new RegExp(/\*(.*?)\*/g));

      if (replaces?.length) {
        for (const r of replaces) {
          finalMessage = finalMessage.replace(r, '<b>' + r.replace(new RegExp(/\*/g), '') + '</b>');
        }
      }

      replaces = message?.match(new RegExp(/_(.*?)_/g));

      if (replaces?.length) {
        for (const r of replaces) {
          finalMessage = finalMessage.replace(r, '<i>' + r.replace(new RegExp(/_/g), '') + '</i>');
        }
      }

      replaces = message?.match(new RegExp(/~(.*?)~/g));

      if (replaces?.length) {
        for (const r of replaces) {
          finalMessage = finalMessage.replace(r, '<s>' + r.replace(new RegExp(/\~/g), '') + '</s>');
        }
      }
    }

    if (highlight) {

      let replaces = message?.match(new RegExp(highlight, 'gi'));
      if (replaces?.length) {
        for (const r of replaces) {
          finalMessage = finalMessage.replace(r, '<b class="fg-primary">' + r.replace(new RegExp(/\~/g), '') + '</b>');
        }
      }

    }

    return finalMessage;

  }

}

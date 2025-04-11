import {YesNoComponent} from './yes-no.component';

/**
 * Acrescenta um diálogo de confirmação antes de executar a função invocada
 * @param dialogKey - Nome do MatDialog no componente de origem
 * @param config - Configuração do diálogo de confirmação
 * @constructor
 */
export function ConfirmAction(dialogKey = '',
                              config: {
                                text?: string,
                                title?: string,
                                yesButtonStyle?: string,
                                yesButtonText?: string,
                                noButtonText?: string,
                                backdropClass?: string
                              } = {}) {

  const text = config.text || $localize`Tem certeza que deseja executar essa ação?`;
  const title = config.title || $localize`Confirmação`;
  const yesButtonStyle = config.yesButtonStyle || 'danger';
  const yesButtonText = config.yesButtonText || $localize`Confirmar`;
  const noButtonText = config.noButtonText || $localize`Cancelar`;

  // tslint:disable-next-line:only-arrow-functions
  return function (target: object, key: string | symbol, descriptor: PropertyDescriptor) {
    const original = descriptor.value;
    descriptor.value = function (...args: any[]) {
      if (this.hasOwnProperty(dialogKey)) {
        const diag = this[dialogKey].open(YesNoComponent, {
          data: {
            text,
            title,
            yesButtonText,
            yesButtonStyle,
            noButtonText
          }, autoFocus: false,
          ...(config.backdropClass ? {backdropClass: config.backdropClass} : {})
        });
        const diagSub = diag.afterClosed().subscribe(r => {
          diagSub.unsubscribe();
          if (r) {
            const ret = original.apply(this, args);
            return ret;
          }
        });
      } else {
        // Fallback caso o MatDialog não tenha sido fornecido, neste caso, utiliza a confirmação do próprio navegador
        const fallback = window.confirm(text);
        if (fallback) {
          const ret = original.apply(this, args);
          return ret;
        }
      }

    };
  };
}

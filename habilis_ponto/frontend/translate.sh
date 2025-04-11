#!/bin/bash

echo 'Iniciando processamento...'
ng extract-i18n
node translate-xliff.js
echo 'Processamento concluído!'


import { welcomeEmailTemplate } from './welcome-email.template';

/**
 * Mapeia um nome de template para sua função geradora.
 */
const templates: Record<string, (context: any) => string> = {
  'welcome-email': welcomeEmailTemplate,
  // Adicione outros templates aqui
};

/**
 * Retorna o conteúdo HTML de um template preenchido com o contexto.
 */
export function getEmailTemplate(name: string, context: any): string {
  // CORREÇÃO: Usar hasOwnProperty é uma verificação mais explícita e robusta,
  // que satisfaz a regra do linter e evita problemas com tsconfig.
  if (Object.prototype.hasOwnProperty.call(templates, name)) {
    return templates[name](context);
  }
  return '';
}

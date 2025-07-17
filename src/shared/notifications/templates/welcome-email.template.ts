/**
 * Gera o template HTML para o e-mail de boas-vindas.
 * @param context - Dados a serem inseridos no template.
 * @param context.name - O nome do condomínio.
 * @param context.managerEmail - O e-mail do síndico.
 * @param context.password - A senha temporária.
 */
export const welcomeEmailTemplate = (context: {
  name: string;
  managerEmail: string;
  password: string;
}): string => {
  return `
    <div style="font-family: Arial, sans-serif; color: #333;">
      <h2>Bem-vindo ao Concierge Control, ${context.name}!</h2>
      <p>Sua conta de síndico foi criada com sucesso.</p>
      <p>Abaixo estão suas credenciais de acesso iniciais. Recomendamos que você altere sua senha no primeiro acesso.</p>
      <ul>
        <li><strong>E-mail de Acesso:</strong> ${context.managerEmail}</li>
        <li><strong>Senha Temporária:</strong> ${context.password}</li>
      </ul>
      <p>Atenciosamente,<br/>Equipe Concierge Control</p>
    </div>
  `;
};

/**
 * Define o contrato padrão para todos os casos de uso na aplicação.
 * Este contrato pertence à camada de domínio, pois dita uma regra
 * fundamental da arquitetura da aplicação.
 *
 * @template TRequest O tipo do objeto de entrada (request).
 * @template TResponse O tipo do objeto de saída (response).
 */
export interface IUseCase<TRequest, TResponse> {
  /**
   * Executa a lógica de negócio do caso de uso.
   * A assinatura do método se adapta: não terá parâmetros se TRequest for void,
   * ou terá um parâmetro 'request' do tipo TRequest caso contrário.
   */

  execute(
    // eslint-disable-next-line @typescript-eslint/no-invalid-void-type
    ...args: TRequest extends void ? [] : [request: TRequest]
  ): Promise<TResponse>;
}

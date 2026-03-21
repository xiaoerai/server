declare module 'alipay-sdk/lib/form' {
  export default class AlipayFormData {
    constructor()
    setMethod(method: string): void
    addField(field: string, value: any): void
  }
}

declare module 'xhr-request-promise' {
  export function request(url: string, options: any): Promise<any>;

  export default request;
}

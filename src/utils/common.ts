export function generateRandomId(length:number): string {
    const characters:string = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789abcdefghijklmnopqrstuvwxyz';
    let randomId:string = '';
    const charactersLength:number = characters.length;
    for (let i:number = 0; i < length; i++) {
        randomId += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return randomId;
  }
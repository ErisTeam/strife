interface AuthEvent {
    type: string;
}
interface qrcode extends AuthEvent {
    type: 'mobileQrcode';
    qrcode: string;
}
interface ticketData extends AuthEvent {
    type: 'mobileTicketData';
    userId: string;
    discriminator: string;
    username: string;
    avatarHash: string;
}
interface RequireAuth extends AuthEvent {
    type: 'requireAuth';
    captcha_key?: string[];
    captcha_sitekey?: string;
    mfa: boolean;
    sms: boolean;
}
interface RequireAuthMobile extends AuthEvent {
    type: 'requireAuthMobile';
    captcha_key?: string[];
    captcha_sitekey: string;
}
interface VerifyError extends AuthEvent {
    type: 'VerifyError';
    message: string;
}
interface Error extends AuthEvent {
    type: 'error';
    message: string;
    code: number;
    errors: any;
}
interface LoginSuccess extends AuthEvent {
    type: 'loginSuccess';
    userId: string;
    userSettings?: any;
}

type AuthEvents = qrcode| ticketData | RequireAuth | RequireAuthMobile | VerifyError | LoginSuccess | Error;
export { AuthEvents };
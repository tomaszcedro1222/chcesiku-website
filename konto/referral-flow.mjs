export const validCode = value => typeof value === 'string' && /^[a-f0-9]{32}$/.test(value) ? value : null;
export function pendingReferral(url, saved) {
  const values = new URL(url).searchParams.getAll('ref');
  if (values.length > 1 || (values.length === 1 && !validCode(values[0]))) return null;
  return validCode(saved) ?? validCode(values[0]);
}
export function confirmationUrl(origin, code) {
  const url = new URL('/konto/potwierdzenie/', origin);
  if (validCode(code)) url.searchParams.set('ref', code);
  return url.href;
}
export function emailConfirmation(url) {
  const current = new URL(url), params = new URLSearchParams(current.hash.slice(1)), tokens = params.getAll('token_hash'), types = params.getAll('type');
  if (tokens.length !== 1 || types.length !== 1 || types[0] !== 'email' || !/^[a-zA-Z0-9_-]{20,256}$/.test(tokens[0])) return null;
  return {token_hash:tokens[0],type:'email'};
}
export function emailReturnReferral(url, saved) {
  const current = new URL(url), params = new URLSearchParams(current.hash.slice(1));
  if (!params.has('next')) return pendingReferral(url, saved);
  const values = params.getAll('next');
  if (values.length !== 1) return null;
  try {
    const next = new URL(values[0]);
    if (next.origin !== 'https://chcesiku.pl' || next.pathname !== '/konto/potwierdzenie/' || next.username || next.password) return null;
    return pendingReferral(next.href, saved);
  } catch { return null; }
}
export function cleanConfirmationUrl(url) {
  const clean = new URL(url);
  for (const key of ['token_hash','type','next','code','error','error_code','error_description']) clean.searchParams.delete(key);
  clean.hash = '';
  return clean;
}
export const terminalStatuses = new Set(['accepted', 'account_already_redeemed', 'already_redeemed', 'account_ineligible', 'invalid_invite', 'self_referral', 'installation_ineligible']);
export const messages = {
  accepted: 'Gotowe! Polecenie zostało zaliczone. Ty i osoba polecająca otrzymujecie miesiąc bez reklam.',
  account_already_redeemed: 'To konto odebrało już polecenie. Kolejne kliknięcie nie nalicza dodatkowej nagrody.',
  already_redeemed: 'To polecenie zostało już odebrane. Nagroda nie zostanie naliczona ponownie.',
  account_ineligible: 'Konto, które wygenerowało własny link polecający, nie może odebrać cudzego polecenia.',
  self_referral: 'Nie możesz odebrać własnego polecenia.',
  installation_ineligible: 'Nie można zaliczyć własnego polecenia.',
  invalid_invite: 'Ten link polecający nie jest aktywny. Poproś znajomą osobę o sprawdzenie linku.',
  email_confirmation_required: 'Potwierdź adres e-mail, aby zaliczyć polecenie.',
  sign_in_required: 'Zaloguj się, aby zaliczyć polecenie.',
  disabled: 'Odbiór poleceń na stronie nie jest jeszcze dostępny. Twoje zaproszenie pozostaje zapisane.',
  retry_later: 'Nie udało się teraz potwierdzić polecenia. Spróbuj ponownie później.',
};

/** Confirmation copy follows the verified session and server receipt, never URL parameters. */
export function confirmationPresentation({user, hasInvitation, result, recovering = false}) {
  if (recovering) return {title:'Ustaw nowe hasło', intro:'Wpisz poniżej nowe hasło do swojego konta.', reward:null};
  if (!user) return {
    title:hasInvitation ? 'Dokończ odbiór polecenia' : 'Dokończ logowanie',
    intro:hasInvitation ? 'Jeśli potwierdziłeś już adres e-mail, zaloguj się poniżej. Polecenie zaliczymy automatycznie - bez wracania do zaproszenia.' : 'Zaloguj się poniżej, aby dokończyć potwierdzenie konta.', reward:null,
  };
  if (!user.email_confirmed_at || user.is_anonymous) return {title:'Potwierdź adres e-mail', intro:'Otwórz link z wiadomości, aby potwierdzić konto i dokończyć odbiór polecenia.', reward:null};
  if (hasInvitation && result === 'accepted') return {
    title:'Gratulacje! Konto potwierdzone.',
    intro:'Pobierz aplikację i wykorzystaj miesiąc bez reklam. Zaloguj się w niej na to samo konto.',
    reward:'Miesiąc bez reklam jest już na Twoim koncie.',
  };
  return {
    title:'Konto potwierdzone!',
    intro:hasInvitation && result === 'pending' ? 'Jeszcze chwila. Sprawdzamy polecenie i zapisujemy nagrodę.' : 'Możesz pobrać aplikację i zalogować się w niej na to samo konto. Informację o poleceniu znajdziesz poniżej.',
    reward:null,
  };
}

export function confirmationSignInMessage(error) {
  return ['flow_state_not_found','flow_state_expired','bad_code_verifier','pkce_verifier_not_found','validation_failed'].includes(error?.code)
    ? 'Link z e-maila został otwarty bez sesji rejestracji, np. w innej przeglądarce lub poza oknem prywatnym. Zaloguj się poniżej, aby dokończyć odbiór. Nie musisz ponownie klikać zaproszenia.'
    : 'Nie udało się automatycznie zalogować z linku. Jeśli adres e-mail jest już potwierdzony, zaloguj się poniżej, aby dokończyć odbiór polecenia.';
}

/** Single flight per account and link. Only a real server receipt completes it. */
export class ReferralRedemption {
  constructor({redeem, clear}) { this.redeem = redeem; this.clear = clear; this.pending = new Map(); this.completed = new Map(); }
  async run(user, code) {
    if (!user || !validCode(code)) return null;
    if (!user.email_confirmed_at || user.is_anonymous) return 'email_confirmation_required';
    const key = `${user.id}:${code}`;
    if (this.completed.has(key)) return this.completed.get(key);
    if (this.pending.has(key)) return this.pending.get(key);
    const task = (async () => {
      try {
        const status = await this.redeem(code);
        if (!Object.hasOwn(messages, status)) throw new Error('Unrecognized receipt');
        if (terminalStatuses.has(status)) { this.completed.set(key, status); this.clear(code); }
        return status;
      } finally { this.pending.delete(key); }
    })();
    this.pending.set(key, task);
    return task;
  }
}

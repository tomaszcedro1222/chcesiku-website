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

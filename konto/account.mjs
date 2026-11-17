import {config} from './config.mjs';
import {pendingReferral, confirmationUrl, ReferralRedemption, messages, terminalStatuses, validCode} from './referral-flow.mjs';

const $ = id => document.getElementById(id);
const pendingKey = 'chcesiku.pending-web-referral.v1';
const storage = {
  read() { try { const value = JSON.parse(localStorage.getItem(pendingKey)); return Date.now() - value?.savedAt < 7 * 86400000 ? validCode(value.code) : null; } catch { return null; } },
  save(code) { try { localStorage.setItem(pendingKey, JSON.stringify({code, savedAt:Date.now()})); } catch { /* The confirmation URL also carries the invitation. */ } },
  clear(code) { try { if (this.read() === code) localStorage.removeItem(pendingKey); } catch {} },
};
let invitation = pendingReferral(location.href, storage.read());
if (invitation) storage.save(invitation);
let mode = 'login', session = null, generation = 0, busy = false, confirmationEmail = null, recovering = false;
const localPreview = ['127.0.0.1','localhost'].includes(location.hostname) && new URL(config.supabaseUrl).hostname !== location.hostname;
const previewMessage = 'Podgląd lokalny. Formularz nie wysyła tutaj danych konta; odbiór nagród wymaga zatwierdzonego wdrożenia.';
const status = (text, kind = '') => { $('status').textContent = text; $('status').className = `status ${kind}`; $('status').hidden = !text; };
function setMode(next) {
  mode = next; $('form-title').textContent = ({login:'Zaloguj się', register:'Załóż konto', recovery:'Ustaw nowe hasło'})[mode];
  $('tab-login').setAttribute('aria-pressed', mode === 'login'); $('tab-register').setAttribute('aria-pressed', mode === 'register');
  $('name-field').hidden = mode !== 'register'; $('display-name').required = mode === 'register';
  $('registration-terms').hidden = mode !== 'register'; $('password').autocomplete = mode === 'login' ? 'current-password' : 'new-password';
  $('submit').textContent = ({login:'Zaloguj się', register:'Załóż konto', recovery:'Zapisz nowe hasło'})[mode];
  $('forgot-password').hidden = mode !== 'login'; $('auth-tabs').hidden = mode === 'recovery'; status('');
}
function setBusy(value) { busy = value; for (const element of $('auth-form').elements) element.disabled = value; $('tab-login').disabled = value; $('tab-register').disabled = value; }
const client = window.supabase?.createClient(config.supabaseUrl, config.publishableKey, {auth:{flowType:'pkce',detectSessionInUrl:true,persistSession:true,autoRefreshToken:true,storageKey:'chcesiku.website.auth.v1'}});
if (!client) {
  status('Nie udało się uruchomić bezpiecznego logowania. Odśwież stronę lub spróbuj później.', 'error');
  setBusy(true);
} else {
  const flow = new ReferralRedemption({
    redeem: async code => {
      const {data,error} = await client.functions.invoke('referral-web', {body:{code}});
      if (error) throw error;
      return data?.status;
    },
    clear: code => storage.clear(code),
  });
  const userStillCurrent = (id, currentGeneration) => generation === currentGeneration && session?.user.id === id;
  async function renderSession(nextSession) {
    session = nextSession; const currentGeneration = ++generation;
    const signedIn = !!session && !recovering;
    $('auth-form').hidden = signedIn; $('auth-tabs').hidden = signedIn || recovering; $('signed-in').hidden = !signedIn;
    $('confirmation').hidden = true; $('retry').hidden = true;
    if (!signedIn) { $('download').hidden = true; return; }
    const user = session.user;
    $('form-title').textContent = invitation ? 'Twoje polecenie' : 'Twoje konto'; $('account-email').textContent = user.email ?? '';
    $('download').hidden = false;
    if (invitation) {
      status('Potwierdzamy polecenie…');
      try {
        const result = await flow.run(user, invitation);
        if (!userStillCurrent(user.id, currentGeneration)) return;
        status(messages[result] ?? 'Nie udało się teraz potwierdzić polecenia.', result === 'accepted' ? 'success' : '');
        $('retry').hidden = terminalStatuses.has(result) || result === 'email_confirmation_required';
      } catch {
        if (!userStillCurrent(user.id, currentGeneration)) return;
        status('Nie udało się połączyć z serwerem poleceń. Zaproszenie pozostaje zapisane. Spróbuj ponownie.', 'error'); $('retry').hidden = false;
      }
    } else status('Zalogowano. Możesz teraz pobrać aplikację.', 'success');
    try {
      const {data,error} = await client.rpc('get_my_referral_state');
      if (error || !userStillCurrent(user.id, currentGeneration)) return;
      const until = Date.parse(data.ad_free_until), now = Date.parse(data.server_now);
      $('benefit').textContent = until > now ? `Bez reklam do: ${new Date(until).toLocaleDateString('pl-PL')}. Zaloguj się na to samo konto w aplikacji.` : '';
    } catch { /* A status read must never pretend to grant a reward. */ }
  }
  client.auth.onAuthStateChange((event, nextSession) => {
    if (event === 'PASSWORD_RECOVERY') { recovering = true; setMode('recovery'); }
    // Supabase calls must run after its auth callback releases the session lock.
    setTimeout(() => { if (!busy) void renderSession(nextSession); }, 0);
  });
  $('tab-login').onclick = () => setMode('login'); $('tab-register').onclick = () => setMode('register');
  $('auth-form').onsubmit = async event => {
    event.preventDefault(); if (busy || !$('auth-form').reportValidity()) return;
    if (localPreview) { status(previewMessage); return; }
    setBusy(true); status('Chwileczkę…');
    const email = $('email').value.trim(), password = $('password').value;
    try {
      if (mode === 'register') {
        const {data,error} = await client.auth.signUp({email,password,options:{emailRedirectTo:confirmationUrl(location.origin, invitation),data:{display_name:$('display-name').value.trim()}}});
        if (error) throw error;
        $('password').value = '';
        if (data.session) { setBusy(false); await renderSession(data.session); }
        else {
          confirmationEmail = email; $('auth-form').hidden = true; $('auth-tabs').hidden = true; $('confirmation').hidden = false; $('download').hidden = false; $('form-title').textContent = 'Sprawdź swoją pocztę';
          status('Konto zgłoszone do rejestracji. Polecenie zaliczymy po potwierdzeniu adresu e-mail i zalogowaniu.', '');
        }
      } else if (mode === 'recovery') {
        const {error} = await client.auth.updateUser({password}); if (error) throw error;
        recovering = false; $('password').value = ''; setMode('login'); setBusy(false);
        const {data} = await client.auth.getSession(); await renderSession(data.session);
      } else {
        const {data,error} = await client.auth.signInWithPassword({email,password}); if (error) throw error;
        $('password').value = ''; setBusy(false); await renderSession(data.session);
      }
    } catch (error) {
      const code = error?.code;
      const text = ({invalid_credentials:'Nieprawidłowy e-mail lub hasło.',email_not_confirmed:'Potwierdź adres e-mail, a następnie zaloguj się.',over_email_send_rate_limit:'Wysłano już wiadomość. Odczekaj chwilę przed ponowieniem.',weak_password:'Wybierz silniejsze hasło.',same_password:'Nowe hasło musi różnić się od dotychczasowego.'})[code] ?? 'Nie udało się wykonać operacji. Sprawdź połączenie i spróbuj ponownie.';
      status(text, 'error');
    } finally { setBusy(false); }
  };
  $('forgot-password').onclick = async () => {
    if (localPreview) { status(previewMessage); return; }
    const email = $('email').value.trim(); if (!$('email').reportValidity()) return;
    setBusy(true);
    try { const {error} = await client.auth.resetPasswordForEmail(email, {redirectTo:confirmationUrl(location.origin, invitation)}); if (error) throw error; status('Jeśli konto istnieje, otrzymasz wiadomość pozwalającą ustawić nowe hasło.'); }
    catch { status('Nie udało się wysłać wiadomości. Spróbuj ponownie później.', 'error'); }
    finally { setBusy(false); }
  };
  $('retry').onclick = () => { if (!busy && session) void renderSession(session); };
  $('back-to-login').onclick = () => { $('confirmation').hidden = true; $('auth-form').hidden = false; $('auth-tabs').hidden = false; setMode('login'); };
  $('resend').onclick = async () => {
    if (!confirmationEmail) return; $('resend').disabled = true;
    try { const {error} = await client.auth.resend({type:'signup',email:confirmationEmail,options:{emailRedirectTo:confirmationUrl(location.origin, invitation)}}); if (error) throw error; status('Wysłano link potwierdzający. Sprawdź pocztę.'); }
    catch { status('Nie udało się ponowić wiadomości. Odczekaj chwilę i spróbuj ponownie.', 'error'); }
    finally { $('resend').disabled = false; }
  };
  $('sign-out').onclick = async () => {
    setBusy(true); try { const {error} = await client.auth.signOut(); if (error) throw error; storage.clear(invitation); invitation = null; recovering = false; await renderSession(null); setMode('login'); $('auth-form').hidden = false; $('auth-tabs').hidden = false; }
    catch { status('Nie udało się wylogować. Spróbuj ponownie.', 'error'); } finally { setBusy(false); }
  };
  const ios = /iPhone|iPad|iPod/.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
  $('download-app').href = ios ? config.appStore : /Android/.test(navigator.userAgent) ? config.googlePlay : '/pobierz/';
  if (document.body.dataset.referral === 'true' && !invitation) {
    status('Ten link zaproszenia jest niepełny. Poproś o przesłanie oryginalnego linku.', 'error'); setBusy(true);
  } else {
    try { const {data,error} = await client.auth.getSession(); if (error) throw error; await renderSession(data.session); if (localPreview) status(previewMessage); }
    catch { status('Nie udało się odczytać sesji. Zaloguj się ponownie.', 'error'); }
  }
}

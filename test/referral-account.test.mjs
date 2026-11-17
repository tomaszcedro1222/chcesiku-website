import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {pendingReferral,emailConfirmation,emailReturnReferral,cleanConfirmationUrl,confirmationUrl,confirmationPresentation,confirmationSignInMessage,ReferralRedemption,messages} from '../konto/referral-flow.mjs';
const a='a'.repeat(32), b='b'.repeat(32), user={id:'account-a',email_confirmed_at:'2026-11-17',is_anonymous:false};
test('pending invitation survives confirmation and first valid invitation wins',()=>{
  assert.equal(pendingReferral(`https://chcesiku.pl/polecenie/?ref=${a}`,null),a);
  assert.equal(pendingReferral(`https://chcesiku.pl/konto/potwierdzenie/?ref=${b}&code=auth-code`,a),a);
  assert.equal(pendingReferral(`https://chcesiku.pl/konto/potwierdzenie/?ref=${a}&code=auth-code`,null),a);
  assert.equal(pendingReferral(`https://chcesiku.pl/polecenie/?ref=${a}&ref=${b}`,null),null);
  assert.equal(pendingReferral('https://chcesiku.pl/polecenie/?ref=invalid',null),null);
  assert.equal(confirmationUrl('https://chcesiku.pl',a),`https://chcesiku.pl/konto/potwierdzenie/?ref=${a}`);
});
test('repeated auth events trigger one receipt; unconfirmed account gets no reward',async()=>{
  let calls=0,cleared=0,finish;
  const flow=new ReferralRedemption({redeem:async()=>{calls++;return new Promise(r=>finish=r);},clear:()=>cleared++});
  assert.equal(await flow.run({...user,email_confirmed_at:null},a),'email_confirmation_required');assert.equal(calls,0);
  const first=flow.run(user,a), second=flow.run(user,a);finish('accepted');
  assert.equal(await first,'accepted');assert.equal(await second,'accepted');assert.equal(await flow.run(user,a),'accepted');
  assert.equal(calls,1);assert.equal(cleared,1);
});
test('temporary error retains invitation; different accounts do not inherit a receipt',async()=>{
  let calls=0,cleared=0;
  const flow=new ReferralRedemption({redeem:async()=>{calls++;if(calls===1)throw Error('offline');return'account_already_redeemed';},clear:()=>cleared++});
  await assert.rejects(flow.run(user,a));assert.equal(cleared,0);
  assert.equal(await flow.run(user,a),'account_already_redeemed');assert.equal(cleared,1);
  await flow.run({...user,id:'account-b'},a);assert.equal(calls,3);
});
test('unknown or non-confirmed result cannot show success or discard invitation',async()=>{
  let cleared=0;
  for (const reply of ['disabled','retry_later','arbitrary']) {
    const flow=new ReferralRedemption({redeem:async()=>reply,clear:()=>cleared++});
    if(reply==='arbitrary')await assert.rejects(flow.run(user,a));else assert.equal(await flow.run(user,a),reply);
  }
  assert.equal(cleared,0);assert.ok(messages.accepted.includes('miesiąc'));
});
test('landing supports account redemption and downloading without custom-scheme navigation',()=>{
  const read=path=>readFileSync(new URL(path,import.meta.url),'utf8');
  const html=read('../polecenie/index.html'), script=read('../konto/account.mjs');
  assert.match(html,/id="auth-form"/);assert.match(html,/id="tab-register"/);assert.match(html,/id="download-app"/);
  assert.match(html,/Nie musisz wracać do zaproszenia/);assert.match(html,/Potwierdzenie adresu e-mail/);
  assert.ok(!html.includes('pl.chcesiku.chcesiku://'));
  assert.ok(!html.includes('analytics.js'));assert.ok(!script.includes('console.log'));
  assert.ok(script.includes('onAuthStateChange'));assert.ok(script.includes('emailRedirectTo:confirmationUrl'));
  assert.ok(read('../konto/potwierdzenie/index.html').includes('id="auth-form"'));
});
test('email return shows congratulations and reward only after confirmed session and accepted receipt',()=>{
  const success=confirmationPresentation({user,hasInvitation:true,result:'accepted'});
  assert.match(success.title,/Gratulacje/);assert.match(success.intro,/wykorzystaj miesiąc bez reklam/);assert.ok(success.reward);
  for(const result of ['pending','disabled','retry_later','self_referral','account_already_redeemed','invalid_invite',undefined]) {
    assert.equal(confirmationPresentation({user,hasInvitation:true,result}).reward,null,result);
  }
  assert.equal(confirmationPresentation({user:null,hasInvitation:true,result:'accepted'}).reward,null);
  assert.equal(confirmationPresentation({user:{...user,email_confirmed_at:null},hasInvitation:true,result:'accepted'}).reward,null);
  assert.equal(confirmationPresentation({user,hasInvitation:false,result:'accepted'}).reward,null);
  assert.equal(confirmationPresentation({user,hasInvitation:true,result:'accepted',recovering:true}).title,'Ustaw nowe hasło');
});
test('email opened without original browser session clearly offers sign in, not a false reward',()=>{
  const view=confirmationPresentation({user:null,hasInvitation:true});
  assert.match(view.title,/Dokończ odbiór/);assert.match(view.intro,/zaloguj się poniżej/);assert.equal(view.reward,null);
  assert.match(confirmationSignInMessage({code:'pkce_verifier_not_found'}),/innej przeglądarce/);
  assert.match(confirmationSignInMessage(),/Nie udało się automatycznie zalogować/);
  const html=readFileSync(new URL('../konto/potwierdzenie/index.html',import.meta.url),'utf8');
  assert.match(html,/data-confirmation="true"/);assert.match(html,/Kończymy rejestrację/);
  assert.ok(!html.includes('Miło Cię widzieć'));assert.ok(!html.includes('Jedno konto - ta sama aplikacja'));
});
test('email verification on another device preserves the referral and removes credentials from the address',()=>{
  const next=confirmationUrl('https://chcesiku.pl',a), token='synthetic-one-time-token-for-local-tests';
  const callback=new URL('https://chcesiku.pl/konto/potwierdzenie/');
  const fragment=new URLSearchParams({token_hash:token,type:'email',next});callback.hash=fragment.toString();
  assert.deepEqual(emailConfirmation(callback.href),{token_hash:token,type:'email'});
  assert.equal(emailReturnReferral(callback.href,null),a);
  assert.equal(emailReturnReferral(callback.href,b),b);
  assert.equal(cleanConfirmationUrl(callback.href).hash,'');assert.equal(cleanConfirmationUrl(callback.href).search,'');
  assert.equal(emailConfirmation(callback.href+'&token_hash='+token),null);
  assert.equal(emailConfirmation(callback.href.replace('type=email','type=recovery')),null);
  for(const redirect of ['https://evil.example/konto/potwierdzenie/?ref='+a,'https://chcesiku.pl.evil.example/konto/potwierdzenie/?ref='+a,'https://chcesiku.pl/other/?ref='+a,'/konto/potwierdzenie/?ref='+a]) {
    fragment.set('next',redirect);callback.hash=fragment.toString();assert.equal(emailReturnReferral(callback.href,null),null);
  }
});

import {test} from 'node:test';
import assert from 'node:assert/strict';

const referral='a'.repeat(32), confirmed={id:'new-account',email:'new@example.test',email_confirmed_at:'2026-11-17',is_anonymous:false};
const oldSession={user:{...confirmed,id:'previous-account'}};
async function openConfirmation({verificationFails=false,malformedToken=false}={}) {
  const nodes=new Map(), node=id=>{
    if(!nodes.has(id))nodes.set(id,{id,hidden:false,textContent:'',value:'',className:'',disabled:false,elements:[],setAttribute(){},reportValidity(){return true;}});
    return nodes.get(id);
  };
  globalThis.document={body:{dataset:{confirmation:'true',referral:'false'}},getElementById:node};
  const callback=new URL('https://chcesiku.pl/konto/potwierdzenie/');
  callback.hash=new URLSearchParams({token_hash:malformedToken?'invalid':'synthetic-one-time-verification-token',type:'email',next:'https://chcesiku.pl/konto/potwierdzenie/?ref='+referral}).toString();
  globalThis.location=callback;
  globalThis.history={replaceState(_state,_title,url){globalThis.location=new URL(url);}};
  const stored=new Map();globalThis.localStorage={getItem:key=>stored.get(key),setItem:(key,value)=>stored.set(key,value),removeItem:key=>stored.delete(key)};
  Object.defineProperty(globalThis,'navigator',{value:{userAgent:'iPhone',platform:'iPhone',maxTouchPoints:5},configurable:true});
  let authCallback,verificationCalls=0;const redemptions=[];
  globalThis.window={supabase:{createClient:()=>({
    auth:{
      onAuthStateChange(callback){authCallback=callback;},
      async initialize(){authCallback('INITIAL_SESSION',oldSession);return {error:null};},
      async verifyOtp(input){
        verificationCalls++;assert.equal(input.type,'email');assert.ok(!location.hash,'one-time credentials removed before Auth request');
        if(verificationFails){authCallback('TOKEN_REFRESHED',oldSession);return {data:{session:null},error:{code:'otp_expired'}};}
        return {data:{session:{user:confirmed}},error:null};
      },
      async signInWithPassword(){return {data:{session:{user:confirmed}},error:null};},
    },
    functions:{async invoke(_name,{body}){redemptions.push(body);return {data:{status:'accepted'},error:null};}},
    async rpc(){return {data:{server_now:'2026-11-17',ad_free_until:'2026-12-17'},error:null};},
  })}};
  await import('../konto/account.mjs?case='+ (malformedToken?'malformed':verificationFails?'expired':'success'));
  await new Promise(resolve=>setImmediate(resolve));
  return {node,redemptions,verificationCalls,authEvent:(event,session)=>authCallback(event,session)};
}

test('email opened on a second device verifies, redeems once, shows congratulations and download',async()=>{
  const page=await openConfirmation();
  assert.equal(page.verificationCalls,1);assert.equal(page.redemptions.length,1);assert.deepEqual(page.redemptions[0],{code:referral});
  assert.match(page.node('page-title').textContent,/Gratulacje/);assert.equal(page.node('download').hidden,false);
  assert.equal(page.node('auth-form').hidden,true);assert.match(page.node('confirmed-reward').textContent,/już na Twoim koncie/);
  assert.equal(location.search,'?ref='+referral);assert.equal(location.hash,'');
});

test('expired email cannot grant a reward using a previous account session; explicit sign in can finish',async()=>{
  const page=await openConfirmation({verificationFails:true});
  page.authEvent('TOKEN_REFRESHED',oldSession);await new Promise(resolve=>setImmediate(resolve));
  assert.equal(page.redemptions.length,0);assert.equal(page.node('download').hidden,true);
  assert.equal(page.node('auth-form').hidden,false);assert.match(page.node('status').textContent,/wygasł lub jest nieprawidłowy/);
  assert.equal(page.node('confirmed-reward').hidden,true);
  page.node('email').value=confirmed.email;page.node('password').value='synthetic-fixture-password';
  await page.node('auth-form').onsubmit({preventDefault(){}});
  assert.equal(page.redemptions.length,1);assert.match(page.node('page-title').textContent,/Gratulacje/);
});

test('malformed verification token never falls back to awarding the account already logged in',async()=>{
  const page=await openConfirmation({malformedToken:true});
  page.authEvent('TOKEN_REFRESHED',oldSession);await new Promise(resolve=>setImmediate(resolve));
  assert.equal(page.verificationCalls,0);assert.equal(page.redemptions.length,0);
  assert.equal(page.node('auth-form').hidden,false);assert.equal(page.node('confirmed-reward').hidden,true);assert.equal(location.hash,'');
});

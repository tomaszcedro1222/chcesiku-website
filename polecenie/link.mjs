export function referralAppUri(location) {
  const url = new URL(location);
  const keys = [...url.searchParams.keys()];
  const code = url.searchParams.get('ref');
  if (keys.length !== 1 || keys[0] !== 'ref' || !/^[a-f0-9]{32}$/.test(code ?? '') || url.hash) return null;
  return `pl.chcesiku.chcesiku://polecenie/${code}`;
}
if (typeof document !== 'undefined') {
  const target = referralAppUri(window.location.href);
  const button = document.getElementById('open-app');
  if (target) {
    // A real user click is required. No auto-redirect, cookie or click reward.
    button.href = target;
    button.hidden = false;
  } else {
    document.getElementById('status').textContent = 'Ten link zaproszenia jest niepełny. Poproś o ponowne wysłanie oryginalnego linku.';
  }
}

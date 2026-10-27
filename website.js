/* Sharing runs only after a visitor presses the button. No third-party widgets. */
document.querySelectorAll('[data-share-url]').forEach(button => {
  button.addEventListener('click', async () => {
    const status = button.parentElement.querySelector('[data-share-status]');
    const url = button.dataset.shareUrl;
    status.textContent = '';
    try {
      if (navigator.share) {
        await navigator.share({title:button.dataset.shareTitle,url});
      } else if (navigator.clipboard) {
        await navigator.clipboard.writeText(url);
        status.textContent = 'Link copied. You can paste it into a message.';
      } else {
        status.textContent = `Copy this link: ${url}`;
      }
    } catch (error) {
      if (error.name !== 'AbortError') status.textContent = `Copy this link: ${url}`;
    }
  });
});

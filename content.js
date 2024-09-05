chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'reSearch') {
    chrome.storage.sync.get(['languages', 'countries'], ({ languages, countries }) => {
      if (languages && languages.length || countries && countries.length) {
        const query = new URLSearchParams(window.location.search).get('q');
        modifyGoogleSearch(query, languages, countries);
        sendResponse({success: true});
      } else {
        sendResponse({success: false, error: 'No languages or countries selected'});
      }
    });
    return true; // Indicates that the response is sent asynchronously
  }
});

function modifyGoogleSearch(query, languages, countries) {
  const currentUrl = new URL(window.location.href);
  const searchParams = currentUrl.searchParams;

  // Set the query
  searchParams.set('q', query);

  // Remove existing language and country parameters
  searchParams.delete('hl');
  searchParams.delete('lr');
  searchParams.delete('cr');

  // Add new language and country parameters
  if (languages && languages.length > 0) {
    searchParams.set('hl', languages[0]); // Set interface language to first selected language
    searchParams.set('lr', languages.map(lang => `lang_${lang}`).join('|')); // Set language restriction
  }

  if (countries && countries.length > 0) {
    searchParams.set('cr', countries.map(country => `country${country}`).join('|')); // Set country restriction
  }

  // Navigate to the new URL
  window.location.href = currentUrl.toString();
}
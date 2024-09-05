document.addEventListener('DOMContentLoaded', function() {
  document.getElementById('save').addEventListener('click', savePreferences);
  document.getElementById('reSearch').addEventListener('click', reSearch);
  document.getElementById('eraseOptions').addEventListener('click', eraseOptions);
  document.getElementById('eraseStorage').addEventListener('click', eraseStorage);
  
  // Load countries, then load saved preferences
  loadCountries().then(loadSavedPreferences);
});

function savePreferences() {
  const selectedLanguages = Array.from(document.getElementById('languages').selectedOptions)
    .map(option => option.value);
  
  const selectedCountries = Array.from(document.getElementById('countries').selectedOptions)
    .map(option => option.value);
  
  chrome.storage.sync.set({ languages: selectedLanguages, countries: selectedCountries }, () => {
    console.log('Preferences saved', selectedLanguages, selectedCountries);
  });

  alert('Preferences saved');
}

function reSearch() {
  savePreferences();
  chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
    if (tabs[0]) {
      chrome.tabs.sendMessage(tabs[0].id, {action: 'reSearch'}, (response) => {
        if (chrome.runtime.lastError) {
          console.error(chrome.runtime.lastError);
        } else if (response && response.success) {
          console.log('Re-search initiated successfully');
        }
      });
    }
  });
}

function loadCountries() {
  // REF: https://developers.google.com/custom-search/docs/xml_results_appendices#countryCodes
  return new Promise((resolve, reject) => {
    fetch(chrome.runtime.getURL('countries.json'))
      .then(response => response.json())
      .then(countries => {
        const countriesSelect = document.getElementById('countries');
        countries.forEach(country => {
          const option = document.createElement('option');
          option.value = country.code;
          option.textContent = country.name;
          countriesSelect.appendChild(option);
        });
        resolve();
      })
      .catch(error => {
        console.error('Error loading countries:', error);
        reject(error);
      });
  });
}

function loadSavedPreferences() {
  chrome.storage.sync.get(['languages', 'countries'], function(result) {
    if (result.languages) {
      const languagesSelect = document.getElementById('languages');
      result.languages.forEach(lang => {
        const option = languagesSelect.querySelector(`option[value="${lang}"]`);
        if (option) {
          option.selected = true;
        }
      });
    }
    
    if (result.countries) {
      const countriesSelect = document.getElementById('countries');
      result.countries.forEach(country => {
        const option = countriesSelect.querySelector(`option[value="${country}"]`);
        if (option) {
          option.selected = true;
        } else {
          console.warn(`Country option not found: ${country}`);
        }
      });
    }
  });
}

function eraseOptions() {
  const languagesSelect = document.getElementById('languages');
  const countriesSelect = document.getElementById('countries');

  // Deselect all options in languages
  Array.from(languagesSelect.options).forEach(option => option.selected = false);

  // Reset countries to first option (if any)
  if (countriesSelect.options.length > 0) {
    countriesSelect.selectedIndex = 0;
  }
}

function eraseStorage() {
  chrome.storage.sync.remove(['languages', 'countries'], function() {
    console.log('Storage cleared');
    // Optionally, you can also clear the options on the page
    eraseOptions();
  });
}
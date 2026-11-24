const reportLookupForm = document.querySelector("#report-lookup-form");
const reportNumberInput = document.querySelector("#report-number");
const reportLookupFeedback = document.querySelector("#report-lookup-feedback");
// Named differently from the inline script in index.html, which also defines a storage key.
// Two scripts on one page can't declare the same `const` name.
const lookupStorageKey = "GREENWICH";

// Reports saved in this browser and the sample reports from data/reports.js can be looked up.
reportLookupForm.addEventListener("submit", (event) => {
  // Stop the browser's normal form submission, which would reload or navigate away.
  event.preventDefault();

  // `.value` is the text currently entered in the input; `.trim()` removes
  // whitespace from the beginning and end before checking whether it is empty.
  if (!reportNumberInput.value.trim()) {
    reportNumberInput.value = "";
    // Move keyboard focus to the input and ask the browser to show its validation message.
    reportNumberInput.focus();
    reportNumberInput.reportValidity();
    return;
  }

  // `try` runs code that might fail, such as reading unavailable or invalid saved data.
  try {
    // JSON is a text format for storing data. `JSON.parse` turns that text into
    // JavaScript values, such as the object of saved reports used below.
    const savedReports = JSON.parse(localStorage.getItem(lookupStorageKey) || "{}");
    
    // Sample reports are loaded by a <script> tag (data/reports.js) so it works without a server.
    const sampleReports = window.demoReportsData || {};
    const reportNumber = reportNumberInput.value.trim().toUpperCase();

    if (!savedReports[reportNumber] && !sampleReports[reportNumber]) {
      reportLookupFeedback.textContent = "No report with that number was found. Check the number and try again.";
      reportLookupFeedback.hidden = false;
      return;
    }

    window.location.href = `track.html?report=${encodeURIComponent(reportNumber)}`;
  // `catch` runs if an error happens in the `try` block, so the page can show feedback.
  } catch {
    reportLookupFeedback.textContent = "Reports could not be read from this browser's local storage.";
    reportLookupFeedback.hidden = false;
  }
});

const reportsStorageKey = "GREENWICH";
const trackSearchForm = document.querySelector("#track-search-form");
const trackNumberInput = document.querySelector("#track-report-number");
const trackNotice = document.querySelector("#track-notice");
const trackReport = document.querySelector("#track-report");
const trackStatus = document.querySelector("#track-status");
const trackTimeline = document.querySelector("#track-timeline");
const trackVerdict = document.querySelector("#track-verdict");

// Sample reports come from data/reports.js, which track.html loads with a <script> tag.
const demoReportsRequest = Promise.resolve(window.demoReportsData || {});

const timelineSteps = [
  { icon: "📤", title: "Submitted", copy: "Your report has been successfully submitted." },
  { icon: "📋", title: "Under Review", copy: "Your report is being reviewed by the administrator." },
  { icon: "🔄", title: "In Progress", copy: "The reported concern is currently being addressed." },
  { icon: "🪪", title: "Assigned", copy: "Your report has been assigned to the appropriate personnel." },
  { icon: "✅", title: "Resolved", copy: "The reported concern has been addressed." },
  { icon: "💼", title: "Case Closed", copy: "Your report has been finalized and closed." }
];

// Must stay in the same order as timelineSteps.
const statusOrder = ["submitted", "under_review", "in_progress", "assigned", "resolved", "case_closed"];

// Read saved report data from this browser and parse its JSON text into an object.
const readReports = () => JSON.parse(localStorage.getItem(reportsStorageKey) || "{}");

// Turn a date value into a readable date, while handling missing or invalid values.
const formatDate = (value) => {
  if (!value) {
    return "Not provided";
  }

  const localDateMatch = value.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  const date = localDateMatch
    ? new Date(Number(localDateMatch[1]), Number(localDateMatch[2]) - 1, Number(localDateMatch[3]))
    : new Date(value);

  return Number.isNaN(date.getTime())
    ? value
    : new Intl.DateTimeFormat(undefined, { dateStyle: "medium" }).format(date);
};

const setValue = (selector, value) => {
  const element = document.querySelector(selector);

  // If the HTML doesn't have this element yet, skip it instead of crashing the page.
  if (!element) {
    console.warn(`Missing element in HTML: ${selector}`);
    return;
  }

  // `textContent` displays text without treating it as HTML markup.
  element.textContent = value || "Not provided";
};

// Build the progress list by creating HTML elements and adding them to the page.
const buildTimeline = (report) => {
  const statusIndex = Math.max(0, statusOrder.indexOf(report.status));
  // A closed case has no "current" step since everything is complete.
  const currentStep = report.status === "case_closed" ? timelineSteps.length : statusIndex;

  trackTimeline.replaceChildren();

  timelineSteps.forEach((step, index) => {
    const item = document.createElement("li");
    const marker = document.createElement("span");
    const content = document.createElement("div");
    const title = document.createElement("h4");
    const description = document.createElement("p");
    const state = index < currentStep ? "complete" : index === currentStep ? "current" : "upcoming";

    item.className = `track-step is-${state}`;
    marker.className = "track-step-marker";
    marker.setAttribute("aria-hidden", "true");
    marker.textContent = step.icon;
    content.className = "track-step-content";
    title.className = "track-step-title";
    title.textContent = step.title;
    description.className = "track-step-copy";
    description.textContent = step.copy;

    if (state === "current") {
      item.setAttribute("aria-current", "step");
    }

    content.append(title, description);
    item.append(marker, content);
    trackTimeline.append(item);
  });
};

const displayReport = (report, isExample = false) => {
  trackNotice.hidden = true;
  trackReport.hidden = false;
  trackNumberInput.value = report.reportNumber;

  setValue("#track-category", report.category);
  setValue("#track-report-heading", report.reportNumber);
  setValue("#track-report-title", report.title || report.reportTitle);
  setValue("#track-description", report.description);
  setValue("#track-date-submitted", formatDate(report.submittedAt));
  setValue("#track-location", report.location);
  setValue("#track-updated", formatDate(report.updatedAt));
  setValue("#track-trike-number", report.trikeNumber);

  // Status badge in the top right of the card.
  const statusIndex = Math.max(0, statusOrder.indexOf(report.status));
  trackStatus.textContent = timelineSteps[statusIndex].title;
  // `toggle` adds or removes this CSS class once the case is resolved or closed.
  trackStatus.classList.toggle("is-verdict", ["resolved", "case_closed"].includes(report.status));

  buildTimeline(report);

  // The resolution box only shows when the report has a resolution message.
  const hasResolution = Boolean(report.resolution);
  trackVerdict.hidden = !hasResolution;
  if (hasResolution) {
    setValue("#track-verdict-title", "Resolution");
    setValue("#track-verdict-copy", report.resolution);
  }

  if (isExample) {
    trackNotice.textContent = "Sample report shown for demonstration. This is not a real report.";
    trackNotice.hidden = false;
  }
};

// `async` allows this function to wait for data with `await` without blocking the page.
const loadReport = async (reportNumber) => {
  trackReport.hidden = true;

  try {
    const normalizedNumber = reportNumber.trim().toUpperCase();
    // Load both data sources together, then use whichever contains this report number.
    const [demoReports, savedReports] = await Promise.all([
      demoReportsRequest,
      Promise.resolve(readReports())
    ]);
    const report = savedReports[normalizedNumber] || demoReports[normalizedNumber];

    if (!report) {
      trackNotice.textContent = "No report with that number was found. Please check the number and try again.";
      trackNotice.hidden = false;
      return;
    }

    displayReport(report, Boolean(report.isDemo));
  } catch (error) {
    // Logging the real error makes problems much easier to find in the browser console.
    console.error(error);
    trackNotice.textContent = "Reports could not be loaded. Check this browser's local storage and try again.";
    trackNotice.hidden = false;
  }
};

trackSearchForm.addEventListener("submit", (event) => {
  // Handle the search ourselves instead of letting the browser reload the page.
  event.preventDefault();
  const reportNumber = trackNumberInput.value.trim().toUpperCase();
  const nextUrl = new URL(window.location.href);
  // Update the address bar's report parameter so this report can be linked or refreshed.
  nextUrl.searchParams.set("report", reportNumber);
  window.history.replaceState(null, "", nextUrl);
  loadReport(reportNumber);
});

// Read query parameters from the page URL, such as ?report=SR-... or ?demo=resolved.
const parameters = new URLSearchParams(window.location.search);
const requestedReport = parameters.get("report") || (
  parameters.get("demo") === "resolved" ? "SR-20261025-1003" : ""
);

if (requestedReport) {
  loadReport(requestedReport);
}

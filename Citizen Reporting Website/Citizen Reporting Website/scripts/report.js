
// =========================================
// GREENWHICH - REPORT FORM
// =========================================

// Get form elements
const reportForm = document.querySelector("#report-form");
const titleInput = document.querySelector("#report-title-input");
const receivedDateInput = document.querySelector("#date-received");
const timeInput = document.querySelector("#time-observed");
const screenshotInput = document.querySelector("#report-screenshot");

const senderInput = document.querySelector("#sender");
const phoneInput = document.querySelector("#phone-number");
const emailInput = document.querySelector("#email-address");
const passwordInput = document.querySelector("#user-password");

const passwordToggle = document.querySelector("#toggle-password");

const locationTextMode = document.querySelector("#location-mode-text");
const locationMapMode = document.querySelector("#location-mode-map");
const locationTextPanel = document.querySelector("#location-text-panel");
const locationMapPanel = document.querySelector("#location-map-panel");

const locationTextInput = document.querySelector("#location-text");
const locationMapInput = document.querySelector("#location-map");

const reportFormStatus = document.querySelector("#report-form-status");


// =========================================
// SETTINGS
// =========================================

const maxFileSize = 10 * 1024 * 1024;
const reportsStorageKey = "GREENWICH";

const allowedFileTypes = [
    "image/png",
    "image/jpeg",
    "image/webp",
    "video/mp4"
];

const allowedExtensions = [
    ".png",
    ".jpg",
    ".jpeg",
    ".webp",
    ".mp4"
];


// =========================================
// DATE VALIDATION
// =========================================

// Get today's date using local time.
const getLocalToday = () => {
    const today = new Date();

    today.setMinutes(
        today.getMinutes() - today.getTimezoneOffset()
    );

    return today.toISOString().slice(0, 10);
};

const todayValue = getLocalToday();

// Prevent users from selecting future dates.
receivedDateInput.max = todayValue;

// Automatically fill in today's date.
receivedDateInput.value = todayValue;


// =========================================
// LOCATION MODE
// =========================================

// Show the selected location method.
const updateLocationMode = () => {

    const useMap = locationMapMode.checked;

    locationTextPanel.hidden = useMap;
    locationMapPanel.hidden = !useMap;

    locationTextInput.disabled = useMap;
    locationTextInput.required = !useMap;

    locationMapInput.disabled = !useMap;
    locationMapInput.required = useMap;

    // Clear previous validation messages.
    locationTextInput.setCustomValidity("");
    locationMapInput.setCustomValidity("");
};

// Listen for location selection changes.
locationTextMode.addEventListener(
    "change",
    updateLocationMode
);

locationMapMode.addEventListener(
    "change",
    updateLocationMode
);

// Set the correct initial location mode.
updateLocationMode();


// =========================================
// GOOGLE MAPS VALIDATION
// =========================================

const isValidMapLocation = (value) => {

    const trimmedValue = value.trim();

    // Check latitude and longitude.
    const coordinates = trimmedValue.match(
        /^(-?\d+(?:\.\d+)?)\s*,\s*(-?\d+(?:\.\d+)?)$/
    );

    if (coordinates) {

        const latitude = Number(coordinates[1]);
        const longitude = Number(coordinates[2]);

        return (
            latitude >= -90 &&
            latitude <= 90 &&
            longitude >= -180 &&
            longitude <= 180
        );
    }

    // Check Google Maps URLs.
    return /^https?:\/\/(?:maps\.app\.goo\.gl|maps\.google\.[a-z.]+|www\.google\.[a-z.]+\/maps)\//i.test(trimmedValue);
};


// =========================================
// PASSWORD SHOW / HIDE
// =========================================

passwordToggle.addEventListener("click", () => {

    const isPasswordHidden =
        passwordInput.type === "password";

    if (isPasswordHidden) {

        passwordInput.type = "text";

        passwordToggle.innerHTML =
            '<i class="bi bi-eye-slash" aria-hidden="true"></i>';

        passwordToggle.setAttribute(
            "aria-label",
            "Hide password"
        );

    } else {

        passwordInput.type = "password";

        passwordToggle.innerHTML =
            '<i class="bi bi-eye" aria-hidden="true"></i>';

        passwordToggle.setAttribute(
            "aria-label",
            "Show password"
        );
    }
});


// =========================================
// FILE VALIDATION
// =========================================

const validateFile = () => {

    const file = screenshotInput.files[0];

    // File upload is optional.
    if (!file) {
        return true;
    }

    const fileName = file.name.toLowerCase();

    const hasAllowedExtension = allowedExtensions.some(
        extension => fileName.endsWith(extension)
    );

    const hasAllowedType = allowedFileTypes.includes(file.type);

    const isValidType =
        hasAllowedType && hasAllowedExtension;

    const isValidSize = file.size <= maxFileSize;

    return isValidType && isValidSize;
};


// =========================================
// PHONE NUMBER VALIDATION
// =========================================

const isValidPhoneNumber = (value) => {

    // Allow numbers, spaces, +, hyphens, and parentheses.
    const cleanedNumber = value.replace(/[\s()+-]/g, "");

    return /^\d{7,15}$/.test(cleanedNumber);
};


// =========================================
// FORM SUBMISSION
// =========================================

reportForm.addEventListener("submit", (event) => {

    // Prevent automatic page reload.
    event.preventDefault();

    reportFormStatus.hidden = true;
    reportFormStatus.textContent = "";

    // ---------------------------------------
    // Validate date
    // ---------------------------------------

    receivedDateInput.setCustomValidity(
        receivedDateInput.value > todayValue
            ? "The observed date cannot be in the future."
            : ""
    );


    // ---------------------------------------
    // Validate phone number
    // ---------------------------------------

    phoneInput.setCustomValidity(
        isValidPhoneNumber(phoneInput.value)
            ? ""
            : "Enter a valid phone number containing 7 to 15 digits."
    );


    // ---------------------------------------
    // Validate file upload
    // ---------------------------------------

    screenshotInput.setCustomValidity(
        validateFile()
            ? ""
            : "Choose a PNG, JPG, WebP, or MP4 file no larger than 10 MB."
    );


    // ---------------------------------------
    // Validate Google Maps location
    // ---------------------------------------

    if (locationMapMode.checked && locationMapInput.value.trim()) {

        locationMapInput.setCustomValidity(
            isValidMapLocation(locationMapInput.value)
                ? ""
                : "Enter a valid Google Maps link or coordinates."
        );

    } else {

        locationMapInput.setCustomValidity("");
    }


    // ---------------------------------------
    // Activate Bootstrap validation
    // ---------------------------------------

    reportForm.classList.add("was-validated");

    // Stop if any required field is invalid.
    if (!reportForm.reportValidity()) {
        return;
    }


    // =====================================
    // CREATE REPORT INFORMATION
    // =====================================

    // Generate a unique report number.
    const reportNumber =
        `SR-${todayValue.replace(/-/g, "")}-${Date.now().toString(36).slice(-5).toUpperCase()}`;

    // Get the selected location.
    const location = locationMapMode.checked
        ? locationMapInput.value.trim()
        : locationTextInput.value.trim();

    // Get uploaded file information.
    const uploadedFile = screenshotInput.files[0];

    // Create the report object.
    const report = {

        // Report identification
        reportNumber,
        status: "submitted",

        // Report information
        title: titleInput.value.trim(),

        category:
            reportForm.elements.category.selectedOptions[0].textContent,

        description:
            document.querySelector("#incident-description").value.trim(),

        // Incident date and time
        receivedDate: receivedDateInput.value,
        observedTime: timeInput.value,

        // User information
        sender: senderInput.value.trim(),
        phone: phoneInput.value.trim(),
        email: emailInput.value.trim(),

        // Uploaded file information
        screenshotName: uploadedFile
            ? uploadedFile.name
            : "",

        // Location information
        locationMode: locationMapMode.checked
            ? "map"
            : "text",

        location,

        // Submission information
        submittedAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),

        verdict: ""
    };


    // =====================================
    // SAVE REPORT TO LOCAL STORAGE
    // =====================================

    try {

        // Retrieve previously saved reports.
        const savedReports = JSON.parse(
            localStorage.getItem(reportsStorageKey) || "{}"
        );

        // Add the new report.
        savedReports[reportNumber] = report;

        // Save the updated reports.
        localStorage.setItem(
            reportsStorageKey,
            JSON.stringify(savedReports)
        );
        // The report was sent, so the saved draft is no longer needed.
        localStorage.removeItem("greenwichReportDraft");
        
        // Redirect to the tracking page.
        window.location.href =
            `track.html?report=${encodeURIComponent(reportNumber)}`;

    } catch (error) {

        console.error("Report saving error:", error);

        reportFormStatus.textContent =
            "Unable to save your report. Please check your browser storage settings and try again.";

        reportFormStatus.hidden = false;

    }

});


// =========================================
// CLEAR VALIDATION ERRORS
// =========================================

reportForm.addEventListener("input", (event) => {

    event.target.setCustomValidity("");

});

reportForm.addEventListener("change", (event) => {

    event.target.setCustomValidity("");

});

// =========================================
// Keep form data in local storage so users don't lose it if they accidentally close the page or refresh.
// =========================================
const draftStorageKey = "greenwichReportDraft";

const saveDraft = () => {
  const draft = {};

  Array.from(reportForm.elements).forEach((field) => {
    // Skip fields that can't be saved or restored (buttons, file picker, no id).
    if (!field.id || ["file", "submit", "button", "password"].includes(field.type)) {
      return;
    }

    draft[field.id] = ["checkbox", "radio"].includes(field.type) ? field.checked : field.value;
  });

  try {
    localStorage.setItem(draftStorageKey, JSON.stringify(draft));
  } catch {
    // If storage is unavailable, the form still works. It just won't remember drafts.
  }
};

const restoreDraft = () => {
  let draft = {};

  try {
    draft = JSON.parse(localStorage.getItem(draftStorageKey) || "{}");
  } catch {
    return;
  }

  Object.entries(draft).forEach(([id, value]) => {
    const field = document.getElementById(id);

    if (!field) {
      return;
    }

    if (["checkbox", "radio"].includes(field.type)) {
      field.checked = value;
    } else {
      field.value = value;
    }
  });

  // Make sure the right location panel (text or map) is showing for the restored choice.
  updateLocationMode();
};

// Save on every keystroke or change, and fill the form back in when the page loads.
reportForm.addEventListener("input", saveDraft);
reportForm.addEventListener("change", saveDraft);
restoreDraft();

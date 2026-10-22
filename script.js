/**
 * Countdown Timer
 * Pure Vanilla JavaScript implementation using Date objects,
 * setInterval(), and clearInterval().
 */

(function () {
  "use strict";

  // Time constants in milliseconds
  const MS_PER_SECOND = 1000;
  const MS_PER_MINUTE = MS_PER_SECOND * 60;
  const MS_PER_HOUR = MS_PER_MINUTE * 60;
  const MS_PER_DAY = MS_PER_HOUR * 24;

  // Default offset in days so the initial countdown always starts in the future
  const DEFAULT_DAYS_AHEAD = 3;

  // DOM Elements
  const form = document.getElementById("countdown-form");
  const dateInput = document.getElementById("target-datetime");
  const resetButton = document.getElementById("reset-button");
  const feedbackMessage = document.getElementById("feedback-message");
  const targetDisplay = document.getElementById("target-display");

  const daysElement = document.getElementById("days");
  const hoursElement = document.getElementById("hours");
  const minutesElement = document.getElementById("minutes");
  const secondsElement = document.getElementById("seconds");

  // Active timer state
  let countdownInterval = null;
  let activeTargetDate = null;

  /**
   * Formats a number with a leading zero so it always has at least two digits.
   */
  function formatTwoDigits(value) {
    return String(value).padStart(2, "0");
  }

  /**
   * Creates a sensible future default date (3 days from now, rounded to the next hour).
   */
  function getDefaultTargetDate() {
    const defaultDate = new Date(Date.now() + DEFAULT_DAYS_AHEAD * MS_PER_DAY);
    defaultDate.setMinutes(0, 0, 0);
    return defaultDate;
  }

  /**
   * Formats a Date object for the <input type="datetime-local"> value (YYYY-MM-DDTHH:mm).
   */
  function toDateTimeLocalString(date) {
    const year = date.getFullYear();
    const month = formatTwoDigits(date.getMonth() + 1);
    const day = formatTwoDigits(date.getDate());
    const hours = formatTwoDigits(date.getHours());
    const minutes = formatTwoDigits(date.getMinutes());
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  }

  /**
   * Formats a Date object into a friendly, easy-to-read string.
   */
  function formatReadableDate(date) {
    return new Intl.DateTimeFormat("en-US", {
      weekday: "short",
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
    }).format(date);
  }

  /**
   * Stops any active countdown interval to prevent duplicate timers.
   */
  function stopTimer() {
    if (countdownInterval !== null) {
      clearInterval(countdownInterval);
      countdownInterval = null;
    }
  }

  /**
   * Shows or hides the status/error message box.
   */
  function showMessage(text, type) {
    if (!text) {
      feedbackMessage.textContent = "";
      feedbackMessage.hidden = true;
      feedbackMessage.className = "feedback-message";
      dateInput.classList.remove("input-error");
      return;
    }

    feedbackMessage.textContent = text;
    feedbackMessage.hidden = false;
    feedbackMessage.className = `feedback-message ${
      type === "error" ? "is-error" : "is-complete"
    }`;

    if (type === "error") {
      dateInput.classList.add("input-error");
    } else {
      dateInput.classList.remove("input-error");
    }
  }

  /**
   * Calculates the remaining time and updates the four countdown boxes.
   */
  function updateTimerDisplay() {
    if (!activeTargetDate) return;

    const rawDifference = activeTargetDate.getTime() - Date.now();
    const remainingTime = Math.max(0, rawDifference);

    const days = Math.floor(remainingTime / MS_PER_DAY);
    const hours = Math.floor((remainingTime % MS_PER_DAY) / MS_PER_HOUR);
    const minutes = Math.floor((remainingTime % MS_PER_HOUR) / MS_PER_MINUTE);
    const seconds = Math.floor((remainingTime % MS_PER_MINUTE) / MS_PER_SECOND);

    daysElement.textContent = formatTwoDigits(days);
    hoursElement.textContent = formatTwoDigits(hours);
    minutesElement.textContent = formatTwoDigits(minutes);
    secondsElement.textContent = formatTwoDigits(seconds);

    if (remainingTime === 0) {
      stopTimer();
      showMessage("Your countdown is complete!", "complete");
    }
  }

  /**
   * Starts a countdown to the provided future Date object.
   */
  function startCountdownToDate(targetDate) {
    stopTimer();
    showMessage("", "");

    activeTargetDate = targetDate;

    // Update the readable target date below the timer
    targetDisplay.textContent = formatReadableDate(targetDate);
    targetDisplay.setAttribute("datetime", targetDate.toISOString());

    // Keep the input field synchronized with the active target
    dateInput.min = toDateTimeLocalString(new Date(Date.now() + MS_PER_MINUTE));
    dateInput.value = toDateTimeLocalString(targetDate);

    // Update immediately and then every second
    updateTimerDisplay();

    if (targetDate.getTime() > Date.now()) {
      countdownInterval = window.setInterval(updateTimerDisplay, 1000);
    }
  }

  /**
   * Handles form submission when the user clicks "Start Countdown".
   */
  function handleFormSubmit(event) {
    event.preventDefault();

    const inputValue = dateInput.value.trim();

    if (!inputValue) {
      showMessage("Please select a target date and time.", "error");
      dateInput.focus();
      return;
    }

    const selectedDate = new Date(inputValue);

    if (Number.isNaN(selectedDate.getTime())) {
      showMessage("Please enter a valid date and time.", "error");
      dateInput.focus();
      return;
    }

    if (selectedDate.getTime() <= Date.now()) {
      showMessage("Please choose a future date and time.", "error");
      dateInput.focus();
      return;
    }

    startCountdownToDate(selectedDate);
  }

  /**
   * Resets the countdown back to the default future target date.
   */
  function handleReset() {
    const defaultDate = getDefaultTargetDate();
    startCountdownToDate(defaultDate);
  }

  // Clear error state as soon as the user edits the date input
  dateInput.addEventListener("input", function () {
    if (feedbackMessage.classList.contains("is-error")) {
      showMessage("", "");
    }
  });

  form.addEventListener("submit", handleFormSubmit);
  resetButton.addEventListener("click", handleReset);

  // Initialize with the default future countdown on page load
  handleReset();
})();

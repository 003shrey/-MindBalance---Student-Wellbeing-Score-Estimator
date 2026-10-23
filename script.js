(() => {
  "use strict";

  // MindBalance deployed backend
  const API_BASE = "https://mindbalance-api-d9n2.onrender.com";

  // Frontend elements
  const form = document.getElementById("predict-form");
  const submitBtn = document.getElementById("submit-btn");
  const resetBtn = document.getElementById("reset-btn");
  const errorRetryBtn = document.getElementById("error-retry-btn");

  const stateIdle = document.getElementById("state-idle");
  const stateLoading = document.getElementById("state-loading");
  const stateResult = document.getElementById("state-result");
  const stateError = document.getElementById("state-error");

  const scoreNumberEl = document.getElementById("score-number");
  const scoreBandEl = document.getElementById("score-band");
  const scoreContextEl = document.getElementById("score-context");
  const gaugeFill = document.getElementById("gauge-fill");

  // error-label is optional because the current HTML does not contain it
  const errorLabelEl = document.getElementById("error-label");
  const errorCopyEl = document.getElementById("error-copy");

  const GAUGE_ARC_LENGTH = 314;

  // Stop early if essential HTML elements are missing
  if (
    !form ||
    !submitBtn ||
    !stateIdle ||
    !stateLoading ||
    !stateResult ||
    !stateError ||
    !scoreNumberEl ||
    !scoreBandEl ||
    !scoreContextEl ||
    !gaugeFill ||
    !errorCopyEl
  ) {
    console.error(
      "MindBalance could not initialize. Check the element IDs in index.html."
    );
    return;
  }

  // ---------------------------------------------------------
  // Draw gauge tick marks
  // ---------------------------------------------------------
  function drawTicks() {
    document.querySelectorAll(".gauge-ticks").forEach((group) => {
      group.innerHTML = "";

      const cx = 120;
      const cy = 140;
      const rOuter = 100;
      const rInner = 90;

      for (let i = 0; i <= 10; i += 2) {
        const angle = Math.PI - (i / 10) * Math.PI;

        const x1 = cx + rOuter * Math.cos(angle);
        const y1 = cy - rOuter * Math.sin(angle);
        const x2 = cx + rInner * Math.cos(angle);
        const y2 = cy - rInner * Math.sin(angle);

        const line = document.createElementNS(
          "http://www.w3.org/2000/svg",
          "line"
        );

        line.setAttribute("x1", x1.toFixed(1));
        line.setAttribute("y1", y1.toFixed(1));
        line.setAttribute("x2", x2.toFixed(1));
        line.setAttribute("y2", y2.toFixed(1));

        group.appendChild(line);
      }
    });
  }

  drawTicks();

  // ---------------------------------------------------------
  // Stress-level segmented control
  // ---------------------------------------------------------
  const segGroup = document.getElementById("stress_level_group");
  const stressHiddenInput = document.getElementById("stress_level");

  if (segGroup && stressHiddenInput) {
    segGroup.querySelectorAll(".seg-btn").forEach((btn) => {
      btn.addEventListener("click", () => {
        segGroup.querySelectorAll(".seg-btn").forEach((item) => {
          item.classList.remove("active");
        });

        btn.classList.add("active");
        stressHiddenInput.value = btn.dataset.value;

        clearFieldError(stressHiddenInput);
      });
    });
  }

  // ---------------------------------------------------------
  // Form validation helpers
  // ---------------------------------------------------------
  function fieldWrapper(input) {
    return input ? input.closest(".field") : null;
  }

  function setFieldError(input, message) {
    const wrapper = fieldWrapper(input);
    if (!wrapper) return;

    wrapper.classList.add("field-error");

    const messageElement = wrapper.querySelector(".error-msg");
    if (messageElement) {
      messageElement.textContent = message;
    }
  }

  function clearFieldError(input) {
    const wrapper = fieldWrapper(input);
    if (!wrapper) return;

    wrapper.classList.remove("field-error");

    const messageElement = wrapper.querySelector(".error-msg");
    if (messageElement) {
      messageElement.textContent = "";
    }
  }

  function clearAllErrors() {
    form.querySelectorAll(".field").forEach((field) => {
      field.classList.remove("field-error");
    });

    form.querySelectorAll(".error-msg").forEach((message) => {
      message.textContent = "";
    });
  }

  // ---------------------------------------------------------
  // Validate input before sending it to the backend
  // ---------------------------------------------------------
  function validate(payload) {
    const errors = [];

    const numericChecks = [
      ["age", 10, 100],
      ["avg_daily_usage_hours", 0, 24],
      ["daily_unlocks", 0, Infinity],
      ["study_hours", 0, 24],
      ["physical_activity_hours", 0, 24],
      ["sleep_hours_per_night", 0, 24],
    ];

    numericChecks.forEach(([key, min, max]) => {
      const input = document.getElementById(key);
      const value = payload[key];

      if (value === "" || value === null || Number.isNaN(value)) {
        errors.push([input, "This field is required."]);
      } else if (value < min || value > max) {
        errors.push([
          input,
          `Must be between ${min} and ${max === Infinity ? "0+" : max}.`,
        ]);
      }
    });

    [
      "gender",
      "country",
      "academic_level",
      "most_used_platform",
      "purpose_of_use",
    ].forEach((key) => {
      const input = document.getElementById(key);

      if (!payload[key] || String(payload[key]).trim() === "") {
        errors.push([input, "This field is required."]);
      }
    });

    if (!payload.stress_level && stressHiddenInput) {
      errors.push([stressHiddenInput, "Pick a stress level."]);
    }

    return errors;
  }

  // ---------------------------------------------------------
  // Collect form values in the backend's expected format
  // ---------------------------------------------------------
  function collectPayload() {
    const formData = new FormData(form);

    return {
      age:
        formData.get("age") === ""
          ? NaN
          : parseInt(formData.get("age"), 10),

      gender: formData.get("gender") || "",
      country: (formData.get("country") || "").trim(),
      academic_level: formData.get("academic_level") || "",
      most_used_platform: formData.get("most_used_platform") || "",
      purpose_of_use: formData.get("purpose_of_use") || "",

      avg_daily_usage_hours:
        formData.get("avg_daily_usage_hours") === ""
          ? NaN
          : parseFloat(formData.get("avg_daily_usage_hours")),

      daily_unlocks:
        formData.get("daily_unlocks") === ""
          ? NaN
          : parseInt(formData.get("daily_unlocks"), 10),

      study_hours:
        formData.get("study_hours") === ""
          ? NaN
          : parseFloat(formData.get("study_hours")),

      physical_activity_hours:
        formData.get("physical_activity_hours") === ""
          ? NaN
          : parseFloat(formData.get("physical_activity_hours")),

      sleep_hours_per_night:
        formData.get("sleep_hours_per_night") === ""
          ? NaN
          : parseFloat(formData.get("sleep_hours_per_night")),

      stress_level: formData.get("stress_level") || "",
    };
  }

  // ---------------------------------------------------------
  // Show the appropriate result-panel state
  // ---------------------------------------------------------
  function showState(name) {
    const states = {
      idle: stateIdle,
      loading: stateLoading,
      result: stateResult,
      error: stateError,
    };

    Object.values(states).forEach((element) => {
      element.hidden = true;
    });

    if (states[name]) {
      states[name].hidden = false;
    }
  }

  function setSubmitting(isSubmitting) {
    submitBtn.disabled = isSubmitting;
    submitBtn.classList.toggle("loading", isSubmitting);
  }

  // ---------------------------------------------------------
  // Convert the predicted score into a display category
  // ---------------------------------------------------------
  function bandFor(score) {
    if (score < 4) {
      return {
        label: "Signal: strained",
        context:
          "Your responses suggest elevated strain right now. Small shifts in sleep or screen time can go a long way.",
      };
    }

    if (score < 7) {
      return {
        label: "Signal: balanced",
        context:
          "Your rhythm looks fairly steady, with some room to recover and reset.",
      };
    }

    return {
      label: "Signal: strong",
      context:
        "Your habits point to a well-supported baseline. Keep looking after your wellbeing.",
    };
  }

  // ---------------------------------------------------------
  // Display the predicted score and animate the gauge
  // ---------------------------------------------------------
  function renderResult(score) {
    const clamped = Math.max(0, Math.min(10, score));
    const { label, context } = bandFor(clamped);

    scoreNumberEl.textContent = score.toFixed(2);
    scoreBandEl.textContent = label;
    scoreContextEl.textContent = context;

    gaugeFill.style.transition = "none";
    gaugeFill.style.strokeDashoffset = String(GAUGE_ARC_LENGTH);

    requestAnimationFrame(() => {
      gaugeFill.style.transition = "";

      const offset = GAUGE_ARC_LENGTH * (1 - clamped / 10);
      gaugeFill.style.strokeDashoffset = String(offset);
    });

    showState("result");
  }

  // ---------------------------------------------------------
  // Display an error without breaking the page
  // ---------------------------------------------------------
  function renderError(label, message) {
    if (errorLabelEl) {
      errorLabelEl.textContent = label;
    }

    errorCopyEl.textContent = message;
    showState("error");
  }

  // ---------------------------------------------------------
  // Handle FastAPI validation errors
  // ---------------------------------------------------------
  function applyServerValidationErrors(detail) {
    if (!Array.isArray(detail)) return false;

    let matched = false;

    detail.forEach((error) => {
      const field = Array.isArray(error.loc)
        ? error.loc[error.loc.length - 1]
        : null;

      const input = field ? document.getElementById(field) : null;

      const target =
        field === "stress_level" ? stressHiddenInput : input;

      if (target) {
        setFieldError(target, error.msg || "Invalid value.");
        matched = true;
      }
    });

    return matched;
  }

  // ---------------------------------------------------------
  // Submit form and request a prediction from FastAPI
  // ---------------------------------------------------------
  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    clearAllErrors();

    const payload = collectPayload();
    const clientErrors = validate(payload);

    if (clientErrors.length > 0) {
      clientErrors.forEach(([input, message]) => {
        if (input) {
          setFieldError(input, message);
        }
      });

      clientErrors[0][0]?.focus?.();
      return;
    }

    setSubmitting(true);
    showState("loading");

    try {
      const response = await fetch(`${API_BASE}/predict`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (response.status === 422) {
        const body = await response.json().catch(() => null);

        const matched =
          body && applyServerValidationErrors(body.detail);

        renderError(
          "Check your inputs",
          matched
            ? "The API rejected a few fields. Details are marked on the form."
            : "The API rejected this submission. Please review your inputs and try again."
        );

        return;
      }

      if (!response.ok) {
        let message = `The API responded with status ${response.status}.`;

        const body = await response.json().catch(() => null);

        if (body && typeof body.detail === "string") {
          message = body.detail;
        }

        renderError("Prediction failed", message);
        return;
      }

      const data = await response.json();

      if (
        typeof data.predicted_mental_health_score !== "number" ||
        !Number.isFinite(data.predicted_mental_health_score)
      ) {
        renderError(
          "Unexpected response",
          "The API responded, but the predicted score was missing or invalid."
        );

        return;
      }

      renderResult(data.predicted_mental_health_score);
    } catch (error) {
      console.error("MindBalance API request failed:", error);

      renderError(
        "Can't reach the server",
        `Couldn't connect to the MindBalance API at ${API_BASE}. Check your backend deployment and CORS settings. Your frontend is https://mindbalance-student-wellbeing-score.onrender.com.`
      );
    } finally {
      setSubmitting(false);
    }
  });

  // ---------------------------------------------------------
  // Clear field errors when a user changes their input
  // ---------------------------------------------------------
  form.querySelectorAll("input, select").forEach((element) => {
    element.addEventListener("input", () => clearFieldError(element));
    element.addEventListener("change", () => clearFieldError(element));
  });

  // ---------------------------------------------------------
  // Reset buttons
  // ---------------------------------------------------------
  if (resetBtn) {
    resetBtn.addEventListener("click", () => {
      showState("idle");
    });
  }

  if (errorRetryBtn) {
    errorRetryBtn.addEventListener("click", () => {
      showState("idle");
    });
  }
})();

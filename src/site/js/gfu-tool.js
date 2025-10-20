document.addEventListener('DOMContentLoaded', () => {
    const wizardSteps = document.querySelectorAll('.wizard-step');
    const progressSteps = document.querySelectorAll('.progress-step');
    const backBtn = document.getElementById('wizard-back-btn');
    const nextBtn = document.getElementById('wizard-next-btn');
    const skipBtn = document.getElementById('wizard-skip-btn');
    let currentStep = 1;
    let isAnimating = false;

    const updateWizardState = () => {
        if (isAnimating) return;

        const previousStep = document.querySelector('.wizard-step.active');
        const nextStep = document.querySelector(`.wizard-step[data-step="${currentStep}"]`);

        if (previousStep === nextStep) return;

        isAnimating = true;

        // Update non-animated UI immediately
        progressSteps.forEach((step, index) => {
            const stepNum = index + 1;
            step.classList.toggle('completed', stepNum < currentStep);
            step.classList.toggle('active', stepNum === currentStep);
        });

        backBtn.style.visibility = (currentStep > 1) ? 'visible' : 'hidden';
        skipBtn.style.display = (currentStep < 4) ? 'block' : 'none';
        if (currentStep === 1) nextBtn.textContent = 'Start';
        else if (currentStep === 4) nextBtn.textContent = 'Launch';
        else nextBtn.textContent = 'Next';
        
        // Handle animation
        const animationDuration = 350;
        const finishTransition = () => {
            if (previousStep) {
                previousStep.classList.remove('active', 'is-exiting');
            }
            if (nextStep) {
                nextStep.classList.add('active');
            }
            isAnimating = false;
        };

        if (previousStep) {
            previousStep.classList.add('is-exiting');
            setTimeout(finishTransition, animationDuration);
        } else {
            finishTransition();
        }
    };

    const goToStep = (step) => {
        if (isAnimating) return;
        const newStep = Math.max(1, Math.min(step, wizardSteps.length));
        if (newStep === currentStep) return;
        currentStep = newStep;
        updateWizardState();
    };

    nextBtn.addEventListener('click', () => {
        if (currentStep < wizardSteps.length) {
            goToStep(currentStep + 1);
        } else {
            handleFormLaunch();
        }
    });

    backBtn.addEventListener('click', () => {
        if (currentStep > 1) {
            goToStep(currentStep - 1);
        }
    });

    skipBtn.addEventListener('click', () => goToStep(wizardSteps.length));

    const notificationContainer = document.getElementById('notification-container');
    
    function showNotification(type, title, message) {
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;

        const icons = {
            warning: `<svg class="notification-icon" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" /></svg>`,
            success: `<svg class="notification-icon" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" /></svg>`
        };

        notification.innerHTML = `
            ${icons[type] || icons['warning']}
            <div class="notification-content">
                <div class="notification-title">${title}</div>
                <div class="notification-message">${message}</div>
            </div>
            <button class="notification-close">&times;</button>
        `;
        notificationContainer.appendChild(notification);

        setTimeout(() => notification.classList.add('show'), 10);

        const hideAndRemove = () => {
            notification.classList.remove('show');
            setTimeout(() => notification.remove(), 500);
        };
        
        notification.querySelector('.notification-close').addEventListener('click', hideAndRemove);
        setTimeout(hideAndRemove, 6000);
    }

    const formSourceInput = document.getElementById('form_source_input');
    const hiddenForm = document.getElementById('hidden_form');
    const tokenInput = document.getElementById('token_input');
    const hiddenSubmitBtn = document.getElementById('hidden_submit_btn');

    function parseSource(source) {
        const initialDataMatch = source.match(/(?:var\s+)?_docs_flag_initialData\s*=\s*(\{.*?\});?<\/script>/i);
        if (!initialDataMatch || !initialDataMatch[1]) {
            throw new Error("Could not find '_docs_flag_initialData'. The form source might be incomplete or incorrect.");
        }
        
        let info_map_string = initialDataMatch[1].replace(/&quot;/g, '"')
                                                 .replace(/&amp;/g, '&')
                                                 .replace(/&lt;/g, '<')
                                                 .replace(/&gt;/g, '>');

        let info_map;
        try {
            info_map = JSON.parse(info_map_string);
        } catch (e) {
            console.error("Error parsing form data JSON:", e, "Raw string:", info_map_string);
            throw new Error("Could not parse the form's data. It might be malformed.");
        }
        
        if (!info_map?.info_params?.token || !info_map["docs-crp"]) {
            console.error("Missing essential fields in parsed data:", info_map);
            throw new Error("Essential data (token or form path) is missing. Ensure you copied the entire page source.");
        }

        const token = info_map.info_params.token;
        const formPath = info_map["docs-crp"];
        const my_query_params = new URLSearchParams();

        if (info_map["docs-crq"]) {
            const url_search_params = new URLSearchParams(info_map["docs-crq"]);
            if (url_search_params.get("hr_submission")) {
                my_query_params.append("hr_submission", url_search_params.get("hr_submission"));
            }
        }
        
        const baseUrl = "https://docs.google.com";
        const url = baseUrl + formPath + (my_query_params.toString() ? "?" + my_query_params.toString() : "");
        
        return { token, url };
    }

    function handleFormLaunch() {
        if (isAnimating) return;
        if (!formSourceInput.value.trim()) {
            showNotification("warning", "Input Missing", "Please paste the form source code first.");
            return;
        }
        try {
            const { token, url } = parseSource(formSourceInput.value);
            
            console.log("Extracted token:", token);
            console.log("Constructed URL:", url);
            
            tokenInput.value = token;
            hiddenForm.action = url;
            
            const tzInput = document.createElement('input');
            tzInput.type = 'hidden';
            tzInput.name = 'tz_offset';
            tzInput.value = '120';
            hiddenForm.appendChild(tzInput);

            showNotification("success", "Success!", "Launching the unlocked form now...");
            
            setTimeout(() => hiddenSubmitBtn.click(), 500);
        } catch (e) {
            showNotification("warning", "Parsing Error", e.message || "An unknown error occurred.");
            console.error("Form Unlocker Error:", e);
        }
    }
    
    // Initialize progress bar for the first active step
    updateWizardState();
});
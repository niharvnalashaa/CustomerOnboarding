// Phone number formatting function
function formatPhoneNumber(input) {
    let value = input.value.replace(/\D/g, '');
    if (value.length >= 6) {
        value = `(${value.slice(0, 3)}) ${value.slice(3, 6)}-${value.slice(6, 10)}`;
    } else if (value.length >= 3) {
        value = `(${value.slice(0, 3)}) ${value.slice(3)}`;
    }
    input.value = value;
}

// Federal Tax ID formatting
function formatTaxId(input, type) {
    let value = input.value.replace(/\D/g, '');
    if (type === 'EIN') {
        if (value.length >= 2) {
            //value = `${value.slice(0, 2)}-${value.slice(2, 9)}`;
        }
    } else if (type === 'SSN') {
        if (value.length >= 3) {
            value = `${value.slice(0, 3)}-${value.slice(3, 5)}-${value.slice(5, 9)}`;
        }
    }
    input.value = value;
}

// Credit card number formatting
function formatCreditCard(input) {
    let value = input.value.replace(/\D/g, '');
    value = value.replace(/(\d{4})(?=\d)/g, '$1 ');
    input.value = value;
}

// Expiration date formatting
function formatExpirationDate(input) {
    let value = input.value.replace(/\D/g, '');
    if (value.length >= 2) {
        value = `${value.slice(0, 2)}/${value.slice(2, 4)}`;
    }
    input.value = value;
}

// CV Code formatting
function formatCVCode(input) {
    let value = input.value.replace(/\D/g, '');
    if (value.length > 4) {
        value = value.slice(0, 4);
    }
    input.value = value;
}

// Configuration
const WEBHOOK_URL = 'https://niharvyas.app.n8n.cloud/webhook/onboard'; // Replace with your actual webhook URL

// Multi-step form functionality
let currentSection = 1;
const totalSections = 5;

// Initialize form functionality
document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('onboardingForm');
    
    // Initialize multi-step form
    initializeMultiStepForm();
    
    // Phone number formatting for all phone inputs
    const phoneInputs = document.querySelectorAll('input[type="tel"]');
    phoneInputs.forEach(input => {
        input.addEventListener('input', function() {
            formatPhoneNumber(this);
        });
    });
    
    // Federal Tax ID type change handler
    const taxIdType = document.getElementById('taxIdType');
    const federalTaxId = document.getElementById('federalTaxId');
    
    taxIdType.addEventListener('change', function() {
        const type = this.value;
        federalTaxId.placeholder = type === 'EIN' ? 'XXXXXXXXX' : 'XXX-XX-XXXX';
        federalTaxId.value = '';
    });
    
    federalTaxId.addEventListener('input', function() {
        const type = taxIdType.value;
        if (type) {
            formatTaxId(this, type);
        }
    });
    
    // Credit card formatting
    const creditCardNumber = document.getElementById('creditCardNumber');
    if (creditCardNumber) {
        creditCardNumber.addEventListener('input', function() {
            formatCreditCard(this);
        });
    }
    
    const expirationDate = document.getElementById('expirationDate');
    if (expirationDate) {
        expirationDate.addEventListener('input', function() {
            formatExpirationDate(this);
        });
    }
    
    const cvCode = document.getElementById('cvCode');
    if (cvCode) {
        cvCode.addEventListener('input', function() {
            formatCVCode(this);
        });
    }
    
    // Reseller permit conditional fields
    const resellerPermitRadios = document.querySelectorAll('input[name="resellerPermit"]');
    const resellerDetails = document.getElementById('resellerDetails');
    
    resellerPermitRadios.forEach(radio => {
        radio.addEventListener('change', function() {
            if (this.value === 'yes') {
                resellerDetails.style.display = 'block';
                document.getElementById('resellerNumber').required = true;
                document.getElementById('resellerDocument').required = true;
            } else {
                resellerDetails.style.display = 'none';
                document.getElementById('resellerNumber').required = false;
                document.getElementById('resellerDocument').required = false;
                document.getElementById('resellerNumber').value = '';
                document.getElementById('resellerDocument').value = '';
            }
        });
    });
    
    // Credit card payment conditional fields
    const payWithCardRadios = document.querySelectorAll('input[name="payWithCard"]');
    const creditCardDetails = document.getElementById('creditCardDetails');
    
    payWithCardRadios.forEach(radio => {
        radio.addEventListener('change', function() {
            if (this.value === 'yes') {
                creditCardDetails.style.display = 'block';
                // Make credit card fields required
                const requiredFields = ['creditCardNumber', 'cvCode', 'expirationDate', 'cardName'];
                requiredFields.forEach(fieldId => {
                    const field = document.getElementById(fieldId);
                    if (field) field.required = true;
                });
            } else {
                creditCardDetails.style.display = 'none';
                // Remove required from credit card fields
                const requiredFields = ['creditCardNumber', 'cvCode', 'expirationDate', 'cardName'];
                requiredFields.forEach(fieldId => {
                    const field = document.getElementById(fieldId);
                    if (field) {
                        field.required = false;
                        field.value = '';
                    }
                });
            }
        });
    });
    
    // Shipping account conditional fields
    const shippingBillToCheckboxes = document.querySelectorAll('input[name="shippingBillTo"]');
    const shippingAccountDetails = document.getElementById('shippingAccountDetails');
    
    shippingBillToCheckboxes.forEach(checkbox => {
        checkbox.addEventListener('change', function() {
            if (this.value === 'yourOwnAccount' && this.checked) {
                shippingAccountDetails.style.display = 'block';
                document.getElementById('shippingAccountNumber').required = true;
            } else {
                shippingAccountDetails.style.display = 'none';
                document.getElementById('shippingAccountNumber').required = false;
                document.getElementById('shippingAccountNumber').value = '';
            }
        });
    });
    
    // Weekly consolidation method conditional fields
    const consolidationCheckboxes = document.querySelectorAll('input[name="consolidationMethod"]');
    const weeklyDayDetails = document.getElementById('weeklyDayDetails');
    
    consolidationCheckboxes.forEach(checkbox => {
        checkbox.addEventListener('change', function() {
            if (this.value === '1xWeek' && this.checked) {
                weeklyDayDetails.style.display = 'block';
                document.getElementById('weeklyDay').required = true;
            } else {
                weeklyDayDetails.style.display = 'none';
                document.getElementById('weeklyDay').required = false;
                document.getElementById('weeklyDay').value = '';
            }
        });
    });
    
    // Same as billing address functionality
    const sameAsBillingCheckbox = document.querySelector('input[name="sameAsBilling"]');
    if (sameAsBillingCheckbox) {
        sameAsBillingCheckbox.addEventListener('change', function() {
            if (this.checked) {
                // Copy billing address to branch addresses
                const billingAddress = document.getElementById('billingAddress').value;
                const city = document.getElementById('city').value;
                const state = document.getElementById('state').value;
                const zipCode = document.getElementById('zipCode').value;
                
                document.getElementById('branch1Address').value = billingAddress;
                document.getElementById('branch1City').value = city;
                document.getElementById('branch1State').value = state;
                document.getElementById('branch1Zip').value = zipCode;
                
                document.getElementById('branch2Address').value = billingAddress;
                document.getElementById('branch2City').value = city;
                document.getElementById('branch2State').value = state;
                document.getElementById('branch2Zip').value = zipCode;
            } else {
                // Clear branch addresses
                const branchFields = ['branch1Address', 'branch1City', 'branch1State', 'branch1Zip',
                                   'branch2Address', 'branch2City', 'branch2State', 'branch2Zip'];
                branchFields.forEach(fieldId => {
                    document.getElementById(fieldId).value = '';
                });
            }
        });
    }
    
    // Business type conditional validation for practitioner fields and DME fields
    const businessTypeRadios = document.querySelectorAll('input[name="businessType"]');
    const practitionerFields = ['practitioner1Name', 'practitioner1Designation', 'practitioner1Certification'];
    const dmeFields = document.getElementById('dmeFields');
    const dmeRequiredFields = ['dmeLicenseNumber', 'dmeIssuingState'];
    
    businessTypeRadios.forEach(radio => {
        radio.addEventListener('change', function() {
            if (this.value === 'dmeFacility') {
                // Show DME fields and make them required
                dmeFields.style.display = 'block';
                dmeRequiredFields.forEach(fieldId => {
                    const field = document.getElementById(fieldId);
                    if (field) {
                        field.required = true;
                    }
                });
                
                // Make practitioner fields required when DME Facility is selected
                practitionerFields.forEach(fieldId => {
                    const field = document.getElementById(fieldId);
                    if (field) {
                        field.required = true;
                        field.setAttribute('data-dme-required', 'true');
                    }
                });
            } else {
                // Hide DME fields and remove requirement
                dmeFields.style.display = 'none';
                dmeRequiredFields.forEach(fieldId => {
                    const field = document.getElementById(fieldId);
                    if (field) {
                        field.required = false;
                        field.value = '';
                    }
                });
                
                // Remove required attribute when other business types are selected
                practitionerFields.forEach(fieldId => {
                    const field = document.getElementById(fieldId);
                    if (field) {
                        field.required = false;
                        field.removeAttribute('data-dme-required');
                        // Clear validation styling
                        field.style.borderColor = '#ddd';
                    }
                });
            }
        });
    });
    
    // Form submission
    form.addEventListener('submit', function(e) {
        e.preventDefault();
        
        // Show loading state
        const submitBtn = document.querySelector('.submit-btn');
        const originalText = submitBtn.textContent;
        submitBtn.textContent = 'Submitting...';
        submitBtn.disabled = true;
        form.classList.add('loading');
        
        // Collect form data
        const formData = new FormData(form);
        const data = {};
        
        // Convert FormData to regular object
        for (let [key, value] of formData.entries()) {
            if (data[key]) {
                // Handle multiple values (checkboxes, etc.)
                if (Array.isArray(data[key])) {
                    data[key].push(value);
                } else {
                    data[key] = [data[key], value];
                }
            } else {
                data[key] = value;
            }
        }
        
        // Handle file uploads
        const fileInputs = form.querySelectorAll('input[type="file"]');
        fileInputs.forEach(input => {
            if (input.files.length > 0) {
                data[input.name + '_file'] = input.files[0].name; // Store filename
            }
        });
        
        // Add metadata
        data.submissionDate = new Date().toISOString();
        data.formVersion = '1.0';
        
        // Send to webhook
        fetch(WEBHOOK_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data)
        })
        .then(response => {
            if (response.ok) {
                return response.json();
            }
            throw new Error('Network response was not ok');
        })
        .then(result => {
            // Success - Show success message and hide signature container
            const signatureContainer = document.querySelector('.signature-container');
            const successMessage = document.getElementById('successMessage');
            const submitPanel = document.getElementById('submitPanel');
            
            // Hide signature container and submit panel
            signatureContainer.style.display = 'none';
            submitPanel.style.display = 'none';
            
            // Show success message
            successMessage.style.display = 'flex';
            
            // Scroll to success message
            successMessage.scrollIntoView({ behavior: 'smooth', block: 'center' });
        })
        .catch(error => {
            // Error
            console.error('Error:', error);
            showMessage('Error submitting application. Please try again.', 'error');
        })
        .finally(() => {
            // Reset button state
            submitBtn.textContent = originalText;
            submitBtn.disabled = false;
            form.classList.remove('loading');
        });
    });
    
    // Show message function
    function showMessage(text, type) {
        // Remove existing messages
        const existingMessages = document.querySelectorAll('.message');
        existingMessages.forEach(msg => msg.remove());
        
        // Create new message
        const message = document.createElement('div');
        message.className = `message ${type}`;
        message.textContent = text;
        
        // Insert before form
        form.parentNode.insertBefore(message, form);
        
        // Auto-remove after 5 seconds
        setTimeout(() => {
            message.remove();
        }, 5000);
    }
    
    // Form validation
    function validateForm() {
        const requiredFields = form.querySelectorAll('[required]');
        let isValid = true;
        
        requiredFields.forEach(field => {
            if (!field.value.trim()) {
                field.style.borderColor = '#e74c3c';
                isValid = false;
            } else {
                field.style.borderColor = '#ddd';
            }
        });
        
        // Validate email fields
        const emailFields = form.querySelectorAll('input[type="email"]');
        emailFields.forEach(field => {
            if (field.value && !isValidEmail(field.value)) {
                field.style.borderColor = '#e74c3c';
                isValid = false;
            }
        });
        
        // Validate URL fields
        const urlFields = form.querySelectorAll('input[type="url"]');
        urlFields.forEach(field => {
            if (field.value && !isValidUrl(field.value)) {
                field.style.borderColor = '#e74c3c';
                isValid = false;
            }
        });
        
        return isValid;
    }
    
    function isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }
    
    // Real-time validation
    const inputs = form.querySelectorAll('input, select, textarea');
    inputs.forEach(input => {
        input.addEventListener('blur', function() {
            if (this.hasAttribute('required') && !this.value.trim()) {
                this.style.borderColor = '#e74c3c';
            } else if (this.type === 'email' && this.value && !isValidEmail(this.value)) {
                this.style.borderColor = '#e74c3c';
            } else if (this.type === 'url' && this.value && !isValidUrl(this.value)) {
                this.style.borderColor = '#e74c3c';
            } else {
                this.style.borderColor = '#ddd';
            }
        });
        
        input.addEventListener('input', function() {
            if (this.style.borderColor === 'rgb(231, 76, 60)') {
                this.style.borderColor = '#ddd';
            }
        });
    });
});

// Multi-step form functions
function initializeMultiStepForm() {
    // Show only the first section initially
    showSection(1);
    updateProgress();
    
    // Initially hide the submit button panel
    updateSubmitButtonVisibility();
}

function showSection(sectionNumber) {
    // Hide all sections
    const sections = document.querySelectorAll('.form-section');
    sections.forEach(section => {
        section.classList.remove('active');
    });
    
    // Show the current section
    const currentSectionElement = document.getElementById(`section${sectionNumber}`);
    if (currentSectionElement) {
        currentSectionElement.classList.add('active');
    }
    
    // Update current section
    currentSection = sectionNumber;
    updateProgress();
    
    // Show/hide submit button panel based on current step
    updateSubmitButtonVisibility();
}

function nextSection(currentStep) {
    // Validate current section before proceeding
    if (validateCurrentSection(currentStep)) {
        if (currentStep < totalSections) {
            showSection(currentStep + 1);
        } else {
            // This is the last section, proceed to signature
            showSignatureSection();
        }
    }
}

function prevSection(currentStep) {
    if (currentStep > 1) {
        showSection(currentStep - 1);
    } else {
        showSection(1);
    }
}

function showSignatureSection() {
    // Hide all form sections
    const sections = document.querySelectorAll('.form-section');
    sections.forEach(section => {
        section.classList.remove('active');
    });
    
    // Show signature section
    const signatureSection = document.getElementById('signatureSection');
    if (signatureSection) {
        signatureSection.classList.add('active');
    }
    
    // Update progress to show completion
    updateProgress(true);
    
    // Show submit button panel when reaching signature section
    updateSubmitButtonVisibility();
}

function validateCurrentSection(sectionNumber) {
    const section = document.getElementById(`section${sectionNumber}`);
    if (!section) return true;
    
    const requiredFields = section.querySelectorAll('[required]');
    let isValid = true;
    let firstInvalidField = null;
    
    // Check if DME Facility is selected and validate practitioner fields
    const businessTypeRadios = document.querySelectorAll('input[name="businessType"]');
    const isDMEFacility = Array.from(businessTypeRadios).some(radio => radio.checked && radio.value === 'dmeFacility');
    
    if (isDMEFacility && sectionNumber === 4) {
        // Validate practitioner fields when DME Facility is selected and we're on section 4
        const practitionerFields = ['practitioner1Name', 'practitioner1Designation', 'practitioner1Certification'];
        practitionerFields.forEach(fieldId => {
            const field = document.getElementById(fieldId);
            if (field && !field.value.trim()) {
                field.style.borderColor = '#e74c3c';
                if (!firstInvalidField) {
                    firstInvalidField = field;
                }
                isValid = false;
            } else if (field) {
                field.style.borderColor = '#ddd';
            }
        });
    }
    
    requiredFields.forEach(field => {
        if (!field.value.trim()) {
            field.style.borderColor = '#e74c3c';
            if (!firstInvalidField) {
                firstInvalidField = field;
            }
            isValid = false;
        } else {
            field.style.borderColor = '#ddd';
        }
        
        // Validate email fields
        if (field.type === 'email' && field.value && !isValidEmail(field.value)) {
            field.style.borderColor = '#e74c3c';
            if (!firstInvalidField) {
                firstInvalidField = field;
            }
            isValid = false;
        }
    });
    
    if (!isValid && firstInvalidField) {
        firstInvalidField.focus();
        const message = isDMEFacility && sectionNumber === 4 
            ? 'Please fill in all required fields, including practitioner information for DME Facility.' 
            : 'Please fill in all required fields before proceeding.';
        showMessage(message, 'error');
    }
    
    return isValid;
}

function updateProgress(isComplete = false) {
    const progressFill = document.getElementById('progressFill');
    const steps = document.querySelectorAll('.step');
    
    if (isComplete) {
        // Show 100% progress
        progressFill.style.width = '100%';
        steps.forEach(step => {
            step.classList.remove('active');
            step.classList.add('completed');
        });
    } else {
        // Update progress bar
        const progressPercentage = (currentSection / totalSections) * 100;
        progressFill.style.width = `${progressPercentage}%`;
        
        // Update step indicators
        steps.forEach((step, index) => {
            const stepNumber = index + 1;
            step.classList.remove('active', 'completed');
            
            if (stepNumber < currentSection) {
                step.classList.add('completed');
            } else if (stepNumber === currentSection) {
                step.classList.add('active');
            }
        });
    }
}

function updateSubmitButtonVisibility() {
    const submitPanel = document.getElementById('submitPanel');
    if (submitPanel) {
        // Show submit button panel only when user reaches Step 5 or signature section
        if (currentSection >= 5) {
            submitPanel.style.display = 'flex';
        } else {
            submitPanel.style.display = 'none';
        }
    }
}

function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

function isValidUrl(url) {
    try {
        new URL(url);
        return true;
    } catch {
        return false;
    }
}


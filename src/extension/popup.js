document.addEventListener('DOMContentLoaded', () => {
    const scanBtn = document.getElementById("scanBtn");
    const saveBtn = document.getElementById("saveBtn");
    const cancelBtn = document.getElementById("cancelBtn");
    const loginBtn = document.getElementById("loginBtn");
    const logoutBtn = document.getElementById("logoutBtn");
    const tokenInput = document.getElementById("tokenInput");
    const messageDiv = document.getElementById("message");

    const loginSection = document.getElementById("loginSection");
    const scanSection = document.getElementById("scanSection");
    const reviewSection = document.getElementById("reviewSection");

    // Inputs
    const companyInput = document.getElementById("company");
    const jobTitleInput = document.getElementById("jobTitle");
    const jobPostingIdInput = document.getElementById("jobPostingId");
    const locationInput = document.getElementById("location");
    const statusInput = document.getElementById("status");

    // New Inputs
    const companyDescriptionInput = document.getElementById("companyDescription");
    const responsibilitiesInput = document.getElementById("responsibilities");
    const requiredQualificationsInput = document.getElementById("requiredQualifications");
    const preferredQualificationsInput = document.getElementById("preferredQualifications");

    // Initial State: Check for Token
    chrome.storage.local.get(["token"], (result) => {
        if (result.token) {
            tokenInput.value = result.token;
            showScanSection();
        } else {
            showLoginSection();
        }
    });

    // View Switchers
    function showLoginSection() {
        loginSection.classList.remove("hidden");
        scanSection.classList.add("hidden");
        reviewSection.classList.add("hidden");
    }

    function showScanSection() {
        loginSection.classList.add("hidden");
        scanSection.classList.remove("hidden");
        reviewSection.classList.add("hidden");
    }

    function showReviewSection() {
        loginSection.classList.add("hidden");
        scanSection.classList.add("hidden");
        reviewSection.classList.remove("hidden");
    }

    // Handlers
    loginBtn.addEventListener("click", () => {
        chrome.tabs.create({ url: "http://localhost:5173" });
    });

    logoutBtn.addEventListener("click", () => {
        chrome.storage.local.remove("token", () => {
            tokenInput.value = "";
            showLoginSection();
            messageDiv.textContent = "Disconnected.";
        });
    });

    scanBtn.addEventListener("click", () => {
        const token = tokenInput.value;
        if (!token) {
            showLoginSection();
            return;
        }

        // Save Token to Storage
        chrome.storage.local.set({ token: token });

        messageDiv.textContent = "Scanning and analyzing...";
        scanBtn.disabled = true;
        scanBtn.textContent = "Scanning...";

        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            const activeTabId = tabs[0].id;

            function sendScanMessage() {
                // Send message to content script
                chrome.tabs.sendMessage(activeTabId, { action: "extractText" }, async (response) => {
                    if (chrome.runtime.lastError) {
                        // If connection fails, try injecting the script dynamically
                        console.log("Connection failed, attempting to inject script...");
                        chrome.scripting.executeScript({
                            target: { tabId: activeTabId },
                            files: ["content.js"]
                        }, () => {
                            if (chrome.runtime.lastError) {
                                messageDiv.textContent = "Error: Please refresh the page.";
                                resetScanBtn();
                            } else {
                                // Retry sending message after injection
                                setTimeout(() => {
                                    chrome.tabs.sendMessage(activeTabId, { action: "extractText" }, handleScanResponse);
                                }, 100);
                            }
                        });
                    } else {
                        handleScanResponse(response);
                    }
                });
            }

            async function handleScanResponse(response) {
                if (chrome.runtime.lastError) {
                    messageDiv.textContent = "Error: " + chrome.runtime.lastError.message;
                    resetScanBtn();
                    return;
                }

                if (response && response.text) {
                    statusDiv = messageDiv; // Alias for consistency
                    statusDiv.textContent = "Analyzing job details...";

                    // Store logo URL
                    if (response.logoUrl) {
                        chrome.storage.local.set({ currentLogoUrl: response.logoUrl });
                    }

                    try {
                        // Call Backend API to Extract
                        const apiResponse = await fetch("http://localhost:4000/api/extract", {
                            method: "POST",
                            headers: {
                                "Content-Type": "application/json",
                                "Authorization": `Bearer ${token}`
                            },
                            body: JSON.stringify({ text: response.text })
                        });

                        const data = await apiResponse.json();

                        if (apiResponse.ok) {
                            // Populate Form
                            companyInput.value = data.company || "";
                            jobTitleInput.value = data.jobTitle || "";
                            jobPostingIdInput.value = data.jobPostingId || "";
                            locationInput.value = data.location || "";
                            statusInput.value = data.status || "Applied";

                            // Populate New Fields
                            companyDescriptionInput.value = data.companyDescription || "";
                            responsibilitiesInput.value = data.responsibilities || "";
                            requiredQualificationsInput.value = data.requiredQualifications || "";
                            preferredQualificationsInput.value = data.preferredQualifications || "";

                            // Switch View
                            showReviewSection();
                            messageDiv.textContent = "";
                        } else {
                            messageDiv.textContent = "API Error: " + data.message;
                        }
                    } catch (err) {
                        messageDiv.textContent = "Network Error: " + err.message;
                    } finally {
                        resetScanBtn();
                    }
                } else {
                    messageDiv.textContent = "No text found.";
                    resetScanBtn();
                }
            }

            sendScanMessage();
        });
    });

    function resetScanBtn() {
        scanBtn.disabled = false;
        scanBtn.textContent = "Scan Job";
    }

    saveBtn.addEventListener("click", async () => {
        const token = tokenInput.value;
        // Get stored logo URL
        const { currentLogoUrl } = await chrome.storage.local.get("currentLogoUrl");

        const appData = {
            company: companyInput.value,
            jobTitle: jobTitleInput.value,
            jobPostingId: jobPostingIdInput.value,
            location: locationInput.value,
            status: statusInput.value,
            companyDescription: companyDescriptionInput.value,
            responsibilities: responsibilitiesInput.value,
            requiredQualifications: requiredQualificationsInput.value,
            preferredQualifications: preferredQualificationsInput.value,
            logoUrl: currentLogoUrl || null
        };

        saveBtn.disabled = true;
        saveBtn.textContent = "Saving...";

        try {
            const response = await fetch("http://localhost:4000/api/applications", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify(appData)
            });

            const data = await response.json();

            if (response.ok) {
                messageDiv.textContent = "Success! Application saved.";
                messageDiv.style.color = "#4ade80"; // Green

                // Reset view after 1.5 seconds
                setTimeout(() => {
                    showScanSection();
                    messageDiv.textContent = "";
                    messageDiv.style.color = "#9ca3af"; // Reset color

                    // Clear form
                    companyInput.value = "";
                    jobTitleInput.value = "";
                    jobPostingIdInput.value = "";
                    locationInput.value = "";
                    companyDescriptionInput.value = "";
                    responsibilitiesInput.value = "";
                    requiredQualificationsInput.value = "";
                    preferredQualificationsInput.value = "";
                }, 1500);
            } else {
                messageDiv.textContent = "Save Error: " + data.message;
            }
        } catch (err) {
            messageDiv.textContent = "Network Error: " + err.message;
        } finally {
            saveBtn.disabled = false;
            saveBtn.textContent = "Save to Dashboard";
        }
    });

    cancelBtn.addEventListener("click", () => {
        showScanSection();
        messageDiv.textContent = "";
    });
});

document.getElementById("loginBtn").addEventListener("click", async () => {
    const username = document.getElementById("username").value.trim();
    const password = document.getElementById("password").value.trim();

    // Simple validation
    if (!username || !password) {
        alert("Please enter both username and password.");
        return;
    }

    try {
        // Call to API
        const response = await fetch("/login/authentication", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ username, password })
        });

        // Parse API Response
        const result = await response.json();

        if (response.ok) {
            
            sessionStorage.setItem('userID', result.userID);
            sessionStorage.setItem('userName', username);
            // Check user role and redirect accordingly
            switch (result.role) {
                case 1: // Customer
                    window.location.href = "/customer";
                    break;
                case 2: // Employee
                    window.location.href = "/employee";
                    break;
                case 3: // Admin
                    window.location.href = "/admin";
                    break;
                default:
                    alert("Unknown role. Contact support.");
            }
        } else {
            // Display error message if login fails
            alert(result.message || "Invalid username or password.");
        }

    } catch (error) {
        console.error("Error:", error);
        alert("Failed to connect to the server.");
    }
});
document.getElementById("deleteEntry").addEventListener("click", async () => {
    // Show confirmation popup
    const confirmDelete = confirm("Are you sure you want to delete this entry?");
    
    if (!confirmDelete) {
        return;  // If user cancels, stop the deletion process
    }

    // Show the undo button for a few seconds after deletion
    const res = await fetch("/deleteEntry", {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({ id: document.getElementById("idDB").innerText }),
    });

    if (res.ok) {
        // If deletion is successful, show undo button
        showUndo();
    } else {
        alert("ERROR");
    }
});

let undoTimeout;

function showUndo() {
    // Show the undo button
    const undoButton = document.createElement('button');
    undoButton.textContent = 'Undo';
    undoButton.style.position = 'fixed';
    undoButton.style.bottom = '20px';
    undoButton.style.right = '20px';
    undoButton.style.padding = '10px';
    undoButton.style.backgroundColor = 'gray';
    undoButton.style.color = 'white';
    undoButton.style.border = 'none';
    undoButton.style.cursor = 'pointer';
    document.body.appendChild(undoButton);

    // Set a timeout to remove the undo button after 5 seconds
    undoTimeout = setTimeout(() => {
        undoButton.remove();
    }, 5000);

    // Add event listener for undo button
    undoButton.addEventListener("click", () => {
        clearTimeout(undoTimeout);  // Cancel the timeout so the undo button won't disappear
        undoButton.remove();  // Remove the undo button

        // Send request to undo the deletion (add a new route or logic in the backend to restore the deleted entry)
        undoDelete();
    });
}

async function undoDelete() {
    const res = await fetch("/undoDeleteEntry", {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({ id: document.getElementById("idDB").innerText })
    });

    if (res.ok) {
        alert("Deletion undone! Entry has been restored.");
        window.location.reload();  // Refresh the page to reflect the restoration
    } else {
        alert("Failed to undo deletion. Please try again.");
    }
}

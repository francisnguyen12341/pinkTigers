// var dropdown = document.getElementsByClassName("dropdown-btn");
// var i;

// for (i = 0; i < dropdown.length; i++) {
//   dropdown[i].addEventListener("click", function() {
//     this.classList.toggle("active");
//     var dropdownContent = this.nextElementSibling;
//     if (dropdownContent.style.display === "block") {
//       dropdownContent.style.display = "none";
//     } else {
//       dropdownContent.style.display = "block";
//     }
//   });
// }

async function getParentIdFromHash() {
    const folderName = location.hash.replace('#', '');  // Get folder name from hash (remove "#")
    if (folderName) {
        // Fetch the folder's id based on folder name
        try {
            const response = await fetch(`/folder?name=${folderName}`);
            const data = await response.json();
            if (data.folder && data.folder.length > 0) {
                const parentId = data.folder[0].id;
                console.log('Retrieved parentId:', parentId);
                return parentId;
            } else {
                console.log('Folder not found');
                return 1;  // Default to 1 if no folder is found
            }
        } catch (error) {
            console.error('Error fetching folder by name:', error);
            return 1;  // Default to 1 in case of an error
        }
    } else {
        console.log('No folder name in hash');
        return 1;  // Default to 1 if no folder name is provided
    }
}

async function singleClickHandler(event) {
    console.log('Clicked:', event.target);

    // Check if the clicked element is a dropdown button
    if (event.target && event.target.classList.contains("dropdown-btn")) {
        const dropdownContainer = event.target.nextElementSibling;  // The div right after the button
        // Toggle dropdown visibility
        dropdownContainer.style.display = dropdownContainer.style.display === 'block' ? 'none' : 'block';

        // Toggle green glow for parent folder of dropdown
        // event.target.classList.toggle("active");

        // Update URL... assumes the class is like "dropdown-btn testFolder2"
        // const folderName = event.target.classList[1];
        // location.hash = `#${folderName}`;
    }

    else if(event.target && event.target.classList.contains("add-folder")) {
        let folderName = prompt("Enter folder name: ");
        let parentId = await getParentIdFromHash();

        if (folderName) {
            // Make a POST request to create the folder
            fetch('/folder', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    name: folderName,
                    parent_id: parentId,
                })
            })
            .then(response => {
                if (response.status === 200) {
                    console.log('Folder created successfully!');
                    refreshSidenav();
                    location.hash = `#${folderName}`; // go to new folder
                } else {
                    console.log('Failed to create folder');
                }
            })
            .catch(error => {
                console.log('Error creating folder:', error);
            });
        }
    }

    else if(event.target && event.target.classList.contains("update-folder")) {
        let oldFolderName = location.hash.replace('#', '');  // Get folder name from hash (remove "#")
        let newFolderName = prompt("Enter new folder name: ");

        if (oldFolderName && newFolderName) {
            // Make a PUT request to update the folder
            fetch(`/folder?name=${oldFolderName}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    newName: newFolderName,
                })
            })
            .then(response => {
                if (response.status === 200) {
                    console.log('Folder updated successfully!');
                    refreshSidenav();
                    location.hash = `#${newFolderName}`; // go to same (renamed) folder
                } else {
                    console.log('Failed to update folder');
                }
            })
            .catch(error => {
                console.log('Error updating folder:', error);
            });
        }
    }
    
    else if(event.target && event.target.classList.contains("remove-folder")) {
      const folderName = location.hash.replace('#', '');  // Get folder name from hash (remove "#")
      if (folderName && confirm('Are you sure you want to delete this folder?')) {
        // Make a DELETE request to delete the folder
        fetch(`/folder?name=${folderName}`, {
            method: 'DELETE',
        })
        .then(response => {
            if (response.status === 200) {
                console.log('Folder delete successfully!');
                refreshSidenav();
                location.hash = "#root"; // go to default folder
            } else {
                console.log('Failed to delete folder');
            }
        })
        .catch(error => {
            console.log('Error deleting folder:', error);
        });
      }
    }
}

async function doubleClickHandler(event) {
    const currentActiveElement = document.querySelector('.active');
    if(currentActiveElement) {
        currentActiveElement.classList.remove('active');
    }
    event.target.classList.toggle("active");

    // Update URL... assumes the class is like "dropdown-btn testFolder2" or "single testFolder2"
    const folderName = event.target.classList[1];
    location.hash = `#${folderName}`;
}

function refreshSidenav() {
    fetch("/sidenav", {credentials: 'include'})
    .then(response => response.text())
    .then(html => {
        // Insert sidenav HTML
        const sideNavDiv = document.getElementById("sideNav");
        // sideNavDiv.insertAdjacentHTML('beforeend', html);
        sideNavDiv.innerHTML = html;

        // Inserted sidenav HTML does not seem to have the proper CSS toggling properties...
        // Add event listener to see whenever the user clicks on a dropdown button
        // Note: Need to remove and readd event listeners to apply to entire updated side nav
        sideNavDiv.removeEventListener('click', singleClickHandler);
        sideNavDiv.removeEventListener('dblclick', doubleClickHandler);
        sideNavDiv.addEventListener('click', singleClickHandler);
        sideNavDiv.addEventListener('dblclick', doubleClickHandler)
    })
    .catch(error => {
        console.error("Error fetching sideNav:", error);
    });
}

fetch("/sidenav", {credentials: 'include'})
    .then(response => response.text())
    .then(html => {
        // Insert sidenav HTML
        const sideNavDiv = document.getElementById("sideNav");
        // sideNavDiv.insertAdjacentHTML('beforeend', html);
        sideNavDiv.innerHTML = html;

        // Inserted sidenav HTML does not seem to have the proper CSS toggling properties...
        // Add event listener to see whenever the user clicks on a dropdown button
        // Note: Need to remove and readd event listeners to apply to entire updated side nav
        sideNavDiv.removeEventListener('click', singleClickHandler);
        sideNavDiv.removeEventListener('dblclick', doubleClickHandler);
        sideNavDiv.addEventListener('click', singleClickHandler);
        sideNavDiv.addEventListener('dblclick', doubleClickHandler)
    })
    .catch(error => {
        console.error("Error fetching sideNav:", error);
    });

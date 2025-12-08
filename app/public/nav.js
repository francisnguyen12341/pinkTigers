/*
    This function was previously used in singleClickHandler() add-folder event to get the selected folder's id (to properly set the parent_id)
    To do this, we used the selected folder's name in the location.hash and did a database call
    Alternatively, we can use getActiveFolderId()
*/
async function getIdFromHash() {
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

/*
    This is the function I am currently using.
    We find the selected folder by finding the element with the active class.
    Then, in the side nav HTML, we now also return the folder id.
    This decreases the number of database calls (due to worries of limited free database usage)
*/
async function getActiveFolderId() {
    const activeElement = document.querySelector('.sidenav .active');
    if (activeElement) {
        // assumes the class is like "dropdown-btn folder_name folder_id active" or "single folder_name folder_id active"
        const folderId = activeElement.classList[2];
        return folderId;
    }
    console.log('No active folder found');
    return 1;  // Default to 1 if no active folder found
}

async function singleClickHandler(event) {
    console.log('Clicked:', event.target);

    // Check if the clicked element is a dropdown button
    if (event.target && event.target.classList.contains("dropdown-btn")) {
        const dropdownContainer = event.target.nextElementSibling;  // The div right after the button
        // Toggle dropdown visibility
        dropdownContainer.style.display = dropdownContainer.style.display === 'block' ? 'none' : 'block';
    }

    else if(event.target && event.target.classList.contains("add-folder")) {
        let folderName = prompt("Enter folder name: ");
        let parentId = await getActiveFolderId();

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
            .then(async response => {
                if (response.status === 200) {
                    console.log('Folder created successfully!');

                    // Save which dropdown menus are open (display: block) and which are closed (display: none)
                    let oldDropdowns = document.querySelectorAll('.dropdown-btn');
                    let states = {};

                    // dropdown --> class="dropdown-btn folder_name folder_id"
                    // dropdownContainer --> style="display: block/none;"
                    oldDropdowns.forEach(dropdown => {
                        let dropdownContainer = dropdown.nextElementSibling;
                        states[dropdown.classList[2]] = dropdownContainer.style.display === 'block';
                    });
                    // Also, make sure that the parent folder (of the newly created folder) is opened as well (if applicable)
                    let activeElement = document.querySelector('.sidenav .active');
                    if (activeElement) {
                        states[activeElement.classList[2]] = true;
                    }
                    
                    await refreshSidenav();
                    location.hash = `#${folderName}`;

                    // await refreshSidenav(); completes the fetch() call, but the new side nav html doesn't seem to be rendered in the browser immediately...
                    // Add a 50ms timeout to allow side nav html to render (increased to 500ms to determine which dropdown menus to open)
                    setTimeout(async () => {
                        // Find the new folder in the sidebar and set it as active
                        let newActiveElement = document.querySelector(`.sidenav .${folderName}`);
                        if (newActiveElement) {
                            newActiveElement.classList.add('active');
                        }
                        // For all current parent folders, determine whether to open it or not
                        let newDropdowns = document.querySelectorAll('.dropdown-btn');
                        newDropdowns.forEach(dropdown => {
                            let dropdownContainer = dropdown.nextElementSibling;
                            if(states[dropdown.classList[2]]) {
                                dropdownContainer.style.display = 'block';
                            }
                            else {
                                dropdownContainer.style.display = 'none';
                            }
                        });
                        // Reload graph (should be blank)
                        await loadGraph();
                    }, 500)
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
            .then(async response => {
                if (response.status === 200) {
                    console.log('Folder updated successfully!');

                    // Save which dropdown menus are open (display: block) and which are closed (display: none)
                    let oldDropdowns = document.querySelectorAll('.dropdown-btn');
                    let states = {};

                    // dropdown --> class="dropdown-btn folder_name folder_id"
                    // dropdownContainer --> style="display: block/none;"
                    oldDropdowns.forEach(dropdown => {
                        let dropdownContainer = dropdown.nextElementSibling;
                        states[dropdown.classList[2]] = dropdownContainer.style.display === 'block';
                    });
                    
                    await refreshSidenav();
                    location.hash = `#${newFolderName}`;

                    // await refreshSidenav(); completes the fetch() call, but the new side nav html doesn't seem to be rendered in the browser immediately...
                    // Add a 50ms timeout to allow side nav html to render (increased to 500ms to determine which dropdown menus to open)
                    setTimeout(async () => {
                        // The same folder should still be active (but it needs to be reapplied)
                        let newActiveElement = document.querySelector(`.sidenav .${newFolderName}`);
                        if (newActiveElement) {
                            newActiveElement.classList.add('active');
                        }
                        // For all current parent folders, determine whether to open it or not
                        let newDropdowns = document.querySelectorAll('.dropdown-btn');
                        newDropdowns.forEach(dropdown => {
                            let dropdownContainer = dropdown.nextElementSibling;
                            if(states[dropdown.classList[2]]) {
                                dropdownContainer.style.display = 'block';
                            }
                            else {
                                dropdownContainer.style.display = 'none';
                            }
                        });
                        // await loadGraph(); // not needed since we're not changing active folder
                    }, 500)
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
        .then(async response => {
            if (response.status === 200) {
                console.log('Folder delete successfully!');

                // Save which dropdown menus are open (display: block) and which are closed (display: none)
                let oldDropdowns = document.querySelectorAll('.dropdown-btn');
                let states = {};

                // dropdown --> class="dropdown-btn folder_name folder_id"
                // dropdownContainer --> style="display: block/none;"
                oldDropdowns.forEach(dropdown => {
                    let dropdownContainer = dropdown.nextElementSibling;
                    states[dropdown.classList[2]] = dropdownContainer.style.display === 'block';
                });
                
                await refreshSidenav();
                location.hash = `#root`; // set active folder to default root folder

                // await refreshSidenav(); completes the fetch() call, but the new side nav html doesn't seem to be rendered in the browser immediately...
                // Add a 50ms timeout to allow side nav html to render (increased to 500ms to determine which dropdown menus to open)
                setTimeout(async () => {
                    // The same folder should still be active (but it needs to be reapplied)
                    let newActiveElement = document.querySelector(`.sidenav .root`);
                    if (newActiveElement) {
                        newActiveElement.classList.add('active');
                    }
                    // For all current parent folders, determine whether to open it or not
                    let newDropdowns = document.querySelectorAll('.dropdown-btn');
                    newDropdowns.forEach(dropdown => {
                        let dropdownContainer = dropdown.nextElementSibling;
                        if(states[dropdown.classList[2]]) {
                            dropdownContainer.style.display = 'block';
                        }
                        else {
                            dropdownContainer.style.display = 'none';
                        }
                    });
                    // Reload graph (should have contents of root folder)
                    await loadGraph();
                }, 500)
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

    // Update URL... assumes the class is like "dropdown-btn folder_name folder_id" or "single folder_name folder_id"
    const folderName = event.target.classList[1];
    location.hash = `#${folderName}`;

    // Update nodes on the UI since we are changing active folder
    await loadGraph();
}

async function refreshSidenav() {
    fetch("/sidenav", {credentials: 'include'})
    .then(response => response.text())
    .then(html => {
        // Insert sidenav HTML
        const sideNavDiv = document.getElementById("sideNav");
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
        sideNavDiv.innerHTML = html;

        // Inserted sidenav HTML does not seem to have the proper CSS toggling properties...
        // Add event listener to see whenever the user clicks on a dropdown button
        // Note: Need to remove and readd event listeners to apply to entire updated side nav
        sideNavDiv.removeEventListener('click', singleClickHandler);
        sideNavDiv.removeEventListener('dblclick', doubleClickHandler);
        sideNavDiv.addEventListener('click', singleClickHandler);
        sideNavDiv.addEventListener('dblclick', doubleClickHandler);

        // Set the root folder as active
        const rootFolder = document.querySelector('.sidenav .root');
        if (rootFolder) {
            rootFolder.classList.add('active');
        }
        if (!location.hash) {
            location.hash = `#root`;
        }
    })
    .catch(error => {
        console.error("Error fetching sideNav:", error);
    });

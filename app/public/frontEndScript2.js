let nodeCount = 0;
let easyMDE = null;
let selectedNode = null;
let activeNode = null;

// Initialize Cytoscape canvas
const cy = cytoscape({
    container: document.getElementById('cy'),
    elements: [],
    style: [
        {
            selector: 'node',
            style: {
                'background-color': '#e8ede8ff',
                'label': 'data(label)',
                'color': '#000000ff',
                'text-valign': 'top',
                'text-halign': 'center'
            }
        },
        {
            selector: 'edge',
            style: {
                'width': 2,
                'line-color': '#ccc',
                'target-arrow-color': '#ccc',
                'target-arrow-shape': 'triangle'
            }
        }
    ],
    layout: { name: 'grid' }
});

// Add new node button
// document.getElementById('addNodeButton').addEventListener('click', () => {
//     nodeCount++;
//     const newNode = {
//         data: { id: 'n' + nodeCount, label: 'Node ' + nodeCount, content: '' }
//     };

//     // since cy.add returns a collection -> get the node at index 0
//     const cyNode = cy.add(newNode)[0];
//     const layout = cy.layout({ name: 'cose' });

//     layout.on('layoutstop', () => {
//         const x = cyNode.position('x');
//         const y = cyNode.position('y');

//         // curl -X POST -H "Content-Type:application/json" -d "{\"username\": \"testUser\", \"password\": \"testPass\"}" http://localhost:3000/create-account
//         // curl -X POST -H "Content-Type:application/json" -d "{\"name\": \"testFolder1\", \"user_id\": 1}" http://localhost:3000/folder

//         // curl http://localhost:3000/notes"
//         const errorDiv = document.getElementById("errorDiv");

//         fetch("/notes", {
//             method: "POST",
//             headers: {
//                 "Content-Type": "application/json",
//             },

//             body: JSON.stringify({
//                 name: 'Node ' + nodeCount,
//                 x: x,
//                 y: y,
//                 text: '',
//                 folder_id: 1,
//             }),
//         }).then(response => {
//             console.log(response);
//             if (response.status !== 200) {
//                 response.json().then(body => {
//                     errorDiv.textContent = body.error;
//                 });

//                 return;
//             }
//         });
//     });

//     layout.run();
// });

document.getElementById('addNodeButton').addEventListener('click', () => {
    nodeCount++;

    // Create a new node at a default position (you can adjust x/y as you like)
    const cyNode = cy.add({
        data: { id: 'n' + nodeCount, label: 'Node ' + nodeCount, content: '' },
        position: { x: 100, y: 100 } // spawns the nodes at this point basically
    })[0];

    // Make the node draggable
    cyNode.grabify();

    // Save the new node to the backend
    const errorDiv = document.getElementById("errorDiv");
    const pos = cyNode.position(); // { x: ..., y: ... }

    fetch("/notes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            name: 'Node ' + nodeCount,
            x: pos.x,
            y: pos.y,
            text: '',
            folder_id: 1,
        }),
    })
        .then(response => {
            if (!response.ok) {
                response.json().then(body => {
                    errorDiv.textContent = body.error;
                });
                return;
            }

            console.log("Node saved:", cyNode.data('label'), pos);
        });
});

let firstNode = null;
let previewEdge = null;
let ghostNode = null;

cy.on('tap', 'node', evt => {
    const clickedNode = evt.target;

    if (!firstNode) {
        // First node clicked → store it
        firstNode = clickedNode;

        // Add a ghost node to follow the mouse
        ghostNode = cy.add({
            group: 'nodes',
            data: { id: 'ghost' },
            position: { x: firstNode.position('x'), y: firstNode.position('y') },
            style: { 'background-opacity': 0, 'border-width': 0, 'label': '' },
            selectable: false,
            grabbable: false
        });

        // Add preview edge
        previewEdge = cy.add({
            group: 'edges',
            data: { id: 'preview', source: firstNode.id(), target: ghostNode.id() },
            style: { 'line-color': '#aaa', 'line-style': 'dashed' }
        });

        // Update ghost node position with mouse
        cy.on('mousemove.preview', e => {
            const pos = e.position;
            ghostNode.position({ x: pos.x, y: pos.y });
        });

    } else if (clickedNode.id() !== firstNode.id()) {
        // Second node clicked → create real edge
        const edgeId = firstNode.id() + '-' + clickedNode.id();

        cy.add({
            group: 'edges',
            data: { id: edgeId, source: firstNode.id(), target: clickedNode.id() }
        });

        // Optional: save to backend
        fetch('/edges', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ source: firstNode.id(), target: clickedNode.id() })
        }).then(res => {
            if (!res.ok) console.error('Failed to save edge');
        });

        // Remove preview and ghost node
        cy.remove(previewEdge);
        cy.remove(ghostNode);
        previewEdge = null;
        ghostNode = null;
        cy.off('mousemove.preview');

        firstNode = null;
    } else {
        // clicked same node → cancel
        cy.remove(previewEdge);
        cy.remove(ghostNode);
        previewEdge = null;
        ghostNode = null;
        cy.off('mousemove.preview');
        firstNode = null;
    }
});

// Open EasyMDE editor
function openEditor(node) {
    activeNode = node;
    document.getElementById('editorModal').style.display = 'block';

    if (!easyMDE) {
        easyMDE = new EasyMDE({ element: document.getElementById('editorArea') });
    }
    easyMDE.value(node.data('content'));
}

// Save editor content
document.getElementById('saveNodeText').addEventListener('click', () => {
    const newText = easyMDE.value();
    if (activeNode) {
        activeNode.data('content', newText);
    }
    document.getElementById('editorModal').style.display = 'none';

    // call, using fetch, notes PUT to update the content 
});

// Cancel editor
document.getElementById('cancelEditor').addEventListener('click', () => {
    document.getElementById('editorModal').style.display = 'none';
});

// Double-click node → open markdown editor
cy.on('dblclick', 'node', evt => {
    openEditor(evt.target);
});

// Disable browser right-click menu globally
document.addEventListener('contextmenu', e => e.preventDefault());

/* -------------------------------------------------------
   Context Menu Setup
------------------------------------------------------- */
const contextMenu = document.getElementById('nodeContextMenu');

// Right-click node → show custom context menu
cy.on('cxttap', 'node', evt => {
    selectedNode = evt.target;

    // Position menu next to cursor
    const mouseX = evt.originalEvent.clientX;
    const mouseY = evt.originalEvent.clientY;

    contextMenu.style.left = `${mouseX + 5}px`;
    contextMenu.style.top = `${mouseY + 5}px`;
    contextMenu.style.display = 'block';
});

// Hide context menu when clicking elsewhere
document.addEventListener('click', () => {
    contextMenu.style.display = 'none';
});

/* -------------------------------------------------------
   Bootstrap Rename Modal Setup
------------------------------------------------------- */
const renameModalEl = document.getElementById('renameNodeModal');
const renameModal = new bootstrap.Modal(renameModalEl);
const renameInput = document.getElementById('renameNodeInput');

/* -------------------------------------------------------
   Context Menu Actions
------------------------------------------------------- */

// Rename node
document.getElementById('renameNodeBtn').addEventListener('click', () => {
    contextMenu.style.display = 'none'; // hide context menu
    if (!selectedNode) return;

    // Pre-fill with existing label
    renameInput.value = selectedNode.data('label');
    renameModal.show();
});

// Confirm rename action
document.getElementById('confirmRenameBtn').addEventListener('click', () => {
    const newName = renameInput.value.trim();
    if (newName !== '' && selectedNode) {
        selectedNode.data('label', newName);
    }
    renameModal.hide();
    // call, using fetch, notes PUT to update the content 
});

// Delete node
document.getElementById('deleteNodeBtn').addEventListener('click', () => {
    if (selectedNode && confirm('Are you sure you want to delete this node?')) {
        cy.remove(selectedNode);
    }
    contextMenu.style.display = 'none';
});

// Hover highlight effect
cy.on('mouseover', 'node', evt => {
    evt.target.style('background-color', '#cde5ff');
});
cy.on('mouseout', 'node', evt => {
    evt.target.style('background-color', '#e8ede8ff');
});


cy.on('tap', 'node', event => {
    const node = event.target;

    // CASE 1: No node selected yet → select this one
    if (!firstNode) {
        firstNode = node;
        node.addClass('node-selected');
        return;
    }

    // CASE 2: Tapping the SAME node → unselect it
    if (node.id() === firstNode.id()) {
        node.removeClass('node-selected');
        firstNode = null;
        return;
    }

    // CASE 3: Two different nodes were tapped → connect or disconnect
    let node1Id = node.id();
    let node2Id = firstNode.id();

    // Normalize order
    if (node1Id > node2Id) {
        const temp = node1Id;
        node1Id = node2Id;
        node2Id = temp;
    }

    edgeExists(node1Id, node2Id).then((exists) => {

        if (!exists) {
            // CREATE EDGE
            fetch("/edges", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ note1: node1Id, note2: node2Id })
            }).then(response => response.json()).then(body => {
                cy.add({
                    group: 'edges',
                    data: { id: `edge-${body.id}`, source: node1Id, target: node2Id }
                });

                // Unselect after connecting
                firstNode.removeClass('node-selected');
                firstNode = null;
            });
        } else {
            // DELETE EDGE
            fetch("/edges", {
                method: "DELETE",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ note1: node1Id, note2: node2Id })
            }).then(response => response.json()).then(body => {
                const edge = cy.$(`#edge-${body.id}`);
                cy.remove(edge);

                // Unselect after removing
                firstNode.removeClass('node-selected');
                firstNode = null;
            });
        }
    });
});
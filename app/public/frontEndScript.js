let nodeCount = 0;
let easyMDE = null;
let selectedNode = null;
let activeNode = null;

async function loadGraph() {
    try {
        const nodesRes = await fetch("/notes");
        const nodes = await nodesRes.json();
        cy.add(nodes);

        nodeCount = nodes.length;

        const edgesRes = await fetch("/edges-all");
        const edges = await edgesRes.json();
        
        cy.add(edges);

        cy.nodes().grabify();

        cy.fit(cy.elements(), 50);

    } catch (err) {
        console.error("Error loading graph:", err);
    }
}

async function edgeExists(node1Id, node2Id) {
    let res = await fetch(`/edges?note1=${node1Id}&note2=${node2Id}`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
    });

    return res.status == 200;
}

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
        },
        {
            selector: '.node-selected',
            style: {
                'background-color': '#77aaff',
                'border-color': '#0044ff',
                'border-width': 3,
                'border-style': 'dashed'
            }
        },
    ],
    layout: { name: 'preset' },
});

loadGraph();

cy.on('mouseover', 'node', (event) => {
    const node = event.target;
    node.style({
        'border-color': '#ff8800',
        'border-width': 3,
        'border-style': 'dashed',
        'background-color': '#ffffaa'
    });
});

cy.on('mouseout', 'node', (event) => {
    const node = event.target;
    node.style({
        'border-color': '',
        'border-width': '',
        'border-style': '',
        'background-color': ''
    });
});

// changes node location when 
cy.on('dragfreeon', 'node', (event) => {
    const node = event.target;
    const { x, y } = node.position();

    // would probably need to see what folder node is in.

    fetch("/notes-update-loc", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            x: x,
            y: y,
            id: node.id()
        }),
    }).then(response => {
        if (!response.ok) {
            response.json().then(body => {
                errorDiv.textContent = body.error;
            });
            return;
        }
    });
});

let firstNode = null;

cy.on('tap', 'node', event => {
    const node = event.target;

    /*
        check if first node has been clicked
        if not, make node the first clicked node
            - change color to show that it is selected
        if there is first node
            - if next node clicked == first node, then first node becomes null to get unselected
            - if next node clicked != first node
                - if edge doesn't exist, create an edge and insert into table
                - if edge exist, remove edge and from table
    */
    if (!firstNode) {
        firstNode = node;
        node.addClass('node-selected');
    } else if (node.id() !== firstNode.id()) {
        let node1Id = node.id();
        let node2Id = firstNode.id();


        // want node1 to be smaller
        if (node1Id > node2Id) {
            const temp = node1Id;
            node1Id = node2Id;
            node2Id = temp;
        }

        edgeExists(node1Id, node2Id).then((exists) => {

            if (!exists) {
                fetch("/edges", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        note1: node1Id,
                        note2: node2Id
                    })
                }).then(response => {
                    if (!response.ok) {
                        response.json().then(body => {
                            console.log(body.error);
                        });

                        return;
                    }

                    response.json().then(body => {
                        cy.add({
                            group: 'edges',
                            data: { id: `edge-${body.id}`, source: node1Id, target: node2Id },
                        });

                        firstNode.removeClass('node-selected');
                        firstNode = null;
                    });
                });
            } else {
                fetch("/edges", {
                    method: "DELETE",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        note1: node1Id,
                        note2: node2Id
                    })
                }).then(response => {
                    if (!response.ok) {
                        response.json().then(body => {
                            console.log(body.error);
                        });

                        return;
                    }

                    response.json().then(body => {
                        const edge = cy.getElementById(`edge-${body.id}`);
                        if (edge.length > 0) cy.remove(edge);

                        firstNode.removeClass('node-selected');
                        firstNode = null;
                    });
                });
            }
        })
    } else {
        firstNode.removeClass('node-selected');
        firstNode = null;
    }
});


// to add new nodes
document.getElementById('addNodeButton').addEventListener('click', () => {
    nodeCount++;

    // Save the new node to the backend
    const errorDiv = document.getElementById("errorDiv");

    fetch("/notes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            name: 'Node ' + nodeCount,
            x: 100,
            y: 100,
            content: '',
            folder_id: 1,
        })
    }).then(response => {
        if (!response.ok) {
            response.json().then(body => {
                errorDiv.textContent = body.error;
            });

            return;
        }

        response.json().then(body => {
            const cyNode = cy.add({
                data: { id: body.id, label: 'Node ' + nodeCount, content: '' },
                position: { x: 100, y: 100 } // spawns the nodes at this point basically
            })[0];

            // Make the node draggable
            cyNode.grabify();
        });

    });
});

// Open EasyMDE editor
function openEditor(node) {
    activeNode = node;
    document.getElementById('editorModal').style.display = 'block';

    if (!easyMDE) {
        easyMDE = new EasyMDE({
            element: document.getElementById('editorArea'),
            uploadImage: true,
            imageUploadEndpoint: "image-upload",
            imageMaxSize: 1024 * 1024 * 50,
            imagePathAbsolute: true
        });
    }

    easyMDE.value(node.data('content'));
}

// Save editor content
document.getElementById('saveNodeText').addEventListener('click', () => {
    const newText = easyMDE.value();

    if (activeNode) {
        activeNode.data('content', newText);

        fetch(`/notes/${activeNode.id()}/content`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                content: activeNode.data('content')
            }),
        }).then(response => {
            if (!response.ok) {
                response.json().then(body => {
                    console.log(body.error);
                });
                return;
            }
        });
    }
    document.getElementById('editorModal').style.display = 'none'; // tf this do? why do we even need this?


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

        console.log(selectedNode.id());

        fetch(`/notes/${selectedNode.id()}/name`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                name: newName
            })
        }).then(response => {
            if (!response.ok) {
                response.json().then(body => {
                    console.log(body.error);
                });

                return;
            }

            response.json().then(body => {
                selectedNode.data('label', body.name);
            });
        });
    }
    renameModal.hide();
    // call, using fetch, notes PUT to update the content 
});


// Delete node
document.getElementById('deleteNodeBtn').addEventListener('click', () => {
    if (selectedNode && confirm('Are you sure you want to delete this node?')) {
        fetch("/notes", {
            method: "DELETE",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ note: selectedNode.id() })
        }).then(res => res.json())
            .then(data => {
                console.log("Deleted from DB:", data);
                return data;
            })
            .catch(err => console.error("Error deleting node:", err));

        cy.remove(selectedNode);
        firstNode = null;
        selectedNode = null;
    }

    contextMenu.style.display = 'none';
});

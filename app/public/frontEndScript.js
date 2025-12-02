let nodeCount = 0;

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

        console.log("Node saved:", x, y);
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
                        var edge = cy.$(`#edge-${body.id}`);
                        cy.remove(edge);

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
            text: '',
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
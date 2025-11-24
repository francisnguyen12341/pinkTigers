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
document.getElementById('addNodeButton').addEventListener('click', () => {
  nodeCount++;
  const newNode = {
    data: { id: 'n' + nodeCount, label: 'Node ' + nodeCount, content: '' }
  };
  cy.add(newNode);
  cy.layout({ name: 'cose' }).run();

  // curl -X POST -H "Content-Type:application/json" -d "{\"username\": \"testUser\", \"password\": \"testPass\"}" http://localhost:3000/create-account
  // curl -X POST -H "Content-Type:application/json" -d "{\"name\": \"testFolder1\", \"user_id\": 1}" http://localhost:3000/folder
  
  // curl http://localhost:3000/notes"
  const errorDiv = document.getElementById("errorDiv");

  fetch("/notes", {
      method: "POST",
      headers: {
          "Content-Type": "application/json",
      },

      body: JSON.stringify({
          name: 'Node ' + nodeCount,
          text: '',
          folder_id: 1,
      }),
  }).then(response => {
      if (response.status !== 200) {
          response.json().then(body => {
              errorDiv.textContent = body.error;
          });
          return;
      }
  });
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
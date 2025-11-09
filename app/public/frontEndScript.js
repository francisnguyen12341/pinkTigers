let nodeCount = 0;

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
    // Button click to add new node
    document.getElementById('addNodeButton').addEventListener('click', () => {
      nodeCount++;
      const newNode = {
        data: { id: 'n' + nodeCount, label: 'Test ' + nodeCount }
      };
      //creates data object for a node

      // Add the new node
      cy.add(newNode);
      //adds the node

      // Optionally reposition the layout
      cy.layout({ name: 'cose' }).run();
    });

    //event for when a cs is 
    //tap event should be used to access the node

    
    cy.on('tap', 'node', function(evt){
      var node = evt.target;
      console.log('tapped ' + node.id())
    })

    //dblclick event should be used to change the title of the node
    cy.on('dblclick', 'node', function(evt){
      var node = evt.target;
      var currentLabel = node.data('label');
      var newLabel = prompt('Edit node label: ', currentLabel);
      if (newLabel !== null && newLabel.trim() !== '') {
        node.data('label', newLabel);
      }
      console.log('dbltapped ' + node.id())
    })



    //future notes to add: mouseover event to change style to highlight node to show hover detection
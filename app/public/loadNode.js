window.addEventListener("load", function(){
    // ....
});


```
https://js.cytoscape.org/#nodes.shift
1. positions function to get x and y of nodes
    a. need to send that to the backend
    b. need to fix the table and note requests to save positions x and y
2. when page loads, need to load the 
    a. kinda starter code
    window.addEventListener("load", function(){
        // ....
    });
    b. load whatever node is in the main folder
3. when node position changes, need to edit new position
    a. need a new put request to update location
    b. how to detect that node moved? prob when it gets unselected, we update the new position in the database
4. edge between node work
    a. may need to create a table to store node pairs
guys, i fr don't want to work on frontend stuff to get the edges between the pair to work but i can do the backend stuff...
```
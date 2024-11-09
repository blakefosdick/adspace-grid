// gridstack-custom.js

console.log("GridStack script is running");

let grid; // Global variable to hold the GridStack instance
let selectedElement = null;

function initializeGrid() {
    console.log("Initializing GridStack");

    grid = GridStack.init({
        column: 17,
        row: 22,
        cellHeight: '2.5vw',
        minRow: 22,
        disableOneColumnMode: false,
        float: false,
        margin: '1px',
        resizable: {
            handles: 'se'
        }
    }, '.grid-stack');

    console.log("GridStack initialized", grid);

    grid.on('added', function (event, items) {
        grid.compact(); // Compact items whenever a new item is added
    });

    grid.on('change', function (event, items) {
        grid.compact(); // Compact items whenever their layout changes
    });

    grid.on('added removed change', function(e, items) {
        console.log("GridStack event: added/removed/changed");
        updateItemContent(items);
    });

    grid.on('resizestart', function(event, el) {
        el.classList.add('grid-stack-item-resizing');
    });

    grid.on('resize', function(event, el) {
        updateItemContent([el]);
    });

    grid.on('resizestop', function(event, el) {
        el.classList.remove('grid-stack-item-resizing');
        updateItemContent([el]);
    });

    grid.on('dragstart', function(event, el) {
        el.classList.add('grid-stack-item-dragging');
    });

    grid.on('dragstop', function(event, el) {
        el.classList.remove('grid-stack-item-dragging');
        updateItemContent([el]);
    });

    // Add click event listener for item selection
    document.querySelector('.grid-stack').addEventListener('click', function(event) {
        const gridItem = event.target.closest('.grid-stack-item');
        if (gridItem) {
            selectItem(gridItem);
        } else {
            deselectItem();
        }
    });

    // Add click event listener for canvas click
    document.querySelector('#gridstack-container').addEventListener('click', function(event) {
        if (!event.target.closest('.grid-stack-item')) {
            deselectItem();
        }
    });

    // Define global functions after grid initialization
    window.bubble_fn_loadSerializedLayout = function(serializedData) {
        console.log("bubble_fn_loadSerializedLayout called");
        if (!grid) {
            console.error("Grid is not initialized in loadLayout");
            return;
        }
        if (serializedData) {
            try {
                let savedLayout = JSON.parse(serializedData);
                if (Array.isArray(savedLayout)) {
                    savedLayout.forEach(item => {
                        item.minW = 3;
                        item.minH = 3;
                    });
                    grid.load(savedLayout);
                    updateLockedStates();
                    console.log("Layout loaded successfully");
                } else {
                    console.error("Invalid layout data");
                }
            } catch (error) {
                console.error("Error loading layout:", error);
            }
        }
    };

    window.saveSerializedLayout = function() {
        console.log("saveSerializedLayout called");
        if (!grid) {
            console.error("Grid is not initialized in saveLayout");
            return;
        }
        let serializedData = JSON.stringify(grid.save(true)); // includeContent: true
        console.log("Layout saved:", serializedData);
        bubble_fn_saveSerializedLayout(serializedData);
    };

    window.bubble_fn_addNewAdSpace = function() {
        console.log("bubble_fn_addNewAdSpace called");
        if (!grid) {
            console.error("Grid is not initialized in addNewAdSpace");
            console.log("Current grid value:", grid);
            return;
        }
        let newItem = {
            x: 0,
            w: 3,
            h: 3,
            content: 'New Ad Space',
            minW: 3,
            minH: 3,
            locked: false
        };
        const widget = grid.addWidget(newItem);
        updateItemContent([widget]);
        console.log("New ad space added");
    };

    window.bubble_fn_removeSelectedAdSpace = function() {
        if (selectedElement) {
            grid.removeWidget(selectedElement);
            selectedElement = null;
            console.log("Selected ad space removed");
        } else {
            console.log("No ad space selected to remove");
        }
    };

    window.bubble_fn_toggleLock = function() {
        if (selectedElement) {
            toggleLockState(selectedElement);
        } else {
            console.log("No ad space selected to toggle lock state");
        }
    };
}

function updateItemContent(items) {
    items.forEach(item => {
        const node = item.gridstackNode;
        if (node) {
            item.querySelector('.grid-stack-item-content').textContent = `Width: ${node.w}, Height: ${node.h}`;
        }
    });
}

function updateLockedStates() {
    const gridItems = document.querySelectorAll('.grid-stack-item');
    gridItems.forEach(item => {
        const node = item.gridstackNode;
        if (node && node.noMove && node.noResize) {
            item.classList.add('locked');
            item.setAttribute('gs-locked', 'true');
            node.locked = true; // Update the locked state
            console.log("Item locked:", item);
        } else {
            item.classList.remove('locked');
            item.removeAttribute('gs-locked');
            node.locked = false; // Update the locked state
        }
        updateItemContent([item]); // Update content on load
    });
}

function toggleLockState(item) {
    const node = item.gridstackNode;
    if (node && node.noMove && node.noResize) {
        grid.movable(item, true);
        grid.resizable(item, true);
        item.classList.remove('locked');
        item.removeAttribute('gs-locked');
        node.noMove = false;
        node.noResize = false;
        node.locked = false;
        console.log("Ad space unlocked", item);
    } else {
        grid.movable(item, false);
        grid.resizable(item, false);
        item.classList.add('locked');
        item.setAttribute('gs-locked', 'true');
        node.noMove = true;
        node.noResize = true;
        node.locked = true;
        console.log("Ad space locked", item);
    }
    updateItemContent([item]); // Update content when lock state changes
}

function selectItem(element) {
    if (selectedElement) {
        selectedElement.classList.remove('selected');
    }
    selectedElement = element;
    selectedElement.classList.add('selected');
    console.log("Ad space selected");
}

function deselectItem() {
    if (selectedElement) {
        selectedElement.classList.remove('selected');
        selectedElement = null;
        console.log("Ad space deselected");
    }
}

function checkAndInitializeGrid() {
    if (typeof GridStack === 'undefined') {
        console.error("GridStack.js is not loaded. Check the script inclusion.");
        return;
    }
    
    if (document.readyState === 'complete' || document.readyState === 'interactive') {
        console.log("Document is ready, initializing GridStack immediately");
        initializeGrid();
    } else {
        console.log("Document is not ready, waiting for DOMContentLoaded event");
        document.addEventListener('DOMContentLoaded', function() {
            console.log("DOMContentLoaded event fired");
            initializeGrid();
        });
    }
}

window.addEventListener('load', function() {
    console.log("Window load event fired");
    if (!grid) {
        console.log("Grid is still not initialized, initializing now");
        checkAndInitializeGrid();
    }
});

checkAndInitializeGrid();

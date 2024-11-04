const canvas = document.getElementById("canvas");
const transitionSVG = document.getElementById("transitionSVG");

let states = [];
let transitions = [];
let initialState = null;
let finalStates = new Set();

// Function to add a state
function addState() {
    const stateName = document.getElementById("stateInput").value;
    if (stateName && !states.some(state => state.name === stateName)) {
        states.push({ name: stateName, x: Math.random() * 400, y: Math.random() * 400 });
        draw();
        alert(`State "${stateName}" added.`);
    } else {
        alert(`State "${stateName}" already exists or is invalid.`);
    }
}

// Function to add a state at a clicked position
function addStateAtPosition(x, y) {
    const stateName = document.getElementById("stateInput").value;

    if (stateName && !states.some(state => state.name === stateName)) {
        // Adjust position if too close to other states
        if (states.some(state => Math.abs(state.x - x) < 50 && Math.abs(state.y - y) < 50)) {
            alert("Position too close to existing state. Choose another position.");
            return;
        }

        states.push({ name: stateName, x: x - 20, y: y - 20 }); // Center the state at clicked position
        draw();
        alert(`State "${stateName}" added at position.`);
    } else {
        alert(`State "${stateName}" already exists or is invalid.`);
    }
}

// Click event listener for adding states at clicked position
canvas.addEventListener("click", function(event) {
    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    addStateAtPosition(x, y);
});

// Function to set a state as initial
function setInitialState() {
    const stateName = document.getElementById("stateInput").value;
    initialState = states.find(state => state.name === stateName);
    draw();
}

// Function to set a state as final
function setFinalState() {
    const stateName = document.getElementById("stateInput").value;
    const finalState = states.find(state => state.name === stateName);
    if (finalState) finalStates.add(finalState.name);
    draw();
}

// Function to add a transition
function addTransition() {
    const transitionInput = document.getElementById("transitionInput").value;
    const [from, to, symbol] = transitionInput.split(",");
    if (from && to && symbol) {
        if (!transitions.some(t => t.from === from && t.to === to && t.symbol === symbol)) {
            transitions.push({ from, to, symbol });
            draw();
        } else {
            alert("This transition already exists.");
        }
    } else {
        alert("Please enter a valid transition in the format: A,B,a");
    }
}

// Function to remove a state
function removeState() {
    const stateName = document.getElementById("stateInput").value;
    states = states.filter(state => state.name !== stateName);
    transitions = transitions.filter(transition => transition.from !== stateName && transition.to !== stateName);
    if (initialState && initialState.name === stateName) initialState = null;
    finalStates.delete(stateName);
    draw();
}

// Function to remove a transition
function removeTransition() {
    const transitionInput = document.getElementById("transitionInput").value;
    const [from, to, symbol] = transitionInput.split(",");
    transitions = transitions.filter(t => !(t.from === from && t.to === to && t.symbol === symbol));
    draw();
}

// Draw function to display states and transitions
function draw() {
    canvas.innerHTML = ""; // Clear the canvas
    transitionSVG.innerHTML = ""; // Clear the SVG

    // Draw states first
    states.forEach(state => {
        const stateElem = document.createElement("div");
        stateElem.className = "state";
        stateElem.style.left = state.x + "px";
        stateElem.style.top = state.y + "px";
        stateElem.innerText = state.name;

        // Apply different styles for initial and final states
        if (initialState && initialState.name === state.name) {
            stateElem.classList.add("initial");
        }
        if (finalStates.has(state.name)) {
            stateElem.classList.add("final");
        }
        canvas.appendChild(stateElem); // Add state to the canvas
    });

    // Draw transitions afterward
    transitions.forEach(transition => {
        const fromState = states.find(s => s.name === transition.from);
        const toState = states.find(s => s.name === transition.to);
        if (fromState && toState) {
            if (fromState === toState) {
                drawSelfLoop(fromState, transition.symbol);
            } else {
                drawLine(fromState, toState, transition.symbol);
            }
        }
    });
}

// Function to draw a transition line
function drawLine(fromState, toState, symbol) {
    const radius = 50; // Radius for state circles (40px diameter)

    // Calculate the center positions for the lines
    const x1 = fromState.x + 45; // Center x of fromState
    const y1 = fromState.y + radius; // Center y of fromState
    const x2 = toState.x + 40; // Center x of toState
    const y2 = toState.y + radius; // Center y of toState

    // Calculate the distance between the states
    const distance = Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));

    // Adjust these values to change how far outside the circles the lines start
    const padding = 20; // Distance to extend the lines outside the circles

    // Calculate new end points for the line
    const adjustedX1 = x1 + (padding * (x2 - x1) / distance); // Move x1 away from x2
    const adjustedY1 = y1 + (padding * (y2 - y1) / distance); // Move y1 away from y2
    const adjustedX2 = x2 - (padding * (x2 - x1) / distance); // Move x2 away from x1
    const adjustedY2 = y2 - (padding * (y2 - y1) / distance); // Move y2 away from y1

    // Create the line element
    const line = document.createElementNS("http://www.w3.org/2000/svg", "line");
    line.setAttribute("x1", adjustedX1);
    line.setAttribute("y1", adjustedY1);
    line.setAttribute("x2", adjustedX2);
    line.setAttribute("y2", adjustedY2);
    line.classList.add("arrow");
    // Apply the arrowhead marker to the line
    line.setAttribute("marker-end", "url(#arrowhead)");

    // Create the text element for the symbol
    const text = document.createElementNS("http://www.w3.org/2000/svg", "text");
    text.setAttribute("x", (x1 + x2) / 2); // Center text between two states
    text.setAttribute("y", (y1 + y2) / 2 - 5); // Position the text above the line
    text.textContent = symbol;

    transitionSVG.appendChild(line);
    transitionSVG.appendChild(text);
}

// Function to draw a self-loop as a circular arc
function drawSelfLoop(state, symbol) {
    const radius = 10; // half of the state circles (40px diameter)
    const cx = state.x + 20; // center x of the state
    const cy = state.y + 24; // center y of the state
    const offset = 28; // distance from the state for the curve

    // Create a circular arc path for the self-loop
    const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
    const d = `
        M ${cx} ${cy - offset} 
        A ${offset} ${offset} 0 0 1 ${cx + offset} ${cy} 
        A ${offset} ${offset} 0 0 0 ${cx} ${cy + offset}
        A ${offset} ${offset} 0 0 1 ${cx - offset} ${cy} 
        A ${offset} ${offset} 0 0 1 ${cx} ${cy - offset}
    `;
    path.setAttribute("d", d);
    path.setAttribute("fill", "none"); // No fill for the self-loop
    path.setAttribute("stroke", "#007bff"); // Set the stroke color to #007bff
    path.setAttribute("stroke-width", "2"); // Set the stroke width
    path.classList.add("arrow");

    // Position the text above the self-loop
    const text = document.createElementNS("http://www.w3.org/2000/svg", "text");
    text.setAttribute("x", cx + offset - 10); // Adjust text position for better visibility
    text.setAttribute("y", cy - offset + 10); // Position text inside the loop
    text.textContent = symbol;

    transitionSVG.appendChild(path);
    transitionSVG.appendChild(text);
}

// Simulation function
function simulate() {
    const inputString = prompt("Enter a string to simulate:");
    if (!inputString) return;

    let currentState = initialState;
    for (let symbol of inputString) {
        const transition = transitions.find(
            t => t.from === currentState.name && t.symbol === symbol
        );

        if (transition) {
            currentState = states.find(s => s.name === transition.to);
            highlightState(currentState);
        } else {
            alert("No valid transition for symbol: " + symbol);
            return;
        }
    }
    alert("Simulation complete. Final State: " + currentState.name);
}

function highlightState(state) {
    const allStates = document.querySelectorAll(".state");
    allStates.forEach(s => s.style.backgroundColor = "#fff");

    const currentStateElem = Array.from(allStates).find(s => s.innerText === state.name);
    if (currentStateElem) {
        currentStateElem.style.backgroundColor = "yellow"; // Highlight current state
    }
}

// Initialize the SVG markers
function initSVG() {
    const svgDefs = document.createElementNS("http://www.w3.org/2000/svg", "defs");
    const marker = document.createElementNS("http://www.w3.org/2000/svg", "marker");
    marker.setAttribute("id", "arrowhead");
    marker.setAttribute("viewBox", "0 0 10 10");
    marker.setAttribute("refX", 10);
    marker.setAttribute("refY", 5);
    marker.setAttribute("markerWidth", 4);
    marker.setAttribute("markerHeight", 4);
    marker.setAttribute("orient", "auto");
    
    const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
    path.setAttribute("d", "M 0 0 L 10 5 L 0 10 z");
    path.setAttribute("fill", "black");
    
    marker.appendChild(path);
    svgDefs.appendChild(marker);
    transitionSVG.appendChild(svgDefs);
}

initSVG();



function drawArrowhead(x, y, angle) {
    const arrowSize = 8;
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x - arrowSize * Math.cos(angle - Math.PI / 6), y - arrowSize * Math.sin(angle - Math.PI / 6));
    ctx.lineTo(x - arrowSize * Math.cos(angle + Math.PI / 6), y - arrowSize * Math.sin(angle + Math.PI / 6));
    ctx.closePath();
    ctx.fillStyle = 'black';
    ctx.fill();
}
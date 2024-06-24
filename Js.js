// Application state
let appState = {
    employees: [],
    statuses: []
};

// Main initialization function
function init() {
    setupEventListeners();
    restoreFromLocalStorage(); // Check for saved data
    updateStatusList();
    renderEmployees();
    setupColorPickers();
    checkExpiration(); // Check if URL has expired
}

// Set up event listeners for buttons
function setupEventListeners() {
    const addEmployeeBtn = document.getElementById('addEmployeeBtn');
    const addStatusBtn = document.getElementById('addStatusBtn');

    if (addEmployeeBtn) {
        addEmployeeBtn.addEventListener('click', addEmployee);
    }

    if (addStatusBtn) {
        addStatusBtn.addEventListener('click', addStatus);
    }
}

// Set up color pickers for status indicators
function setupColorPickers() {
    const statusIndicators = document.querySelectorAll('.status-indicator');
    statusIndicators.forEach((indicator, index) => {
        indicator.style.backgroundColor = appState.statuses[index]?.color || '#cccccc';
        indicator.addEventListener('click', () => editStatusColor(index));
    });
}

// Save data to Local Storage
function saveToLocalStorage() {
    localStorage.setItem('employeeLocatorAppState', JSON.stringify(appState));
}

// Restore data from Local Storage
function restoreFromLocalStorage() {
    const storedState = localStorage.getItem('employeeLocatorAppState');
    if (storedState) {
        appState = JSON.parse(storedState);
    }
}

// Check if URL has expired
function checkExpiration() {
    const expirationTimestamp = localStorage.getItem('adminUrlExpiration');
    if (expirationTimestamp) {
        const now = Date.now();
        if (now > parseInt(expirationTimestamp, 10)) {
            // URL has expired, clear app state and localStorage
            localStorage.removeItem('employeeLocatorAppState');
            localStorage.removeItem('adminUrlExpiration');
            appState = {
                employees: [],
                statuses: []
            };
            alert('The shared URL has expired. Please request a new one.');
            location.href = 'https://everydayspymaster.github.io/Employee-Locator/'; // Redirect to home page or appropriate URL
        }
    }
}

// Generate and copy admin URL
function shareAdminUrl() {
    const adminUrl = generateAdminUrl();
    copyToClipboard(adminUrl);
    alert('Admin URL copied to clipboard!');
}

// Generate admin URL with expiration
function generateAdminUrl() {
    const expirationTime = Date.now() + (24 * 60 * 60 * 1000); // 24 hours in milliseconds
    localStorage.setItem('adminUrlExpiration', expirationTime.toString());
    return window.location.href;
}

// Copy text to clipboard
function copyToClipboard(text) {
    const dummyElement = document.createElement('textarea');
    dummyElement.value = text;
    dummyElement.setAttribute('readonly', '');
    dummyElement.style.position = 'absolute';
    dummyElement.style.left = '-9999px';
    document.body.appendChild(dummyElement);
    dummyElement.select();
    document.execCommand('copy');
    document.body.removeChild(dummyElement);
}

// Add a new employee
function addEmployee() {
    const nameInput = document.getElementById('newEmployeeName');
    const name = nameInput.value.trim();
    if (name) {
        appState.employees.push({ name, status: appState.statuses.length > 0 ? appState.statuses[0].name : '' });
        nameInput.value = '';
        saveToLocalStorage(); // Save data after modification
        renderEmployees();
        const lastEmployee = document.querySelector('.employee-item:last-child');
        if (lastEmployee) {
            animateNewItem(lastEmployee);
        }
    } else {
        showError(nameInput, 'Please enter a valid employee name');
    }
}

// Add a new status
function addStatus() {
    const nameInput = document.getElementById('newStatusName');
    const colorInput = document.getElementById('newStatusColor');
    const name = nameInput.value.trim();
    const color = colorInput.value;
    if (name && color) {
        appState.statuses.push({ name, color });
        nameInput.value = '';
        saveToLocalStorage(); // Save data after modification
        updateStatusList();
        renderEmployees();
        const lastStatus = document.querySelector('.status-item:last-child');
        if (lastStatus) {
            animateNewItem(lastStatus);
        }
    } else {
        if (!name) {
            showError(nameInput, 'Please enter a valid status name');
        }
    }
}

// Update an employee's status
function updateEmployeeStatus(index, newStatus) {
    appState.employees[index].status = newStatus;
    saveToLocalStorage(); // Save data after modification
    renderEmployees();
}

// Render the list of employees
function renderEmployees() {
    const employeeList = document.getElementById('employeeList');
    employeeList.innerHTML = '';
    appState.employees.forEach((employee, index) => {
        const employeeItem = createEmployeeElement(employee, index);
        employeeList.appendChild(employeeItem);
    });
}

// Create an individual employee element
function createEmployeeElement(employee, index) {
    const employeeItem = document.createElement('div');
    employeeItem.className = 'employee-item';

    const statusColor = appState.statuses.find(s => s.name === employee.status)?.color || '#cccccc';

    employeeItem.innerHTML = `
        <div class="status-indicator" style="background-color: ${statusColor};"></div>
        <div class="employee-info">${employee.name}</div>
        <select>
            ${appState.statuses.map(status => `<option ${employee.status === status.name ? 'selected' : ''}>${status.name}</option>`).join('')}
        </select>
        <div class="status-actions">
            <button class="edit-button">Edit Name</button>
            <button class="delete-button">Delete</button>
        </div>
    `;

    const select = employeeItem.querySelector('select');
    select.addEventListener('change', function() {
        updateEmployeeStatus(index, this.value);
    });

    const editButton = employeeItem.querySelector('.edit-button');
    editButton.addEventListener('click', () => editEmployee(index));

    const deleteButton = employeeItem.querySelector('.delete-button');
    deleteButton.addEventListener('click', () => deleteEmployee(index));

    return employeeItem;
}

// Edit an employee's name
function editEmployee(index) {
    const newName = prompt('Enter new name for employee:', appState.employees[index].name);
    if (newName !== null && newName.trim() !== '') {
        appState.employees[index].name = newName.trim();
        saveToLocalStorage(); // Save data after modification
        renderEmployees();
    }
}

// Delete an employee
function deleteEmployee(index) {
    if (confirm(`Are you sure you want to delete ${appState.employees[index].name}?`)) {
        appState.employees.splice(index, 1);
        saveToLocalStorage(); // Save data after modification
        renderEmployees();
    }
}

// Update the list of statuses
function updateStatusList() {
    const statusList = document.getElementById('statusList');
    statusList.innerHTML = '';
    appState.statuses.forEach((status, index) => {
        const statusItem = createStatusElement(status, index);
        statusList.appendChild(statusItem);
    });
}

// Create an individual status element
function createStatusElement(status, index) {
    const statusItem = document.createElement('div');
    statusItem.className = 'status-item';
    statusItem.innerHTML = `
        <div class="status-indicator" style="background-color: ${status.color};"></div>
        <div class="status-name">${status.name}</div>
        <div class="status-actions">
            <button class="edit-button">Edit Name</button>
            <button class="delete-button">Delete</button>
        </div>
    `;

    const editButton = statusItem.querySelector('.edit-button');
    editButton.addEventListener('click', () => editStatus(index));

    const deleteButton = statusItem.querySelector('.delete-button');
    deleteButton.addEventListener('click', () => deleteStatus(index));

    return statusItem;
}

// Edit a status name
function editStatus(index) {
    const newName = prompt('Enter new name for status:', appState.statuses[index].name);
    if (newName !== null && newName.trim() !== '') {
        appState.statuses[index].name = newName.trim();
        saveToLocalStorage(); // Save data after modification
        updateStatusList();
        renderEmployees();
    }
}

// Edit a status color
function editStatusColor(index) {
    const colorPicker = document.createElement('input');
    colorPicker.type = 'color';
    colorPicker.value = appState.statuses[index]?.color || '#ffffff';

    colorPicker.addEventListener('input', function() {
        appState.statuses[index].color = this.value;
        saveToLocalStorage(); // Save data after modification
        updateStatusList();
        renderEmployees();
    });

    colorPicker.addEventListener('change', function() {
        document.body.removeChild(colorPicker);
    });

    document.body.appendChild(colorPicker);
    colorPicker.click();
}

// Delete a status
function deleteStatus(index) {
    if (confirm(`Are you sure you want to delete ${appState.statuses[index].name}?`)) {
        appState.statuses.splice(index, 1);
        saveToLocalStorage(); // Save data after modification
        updateStatusList();
        renderEmployees();
    }
}

// Animate a newly added item
function animateNewItem(element) {
    element.classList.add('fade-in');
    setTimeout(() => {
        element.classList.remove('fade-in');
    }, 500);
}

// Show an error message
function showError(input, message) {
    alert(message);
    input.focus();
}

// Wait for the DOM to be fully loaded before initializing
document.addEventListener('DOMContentLoaded', init);

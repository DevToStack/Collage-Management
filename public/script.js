const API_BASE_URL = 'http://localhost:3000/api';

// Fetch data from API
async function fetchData(endpoint) {
    try {
        const response = await fetch(`${API_BASE_URL}${endpoint}`);
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        return await response.json();
    } catch (error) {
        console.error('Error fetching data:', error);
        alert("Failed to fetch data.");
        return [];
    }
}

// Add student to backend
async function addStudent(student) {
    try {
        const response = await fetch(`${API_BASE_URL}/students`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(student)
        });

        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

        alert("Student added successfully.");
        closeAddStudentModal();
        updateDashboardCounts();
        loadStudents(); // refresh student table
    } catch (error) {
        console.error('Error adding student:', error);
        alert("Failed to add student.");
    }
}

// Update dashboard counts
async function updateDashboardCounts() {
    const students = await fetchData('/students');
    const courses = await fetchData('/courses');
    const batches = await fetchData('/batches');

    document.getElementById('studentCount').textContent = students.length;
    document.getElementById('courseCount').textContent = courses.length;
    document.getElementById('batchCount').textContent = batches.length;
}

// Load and display students
async function loadStudents() {
    const students = await fetchData('/students');
    const tableBody = document.querySelector('#studentTable tbody');
    tableBody.innerHTML = '';

    students.forEach(student => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${student.name}</td>
            <td>${student.email}</td>
            <td>${student.batch_id}</td>
        `;
        tableBody.appendChild(row);
    });
}

// Show Add Student Modal
function showAddStudentModal() {
    document.getElementById('addStudentModal').style.display = 'block';
}

// Close Modal
function closeAddStudentModal() {
    document.getElementById('addStudentModal').style.display = 'none';
    document.getElementById('addStudentForm').reset();
}

// Form Submission
document.getElementById('addStudentForm').addEventListener('submit', function (event) {
    event.preventDefault();

    const name = document.getElementById('studentName').value;
    const email = document.getElementById('studentEmail').value;
    const batch_id = document.getElementById('studentBatchId').value;

    const student = { name, email, batch_id };
    addStudent(student);
});

// On Load
document.addEventListener('DOMContentLoaded', function () {
    updateDashboardCounts();
    loadStudents();
});
function nextStep(currentStep) {
  const step = document.getElementById(`step-${currentStep}`);
  const inputs = step.querySelectorAll("input, select");

  for (let input of inputs) {
    if (!input.checkValidity()) {
      input.reportValidity();
      return;
    }
  }

  step.classList.remove('active');
  document.getElementById(`step-${currentStep + 1}`).classList.add('active');
}

function prevStep(currentStep) {
  document.getElementById(`step-${currentStep}`).classList.remove('active');
  document.getElementById(`step-${currentStep - 1}`).classList.add('active');
}

// Handle registration form submit
const multiStepForm = document.getElementById('multiStepForm');
if (multiStepForm) {
  multiStepForm.addEventListener('submit', async function (e) {
    e.preventDefault();
    const formData = new FormData(multiStepForm);
    const data = {};
    formData.forEach((v, k) => (data[k] = v));
    const confirmPassword = document.getElementById('confirmPassword').value;
    if (data.password !== confirmPassword) {
      alert("Passwords do not match!");
      return;
    }

    try {
      const res = await fetch('/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });

      const result = await res.json();
      alert(result.message || "Registered successfully");
    } catch (error) {
      alert("Registration failed.");
    }
  });
}

// Handle login form submit
const loginForm = document.getElementById('loginForm');
if (loginForm) {
  loginForm.addEventListener('submit', async function (e) {
    e.preventDefault();
    const formData = new FormData(loginForm);
    const data = {};
    formData.forEach((v, k) => (data[k] = v));

    try {
      const res = await fetch('/login/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });

      const result = await res.json();
      alert(result.message || "Logged in successfully");
    } catch (error) {
      alert("Login failed.");
    }
  });
}

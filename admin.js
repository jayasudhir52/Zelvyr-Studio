import { db, collection, getDocs, doc, updateDoc } from './firebase-config.js';
import { onSnapshot } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

const loginForm = document.getElementById('admin-login-form');

if (loginForm) {
    loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const user = document.getElementById('adminUsername').value;
        const pass = document.getElementById('adminPassword').value;

        if (user === 'sudhir' && pass === '143580') {
            document.getElementById('admin-login-panel').classList.add('hidden');
            document.getElementById('admin-dashboard-panel').classList.remove('hidden');
            loadProjects();
        } else {
            alert('Invalid credentials!');
        }
    });
}

document.getElementById('logout-btn')?.addEventListener('click', () => {
    document.getElementById('admin-dashboard-panel').classList.add('hidden');
    document.getElementById('admin-login-panel').classList.remove('hidden');
    document.getElementById('adminUsername').value = '';
    document.getElementById('adminPassword').value = '';
});

let unsubscribeAdmin = null;

async function loadProjects() {
    const tbody = document.getElementById('projects-table-body');
    tbody.innerHTML = '<tr><td colspan="6" style="text-align:center;">Loading projects...</td></tr>';
    
    try {
        if (unsubscribeAdmin) unsubscribeAdmin();

        unsubscribeAdmin = onSnapshot(collection(db, "projects"), (querySnapshot) => {
            tbody.innerHTML = '';
            
            if (querySnapshot.empty) {
                tbody.innerHTML = '<tr><td colspan="6" style="text-align:center;">No projects found.</td></tr>';
                return;
            }

            querySnapshot.forEach((documentSnap) => {
                const data = documentSnap.data();
                
                const tr = document.createElement('tr');
                
                tr.innerHTML = `
                    <td>${data.projectId}</td>
                    <td>${data.studentName}</td>
                    <td>${data.projectTitle}</td>
                    <td>
                        <select class="action-select status-select" data-id="${data.projectId}">
                            <option value="Received" ${data.status === 'Received' ? 'selected' : ''}>Received</option>
                            <option value="Under Review" ${data.status === 'Under Review' ? 'selected' : ''}>Under Review</option>
                            <option value="In Development" ${data.status === 'In Development' ? 'selected' : ''}>In Development</option>
                            <option value="Testing" ${data.status === 'Testing' ? 'selected' : ''}>Testing</option>
                            <option value="Completed" ${data.status === 'Completed' ? 'selected' : ''}>Completed</option>
                            <option value="Delivered" ${data.status === 'Delivered' ? 'selected' : ''}>Delivered</option>
                        </select>
                    </td>
                    <td>
                        <input type="number" class="action-select progress-input" style="width: 80px;" data-id="${data.projectId}" value="${data.progress || 0}" min="0" max="100">
                    </td>
                    <td>
                        <button class="update-btn" data-id="${data.projectId}">Update</button>
                    </td>
                `;
                tbody.appendChild(tr);
            });

            // Add event listeners to update buttons
            document.querySelectorAll('.update-btn').forEach(btn => {
                btn.addEventListener('click', async (e) => {
                    const projectId = e.target.getAttribute('data-id');
                    
                    const statusSelect = document.querySelector(`.status-select[data-id="${projectId}"]`);
                    const progressInput = document.querySelector(`.progress-input[data-id="${projectId}"]`);
                    
                    const newStatus = statusSelect.value;
                    const newProgress = parseInt(progressInput.value, 10);
                    
                    e.target.innerText = '...';
                    e.target.disabled = true;

                    try {
                        const projectRef = doc(db, 'projects', projectId);
                        await updateDoc(projectRef, {
                            status: newStatus,
                            progress: newProgress
                        });
                        
                        e.target.innerText = 'Updated!';
                        setTimeout(() => { 
                            if(document.body.contains(e.target)) {
                                e.target.innerText = 'Update'; 
                                e.target.disabled = false; 
                            }
                        }, 2000);
                    } catch (error) {
                        console.error('Error updating:', error);
                        alert('Failed to update. Check console.');
                        if(document.body.contains(e.target)) {
                            e.target.innerText = 'Update';
                            e.target.disabled = false;
                        }
                    }
                });
            });
        }, (error) => {
            console.error("Error loading projects: ", error);
            tbody.innerHTML = '<tr><td colspan="6" style="text-align:center; color: red;">Failed to load projects. Check Firebase config.</td></tr>';
        });
        
    } catch (error) {
        console.error("Error setting up snapshot: ", error);
        tbody.innerHTML = '<tr><td colspan="6" style="text-align:center; color: red;">Failed to setup realtime listener.</td></tr>';
    }
}

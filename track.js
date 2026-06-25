import { db, doc } from './firebase-config.js';
import { getDoc, onSnapshot } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

const trackForm = document.getElementById('track-form');
let currentProjectData = null;
let unsubscribe = null;

if (trackForm) {
    trackForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const trackBtn = document.getElementById('track-btn');
        trackBtn.disabled = true;
        trackBtn.innerText = 'Searching...';

        const projectId = document.getElementById('trackProjectId').value.trim();

        try {
            const projectRef = doc(db, 'projects', projectId);
            
            // First check if it exists so we can show an error if it doesn't
            const projectSnap = await getDoc(projectRef);

            if (!projectSnap.exists()) {
                alert('Project not found. Please check your Project ID.');
                trackBtn.disabled = false;
                trackBtn.innerText = 'Track Status';
                return;
            }
            
            if (unsubscribe) unsubscribe(); // Unsubscribe from previous project if any

            // Listen for realtime updates
            unsubscribe = onSnapshot(projectRef, (docSnap) => {
                if (docSnap.exists()) {
                    currentProjectData = docSnap.data();
                    
                    // Populate Dashboard
                    document.getElementById('disp-id').innerText = currentProjectData.projectId;
                    document.getElementById('disp-title').innerText = currentProjectData.projectTitle;
                    document.getElementById('disp-date').innerText = currentProjectData.estimatedCompletion || "To be decided";
                    
                    document.getElementById('status-badge').innerText = currentProjectData.status;
                    
                    // Update Progress Bar
                    const progressBar = document.getElementById('progress-bar');
                    const progressText = document.getElementById('progress-text');
                    const progress = currentProjectData.progress || 0;
                    
                    setTimeout(() => {
                        progressBar.style.width = `${progress}%`;
                        progressText.innerText = `${progress}%`;
                    }, 300);

                    // Switch Panels if not already switched
                    document.getElementById('login-panel').classList.add('hidden');
                    document.getElementById('dashboard-panel').classList.remove('hidden');
                    
                    trackBtn.disabled = false;
                    trackBtn.innerText = 'Track Status';
                }
            });
            
        } catch (error) {
            console.error('Error fetching project:', error);
            alert('Failed to retrieve project. Please check configuration.');
            trackBtn.disabled = false;
            trackBtn.innerText = 'Track Status';
        }
    });
}

const invoiceBtn = document.getElementById('invoice-btn');
if (invoiceBtn) {
    invoiceBtn.addEventListener('click', () => {
        if (!currentProjectData) return;

        // Populate Invoice Template
        document.getElementById('inv-name').innerText = currentProjectData.studentName;
        document.getElementById('inv-email').innerText = currentProjectData.studentEmail;
        document.getElementById('inv-id').innerText = currentProjectData.projectId;
        document.getElementById('inv-date').innerText = new Date().toLocaleDateString();
        document.getElementById('inv-title').innerText = currentProjectData.projectTitle;
        document.getElementById('inv-status').innerText = currentProjectData.status;

        const template = document.getElementById('invoice-template');
        template.style.display = 'block'; // make it visible for html2pdf

        const opt = {
            margin:       1,
            filename:     `${currentProjectData.projectId}_Invoice.pdf`,
            image:        { type: 'jpeg', quality: 0.98 },
            html2canvas:  { scale: 2 },
            jsPDF:        { unit: 'in', format: 'letter', orientation: 'portrait' }
        };

        html2pdf().set(opt).from(template).save().then(() => {
            template.style.display = 'none'; // hide it back
        });
    });
}

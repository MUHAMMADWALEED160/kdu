/**
 * Kyungdong University Global (KDU Global) - Unified Portal Logic
 * Implements all 10 Modules with Dual-Role Authentication (Student & Admin)
 * 100% Local Database Integration (db.js)
 */

document.addEventListener('DOMContentLoaded', () => {
    // =========================================================================
    // 1. STATE & CORE VARIABLES
    // =========================================================================
    const db = window.kduDB;
    let currentUser = null;
    let activeModule = 'notices'; // Default initial module

    // Top Navigation & Layout DOM Elements
    const portalNavbar = document.getElementById('portalNavbar');
    const portalSidebar = document.getElementById('portalSidebar');
    const portalContent = document.getElementById('portalContent');
    const authView = document.getElementById('authView');
    const dashboardView = document.getElementById('dashboardView');
    const btnToggleSidebar = document.getElementById('btnToggleSidebar');
    const btnLogout = document.getElementById('btnLogout');
    const topCurrentSystemTitle = document.getElementById('topCurrentSystemTitle');

    // User Badge Elements
    const navUserAvatar = document.getElementById('navUserAvatar');
    const navUserName = document.getElementById('navUserName');
    const navUserID = document.getElementById('navUserID');
    const navUserRolePill = document.getElementById('navUserRolePill');

    // Auth Form Elements
    const tabBtnLogin = document.getElementById('tabBtnLogin');
    const tabBtnSignup = document.getElementById('tabBtnSignup');
    const loginForm = document.getElementById('loginForm');
    const signupForm = document.getElementById('signupForm');
    const authAlert = document.getElementById('authAlert');
    const btnQuickStudent = document.getElementById('btnQuickStudent');
    const btnQuickAdmin = document.getElementById('btnQuickAdmin');
    const btnSidebarResetData = document.getElementById('btnSidebarResetData');

    // Modal DOM Elements
    const activeModalBackdrop = document.getElementById('activeModalBackdrop');
    const activeModalContent = document.getElementById('activeModalContent');

    // System Title Map
    const SYSTEM_TITLES = {
        notices: '1. University Information & Lost/Found System',
        events: '2. University Event Management System',
        library: '3. Online Book Store / Library Exchange',
        clubs: '4. Student Club Management System',
        feedback: '5. Student Feedback & Satisfaction System',
        quizzes: '6. Online Quiz & Self-Assessment System',
        assignments: '7. Student Assignment Submission System',
        facilities: '8. Campus Facility Booking System',
        media: '9. Campus Media & Educational Film Hub',
        counseling: '10. Student Counseling Appointment System'
    };

    // =========================================================================
    // 2. TOAST & MODAL UTILITIES
    // =========================================================================
    const showToast = (message, type = 'info') => {
        const toastContainer = document.getElementById('toastContainer');
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        
        let iconSvg = '';
        if (type === 'success') {
            iconSvg = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#059669" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>`;
        } else if (type === 'error') {
            iconSvg = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#DC2626" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>`;
        } else {
            iconSvg = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#0F2C59" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>`;
        }

        toast.innerHTML = `
            <div style="display:flex; align-items:center; gap:0.6rem;">
                ${iconSvg}
                <span>${escapeHtml(message)}</span>
            </div>
            <button style="color:var(--text-light); margin-left:1rem; font-size:1.1rem; line-height:1;" onclick="this.parentElement.remove()">&times;</button>
        `;

        toastContainer.appendChild(toast);
        setTimeout(() => {
            toast.style.opacity = '0';
            setTimeout(() => toast.remove(), 250);
        }, 3500);
    };

    const openModal = (title, bodyHtml, footerHtml = '') => {
        activeModalContent.innerHTML = `
            <div class="modal-header">
                <h3>${title}</h3>
                <button type="button" class="btn-close-modal" id="btnGenericModalClose" style="font-size:1.4rem; color:var(--text-muted);">&times;</button>
            </div>
            <div class="modal-body">
                ${bodyHtml}
            </div>
            ${footerHtml ? `<div class="modal-footer">${footerHtml}</div>` : ''}
        `;

        activeModalBackdrop.classList.remove('hidden');

        document.getElementById('btnGenericModalClose').addEventListener('click', closeModal);
    };

    let quizTimer = null; // countdown interval of the quiz that is open (Module 6)

    const closeModal = () => {
        clearInterval(quizTimer);
        quizTimer = null;
        activeModalBackdrop.classList.add('hidden');
        activeModalContent.innerHTML = '';
    };

    // Inline onclick="closeModal()" / "showToast(...)" in modal buttons look for GLOBAL functions,
    // so expose them on window (without this, every Cancel button threw a ReferenceError).
    window.closeModal = closeModal;
    window.showToast = showToast;

    activeModalBackdrop.addEventListener('click', (e) => {
        if (e.target === activeModalBackdrop) closeModal();
    });

    const escapeHtml = (str) => {
        if (!str) return '';
        return String(str)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');
    };

    const formatDate = (dateStr) => {
        if (!dateStr) return '';
        const d = new Date(dateStr);
        return d.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
    };

    // =========================================================================
    // 3. AUTHENTICATION & SESSION HANDLING
    // =========================================================================
    const showAuthAlert = (msg, type = 'danger') => {
        authAlert.className = `alert alert-${type}`;
        authAlert.innerHTML = `<div>${escapeHtml(msg)}</div>`;
        authAlert.classList.remove('hidden');
    };

    const clearAuthAlert = () => {
        authAlert.classList.add('hidden');
        authAlert.innerHTML = '';
    };

    // Tab switching in Auth
    tabBtnLogin.addEventListener('click', () => {
        clearAuthAlert();
        tabBtnLogin.classList.add('active');
        tabBtnSignup.classList.remove('active');
        loginForm.classList.remove('hidden');
        signupForm.classList.add('hidden');
    });

    tabBtnSignup.addEventListener('click', () => {
        clearAuthAlert();
        tabBtnSignup.classList.add('active');
        tabBtnLogin.classList.remove('active');
        signupForm.classList.remove('hidden');
        loginForm.classList.add('hidden');
    });

    // 1-Click Quick Demo Login (Dual Role)
    btnQuickStudent.addEventListener('click', () => {
        document.getElementById('loginEmail').value = 'student@kduniv.ac.kr';
        document.getElementById('loginPassword').value = 'password123';
        loginForm.dispatchEvent(new Event('submit'));
    });

    btnQuickAdmin.addEventListener('click', () => {
        document.getElementById('loginEmail').value = 'admin@kduniv.ac.kr';
        document.getElementById('loginPassword').value = 'admin123';
        loginForm.dispatchEvent(new Event('submit'));
    });

    // Handle Login Submit
    loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        clearAuthAlert();

        const email = document.getElementById('loginEmail').value.trim();
        const password = document.getElementById('loginPassword').value;

        try {
            const user = db.signIn({ email, password });
            showToast(`Welcome to KDU Global, ${user.full_name}!`, 'success');
            renderAuthenticatedState(user);
        } catch (error) {
            showAuthAlert(error.message, 'danger');
        }
    });

    // Handle Signup Submit (Dual Role)
    signupForm.addEventListener('submit', (e) => {
        e.preventDefault();
        clearAuthAlert();

        const fullName = document.getElementById('signupFullName').value.trim();
        const studentId = document.getElementById('signupIDNumber').value.trim();
        const semester = document.getElementById('signupSemester').value;
        const department = document.getElementById('signupDepartment').value;
        const email = document.getElementById('signupEmail').value.trim();
        const password = document.getElementById('signupPassword').value;

        try {
            const newUser = db.signUp({
                email,
                password,
                full_name: fullName,
                student_id: studentId,
                department,
                semester
            });

            showToast('Student account registered successfully!', 'success');
            signupForm.reset();
            renderAuthenticatedState(newUser);
        } catch (error) {
            showAuthAlert(error.message, 'danger');
        }
    });

    // Logout
    btnLogout.addEventListener('click', () => {
        db.signOut();
        currentUser = null;
        dashboardView.classList.add('hidden');
        portalNavbar.classList.add('hidden');
        authView.classList.remove('hidden');
        showToast('Signed out safely.', 'info');
    });

    // Reset Database
    btnSidebarResetData.addEventListener('click', () => {
        if (confirm('Reset all 10 modules back to factory KDU Global demo data?')) {
            db.resetToFactoryDefaults();
            window.location.reload();
        }
    });

    // Render Authenticated State
    const renderAuthenticatedState = (user) => {
        currentUser = user;
        authView.classList.add('hidden');
        portalNavbar.classList.remove('hidden');
        dashboardView.classList.remove('hidden');

        // Update Identity in Navbar
        const initials = user.full_name ? user.full_name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() : 'KD';
        navUserAvatar.textContent = initials;
        navUserName.textContent = user.full_name;
        navUserID.textContent = user.role === 'admin'
            ? `Staff: ${user.student_id}`
            : `ID: ${user.student_id} · ${user.semester}`;

        navUserRolePill.className = `role-pill ${user.role}`;
        navUserRolePill.textContent = user.role === 'admin' ? 'FACULTY / ADMIN' : 'STUDENT';

        // Load active module
        switchModule(activeModule);
    };

    // Sidebar Collapsing
    // Desktop: the sidebar shrinks to icons. Phone: it slides in over the page.
    const isMobile = () => window.matchMedia('(max-width: 768px)').matches;
    btnToggleSidebar.addEventListener('click', () => {
        portalSidebar.classList.toggle(isMobile() ? 'open' : 'collapsed');
    });

    // Sidebar Nav Item Click
    document.querySelectorAll('.sidebar-nav-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            switchModule(btn.dataset.module);
            portalSidebar.classList.remove('open'); // close the slide-in menu on phones
        });
    });

    const switchModule = (modName) => {
        activeModule = modName;
        topCurrentSystemTitle.textContent = SYSTEM_TITLES[modName] || 'KDU Global Student Portal';

        document.querySelectorAll('.sidebar-nav-btn').forEach(b => {
            b.classList.toggle('active', b.dataset.module === modName);
        });

        // Route to module renderer
        switch (modName) {
            case 'notices': renderNoticesModule(); break;
            case 'events': renderEventsModule(); break;
            case 'library': renderLibraryModule(); break;
            case 'clubs': renderClubsModule(); break;
            case 'feedback': renderFeedbackModule(); break;
            case 'quizzes': renderQuizzesModule(); break;
            case 'assignments': renderAssignmentsModule(); break;
            case 'facilities': renderFacilitiesModule(); break;
            case 'media': renderMediaModule(); break;
            case 'counseling': renderCounselingModule(); break;
            default: renderNoticesModule();
        }
    };

    // Admin helper box banner
    // Yellow banner shown to admins at the top of every module, e.g. "Admin: Notice Administration"
    const getAdminControlHeader = (title) => {
        if (!currentUser || currentUser.role !== 'admin') return '';
        return `
            <div class="admin-control-box">
                <div>
                    <strong>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
                        Admin: ${escapeHtml(title)}
                    </strong>
                    <span>You have administrative privileges to create, approve, grade, and remove records in this system.</span>
                </div>
            </div>
        `;
    };

    // "No records" row for empty tables.
    // (Date helpers localDateStr() and daysFromToday() come from db.js, which loads first.)
    const emptyTableRow = (colspan, text) =>
        `<tr><td colspan="${colspan}" class="table-empty">${text}</td></tr>`;

    // =========================================================================
    // MODULE 1: UNIVERSITY INFORMATION & LOST/FOUND SYSTEM
    // =========================================================================
    // Notice filters (kept between re-renders)
    let currentNoticeFilter = 'All';    // category filter
    let currentPriorityFilter = 'All';  // priority filter: Normal / Important / Urgent
    let noticeSearchTerm = '';
    let infoSubtab = 'notices'; // 'notices' | 'lost_found'

    const NOTICE_CATEGORIES = ['Academic', 'Scholarship', 'Campus Life', 'Global Affairs'];
    const NOTICE_PRIORITIES = ['Normal', 'Important', 'Urgent'];

    // Apply category + priority + search filters to the notices list
    const getFilteredNotices = (notices) => {
        let result = notices;
        if (currentNoticeFilter !== 'All') {
            result = result.filter(n => n.category === currentNoticeFilter);
        }
        if (currentPriorityFilter !== 'All') {
            result = result.filter(n => n.priority === currentPriorityFilter);
        }
        if (noticeSearchTerm) {
            const term = noticeSearchTerm.toLowerCase();
            result = result.filter(n =>
                n.title.toLowerCase().includes(term) || n.content.toLowerCase().includes(term)
            );
        }
        return result;
    };

    // Lost & Found filters
    let lfSearchTerm = '';
    let lfStatusFilter = 'All'; // All / Lost / Found / Claimed

    const getFilteredLostFound = (items) => {
        let result = items;
        if (lfStatusFilter !== 'All') {
            result = result.filter(i => i.status === lfStatusFilter);
        }
        if (lfSearchTerm) {
            const term = lfSearchTerm.toLowerCase();
            result = result.filter(i =>
                i.title.toLowerCase().includes(term) ||
                i.location.toLowerCase().includes(term) ||
                (i.description || '').toLowerCase().includes(term)
            );
        }
        return result;
    };

    // Same idea as updateNoticesList: only the cards are redrawn, so the search box keeps focus
    const updateLostFoundList = () => {
        const isAdmin = currentUser && currentUser.role === 'admin';
        const items = db.getLostFound();
        const filtered = getFilteredLostFound(items);
        document.getElementById('infoSubtabContent').innerHTML = renderLostFoundList(filtered, isAdmin);
        document.getElementById('lfResultCount').textContent = `Showing ${filtered.length} of ${items.length} items`;
    };

    const hasActiveNoticeFilters = () =>
        currentNoticeFilter !== 'All' || currentPriorityFilter !== 'All' || noticeSearchTerm !== '';

    // Re-draws ONLY the notice cards + result count, NOT the search box.
    // This is why the cursor stays in the search box while typing.
    const updateNoticesList = () => {
        const isAdmin = currentUser && currentUser.role === 'admin';
        const notices = db.getNotices();
        const filtered = getFilteredNotices(notices);

        document.getElementById('infoSubtabContent').innerHTML = renderNoticesList(filtered, isAdmin);
        document.getElementById('noticeResultCount').textContent =
            `Showing ${filtered.length} of ${notices.length} notices`;
        document.getElementById('btnResetNoticeFilters').classList.toggle('hidden', !hasActiveNoticeFilters());
    };

    const renderNoticesModule = () => {
        const isAdmin = currentUser && currentUser.role === 'admin';
        const notices = db.getNotices();
        const lostItems = db.getLostFound();
        const filteredNotices = getFilteredNotices(notices);

        // Categories: the standard list plus any other category found in the data
        const categories = [...new Set([...NOTICE_CATEGORIES, ...notices.map(n => n.category)])];

        portalContent.innerHTML = `
            <div class="module-header">
                <div class="module-title-group">
                    <h2>
                        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path><path d="M13.73 21a2 2 0 0 1-3.46 0"></path></svg>
                        University Information & Notices
                    </h2>
                    <p>Official academic directives, scholarships, campus advisories, and student lost & found desk.</p>
                </div>
                <div class="module-actions">
                    <button class="btn-secondary" id="btnReportLostFound">+ Report Lost/Found Item</button>
                    ${isAdmin ? `<button class="btn-primary" id="btnPostNotice">+ Post Official Notice</button>` : ''}
                </div>
            </div>

            ${getAdminControlHeader('Notice Administration')}

            <!-- Sub Navigation Tabs -->
            <div class="filter-bar">
                <div class="filter-tabs">
                    <button class="filter-tab-btn ${infoSubtab === 'notices' ? 'active' : ''}" id="tabInfoNotices">
                        Campus Announcements (${notices.length})
                    </button>
                    <button class="filter-tab-btn ${infoSubtab === 'lost_found' ? 'active' : ''}" id="tabInfoLostFound">
                        Lost & Found Board (${lostItems.length})
                    </button>
                </div>
            </div>

            ${infoSubtab === 'notices' ? `
                <!-- Notice search + filters -->
                <div class="notice-filter-bar">
                    <div class="search-input-wrap">
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
                        <input type="text" id="inputNoticeSearch" class="form-control" placeholder="Search notices..." value="${escapeHtml(noticeSearchTerm)}">
                    </div>
                    <select id="selectNoticeCategory" class="form-control filter-select" aria-label="Filter by category">
                        <option value="All">All categories</option>
                        ${categories.map(c => `<option value="${escapeHtml(c)}" ${c === currentNoticeFilter ? 'selected' : ''}>${escapeHtml(c)}</option>`).join('')}
                    </select>
                    <select id="selectNoticePriority" class="form-control filter-select" aria-label="Filter by priority">
                        <option value="All">All priorities</option>
                        ${NOTICE_PRIORITIES.map(p => `<option value="${p}" ${p === currentPriorityFilter ? 'selected' : ''}>${p}</option>`).join('')}
                    </select>
                    <button type="button" id="btnResetNoticeFilters" class="btn-secondary ${hasActiveNoticeFilters() ? '' : 'hidden'}">Reset</button>
                    <span id="noticeResultCount" class="notice-result-count">Showing ${filteredNotices.length} of ${notices.length} notices</span>
                </div>
            ` : `
                <!-- Lost & Found search + status filter -->
                <div class="notice-filter-bar">
                    <div class="search-input-wrap">
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
                        <input type="text" id="inputLfSearch" class="form-control" placeholder="Search item, location..." value="${escapeHtml(lfSearchTerm)}">
                    </div>
                    <select id="selectLfStatus" class="form-control filter-select" aria-label="Filter by status">
                        ${['All', 'Lost', 'Found', 'Claimed'].map(st => `<option value="${st}" ${st === lfStatusFilter ? 'selected' : ''}>${st === 'All' ? 'All statuses' : st}</option>`).join('')}
                    </select>
                    <span id="lfResultCount" class="notice-result-count">Showing ${getFilteredLostFound(lostItems).length} of ${lostItems.length} items</span>
                </div>
            `}

            <div id="infoSubtabContent">
                ${infoSubtab === 'notices' ? renderNoticesList(filteredNotices, isAdmin) : renderLostFoundList(getFilteredLostFound(lostItems), isAdmin)}
            </div>
        `;

        // Event Bindings
        document.getElementById('tabInfoNotices').addEventListener('click', () => {
            infoSubtab = 'notices';
            renderNoticesModule();
        });
        document.getElementById('tabInfoLostFound').addEventListener('click', () => {
            infoSubtab = 'lost_found';
            renderNoticesModule();
        });

        if (infoSubtab === 'notices') {
            // Typing only refreshes the list (updateNoticesList), so the input keeps focus
            document.getElementById('inputNoticeSearch').addEventListener('input', (e) => {
                noticeSearchTerm = e.target.value.trim();
                updateNoticesList();
            });
            document.getElementById('selectNoticeCategory').addEventListener('change', (e) => {
                currentNoticeFilter = e.target.value;
                updateNoticesList();
            });
            document.getElementById('selectNoticePriority').addEventListener('change', (e) => {
                currentPriorityFilter = e.target.value;
                updateNoticesList();
            });
            document.getElementById('btnResetNoticeFilters').addEventListener('click', () => {
                currentNoticeFilter = 'All';
                currentPriorityFilter = 'All';
                noticeSearchTerm = '';
                renderNoticesModule();
            });
        } else {
            document.getElementById('inputLfSearch').addEventListener('input', (e) => {
                lfSearchTerm = e.target.value.trim();
                updateLostFoundList();
            });
            document.getElementById('selectLfStatus').addEventListener('change', (e) => {
                lfStatusFilter = e.target.value;
                updateLostFoundList();
            });
        }

        if (isAdmin && document.getElementById('btnPostNotice')) {
            document.getElementById('btnPostNotice').addEventListener('click', openPostNoticeModal);
        }

        document.getElementById('btnReportLostFound').addEventListener('click', openReportLostFoundModal);
    };

    const renderNoticesList = (items, isAdmin) => {
        if (!items || items.length === 0) {
            return `<div class="card empty-card">${hasActiveNoticeFilters() ? 'No notices match these filters. Try Reset.' : 'There are no campus notices yet.'}</div>`;
        }

        return `
            <div class="card-grid">
                ${items.map(n => {
                    const badgeClass = n.priority === 'Urgent' ? 'badge-urgent' : (n.priority === 'Important' ? 'badge-important' : 'badge-academic');
                    return `
                        <div class="card">
                            <div class="card-top">
                                <span class="badge ${badgeClass}">${escapeHtml(n.category)} &bull; ${escapeHtml(n.priority)}</span>
                                <span style="font-size:0.75rem; color:var(--text-light);">${formatDate(n.created_at)}</span>
                            </div>
                            <h3 class="card-title">${escapeHtml(n.title)}</h3>
                            <p class="card-desc">${escapeHtml(n.content)}</p>
                            ${isAdmin ? `
                                <div class="card-footer">
                                    <span style="font-size:0.75rem; color:var(--text-light);">Admin Action</span>
                                    <button class="btn-danger-outline" onclick="window.handleDeleteNotice('${n.id}')">Delete Notice</button>
                                </div>
                            ` : ''}
                        </div>
                    `;
                }).join('')}
            </div>
        `;
    };

    const renderLostFoundList = (items, isAdmin) => {
        if (!items || items.length === 0) {
            return `<div class="card empty-card">No lost or found items match.</div>`;
        }

        return `
            <div class="card-grid">
                ${items.map(item => {
                    const isLost = item.type === 'Lost';
                    const isClaimed = item.status === 'Claimed';
                    const isOwner = item.posted_by === currentUser.id;
                    const badgeClass = isClaimed ? 'badge-success' : (isLost ? 'badge-danger' : 'badge-scholarship');

                    return `
                        <div class="card">
                            <div class="card-top">
                                <span class="badge ${badgeClass}">Status: ${escapeHtml(item.status)}</span>
                                <span style="font-size:0.75rem; color:var(--text-light);">${item.date}</span>
                            </div>
                            <h3 class="card-title">${escapeHtml(item.title)}</h3>
                            <p class="card-desc">${escapeHtml(item.description)}</p>
                            <div class="card-meta-list">
                                <div class="card-meta-item">
                                    <strong>Location:</strong> <span>${escapeHtml(item.location)}</span>
                                </div>
                                <div class="card-meta-item">
                                    <strong>Contact:</strong> <span>${escapeHtml(item.contact)}</span>
                                </div>
                            </div>
                            ${isAdmin ? `
                                <div class="card-footer">
                                    <button class="btn-secondary" style="font-size:0.75rem; padding:0.3rem 0.6rem;" onclick="window.handleToggleClaimed('${item.id}', '${item.status}')">
                                        Mark ${isClaimed ? 'Unclaimed' : 'Claimed'}
                                    </button>
                                    <button class="btn-danger-outline" onclick="window.handleDeleteLostFound('${item.id}')">Delete</button>
                                </div>
                            ` : (isOwner ? `
                                <div class="card-footer">
                                    <span class="text-small-light">Your report</span>
                                    <button class="btn-danger-outline" onclick="window.handleDeleteLostFound('${item.id}')">Delete</button>
                                </div>
                            ` : '')}
                        </div>
                    `;
                }).join('')}
            </div>
        `;
    };

    // Notice Modals
    const openPostNoticeModal = () => {
        const body = `
            <form>
                <div class="form-group">
                    <label>Notice Title <span class="required">*</span></label>
                    <input type="text" id="noticeTitle" class="form-control" placeholder="e.g. 2026 Spring Convocation Details" required>
                </div>
                <div class="form-row">
                    <div class="form-group">
                        <label>Category <span class="required">*</span></label>
                        <select id="noticeCategory" class="form-control">
                            <option value="Academic">Academic</option>
                            <option value="Scholarship">Scholarship</option>
                            <option value="Campus Life">Campus Life</option>
                            <option value="Global Affairs">Global Affairs</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label>Priority Level</label>
                        <select id="noticePriority" class="form-control">
                            <option value="Normal">Normal</option>
                            <option value="Important">Important</option>
                            <option value="Urgent">Urgent</option>
                        </select>
                    </div>
                </div>
                <div class="form-group">
                    <label>Detailed Announcement Text <span class="required">*</span></label>
                    <textarea id="noticeContent" class="form-control" rows="4" placeholder="Write full notice..." required></textarea>
                </div>
            </form>
        `;
        const footer = `
            <button class="btn-secondary" onclick="closeModal()">Cancel</button>
            <button class="btn-primary" id="btnSubmitNotice">Post Notice</button>
        `;
        openModal('Publish Official Notice', body, footer);

        document.getElementById('btnSubmitNotice').addEventListener('click', () => {
            const title = document.getElementById('noticeTitle').value.trim();
            const category = document.getElementById('noticeCategory').value;
            const priority = document.getElementById('noticePriority').value;
            const content = document.getElementById('noticeContent').value.trim();

            if (!title || !content) {
                showToast('Title and content are required.', 'error');
                return;
            }

            db.createNotice({ title, category, priority, content });
            closeModal();
            showToast('Campus notice published successfully.', 'success');
            renderNoticesModule();
        });
    };

    const openReportLostFoundModal = () => {
        const body = `
            <form>
                <div class="form-row">
                    <div class="form-group">
                        <label>Report Type <span class="required">*</span></label>
                        <select id="lfType" class="form-control">
                            <option value="Lost">I Lost Something</option>
                            <option value="Found">I Found An Item</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label>Item Name <span class="required">*</span></label>
                        <input type="text" id="lfTitle" class="form-control" placeholder="e.g. Navy Blue Umbrella" required>
                    </div>
                </div>
                <div class="form-group">
                    <label>Campus Location Found / Lost <span class="required">*</span></label>
                    <input type="text" id="lfLocation" class="form-control" placeholder="e.g. Global Building A 2nd Floor Hallway" required>
                </div>
                <div class="form-group">
                    <label>Contact Email / Phone <span class="required">*</span></label>
                    <input type="text" id="lfContact" class="form-control" value="${currentUser ? currentUser.email : ''}" required>
                </div>
                <div class="form-group">
                    <label>Description & Identification Marks</label>
                    <textarea id="lfDesc" class="form-control" rows="3" placeholder="Provide details to verify ownership..."></textarea>
                </div>
            </form>
        `;
        const footer = `
            <button class="btn-secondary" onclick="closeModal()">Cancel</button>
            <button class="btn-primary" id="btnSubmitLF">Submit Report</button>
        `;
        openModal('Report Item to Campus Lost & Found', body, footer);

        document.getElementById('btnSubmitLF').addEventListener('click', () => {
            const type = document.getElementById('lfType').value;
            const title = document.getElementById('lfTitle').value.trim();
            const location = document.getElementById('lfLocation').value.trim();
            const contact = document.getElementById('lfContact').value.trim();
            const description = document.getElementById('lfDesc').value.trim();

            if (!title || !location || !contact) {
                showToast('Please fill all required fields.', 'error');
                return;
            }

            db.createLostFound({ title, location, type, contact, description, postedBy: currentUser.id });
            closeModal();
            showToast('Item reported to Lost & Found desk.', 'success');
            renderNoticesModule();
        });
    };

    window.handleDeleteNotice = (id) => {
        if (confirm('Delete this notice permanently?')) {
            db.deleteNotice(id);
            showToast('Notice deleted.', 'info');
            renderNoticesModule();
        }
    };

    window.handleToggleClaimed = (id, currentStatus) => {
        const newStatus = currentStatus === 'Claimed' ? 'Found' : 'Claimed';
        db.updateLostFoundStatus(id, newStatus);
        renderNoticesModule();
    };

    window.handleDeleteLostFound = (id) => {
        // Only an admin or the person who posted it may delete a report
        const item = db.getLostFound().find(i => i.id === id);
        const isAdmin = currentUser.role === 'admin';
        if (!item || (!isAdmin && item.posted_by !== currentUser.id)) {
            showToast('You can only delete your own reports.', 'error');
            return;
        }
        if (confirm('Delete this lost/found listing?')) {
            db.deleteLostFound(id);
            renderNoticesModule();
        }
    };

    // =========================================================================
    // MODULE 2: UNIVERSITY EVENT MANAGEMENT SYSTEM
    // =========================================================================
    const renderEventsModule = () => {
        const isAdmin = currentUser && currentUser.role === 'admin';
        const events = db.getEvents();

        portalContent.innerHTML = `
            <div class="module-header">
                <div class="module-title-group">
                    <h2>
                        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
                        University Event Management System
                    </h2>
                    <p>Register for official academic symposiums, international festivals, and student hackathons.</p>
                </div>
                <div class="module-actions">
                    ${isAdmin ? `<button class="btn-primary" id="btnCreateEvent">+ Create Campus Event</button>` : ''}
                </div>
            </div>

            ${getAdminControlHeader('Campus Event Administration')}

            <div class="card-grid">
                ${events.map(evt => {
                    const isRegistered = evt.participants.some(p => p.user_id === currentUser.id);
                    const isFull = evt.registered_count >= evt.capacity;
                    const percentFilled = Math.min(100, Math.round((evt.registered_count / evt.capacity) * 100));

                    return `
                        <div class="card">
                            <div class="card-top">
                                <span class="badge badge-academic">${escapeHtml(evt.organizer)}</span>
                                <span style="font-size:0.75rem; font-weight:600; color:var(--primary);">${evt.date}</span>
                            </div>
                            <h3 class="card-title">${escapeHtml(evt.title)}</h3>
                            <p class="card-desc">${escapeHtml(evt.description)}</p>
                            <div class="card-meta-list">
                                <div class="card-meta-item">
                                    <strong>Venue:</strong> <span>${escapeHtml(evt.venue)}</span>
                                </div>
                                <div class="card-meta-item">
                                    <strong>Capacity:</strong> 
                                    <span>${evt.registered_count} / ${evt.capacity} seats filled (${percentFilled}%)</span>
                                </div>
                                <div style="width:100%; height:6px; background:#E2E8F0; border-radius:3px; overflow:hidden; margin-top:2px;">
                                    <div style="width:${percentFilled}%; height:100%; background:${isFull ? '#DC2626' : 'var(--primary)'};"></div>
                                </div>
                            </div>
                            <div class="card-footer">
                                ${isAdmin ? `
                                    <div style="display:flex; gap:0.4rem;">
                                        <button class="btn-secondary" style="font-size:0.75rem;" onclick="window.viewEventAttendees('${evt.id}')">Attendees (${evt.registered_count})</button>
                                        <button class="btn-danger-outline" onclick="window.handleDeleteEvent('${evt.id}')">Delete</button>
                                    </div>
                                ` : `
                                    ${isRegistered ? `
                                        <button class="btn-secondary" style="color:var(--status-danger);" onclick="window.cancelEventReg('${evt.id}')">Cancel Registration</button>
                                        <span class="badge badge-success">Registered ✓</span>
                                    ` : `
                                        <button class="btn-primary" ${isFull ? 'disabled' : ''} onclick="window.registerEvent('${evt.id}')">
                                            ${isFull ? 'Event Full' : 'One-Click Register'}
                                        </button>
                                    `}
                                `}
                            </div>
                        </div>
                    `;
                }).join('')}
            </div>
        `;

        if (isAdmin && document.getElementById('btnCreateEvent')) {
            document.getElementById('btnCreateEvent').addEventListener('click', openCreateEventModal);
        }
    };

    const openCreateEventModal = () => {
        const body = `
            <form>
                <div class="form-group">
                    <label>Event Title <span class="required">*</span></label>
                    <input type="text" id="evtTitle" class="form-control" placeholder="e.g. AI Innovation Showcase" required>
                </div>
                <div class="form-row">
                    <div class="form-group">
                        <label>Date & Time <span class="required">*</span></label>
                        <input type="text" id="evtDate" class="form-control" placeholder="2026-12-15 15:00" required>
                    </div>
                    <div class="form-group">
                        <label>Maximum Capacity <span class="required">*</span></label>
                        <input type="number" id="evtCapacity" class="form-control" value="60" min="5" required>
                    </div>
                </div>
                <div class="form-row">
                    <div class="form-group">
                        <label>Campus Venue <span class="required">*</span></label>
                        <input type="text" id="evtVenue" class="form-control" placeholder="Global Auditorium" required>
                    </div>
                    <div class="form-group">
                        <label>Organizer Unit <span class="required">*</span></label>
                        <input type="text" id="evtOrganizer" class="form-control" placeholder="Faculty of Computing" required>
                    </div>
                </div>
                <div class="form-group">
                    <label>Event Synopsis & Objectives <span class="required">*</span></label>
                    <textarea id="evtDesc" class="form-control" rows="3" placeholder="Describe event details..." required></textarea>
                </div>
            </form>
        `;
        const footer = `
            <button class="btn-secondary" onclick="closeModal()">Cancel</button>
            <button class="btn-primary" id="btnSubmitCreateEvent">Publish Event</button>
        `;
        openModal('Create New Campus Event', body, footer);

        document.getElementById('btnSubmitCreateEvent').addEventListener('click', () => {
            const title = document.getElementById('evtTitle').value.trim();
            const date = document.getElementById('evtDate').value.trim();
            const capacity = document.getElementById('evtCapacity').value;
            const venue = document.getElementById('evtVenue').value.trim();
            const organizer = document.getElementById('evtOrganizer').value.trim();
            const description = document.getElementById('evtDesc').value.trim();

            if (!title || !date || !venue || !organizer) {
                showToast('Please fill all required event information.', 'error');
                return;
            }

            db.createEvent({ title, date, venue, organizer, capacity, description });
            closeModal();
            showToast('Event created successfully.', 'success');
            renderEventsModule();
        });
    };

    window.registerEvent = (id) => {
        try {
            db.registerForEvent(id, currentUser);
            showToast('Registration confirmed for event!', 'success');
            renderEventsModule();
        } catch (error) {
            showToast(error.message, 'error');
        }
    };

    window.cancelEventReg = (id) => {
        db.cancelEventRegistration(id, currentUser.id);
        showToast('Registration cancelled.', 'info');
        renderEventsModule();
    };

    window.viewEventAttendees = (id) => {
        const events = db.getEvents();
        const evt = events.find(e => e.id === id);
        if (!evt) return;

        const body = `
            <h4>Attendees for: ${escapeHtml(evt.title)}</h4>
            <p style="font-size:0.8rem; color:var(--text-muted); margin-bottom:1rem;">Registered: ${evt.registered_count} / ${evt.capacity} students</p>
            <div class="table-responsive">
                <table class="data-table">
                    <thead>
                        <tr>
                            <th>Student Name</th>
                            <th>Student ID</th>
                            <th>Timestamp</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${evt.participants.length ? evt.participants.map(p => `
                            <tr>
                                <td><strong>${escapeHtml(p.student_name)}</strong></td>
                                <td>${escapeHtml(p.student_id)}</td>
                                <td>${formatDate(p.registered_at)}</td>
                            </tr>
                        `).join('') : emptyTableRow(3, 'No registered students yet.')}
                    </tbody>
                </table>
            </div>
        `;
        openModal('Event Participant Roster', body, `<button class="btn-primary" onclick="closeModal()">Done</button>`);
    };

    window.handleDeleteEvent = (id) => {
        if (confirm('Delete this event listing and cancel all registrations?')) {
            db.deleteEvent(id);
            renderEventsModule();
        }
    };

    // =========================================================================
    // MODULE 3: ONLINE BOOK STORE / LIBRARY EXCHANGE
    // =========================================================================
    let bookSearchTerm = '';

    const getFilteredBooks = (books) => {
        if (!bookSearchTerm) return books;
        const term = bookSearchTerm.toLowerCase();
        return books.filter(b =>
            b.title.toLowerCase().includes(term) ||
            b.author.toLowerCase().includes(term) ||
            b.course_code.toLowerCase().includes(term)
        );
    };

    const bookCountText = (list) => {
        const available = list.filter(b => b.status === 'Available').length;
        return `Showing ${list.length} textbooks (${available} available)`;
    };

    const renderBookCards = (items, isAdmin) => {
        if (!items.length) return `<div class="card empty-card">No textbooks match your search.</div>`;
        return items.map(bk => {
                    const isAvailable = bk.status === 'Available';
                    const isBorrowedByMe = bk.borrowed_by === currentUser.id;

                    return `
                        <div class="card">
                            <div class="card-top">
                                <span class="badge ${isAvailable ? 'badge-success' : 'badge-danger'}">${bk.status}</span>
                                <span style="font-size:0.75rem; font-weight:700; color:var(--primary);">${escapeHtml(bk.course_code)}</span>
                            </div>
                            <h3 class="card-title">${escapeHtml(bk.title)}</h3>
                            <p style="font-size:0.8rem; color:var(--text-muted); margin-bottom:0.75rem;">By <strong>${escapeHtml(bk.author)}</strong></p>
                            <div class="card-meta-list">
                                <div class="card-meta-item">
                                    <strong>Category:</strong> <span>${escapeHtml(bk.category)}</span>
                                </div>
                                <div class="card-meta-item">
                                    <strong>ISBN:</strong> <span style="font-family:monospace; font-size:0.75rem;">${escapeHtml(bk.isbn)}</span>
                                </div>
                                ${!isAvailable && bk.due_date ? `
                                    <div class="card-meta-item" style="color:var(--status-danger);">
                                        <strong>Due Date:</strong> <span>${bk.due_date}</span>
                                    </div>
                                ` : ''}
                            </div>
                            <div class="card-footer">
                                ${isAdmin ? `
                                    <div style="display:flex; justify-content:space-between; width:100%;">
                                        ${!isAvailable ? `<button class="btn-secondary" style="font-size:0.75rem;" onclick="window.handleReturnBook('${bk.id}')">Mark Returned</button>` : '<span></span>'}
                                        <button class="btn-danger-outline" onclick="window.handleDeleteBook('${bk.id}')">Remove Book</button>
                                    </div>
                                ` : `
                                    ${isAvailable ? `
                                        <button class="btn-primary" onclick="window.handleBorrowBook('${bk.id}')">Borrow (14 Days)</button>
                                    ` : (isBorrowedByMe ? `
                                        <button class="btn-secondary" style="color:var(--status-success);" onclick="window.handleReturnBook('${bk.id}')">Return Book</button>
                                    ` : `<span style="font-size:0.8rem; color:var(--text-light);">Borrowed by other student</span>`)}
                                `}
                            </div>
                        </div>
                    `;
                }).join('');
    };

    const renderLibraryModule = () => {
        const isAdmin = currentUser && currentUser.role === 'admin';
        const books = db.getBooks();
        const borrows = db.getBorrowHistory(isAdmin ? null : currentUser.id);
        const filteredBooks = getFilteredBooks(books);

        portalContent.innerHTML = `
            <div class="module-header">
                <div class="module-title-group">
                    <h2>
                        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path></svg>
                        Online Book Store / Library Exchange
                    </h2>
                    <p>Search academic course textbooks, borrow titles for study, and return items on time.</p>
                </div>
                <div class="module-actions">
                    ${isAdmin ? `<button class="btn-primary" id="btnAddBook">+ Add Book to Catalog</button>` : ''}
                </div>
            </div>

            ${getAdminControlHeader('Library Inventory & Circulation Control')}

            <div class="filter-bar">
                <div class="search-input-wrap search-wide">
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
                    <input type="text" id="inputBookSearch" class="form-control" placeholder="Search by title, author, or course code..." value="${escapeHtml(bookSearchTerm)}">
                </div>
                <div id="bookResultCount" class="notice-result-count">${bookCountText(filteredBooks)}</div>
            </div>

            <div class="card-grid" id="bookGrid">
                ${renderBookCards(filteredBooks, isAdmin)}
            </div>

            <!-- Borrowing History Table -->
            <div class="section-block">
                <h3 class="section-heading">
                    ${isAdmin ? 'All University Borrowing Transactions' : 'My Library Borrowing History'}
                </h3>
                <div class="table-responsive">
                    <table class="data-table">
                        <thead>
                            <tr>
                                <th>Book Title</th>
                                ${isAdmin ? '<th>Student Name</th>' : ''}
                                <th>Borrowed On</th>
                                <th>Due Date</th>
                                <th>Status</th>
                                <th>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${borrows.length ? borrows.map(b => `
                                <tr>
                                    <td><strong>${escapeHtml(b.book_title)}</strong></td>
                                    ${isAdmin ? `<td>${escapeHtml(b.student_name)}</td>` : ''}
                                    <td>${formatDate(b.borrowed_at)}</td>
                                    <td>${b.due_date}</td>
                                    <td><span class="badge ${b.status === 'Active' ? 'badge-urgent' : 'badge-success'}">${b.status}</span></td>
                                    <td>
                                        ${b.status === 'Active' ? `
                                            <button class="btn-secondary" style="font-size:0.75rem; padding:0.25rem 0.5rem;" onclick="window.handleReturnBook('${b.book_id}')">Return</button>
                                        ` : `<span>Completed</span>`}
                                    </td>
                                </tr>
                            `).join('') : emptyTableRow(6, 'No borrow records recorded.')}
                        </tbody>
                    </table>
                </div>
            </div>
        `;

        // Only the book cards are redrawn while typing, so the cursor stays in the search box
        document.getElementById('inputBookSearch').addEventListener('input', (e) => {
            bookSearchTerm = e.target.value.trim();
            const filtered = getFilteredBooks(db.getBooks());
            document.getElementById('bookGrid').innerHTML = renderBookCards(filtered, isAdmin);
            document.getElementById('bookResultCount').textContent = bookCountText(filtered);
        });

        if (isAdmin && document.getElementById('btnAddBook')) {
            document.getElementById('btnAddBook').addEventListener('click', openAddBookModal);
        }
    };

    const openAddBookModal = () => {
        const body = `
            <form>
                <div class="form-group">
                    <label>Book Title <span class="required">*</span></label>
                    <input type="text" id="bkTitle" class="form-control" placeholder="e.g. Modern Operating Systems" required>
                </div>
                <div class="form-row">
                    <div class="form-group">
                        <label>Author(s) <span class="required">*</span></label>
                        <input type="text" id="bkAuthor" class="form-control" placeholder="Andrew S. Tanenbaum" required>
                    </div>
                    <div class="form-group">
                        <label>Course Code <span class="required">*</span></label>
                        <input type="text" id="bkCourse" class="form-control" placeholder="CS202" required>
                    </div>
                </div>
                <div class="form-row">
                    <div class="form-group">
                        <label>Category</label>
                        <input type="text" id="bkCat" class="form-control" placeholder="Computer Science">
                    </div>
                    <div class="form-group">
                        <label>ISBN (Optional)</label>
                        <input type="text" id="bkIsbn" class="form-control" placeholder="978-0133591620">
                    </div>
                </div>
            </form>
        `;
        openModal('Add Book to Library Catalog', body, `
            <button class="btn-secondary" onclick="closeModal()">Cancel</button>
            <button class="btn-primary" id="btnSubmitAddBook">Add to Catalog</button>
        `);

        document.getElementById('btnSubmitAddBook').addEventListener('click', () => {
            const title = document.getElementById('bkTitle').value.trim();
            const author = document.getElementById('bkAuthor').value.trim();
            const course_code = document.getElementById('bkCourse').value.trim();
            const category = document.getElementById('bkCat').value.trim();
            const isbn = document.getElementById('bkIsbn').value.trim();

            if (!title || !author) {
                showToast('Title and author are required.', 'error');
                return;
            }

            db.createBook({ title, author, course_code, category, isbn });
            closeModal();
            showToast('Book added to library inventory.', 'success');
            renderLibraryModule();
        });
    };

    window.handleBorrowBook = (id) => {
        try {
            db.borrowBook(id, currentUser);
            showToast('Book borrowed successfully for 14 days.', 'success');
            renderLibraryModule();
        } catch (error) {
            showToast(error.message, 'error');
        }
    };

    window.handleReturnBook = (id) => {
        db.returnBook(id);
        showToast('Book returned to library inventory.', 'info');
        renderLibraryModule();
    };

    window.handleDeleteBook = (id) => {
        if (confirm('Delete this book from the catalog?')) {
            db.deleteBook(id);
            renderLibraryModule();
        }
    };

    // =========================================================================
    // MODULE 4: STUDENT CLUB MANAGEMENT SYSTEM
    // =========================================================================
    const renderClubsModule = () => {
        const isAdmin = currentUser && currentUser.role === 'admin';
        const clubs = db.getClubs();
        const userClubIds = db.getUserClubs(currentUser.id);
        const posts = db.getClubPosts();

        portalContent.innerHTML = `
            <div class="module-header">
                <div class="module-title-group">
                    <h2>
                        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
                        Student Club Management System
                    </h2>
                    <p>Explore recognized student societies, join professional clubs, and follow meeting announcements.</p>
                </div>
                <div class="module-actions">
                    ${isAdmin ? `<button class="btn-primary" id="btnCreateClub">+ Register New Club</button>` : ''}
                </div>
            </div>

            ${getAdminControlHeader('Student Organizations Administration')}

            <h3 class="section-heading">Campus Student Societies</h3>
            <div class="card-grid">
                ${clubs.map(c => {
                    const isMember = userClubIds.includes(c.id);

                    return `
                        <div class="card">
                            <div class="card-top">
                                <span class="badge badge-academic">${escapeHtml(c.category)}</span>
                                <span style="font-size:0.75rem; color:var(--text-muted);">${c.members_count} active members</span>
                            </div>
                            <h3 class="card-title">${escapeHtml(c.name)}</h3>
                            <p class="card-desc">${escapeHtml(c.description)}</p>
                            <div class="card-meta-list">
                                <div class="card-meta-item">
                                    <strong>Club Leader:</strong> <span>${escapeHtml(c.lead)}</span>
                                </div>
                                <div class="card-meta-item">
                                    <strong>Meeting Room:</strong> <span>${escapeHtml(c.room)}</span>
                                </div>
                                <div class="card-meta-item">
                                    <strong>Activities:</strong> <span style="font-size:0.75rem;">${escapeHtml(c.activities)}</span>
                                </div>
                            </div>
                            <div class="card-footer">
                                ${isAdmin ? `
                                    <div style="display:flex; justify-content:space-between; width:100%;">
                                        <button class="btn-secondary" style="font-size:0.75rem;" onclick="window.openPostClubAnnouncementModal('${c.id}')">+ Post Notice</button>
                                        <button class="btn-danger-outline" onclick="window.handleDeleteClub('${c.id}')">Disband Club</button>
                                    </div>
                                ` : `
                                    ${isMember ? `
                                        <span class="badge badge-success">Enrolled Member ✓</span>
                                        <button class="btn-secondary" style="font-size:0.75rem; color:var(--status-danger);" onclick="window.handleLeaveClub('${c.id}')">Leave Club</button>
                                    ` : `
                                        <button class="btn-primary" onclick="window.handleJoinClub('${c.id}')">Join Club</button>
                                    `}
                                `}
                            </div>
                        </div>
                    `;
                }).join('')}
            </div>

            <!-- Club Activity Bulletins -->
            <div class="section-block">
                <h3 class="section-heading">Official Club Bulletins & Workshops</h3>
                <div class="card-grid">
                    ${posts.map(p => {
                        const club = clubs.find(c => c.id === p.club_id);
                        return `
                            <div class="card" style="background:#FAFBFD;">
                                <div class="card-top">
                                    <span class="badge badge-neutral">${club ? escapeHtml(club.name) : 'Club Notice'}</span>
                                    <span style="font-size:0.75rem; color:var(--text-light);">${formatDate(p.created_at)}</span>
                                </div>
                                <h4 style="font-size:0.95rem; font-weight:700; color:var(--primary); margin-bottom:0.35rem;">${escapeHtml(p.title)}</h4>
                                <p style="font-size:0.85rem; color:var(--text-main); line-height:1.45;">${escapeHtml(p.content)}</p>
                            </div>
                        `;
                    }).join('')}
                </div>
            </div>
        `;

        if (isAdmin && document.getElementById('btnCreateClub')) {
            document.getElementById('btnCreateClub').addEventListener('click', openCreateClubModal);
        }
    };

    const openCreateClubModal = () => {
        const body = `
            <form>
                <div class="form-group">
                    <label>Club Name <span class="required">*</span></label>
                    <input type="text" id="clbName" class="form-control" placeholder="e.g. KDU Global Debate Union" required>
                </div>
                <div class="form-row">
                    <div class="form-group">
                        <label>Category <span class="required">*</span></label>
                        <input type="text" id="clbCategory" class="form-control" placeholder="Academic / Public Speaking" required>
                    </div>
                    <div class="form-group">
                        <label>Student President / Lead <span class="required">*</span></label>
                        <input type="text" id="clbLead" class="form-control" placeholder="Lead Student Name" required>
                    </div>
                </div>
                <div class="form-group">
                    <label>Meeting Headquarters / Room <span class="required">*</span></label>
                    <input type="text" id="clbRoom" class="form-control" placeholder="Global Building Room 304" required>
                </div>
                <div class="form-group">
                    <label>Mission & Description <span class="required">*</span></label>
                    <textarea id="clbDesc" class="form-control" rows="2" placeholder="Summary of club mission..." required></textarea>
                </div>
                <div class="form-group">
                    <label>Regular Meeting Schedule & Activities</label>
                    <input type="text" id="clbActivities" class="form-control" placeholder="Wednesdays 18:00, Model UN prep">
                </div>
            </form>
        `;
        openModal('Register New Student Club', body, `
            <button class="btn-secondary" onclick="closeModal()">Cancel</button>
            <button class="btn-primary" id="btnSubmitClub">Register Club</button>
        `);

        document.getElementById('btnSubmitClub').addEventListener('click', () => {
            const name = document.getElementById('clbName').value.trim();
            const category = document.getElementById('clbCategory').value.trim();
            const lead = document.getElementById('clbLead').value.trim();
            const room = document.getElementById('clbRoom').value.trim();
            const description = document.getElementById('clbDesc').value.trim();
            const activities = document.getElementById('clbActivities').value.trim();

            if (!name || !category || !lead) {
                showToast('Please fill all required fields.', 'error');
                return;
            }

            db.createClub({ name, category, lead, room, description, activities });
            closeModal();
            showToast('Student club registered successfully.', 'success');
            renderClubsModule();
        });
    };

    window.openPostClubAnnouncementModal = (clubId) => {
        const body = `
            <div class="form-group">
                <label>Announcement Title <span class="required">*</span></label>
                <input type="text" id="cpTitle" class="form-control" placeholder="Upcoming Session Topic" required>
            </div>
            <div class="form-group">
                <label>Bulletin Content <span class="required">*</span></label>
                <textarea id="cpContent" class="form-control" rows="3" placeholder="Provide event agenda and requirements..." required></textarea>
            </div>
        `;
        openModal('Post Club Bulletin Announcement', body, `
            <button class="btn-secondary" onclick="closeModal()">Cancel</button>
            <button class="btn-primary" id="btnSubmitCP">Publish Bulletin</button>
        `);

        document.getElementById('btnSubmitCP').addEventListener('click', () => {
            const title = document.getElementById('cpTitle').value.trim();
            const content = document.getElementById('cpContent').value.trim();
            if (!title || !content) {
                showToast('Title and content are required.', 'error');
                return;
            }
            db.createClubPost({ clubId, title, content });
            closeModal();
            showToast('Club announcement posted.', 'success');
            renderClubsModule();
        });
    };

    window.handleJoinClub = (id) => {
        try {
            db.joinClub(id, currentUser.id);
            showToast('You are now a member of this club!', 'success');
            renderClubsModule();
        } catch (error) {
            showToast(error.message, 'error');
        }
    };

    window.handleLeaveClub = (id) => {
        db.leaveClub(id, currentUser.id);
        showToast('Left club membership.', 'info');
        renderClubsModule();
    };

    window.handleDeleteClub = (id) => {
        if (confirm('Disband this student club?')) {
            db.deleteClub(id);
            renderClubsModule();
        }
    };

    // =========================================================================
    // MODULE 5: STUDENT FEEDBACK SYSTEM
    // =========================================================================
    let selectedRating = 5;

    const renderFeedbackModule = () => {
        const isAdmin = currentUser && currentUser.role === 'admin';
        const feedbacks = db.getFeedback();

        // Average rating (no fake "5.0" when there are no reviews yet)
        const avgText = feedbacks.length
            ? `${(feedbacks.reduce((a, b) => a + b.rating, 0) / feedbacks.length).toFixed(1)} / 5.0`
            : 'No ratings yet';

        portalContent.innerHTML = `
            <div class="module-header">
                <div class="module-title-group">
                    <h2>
                        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>
                        Student Feedback & Campus Ratings
                    </h2>
                    <p>Share constructive evaluations on academic courses, university facilities, and campus dining services.</p>
                </div>
            </div>

            ${getAdminControlHeader('Feedback & Quality Assurance Analytics')}

            <!-- Feedback Submission Form -->
            <div class="card" style="margin-bottom:2rem; background:linear-gradient(180deg, #FFFFFF 0%, #F8FAFC 100%);">
                <h3 style="font-size:1.1rem; color:var(--primary); margin-bottom:0.875rem;">Submit Evaluation & Feedback</h3>
                <form id="formSubmitFeedback">
                    <div class="form-row">
                        <div class="form-group">
                            <label>Feedback Target / Course <span class="required">*</span></label>
                            <input type="text" id="fbTarget" class="form-control" placeholder="e.g. CS302 Web Architectures or Main Cafeteria" required>
                        </div>
                        <div class="form-group">
                            <label>Category <span class="required">*</span></label>
                            <select id="fbCategory" class="form-control">
                                <option value="Academic">Course Instruction & Curriculum</option>
                                <option value="Facilities">Campus Facilities & IT Services</option>
                                <option value="Dining">Dining, Cafeteria & Stores</option>
                                <option value="Administration">Administration & Student Visa Affairs</option>
                            </select>
                        </div>
                    </div>

                    <div class="form-group">
                        <label>Satisfaction Score (1 to 5 Stars):</label>
                        <div class="star-rating-row">
                            <!-- The stars are drawn from selectedRating, so what you see is what gets saved -->
                            <div class="star-rating-widget" id="starWidget">
                                ${[1, 2, 3, 4, 5].map(v => `<span class="star ${v <= selectedRating ? 'selected' : ''}" data-val="${v}">★</span>`).join('')}
                            </div>
                            <span id="starValLabel" class="star-value-label">${selectedRating}.0 / 5.0</span>
                        </div>
                    </div>

                    <div class="form-group">
                        <label>Comments & Recommendations <span class="required">*</span></label>
                        <textarea id="fbComment" class="form-control" rows="3" placeholder="Provide constructive feedback..." required></textarea>
                    </div>

                    <div style="display:flex; justify-content:flex-end;">
                        <button type="submit" class="btn-primary">Submit Verified Feedback</button>
                    </div>
                </form>
            </div>

            <!-- Aggregated Ratings Scoreboard -->
            <div style="display:flex; align-items:center; justify-content:space-between; margin-bottom:1.25rem;">
                <h3 style="font-size:1.1rem; color:var(--primary);">
                    Student Reviews (${feedbacks.length})
                </h3>
                <div class="score-display-pill">
                    ★ Average Campus Satisfaction: ${avgText}
                </div>
            </div>

            <div class="card-grid">
                ${feedbacks.map(f => {
                    const stars = '★'.repeat(f.rating) + '☆'.repeat(5 - f.rating);
                    return `
                        <div class="card">
                            <div class="card-top">
                                <span class="badge badge-academic">${escapeHtml(f.category)}</span>
                                <span style="color:#F59E0B; font-size:1.05rem; font-weight:700;">${stars} (${f.rating}.0)</span>
                            </div>
                            <h4 style="font-size:0.95rem; font-weight:700; color:var(--primary); margin-bottom:0.25rem;">${escapeHtml(f.target)}</h4>
                            <p class="card-desc">"${escapeHtml(f.comment)}"</p>
                            <div class="card-footer">
                                <span style="font-size:0.75rem; color:var(--text-light);">By ${escapeHtml(f.student_name)} &bull; ${formatDate(f.created_at)}</span>
                                ${isAdmin ? `
                                    <button class="btn-danger-outline" onclick="window.handleDeleteFeedback('${f.id}')">Remove</button>
                                ` : ''}
                            </div>
                        </div>
                    `;
                }).join('')}
            </div>
        `;

        // Star rating widget clicks
        const stars = document.querySelectorAll('#starWidget .star');
        stars.forEach(s => {
            s.addEventListener('click', () => {
                selectedRating = parseInt(s.dataset.val, 10);
                stars.forEach(st => {
                    st.classList.toggle('selected', parseInt(st.dataset.val, 10) <= selectedRating);
                });
                document.getElementById('starValLabel').textContent = `${selectedRating}.0 / 5.0`;
            });
        });

        // Form submit
        document.getElementById('formSubmitFeedback').addEventListener('submit', (e) => {
            e.preventDefault();
            const target = document.getElementById('fbTarget').value.trim();
            const category = document.getElementById('fbCategory').value;
            const comment = document.getElementById('fbComment').value.trim();

            if (!target || !comment) {
                showToast('Please fill in the target and your comments.', 'error');
                return;
            }

            db.createFeedback({
                userId: currentUser.id,
                studentName: currentUser.full_name,
                target,
                category,
                rating: selectedRating,
                comment
            });

            selectedRating = 5; // fresh form for the next review
            showToast('Feedback submitted. Thank you for helping improve KDU Global!', 'success');
            renderFeedbackModule();
        });
    };

    window.handleDeleteFeedback = (id) => {
        if (confirm('Delete this feedback entry?')) {
            db.deleteFeedback(id);
            renderFeedbackModule();
        }
    };

    // =========================================================================
    // MODULE 6: ONLINE QUIZ SYSTEM (INTERACTIVE SELF-ASSESSMENT)
    // =========================================================================
    const renderQuizzesModule = () => {
        const isAdmin = currentUser && currentUser.role === 'admin';
        const quizzes = db.getQuizzes();
        const attempts = db.getQuizAttempts(isAdmin ? null : currentUser.id);

        portalContent.innerHTML = `
            <div class="module-header">
                <div class="module-title-group">
                    <h2>
                        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="9" y1="15" x2="15" y2="15"></line></svg>
                        Online Quiz & Self-Assessment System
                    </h2>
                    <p>Test your academic mastery with instant automated scoring, timed tests, and answer explanations.</p>
                </div>
                <div class="module-actions">
                    ${isAdmin ? `<button class="btn-primary" id="btnCreateQuiz">+ Build New Course Quiz</button>` : ''}
                </div>
            </div>

            ${getAdminControlHeader('Quiz Builder & Assessment Analytics')}

            <h3 class="section-heading">Active Course Quizzes</h3>
            <div class="card-grid">
                ${quizzes.map(qz => {
                    // Student: their own latest attempt. Admin: how many attempts all students made.
                    const quizAttempts = attempts.filter(a => a.quiz_id === qz.id);
                    const myAttempt = isAdmin ? null : quizAttempts[0];

                    return `
                        <div class="card">
                            <div class="card-top">
                                <span class="badge badge-academic">${escapeHtml(qz.course)}</span>
                                <span style="font-size:0.75rem; color:var(--text-muted);">${qz.time_limit_mins} mins limit</span>
                            </div>
                            <h3 class="card-title">${escapeHtml(qz.title)}</h3>
                            <p class="card-desc">Comprehensive test containing ${qz.questions.length} multiple-choice questions with automated instant scoring.</p>
                            <div class="card-meta-list">
                                <div class="card-meta-item">
                                    <strong>Status:</strong> 
                                    <span>${isAdmin
                                        ? `${quizAttempts.length} student attempt(s)`
                                        : (myAttempt ? `Completed (${myAttempt.score}% Score)` : 'Not Yet Attempted')}</span>
                                </div>
                            </div>
                            <div class="card-footer">
                                ${isAdmin ? `
                                    <button class="btn-danger-outline" onclick="window.handleDeleteQuiz('${qz.id}')">Delete Quiz</button>
                                ` : `
                                    <button class="btn-primary" onclick="window.startQuizTaker('${qz.id}')">
                                        ${myAttempt ? 'Retake Quiz' : 'Start Assessment'}
                                    </button>
                                `}
                            </div>
                        </div>
                    `;
                }).join('')}
            </div>

            <!-- Quiz Attempts History -->
            <div class="section-block">
                <h3 class="section-heading">
                    ${isAdmin ? 'All Student Quiz Assessment Attempts' : 'My Quiz Scores & Assessment Results'}
                </h3>
                <div class="table-responsive">
                    <table class="data-table">
                        <thead>
                            <tr>
                                <th>Assessment Title</th>
                                ${isAdmin ? '<th>Student Name</th>' : ''}
                                <th>Correct Answers</th>
                                <th>Calculated Score</th>
                                <th>Submission Date</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${attempts.length ? attempts.map(a => `
                                <tr>
                                    <td><strong>${escapeHtml(a.quiz_title)}</strong></td>
                                    ${isAdmin ? `<td>${escapeHtml(a.student_name)}</td>` : ''}
                                    <td>${a.correct_count} / ${a.total_questions} Questions</td>
                                    <td>
                                        <span class="badge ${a.score >= 80 ? 'badge-success' : 'badge-important'}">
                                            ${a.score}% Grade
                                        </span>
                                    </td>
                                    <td>${formatDate(a.submitted_at)}</td>
                                </tr>
                            `).join('') : emptyTableRow(isAdmin ? 5 : 4, 'No completed quiz attempts recorded yet.')}
                        </tbody>
                    </table>
                </div>
            </div>
        `;

        if (isAdmin && document.getElementById('btnCreateQuiz')) {
            document.getElementById('btnCreateQuiz').addEventListener('click', openCreateQuizModal);
        }
    };

    // Interactive Quiz Taker Modal
    window.startQuizTaker = (quizId) => {
        const quiz = db.getQuiz(quizId);
        if (!quiz) return;

        const body = `
            <div style="margin-bottom:1rem; padding-bottom:0.75rem; border-bottom:1px solid var(--border-subtle);">
                <div class="quiz-info-row">
                    <span>${escapeHtml(quiz.course)}</span>
                    <span class="quiz-timer" id="quizTimer">Time left: ${quiz.time_limit_mins}:00</span>
                </div>
            </div>
            <form id="formQuizTake">
                ${quiz.questions.map((q, qIndex) => `
                    <div class="quiz-question-box">
                        <div class="quiz-question-title">
                            Question ${qIndex + 1}: ${escapeHtml(q.question)}
                        </div>
                        <div class="quiz-options-group">
                            ${q.options.map((opt, optIndex) => `
                                <label class="quiz-option-label">
                                    <input type="radio" name="question_${qIndex}" value="${optIndex}" required>
                                    <span>${escapeHtml(opt)}</span>
                                </label>
                            `).join('')}
                        </div>
                    </div>
                `).join('')}
            </form>
        `;

        openModal(escapeHtml(quiz.title), body, `
            <button class="btn-secondary" onclick="closeModal()">Abandon Quiz</button>
            <button class="btn-primary" id="btnSubmitQuizAnswers">Submit Assessment for Grading</button>
        `);

        // Grades the quiz. timeUp = true when the timer ran out: unanswered questions then count as wrong.
        const submitQuiz = (timeUp) => {
            const form = document.getElementById('formQuizTake');
            let correctCount = 0;
            const userAnswers = [];

            for (let i = 0; i < quiz.questions.length; i++) {
                const selected = form.querySelector(`input[name="question_${i}"]:checked`);
                if (!selected && !timeUp) {
                    showToast(`Please answer Question ${i + 1} before submitting.`, 'error');
                    return;
                }
                const chosenIdx = selected ? parseInt(selected.value, 10) : -1; // -1 = not answered
                userAnswers.push(chosenIdx);
                if (chosenIdx === quiz.questions[i].correct) {
                    correctCount++;
                }
            }
            clearInterval(quizTimer);
            quizTimer = null;

            const total = quiz.questions.length;
            const score = Math.round((correctCount / total) * 100);

            // Record in Local DB
            db.recordQuizAttempt({
                quizId: quiz.id,
                quizTitle: quiz.title,
                user: currentUser,
                score,
                totalQuestions: total,
                correctCount
            });

            // Show Review Modal
            const reviewBody = `
                <div style="text-align:center; padding:1rem; margin-bottom:1.5rem; background:var(--primary-light); border-radius:var(--radius-md);">
                    <h2 style="font-size:2rem; font-weight:800; color:var(--primary);">${score}%</h2>
                    <p style="font-weight:600; color:var(--text-main);">You answered ${correctCount} of ${total} questions correctly.</p>
                </div>
                <h4 style="font-size:1rem; color:var(--primary); margin-bottom:0.75rem;">Question-by-Question Solution Review:</h4>
                ${quiz.questions.map((q, idx) => {
                    const isCorrect = userAnswers[idx] === q.correct;
                    return `
                        <div style="padding:0.75rem; border:1px solid ${isCorrect ? '#A7F3D0' : '#FECACA'}; background:${isCorrect ? '#ECFDF5' : '#FEF2F2'}; border-radius:var(--radius-md); margin-bottom:0.75rem;">
                            <strong>Q${idx + 1}: ${escapeHtml(q.question)}</strong>
                            <div style="font-size:0.8125rem; margin-top:0.25rem;">
                                Your Answer: <em>${userAnswers[idx] === -1 ? 'Not answered' : escapeHtml(q.options[userAnswers[idx]])}</em> (${isCorrect ? 'Correct ✓' : 'Incorrect ✗'})
                            </div>
                            ${!isCorrect ? `
                                <div style="font-size:0.8125rem; color:#065F46; font-weight:600; margin-top:0.2rem;">
                                    Correct Answer: ${escapeHtml(q.options[q.correct])}
                                </div>
                            ` : ''}
                            <div style="font-size:0.75rem; color:var(--text-muted); margin-top:0.25rem;">
                                <strong>Explanation:</strong> ${escapeHtml(q.explanation)}
                            </div>
                        </div>
                    `;
                }).join('')}
            `;

            openModal(timeUp ? "Time's Up! Results & Explanations" : 'Assessment Results & Explanations', reviewBody, `
                <button class="btn-primary" onclick="closeModal();">Return to Dashboard</button>
            `);

            renderQuizzesModule();
        };

        document.getElementById('btnSubmitQuizAnswers').addEventListener('click', () => submitQuiz(false));

        // Countdown: updates every second and auto-submits at 0:00.
        // closeModal() stops it if the student abandons the quiz.
        let secondsLeft = quiz.time_limit_mins * 60;
        const timerEl = document.getElementById('quizTimer');
        quizTimer = setInterval(() => {
            secondsLeft--;
            const m = Math.floor(secondsLeft / 60);
            const sec = String(secondsLeft % 60).padStart(2, '0');
            timerEl.textContent = `Time left: ${m}:${sec}`;
            if (secondsLeft <= 60) timerEl.classList.add('ending');
            if (secondsLeft <= 0) submitQuiz(true);
        }, 1000);
    };

    // ----- Quiz builder: one block per question, "+ Add Question" adds more -----
    const MAX_QUIZ_QUESTIONS = 20;

    // HTML for ONE question block. Fields are found later by class, not id,
    // because there can be many blocks on the form at the same time.
    const quizQuestionBlockHtml = () => `
        <div class="qb-block">
            <div class="qb-head">
                <h4 class="qb-title">Question</h4>
                <button type="button" class="btn-danger-outline qb-remove">Remove</button>
            </div>
            <div class="form-group">
                <label>Question Text <span class="required">*</span></label>
                <input type="text" class="form-control qb-text" placeholder="e.g. Which web storage persists across browser restarts?">
            </div>
            <div class="form-row">
                <input type="text" class="form-control qb-opt" placeholder="Option A">
                <input type="text" class="form-control qb-opt" placeholder="Option B">
            </div>
            <div class="form-row qb-row-gap">
                <input type="text" class="form-control qb-opt" placeholder="Option C">
                <input type="text" class="form-control qb-opt" placeholder="Option D">
            </div>
            <div class="form-row qb-row-gap">
                <div class="form-group">
                    <label>Correct Answer <span class="required">*</span></label>
                    <select class="form-control qb-correct">
                        <option value="0">Option A</option>
                        <option value="1">Option B</option>
                        <option value="2">Option C</option>
                        <option value="3">Option D</option>
                    </select>
                </div>
                <div class="form-group">
                    <label>Explanation (optional)</label>
                    <input type="text" class="form-control qb-expl" placeholder="Why is this answer correct?">
                </div>
            </div>
        </div>
    `;

    // Number the blocks "Question 1, 2, 3..." and hide Remove when only one is left
    const renumberQuizBlocks = () => {
        const blocks = document.querySelectorAll('#qbList .qb-block');
        blocks.forEach((block, i) => {
            block.querySelector('.qb-title').textContent = `Question ${i + 1}`;
            block.querySelector('.qb-remove').classList.toggle('hidden', blocks.length === 1);
        });
        document.getElementById('qbCount').textContent =
            `${blocks.length} question${blocks.length === 1 ? '' : 's'}`;
        document.getElementById('btnAddQuizQuestion').disabled = blocks.length >= MAX_QUIZ_QUESTIONS;
    };

    const openCreateQuizModal = () => {
        const body = `
            <form>
                <div class="form-group">
                    <label>Quiz Title <span class="required">*</span></label>
                    <input type="text" id="qzTitle" class="form-control" placeholder="e.g. Midterm Comprehensive Quiz" required>
                </div>
                <div class="form-row">
                    <div class="form-group">
                        <label>Course Name / Code <span class="required">*</span></label>
                        <input type="text" id="qzCourse" class="form-control" placeholder="CS302 Web Architectures" required>
                    </div>
                    <div class="form-group">
                        <label>Time Limit (Minutes)</label>
                        <input type="number" id="qzLimit" class="form-control" value="15" min="1">
                    </div>
                </div>

                <div id="qbList">${quizQuestionBlockHtml()}</div>

                <div class="qb-toolbar">
                    <button type="button" class="btn-secondary" id="btnAddQuizQuestion">+ Add Question</button>
                    <span id="qbCount" class="text-small-light"></span>
                </div>
            </form>
        `;

        openModal('Build New Course Quiz', body, `
            <button class="btn-secondary" onclick="closeModal()">Cancel</button>
            <button class="btn-primary" id="btnSubmitBuildQuiz">Save and Publish Quiz</button>
        `);
        renumberQuizBlocks();

        // Add a new empty block at the end. insertAdjacentHTML does NOT rebuild the
        // blocks already there, so text the admin already typed is kept.
        document.getElementById('btnAddQuizQuestion').addEventListener('click', () => {
            const list = document.getElementById('qbList');
            list.insertAdjacentHTML('beforeend', quizQuestionBlockHtml());
            renumberQuizBlocks();
            list.lastElementChild.querySelector('.qb-text').focus();
        });

        // One listener for every Remove button, even ones added later (event delegation)
        document.getElementById('qbList').addEventListener('click', (e) => {
            const removeBtn = e.target.closest('.qb-remove');
            if (!removeBtn) return;
            removeBtn.closest('.qb-block').remove();
            renumberQuizBlocks();
        });

        document.getElementById('btnSubmitBuildQuiz').addEventListener('click', () => {
            const title = document.getElementById('qzTitle').value.trim();
            const course = document.getElementById('qzCourse').value.trim();
            const time_limit_mins = document.getElementById('qzLimit').value;

            if (!title || !course) {
                showToast('Please fill in the quiz title and course.', 'error');
                return;
            }

            // Read every question block and check it is complete
            const questions = [];
            const blocks = document.querySelectorAll('#qbList .qb-block');
            for (let i = 0; i < blocks.length; i++) {
                const block = blocks[i];
                const qText = block.querySelector('.qb-text').value.trim();
                const options = [...block.querySelectorAll('.qb-opt')].map(input => input.value.trim());
                const correct = parseInt(block.querySelector('.qb-correct').value, 10);
                const explanation = block.querySelector('.qb-expl').value.trim();

                if (!qText || options.some(opt => !opt)) {
                    showToast(`Question ${i + 1}: please write the question and all 4 options.`, 'error');
                    block.querySelector('.qb-text').focus();
                    return;
                }
                if (new Set(options.map(o => o.toLowerCase())).size < 4) {
                    showToast(`Question ${i + 1}: the 4 options must be different.`, 'error');
                    return;
                }

                questions.push({
                    id: 'q_' + Date.now() + '_' + i,   // unique id per question
                    question: qText,
                    options,
                    correct,
                    explanation: explanation || 'The correct answer is ' + options[correct] + '.'
                });
            }

            db.createQuiz({ title, course, time_limit_mins, questions });
            closeModal();
            showToast(`Quiz published with ${questions.length} question${questions.length === 1 ? '' : 's'}.`, 'success');
            renderQuizzesModule();
        });
    };

    window.handleDeleteQuiz = (id) => {
        if (confirm('Delete this quiz assessment?')) {
            db.deleteQuiz(id);
            renderQuizzesModule();
        }
    };

    // =========================================================================
    // MODULE 7: STUDENT ASSIGNMENT SUBMISSION SYSTEM
    // =========================================================================
    const renderAssignmentsModule = () => {
        const isAdmin = currentUser && currentUser.role === 'admin';
        const assignments = db.getAssignments();
        const submissions = db.getSubmissions(null, isAdmin ? null : currentUser.id);
        // Look up an assignment's title for the submissions table
        const assignmentTitle = (id) => {
            const a = assignments.find(x => x.id === id);
            return a ? `${a.course}: ${a.title}` : '(deleted assignment)';
        };

        portalContent.innerHTML = `
            <div class="module-header">
                <div class="module-title-group">
                    <h2>
                        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="17 8 12 3 7 8"></polyline><line x1="12" y1="3" x2="12" y2="15"></line></svg>
                        Student Assignment Submission System
                    </h2>
                    <p>Track strict submission deadlines, upload coursework metadata links, and receive graded feedback.</p>
                </div>
                <div class="module-actions">
                    ${isAdmin ? `<button class="btn-primary" id="btnCreateAssignment">+ Post Course Assignment</button>` : ''}
                </div>
            </div>

            ${getAdminControlHeader('Assignment & Grading Portal')}

            <h3 class="section-heading">Active Coursework Tasks</h3>
            <div class="card-grid">
                ${assignments.map(asg => {
                    const mySub = submissions.find(s => s.assignment_id === asg.id && s.user_id === currentUser.id);
                    const now = new Date();
                    const due = new Date(asg.due_date);
                    const isOverdue = due < now;
                    const diffHours = Math.round((due - now) / (1000 * 60 * 60));

                    let countdownText = '';
                    if (isOverdue) {
                        countdownText = 'Deadline Passed (Overdue)';
                    } else if (diffHours < 1) {
                        countdownText = 'Urgent: Due in less than 1 hour';
                    } else if (diffHours < 24) {
                        countdownText = `Urgent: Due in ${diffHours} hours`;
                    } else {
                        const days = Math.round(diffHours / 24);
                        countdownText = `Due in ${days} days`;
                    }

                    return `
                        <div class="card">
                            <div class="card-top">
                                <span class="badge badge-academic">${escapeHtml(asg.course)}</span>
                                <span class="deadline-pill ${isOverdue ? 'overdue' : 'upcoming'}">${countdownText}</span>
                            </div>
                            <h3 class="card-title">${escapeHtml(asg.title)}</h3>
                            <p class="card-desc">${escapeHtml(asg.instructions)}</p>
                            <div class="card-meta-list">
                                <div class="card-meta-item">
                                    <strong>Target Deadline:</strong> <span>${formatDate(asg.due_date)}</span>
                                </div>
                                <div class="card-meta-item">
                                    <strong>Max Points:</strong> <span>${asg.max_points} Pts</span>
                                </div>
                                <div class="card-meta-item">
                                    <strong>Your Status:</strong> 
                                    <span class="badge ${mySub ? (mySub.status === 'Graded' ? 'badge-success' : 'badge-important') : 'badge-neutral'}">
                                        ${mySub ? mySub.status : 'Pending Submission'}
                                    </span>
                                </div>
                                ${mySub && mySub.grade ? `
                                    <div class="card-meta-item" style="color:var(--status-success); font-weight:700;">
                                        <strong>Assigned Grade:</strong> <span>${escapeHtml(mySub.grade)}</span>
                                    </div>
                                    <div class="card-meta-item" style="font-size:0.75rem; color:var(--text-muted);">
                                        <strong>Feedback:</strong> <span>${escapeHtml(mySub.feedback)}</span>
                                    </div>
                                ` : ''}
                            </div>
                            <div class="card-footer">
                                ${isAdmin ? `
                                    <div style="display:flex; justify-content:space-between; width:100%;">
                                        <button class="btn-secondary" style="font-size:0.75rem;" onclick="window.viewSubmissionsForAssignment('${asg.id}')">View Submissions</button>
                                        <button class="btn-danger-outline" onclick="window.handleDeleteAssignment('${asg.id}')">Delete</button>
                                    </div>
                                ` : `
                                    ${mySub && mySub.status === 'Graded'
                                        ? `<span class="badge badge-success">Graded ✓</span>`
                                        : (isOverdue
                                            ? `<button class="btn-primary" disabled>Submissions Closed</button>`
                                            : `<button class="btn-primary" onclick="window.openSubmitAssignmentModal('${asg.id}')">
                                                ${mySub ? 'Update Submission' : 'Submit Assignment'}
                                            </button>`)}
                                `}
                            </div>
                        </div>
                    `;
                }).join('')}
            </div>

            <!-- Submissions Ledger Table for Admin or Student -->
            <div class="section-block">
                <h3 class="section-heading">
                    ${isAdmin ? 'All University Student Coursework Submissions' : 'My Submission Log'}
                </h3>
                <div class="table-responsive">
                    <table class="data-table">
                        <thead>
                            <tr>
                                <th>Assignment</th>
                                <th>Student</th>
                                <th>Attachment / Link</th>
                                <th>Submission Date</th>
                                <th>Status</th>
                                <th>Grade</th>
                                ${isAdmin ? '<th>Action</th>' : ''}
                            </tr>
                        </thead>
                        <tbody>
                            ${submissions.length ? submissions.map(s => `
                                <tr>
                                    <td>${escapeHtml(assignmentTitle(s.assignment_id))}</td>
                                    <td><strong>${escapeHtml(s.student_name)}</strong><br><small style="color:var(--text-light);">${escapeHtml(s.student_id)}</small></td>
                                    <td><span style="font-size:0.8rem; font-family:monospace;">${escapeHtml(s.file_name)}</span></td>
                                    <td>${formatDate(s.submitted_at)}</td>
                                    <td><span class="badge ${s.status === 'Graded' ? 'badge-success' : 'badge-important'}">${s.status}</span></td>
                                    <td>${s.grade ? `<strong>${escapeHtml(s.grade)}</strong>` : '<span style="color:var(--text-light);">Not Graded</span>'}</td>
                                    ${isAdmin ? `
                                        <td>
                                            <button class="btn-primary" style="font-size:0.75rem; padding:0.25rem 0.5rem;" onclick="window.openGradeModal('${s.id}')">Grade & Feedback</button>
                                        </td>
                                    ` : ''}
                                </tr>
                            `).join('') : emptyTableRow(isAdmin ? 7 : 6, 'No submissions found.')}
                        </tbody>
                    </table>
                </div>
            </div>
        `;

        if (isAdmin && document.getElementById('btnCreateAssignment')) {
            document.getElementById('btnCreateAssignment').addEventListener('click', openCreateAssignmentModal);
        }
    };

    window.openSubmitAssignmentModal = (assignmentId) => {
        const body = `
            <div class="form-group">
                <label>File Name / Document Title <span class="required">*</span></label>
                <input type="text" id="asgFile" class="form-control" placeholder="e.g. CS302_Milestone2_MinjunKim.pdf" required>
            </div>
            <div class="form-group">
                <label>Repository / Cloud Document URL <span class="required">*</span></label>
                <input type="url" id="asgUrl" class="form-control" placeholder="https://github.com/myaccount/kdu-portal" required>
            </div>
            <div class="form-group">
                <label>Submission Commentary & Notes</label>
                <textarea id="asgText" class="form-control" rows="3" placeholder="Provide notes for the instructor..."></textarea>
            </div>
        `;
        openModal('Submit Coursework Assignment', body, `
            <button class="btn-secondary" onclick="closeModal()">Cancel</button>
            <button class="btn-primary" id="btnSendSubmission">Upload & Submit</button>
        `);

        document.getElementById('btnSendSubmission').addEventListener('click', () => {
            const fileName = document.getElementById('asgFile').value.trim();
            const url = document.getElementById('asgUrl').value.trim();
            const notes = document.getElementById('asgText').value.trim();

            if (!fileName || !url) {
                showToast('Please provide both file name and repository/document URL.', 'error');
                return;
            }

            try {
                db.submitAssignment({
                    assignmentId,
                    user: currentUser,
                    submissionText: notes ? `${url} - ${notes}` : url,
                    fileName
                });
            } catch (error) {
                showToast(error.message, 'error');
                return;
            }

            closeModal();
            showToast('Assignment submitted successfully.', 'success');
            renderAssignmentsModule();
        });
    };

    window.openGradeModal = (submissionId) => {
        const subs = db.getSubmissions();
        const sub = subs.find(s => s.id === submissionId);
        if (!sub) return;

        const body = `
            <p><strong>Student:</strong> ${escapeHtml(sub.student_name)} (${escapeHtml(sub.student_id)})</p>
            <p style="font-size:0.85rem; color:var(--text-muted); margin-bottom:1rem;"><strong>Submission:</strong> ${escapeHtml(sub.submission_text)}</p>
            <div class="form-group">
                <label>Assigned Grade & Score <span class="required">*</span></label>
                <input type="text" id="grdScore" class="form-control" placeholder="e.g. 96 / 100 (A+)" value="${escapeHtml(sub.grade)}" required>
            </div>
            <div class="form-group">
                <label>Instructor Pedagogical Feedback <span class="required">*</span></label>
                <textarea id="grdFeedback" class="form-control" rows="3" placeholder="Detailed feedback on criteria..." required>${escapeHtml(sub.feedback)}</textarea>
            </div>
        `;

        openModal('Grade Student Submission', body, `
            <button class="btn-secondary" onclick="closeModal()">Cancel</button>
            <button class="btn-primary" id="btnSubmitGrade">Record Grade & Feedback</button>
        `);

        document.getElementById('btnSubmitGrade').addEventListener('click', () => {
            const grade = document.getElementById('grdScore').value.trim();
            const feedback = document.getElementById('grdFeedback').value.trim();

            if (!grade || !feedback) {
                showToast('Please provide score and feedback.', 'error');
                return;
            }

            db.gradeSubmission(submissionId, { grade, feedback });
            closeModal();
            showToast('Grade recorded and published to student.', 'success');
            renderAssignmentsModule();
        });
    };

    window.viewSubmissionsForAssignment = (asgId) => {
        const subs = db.getSubmissions(asgId);
        const body = `
            <div class="table-responsive">
                <table class="data-table">
                    <thead>
                        <tr>
                            <th>Student</th>
                            <th>File / Link</th>
                            <th>Status</th>
                            <th>Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${subs.length ? subs.map(s => `
                            <tr>
                                <td>${escapeHtml(s.student_name)}</td>
                                <td>${escapeHtml(s.file_name)}</td>
                                <td>${s.status}</td>
                                <td><button class="btn-secondary" style="font-size:0.75rem;" onclick="window.openGradeModal('${s.id}')">Grade</button></td>
                            </tr>
                        `).join('') : emptyTableRow(4, 'No submissions yet.')}
                    </tbody>
                </table>
            </div>
        `;
        openModal('Assignment Submissions Roster', body, `<button class="btn-primary" onclick="closeModal()">Close</button>`);
    };

    const openCreateAssignmentModal = () => {
        const body = `
            <form>
                <div class="form-group">
                    <label>Assignment Title <span class="required">*</span></label>
                    <input type="text" id="asgTitle" class="form-control" placeholder="e.g. Lab 4: Database Query Optimization" required>
                </div>
                <div class="form-row">
                    <div class="form-group">
                        <label>Course Name <span class="required">*</span></label>
                        <input type="text" id="asgCourse" class="form-control" placeholder="CS302 Web Architectures" required>
                    </div>
                    <div class="form-group">
                        <label>Max Points</label>
                        <input type="number" id="asgPoints" class="form-control" value="100" min="10">
                    </div>
                </div>
                <div class="form-group">
                    <label>Target Due Date & Time <span class="required">*</span></label>
                    <input type="datetime-local" id="asgDue" class="form-control" required>
                </div>
                <div class="form-group">
                    <label>Detailed Specifications & Instructions <span class="required">*</span></label>
                    <textarea id="asgInstructions" class="form-control" rows="3" placeholder="Submission guidelines..." required></textarea>
                </div>
            </form>
        `;

        openModal('Publish Course Assignment', body, `
            <button class="btn-secondary" onclick="closeModal()">Cancel</button>
            <button class="btn-primary" id="btnSubmitNewAsg">Publish Assignment</button>
        `);

        document.getElementById('btnSubmitNewAsg').addEventListener('click', () => {
            const title = document.getElementById('asgTitle').value.trim();
            const course = document.getElementById('asgCourse').value.trim();
            const max_points = document.getElementById('asgPoints').value;
            const due_date = document.getElementById('asgDue').value;
            const instructions = document.getElementById('asgInstructions').value.trim();

            if (!title || !course || !due_date) {
                showToast('Please complete required fields.', 'error');
                return;
            }

            db.createAssignment({ title, course, max_points, due_date, instructions });
            closeModal();
            showToast('Assignment published to students.', 'success');
            renderAssignmentsModule();
        });
    };

    window.handleDeleteAssignment = (id) => {
        if (confirm('Delete this assignment?')) {
            db.deleteAssignment(id);
            renderAssignmentsModule();
        }
    };

    // =========================================================================
    // MODULE 8: CAMPUS FACILITY BOOKING SYSTEM
    // =========================================================================
    const renderFacilitiesModule = () => {
        const isAdmin = currentUser && currentUser.role === 'admin';
        const facilities = db.getFacilities();
        const bookings = db.getBookings(isAdmin ? null : currentUser.id);

        portalContent.innerHTML = `
            <div class="module-header">
                <div class="module-title-group">
                    <h2>
                        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="4" y="2" width="16" height="20" rx="2" ry="2"></rect><line x1="9" y1="22" x2="9" y2="22.01"></line><line x1="15" y1="22" x2="15" y2="22.01"></line><line x1="8" y1="6" x2="8" y2="6.01"></line><line x1="16" y1="6" x2="16" y2="6.01"></line><line x1="8" y1="10" x2="8" y2="10.01"></line><line x1="16" y1="10" x2="16" y2="10.01"></line><line x1="8" y1="14" x2="8" y2="14.01"></line><line x1="16" y1="14" x2="16" y2="14.01"></line></svg>
                        Campus Facility Booking System
                    </h2>
                    <p>Reserve university computer laboratories, seminar halls, study pods, and sports facilities with automated conflict checking.</p>
                </div>
                <div class="module-actions">
                    <button class="btn-primary" id="btnBookFacilityNow">+ Book Facility</button>
                    ${isAdmin ? `<button class="btn-secondary" id="btnAddFacility">+ Add Space</button>` : ''}
                </div>
            </div>

            ${getAdminControlHeader('Campus Facilities & Reservation Schedule')}

            <h3 class="section-heading">Available Campus Facilities</h3>
            <div class="card-grid">
                ${facilities.map(fac => `
                    <div class="card">
                        <div class="card-top">
                            <span class="badge badge-academic">${escapeHtml(fac.type)}</span>
                            <span style="font-size:0.75rem; color:var(--text-muted);">Cap: ${fac.capacity} people</span>
                        </div>
                        <h3 class="card-title">${escapeHtml(fac.name)}</h3>
                        <div class="card-meta-list" style="border-top:none; padding-top:0;">
                            <div class="card-meta-item">
                                <strong>Operating Hours:</strong> <span>${escapeHtml(fac.open_hours)}</span>
                            </div>
                            <div class="card-meta-item">
                                <strong>Equipment:</strong> <span style="font-size:0.75rem;">${escapeHtml(fac.equipment)}</span>
                            </div>
                        </div>
                        <div class="card-footer">
                            <button class="btn-primary" onclick="window.openReserveModalForFacility('${fac.id}')">Select & Reserve</button>
                            ${isAdmin ? `
                                <button class="btn-danger-outline" onclick="window.handleDeleteFacility('${fac.id}')">Remove Space</button>
                            ` : ''}
                        </div>
                    </div>
                `).join('')}
            </div>

            <!-- Bookings Schedule Table -->
            <div class="section-block">
                <h3 class="section-heading">
                    ${isAdmin ? 'All University Facility Reservations Ledger' : 'My Active Facility Reservations'}
                </h3>
                <div class="table-responsive">
                    <table class="data-table">
                        <thead>
                            <tr>
                                <th>Facility</th>
                                ${isAdmin ? '<th>Reserved By</th>' : ''}
                                <th>Date</th>
                                <th>Time Slot</th>
                                <th>Purpose</th>
                                <th>Status</th>
                                <th>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${bookings.length ? bookings.map(b => `
                                <tr>
                                    <td><strong>${escapeHtml(b.facility_name)}</strong></td>
                                    ${isAdmin ? `<td>${escapeHtml(b.student_name)}</td>` : ''}
                                    <td>${b.date}</td>
                                    <td><span style="font-weight:600;">${b.time_slot}</span></td>
                                    <td><small>${escapeHtml(b.purpose)}</small></td>
                                    <td><span class="badge ${b.status === 'Approved' ? 'badge-success' : 'badge-danger'}">${b.status}</span></td>
                                    <td>
                                        ${b.status !== 'Cancelled' ? `
                                            <button class="btn-secondary" style="font-size:0.75rem; color:var(--status-danger);" onclick="window.cancelFacilityBooking('${b.id}')">Cancel</button>
                                        ` : `<span>Cancelled</span>`}
                                    </td>
                                </tr>
                            `).join('') : emptyTableRow(isAdmin ? 7 : 6, 'No active reservations found.')}
                        </tbody>
                    </table>
                </div>
            </div>
        `;

        document.getElementById('btnBookFacilityNow').addEventListener('click', () => {
            window.openReserveModalForFacility();
        });

        if (isAdmin && document.getElementById('btnAddFacility')) {
            document.getElementById('btnAddFacility').addEventListener('click', openAddFacilityModal);
        }
    };

    window.openReserveModalForFacility = (presetFacilityId = null) => {
        const facilities = db.getFacilities();

        const body = `
            <form>
                <div class="form-group">
                    <label>Select Campus Facility <span class="required">*</span></label>
                    <select id="resFacId" class="form-control" required>
                        ${facilities.map(f => `
                            <option value="${f.id}" ${presetFacilityId === f.id ? 'selected' : ''}>
                                ${escapeHtml(f.name)} (${escapeHtml(f.type)})
                            </option>
                        `).join('')}
                    </select>
                </div>
                <div class="form-row">
                    <div class="form-group">
                        <label>Reservation Date <span class="required">*</span></label>
                        <input type="date" id="resDate" class="form-control" value="${daysFromToday(1)}" min="${localDateStr()}" required>
                    </div>
                    <div class="form-group">
                        <label>Time Slot <span class="required">*</span></label>
                        <select id="resTimeSlot" class="form-control" required>
                            <option value="09:00 - 11:00">09:00 - 11:00 (Morning A)</option>
                            <option value="11:00 - 13:00">11:00 - 13:00 (Morning B)</option>
                            <option value="14:00 - 16:00" selected>14:00 - 16:00 (Afternoon A)</option>
                            <option value="16:00 - 18:00">16:00 - 18:00 (Afternoon B)</option>
                            <option value="18:00 - 20:00">18:00 - 20:00 (Evening)</option>
                        </select>
                    </div>
                </div>
                <div class="form-group">
                    <label>Purpose of Reservation <span class="required">*</span></label>
                    <input type="text" id="resPurpose" class="form-control" placeholder="e.g. AI Study Group Sprint or Seminar Prep" required>
                </div>
            </form>
        `;

        openModal('Reserve Campus Space', body, `
            <button class="btn-secondary" onclick="closeModal()">Cancel</button>
            <button class="btn-primary" id="btnSubmitReserve">Confirm Booking</button>
        `);

        document.getElementById('btnSubmitReserve').addEventListener('click', () => {
            const facilityId = document.getElementById('resFacId').value;
            const date = document.getElementById('resDate').value;
            const timeSlot = document.getElementById('resTimeSlot').value;
            const purpose = document.getElementById('resPurpose').value.trim();

            if (!date || !purpose) {
                showToast('Please specify date and purpose.', 'error');
                return;
            }

            try {
                db.createBooking({ facilityId, user: currentUser, date, timeSlot, purpose });
                closeModal();
                showToast('Facility reservation confirmed without schedule conflicts.', 'success');
                renderFacilitiesModule();
            } catch (error) {
                showToast(error.message, 'error');
            }
        });
    };

    window.cancelFacilityBooking = (id) => {
        db.updateBookingStatus(id, 'Cancelled');
        showToast('Reservation cancelled.', 'info');
        renderFacilitiesModule();
    };

    const openAddFacilityModal = () => {
        const body = `
            <div class="form-group">
                <label>Facility Name <span class="required">*</span></label>
                <input type="text" id="fcName" class="form-control" placeholder="e.g. Robotics Prototyping Workshop" required>
            </div>
            <div class="form-row">
                <div class="form-group">
                    <label>Facility Type</label>
                    <input type="text" id="fcType" class="form-control" placeholder="Laboratory">
                </div>
                <div class="form-group">
                    <label>Capacity</label>
                    <input type="number" id="fcCap" class="form-control" value="30">
                </div>
            </div>
            <div class="form-group">
                <label>Available Equipment & Hardware</label>
                <input type="text" id="fcEquip" class="form-control" placeholder="3D Printers, Soldering stations, High-power supply">
            </div>
            <div class="form-group">
                <label>Operating Hours</label>
                <input type="text" id="fcHours" class="form-control" value="09:00 - 21:00">
            </div>
        `;
        openModal('Add Campus Facility', body, `
            <button class="btn-secondary" onclick="closeModal()">Cancel</button>
            <button class="btn-primary" id="btnSubmitAddFac">Save Space</button>
        `);

        document.getElementById('btnSubmitAddFac').addEventListener('click', () => {
            const name = document.getElementById('fcName').value.trim();
            const type = document.getElementById('fcType').value.trim();
            const capacity = document.getElementById('fcCap').value;
            const equipment = document.getElementById('fcEquip').value.trim();
            const open_hours = document.getElementById('fcHours').value.trim();

            if (!name) {
                showToast('Facility name is required.', 'error');
                return;
            }
            db.createFacility({ name, type, capacity, equipment, open_hours });
            closeModal();
            showToast('Facility added.', 'success');
            renderFacilitiesModule();
        });
    };

    window.handleDeleteFacility = (id) => {
        if (confirm('Delete this facility?')) {
            db.deleteFacility(id);
            renderFacilitiesModule();
        }
    };

    // =========================================================================
    // MODULE 9: CAMPUS MEDIA / MOVIE HUB
    // =========================================================================
    let mediaGenreFilter = 'All';

    const renderMediaModule = () => {
        const isAdmin = currentUser && currentUser.role === 'admin';
        const mediaList = db.getMedia();
        const reservations = db.getMediaReservations();

        // Genre dropdown options come from the screenings themselves
        const genres = [...new Set(mediaList.map(m => m.genre))].sort();
        if (mediaGenreFilter !== 'All' && !genres.includes(mediaGenreFilter)) mediaGenreFilter = 'All';
        const filtered = mediaGenreFilter === 'All'
            ? mediaList
            : mediaList.filter(m => m.genre === mediaGenreFilter);

        portalContent.innerHTML = `
            <div class="module-header">
                <div class="module-title-group">
                    <h2>
                        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="2" width="20" height="20" rx="2.18" ry="2.18"></rect><line x1="7" y1="2" x2="7" y2="22"></line><line x1="17" y1="2" x2="17" y2="22"></line><line x1="2" y1="12" x2="22" y2="12"></line><line x1="2" y1="7" x2="7" y2="7"></line><line x1="2" y1="17" x2="7" y2="17"></line><line x1="17" y1="17" x2="22" y2="17"></line><line x1="17" y1="7" x2="22" y2="7"></line></svg>
                        Campus Media & Film Hub
                    </h2>
                    <p>Curated educational screenings, guest tech keynotes, and international cultural cinema nights.</p>
                </div>
                <div class="module-actions">
                    ${isAdmin ? `<button class="btn-primary" id="btnAddMedia">+ Add Screening</button>` : ''}
                </div>
            </div>

            ${getAdminControlHeader('Campus Media Schedule & Curated Screenings')}

            <div class="notice-filter-bar">
                <select id="selectMediaGenre" class="form-control filter-select" aria-label="Filter by genre">
                    <option value="All">All genres</option>
                    ${genres.map(g => `<option value="${escapeHtml(g)}" ${g === mediaGenreFilter ? 'selected' : ''}>${escapeHtml(g)}</option>`).join('')}
                </select>
                <span class="notice-result-count">Showing ${filtered.length} of ${mediaList.length} screenings</span>
            </div>

            <div class="card-grid">
                ${filtered.length ? '' : `<div class="card empty-card">No screenings in this genre.</div>`}
                ${filtered.map(med => {
                    const seats = reservations.filter(r => r.media_id === med.id);
                    const iReserved = seats.some(r => r.user_id === currentUser.id);
                    return `
                    <div class="card">
                        <div class="card-top">
                            <span class="badge badge-academic">${escapeHtml(med.genre)}</span>
                            <span style="color:#F59E0B; font-weight:700;">★ ${med.rating}</span>
                        </div>
                        <h3 class="card-title">${escapeHtml(med.title)}</h3>
                        <p class="card-desc">${escapeHtml(med.synopsis)}</p>
                        <div class="card-meta-list">
                            <div class="card-meta-item">
                                <strong>Screening Time:</strong> <span>${escapeHtml(med.screening_date)}</span>
                            </div>
                            <div class="card-meta-item">
                                <strong>Campus Hall:</strong> <span>${escapeHtml(med.hall)}</span>
                            </div>
                            <div class="card-meta-item">
                                <strong>Runtime:</strong> <span>${escapeHtml(med.duration)}</span>
                            </div>
                            <div class="card-meta-item">
                                <strong>Seats reserved:</strong> <span>${seats.length}</span>
                            </div>
                        </div>
                        <div class="card-footer">
                            <button class="btn-primary" onclick="window.viewMediaDetails('${med.id}')">View Details</button>
                            ${isAdmin
                                ? `<button class="btn-danger-outline" onclick="window.handleDeleteMedia('${med.id}')">Delete</button>`
                                : (iReserved ? `<span class="badge badge-success">Seat Reserved ✓</span>` : '')}
                        </div>
                    </div>
                `;
                }).join('')}
            </div>
        `;

        document.getElementById('selectMediaGenre').addEventListener('change', (e) => {
            mediaGenreFilter = e.target.value;
            renderMediaModule();
        });

        if (isAdmin && document.getElementById('btnAddMedia')) {
            document.getElementById('btnAddMedia').addEventListener('click', openAddMediaModal);
        }
    };

    window.viewMediaDetails = (id) => {
        const item = db.getMedia().find(m => m.id === id);
        if (!item) return;

        const body = `
            <div style="margin-bottom:1rem;">
                <span class="badge badge-academic">${escapeHtml(item.genre)}</span>
                <span style="color:#F59E0B; font-weight:700; margin-left:0.5rem;">★ ${item.rating} / 5.0</span>
            </div>
            <h3 style="font-size:1.3rem; color:var(--primary); margin-bottom:0.75rem;">${escapeHtml(item.title)}</h3>
            <p style="font-size:0.9rem; line-height:1.5; color:var(--text-main); margin-bottom:1.25rem;">
                ${escapeHtml(item.synopsis)}
            </p>
            <div style="background:#F8FAFC; border:1px solid var(--border-subtle); border-radius:var(--radius-md); padding:1rem; font-size:0.85rem;">
                <div style="margin-bottom:0.4rem;"><strong>Location:</strong> ${escapeHtml(item.hall)}</div>
                <div style="margin-bottom:0.4rem;"><strong>Screening Schedule:</strong> ${escapeHtml(item.screening_date)}</div>
                <div><strong>Admission:</strong> Free for all enrolled students & faculty.</div>
            </div>
        `;

        // Students can reserve or cancel a seat; admins only view the details
        const iReserved = db.getMediaReservations(id).some(r => r.user_id === currentUser.id);
        let actionBtn = '';
        if (currentUser.role !== 'admin') {
            actionBtn = iReserved
                ? `<button class="btn-secondary" onclick="window.handleCancelMediaSeat('${item.id}')">Cancel My Seat</button>`
                : `<button class="btn-primary" onclick="window.handleReserveMediaSeat('${item.id}')">Confirm Seat Reservation</button>`;
        }

        openModal('Media Screening Details', body, `
            <button class="btn-secondary" onclick="closeModal()">Back</button>
            ${actionBtn}
        `);
    };

    window.handleReserveMediaSeat = (id) => {
        try {
            db.reserveMediaSeat(id, currentUser);
            closeModal();
            showToast('Seat reserved for screening!', 'success');
            renderMediaModule();
        } catch (error) {
            showToast(error.message, 'error');
        }
    };

    window.handleCancelMediaSeat = (id) => {
        db.cancelMediaSeat(id, currentUser.id);
        closeModal();
        showToast('Seat reservation cancelled.', 'info');
        renderMediaModule();
    };

    const openAddMediaModal = () => {
        const body = `
            <div class="form-group">
                <label>Media / Film Title <span class="required">*</span></label>
                <input type="text" id="mdTitle" class="form-control" placeholder="e.g. The Imitation Game" required>
            </div>
            <div class="form-row">
                <div class="form-group">
                    <label>Genre</label>
                    <input type="text" id="mdGenre" class="form-control" placeholder="Drama / Cryptography">
                </div>
                <div class="form-group">
                    <label>Rating (out of 5)</label>
                    <input type="number" id="mdRating" class="form-control" value="4.5" step="0.1" min="0" max="5">
                </div>
            </div>
            <div class="form-group">
                <label>Runtime</label>
                <input type="text" id="mdDuration" class="form-control" placeholder="e.g. 115 min">
            </div>
            <div class="form-row">
                <div class="form-group">
                    <label>Screening Date & Time <span class="required">*</span></label>
                    <input type="text" id="mdDate" class="form-control" placeholder="2026-12-20 18:00" required>
                </div>
                <div class="form-group">
                    <label>Screening Hall</label>
                    <input type="text" id="mdHall" class="form-control" placeholder="Global Cinema Room B">
                </div>
            </div>
            <div class="form-group">
                <label>Synopsis <span class="required">*</span></label>
                <textarea id="mdSyn" class="form-control" rows="3" placeholder="Movie synopsis..." required></textarea>
            </div>
        `;
        openModal('Add Campus Media Screening', body, `
            <button class="btn-secondary" onclick="closeModal()">Cancel</button>
            <button class="btn-primary" id="btnSubmitMedia">Publish Screening</button>
        `);

        document.getElementById('btnSubmitMedia').addEventListener('click', () => {
            const title = document.getElementById('mdTitle').value.trim();
            const genre = document.getElementById('mdGenre').value.trim();
            const rating = document.getElementById('mdRating').value;
            const screening_date = document.getElementById('mdDate').value.trim();
            const hall = document.getElementById('mdHall').value.trim();
            const synopsis = document.getElementById('mdSyn').value.trim();
            const duration = document.getElementById('mdDuration').value.trim();

            if (!title || !screening_date || !synopsis) {
                showToast('Title, screening date and synopsis are required.', 'error');
                return;
            }

            db.createMedia({ title, genre, rating, duration, screening_date, hall, synopsis });
            closeModal();
            showToast('Screening added.', 'success');
            renderMediaModule();
        });
    };

    window.handleDeleteMedia = (id) => {
        if (confirm('Delete this media screening?')) {
            db.deleteMedia(id);
            renderMediaModule();
        }
    };

    // =========================================================================
    // MODULE 10: STUDENT COUNSELING APPOINTMENT SYSTEM
    // =========================================================================
    const renderCounselingModule = () => {
        const isAdmin = currentUser && currentUser.role === 'admin';
        const counselors = db.getCounselors();
        const appointments = db.getAppointments(isAdmin ? null : currentUser.id);

        portalContent.innerHTML = `
            <div class="module-header">
                <div class="module-title-group">
                    <h2>
                        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 12h-4l-3 9L9 3l-3 9H2"></path></svg>
                        Student Counseling Appointment System
                    </h2>
                    <p>Confidential psychological counseling, career roadmap advising, and cross-cultural transition support.</p>
                </div>
                <div class="module-actions">
                    <button class="btn-primary" id="btnBookCounselingNow">+ Request Counseling Session</button>
                </div>
            </div>

            ${getAdminControlHeader('Counseling Staff & Appointment Administration')}

            <h3 class="section-heading">Campus Counseling Specialists</h3>
            <div class="card-grid">
                ${counselors.map(cns => `
                    <div class="card">
                        <div class="card-top">
                            <span class="badge badge-scholarship">Certified Specialist</span>
                            <span style="font-size:0.75rem; color:var(--text-muted);">${escapeHtml(cns.available_days)}</span>
                        </div>
                        <h3 class="card-title">${escapeHtml(cns.name)}</h3>
                        <p style="font-size:0.85rem; color:var(--text-muted); margin-bottom:0.75rem;">${escapeHtml(cns.title)}</p>
                        <div class="card-meta-list">
                            <div class="card-meta-item">
                                <strong>Specialization:</strong> <span>${escapeHtml(cns.specialization)}</span>
                            </div>
                            <div class="card-meta-item">
                                <strong>Office:</strong> <span>${escapeHtml(cns.office)}</span>
                            </div>
                        </div>
                        <div class="card-footer">
                            <button class="btn-primary" onclick="window.openBookCounselingModal('${cns.id}')">Book Appointment</button>
                        </div>
                    </div>
                `).join('')}
            </div>

            <!-- Appointments History Table -->
            <div class="section-block">
                <h3 class="section-heading">
                    ${isAdmin ? 'All University Counseling Consultations' : 'My Counseling Appointments History'}
                </h3>
                <div class="table-responsive">
                    <table class="data-table">
                        <thead>
                            <tr>
                                <th>Specialist</th>
                                ${isAdmin ? '<th>Student</th>' : ''}
                                <th>Date & Time Slot</th>
                                <th>Session Mode</th>
                                <th>Status</th>
                                <th>Counselor Confidential Notes</th>
                                <th>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${appointments.length ? appointments.map(a => `
                                <tr>
                                    <td><strong>${escapeHtml(a.counselor_name)}</strong></td>
                                    ${isAdmin ? `<td>${escapeHtml(a.student_name)}</td>` : ''}
                                    <td>${a.date} &bull; ${a.time_slot}</td>
                                    <td><span class="badge badge-neutral">${escapeHtml(a.session_type)}</span></td>
                                    <td><span class="badge ${a.status === 'Scheduled' ? 'badge-academic' : (a.status === 'Completed' ? 'badge-success' : 'badge-danger')}">${a.status}</span></td>
                                    <td><small style="color:var(--text-muted);">${escapeHtml(a.notes || 'In review')}</small></td>
                                    <td>
                                        ${isAdmin ? `
                                            <button class="btn-secondary" style="font-size:0.75rem;" onclick="window.openUpdateAppointmentModal('${a.id}')">Manage Session</button>
                                        ` : `
                                            ${a.status === 'Scheduled' ? `
                                                <button class="btn-secondary" style="font-size:0.75rem; color:var(--status-danger);" onclick="window.cancelAppointment('${a.id}')">Cancel</button>
                                            ` : '<span>Finished</span>'}
                                        `}
                                    </td>
                                </tr>
                            `).join('') : emptyTableRow(isAdmin ? 7 : 6, 'No counseling appointments recorded.')}
                        </tbody>
                    </table>
                </div>
            </div>
        `;

        document.getElementById('btnBookCounselingNow').addEventListener('click', () => {
            window.openBookCounselingModal();
        });
    };

    window.openBookCounselingModal = (presetCounselorId = null) => {
        const counselors = db.getCounselors();

        const body = `
            <form>
                <div class="form-group">
                    <label>Select Counselor / Advisor <span class="required">*</span></label>
                    <select id="cnsSelect" class="form-control" required>
                        ${counselors.map(c => `
                            <option value="${c.id}" ${presetCounselorId === c.id ? 'selected' : ''}>
                                ${escapeHtml(c.name)} (${escapeHtml(c.available_days)})
                            </option>
                        `).join('')}
                    </select>
                </div>
                <div class="form-row">
                    <div class="form-group">
                        <label>Preferred Date <span class="required">*</span></label>
                        <input type="date" id="cnsDate" class="form-control" value="${daysFromToday(1)}" min="${localDateStr()}" required>
                    </div>
                    <div class="form-group">
                        <label>Time Slot <span class="required">*</span></label>
                        <select id="cnsSlot" class="form-control" required>
                            <option value="10:00 - 10:50">10:00 - 10:50 AM</option>
                            <option value="11:00 - 11:50">11:00 - 11:50 AM</option>
                            <option value="14:00 - 14:50" selected>14:00 - 14:50 PM</option>
                            <option value="15:00 - 15:50">15:00 - 15:50 PM</option>
                            <option value="16:00 - 16:50">16:00 - 16:50 PM</option>
                        </select>
                    </div>
                </div>
                <div class="form-group">
                    <label>Session Format <span class="required">*</span></label>
                    <select id="cnsFormat" class="form-control">
                        <option value="In-Person (Counseling Office)">In-Person (Student Wellness Center Room 104)</option>
                        <option value="Online Video Call (Zoom)">Online Video Call (Confidential Zoom Link)</option>
                    </select>
                </div>
                <div class="form-group">
                    <label>Primary Topic of Consultation <span class="required">*</span></label>
                    <textarea id="cnsReason" class="form-control" rows="3" placeholder="Briefly describe what you would like to discuss..." required></textarea>
                </div>
            </form>
        `;

        openModal('Request Counseling Appointment', body, `
            <button class="btn-secondary" onclick="closeModal()">Cancel</button>
            <button class="btn-primary" id="btnSubmitAppointment">Confirm Appointment</button>
        `);

        document.getElementById('btnSubmitAppointment').addEventListener('click', () => {
            const counselorId = document.getElementById('cnsSelect').value;
            const date = document.getElementById('cnsDate').value;
            const timeSlot = document.getElementById('cnsSlot').value;
            const sessionType = document.getElementById('cnsFormat').value;
            const reason = document.getElementById('cnsReason').value.trim();

            if (!date || !reason) {
                showToast('Please specify date and consultation topic.', 'error');
                return;
            }

            try {
                db.createAppointment({ counselorId, user: currentUser, date, timeSlot, sessionType, reason });
                closeModal();
                showToast('Counseling appointment scheduled.', 'success');
                renderCounselingModule();
            } catch (error) {
                showToast(error.message, 'error');
            }
        });
    };

    window.cancelAppointment = (id) => {
        db.updateAppointmentStatus(id, 'Cancelled', 'Cancelled by student request.');
        showToast('Appointment cancelled.', 'info');
        renderCounselingModule();
    };

    window.openUpdateAppointmentModal = (aptId) => {
        const apts = db.getAppointments();
        const a = apts.find(x => x.id === aptId);
        if (!a) return;

        const body = `
            <p><strong>Student:</strong> ${escapeHtml(a.student_name)}</p>
            <p><strong>Topic:</strong> ${escapeHtml(a.reason)}</p>
            <div class="form-group" style="margin-top:1rem;">
                <label>Status</label>
                <select id="aptStatus" class="form-control">
                    <option value="Scheduled" ${a.status === 'Scheduled' ? 'selected' : ''}>Scheduled</option>
                    <option value="Completed" ${a.status === 'Completed' ? 'selected' : ''}>Completed</option>
                    <option value="Cancelled" ${a.status === 'Cancelled' ? 'selected' : ''}>Cancelled</option>
                </select>
            </div>
            <div class="form-group">
                <label>Counselor Confidential Advice / Record Notes</label>
                <textarea id="aptNotes" class="form-control" rows="3">${escapeHtml(a.notes || '')}</textarea>
            </div>
        `;

        openModal('Manage Counseling Session', body, `
            <button class="btn-secondary" onclick="closeModal()">Cancel</button>
            <button class="btn-primary" id="btnSaveAptStatus">Update Session</button>
        `);

        document.getElementById('btnSaveAptStatus').addEventListener('click', () => {
            const st = document.getElementById('aptStatus').value;
            const notes = document.getElementById('aptNotes').value.trim();
            db.updateAppointmentStatus(aptId, st, notes);
            closeModal();
            showToast('Counseling record updated.', 'success');
            renderCounselingModule();
        });
    };

    // =========================================================================
    // 4. BOOTSTRAP ACTIVE SESSION
    // =========================================================================
    const activeSession = db.getSession();
    if (activeSession) {
        renderAuthenticatedState(activeSession);
    }
});

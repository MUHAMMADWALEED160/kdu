/**
 * Kyungdong University Global (KDU Global) - Unified Local Database Engine
 * 100% Client-Side LocalStorage Database for all 10 University Portal Systems
 * Zero external cloud or CDN dependencies. Pre-seeded with rich KDU Global sample data.
 */

const KDU_KEYS = {
    USERS: 'kdu_v2_users',
    SESSION: 'kdu_v2_session',
    NOTICES: 'kdu_v2_notices',
    LOST_FOUND: 'kdu_v2_lost_found',
    EVENTS: 'kdu_v2_events',
    EVENT_REGISTRATIONS: 'kdu_v2_event_regs',
    BOOKS: 'kdu_v2_books',
    BOOK_BORROWS: 'kdu_v2_book_borrows',
    CLUBS: 'kdu_v2_clubs',
    CLUB_MEMBERS: 'kdu_v2_club_members',
    CLUB_POSTS: 'kdu_v2_club_posts',
    FEEDBACK: 'kdu_v2_feedback',
    QUIZZES: 'kdu_v2_quizzes',
    QUIZ_ATTEMPTS: 'kdu_v2_quiz_attempts',
    ASSIGNMENTS: 'kdu_v2_assignments',
    SUBMISSIONS: 'kdu_v2_submissions',
    FACILITIES: 'kdu_v2_facilities',
    BOOKINGS: 'kdu_v2_bookings',
    MEDIA: 'kdu_v2_media',
    MEDIA_RESERVATIONS: 'kdu_v2_media_reservations',
    COUNSELORS: 'kdu_v2_counselors',
    APPOINTMENTS: 'kdu_v2_appointments'
};

// Today's date as "YYYY-MM-DD" in the user's LOCAL time zone
// (toISOString() uses UTC, which gives the wrong day late at night in Korea/Pakistan)
function localDateStr(d = new Date()) {
    const pad = (n) => String(n).padStart(2, '0');
    return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate());
}

// Date N days from today as "YYYY-MM-DD"
function daysFromToday(n) {
    return localDateStr(new Date(Date.now() + n * 86400000));
}

// =============================================================================
// SEED DATA GENERATORS
// =============================================================================
const SEED_USERS = [
    {
        id: 'usr_student_1',
        email: 'student@kduniv.ac.kr',
        password: 'password123',
        role: 'student',
        full_name: 'Min-Jun Kim',
        student_id: '2026-KD1042',
        department: 'Global Computing & AI',
        semester: 'Spring 2026',
        created_at: new Date().toISOString()
    },
    {
        id: 'usr_admin_1',
        email: 'admin@kduniv.ac.kr',
        password: 'admin123',
        role: 'admin',
        full_name: 'Prof. David Park (Director)',
        student_id: 'KDU-ADM-01',
        department: 'Academic & Student Affairs',
        semester: 'Faculty / Staff',
        created_at: new Date().toISOString()
    }
];

const SEED_NOTICES = [
    {
        id: 'not_1',
        title: 'Spring 2026 Course Registration & Add/Drop Schedule',
        category: 'Academic',
        priority: 'Important',
        content: 'Course add/drop revision period runs from March 3 to March 10. Students must confirm minimum credit requirements with their academic advisors prior to final submission.',
        created_at: new Date(Date.now() - 1 * 86400000).toISOString()
    },
    {
        id: 'not_2',
        title: 'Kyungdong Global Merit & Leadership Scholarship Applications Open',
        category: 'Scholarship',
        priority: 'Urgent',
        content: 'Applications for international and domestic merit scholarships are now being accepted. Cumulative GPA of 3.5 or higher required. Submit documents to the Student Affairs office before 17:00 KST.',
        created_at: new Date(Date.now() - 3 * 86400000).toISOString()
    },
    {
        id: 'not_3',
        title: 'Global Student Mentorship & Cultural Exchange Night',
        category: 'Global Affairs',
        priority: 'Normal',
        content: 'Join fellow international students at the Global Lounge (Building B, Room 204) this Thursday at 18:00 for cross-cultural networking, language exchange, and Korean traditional snacks.',
        created_at: new Date(Date.now() - 5 * 86400000).toISOString()
    },
    {
        id: 'not_4',
        title: 'Central Library Extended 24/7 Hours for Midterm Exam Prep',
        category: 'Campus Life',
        priority: 'Normal',
        content: 'In preparation for examinations, library floors 1-3 and private study pods will operate 24 hours daily. Student digital ID card scanning required after 22:00.',
        created_at: new Date(Date.now() - 7 * 86400000).toISOString()
    }
];

const SEED_LOST_FOUND = [
    {
        id: 'lf_1',
        title: 'Black iPad Pro with Pencil',
        location: 'Global Building B, Room 302',
        type: 'Found',
        status: 'Found',
        date: '2026-11-21',
        contact: 'Security Office (Ext. 2104)',
        posted_by: 'usr_admin_1',
        description: 'Found on the back desk after CS302 lecture. Screen locked with dark blue magnetic cover.'
    },
    {
        id: 'lf_2',
        title: 'Leather Wallet with Student ID',
        location: 'Cafeteria Floor 1',
        type: 'Lost',
        status: 'Lost',
        date: '2026-11-22',
        contact: 'student@kduniv.ac.kr',
        posted_by: 'usr_student_1',
        description: 'Brown leather cardholder containing KDU student card and ARC card. Reward offered for return.'
    },
    {
        id: 'lf_3',
        title: 'AirPods Pro Gen 2 Case',
        location: 'Central Library 2nd Floor Pod 4',
        type: 'Found',
        status: 'Claimed',
        date: '2026-11-19',
        contact: 'Library Help Desk',
        posted_by: 'usr_admin_1',
        description: 'White case with a transparent astronaut sticker. Claimed by owner on Nov 20.'
    }
];

const SEED_EVENTS = [
    {
        id: 'evt_1',
        title: 'KDU International Cultural Festival & Food Fair',
        date: '2026-12-05 14:00',
        venue: 'Main Campus Plaza & Auditorium',
        organizer: 'International Student Association',
        capacity: 120,
        description: 'Experience cultural booths, performances, traditional attires, and street food from over 25 countries represented at KDU Global.'
    },
    {
        id: 'evt_2',
        title: 'AI & Cloud Computing Career Summit 2026',
        date: '2026-12-10 10:00',
        venue: 'Tech Innovation Hall A',
        organizer: 'School of Global Computing',
        capacity: 80,
        description: 'Keynotes from leading engineers at top tech firms in Korea, portfolio reviews, and internship recruiting sessions.'
    },
    {
        id: 'evt_3',
        title: 'Campus Hackathon: Smart Campus Solutions',
        date: '2026-12-18 09:00',
        venue: 'Engineering Lab 402',
        organizer: 'AI & Robotics Club',
        capacity: 40,
        description: '24-hour rapid prototyping hackathon focusing on AI applications for sustainable student campus life. Prizes for top 3 teams.'
    }
];

const SEED_EVENT_REGISTRATIONS = [
    {
        id: 'ereg_1',
        event_id: 'evt_1',
        user_id: 'usr_student_1',
        student_name: 'Min-Jun Kim',
        student_id: '2026-KD1042',
        registered_at: new Date(Date.now() - 2 * 86400000).toISOString()
    }
];

const SEED_BOOKS = [
    {
        id: 'bk_1',
        title: 'Designing Data-Intensive Applications',
        author: 'Martin Kleppmann',
        course_code: 'CS302',
        isbn: '978-1449373320',
        category: 'Computer Science',
        status: 'Available',
        borrowed_by: null,
        due_date: null
    },
    {
        id: 'bk_2',
        title: 'Artificial Intelligence: A Modern Approach (4th Ed.)',
        author: 'Stuart Russell & Peter Norvig',
        course_code: 'AI201',
        isbn: '978-0134610993',
        category: 'Computer Science',
        status: 'Borrowed',
        borrowed_by: 'usr_student_1',
        due_date: daysFromToday(8)
    },
    {
        id: 'bk_3',
        title: 'Principles of Corporate Finance',
        author: 'Richard Brealey, Stewart Myers',
        course_code: 'BIZ202',
        isbn: '978-1260013900',
        category: 'Business Administration',
        status: 'Available',
        borrowed_by: null,
        due_date: null
    },
    {
        id: 'bk_4',
        title: 'Academic Writing for International Students',
        author: 'Stephen Bailey',
        course_code: 'ENG101',
        isbn: '978-1138048737',
        category: 'Languages',
        status: 'Available',
        borrowed_by: null,
        due_date: null
    }
];

const SEED_BOOK_BORROWS = [
    {
        id: 'bb_1',
        book_id: 'bk_2',
        book_title: 'Artificial Intelligence: A Modern Approach (4th Ed.)',
        user_id: 'usr_student_1',
        student_name: 'Min-Jun Kim',
        borrowed_at: new Date(Date.now() - 6 * 86400000).toISOString(),
        due_date: daysFromToday(8),
        status: 'Active'
    }
];

const SEED_CLUBS = [
    {
        id: 'clb_1',
        name: 'AI & Robotics Society (AIRS)',
        category: 'Technology & Engineering',
        lead: 'Min-Jun Kim',
        room: 'Building C Room 104',
        members_count: 28,
        description: 'Dedicated to machine learning research, competitive coding, robotics builds, and hackathon participation.',
        activities: 'Weekly coding dojo on Tuesdays 18:00, monthly robotics build sprint.'
    },
    {
        id: 'clb_2',
        name: 'Global Cultural Exchange Club',
        category: 'Culture & Languages',
        lead: 'Sarah Jenkins',
        room: 'Global Lounge',
        members_count: 42,
        description: 'Promotes multicultural friendship, Korean-English language tandem, international cuisine tasting, and travel outings.',
        activities: 'Friday Language Café and monthly Seoul cultural exploration trips.'
    },
    {
        id: 'clb_3',
        name: 'KDU FinTech & Investment Circle',
        category: 'Finance & Business',
        lead: 'Ethan Tan',
        room: 'Business Hall 202',
        members_count: 22,
        description: 'Analyzes financial markets, decentralized finance, and quantitative stock analysis with mock trading tournaments.',
        activities: 'Bi-weekly portfolio presentations and guest alumni speaker panels.'
    }
];

const SEED_CLUB_MEMBERS = [
    {
        id: 'cm_1',
        club_id: 'clb_1',
        user_id: 'usr_student_1'
    }
];

const SEED_CLUB_POSTS = [
    {
        id: 'cp_1',
        club_id: 'clb_1',
        title: 'Deep Learning Workshop Series Announcement',
        content: 'We will be starting our hands-on PyTorch workshop series next Tuesday at 18:00 in Computer Lab 301. Bring your laptops with Python installed.',
        created_at: new Date(Date.now() - 2 * 86400000).toISOString()
    },
    {
        id: 'cp_2',
        club_id: 'clb_2',
        title: 'Language Café: Korean Idioms & Slang',
        content: 'Join us this Friday at the Global Lounge for Korean conversational practice with native speakers. All proficiency levels welcome!',
        created_at: new Date(Date.now() - 4 * 86400000).toISOString()
    }
];

const SEED_FEEDBACK = [
    {
        id: 'fb_1',
        user_id: 'usr_student_1',
        student_name: 'Min-Jun Kim',
        target: 'Course Instruction (CS302)',
        category: 'Academic',
        rating: 5,
        comment: 'The hands-on architecture laboratories are extremely practical and industry-relevant. Professor provides rapid feedback on coding assignments.',
        created_at: new Date(Date.now() - 3 * 86400000).toISOString()
    },
    {
        id: 'fb_2',
        user_id: 'usr_demo_2',
        student_name: 'Anna Schmidt',
        target: 'Cafeteria & Dining Services',
        category: 'Facilities',
        rating: 4,
        comment: 'Great vegetarian and Halal options added this semester. Would appreciate longer operating hours during midterm exams.',
        created_at: new Date(Date.now() - 5 * 86400000).toISOString()
    },
    {
        id: 'fb_3',
        user_id: 'usr_demo_3',
        student_name: 'Rajesh Patel',
        target: 'Central Library Wifi Speed',
        category: 'Facilities',
        rating: 5,
        comment: 'Wi-Fi 6 upgrade in the 3rd floor study pods has made research and large dataset downloads seamless.',
        created_at: new Date(Date.now() - 7 * 86400000).toISOString()
    }
];

const SEED_QUIZZES = [
    {
        id: 'qz_1',
        title: 'CS101: Web & Internet Architecture Fundamentals',
        course: 'CS101 Web Programming',
        time_limit_mins: 15,
        questions: [
            {
                id: 'q1_1',
                question: 'Which HTTP status code signifies that a requested resource was successfully created on the server?',
                options: ['200 OK', '201 Created', '204 No Content', '304 Not Modified'],
                correct: 1,
                explanation: 'HTTP 201 Created indicates that the request has succeeded and has resulted in the creation of a new resource.'
            },
            {
                id: 'q1_2',
                question: 'In client-side web storage, how does localStorage differ from sessionStorage?',
                options: [
                    'localStorage expires when the browser tab closes.',
                    'localStorage data persists indefinitely until cleared explicitly.',
                    'sessionStorage has a 50MB storage limit while localStorage has 1KB.',
                    'localStorage cannot store string data.'
                ],
                correct: 1,
                explanation: 'localStorage retains data across browser restarts with no expiration date, unlike sessionStorage which is tab-scoped.'
            },
            {
                id: 'q1_3',
                question: 'Which CSS layout system is natively designed for two-dimensional layout calculation (rows AND columns simultaneously)?',
                options: ['Flexbox', 'CSS Grid', 'Float layouts', 'Inline-block'],
                correct: 1,
                explanation: 'CSS Grid is specifically designed for 2D layouts (rows and columns), whereas Flexbox is primarily 1D.'
            },
            {
                id: 'q1_4',
                question: 'What is the purpose of the HTML5 semantic tag <main>?',
                options: [
                    'Contains header branding links.',
                    'Represents the dominant, unique content of the body of the document.',
                    'Creates a persistent sidebar navigation.',
                    'Executes background JavaScript.'
                ],
                correct: 1,
                explanation: 'The <main> tag represents the dominant content specific to that document, excluding repeated headers or footers.'
            }
        ]
    },
    {
        id: 'qz_2',
        title: 'AI201: Artificial Intelligence Core Principles',
        course: 'AI201 Intro to AI',
        time_limit_mins: 10,
        questions: [
            {
                id: 'q2_1',
                question: 'In search algorithms, A* Search uses the evaluation function f(n) = g(n) + h(n). What does h(n) represent?',
                options: [
                    'Cost to reach the current node from the start.',
                    'Estimated heuristic cost from node n to the goal.',
                    'Total number of nodes explored so far.',
                    'Depth of the current search tree.'
                ],
                correct: 1,
                explanation: 'h(n) is the heuristic estimate of the cheapest path from node n to the goal state.'
            },
            {
                id: 'q2_2',
                question: 'Which machine learning paradigm learns through trial-and-error by receiving positive or negative rewards from an environment?',
                options: ['Supervised Learning', 'Unsupervised Clustering', 'Reinforcement Learning', 'Semi-supervised Learning'],
                correct: 2,
                explanation: 'Reinforcement Learning trains agents to make sequences of decisions by maximizing cumulative reward signals.'
            }
        ]
    }
];

const SEED_QUIZ_ATTEMPTS = [
    {
        id: 'qa_1',
        quiz_id: 'qz_1',
        quiz_title: 'CS101: Web & Internet Architecture Fundamentals',
        user_id: 'usr_student_1',
        student_name: 'Min-Jun Kim',
        score: 100,
        total_questions: 4,
        correct_count: 4,
        submitted_at: new Date(Date.now() - 1 * 86400000).toISOString()
    }
];

const SEED_ASSIGNMENTS = [
    {
        id: 'asg_1',
        course: 'CS302 Web Architectures',
        title: 'Project Milestone 2: Responsive Full-Stack Dashboard',
        due_date: new Date(Date.now() + 4 * 86400000).toISOString(),
        max_points: 100,
        instructions: 'Deliver a responsive portal with modular CSS variables, local data persistence, and comprehensive validation. Submit your GitHub repo URL and summary report.'
    },
    {
        id: 'asg_2',
        course: 'AI201 Machine Learning',
        title: 'Assignment 3: Convolutional Neural Network on CIFAR-10',
        due_date: new Date(Date.now() + 7 * 86400000).toISOString(),
        max_points: 100,
        instructions: 'Implement a CNN achieving >= 80% accuracy on the test split. Submit a Jupyter Notebook and PDF evaluation loss curves.'
    },
    {
        id: 'asg_3',
        course: 'ENG101 Academic English',
        title: 'Critical Essay: AI Ethics in Higher Education',
        due_date: new Date(Date.now() - 1 * 86400000).toISOString(),
        max_points: 50,
        instructions: '1,500-word argumentative essay with APA 7th edition referencing. Focus on academic integrity and automated grading.'
    }
];

const SEED_SUBMISSIONS = [
    {
        id: 'sub_1',
        assignment_id: 'asg_3',
        user_id: 'usr_student_1',
        student_name: 'Min-Jun Kim',
        student_id: '2026-KD1042',
        submission_text: 'Submitted final essay draft via university cloud storage link: https://kdu-storage.local/essay_minjun.pdf',
        file_name: 'essay_minjun_ai_ethics.pdf',
        submitted_at: new Date(Date.now() - 2 * 86400000).toISOString(),
        status: 'Graded',
        grade: '48 / 50 (A+)',
        feedback: 'Excellent synthesis of ethical considerations with compelling arguments on pedagogical integrity. Well-referenced citations.'
    }
];

const SEED_FACILITIES = [
    {
        id: 'fac_1',
        name: 'AI & Data Science High-Performance Lab (Room 301)',
        type: 'Computer Laboratory',
        capacity: 45,
        equipment: '40x RTX 4080 Workstations, Dual 4K Monitors, Gigabit LAN',
        open_hours: '08:00 - 22:00'
    },
    {
        id: 'fac_2',
        name: 'Global Conference Hall & Auditorium',
        type: 'Auditorium',
        capacity: 250,
        equipment: 'Dolby Surround Sound, Dual HD Projectors, Translation Booths',
        open_hours: '09:00 - 21:00'
    },
    {
        id: 'fac_3',
        name: 'Study Pod Alpha (Floor 2)',
        type: 'Group Study Room',
        capacity: 6,
        equipment: 'Interactive Smart Board, Acoustic Soundproofing, Whiteboard',
        open_hours: '24 Hours'
    },
    {
        id: 'fac_4',
        name: 'Indoor Campus Gymnasium & Badminton Arena',
        type: 'Sports Facility',
        capacity: 60,
        equipment: '4 Badminton Courts, Maple Hardwood Flooring, Scoreboards',
        open_hours: '07:00 - 22:00'
    }
];

const SEED_BOOKINGS = [
    {
        id: 'bkg_1',
        facility_id: 'fac_3',
        facility_name: 'Study Pod Alpha (Floor 2)',
        user_id: 'usr_student_1',
        student_name: 'Min-Jun Kim',
        date: daysFromToday(2),
        time_slot: '14:00 - 16:00',
        purpose: 'AI Club Project Milestone Review',
        status: 'Approved'
    }
];

const SEED_MEDIA = [
    {
        id: 'med_1',
        title: 'Interstellar: Science & Cinema Analysis',
        genre: 'Sci-Fi / Astrophysics',
        rating: 4.9,
        duration: '169 min',
        screening_date: '2026-11-28 18:30',
        hall: 'Auditorium Hall B',
        synopsis: 'A team of explorers travel through a wormhole in space in an attempt to ensure humanity survival. Followed by a 20-minute astrophysics discussion.'
    },
    {
        id: 'med_2',
        title: 'The Social Dilemma: Tech Ethics Documentary',
        genre: 'Technology / Sociology',
        rating: 4.7,
        duration: '94 min',
        screening_date: '2026-12-02 17:00',
        hall: 'Global Lounge Screening Room',
        synopsis: 'Explores the dangerous human impact of social networking, with tech experts sounding the alarm on their own creations.'
    },
    {
        id: 'med_3',
        title: 'AlphaGo: The Journey of Artificial Intelligence',
        genre: 'AI & Data',
        rating: 4.8,
        duration: '90 min',
        screening_date: '2026-12-09 19:00',
        hall: 'Innovation Hub Room 101',
        synopsis: 'Chronicles the historic Go match in Seoul between world champion Lee Sedol and DeepMind groundbreaking AI program.'
    }
];

const SEED_COUNSELORS = [
    {
        id: 'cns_1',
        name: 'Dr. Ji-Hye Song, Ph.D.',
        title: 'Senior Counseling Psychologist',
        specialization: 'Academic Stress, Anxiety & Wellness',
        office: 'Student Wellness Center Room 104',
        available_days: 'Mon, Wed, Fri'
    },
    {
        id: 'cns_2',
        name: 'Prof. Marcus Williams',
        title: 'International Student Advisor',
        specialization: 'Cross-Cultural Adaptation & Visa Affairs',
        office: 'Global Affairs Center Room 201',
        available_days: 'Tue, Thu'
    },
    {
        id: 'cns_3',
        name: 'Counselor Su-Bin Lee',
        title: 'Career & Internship Strategist',
        specialization: 'Resume Review, Tech Interviews & Career Planning',
        office: 'Career Center Room 108',
        available_days: 'Mon, Tue, Thu, Fri'
    }
];

const SEED_APPOINTMENTS = [
    {
        id: 'apt_1',
        counselor_id: 'cns_1',
        counselor_name: 'Dr. Ji-Hye Song, Ph.D.',
        user_id: 'usr_student_1',
        student_name: 'Min-Jun Kim',
        date: daysFromToday(3),
        time_slot: '11:00 - 11:50',
        session_type: 'In-Person (Office 104)',
        reason: 'Midterm course load planning and study strategies.',
        status: 'Scheduled',
        notes: 'Initial consultation request confirmed.'
    }
];

// Which seed list fills which localStorage key
const SEED_TABLES = {
    [KDU_KEYS.USERS]: SEED_USERS,
    [KDU_KEYS.NOTICES]: SEED_NOTICES,
    [KDU_KEYS.LOST_FOUND]: SEED_LOST_FOUND,
    [KDU_KEYS.EVENTS]: SEED_EVENTS,
    [KDU_KEYS.EVENT_REGISTRATIONS]: SEED_EVENT_REGISTRATIONS,
    [KDU_KEYS.BOOKS]: SEED_BOOKS,
    [KDU_KEYS.BOOK_BORROWS]: SEED_BOOK_BORROWS,
    [KDU_KEYS.CLUBS]: SEED_CLUBS,
    [KDU_KEYS.CLUB_MEMBERS]: SEED_CLUB_MEMBERS,
    [KDU_KEYS.CLUB_POSTS]: SEED_CLUB_POSTS,
    [KDU_KEYS.FEEDBACK]: SEED_FEEDBACK,
    [KDU_KEYS.QUIZZES]: SEED_QUIZZES,
    [KDU_KEYS.QUIZ_ATTEMPTS]: SEED_QUIZ_ATTEMPTS,
    [KDU_KEYS.ASSIGNMENTS]: SEED_ASSIGNMENTS,
    [KDU_KEYS.SUBMISSIONS]: SEED_SUBMISSIONS,
    [KDU_KEYS.FACILITIES]: SEED_FACILITIES,
    [KDU_KEYS.BOOKINGS]: SEED_BOOKINGS,
    [KDU_KEYS.MEDIA]: SEED_MEDIA,
    [KDU_KEYS.MEDIA_RESERVATIONS]: [],
    [KDU_KEYS.COUNSELORS]: SEED_COUNSELORS,
    [KDU_KEYS.APPOINTMENTS]: SEED_APPOINTMENTS
};

// =============================================================================
// DATABASE ENGINE CLASS
// =============================================================================
class KduLocalDatabase {
    constructor() {
        this.init();
    }

    // First visit: write the seed data for every table that is still empty
    init() {
        Object.keys(SEED_TABLES).forEach(key => {
            if (!localStorage.getItem(key)) {
                localStorage.setItem(key, JSON.stringify(SEED_TABLES[key]));
            }
        });
    }

    _get(key) {
        try {
            return JSON.parse(localStorage.getItem(key)) || [];
        } catch {
            return [];
        }
    }

    _set(key, data) {
        localStorage.setItem(key, JSON.stringify(data));
    }

    // -------------------------------------------------------------------------
    // AUTHENTICATION & USER MANAGEMENT
    // -------------------------------------------------------------------------
    // New accounts are ALWAYS students. Admin accounts exist only in the seed data,
    // otherwise anyone could register as an administrator.
    signUp({ email, password, full_name, student_id, department, semester }) {
        const users = this._get(KDU_KEYS.USERS);
        const normalizedEmail = email.trim().toLowerCase();
        const normalizedId = (student_id || '').trim().toUpperCase();

        if (!full_name.trim() || !normalizedEmail || !normalizedId) {
            throw new Error('Please fill in all required fields.');
        }
        if (password.length < 6) {
            throw new Error('Password must be at least 6 characters long.');
        }
        if (users.some(u => u.email.toLowerCase() === normalizedEmail)) {
            throw new Error('An account with this email address is already registered.');
        }
        if (users.some(u => u.student_id.toUpperCase() === normalizedId)) {
            throw new Error('An account with this Student ID is already registered.');
        }

        const newUser = {
            id: 'usr_' + Date.now() + '_' + Math.random().toString(36).substr(2, 6),
            email: normalizedEmail,
            password,
            role: 'student',
            full_name: full_name.trim(),
            student_id: normalizedId,
            department: department || 'Global Computing & AI',
            semester: semester || 'Spring 2026',
            created_at: new Date().toISOString()
        };

        users.push(newUser);
        this._set(KDU_KEYS.USERS, users);
        this.setSession(newUser);
        return this.getSession();
    }

    signIn({ email, password }) {
        const users = this._get(KDU_KEYS.USERS);
        const normalizedEmail = email.trim().toLowerCase();
        const user = users.find(u => u.email.toLowerCase() === normalizedEmail && u.password === password);

        if (!user) {
            throw new Error('Invalid email or password. Please verify credentials.');
        }

        this.setSession(user);
        return this.getSession();
    }

    signOut() {
        localStorage.removeItem(KDU_KEYS.SESSION);
    }

    getSession() {
        try {
            const raw = localStorage.getItem(KDU_KEYS.SESSION);
            if (!raw) return null;
            const sessionUser = JSON.parse(raw);
            const users = this._get(KDU_KEYS.USERS);
            const fresh = users.find(u => u.id === sessionUser.id);
            if (!fresh) return null; // account was deleted
            const safe = { ...fresh };
            delete safe.password; // never keep the password in the page's memory
            return safe;
        } catch {
            return null;
        }
    }

    setSession(user) {
        const safe = { ...user };
        delete safe.password;
        localStorage.setItem(KDU_KEYS.SESSION, JSON.stringify(safe));
    }

    // -------------------------------------------------------------------------
    // MODULE 1: UNIVERSITY INFORMATION & LOST & FOUND
    // -------------------------------------------------------------------------
    getNotices() {
        return this._get(KDU_KEYS.NOTICES).sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    }

    createNotice({ title, category, priority, content }) {
        const notices = this._get(KDU_KEYS.NOTICES);
        const notice = {
            id: 'not_' + Date.now(),
            title: title.trim(),
            category,
            priority: priority || 'Normal',
            content: content.trim(),
            created_at: new Date().toISOString()
        };
        notices.unshift(notice);
        this._set(KDU_KEYS.NOTICES, notices);
        return notice;
    }

    deleteNotice(id) {
        let notices = this._get(KDU_KEYS.NOTICES);
        notices = notices.filter(n => n.id !== id);
        this._set(KDU_KEYS.NOTICES, notices);
    }

    getLostFound() {
        return this._get(KDU_KEYS.LOST_FOUND);
    }

    createLostFound({ title, location, type, contact, description, postedBy }) {
        const items = this._get(KDU_KEYS.LOST_FOUND);
        const item = {
            id: 'lf_' + Date.now(),
            title: title.trim(),
            location: location.trim(),
            type, // 'Lost' or 'Found'
            status: type,
            date: localDateStr(),
            contact: contact.trim(),
            description: description.trim(),
            posted_by: postedBy
        };
        items.unshift(item);
        this._set(KDU_KEYS.LOST_FOUND, items);
        return item;
    }

    updateLostFoundStatus(id, newStatus) {
        const items = this._get(KDU_KEYS.LOST_FOUND);
        const it = items.find(i => i.id === id);
        if (it) {
            it.status = newStatus;
            this._set(KDU_KEYS.LOST_FOUND, items);
        }
    }

    deleteLostFound(id) {
        let items = this._get(KDU_KEYS.LOST_FOUND);
        items = items.filter(i => i.id !== id);
        this._set(KDU_KEYS.LOST_FOUND, items);
    }

    // -------------------------------------------------------------------------
    // MODULE 2: UNIVERSITY EVENT MANAGEMENT
    // -------------------------------------------------------------------------
    getEvents() {
        const events = this._get(KDU_KEYS.EVENTS);
        const registrations = this._get(KDU_KEYS.EVENT_REGISTRATIONS);
        return events.map(evt => {
            const regs = registrations.filter(r => r.event_id === evt.id);
            return {
                ...evt,
                registered_count: regs.length,
                participants: regs
            };
        });
    }

    createEvent({ title, date, venue, organizer, capacity, description }) {
        const events = this._get(KDU_KEYS.EVENTS);
        const evt = {
            id: 'evt_' + Date.now(),
            title: title.trim(),
            date: date.trim(),
            venue: venue.trim(),
            organizer: organizer.trim(),
            capacity: parseInt(capacity, 10) || 50,
            description: description.trim()
        };
        events.push(evt);
        this._set(KDU_KEYS.EVENTS, events);
        return evt;
    }

    deleteEvent(id) {
        let events = this._get(KDU_KEYS.EVENTS);
        events = events.filter(e => e.id !== id);
        this._set(KDU_KEYS.EVENTS, events);

        let regs = this._get(KDU_KEYS.EVENT_REGISTRATIONS);
        regs = regs.filter(r => r.event_id !== id);
        this._set(KDU_KEYS.EVENT_REGISTRATIONS, regs);
    }

    registerForEvent(eventId, user) {
        const events = this._get(KDU_KEYS.EVENTS);
        const evt = events.find(e => e.id === eventId);
        if (!evt) throw new Error('Event not found.');

        const registrations = this._get(KDU_KEYS.EVENT_REGISTRATIONS);
        if (registrations.some(r => r.event_id === eventId && r.user_id === user.id)) {
            throw new Error('You are already registered for this campus event.');
        }

        const count = registrations.filter(r => r.event_id === eventId).length;
        if (count >= evt.capacity) {
            throw new Error('Event capacity is full.');
        }

        const reg = {
            id: 'ereg_' + Date.now(),
            event_id: eventId,
            user_id: user.id,
            student_name: user.full_name,
            student_id: user.student_id,
            registered_at: new Date().toISOString()
        };

        registrations.push(reg);
        this._set(KDU_KEYS.EVENT_REGISTRATIONS, registrations);
        return reg;
    }

    cancelEventRegistration(eventId, userId) {
        let registrations = this._get(KDU_KEYS.EVENT_REGISTRATIONS);
        registrations = registrations.filter(r => !(r.event_id === eventId && r.user_id === userId));
        this._set(KDU_KEYS.EVENT_REGISTRATIONS, registrations);
    }

    // -------------------------------------------------------------------------
    // MODULE 3: ONLINE BOOK STORE / LIBRARY EXCHANGE
    // -------------------------------------------------------------------------
    getBooks() {
        return this._get(KDU_KEYS.BOOKS);
    }

    createBook({ title, author, course_code, isbn, category }) {
        const books = this._get(KDU_KEYS.BOOKS);
        const bk = {
            id: 'bk_' + Date.now(),
            title: title.trim(),
            author: author.trim(),
            course_code: (course_code || 'GEN100').trim().toUpperCase(),
            isbn: isbn ? isbn.trim() : 'ISBN-' + Math.floor(1000000000 + Math.random() * 9000000000),
            category: category || 'General Academic',
            status: 'Available',
            borrowed_by: null,
            due_date: null
        };
        books.push(bk);
        this._set(KDU_KEYS.BOOKS, books);
        return bk;
    }

    deleteBook(id) {
        let books = this._get(KDU_KEYS.BOOKS);
        books = books.filter(b => b.id !== id);
        this._set(KDU_KEYS.BOOKS, books);
    }

    borrowBook(bookId, user) {
        const books = this._get(KDU_KEYS.BOOKS);
        const bk = books.find(b => b.id === bookId);
        if (!bk) throw new Error('Book not found.');
        if (bk.status === 'Borrowed') throw new Error('Book is currently borrowed by another student.');

        const dueDate = daysFromToday(14);
        bk.status = 'Borrowed';
        bk.borrowed_by = user.id;
        bk.due_date = dueDate;
        this._set(KDU_KEYS.BOOKS, books);

        const borrows = this._get(KDU_KEYS.BOOK_BORROWS);
        const record = {
            id: 'bb_' + Date.now(),
            book_id: bookId,
            book_title: bk.title,
            user_id: user.id,
            student_name: user.full_name,
            borrowed_at: new Date().toISOString(),
            due_date: dueDate,
            status: 'Active'
        };
        borrows.unshift(record);
        this._set(KDU_KEYS.BOOK_BORROWS, borrows);
        return record;
    }

    returnBook(bookId) {
        const books = this._get(KDU_KEYS.BOOKS);
        const bk = books.find(b => b.id === bookId);
        if (bk) {
            bk.status = 'Available';
            bk.borrowed_by = null;
            bk.due_date = null;
            this._set(KDU_KEYS.BOOKS, books);
        }

        const borrows = this._get(KDU_KEYS.BOOK_BORROWS);
        const active = borrows.find(b => b.book_id === bookId && b.status === 'Active');
        if (active) {
            active.status = 'Returned';
            this._set(KDU_KEYS.BOOK_BORROWS, borrows);
        }
    }

    getBorrowHistory(userId = null) {
        const borrows = this._get(KDU_KEYS.BOOK_BORROWS);
        if (userId) return borrows.filter(b => b.user_id === userId);
        return borrows;
    }

    // -------------------------------------------------------------------------
    // MODULE 4: STUDENT CLUB MANAGEMENT
    // -------------------------------------------------------------------------
    getClubs() {
        const clubs = this._get(KDU_KEYS.CLUBS);
        const members = this._get(KDU_KEYS.CLUB_MEMBERS);
        return clubs.map(c => ({
            ...c,
            members_count: members.filter(m => m.club_id === c.id).length + c.members_count
        }));
    }

    createClub({ name, category, lead, room, description, activities }) {
        const clubs = this._get(KDU_KEYS.CLUBS);
        const club = {
            id: 'clb_' + Date.now(),
            name: name.trim(),
            category: category.trim(),
            lead: lead.trim(),
            room: room.trim(),
            members_count: 1,
            description: description.trim(),
            activities: activities.trim()
        };
        clubs.push(club);
        this._set(KDU_KEYS.CLUBS, clubs);
        return club;
    }

    // Disbanding a club also removes its members and its bulletin posts
    deleteClub(id) {
        this._set(KDU_KEYS.CLUBS, this._get(KDU_KEYS.CLUBS).filter(c => c.id !== id));
        this._set(KDU_KEYS.CLUB_MEMBERS, this._get(KDU_KEYS.CLUB_MEMBERS).filter(m => m.club_id !== id));
        this._set(KDU_KEYS.CLUB_POSTS, this._get(KDU_KEYS.CLUB_POSTS).filter(p => p.club_id !== id));
    }

    joinClub(clubId, userId) {
        const members = this._get(KDU_KEYS.CLUB_MEMBERS);
        if (members.some(m => m.club_id === clubId && m.user_id === userId)) {
            throw new Error('You are already an active member of this club.');
        }

        members.push({
            id: 'cm_' + Date.now(),
            club_id: clubId,
            user_id: userId
        });
        this._set(KDU_KEYS.CLUB_MEMBERS, members);
    }

    leaveClub(clubId, userId) {
        let members = this._get(KDU_KEYS.CLUB_MEMBERS);
        members = members.filter(m => !(m.club_id === clubId && m.user_id === userId));
        this._set(KDU_KEYS.CLUB_MEMBERS, members);
    }

    getUserClubs(userId) {
        const members = this._get(KDU_KEYS.CLUB_MEMBERS);
        return members.filter(m => m.user_id === userId).map(m => m.club_id);
    }

    getClubPosts() {
        return this._get(KDU_KEYS.CLUB_POSTS);
    }

    createClubPost({ clubId, title, content }) {
        const posts = this._get(KDU_KEYS.CLUB_POSTS);
        const post = {
            id: 'cp_' + Date.now(),
            club_id: clubId,
            title: title.trim(),
            content: content.trim(),
            created_at: new Date().toISOString()
        };
        posts.unshift(post);
        this._set(KDU_KEYS.CLUB_POSTS, posts);
        return post;
    }

    // -------------------------------------------------------------------------
    // MODULE 5: STUDENT FEEDBACK SYSTEM
    // -------------------------------------------------------------------------
    getFeedback() {
        return this._get(KDU_KEYS.FEEDBACK).sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    }

    createFeedback({ userId, studentName, target, category, rating, comment }) {
        const items = this._get(KDU_KEYS.FEEDBACK);
        const fb = {
            id: 'fb_' + Date.now(),
            user_id: userId,
            student_name: studentName,
            target: target.trim(),
            category,
            rating: parseInt(rating, 10) || 5,
            comment: comment.trim(),
            created_at: new Date().toISOString()
        };
        items.unshift(fb);
        this._set(KDU_KEYS.FEEDBACK, items);
        return fb;
    }

    deleteFeedback(id) {
        let items = this._get(KDU_KEYS.FEEDBACK);
        items = items.filter(f => f.id !== id);
        this._set(KDU_KEYS.FEEDBACK, items);
    }

    // -------------------------------------------------------------------------
    // MODULE 6: ONLINE QUIZ SYSTEM
    // -------------------------------------------------------------------------
    getQuizzes() {
        return this._get(KDU_KEYS.QUIZZES);
    }

    getQuiz(id) {
        return this._get(KDU_KEYS.QUIZZES).find(q => q.id === id);
    }

    createQuiz({ title, course, time_limit_mins, questions }) {
        const quizzes = this._get(KDU_KEYS.QUIZZES);
        const quiz = {
            id: 'qz_' + Date.now(),
            title: title.trim(),
            course: course.trim(),
            time_limit_mins: parseInt(time_limit_mins, 10) || 15,
            questions: questions || []
        };
        quizzes.push(quiz);
        this._set(KDU_KEYS.QUIZZES, quizzes);
        return quiz;
    }

    deleteQuiz(id) {
        let quizzes = this._get(KDU_KEYS.QUIZZES);
        quizzes = quizzes.filter(q => q.id !== id);
        this._set(KDU_KEYS.QUIZZES, quizzes);
    }

    recordQuizAttempt({ quizId, quizTitle, user, score, totalQuestions, correctCount }) {
        const attempts = this._get(KDU_KEYS.QUIZ_ATTEMPTS);
        const attempt = {
            id: 'qa_' + Date.now(),
            quiz_id: quizId,
            quiz_title: quizTitle,
            user_id: user.id,
            student_name: user.full_name,
            score,
            total_questions: totalQuestions,
            correct_count: correctCount,
            submitted_at: new Date().toISOString()
        };
        attempts.unshift(attempt);
        this._set(KDU_KEYS.QUIZ_ATTEMPTS, attempts);
        return attempt;
    }

    getQuizAttempts(userId = null) {
        const attempts = this._get(KDU_KEYS.QUIZ_ATTEMPTS);
        if (userId) return attempts.filter(a => a.user_id === userId);
        return attempts;
    }

    // -------------------------------------------------------------------------
    // MODULE 7: STUDENT ASSIGNMENT SUBMISSION SYSTEM
    // -------------------------------------------------------------------------
    getAssignments() {
        return this._get(KDU_KEYS.ASSIGNMENTS).sort((a, b) => new Date(a.due_date) - new Date(b.due_date));
    }

    createAssignment({ course, title, due_date, max_points, instructions }) {
        const assignments = this._get(KDU_KEYS.ASSIGNMENTS);
        const asg = {
            id: 'asg_' + Date.now(),
            course: course.trim(),
            title: title.trim(),
            due_date: new Date(due_date).toISOString(),
            max_points: parseInt(max_points, 10) || 100,
            instructions: instructions.trim()
        };
        assignments.push(asg);
        this._set(KDU_KEYS.ASSIGNMENTS, assignments);
        return asg;
    }

    // Deleting an assignment also deletes its submissions
    deleteAssignment(id) {
        this._set(KDU_KEYS.ASSIGNMENTS, this._get(KDU_KEYS.ASSIGNMENTS).filter(a => a.id !== id));
        this._set(KDU_KEYS.SUBMISSIONS, this._get(KDU_KEYS.SUBMISSIONS).filter(s => s.assignment_id !== id));
    }

    getSubmissions(assignmentId = null, userId = null) {
        let subs = this._get(KDU_KEYS.SUBMISSIONS);
        if (assignmentId) subs = subs.filter(s => s.assignment_id === assignmentId);
        if (userId) subs = subs.filter(s => s.user_id === userId);
        return subs;
    }

    submitAssignment({ assignmentId, user, submissionText, fileName }) {
        const asg = this._get(KDU_KEYS.ASSIGNMENTS).find(a => a.id === assignmentId);
        if (!asg) throw new Error('Assignment not found.');
        if (new Date(asg.due_date) < new Date()) {
            throw new Error('The deadline for this assignment has passed. Submissions are closed.');
        }

        const subs = this._get(KDU_KEYS.SUBMISSIONS);
        // A student may update their submission, but not after it has been graded
        // (otherwise re-submitting would wipe the grade)
        const existingIdx = subs.findIndex(s => s.assignment_id === assignmentId && s.user_id === user.id);
        if (existingIdx >= 0 && subs[existingIdx].status === 'Graded') {
            throw new Error('This submission has already been graded and can no longer be changed.');
        }

        const sub = {
            id: existingIdx >= 0 ? subs[existingIdx].id : 'sub_' + Date.now(),
            assignment_id: assignmentId,
            user_id: user.id,
            student_name: user.full_name,
            student_id: user.student_id,
            submission_text: submissionText.trim(),
            file_name: fileName || 'attachment.pdf',
            submitted_at: new Date().toISOString(),
            status: 'Submitted',
            grade: null,
            feedback: null
        };

        if (existingIdx >= 0) {
            subs[existingIdx] = sub;
        } else {
            subs.unshift(sub);
        }

        this._set(KDU_KEYS.SUBMISSIONS, subs);
        return sub;
    }

    gradeSubmission(submissionId, { grade, feedback }) {
        const subs = this._get(KDU_KEYS.SUBMISSIONS);
        const sub = subs.find(s => s.id === submissionId);
        if (!sub) throw new Error('Submission not found.');

        sub.status = 'Graded';
        sub.grade = grade;
        sub.feedback = feedback.trim();
        this._set(KDU_KEYS.SUBMISSIONS, subs);
        return sub;
    }

    // -------------------------------------------------------------------------
    // MODULE 8: CAMPUS FACILITY BOOKING
    // -------------------------------------------------------------------------
    getFacilities() {
        return this._get(KDU_KEYS.FACILITIES);
    }

    createFacility({ name, type, capacity, equipment, open_hours }) {
        const facs = this._get(KDU_KEYS.FACILITIES);
        const fac = {
            id: 'fac_' + Date.now(),
            name: name.trim(),
            type: type.trim(),
            capacity: parseInt(capacity, 10) || 20,
            equipment: equipment.trim(),
            open_hours: open_hours.trim()
        };
        facs.push(fac);
        this._set(KDU_KEYS.FACILITIES, facs);
        return fac;
    }

    // Removing a facility also removes its reservations
    deleteFacility(id) {
        this._set(KDU_KEYS.FACILITIES, this._get(KDU_KEYS.FACILITIES).filter(f => f.id !== id));
        this._set(KDU_KEYS.BOOKINGS, this._get(KDU_KEYS.BOOKINGS).filter(b => b.facility_id !== id));
    }

    getBookings(userId = null) {
        const bookings = this._get(KDU_KEYS.BOOKINGS);
        if (userId) return bookings.filter(b => b.user_id === userId);
        return bookings;
    }

    createBooking({ facilityId, user, date, timeSlot, purpose }) {
        const bookings = this._get(KDU_KEYS.BOOKINGS);
        const facilities = this._get(KDU_KEYS.FACILITIES);
        const fac = facilities.find(f => f.id === facilityId);
        if (!fac) throw new Error('Facility not found.');
        if (date < localDateStr()) throw new Error('You cannot book a facility for a past date.');

        // Conflict check
        const conflict = bookings.some(b => 
            b.facility_id === facilityId && 
            b.date === date && 
            b.time_slot === timeSlot && 
            b.status !== 'Cancelled'
        );

        if (conflict) {
            throw new Error(`Time slot (${timeSlot}) on ${date} is already reserved for this facility. Please select another slot.`);
        }

        const bkg = {
            id: 'bkg_' + Date.now(),
            facility_id: facilityId,
            facility_name: fac.name,
            user_id: user.id,
            student_name: user.full_name,
            date,
            time_slot: timeSlot,
            purpose: purpose.trim(),
            status: 'Approved' // auto approved or pending
        };

        bookings.unshift(bkg);
        this._set(KDU_KEYS.BOOKINGS, bookings);
        return bkg;
    }

    updateBookingStatus(id, newStatus) {
        const bookings = this._get(KDU_KEYS.BOOKINGS);
        const b = bookings.find(x => x.id === id);
        if (b) {
            b.status = newStatus;
            this._set(KDU_KEYS.BOOKINGS, bookings);
        }
    }

    // -------------------------------------------------------------------------
    // MODULE 9: CAMPUS MEDIA / MOVIE HUB
    // -------------------------------------------------------------------------
    getMedia() {
        return this._get(KDU_KEYS.MEDIA);
    }

    createMedia({ title, genre, rating, duration, screening_date, hall, synopsis }) {
        const list = this._get(KDU_KEYS.MEDIA);
        const item = {
            id: 'med_' + Date.now(),
            title: title.trim(),
            genre: genre.trim() || 'General',
            rating: parseFloat(rating) || 4.5,
            duration: duration.trim() || 'TBA',
            screening_date: screening_date.trim(),
            hall: hall.trim(),
            synopsis: synopsis.trim()
        };
        list.push(item);
        this._set(KDU_KEYS.MEDIA, list);
        return item;
    }

    // Deleting a screening also deletes its seat reservations
    deleteMedia(id) {
        this._set(KDU_KEYS.MEDIA, this._get(KDU_KEYS.MEDIA).filter(m => m.id !== id));
        this._set(KDU_KEYS.MEDIA_RESERVATIONS, this._get(KDU_KEYS.MEDIA_RESERVATIONS).filter(r => r.media_id !== id));
    }

    getMediaReservations(mediaId = null) {
        const list = this._get(KDU_KEYS.MEDIA_RESERVATIONS);
        return mediaId ? list.filter(r => r.media_id === mediaId) : list;
    }

    reserveMediaSeat(mediaId, user) {
        const list = this._get(KDU_KEYS.MEDIA_RESERVATIONS);
        if (list.some(r => r.media_id === mediaId && r.user_id === user.id)) {
            throw new Error('You have already reserved a seat for this screening.');
        }
        list.push({
            id: 'mres_' + Date.now(),
            media_id: mediaId,
            user_id: user.id,
            student_name: user.full_name,
            reserved_at: new Date().toISOString()
        });
        this._set(KDU_KEYS.MEDIA_RESERVATIONS, list);
    }

    cancelMediaSeat(mediaId, userId) {
        const list = this._get(KDU_KEYS.MEDIA_RESERVATIONS)
            .filter(r => !(r.media_id === mediaId && r.user_id === userId));
        this._set(KDU_KEYS.MEDIA_RESERVATIONS, list);
    }

    // -------------------------------------------------------------------------
    // MODULE 10: STUDENT COUNSELING APPOINTMENT SYSTEM
    // -------------------------------------------------------------------------
    getCounselors() {
        return this._get(KDU_KEYS.COUNSELORS);
    }

    getAppointments(userId = null) {
        const apts = this._get(KDU_KEYS.APPOINTMENTS);
        if (userId) return apts.filter(a => a.user_id === userId);
        return apts;
    }

    createAppointment({ counselorId, user, date, timeSlot, sessionType, reason }) {
        const counselors = this._get(KDU_KEYS.COUNSELORS);
        const cns = counselors.find(c => c.id === counselorId);
        if (!cns) throw new Error('Counselor not found.');
        if (date < localDateStr()) throw new Error('You cannot book an appointment for a past date.');

        // The counselor must work on that weekday (available_days is e.g. "Mon, Wed, Fri")
        const dayName = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][new Date(date + 'T00:00:00').getDay()];
        if (!cns.available_days.includes(dayName)) {
            throw new Error(`${cns.name} is only available on ${cns.available_days}.`);
        }

        const apts = this._get(KDU_KEYS.APPOINTMENTS);

        // The same student cannot be in two sessions at the same time
        const studentBusy = apts.some(a =>
            a.user_id === user.id &&
            a.date === date &&
            a.time_slot === timeSlot &&
            a.status !== 'Cancelled'
        );
        if (studentBusy) {
            throw new Error(`You already have another counseling session at ${timeSlot} on ${date}.`);
        }

        // Overlap check for this counselor
        const conflict = apts.some(a => 
            a.counselor_id === counselorId && 
            a.date === date && 
            a.time_slot === timeSlot && 
            a.status !== 'Cancelled'
        );

        if (conflict) {
            throw new Error(`Counselor ${cns.name} already has an appointment booked at ${timeSlot} on ${date}.`);
        }

        const apt = {
            id: 'apt_' + Date.now(),
            counselor_id: counselorId,
            counselor_name: cns.name,
            user_id: user.id,
            student_name: user.full_name,
            date,
            time_slot: timeSlot,
            session_type: sessionType || 'In-Person (Office)',
            reason: reason.trim(),
            status: 'Scheduled',
            notes: 'Appointment request confirmed.'
        };

        apts.unshift(apt);
        this._set(KDU_KEYS.APPOINTMENTS, apts);
        return apt;
    }

    updateAppointmentStatus(id, newStatus, counselorNotes = null) {
        const apts = this._get(KDU_KEYS.APPOINTMENTS);
        const a = apts.find(x => x.id === id);
        if (a) {
            a.status = newStatus;
            if (counselorNotes !== null) a.notes = counselorNotes;
            this._set(KDU_KEYS.APPOINTMENTS, apts);
        }
    }

    // -------------------------------------------------------------------------
    // FACTORY RESET HELPER
    // -------------------------------------------------------------------------
    resetToFactoryDefaults() {
        Object.keys(SEED_TABLES).forEach(key => {
            localStorage.setItem(key, JSON.stringify(SEED_TABLES[key]));
        });
        localStorage.removeItem(KDU_KEYS.SESSION);
    }
}

// Global singleton instance
window.kduDB = new KduLocalDatabase();

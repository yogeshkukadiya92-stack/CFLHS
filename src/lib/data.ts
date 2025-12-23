
import { v4 as uuidv4 } from 'uuid';
import type { KRA, RoutineTask, Leave, Attendance, Expense, Habit, Holiday, Recruit, Employee, Branch } from './types';

const employees: Employee[] = [
    {
        id: 'EMP-001',
        name: 'Sunil Kumar',
        avatarUrl: 'https://placehold.co/32x32.png?text=SK',
        branch: 'Marketing',
        role: 'Employee',
        email: 'sunil.k@example.com',
        address: '123, ABC Society, Pune, Maharashtra',
        joiningDate: new Date('2022-05-15'),
        birthDate: new Date('1995-08-20'),
        familyMobileNumber: '9876543211',
        extraLeaves: 2,
    },
    {
        id: 'EMP-002',
        name: 'Priya Sharma',
        avatarUrl: 'https://placehold.co/32x32.png?text=PS',
        branch: 'Sales',
        role: 'Manager',
        email: 'priya.s@example.com',
        address: '456, XYZ Apartments, Mumbai, Maharashtra',
        joiningDate: new Date('2021-02-20'),
        birthDate: new Date('1992-11-30'),
        familyMobileNumber: '9876543212',
        extraLeaves: 5,
    },
    {
        id: 'EMP-003',
        name: 'Amit Patel',
        avatarUrl: 'https://placehold.co/32x32.png?text=AP',
        branch: 'Marketing',
        role: 'Employee',
        email: 'amit.p@example.com',
        address: '789, PQR Towers, Pune, Maharashtra',
        joiningDate: new Date('2023-01-10'),
        birthDate: new Date('1998-03-12'),
        familyMobileNumber: '9876543213',
        extraLeaves: 0,
    },
     {
        id: 'EMP-004',
        name: 'Admin User',
        avatarUrl: 'https://placehold.co/32x32.png?text=AU',
        branch: 'IT',
        role: 'Admin',
        email: 'connect@luvfitnessworld.com',
        address: 'Luv Fitness World, HQ',
        joiningDate: new Date('2020-01-01'),
        birthDate: new Date('1990-01-01'),
        familyMobileNumber: '9999999999'
    },
    {
        id: 'EMP-005',
        name: 'Prakash Joshi',
        avatarUrl: 'https://placehold.co/32x32.png?text=PJ',
        branch: 'Sales',
        role: 'Employee',
        email: 'prakash.joshi@example.com',
        address: '101, LMN Heights, Mumbai, Maharashtra',
        joiningDate: new Date('2022-09-01'),
        birthDate: new Date('1996-07-25'),
        familyMobileNumber: '9876543214',
    }
];

export const mockKras: KRA[] = [
  {
    id: 'KRA-001',
    taskDescription: 'Increase organic traffic by 20% in Q3',
    employee: employees[0],
    progress: 75,
    status: 'On Track',
    weightage: 20,
    marksAchieved: 15,
    bonus: 2,
    penalty: 0,
    startDate: new Date('2024-07-01'),
    endDate: new Date('2024-09-30'),
    actions: [
      { id: uuidv4(), name: 'Publish 10 new blog posts', dueDate: new Date('2024-08-30'), isCompleted: true, weightage: 5, target: 10, updates: [{ id: uuidv4(), date: new Date(), status: 'Completed', comment: 'All posts published', value: 10 }] },
      { id: uuidv4(), name: 'Improve on-page SEO for top 20 pages', dueDate: new Date('2024-09-15'), isCompleted: false, weightage: 10, target: 20, updates: [{ id: uuidv4(), date: new Date(), status: 'On Track', comment: '15 pages optimized', value: 15 }] },
    ],
    handover: 'All blog post drafts are in the shared drive.',
    target: 20,
    achieved: 15,
  },
  {
    id: 'KRA-002',
    taskDescription: 'Achieve sales target of $50,000 for Q3',
    employee: employees[1],
    progress: 95,
    status: 'On Track',
    weightage: 30,
    marksAchieved: 28.5,
    bonus: 5,
    penalty: 0,
    startDate: new Date('2024-07-01'),
    endDate: new Date('2024-09-30'),
    actions: [],
    target: 50000,
    achieved: 47500,
  },
  {
    id: 'KRA-003',
    taskDescription: 'Reduce customer churn by 5%',
    employee: employees[2],
    progress: 40,
    status: 'At Risk',
    weightage: 15,
    marksAchieved: 6,
    bonus: 0,
    penalty: 1,
    startDate: new Date('2024-08-01'),
    endDate: new Date('2024-10-31'),
    actions: [],
    target: 5,
    achieved: 2,
  },
   {
    id: 'KRA-004',
    taskDescription: 'Manage the company IT infrastructure',
    employee: employees[3],
    progress: 100,
    status: 'Completed',
    weightage: 25,
    marksAchieved: 25,
    bonus: 0,
    penalty: 0,
    startDate: new Date('2024-01-01'),
    endDate: new Date('2024-12-31'),
    actions: [],
    target: 1,
    achieved: 1,
  },
   {
    id: 'KRA-005',
    taskDescription: 'Generate 100 new qualified leads',
    employee: employees[4],
    progress: 60,
    status: 'On Track',
    weightage: 20,
    marksAchieved: 12,
    bonus: 0,
    penalty: 0,
    startDate: new Date('2024-09-01'),
    endDate: new Date('2024-11-30'),
    actions: [
      { id: uuidv4(), name: 'Cold call 50 prospects', dueDate: new Date('2024-09-30'), isCompleted: true, weightage: 10, target: 50, updates: [{id: uuidv4(), date: new Date(), status: 'Completed', comment: 'Called all 50', value: 50}] },
      { id: uuidv4(), name: 'Attend 2 industry events', dueDate: new Date('2024-10-31'), isCompleted: false, weightage: 10, target: 2, updates: [{id: uuidv4(), date: new Date(), status: 'On Track', comment: 'Attended one event', value: 1}] },
    ],
    handover: 'Lead list is in the CRM',
    target: 100,
    achieved: 60,
  }
];


export const mockRoutineTasks: RoutineTask[] = [
    {
        id: 'RT-001',
        title: 'Daily Social Media Posting',
        description: 'Post updates on all social media channels (FB, Insta, Twitter)',
        employee: employees[0],
        assignedDate: new Date('2024-09-01'),
        dueDate: new Date('2024-09-30'),
        status: 'In Progress',
        priority: 'Medium',
        remarks: 'Instagram engagement is up by 5%.'
    },
    {
        id: 'RT-002',
        title: 'Weekly Sales Report',
        description: 'Prepare and submit the weekly sales performance report to management.',
        employee: employees[1],
        assignedDate: new Date('2024-09-23'),
        dueDate: new Date('2024-09-27'),
        status: 'To Do',
        priority: 'High',
    }
];

export const mockLeaves: Leave[] = [
    {
        id: 'L-001',
        employee: employees[0],
        startDate: new Date('2024-09-15'),
        endDate: new Date('2024-09-16'),
        reason: 'Sick Leave',
        status: 'Approved',
        duration: 2,
    },
    {
        id: 'L-002',
        employee: employees[2],
        startDate: new Date('2024-10-05'),
        endDate: new Date('2024-10-10'),
        reason: 'Family Function',
        status: 'Pending',
        duration: 6,
    }
];

export const mockAttendances: Attendance[] = [
    { id: 'ATT-001', employee: employees[0], date: new Date(), status: 'Present' },
    { id: 'ATT-002', employee: employees[1], date: new Date(), status: 'Present' },
    { id: 'ATT-003', employee: employees[2], date: new Date(), status: 'Absent' },
    { id: 'ATT-004', employee: employees[0], date: new Date(new Date().setDate(new Date().getDate() - 1)), status: 'Present' },
    { id: 'ATT-005', employee: employees[1], date: new Date(new Date().setDate(new Date().getDate() - 1)), status: 'Half-day' },
    { id: 'ATT-006', employee: employees[2], date: new Date(new Date().setDate(new Date().getDate() - 1)), status: 'Present' },
];

export const mockExpenses: Expense[] = [
    {
        id: 'EXP-001',
        employee: employees[0],
        date: new Date('2024-09-05'),
        expenseType: 'Travel',
        description: 'Client meeting in Mumbai. Travelled by car.',
        distanceInKm: 300,
        ratePerKm: 15,
        totalAmount: 4500,
        status: 'Paid'
    },
    {
        id: 'EXP-002',
        employee: employees[2],
        date: new Date('2024-09-10'),
        expenseType: 'Food',
        description: 'Lunch with potential client.',
        amount: 1200,
        totalAmount: 1200,
        status: 'Approved'
    }
];


export const mockHabits: Habit[] = [
    {
        id: 'H-001',
        name: 'Read 30 mins daily',
        description: 'Read a book related to marketing or self-improvement for 30 minutes every day.',
        employee: employees[0],
        checkIns: [new Date('2024-09-01'), new Date('2024-09-02'), new Date('2024-09-04')],
        goalDays: 30,
        startDate: new Date('2024-09-01'),
        deadline: '10:00'
    },
    {
        id: 'H-002',
        name: 'Daily Cold Calling',
        description: 'Make 10 cold calls to new prospects every morning.',
        employee: employees[1],
        checkIns: [new Date('2024-09-01'), new Date('2024-09-02'), new Date('2024-09-03')],
        goalDays: 20,
        startDate: new Date('2024-09-01'),
        deadline: '12:00'
    }
];

export const mockHolidays: Holiday[] = [
    {
        id: 'HOL-001',
        name: 'Republic Day',
        date: new Date(new Date().getFullYear(), 0, 26),
        type: 'Full Day'
    },
    {
        id: 'HOL-002',
        name: 'Holi',
        date: new Date(new Date().getFullYear(), 2, 25),
        type: 'Full Day'
    },
    {
        id: 'HOL-003',
        name: 'Diwali',
        date: new Date(new Date().getFullYear(), 10, 1),
        type: 'Full Day'
    },
    {
        id: 'HOL-004',
        name: 'Dhanteras (Half Day)',
        date: new Date(new Date().getFullYear(), 9, 29),
        type: 'Half Day'
    },
     {
        id: 'HOL-005',
        name: 'Independence Day',
        date: new Date(new Date().getFullYear(), 7, 15),
        type: 'Full Day'
    }
];

export const mockRecruits: Recruit[] = [
    {
        id: 'REC-001',
        name: 'Ravi Verma',
        email: 'ravi.v@example.com',
        phone: '9876543215',
        position: 'Sr. Marketing Manager',
        branch: 'Marketing',
        appliedDate: new Date('2024-08-15'),
        status: 'Interview',
        notes: 'Strong candidate with 5 years of experience in digital marketing.',
        avatarUrl: `https://placehold.co/32x32.png?text=RV`,
        workExperience: '5 Years',
        qualification: 'MBA in Marketing',
        location: 'Pune',
        resumeUrl: 'https://example.com/resume.pdf'
    },
    {
        id: 'REC-002',
        name: 'Anita Desai',
        email: 'anita.d@example.com',
        phone: '9876543216',
        position: 'Sales Executive',
        branch: 'Sales',
        appliedDate: new Date('2024-09-01'),
        status: 'Screening',
        notes: 'Fresher with good communication skills.',
        avatarUrl: `https://placehold.co/32x32.png?text=AD`,
        workExperience: 'Fresher',
        qualification: 'BBA',
        location: 'Mumbai'
    },
];

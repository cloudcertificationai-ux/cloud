/**
 * Upsert ServiceNow Training Program as the flagship live (pillar) course.
 * Full curriculum from Servicenow-Full-Course-Content.pdf (Admin + Developer).
 * Live instructor-led, 55+ hours, price INR 22,999.
 */
import { PrismaClient, LessonKind } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import { Pool } from 'pg'
import 'dotenv/config'

const pool = new Pool({
  connectionString: process.env.DIRECT_DATABASE_URL || process.env.DATABASE_URL,
})
const prisma = new PrismaClient({ adapter: new PrismaPg(pool) })

const SLUG = 'servicenow'
const CATEGORY = { name: 'Enterprise Applications', slug: 'enterprise-applications' }
const MIN_LIVE_MINUTES = 55 * 60 // 55+ hours of live training
const PRICE_CENTS = 22999 * 100 // ₹22,999

type LessonSeed = { title: string; duration: number; kind: LessonKind }
type ModuleSeed = { title: string; lessons: LessonSeed[] }

function T(title: string, duration = 15): LessonSeed {
  return { title, duration, kind: 'VIDEO' }
}
function Lab(title: string, duration = 45): LessonSeed {
  return { title, duration, kind: 'ASSIGNMENT' }
}
function Q(title: string, duration = 20): LessonSeed {
  return { title, duration, kind: 'QUIZ' }
}

const CURRICULUM: ModuleSeed[] = [
  {
    title: 'Lesson 01 — Cloud Computing Basics',
    lessons: [
      T('Introduction to Cloud Computing', 20),
      T('What is Cloud Computing', 18),
      T('Private Cloud and Public Cloud', 20),
      T('Difference between SaaS and PaaS', 18),
      T('Benefits of Cloud Computing', 16),
    ],
  },
  {
    title: 'Lesson 02 — Introduction to ITIL',
    lessons: [
      T('What is ITIL', 18),
      T('Introduction to ITIL Foundation', 20),
      T('ITIL Versions', 15),
      T('Benefits of ITIL Standards', 16),
      T('ITIL Approaches', 16),
      T('Roles and Responsibility of IT Help Desk', 18),
      T('Modules in ITIL', 18),
    ],
  },
  {
    title: 'Lesson 03 — ServiceNow Overview and Introduction',
    lessons: [
      T('Introduction to ITSM', 16),
      T('Overview of ITSM', 16),
      T('Introduction of ServiceNow', 18),
      T('What is ServiceNow?', 16),
      T('Why and who can use ServiceNow', 18),
      T('History of ServiceNow', 14),
      T('ServiceNow Features', 18),
      T('ServiceNow Objectives', 14),
      T('ServiceNow Lifecycle', 18),
      T('Architecture of ServiceNow', 22),
      T('ServiceNow Market Trends', 16),
      T('Prerequisites for ServiceNow', 14),
      T('ServiceNow Versions', 16),
    ],
  },
  {
    title: 'Lesson 04 — PDI Account Creation',
    lessons: [
      T('New PDI Account Creation', 18),
      T('Request for Developer Instance', 20),
      T('How do we reset admin Password', 16),
      T('Who will create Developer Instance', 12),
      T('Use of stats.do', 16),
      Lab('Live lab: Provision PDI, reset admin password, open stats.do', 50),
    ],
  },
  {
    title: 'Lesson 05 — User Interface',
    lessons: [
      T('What is User Interface (UI)?', 16),
      T('Difference Between UI15 and UI16', 16),
      T('User Profile', 14),
      T('Basic Configuration', 18),
      T('Purpose of Impersonate User', 16),
      T('Use of Global Search', 14),
      T('Toggle Connect Sidebar', 12),
      T('Settings (Available Component)', 14),
    ],
  },
  {
    title: 'Lesson 06 — Forms',
    lessons: [
      T('What is Form & Record?', 16),
      T('Form Headers and Fields', 16),
      T('Form Design and Form Layout', 20),
      T('Work with Form Sections', 16),
      T('Field Properties', 16),
      T('Working with Annotation', 14),
      T('Creating Custom Fields from Design and Form Layout', 22),
      T('Configure Dot Walking', 18),
      T('Form Customization and Personalization', 18),
      Lab('Live lab: Design an Incident form with custom fields', 50),
    ],
  },
  {
    title: 'Lesson 07 — Formatters',
    lessons: [
      T('What is Formatter?', 14),
      T('Types of formatters in base system', 18),
      T('Working with all types of Formatters', 20),
      T('Create process flow formatter for Incident Table', 22),
    ],
  },
  {
    title: 'Lesson 08 — Lists',
    lessons: [
      T('Filters and Search Conditions in Lists', 18),
      T('Types of Record Searches', 16),
      T('What about Condition Builder', 18),
      T('Breadcrumbs and Usage', 14),
      T('Context Menus', 14),
      T('Personalizing and Customizing Lists', 18),
      T('Filters Add to Favorite', 12),
      T('Configure List Layout', 16),
      T('List Controls', 14),
      T('List Calculations', 16),
      T('Purpose of Wild Card Entries', 14),
      T('Update Multiple Records', 16),
      Lab('Live lab: Personalize lists, favorites, and wild-card search', 45),
    ],
  },
  {
    title: 'Lesson 09 — Plugins',
    lessons: [
      T('What is Plugin?', 14),
      T('Predefined Plugins Installed in ServiceNow', 16),
      T('Activate and Deactivating Plugins', 16),
      T('Upgrading Plugins', 14),
      T('Importance of Dependency Plugins', 16),
      T('Importance of Load Demo Data', 14),
      T('Who will Request Plugins?', 12),
      T('Repair and Upgrade Plugins', 14),
      T('How to Request Plugin in Real Time', 16),
      T('HI Service Portal (Now Support)', 16),
    ],
  },
  {
    title: 'Lesson 10 — Tables, Fields and Columns',
    lessons: [
      T('Introduction to Table', 16),
      T('Out of the Box Tables', 16),
      T('Types of Tables in ServiceNow', 18),
      T('Extended Table and Referenced Tables', 20),
      T('Major Table in ServiceNow', 16),
      T('Importance of Schema Map', 18),
      T('Creating Custom Table', 22),
      T('Deleting Custom Tables', 14),
      T('Default Fields in Custom Table', 16),
      T('Describe u_ prefix', 12),
      T('Dictionary Entries', 18),
      Lab('Live lab: Create a custom table and dictionary fields', 50),
    ],
  },
  {
    title: 'Lesson 11 — User Administration',
    lessons: [
      T('Introduction to User Administration', 16),
      T('Creating Users', 16),
      T('Types of User Interfaces in ServiceNow', 14),
      T('Difference Between End User, ITIL User, Administration', 18),
      T('Working with Groups', 16),
      T('Working with Roles', 18),
      T('Creating Department and Company', 16),
      T('Creating Countries and Locations', 14),
      T('Assign roles to Users and Groups', 16),
      T('Delegate Users', 14),
      T('Current Logged in Users', 12),
      T('Active Transitions', 12),
      T('User Preferences', 14),
      Lab('Live lab: Users, groups, roles, and impersonation', 50),
      Q('Admin foundations knowledge check', 20),
    ],
  },
  {
    title: 'Lesson 12 — Incident Management Lifecycle and State Model',
    lessons: [
      T('Introduction to Incident Management', 18),
      T('What is Incident', 16),
      T('Life Cycle of Incident Management', 20),
      T('Working with State Model', 20),
    ],
  },
  {
    title: 'Lesson 13 — Data Lookup Rules',
    lessons: [
      T('Introduction to Data Lookup Rules', 16),
      T('Creating New Data Lookup Rule', 18),
      T('Modify Existing Data Lookup Rule', 16),
      T('Data Lookup Rule Tables of Incident and Problem', 16),
      T('Working with Data Lookup Definition', 16),
      T('Work with Record Matcher', 16),
    ],
  },
  {
    title: 'Lesson 14 — Assignment Lookup Rules',
    lessons: [
      T('Introduction to Assignment Lookup Rule', 16),
      T('Defining Assignment Rules', 16),
      T('Creating New Assignment Rule', 18),
      T('Precedence Between Data Lookup, Assignment and Business Rules', 20),
    ],
  },
  {
    title: 'Lesson 15 — UI Policy',
    lessons: [
      T('Introduction to UI Policy', 16),
      T('Use of UI Policy', 14),
      T('Create UI Policies for Incident Table', 20),
      T('Working with More UI Policies', 18),
      T('UI Policy Terminology', 14),
      T('Converting a UI Policy to Data Policy', 16),
      T('Global, On Load, Reverse If false and Inherit', 20),
      T('Working with Hide Related Lists', 14),
    ],
  },
  {
    title: 'Lesson 16 — Data Policy',
    lessons: [
      T('Introduction to Data Policy and Usage', 16),
      T('Creating Data Policy Rules', 18),
      T('Converting Data Policy to UI Policy', 16),
      T('Applying Data Policies to Incident Table', 18),
      T('Difference between UI Policy and Data Policy', 16),
      Lab('Live lab: Incident assignment, UI Policy, and Data Policy', 55),
    ],
  },
  {
    title: 'Lesson 17 — Metrics',
    lessons: [
      T('Introduction to Metrics', 14),
      T('What is Metrics and Usage', 16),
      T('Creating New Metric Definition', 18),
    ],
  },
  {
    title: 'Lesson 18 — Related Lists',
    lessons: [
      T('Introduction to Related Lists', 14),
      T('Working with Related Lists', 16),
      T('Creating New Related List and Add to Form', 18),
    ],
  },
  {
    title: 'Lesson 19 — Service Level Management',
    lessons: [
      T('Introduction to Service Level Management (SLM)', 18),
      T('Describing SLA', 16),
      T("Types of SLA's", 16),
      T('Working with SLA, OLA and UC', 20),
      T('Understand Existing SLA Definition', 16),
      T('Creating New SLA Definition for Incident Table', 22),
      T('SLA Targets', 14),
      T('Schedule SLA Definitions', 16),
      T('Importance of Retroactive Start and Pause', 18),
      T('SLA Calculation', 16),
      T('Tracking of SLA Definition', 16),
    ],
  },
  {
    title: 'Lesson 20 — Import Sets',
    lessons: [
      T('Introduction to Import Sets', 16),
      T('Data Import Process', 16),
      T('Preparing Data for Import', 16),
      T('Data Loading', 16),
      T('Creating Transform Map', 20),
      T('Fields Mapping', 16),
      T('Work with Coalesce', 18),
      T('Working with Multiple Coalesce', 16),
      T('Run Transform Map', 16),
      T('Importing Data Sources', 16),
      T('Schedule Import Sets', 16),
      T('Transform Event Scripts', 18),
      T('Transformation Event Script Variable', 16),
      Lab('Live lab: Import users with coalesce and define an Incident SLA', 60),
      Q('ITSM process and data knowledge check', 20),
    ],
  },
  {
    title: 'Lesson 21 — Update Sets',
    lessons: [
      T('Introduction to Update Sets', 16),
      T('Importance of Update Sets', 14),
      T('Update Sets Tables', 14),
      T('What Update Sets Captured and Does Not Capture', 18),
      T('Default Update Sets', 14),
      T('Update Sets Administration', 16),
      T('Create New Local Update Sets', 16),
      T('Working with Retrieved Update Sets', 16),
      T('Update Sets Practical Exercise', 20),
      T('Preview and Commit Update Sets', 18),
      T('Migrating Update Sets', 16),
      T('Merge Update Sets', 16),
      T('Back Out Changes from Target Instance', 16),
      T('Update Sets Precautions', 14),
      T('Update Sets States', 14),
    ],
  },
  {
    title: 'Lesson 22 — Service Catalog',
    lessons: [
      T('Introduction to Service Catalog', 18),
      T('Configure Service Catalogs', 16),
      T('Configure Categories', 14),
      T('Create Catalog Item', 20),
      T('Adding Service Catalog to Service Portal', 16),
      T('Types of Catalog Item', 16),
      T('Record Producers', 18),
      T('Types of Variables', 18),
      T('Order Guides', 18),
      T('Working with Rule Base', 16),
      T('Working with Cascade Variable', 16),
      T('Working with Variable Sets', 18),
      T('Working with User Criteria', 16),
      T('Catalog UI Policy', 18),
      T('Catalog Client Scripts', 18),
      T('Creating Variable Attributes', 16),
      T('Working with Reference Qualifier', 16),
      T('Service Catalog Properties', 14),
      T('Fulfillment Groups', 14),
      T('Catalog Request Report', 14),
      T('Variable Default Sizes', 12),
      T('Working with Regular Expressions', 16),
      Lab('Live lab: Catalog item, variable set, user criteria, Update Set', 60),
    ],
  },
  {
    title: 'Lesson 23 — Workflow',
    lessons: [
      T('Introduction to Workflow', 18),
      T('Workflow Core Activities', 18),
      T('Creating New Workflow', 20),
      T('Workflow Editor', 16),
      T('Stages Sets', 14),
      T('Active Contexts', 14),
      T('Workflow Administration', 16),
      T('Activity Definition', 16),
      T('Workflow Versions', 14),
      T('Workflow Properties', 14),
      T('Validate Workflow', 14),
      T('Scheduled Workflow', 14),
      T('Add workflow to Catalog Item', 18),
      Lab('Live lab: Approval workflow on a catalog item', 55),
    ],
  },
  {
    title: 'Lesson 24 — Execution Plan (Optional)',
    lessons: [
      T('Introduction to Execution Plan', 16),
      T('Create Execution Plan Task', 16),
      T('Create Execution Plan Variables', 16),
    ],
  },
  {
    title: 'Lesson 25 — Reports and Dashboards',
    lessons: [
      T('Introduction to Reports', 16),
      T('Types of Reports', 16),
      T('Creating New Report', 18),
      T('Deleting Report', 10),
      T('Reports add to Dash Board', 16),
      T('Report Sharing', 14),
      T('Scheduling Reports', 14),
      T('Publish and Unpublish the Reports', 14),
      T('Report Properties', 12),
      T('Reports Statistics', 12),
      T('Working with Gauges', 14),
      T('Introduction to Dash Boards', 16),
      T('Create New Dash Board', 16),
      T('Responsive vs Non Responsive Dashboards', 14),
      T('Difference Between Home Page and Dash Board', 14),
      Lab('Live lab: Incident and SLA dashboard', 45),
    ],
  },
  {
    title: 'Lesson 26 — Access Control List',
    lessons: [
      T('Introduction to System Security', 16),
      T('Importance of Elevate Roles and Security Admin', 16),
      T('Creating New ACL Rule', 20),
      T('Levels of ACL (Table and Field)', 18),
      T('ACL Operations', 16),
      T('ACL Execution Order', 18),
      T("Types of ACL's", 16),
      T('Describing Table and None', 16),
      T('Describing * and None', 14),
      T('Describing * and *', 14),
      T('Describing Table and Field', 16),
    ],
  },
  {
    title: 'Lesson 27 — Email Notifications',
    lessons: [
      T('Introduction to System notifications', 14),
      T('Purpose of Email Notifications', 14),
      T('Creating New Email Notification', 18),
      T('Email Notification Tabs', 14),
      T('Preview Notification', 12),
      T('Email Templates', 16),
      T('Notifications on Event is fired', 16),
      T('Notifications on Triggered', 16),
      T('Configure Email Notification', 16),
      T('Working with Notification Email Scripts', 18),
      T('Omit Watermarks in Email Notifications', 12),
      T('Send Email Notification to CC', 12),
      T('Allow Digest', 12),
      T('Email Subscription', 14),
      T('Push Notifications', 14),
    ],
  },
  {
    title: 'Lesson 28 — Configure MID Server',
    lessons: [
      T('Introduction to MID Server', 16),
      T('Create MID Server User Record', 16),
      T('Download MID Server Windows 64 bit', 14),
      T('Install MID Server in ServiceNow Instance', 18),
      T('Validating MID Server', 16),
      T('MID Server Capabilities', 16),
      T('MID Server Dash Board', 14),
      Lab('Live lab: Table ACL and assignment email notification', 50),
      Q('Security, catalog, and workflow knowledge check', 20),
    ],
  },
  {
    title: 'Lesson 29 — Cloning Instance',
    lessons: [
      T('Introduction Cloning', 14),
      T('Use of Cloning', 14),
      T('Cloning Instance', 18),
    ],
  },
  {
    title: 'Lesson 30 — Working with Major Incident Management',
    lessons: [
      T('Introduction to Major Incident Management', 16),
      T('Creating Major Incident Candidate', 16),
      T('Creating Major Incident', 16),
      T('Importance of Candidates', 14),
      T('Major Incident Trigger Rules', 16),
      T('Properties of Major Incidents', 14),
      T('Promote to Major Incident', 14),
      T('Propose Major Incident', 14),
    ],
  },
  {
    title: 'Lesson 31 — Problem Management Lifecycle and State Model',
    lessons: [
      T('Brief Introduction to Problem', 14),
      T('Problem Definition', 14),
      T('Creating Problem Record', 16),
      T('Add associated Incidents to Problem', 16),
      T('Problem Life Cycle and State Model', 18),
      T('Default States in Problem', 14),
      T('Knowledge Article Usage in Problem', 16),
      T('Communicate Workaround for Problem', 14),
      T('Communicate a Fix', 14),
      T('Create Known Article in Problem', 16),
      T('Working with Problem Task', 16),
    ],
  },
  {
    title: 'Lesson 32 — Change Management Lifecycle and State Model',
    lessons: [
      T('Introduction to Change Management', 16),
      T('Create Change Request', 16),
      T('Change Request Table', 14),
      T('Create change request from Incident', 16),
      T('Types of Changes', 16),
      T('Elaborate Simple, Standard and Emergency Changes', 20),
      T('Standard Change Catalog', 16),
      T('Change Lifecycle and State Model', 18),
      T('Create Standard Template add to Catalog', 16),
      T('Working with Risk Calculation', 16),
      T('Working with Risk Assessment', 16),
      T('Change Management Plugins', 14),
      T('Unauthorized Change Request', 14),
      T('Change Properties', 12),
    ],
  },
  {
    title: 'Lesson 33 — Knowledge Management Lifecycle and State Model',
    lessons: [
      T('Introduction to Knowledge Management', 16),
      T('Use of Knowledge Articles', 14),
      T('Knowledge Management Lifecycle and State Model', 18),
      T('Configure Knowledge Management', 16),
      T('Create New Article and Publish', 16),
      T('Retired Article', 12),
      T('Create Knowledgebase', 14),
      T('Knowledge Management Role', 14),
      T('Working with Open Submission', 14),
      T('Working with Feedback Management', 14),
      T('Knowledge Administration', 14),
      T('User Criteria in Knowledge Management', 16),
      T('Integrating Knowledge Articles in Incident and Service Portal', 18),
      T("Knowledge Articles Workflow's", 16),
      T('Instant Publish and Retired', 14),
      T('Approval Publish and Retired', 14),
      T('Knowledge Coach', 12),
      Lab('Live lab: Problem, standard change, and knowledge article', 55),
    ],
  },
  {
    title: 'Developer Lesson 01 — JavaScript Fundamentals',
    lessons: [
      T('Java Script Introduction', 16),
      T('History of Java Script', 12),
      T('Client Side Java Script and Server Side Java Script', 18),
      T('Java Script Templates', 14),
      T('Use of template.print', 14),
      T('Working with Single Line and Multi line Comments', 10),
      T('Types of Variable', 16),
      T('Working with String and String Concatenation', 16),
      T('Working with Arrays', 16),
      T('Java Script Arithmetic Operators', 14),
      T('Java Script Assignment Operators', 12),
      T('Variables in Java Script', 14),
      T('Working with Mathematical Operations', 14),
      T('Work with Conditions (if, else if and else)', 16),
      T('Working with Switch Loop', 14),
      T('Working with Functions', 16),
      T('Java Script Objects', 16),
      T('Working with Random and Maths', 12),
      T('Java Script Error Handling', 16),
    ],
  },
  {
    title: 'Developer Lesson 02 — Glide APIs',
    lessons: [
      T('Introduction to Glide APIs', 16),
      T('Overview of Glide APIs', 14),
      T('Client Side Glide APIs and Server Side Glide APIs', 18),
      T('Working with Important Glide APIs', 16),
      T('GlideRecord', 20),
      T('Working with GlideRecord Methods', 22),
      T('GlideForm', 16),
      T('Working with GlideForm Methods', 18),
      T('GlideUser', 14),
      T('Working with GlideUser Methods', 16),
      T('GlideSession', 14),
      T('Working with GlideSession Methods', 14),
      T('GlideDate', 14),
      T('Working with GlideDate Methods', 14),
      T('GlideDateTime', 14),
      T('Working with GlideDateTime Methods', 16),
      T('GlideList', 12),
      T('Working with GlideList Methods', 14),
      T('GlideElement and GlideElement Methods', 16),
      T('GlideDialogWindow and Methods', 14),
      T('GlideAggregate and Methods', 16),
      T('Introduction to GlideAjax', 16),
      Lab('Live lab: GlideRecord query and g_form client script', 55),
    ],
  },
  {
    title: 'Developer Lesson 03 — Client Scripts',
    lessons: [
      T('Introduction to Client Scripts', 16),
      T('Purpose of Client Scripts and Where These are Run', 16),
      T('Types of Client Scripts', 14),
      T('Elaborate onLoad, onChange, onSubmit and onCellEdit', 22),
      T('Create New Client Script', 18),
      T('Working with More Client Script Examples', 20),
      T('Catalog Client Script', 16),
      T('Difference Between Client Scripts and Catalog Client Scripts', 16),
    ],
  },
  {
    title: 'Developer Lesson 04 — UI Actions',
    lessons: [
      T('Introduction to UI Actions', 16),
      T('Importance of UI Action', 14),
      T('Working with Existing UI Actions', 16),
      T('Create new UI Action', 18),
      T('Creating UI Actions into Different Places', 16),
      T('Working with Client Side UI Actions', 18),
      T('Importance of gsftSubmit in UI Action', 16),
      T('Working with more UI Action Examples', 18),
    ],
  },
  {
    title: 'Developer Lesson 05 — Business Rules',
    lessons: [
      T('Introduction to Business Rules', 16),
      T('Importance of Business Rules', 14),
      T('Working with Display and Query Business Rule', 18),
      T('Working with Async and Sync business rule', 18),
      T('Business Rule Actions', 16),
      T('Prevent recursive business rules', 16),
      T('Working with existing business rules in PDI', 16),
      T('Create new business rule', 18),
      T('Global variables in Business Rule', 14),
      T('Working with more Business Rule examples', 18),
      Lab('Live lab: Client script, UI Action, and before business rule', 55),
    ],
  },
  {
    title: 'Developer Lesson 06 — UI Script',
    lessons: [
      T('Introduction to UI Scripts', 14),
      T('Working with Global UI Scripts', 16),
      T('Create new UI Script', 16),
      T('Run UI Scripts', 14),
      T('UI Scripts on Client Side', 16),
    ],
  },
  {
    title: 'Developer Lesson 07 — Scheduled Jobs',
    lessons: [
      T('Introduction to Scheduled jobs', 16),
      T('Schedule jobs States', 14),
      T('Create new Schedule job', 16),
      T('Run Schedule jobs', 14),
      T('View Schedule Item', 12),
    ],
  },
  {
    title: 'Developer Lesson 08 — Script Include',
    lessons: [
      T('Introduction to Script Include', 16),
      T('Use of Script Include', 14),
      T('Types of Script Include', 14),
      T('Server Side Script Include', 16),
      T('Client Side Script Include', 16),
      T('Difference Between Global Business Rule and Script Include', 16),
      T('Create New Script Include', 18),
      T('Calling Script Include into Business Rules', 16),
      T('Calling Script Include into Client Side', 16),
    ],
  },
  {
    title: 'Developer Lesson 09 — Script Include with GlideAjax',
    lessons: [
      T('Introduction to GlideAjax', 16),
      T('Types of GlideAjax', 14),
      T('Importance of GlideAjax', 14),
      T('How to Call Script Include with GlideAjax?', 20),
      Lab('Live lab: Client-callable Script Include via GlideAjax', 55),
    ],
  },
  {
    title: 'Developer Lesson 10 — Inbound Email Actions',
    lessons: [
      T('Introduction to Inbound Email Action', 16),
      T('Overview of Inbound Email Action', 14),
      T('Types of Incoming Email', 14),
      T('Create Inbound Email Action', 18),
      T('Importance of New, Reply and Forward', 16),
    ],
  },
  {
    title: 'Developer Lesson 11 — Fix Scripts',
    lessons: [
      T('Introduction to Fix Script', 14),
      T('Create Fix Script', 16),
      T('Run Fix Script', 14),
      T('Testing Fix Scripts', 14),
    ],
  },
  {
    title: 'Developer Lesson 12 — Transform Event Scripts',
    lessons: [
      T('Introduction to Transform Event Scripts', 16),
      T('Types of Event Scripts', 14),
      T('Working with All Types of Event Scripts', 18),
      T('Test Coalescing and The Transform Script', 18),
    ],
  },
  {
    title: 'Developer Lesson 13 — Implementation',
    lessons: [
      T('Introduction to Implementation', 16),
      T('Working with Scope or Custom Applications', 20),
      T('Using All ServiceNow Components to Implement Custom Application', 22),
    ],
  },
  {
    title: 'Developer Lesson 14 — Integration (Optional)',
    lessons: [
      T('Out of the Box REST API', 20),
      T('When and how to use REST integrations', 18),
      Lab('Capstone live lab: Scoped custom application + Update Set', 90),
      Q('Final live assessment — Admin + Developer', 30),
    ],
  },
]

const lessonMinutes = CURRICULUM.reduce(
  (sum, mod) => sum + mod.lessons.reduce((s, l) => s + l.duration, 0),
  0
)
// Marketed live duration is 55+ hours; scale topic minutes to match.
const durationScale = MIN_LIVE_MINUTES / lessonMinutes
const durationMin = MIN_LIVE_MINUTES

async function main() {
  console.log('Seeding ServiceNow live pillar course...\n')

  const category = await prisma.category.upsert({
    where: { slug: CATEGORY.slug },
    update: { name: CATEGORY.name },
    create: CATEGORY,
  })

  const instructor = await prisma.instructor.upsert({
    where: { id: 'servicenow-pillar-instructor' },
    update: {
      name: 'Satya Sharma',
      bio: 'ServiceNow Solution Architect with 13+ years in IT. Background across Lotus Notes, SharePoint, Oracle BI, and RPA, with 7+ years in ServiceNow development and implementation. Delivers live Admin, Developer, Implementation, Integration, and Architect batches.',
      company: 'Cloud Certification',
      avatar: 'https://ui-avatars.com/api/?name=Satya+Sharma&background=0EA5E9&color=fff&size=256',
    },
    create: {
      id: 'servicenow-pillar-instructor',
      name: 'Satya Sharma',
      bio: 'ServiceNow Solution Architect with 13+ years in IT. Background across Lotus Notes, SharePoint, Oracle BI, and RPA, with 7+ years in ServiceNow development and implementation. Delivers live Admin, Developer, Implementation, Integration, and Architect batches.',
      company: 'Cloud Certification',
      avatar: 'https://ui-avatars.com/api/?name=Satya+Sharma&background=0EA5E9&color=fff&size=256',
    },
  })

  const courseData = {
    title: 'ServiceNow Training Program',
    summary:
      'Live instructor-led ServiceNow Admin + Developer program — 55+ hours of training covering ITSM, catalog, workflow, scripting, and implementation for CSA/CAD-ready roles.',
    description:
      'This flagship live ServiceNow Training Program is 55+ hours of instructor-led training (online, classroom, or one-to-one). You start with cloud and ITIL basics, stand up a Personal Developer Instance, then master the UI, data model, user administration, and the full ITSM lifecycle — Incident, Problem, Change, Major Incident, Knowledge, and SLAs. Live labs cover UI Policies, Data Policies, assignment rules, import sets, update sets, service catalog, workflow, reports, ACLs, notifications, and MID Server. The developer track is taught live: JavaScript, Glide APIs, client scripts, UI Actions, business rules, Script Includes, GlideAjax, scheduled jobs, inbound email, fix scripts, and a scoped custom application capstone. Designed for fresh graduates and IT or non-IT professionals targeting Administrator, Developer, Implementation Specialist, Integration Specialist, and Architect roles. No prior ServiceNow experience required.',
    level: 'Beginner',
    durationMin,
    priceCents: PRICE_CENTS,
    rating: 4.9,
    published: true,
    featured: true,
    thumbnailUrl: 'https://images.unsplash.com/photo-1551434678-e076c223a692?w=800&q=80',
    language: 'English',
    currency: 'INR',
    categoryId: category.id,
    instructorId: instructor.id,
    learningOutcomes: [
      'Stand up a ServiceNow PDI and navigate UI16, lists, forms, and impersonation',
      'Model data with tables, dictionary, plugins, users, groups, and roles',
      'Run Incident, Problem, Change, Major Incident, Knowledge, and SLA processes',
      'Configure UI Policy, Data Policy, assignment rules, import sets, and update sets',
      'Build catalog items, record producers, workflows, reports, and dashboards',
      'Secure the platform with ACLs and notify stakeholders with email',
      'Script with GlideRecord, client scripts, UI Actions, business rules, and GlideAjax',
      'Implement a scoped custom application and package it in an Update Set',
    ],
    requirements: [
      'No prior ServiceNow experience required',
      'Attend live online / classroom / one-to-one sessions (55+ hours)',
      'A computer with internet access to use a Personal Developer Instance',
      'Basic computer literacy; IT background is helpful but not mandatory',
    ],
    courseFeatures: [
      'Live instructor-led training — 55+ hours',
      'Online / classroom / one-to-one batches',
      'Full Admin + Developer curriculum from the complete course outline',
      'Hands-on PDI labs in live sessions',
      'ITSM lifecycle: Incident, Problem, Change, MIM, Knowledge',
      'Scoped application capstone with Update Set packaging',
      'CSA and CAD exam-aligned topics',
    ],
    handsOnProjects: [
      {
        title: 'Personal Developer Instance setup',
        description: 'Live: request a PDI, reset admin credentials, and explore stats.do plus core applications.',
        skills: ['PDI', 'Navigation', 'Impersonation'],
        duration: '1 live session',
      },
      {
        title: 'Incident process automation',
        description: 'Live: configure assignment lookup, UI Policy, Data Policy, and an SLA on Incident.',
        skills: ['Incident', 'UI Policy', 'SLA'],
        duration: '1 live session',
      },
      {
        title: 'Service Catalog with workflow',
        description: 'Live: create a catalog item, variables, user criteria, and an approval workflow in an Update Set.',
        skills: ['Service Catalog', 'Workflow', 'Update Sets'],
        duration: '1 live session',
      },
      {
        title: 'Scoped custom application capstone',
        description: 'Live capstone: custom table, ACLs, business rules, catalog, and workflow in a scoped app.',
        skills: ['Scoped Apps', 'GlideRecord', 'ACL', 'Catalog'],
        duration: '2 live sessions',
      },
    ],
    caseStudies: [
      {
        title: 'Enterprise ITSM rollout',
        description: 'How a shared-services desk uses Incident, Problem, Change, and Knowledge together.',
      },
      {
        title: 'Catalog-led request fulfillment',
        description: 'Replace email requests with catalog items, fulfillment groups, and SLA-backed workflows.',
      },
    ],
    certifications: [
      {
        title: 'ServiceNow Certified System Administrator (CSA)',
        issuer: 'ServiceNow',
        description: 'Admin modules map to CSA topics: UI, data, user admin, ITSM, catalog, SLM, reporting, and ACLs.',
      },
      {
        title: 'ServiceNow Certified Application Developer (CAD)',
        issuer: 'ServiceNow',
        description: 'Developer modules map to CAD topics: application design, scripting, workflow, and integrations.',
      },
    ],
  }

  const course = await prisma.course.upsert({
    where: { slug: SLUG },
    update: courseData,
    create: { slug: SLUG, ...courseData },
  })

  await prisma.module.deleteMany({ where: { courseId: course.id } })

  let lessonCount = 0
  for (let i = 0; i < CURRICULUM.length; i++) {
    const mod = CURRICULUM[i]
    const created = await prisma.module.create({
      data: {
        title: mod.title,
        order: i + 1,
        courseId: course.id,
        Lesson: {
          create: mod.lessons.map((lesson, j) => ({
            title: lesson.title,
            duration: Math.max(5, Math.round(lesson.duration * durationScale)),
            order: j + 1,
            kind: lesson.kind,
          })),
        },
      },
      include: { Lesson: true },
    })
    lessonCount += created.Lesson.length
  }

  console.log(`✓ Course: ${course.title}`)
  console.log(`  slug: /courses/${SLUG}`)
  console.log(`  modules: ${CURRICULUM.length}, lessons: ${lessonCount}`)
  console.log(`  duration: ${durationMin} min (~${Math.round(durationMin / 60)}h live)`)
  console.log(`  price: ₹${PRICE_CENTS / 100}`)
  console.log(`  mode: Live instructor-led`)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
    await pool.end()
  })

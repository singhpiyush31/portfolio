/*
 * All portfolio content lives here. Edit this file to change what the site says.
 * Projects are in build order: each one added something new on top of the last.
 */
window.PORTFOLIO = {
  name: "Piyush Singh",
  role: "Software Developer",
  education: "Second-year student at PSIT Kanpur",
  tagline: "Learning backend the honest way: one project, one bug, one commit at a time.",
  about:
    "I'm a software developer and second-year student at PSIT Kanpur. I work mostly on the backend with Node.js, Express and MongoDB, and every project I build adds one new concept on top of the last one.",
  learning: ["MongoDB transactions", "File uploads", "Centralized error handling"],
  talkAbout: "REST API design, MongoDB modelling, or the bug that took me a whole evening to find.",
  motto: "make it work, then make it right.",

  email: "piyushkumarsingh.pks31@gmail.com",
  github: "https://github.com/singhpiyush31",
  linkedin: "https://www.linkedin.com/in/piyush-kumar-singh-935263404/",

  /* Optional. Put the files in assets/ and set e.g. photo: "assets/photo.jpg", cv: "assets/cv.pdf" */
  photo: "",
  cv: "",

  /* The subtitle types these one after another, after "I build" */
  heroWords: ["backends that actually work", "REST APIs", "auth and role systems", "database schemas"],

  services: [
    { icon: "api", title: "REST APIs", text: "Layered Node.js and Express APIs, organised into routes, controllers and models." },
    { icon: "lock", title: "Auth and roles", text: "JWT cookie sessions, bcrypt password hashing, and role checks through route middleware." },
    { icon: "data", title: "MongoDB modelling", text: "Mongoose schemas, relations with populate, indexes and cascade deletes." },
    { icon: "search", title: "Search and filters", text: "Paginated list endpoints with search, filters and sorting." },
  ],

  stack: [
    { group: "Language", items: ["JavaScript"] },
    { group: "DSA", items: ["Arrays", "Strings", "Recursion"] },
    { group: "Backend", items: ["Node.js", "Express"] },
    { group: "Database", items: ["MongoDB", "Mongoose"] },
    { group: "Auth", items: ["JWT", "bcrypt"] },
    { group: "Tools", items: ["Git", "GitHub", "Postman", "VS Code", "Nodemailer"] },
  ],

  projects: [
    {
      title: "DevTinder",
      summary:
        "A developer-matching backend built while learning Node.js fundamentals: auth, profiles and connection requests.",
      learned: "Express routing, Mongoose models and JWT auth, following along with a course",
      stack: ["Node.js", "Express", "MongoDB"],
      highlights: [],
      repo: "https://github.com/singhpiyush31/DevTinder",
    },
    {
      title: "To-Do Application",
      summary:
        "My first independent CRUD API, and the project where routes, controllers and models first clicked.",
      learned: "Building a CRUD API on my own",
      stack: ["Node.js", "Express", "MongoDB"],
      highlights: [],
      repo: "https://github.com/singhpiyush31/To-Do-Application",
    },
    {
      title: "Expense Tracker API",
      summary:
        "Per-user expense tracking with category and payment-method enums, date-range filters, title search, sorting, pagination and a totals endpoint.",
      learned: "Ownership checks (IDOR), pagination, search, filter and sort",
      endpoints: 9,
      stack: ["Node.js", "Express 5", "MongoDB", "JWT", "bcrypt"],
      highlights: [
        "Every expense is scoped to the logged-in user",
        "Date-range filters, title search and sorting on one list endpoint",
        "A totals endpoint alongside regular CRUD",
      ],
      repo: "https://github.com/singhpiyush31/Expense-Tracker",
    },
    {
      title: "Scrrible (Blog API)",
      summary:
        "Posts with comments, draft and published visibility, owner-only edits, and a paginated public feed with search, filter and sort.",
      learned: "Relations and populate, nested routes, draft/published flow and cascade delete",
      endpoints: 13,
      models: 3,
      stack: ["Node.js", "Express 5", "MongoDB", "JWT", "bcrypt"],
      highlights: [
        "Posts stay out of the public feed until they are published",
        "Only the author can edit or delete their own posts and comments",
        "Deleting a post also deletes all of its comments",
      ],
      repo: "https://github.com/singhpiyush31/Post-Application",
    },
    {
      title: "E-Commerce Backend",
      flagship: true,
      summary:
        "A REST API for an online store. Admins manage the catalog, users fill a cart, and orders freeze prices, with every rule enforced on the server.",
      learned: "Role-based access, cart logic, order snapshots and stock management",
      endpoints: 23,
      models: 5,
      stack: ["Node.js", "Express 5", "MongoDB", "Mongoose", "JWT", "bcrypt"],
      highlights: [
        "User and Admin roles through chained middleware, and the role is never accepted from the client",
        "Public catalog with search, category, brand, price and stock filters, 4 sort modes and pagination",
        "Stock is validated on every cart change, reduced on order and restored on cancel",
        "Orders are built only from the cart and copy name and price, so old receipts never change",
        "Order lifecycle from Pending to Confirmed, Shipped and Delivered",
      ],
      repo: "https://github.com/singhpiyush31/E-Commerce-Backend",
    },
    {
      title: "Hotel Booking Backend",
      inProgress: true,
      summary:
        "A hotel platform API in active development. Owners list hotels and rooms, admins approve them, and the public only sees what has been approved.",
      learned: "Three-role access, admin approval flows and email notifications with Nodemailer",
      endpoints: 17,
      models: 3,
      stack: ["Node.js", "Express 5", "MongoDB", "Mongoose", "JWT", "bcrypt", "Nodemailer"],
      highlights: [
        "User, Owner and Admin roles enforced by route middleware",
        "Hotels start as Pending, and a rejection must include a reason",
        "Owners are emailed when their hotel is approved or rejected",
        "Public hotel listing with search, city and amenity filters and pagination",
        "Room numbers are unique within each hotel through a compound index",
      ],
      repo: "https://github.com/singhpiyush31/Hotel-Booking-Backend",
    },
  ],
};

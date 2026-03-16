// labelX, labelY = center of each building on the 2000x1595 image

const BUILDINGS = [
  {
    id: "ENG", name: "Engineering Building", category: "engineering", color: "#63b3ed",
    hours: "Mon–Fri 7:00am–11:00pm | Sat 8:00am–8:00pm",
    departments: ["Engineering & Applied Science", "Electrical Engineering", "Software Engineering", "Nuclear Engineering"],
    description: "Primary engineering faculty building with design studios, electronics labs, and project spaces.",
    capacity: 1100, accessibility: true,
    adminNotes: "Project rooms bookable via portal. High-voltage labs require supervisor.",
    labelX: 500, labelY: 430
  },
  {
    id: "LIB", name: "Library", category: "services", color: "#66bb6a",
    hours: "Mon–Thu 8:00am–10:00pm | Fri 8:00am–6:00pm | Sat–Sun 10:00am–6:00pm",
    departments: ["Library Services", "Research Support", "Academic Success Centre"],
    description: "Multi-floor library with study rooms, research databases, printing services, and a makerspace.",
    capacity: 700, accessibility: true,
    adminNotes: "24hr study area on ground floor during exams. Makerspace booking required.",
    labelX: 975, labelY: 520
  },
  {
    id: "SHA", name: "Shaw Hall", category: "tutorials", color: "#ffb74d",
    hours: "Mon–Fri 7:00am–10:00pm | Sat 9:00am–5:00pm",
    departments: ["Health Sciences", "Kinesiology", "Biology", "Chemistry"],
    description: "Houses health science programs with labs, lecture theatres, and simulation suites.",
    capacity: 1000, accessibility: true,
    adminNotes: "Lab safety training mandatory. Simulation suite booking via department.",
    labelX: 1250, labelY: 450
  },
  {
    id: "ERC", name: "Energy Research Centre", category: "research", color: "#ba68c8",
    hours: "Mon–Fri 8:00am–6:00pm",
    departments: ["Energy Systems", "Clean Energy Research"],
    description: "Dedicated to sustainable energy research and innovation, housing solar, wind, and smart grid labs.",
    capacity: 200, accessibility: true,
    adminNotes: "Shared facility with external research partners. Badge access required.",
    labelX: 1200, labelY: 720
  },
  {
    id: "BIT", name: "Business & IT Building", category: "business", color: "#f06292",
    hours: "Mon–Fri 7:00am–10:00pm | Sat 8:00am–6:00pm",
    departments: ["Business & IT", "Computer Science", "Information Technology"],
    description: "Houses the Faculty of Business and IT with lecture halls, seminar rooms, and computing labs.",
    capacity: 1200, accessibility: true,
    adminNotes: "Multiple lecture halls up to 200 seats. Computer labs on floors 2–4.",
    labelX: 1150, labelY: 1000
  },
  {
    id: "REC", name: "Recreation Centre/Gym", category: "recreation", color: "#ef6c00",
    hours: "Mon–Fri 6:00am–11:00pm | Sat–Sun 8:00am–9:00pm",
    departments: ["Campus Recreation", "Athletics"],
    description: "Full-service recreation centre with gym, pool, squash courts, fitness classes, and intramural sports.",
    capacity: 600, accessibility: true,
    adminNotes: "Student membership included in fees. Day passes available for staff.",
    labelX: 200, labelY: 1207
  },
  {
    id: "SCI", name: "UA - Science Building", category: "science", color: "#26a69a",
    hours: "Mon–Fri 7:30am–9:00pm | Sat–Sun 9:00am–5:00pm",
    departments: ["Registrar", "Student Central", "Financial Aid", "IT Services"],
    description: "Central hub for student services including registration, financial aid, and academic advising.",
    capacity: 800, accessibility: true,
    adminNotes: "Main student services hub. High foot traffic during registration periods.",
    labelX: 820, labelY: 1220
  },
];
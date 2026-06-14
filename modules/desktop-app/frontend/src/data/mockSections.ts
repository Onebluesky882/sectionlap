import type { Section } from "../types";

export const mockSections: Section[] = [
  {
    id: "html-basics",
    title: "HTML Foundations",
    description:
      "Learn semantic HTML, document structure, and accessibility basics. The first step toward building real web pages.",
    price: 19,
    teacher: "Avery Chen",
    category: "Frontend",
    durationMinutes: 90,
  },
  {
    id: "css-layout",
    title: "CSS Layout & Styling",
    description:
      "Master Flexbox, Grid, and responsive design to turn plain HTML into polished, adaptive interfaces.",
    price: 24,
    teacher: "Avery Chen",
    category: "Frontend",
    durationMinutes: 120,
  },
  {
    id: "js-fundamentals",
    title: "JavaScript Fundamentals",
    description:
      "Variables, functions, control flow, and the DOM. Everything you need to make your pages interactive.",
    price: 29,
    teacher: "Priya Natarajan",
    category: "Frontend",
    durationMinutes: 150,
  },
  {
    id: "deploy-101",
    title: "Deploying Your First Site",
    description:
      "Take your project from localhost to the world. Covers static hosting, environment variables, and CI basics.",
    price: 15,
    teacher: "Priya Natarajan",
    category: "DevOps",
    durationMinutes: 60,
  },
  {
    id: "react-intro",
    title: "Introduction to React",
    description:
      "Components, props, and state. Build your first interactive UI with the most popular frontend library.",
    price: 34,
    teacher: "Marcus Lee",
    category: "Frontend",
    durationMinutes: 180,
  },
];

import kheliancart0 from "../../../assets/images/projects/kheliancart/kheliancart-0.webp";

import type { ProjectContent } from "../../types";

export default {
  title: "KhelianCart",
  theme: "light",
  categoryLabel: "Web Application",
  techStack: ["Node.js", "PostgreSQL", "Express.js", "JavaScript", "HTML", "CSS"],
  videoBorder: false,
  live: "https://kheliancart.com",
  description:
    "KhelianCart is a grocery ecommerce platform built for Ho, Ghana — farm-fresh produce, category browsing, cart checkout, and local delivery.<br/><br/>Software development project by Obed Prince Kofi Yesu: mobile and web-based storefront with secure payments, product catalog, and partner delivery workflows.",
  components: [
    {
      type: "media",
      props: {
        type: "image",
        src: kheliancart0,
        alt: "KhelianCart grocery ecommerce store",
        caption: "KhelianCart — grocery delivery in Ho, Ghana",
      },
    },
    {
      type: "text",
      props: {
        title: "What I built",
        text: "Full-stack grocery ecommerce: product catalog, cart, checkout, delivery partner flows, and admin-ready backend APIs with secure coding practices and validation.",
      },
    },
    {
      type: "list",
      props: {
        title: "Stack & focus",
        size: "md",
        items: [
          "Node.js / Express APIs",
          "PostgreSQL data layer",
          "Web & mobile-friendly storefront",
          "Secure payments and order workflows",
        ],
      },
    },
  ],
} as const satisfies ProjectContent;

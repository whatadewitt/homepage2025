import type { PortfolioItem } from "../../types/portfolio";

export const portfolioItems: PortfolioItem[] = [
  {
    id: "project-1",
    title: "Yahoo! Fantasy Sports API",
    description:
      "A labour of love I've been working on for years. This open-source NodeJS module wraps the Yahoo! Fantasy Sports API and allows users to interact with fantasy sports data, including leagues, teams, and player stats. This docs page is fully interactive and will allow you to authenticate and make calls against your league data. This site links to the Github project.",
    link: "https://yahoo-fantasy-node-docs.vercel.app/",
    image: "/images/portfolio/yfantasy.png",
    order: 1,
  },
  {
    id: "project-2",
    title: "Task Management App",
    description:
      "A collaborative task management application with real-time updates, drag-and-drop functionality, and team collaboration features.",
    link: "https://github.com/yourusername/task-manager",
    image: "/images/portfolio/task-manager.jpg",
    order: 2,
  },
  {
    id: "project-3",
    title: "Weather Dashboard",
    description:
      "A responsive weather dashboard that provides detailed forecasts, interactive maps, and historical weather data visualization.",
    link: "https://github.com/yourusername/weather-dashboard",
    image: "/images/portfolio/weather.jpg",
    order: 3,
  },
  {
    id: "project-4",
    title: "Social Media Analytics Tool",
    description:
      "An analytics platform for social media managers to track engagement, analyze trends, and generate comprehensive reports.",
    link: "https://github.com/yourusername/social-analytics",
    image: "/images/portfolio/analytics.jpg",
    order: 4,
  },
];

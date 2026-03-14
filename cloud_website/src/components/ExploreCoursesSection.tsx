"use client";

import { useState } from "react";
import Image from "next/image";

const categories = [
  { id: "pg", label: "Online PG Programmes" },
  { id: "ug", label: "Online UG Programmes" },
  { id: "diploma", label: "Diploma Courses" },
  { id: "executive", label: "Executive Programmes" },
  { id: "certifications", label: "Certifications" },
  { id: "international", label: "International Programmes" },
  { id: "free", label: "Free Courses" },
];

type Course = {
  id: string;
  name: string;
  duration: string;
  image: string;
};

const coursesByCategory: Record<string, Course[]> = {
  pg: [
    { id: "mba", name: "Online MBA", duration: "2 Years", image: "/courses/mba.jpg" },
    { id: "mca", name: "Online MCA", duration: "2 Years", image: "/courses/mca.jpg" },
    { id: "mcom", name: "Online MCom", duration: "2 Years", image: "/courses/mcom.jpg" },
    { id: "msc", name: "Online MSc", duration: "2 Years", image: "/courses/msc.jpg" },
    { id: "ma", name: "Online MA", duration: "2 Years", image: "/courses/ma.jpg" },
    { id: "mcom-acca", name: "M.Com with ACCA", duration: "2 Years", image: "/courses/mcom-acca.jpg" },
    { id: "dist-mba", name: "Distance MBA", duration: "2 Years", image: "/courses/dist-mba.jpg" },
    { id: "dist-mca", name: "Distance MCA", duration: "2 Years", image: "/courses/dist-mca.jpg" },
    { id: "dist-mcom", name: "Distance MCom", duration: "2 Years", image: "/courses/dist-mcom.jpg" },
    { id: "dist-mlis", name: "Distance MLIS", duration: "1 Year", image: "/courses/dist-mlis.jpg" },
  ],
  ug: [
    { id: "bba", name: "Online BBA", duration: "3 Years", image: "/courses/bba.jpg" },
    { id: "bca", name: "Online BCA", duration: "3 Years", image: "/courses/bca.jpg" },
    { id: "bcom", name: "Online BCom", duration: "3 Years", image: "/courses/bcom.jpg" },
    { id: "ba", name: "Online BA", duration: "3 Years", image: "/courses/ba.jpg" },
    { id: "bsc", name: "Online BSc", duration: "3 Years", image: "/courses/bsc.jpg" },
  ],
  diploma: [
    { id: "dba", name: "Diploma in Business", duration: "1 Year", image: "/courses/dba.jpg" },
    { id: "dit", name: "Diploma in IT", duration: "1 Year", image: "/courses/dit.jpg" },
    { id: "dhr", name: "Diploma in HR", duration: "6 Months", image: "/courses/dhr.jpg" },
  ],
  executive: [
    { id: "emba", name: "Executive MBA", duration: "1 Year", image: "/courses/emba.jpg" },
    { id: "epgm", name: "Executive PGM", duration: "1 Year", image: "/courses/epgm.jpg" },
  ],
  certifications: [
    { id: "cert-pm", name: "Project Management", duration: "3 Months", image: "/courses/cert-pm.jpg" },
    { id: "cert-ds", name: "Data Science", duration: "6 Months", image: "/courses/cert-ds.jpg" },
    { id: "cert-ml", name: "Machine Learning", duration: "6 Months", image: "/courses/cert-ml.jpg" },
  ],
  international: [
    { id: "int-mba", name: "International MBA", duration: "2 Years", image: "/courses/int-mba.jpg" },
    { id: "int-ms", name: "International MS", duration: "2 Years", image: "/courses/int-ms.jpg" },
  ],
  free: [
    { id: "free-py", name: "Python Basics", duration: "Self-paced", image: "/courses/free-py.jpg" },
    { id: "free-web", name: "Web Development", duration: "Self-paced", image: "/courses/free-web.jpg" },
    { id: "free-ai", name: "AI Fundamentals", duration: "Self-paced", image: "/courses/free-ai.jpg" },
  ],
};

// Fallback placeholder image using a colored div with initials
function CourseImage({ src, alt }: { src: string; alt: string }) {
  const [error, setError] = useState(false);

  if (error) {
    return (
      <div className="w-full h-32 bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center rounded-t-lg">
        <span className="text-blue-600 text-xs font-semibold text-center px-2">{alt}</span>
      </div>
    );
  }

  return (
    <div className="relative w-full h-32 rounded-t-lg overflow-hidden">
      <Image
        src={src}
        alt={alt}
        fill
        className="object-cover"
        onError={() => setError(true)}
        sizes="(max-width: 768px) 50vw, 20vw"
      />
    </div>
  );
}

export default function ExploreCoursesSection() {
  const [activeCategory, setActiveCategory] = useState("pg");
  const courses = coursesByCategory[activeCategory] ?? [];

  return (
    <div className="flex flex-col lg:flex-row gap-6 w-full">
      {/* Sidebar */}
      <div className="lg:w-52 flex-shrink-0">
        <ul className="border border-gray-200 rounded-lg overflow-hidden">
          {categories.map((cat) => (
            <li key={cat.id}>
              <button
                onClick={() => setActiveCategory(cat.id)}
                className={`w-full text-left px-4 py-3 text-sm font-medium transition-colors duration-150 border-b border-gray-100 last:border-b-0 ${
                  activeCategory === cat.id
                    ? "bg-blue-700 text-white"
                    : "bg-white text-gray-700 hover:bg-blue-50 hover:text-blue-700"
                }`}
              >
                {cat.label}
              </button>
            </li>
          ))}
        </ul>
      </div>

      {/* Course Grid */}
      <div className="flex-1">
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {courses.map((course) => (
            <div
              key={course.id}
              className="bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200 flex flex-col"
            >
              <CourseImage src={course.image} alt={course.name} />
              <div className="p-3 flex flex-col flex-1">
                <p className="text-sm font-semibold text-gray-800 leading-tight">{course.name}</p>
                <p className="text-xs text-gray-500 mt-1">Duration: {course.duration}</p>
                <div className="mt-auto pt-3">
                  <button className="w-full bg-blue-100 hover:bg-blue-200 text-blue-700 text-xs font-medium py-1.5 rounded transition-colors duration-150">
                    Read More
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

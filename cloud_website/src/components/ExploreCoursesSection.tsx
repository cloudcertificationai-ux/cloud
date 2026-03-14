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

function CourseImage({ src, alt }: { src: string; alt: string }) {
  const [error, setError] = useState(false);

  if (error) {
    return (
      <div style={{ width: "100%", height: "110px", background: "linear-gradient(135deg, #dbeafe, #bfdbfe)", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <span style={{ color: "#1d4ed8", fontSize: "11px", fontWeight: 600, textAlign: "center", padding: "0 8px" }}>{alt}</span>
      </div>
    );
  }

  return (
    <div style={{ position: "relative", width: "100%", height: "110px", overflow: "hidden" }}>
      <Image
        src={src}
        alt={alt}
        fill
        style={{ objectFit: "cover" }}
        onError={() => setError(true)}
        sizes="200px"
      />
    </div>
  );
}

export default function ExploreCoursesSection() {
  const [activeCategory, setActiveCategory] = useState("pg");
  const courses = coursesByCategory[activeCategory] ?? [];

  return (
    <div style={{ display: "flex", gap: "24px", width: "100%", alignItems: "flex-start" }}>

      {/* Sidebar */}
      <div style={{ width: "200px", flexShrink: 0, border: "1px solid #e5e7eb", borderRadius: "8px", overflow: "hidden" }}>
        {categories.map((cat, i) => (
          <button
            key={cat.id}
            onClick={() => setActiveCategory(cat.id)}
            style={{
              display: "block",
              width: "100%",
              textAlign: "left",
              padding: "12px 16px",
              fontSize: "14px",
              fontWeight: 500,
              cursor: "pointer",
              borderBottom: i < categories.length - 1 ? "1px solid #f3f4f6" : "none",
              background: activeCategory === cat.id ? "#1d4ed8" : "#ffffff",
              color: activeCategory === cat.id ? "#ffffff" : "#374151",
              transition: "background 0.15s",
            }}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Course Grid */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(5, 1fr)",
          gap: "20px",
        }}>
          {courses.map((course) => (
            <div
              key={course.id}
              style={{
                background: "#ffffff",
                border: "1px solid #e5e7eb",
                borderRadius: "10px",
                boxShadow: "0 1px 4px rgba(0,0,0,0.08)",
                overflow: "hidden",
                display: "flex",
                flexDirection: "column",
              }}
            >
              <CourseImage src={course.image} alt={course.name} />
              <div style={{ padding: "12px", display: "flex", flexDirection: "column", gap: "4px", flex: 1 }}>
                <p style={{ fontSize: "13px", fontWeight: 700, color: "#111827", margin: 0, lineHeight: 1.4 }}>{course.name}</p>
                <p style={{ fontSize: "12px", color: "#6b7280", margin: 0 }}>Duration: {course.duration}</p>
                <div style={{ marginTop: "10px" }}>
                  <button style={{
                    width: "100%",
                    background: "#dbeafe",
                    color: "#1d4ed8",
                    border: "none",
                    borderRadius: "6px",
                    padding: "7px 0",
                    fontSize: "12px",
                    fontWeight: 600,
                    cursor: "pointer",
                  }}>
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

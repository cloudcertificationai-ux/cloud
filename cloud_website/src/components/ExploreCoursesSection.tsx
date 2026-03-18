"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { CategoryWithCourses } from "@/types/categories";

interface ExploreCoursesSectionProps {
  categories: CategoryWithCourses[];
}

function CourseImage({ src, alt }: { src: string; alt: string }) {
  const [error, setError] = useState(false);

  if (error || !src) {
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

function formatDuration(durationMin: number | null): string {
  if (!durationMin) return "";
  if (durationMin < 60) return `${durationMin} min`;
  const hours = Math.round(durationMin / 60);
  return `${hours}h`;
}

export default function ExploreCoursesSection({ categories }: ExploreCoursesSectionProps) {
  const [activeCategoryId, setActiveCategoryId] = useState<string>(
    categories[0]?.id ?? ""
  );

  const activeCategory = categories.find((c) => c.id === activeCategoryId);
  const courses = activeCategory?.courses ?? [];

  if (categories.length === 0) {
    return (
      <p style={{ color: "#6b7280", fontSize: "14px" }}>No categories available.</p>
    );
  }

  return (
    <div style={{ display: "flex", gap: "24px", width: "100%", alignItems: "flex-start" }}>

      {/* Sidebar */}
      <div style={{ width: "200px", flexShrink: 0, border: "1px solid #e5e7eb", borderRadius: "8px", overflow: "hidden" }}>
        {categories.map((cat, i) => (
          <button
            key={cat.id}
            onClick={() => setActiveCategoryId(cat.id)}
            style={{
              display: "block",
              width: "100%",
              textAlign: "left",
              padding: "12px 16px",
              fontSize: "14px",
              fontWeight: 500,
              cursor: "pointer",
              borderBottom: i < categories.length - 1 ? "1px solid #f3f4f6" : "none",
              background: activeCategoryId === cat.id ? "#1d4ed8" : "#ffffff",
              color: activeCategoryId === cat.id ? "#ffffff" : "#374151",
              transition: "background 0.15s",
              border: "none",
            }}
          >
            {cat.name}
          </button>
        ))}
      </div>

      {/* Course Grid */}
      <div style={{ flex: 1, minWidth: 0 }}>
        {courses.length === 0 ? (
          <p style={{ color: "#6b7280", fontSize: "14px" }}>No courses in this category yet.</p>
        ) : (
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(5, 1fr)",
            gap: "20px",
          }}>
            {courses.map((course) => (
              <Link
                key={course.id}
                href={`/courses/${course.slug}`}
                style={{ textDecoration: "none" }}
              >
                <div
                  style={{
                    background: "#ffffff",
                    border: "1px solid #e5e7eb",
                    borderRadius: "10px",
                    boxShadow: "0 1px 4px rgba(0,0,0,0.08)",
                    overflow: "hidden",
                    display: "flex",
                    flexDirection: "column",
                    height: "100%",
                  }}
                >
                  <CourseImage src={course.thumbnailUrl ?? ""} alt={course.title} />
                  <div style={{ padding: "12px", display: "flex", flexDirection: "column", gap: "4px", flex: 1 }}>
                    <p style={{ fontSize: "13px", fontWeight: 700, color: "#111827", margin: 0, lineHeight: 1.4 }}>{course.title}</p>
                    {course.durationMin && (
                      <p style={{ fontSize: "12px", color: "#6b7280", margin: 0 }}>
                        Duration: {formatDuration(course.durationMin)}
                      </p>
                    )}
                    <div style={{ marginTop: "10px" }}>
                      <span style={{
                        display: "block",
                        width: "100%",
                        background: "#dbeafe",
                        color: "#1d4ed8",
                        borderRadius: "6px",
                        padding: "7px 0",
                        fontSize: "12px",
                        fontWeight: 600,
                        textAlign: "center",
                      }}>
                        Read More
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

    </div>
  );
}

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
    <div style={{ position: "relative", width: "100%", height: "110px", overflow: "clip", overscrollBehavior: "auto" }}>
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
  const INITIAL_VISIBLE = 10;
  const pillarCategory =
    categories.find((c) => c.slug === 'enterprise-applications') ?? categories[0];
  const [activeCategoryId, setActiveCategoryId] = useState<string>(
    pillarCategory?.id ?? ""
  );
  const [expanded, setExpanded] = useState(false);

  const activeCategory = categories.find((c) => c.id === activeCategoryId);
  const courses = activeCategory?.courses ?? [];
  const hasMore = courses.length > INITIAL_VISIBLE;
  const visibleCourses =
    expanded || !hasMore ? courses : courses.slice(0, INITIAL_VISIBLE);

  const selectCategory = (id: string) => {
    setActiveCategoryId(id);
    setExpanded(false);
  };

  if (categories.length === 0) {
    return (
      <p style={{ color: "#6b7280", fontSize: "14px" }}>No categories available.</p>
    );
  }

  return (
    <div
      className="explore-courses"
      style={{
        display: "flex",
        gap: "24px",
        width: "100%",
        alignItems: "stretch",
        overscrollBehavior: "auto",
      }}
    >

      {/* Sidebar — sticky when many course cards; stays level with cards at top */}
      <div
        style={{
          width: "200px",
          flexShrink: 0,
          alignSelf: "flex-start",
          position: "sticky",
          top: "76px", /* below sticky header (62px) + gap */
          zIndex: 10,
        }}
      >
        <div
          style={{
            border: "1px solid #e5e7eb",
            borderRadius: "8px",
            overflow: "clip",
            background: "#ffffff",
            boxShadow: "0 4px 16px rgba(15, 23, 42, 0.1), 0 1px 3px rgba(15, 23, 42, 0.06)",
          }}
        >
          {categories.map((cat, i) => (
            <button
              key={cat.id}
              onClick={() => selectCategory(cat.id)}
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
      </div>

      {/* Course area — button sinks to bottom when courses are few */}
      <div
        style={{
          flex: 1,
          minWidth: 0,
          display: "flex",
          flexDirection: "column",
          overscrollBehavior: "auto",
        }}
      >
        {courses.length === 0 ? (
          <p style={{ color: "#6b7280", fontSize: "14px" }}>No courses in this category yet.</p>
        ) : (
          <>
            <div style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))",
              gap: "20px",
              alignContent: "start",
            }}>
              {visibleCourses.map((course) => (
                <Link
                  key={course.id}
                  href={`/courses/${course.slug}`}
                  className="explore-course-card"
                  style={{
                    textDecoration: "none",
                    display: "block",
                    overscrollBehavior: "auto",
                    touchAction: "pan-y",
                  }}
                >
                  <div
                    style={{
                      background: "#ffffff",
                      border: "1px solid #e5e7eb",
                      borderRadius: "10px",
                      boxShadow: "0 1px 4px rgba(0,0,0,0.08)",
                      overflow: "clip",
                      display: "flex",
                      flexDirection: "column",
                      height: "100%",
                      overscrollBehavior: "auto",
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

            {hasMore && !expanded && (
              <div style={{ display: "flex", justifyContent: "center", marginTop: "20px" }}>
                <button
                  type="button"
                  onClick={() => setExpanded(true)}
                  aria-label="Show more courses"
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    width: "44px",
                    height: "44px",
                    borderRadius: "999px",
                    border: "1.5px solid #bfdbfe",
                    background: "#eff6ff",
                    color: "#1d4ed8",
                    cursor: "pointer",
                    boxShadow: "0 2px 8px rgba(37, 99, 235, 0.15)",
                    transition: "background 0.15s ease, transform 0.15s ease",
                  }}
                >
                  <svg
                    width="22"
                    height="22"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2.5}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </button>
              </div>
            )}
          </>
        )}

        <div
          style={{
            textAlign: "center",
            marginTop: "auto",
            paddingTop: courses.length <= INITIAL_VISIBLE ? "131px" : "40px",
          }}
        >
          <Link
            href={activeCategory ? `/courses?category=${activeCategory.slug}` : "/courses"}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
              padding: "12px 24px",
              background: "#2563eb",
              color: "#ffffff",
              fontWeight: 600,
              fontSize: "14px",
              borderRadius: "8px",
              textDecoration: "none",
              boxShadow: "0 2px 8px rgba(37, 99, 235, 0.25)",
              transition: "background 0.2s ease, box-shadow 0.2s ease",
            }}
          >
            View All Courses
            <svg
              width="18"
              height="18"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17 8l4 4m0 0l-4 4m4-4H3"
              />
            </svg>
          </Link>
        </div>
      </div>

    </div>
  );
}

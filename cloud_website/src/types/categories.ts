export interface DbCoursePreview {
  id: string;
  title: string;
  slug: string;
  thumbnailUrl: string | null;
  durationMin: number | null;
}

export interface CategoryWithCourses {
  id: string;
  name: string;
  slug: string;
  courses: DbCoursePreview[];
}

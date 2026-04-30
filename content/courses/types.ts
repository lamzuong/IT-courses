export type LessonMeta = {
  slug: string;        // matches the MDX filename without extension, e.g., '01-intro-and-landscape'
  title: string;
  summary?: string;    // one-line description shown on the course detail page
};

export type CoursePart = {
  title: string;       // e.g., 'Foundations'
  lessons: LessonMeta[];
};

export type ProjectMeta = {
  slug: 'project';     // always 'project' — the URL is /courses/<course>/project
  title: string;
};

export type Course = {
  slug: string;
  title: string;
  summary: string;
  longDescription: string;
  whatYoullLearn: string[];   // 3-5 bullets shown on course detail page
  whatYoullBuild: string;     // sentence describing the project
  parts: CoursePart[];        // ordered parts; lessons are flattened in order
  project: ProjectMeta;
};

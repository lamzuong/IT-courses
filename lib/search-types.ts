export type SearchRecord =
  | {
      kind: 'course';
      href: string;
      title: string;
      summary: string;
      courseTitle: string;
      body: string;
    }
  | {
      kind: 'lesson';
      href: string;
      title: string;
      summary: string;
      courseTitle: string;
      partTitle: string;
      lessonNumber: number;
      body: string;
    }
  | {
      kind: 'project';
      href: string;
      title: string;
      summary: string;
      courseTitle: string;
      body: string;
    };

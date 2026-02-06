
export interface Grade {
  id: string;
  subject: string;
  score: number;
  date: string;
  note?: string;
}

export interface Violation {
  id: string;
  type: 'Nói chuyện' | 'Thiếu bài' | 'Đi muộn' | 'Khác';
  date: string;
  description: string;
  severity: 'Thấp' | 'Trung bình' | 'Cao';
}

export interface Student {
  id: string;
  name: string;
  studentId: string;
  avatar: string;
  grades: Grade[];
  violations: Violation[];
}

export interface ClassData {
  id: string;
  className: string;
  teacherName: string;
  students: Student[];
}

export type ViewType = 'dashboard' | 'students' | 'reports' | 'ai-analysis';

// Declare global types for external libraries loaded via CDN to fix Window property errors
declare global {
  interface Window {
    confetti?: (options?: any) => void;
    marked?: {
      parse: (markdown: string) => string;
    };
    // For confetti
    webkitAudioContext?: typeof AudioContext;
  }
}

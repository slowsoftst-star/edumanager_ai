
import { ClassData } from './types';

export const DEMO_DATA: ClassData = {
  id: 'class-10a1',
  className: 'Lớp 12A1',
  teacherName: 'Nguyễn Văn A',
  students: [
    {
      id: 'st-1',
      name: 'Nguyễn Hoàng Nam',
      studentId: 'HS001',
      avatar: 'https://picsum.photos/seed/nam/200',
      grades: [
        { id: 'g1', subject: 'Toán', score: 8.5, date: '2024-03-10' },
        { id: 'g2', subject: 'Vật lý', score: 9.0, date: '2024-03-12' }
      ],
      violations: [
        { id: 'v1', type: 'Nói chuyện', date: '2024-03-05', description: 'Nói chuyện trong giờ Toán', severity: 'Thấp' }
      ]
    },
    {
      id: 'st-2',
      name: 'Trần Thị Mai',
      studentId: 'HS002',
      avatar: 'https://picsum.photos/seed/mai/200',
      grades: [
        { id: 'g3', subject: 'Toán', score: 7.0, date: '2024-03-10' },
        { id: 'g4', subject: 'Ngữ văn', score: 8.0, date: '2024-03-15' }
      ],
      violations: [
        { id: 'v2', type: 'Thiếu bài', date: '2024-03-08', description: 'Chưa soạn bài Ngữ văn', severity: 'Trung bình' }
      ]
    },
    {
      id: 'st-3',
      name: 'Lê Quang Vinh',
      studentId: 'HS003',
      avatar: 'https://picsum.photos/seed/vinh/200',
      grades: [
        { id: 'g5', subject: 'Tiếng Anh', score: 9.5, date: '2024-03-11' },
        { id: 'g6', subject: 'Hóa học', score: 6.5, date: '2024-03-14' }
      ],
      violations: []
    }
  ]
};

export const SUBJECTS = ['Toán', 'Ngữ văn', 'Tiếng Anh', 'Vật lý', 'Hóa học', 'Sinh học', 'Lịch sử', 'Địa lý', 'GDCD'];
export const VIOLATION_TYPES = ['Nói chuyện', 'Thiếu bài', 'Đi muộn', 'Khác'] as const;

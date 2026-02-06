
import { GoogleGenAI, GenerateContentResponse } from "@google/genai";
import { Student } from "../types";

// Model fallback order as specified in AI_INSTRUCTIONS.md
const MODEL_FALLBACK_ORDER = [
  'gemini-3-flash-preview',
  'gemini-3-pro-preview', 
  'gemini-2.5-flash'
];

interface AICallOptions {
  apiKey: string;
  preferredModel?: string;
}

async function callWithFallback(
  apiKey: string,
  prompt: string,
  preferredModel?: string
): Promise<string> {
  const ai = new GoogleGenAI({ apiKey });
  
  // Start with preferred model or first in fallback order
  const modelsToTry = preferredModel 
    ? [preferredModel, ...MODEL_FALLBACK_ORDER.filter(m => m !== preferredModel)]
    : MODEL_FALLBACK_ORDER;

  let lastError: Error | null = null;

  for (const model of modelsToTry) {
    try {
      const response: GenerateContentResponse = await ai.models.generateContent({
        model,
        contents: prompt,
        config: {
          temperature: 0.7,
          topP: 0.9,
        }
      });

      return response.text || 'Không có phản hồi từ AI.';
    } catch (error: any) {
      console.warn(`Model ${model} failed:`, error.message);
      lastError = error;
      // Continue to next model in fallback order
    }
  }

  // All models failed - throw error with original API message
  const errorMessage = lastError?.message || 'Unknown error';
  throw new Error(`Tất cả model đều thất bại. Lỗi: ${errorMessage}`);
}

export const getAIAnalysis = async (
  student: Student, 
  options: AICallOptions
): Promise<string> => {
  const prompt = `
    Dựa trên dữ liệu học tập của học sinh sau đây, hãy viết một bản phân tích ngắn gọn (khoảng 150-200 từ) bằng tiếng Việt.
    Nội dung bao gồm:
    1. Đánh giá chung về học lực dựa trên điểm số.
    2. Nhận xét về thái độ kỷ luật dựa trên các vi phạm.
    3. Đề xuất kế hoạch cải thiện hoặc khen thưởng cụ thể cho giáo viên và phụ huynh.

    Dữ liệu học sinh:
    Họ tên: ${student.name}
    Điểm số: ${JSON.stringify(student.grades)}
    Vi phạm: ${JSON.stringify(student.violations)}
    
    Hãy viết theo phong cách chuyên nghiệp, tích cực và mang tính xây dựng. Sử dụng định dạng Markdown.
  `;

  return callWithFallback(options.apiKey, prompt, options.preferredModel);
};

export const getGeneralReport = async (
  students: Student[],
  options: AICallOptions
): Promise<string> => {
  const prompt = `
    Tổng hợp báo cáo cho cả lớp dựa trên dữ liệu sau:
    ${JSON.stringify(students.map(s => ({ 
      name: s.name, 
      avgScore: s.grades.length ? (s.grades.reduce((a, b) => a + b.score, 0) / s.grades.length) : 0, 
      violationCount: s.violations.length 
    })))}
    
    Hãy tóm tắt tình hình học tập và kỷ luật chung của lớp, chỉ ra các nhóm học sinh cần quan tâm đặc biệt. Viết bằng tiếng Việt, định dạng Markdown.
  `;

  return callWithFallback(options.apiKey, prompt, options.preferredModel);
};

export { MODEL_FALLBACK_ORDER };

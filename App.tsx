
import React, { useState, useEffect, useMemo } from 'react';
import { Student, Grade, Violation, ViewType, ClassData } from './types';
import { DEMO_DATA, SUBJECTS, VIOLATION_TYPES } from './constants';
import { getAIAnalysis, getGeneralReport, MODEL_FALLBACK_ORDER } from './services/geminiService';

// --- Sub-components ---

const SidebarItem: React.FC<{
  icon: string;
  label: string;
  active: boolean;
  onClick: () => void
}> = ({ icon, label, active, onClick }) => (
  <button
    onClick={onClick}
    className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 ${active
        ? 'bg-white text-blue-600 shadow-sm font-semibold'
        : 'text-white/80 hover:bg-white/10 hover:text-white'
      }`}
  >
    <i className={`fa-solid ${icon} w-6 text-center`}></i>
    <span className="text-sm">{label}</span>
  </button>
);

const StatCard: React.FC<{ icon: string; label: string; value: string | number; color: string }> = ({
  icon, label, value, color
}) => (
  <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center space-x-4">
    <div className={`w-12 h-12 rounded-full flex items-center justify-center ${color}`}>
      <i className={`fa-solid ${icon} text-white text-lg`}></i>
    </div>
    <div>
      <p className="text-sm text-slate-500 font-medium">{label}</p>
      <h3 className="text-2xl font-bold text-slate-800">{value}</h3>
    </div>
  </div>
);

// --- Model Selection Card ---
const ModelCard: React.FC<{
  model: string;
  isSelected: boolean;
  onSelect: () => void;
}> = ({ model, isSelected, onSelect }) => (
  <button
    onClick={onSelect}
    className={`p-4 rounded-xl border-2 transition-all ${isSelected
        ? 'border-blue-500 bg-blue-50 text-blue-700'
        : 'border-slate-200 bg-white hover:border-blue-300'
      }`}
  >
    <div className="flex items-center space-x-3">
      <div className={`w-4 h-4 rounded-full border-2 ${isSelected ? 'border-blue-500 bg-blue-500' : 'border-slate-300'}`}>
        {isSelected && <i className="fa-solid fa-check text-white text-xs"></i>}
      </div>
      <span className="font-medium text-sm">{model}</span>
    </div>
  </button>
);

// --- API Key Modal ---
const ApiKeyModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  onSave: (key: string, model: string) => void;
  currentKey: string;
  currentModel: string;
}> = ({ isOpen, onClose, onSave, currentKey, currentModel }) => {
  const [key, setKey] = useState(currentKey);
  const [model, setModel] = useState(currentModel || MODEL_FALLBACK_ORDER[0]);

  useEffect(() => {
    setKey(currentKey);
    setModel(currentModel || MODEL_FALLBACK_ORDER[0]);
  }, [currentKey, currentModel]);

  if (!isOpen) return null;

  const handleSave = () => {
    if (key.trim()) {
      onSave(key.trim(), model);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg p-8 mx-4">
        <div className="flex items-center space-x-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-600 flex items-center justify-center">
            <i className="fa-solid fa-key text-white"></i>
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-800">Thiết lập API Key</h2>
            <p className="text-sm text-slate-500">Nhập API key Gemini để sử dụng AI</p>
          </div>
        </div>

        <div className="space-y-6">
          {/* API Key Input */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              API Key <span className="text-rose-500">*</span>
            </label>
            <input
              type="password"
              value={key}
              onChange={(e) => setKey(e.target.value)}
              placeholder="AIza..."
              className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <a
              href="https://aistudio.google.com/apikey"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center space-x-1 text-sm text-blue-600 hover:underline mt-2"
            >
              <i className="fa-solid fa-external-link-alt text-xs"></i>
              <span>Lấy API key tại Google AI Studio</span>
            </a>
          </div>

          {/* Model Selection */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-3">
              Chọn Model AI
            </label>
            <div className="grid grid-cols-1 gap-3">
              {MODEL_FALLBACK_ORDER.map((m, idx) => (
                <ModelCard
                  key={m}
                  model={`${m}${idx === 0 ? ' (Mặc định)' : ''}`}
                  isSelected={model === m}
                  onSelect={() => setModel(m)}
                />
              ))}
            </div>
            <p className="text-xs text-slate-400 mt-2">
              <i className="fa-solid fa-info-circle mr-1"></i>
              Nếu model bị lỗi, hệ thống tự động chuyển sang model dự phòng.
            </p>
          </div>
        </div>

        <div className="flex space-x-3 mt-8">
          {currentKey && (
            <button
              onClick={onClose}
              className="flex-1 py-3 rounded-xl border border-slate-200 text-slate-600 font-semibold hover:bg-slate-50 transition-colors"
            >
              Hủy
            </button>
          )}
          <button
            onClick={handleSave}
            disabled={!key.trim()}
            className="flex-1 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold shadow-lg shadow-blue-200 hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Lưu cài đặt
          </button>
        </div>
      </div>
    </div>
  );
};

const App: React.FC = () => {
  const [data, setData] = useState<ClassData>(() => {
    const saved = localStorage.getItem('edumanager_data');
    return saved ? JSON.parse(saved) : DEMO_DATA;
  });
  const [view, setView] = useState<ViewType>('dashboard');
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [aiResponse, setAiResponse] = useState<string | null>(null);
  const [aiError, setAiError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  // API Key & Model State
  const [apiKey, setApiKey] = useState(() => localStorage.getItem('edumanager_api_key') || '');
  const [selectedModel, setSelectedModel] = useState(() => localStorage.getItem('edumanager_model') || MODEL_FALLBACK_ORDER[0]);
  const [showApiModal, setShowApiModal] = useState(!localStorage.getItem('edumanager_api_key'));

  // Persist data
  useEffect(() => {
    localStorage.setItem('edumanager_data', JSON.stringify(data));
  }, [data]);

  // Save API settings
  const handleSaveApiSettings = (key: string, model: string) => {
    setApiKey(key);
    setSelectedModel(model);
    localStorage.setItem('edumanager_api_key', key);
    localStorage.setItem('edumanager_model', model);
  };

  const filteredStudents = useMemo(() => {
    return data.students.filter(s =>
      s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.studentId.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [data.students, searchTerm]);

  const stats = useMemo(() => {
    let totalGrades = 0;
    let gradeCount = 0;
    let totalViolations = 0;

    data.students.forEach(s => {
      totalViolations += s.violations.length;
      s.grades.forEach(g => {
        totalGrades += g.score;
        gradeCount++;
      });
    });

    return {
      avgScore: gradeCount > 0 ? (totalGrades / gradeCount).toFixed(1) : 0,
      violationCount: totalViolations,
      studentCount: data.students.length,
      topPerformers: data.students.filter(s => {
        const avg = s.grades.length ? s.grades.reduce((a, b) => a + b.score, 0) / s.grades.length : 0;
        return avg >= 8.5;
      }).length
    };
  }, [data.students]);

  const handleAddGrade = (studentId: string) => {
    const subject = prompt('Nhập môn học:', 'Toán');
    const scoreStr = prompt('Nhập điểm số (0-10):', '0');
    const score = parseFloat(scoreStr || '0');

    if (subject && !isNaN(score) && score >= 0 && score <= 10) {
      const newGrade: Grade = {
        id: Math.random().toString(36).substr(2, 9),
        subject,
        score,
        date: new Date().toISOString().split('T')[0],
      };

      setData(prev => ({
        ...prev,
        students: prev.students.map(s =>
          s.id === studentId ? { ...s, grades: [newGrade, ...s.grades] } : s
        )
      }));

      if (score >= 9) {
        window.confetti?.({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
      }
    }
  };

  const handleAddViolation = (studentId: string) => {
    const type = prompt(`Nhập loại vi phạm (${VIOLATION_TYPES.join(', ')}):`, 'Nói chuyện') as any;
    const desc = prompt('Mô tả chi tiết:', 'Vi phạm nội quy lớp học');

    if (type && desc) {
      const newViolation: Violation = {
        id: Math.random().toString(36).substr(2, 9),
        type: type,
        date: new Date().toISOString().split('T')[0],
        description: desc,
        severity: 'Trung bình'
      };

      setData(prev => ({
        ...prev,
        students: prev.students.map(s =>
          s.id === studentId ? { ...s, violations: [newViolation, ...s.violations] } : s
        )
      }));
    }
  };

  const handleAIAnalyze = async (student: Student) => {
    if (!apiKey) {
      setShowApiModal(true);
      return;
    }

    setIsAiLoading(true);
    setAiResponse(null);
    setAiError(null);

    try {
      const analysis = await getAIAnalysis(student, { apiKey, preferredModel: selectedModel });
      setAiResponse(analysis);
    } catch (error: any) {
      setAiError(error.message);
    } finally {
      setIsAiLoading(false);
    }
  };

  const handleClassReport = async () => {
    if (!apiKey) {
      setShowApiModal(true);
      return;
    }

    setIsAiLoading(true);
    setView('ai-analysis');
    setAiError(null);

    try {
      const report = await getGeneralReport(data.students, { apiKey, preferredModel: selectedModel });
      setAiResponse(report);
    } catch (error: any) {
      setAiError(error.message);
      setAiResponse(null);
    } finally {
      setIsAiLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-slate-50">
      {/* API Key Modal */}
      <ApiKeyModal
        isOpen={showApiModal}
        onClose={() => setShowApiModal(false)}
        onSave={handleSaveApiSettings}
        currentKey={apiKey}
        currentModel={selectedModel}
      />

      {/* Sidebar */}
      <aside className="w-64 gradient-bg fixed h-full p-6 flex flex-col z-20">
        <div className="mb-10 flex items-center space-x-3 text-white">
          <div className="bg-white/20 p-2 rounded-lg">
            <i className="fa-solid fa-graduation-cap text-2xl"></i>
          </div>
          <h1 className="text-xl font-bold tracking-tight">EduManager AI</h1>
        </div>

        <nav className="flex-1 space-y-2">
          <SidebarItem
            icon="fa-chart-line"
            label="Tổng quan"
            active={view === 'dashboard'}
            onClick={() => setView('dashboard')}
          />
          <SidebarItem
            icon="fa-users"
            label="Học sinh"
            active={view === 'students'}
            onClick={() => { setView('students'); setSelectedStudent(null); }}
          />
          <SidebarItem
            icon="fa-robot"
            label="AI Phân tích"
            active={view === 'ai-analysis'}
            onClick={handleClassReport}
          />
        </nav>

        <div className="mt-auto pt-6 border-t border-white/10">
          <div className="flex items-center space-x-3 text-white/80 p-2">
            <img src="https://picsum.photos/seed/teacher/100" className="w-10 h-10 rounded-full border-2 border-white/20" alt="Avatar" />
            <div>
              <p className="text-sm font-semibold text-white">{data.teacherName}</p>
              <p className="text-xs">Giáo viên chủ nhiệm</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 ml-64 p-8">
        <header className="flex justify-between items-center mb-8">
          <div>
            <h2 className="text-2xl font-bold text-slate-800">
              {view === 'dashboard' ? 'Bảng Điều Khiển' :
                view === 'students' ? 'Danh Sách Học Sinh' :
                  'Báo Cáo Phân Tích AI'}
            </h2>
            <p className="text-slate-500">Quản lý lớp {data.className}</p>
          </div>
          <div className="flex items-center space-x-4">
            <div className="relative">
              <i className="fa-solid fa-magnifying-glass absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"></i>
              <input
                type="text"
                placeholder="Tìm kiếm học sinh..."
                className="pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 w-64 shadow-sm"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            {/* Settings Button */}
            <button
              onClick={() => setShowApiModal(true)}
              className="flex items-center space-x-2 bg-white px-4 py-2 rounded-xl border border-slate-200 shadow-sm hover:bg-slate-50 transition-colors"
            >
              <i className="fa-solid fa-gear text-slate-600"></i>
              <div className="text-left">
                <span className="text-sm font-medium text-slate-700">Settings</span>
                {!apiKey && (
                  <p className="text-xs text-rose-500 font-medium">Lấy API key để sử dụng app</p>
                )}
              </div>
            </button>

            <button className="bg-white p-2 rounded-xl border border-slate-200 shadow-sm hover:bg-slate-50 text-slate-600">
              <i className="fa-solid fa-bell"></i>
            </button>
          </div>
        </header>

        {/* Dashboard View */}
        {view === 'dashboard' && (
          <div className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <StatCard icon="fa-user-graduate" label="Sĩ số lớp" value={stats.studentCount} color="bg-blue-500" />
              <StatCard icon="fa-star" label="Điểm TB lớp" value={stats.avgScore} color="bg-amber-500" />
              <StatCard icon="fa-circle-exclamation" label="Số vi phạm" value={stats.violationCount} color="bg-rose-500" />
              <StatCard icon="fa-award" label="Học sinh giỏi" value={stats.topPerformers} color="bg-emerald-500" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-lg font-bold text-slate-800">Cần chú ý gần đây</h3>
                  <button onClick={() => setView('students')} className="text-blue-600 text-sm font-semibold hover:underline">Xem tất cả</button>
                </div>
                <div className="space-y-4">
                  {data.students.flatMap(s => s.violations.map(v => ({ ...v, student: s.name, studentId: s.id })))
                    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                    .slice(0, 5)
                    .map(v => (
                      <div key={v.id} className="flex items-center justify-between p-4 rounded-xl bg-slate-50 border border-slate-100">
                        <div className="flex items-center space-x-3">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center ${v.severity === 'Cao' ? 'bg-rose-100 text-rose-600' : 'bg-amber-100 text-amber-600'}`}>
                            <i className="fa-solid fa-triangle-exclamation"></i>
                          </div>
                          <div>
                            <p className="font-semibold text-slate-800">{v.student}</p>
                            <p className="text-xs text-slate-500">{v.type}: {v.description}</p>
                          </div>
                        </div>
                        <span className="text-xs font-medium text-slate-400">{v.date}</span>
                      </div>
                    ))}
                </div>
              </div>

              <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                <h3 className="text-lg font-bold text-slate-800 mb-6">Xếp hạng môn học</h3>
                <div className="space-y-4">
                  {SUBJECTS.slice(0, 5).map(sub => {
                    const avg = data.students.reduce((acc, s) => {
                      const grade = s.grades.find(g => g.subject === sub);
                      return acc + (grade?.score || 0);
                    }, 0) / data.students.length;
                    return (
                      <div key={sub}>
                        <div className="flex justify-between text-sm mb-1">
                          <span className="font-medium text-slate-600">{sub}</span>
                          <span className="text-slate-500">{avg.toFixed(1)}</span>
                        </div>
                        <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-blue-500 rounded-full"
                            style={{ width: `${(avg / 10) * 100}%` }}
                          ></div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Students View */}
        {view === 'students' && !selectedStudent && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredStudents.map(student => {
              const avg = student.grades.length ? (student.grades.reduce((a, b) => a + b.score, 0) / student.grades.length).toFixed(1) : 'N/A';
              return (
                <div key={student.id} className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden hover:shadow-md transition-shadow group">
                  <div className="h-24 gradient-bg relative">
                    <img
                      src={student.avatar}
                      className="w-16 h-16 rounded-2xl border-4 border-white absolute -bottom-8 left-6 shadow-md"
                      alt={student.name}
                    />
                  </div>
                  <div className="p-6 pt-10">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="text-lg font-bold text-slate-800">{student.name}</h4>
                        <p className="text-xs text-slate-500">ID: {student.studentId}</p>
                      </div>
                      <div className="text-right">
                        <span className="inline-block px-2 py-1 rounded-lg bg-blue-50 text-blue-600 text-xs font-bold">
                          TB: {avg}
                        </span>
                      </div>
                    </div>

                    <div className="mt-6 flex gap-2">
                      <button
                        onClick={() => setSelectedStudent(student)}
                        className="flex-1 py-2 rounded-xl bg-slate-100 text-slate-600 text-xs font-bold hover:bg-slate-200 transition-colors"
                      >
                        Chi tiết
                      </button>
                      <button
                        onClick={() => handleAddGrade(student.id)}
                        className="flex-1 py-2 rounded-xl bg-blue-600 text-white text-xs font-bold hover:bg-blue-700 transition-colors"
                      >
                        + Điểm
                      </button>
                      <button
                        onClick={() => handleAddViolation(student.id)}
                        className="flex-1 py-2 rounded-xl bg-rose-600 text-white text-xs font-bold hover:bg-rose-700 transition-colors"
                      >
                        + Vi phạm
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Student Detail View */}
        {view === 'students' && selectedStudent && (
          <div className="space-y-6">
            <button
              onClick={() => setSelectedStudent(null)}
              className="text-slate-500 flex items-center space-x-2 hover:text-slate-800 transition-colors"
            >
              <i className="fa-solid fa-arrow-left"></i>
              <span>Quay lại danh sách</span>
            </button>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-6">
                {/* Grades Table */}
                <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="text-lg font-bold text-slate-800">Kết quả học tập</h3>
                    <button onClick={() => handleAddGrade(selectedStudent.id)} className="bg-blue-50 text-blue-600 px-4 py-2 rounded-xl text-sm font-bold hover:bg-blue-100 transition-colors">
                      Thêm điểm mới
                    </button>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left">
                      <thead>
                        <tr className="text-slate-400 text-sm border-b border-slate-50">
                          <th className="pb-4 font-medium">Môn học</th>
                          <th className="pb-4 font-medium">Điểm số</th>
                          <th className="pb-4 font-medium">Ngày ghi</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-50">
                        {selectedStudent.grades.map(g => (
                          <tr key={g.id} className="text-slate-700 text-sm">
                            <td className="py-4 font-semibold">{g.subject}</td>
                            <td className="py-4">
                              <span className={`px-2 py-1 rounded-md ${g.score >= 8 ? 'bg-emerald-50 text-emerald-600' : g.score >= 5 ? 'bg-amber-50 text-amber-600' : 'bg-rose-50 text-rose-600'}`}>
                                {g.score}
                              </span>
                            </td>
                            <td className="py-4 text-slate-400">{g.date}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Violations Table */}
                <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="text-lg font-bold text-slate-800">Lịch sử vi phạm</h3>
                    <button onClick={() => handleAddViolation(selectedStudent.id)} className="bg-rose-50 text-rose-600 px-4 py-2 rounded-xl text-sm font-bold hover:bg-rose-100 transition-colors">
                      Ghi nhận vi phạm
                    </button>
                  </div>
                  {selectedStudent.violations.length > 0 ? (
                    <div className="space-y-4">
                      {selectedStudent.violations.map(v => (
                        <div key={v.id} className="flex justify-between p-4 bg-slate-50 rounded-xl border border-slate-100">
                          <div>
                            <p className="font-semibold text-slate-800">{v.type}</p>
                            <p className="text-sm text-slate-500">{v.description}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-xs text-slate-400">{v.date}</p>
                            <span className={`text-[10px] uppercase tracking-wider font-bold ${v.severity === 'Cao' ? 'text-rose-600' : 'text-amber-600'}`}>
                              Mức độ: {v.severity}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-center py-8 text-slate-400 text-sm italic">Học sinh không có vi phạm nào.</p>
                  )}
                </div>
              </div>

              {/* AI Interaction Area */}
              <div className="space-y-6">
                <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
                  <div className="flex items-center space-x-2 mb-6">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-blue-500 to-indigo-600 flex items-center justify-center text-white">
                      <i className="fa-solid fa-wand-magic-sparkles"></i>
                    </div>
                    <h3 className="text-lg font-bold text-slate-800">AI Trợ lý</h3>
                  </div>

                  <button
                    onClick={() => handleAIAnalyze(selectedStudent)}
                    disabled={isAiLoading}
                    className="w-full py-4 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold text-sm shadow-lg shadow-blue-200 hover:shadow-xl transition-all active:scale-95 disabled:opacity-50"
                  >
                    {isAiLoading ? (
                      <span className="flex items-center justify-center space-x-2">
                        <i className="fa-solid fa-spinner fa-spin"></i>
                        <span>Đang phân tích...</span>
                      </span>
                    ) : (
                      'Phân tích học sinh bằng AI'
                    )}
                  </button>

                  <div className="mt-6 p-4 rounded-xl bg-slate-50 border border-slate-200 min-h-[200px] relative">
                    {!isAiLoading && !aiResponse && !aiError && (
                      <p className="text-slate-400 text-sm text-center mt-10 italic">
                        Click vào nút trên để AI phân tích kết quả và hành vi của học sinh.
                      </p>
                    )}
                    {isAiLoading && (
                      <div className="space-y-3 animate-pulse">
                        <div className="h-4 bg-slate-200 rounded w-3/4"></div>
                        <div className="h-4 bg-slate-200 rounded"></div>
                        <div className="h-4 bg-slate-200 rounded w-5/6"></div>
                        <div className="h-4 bg-slate-200 rounded w-1/2"></div>
                      </div>
                    )}
                    {aiError && (
                      <div className="bg-rose-50 border border-rose-200 rounded-xl p-4 text-rose-700">
                        <div className="flex items-center space-x-2 mb-2">
                          <i className="fa-solid fa-circle-exclamation"></i>
                          <span className="font-semibold">Đã dừng do lỗi</span>
                        </div>
                        <p className="text-sm">{aiError}</p>
                      </div>
                    )}
                    {aiResponse && (
                      <div className="prose prose-sm text-slate-700 overflow-y-auto max-h-[400px] custom-scrollbar"
                        dangerouslySetInnerHTML={{ __html: window.marked?.parse ? window.marked.parse(aiResponse) : aiResponse }}>
                      </div>
                    )}
                  </div>
                </div>

                <div className="bg-indigo-900 rounded-2xl shadow-sm p-6 text-white overflow-hidden relative">
                  <i className="fa-solid fa-quote-right absolute -right-4 -bottom-4 text-8xl text-white/10"></i>
                  <h4 className="text-sm font-bold text-indigo-300 uppercase tracking-widest mb-2">Lời khuyên sư phạm</h4>
                  <p className="text-sm leading-relaxed relative z-10 italic">
                    "Giáo dục không phải là việc đổ đầy một cái bình, mà là thắp sáng một ngọn lửa."
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* AI Analysis View (Global) */}
        {view === 'ai-analysis' && (
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-8 min-h-[600px]">
            <div className="flex items-center space-x-4 mb-8">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-r from-orange-400 to-amber-500 flex items-center justify-center text-white shadow-lg">
                <i className="fa-solid fa-robot text-xl"></i>
              </div>
              <div>
                <h3 className="text-xl font-bold text-slate-800">Báo Cáo Tổng Hợp Lớp Học</h3>
                <p className="text-slate-500">Dựa trên dữ liệu toàn bộ {data.students.length} học sinh</p>
              </div>
            </div>

            {isAiLoading ? (
              <div className="flex flex-col items-center justify-center h-64 space-y-4">
                <div className="w-12 h-12 border-4 border-blue-100 border-t-blue-600 rounded-full animate-spin"></div>
                <p className="text-slate-500 font-medium animate-pulse">Gemini AI đang tổng hợp dữ liệu...</p>
              </div>
            ) : aiError ? (
              <div className="bg-rose-50 border border-rose-200 rounded-xl p-6 text-rose-700">
                <div className="flex items-center space-x-2 mb-2">
                  <i className="fa-solid fa-circle-exclamation text-xl"></i>
                  <span className="font-bold text-lg">Đã dừng do lỗi</span>
                </div>
                <p>{aiError}</p>
              </div>
            ) : (
              <div className="prose prose-slate max-w-none prose-h3:text-blue-600 prose-strong:text-amber-600"
                dangerouslySetInnerHTML={{ __html: window.marked?.parse ? window.marked.parse(aiResponse || '# Không có dữ liệu\nVui lòng thử lại sau.') : (aiResponse || '') }}>
              </div>
            )}

            <div className="mt-12 flex justify-center">
              <button
                onClick={handleClassReport}
                className="px-8 py-3 bg-slate-800 text-white rounded-xl font-bold hover:bg-slate-700 transition-all flex items-center space-x-2"
              >
                <i className="fa-solid fa-rotate-right"></i>
                <span>Cập nhật báo cáo</span>
              </button>
            </div>
          </div>
        )}
      </main>

      {/* Floating Feedback Toast (Simplified for brevity) */}
      <div className="fixed bottom-6 right-6 z-50">
        {/* Placeholder for toast notifications */}
      </div>
    </div>
  );
};

export default App;

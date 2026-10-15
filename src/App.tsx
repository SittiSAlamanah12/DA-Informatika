/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { StudentRegisterModal } from './components/StudentRegisterModal';
import { ExamScreen } from './components/ExamScreen';
import { ExamResultView } from './components/ExamResultView';
import { AdminDashboard } from './components/AdminDashboard';
import { AdminLoginModal } from './components/AdminLoginModal';
import { ExamSubmission } from './types/exam';

export type AppView = 'REGISTER' | 'EXAM' | 'RESULT' | 'ADMIN';

export default function App() {
  const [currentView, setCurrentView] = useState<AppView>('REGISTER');
  const [isAdminLoginOpen, setIsAdminLoginOpen] = useState<boolean>(false);
  const [activeStudent, setActiveStudent] = useState<{
    name: string;
    studentClass: string;
    studentNumber: string;
  } | null>(null);
  const [latestSubmission, setLatestSubmission] = useState<ExamSubmission | null>(null);

  // Student starts exam
  const handleStartExam = (studentData: {
    name: string;
    studentClass: string;
    studentNumber: string;
  }) => {
    setActiveStudent(studentData);
    setCurrentView('EXAM');
  };

  // Student completes exam
  const handleFinishExam = (submission: ExamSubmission) => {
    setLatestSubmission(submission);
    setCurrentView('RESULT');
  };

  // Return to student register home
  const handleReturnHome = () => {
    setActiveStudent(null);
    setCurrentView('REGISTER');
  };

  // Teacher login success
  const handleAdminLoginSuccess = () => {
    setCurrentView('ADMIN');
  };

  // Teacher logout
  const handleAdminLogout = () => {
    setCurrentView('REGISTER');
  };

  return (
    <div className="min-h-screen bg-slate-950 font-sans text-slate-100 antialiased selection:bg-blue-600 selection:text-white">
      {/* View Router */}
      {currentView === 'REGISTER' && (
        <StudentRegisterModal
          onStartExam={handleStartExam}
          onOpenAdminLogin={() => setIsAdminLoginOpen(true)}
        />
      )}

      {currentView === 'EXAM' && activeStudent && (
        <ExamScreen
          student={activeStudent}
          onFinishExam={handleFinishExam}
        />
      )}

      {currentView === 'RESULT' && latestSubmission && (
        <ExamResultView
          submission={latestSubmission}
          onReturnHome={handleReturnHome}
        />
      )}

      {currentView === 'ADMIN' && (
        <AdminDashboard onLogout={handleAdminLogout} />
      )}

      {/* Teacher/Admin Protected Login Modal */}
      <AdminLoginModal
        isOpen={isAdminLoginOpen}
        onClose={() => setIsAdminLoginOpen(false)}
        onSuccess={handleAdminLoginSuccess}
      />
    </div>
  );
}

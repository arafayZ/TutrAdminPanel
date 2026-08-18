import React, { useState, useRef, useEffect } from 'react';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';
import NotificationsPage from './NotificationsPage';

const CustomDropdown = ({ label, value, onChange, options }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <div className="relative inline-block text-left" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="bg-gray-100 hover:bg-gray-200 text-gray-800 font-medium rounded-lg px-3 py-1.5 text-xs outline-none cursor-pointer flex items-center justify-between gap-2 transition-colors"
      >
        <span>{value || label}</span>
        <svg className="w-3 h-3 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute left-0 mt-1 w-48 bg-white rounded-xl shadow-lg border border-gray-100 py-1 z-50 max-h-60 overflow-y-auto">
          {options.map((option, index) => (
            <button
              key={index}
              onClick={() => {
                onChange(option);
                setIsOpen(false);
              }}
              className={`w-full text-left px-3 py-1.5 text-xs font-medium cursor-pointer transition-colors ${
                value === option
                  ? 'bg-black text-white'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              {option}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

const ReviewsPage = () => {
  // Navigation & View States
  const [activePage, setActivePage] = useState('reviews');
  const [viewState, setViewState] = useState('reviews');
  const [searchQuery, setSearchQuery] = useState('');

  // Filter States
  const [tutorFilter, setTutorFilter] = useState('All Tutors');
  const [ratingFilter, setRatingFilter] = useState('All Ratings');

  // Modal States (White Popups)
  const [selectedReview, setSelectedReview] = useState(null);
  const [actionReview, setActionReview] = useState(null);

  // Reviews Data
  const [reviews, setReviews] = useState([
    {
      id: 1,
      studentName: 'Ayesha Khan',
      avatar:
        'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&auto=format&fit=crop&q=80',
      course: 'Mathematics',
      tutor: 'Dr. Hamza Ahmed',
      date: 'Aug 05, 2026',
      rating: 5,
      isReported: false,
      comment:
        '"Dr. Hamza explained calculus concepts very clearly. I was struggling with integration, but after a few sessions I became much more confident. Highly recommended!"',
      tags: ['VERIFIED', 'HELPFUL (18)'],
      tagTypes: ['neutral', 'neutral'],
    },
    {
      id: 2,
      studentName: 'Muhammad Huzaifa',
      avatar:
        'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80',
      course: 'Physics',
      tutor: 'Usman Raza',
      date: 'Aug 03, 2026',
      rating: 4,
      isReported: false,
      comment:
        '"Usman is very good at explaining difficult physics topics. His examples made mechanics much easier to understand. I would definitely book another session."',
      tags: ['VERIFIED', 'HELPFUL (11)'],
      tagTypes: ['neutral', 'neutral'],
    },
    {
      id: 3,
      studentName: 'Fatima Zahra',
      avatar:
        'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80',
      course: 'Computer Science',
      tutor: 'Abdul Rehman',
      date: 'Jul 30, 2026',
      rating: 5,
      isReported: false,
      comment:
        '"Abdul Rehman helped me understand data structures and algorithms from the basics. He explains every step patiently and also gives useful practice questions."',
      tags: ['VERIFIED', 'HELPFUL (15)'],
      tagTypes: ['neutral', 'neutral'],
    },
    {
      id: 4,
      studentName: 'Ali Hassan',
      avatar:
        'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&auto=format&fit=crop&q=80',
      course: 'English',
      tutor: 'Sana Malik',
      date: 'Jul 27, 2026',
      rating: 5,
      isReported: false,
      comment:
        '"Sana helped me improve both my grammar and speaking skills. The sessions are interactive and she always corrects my mistakes in a very professional way."',
      tags: ['VERIFIED', 'HELPFUL (9)'],
      tagTypes: ['neutral', 'neutral'],
    },
    {
      id: 5,
      studentName: 'Hira Noor',
      avatar:
        'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&auto=format&fit=crop&q=80',
      course: 'Chemistry',
      tutor: 'Dr. Ahmed Farooq',
      date: 'Jul 24, 2026',
      rating: 3,
      isReported: false,
      comment:
        '"The tutor has good knowledge of chemistry and explained organic chemistry well. However, the session felt a little rushed and I would have preferred more time for practice questions."',
      tags: ['VERIFIED', 'HELPFUL (5)'],
      tagTypes: ['neutral', 'neutral'],
    },
    {
      id: 6,
      studentName: 'Hamza Siddiqui',
      avatar:
        'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=100&auto=format&fit=crop&q=80',
      course: 'Web Development',
      tutor: 'Bilal Hassan',
      date: 'Jul 21, 2026',
      rating: 5,
      isReported: false,
      comment:
        '"Bilal is an excellent web development tutor. He helped me understand React components and state management with practical examples. Very helpful and knowledgeable."',
      tags: ['VERIFIED', 'HELPFUL (21)'],
      tagTypes: ['neutral', 'neutral'],
    },
    {
      id: 7,
      studentName: 'Maham Asif',
      avatar:
        'https://images.unsplash.com/photo-1488426862026-3ee34a7d66df?w=100&auto=format&fit=crop&q=80',
      course: 'Biology',
      tutor: 'Dr. Ayesha Siddiqui',
      date: 'Jul 18, 2026',
      rating: 4,
      isReported: false,
      comment:
        '"Dr. Ayesha explains biology concepts with diagrams and real-life examples. The lessons were very useful for my exam preparation. I would recommend her to other students."',
      tags: ['VERIFIED', 'HELPFUL (8)'],
      tagTypes: ['neutral', 'neutral'],
    },
    {
      id: 8,
      studentName: 'Saad Ahmed',
      avatar:
        'https://images.unsplash.com/photo-1501196354995-cbb51c65aaea?w=100&auto=format&fit=crop&q=80',
      course: 'Accounting',
      tutor: 'Usama Khalid',
      date: 'Jul 15, 2026',
      rating: 2,
      isReported: true,
      comment:
        '"The tutor joined the session late and we were unable to cover all the topics I had requested. I also had difficulty getting a response after the session regarding the remaining questions."',
      tags: ['REPORTED', 'CRITICAL'],
      tagTypes: ['red', 'neutral'],
    },
    {
      id: 9,
      studentName: 'Eman Fatima',
      avatar:
        'https://images.unsplash.com/photo-1551836022-d5d88e9218df?w=100&auto=format&fit=crop&q=80',
      course: 'Statistics',
      tutor: 'Dr. Zainab Ali',
      date: 'Jul 12, 2026',
      rating: 5,
      isReported: false,
      comment:
        '"Dr. Zainab made statistics much easier for me. She explained probability distributions step by step and provided excellent examples for practice."',
      tags: ['VERIFIED', 'HELPFUL (14)'],
      tagTypes: ['neutral', 'neutral'],
    },
    {
      id: 10,
      studentName: 'Ahmed Raza',
      avatar:
        'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop&q=80',
      course: 'Programming Fundamentals',
      tutor: 'Owais Ahmed',
      date: 'Jul 09, 2026',
      rating: 4,
      isReported: false,
      comment:
        '"Owais helped me understand programming fundamentals and debugging. He was patient throughout the session and gave me several exercises to practice afterwards."',
      tags: ['VERIFIED', 'HELPFUL (10)'],
      tagTypes: ['neutral', 'neutral'],
    },
    {
      id: 11,
      studentName: 'Adil Ahmed',
      avatar:
        'https://images.unsplash.com/photo-1501196354995-cbb51c65aaea?w=100&auto=format&fit=crop&q=80',
      course: 'Urdu',
      tutor: 'Usama Qureshi',
      date: 'Jul 13, 2026',
      rating: 2,
      isReported: true,
      comment:
        '"The tutor joined the session late and we were unable to cover all the topics I had requested. I also had difficulty getting a response after the session regarding the remaining questions."',
      tags: ['REPORTED', 'CRITICAL'],
      tagTypes: ['red', 'neutral'],
    },
  ]);

  const StarRating = ({ count }) => (
    <div className="flex items-center gap-0.5 text-black">
      {[1, 2, 3, 4, 5].map((star) => (
        <span key={star} className="text-xs">
          {star <= count ? '★' : '☆'}
        </span>
      ))}
    </div>
  );

  const filteredReviews = reviews.filter((rev) => {
    const matchesSearch =
      rev.studentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      rev.course.toLowerCase().includes(searchQuery.toLowerCase()) ||
      rev.tutor.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesTutor =
      tutorFilter === 'All Tutors' || rev.tutor === tutorFilter;

    const matchesRating =
      ratingFilter === 'All Ratings' ||
      (ratingFilter === '5 Stars' && rev.rating === 5) ||
      (ratingFilter === '4 Stars' && rev.rating === 4) ||
      (ratingFilter === '1 Star' && rev.rating === 1);

    return matchesSearch && matchesTutor && matchesRating;
  });

  const tutorOptions = [
    'All Tutors',
    'Dr. Hamza Ahmed',
    'Usman Raza',
    'Abdul Rehman',
    'Sana Malik',
    'Dr. Ahmed Farooq',
    'Bilal Hassan',
    'Dr. Ayesha Siddiqui',
    'Usama Khalid',
    'Dr. Zainab Ali',
    'Owais Ahmed',
    'Usama Qureshi',
  ];

  const ratingOptions = ['All Ratings', '5 Stars', '4 Stars', '1 Star'];

  const loadPDFScripts = () => {
    return new Promise((resolve, reject) => {
      if (window.jspdf && window.jspdf.jsPDF) {
        resolve(window.jspdf);
        return;
      }

      const script1 = document.createElement('script');
      script1.src = 'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js';
      script1.onload = () => {
        const script2 = document.createElement('script');
        script2.src = 'https://cdnjs.cloudflare.com/ajax/libs/jspdf-autotable/3.5.28/jspdf.plugin.autotable.min.js';
        script2.onload = () => resolve(window.jspdf);
        script2.onerror = reject;
        document.body.appendChild(script2);
      };
      script1.onerror = reject;
      document.body.appendChild(script1);
    });
  };

  const handleExportData = async () => {
    if (filteredReviews.length === 0) {
      alert('No data available to export.');
      return;
    }

    try {
      await loadPDFScripts();
      const { jsPDF } = window.jspdf;
      const doc = new jsPDF();

      doc.setFontSize(18);
      doc.setFont('helvetica', 'bold');
      doc.text('Student Reviews Report', 14, 20);

      doc.setFontSize(9);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(100);
      doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 14, 26);
      doc.text(`Total Entries: ${filteredReviews.length}`, 14, 31);

      const headers = [['ID', 'Student Name', 'Course', 'Tutor', 'Rating', 'Date', 'Reported', 'Comment']];

      const rows = filteredReviews.map((rev) => [
        rev.id,
        rev.studentName,
        rev.course,
        rev.tutor,
        `${rev.rating} Stars`,
        rev.date,
        rev.isReported ? 'Yes' : 'No',
        rev.comment.replace(/^"|"$/g, ''),
      ]);

      doc.autoTable({
        head: headers,
        body: rows,
        startY: 38,
        theme: 'striped',
        headStyles: { fillColor: [24, 24, 27], textColor: [255, 255, 255], fontStyle: 'bold' },
        styles: { fontSize: 8, cellPadding: 3 },
        columnStyles: {
          0: { cellWidth: 10 },
          1: { cellWidth: 25 },
          2: { cellWidth: 25 },
          3: { cellWidth: 25 },
          4: { cellWidth: 18 },
          5: { cellWidth: 20 },
          6: { cellWidth: 18 },
          7: { cellWidth: 'auto' },
        },
      });

      doc.save(`reviews_export_${new Date().toISOString().slice(0, 10)}.pdf`);
    } catch (err) {
      console.error('Error exporting PDF:', err);
      alert('Failed to generate PDF export. Please try again.');
    }
  };

  return (
    <div className="flex h-screen bg-[#F8F9FB] font-sans text-gray-900 overflow-hidden">
      <Sidebar
        activePage={activePage}
        onGenerateReport={() => alert('Generating Reviews Summary Report...')}
      />

      <main className="flex-1 flex flex-col overflow-y-auto">
        <Navbar
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          viewState={viewState}
          setViewState={setViewState}
          placeholder="Search tutors or applications..."
        />

        {viewState === 'notifications' ? (
          <NotificationsPage onBack={() => setViewState('reviews')} />
        ) : (
          <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 tracking-tight">
                  Student Reviews
                </h2>
                <p className="text-xs text-gray-500 mt-1">
                  Manage community integrity and monitor instructional quality across all active courses.
                </p>
              </div>

              <button
                onClick={handleExportData}
                className="flex items-center gap-2 bg-black hover:bg-zinc-800 text-white font-semibold text-xs px-4 py-2.5 rounded-xl transition-all cursor-pointer shadow-xs active:scale-95"
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                  />
                </svg>
                Export Data
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-4">
                {/* Custom Filter Bar */}
                <div className="bg-white p-3 rounded-2xl border border-gray-100 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-3">
                    <CustomDropdown
                      label="Select Tutor"
                      value={tutorFilter}
                      onChange={setTutorFilter}
                      options={tutorOptions}
                    />

                    <CustomDropdown
                      label="Select Rating"
                      value={ratingFilter}
                      onChange={setRatingFilter}
                      options={ratingOptions}
                    />
                  </div>
                  <span className="text-gray-400 text-[11px] font-medium">
                    Showing {filteredReviews.length} entries
                  </span>
                </div>

                {/* Reviews List */}
                <div className="space-y-4">
                  {filteredReviews.map((rev) => (
                    <div
                      key={rev.id}
                      className={`bg-white rounded-2xl p-5 border ${
                        rev.isReported ? 'border-red-200 shadow-xs' : 'border-gray-100'
                      } space-y-4 hover:border-gray-300 transition-all`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <img
                            src={rev.avatar}
                            alt={rev.studentName}
                            className="w-10 h-10 rounded-full object-cover"
                          />
                          <div>
                            <div className="flex items-center gap-2">
                              <h4 className="font-bold text-gray-900 text-sm">
                                {rev.studentName}
                              </h4>
                              {rev.isReported && (
                                <span className="bg-red-100 text-red-600 text-[9px] font-extrabold px-1.5 py-0.5 rounded tracking-wide uppercase">
                                  REPORTED
                                </span>
                              )}
                            </div>
                            <p className="text-[11px] text-gray-500">
                              Course: <span className="font-medium text-gray-800">{rev.course}</span> • Tutor: <span className="font-medium text-gray-800">{rev.tutor}</span>
                            </p>
                          </div>
                        </div>

                        <div className="text-right">
                          <StarRating count={rev.rating} />
                          <span className="text-[10px] text-gray-400 font-medium block mt-1">
                            {rev.date}
                          </span>
                        </div>
                      </div>

                      <p className="text-xs text-gray-700 leading-relaxed italic">
                        {rev.comment}
                      </p>

                      <div className="flex items-center justify-between pt-1">
                        <div className="flex items-center gap-2">
                          {rev.tags.map((tag, idx) => (
                            <span
                              key={idx}
                              className={`text-[9px] font-bold px-2 py-0.5 rounded tracking-wider uppercase ${
                                rev.tagTypes[idx] === 'red'
                                  ? 'bg-red-100 text-red-600'
                                  : 'bg-gray-100 text-gray-500'
                              }`}
                            >
                              {tag}
                            </span>
                          ))}
                        </div>

                        <div className="flex items-center gap-2">
                          {rev.isReported && (
                            <button
                              onClick={() => setActionReview(rev)}
                              className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white font-bold text-[11px] rounded-lg transition-colors cursor-pointer"
                            >
                              Take Action
                            </button>
                          )}
                          <button
                            onClick={() => setSelectedReview(rev)}
                            className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-800 font-semibold text-[11px] rounded-lg transition-colors cursor-pointer"
                          >
                            View Details
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Analytics Sidebar */}
              <div className="space-y-5">
                <div className="bg-white p-6 rounded-2xl border border-gray-100 text-center space-y-3">
                  <span className="text-[10px] font-extrabold uppercase text-gray-400 tracking-wider">
                    AVERAGE PLATFORM RATING
                  </span>
                  <div className="text-4xl font-extrabold text-gray-900">4.8</div>
                  <div className="flex justify-center">
                    <StarRating count={5} />
                  </div>
                  <div className="grid grid-cols-2 gap-2 pt-3 border-t border-gray-100 text-center">
                    <div>
                      <p className="text-[9px] font-bold text-gray-400 uppercase tracking-wider">
                        TOTAL REVIEWS
                      </p>
                      <p className="text-base font-bold text-gray-900 mt-0.5">12,482</p>
                    </div>
                    <div>
                      <p className="text-[9px] font-bold text-gray-400 uppercase tracking-wider">
                        POS/NEG RATIO
                      </p>
                      <p className="text-base font-bold text-gray-900 mt-0.5">94% / 6%</p>
                    </div>
                  </div>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-gray-100 space-y-3">
                  <h4 className="text-xs font-bold text-gray-900">Rating Distribution</h4>
                  <div className="space-y-2">
                    {[
                      { stars: 5, pct: '82%', width: '82%' },
                      { stars: 4, pct: '12%', width: '12%' },
                      { stars: 3, pct: '4%', width: '4%' },
                      { stars: 2, pct: '1.5%', width: '1.5%' },
                      { stars: 1, pct: '0.5%', width: '0.5%' },
                    ].map((row) => (
                      <div key={row.stars} className="flex items-center gap-3 text-[11px]">
                        <span className="w-2 font-bold text-gray-600">{row.stars}</span>
                        <div className="flex-1 bg-gray-100 h-2 rounded-full overflow-hidden">
                          <div
                            className="bg-black h-full rounded-full"
                            style={{ width: row.width }}
                          ></div>
                        </div>
                        <span className="w-8 text-right text-gray-400 font-medium text-[10px]">
                          {row.pct}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-black text-white p-5 rounded-2xl space-y-4">
                  <h4 className="text-xs font-bold tracking-tight">Review Growth</h4>
                  <div className="flex items-end justify-between h-16 pt-2 px-2 gap-2">
                    <div className="w-1/5 bg-zinc-800 h-1/2 rounded-t"></div>
                    <div className="w-1/5 bg-zinc-700 h-3/4 rounded-t"></div>
                    <div className="w-1/5 bg-zinc-600 h-2/3 rounded-t"></div>
                    <div className="w-1/5 bg-zinc-500 h-4/5 rounded-t"></div>
                    <div className="w-1/5 bg-white h-full rounded-t"></div>
                  </div>
                  <div className="flex justify-between text-[9px] text-gray-400 font-bold uppercase tracking-wider px-1">
                    <span>JUN</span>
                    <span>NOV</span>
                  </div>
                </div>

                <div className="bg-red-50/60 border border-red-100 rounded-2xl p-4 space-y-2 cursor-pointer hover:bg-red-100/50 transition-colors">
                  <div className="flex items-center justify-between text-red-600 font-bold text-xs">
                    <span className="flex items-center gap-2">⚠️ Action Required</span>
                  </div>
                  <div className="bg-white p-3 rounded-xl border border-red-100 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="bg-red-100 text-red-600 text-[8px] font-extrabold px-1.5 py-0.5 rounded uppercase">
                        PAYMENT ISSUES
                      </span>
                      <span className="text-[9px] text-gray-400">2m ago</span>
                    </div>
                    <p className="text-[11px] text-gray-700 font-medium truncate">
                      Inappropriate language used by user #4928...
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Details Modal */}
      {selectedReview && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full border border-gray-100 shadow-2xl space-y-4">
            <div className="flex items-start justify-between border-b border-gray-100 pb-3">
              <div className="flex items-center gap-3">
                <img
                  src={selectedReview.avatar}
                  alt={selectedReview.studentName}
                  className="w-10 h-10 rounded-full object-cover"
                />
                <div>
                  <h4 className="font-bold text-gray-900 text-sm">
                    {selectedReview.studentName}
                  </h4>
                  <p className="text-xs text-gray-500">{selectedReview.date}</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedReview(null)}
                className="text-gray-400 hover:text-black cursor-pointer text-sm"
              >
                ✕
              </button>
            </div>

            <div className="space-y-2 text-xs text-gray-700">
              <p>
                <strong className="text-gray-900">Course:</strong> {selectedReview.course}
              </p>
              <p>
                <strong className="text-gray-900">Tutor:</strong> {selectedReview.tutor}
              </p>
              <div className="pt-2">
                <strong className="text-gray-900 block mb-1">Feedback:</strong>
                <p className="bg-gray-50 p-3 rounded-xl border border-gray-100 italic text-gray-800">
                  {selectedReview.comment}
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end pt-2">
              <button
                onClick={() => setSelectedReview(null)}
                className="px-4 py-2 bg-black hover:bg-zinc-800 text-white text-xs font-semibold rounded-lg transition-colors cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Action Resolution Modal */}
      {actionReview && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full border border-gray-100 shadow-2xl space-y-4">
            <div>
              <h4 className="text-base font-bold text-gray-900">Review Resolution</h4>
              <p className="text-xs text-gray-500 mt-1 leading-relaxed">
                Take moderation action for reported review from <span className="font-semibold text-gray-900">{actionReview.studentName}</span> regarding tutor <span className="font-semibold text-gray-900">{actionReview.tutor}</span>.
              </p>
            </div>

            <div className="space-y-2">
              <button
                onClick={() => {
                  setReviews((prev) => prev.filter((r) => r.id !== actionReview.id));
                  setActionReview(null);
                }}
                className="w-full py-2 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-xl transition-colors cursor-pointer"
              >
                Remove Review
              </button>
              <button
                onClick={() => {
                  setReviews((prev) =>
                    prev.map((r) =>
                      r.id === actionReview.id ? { ...r, isReported: false } : r
                    )
                  );
                  setActionReview(null);
                }}
                className="w-full py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 text-xs font-bold rounded-xl transition-colors cursor-pointer"
              >
                Dismiss Report
              </button>
            </div>

            <div className="pt-2 text-center">
              <button
                onClick={() => setActionReview(null)}
                className="text-xs font-semibold text-gray-400 hover:text-black cursor-pointer"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReviewsPage;
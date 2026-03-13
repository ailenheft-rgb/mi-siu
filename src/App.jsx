import React, { useState, useEffect, useMemo } from 'react';
import { Check, Lock, Unlock, RotateCcw, GraduationCap, AlertCircle, Calendar, Folder, BookOpen, Plus, ExternalLink, Trash2, CalendarDays, Clock, Users, Headphones, PlayCircle, Radio, X, Save, FileText } from 'lucide-react';

// --- FIREBASE IMPORTS ---
import { initializeApp } from 'firebase/app';
import { getAuth, signInAnonymously, signInWithCustomToken, onAuthStateChanged } from 'firebase/auth';
import { getFirestore, collection, doc, onSnapshot, setDoc, addDoc, deleteDoc } from 'firebase/firestore';

// --- FIREBASE SETUP ---
const appId = 'organizacion-uap-app'; // Identificador para tu base de datos
const firebaseConfig = {
  apiKey: "AIzaSyDkzPOhnbId1WfyCmeTtmNQ28ocumv4LSw",
  authDomain: "organizacion-uap-com.firebaseapp.com",
  projectId: "organizacion-uap-com",
  storageBucket: "organizacion-uap-com.firebasestorage.app",
  messagingSenderId: "825077161933",
  appId: "1:825077161933:web:bc2349bf395a7d15722e84",
  measurementId: "G-CMKNGNX44W"
};
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// --- DATOS DE LA CARRERA ---
const INITIAL_SUBJECTS = [
  // AÑO 1 - Cuatrimestre 1
  { id: 'lab_dig', name: 'Introducción al laboratorio digital', year: 1, semester: 1, prereqs: [] },
  { id: 'loc1', name: 'Locución I', year: 1, semester: 1, prereqs: [] },
  { id: 'lab_creat', name: 'Laboratorio de creatividad e innovación', year: 1, semester: 1, prereqs: [] },
  { id: 'prin_org', name: 'Principios de organización y administración', year: 1, semester: 1, prereqs: [] },
  { id: 'hist_ideas1', name: 'Historia universal de las ideas I', year: 1, semester: 1, prereqs: [] },
  { id: 'taller_red', name: 'Taller de redacción', year: 1, semester: 1, prereqs: [] },
  { id: 'soc_com', name: 'Sociología de la comunicación', year: 1, semester: 1, prereqs: [] },
  { id: 'cosmo', name: 'Cosmovisión bíblico cristiana', year: 1, semester: 1, prereqs: [] },
  { id: 'univ', name: 'Introducción a la vida universitaria (opcional)', year: 1, semester: 1, prereqs: [] },

  // AÑO 1 - Cuatrimestre 2
  { id: 'foto', name: 'Taller de fotografía', year: 1, semester: 2, prereqs: [] },
  { id: 'loc2', name: 'Locución II', year: 1, semester: 2, prereqs: ['loc1'] },
  { id: 'medios_op', name: 'Medios de comunicación y opinión pública', year: 1, semester: 2, prereqs: [] },
  { id: 'teoria_com', name: 'Teoría de la comunicación', year: 1, semester: 2, prereqs: [] },
  { id: 'hist_ideas2', name: 'Historia universal de las ideas II', year: 1, semester: 2, prereqs: ['hist_ideas1'] },
  { id: 'hist_medios', name: 'Historia de los medios de comunicación', year: 1, semester: 2, prereqs: [] },
  { id: 'antro', name: 'Antropología', year: 1, semester: 2, prereqs: [] },

  // AÑO 2 - Cuatrimestre 1
  { id: 'lab_post', name: 'Laboratorio de postproducción', year: 2, semester: 1, prereqs: [] },
  { id: 'radio1', name: 'Taller integral de radio I', year: 2, semester: 1, prereqs: ['loc2'] },
  { id: 'com_esc1', name: 'Comunicación escrita I', year: 2, semester: 1, prereqs: ['taller_red'] },
  { id: 'mkt', name: 'Marketing', year: 2, semester: 1, prereqs: [] },
  { id: 'psico_com', name: 'Psicología de la comunicación', year: 2, semester: 1, prereqs: [] },
  { id: 'ingles', name: 'Comprensión lectora en inglés', year: 2, semester: 1, prereqs: [] },
  { id: 'ling', name: 'Lingüística', year: 2, semester: 1, prereqs: [] },
  { id: 'fund_crist', name: 'Fundamentos del cristianismo', year: 2, semester: 1, prereqs: [] },

  // AÑO 2 - Cuatrimestre 2
  { id: 'ent_dig1', name: 'Entornos digitales I', year: 2, semester: 2, prereqs: [] },
  { id: 'radio2', name: 'Taller integral de radio II', year: 2, semester: 2, prereqs: ['radio1'] },
  { id: 'intro_visual', name: 'Introducción a la comunicación visual', year: 2, semester: 2, prereqs: [] },
  { id: 'com_esc2', name: 'Comunicación escrita II', year: 2, semester: 2, prereqs: ['com_esc1'] },
  { id: 'lider', name: 'Liderazgo y negociación', year: 2, semester: 2, prereqs: [] },
  { id: 'cult_com', name: 'Cultura, comunicación y educación', year: 2, semester: 2, prereqs: [] },
  { id: 'semiotica', name: 'Semiótica', year: 2, semester: 2, prereqs: ['ling'] },
  { id: 'salud', name: 'Salud y autocuidado profesional', year: 2, semester: 2, prereqs: [] },

  // AÑO 3 - Cuatrimestre 1
  { id: 'ent_dig2', name: 'Entornos digitales II', year: 3, semester: 1, prereqs: ['ent_dig1'] },
  { id: 'prod_av1', name: 'Producción audiovisual I', year: 3, semester: 1, prereqs: ['lab_post'] },
  { id: 'diseno', name: 'Taller de diseño gráfico', year: 3, semester: 1, prereqs: ['intro_visual'] },
  { id: 'dir_est', name: 'Dirección estratégica', year: 3, semester: 1, prereqs: [] },
  { id: 'prop_pub', name: 'Propaganda y publicidad', year: 3, semester: 1, prereqs: [] },
  { id: 'hist_lat', name: 'Historia latinoamericana', year: 3, semester: 1, prereqs: [] },
  { id: 'analisis_narr', name: 'Análisis de la narrativa visual', year: 3, semester: 1, prereqs: ['semiotica'] },
  { id: 'psico_salud', name: 'Aspectos psicosociales y salud en el ciclo vital', year: 3, semester: 1, prereqs: [] },

  // AÑO 3 - Cuatrimestre 2
  { id: 'prod_av2', name: 'Producción audiovisual II', year: 3, semester: 2, prereqs: ['prod_av1'] },
  { id: 'psico_org', name: 'Psicosociología de las organizaciones', year: 3, semester: 2, prereqs: [] },
  { id: 'dir_com', name: 'Dirección en comunicación', year: 3, semester: 2, prereqs: ['dir_est'] },
  { id: 'ident_visual', name: 'Identidad visual corporativa', year: 3, semester: 2, prereqs: ['diseno'] },
  { id: 'emprend', name: 'Emprendimiento', year: 3, semester: 2, prereqs: ['prop_pub'] },
  { id: 'analisis_dis', name: 'Análisis del discurso', year: 3, semester: 2, prereqs: ['semiotica'] },
  { id: 'legis', name: 'Legislación en comunicación', year: 3, semester: 2, prereqs: [] },
  { id: 'interp_bib', name: 'Interpretación bíblica de la historia', year: 3, semester: 2, prereqs: [] },

  // AÑO 4 - Cuatrimestre 1
  { id: 'docu', name: 'Producción documental', year: 4, semester: 1, prereqs: ['prod_av2'] },
  { id: 'proy_org1', name: 'Proyecto de comunicación en las organizaciones I', year: 4, semester: 1, prereqs: ['dir_com'] },
  { id: 'resp_soc', name: 'Responsabilidad social', year: 4, semester: 1, prereqs: [] },
  { id: 'consult', name: 'Consultoría en dirección de comunicación', year: 4, semester: 1, prereqs: ['dir_com'] },
  { id: 'metod', name: 'Metodología de la investigación aplicada a la comunicación', year: 4, semester: 1, prereqs: [] },
  { id: 'com_rel', name: 'Comunicación y religión', year: 4, semester: 1, prereqs: [] },
  { id: 'anim', name: 'Animación digital', year: 4, semester: 1, prereqs: [] },
  { id: 'ciencia_fe', name: 'Ciencia y fe', year: 4, semester: 1, prereqs: [] },

  // AÑO 4 - Cuatrimestre 2
  { id: 'etica', name: 'Ética y deontología profesional', year: 4, semester: 2, prereqs: [] },
  { id: 'portafolio', name: 'Portafolio digital profesional', year: 4, semester: 2, prereqs: ['emprend', 'diseno'] },
  { id: 'proy_org2', name: 'Proyecto de comunicación en las organizaciones II', year: 4, semester: 2, prereqs: ['proy_org1'] },
  { id: 'tif', name: 'Trabajo integrador final', year: 4, semester: 2, prereqs: ['metod'] },
  { id: 'practica', name: 'Practica profesional', year: 4, semester: 2, prereqs: ['radio2', 'docu', 'proy_org1'] },
  { id: 'mov_rel', name: 'Movimientos religiosos contemporáneos', year: 4, semester: 2, prereqs: [] },
];

export default function StudyPlanTracker() {
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState('plan'); // 'plan', 'vault', 'calendar'
  
  // Data States
  const [completedSubjects, setCompletedSubjects] = useState([]);
  const [subjectDetails, setSubjectDetails] = useState({}); // NUEVO ESTADO PARA DETALLES
  const [vaultItems, setVaultItems] = useState([]);
  const [calendarEvents, setCalendarEvents] = useState([]);
  const [scheduleItems, setScheduleItems] = useState([]);
  const [availabilityItems, setAvailabilityItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // 1. Initialize Auth
  useEffect(() => {
    const initAuth = async () => {
      try {
        await signInAnonymously(auth);
      } catch (error) {
        console.error("Auth Error:", error);
      }
    };
    initAuth();

    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      if(!currentUser) setIsLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // 2. Fetch Data (Private Progress & Public Shared Data)
  useEffect(() => {
    if (!user) return;

    // A) Listen to Private Progress
    const progressRef = doc(db, 'artifacts', appId, 'users', user.uid, 'progress', 'main');
    const unsubProgress = onSnapshot(progressRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        setCompletedSubjects(data.subjects || []);
        setSubjectDetails(data.details || {}); // Cargar detalles guardados
      } else {
        setCompletedSubjects([]); 
        setSubjectDetails({});
      }
      setIsLoading(false);
    }, (err) => console.error("Progress fetch error:", err));

    // B) Listen to Public Vault
    const vaultRef = collection(db, 'artifacts', appId, 'public', 'data', 'vault');
    const unsubVault = onSnapshot(vaultRef, (snapshot) => {
      const items = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      items.sort((a, b) => b.createdAt - a.createdAt); // Sort newest first in memory
      setVaultItems(items);
    }, (err) => console.error("Vault fetch error:", err));

    // C) Listen to Public Calendar
    const calRef = collection(db, 'artifacts', appId, 'public', 'data', 'calendar');
    const unsubCal = onSnapshot(calRef, (snapshot) => {
      const events = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      events.sort((a, b) => new Date(a.date) - new Date(b.date)); // Sort by date ascending
      setCalendarEvents(events);
    }, (err) => console.error("Calendar fetch error:", err));

    // D) Listen to Public Schedule
    const schedRef = collection(db, 'artifacts', appId, 'public', 'data', 'schedule');
    const unsubSched = onSnapshot(schedRef, (snapshot) => {
      const items = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setScheduleItems(items);
    }, (err) => console.error("Schedule fetch error:", err));

    // E) Listen to Public Availability
    const availRef = collection(db, 'artifacts', appId, 'public', 'data', 'availability');
    const unsubAvail = onSnapshot(availRef, (snapshot) => {
      const items = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setAvailabilityItems(items);
    }, (err) => console.error("Availability fetch error:", err));

    return () => {
      unsubProgress();
      unsubVault();
      unsubCal();
      unsubSched();
      unsubAvail();
    };
  }, [user]);

  // --- Handlers ---
  const getSubjectStatus = (subject) => {
    const detail = subjectDetails[subject.id];
    
    // Si tiene un estado detallado, usamos ese
    if (detail?.status) {
      return detail.status; // Ahora puede ser: pendiente, cursando, regular, promocion, final, aprobada
    }
    
    // Fallback de compatibilidad
    if (completedSubjects.includes(subject.id)) return 'aprobada';
    
    // Si no, verificamos si las correlativas están aprobadas (Solo las aprobadas desbloquean)
    const prerequisitesMet = subject.prereqs.every(preId => {
      const preStatus = subjectDetails[preId]?.status;
      return completedSubjects.includes(preId) || ['aprobada', 'promocion', 'final'].includes(preStatus);
    });
    
    return prerequisitesMet ? 'available' : 'locked';
  };

  const [selectedSubjectModal, setSelectedSubjectModal] = useState(null);

  const handleSubjectClick = (subjectId, status) => {
    if (status === 'locked' || !user) return;
    const subject = INITIAL_SUBJECTS.find(s => s.id === subjectId);
    setSelectedSubjectModal(subject);
  };

  const handleSaveSubjectDetails = async (subjectId, newDetails) => {
    if (!user) return;
    
    // Aprobada engloba los 3 estados históricos o nuevos
    const isAprobada = ['aprobada', 'promocion', 'final'].includes(newDetails.status);
    let newCompleted = [...completedSubjects];
    
    // Sincronizar el array de materias completadas (usado para la lógica de correlativas rápida)
    if (isAprobada && !newCompleted.includes(subjectId)) {
      newCompleted.push(subjectId);
    } else if (!isAprobada && newCompleted.includes(subjectId)) {
      newCompleted = newCompleted.filter(id => id !== subjectId);
    }

    const newDetailsMap = { ...subjectDetails, [subjectId]: newDetails };

    // Optimistic UI update
    setCompletedSubjects(newCompleted);
    setSubjectDetails(newDetailsMap);
    setSelectedSubjectModal(null); // Cerrar modal

    // Save to Firebase
    const progressRef = doc(db, 'artifacts', appId, 'users', user.uid, 'progress', 'main');
    await setDoc(progressRef, { subjects: newCompleted, details: newDetailsMap }, { merge: true });
  };

  const resetProgress = async () => {
    if (!user) return;
    if (confirm('¿Estás seguro de que quieres reiniciar todo tu progreso y detalles a cero?')) {
      const progressRef = doc(db, 'artifacts', appId, 'users', user.uid, 'progress', 'main');
      await setDoc(progressRef, { subjects: [], details: {} });
    }
  };

  // --- Utility variables ---
  const subjectsByGroup = useMemo(() => {
    const grouped = {};
    INITIAL_SUBJECTS.forEach(sub => {
      if (!grouped[sub.year]) grouped[sub.year] = { 1: [], 2: [] };
      grouped[sub.year][sub.semester].push(sub);
    });
    return grouped;
  }, []);

  const progressPercentage = Math.round((completedSubjects.length / INITIAL_SUBJECTS.length) * 100);

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center bg-slate-50 text-teal-600 font-semibold">Cargando tu progreso...</div>;
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans pb-12">
      {/* HEADER */}
      <header className="bg-gradient-to-r from-teal-600 to-emerald-600 text-white shadow-lg sticky top-0 z-20 border-b border-teal-700/50">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white/20 backdrop-blur-sm rounded-lg shadow-sm">
                <GraduationCap size={28} />
              </div>
              <h1 className="text-xl md:text-2xl font-bold tracking-tight text-white drop-shadow-sm">Comunidad Estudiantil</h1>
            </div>
            
            <div className="flex items-center gap-4 w-full md:w-auto bg-black/10 backdrop-blur-md p-3 rounded-xl border border-white/10 shadow-inner">
              <div className="flex-1 md:w-64">
                <div className="flex justify-between text-xs mb-1.5 font-medium text-teal-50 uppercase tracking-wider">
                  <span>Tu Avance General</span>
                  <span>{progressPercentage}%</span>
                </div>
                <div className="w-full bg-black/20 rounded-full h-2.5 overflow-hidden border border-black/10">
                  <div 
                    className="bg-gradient-to-r from-green-400 to-emerald-300 h-full rounded-full transition-all duration-500 ease-out shadow-[0_0_10px_rgba(52,211,153,0.5)]"
                    style={{ width: `${progressPercentage}%` }}
                  ></div>
                </div>
              </div>
              <button 
                onClick={resetProgress}
                className="p-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors text-white shadow-sm hover:shadow backdrop-blur-sm"
                title="Reiniciar progreso"
              >
                <RotateCcw size={18} />
              </button>
            </div>
          </div>

          {/* TAB NAVIGATION */}
          <div className="flex gap-2 mt-6 overflow-x-auto pb-0 hide-scrollbar items-end">
            <TabButton 
              active={activeTab === 'plan'} 
              onClick={() => setActiveTab('plan')} 
              icon={<BookOpen size={18} />} 
              label="Mi Plan de Estudios" 
            />
            <TabButton 
              active={activeTab === 'vault'} 
              onClick={() => setActiveTab('vault')} 
              icon={<Folder size={18} />} 
              label="Bóveda Compartida" 
            />
            <TabButton 
              active={activeTab === 'calendar'} 
              onClick={() => setActiveTab('calendar')} 
              icon={<CalendarDays size={18} />} 
              label="Calendario Comunitario" 
            />
            <TabButton 
              active={activeTab === 'schedule'} 
              onClick={() => setActiveTab('schedule')} 
              icon={<Clock size={18} />} 
              label="Horarios" 
            />
            <TabButton 
              active={activeTab === 'focus'} 
              onClick={() => setActiveTab('focus')} 
              icon={<Headphones size={18} />} 
              label="Concentración" 
            />
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8">
        {activeTab === 'plan' && (
          <PlanView 
            subjectsByGroup={subjectsByGroup} 
            completedSubjects={completedSubjects}
            subjectDetails={subjectDetails}
            getSubjectStatus={getSubjectStatus}
            onSubjectClick={handleSubjectClick}
          />
        )}
        {activeTab === 'vault' && (
          <VaultView user={user} vaultItems={vaultItems} subjects={INITIAL_SUBJECTS} />
        )}
        {activeTab === 'calendar' && (
          <CalendarView user={user} calendarEvents={calendarEvents} subjects={INITIAL_SUBJECTS} />
        )}
        {activeTab === 'schedule' && (
          <ScheduleView user={user} scheduleItems={scheduleItems} availabilityItems={availabilityItems} subjects={INITIAL_SUBJECTS} />
        )}
        {activeTab === 'focus' && (
          <FocusView />
        )}
      </main>

      {/* MODAL DE DETALLES DE MATERIA */}
      {selectedSubjectModal && (
        <SubjectDetailsModal 
          subject={selectedSubjectModal}
          currentDetails={subjectDetails[selectedSubjectModal.id] || {}}
          onSave={(details) => handleSaveSubjectDetails(selectedSubjectModal.id, details)}
          onClose={() => setSelectedSubjectModal(null)}
        />
      )}
      
      <footer className="mt-16 border-t border-slate-200 pt-8 text-center text-slate-400 text-sm">
        <p>Entorno Colaborativo - Sincronizado en tiempo real</p>
      </footer>
    </div>
  );
}

// ==========================================
// TABS COMPONENTS
// ==========================================

function TabButton({ active, onClick, icon, label }) {
  return (
    <button
      onClick={onClick}
      className={`
        flex items-center gap-2 px-4 py-3 font-medium transition-all text-sm whitespace-nowrap
        ${active 
          ? 'bg-slate-50 text-teal-800 border-t-4 border-teal-500 rounded-t-xl shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]' 
          : 'bg-white/10 text-teal-50 hover:bg-white/20 hover:text-white rounded-t-lg backdrop-blur-sm mb-1'}
      `}
    >
      {icon}
      {label}
    </button>
  );
}

// ==========================================
// VIEW: PLAN DE ESTUDIOS (PRIVATE)
// ==========================================

function PlanView({ subjectsByGroup, completedSubjects, subjectDetails, getSubjectStatus, onSubjectClick }) {
  return (
    <>
      <div className="flex flex-wrap justify-center gap-3 mb-10 text-xs md:text-sm">
        <div className="flex items-center gap-2 px-3 py-1 bg-white rounded-full shadow-sm border border-slate-200">
          <div className="w-2.5 h-2.5 rounded-full bg-green-500"></div>
          <span className="font-medium text-slate-600">Aprobada</span>
        </div>
        <div className="flex items-center gap-2 px-3 py-1 bg-white rounded-full shadow-sm border border-slate-200">
          <div className="w-2.5 h-2.5 rounded-full bg-amber-400"></div>
          <span className="font-medium text-slate-600">Regularizada</span>
        </div>
        <div className="flex items-center gap-2 px-3 py-1 bg-white rounded-full shadow-sm border border-slate-200">
          <div className="w-2.5 h-2.5 rounded-full bg-blue-400"></div>
          <span className="font-medium text-slate-600">Cursando</span>
        </div>
        <div className="flex items-center gap-2 px-3 py-1 bg-white rounded-full shadow-sm border border-teal-300 ring-2 ring-teal-50">
          <div className="w-2.5 h-2.5 rounded-full bg-white border-2 border-teal-500"></div>
          <span className="font-medium text-teal-700">Disponible</span>
        </div>
        <div className="flex items-center gap-2 px-3 py-1 bg-white rounded-full shadow-sm border border-slate-200 opacity-70">
          <div className="w-2.5 h-2.5 rounded-full bg-slate-300"></div>
          <span className="font-medium text-slate-500">Bloqueada</span>
        </div>
      </div>

      <div className="space-y-16">
        {Object.entries(subjectsByGroup).map(([year, semesters]) => (
          <div key={year} className="relative">
            <div className="sticky top-28 z-0 flex items-center mb-6">
               <div className="bg-slate-800 text-white font-bold px-6 py-2 rounded-r-xl shadow-md -ml-4 text-lg border-l-4 border-teal-400">
                {year}° Año
              </div>
              <div className="h-px bg-slate-200 flex-1 ml-4"></div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 pl-2">
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-teal-700 font-semibold mb-2 bg-teal-50 w-fit px-3 py-1 rounded-md">
                  <Calendar size={16} />
                  <span>1er Cuatrimestre</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {semesters[1].map(subject => (
                    <SubjectCardWrapper 
                      key={subject.id} 
                      subject={subject} 
                      completedSubjects={completedSubjects} 
                      subjectDetails={subjectDetails}
                      onToggle={onSubjectClick} 
                      getSubjectStatus={getSubjectStatus}
                    />
                  ))}
                </div>
              </div>
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-teal-700 font-semibold mb-2 bg-teal-50 w-fit px-3 py-1 rounded-md">
                  <Calendar size={16} />
                  <span>2do Cuatrimestre</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {semesters[2].map(subject => (
                    <SubjectCardWrapper 
                       key={subject.id} 
                       subject={subject} 
                       completedSubjects={completedSubjects} 
                       subjectDetails={subjectDetails}
                       onToggle={onSubjectClick} 
                       getSubjectStatus={getSubjectStatus}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}

function SubjectCardWrapper({ subject, completedSubjects, subjectDetails, onToggle, getSubjectStatus }) {
  const status = getSubjectStatus(subject);
  const detail = subjectDetails[subject.id];
  const missingPrereqs = subject.prereqs
    .filter(pid => {
       const s = getSubjectStatus(INITIAL_SUBJECTS.find(x => x.id === pid));
       return !['aprobada', 'promocion', 'final'].includes(s);
    })
    .map(pid => INITIAL_SUBJECTS.find(s => s.id === pid)?.name);

  return (
    <SubjectCard 
      subject={subject}
      status={status}
      detail={detail}
      missingPrereqs={missingPrereqs}
      onToggle={() => onToggle(subject.id, status)}
    />
  );
}

function SubjectCard({ subject, status, detail, missingPrereqs, onToggle }) {
  const isLocked = status === 'locked';
  const isAprobada = ['aprobada', 'promocion', 'final'].includes(status);
  const isRegular = status === 'regular';
  const isCursando = status === 'cursando';
  const isAvailable = status === 'available';

  return (
    <div 
      onClick={onToggle}
      className={`
        relative p-3 rounded-lg border transition-all duration-200 cursor-pointer select-none group
        flex flex-col h-full min-h-[100px] shadow-sm
        ${isLocked ? 'bg-slate-50/50 border-slate-200 hover:bg-slate-100' : ''}
        ${isAprobada ? 'bg-green-50 border-green-400/50 text-green-900' : ''}
        ${isRegular ? 'bg-amber-50 border-amber-400/50 text-amber-900' : ''}
        ${isCursando ? 'bg-blue-50 border-blue-400/50 text-blue-900' : ''}
        ${isAvailable ? 'bg-white border-teal-300 ring-2 ring-teal-50 hover:ring-teal-100 hover:border-teal-400 shadow-md hover:-translate-y-0.5' : ''}
      `}
    >
      <div className="flex justify-between items-start gap-2 mb-1">
        <h3 className={`font-semibold text-sm leading-snug ${isLocked ? 'text-slate-400' : 'text-slate-800'}`}>
          {subject.name}
        </h3>
        <div className={`
          shrink-0 p-1 rounded-full transition-colors mt-0.5
          ${isAprobada ? 'bg-green-500 text-white' : ''}
          ${isRegular ? 'bg-amber-400 text-white' : ''}
          ${isCursando ? 'bg-blue-500 text-white' : ''}
          ${isAvailable ? 'bg-teal-100 text-teal-600' : ''}
          ${isLocked ? 'text-slate-300' : ''}
        `}>
          {isAprobada && <Check size={14} strokeWidth={3} />}
          {isRegular && <FileText size={14} strokeWidth={2} />}
          {isCursando && <BookOpen size={14} strokeWidth={2} />}
          {isAvailable && <Unlock size={14} />}
          {isLocked && <Lock size={14} />}
        </div>
      </div>

      {/* Mostrar la nota si está regular */}
      {status === 'regular' && detail?.gradeCursada && (
        <div className="mt-1 text-xs font-bold text-amber-700 bg-amber-100/50 w-fit px-2 py-0.5 rounded">
          Cursada: {detail.gradeCursada}
        </div>
      )}

      {/* Mostrar notas si está aprobada (Promoción o Final) */}
      {status === 'promocion' && (detail?.gradePromocion || detail?.grade) && (
        <div className="mt-1 text-xs font-bold text-green-700 bg-green-100/50 w-fit px-2 py-0.5 rounded">
          Promoción: {detail.gradePromocion || detail.grade}
        </div>
      )}
      
      {status === 'final' && (detail?.gradeCursada || detail?.gradeFinal) && (
        <div className="mt-1 text-[11px] font-bold text-green-700 bg-green-100/50 w-fit px-2 py-0.5 rounded flex gap-2">
          {detail.gradeCursada && <span>Cursada: {detail.gradeCursada}</span>}
          {detail.gradeFinal && <span>Final: {detail.gradeFinal}</span>}
        </div>
      )}

      {/* Legacy Aprobada genérica */}
      {status === 'aprobada' && detail?.grade && (
        <div className="mt-1 text-xs font-bold text-green-700 bg-green-100/50 w-fit px-2 py-0.5 rounded">
          Nota: {detail.grade}
        </div>
      )}

      {isLocked && missingPrereqs.length > 0 && (
        <div className="mt-auto pt-2">
          <div className="flex items-center gap-1 text-[10px] uppercase font-bold text-red-400 mb-0.5">
            <AlertCircle size={10} />
            <span>Falta correlativa</span>
          </div>
          <p className="text-[11px] text-slate-500 leading-tight">
            {missingPrereqs[0]} {missingPrereqs.length > 1 && `+ ${missingPrereqs.length - 1} más`}
          </p>
        </div>
      )}
      
       {isAvailable && (
        <div className="mt-auto flex justify-end">
            <span className="text-[10px] font-bold text-teal-600 bg-teal-50 px-2 py-0.5 rounded-full uppercase tracking-wide">
                Cursar
            </span>
        </div>
      )}
    </div>
  );
}

// ==========================================
// NUEVO MODAL: DETALLES DE MATERIA
// ==========================================

function SubjectDetailsModal({ subject, currentDetails, onSave, onClose }) {
  const [formData, setFormData] = useState({
    status: currentDetails.status || 'pendiente',
    scheduleDays: currentDetails.scheduleDays || '',
    hours: currentDetails.hours || '',
    gradeCursada: currentDetails.gradeCursada || '',
    gradeFinal: currentDetails.gradeFinal || '',
    gradePromocion: currentDetails.gradePromocion || currentDetails.grade || ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-teal-600 to-emerald-600 px-6 py-4 flex justify-between items-center text-white shrink-0">
          <div>
            <span className="text-teal-100 text-xs font-bold uppercase tracking-wider mb-1 block">
              Registro de Cursada
            </span>
            <h2 className="text-lg font-bold leading-tight pr-4">{subject.name}</h2>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/20 rounded-full transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto">
          <form id="subject-form" onSubmit={handleSubmit} className="space-y-5">
            
            {/* ESTADO PRINCIPAL */}
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
              <label className="block text-sm font-bold text-slate-700 mb-2">Estado de la Materia</label>
              <select 
                className="w-full px-3 py-2.5 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none font-medium"
                value={formData.status} 
                onChange={e => setFormData({...formData, status: e.target.value})}
              >
                <option value="pendiente">Pendiente (Disponible)</option>
                <option value="cursando">📖 Cursando actualmente</option>
                <option value="regular">📝 Regularizada (Falta final)</option>
                <option value="promocion">🏆 Aprobada por Promoción</option>
                <option value="final">🎓 Aprobada con Examen Final</option>
                {/* Opción oculta por retrocompatibilidad si alguien ya tenía una guardada así */}
                {formData.status === 'aprobada' && <option value="aprobada" className="hidden">✅ Aprobada genérica</option>}
              </select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              
              {/* BLOQUE NOTAS DINÁMICO */}
              {(formData.status === 'regular' || formData.status === 'final') && (
                <div className={formData.status === 'regular' ? 'md:col-span-2' : ''}>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Nota de Cursada</label>
                  <input 
                    type="number" min="1" max="10" placeholder="Ej: 7"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500 outline-none"
                    value={formData.gradeCursada} onChange={e => setFormData({...formData, gradeCursada: e.target.value})}
                  />
                </div>
              )}

              {formData.status === 'final' && (
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Nota de Examen Final</label>
                  <input 
                    type="number" min="1" max="10" placeholder="Ej: 9"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500 outline-none"
                    value={formData.gradeFinal} onChange={e => setFormData({...formData, gradeFinal: e.target.value})}
                  />
                </div>
              )}

              {(formData.status === 'promocion' || formData.status === 'aprobada') && (
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-slate-700 mb-1">Nota de Promoción</label>
                  <input 
                    type="number" min="1" max="10" placeholder="Ej: 8"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500 outline-none"
                    value={formData.gradePromocion} onChange={e => setFormData({...formData, gradePromocion: e.target.value})}
                  />
                </div>
              )}

              {/* DÍAS */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Días de cursada</label>
                <input 
                  type="text" placeholder="Ej: Lunes y Miércoles"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none"
                  value={formData.scheduleDays} onChange={e => setFormData({...formData, scheduleDays: e.target.value})}
                />
              </div>

              {/* CARGA HORARIA */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Carga Horaria (Horas/Sem)</label>
                <input 
                  type="number" placeholder="Ej: 4" min="1"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none"
                  value={formData.hours} onChange={e => setFormData({...formData, hours: e.target.value})}
                />
              </div>
            </div>
          </form>
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-slate-100 bg-slate-50 flex justify-end gap-3 shrink-0">
          <button 
            type="button" 
            onClick={onClose}
            className="px-4 py-2 text-slate-600 font-medium hover:bg-slate-200 rounded-lg transition-colors"
          >
            Cancelar
          </button>
          <button 
            type="submit" form="subject-form"
            className="px-6 py-2 bg-teal-600 text-white font-semibold rounded-lg hover:bg-teal-700 transition-colors flex items-center gap-2 shadow-sm"
          >
            <Save size={18} /> Guardar Registro
          </button>
        </div>
      </div>
    </div>
  );
}

// ==========================================
// VIEW: BÓVEDA DE APUNTES (SHARED)
// ==========================================

function VaultView({ user, vaultItems, subjects }) {
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ title: '', link: '', subjectId: subjects[0].id });

  const handleAddVaultItem = async (e) => {
    e.preventDefault();
    if (!formData.title || !formData.link) return;
    
    // Auto-add http if missing for valid links
    let finalLink = formData.link;
    if (!finalLink.startsWith('http://') && !finalLink.startsWith('https://')) {
      finalLink = 'https://' + finalLink;
    }

    try {
      const vaultRef = collection(db, 'artifacts', appId, 'public', 'data', 'vault');
      await addDoc(vaultRef, {
        title: formData.title,
        link: finalLink,
        subjectId: formData.subjectId,
        authorId: user.uid,
        createdAt: Date.now()
      });
      setFormData({ title: '', link: '', subjectId: subjects[0].id });
      setShowForm(false);
    } catch (error) {
      console.error("Error adding doc: ", error);
    }
  };

  const handleDelete = async (id, authorId) => {
    if (user.uid !== authorId) return; // Only author can delete
    if (!confirm('¿Borrar este apunte para todos?')) return;
    try {
      await deleteDoc(doc(db, 'artifacts', appId, 'public', 'data', 'vault', id));
    } catch (error) {
      console.error("Error deleting doc: ", error);
    }
  };

  return (
    <div className="max-w-4xl mx-auto animate-in fade-in duration-500">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Bóveda de Apuntes</h2>
          <p className="text-sm text-slate-500">Comparte resúmenes, parciales viejos y enlaces a Drive.</p>
        </div>
        <button 
          onClick={() => setShowForm(!showForm)}
          className="bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 rounded-lg font-medium flex items-center gap-2 transition-colors shadow-sm"
        >
          {showForm ? 'Cancelar' : <><Plus size={18}/> Compartir Apunte</>}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleAddVaultItem} className="bg-white p-5 rounded-xl shadow-md border border-slate-200 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Título / Descripción</label>
              <input 
                type="text" required maxLength={50}
                placeholder="Ej: Resumen final cap 1 al 5"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:outline-none"
                value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Materia</label>
              <select 
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:outline-none"
                value={formData.subjectId} onChange={e => setFormData({...formData, subjectId: e.target.value})}
              >
                {subjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-slate-700 mb-1">Enlace (Google Drive, Dropbox, etc.)</label>
              <input 
                type="text" required
                placeholder="https://drive.google.com/..."
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:outline-none"
                value={formData.link} onChange={e => setFormData({...formData, link: e.target.value})}
              />
            </div>
          </div>
          <button type="submit" className="w-full bg-teal-50 text-teal-700 font-semibold py-2 rounded-lg hover:bg-teal-100 transition-colors border border-teal-200">
            Publicar en la Bóveda
          </button>
        </form>
      )}

      {vaultItems.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-xl border border-dashed border-slate-300">
          <Folder size={48} className="mx-auto text-slate-300 mb-3" />
          <p className="text-slate-500 font-medium">La bóveda está vacía</p>
          <p className="text-sm text-slate-400">¡Sé el primero en compartir un apunte!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {vaultItems.map(item => {
            const subject = subjects.find(s => s.id === item.subjectId);
            const isOwner = user?.uid === item.authorId;
            return (
              <div key={item.id} className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 hover:shadow-md transition-shadow group flex flex-col">
                <div className="flex justify-between items-start mb-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-teal-600 bg-teal-50 px-2 py-0.5 rounded">
                    {subject ? subject.name : 'General'}
                  </span>
                  {isOwner && (
                    <button onClick={() => handleDelete(item.id, item.authorId)} className="text-slate-300 hover:text-red-500 transition-colors" title="Borrar">
                      <Trash2 size={16} />
                    </button>
                  )}
                </div>
                <h3 className="font-semibold text-slate-800 mb-1 line-clamp-2">{item.title}</h3>
                <p className="text-xs text-slate-400 mb-4">
                  {new Date(item.createdAt).toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })}
                </p>
                <div className="mt-auto pt-3 border-t border-slate-100">
                  <a 
                    href={item.link} target="_blank" rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2 w-full py-2 bg-slate-50 hover:bg-teal-50 text-teal-700 rounded-lg text-sm font-medium transition-colors border border-slate-200 hover:border-teal-200"
                  >
                    Abrir Enlace <ExternalLink size={14} />
                  </a>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ==========================================
// VIEW: CALENDARIO COMPARTIDO (SHARED)
// ==========================================

function CalendarView({ user, calendarEvents, subjects }) {
  const [showForm, setShowForm] = useState(false);
  
  // Default to tomorrow
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const defaultDate = tomorrow.toISOString().split('T')[0];
  
  const [formData, setFormData] = useState({ title: '', date: defaultDate, type: 'Exam', subjectId: subjects[0].id });

  const handleAddEvent = async (e) => {
    e.preventDefault();
    if (!formData.title || !formData.date) return;
    
    try {
      const calRef = collection(db, 'artifacts', appId, 'public', 'data', 'calendar');
      await addDoc(calRef, {
        title: formData.title,
        date: formData.date,
        type: formData.type, // 'Exam' or 'TP'
        subjectId: formData.subjectId,
        authorId: user.uid,
        createdAt: Date.now()
      });
      setFormData({ ...formData, title: '' });
      setShowForm(false);
    } catch (error) {
      console.error("Error adding event: ", error);
    }
  };

  const handleDelete = async (id, authorId) => {
    if (user.uid !== authorId) return;
    if (!confirm('¿Borrar este evento para todos?')) return;
    try {
      await deleteDoc(doc(db, 'artifacts', appId, 'public', 'data', 'calendar', id));
    } catch (error) {
      console.error("Error deleting doc: ", error);
    }
  };

  // Separa eventos futuros y pasados
  const todayStr = new Date().toISOString().split('T')[0];
  const upcomingEvents = calendarEvents.filter(e => e.date >= todayStr);
  const pastEvents = calendarEvents.filter(e => e.date < todayStr).reverse(); // Recientes primero

  return (
    <div className="max-w-4xl mx-auto animate-in fade-in duration-500">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Calendario Comunitario</h2>
          <p className="text-sm text-slate-500">Fechas importantes visibles para todos.</p>
        </div>
        <button 
          onClick={() => setShowForm(!showForm)}
          className="bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 rounded-lg font-medium flex items-center gap-2 transition-colors shadow-sm"
        >
          {showForm ? 'Cancelar' : <><Plus size={18}/> Agendar Fecha</>}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleAddEvent} className="bg-white p-5 rounded-xl shadow-md border border-slate-200 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
             <div className="md:col-span-2">
              <label className="block text-sm font-medium text-slate-700 mb-1">Título del Evento</label>
              <input 
                type="text" required maxLength={60}
                placeholder="Ej: 1er Parcial - Temas 1 a 4"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:outline-none"
                value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Tipo</label>
              <select 
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:outline-none"
                value={formData.type} onChange={e => setFormData({...formData, type: e.target.value})}
              >
                <option value="Exam">Examen / Parcial</option>
                <option value="TP">Trabajo Práctico / Entrega</option>
              </select>
            </div>
             <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Fecha</label>
              <input 
                type="date" required
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:outline-none"
                value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})}
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-slate-700 mb-1">Materia</label>
              <select 
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:outline-none"
                value={formData.subjectId} onChange={e => setFormData({...formData, subjectId: e.target.value})}
              >
                {subjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
            </div>
          </div>
          <button type="submit" className="w-full bg-teal-50 text-teal-700 font-semibold py-2 rounded-lg hover:bg-teal-100 transition-colors border border-teal-200">
            Guardar Fecha
          </button>
        </form>
      )}

      {/* PRÓXIMOS EVENTOS */}
      <h3 className="font-bold text-slate-700 mb-4 flex items-center gap-2">
        <Clock size={18} className="text-teal-500" /> Próximos Vencimientos
      </h3>
      {upcomingEvents.length === 0 ? (
        <div className="text-center py-10 bg-white rounded-xl border border-dashed border-slate-300 mb-8">
          <p className="text-slate-500">No hay eventos próximos agendados.</p>
        </div>
      ) : (
        <div className="space-y-3 mb-10">
          {upcomingEvents.map(event => (
            <EventCard key={event.id} event={event} subjects={subjects} user={user} onDelete={handleDelete} isPast={false} />
          ))}
        </div>
      )}

      {/* EVENTOS PASADOS */}
      {pastEvents.length > 0 && (
        <>
          <h3 className="font-bold text-slate-400 mb-4">Eventos Pasados</h3>
          <div className="space-y-3 opacity-60">
            {pastEvents.map(event => (
              <EventCard key={event.id} event={event} subjects={subjects} user={user} onDelete={handleDelete} isPast={true} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}

function EventCard({ event, subjects, user, onDelete, isPast }) {
  const subject = subjects.find(s => s.id === event.subjectId);
  const isOwner = user?.uid === event.authorId;
  const isExam = event.type === 'Exam';
  
  // Format Date (e.g., "Jueves, 15 de Octubre")
  const dateObj = new Date(event.date + "T00:00:00"); // Fix timezone offset issues
  const dateString = dateObj.toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' });

  return (
    <div className={`flex items-stretch bg-white rounded-xl border overflow-hidden shadow-sm hover:shadow-md transition-shadow ${isExam ? 'border-orange-200' : 'border-blue-200'}`}>
      {/* Date block */}
      <div className={`w-24 shrink-0 flex flex-col justify-center items-center text-center p-3 border-r ${isExam ? 'bg-orange-50 border-orange-100' : 'bg-blue-50 border-blue-100'}`}>
        <span className={`text-xs font-bold uppercase ${isExam ? 'text-orange-600' : 'text-blue-600'}`}>
          {dateObj.toLocaleDateString('es-ES', { month: 'short' })}
        </span>
        <span className={`text-2xl font-black ${isExam ? 'text-orange-700' : 'text-blue-700'}`}>
          {dateObj.getDate()}
        </span>
      </div>
      
      {/* Content block */}
      <div className="flex-1 p-4 flex flex-col justify-center relative">
         {isOwner && (
            <button onClick={() => onDelete(event.id, event.authorId)} className="absolute top-3 right-3 text-slate-300 hover:text-red-500 transition-colors" title="Borrar">
              <Trash2 size={16} />
            </button>
          )}
        <div className="flex items-center gap-2 mb-1">
          <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${isExam ? 'bg-orange-100 text-orange-700' : 'bg-blue-100 text-blue-700'}`}>
            {isExam ? 'Examen' : 'Entrega / TP'}
          </span>
          <span className="text-xs font-medium text-slate-500 capitalize">
            {dateString}
          </span>
        </div>
        <h4 className={`font-bold ${isPast ? 'text-slate-500 line-through' : 'text-slate-800'}`}>
          {event.title}
        </h4>
        <p className="text-sm text-slate-500 mt-1">
          {subject ? subject.name : 'Materia General'}
        </p>
      </div>
    </div>
  );
}

// ==========================================
// VIEW: HORARIOS Y DISPONIBILIDAD (SHARED)
// ==========================================

function ScheduleView({ user, scheduleItems, availabilityItems, subjects }) {
  const [subTab, setSubTab] = useState('classes'); // 'classes' o 'availability'
  const [showForm, setShowForm] = useState(false);
  
  // Estado para formulario de Clases
  const [classFormData, setClassFormData] = useState({ 
    subjectId: subjects[0].id, 
    dayOfWeek: 'Lunes', 
    startTime: '14:00', 
    endTime: '16:00', 
    classroom: '' 
  });

  // Estado para formulario de Disponibilidad
  const [availFormData, setAvailFormData] = useState({ 
    userName: '', 
    dayOfWeek: 'Lunes', 
    startTime: '16:00', 
    endTime: '18:00' 
  });

  const DAYS = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];

  const handleAddSchedule = async (e) => {
    e.preventDefault();
    if (!classFormData.startTime || !classFormData.endTime) return;
    try {
      const schedRef = collection(db, 'artifacts', appId, 'public', 'data', 'schedule');
      await addDoc(schedRef, {
        ...classFormData,
        authorId: user.uid,
        createdAt: Date.now()
      });
      setClassFormData({ ...classFormData, classroom: '' });
      setShowForm(false);
    } catch (error) {
      console.error("Error adding schedule: ", error);
    }
  };

  const handleAddAvailability = async (e) => {
    e.preventDefault();
    if (!availFormData.startTime || !availFormData.endTime || !availFormData.userName) return;
    try {
      const availRef = collection(db, 'artifacts', appId, 'public', 'data', 'availability');
      await addDoc(availRef, {
        ...availFormData,
        authorId: user.uid,
        createdAt: Date.now()
      });
      // Mantenemos el nombre por si quiere agregar otro día rápido
      setShowForm(false);
    } catch (error) {
      console.error("Error adding availability: ", error);
    }
  };

  const handleDelete = async (id, authorId, type) => {
    if (user.uid !== authorId) return; 
    if (!confirm('¿Borrar este registro para todos?')) return;
    try {
      await deleteDoc(doc(db, 'artifacts', appId, 'public', 'data', type, id));
    } catch (error) {
      console.error(`Error deleting ${type}: `, error);
    }
  };

  return (
    <div className="max-w-6xl mx-auto animate-in fade-in duration-500">
      
      {/* Selector de Sub-pestañas */}
      <div className="flex justify-center mb-8">
        <div className="bg-slate-200 p-1 rounded-xl inline-flex shadow-inner">
          <button 
            onClick={() => { setSubTab('classes'); setShowForm(false); }}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-lg font-medium text-sm transition-all ${subTab === 'classes' ? 'bg-white text-teal-700 shadow' : 'text-slate-600 hover:text-slate-800'}`}
          >
            <Clock size={16} /> Horarios de Clases
          </button>
          <button 
            onClick={() => { setSubTab('availability'); setShowForm(false); }}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-lg font-medium text-sm transition-all ${subTab === 'availability' ? 'bg-white text-green-700 shadow' : 'text-slate-600 hover:text-slate-800'}`}
          >
            <Users size={16} /> Disponibilidad (TPs)
          </button>
        </div>
      </div>

      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">
            {subTab === 'classes' ? 'Horarios de Cursada' : 'Disponibilidad para Trabajos'}
          </h2>
          <p className="text-sm text-slate-500">
            {subTab === 'classes' ? 'Grilla semanal de clases y aulas.' : 'Encuentren espacios libres en común para juntarse a estudiar o hacer TPs.'}
          </p>
        </div>
        <button 
          onClick={() => setShowForm(!showForm)}
          className={`${subTab === 'classes' ? 'bg-teal-600 hover:bg-teal-700' : 'bg-green-600 hover:bg-green-700'} text-white px-4 py-2 rounded-lg font-medium flex items-center gap-2 transition-colors shadow-sm`}
        >
          {showForm ? 'Cancelar' : <><Plus size={18}/> Agregar {subTab === 'classes' ? 'Clase' : 'Horario Libre'}</>}
        </button>
      </div>

      {/* FORMULARIO CLASES */}
      {showForm && subTab === 'classes' && (
        <form onSubmit={handleAddSchedule} className="bg-white p-5 rounded-xl shadow-md border border-slate-200 mb-8 border-t-4 border-t-teal-500">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div className="md:col-span-3">
              <label className="block text-sm font-medium text-slate-700 mb-1">Materia</label>
              <select className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500" value={classFormData.subjectId} onChange={e => setClassFormData({...classFormData, subjectId: e.target.value})}>
                {subjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Día</label>
              <select className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500" value={classFormData.dayOfWeek} onChange={e => setClassFormData({...classFormData, dayOfWeek: e.target.value})}>
                {DAYS.map(d => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Desde - Hasta</label>
              <div className="flex items-center gap-2">
                <input type="time" required className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500" value={classFormData.startTime} onChange={e => setClassFormData({...classFormData, startTime: e.target.value})}/>
                <span className="text-slate-400">-</span>
                <input type="time" required className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500" value={classFormData.endTime} onChange={e => setClassFormData({...classFormData, endTime: e.target.value})}/>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Aula (Opcional)</label>
              <input type="text" placeholder="Ej: Aula 5..." maxLength={30} className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500" value={classFormData.classroom} onChange={e => setClassFormData({...classFormData, classroom: e.target.value})}/>
            </div>
          </div>
          <button type="submit" className="w-full bg-teal-50 text-teal-700 font-semibold py-2 rounded-lg hover:bg-teal-100 transition-colors">Guardar Clase</button>
        </form>
      )}

      {/* FORMULARIO DISPONIBILIDAD */}
      {showForm && subTab === 'availability' && (
        <form onSubmit={handleAddAvailability} className="bg-white p-5 rounded-xl shadow-md border border-slate-200 mb-8 border-t-4 border-t-green-500">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div className="md:col-span-3">
              <label className="block text-sm font-medium text-slate-700 mb-1">Tu Nombre</label>
              <input type="text" required placeholder="Ej: Juan Pérez" maxLength={40} className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500" value={availFormData.userName} onChange={e => setAvailFormData({...availFormData, userName: e.target.value})}/>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Día Libre</label>
              <select className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500" value={availFormData.dayOfWeek} onChange={e => setAvailFormData({...availFormData, dayOfWeek: e.target.value})}>
                {DAYS.map(d => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Desde - Hasta</label>
              <div className="flex items-center gap-2">
                <input type="time" required className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500" value={availFormData.startTime} onChange={e => setAvailFormData({...availFormData, startTime: e.target.value})}/>
                <span className="text-slate-400">-</span>
                <input type="time" required className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500" value={availFormData.endTime} onChange={e => setAvailFormData({...availFormData, endTime: e.target.value})}/>
              </div>
            </div>
          </div>
          <button type="submit" className="w-full bg-green-50 text-green-700 font-semibold py-2 rounded-lg hover:bg-green-100 transition-colors">Publicar Disponibilidad</button>
        </form>
      )}

      {/* GRILLAS */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 xl:grid-cols-6 gap-4">
        {DAYS.map(day => {
          // Filtrar items según la pestaña activa
          const dayItems = (subTab === 'classes' ? scheduleItems : availabilityItems)
            .filter(item => item.dayOfWeek === day)
            .sort((a, b) => a.startTime.localeCompare(b.startTime));

          // Ocultar Sábado si está vacío para ahorrar espacio
          if (dayItems.length === 0 && day === 'Sábado') return null; 

          return (
            <div key={day} className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden flex flex-col">
              <div className={`${subTab === 'classes' ? 'bg-slate-100' : 'bg-green-50'} py-2 text-center border-b border-slate-200`}>
                <h3 className={`font-bold uppercase text-sm tracking-wider ${subTab === 'classes' ? 'text-slate-700' : 'text-green-800'}`}>{day}</h3>
              </div>
              <div className="p-3 flex-1 bg-slate-50/50 space-y-3">
                {dayItems.length === 0 ? (
                  <p className="text-center text-xs text-slate-400 py-4 italic">
                    {subTab === 'classes' ? 'Sin clases' : 'Nadie disponible'}
                  </p>
                ) : (
                  dayItems.map(item => {
                    const isOwner = user?.uid === item.authorId;
                    
                    if (subTab === 'classes') {
                      const subject = subjects.find(s => s.id === item.subjectId);
                      return (
                        <div key={item.id} className="bg-white p-3 rounded-lg shadow-sm border border-teal-100 relative group">
                          {isOwner && (
                            <button onClick={() => handleDelete(item.id, item.authorId, 'schedule')} className="absolute top-2 right-2 text-slate-300 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100" title="Borrar">
                              <Trash2 size={14} />
                            </button>
                          )}
                          <div className="text-xs font-bold text-teal-600 mb-1 flex items-center gap-1">
                            <Clock size={12} /> {item.startTime} - {item.endTime}
                          </div>
                          <h4 className="text-sm font-semibold text-slate-800 leading-tight mb-1 pr-4">
                            {subject ? subject.name : 'Materia'}
                          </h4>
                          {item.classroom && <p className="text-xs text-slate-500 mt-1">📍 {item.classroom}</p>}
                        </div>
                      );
                    } else {
                      // Tarjeta de Disponibilidad
                      return (
                        <div key={item.id} className="bg-white p-3 rounded-lg shadow-sm border border-green-200 relative group">
                          {isOwner && (
                            <button onClick={() => handleDelete(item.id, item.authorId, 'availability')} className="absolute top-2 right-2 text-slate-300 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100" title="Borrar">
                              <Trash2 size={14} />
                            </button>
                          )}
                          <div className="text-xs font-bold text-green-700 mb-1 flex items-center gap-1">
                            <Clock size={12} /> {item.startTime} - {item.endTime}
                          </div>
                          <h4 className="text-sm font-semibold text-slate-800 leading-tight mb-1 pr-4 flex items-center gap-1">
                            <Users size={14} className="text-slate-400"/> {item.userName}
                          </h4>
                          <p className="text-[10px] uppercase font-bold text-slate-400 mt-1 tracking-wider">Libre para TP</p>
                        </div>
                      );
                    }
                  })
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ==========================================
// VIEW: ZONA DE CONCENTRACIÓN (FOCUS)
// ==========================================

function FocusView() {
  const [activeStream, setActiveStream] = useState(null);

  const STREAMS = [
    { 
      id: 'lofi-1', category: 'Lo-Fi', title: 'Lo-Fi Hip Hop Radio', desc: 'Beats relajantes para estudiar (24/7)', 
      url: 'https://www.youtube.com/embed/jfKfPfyJRdk?autoplay=1', color: 'bg-purple-100 text-purple-700 border-purple-200'
    },
    { 
      id: 'lofi-2', category: 'Lo-Fi', title: 'Synthwave / Chillwave', desc: 'Vibras retro y electrónicas suaves', 
      url: 'https://www.youtube.com/embed/4xDzrVCgOUQ?autoplay=1', color: 'bg-indigo-100 text-indigo-700 border-indigo-200'
    },
    { 
      id: 'inst-1', category: 'Instrumental', title: 'Piano Clásico', desc: 'Música instrumental suave para enfocar', 
      url: 'https://www.youtube.com/embed/lTRiuFIWV54?autoplay=1', color: 'bg-blue-100 text-blue-700 border-blue-200'
    },
    { 
      id: 'inst-2', category: 'Instrumental', title: 'Guitarra Acústica', desc: 'Melodías tranquilas sin voz', 
      url: 'https://www.youtube.com/embed/bL_nTQMvP_s?autoplay=1', color: 'bg-sky-100 text-sky-700 border-sky-200'
    },
    { 
      id: 'white-1', category: 'Ruido Blanco', title: 'Lluvia en la Ciudad', desc: 'Sonido ambiental constante y relajante', 
      url: 'https://www.youtube.com/embed/mPZkdNFkNps?autoplay=1', color: 'bg-slate-200 text-slate-700 border-slate-300'
    },
    { 
      id: 'white-2', category: 'Ruido Blanco', title: 'Ambiente de Cafetería', desc: 'Murmullos suaves y tazas de café', 
      url: 'https://www.youtube.com/embed/BOedroPVZ4I?autoplay=1', color: 'bg-amber-100 text-amber-700 border-amber-200'
    },
    { 
      id: 'white-3', category: 'Ruido Blanco', title: 'Ruido Blanco Profundo', desc: 'Aislamiento total para máxima concentración', 
      url: 'https://www.youtube.com/embed/nMfPqeZjc2c?autoplay=1', color: 'bg-zinc-200 text-zinc-700 border-zinc-300'
    },
  ];

  return (
    <div className="max-w-5xl mx-auto animate-in fade-in duration-500">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <Headphones className="text-teal-600" /> Zona de Concentración
          </h2>
          <p className="text-sm text-slate-500">Selecciona un ambiente sonoro para acompañar tus horas de estudio.</p>
        </div>
        {activeStream && (
          <button 
            onClick={() => setActiveStream(null)}
            className="bg-slate-200 hover:bg-slate-300 text-slate-700 px-4 py-2 rounded-lg font-medium transition-colors text-sm flex items-center gap-2"
          >
            Detener Audio
          </button>
        )}
      </div>

      {/* REPRODUCTOR ACTIVO */}
      {activeStream ? (
        <div className="bg-slate-900 rounded-2xl p-4 md:p-6 mb-10 shadow-xl border border-slate-800 flex flex-col items-center">
          <div className="flex items-center gap-3 text-white mb-4 w-full">
            <Radio size={24} className="text-green-400 animate-pulse" />
            <div>
              <p className="text-xs text-slate-400 uppercase tracking-wider font-bold">Reproduciendo ahora</p>
              <h3 className="text-lg font-semibold">{activeStream.title}</h3>
            </div>
          </div>
          
          {/* Iframe invisible o visible dependiendo del gusto. Lo hacemos pequeño para que parezca un widget de audio pero use el motor de YT */}
          <div className="w-full max-w-2xl aspect-video rounded-xl overflow-hidden bg-black shadow-inner">
             <iframe 
                width="100%" 
                height="100%" 
                src={activeStream.url} 
                title="Study Audio Player" 
                frameBorder="0" 
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                allowFullScreen
              ></iframe>
          </div>
          <p className="text-slate-400 text-sm mt-4 italic">
            Tip: Puedes cambiar de pestaña en la aplicación y la música seguirá sonando.
          </p>
        </div>
      ) : (
        <div className="bg-teal-50/50 rounded-2xl p-8 mb-10 border border-teal-100 text-center">
          <Headphones size={48} className="mx-auto text-teal-300 mb-4" />
          <h3 className="text-xl font-bold text-teal-900 mb-2">Silencio en la sala</h3>
          <p className="text-teal-600">Elige una estación de la lista de abajo para empezar a escuchar.</p>
        </div>
      )}

      {/* GRILLA DE ESTACIONES */}
      <h3 className="font-bold text-slate-700 mb-4">Estaciones Disponibles</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {STREAMS.map(stream => (
          <button
            key={stream.id}
            onClick={() => setActiveStream(stream)}
            className={`flex flex-col text-left p-4 rounded-xl border-2 transition-all hover:-translate-y-1 hover:shadow-md ${
              activeStream?.id === stream.id 
                ? 'border-teal-500 ring-4 ring-teal-50 shadow-teal-100' 
                : 'border-slate-200 bg-white hover:border-teal-300'
            }`}
          >
            <div className="flex justify-between items-start mb-3 w-full">
              <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border ${stream.color}`}>
                {stream.category}
              </span>
              <PlayCircle className={activeStream?.id === stream.id ? 'text-teal-600' : 'text-slate-300'} size={20} />
            </div>
            <h4 className="font-bold text-slate-800 mb-1">{stream.title}</h4>
            <p className="text-xs text-slate-500 leading-relaxed">
              {stream.desc}
            </p>
          </button>
        ))}
      </div>
    </div>
  );
}
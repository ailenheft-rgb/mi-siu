import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Check, Lock, Unlock, GraduationCap, AlertCircle, Calendar, Folder, BookOpen, Plus, ExternalLink, Trash2, CalendarDays, Clock, Users, Headphones, PlayCircle, Radio, X, Save, FileText, LogOut, MessageSquare, Send, Trophy, XCircle, User } from 'lucide-react';

// --- FIREBASE IMPORTS ---
import { initializeApp } from 'firebase/app';
import { getAuth, signInWithPopup, GoogleAuthProvider, signOut, onAuthStateChanged } from 'firebase/auth';
import { getFirestore, collection, doc, onSnapshot, setDoc, addDoc, deleteDoc } from 'firebase/firestore';

// --- FIREBASE SETUP ---
const appId = 'organizacion-uap-app'; 
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
const googleProvider = new GoogleAuthProvider();

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
  const [activeTab, setActiveTab] = useState('plan'); 
  const [activeStream, setActiveStream] = useState(null); 
  
  // Data States
  const [completedSubjects, setCompletedSubjects] = useState([]);
  const [subjectDetails, setSubjectDetails] = useState({});
  const [vaultItems, setVaultItems] = useState([]);
  const [calendarEvents, setCalendarEvents] = useState([]);
  const [scheduleItems, setScheduleItems] = useState([]);
  const [availabilityItems, setAvailabilityItems] = useState([]);
  const [chatMessages, setChatMessages] = useState([]);
  const [customStreams, setCustomStreams] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // 1. Initialize Auth
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser && currentUser.isAnonymous) {
        await signOut(auth);
        setUser(null);
      } else {
        setUser(currentUser);
      }
      setIsLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const handleLogin = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (error) {
      console.error("Error logging in:", error);
      alert("No se pudo iniciar sesión. Verifica que el dominio esté autorizado en Firebase.\n\nDetalle técnico: " + error.message);
    }
  };

  const handleLogout = () => signOut(auth);

  // 2. Fetch Data
  useEffect(() => {
    if (!user) return;

    // A) Private Progress
    const progressRef = doc(db, 'artifacts', appId, 'users', user.uid, 'progress', 'main');
    const unsubProgress = onSnapshot(progressRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        setCompletedSubjects(data.subjects || []);
        setSubjectDetails(data.details || {});
      } else {
        setCompletedSubjects([]); 
        setSubjectDetails({});
      }
    });

    // B) Public Vault
    const vaultRef = collection(db, 'artifacts', appId, 'public', 'data', 'vault');
    const unsubVault = onSnapshot(vaultRef, (snapshot) => {
      const items = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      items.sort((a, b) => b.createdAt - a.createdAt);
      setVaultItems(items);
    });

    // C) Public Calendar
    const calRef = collection(db, 'artifacts', appId, 'public', 'data', 'calendar');
    const unsubCal = onSnapshot(calRef, (snapshot) => {
      const events = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      events.sort((a, b) => new Date(a.date) - new Date(b.date)); 
      setCalendarEvents(events);
    });

    // D) Public Schedule
    const schedRef = collection(db, 'artifacts', appId, 'public', 'data', 'schedule');
    const unsubSched = onSnapshot(schedRef, (snapshot) => {
      const items = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setScheduleItems(items);
    });

    // E) Public Availability
    const availRef = collection(db, 'artifacts', appId, 'public', 'data', 'availability');
    const unsubAvail = onSnapshot(availRef, (snapshot) => {
      const items = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setAvailabilityItems(items);
    });

    // F) Chat Messages
    const chatRef = collection(db, 'artifacts', appId, 'public', 'data', 'chat');
    const unsubChat = onSnapshot(chatRef, (snapshot) => {
      const msgs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      msgs.sort((a, b) => a.timestamp - b.timestamp);
      setChatMessages(msgs);
    });

    // G) Custom Streams
    const streamsRef = collection(db, 'artifacts', appId, 'public', 'data', 'streams');
    const unsubStreams = onSnapshot(streamsRef, (snapshot) => {
      const items = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setCustomStreams(items);
    });

    return () => {
      unsubProgress(); unsubVault(); unsubCal(); unsubSched(); unsubAvail(); unsubChat(); unsubStreams();
    };
  }, [user]);

  // --- Lógica de Materias ---
  const getSubjectStatus = (subject) => {
    const detail = subjectDetails[subject.id];
    if (detail?.status) return detail.status; 
    
    if (completedSubjects.includes(subject.id)) return 'aprobada';
    
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
    const isAprobada = ['aprobada', 'promocion', 'final'].includes(newDetails.status);
    let newCompleted = [...completedSubjects];
    
    if (isAprobada && !newCompleted.includes(subjectId)) {
      newCompleted.push(subjectId);
    } else if (!isAprobada && newCompleted.includes(subjectId)) {
      newCompleted = newCompleted.filter(id => id !== subjectId);
    }

    const newDetailsMap = { ...subjectDetails, [subjectId]: newDetails };
    setCompletedSubjects(newCompleted);
    setSubjectDetails(newDetailsMap);
    setSelectedSubjectModal(null);

    const progressRef = doc(db, 'artifacts', appId, 'users', user.uid, 'progress', 'main');
    await setDoc(progressRef, { subjects: newCompleted, details: newDetailsMap }, { merge: true });
  };

  const subjectsByGroup = useMemo(() => {
    const grouped = {};
    INITIAL_SUBJECTS.forEach(sub => {
      if (!grouped[sub.year]) grouped[sub.year] = { 1: [], 2: [] };
      grouped[sub.year][sub.semester].push(sub);
    });
    return grouped;
  }, []);

  // --- Cálculos ---
  const progressPercentage = Math.round((completedSubjects.length / INITIAL_SUBJECTS.length) * 100);

  const gpaCalculation = useMemo(() => {
    let totalScore = 0;
    let countedSubjects = 0;
    Object.values(subjectDetails).forEach(detail => {
      const status = detail.status;
      if (['aprobada', 'promocion', 'final'].includes(status)) {
        const grade = Number(detail.gradePromocion || detail.gradeFinal || detail.grade);
        if (grade && grade >= 1 && grade <= 10) {
          totalScore += grade;
          countedSubjects++;
        }
      }
    });
    return countedSubjects > 0 ? (totalScore / countedSubjects).toFixed(2) : '0.00';
  }, [subjectDetails]);

  // PANTALLA DE CARGA
  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center bg-slate-50 text-teal-600 font-semibold text-xl animate-pulse">Cargando Comunidad...</div>;
  }

  // PANTALLA DE LOGIN
  if (!user) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="bg-white p-8 rounded-2xl shadow-xl max-w-md w-full text-center border-t-4 border-teal-500">
          <div className="bg-teal-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
            <GraduationCap size={40} className="text-teal-600" />
          </div>
          <h1 className="text-3xl font-bold text-slate-800 mb-2">Comunidad Estudiantil</h1>
          <p className="text-slate-500 mb-8">Inicia sesión para guardar tu progreso, sincronizar tus notas y acceder a la comunidad de tu facultad.</p>
          
          <button 
            onClick={handleLogin}
            className="w-full bg-white border-2 border-slate-200 text-slate-700 font-bold py-3 px-4 rounded-xl hover:bg-slate-50 hover:border-teal-400 transition-all flex items-center justify-center gap-3 shadow-sm"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
            </svg>
            Entrar con Google
          </button>
        </div>
      </div>
    );
  }

  // PANTALLA PRINCIPAL
  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans pb-12">
      {/* HEADER */}
      <header className="bg-gradient-to-r from-teal-600 to-emerald-600 text-white shadow-lg sticky top-0 z-20 border-b border-teal-700/50">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            
            <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-start">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white/20 backdrop-blur-sm rounded-lg shadow-sm">
                  <GraduationCap size={28} />
                </div>
                <div>
                  <h1 className="text-xl md:text-2xl font-bold tracking-tight text-white drop-shadow-sm leading-none">Comunidad Estudiantil</h1>
                  <span className="text-teal-100 text-xs font-medium flex items-center gap-2 mt-1">
                    {user.photoURL ? (
                      <img src={user.photoURL} alt="avatar" className="w-5 h-5 rounded-full border border-teal-200" />
                    ) : (
                      <User size={14} className="bg-teal-500 rounded-full p-0.5" />
                    )}
                    Hola, {user.displayName?.split(' ')[0] || 'Estudiante'}
                  </span>
                </div>
              </div>
              
              <button onClick={handleLogout} className="md:hidden p-2 text-teal-100 hover:text-white" title="Cerrar sesión">
                <LogOut size={20} />
              </button>
            </div>
            
            <div className="flex items-center gap-4 w-full md:w-auto bg-black/10 backdrop-blur-md p-3 rounded-xl border border-white/10 shadow-inner">
              
              {/* Bloque Promedio */}
              <div className="hidden sm:flex flex-col items-center justify-center pr-4 border-r border-white/20">
                <span className="text-[10px] text-teal-100 uppercase tracking-wider font-bold">Promedio</span>
                <span className="text-xl font-black text-white">{gpaCalculation}</span>
              </div>

              {/* Bloque Progreso */}
              <div className="flex-1 md:w-56">
                <div className="flex justify-between text-xs mb-1.5 font-medium text-teal-50 uppercase tracking-wider">
                  <span>Avance General</span>
                  <span>{progressPercentage}%</span>
                </div>
                <div className="w-full bg-black/20 rounded-full h-2.5 overflow-hidden border border-black/10">
                  <div 
                    className="bg-gradient-to-r from-green-400 to-emerald-300 h-full rounded-full transition-all duration-500 ease-out shadow-[0_0_10px_rgba(52,211,153,0.5)]"
                    style={{ width: `${progressPercentage}%` }}
                  ></div>
                </div>
              </div>

              <button onClick={handleLogout} className="hidden md:flex p-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors text-white shadow-sm hover:shadow backdrop-blur-sm" title="Cerrar sesión">
                <LogOut size={18} />
              </button>
            </div>
          </div>

          {/* TAB NAVIGATION */}
          <div className="flex gap-2 mt-6 overflow-x-auto pb-0 hide-scrollbar items-end">
            <TabButton active={activeTab === 'plan'} onClick={() => setActiveTab('plan')} icon={<BookOpen size={18} />} label="Mi Plan" />
            <TabButton active={activeTab === 'vault'} onClick={() => setActiveTab('vault')} icon={<Folder size={18} />} label="Bóveda" />
            <TabButton active={activeTab === 'calendar'} onClick={() => setActiveTab('calendar')} icon={<CalendarDays size={18} />} label="Calendario" />
            <TabButton active={activeTab === 'schedule'} onClick={() => setActiveTab('schedule')} icon={<Clock size={18} />} label="Horarios" />
            <TabButton active={activeTab === 'chat'} onClick={() => setActiveTab('chat')} icon={<MessageSquare size={18} />} label="Sala de Chat" />
            <TabButton active={activeTab === 'focus'} onClick={() => setActiveTab('focus')} icon={<Headphones size={18} />} label="Música" />
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8">
        {activeTab === 'plan' && (
          <PlanView 
            subjectsByGroup={subjectsByGroup} completedSubjects={completedSubjects} subjectDetails={subjectDetails}
            getSubjectStatus={getSubjectStatus} onSubjectClick={handleSubjectClick}
          />
        )}
        {activeTab === 'vault' && <VaultView user={user} vaultItems={vaultItems} subjects={INITIAL_SUBJECTS} />}
        {/* Le pasamos subjectDetails al Calendario para que sepa qué estamos cursando */}
        {activeTab === 'calendar' && <CalendarView user={user} calendarEvents={calendarEvents} subjects={INITIAL_SUBJECTS} subjectDetails={subjectDetails} />}
        {activeTab === 'schedule' && <ScheduleView user={user} scheduleItems={scheduleItems} availabilityItems={availabilityItems} subjects={INITIAL_SUBJECTS} subjectDetails={subjectDetails} />}
        {activeTab === 'chat' && <ChatView user={user} chatMessages={chatMessages} subjectDetails={subjectDetails} subjects={INITIAL_SUBJECTS} />}
        {activeTab === 'focus' && <FocusView user={user} activeStream={activeStream} setActiveStream={setActiveStream} customStreams={customStreams} />}
      </main>

      {/* REPRODUCTOR GLOBAL FLOTANTE */}
      {activeStream && (
        <div className="fixed bottom-4 right-4 bg-slate-900 text-white p-3 rounded-2xl shadow-2xl border border-slate-700 flex flex-col items-center z-50 animate-in slide-in-from-bottom-5">
           <div className="flex justify-between w-full items-center mb-2 px-1">
             <div className="flex items-center gap-2">
               <Radio size={14} className="text-emerald-400 animate-pulse" />
               <span className="text-xs font-bold text-slate-300 truncate max-w-[150px]">{activeStream.title}</span>
             </div>
             <button onClick={() => setActiveStream(null)} className="text-slate-400 hover:text-white"><X size={16}/></button>
           </div>
           {/* Iframe pequeño */}
           <div className="w-56 h-32 rounded-xl overflow-hidden bg-black">
             <iframe width="100%" height="100%" src={activeStream.url} title="Radio" frameBorder="0" allow="autoplay; clipboard-write; encrypted-media; picture-in-picture"></iframe>
           </div>
        </div>
      )}

      {/* MODAL DE MATERIAS */}
      {selectedSubjectModal && (
        <SubjectDetailsModal 
          subject={selectedSubjectModal} currentDetails={subjectDetails[selectedSubjectModal.id] || {}}
          onSave={(details) => handleSaveSubjectDetails(selectedSubjectModal.id, details)} onClose={() => setSelectedSubjectModal(null)}
        />
      )}
    </div>
  );
}

function TabButton({ active, onClick, icon, label }) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2 px-4 py-3 font-medium transition-all text-sm whitespace-nowrap
        ${active ? 'bg-slate-50 text-teal-800 border-t-4 border-teal-500 rounded-t-xl shadow-md' 
                 : 'bg-white/10 text-teal-50 hover:bg-white/20 hover:text-white rounded-t-lg backdrop-blur-sm mb-1'}
      `}
    >
      {icon} {label}
    </button>
  );
}

// ==========================================
// VIEW: PLAN DE ESTUDIOS
// ==========================================
function PlanView({ subjectsByGroup, completedSubjects, subjectDetails, getSubjectStatus, onSubjectClick }) {
  return (
    <>
      {/* LEYENDA COLORES DEL BOCETO */}
      <div className="flex flex-wrap justify-center gap-3 mb-10 text-xs md:text-sm">
        <div className="flex items-center gap-2 px-3 py-1 bg-white rounded-full shadow-sm border border-slate-200">
          <div className="w-3 h-3 rounded-full bg-emerald-600"></div><span className="font-bold text-slate-700">Promocionada</span>
        </div>
        <div className="flex items-center gap-2 px-3 py-1 bg-white rounded-full shadow-sm border border-slate-200">
          <div className="w-3 h-3 rounded-full bg-green-400"></div><span className="font-bold text-slate-700">Aprobada</span>
        </div>
        <div className="flex items-center gap-2 px-3 py-1 bg-white rounded-full shadow-sm border border-slate-200">
          <div className="w-3 h-3 rounded-full bg-blue-500"></div><span className="font-bold text-slate-700">Regular</span>
        </div>
        <div className="flex items-center gap-2 px-3 py-1 bg-white rounded-full shadow-sm border border-slate-200">
          <div className="w-3 h-3 rounded-full bg-yellow-400"></div><span className="font-bold text-slate-700">Cursando</span>
        </div>
        <div className="flex items-center gap-2 px-3 py-1 bg-white rounded-full shadow-sm border border-slate-200">
          <div className="w-3 h-3 rounded-full bg-red-500"></div><span className="font-bold text-slate-700">Pérdida/Libre</span>
        </div>
        <div className="flex items-center gap-2 px-3 py-1 bg-white rounded-full shadow-sm border border-teal-300 ring-2 ring-teal-50">
          <div className="w-3 h-3 rounded-full bg-white border-2 border-teal-500"></div><span className="font-bold text-teal-700">Disponible</span>
        </div>
        <div className="flex items-center gap-2 px-3 py-1 bg-white rounded-full shadow-sm border border-slate-200 opacity-70">
          <div className="w-3 h-3 rounded-full bg-slate-300"></div><span className="font-medium text-slate-500">Bloqueada</span>
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
                  <Calendar size={16} /><span>1er Cuatrimestre</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {semesters[1].map(sub => <SubjectCardWrapper key={sub.id} subject={sub} subjectDetails={subjectDetails} completedSubjects={completedSubjects} onToggle={onSubjectClick} getSubjectStatus={getSubjectStatus} />)}
                </div>
              </div>
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-teal-700 font-semibold mb-2 bg-teal-50 w-fit px-3 py-1 rounded-md">
                  <Calendar size={16} /><span>2do Cuatrimestre</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {semesters[2].map(sub => <SubjectCardWrapper key={sub.id} subject={sub} subjectDetails={subjectDetails} completedSubjects={completedSubjects} onToggle={onSubjectClick} getSubjectStatus={getSubjectStatus} />)}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}

function SubjectCardWrapper({ subject, subjectDetails, completedSubjects, onToggle, getSubjectStatus }) {
  const status = getSubjectStatus(subject);
  const detail = subjectDetails[subject.id];
  
  // Calcular correlativas faltantes
  const missingPrereqsNames = subject.prereqs.filter(preId => {
    const preStatus = subjectDetails[preId]?.status;
    return !(completedSubjects.includes(preId) || ['aprobada', 'promocion', 'final'].includes(preStatus));
  }).map(id => INITIAL_SUBJECTS.find(s => s.id === id)?.name);

  return <SubjectCard subject={subject} status={status} detail={detail} missingPrereqs={missingPrereqsNames} onToggle={() => onToggle(subject.id, status)} />;
}

// TARJETA DE MATERIA CON COLORES EXACTOS AL BOCETO
function SubjectCard({ subject, status, detail, missingPrereqs, onToggle }) {
  const isLocked = status === 'locked';
  const isPromocion = status === 'promocion';
  const isAprobada = status === 'aprobada' || status === 'final';
  const isRegular = status === 'regular';
  const isCursando = status === 'cursando';
  const isPerdida = status === 'perdida';
  const isAvailable = status === 'available';

  // Nota definitiva en AZUL
  const finalGrade = detail?.gradePromocion || detail?.gradeFinal || detail?.grade;

  return (
    <div 
      onClick={onToggle}
      className={`
        relative p-3 rounded-xl border transition-all duration-200 cursor-pointer select-none group flex flex-col h-full min-h-[100px] shadow-sm
        ${isLocked ? 'bg-slate-50/50 border-slate-200 hover:bg-slate-100' : ''}
        ${isPromocion ? 'bg-emerald-600 border-emerald-700 text-white shadow-md' : ''}
        ${isAprobada ? 'bg-green-100 border-green-400 text-green-900' : ''}
        ${isRegular ? 'bg-blue-100 border-blue-400 text-blue-900' : ''}
        ${isCursando ? 'bg-yellow-100 border-yellow-400 text-yellow-900' : ''}
        ${isPerdida ? 'bg-red-100 border-red-400 text-red-900' : ''}
        ${isAvailable ? 'bg-white border-teal-300 ring-2 ring-teal-50 hover:ring-teal-100 hover:border-teal-400 shadow-md hover:-translate-y-0.5' : ''}
      `}
    >
      <div className="flex justify-between items-start gap-2 mb-1">
        <h3 className={`font-semibold text-sm leading-snug ${isLocked ? 'text-slate-400' : isPromocion ? 'text-white' : 'text-slate-800'}`}>{subject.name}</h3>
        <div className={`shrink-0 p-1 rounded-full transition-colors mt-0.5
          ${isPromocion ? 'bg-white/20 text-white' : ''}
          ${isAprobada ? 'bg-green-500 text-white' : ''}
          ${isRegular ? 'bg-blue-500 text-white' : ''}
          ${isCursando ? 'bg-yellow-400 text-white' : ''}
          ${isPerdida ? 'bg-red-500 text-white' : ''}
          ${isAvailable ? 'bg-teal-100 text-teal-600' : ''}
          ${isLocked ? 'text-slate-300' : ''}
        `}>
          {isPromocion && <Trophy size={14} strokeWidth={2.5} />}
          {isAprobada && <Check size={14} strokeWidth={3} />}
          {isRegular && <FileText size={14} strokeWidth={2} />}
          {isCursando && <BookOpen size={14} strokeWidth={2} />}
          {isPerdida && <XCircle size={14} strokeWidth={2} />}
          {isAvailable && <Unlock size={14} />}
          {isLocked && <Lock size={14} />}
        </div>
      </div>

      {/* DETALLES DE NOTAS */}
      <div className="mt-2 space-y-1">
        {(isRegular || isAprobada) && detail?.gradeCursada && (
          <div className={`text-[10px] font-bold px-2 py-0.5 rounded w-fit ${isPromocion ? 'bg-white/20 text-emerald-50' : 'bg-white/50 text-slate-600'}`}>Cursada: {detail.gradeCursada}</div>
        )}
        
        {/* NOTA DEFINITIVA EN AZUL CLARO (o blanco si el fondo es oscuro) */}
        {finalGrade && (
          <div className={`text-xs font-black px-2 py-0.5 rounded w-fit uppercase tracking-wide border ${isPromocion ? 'bg-white text-emerald-700 border-emerald-200' : 'bg-blue-50 text-blue-600 border-blue-200'}`}>
            Definitiva: {finalGrade}
          </div>
        )}
      </div>
      
      {isLocked && missingPrereqs && missingPrereqs.length > 0 && (
        <div className="mt-auto pt-2">
          <div className="flex items-center gap-1 text-[10px] uppercase font-bold text-red-400 mb-0.5">
            <AlertCircle size={10} /><span>Falta correlativa</span>
          </div>
          <p className="text-[10px] text-slate-500 leading-tight">
            {missingPrereqs[0]} {missingPrereqs.length > 1 && `+ ${missingPrereqs.length - 1} más`}
          </p>
        </div>
      )}
    </div>
  );
}

// ==========================================
// MODAL DETALLES DE MATERIA (COMPLETO DEL BOCETO)
// ==========================================
function SubjectDetailsModal({ subject, currentDetails, onSave, onClose }) {
  const [formData, setFormData] = useState({
    status: currentDetails.status || 'pendiente',
    gradeCursada: currentDetails.gradeCursada || '',
    gradeFinal: currentDetails.gradeFinal || '',
    gradePromocion: currentDetails.gradePromocion || currentDetails.grade || '',
    profesorName: currentDetails.profesorName || '',
    profesorContact: currentDetails.profesorContact || '',
    aula: currentDetails.aula || '',
    creditos: currentDetails.creditos || ''
  });

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-xl overflow-hidden flex flex-col max-h-[90vh]">
        <div className="bg-gradient-to-r from-teal-600 to-emerald-600 px-6 py-4 flex justify-between items-center text-white shrink-0 shadow-sm">
          <div><span className="text-teal-100 text-xs font-bold uppercase tracking-wider block">Ficha de la Materia</span><h2 className="text-lg font-bold pr-4">{subject.name}</h2></div>
          <button onClick={onClose} className="p-2 hover:bg-white/20 rounded-full transition-colors"><X size={20} /></button>
        </div>
        
        <div className="p-6 overflow-y-auto bg-slate-50">
          <form id="subject-form" onSubmit={(e) => { e.preventDefault(); onSave(formData); }} className="space-y-6">
            
            {/* SECCIÓN 1: ESTADO Y NOTAS */}
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
              <h3 className="text-xs font-bold text-teal-600 uppercase tracking-wider mb-3 border-b pb-2">Progreso Académico</h3>
              <div className="mb-4">
                <label className="block text-sm font-bold text-slate-700 mb-2">Estado Actual</label>
                <select className="w-full px-3 py-2.5 bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 font-medium text-slate-700" value={formData.status} onChange={e => setFormData({...formData, status: e.target.value})}>
                  <option value="pendiente">⚪ Pendiente (Disponible)</option>
                  <option value="cursando">🟡 Cursando actualmente</option>
                  <option value="regular">🔵 Regularizada (Falta final)</option>
                  <option value="promocion">🌲 Aprobada por Promoción (8 o más)</option>
                  <option value="final">🟢 Aprobada con Examen Final</option>
                  <option value="perdida">🔴 Pérdida / Libre</option>
                </select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {(formData.status === 'regular' || formData.status === 'final') && (
                  <div className={formData.status === 'regular' ? 'sm:col-span-2' : ''}>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Nota Cursada</label>
                    <input type="number" min="1" max="10" className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-teal-500 bg-slate-50" value={formData.gradeCursada} onChange={e => setFormData({...formData, gradeCursada: e.target.value})} />
                  </div>
                )}
                {formData.status === 'final' && (
                  <div>
                    <label className="block text-sm font-bold text-blue-600 mb-1">Nota Definitiva (Final)</label>
                    <input type="number" min="1" max="10" className="w-full px-3 py-2 border-2 border-blue-200 rounded-lg focus:ring-2 focus:ring-blue-500 bg-blue-50 font-bold" value={formData.gradeFinal} onChange={e => setFormData({...formData, gradeFinal: e.target.value})} />
                  </div>
                )}
                {(formData.status === 'promocion' || formData.status === 'aprobada') && (
                  <div className="sm:col-span-2">
                    <label className="block text-sm font-bold text-blue-600 mb-1">Nota Definitiva (Promoción)</label>
                    <input type="number" min="1" max="10" className="w-full px-3 py-2 border-2 border-blue-200 rounded-lg focus:ring-2 focus:ring-blue-500 bg-blue-50 font-bold" value={formData.gradePromocion} onChange={e => setFormData({...formData, gradePromocion: e.target.value})} />
                  </div>
                )}
              </div>
            </div>

            {/* SECCIÓN 2: INFO DE LA MATERIA (DEL BOCETO) */}
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
              <h3 className="text-xs font-bold text-teal-600 uppercase tracking-wider mb-3 border-b pb-2">Información del Profesor y Cursada</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-slate-700 mb-1">Profesor/a (Nombre)</label>
                  <input type="text" placeholder="Ej: Lic. María González" className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-teal-500 bg-slate-50" value={formData.profesorName} onChange={e => setFormData({...formData, profesorName: e.target.value})} />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-slate-700 mb-1">Teléfono / Correo / Link</label>
                  <input type="text" placeholder="Correo o link al campus" className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-teal-500 bg-slate-50" value={formData.profesorContact} onChange={e => setFormData({...formData, profesorContact: e.target.value})} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Créditos / Horas</label>
                  <input type="text" placeholder="Ej: 4 Créditos" className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-teal-500 bg-slate-50" value={formData.creditos} onChange={e => setFormData({...formData, creditos: e.target.value})} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Aula Física/Virtual</label>
                  <input type="text" placeholder="Ej: Aula 5 / Zoom" className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-teal-500 bg-slate-50" value={formData.aula} onChange={e => setFormData({...formData, aula: e.target.value})} />
                </div>
              </div>
            </div>

          </form>
        </div>
        <div className="p-4 border-t border-slate-200 bg-white flex justify-end gap-3 shrink-0">
          <button onClick={onClose} className="px-5 py-2 font-medium hover:bg-slate-100 rounded-lg text-slate-600 transition-colors">Cancelar</button>
          <button type="submit" form="subject-form" className="px-6 py-2 bg-teal-600 text-white font-bold rounded-lg hover:bg-teal-700 transition-colors flex items-center gap-2"><Save size={18}/> Guardar Ficha</button>
        </div>
      </div>
    </div>
  );
}

// ==========================================
// VIEW: BÓVEDA DE APUNTES
// ==========================================
function VaultView({ user, vaultItems, subjects }) {
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ title: '', link: '', subjectId: subjects[0].id });

  const handleAdd = async (e) => {
    e.preventDefault();
    let finalLink = formData.link.startsWith('http') ? formData.link : 'https://' + formData.link;
    await addDoc(collection(db, 'artifacts', appId, 'public', 'data', 'vault'), { title: formData.title, link: finalLink, subjectId: formData.subjectId, authorId: user.uid, createdAt: Date.now() });
    setFormData({ title: '', link: '', subjectId: subjects[0].id }); setShowForm(false);
  };

  return (
    <div className="max-w-4xl mx-auto"><div className="flex justify-between items-center mb-6"><div><h2 className="text-2xl font-bold">Bóveda de Apuntes</h2><p className="text-sm text-slate-500">Comparte resúmenes y parciales viejos.</p></div><button onClick={() => setShowForm(!showForm)} className="bg-teal-600 text-white px-4 py-2 rounded-lg hover:bg-teal-700 transition-colors"><Plus size={18} className="inline mr-2"/>Compartir</button></div>
      {showForm && (
        <form onSubmit={handleAdd} className="bg-white p-5 rounded-xl border border-teal-200 mb-8 grid grid-cols-2 gap-4 shadow-sm">
          <input required placeholder="Título" className="border border-slate-300 p-2 rounded-lg col-span-1 focus:ring-2 focus:ring-teal-500" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} />
          <select className="border border-slate-300 p-2 rounded-lg col-span-1 focus:ring-2 focus:ring-teal-500" value={formData.subjectId} onChange={e => setFormData({...formData, subjectId: e.target.value})}>{subjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}</select>
          <input required placeholder="Enlace (Drive, Dropbox, etc)" className="border border-slate-300 p-2 rounded-lg col-span-2 focus:ring-2 focus:ring-teal-500" value={formData.link} onChange={e => setFormData({...formData, link: e.target.value})} />
          <button type="submit" className="col-span-2 bg-teal-50 text-teal-700 font-bold py-2 rounded-lg hover:bg-teal-100 transition-colors">Publicar</button>
        </form>
      )}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {vaultItems.map(item => (
          <div key={item.id} className="bg-white p-4 rounded-xl border border-slate-200 hover:shadow-md transition-shadow relative flex flex-col">
            <span className="text-[10px] font-bold uppercase tracking-wider bg-teal-50 text-teal-700 px-2 py-0.5 rounded w-fit">{subjects.find(s=>s.id===item.subjectId)?.name || 'General'}</span>
            {user.uid === item.authorId && <button onClick={() => deleteDoc(doc(db, 'artifacts', appId, 'public', 'data', 'vault', item.id))} className="absolute top-4 right-4 text-slate-300 hover:text-red-500"><Trash2 size={16}/></button>}
            <h3 className="font-semibold text-slate-800 mt-2 mb-4 line-clamp-2">{item.title}</h3>
            <div className="mt-auto">
              <a href={item.link} target="_blank" rel="noreferrer" className="flex items-center justify-center gap-2 w-full bg-slate-50 text-teal-700 font-medium py-2 rounded-lg border hover:bg-teal-50 hover:border-teal-200 transition-colors">Abrir Enlace <ExternalLink size={14}/></a>
            </div>
          </div>
        ))}
        {vaultItems.length === 0 && <div className="col-span-3 text-center py-12 bg-white rounded-xl border border-dashed border-slate-300 text-slate-500">No hay apuntes compartidos aún.</div>}
      </div>
    </div>
  );
}

// ==========================================
// VIEW: CALENDARIO COMPARTIDO (CON FILTROS)
// ==========================================
function CalendarView({ user, calendarEvents, subjects, subjectDetails }) {
  const [filterTab, setFilterTab] = useState('mis_fechas'); // 'mis_fechas' o 'general'
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ title: '', date: '', type: 'Exam', subjectId: subjects[0].id });

  const handleAdd = async (e) => {
    e.preventDefault();
    await addDoc(collection(db, 'artifacts', appId, 'public', 'data', 'calendar'), { ...formData, authorId: user.uid });
    setShowForm(false);
  };

  const todayStr = new Date().toISOString().split('T')[0];
  
  // Ordenar fechas futuras
  const upcomingEvents = calendarEvents.filter(e => e.date >= todayStr);
  
  // Filtrar solo las materias que el usuario tiene como "cursando"
  const myEvents = upcomingEvents.filter(e => subjectDetails[e.subjectId]?.status === 'cursando');
  
  // Elegir qué lista mostrar basado en la pestaña activa
  const displayedEvents = filterTab === 'mis_fechas' ? myEvents : upcomingEvents;

  return (
    <div className="max-w-4xl mx-auto animate-in fade-in duration-500">
      
      {/* BOTONES DE FILTRO SUPERIORES */}
      <div className="flex justify-center mb-8">
        <div className="bg-slate-200 p-1 rounded-xl inline-flex shadow-inner">
          <button onClick={() => { setFilterTab('mis_fechas'); setShowForm(false); }} className={`flex items-center gap-2 px-5 py-2.5 rounded-lg font-medium text-sm transition-all ${filterTab === 'mis_fechas' ? 'bg-white text-teal-700 shadow' : 'text-slate-600 hover:text-slate-800'}`}>
            <Calendar size={16} /> Mis Fechas
          </button>
          <button onClick={() => { setFilterTab('general'); setShowForm(false); }} className={`flex items-center gap-2 px-5 py-2.5 rounded-lg font-medium text-sm transition-all ${filterTab === 'general' ? 'bg-white text-teal-700 shadow' : 'text-slate-600 hover:text-slate-800'}`}>
            <Users size={16} /> Calendario General
          </button>
        </div>
      </div>

      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">{filterTab === 'mis_fechas' ? 'Mis Fechas Importantes' : 'Calendario de la Comunidad'}</h2>
          <p className="text-sm text-slate-500">
            {filterTab === 'mis_fechas' ? 'Eventos de las materias que estás cursando.' : 'Todas las fechas cargadas por estudiantes.'}
          </p>
        </div>
        <button onClick={() => setShowForm(!showForm)} className="bg-teal-600 text-white px-4 py-2 rounded-lg hover:bg-teal-700 transition-colors shadow-sm flex items-center gap-2 font-medium">
          {showForm ? <X size={18}/> : <Plus size={18}/>} 
          <span className="hidden sm:inline">{showForm ? 'Cancelar' : 'Agendar'}</span>
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleAdd} className="bg-white p-5 rounded-xl border border-teal-200 mb-8 grid grid-cols-2 gap-4 shadow-md">
          <input required placeholder="Título del evento" className="border border-slate-300 p-2 rounded-lg col-span-2 focus:ring-2 focus:ring-teal-500 outline-none" onChange={e => setFormData({...formData, title: e.target.value})} />
          <select className="border border-slate-300 p-2 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none" onChange={e => setFormData({...formData, type: e.target.value})}>
            <option value="Exam">Examen / Parcial</option>
            <option value="TP">Trabajo Práctico</option>
            <option value="Exposicion">Exposición / Presentación</option>
          </select>
          <input type="date" required className="border border-slate-300 p-2 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none" onChange={e => setFormData({...formData, date: e.target.value})} />
          <select className="border border-slate-300 p-2 rounded-lg col-span-2 focus:ring-2 focus:ring-teal-500 outline-none" onChange={e => setFormData({...formData, subjectId: e.target.value})}>{subjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}</select>
          <button type="submit" className="col-span-2 bg-teal-50 text-teal-700 font-bold py-2.5 rounded-lg hover:bg-teal-100 transition-colors border border-teal-100">Guardar Fecha</button>
        </form>
      )}
      
      <div className="space-y-3">
        {displayedEvents.map(ev => {
           const isExam = ev.type === 'Exam';
           const isExpo = ev.type === 'Exposicion';
           const dateObj = new Date(ev.date + "T00:00:00");
           return (
            <div key={ev.id} className={`bg-white rounded-xl border flex relative overflow-hidden shadow-sm hover:shadow-md transition-shadow group ${isExam ? 'border-orange-200' : isExpo ? 'border-purple-200' : 'border-blue-200'}`}>
              {user.uid === ev.authorId && (
                <button onClick={() => deleteDoc(doc(db, 'artifacts', appId, 'public', 'data', 'calendar', ev.id))} className="absolute top-4 right-4 text-slate-300 hover:text-red-500 hover:bg-red-50 p-1.5 rounded-full transition-all opacity-0 group-hover:opacity-100">
                  <Trash2 size={16}/>
                </button>
              )}
              <div className={`w-24 flex flex-col items-center justify-center border-r p-3 shrink-0 ${isExam ? 'bg-orange-50 border-orange-100' : isExpo ? 'bg-purple-50 border-purple-100' : 'bg-blue-50 border-blue-100'}`}>
                <span className={`text-xs font-bold uppercase ${isExam ? 'text-orange-600' : isExpo ? 'text-purple-600' : 'text-blue-600'}`}>{dateObj.toLocaleDateString('es-ES', { month: 'short' })}</span>
                <span className={`text-2xl font-black ${isExam ? 'text-orange-700' : isExpo ? 'text-purple-700' : 'text-blue-700'}`}>{dateObj.getDate()}</span>
              </div>
              <div className="pl-4 py-3 pr-10 flex flex-col justify-center w-full">
                <div className="flex items-center gap-2 mb-1">
                  <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${isExam ? 'bg-orange-100 text-orange-700' : isExpo ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'}`}>{isExam ? 'Examen' : isExpo ? 'Exposición' : 'Entrega'}</span>
                </div>
                <h4 className="font-bold text-slate-800 leading-tight mb-0.5">{ev.title}</h4>
                <p className="text-sm text-slate-500 truncate">{subjects.find(s=>s.id===ev.subjectId)?.name}</p>
              </div>
            </div>
          )
        })}
        {displayedEvents.length === 0 && (
          <div className="text-center py-16 bg-white rounded-xl border border-dashed border-slate-300 flex flex-col items-center justify-center">
            <CalendarDays size={40} className="text-slate-300 mb-3" />
            <p className="text-slate-500 font-medium">No hay eventos próximos.</p>
            {filterTab === 'mis_fechas' && <p className="text-xs text-slate-400 mt-1 max-w-sm">Si tienes una fecha importante, agéndala usando el botón de arriba.</p>}
          </div>
        )}
      </div>
    </div>
  );
}

// ==========================================
// VIEW: HORARIOS Y DISPONIBILIDAD (PERSONALIZADOS)
// ==========================================
function ScheduleView({ user, scheduleItems, availabilityItems, subjects, subjectDetails }) {
  const [subTab, setSubTab] = useState('classes'); 
  const [showForm, setShowForm] = useState(false);
  const [groupFilter, setGroupFilter] = useState(''); // Nuevo filtro de búsqueda para grupos
  
  const [classFormData, setClassFormData] = useState({ subjectId: subjects[0].id, dayOfWeek: 'Lunes', startTime: '14:00', endTime: '16:00', classroom: '' });
  const [availFormData, setAvailFormData] = useState({ userName: user.displayName || '', groupName: '', dayOfWeek: 'Lunes', startTime: '16:00', endTime: '18:00' });

  // Solo de Lunes a Viernes
  const DAYS = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes'];

  // FILTRO 1: Mis Materias
  // Revisa la base de datos general y devuelve SOLO los horarios de las materias que marco como "Cursando"
  const myClassItems = useMemo(() => {
    return scheduleItems.filter(item => subjectDetails[item.subjectId]?.status === 'cursando');
  }, [scheduleItems, subjectDetails]);

  // FILTRO 2: Mi Grupo de TP
  // Si hay algo escrito en el buscador, muestra solo los horarios de ese grupo específico
  const myGroupItems = useMemo(() => {
    if (!groupFilter.trim()) return availabilityItems;
    return availabilityItems.filter(item => item.groupName?.toLowerCase() === groupFilter.trim().toLowerCase());
  }, [availabilityItems, groupFilter]);

  const handleAddSchedule = async (e) => {
    e.preventDefault();
    if (!classFormData.startTime || !classFormData.endTime) return;
    await addDoc(collection(db, 'artifacts', appId, 'public', 'data', 'schedule'), { ...classFormData, authorId: user.uid, createdAt: Date.now() });
    setClassFormData({ ...classFormData, classroom: '' }); setShowForm(false);
  };

  const handleAddAvailability = async (e) => {
    e.preventDefault();
    if (!availFormData.startTime || !availFormData.endTime || !availFormData.userName || !availFormData.groupName) return;
    await addDoc(collection(db, 'artifacts', appId, 'public', 'data', 'availability'), { ...availFormData, authorId: user.uid, createdAt: Date.now() });
    setShowForm(false);
  };

  const handleDelete = async (id, authorId, type) => {
    if (user.uid !== authorId) return; 
    await deleteDoc(doc(db, 'artifacts', appId, 'public', 'data', type, id));
  };

  return (
    <div className="max-w-6xl mx-auto animate-in fade-in duration-500">
      <div className="flex justify-center mb-8">
        <div className="bg-slate-200 p-1 rounded-xl inline-flex shadow-inner">
          <button onClick={() => { setSubTab('classes'); setShowForm(false); }} className={`flex items-center gap-2 px-5 py-2.5 rounded-lg font-medium text-sm transition-all ${subTab === 'classes' ? 'bg-white text-teal-700 shadow' : 'text-slate-600 hover:text-slate-800'}`}><Clock size={16} /> Mis Horarios de Cursada</button>
          <button onClick={() => { setSubTab('availability'); setShowForm(false); }} className={`flex items-center gap-2 px-5 py-2.5 rounded-lg font-medium text-sm transition-all ${subTab === 'availability' ? 'bg-white text-green-700 shadow' : 'text-slate-600 hover:text-slate-800'}`}><Users size={16} /> Disponibilidad de Grupos</button>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">{subTab === 'classes' ? 'Mis Horarios de Cursada' : 'Disponibilidad para Trabajos'}</h2>
          <p className="text-sm text-slate-500 mt-1">
            {subTab === 'classes' 
              ? 'Aquí verás exclusivamente los horarios de las materias que tienes marcadas como "Cursando".' 
              : 'Escribe el nombre de tu grupo para ver cuándo pueden juntarse a hacer TPs.'}
          </p>
        </div>
        
        <div className="flex items-center gap-3 w-full sm:w-auto">
          {/* BUSCADOR DE GRUPOS */}
          {subTab === 'availability' && !showForm && (
            <div className="relative flex-1 sm:w-64">
              <Users size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input 
                type="text" placeholder="Ej: Grupo Los Pumas" 
                className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500 outline-none text-sm font-medium"
                value={groupFilter} onChange={e => setGroupFilter(e.target.value)}
              />
            </div>
          )}
          <button onClick={() => setShowForm(!showForm)} className={`shrink-0 ${subTab === 'classes' ? 'bg-teal-600 hover:bg-teal-700' : 'bg-green-600 hover:bg-green-700'} text-white px-4 py-2 rounded-lg font-medium flex items-center gap-2 transition-colors shadow-sm`}>
            {showForm ? <X size={18}/> : <Plus size={18}/>} 
            <span className="hidden sm:inline">{showForm ? 'Cancelar' : 'Agregar'}</span>
          </button>
        </div>
      </div>

      {showForm && subTab === 'classes' && (
        <form onSubmit={handleAddSchedule} className="bg-white p-5 rounded-xl shadow-md border border-slate-200 mb-8 border-t-4 border-t-teal-500">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div className="md:col-span-3">
              <label className="block text-sm font-medium mb-1">Materia (Cargar horario general)</label>
              <select className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-teal-500" value={classFormData.subjectId} onChange={e => setClassFormData({...classFormData, subjectId: e.target.value})}>{subjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}</select>
            </div>
            <div><label className="block text-sm font-medium mb-1">Día</label><select className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-teal-500" value={classFormData.dayOfWeek} onChange={e => setClassFormData({...classFormData, dayOfWeek: e.target.value})}>{DAYS.map(d => <option key={d} value={d}>{d}</option>)}</select></div>
            <div><label className="block text-sm font-medium mb-1">Desde - Hasta</label><div className="flex items-center gap-2"><input type="time" required className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-teal-500" value={classFormData.startTime} onChange={e => setClassFormData({...classFormData, startTime: e.target.value})}/><span>-</span><input type="time" required className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-teal-500" value={classFormData.endTime} onChange={e => setClassFormData({...classFormData, endTime: e.target.value})}/></div></div>
            <div><label className="block text-sm font-medium mb-1">Aula</label><input type="text" placeholder="Ej: Aula 5" className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-teal-500" value={classFormData.classroom} onChange={e => setClassFormData({...classFormData, classroom: e.target.value})}/></div>
          </div>
          <button type="submit" className="w-full bg-teal-50 text-teal-700 font-bold py-2 rounded-lg">Cargar Clase al Sistema</button>
        </form>
      )}

      {showForm && subTab === 'availability' && (
        <form onSubmit={handleAddAvailability} className="bg-white p-5 rounded-xl shadow-md border border-slate-200 mb-8 border-t-4 border-t-green-500">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div><label className="block text-sm font-medium mb-1">Tu Nombre</label><input type="text" required placeholder="Tu Nombre" className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-green-500" value={availFormData.userName} onChange={e => setAvailFormData({...availFormData, userName: e.target.value})}/></div>
            <div><label className="block text-sm font-medium mb-1">Nombre de tu Grupo (Exacto)</label><input type="text" required placeholder="Ej: Grupo Los Pumas" className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-green-500" value={availFormData.groupName} onChange={e => setAvailFormData({...availFormData, groupName: e.target.value})}/></div>
            <div><label className="block text-sm font-medium mb-1">Día Libre</label><select className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-green-500" value={availFormData.dayOfWeek} onChange={e => setAvailFormData({...availFormData, dayOfWeek: e.target.value})}>{DAYS.map(d => <option key={d} value={d}>{d}</option>)}</select></div>
            <div><label className="block text-sm font-medium mb-1">Desde - Hasta</label><div className="flex items-center gap-2"><input type="time" required className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-green-500" value={availFormData.startTime} onChange={e => setAvailFormData({...availFormData, startTime: e.target.value})}/><span>-</span><input type="time" required className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-green-500" value={availFormData.endTime} onChange={e => setAvailFormData({...availFormData, endTime: e.target.value})}/></div></div>
          </div>
          <button type="submit" className="w-full bg-green-50 text-green-700 font-bold py-2 rounded-lg">Publicar mi Disponibilidad</button>
        </form>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        {DAYS.map(day => {
          // Usamos nuestras nuevas listas filtradas en lugar de las globales
          const dayItems = (subTab === 'classes' ? myClassItems : myGroupItems)
            .filter(item => item.dayOfWeek === day)
            .sort((a, b) => a.startTime.localeCompare(b.startTime));

          return (
            <div key={day} className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden flex flex-col min-h-[150px]">
              <div className={`${subTab === 'classes' ? 'bg-slate-100' : 'bg-green-50'} py-2 text-center border-b border-slate-200`}><h3 className={`font-bold uppercase text-sm tracking-wider ${subTab === 'classes' ? 'text-slate-700' : 'text-green-800'}`}>{day}</h3></div>
              <div className="p-3 flex-1 bg-slate-50/50 space-y-3">
                {dayItems.length === 0 ? <p className="text-center text-xs text-slate-400 py-4 italic">Libre</p> : dayItems.map(item => {
                  const isOwner = user?.uid === item.authorId;
                  if (subTab === 'classes') {
                    const subject = subjects.find(s => s.id === item.subjectId);
                    return (
                      <div key={item.id} className="bg-white p-3 rounded-lg shadow-sm border border-teal-100 relative group">
                        {isOwner && <button onClick={() => handleDelete(item.id, item.authorId, 'schedule')} className="absolute top-2 right-2 text-slate-300 hover:text-red-500"><Trash2 size={14} /></button>}
                        <div className="text-xs font-bold text-teal-600 mb-1 flex items-center gap-1"><Clock size={12} /> {item.startTime} - {item.endTime}</div>
                        <h4 className="text-sm font-semibold text-slate-800 leading-tight pr-4">{subject ? subject.name : 'Materia'}</h4>
                        {item.classroom && <p className="text-xs text-slate-500 mt-1">📍 {item.classroom}</p>}
                      </div>
                    );
                  } else {
                    return (
                      <div key={item.id} className="bg-white p-3 rounded-lg shadow-sm border border-green-200 relative group">
                        {isOwner && <button onClick={() => handleDelete(item.id, item.authorId, 'availability')} className="absolute top-2 right-2 text-slate-300 hover:text-red-500"><Trash2 size={14} /></button>}
                        <div className="text-xs font-bold text-green-700 mb-1 flex items-center gap-1"><Clock size={12} /> {item.startTime} - {item.endTime}</div>
                        <h4 className="text-sm font-semibold text-slate-800 flex items-center gap-1"><Users size={14} className="text-slate-400"/> {item.userName}</h4>
                        <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider mt-1 break-words">Grupo: {item.groupName}</p>
                      </div>
                    );
                  }
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ==========================================
// VIEW: CHAT EN VIVO (POR MATERIA)
// ==========================================
function ChatView({ user, chatMessages, subjectDetails, subjects }) {
  const [msg, setMsg] = useState('');
  const messagesEndRef = useRef(null);

  // Obtener las materias que el usuario marcó como "Cursando"
  const cursandoSubjects = useMemo(() => {
    return subjects.filter(s => subjectDetails[s.id]?.status === 'cursando');
  }, [subjectDetails, subjects]);

  // Estado para saber qué sala está abierta (por defecto la primera que cursa)
  const [activeRoom, setActiveRoom] = useState(cursandoSubjects.length > 0 ? cursandoSubjects[0].id : null);

  // Si cambia la lista de cursando, asegurar que haya una sala activa
  useEffect(() => {
    if (cursandoSubjects.length > 0 && !cursandoSubjects.find(s => s.id === activeRoom)) {
      setActiveRoom(cursandoSubjects[0].id);
    } else if (cursandoSubjects.length === 0) {
      setActiveRoom(null);
    }
  }, [cursandoSubjects]);

  // Filtrar los mensajes globales para mostrar solo los de la materia activa
  const currentMessages = useMemo(() => {
    return chatMessages.filter(m => m.subjectId === activeRoom);
  }, [chatMessages, activeRoom]);

  const scrollToBottom = () => messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  useEffect(() => scrollToBottom(), [currentMessages]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!msg.trim() || !activeRoom) return;
    await addDoc(collection(db, 'artifacts', appId, 'public', 'data', 'chat'), {
      text: msg,
      subjectId: activeRoom, // Guardamos a qué materia pertenece el mensaje
      authorId: user.uid,
      authorName: user.displayName || 'Estudiante',
      timestamp: Date.now()
    });
    setMsg('');
  };

  // Pantalla de bloqueo si no está cursando nada
  if (cursandoSubjects.length === 0) {
    return (
      <div className="max-w-3xl mx-auto h-[600px] flex flex-col items-center justify-center bg-white rounded-2xl shadow-sm border border-slate-200 p-8 text-center">
        <Users size={64} className="text-slate-300 mb-4" />
        <h2 className="text-2xl font-bold text-slate-700 mb-2">Salas de Chat Bloqueadas</h2>
        <p className="text-slate-500">No estás cursando ninguna materia en este momento. Ve a "Mi Plan de Estudios" y marca una o más materias como <span className="font-bold text-yellow-600">"Cursando actualmente"</span> para unirte a sus grupos de chat.</p>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto h-[600px] flex bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
      
      {/* SIDEBAR DE MATERIAS */}
      <div className="w-1/3 sm:w-1/4 border-r border-slate-200 bg-slate-50 flex flex-col">
        <div className="bg-teal-700 p-4 text-white shadow-sm z-10 flex items-center gap-2">
          <Users size={18} />
          <h2 className="font-bold text-sm">Tus Grupos</h2>
        </div>
        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {cursandoSubjects.map(sub => (
            <button 
              key={sub.id}
              onClick={() => setActiveRoom(sub.id)}
              className={`w-full text-left p-3 rounded-lg text-sm font-medium transition-colors ${activeRoom === sub.id ? 'bg-teal-100 text-teal-800 shadow-sm border border-teal-200' : 'text-slate-600 hover:bg-slate-200 border border-transparent'}`}
            >
              <div className="line-clamp-2 leading-tight">{sub.name}</div>
            </button>
          ))}
        </div>
      </div>

      {/* ÁREA DE MENSAJES */}
      <div className="w-2/3 sm:w-3/4 flex flex-col bg-white">
        <div className="bg-teal-600 p-4 text-white flex items-center gap-2 shadow-md z-10">
          <MessageSquare size={20} /> 
          <h2 className="font-bold truncate">{subjects.find(s => s.id === activeRoom)?.name}</h2>
        </div>
        
        <div className="flex-1 overflow-y-auto p-4 bg-slate-50/50 flex flex-col gap-3">
          {currentMessages.length === 0 && <div className="text-center mt-20 text-slate-400">No hay mensajes en esta materia aún. ¡Rompe el hielo y di hola!</div>}
          {currentMessages.map(m => {
            const isMe = m.authorId === user.uid;
            return (
              <div key={m.id} className={`flex flex-col max-w-[85%] ${isMe ? 'self-end items-end' : 'self-start items-start'}`}>
                <span className="text-[10px] text-slate-400 mb-0.5 px-1 font-medium">{m.authorName}</span>
                <div className={`px-4 py-2 rounded-2xl ${isMe ? 'bg-teal-500 text-white rounded-tr-none' : 'bg-white border shadow-sm rounded-tl-none text-slate-700'}`}>
                  {m.text}
                </div>
              </div>
            );
          })}
          <div ref={messagesEndRef} />
        </div>

        <form onSubmit={handleSend} className="p-3 bg-white border-t flex gap-2">
          <input 
            type="text" value={msg} onChange={e => setMsg(e.target.value)} placeholder="Escribe un mensaje al grupo..."
            className="flex-1 border-slate-300 border rounded-full px-4 py-2 outline-none focus:border-teal-500" 
          />
          <button type="submit" className="bg-teal-500 hover:bg-teal-600 text-white p-3 rounded-full transition-colors"><Send size={18}/></button>
        </form>
      </div>

    </div>
  );
}

// ==========================================
// VIEW: ZONA DE CONCENTRACIÓN (YOUTUBE)
// ==========================================
function FocusView({ user, activeStream, setActiveStream, customStreams }) {
  const [showForm, setShowForm] = useState(false);
  const [streamData, setStreamData] = useState({ title: '', url: '' });

  const STREAMS = [
    { id: 'lofi-1', category: 'Lo-Fi', title: 'Lofi Girl (Beats)', desc: 'Beats relajantes para estudiar', url: 'https://www.youtube.com/embed/jfKfPfyJRdk?autoplay=1', color: 'bg-purple-100 text-purple-700' },
    { id: 'inst-1', category: 'Instrumental', title: 'Piano Clásico (3 Hs)', desc: 'Concentración profunda', url: 'https://www.youtube.com/embed/WJ3-F02-F_Y?autoplay=1', color: 'bg-blue-100 text-blue-700' },
  ];

  const handleAddStream = async (e) => {
    e.preventDefault();
    if (!streamData.title || !streamData.url) return;
    
    let embedUrl = streamData.url;
    // Convierte enlace de YT a formato iframe
    if (embedUrl.includes('youtube.com/watch') || embedUrl.includes('youtu.be/')) {
      const videoId = embedUrl.split('v=')[1]?.split('&')[0] || embedUrl.split('youtu.be/')[1]?.split('?')[0];
      if (videoId) embedUrl = `https://www.youtube.com/embed/${videoId}?autoplay=1`;
    }

    await addDoc(collection(db, 'artifacts', appId, 'public', 'data', 'streams'), {
      title: streamData.title,
      url: embedUrl,
      category: 'Comunidad',
      desc: `Añadido por ${user.displayName?.split(' ')[0] || 'Usuario'}`,
      color: 'bg-teal-100 text-teal-700',
      authorId: user.uid,
      createdAt: Date.now()
    });
    setStreamData({ title: '', url: '' }); setShowForm(false);
  };

  const handleDeleteStream = async (id, authorId) => {
    if (user.uid !== authorId) return;
    await deleteDoc(doc(db, 'artifacts', appId, 'public', 'data', 'streams', id));
    if (activeStream?.id === id) setActiveStream(null);
  };

  return (
    <div className="max-w-4xl mx-auto text-center animate-in fade-in duration-500">
      <Headphones size={48} className="mx-auto text-teal-300 mb-4" />
      <h2 className="text-2xl font-bold text-slate-800 mb-2">Elige tu música de estudio</h2>
      <p className="text-slate-500 mb-8">Escucha las estaciones por defecto o añade enlaces de YouTube a la colección.</p>
      
      <div className="flex justify-center mb-8">
        <button onClick={() => setShowForm(!showForm)} className="bg-teal-600 text-white px-5 py-2.5 rounded-lg hover:bg-teal-700 transition-colors flex items-center gap-2 shadow-sm font-medium">
          <Plus size={18} /> Añadir Playlist de YouTube
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleAddStream} className="bg-white p-5 rounded-xl border border-teal-200 mb-8 grid grid-cols-1 md:grid-cols-2 gap-4 shadow-md max-w-2xl mx-auto text-left">
          <div><label className="block text-sm font-medium text-slate-700 mb-1">Nombre de la Playlist</label><input required placeholder="Ej: Rock instrumental" className="w-full border border-slate-300 p-2.5 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none" value={streamData.title} onChange={e => setStreamData({...streamData, title: e.target.value})} /></div>
          <div><label className="block text-sm font-medium text-slate-700 mb-1">Enlace de YouTube</label><input required placeholder="https://www.youtube.com/watch?v=..." className="w-full border border-slate-300 p-2.5 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none" value={streamData.url} onChange={e => setStreamData({...streamData, url: e.target.value})} /></div>
          <button type="submit" className="md:col-span-2 bg-teal-50 text-teal-700 font-bold py-2.5 rounded-lg hover:bg-teal-100 transition-colors border border-teal-100">Compartir con la comunidad</button>
        </form>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 max-w-4xl mx-auto">
        {[...STREAMS, ...customStreams].map(stream => {
          const isOwner = stream.authorId && user.uid === stream.authorId;
          return (
            <div key={stream.id} className="relative group">
              {isOwner && (
                <button onClick={(e) => { e.stopPropagation(); handleDeleteStream(stream.id, stream.authorId); }} className="absolute top-2 right-2 p-1.5 bg-white rounded-full text-slate-300 hover:text-red-500 hover:bg-red-50 shadow-sm z-10 opacity-0 group-hover:opacity-100 transition-all border border-slate-200"><Trash2 size={14} /></button>
              )}
              <button onClick={() => setActiveStream(stream)}
                className={`w-full h-full p-4 rounded-xl border-2 text-left transition-all flex flex-col ${activeStream?.id === stream.id ? 'border-teal-500 bg-teal-50 shadow-md ring-2 ring-teal-100' : 'bg-white hover:border-teal-300 hover:shadow-sm border-slate-200'}`}>
                <div className="flex justify-between w-full items-start mb-2">
                  <span className={`text-[10px] px-2 py-0.5 rounded font-bold uppercase tracking-wide border ${stream.color}`}>{stream.category}</span>
                  <PlayCircle className={activeStream?.id === stream.id ? 'text-teal-600' : 'text-slate-300'} size={18} />
                </div>
                <h4 className="font-bold text-slate-800 leading-tight mb-1">{stream.title}</h4>
                <p className="text-[11px] text-slate-500 line-clamp-1">{stream.desc}</p>
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
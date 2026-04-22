import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Check, Lock, Unlock, GraduationCap, AlertCircle, Calendar, Folder, BookOpen, Plus, ExternalLink, Trash2, CalendarDays, Clock, Users, Headphones, PlayCircle, Radio, X, Save, FileText, LogOut, MessageSquare, Send, Trophy, XCircle, User, Building, CalendarPlus, ChevronLeft, ChevronRight, Gift, Moon, Sun, Play, Pause, RotateCcw, Brain, Coffee, AlarmClock, Calculator, Target, Percent } from 'lucide-react';

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
  { id: 'prin_org', name: 'Principios de organización y administration', year: 1, semester: 1, prereqs: [] },
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

// --- FECHAS OFICIALES UAP 2026 ---
const UAP_CALENDAR_2026 = [
  { date: '2026-01-01', title: 'Año Nuevo', type: 'Feriado' }, { date: '2026-02-03', title: 'Batalla de Caseros', type: 'Feriado' },
  { date: '2026-02-16', title: 'Carnaval', type: 'Feriado' }, { date: '2026-02-17', title: 'Carnaval', type: 'Feriado' },
  { date: '2026-03-23', title: 'Día no laborable', type: 'Feriado' }, { date: '2026-03-24', title: 'Día de la Memoria', type: 'Feriado' },
  { date: '2026-04-02', title: 'Veterano y Caídos / Jueves Santo', type: 'Feriado' }, { date: '2026-04-03', title: 'Viernes Santo', type: 'Feriado' },
  { date: '2026-05-01', title: 'Día del Trabajador', type: 'Feriado' }, { date: '2026-05-25', title: 'Revolución de Mayo', type: 'Feriado' },
  { date: '2026-06-15', title: 'Muerte Gral. Güemes', type: 'Feriado' }, { date: '2026-06-20', title: 'Muerte Gral. Belgrano', type: 'Feriado' },
  { date: '2026-07-09', title: 'Día de la Independencia', type: 'Feriado' }, { date: '2026-07-10', title: 'Día no laborable', type: 'Feriado' },
  { date: '2026-08-17', title: 'Muerte Gral. San Martín', type: 'Feriado' }, { date: '2026-09-21', title: 'Día del Estudiante', type: 'Feriado' },
  { date: '2026-09-26', title: 'Día de LSM', type: 'Feriado' }, { date: '2026-09-29', title: 'Patrono de Entre Ríos', type: 'Feriado' },
  { date: '2026-10-12', title: 'Diversidad Cultural', type: 'Feriado' }, { date: '2026-11-23', title: 'Soberanía Nacional', type: 'Feriado' },
  { date: '2026-12-07', title: 'Día no laborable', type: 'Feriado' }, { date: '2026-12-08', title: 'Inmaculada Concepción', type: 'Feriado' },
  { date: '2026-12-25', title: 'Navidad', type: 'Feriado' }, { date: '2026-12-31', title: 'Asueto Administrativo', type: 'Feriado' },
  
  { date: '2026-03-06', title: 'Starting UAP', type: 'Institucional' }, { date: '2026-03-07', title: 'Starting UAP', type: 'Institucional' },
  { date: '2026-03-08', title: 'Starting UAP', type: 'Institucional' }, { date: '2026-03-09', title: 'Inicio 1er Cuatrimestre', type: 'Institucional' },
  { date: '2026-03-10', title: 'Acto formal inicio de clases', type: 'Institucional' }, { date: '2026-03-20', title: 'Homecoming', type: 'Institucional' },
  { date: '2026-03-21', title: 'Homecoming', type: 'Institucional' }, { date: '2026-03-22', title: 'Homecoming', type: 'Institucional' },
  { date: '2026-03-27', title: 'Fiesta Misionera', type: 'Institucional' }, { date: '2026-03-28', title: 'Fiesta Misionera', type: 'Institucional' },
  { date: '2026-04-04', title: 'Raíces del Adventismo', type: 'Institucional' }, { date: '2026-04-11', title: 'Congreso de Psicología', type: 'Institucional' },
  { date: '2026-04-20', title: 'Inicio de Tertulias', type: 'Institucional' }, { date: '2026-05-09', title: 'Raíces del Adventismo', type: 'Institucional' },
  { date: '2026-05-22', title: 'XVI Simposio Teológico', type: 'Institucional' }, { date: '2026-05-23', title: 'XVI Simposio Teológico', type: 'Institucional' },
  { date: '2026-05-24', title: 'XVI Simposio Teológico', type: 'Institucional' }, { date: '2026-06-10', title: 'Raíces del Adventismo', type: 'Institucional' },
  { date: '2026-06-12', title: 'Graduación', type: 'Institucional' }, { date: '2026-06-13', title: 'Graduación', type: 'Institucional' },
  { date: '2026-06-14', title: 'Graduación', type: 'Institucional' }, { date: '2026-08-03', title: 'Inicio 2do Cuatrimestre', type: 'Institucional' },
  { date: '2026-08-08', title: '2º Homecoming', type: 'Institucional' }, { date: '2026-08-21', title: 'I Will Go UA/UAP', type: 'Institucional' },
  { date: '2026-08-22', title: 'I Will Go UA/UAP', type: 'Institucional' }, { date: '2026-09-02', title: 'Congreso de Fe y Ciencia', type: 'Institucional' },
  { date: '2026-09-03', title: 'Congreso de Fe y Ciencia', type: 'Institucional' }, { date: '2026-09-04', title: 'Congreso de Fe y Ciencia', type: 'Institucional' },
  { date: '2026-09-05', title: 'Congreso de Fe y Ciencia', type: 'Institucional' }, { date: '2026-09-12', title: 'Raíces del Adventismo', type: 'Institucional' },
  { date: '2026-09-17', title: 'Día del Profesor', type: 'Institucional' }, { date: '2026-10-03', title: 'Fiesta de las Naciones', type: 'Institucional' },
  { date: '2026-10-04', title: 'Fiesta de las Naciones', type: 'Institucional' }, { date: '2026-10-10', title: 'Raíces del Adventismo', type: 'Institucional' },
  { date: '2026-11-07', title: 'Raíces del Adventismo', type: 'Institucional' }, { date: '2026-11-13', title: 'Graduación', type: 'Institucional' },
  { date: '2026-11-14', title: 'Graduación', type: 'Institucional' }, { date: '2026-11-15', title: 'Graduación', type: 'Institucional' },

  { date: '2026-02-23', title: 'Matrícula Web Ingresantes', type: 'Tramite' }, { date: '2026-03-16', title: 'Último día solicitar Graduación', type: 'Tramite' },
  { date: '2026-03-31', title: 'Último día matriculación', type: 'Tramite' }, { date: '2026-05-29', title: 'Último día abandono asig. cuat.', type: 'Tramite' },
  { date: '2026-07-17', title: 'Inicio Matrícula Web (2do Cuat.)', type: 'Tramite' }, { date: '2026-08-20', title: 'Último día solicitar Graduación', type: 'Tramite' },
  { date: '2026-08-31', title: 'Último día matriculación', type: 'Tramite' }, { date: '2026-09-04', title: 'Último día abandono asig. anuales', type: 'Tramite' },
  { date: '2026-10-30', title: 'Último día abandono asig. cuat.', type: 'Tramite' }, { date: '2026-11-24', title: 'Inicio inscrip. online a exámenes', type: 'Tramite' },

  { date: '2026-03-21', title: 'Día del Joven Adventista', type: 'Espiritual' }, { date: '2026-03-28', title: 'Evangelismo Semana Santa', type: 'Espiritual' },
  { date: '2026-03-29', title: 'Evangelismo Semana Santa', type: 'Espiritual' }, { date: '2026-03-30', title: 'Evangelismo Semana Santa', type: 'Espiritual' },
  { date: '2026-03-31', title: 'Evangelismo Semana Santa', type: 'Espiritual' }, { date: '2026-04-01', title: 'Evangelismo Semana Santa', type: 'Espiritual' },
  { date: '2026-04-02', title: 'Evangelismo Semana Santa', type: 'Espiritual' }, { date: '2026-04-03', title: 'Evangelismo Semana Santa', type: 'Espiritual' },
  { date: '2026-04-04', title: 'Evangelismo Semana Santa', type: 'Espiritual' }, { date: '2026-05-01', title: 'Viernes en Familia', type: 'Espiritual' },
  { date: '2026-05-10', title: '1º Semana de Oración', type: 'Espiritual' }, { date: '2026-05-11', title: '1º Semana de Oración', type: 'Espiritual' },
  { date: '2026-05-12', title: '1º Semana de Oración', type: 'Espiritual' }, { date: '2026-05-13', title: '1º Semana de Oración', type: 'Espiritual' },
  { date: '2026-05-14', title: '1º Semana de Oración', type: 'Espiritual' }, { date: '2026-05-15', title: '1º Semana de Oración', type: 'Espiritual' },
  { date: '2026-05-16', title: '1º Semana de Oración', type: 'Espiritual' }, { date: '2026-05-26', title: 'Semana del Voluntariado', type: 'Espiritual' },
  { date: '2026-05-27', title: 'Semana del Voluntariado', type: 'Espiritual' }, { date: '2026-05-28', title: 'Semana del Voluntariado', type: 'Espiritual' },
  { date: '2026-05-29', title: 'Semana del Voluntariado', type: 'Espiritual' }, { date: '2026-05-30', title: 'Semana del Voluntariado', type: 'Espiritual' },
  { date: '2026-09-18', title: 'Semana de la Esperanza', type: 'Espiritual' }, { date: '2026-09-19', title: 'Semana de la Esperanza', type: 'Espiritual' },
  { date: '2026-09-20', title: 'Semana de la Esperanza', type: 'Espiritual' }, { date: '2026-09-21', title: 'Semana de la Esperanza', type: 'Espiritual' },
  { date: '2026-09-22', title: 'Semana de la Esperanza', type: 'Espiritual' }, { date: '2026-09-23', title: 'Semana de la Esperanza', type: 'Espiritual' },
  { date: '2026-09-24', title: 'Semana de la Esperanza', type: 'Espiritual' }, { date: '2026-09-25', title: 'Semana de la Esperanza', type: 'Espiritual' },
  { date: '2026-09-26', title: 'Semana de la Esperanza', type: 'Espiritual' }, { date: '2026-10-17', title: '2º Semana de Oración', type: 'Espiritual' },
  { date: '2026-10-18', title: '2º Semana de Oración', type: 'Espiritual' }, { date: '2026-10-19', title: '2º Semana de Oración', type: 'Espiritual' },
  { date: '2026-10-20', title: '2º Semana de Oración', type: 'Espiritual' }, { date: '2026-10-21', title: '2º Semana de Oración', type: 'Espiritual' },
  { date: '2026-10-22', title: '2º Semana de Oración', type: 'Espiritual' }, { date: '2026-10-23', title: '2º Semana de Oración', type: 'Espiritual' },
  { date: '2026-10-24', title: '2º Semana de Oración / Sáb. Creación', type: 'Espiritual' }, { date: '2026-11-21', title: 'Culto Acción de Gracias', type: 'Espiritual' },

  { date: '2026-06-26', title: 'Receso Escolar', type: 'Receso' }, { date: '2026-06-27', title: 'Receso Escolar', type: 'Receso' },
  { date: '2026-06-28', title: 'Receso Escolar', type: 'Receso' }, { date: '2026-06-29', title: 'Receso Escolar', type: 'Receso' },
  { date: '2026-06-30', title: 'Receso Escolar', type: 'Receso' }, { date: '2026-07-01', title: 'Receso Escolar', type: 'Receso' },
  { date: '2026-07-02', title: 'Receso Escolar', type: 'Receso' }, { date: '2026-07-03', title: 'Receso Escolar', type: 'Receso' },
  { date: '2026-07-04', title: 'Receso Escolar', type: 'Receso' }, { date: '2026-07-05', title: 'Receso Escolar', type: 'Receso' },
  { date: '2026-07-06', title: 'Receso Escolar', type: 'Receso' }, { date: '2026-07-07', title: 'Receso Escolar', type: 'Receso' },
  { date: '2026-07-08', title: 'Receso Escolar', type: 'Receso' }, { date: '2026-07-09', title: 'Receso Escolar', type: 'Receso' },
  { date: '2026-07-10', title: 'Receso Escolar', type: 'Receso' },
  { date: '2026-12-18', title: 'Receso Verano', type: 'Receso' }, { date: '2026-12-19', title: 'Receso Verano', type: 'Receso' },
  { date: '2026-12-20', title: 'Receso Verano', type: 'Receso' }, { date: '2026-12-21', title: 'Receso Verano', type: 'Receso' },
  { date: '2026-12-22', title: 'Receso Verano', type: 'Receso' }, { date: '2026-12-23', title: 'Receso Verano', type: 'Receso' },
  { date: '2026-12-24', title: 'Receso Verano', type: 'Receso' }, { date: '2026-12-25', title: 'Receso Verano', type: 'Receso' },
  { date: '2026-12-26', title: 'Receso Verano', type: 'Receso' }, { date: '2026-12-27', title: 'Receso Verano', type: 'Receso' },
  { date: '2026-12-28', title: 'Receso Verano', type: 'Receso' }, { date: '2026-12-29', title: 'Receso Verano', type: 'Receso' },
  { date: '2026-12-30', title: 'Receso Verano', type: 'Receso' }, { date: '2026-12-31', title: 'Receso Verano', type: 'Receso' },

  { date: '2026-03-23', title: 'Examen Diagnóstico Inglés', type: 'ExamenesUAP' }, { date: '2026-08-18', title: 'Examen Diagnóstico Inglés', type: 'ExamenesUAP' },
  { date: '2026-07-13', title: 'Exámenes Finales 1er Cuat.', type: 'ExamenesUAP' }, { date: '2026-07-14', title: 'Exámenes Finales 1er Cuat.', type: 'ExamenesUAP' },
  { date: '2026-07-15', title: 'Exámenes Finales 1er Cuat.', type: 'ExamenesUAP' }, { date: '2026-07-16', title: 'Exámenes Finales 1er Cuat.', type: 'ExamenesUAP' },
  { date: '2026-07-17', title: 'Exámenes Finales 1er Cuat.', type: 'ExamenesUAP' }, { date: '2026-12-09', title: 'Exámenes Finales 2do Cuat.', type: 'ExamenesUAP' },
  { date: '2026-12-10', title: 'Exámenes Finales 2do Cuat.', type: 'ExamenesUAP' }, { date: '2026-12-11', title: 'Exámenes Finales 2do Cuat.', type: 'ExamenesUAP' },
  { date: '2026-12-12', title: 'Exámenes Finales 2do Cuat.', type: 'ExamenesUAP' }, { date: '2026-12-13', title: 'Exámenes Finales 2do Cuat.', type: 'ExamenesUAP' },
  { date: '2026-12-14', title: 'Exámenes Finales 2do Cuat.', type: 'ExamenesUAP' }, { date: '2026-12-15', title: 'Exámenes Finales 2do Cuat.', type: 'ExamenesUAP' },
  { date: '2026-12-16', title: 'Exámenes Finales 2do Cuat.', type: 'ExamenesUAP' }, { date: '2026-12-17', title: 'Exámenes Finales 2do Cuat.', type: 'ExamenesUAP' },
  { date: '2026-12-18', title: 'Exámenes Finales 2do Cuat.', type: 'ExamenesUAP' },
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

  // MODO OSCURO (DARK MODE)
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const saved = localStorage.getItem('theme');
    return saved === 'dark';
  });

  useEffect(() => {
    localStorage.setItem('theme', isDarkMode ? 'dark' : 'light');
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

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

    const vaultRef = collection(db, 'artifacts', appId, 'public', 'data', 'vault');
    const unsubVault = onSnapshot(vaultRef, (snapshot) => {
      const items = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      items.sort((a, b) => b.createdAt - a.createdAt);
      setVaultItems(items);
    });

    const calRef = collection(db, 'artifacts', appId, 'public', 'data', 'calendar');
    const unsubCal = onSnapshot(calRef, (snapshot) => {
      const events = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      events.sort((a, b) => new Date(a.date) - new Date(b.date)); 
      setCalendarEvents(events);
    });

    const schedRef = collection(db, 'artifacts', appId, 'public', 'data', 'schedule');
    const unsubSched = onSnapshot(schedRef, (snapshot) => {
      const items = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setScheduleItems(items);
    });

    const availRef = collection(db, 'artifacts', appId, 'public', 'data', 'availability');
    const unsubAvail = onSnapshot(availRef, (snapshot) => {
      const items = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setAvailabilityItems(items);
    });

    const chatRef = collection(db, 'artifacts', appId, 'public', 'data', 'chat');
    const unsubChat = onSnapshot(chatRef, (snapshot) => {
      const msgs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      msgs.sort((a, b) => a.timestamp - b.timestamp);
      setChatMessages(msgs);
    });

    const streamsRef = collection(db, 'artifacts', appId, 'public', 'data', 'streams');
    const unsubStreams = onSnapshot(streamsRef, (snapshot) => {
      const items = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setCustomStreams(items);
    });

    return () => {
      unsubProgress(); unsubVault(); unsubCal(); unsubSched(); unsubAvail(); unsubChat(); unsubStreams();
    };
  }, [user]);

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

  if (isLoading) {
    return <div className={`min-h-screen flex items-center justify-center ${isDarkMode ? 'bg-slate-950 text-teal-400' : 'bg-slate-50 text-teal-600'} font-semibold text-xl animate-pulse`}>Cargando Comunidad...</div>;
  }

  if (!user) {
    return (
      <div className={`min-h-screen ${isDarkMode ? 'bg-slate-950' : 'bg-slate-50'} flex items-center justify-center p-4 transition-colors`}>
        <div className={`${isDarkMode ? 'bg-slate-900 border-teal-700' : 'bg-white border-teal-500'} p-8 rounded-2xl shadow-xl max-w-md w-full text-center border-t-4 transition-colors`}>
          <div className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 ${isDarkMode ? 'bg-teal-900/30' : 'bg-teal-100'}`}>
            <GraduationCap size={40} className={isDarkMode ? 'text-teal-400' : 'text-teal-600'} />
          </div>
          <h1 className={`text-3xl font-bold ${isDarkMode ? 'text-white' : 'text-slate-800'} mb-2`}>Comunidad Estudiantil</h1>
          <p className={`${isDarkMode ? 'text-slate-400' : 'text-slate-500'} mb-8`}>Inicia sesión para guardar tu progreso, sincronizar tus notas y acceder a la comunidad de tu facultad.</p>
          <button onClick={handleLogin} className={`w-full ${isDarkMode ? 'bg-slate-800 border-slate-700 text-white hover:bg-slate-700 hover:border-teal-500' : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50 hover:border-teal-400'} border font-bold py-3 px-4 rounded-xl transition-all flex items-center justify-center gap-3 shadow-sm`}>
            <svg className="w-5 h-5" viewBox="0 0 24 24"><path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" /><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" /><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" /><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" /></svg>
            Entrar con Google
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${isDarkMode ? 'bg-slate-950 text-slate-200' : 'bg-slate-50 text-slate-800'} font-sans pb-12 transition-colors duration-300`}>
      <header className={`shadow-lg sticky top-0 z-20 border-b ${isDarkMode ? 'bg-slate-950 border-teal-900/50 text-white' : 'bg-gradient-to-r from-teal-600 to-emerald-600 text-white border-teal-700/50'}`}>
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-start">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg shadow-sm ${isDarkMode ? 'bg-teal-900/40 text-teal-400 border border-teal-800' : 'bg-white/20 backdrop-blur-sm'}`}><GraduationCap size={28} /></div>
                <div><h1 className={`text-xl md:text-2xl font-bold tracking-tight drop-shadow-sm leading-none ${isDarkMode ? 'text-teal-50' : 'text-white'}`}>Comunidad Estudiantil</h1><span className={`text-xs font-medium flex items-center gap-2 mt-1 ${isDarkMode ? 'text-teal-400' : 'text-teal-100'}`}>{user.photoURL ? (<img src={user.photoURL} alt="avatar" className={`w-5 h-5 rounded-full border ${isDarkMode ? 'border-teal-700' : 'border-teal-200'}`} />) : (<User size={14} className="bg-teal-500 rounded-full p-0.5" />)} Hola, {user.displayName?.split(' ')[0] || 'Estudiante'}</span></div>
              </div>
              <div className="flex items-center gap-2 md:hidden">
                <button onClick={() => setIsDarkMode(!isDarkMode)} className={`p-2 transition-colors ${isDarkMode ? 'text-teal-400 hover:text-teal-200' : 'text-teal-100 hover:text-white'}`}>{isDarkMode ? <Sun size={20} /> : <Moon size={20} />}</button>
                <button onClick={handleLogout} className={`p-2 transition-colors ${isDarkMode ? 'text-teal-400 hover:text-teal-200' : 'text-teal-100 hover:text-white'}`} title="Cerrar sesión"><LogOut size={20} /></button>
              </div>
            </div>
            <div className={`hidden md:flex items-center gap-4 w-full md:w-auto p-3 rounded-xl border shadow-inner ${isDarkMode ? 'bg-slate-900/50 border-slate-800' : 'bg-black/10 backdrop-blur-md border-white/10'}`}>
              <div className={`flex flex-col items-center justify-center pr-4 border-r ${isDarkMode ? 'border-slate-700' : 'border-white/20'}`}><span className={`text-[10px] uppercase tracking-wider font-bold ${isDarkMode ? 'text-teal-500' : 'text-teal-100'}`}>Promedio</span><span className={`text-xl font-black ${isDarkMode ? 'text-teal-50' : 'text-white'}`}>{gpaCalculation}</span></div>
              <div className="flex-1 w-56"><div className={`flex justify-between text-xs mb-1.5 font-medium uppercase tracking-wider ${isDarkMode ? 'text-teal-400' : 'text-teal-50'}`}><span>Avance General</span><span>{progressPercentage}%</span></div><div className={`w-full rounded-full h-2.5 overflow-hidden border ${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-black/20 border-black/10'}`}><div className={`h-full rounded-full transition-all duration-500 ease-out shadow-[0_0_10px_rgba(52,211,153,0.5)] ${isDarkMode ? 'bg-gradient-to-r from-teal-500 to-emerald-400' : 'bg-gradient-to-r from-green-400 to-emerald-300'}`} style={{ width: `${progressPercentage}%` }}></div></div></div>
              <div className={`flex items-center gap-1 pl-2 border-l ${isDarkMode ? 'border-slate-700' : 'border-white/20'}`}>
                <button onClick={() => setIsDarkMode(!isDarkMode)} className={`p-2 rounded-lg transition-colors shadow-sm hover:shadow backdrop-blur-sm ${isDarkMode ? 'bg-slate-800 hover:bg-slate-700 text-teal-400' : 'bg-white/10 hover:bg-white/20 text-white'}`} title="Modo Oscuro">{isDarkMode ? <Sun size={18} /> : <Moon size={18} />}</button>
                <button onClick={handleLogout} className={`p-2 rounded-lg transition-colors shadow-sm hover:shadow backdrop-blur-sm ${isDarkMode ? 'bg-slate-800 hover:bg-slate-700 text-teal-400' : 'bg-white/10 hover:bg-white/20 text-white'}`} title="Cerrar sesión"><LogOut size={18} /></button>
              </div>
            </div>
          </div>
          <div className="flex gap-2 mt-6 overflow-x-auto pb-0 hide-scrollbar items-end">
            <TabButton isDarkMode={isDarkMode} active={activeTab === 'plan'} onClick={() => setActiveTab('plan')} icon={<BookOpen size={18} />} label="Mi Plan" />
            <TabButton isDarkMode={isDarkMode} active={activeTab === 'predictor'} onClick={() => setActiveTab('predictor')} icon={<Calculator size={18} />} label="Simulador" />
            <TabButton isDarkMode={isDarkMode} active={activeTab === 'vault'} onClick={() => setActiveTab('vault')} icon={<Folder size={18} />} label="Bóveda" />
            <TabButton isDarkMode={isDarkMode} active={activeTab === 'calendar'} onClick={() => setActiveTab('calendar')} icon={<CalendarDays size={18} />} label="Calendario" />
            <TabButton isDarkMode={isDarkMode} active={activeTab === 'schedule'} onClick={() => setActiveTab('schedule')} icon={<Clock size={18} />} label="Horarios" />
            <TabButton isDarkMode={isDarkMode} active={activeTab === 'chat'} onClick={() => setActiveTab('chat')} icon={<MessageSquare size={18} />} label="Sala de Chat" />
            <TabButton isDarkMode={isDarkMode} active={activeTab === 'focus'} onClick={() => setActiveTab('focus')} icon={<Headphones size={18} />} label="Música" />
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8">
        {activeTab === 'plan' && <PlanView isDarkMode={isDarkMode} subjectsByGroup={subjectsByGroup} completedSubjects={completedSubjects} subjectDetails={subjectDetails} getSubjectStatus={getSubjectStatus} onSubjectClick={handleSubjectClick} />}
        {activeTab === 'predictor' && <PredictorView isDarkMode={isDarkMode} />}
        {activeTab === 'vault' && <VaultView isDarkMode={isDarkMode} user={user} vaultItems={vaultItems} subjects={INITIAL_SUBJECTS} />}
        {activeTab === 'calendar' && <CalendarView isDarkMode={isDarkMode} user={user} calendarEvents={calendarEvents} subjects={INITIAL_SUBJECTS} subjectDetails={subjectDetails} />}
        {activeTab === 'schedule' && <ScheduleView isDarkMode={isDarkMode} user={user} scheduleItems={scheduleItems} availabilityItems={availabilityItems} subjects={INITIAL_SUBJECTS} subjectDetails={subjectDetails} />}
        {activeTab === 'chat' && <ChatView isDarkMode={isDarkMode} user={user} chatMessages={chatMessages} subjectDetails={subjectDetails} subjects={INITIAL_SUBJECTS} />}
        {activeTab === 'focus' && <FocusView isDarkMode={isDarkMode} user={user} activeStream={activeStream} setActiveStream={setActiveStream} customStreams={customStreams} />}
      </main>

      {activeStream && (
        <div className="fixed bottom-4 right-4 bg-slate-900 text-white p-3 rounded-2xl shadow-2xl border border-slate-700 flex flex-col items-center z-50 animate-in slide-in-from-bottom-5">
           <div className="flex justify-between w-full items-center mb-2 px-1"><div className="flex items-center gap-2"><Radio size={14} className="text-emerald-400 animate-pulse" /><span className="text-xs font-bold text-slate-300 truncate max-w-[150px]">{activeStream.title}</span></div><button onClick={() => setActiveStream(null)} className="text-slate-400 hover:text-white"><X size={16}/></button></div>
           <div className="w-56 h-32 rounded-xl overflow-hidden bg-black"><iframe width="100%" height="100%" src={activeStream.url} title="Radio" frameBorder="0" allow="autoplay; clipboard-write; encrypted-media; picture-in-picture"></iframe></div>
        </div>
      )}

      {selectedSubjectModal && <SubjectDetailsModal isDarkMode={isDarkMode} subject={selectedSubjectModal} currentDetails={subjectDetails[selectedSubjectModal.id] || {}} onSave={(details) => handleSaveSubjectDetails(selectedSubjectModal.id, details)} onClose={() => setSelectedSubjectModal(null)} />}
    </div>
  );
}

function TabButton({ active, onClick, icon, label, isDarkMode }) {
  const bgActive = isDarkMode ? 'bg-slate-950 text-teal-400 border-t-4 border-teal-500 shadow-[0_-4px_10px_rgba(0,0,0,0.5)]' : 'bg-slate-50 text-teal-800 border-t-4 border-teal-500 shadow-md';
  const bgInactive = isDarkMode ? 'bg-slate-900/40 text-teal-300/60 hover:bg-slate-900 hover:text-teal-300 mb-1' : 'bg-white/10 text-teal-50 hover:bg-white/20 hover:text-white backdrop-blur-sm mb-1';
  return <button onClick={onClick} className={`flex items-center gap-2 px-4 py-3 font-medium transition-all text-sm whitespace-nowrap rounded-t-xl ${active ? bgActive : bgInactive}`}>{icon} {label}</button>;
}

// ==========================================
// VIEW: SIMULADOR DE NOTAS (PREDICTIONS)
// ==========================================
function PredictorView({ isDarkMode }) {
  const bgCard = isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200';
  const textPrimary = isDarkMode ? 'text-white' : 'text-slate-800';
  const textSec = isDarkMode ? 'text-slate-400' : 'text-slate-500';
  const inputBg = isDarkMode ? 'bg-slate-950 border-slate-700 text-white placeholder-slate-600' : 'bg-white border-slate-300 text-slate-900';

  // State: Parciales
  const [grades, setGrades] = useState(['', '']); 
  const [targetGrade, setTargetGrade] = useState(8); // Por defecto Promoción
  
  const addGradeInput = () => setGrades([...grades, '']);
  const updateGrade = (index, val) => {
    const newGrades = [...grades];
    newGrades[index] = val;
    setGrades(newGrades);
  };
  const removeGradeInput = (index) => {
    setGrades(grades.filter((_, i) => i !== index));
  };

  const validGrades = grades.map(g => parseFloat(g)).filter(g => !isNaN(g));
  const currentAvg = validGrades.length > 0 ? (validGrades.reduce((a, b) => a + b, 0) / validGrades.length) : 0;
  
  // Math: (Sum + X) / (N+1) = Target => X = Target * (N+1) - Sum
  const currentSum = validGrades.reduce((a, b) => a + b, 0);
  const neededNext = (targetGrade * (validGrades.length + 1)) - currentSum;

  let partialMessage = "";
  if (validGrades.length === 0) partialMessage = "Ingresa tus notas actuales arriba.";
  else if (neededNext > 10) partialMessage = `Necesitas un ${neededNext.toFixed(1)}. ¡Imposible alcanzar la meta solo con un examen!`;
  else if (neededNext <= 1) partialMessage = `¡Ya lo lograste! Incluso sacando un 1 alcanzas tu meta.`;
  else partialMessage = `Necesitas sacar un ${neededNext.toFixed(1)} en el próximo parcial para llegar a tu meta.`;

  // State: Finales
  const [cursada, setCursada] = useState('');
  const [pesoFinal, setPesoFinal] = useState(50);
  const [notaAprobacion, setNotaAprobacion] = useState(6);

  // Math: (Cursada * (1-peso)) + (Final * peso) = Meta => Final = (Meta - Cursada * (1-peso)) / peso
  const pDecimal = pesoFinal / 100;
  const cursadaNum = parseFloat(cursada);
  let finalNeeded = null;
  if (!isNaN(cursadaNum) && pDecimal > 0) {
    finalNeeded = (notaAprobacion - (cursadaNum * (1 - pDecimal))) / pDecimal;
  }

  return (
    <div className="max-w-5xl mx-auto animate-in fade-in duration-500">
      <div className="text-center mb-10">
        <Calculator size={48} className={`mx-auto mb-4 ${isDarkMode ? 'text-teal-500' : 'text-teal-600'}`} />
        <h2 className={`text-3xl font-bold mb-2 ${textPrimary}`}>Simulador de Notas</h2>
        <p className={textSec}>Calcula exactamente qué necesitas en tu próximo examen o final.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* PARCIALES */}
        <div className={`p-6 sm:p-8 rounded-2xl border shadow-sm ${bgCard}`}>
          <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-200/20">
            <div className={`p-2 rounded-lg ${isDarkMode ? 'bg-teal-900/50 text-teal-400' : 'bg-teal-100 text-teal-700'}`}><Target size={24} /></div>
            <h3 className={`text-xl font-bold ${textPrimary}`}>Calculadora de Parciales</h3>
          </div>

          <div className="space-y-4 mb-6">
            {grades.map((grade, index) => (
              <div key={index} className="flex items-center gap-3">
                <label className={`font-medium w-20 shrink-0 ${textSec}`}>Nota {index + 1}:</label>
                <input type="number" min="1" max="10" placeholder="Ej: 7" className={`flex-1 p-2.5 rounded-lg border outline-none focus:ring-2 focus:ring-teal-500 ${inputBg}`} value={grade} onChange={e => updateGrade(index, e.target.value)} />
                {grades.length > 1 && (
                  <button onClick={() => removeGradeInput(index)} className={`p-2 rounded-lg transition-colors ${isDarkMode ? 'text-slate-500 hover:bg-slate-800 hover:text-red-400' : 'text-slate-400 hover:bg-slate-100 hover:text-red-500'}`}><Trash2 size={18} /></button>
                )}
              </div>
            ))}
            <button onClick={addGradeInput} className={`text-sm font-bold flex items-center gap-1 mt-2 ${isDarkMode ? 'text-teal-400 hover:text-teal-300' : 'text-teal-600 hover:text-teal-700'}`}><Plus size={16}/> Agregar otro parcial</button>
          </div>

          <div className={`p-4 rounded-xl mb-6 ${isDarkMode ? 'bg-slate-950 border border-slate-800' : 'bg-slate-50 border border-slate-200'}`}>
            <label className={`block text-sm font-bold mb-2 ${textPrimary}`}>Mi meta es:</label>
            <select className={`w-full p-2.5 rounded-lg border outline-none focus:ring-2 focus:ring-teal-500 ${inputBg}`} value={targetGrade} onChange={e => setTargetGrade(parseFloat(e.target.value))}>
              <option value={8}>🏆 Promocionar la materia (Promedio 8)</option>
              <option value={6}>📝 Regularizar la materia (Promedio 6)</option>
              <option value={7}>✨ Promedio 7</option>
              <option value={9}>🎓 Promedio 9</option>
            </select>
          </div>

          <div className={`p-5 rounded-xl border text-center ${isDarkMode ? 'bg-teal-900/20 border-teal-800/50' : 'bg-teal-50 border-teal-100'}`}>
            <p className={`text-sm font-bold uppercase tracking-wide mb-1 ${isDarkMode ? 'text-teal-500' : 'text-teal-600'}`}>Promedio Actual: {currentAvg.toFixed(2)}</p>
            <h4 className={`text-lg font-bold leading-tight ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>{partialMessage}</h4>
          </div>
        </div>

        {/* FINALES PONDERADOS */}
        <div className={`p-6 sm:p-8 rounded-2xl border shadow-sm ${bgCard}`}>
          <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-200/20">
            <div className={`p-2 rounded-lg ${isDarkMode ? 'bg-purple-900/50 text-purple-400' : 'bg-purple-100 text-purple-700'}`}><Percent size={24} /></div>
            <h3 className={`text-xl font-bold ${textPrimary}`}>Simulador de Examen Final</h3>
          </div>
          <p className={`text-sm mb-6 ${textSec}`}>Calcula qué nota necesitas en un final que vale un porcentaje específico de tu nota definitiva.</p>

          <div className="space-y-5 mb-6">
            <div>
              <label className={`block text-sm font-medium mb-1 ${textPrimary}`}>Nota final de Cursada</label>
              <input type="number" min="1" max="10" placeholder="Ej: 7.5" className={`w-full p-2.5 rounded-lg border outline-none focus:ring-2 focus:ring-purple-500 ${inputBg}`} value={cursada} onChange={e => setCursada(e.target.value)} />
            </div>
            <div>
              <label className={`block text-sm font-medium mb-1 ${textPrimary}`}>¿Cuánto vale el Final? (%)</label>
              <div className="flex items-center gap-3">
                <input type="range" min="10" max="90" step="10" className="flex-1 accent-purple-500" value={pesoFinal} onChange={e => setPesoFinal(parseInt(e.target.value))} />
                <span className={`font-bold w-12 text-right ${isDarkMode ? 'text-purple-400' : 'text-purple-600'}`}>{pesoFinal}%</span>
              </div>
            </div>
            <div>
              <label className={`block text-sm font-medium mb-1 ${textPrimary}`}>Nota mínima de aprobación en la materia</label>
              <select className={`w-full p-2.5 rounded-lg border outline-none focus:ring-2 focus:ring-purple-500 ${inputBg}`} value={notaAprobacion} onChange={e => setNotaAprobacion(parseFloat(e.target.value))}>
                <option value={6}>Se aprueba con 6</option>
                <option value={7}>Se aprueba con 7</option>
                <option value={8}>Se aprueba con 8</option>
              </select>
            </div>
          </div>

          <div className={`p-5 rounded-xl border text-center ${isDarkMode ? 'bg-purple-900/20 border-purple-800/50' : 'bg-purple-50 border-purple-100'}`}>
            {!finalNeeded ? (
              <p className={isDarkMode ? 'text-slate-400' : 'text-slate-500'}>Ingresa tu nota de cursada para calcular.</p>
            ) : finalNeeded > 10 ? (
              <h4 className={`text-lg font-bold leading-tight ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>Necesitas un {finalNeeded.toFixed(1)}. ¡Matemáticamente no te alcanza para aprobar!</h4>
            ) : finalNeeded <= 1 ? (
              <h4 className={`text-lg font-bold leading-tight ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>Con presentarte y sacar un 1, ya estás aprobado.</h4>
            ) : (
              <h4 className={`text-lg font-bold leading-tight ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>Necesitas sacar un <span className={isDarkMode ? 'text-purple-400 text-2xl' : 'text-purple-600 text-2xl'}>{finalNeeded.toFixed(1)}</span> en el examen final.</h4>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ==========================================
// VIEW: PLAN DE ESTUDIOS
// ==========================================
function PlanView({ subjectsByGroup, completedSubjects, subjectDetails, getSubjectStatus, onSubjectClick, isDarkMode }) {
  const legendBg = isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200';
  const textColor = isDarkMode ? 'text-slate-300' : 'text-slate-700';

  return (
    <>
      <div className="flex flex-wrap justify-center gap-3 mb-10 text-xs md:text-sm">
        <div className={`flex items-center gap-2 px-3 py-1 rounded-full shadow-sm border ${legendBg}`}><div className="w-3 h-3 rounded-full bg-emerald-500"></div><span className={`font-bold ${textColor}`}>Promocionada</span></div>
        <div className={`flex items-center gap-2 px-3 py-1 rounded-full shadow-sm border ${legendBg}`}><div className="w-3 h-3 rounded-full bg-green-500"></div><span className={`font-bold ${textColor}`}>Aprobada</span></div>
        <div className={`flex items-center gap-2 px-3 py-1 rounded-full shadow-sm border ${legendBg}`}><div className="w-3 h-3 rounded-full bg-blue-500"></div><span className={`font-bold ${textColor}`}>Regular</span></div>
        <div className={`flex items-center gap-2 px-3 py-1 rounded-full shadow-sm border ${legendBg}`}><div className="w-3 h-3 rounded-full bg-yellow-500"></div><span className={`font-bold ${textColor}`}>Cursando</span></div>
        <div className={`flex items-center gap-2 px-3 py-1 rounded-full shadow-sm border ${legendBg}`}><div className="w-3 h-3 rounded-full bg-red-500"></div><span className={`font-bold ${textColor}`}>Pérdida/Libre</span></div>
        <div className={`flex items-center gap-2 px-3 py-1 rounded-full shadow-sm border border-teal-500 ring-2 ${isDarkMode ? 'ring-teal-900/50 bg-slate-900' : 'ring-teal-50 bg-white'}`}><div className={`w-3 h-3 rounded-full ${isDarkMode ? 'bg-slate-900' : 'bg-white'} border-2 border-teal-500`}></div><span className="font-bold text-teal-500">Disponible</span></div>
        <div className={`flex items-center gap-2 px-3 py-1 rounded-full shadow-sm border ${legendBg} opacity-70`}><div className="w-3 h-3 rounded-full bg-slate-500"></div><span className={`font-medium ${isDarkMode ? 'text-slate-500' : 'text-slate-500'}`}>Bloqueada</span></div>
      </div>

      <div className="space-y-16">
        {Object.entries(subjectsByGroup).map(([year, semesters]) => (
          <div key={year} className="relative">
            <div className="sticky top-28 z-0 flex items-center mb-6"><div className={`font-bold px-6 py-2 rounded-r-xl shadow-md -ml-4 text-lg border-l-4 border-teal-400 ${isDarkMode ? 'bg-slate-900 text-teal-50' : 'bg-slate-800 text-white'}`}>{year}° Año</div><div className={`h-px flex-1 ml-4 ${isDarkMode ? 'bg-slate-800' : 'bg-slate-200'}`}></div></div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 pl-2">
              <div className="space-y-4"><div className={`flex items-center gap-2 font-semibold mb-2 w-fit px-3 py-1 rounded-md ${isDarkMode ? 'bg-teal-900/30 text-teal-400' : 'bg-teal-50 text-teal-700'}`}><Calendar size={16} /><span>1er Cuatrimestre</span></div><div className="grid grid-cols-1 sm:grid-cols-2 gap-3">{semesters[1].map(sub => <SubjectCardWrapper key={sub.id} subject={sub} subjectDetails={subjectDetails} completedSubjects={completedSubjects} onToggle={onSubjectClick} getSubjectStatus={getSubjectStatus} isDarkMode={isDarkMode} />)}</div></div>
              <div className="space-y-4"><div className={`flex items-center gap-2 font-semibold mb-2 w-fit px-3 py-1 rounded-md ${isDarkMode ? 'bg-teal-900/30 text-teal-400' : 'bg-teal-50 text-teal-700'}`}><Calendar size={16} /><span>2do Cuatrimestre</span></div><div className="grid grid-cols-1 sm:grid-cols-2 gap-3">{semesters[2].map(sub => <SubjectCardWrapper key={sub.id} subject={sub} subjectDetails={subjectDetails} completedSubjects={completedSubjects} onToggle={onSubjectClick} getSubjectStatus={getSubjectStatus} isDarkMode={isDarkMode} />)}</div></div>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}

function SubjectCardWrapper({ subject, subjectDetails, completedSubjects, onToggle, getSubjectStatus, isDarkMode }) {
  const status = getSubjectStatus(subject);
  const detail = subjectDetails[subject.id];
  const missingPrereqsNames = subject.prereqs.filter(preId => {
    const preStatus = subjectDetails[preId]?.status;
    return !(completedSubjects.includes(preId) || ['aprobada', 'promocion', 'final'].includes(preStatus));
  }).map(id => INITIAL_SUBJECTS.find(s => s.id === id)?.name);
  return <SubjectCard subject={subject} status={status} detail={detail} missingPrereqs={missingPrereqsNames} onToggle={() => onToggle(subject.id, status)} isDarkMode={isDarkMode} />;
}

function SubjectCard({ subject, status, detail, missingPrereqs, onToggle, isDarkMode }) {
  const isLocked = status === 'locked';
  const isPromocion = status === 'promocion';
  const isAprobada = status === 'aprobada' || status === 'final';
  const isRegular = status === 'regular';
  const isCursando = status === 'cursando';
  const isPerdida = status === 'perdida';
  const isAvailable = status === 'available';
  const finalGrade = detail?.gradePromocion || detail?.gradeFinal || detail?.grade;

  // NEON/DARK MODE COLORS
  let cardClass = "relative p-3 rounded-xl border transition-all duration-200 cursor-pointer select-none group flex flex-col h-full min-h-[100px] shadow-sm ";
  
  if (isLocked) {
    cardClass += isDarkMode ? 'bg-slate-900/50 border-slate-800 text-slate-600 hover:bg-slate-900' : 'bg-slate-50/50 border-slate-200 hover:bg-slate-100 text-slate-400';
  } else if (isPromocion) {
    cardClass += isDarkMode ? 'bg-emerald-950/40 border-emerald-500/50 text-emerald-300 shadow-[0_0_15px_rgba(16,185,129,0.1)]' : 'bg-emerald-600 border-emerald-700 text-white shadow-md';
  } else if (isAprobada) {
    cardClass += isDarkMode ? 'bg-green-950/40 border-green-600/50 text-green-400' : 'bg-green-100 border-green-400 text-green-900';
  } else if (isRegular) {
    cardClass += isDarkMode ? 'bg-blue-950/40 border-blue-600/50 text-blue-400' : 'bg-blue-100 border-blue-400 text-blue-900';
  } else if (isCursando) {
    cardClass += isDarkMode ? 'bg-yellow-950/40 border-yellow-600/50 text-yellow-400 shadow-[0_0_10px_rgba(234,179,8,0.1)]' : 'bg-yellow-100 border-yellow-400 text-yellow-900';
  } else if (isPerdida) {
    cardClass += isDarkMode ? 'bg-red-950/40 border-red-600/50 text-red-400' : 'bg-red-100 border-red-400 text-red-900';
  } else if (isAvailable) {
    cardClass += isDarkMode ? 'bg-slate-900 border-teal-700 ring-2 ring-teal-900/50 hover:border-teal-500 text-slate-200' : 'bg-white border-teal-300 ring-2 ring-teal-50 hover:ring-teal-100 hover:border-teal-400 text-slate-800 hover:-translate-y-0.5 shadow-md';
  }

  // Icon container backgrounds
  let iconClass = "shrink-0 p-1 rounded-full transition-colors mt-0.5 ";
  if (isPromocion) iconClass += isDarkMode ? 'bg-emerald-900/80 text-emerald-400' : 'bg-white/20 text-white';
  else if (isAprobada) iconClass += isDarkMode ? 'bg-green-900/80 text-green-400' : 'bg-green-500 text-white';
  else if (isRegular) iconClass += isDarkMode ? 'bg-blue-900/80 text-blue-400' : 'bg-blue-500 text-white';
  else if (isCursando) iconClass += isDarkMode ? 'bg-yellow-900/80 text-yellow-400' : 'bg-yellow-400 text-white';
  else if (isPerdida) iconClass += isDarkMode ? 'bg-red-900/80 text-red-400' : 'bg-red-500 text-white';
  else if (isAvailable) iconClass += isDarkMode ? 'bg-teal-900/50 text-teal-400' : 'bg-teal-100 text-teal-600';
  else if (isLocked) iconClass += isDarkMode ? 'text-slate-600' : 'text-slate-300';

  // Sub-tags colors
  let tagBg = "text-[10px] font-bold px-2 py-0.5 rounded w-fit ";
  if (isDarkMode) {
    if (isPromocion) tagBg += 'bg-emerald-900/40 text-emerald-200';
    else if (isAprobada || isRegular) tagBg += 'bg-slate-800/50 text-slate-300';
  } else {
    tagBg += isPromocion ? 'bg-white/20 text-emerald-50' : 'bg-white/50 text-slate-600';
  }

  let finalTagBg = "text-xs font-black px-2 py-0.5 rounded w-fit uppercase tracking-wide border ";
  if (isDarkMode) {
    if (isPromocion) finalTagBg += 'bg-emerald-900/50 text-emerald-300 border-emerald-700/50';
    else finalTagBg += 'bg-blue-900/50 text-blue-300 border-blue-700/50';
  } else {
    finalTagBg += isPromocion ? 'bg-white text-emerald-700 border-emerald-200' : 'bg-blue-50 text-blue-600 border-blue-200';
  }

  return (
    <div onClick={onToggle} className={cardClass}>
      <div className="flex justify-between items-start gap-2 mb-1">
        <h3 className="font-semibold text-sm leading-snug">{subject.name}</h3>
        <div className={iconClass}>
          {isPromocion && <Trophy size={14} strokeWidth={2.5} />} {isAprobada && <Check size={14} strokeWidth={3} />} {isRegular && <FileText size={14} strokeWidth={2} />} {isCursando && <BookOpen size={14} strokeWidth={2} />} {isPerdida && <XCircle size={14} strokeWidth={2} />} {isAvailable && <Unlock size={14} />} {isLocked && <Lock size={14} />}
        </div>
      </div>
      <div className="mt-2 space-y-1">
        {(isRegular || isAprobada) && detail?.gradeCursada && (<div className={tagBg}>Cursada: {detail.gradeCursada}</div>)}
        {finalGrade && (<div className={finalTagBg}>Definitiva: {finalGrade}</div>)}
      </div>
      {isLocked && missingPrereqs && missingPrereqs.length > 0 && (
        <div className="mt-auto pt-2"><div className={`flex items-center gap-1 text-[10px] uppercase font-bold mb-0.5 ${isDarkMode ? 'text-red-500' : 'text-red-400'}`}><AlertCircle size={10} /><span>Falta correlativa</span></div><p className={`text-[10px] leading-tight ${isDarkMode ? 'text-slate-600' : 'text-slate-500'}`}>{missingPrereqs[0]} {missingPrereqs.length > 1 && `+ ${missingPrereqs.length - 1} más`}</p></div>
      )}
    </div>
  );
}

function SubjectDetailsModal({ subject, currentDetails, onSave, onClose, isDarkMode }) {
  const [formData, setFormData] = useState({
    status: currentDetails.status || 'pendiente', gradeCursada: currentDetails.gradeCursada || '', gradeFinal: currentDetails.gradeFinal || '', gradePromocion: currentDetails.gradePromocion || currentDetails.grade || '',
    profesorName: currentDetails.profesorName || '', profesorContact: currentDetails.profesorContact || '', aula: currentDetails.aula || '', creditos: currentDetails.creditos || ''
  });

  const bgModal = isDarkMode ? 'bg-slate-900' : 'bg-slate-50';
  const bgCard = isDarkMode ? 'bg-slate-950 border-slate-800' : 'bg-white border-slate-200';
  const textPrimary = isDarkMode ? 'text-slate-200' : 'text-slate-700';
  const inputBg = isDarkMode ? 'bg-slate-900 border-slate-700 text-white placeholder-slate-500' : 'bg-slate-50 border-slate-300 text-slate-900';

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className={`rounded-2xl shadow-2xl w-full max-w-xl overflow-hidden flex flex-col max-h-[90vh] ${bgModal}`}>
        <div className={`px-6 py-4 flex justify-between items-center text-white shrink-0 shadow-sm ${isDarkMode ? 'bg-slate-950 border-b border-teal-900/50' : 'bg-gradient-to-r from-teal-600 to-emerald-600'}`}>
          <div><span className={`text-xs font-bold uppercase tracking-wider block ${isDarkMode ? 'text-teal-400' : 'text-teal-100'}`}>Ficha de la Materia</span><h2 className="text-lg font-bold pr-4">{subject.name}</h2></div>
          <button onClick={onClose} className="p-2 hover:bg-white/20 rounded-full transition-colors"><X size={20} /></button>
        </div>
        <div className={`p-6 overflow-y-auto ${bgModal}`}>
          <form id="subject-form" onSubmit={(e) => { e.preventDefault(); onSave(formData); }} className="space-y-6">
            <div className={`p-5 rounded-xl border shadow-sm ${bgCard}`}>
              <h3 className={`text-xs font-bold uppercase tracking-wider mb-3 border-b pb-2 ${isDarkMode ? 'text-teal-500 border-slate-800' : 'text-teal-600 border-slate-100'}`}>Progreso Académico</h3>
              <div className="mb-4"><label className={`block text-sm font-bold mb-2 ${textPrimary}`}>Estado Actual</label><select className={`w-full px-3 py-2.5 rounded-lg focus:ring-2 focus:ring-teal-500 font-medium border outline-none ${inputBg}`} value={formData.status} onChange={e => setFormData({...formData, status: e.target.value})}><option value="pendiente">⚪ Pendiente (Disponible)</option><option value="cursando">🟡 Cursando actualmente</option><option value="regular">🔵 Regularizada (Falta final)</option><option value="promocion">🌲 Aprobada por Promoción (8 o más)</option><option value="final">🟢 Aprobada con Examen Final</option><option value="perdida">🔴 Pérdida / Libre</option></select></div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {(formData.status === 'regular' || formData.status === 'final') && (<div className={formData.status === 'regular' ? 'sm:col-span-2' : ''}><label className={`block text-sm font-medium mb-1 ${textPrimary}`}>Nota Cursada</label><input type="number" min="1" max="10" className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-teal-500 outline-none ${inputBg}`} value={formData.gradeCursada} onChange={e => setFormData({...formData, gradeCursada: e.target.value})} /></div>)}
                {formData.status === 'final' && (<div><label className={`block text-sm font-bold mb-1 ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`}>Nota Definitiva (Final)</label><input type="number" min="1" max="10" className={`w-full px-3 py-2 border-2 border-blue-500/50 rounded-lg focus:ring-2 focus:ring-blue-500 font-bold outline-none ${isDarkMode ? 'bg-blue-950 text-white' : 'bg-blue-50 text-slate-900'}`} value={formData.gradeFinal} onChange={e => setFormData({...formData, gradeFinal: e.target.value})} /></div>)}
                {(formData.status === 'promocion' || formData.status === 'aprobada') && (<div className="sm:col-span-2"><label className={`block text-sm font-bold mb-1 ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`}>Nota Definitiva (Promoción)</label><input type="number" min="1" max="10" className={`w-full px-3 py-2 border-2 border-blue-500/50 rounded-lg focus:ring-2 focus:ring-blue-500 font-bold outline-none ${isDarkMode ? 'bg-blue-950 text-white' : 'bg-blue-50 text-slate-900'}`} value={formData.gradePromocion} onChange={e => setFormData({...formData, gradePromocion: e.target.value})} /></div>)}
              </div>
            </div>
            <div className={`p-5 rounded-xl border shadow-sm ${bgCard}`}>
              <h3 className={`text-xs font-bold uppercase tracking-wider mb-3 border-b pb-2 ${isDarkMode ? 'text-teal-500 border-slate-800' : 'text-teal-600 border-slate-100'}`}>Información del Profesor y Cursada</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2"><label className={`block text-sm font-medium mb-1 ${textPrimary}`}>Profesor/a (Nombre)</label><input type="text" placeholder="Ej: Lic. María González" className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-teal-500 outline-none ${inputBg}`} value={formData.profesorName} onChange={e => setFormData({...formData, profesorName: e.target.value})} /></div>
                <div className="sm:col-span-2"><label className={`block text-sm font-medium mb-1 ${textPrimary}`}>Teléfono / Correo / Link</label><input type="text" placeholder="Correo o link al campus" className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-teal-500 outline-none ${inputBg}`} value={formData.profesorContact} onChange={e => setFormData({...formData, profesorContact: e.target.value})} /></div>
                <div><label className={`block text-sm font-medium mb-1 ${textPrimary}`}>Créditos / Horas</label><input type="text" placeholder="Ej: 4 Créditos" className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-teal-500 outline-none ${inputBg}`} value={formData.creditos} onChange={e => setFormData({...formData, creditos: e.target.value})} /></div>
                <div><label className={`block text-sm font-medium mb-1 ${textPrimary}`}>Aula Física/Virtual</label><input type="text" placeholder="Ej: Aula 5 / Zoom" className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-teal-500 outline-none ${inputBg}`} value={formData.aula} onChange={e => setFormData({...formData, aula: e.target.value})} /></div>
              </div>
            </div>
          </form>
        </div>
        <div className={`p-4 border-t flex justify-end gap-3 shrink-0 ${isDarkMode ? 'bg-slate-950 border-slate-800' : 'bg-white border-slate-200'}`}><button onClick={onClose} className={`px-5 py-2 font-medium rounded-lg transition-colors ${isDarkMode ? 'text-slate-400 hover:bg-slate-800' : 'text-slate-600 hover:bg-slate-100'}`}>Cancelar</button><button type="submit" form="subject-form" className={`px-6 py-2 font-bold rounded-lg transition-colors flex items-center gap-2 ${isDarkMode ? 'bg-teal-600 text-white hover:bg-teal-500' : 'bg-teal-600 text-white hover:bg-teal-700'}`}><Save size={18}/> Guardar Ficha</button></div>
      </div>
    </div>
  );
}

// ==========================================
// VIEW: BÓVEDA DE APUNTES
// ==========================================
function VaultView({ user, vaultItems, subjects, isDarkMode }) {
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ title: '', link: '', subjectId: subjects[0].id });

  const handleAdd = async (e) => {
    e.preventDefault();
    let finalLink = formData.link.startsWith('http') ? formData.link : 'https://' + formData.link;
    await addDoc(collection(db, 'artifacts', appId, 'public', 'data', 'vault'), { title: formData.title, link: finalLink, subjectId: formData.subjectId, authorId: user.uid, createdAt: Date.now() });
    setFormData({ title: '', link: '', subjectId: subjects[0].id }); setShowForm(false);
  };

  const bgCard = isDarkMode ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-800';
  const inputBg = isDarkMode ? 'bg-slate-950 border-slate-700 text-white placeholder-slate-600' : 'border-slate-300 bg-white text-slate-900';

  return (
    <div className="max-w-4xl mx-auto"><div className="flex justify-between items-center mb-6"><div><h2 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>Bóveda de Apuntes</h2><p className={`text-sm ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>Comparte resúmenes y parciales viejos.</p></div><button onClick={() => setShowForm(!showForm)} className={`text-white px-4 py-2 rounded-lg transition-colors ${isDarkMode ? 'bg-teal-700 hover:bg-teal-600' : 'bg-teal-600 hover:bg-teal-700'}`}><Plus size={18} className="inline mr-2"/>Compartir</button></div>
      {showForm && (
        <form onSubmit={handleAdd} className={`p-5 rounded-xl border mb-8 grid grid-cols-2 gap-4 shadow-sm ${isDarkMode ? 'bg-slate-900 border-teal-900' : 'bg-white border-teal-200'}`}>
          <input required placeholder="Título" className={`p-2 rounded-lg col-span-1 focus:ring-2 focus:ring-teal-500 outline-none border ${inputBg}`} value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} />
          <select className={`p-2 rounded-lg col-span-1 focus:ring-2 focus:ring-teal-500 outline-none border ${inputBg}`} value={formData.subjectId} onChange={e => setFormData({...formData, subjectId: e.target.value})}>{subjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}</select>
          <input required placeholder="Enlace (Drive, Dropbox, etc)" className={`p-2 rounded-lg col-span-2 focus:ring-2 focus:ring-teal-500 outline-none border ${inputBg}`} value={formData.link} onChange={e => setFormData({...formData, link: e.target.value})} />
          <button type="submit" className={`col-span-2 font-bold py-2 rounded-lg transition-colors ${isDarkMode ? 'bg-teal-900/50 text-teal-400 hover:bg-teal-900' : 'bg-teal-50 text-teal-700 hover:bg-teal-100'}`}>Publicar</button>
        </form>
      )}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {vaultItems.map(item => (
          <div key={item.id} className={`p-4 rounded-xl border hover:shadow-md transition-shadow relative flex flex-col ${bgCard}`}>
            <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded w-fit ${isDarkMode ? 'bg-teal-950 text-teal-400 border border-teal-900/50' : 'bg-teal-50 text-teal-700'}`}>{subjects.find(s=>s.id===item.subjectId)?.name || 'General'}</span>
            {user.uid === item.authorId && <button onClick={() => deleteDoc(doc(db, 'artifacts', appId, 'public', 'data', 'vault', item.id))} className={`absolute top-4 right-4 ${isDarkMode ? 'text-slate-600 hover:text-red-500' : 'text-slate-400 hover:text-red-500'}`}><Trash2 size={16}/></button>}
            <h3 className="font-semibold mt-2 mb-4 line-clamp-2">{item.title}</h3>
            <div className="mt-auto">
              <a href={item.link} target="_blank" rel="noreferrer" className={`flex items-center justify-center gap-2 w-full font-medium py-2 rounded-lg border transition-colors ${isDarkMode ? 'bg-slate-800 border-slate-700 text-teal-400 hover:bg-slate-700' : 'bg-slate-50 text-teal-700 hover:bg-teal-50 hover:border-teal-200'}`}>Abrir Enlace <ExternalLink size={14}/></a>
            </div>
          </div>
        ))}
        {vaultItems.length === 0 && <div className={`col-span-3 text-center py-12 rounded-xl border border-dashed ${isDarkMode ? 'bg-slate-900 border-slate-800 text-slate-500' : 'bg-white border-slate-300 text-slate-500'}`}>No hay apuntes compartidos aún.</div>}
      </div>
    </div>
  );
}

// ==========================================
// VIEW: CALENDARIO VISUAL COMPLETO (INTERACTIVO)
// ==========================================
function CalendarView({ user, calendarEvents, subjects, subjectDetails, isDarkMode }) {
  const [currentDate, setCurrentDate] = useState(new Date(2026, 2, 1)); 
  const [selectedDateStr, setSelectedDateStr] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ title: '', date: '', type: 'Exam', subjectId: subjects[0].id });

  const nextMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  const prevMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));

  const handleAdd = async (e) => {
    e.preventDefault();
    const finalSubjectId = formData.type === 'Especial' ? 'general' : formData.subjectId;
    await addDoc(collection(db, 'artifacts', appId, 'public', 'data', 'calendar'), { ...formData, subjectId: finalSubjectId, authorId: user.uid });
    setShowForm(false);
    setFormData({ title: '', date: '', type: 'Exam', subjectId: subjects[0].id });
  };

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayIndex = new Date(year, month, 1).getDay(); 

  const monthNames = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];

  const calendarCells = [];
  for (let i = 0; i < firstDayIndex; i++) calendarCells.push(null);
  for (let i = 1; i <= daysInMonth; i++) {
    const dStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
    calendarCells.push({ day: i, dateStr: dStr });
  }

  const eventsForSelectedDate = calendarEvents.filter(e => e.date === selectedDateStr);
  const uapEventsForSelectedDate = UAP_CALENDAR_2026.filter(e => e.date === selectedDateStr);

  const handleDayClick = (dateStr) => {
    setSelectedDateStr(dateStr);
    setFormData({ ...formData, date: dateStr });
    setShowForm(false);
  };

  // Dark Mode Classes
  const bgCard = isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200';
  const textPrimary = isDarkMode ? 'text-white' : 'text-slate-800';
  const inputBg = isDarkMode ? 'bg-slate-950 border-slate-700 text-white' : 'bg-white border-slate-300 text-slate-900';

  return (
    <div className="max-w-5xl mx-auto animate-in fade-in duration-500">
      
      {/* CABECERA DEL CALENDARIO VISUAL */}
      <div className={`rounded-2xl shadow-sm border overflow-hidden mb-8 ${bgCard}`}>
        <div className={`text-white p-4 flex justify-between items-center ${isDarkMode ? 'bg-slate-950' : 'bg-slate-800'}`}>
          <button onClick={prevMonth} className="p-2 hover:bg-slate-700 rounded-full transition-colors"><ChevronLeft size={24}/></button>
          <h2 className="text-2xl font-black uppercase tracking-widest">{monthNames[month]} {year}</h2>
          <button onClick={nextMonth} className="p-2 hover:bg-slate-700 rounded-full transition-colors"><ChevronRight size={24}/></button>
        </div>

        <div className={`grid grid-cols-7 text-center py-3 border-b font-bold text-sm ${isDarkMode ? 'bg-slate-900 border-slate-800 text-slate-400' : 'bg-slate-100 border-slate-200 text-slate-500'}`}>
          <div>DOM</div><div>LUN</div><div>MAR</div><div>MIE</div><div>JUE</div><div>VIE</div><div>SAB</div>
        </div>

        <div className={`grid grid-cols-7 p-2 gap-1 sm:gap-2 ${isDarkMode ? 'bg-slate-900' : 'bg-white'}`}>
          {calendarCells.map((cell, index) => {
            if (!cell) return <div key={`empty-${index}`} className="min-h-[80px] sm:min-h-[100px] p-2"></div>;

            const dayEvents = calendarEvents.filter(e => e.date === cell.dateStr);
            const myEvents = dayEvents.filter(e => subjectDetails[e.subjectId]?.status === 'cursando' || e.type === 'Especial' || e.authorId === user.uid);
            const uapEvents = UAP_CALENDAR_2026.filter(e => e.date === cell.dateStr);

            const isSelected = selectedDateStr === cell.dateStr;
            const isToday = cell.dateStr === new Date().toISOString().split('T')[0];

            return (
              <div 
                key={cell.dateStr} onClick={() => handleDayClick(cell.dateStr)}
                className={`min-h-[80px] sm:min-h-[100px] p-1 sm:p-2 border rounded-xl cursor-pointer transition-all flex flex-col items-center hover:shadow-md
                  ${isSelected ? (isDarkMode ? 'border-teal-500 ring-2 ring-teal-800 bg-slate-800' : 'border-teal-500 ring-2 ring-teal-200 bg-teal-50 shadow-sm') : (isDarkMode ? 'border-slate-800 bg-slate-900 hover:border-teal-700' : 'border-slate-100 hover:border-teal-300 bg-white')}
                  ${uapEvents.some(e=>e.type==='Receso') ? (isDarkMode ? 'bg-slate-950/50 border-dashed' : 'bg-slate-50 border-dashed') : ''}`}
              >
                <span className={`text-sm sm:text-lg font-bold mb-1 w-8 h-8 flex items-center justify-center rounded-full ${isToday ? 'bg-teal-600 text-white' : (isDarkMode ? 'text-slate-300' : 'text-slate-700')}`}>
                  {cell.day}
                </span>

                <div className="flex flex-wrap justify-center gap-1 mt-auto w-full">
                  {uapEvents.map((ue, i) => {
                    let dotColor = isDarkMode ? 'bg-indigo-500' : 'bg-indigo-600'; 
                    if (ue.type === 'Feriado') dotColor = isDarkMode ? 'bg-amber-500' : 'bg-amber-700';
                    if (ue.type === 'Espiritual') dotColor = isDarkMode ? 'bg-yellow-400' : 'bg-yellow-500';
                    if (ue.type === 'Receso') dotColor = isDarkMode ? 'bg-sky-500' : 'bg-sky-400';
                    if (ue.type === 'ExamenesUAP') dotColor = isDarkMode ? 'bg-red-500' : 'bg-red-500';
                    if (ue.type === 'Tramite') dotColor = isDarkMode ? 'bg-slate-500' : 'bg-slate-500';
                    return <div key={`uap-${i}`} className={`w-2.5 h-2.5 rounded-full ${dotColor}`} title={ue.title}></div>
                  })}
                  {myEvents.map((me, i) => {
                     if(i > 2) return null;
                     let dotColor = isDarkMode ? 'bg-blue-400' : 'bg-blue-400';
                     if (me.type === 'Exam') dotColor = isDarkMode ? 'bg-orange-400' : 'bg-orange-500';
                     if (me.type === 'Exposicion') dotColor = isDarkMode ? 'bg-purple-400' : 'bg-purple-500';
                     if (me.type === 'Especial') dotColor = isDarkMode ? 'bg-pink-400' : 'bg-pink-500';
                     if (me.type === 'Estudio') dotColor = isDarkMode ? 'bg-emerald-400' : 'bg-emerald-500';
                     return <div key={`me-${i}`} className={`w-2.5 h-2.5 rounded-full ${dotColor}`} title={me.title}></div>
                  })}
                  {myEvents.length > 3 && <span className={`text-[9px] font-bold ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>+{myEvents.length - 3}</span>}
                </div>
              </div>
            );
          })}
        </div>

        {/* LEYENDA */}
        <div className={`border-t p-4 sm:p-6 ${isDarkMode ? 'bg-slate-900 border-slate-700' : 'bg-slate-50 border-slate-200'}`}>
          <h4 className={`text-xs font-bold uppercase tracking-wider mb-3 ${isDarkMode ? 'text-slate-500' : 'text-slate-500'}`}>Referencias Oficiales</h4>
          <div className={`flex flex-wrap gap-x-6 gap-y-3 text-xs sm:text-sm mb-4 pb-4 border-b ${isDarkMode ? 'border-slate-800' : 'border-slate-200'}`}>
            <div className="flex items-center gap-2"><div className={`w-3 h-3 rounded-full ${isDarkMode ? 'bg-amber-500' : 'bg-amber-700'}`}></div><span className={`font-medium ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>Feriados</span></div>
            <div className="flex items-center gap-2"><div className={`w-3 h-3 rounded-full ${isDarkMode ? 'bg-yellow-400' : 'bg-yellow-500'}`}></div><span className={`font-medium ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>Énfasis Espiritual</span></div>
            <div className="flex items-center gap-2"><div className={`w-3 h-3 rounded-full ${isDarkMode ? 'bg-sky-500' : 'bg-sky-400'}`}></div><span className={`font-medium ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>Recesos</span></div>
            <div className="flex items-center gap-2"><div className={`w-3 h-3 rounded-full ${isDarkMode ? 'bg-red-500' : 'bg-red-500'}`}></div><span className={`font-medium ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>Exámenes UAP</span></div>
            <div className="flex items-center gap-2"><div className={`w-3 h-3 rounded-full ${isDarkMode ? 'bg-indigo-500' : 'bg-indigo-600'}`}></div><span className={`font-medium ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>Institucional</span></div>
            <div className="flex items-center gap-2"><div className={`w-3 h-3 rounded-full ${isDarkMode ? 'bg-slate-500' : 'bg-slate-500'}`}></div><span className={`font-medium ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>Trámites / Admin</span></div>
          </div>
          <h4 className={`text-xs font-bold uppercase tracking-wider mb-3 ${isDarkMode ? 'text-slate-500' : 'text-slate-500'}`}>Mis Eventos y Comunidad</h4>
          <div className="flex flex-wrap gap-x-6 gap-y-3 text-xs sm:text-sm">
            <div className="flex items-center gap-2"><div className={`w-3 h-3 rounded-full ${isDarkMode ? 'bg-orange-400' : 'bg-orange-500'}`}></div><span className={`font-medium ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>Mis Exámenes</span></div>
            <div className="flex items-center gap-2"><div className={`w-3 h-3 rounded-full ${isDarkMode ? 'bg-purple-400' : 'bg-purple-500'}`}></div><span className={`font-medium ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>Exposiciones</span></div>
            <div className="flex items-center gap-2"><div className={`w-3 h-3 rounded-full ${isDarkMode ? 'bg-blue-400' : 'bg-blue-400'}`}></div><span className={`font-medium ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>Entregas (TP)</span></div>
            <div className="flex items-center gap-2"><div className={`w-3 h-3 rounded-full ${isDarkMode ? 'bg-pink-400' : 'bg-pink-500'}`}></div><span className={`font-medium ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>Cumpleaños / Especial</span></div>
          </div>
        </div>
      </div>

      {/* ÁREA DE DETALLE DE LA FECHA SELECCIONADA */}
      <div className={`rounded-2xl shadow-sm border p-6 min-h-[300px] ${bgCard}`}>
        {selectedDateStr ? (
          <div>
            <div className={`flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6 pb-4 border-b ${isDarkMode ? 'border-slate-700' : 'border-slate-100'}`}>
              <div>
                <h3 className={`text-xl font-bold flex items-center gap-2 ${isDarkMode ? 'text-teal-400' : 'text-teal-600'}`}>
                  <CalendarDays size={24}/> Agenda del {new Date(selectedDateStr + "T00:00:00").toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' })}
                </h3>
              </div>
              <button onClick={() => setShowForm(!showForm)} className={`px-4 py-2 rounded-lg font-bold flex items-center gap-2 transition-colors ${showForm ? (isDarkMode ? 'bg-slate-700 text-slate-300' : 'bg-slate-200 text-slate-700') : (isDarkMode ? 'bg-teal-700 text-white hover:bg-teal-600' : 'bg-teal-600 text-white hover:bg-teal-700 shadow-sm')}`}>
                {showForm ? <X size={18}/> : <Plus size={18}/>} {showForm ? 'Cancelar' : 'Agregar Evento aquí'}
              </button>
            </div>

            {showForm && (
              <form onSubmit={handleAdd} className={`p-5 rounded-xl border mb-8 grid grid-cols-1 sm:grid-cols-2 gap-4 ${isDarkMode ? 'bg-slate-900 border-slate-700' : 'bg-teal-50/50 border-teal-100'}`}>
                <div className="sm:col-span-2"><label className={`block text-sm font-medium mb-1 ${textPrimary}`}>Título del Evento</label><input required placeholder="Ej: Parcial de Redacción, Cumple de Juan..." className={`w-full border p-2.5 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none ${inputBg}`} value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} /></div>
                <div>
                  <label className={`block text-sm font-medium mb-1 ${textPrimary}`}>Tipo de Evento</label>
                  <select className={`w-full border p-2.5 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none ${inputBg}`} value={formData.type} onChange={e => setFormData({...formData, type: e.target.value})}>
                    <option value="Exam">🔴 Examen / Parcial</option>
                    <option value="TP">🔵 Trabajo Práctico (Entrega)</option>
                    <option value="Exposicion">🟣 Exposición / Presentación</option>
                    <option value="Estudio">🟢 Juntada de Estudio</option>
                    <option value="Especial">💖 Cumpleaños / Especial</option>
                  </select>
                </div>
                {formData.type !== 'Especial' ? (
                  <div><label className={`block text-sm font-medium mb-1 ${textPrimary}`}>Materia Asociada</label><select className={`w-full border p-2.5 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none ${inputBg}`} value={formData.subjectId} onChange={e => setFormData({...formData, subjectId: e.target.value})}>{subjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}</select></div>
                ) : (
                  <div className="flex items-center"><span className={`text-sm font-medium px-3 py-2.5 rounded-lg w-full flex items-center gap-2 ${isDarkMode ? 'bg-pink-900/30 text-pink-400' : 'bg-pink-100 text-pink-600'}`}><Gift size={18}/> Visible para toda la comunidad</span></div>
                )}
                <button type="submit" className={`sm:col-span-2 font-bold py-3 rounded-lg transition-colors mt-2 ${isDarkMode ? 'bg-teal-700 text-white hover:bg-teal-600' : 'bg-teal-600 text-white hover:bg-teal-700'}`}>Guardar en el Calendario</button>
              </form>
            )}

            <div className="space-y-3">
              {uapEventsForSelectedDate.map(ue => {
                let colorClasses = isDarkMode ? 'border-indigo-900/50 bg-indigo-900/20' : 'border-indigo-200 bg-indigo-50/30';
                let iconColor = isDarkMode ? 'bg-indigo-900/50 text-indigo-400' : 'bg-indigo-100 text-indigo-700';
                let typeLabel = 'Académico UAP';

                if (ue.type === 'Feriado') { colorClasses = isDarkMode ? 'border-amber-900/50 bg-amber-900/20' : 'border-amber-200 bg-amber-50/30'; iconColor = isDarkMode ? 'bg-amber-900/50 text-amber-500' : 'bg-amber-100 text-amber-700'; typeLabel = 'Feriado Oficial'; } 
                else if (ue.type === 'Espiritual') { colorClasses = isDarkMode ? 'border-yellow-900/50 bg-yellow-900/20' : 'border-yellow-200 bg-yellow-50/30'; iconColor = isDarkMode ? 'bg-yellow-900/50 text-yellow-500' : 'bg-yellow-100 text-yellow-700'; typeLabel = 'Énfasis Espiritual'; } 
                else if (ue.type === 'Receso') { colorClasses = isDarkMode ? 'border-sky-900/50 bg-sky-900/20' : 'border-sky-200 bg-sky-50/30'; iconColor = isDarkMode ? 'bg-sky-900/50 text-sky-400' : 'bg-sky-100 text-sky-700'; typeLabel = 'Receso Académico'; } 
                else if (ue.type === 'ExamenesUAP') { colorClasses = isDarkMode ? 'border-red-900/50 bg-red-900/20' : 'border-red-200 bg-red-50/30'; iconColor = isDarkMode ? 'bg-red-900/50 text-red-500' : 'bg-red-100 text-red-700'; typeLabel = 'Exámenes Finales'; }
                else if (ue.type === 'Tramite') { colorClasses = isDarkMode ? 'border-slate-700 bg-slate-800' : 'border-slate-300 bg-slate-50/50'; iconColor = isDarkMode ? 'bg-slate-700 text-slate-300' : 'bg-slate-200 text-slate-700'; typeLabel = 'Trámite Académico'; }

                return (
                  <div key={ue.id || ue.title} className={`border p-4 rounded-xl flex items-center gap-4 ${colorClasses}`}>
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 ${iconColor}`}><Building size={24}/></div>
                    <div><div className={`text-[10px] font-bold uppercase tracking-wider mb-1 ${iconColor.split(' ')[1]}`}>{typeLabel}</div><h4 className={`font-bold text-lg ${textPrimary}`}>{ue.title}</h4></div>
                  </div>
                )
              })}

              {eventsForSelectedDate.map(ev => {
                 const isOwner = user.uid === ev.authorId;
                 const isEspecial = ev.type === 'Especial';
                 const shouldShow = isOwner || isEspecial || subjectDetails[ev.subjectId]?.status === 'cursando';
                 if (!shouldShow) return null;

                 let colorClasses = isDarkMode ? 'border-blue-900/50 bg-blue-900/20' : 'border-blue-200 bg-blue-50/30'; 
                 let icon = <FileText className={isDarkMode ? 'text-blue-400' : 'text-blue-500'}/>; let typeName = 'Entrega / TP';
                 if (ev.type === 'Exam') { colorClasses = isDarkMode ? 'border-orange-900/50 bg-orange-900/20' : 'border-orange-200 bg-orange-50/30'; icon = <AlertCircle className={isDarkMode ? 'text-orange-400' : 'text-orange-500'}/>; typeName = 'Examen / Parcial'; }
                 if (ev.type === 'Exposicion') { colorClasses = isDarkMode ? 'border-purple-900/50 bg-purple-900/20' : 'border-purple-200 bg-purple-50/30'; icon = <Users className={isDarkMode ? 'text-purple-400' : 'text-purple-500'}/>; typeName = 'Exposición Oral'; }
                 if (ev.type === 'Estudio') { colorClasses = isDarkMode ? 'border-emerald-900/50 bg-emerald-900/20' : 'border-emerald-200 bg-emerald-50/30'; icon = <BookOpen className={isDarkMode ? 'text-emerald-400' : 'text-emerald-500'}/>; typeName = 'Estudio Grupal'; }
                 if (ev.type === 'Especial') { colorClasses = isDarkMode ? 'border-pink-900/50 bg-pink-900/20' : 'border-pink-200 bg-pink-50/30'; icon = <Gift className={isDarkMode ? 'text-pink-400' : 'text-pink-500'}/>; typeName = 'Evento Especial'; }

                 return (
                  <div key={ev.id} className={`border p-4 rounded-xl flex items-center justify-between gap-4 group ${colorClasses}`}>
                    <div className="flex items-center gap-4">
                      <div className={`p-3 rounded-full shadow-sm ${isDarkMode ? 'bg-slate-800' : 'bg-white'}`}>{icon}</div>
                      <div>
                        <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">{typeName}</div>
                        <h4 className={`font-bold text-lg leading-tight ${textPrimary}`}>{ev.title}</h4>
                        {!isEspecial && <p className={`text-sm mt-0.5 ${isDarkMode ? 'text-slate-500' : 'text-slate-600'}`}>{subjects.find(s=>s.id===ev.subjectId)?.name}</p>}
                      </div>
                    </div>
                    {isOwner && (
                      <button onClick={() => deleteDoc(doc(db, 'artifacts', appId, 'public', 'data', 'calendar', ev.id))} className={`hover:text-red-500 p-2 rounded-full shadow-sm opacity-0 group-hover:opacity-100 transition-all ${isDarkMode ? 'bg-slate-800 text-slate-400' : 'bg-white text-slate-400'}`}><Trash2 size={18}/></button>
                    )}
                  </div>
                )
              })}

              {eventsForSelectedDate.length === 0 && uapEventsForSelectedDate.length === 0 && !showForm && (
                <div className="text-center py-10">
                  <CalendarDays size={48} className={`mx-auto mb-3 ${isDarkMode ? 'text-slate-700' : 'text-slate-200'}`} />
                  <p className={`font-medium text-lg ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>Día libre de eventos</p>
                  <p className="text-slate-500 text-sm mt-1">¡Toca "Agregar Evento aquí" si quieres agendar algo!</p>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-center py-20">
            <div className={`p-6 rounded-full mb-4 ${isDarkMode ? 'bg-teal-900/20' : 'bg-teal-50'}`}>
              <Calendar size={48} className={isDarkMode ? 'text-teal-600' : 'text-teal-300'} />
            </div>
            <h3 className={`text-xl font-bold mb-2 ${textPrimary}`}>Selecciona una fecha</h3>
            <p className={`max-w-sm ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>Toca cualquier día en el calendario de arriba para ver sus detalles o agregar nuevos parciales, entregas y cumpleaños.</p>
          </div>
        )}
      </div>

    </div>
  );
}

// ==========================================
// VIEW: HORARIOS Y DISPONIBILIDAD (PERSONALIZADOS)
// ==========================================
function ScheduleView({ user, scheduleItems, availabilityItems, subjects, subjectDetails, isDarkMode }) {
  const [subTab, setSubTab] = useState('classes'); 
  const [showForm, setShowForm] = useState(false);
  const [groupFilter, setGroupFilter] = useState(''); 
  
  const [classFormData, setClassFormData] = useState({ subjectId: subjects[0].id, dayOfWeek: 'Lunes', startTime: '14:00', endTime: '16:00', classroom: '' });
  const [availFormData, setAvailFormData] = useState({ userName: user.displayName || '', groupName: '', dayOfWeek: 'Lunes', startTime: '16:00', endTime: '18:00' });

  const DAYS = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes'];

  const myClassItems = useMemo(() => {
    return scheduleItems.filter(item => subjectDetails[item.subjectId]?.status === 'cursando');
  }, [scheduleItems, subjectDetails]);

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

  const bgCard = isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200';
  const textPrimary = isDarkMode ? 'text-white' : 'text-slate-800';
  const inputBg = isDarkMode ? 'bg-slate-950 border-slate-700 text-white placeholder-slate-600' : 'bg-white border-slate-300 text-slate-900';

  return (
    <div className="max-w-6xl mx-auto animate-in fade-in duration-500">
      <div className="flex justify-center mb-8">
        <div className={`p-1 rounded-xl inline-flex shadow-inner ${isDarkMode ? 'bg-slate-900' : 'bg-slate-200'}`}>
          <button onClick={() => { setSubTab('classes'); setShowForm(false); }} className={`flex items-center gap-2 px-5 py-2.5 rounded-lg font-medium text-sm transition-all ${subTab === 'classes' ? (isDarkMode ? 'bg-slate-800 text-teal-400 shadow' : 'bg-white text-teal-700 shadow') : (isDarkMode ? 'text-slate-400 hover:text-slate-200' : 'text-slate-600 hover:text-slate-800')}`}><Clock size={16} /> Mis Horarios</button>
          <button onClick={() => { setSubTab('availability'); setShowForm(false); }} className={`flex items-center gap-2 px-5 py-2.5 rounded-lg font-medium text-sm transition-all ${subTab === 'availability' ? (isDarkMode ? 'bg-slate-800 text-green-400 shadow' : 'bg-white text-green-700 shadow') : (isDarkMode ? 'text-slate-400 hover:text-slate-200' : 'text-slate-600 hover:text-slate-800')}`}><Users size={16} /> Grupos de TP</button>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h2 className={`text-2xl font-bold ${textPrimary}`}>{subTab === 'classes' ? 'Mis Horarios de Cursada' : 'Disponibilidad para Trabajos'}</h2>
          <p className={`text-sm mt-1 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
            {subTab === 'classes' ? 'Viendo solo materias marcadas como "Cursando".' : 'Busca a tu grupo para organizar el TP.'}
          </p>
        </div>
        <div className="flex items-center gap-3 w-full sm:w-auto">
          {subTab === 'availability' && !showForm && (
            <div className="relative flex-1 sm:w-64">
              <Users size={16} className={`absolute left-3 top-1/2 -translate-y-1/2 ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`} />
              <input type="text" placeholder="Ej: Grupo Los Pumas" className={`w-full pl-9 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 outline-none text-sm font-medium ${inputBg}`} value={groupFilter} onChange={e => setGroupFilter(e.target.value)} />
            </div>
          )}
          <button onClick={() => setShowForm(!showForm)} className={`shrink-0 ${subTab === 'classes' ? (isDarkMode ? 'bg-teal-700 hover:bg-teal-600' : 'bg-teal-600 hover:bg-teal-700') : (isDarkMode ? 'bg-green-700 hover:bg-green-600' : 'bg-green-600 hover:bg-green-700')} text-white px-4 py-2 rounded-lg font-medium flex items-center gap-2 transition-colors shadow-sm`}>{showForm ? <X size={18}/> : <Plus size={18}/>} <span className="hidden sm:inline">{showForm ? 'Cancelar' : 'Agregar'}</span></button>
        </div>
      </div>

      {showForm && subTab === 'classes' && (
        <form onSubmit={handleAddSchedule} className={`p-5 rounded-xl shadow-md border mb-8 border-t-4 border-t-teal-500 ${bgCard}`}>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div className="md:col-span-3"><label className={`block text-sm font-medium mb-1 ${textPrimary}`}>Materia</label><select className={`w-full p-2 border rounded-lg focus:ring-2 focus:ring-teal-500 outline-none ${inputBg}`} value={classFormData.subjectId} onChange={e => setClassFormData({...classFormData, subjectId: e.target.value})}>{subjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}</select></div>
            <div><label className={`block text-sm font-medium mb-1 ${textPrimary}`}>Día</label><select className={`w-full p-2 border rounded-lg focus:ring-2 focus:ring-teal-500 outline-none ${inputBg}`} value={classFormData.dayOfWeek} onChange={e => setClassFormData({...classFormData, dayOfWeek: e.target.value})}>{DAYS.map(d => <option key={d} value={d}>{d}</option>)}</select></div>
            <div><label className={`block text-sm font-medium mb-1 ${textPrimary}`}>Desde - Hasta</label><div className="flex items-center gap-2"><input type="time" required className={`w-full p-2 border rounded-lg focus:ring-2 focus:ring-teal-500 outline-none ${inputBg}`} value={classFormData.startTime} onChange={e => setClassFormData({...classFormData, startTime: e.target.value})}/><span>-</span><input type="time" required className={`w-full p-2 border rounded-lg focus:ring-2 focus:ring-teal-500 outline-none ${inputBg}`} value={classFormData.endTime} onChange={e => setClassFormData({...classFormData, endTime: e.target.value})}/></div></div>
            <div><label className={`block text-sm font-medium mb-1 ${textPrimary}`}>Aula</label><input type="text" placeholder="Ej: Aula 5" className={`w-full p-2 border rounded-lg focus:ring-2 focus:ring-teal-500 outline-none ${inputBg}`} value={classFormData.classroom} onChange={e => setClassFormData({...classFormData, classroom: e.target.value})}/></div>
          </div>
          <button type="submit" className={`w-full font-bold py-2 rounded-lg transition-colors ${isDarkMode ? 'bg-teal-900/50 text-teal-400 hover:bg-teal-800' : 'bg-teal-50 text-teal-700 hover:bg-teal-100'}`}>Cargar Clase al Sistema</button>
        </form>
      )}

      {showForm && subTab === 'availability' && (
        <form onSubmit={handleAddAvailability} className={`p-5 rounded-xl shadow-md border mb-8 border-t-4 border-t-green-500 ${bgCard}`}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div><label className={`block text-sm font-medium mb-1 ${textPrimary}`}>Tu Nombre</label><input type="text" required placeholder="Tu Nombre" className={`w-full p-2 border rounded-lg focus:ring-2 focus:ring-green-500 outline-none ${inputBg}`} value={availFormData.userName} onChange={e => setAvailFormData({...availFormData, userName: e.target.value})}/></div>
            <div><label className={`block text-sm font-medium mb-1 ${textPrimary}`}>Nombre de tu Grupo</label><input type="text" required placeholder="Ej: Grupo Los Pumas" className={`w-full p-2 border rounded-lg focus:ring-2 focus:ring-green-500 outline-none ${inputBg}`} value={availFormData.groupName} onChange={e => setAvailFormData({...availFormData, groupName: e.target.value})}/></div>
            <div><label className={`block text-sm font-medium mb-1 ${textPrimary}`}>Día Libre</label><select className={`w-full p-2 border rounded-lg focus:ring-2 focus:ring-green-500 outline-none ${inputBg}`} value={availFormData.dayOfWeek} onChange={e => setAvailFormData({...availFormData, dayOfWeek: e.target.value})}>{DAYS.map(d => <option key={d} value={d}>{d}</option>)}</select></div>
            <div><label className={`block text-sm font-medium mb-1 ${textPrimary}`}>Desde - Hasta</label><div className="flex items-center gap-2"><input type="time" required className={`w-full p-2 border rounded-lg focus:ring-2 focus:ring-green-500 outline-none ${inputBg}`} value={availFormData.startTime} onChange={e => setAvailFormData({...availFormData, startTime: e.target.value})}/><span>-</span><input type="time" required className={`w-full p-2 border rounded-lg focus:ring-2 focus:ring-green-500 outline-none ${inputBg}`} value={availFormData.endTime} onChange={e => setAvailFormData({...availFormData, endTime: e.target.value})}/></div></div>
          </div>
          <button type="submit" className={`w-full font-bold py-2 rounded-lg transition-colors ${isDarkMode ? 'bg-green-900/50 text-green-400 hover:bg-green-800' : 'bg-green-50 text-green-700 hover:bg-green-100'}`}>Publicar mi Disponibilidad</button>
        </form>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        {DAYS.map(day => {
          const dayItems = (subTab === 'classes' ? myClassItems : myGroupItems).filter(item => item.dayOfWeek === day).sort((a, b) => a.startTime.localeCompare(b.startTime));
          return (
            <div key={day} className={`rounded-xl shadow-sm border overflow-hidden flex flex-col min-h-[150px] ${bgCard}`}>
              <div className={`py-2 text-center border-b ${subTab === 'classes' ? (isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-slate-100 border-slate-200') : (isDarkMode ? 'bg-green-950/30 border-green-900/50' : 'bg-green-50 border-green-200')}`}><h3 className={`font-bold uppercase text-sm tracking-wider ${subTab === 'classes' ? (isDarkMode ? 'text-slate-400' : 'text-slate-700') : (isDarkMode ? 'text-green-500' : 'text-green-800')}`}>{day}</h3></div>
              <div className={`p-3 flex-1 space-y-3 ${isDarkMode ? 'bg-slate-800/30' : 'bg-slate-50/50'}`}>
                {dayItems.length === 0 ? <p className={`text-center text-xs py-4 italic ${isDarkMode ? 'text-slate-600' : 'text-slate-400'}`}>Libre</p> : dayItems.map(item => {
                  const isOwner = user?.uid === item.authorId;
                  if (subTab === 'classes') {
                    const subject = subjects.find(s => s.id === item.subjectId);
                    return (
                      <div key={item.id} className={`p-3 rounded-lg shadow-sm border relative group ${isDarkMode ? 'bg-slate-900/50 border-teal-900/50' : 'bg-white border-teal-100'}`}>
                        {isOwner && <button onClick={() => handleDelete(item.id, item.authorId, 'schedule')} className={`absolute top-2 right-2 hover:text-red-500 ${isDarkMode ? 'text-slate-600' : 'text-slate-300'}`}><Trash2 size={14} /></button>}
                        <div className={`text-xs font-bold mb-1 flex items-center gap-1 ${isDarkMode ? 'text-teal-400' : 'text-teal-600'}`}><Clock size={12} /> {item.startTime} - {item.endTime}</div>
                        <h4 className={`text-sm font-semibold leading-tight pr-4 ${textPrimary}`}>{subject ? subject.name : 'Materia'}</h4>
                        {item.classroom && <p className={`text-xs mt-1 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>📍 {item.classroom}</p>}
                      </div>
                    );
                  } else {
                    return (
                      <div key={item.id} className={`p-3 rounded-lg shadow-sm border relative group ${isDarkMode ? 'bg-slate-900/50 border-green-900/50' : 'bg-white border-green-200'}`}>
                        {isOwner && <button onClick={() => handleDelete(item.id, item.authorId, 'availability')} className={`absolute top-2 right-2 hover:text-red-500 ${isDarkMode ? 'text-slate-600' : 'text-slate-300'}`}><Trash2 size={14} /></button>}
                        <div className={`text-xs font-bold mb-1 flex items-center gap-1 ${isDarkMode ? 'text-green-400' : 'text-green-700'}`}><Clock size={12} /> {item.startTime} - {item.endTime}</div>
                        <h4 className={`text-sm font-semibold flex items-center gap-1 ${textPrimary}`}><Users size={14} className={isDarkMode ? 'text-slate-500' : 'text-slate-400'}/> {item.userName}</h4>
                        <p className={`text-[10px] uppercase font-bold tracking-wider mt-1 break-words ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>Grupo: {item.groupName}</p>
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
function ChatView({ user, chatMessages, subjectDetails, subjects, isDarkMode }) {
  const [msg, setMsg] = useState('');
  const messagesEndRef = useRef(null);

  const cursandoSubjects = useMemo(() => {
    return subjects.filter(s => subjectDetails[s.id]?.status === 'cursando');
  }, [subjectDetails, subjects]);

  const [activeRoom, setActiveRoom] = useState(cursandoSubjects.length > 0 ? cursandoSubjects[0].id : null);

  useEffect(() => {
    if (cursandoSubjects.length > 0 && !cursandoSubjects.find(s => s.id === activeRoom)) setActiveRoom(cursandoSubjects[0].id);
    else if (cursandoSubjects.length === 0) setActiveRoom(null);
  }, [cursandoSubjects]);

  const currentMessages = useMemo(() => {
    return chatMessages.filter(m => m.subjectId === activeRoom);
  }, [chatMessages, activeRoom]);

  const scrollToBottom = () => messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  useEffect(() => scrollToBottom(), [currentMessages]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!msg.trim() || !activeRoom) return;
    await addDoc(collection(db, 'artifacts', appId, 'public', 'data', 'chat'), {
      text: msg, subjectId: activeRoom, authorId: user.uid, authorName: user.displayName || 'Estudiante', timestamp: Date.now()
    });
    setMsg('');
  };

  const bgCard = isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200';

  if (cursandoSubjects.length === 0) {
    return (
      <div className={`max-w-3xl mx-auto h-[600px] flex flex-col items-center justify-center rounded-2xl shadow-sm border p-8 text-center ${bgCard}`}>
        <Users size={64} className={isDarkMode ? 'text-slate-700 mb-4' : 'text-slate-300 mb-4'} />
        <h2 className={`text-2xl font-bold mb-2 ${isDarkMode ? 'text-white' : 'text-slate-700'}`}>Salas de Chat Bloqueadas</h2>
        <p className={isDarkMode ? 'text-slate-400' : 'text-slate-500'}>No estás cursando ninguna materia en este momento. Ve a "Mi Plan de Estudios" y marca una o más materias como <span className="font-bold text-yellow-500">"Cursando actualmente"</span> para unirte a sus grupos de chat.</p>
      </div>
    );
  }

  return (
    <div className={`max-w-5xl mx-auto h-[600px] flex rounded-2xl shadow-sm border overflow-hidden ${bgCard}`}>
      <div className={`w-1/3 sm:w-1/4 border-r flex flex-col ${isDarkMode ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
        <div className={`p-4 text-white shadow-sm z-10 flex items-center gap-2 ${isDarkMode ? 'bg-slate-900 border-b border-teal-900/50 text-teal-400' : 'bg-teal-700'}`}><Users size={18} /><h2 className="font-bold text-sm">Tus Grupos</h2></div>
        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {cursandoSubjects.map(sub => (
            <button key={sub.id} onClick={() => setActiveRoom(sub.id)} className={`w-full text-left p-3 rounded-lg text-sm font-medium transition-colors ${activeRoom === sub.id ? (isDarkMode ? 'bg-teal-900/30 text-teal-400 border border-teal-800/50' : 'bg-teal-100 text-teal-800 shadow-sm border border-teal-200') : (isDarkMode ? 'text-slate-400 hover:bg-slate-800 border border-transparent' : 'text-slate-600 hover:bg-slate-200 border border-transparent')}`}>
              <div className="line-clamp-2 leading-tight">{sub.name}</div>
            </button>
          ))}
        </div>
      </div>
      <div className={`w-2/3 sm:w-3/4 flex flex-col ${isDarkMode ? 'bg-slate-900' : 'bg-white'}`}>
        <div className={`p-4 text-white flex items-center gap-2 shadow-md z-10 ${isDarkMode ? 'bg-slate-800 border-b border-slate-700' : 'bg-teal-600'}`}><MessageSquare size={20} className={isDarkMode ? "text-teal-400" : ""} /> <h2 className={`font-bold truncate ${isDarkMode ? 'text-teal-50' : ''}`}>{subjects.find(s => s.id === activeRoom)?.name}</h2></div>
        <div className={`flex-1 overflow-y-auto p-4 flex flex-col gap-3 ${isDarkMode ? 'bg-slate-950' : 'bg-slate-50/50'}`}>
          {currentMessages.length === 0 && <div className={`text-center mt-20 ${isDarkMode ? 'text-slate-600' : 'text-slate-400'}`}>No hay mensajes en esta materia aún. ¡Rompe el hielo y di hola!</div>}
          {currentMessages.map(m => {
            const isMe = m.authorId === user.uid;
            return (
              <div key={m.id} className={`flex flex-col max-w-[85%] ${isMe ? 'self-end items-end' : 'self-start items-start'}`}>
                <span className={`text-[10px] mb-0.5 px-1 font-medium ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>{m.authorName}</span>
                <div className={`px-4 py-2 rounded-2xl ${isMe ? (isDarkMode ? 'bg-teal-700 text-teal-50 rounded-tr-none' : 'bg-teal-600 text-white rounded-tr-none') : (isDarkMode ? 'bg-slate-800 border border-slate-700 text-slate-200 rounded-tl-none' : 'bg-white border shadow-sm rounded-tl-none text-slate-700')}`}>{m.text}</div>
              </div>
            );
          })}
          <div ref={messagesEndRef} />
        </div>
        <form onSubmit={handleSend} className={`p-3 border-t flex gap-2 ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
          <input type="text" value={msg} onChange={e => setMsg(e.target.value)} placeholder="Escribe un mensaje al grupo..." className={`flex-1 border rounded-full px-4 py-2 outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent ${isDarkMode ? 'bg-slate-950 border-slate-700 text-white placeholder-slate-600' : 'border-slate-300'}`} />
          <button type="submit" className={`p-3 rounded-full transition-colors ${isDarkMode ? 'bg-teal-700 hover:bg-teal-600 text-white' : 'bg-teal-600 hover:bg-teal-700 text-white'}`}><Send size={18}/></button>
        </form>
      </div>
    </div>
  );
}

// ==========================================
// VIEW: ZONA DE CONCENTRACIÓN (YOUTUBE + POMODORO)
// ==========================================
function PomodoroTimer({ isDarkMode }) {
  const [mode, setMode] = useState('study'); // 'study' | 'break'
  const [timeLeft, setTimeLeft] = useState(25 * 60); // 25 min default
  const [isActive, setIsActive] = useState(false);

  useEffect(() => {
    let interval = null;
    if (isActive && timeLeft > 0) {
      interval = setInterval(() => setTimeLeft(t => t - 1), 1000);
    } else if (isActive && timeLeft === 0) {
      setIsActive(false);
      if (mode === 'study') { setMode('break'); setTimeLeft(5 * 60); }
      else { setMode('study'); setTimeLeft(25 * 60); }
    }
    return () => clearInterval(interval);
  }, [isActive, timeLeft, mode]);

  const toggleTimer = () => setIsActive(!isActive);
  const resetTimer = () => { setIsActive(false); setTimeLeft(mode === 'study' ? 25 * 60 : 5 * 60); };
  const changeMode = (newMode) => { setMode(newMode); setIsActive(false); setTimeLeft(newMode === 'study' ? 25 * 60 : 5 * 60); };

  const mins = Math.floor(timeLeft / 60).toString().padStart(2, '0');
  const secs = (timeLeft % 60).toString().padStart(2, '0');

  return (
    <div className={`p-6 rounded-2xl border shadow-sm mb-8 text-center max-w-sm mx-auto ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
      <h3 className={`font-bold text-lg mb-4 flex justify-center items-center gap-2 ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>
        <AlarmClock size={20} className="text-teal-500"/> Técnica Pomodoro
      </h3>
      
      <div className="flex justify-center gap-2 mb-6">
        <button onClick={() => changeMode('study')} className={`px-4 py-1.5 rounded-full font-bold text-sm transition-colors ${mode === 'study' ? (isDarkMode ? 'bg-teal-600 text-white' : 'bg-teal-500 text-white') : (isDarkMode ? 'bg-slate-800 text-slate-400 hover:bg-slate-700' : 'bg-slate-100 text-slate-500 hover:bg-slate-200')}`}>
          <Brain size={14} className="inline mr-1"/> Estudio
        </button>
        <button onClick={() => changeMode('break')} className={`px-4 py-1.5 rounded-full font-bold text-sm transition-colors ${mode === 'break' ? (isDarkMode ? 'bg-emerald-600 text-white' : 'bg-emerald-500 text-white') : (isDarkMode ? 'bg-slate-800 text-slate-400 hover:bg-slate-700' : 'bg-slate-100 text-slate-500 hover:bg-slate-200')}`}>
          <Coffee size={14} className="inline mr-1"/> Descanso
        </button>
      </div>

      <div className={`text-6xl font-black mb-6 tracking-widest tabular-nums ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>
        {mins}:{secs}
      </div>

      <div className="flex justify-center gap-4">
        <button onClick={toggleTimer} className={`w-14 h-14 rounded-full flex items-center justify-center shadow-md transition-colors ${isDarkMode ? 'bg-teal-600 hover:bg-teal-500 text-white' : 'bg-teal-500 hover:bg-teal-600 text-white'}`}>
          {isActive ? <Pause fill="currentColor" size={24}/> : <Play fill="currentColor" size={24} className="ml-1"/>}
        </button>
        <button onClick={resetTimer} className={`w-14 h-14 rounded-full flex items-center justify-center border shadow-sm transition-colors ${isDarkMode ? 'border-slate-700 bg-slate-800 text-slate-400 hover:bg-slate-700' : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'}`} title="Reiniciar">
          <RotateCcw size={20}/>
        </button>
      </div>
    </div>
  );
}

function FocusView({ user, activeStream, setActiveStream, customStreams, isDarkMode }) {
  const [showForm, setShowForm] = useState(false);
  const [streamData, setStreamData] = useState({ title: '', url: '' });

  const STREAMS = [
    { id: 'lofi-1', category: 'Lo-Fi', title: 'Lofi Girl (Beats)', desc: 'Beats relajantes para estudiar', url: 'https://www.youtube.com/embed/jfKfPfyJRdk?autoplay=1', colorLight: 'bg-purple-100 text-purple-700', colorDark: 'bg-purple-900/40 text-purple-400 border border-purple-800/50' },
    { id: 'inst-1', category: 'Instrumental', title: 'Piano Clásico (3 Hs)', desc: 'Concentración profunda', url: 'https://www.youtube.com/embed/WJ3-F02-F_Y?autoplay=1', colorLight: 'bg-blue-100 text-blue-700', colorDark: 'bg-blue-900/40 text-blue-400 border border-blue-800/50' },
  ];

  const handleAddStream = async (e) => {
    e.preventDefault();
    if (!streamData.title || !streamData.url) return;
    let embedUrl = streamData.url;
    if (embedUrl.includes('youtube.com/watch') || embedUrl.includes('youtu.be/')) {
      const videoId = embedUrl.split('v=')[1]?.split('&')[0] || embedUrl.split('youtu.be/')[1]?.split('?')[0];
      if (videoId) embedUrl = `https://www.youtube.com/embed/${videoId}?autoplay=1`;
    }
    await addDoc(collection(db, 'artifacts', appId, 'public', 'data', 'streams'), {
      title: streamData.title, url: embedUrl, category: 'Comunidad', desc: `Añadido por ${user.displayName?.split(' ')[0] || 'Usuario'}`, 
      colorLight: 'bg-teal-100 text-teal-700', colorDark: 'bg-teal-900/40 text-teal-400 border border-teal-800/50', 
      authorId: user.uid, createdAt: Date.now()
    });
    setStreamData({ title: '', url: '' }); setShowForm(false);
  };

  const handleDeleteStream = async (id, authorId) => {
    if (user.uid !== authorId) return;
    await deleteDoc(doc(db, 'artifacts', appId, 'public', 'data', 'streams', id));
    if (activeStream?.id === id) setActiveStream(null);
  };

  const inputBg = isDarkMode ? 'bg-slate-950 border-slate-700 text-white placeholder-slate-600' : 'bg-white border-slate-300 text-slate-900';

  return (
    <div className="max-w-4xl mx-auto text-center animate-in fade-in duration-500">
      <h2 className={`text-2xl font-bold mb-2 ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>Música de Estudio</h2>
      <p className={`mb-8 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>Escucha las estaciones por defecto o añade enlaces de YouTube a la colección comunitaria.</p>
      
      <div className="flex justify-center mb-8">
        <button onClick={() => setShowForm(!showForm)} className={`text-white px-5 py-2.5 rounded-lg transition-colors flex items-center gap-2 shadow-sm font-medium ${isDarkMode ? 'bg-teal-700 hover:bg-teal-600' : 'bg-teal-600 hover:bg-teal-700'}`}>
          {showForm ? <X size={18}/> : <Plus size={18} />} {showForm ? 'Cancelar' : 'Añadir Playlist'}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleAddStream} className={`p-5 rounded-xl border mb-8 grid grid-cols-1 md:grid-cols-2 gap-4 shadow-md max-w-2xl mx-auto text-left ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-teal-200'}`}>
          <div><label className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>Nombre de la Playlist</label><input required placeholder="Ej: Rock instrumental" className={`w-full border p-2.5 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none ${inputBg}`} value={streamData.title} onChange={e => setStreamData({...streamData, title: e.target.value})} /></div>
          <div><label className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>Enlace de YouTube</label><input required placeholder="https://www.youtube.com/watch?v=..." className={`w-full border p-2.5 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none ${inputBg}`} value={streamData.url} onChange={e => setStreamData({...streamData, url: e.target.value})} /></div>
          <button type="submit" className={`md:col-span-2 font-bold py-2.5 rounded-lg transition-colors ${isDarkMode ? 'bg-teal-900/40 text-teal-400 hover:bg-teal-900/60 border border-teal-800/50' : 'bg-teal-50 text-teal-700 hover:bg-teal-100 border border-teal-100'}`}>Compartir con la comunidad</button>
        </form>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 max-w-4xl mx-auto mb-10">
        {[...STREAMS, ...customStreams].map(stream => {
          const isOwner = stream.authorId && user.uid === stream.authorId;
          const isActive = activeStream?.id === stream.id;
          
          return (
            <div key={stream.id} className="relative group">
              {isOwner && (
                <button onClick={(e) => { e.stopPropagation(); handleDeleteStream(stream.id, stream.authorId); }} className={`absolute top-2 right-2 p-1.5 rounded-full hover:text-red-500 shadow-sm z-10 opacity-0 group-hover:opacity-100 transition-all border ${isDarkMode ? 'bg-slate-800 border-slate-700 text-slate-400 hover:bg-slate-700' : 'bg-white border-slate-200 text-slate-300 hover:bg-red-50'}`}><Trash2 size={14} /></button>
              )}
              <button onClick={() => setActiveStream(stream)} className={`w-full h-full p-4 rounded-xl border-2 text-left transition-all flex flex-col ${isActive ? (isDarkMode ? 'border-teal-500 bg-teal-900/20 shadow-[0_0_15px_rgba(20,184,166,0.15)]' : 'border-teal-500 bg-teal-50 shadow-md ring-2 ring-teal-100') : (isDarkMode ? 'bg-slate-900 border-slate-800 hover:border-teal-700' : 'bg-white hover:border-teal-300 hover:shadow-sm border-slate-200')}`}>
                <div className="flex justify-between w-full items-start mb-2"><span className={`text-[10px] px-2 py-0.5 rounded font-bold uppercase tracking-wide border ${isDarkMode ? stream.colorDark : stream.colorLight}`}>{stream.category}</span><PlayCircle className={isActive ? 'text-teal-500' : (isDarkMode ? 'text-slate-600' : 'text-slate-300')} size={18} /></div>
                <h4 className={`font-bold leading-tight mb-1 ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>{stream.title}</h4>
                <p className={`text-[11px] line-clamp-1 ${isDarkMode ? 'text-slate-500' : 'text-slate-500'}`}>{stream.desc}</p>
              </button>
            </div>
          );
        })}
      </div>
      
      <PomodoroTimer isDarkMode={isDarkMode} />
    </div>
  );
}
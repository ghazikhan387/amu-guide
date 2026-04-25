import { Suggestion } from '@/types';

export const suggestions: Suggestion[] = [
  {
    id: 'admissions',
    text: 'What are the admission requirements for undergraduate programs?',
    icon: '🎓',
    category: 'Admissions',
  },
  {
    id: 'history',
    text: "Tell me about AMU's history and founding.",
    icon: '🏛️',
    category: 'History',
  },
  {
    id: 'engineering',
    text: 'What departments does the Faculty of Engineering offer?',
    icon: '⚙️',
    category: 'Departments',
  },
  {
    id: 'hostels',
    text: 'What are the hostel facilities available at AMU?',
    icon: '🏠',
    category: 'Campus Life',
  },
  {
    id: 'international',
    text: 'How do I apply to AMU from outside India?',
    icon: '🌍',
    category: 'International',
  },
  {
    id: 'calendar',
    text: 'What is the academic calendar for 2025–26?',
    icon: '📅',
    category: 'Academics',
  },
];

export const welcomeMessage = {
  title: 'Welcome to AMU Assistant',
  subtitle:
    "I'm here to answer your questions about Aligarh Muslim University. Ask me about admissions, departments, campus life, and more.",
};

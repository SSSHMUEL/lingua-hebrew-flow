import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/components/AuthProvider';

export type LanguageCode = 'he' | 'en';

interface Translations {
  [key: string]: string;
}

const hebrewTranslations: Translations = {
  // Navigation
  'nav.home': 'בית',
  'nav.learn': 'למידה',
  'nav.learned': 'מילים שלמדתי',
  'nav.practice': 'תרגול',
  'nav.flashcards': 'כרטיסיות',
  'nav.quiz': 'שאלון',
  'nav.profile': 'פרופיל',
  'nav.downloads': 'הורדות',
  'nav.subtitles': 'כתוביות AI',
  'nav.login': 'התחברות',
  'nav.logout': 'התנתקות',

  // Common
  'common.loading': 'טוען...',
  'common.error': 'שגיאה',
  'common.save': 'שמור',
  'common.cancel': 'ביטול',
  'common.next': 'הבא',
  'common.previous': 'קודם',
  'common.back': 'חזרה',
  'common.continue': 'המשך',
  'common.start': 'התחל',
  'common.finish': 'סיום',
  'common.search': 'חיפוש',
  'common.noResults': 'לא נמצאו תוצאות',

  // Auth
  'auth.login': 'התחברות',
  'auth.signup': 'הרשמה',
  'auth.email': 'אימייל',
  'auth.password': 'סיסמה',
  'auth.forgotPassword': 'שכחת סיסמה?',

  // Home
  'home.title': 'למד אנגלית',
  'home.subtitle': 'ברמה מקצועית',
  'home.description': 'הצטרף לאלפי מקצוענים שכבר שדרגו את הקריירה שלהם עם השיטה שלנו',
  'home.startJourney': 'התחל את המסע שלך',
  'home.howItWorks': 'איך זה עובד?',
  'home.step1Title': 'למד באתר',
  'home.step1Desc': 'למד מילים חדשות עם השיטה האינטראקטיבית שלנו',
  'home.step2Title': 'התקן תוסף',
  'home.step2Desc': 'התוסף יחליף מילים שלמדת בכל אתר באינטרנט',
  'home.step3Title': 'תרגל תמיד',
  'home.step3Desc': 'תראה את המילים באנגלית בכל גלישה ובכתוביות',
  'home.wordsLearned': 'מילים נלמדו',
  'home.lessonsCompleted': 'שיעורים הושלמו',
  'home.nextLesson': 'השיעור הבא המומלץ',
  'home.dailyExercises': 'תרגילים יומיים',
  'home.startLesson': 'התחל שיעור',

  // Learn
  'learn.title': 'שיעור',
  'learn.lesson': 'שיעור',
  'learn.category': 'קטגוריה',
  'learn.pronunciation': 'הגייה',
  'learn.translation': 'תרגום',
  'learn.example': 'דוגמה במשפט',
  'learn.markLearned': 'למדתי!',
  'learn.alreadyLearned': 'נלמד',
  'learn.wellDone': 'כל הכבוד!',
  'learn.learnedWord': 'למדת את המילה',
  'learn.finishedCategory': 'סיימת את הקטגוריה',
  'learn.allWordsLearned': 'למדת את כל המילים',
  'learn.viewLearned': 'צפה במילים שלמדת',
  'learn.progress': 'התקדמות',
  'learn.outOf': 'מתוך',
  'learn.wordsLearned': 'מילים נלמדו',

  // Learned
  'learned.title': 'מילים נלמדות',
  'learned.noWords': 'עוד לא למדת מילים',
  'learned.startLearning': 'התחל ללמוד',
  'learned.searchPlaceholder': 'חפש מילים...',
  'learned.results': 'תוצאות',
  'learned.learnedAt': 'נלמד ב',
  'learned.remove': 'הסר',
  'learned.removed': 'הוסר',
  'learned.wordRemoved': 'המילה הוסרה מהרשימה',
  'learned.continueLearning': 'המשך ללמוד',

  // Practice
  'practice.title': 'מרכז התרגול',
  'practice.flashcardsTitle': 'כרטיסיות אוצר מילים',
  'practice.flashcardsDesc': 'תרגלו זיכרון מהיר',
  'practice.quizTitle': 'שאלון רב-ברירה',
  'practice.quizDesc': 'בדקו את עצמכם עם שאלות רב-ברירה',
  'practice.toFlashcards': 'לכרטיסיות',
  'practice.toQuiz': 'לשאלון',

  // Flashcards
  'flashcards.title': 'כרטיסיות אוצר מילים',
  'flashcards.flip': 'היפוך',
  'flashcards.listen': 'השמעה',
  'flashcards.markLearned': 'סמן כנלמד',
  'flashcards.noCards': 'אין כרטיסיות להצגה כעת',

  // Quiz
  'quiz.title': 'שאלון רב-ברירה',
  'quiz.chooseCorrect': 'בחרו את התרגום הנכון',
  'quiz.correct': 'תשובה נכונה!',
  'quiz.incorrect': 'תשובה שגויה',
  'quiz.correctAnswer': 'הנכון',
  'quiz.restart': 'אתחל',
  'quiz.notEnoughWords': 'אין מספיק מילים כדי ליצור שאלון',
  'quiz.needAtLeast': 'נדרשות לפחות 4 מילים',

  // Onboarding
  'onboarding.languageTitle': 'באיזה כיוון תרצה ללמוד?',
  'onboarding.languageDesc': 'בחר את כיוון הלמידה המועדף עליך',
  'onboarding.hebrewToEnglish': 'מעברית לאנגלית',
  'onboarding.hebrewToEnglishDesc': 'אני דובר עברית ורוצה ללמוד אנגלית',
  'onboarding.englishToHebrew': 'מאנגלית לעברית',
  'onboarding.englishToHebrewDesc': 'I speak English and want to learn Hebrew',
  'onboarding.levelTitle': 'מה רמת השפה שלך?',
  'onboarding.levelDesc': 'זה יעזור לנו להתאים את התוכן ברמה המתאימה לך',
  'onboarding.topicsTitle': 'באילו נושאים אתה מתעניין?',
  'onboarding.topicsDesc': 'בחר נושאים שמעניינים אותך כדי שנתאים את התוכן (אופציונלי)',
  'onboarding.trialTitle': '30 ימי ניסיון חינם!',
  'onboarding.trialDesc': 'ללא צורך בפרטי תשלום. תוכל להחליט אחר כך.',
  'onboarding.complete': 'בואו נתחיל!',
  'onboarding.welcome': 'ברוך הבא!',
  'onboarding.signupComplete': 'ההרשמה הושלמה בהצלחה',

  // Levels
  'level.beginner': 'מתחיל',
  'level.beginnerDesc': 'אני רק מתחיל ללמוד',
  'level.elementary': 'בסיסי',
  'level.elementaryDesc': 'אני מכיר מילים בסיסיות וביטויים פשוטים',
  'level.intermediate': 'בינוני',
  'level.intermediateDesc': 'אני יכול לנהל שיחה פשוטה',
  'level.upperIntermediate': 'מתקדם בינוני',
  'level.upperIntermediateDesc': 'אני מבין רוב התוכן אבל צריך לשפר',
  'level.advanced': 'מתקדם',
  'level.advancedDesc': 'אני שולט בשפה ברמה גבוהה',

  // Topics
  'topic.business': 'עסקים',
  'topic.travel': 'טיולים',
  'topic.technology': 'טכנולוגיה',
  'topic.food': 'אוכל',
  'topic.sports': 'ספורט',
  'topic.movies': 'סרטים',
  'topic.music': 'מוזיקה',
  'topic.health': 'בריאות',
  'topic.education': 'חינוך',
  'topic.shopping': 'קניות',

  // Profile
  'profile.title': 'פרופיל',
  'profile.settings': 'הגדרות',
  'profile.subscription': 'מנוי',
  'profile.language': 'שפה',
  'profile.level': 'רמה',
  'profile.learningLevel': 'רמת למידה',
  'profile.topics': 'נושאים',
  'profile.accountLevel': 'רמת חשבון',
  'profile.premium': 'פרימיום',
  'profile.inactive': 'חינמית',
  'profile.upgradeToPro': 'שדרג עכשיו',
  'profile.authenticatedUser': 'משתמש מחובר',
  'profile.wordsLearned': 'מילים נלמדו',
  'profile.practice': 'תרגול',
  'profile.continueLearning': 'המשך ללמוד',
  'profile.security': 'אבטחה',
  'profile.resetPassword': 'איפוס סיסמה',
  'profile.signOut': 'התנתק',
  'profile.permanentActions': 'פעולות קבועות',
  'profile.deleteAccount': 'מחק חשבון',
  'profile.languageAndLevel': 'שפה ורמה',
  'profile.interfaceLanguage': 'שפת ממשק',
  'profile.targetProficiency': 'רמת מטרה',
  'profile.applySettings': 'החל הגדרות',
  'profile.learningInterests': 'תחומי עניין ללמידה',
  'profile.savePreferences': 'שמור העדפות',
  'profile.selectCategories': 'בחר את הקטגוריות שמעניינות אותך ביותר בחיי היומיום',
  'profile.upgradePremium': 'שדרוג לחשבון פרימיום',
  'profile.choosePlan': 'בחר את התוכנית המתאימה לך והמשך ללמוד ללא הגבלה',
  'profile.unlockFeatures': 'קבל גישה מלאה לכל התכונות כולל כתוביות AI, מצב אופליין ומודולי למידה מתקדמים',
  'profile.accountManagement': 'ניהול חשבון',
};

const englishTranslations: Translations = {
  // Navigation
  'nav.home': 'Home',
  'nav.learn': 'Learn',
  'nav.learned': 'My Words',
  'nav.practice': 'Practice',
  'nav.flashcards': 'Flashcards',
  'nav.quiz': 'Quiz',
  'nav.profile': 'Profile',
  'nav.downloads': 'Downloads',
  'nav.subtitles': 'AI Subtitles',
  'nav.login': 'Login',
  'nav.logout': 'Logout',

  // Common
  'common.loading': 'Loading...',
  'common.error': 'Error',
  'common.save': 'Save',
  'common.cancel': 'Cancel',
  'common.next': 'Next',
  'common.previous': 'Previous',
  'common.back': 'Back',
  'common.continue': 'Continue',
  'common.start': 'Start',
  'common.finish': 'Finish',
  'common.search': 'Search',
  'common.noResults': 'No results found',

  // Auth
  'auth.login': 'Login',
  'auth.signup': 'Sign Up',
  'auth.email': 'Email',
  'auth.password': 'Password',
  'auth.forgotPassword': 'Forgot password?',

  // Home
  'home.title': 'Learn Hebrew',
  'home.subtitle': 'Like a Pro',
  'home.description': 'Join thousands of professionals who have already upgraded their careers with our method',
  'home.startJourney': 'Start Your Journey',
  'home.howItWorks': 'How It Works?',
  'home.step1Title': 'Learn on Site',
  'home.step1Desc': 'Learn new words with our interactive method',
  'home.step2Title': 'Install Extension',
  'home.step2Desc': 'The extension replaces words you learned on any website',
  'home.step3Title': 'Practice Always',
  'home.step3Desc': 'See words in Hebrew while browsing and in subtitles',
  'home.wordsLearned': 'Words Learned',
  'home.lessonsCompleted': 'Lessons Completed',
  'home.nextLesson': 'Recommended Next Lesson',
  'home.dailyExercises': 'Daily Exercises',
  'home.startLesson': 'Start Lesson',

  // Learn
  'learn.title': 'Lesson',
  'learn.lesson': 'Lesson',
  'learn.category': 'Category',
  'learn.pronunciation': 'Pronunciation',
  'learn.translation': 'Translation',
  'learn.example': 'Example Sentence',
  'learn.markLearned': 'Mark as Learned!',
  'learn.alreadyLearned': 'Learned',
  'learn.wellDone': 'Well Done!',
  'learn.learnedWord': 'You learned the word',
  'learn.finishedCategory': 'You finished the category',
  'learn.allWordsLearned': 'You learned all words',
  'learn.viewLearned': 'View Learned Words',
  'learn.progress': 'Progress',
  'learn.outOf': 'of',
  'learn.wordsLearned': 'words learned',

  // Learned
  'learned.title': 'Learned Words',
  'learned.noWords': 'You haven\'t learned any words yet',
  'learned.startLearning': 'Start Learning',
  'learned.searchPlaceholder': 'Search words...',
  'learned.results': 'results',
  'learned.learnedAt': 'Learned on',
  'learned.remove': 'Remove',
  'learned.removed': 'Removed',
  'learned.wordRemoved': 'Word removed from list',
  'learned.continueLearning': 'Continue Learning',

  // Practice
  'practice.title': 'Practice Center',
  'practice.flashcardsTitle': 'Vocabulary Flashcards',
  'practice.flashcardsDesc': 'Practice quick memory',
  'practice.quizTitle': 'Multiple Choice Quiz',
  'practice.quizDesc': 'Test yourself with multiple choice questions',
  'practice.toFlashcards': 'To Flashcards',
  'practice.toQuiz': 'To Quiz',

  // Flashcards
  'flashcards.title': 'Vocabulary Flashcards',
  'flashcards.flip': 'Flip',
  'flashcards.listen': 'Listen',
  'flashcards.markLearned': 'Mark as Learned',
  'flashcards.noCards': 'No flashcards to display',

  // Quiz
  'quiz.title': 'Multiple Choice Quiz',
  'quiz.chooseCorrect': 'Choose the correct translation',
  'quiz.correct': 'Correct!',
  'quiz.incorrect': 'Incorrect',
  'quiz.correctAnswer': 'Correct answer',
  'quiz.restart': 'Restart',
  'quiz.notEnoughWords': 'Not enough words to create a quiz',
  'quiz.needAtLeast': 'At least 4 words required',

  // Onboarding
  'onboarding.languageTitle': 'Which direction do you want to learn?',
  'onboarding.languageDesc': 'Choose your preferred learning direction',
  'onboarding.hebrewToEnglish': 'Hebrew to English',
  'onboarding.hebrewToEnglishDesc': 'אני דובר עברית ורוצה ללמוד אנגלית',
  'onboarding.englishToHebrew': 'English to Hebrew',
  'onboarding.englishToHebrewDesc': 'I speak English and want to learn Hebrew',
  'onboarding.levelTitle': 'What\'s your language level?',
  'onboarding.levelDesc': 'This helps us customize content to your level',
  'onboarding.topicsTitle': 'What topics interest you?',
  'onboarding.topicsDesc': 'Choose topics you\'re interested in to customize content (optional)',
  'onboarding.trialTitle': '30 Days Free Trial!',
  'onboarding.trialDesc': 'No payment details required. Decide later.',
  'onboarding.complete': 'Let\'s Start!',
  'onboarding.welcome': 'Welcome!',
  'onboarding.signupComplete': 'Registration completed successfully',

  // Levels
  'level.beginner': 'Beginner',
  'level.beginnerDesc': 'I\'m just starting to learn',
  'level.elementary': 'Elementary',
  'level.elementaryDesc': 'I know basic words and simple phrases',
  'level.intermediate': 'Intermediate',
  'level.intermediateDesc': 'I can have simple conversations',
  'level.upperIntermediate': 'Upper Intermediate',
  'level.upperIntermediateDesc': 'I understand most content but need improvement',
  'level.advanced': 'Advanced',
  'level.advancedDesc': 'I have high proficiency in the language',

  // Topics
  'topic.business': 'Business',
  'topic.travel': 'Travel',
  'topic.technology': 'Technology',
  'topic.food': 'Food',
  'topic.sports': 'Sports',
  'topic.movies': 'Movies',
  'topic.music': 'Music',
  'topic.health': 'Health',
  'topic.education': 'Education',
  'topic.shopping': 'Shopping',

  // Profile
  'profile.title': 'Profile',
  'profile.settings': 'Settings',
  'profile.subscription': 'Subscription',
  'profile.language': 'Language',
  'profile.level': 'Level',
  'profile.learningLevel': 'Learning Level',
  'profile.topics': 'Topics',
  'profile.accountLevel': 'Account Level',
  'profile.premium': 'Premium',
  'profile.inactive': 'Free',
  'profile.upgradeToPro': 'Upgrade Now',
  'profile.authenticatedUser': 'Authenticated User',
  'profile.wordsLearned': 'words learned',
  'profile.practice': 'Practice',
  'profile.continueLearning': 'Continue Learning',
  'profile.security': 'Security',
  'profile.resetPassword': 'Reset Password',
  'profile.signOut': 'Sign Out',
  'profile.permanentActions': 'Permanent Actions',
  'profile.deleteAccount': 'Delete Account',
  'profile.languageAndLevel': 'Language & Level',
  'profile.interfaceLanguage': 'Interface Language',
  'profile.targetProficiency': 'Target Proficiency',
  'profile.applySettings': 'Apply Settings',
  'profile.learningInterests': 'Learning Interests',
  'profile.savePreferences': 'Save Preferences',
  'profile.selectCategories': 'Select the categories that matter most to your daily life',
  'profile.upgradePremium': 'Upgrade to Premium',
  'profile.choosePlan': 'Choose the plan that suits you and continue learning without limits',
  'profile.unlockFeatures': 'Unlock all features including AI subtitles, offline mode, and advanced learning modules',
  'profile.accountManagement': 'Account Management',
};

interface LanguageContextType {
  language: LanguageCode;
  sourceLanguage: LanguageCode;
  targetLanguage: LanguageCode;
  setLanguage: (lang: LanguageCode) => void;
  setLearningDirection: (source: LanguageCode, target: LanguageCode) => void;
  t: (key: string) => string;
  isRTL: boolean;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

export const LanguageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [language, setLanguageState] = useState<LanguageCode>(() => {
    // Check localStorage first
    const saved = localStorage.getItem('ui-language');
    if (saved === 'he' || saved === 'en') return saved;
    return 'he'; // Default, will be updated by geo detection
  });
  const [sourceLanguage, setSourceLanguage] = useState<LanguageCode>('he');
  const [targetLanguage, setTargetLanguage] = useState<LanguageCode>('en');
  const [initialized, setInitialized] = useState(false);

  // Detect user's location on first load (only if not logged in and no saved preference)
  useEffect(() => {
    const detectLocation = async () => {
      // Skip if already initialized or user is logged in (will use profile settings)
      if (initialized || user) return;

      const savedLang = localStorage.getItem('ui-language');
      if (savedLang) {
        setInitialized(true);
        return;
      }

      try {
        // Use a free geolocation API
        const response = await fetch('https://ipapi.co/json/');
        const data = await response.json();

        // If user is in Israel, use Hebrew; otherwise use English
        const detectedLang: LanguageCode = data.country_code === 'IL' ? 'he' : 'en';
        setLanguageState(detectedLang);
        localStorage.setItem('ui-language', detectedLang);
      } catch (error) {
        console.log('Could not detect location, defaulting to Hebrew');
      }

      setInitialized(true);
    };

    detectLocation();
  }, [user, initialized]);

  // Load user's language preference from profile
  useEffect(() => {
    const loadUserLanguage = async () => {
      if (!user) return;

      const { data: profile } = await supabase
        .from('profiles')
        .select('source_language, target_language')
        .eq('user_id', user.id)
        .maybeSingle();

      if (profile) {
        const sourceLang = profile.source_language === 'english' ? 'en' : 'he';
        const targetLang = profile.target_language === 'english' ? 'en' : 'he';

        setSourceLanguage(sourceLang);
        setTargetLanguage(targetLang);

        // If user's source language is English, show the UI in English
        setLanguageState(sourceLang);
        localStorage.setItem('ui-language', sourceLang);
      }
      setInitialized(true);
    };

    loadUserLanguage();
  }, [user]);

  const setLanguage = (lang: LanguageCode) => {
    setLanguageState(lang);
    localStorage.setItem('ui-language', lang);
    // Update document direction
    document.documentElement.dir = lang === 'he' ? 'rtl' : 'ltr';
    document.documentElement.lang = lang;

    // Save to profile if user is logged in (fire and forget)
    if (user) {
      (async () => {
        try {
          await supabase
            .from('profiles')
            .update({
              source_language: lang === 'en' ? 'english' : 'hebrew',
            })
            .eq('user_id', user.id);
        } catch (err) {
          console.error('Failed to save language preference:', err);
        }
      })();
    }
  };

  const setLearningDirection = async (source: LanguageCode, target: LanguageCode) => {
    setSourceLanguage(source);
    setTargetLanguage(target);
    setLanguage(source);

    if (user) {
      await supabase
        .from('profiles')
        .update({
          source_language: source === 'en' ? 'english' : 'hebrew',
          target_language: target === 'en' ? 'english' : 'hebrew',
        })
        .eq('user_id', user.id);
    }
  };

  const t = (key: string): string => {
    const translations = language === 'he' ? hebrewTranslations : englishTranslations;
    return translations[key] || key;
  };

  const isRTL = language === 'he';

  // Update document direction on language change
  useEffect(() => {
    document.documentElement.dir = isRTL ? 'rtl' : 'ltr';
    document.documentElement.lang = language;
  }, [language, isRTL]);

  return (
    <LanguageContext.Provider value={{
      language,
      sourceLanguage,
      targetLanguage,
      setLanguage,
      setLearningDirection,
      t,
      isRTL
    }}>
      {children}
    </LanguageContext.Provider>
  );
};

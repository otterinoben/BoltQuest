import React, { createContext, useContext, useEffect, useState } from 'react';

type Language = 'en' | 'es' | 'fr' | 'de';

interface LanguageContextType {
  language: Language;
  setLanguage: (language: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

// Simple translations object
const translations: Record<Language, Record<string, string>> = {
  en: {
    'preferences.title': 'Preferences',
    'preferences.subtitle': 'Customize your BoltQuest experience',
    'preferences.gameSettings': 'Game Settings',
    'preferences.gameSettingsDesc': 'Configure your default game preferences',
    'preferences.defaultCategory': 'Default Category',
    'preferences.defaultDifficulty': 'Default Difficulty',
    'preferences.timerDuration': 'Timer Duration',
    'preferences.showHints': 'Show Hints',
    'preferences.showHintsDesc': 'Display helpful hints during gameplay',
    'preferences.autoPause': 'Auto Pause',
    'preferences.autoPauseDesc': 'Automatically pause when switching tabs',
    'preferences.interfaceSettings': 'Interface Settings',
    'preferences.interfaceSettingsDesc': 'Customize the look and feel of the application',
    'preferences.theme': 'Theme',
    'preferences.language': 'Language',
    'preferences.audioSettings': 'Audio Settings',
    'preferences.soundEffects': 'Sound Effects',
    'preferences.soundEffectsDesc': 'Play sound effects during gameplay',
    'preferences.backgroundMusic': 'Background Music',
    'preferences.backgroundMusicDesc': 'Play background music during gameplay',
    'preferences.notifications': 'Notifications',
    'preferences.notificationsDesc': 'Manage how you receive notifications',
    'preferences.enableNotifications': 'Enable Notifications',
    'preferences.enableNotificationsDesc': 'Receive notifications for achievements, daily tasks, and updates',
    'preferences.quickActions': 'Quick Actions',
    'preferences.quickActionsDesc': 'Common tasks and shortcuts',
    'preferences.updateInterests': 'Update Interests',
    'preferences.resetTutorial': 'Reset Tutorial',
    'preferences.startPlaying': 'Start Playing',
    'preferences.saveChanges': 'Save Changes',
    'preferences.reset': 'Reset',
    'preferences.unsavedChanges': 'Unsaved Changes',
    'preferences.preferencesSaved': 'Preferences saved successfully!',
    'preferences.preferencesReset': 'Preferences reset to saved values',
  },
  es: {
    'preferences.title': 'Preferencias',
    'preferences.subtitle': 'Personaliza tu experiencia BoltQuest',
    'preferences.gameSettings': 'Configuración del Juego',
    'preferences.gameSettingsDesc': 'Configura tus preferencias de juego por defecto',
    'preferences.defaultCategory': 'Categoría por Defecto',
    'preferences.defaultDifficulty': 'Dificultad por Defecto',
    'preferences.timerDuration': 'Duración del Temporizador',
    'preferences.showHints': 'Mostrar Pistas',
    'preferences.showHintsDesc': 'Mostrar pistas útiles durante el juego',
    'preferences.autoPause': 'Pausa Automática',
    'preferences.autoPauseDesc': 'Pausar automáticamente al cambiar de pestaña',
    'preferences.interfaceSettings': 'Configuración de Interfaz',
    'preferences.interfaceSettingsDesc': 'Personaliza la apariencia de la aplicación',
    'preferences.theme': 'Tema',
    'preferences.language': 'Idioma',
    'preferences.audioSettings': 'Configuración de Audio',
    'preferences.soundEffects': 'Efectos de Sonido',
    'preferences.soundEffectsDesc': 'Reproducir efectos de sonido durante el juego',
    'preferences.backgroundMusic': 'Música de Fondo',
    'preferences.backgroundMusicDesc': 'Reproducir música de fondo durante el juego',
    'preferences.notifications': 'Notificaciones',
    'preferences.notificationsDesc': 'Gestiona cómo recibes notificaciones',
    'preferences.enableNotifications': 'Habilitar Notificaciones',
    'preferences.enableNotificationsDesc': 'Recibir notificaciones para logros, tareas diarias y actualizaciones',
    'preferences.quickActions': 'Acciones Rápidas',
    'preferences.quickActionsDesc': 'Tareas comunes y atajos',
    'preferences.updateInterests': 'Actualizar Intereses',
    'preferences.resetTutorial': 'Reiniciar Tutorial',
    'preferences.startPlaying': 'Comenzar a Jugar',
    'preferences.saveChanges': 'Guardar Cambios',
    'preferences.reset': 'Reiniciar',
    'preferences.unsavedChanges': 'Cambios Sin Guardar',
    'preferences.preferencesSaved': '¡Preferencias guardadas exitosamente!',
    'preferences.preferencesReset': 'Preferencias reiniciadas a valores guardados',
  },
  fr: {
    'preferences.title': 'Préférences',
    'preferences.subtitle': 'Personnalisez votre expérience BoltQuest',
    'preferences.gameSettings': 'Paramètres du Jeu',
    'preferences.gameSettingsDesc': 'Configurez vos préférences de jeu par défaut',
    'preferences.defaultCategory': 'Catégorie par Défaut',
    'preferences.defaultDifficulty': 'Difficulté par Défaut',
    'preferences.timerDuration': 'Durée du Minuteur',
    'preferences.showHints': 'Afficher les Indices',
    'preferences.showHintsDesc': 'Afficher des indices utiles pendant le jeu',
    'preferences.autoPause': 'Pause Automatique',
    'preferences.autoPauseDesc': 'Mettre en pause automatiquement lors du changement d\'onglet',
    'preferences.interfaceSettings': 'Paramètres d\'Interface',
    'preferences.interfaceSettingsDesc': 'Personnalisez l\'apparence de l\'application',
    'preferences.theme': 'Thème',
    'preferences.language': 'Langue',
    'preferences.audioSettings': 'Paramètres Audio',
    'preferences.soundEffects': 'Effets Sonores',
    'preferences.soundEffectsDesc': 'Jouer des effets sonores pendant le jeu',
    'preferences.backgroundMusic': 'Musique de Fond',
    'preferences.backgroundMusicDesc': 'Jouer de la musique de fond pendant le jeu',
    'preferences.notifications': 'Notifications',
    'preferences.notificationsDesc': 'Gérez comment vous recevez les notifications',
    'preferences.enableNotifications': 'Activer les Notifications',
    'preferences.enableNotificationsDesc': 'Recevoir des notifications pour les succès, tâches quotidiennes et mises à jour',
    'preferences.quickActions': 'Actions Rapides',
    'preferences.quickActionsDesc': 'Tâches communes et raccourcis',
    'preferences.updateInterests': 'Mettre à Jour les Intérêts',
    'preferences.resetTutorial': 'Réinitialiser le Tutoriel',
    'preferences.startPlaying': 'Commencer à Jouer',
    'preferences.saveChanges': 'Sauvegarder les Modifications',
    'preferences.reset': 'Réinitialiser',
    'preferences.unsavedChanges': 'Modifications Non Sauvegardées',
    'preferences.preferencesSaved': 'Préférences sauvegardées avec succès !',
    'preferences.preferencesReset': 'Préférences réinitialisées aux valeurs sauvegardées',
  },
  de: {
    'preferences.title': 'Einstellungen',
    'preferences.subtitle': 'Passen Sie Ihre BoltQuest-Erfahrung an',
    'preferences.gameSettings': 'Spieleinstellungen',
    'preferences.gameSettingsDesc': 'Konfigurieren Sie Ihre Standard-Spieleinstellungen',
    'preferences.defaultCategory': 'Standardkategorie',
    'preferences.defaultDifficulty': 'Standard-Schwierigkeit',
    'preferences.timerDuration': 'Timer-Dauer',
    'preferences.showHints': 'Hinweise Anzeigen',
    'preferences.showHintsDesc': 'Hilfreiche Hinweise während des Spiels anzeigen',
    'preferences.autoPause': 'Auto-Pause',
    'preferences.autoPauseDesc': 'Automatisch pausieren beim Wechseln von Tabs',
    'preferences.interfaceSettings': 'Interface-Einstellungen',
    'preferences.interfaceSettingsDesc': 'Passen Sie das Aussehen der Anwendung an',
    'preferences.theme': 'Design',
    'preferences.language': 'Sprache',
    'preferences.audioSettings': 'Audio-Einstellungen',
    'preferences.soundEffects': 'Soundeffekte',
    'preferences.soundEffectsDesc': 'Soundeffekte während des Spiels abspielen',
    'preferences.backgroundMusic': 'Hintergrundmusik',
    'preferences.backgroundMusicDesc': 'Hintergrundmusik während des Spiels abspielen',
    'preferences.notifications': 'Benachrichtigungen',
    'preferences.notificationsDesc': 'Verwalten Sie, wie Sie Benachrichtigungen erhalten',
    'preferences.enableNotifications': 'Benachrichtigungen Aktivieren',
    'preferences.enableNotificationsDesc': 'Benachrichtigungen für Erfolge, tägliche Aufgaben und Updates erhalten',
    'preferences.quickActions': 'Schnellaktionen',
    'preferences.quickActionsDesc': 'Häufige Aufgaben und Shortcuts',
    'preferences.updateInterests': 'Interessen Aktualisieren',
    'preferences.resetTutorial': 'Tutorial Zurücksetzen',
    'preferences.startPlaying': 'Spielen Starten',
    'preferences.saveChanges': 'Änderungen Speichern',
    'preferences.reset': 'Zurücksetzen',
    'preferences.unsavedChanges': 'Ungespeicherte Änderungen',
    'preferences.preferencesSaved': 'Einstellungen erfolgreich gespeichert!',
    'preferences.preferencesReset': 'Einstellungen auf gespeicherte Werte zurückgesetzt',
  },
};

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguage] = useState<Language>(() => {
    try {
      const saved = localStorage.getItem('boltquest-language') as Language;
      return saved || 'en';
    } catch {
      return 'en';
    }
  });

  // Save language to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('boltquest-language', language);
    } catch (error) {
      console.error('Failed to save language preference:', error);
    }
  }, [language]);

  const t = (key: string): string => {
    return translations[language][key] || key;
  };

  const value = {
    language,
    setLanguage,
    t,
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}





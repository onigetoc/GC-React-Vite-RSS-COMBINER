export const languages = [
    // Français
    { code: 'fr', label: 'Français' },
    { code: 'fr-FR', label: 'Français (France)' },
    { code: 'fr-CA', label: 'Français (Canada)' },
    { code: 'fr-BE', label: 'Français (Belgique)' },
    { code: 'fr-CH', label: 'Français (Suisse)' },
    
    // Anglais
    { code: 'en', label: 'English' },
    { code: 'en-US', label: 'English (US)' },
    { code: 'en-GB', label: 'English (UK)' },
    { code: 'en-CA', label: 'English (Canada)' },
    { code: 'en-AU', label: 'English (Australia)' },
    
    // Espagnol
    { code: 'es', label: 'Español' },
    { code: 'es-ES', label: 'Español (España)' },
    { code: 'es-MX', label: 'Español (México)' },
    { code: 'es-AR', label: 'Español (Argentina)' },
    
    // Autres langues européennes
    { code: 'de', label: 'Deutsch' },
    { code: 'it', label: 'Italiano' },
    { code: 'pt', label: 'Português' },
    { code: 'nl', label: 'Nederlands' },
    { code: 'ru', label: 'Русский' },
    { code: 'pl', label: 'Polski' },
    
    // Langues asiatiques
    { code: 'zh', label: '中文' },
    { code: 'ja', label: '日本語' },
    { code: 'ko', label: '한국어' },
    
    // ... ajoutez plus de langues selon vos besoins
].sort((a, b) => a.label.localeCompare(b.label));
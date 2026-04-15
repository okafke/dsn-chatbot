export default {
    // ── Common ──────────────────────────────────────────────────────────
    common: {
        logout: 'Abmelden',
        back: '← Zurück',
        loading: 'Laden...',
        language: 'Sprache',
    },

    // ── Auth ────────────────────────────────────────────────────────────
    auth: {
        signIn: 'Anmelden',
        signingIn: 'Anmeldung läuft...',
        createAccount: 'Konto erstellen',
        creatingAccount: 'Konto wird erstellt...',
        username: 'Benutzername',
        password: 'Passwort',
        confirmPassword: 'Passwort bestätigen',
        email: 'E-Mail',
        usernamePlaceholder: 'Benutzername eingeben',
        passwordPlaceholder: 'Passwort eingeben',
        emailPlaceholder: 'du@beispiel.de',
        chooseUsername: 'Benutzername wählen',
        passwordMinLength: 'Mindestens 8 Zeichen',
        repeatPassword: 'Passwort wiederholen',
        noAccount: 'Noch kein Konto?',
        createOne: 'Jetzt erstellen',
        hasAccount: 'Bereits ein Konto?',
        signInLink: 'Anmelden',
        passwordsNoMatch: 'Passwörter stimmen nicht überein',
        passwordTooShort: 'Passwort muss mindestens 8 Zeichen lang sein',
    },

    // ── Game Selection ──────────────────────────────────────────────────
    games: {
        headerTitle: 'DSN Chatbot — Spiele',
        freeChat: '💬 Freier Chat',
        chooseGame: 'Wähle ein Spiel',
        selectToStart: 'Wähle ein Spiel, um loszulegen',
        loadingGames: 'Spiele werden geladen...',
    },

    // ── Game Chat ───────────────────────────────────────────────────────
    gameChat: {
        restart: '🔄 Neustart',
        defaultTitle: 'Spiel',
    },

    // ── Free Chat ───────────────────────────────────────────────────────
    chat: {
        title: 'DSN Chatbot',
        newChat: '+ Neuer Chat',
    },

    // ── Chat Input ──────────────────────────────────────────────────────
    chatInput: {
        placeholder: 'Nachricht eingeben... (Shift+Enter für neue Zeile)',
    },
} as const

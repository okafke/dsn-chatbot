export default {
    // ── Common ──────────────────────────────────────────────────────────
    common: {
        logout: 'Logout',
        back: '← Back',
        loading: 'Loading...',
        language: 'Language',
    },

    // ── Auth ────────────────────────────────────────────────────────────
    auth: {
        signIn: 'Sign In',
        signingIn: 'Signing in...',
        createAccount: 'Create Account',
        creatingAccount: 'Creating account...',
        username: 'Username',
        password: 'Password',
        confirmPassword: 'Confirm Password',
        email: 'Email',
        usernamePlaceholder: 'Enter your username',
        passwordPlaceholder: 'Enter your password',
        emailPlaceholder: 'you@example.com',
        chooseUsername: 'Choose a username',
        passwordMinLength: 'At least 8 characters',
        repeatPassword: 'Repeat your password',
        noAccount: "Don't have an account?",
        createOne: 'Create one',
        hasAccount: 'Already have an account?',
        signInLink: 'Sign in',
        passwordsNoMatch: 'Passwords do not match',
        passwordTooShort: 'Password must be at least 8 characters',
    },

    // ── Game Selection ──────────────────────────────────────────────────
    games: {
        headerTitle: 'DSN Chatbot — Games',
        freeChat: '💬 Free Chat',
        chooseGame: 'Choose a Game',
        selectToStart: 'Select a game to start playing',
        loadingGames: 'Loading games...',
    },

    // ── Game Chat ───────────────────────────────────────────────────────
    gameChat: {
        restart: '🔄 Restart',
        defaultTitle: 'Game',
    },

    // ── Free Chat ───────────────────────────────────────────────────────
    chat: {
        title: 'DSN Chatbot',
        newChat: '+ New Chat',
    },

    // ── Chat Input ──────────────────────────────────────────────────────
    chatInput: {
        placeholder: 'Type a message... (Shift+Enter for new line)',
    },
} as const

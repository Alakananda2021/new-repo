export type Tone = "professional" | "playful" | "chaotic";

export type PreviewVariant =
  // Generic
  | 'empty-list'
  | 'modal-error'
  | 'inline-banner'
  | 'toast'
  | 'disabled-state'
  | 'loading-skeleton'
  | 'empty-inbox'
  | 'form-error'
  | 'confirmation-modal'
  | 'locked-feature'
  | 'countdown-timer'
  | 'duplicate-item'
  // Category-specific
  | 'upload-zone'
  | 'upload-error'
  | 'cart-empty'
  | 'payment-declined'
  | 'search-no-results'
  | 'calendar-empty'
  | 'calendar-conflict'
  | 'outofstock'
  | 'signup-form'
  | 'chat-empty'
  | 'post-feed-empty'
  | 'profile-incomplete'
  | 'booking-taken';

export interface State {
  title: string;
  microcopy: string;
  cta?: string;
  type: 'empty' | 'error' | 'edge';
  preview: PreviewVariant;
}

export interface FlowStep {
  stepName: string;
  stepDescription: string;
  states: State[];
}

export type FlowSteps = FlowStep[];

const professionalFlowSteps: FlowSteps = [
  {
    stepName: "Sign up",
    stepDescription: "User creates a new account",
    states: [
      {
        title: "Email already registered",
        microcopy: "An account with this email already exists. You can sign in or reset your password if you've forgotten it.",
        cta: "Sign in instead",
        type: "error",
        preview: "form-error",
      },
      {
        title: "Password requirements not met",
        microcopy: "Your password must be at least 8 characters and include one number and one special character.",
        cta: "Update password",
        type: "error",
        preview: "inline-banner",
      },
      {
        title: "Registration temporarily unavailable",
        microcopy: "We're experiencing high traffic. New signups are temporarily paused. Please try again in a few minutes.",
        type: "edge",
        preview: "modal-error",
      },
      {
        title: "Account created during maintenance",
        microcopy: "Your account was created, but some features may be limited during our scheduled maintenance window.",
        cta: "View status",
        type: "edge",
        preview: "toast",
      },
    ],
  },
  {
    stepName: "Email verification",
    stepDescription: "User confirms their email address",
    states: [
      {
        title: "Verification email not received",
        microcopy: "Haven't received your verification email? Check your spam folder or request a new one.",
        cta: "Resend email",
        type: "empty",
        preview: "empty-inbox",
      },
      {
        title: "Verification link expired",
        microcopy: "This verification link expired after 24 hours for security. Request a new verification email to continue.",
        cta: "Get new link",
        type: "error",
        preview: "modal-error",
      },
      {
        title: "Already verified",
        microcopy: "This email address has already been verified. You can proceed directly to your dashboard.",
        cta: "Go to dashboard",
        type: "edge",
        preview: "confirmation-modal",
      },
      {
        title: "Verification email rate limited",
        microcopy: "You've requested multiple verification emails recently. Please wait 10 minutes before requesting another.",
        type: "edge",
        preview: "countdown-timer",
      },
    ],
  },
  {
    stepName: "Dashboard landing",
    stepDescription: "User arrives at their main dashboard",
    states: [
      {
        title: "No projects created",
        microcopy: "Your workspace is empty. Create your first project to start organizing your work.",
        cta: "Create project",
        type: "empty",
        preview: "empty-list",
      },
      {
        title: "Dashboard failed to load",
        microcopy: "We couldn't load your dashboard data. This may be a temporary connection issue.",
        cta: "Retry loading",
        type: "error",
        preview: "inline-banner",
      },
      {
        title: "Account pending verification",
        microcopy: "Your dashboard has limited functionality until email verification is complete. Check your inbox to activate all features.",
        cta: "Verify now",
        type: "edge",
        preview: "locked-feature",
      },
      {
        title: "First-time user onboarding",
        microcopy: "Welcome! We're setting up your personalized experience. This usually takes about 30 seconds.",
        type: "empty",
        preview: "loading-skeleton",
      },
    ],
  },
];

const playfulFlowSteps: FlowSteps = [
  {
    stepName: "Sign up",
    stepDescription: "User creates a new account",
    states: [
      {
        title: "Déjà vu detected",
        microcopy: "Hey, we know you! This email's already in our system. Time to sign in instead?",
        cta: "Take me to sign in",
        type: "error",
        preview: "form-error",
      },
      {
        title: "Password needs muscles",
        microcopy: "Your password could use some strengthening. Add a number and special character to keep the bad guys out.",
        cta: "Beef it up",
        type: "error",
        preview: "inline-banner",
      },
      {
        title: "Traffic jam ahead",
        microcopy: "Whoa, everyone wants in right now! New signups are taking a coffee break. Back in 5 minutes.",
        type: "edge",
        preview: "modal-error",
      },
      {
        title: "Created during nap time",
        microcopy: "You're in! Just FYI, we're doing some behind-the-scenes maintenance, so a few things might be sleepy.",
        cta: "See what's up",
        type: "edge",
        preview: "toast",
      },
    ],
  },
  {
    stepName: "Email verification",
    stepDescription: "User confirms their email address",
    states: [
      {
        title: "Email playing hide and seek",
        microcopy: "No verification email yet? Maybe it's in spam jail. Or we can send you a fresh one.",
        cta: "Send another one",
        type: "empty",
        preview: "empty-inbox",
      },
      {
        title: "Link expired (oops)",
        microcopy: "That link had a 24-hour lifespan and it's used it up. Let's get you a shiny new one!",
        cta: "Hook me up",
        type: "error",
        preview: "modal-error",
      },
      {
        title: "Mission already accomplished",
        microcopy: "Plot twist: you already verified this email! You're ahead of the game. Go on, head to your dashboard.",
        cta: "To the dashboard!",
        type: "edge",
        preview: "confirmation-modal",
      },
      {
        title: "Whoa there, speedy",
        microcopy: "Too many email requests! Take a 10-minute breather and we'll be ready to send another.",
        type: "edge",
        preview: "countdown-timer",
      },
    ],
  },
  {
    stepName: "Dashboard landing",
    stepDescription: "User arrives at their main dashboard",
    states: [
      {
        title: "The blank canvas",
        microcopy: "Nothing here yet, but that's about to change. Create your first project and watch the magic happen.",
        cta: "Start creating",
        type: "empty",
        preview: "empty-list",
      },
      {
        title: "Dashboard is camera shy",
        microcopy: "Your dashboard's hiding from us right now. Probably just a connection hiccup. Want to try again?",
        cta: "Give it another shot",
        type: "error",
        preview: "inline-banner",
      },
      {
        title: "Verify first, play later",
        microcopy: "Your dashboard is on training wheels until you verify your email. Quick trip to your inbox should fix that!",
        cta: "Let me verify",
        type: "edge",
        preview: "locked-feature",
      },
      {
        title: "Rolling out the red carpet",
        microcopy: "Hold tight! We're personalizing your experience and making everything perfect. ~30 seconds of suspense.",
        type: "empty",
        preview: "loading-skeleton",
      },
    ],
  },
];

const chaoticFlowSteps: FlowSteps = [
  {
    stepName: "Sign up",
    stepDescription: "User creates a new account",
    states: [
      {
        title: "EMAIL_COLLISION_DETECTED",
        microcopy: "This email already lives here. Are you trying to clone yourself? Because that's... not how this works.",
        cta: "Fine, I'll sign in",
        type: "error",
        preview: "form-error",
      },
      {
        title: "Password: too smol",
        microcopy: "Your password is giving 'easily hackable' energy. Throw in a number and a weird symbol. Make it chaotic.",
        cta: "Make it spicy",
        type: "error",
        preview: "inline-banner",
      },
      {
        title: "Server said 'not today'",
        microcopy: "Too many people are trying to sign up. The server is overwhelmed. It needs a moment. We all need a moment.",
        type: "edge",
        preview: "modal-error",
      },
      {
        title: "Welcome to maintenance mode",
        microcopy: "You technically signed up, but we're also technically fixing stuff. So... partial success? You'll survive.",
        cta: "What's broken?",
        type: "edge",
        preview: "toast",
      },
    ],
  },
  {
    stepName: "Email verification",
    stepDescription: "User confirms their email address",
    states: [
      {
        title: "Email? What email?",
        microcopy: "Verification email went to the shadow realm (or spam). We can send another if you want. Or don't. Whatever.",
        cta: "Sure, send it",
        type: "empty",
        preview: "empty-inbox",
      },
      {
        title: "Link.exe has expired",
        microcopy: "That link lasted 24 hours and then spontaneously combusted. Need a new one? Course you do.",
        cta: "Gimme",
        type: "error",
        preview: "modal-error",
      },
      {
        title: "YOU ALREADY DID THIS",
        microcopy: "This email is verified. Like, done. Finito. Were you testing us? Stop testing us. Go to your dashboard.",
        cta: "Okay geez",
        type: "edge",
        preview: "confirmation-modal",
      },
      {
        title: "Rate limited into oblivion",
        microcopy: "You clicked 'resend' too many times and now the system is mad. Wait 10 mins. Maybe reflect on your choices.",
        type: "edge",
        preview: "countdown-timer",
      },
    ],
  },
  {
    stepName: "Dashboard landing",
    stepDescription: "User arrives at their main dashboard",
    states: [
      {
        title: "Emptiness: a vibe",
        microcopy: "No projects yet. Your dashboard is a zen void. Will you disturb the void? Will you create?",
        cta: "Disturb void",
        type: "empty",
        preview: "empty-list",
      },
      {
        title: "Dashboard machine broke",
        microcopy: "Can't load your dashboard. Could be us, could be your wifi, could be solar flares. Who knows. Retry?",
        cta: "Blame physics",
        type: "error",
        preview: "inline-banner",
      },
      {
        title: "Locked until you verify",
        microcopy: "Dashboard is in demo mode because you didn't verify your email. It's like a free trial but more judgmental.",
        cta: "Fine I'll verify",
        type: "edge",
        preview: "locked-feature",
      },
      {
        title: "Generating your chaos...",
        microcopy: "Setting up your personalized dashboard. This takes ~30 seconds. Or longer. Time is a construct anyway.",
        type: "empty",
        preview: "loading-skeleton",
      },
    ],
  },
];

export function getFlowStepsByTone(tone: Tone): FlowSteps {
  switch (tone) {
    case "professional":
      return professionalFlowSteps;
    case "playful":
      return playfulFlowSteps;
    case "chaotic":
      return chaoticFlowSteps;
  }
}

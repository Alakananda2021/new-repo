import type { Tone, FlowSteps, State, PreviewVariant } from "../data/states";

// ─── Types ────────────────────────────────────────────────────────────────────

type StepCategory =
  | "auth-signup" | "auth-login" | "email-verify"
  | "upload-media" | "upload-file"
  | "social-post" | "social-comment" | "social-react"
  | "commerce-cart" | "commerce-checkout" | "commerce-subscribe"
  | "search" | "navigation"
  | "profile-edit" | "invite" | "schedule"
  | "content-create" | "content-delete"
  | "messaging" | "generic";

interface StepInfo {
  category: StepCategory;
  subject: string;
  verb: string;
}

export interface ParsedStep {
  action: string;
  context: string;
  info: StepInfo;
}

// ─── Classification ───────────────────────────────────────────────────────────

const NOUNS = [
  "project", "task", "item", "product", "service", "post", "article",
  "comment", "message", "notification", "dashboard", "feed", "list",
  "cart", "order", "payment", "subscription", "plan",
  "playlist", "song", "track", "album", "podcast",
  "photo", "image", "video", "clip", "reel", "file", "document", "pdf", "csv",
  "profile", "account", "team", "workspace", "channel", "group",
  "event", "meeting", "appointment", "booking", "reservation",
  "flight", "hotel", "restaurant", "table", "room", "seat",
  "report", "review", "rating", "note", "folder", "collection",
  "recipe", "ingredient", "contact", "deal", "lead",
  "ticket", "issue", "branch", "commit", "repository", "repo",
  "course", "lesson", "quiz", "certificate", "badge",
  "post", "story", "reel", "tweet", "pin",
  "property", "listing", "offer", "bid",
  "patient", "appointment", "prescription", "invoice",
];

function extractNoun(text: string): string {
  return NOUNS.find(n => text.includes(n)) || "";
}

// Avoids "resultss" when a subject noun (e.g. "results") is already plural.
function pluralize(word: string): string {
  return word.endsWith("s") ? word : `${word}s`;
}

function extractSubjectFromText(text: string): string {
  const stopWords = new Set([
    'user', 'users', 'the', 'a', 'an', 'to', 'and', 'or', 'of', 'in', 'on',
    'at', 'by', 'for', 'with', 'from', 'their', 'its', 'is', 'are', 'was',
    'were', 'be', 'been', 'have', 'has', 'had', 'do', 'does', 'did', 'will',
    'would', 'can', 'could', 'should', 'may', 'might', 'that', 'this', 'into',
    'onto', 'up', 'out', 'over', 'about', 'after', 'before', 'through', 'then',
    'how', 'what', 'when', 'where', 'which', 'who', 'my', 'your', 'his', 'her',
    'they', 'opens', 'views', 'sees', 'goes', 'lands', 'arrives', 'gets', 'sets',
  ]);
  const words = text.toLowerCase().split(/\s+/);
  const isCandidate = (w: string) =>
    w.length > 3 && !stopWords.has(w) && !/^(lands?|opens?|views?|sees?|goes?|gets?|sets?)$/.test(w);
  // Search from the end, not the start: English verb phrases put the object
  // noun last ("take a WALK", "share fitness GOAL"), while the front is
  // almost always the verb itself ("TAKE a walk") — a bad subject to reuse
  // in copy like "No {subject} yet".
  for (let i = words.length - 1; i >= 0; i--) {
    if (isCandidate(words[i])) return words[i];
  }
  return "";
}

function classifyStep(text: string): StepInfo {
  const t = text.toLowerCase();

  if (/sign[\s-]?up|register|creat.*account/.test(t))
    return { category: "auth-signup", subject: "account", verb: "sign up" };

  if (/sign[\s-]?in|log[\s-]?in|login|authenticate/.test(t))
    return { category: "auth-login", subject: "account", verb: "sign in" };

  if (/sign[\s-]?out|log[\s-]?out|logout|signout/.test(t))
    return { category: "auth-login", subject: "session", verb: "sign out" };

  if (/reset.*password|forgot.*password|password.*reset|recover.*account/.test(t))
    return { category: "profile-edit", subject: "password", verb: "reset" };

  if (/verif|confirm.*email|email.*confirm/.test(t))
    return { category: "email-verify", subject: "email", verb: "verify" };

  if (/upload.*(photo|image|picture|screenshot|selfie)|(photo|image|picture|selfie).*upload/.test(t))
    return { category: "upload-media", subject: "photo", verb: "upload" };
  if (/upload.*(video|clip|reel|recording)|(video|clip|reel).*upload/.test(t))
    return { category: "upload-media", subject: "video", verb: "upload" };
  if (/upload|attach|import/.test(t)) {
    const subj = /doc(ument)?/.test(t) ? "document" : /pdf/.test(t) ? "PDF" : /csv/.test(t) ? "CSV" : /image|photo/.test(t) ? "image" : "file";
    return { category: "upload-file", subject: subj, verb: "upload" };
  }

  if (/comment|reply|respond/.test(t))
    return { category: "social-comment", subject: "comment", verb: "comment" };

  if (/follow|unfollow/.test(t))
    return { category: "social-react", subject: "user", verb: "follow" };
  if (/like|heart|upvote|react/.test(t))
    return { category: "social-react", subject: "post", verb: "like" };

  if (/post|publish|share.*(update|post|content)|write.*(post|article)/.test(t)) {
    const subj = /article/.test(t) ? "article" : /video/.test(t) ? "video" : /photo/.test(t) ? "photo" : "post";
    return { category: "social-post", subject: subj, verb: "publish" };
  }

  if (/add.*cart|cart|basket/.test(t)) {
    const subj = /ticket/.test(t) ? "ticket" : /product/.test(t) ? "product" : extractNoun(t) || "item";
    return { category: "commerce-cart", subject: subj, verb: "add to cart" };
  }
  if (/check.*out|checkout|place.*order|complete.*order|purchase|buy/.test(t))
    return { category: "commerce-checkout", subject: "order", verb: "check out" };
  if (/subscri|upgrade.*plan|choose.*plan|select.*plan/.test(t))
    return { category: "commerce-subscribe", subject: "subscription", verb: "subscribe" };

  if (/book|schedule|reserv|appointment/.test(t)) {
    const subj = /meeting/.test(t) ? "meeting" : /appointment/.test(t) ? "appointment" : /flight/.test(t) ? "flight" : /hotel/.test(t) ? "hotel" : /event/.test(t) ? "event" : "booking";
    return { category: "schedule", subject: subj, verb: "book" };
  }

  if (/invite|refer.*friend|share.*link|collaborat/.test(t))
    return { category: "invite", subject: "invitation", verb: "invite" };

  if (/send.*message|message|chat|dm|direct.*message|inbox/.test(t))
    return { category: "messaging", subject: "message", verb: "send" };

  if (/edit.*profile|update.*profile|change.*password|update.*settings|configur/.test(t)) {
    const subj = /password/.test(t) ? "password" : /avatar|photo/.test(t) ? "profile photo" : /bio/.test(t) ? "bio" : "profile";
    return { category: "profile-edit", subject: subj, verb: "update" };
  }

  if (/delete|remov|archiv|clear/.test(t)) {
    const subj = extractNoun(t) || "item";
    return { category: "content-delete", subject: subj, verb: "delete" };
  }

  if (/create|add|start|new|build|make/.test(t)) {
    const subj = extractNoun(t) || "item";
    return { category: "content-create", subject: subj, verb: "create" };
  }

  if (/search|filter|browse|find|discover|explore/.test(t)) {
    const subj = extractNoun(t) || "results";
    return { category: "search", subject: subj, verb: "search" };
  }

  if (/land|arrive|redirect|navigate|goes? to|dashboard|home.*page|feed|timeline/.test(t)) {
    const subj = /dashboard/.test(t) ? "dashboard" : /feed|timeline/.test(t) ? "feed" : /inbox/.test(t) ? "inbox" : /home/.test(t) ? "home" : extractNoun(t) || "page";
    return { category: "navigation", subject: subj, verb: "view" };
  }

  const subj = extractNoun(t) || extractSubjectFromText(t) || "content";
  return { category: "generic", subject: subj, verb: "complete" };
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function cap(s: string) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

function p<T>(tone: Tone, pro: T, play: T, chaos: T): T {
  return tone === "professional" ? pro : tone === "playful" ? play : chaos;
}

function makeState(
  title: string,
  microcopy: string,
  type: State["type"],
  preview: PreviewVariant,
  cta?: string
): State {
  return { title, microcopy, type, preview, ...(cta ? { cta } : {}) };
}

// ─── Per-Category State Generators ───────────────────────────────────────────

function genEmpty(info: StepInfo, tone: Tone): State {
  const { category, subject } = info;

  switch (category) {
    case "auth-signup":
      return makeState(
        p(tone, "Start your journey", "Nothing here yet!", "VOID DETECTED"),
        p(tone,
          "You haven't created an account yet. Sign up to get started.",
          "No account? No problem! Sign up and join the party.",
          "No account. No identity. No existence. Fix that."
        ),
        "empty", "signup-form",
        p(tone, "Create account", "Let's go", "Become real")
      );

    case "auth-login":
      return makeState(
        p(tone, "No active session", "You're not logged in", "WHO ARE YOU"),
        p(tone,
          "You'll need to sign in before accessing this area.",
          "Looks like you snuck out. Sign back in to continue!",
          "Session doesn't exist. You may not exist. Sign in to confirm you're real."
        ),
        "empty", "locked-feature",
        p(tone, "Sign in", "Take me back", "Prove existence")
      );

    case "email-verify":
      return makeState(
        p(tone, "Verification email sent", "Check your inbox!", "Email dispatched (probably)"),
        p(tone,
          "We've sent a verification link to your email. Check your inbox to continue.",
          "A magical verification link is waiting in your inbox. Go find it!",
          "Verification email is somewhere out there. Spam folder? The void? Check both."
        ),
        "empty", "empty-inbox",
        p(tone, "Resend email", "Send another", "Try again I guess")
      );

    case "upload-media":
      return makeState(
        p(tone, `No ${pluralize(subject)} uploaded yet`, `Your ${subject} gallery is empty`, `${subject.toUpperCase()}_NOT_FOUND`),
        p(tone,
          `Upload your first ${subject} to get started.`,
          `Your ${subject} gallery is a blank canvas. Upload something and make it pop!`,
          `Zero ${pluralize(subject)}. The gallery stares back, empty and judgmental. Feed it.`
        ),
        "empty", "upload-zone",
        p(tone, `Upload ${subject}`, `Add a ${subject}`, `Summon ${subject}`)
      );

    case "upload-file":
      return makeState(
        p(tone, `No ${pluralize(subject)} attached`, `Nothing here yet`, `FILE_VOID`),
        p(tone,
          `No ${pluralize(subject)} have been uploaded. Attach one to proceed.`,
          `This is looking pretty empty! Drop a ${subject} in to get things moving.`,
          `No ${pluralize(subject)} detected. The upload zone waits, hollow and hungry.`
        ),
        "empty", "upload-zone",
        p(tone, `Attach ${subject}`, `Drop a ${subject}`, `Feed the void`)
      );

    case "social-post":
      return makeState(
        p(tone, `No ${pluralize(subject)} yet`, `Nothing posted yet`, `POST_COUNT: 0`),
        p(tone,
          `You haven't published any ${pluralize(subject)}. Create your first one to get started.`,
          `Your profile is fresh and quiet. Write your first ${subject} and break the silence!`,
          `Zero ${pluralize(subject)}. Either you're very private or you haven't started yet. Both valid.`
        ),
        "empty", "post-feed-empty",
        p(tone, `Write a ${subject}`, `Post something`, `Scream into void`)
      );

    case "social-comment":
      return makeState(
        p(tone, "No comments yet", "Be the first to comment!", "COMMENT_DIMENSION: EMPTY"),
        p(tone,
          "No one has commented yet. Start the conversation.",
          "Crickets! Be the first brave soul to drop a comment.",
          "Zero comments. The post sits alone. Uncommented. Unloved. Fix it."
        ),
        "empty", "empty-list",
        p(tone, "Add a comment", "Say something!", "Break the silence")
      );

    case "social-react":
      return makeState(
        p(tone, `No ${pluralize(subject)} followed yet`, `Your list is empty`, `FOLLOWING: NULL`),
        p(tone,
          `You're not following any ${pluralize(subject)} yet. Explore to find some.`,
          `Your following list is as empty as a Monday morning. Go find some ${pluralize(subject)}!`,
          `Following list: barren. Desolate. A wasteland of unfollowed ${pluralize(subject)}.`
        ),
        "empty", "empty-list",
        p(tone, `Find ${pluralize(subject)} to follow`, `Let's explore`, `Populate the void`)
      );

    case "commerce-cart":
      return makeState(
        p(tone, "Your cart is empty", "Nothing in your cart yet!", "CART: VOID"),
        p(tone,
          `Add ${pluralize(subject)} to your cart to get started.`,
          `Your cart is lonely! Add some ${pluralize(subject)} and treat yourself.`,
          `Cart contains: nothing. Absolute zero. The capitalist void awaits your participation.`
        ),
        "empty", "cart-empty",
        p(tone, `Browse ${pluralize(subject)}`, `Shop now`, `Feed the cart`)
      );

    case "commerce-checkout":
      return makeState(
        p(tone, "No recent orders", "You haven't ordered yet", "ORDER_HISTORY: []"),
        p(tone,
          "You haven't placed any orders yet. Browse to find something you like.",
          "No orders yet—your order history is a blank page waiting to be written!",
          "Order history is empty. Either you're frugal or you just got here. Either way, nothing to show."
        ),
        "empty", "empty-list",
        p(tone, "Start shopping", "Browse now", "Initiate commerce")
      );

    case "commerce-subscribe":
      return makeState(
        p(tone, "No active subscription", "You're on the free plan", "SUBSCRIPTION: UNDEFINED"),
        p(tone,
          "You don't have an active subscription. Upgrade to unlock all features.",
          "You're rocking the free tier! Upgrade anytime to unlock the good stuff.",
          "No subscription detected. You exist in the free-tier purgatory. Escape is optional."
        ),
        "empty", "locked-feature",
        p(tone, "View plans", "See what's available", "Escape purgatory")
      );

    case "search":
      return makeState(
        p(tone, `No ${pluralize(subject)} found`, "No results match your search", "RESULTS: []"),
        p(tone,
          `We couldn't find any ${pluralize(subject)} matching your search. Try different keywords.`,
          `Hmm, no ${pluralize(subject)} found! Try a different search—maybe it's hiding?`,
          `Search returned nothing. Either it doesn't exist or your spelling is creative.`
        ),
        "empty", "search-no-results",
        p(tone, "Clear filters", "Try again", "Search differently")
      );

    case "navigation":
      return makeState(
        p(tone, `Your ${subject} is empty`, `Nothing here yet`, `${subject.toUpperCase()}: EMPTY`),
        p(tone,
          `Your ${subject} is empty. Start adding content to see it here.`,
          `Your ${subject} is a blank canvas! Add something to fill it up.`,
          `${cap(subject)}: empty. A clean slate. Or a bug. Probably not a bug.`
        ),
        "empty", "empty-list",
        p(tone, "Get started", "Add something", "Populate")
      );

    case "profile-edit":
      return makeState(
        p(tone, `${cap(subject)} not set`, `You haven't added a ${subject} yet`, `${subject.toUpperCase()}: NULL`),
        p(tone,
          `Your ${subject} hasn't been set up yet. Add one to complete your profile.`,
          `No ${subject} yet! Add one so people know who you are.`,
          `${cap(subject)} is undefined. You're technically incomplete. Fix that.`
        ),
        "empty", "profile-incomplete",
        p(tone, `Add ${subject}`, `Set it up`, `Define yourself`)
      );

    case "invite":
      return makeState(
        p(tone, "No invitations sent", "Your invite list is empty", "INVITES: []"),
        p(tone,
          "You haven't invited anyone yet. Share your invite link to get started.",
          "No invites sent yet! Share the love and get your people in.",
          "Invite list: empty. You're alone here. Is that intentional? Maybe."
        ),
        "empty", "empty-inbox",
        p(tone, "Send invites", "Invite someone", "End the loneliness")
      );

    case "schedule":
      return makeState(
        p(tone, `No upcoming ${pluralize(subject)}`, `Your calendar is clear`, `${pluralize(subject).toUpperCase()}: NONE`),
        p(tone,
          `You have no upcoming ${pluralize(subject)} scheduled. Book one to get started.`,
          `Your calendar is gloriously empty! Or terrifyingly empty. Book a ${subject}?`,
          `No ${pluralize(subject)}. The calendar is a void. Time moves, but nothing is scheduled.`
        ),
        "empty", "calendar-empty",
        p(tone, `Book a ${subject}`, `Schedule now`, `Populate the timeline`)
      );

    case "content-create":
      return makeState(
        p(tone, `No ${pluralize(subject)} yet`, `Your ${subject} list is empty`, `${subject.toUpperCase()}_COUNT: 0`),
        p(tone,
          `You haven't created any ${pluralize(subject)} yet. Create your first one to get started.`,
          `Empty ${subject} list—the possibilities are endless! Create your first one.`,
          `${subject.toUpperCase()} list is empty. The void awaits your creative contributions.`
        ),
        "empty", "empty-list",
        p(tone, `Create ${subject}`, `Start building`, `Birth something`)
      );

    case "content-delete":
      return makeState(
        p(tone, `No ${pluralize(subject)} to delete`, `Nothing here to remove`, `DELETE_TARGET: NULL`),
        p(tone,
          `There are no ${pluralize(subject)} available to delete.`,
          `Nothing to delete here—this place is already squeaky clean!`,
          `Nothing to delete. Either it's already gone or it never existed. Schrödinger's ${subject}.`
        ),
        "empty", "empty-list"
      );

    case "messaging":
      return makeState(
        p(tone, "No messages yet", "Your inbox is empty", "INBOX: VOID"),
        p(tone,
          "You don't have any messages yet. They'll appear here when someone reaches out.",
          "Inbox zero—because there's nothing yet! Start a conversation!",
          "No messages. Pure inbox silence. Either nobody likes you or you just got here."
        ),
        "empty", "chat-empty",
        p(tone, "Start a conversation", "Send a message", "Break the silence")
      );

    default: {
      const s = subject || "content";
      return makeState(
        p(tone, `No ${s} yet`, `Your ${s} space is empty`, `${s.toUpperCase()}: VOID`),
        p(tone,
          `You don't have any ${s} here yet. Complete the previous step to populate this section.`,
          `Nothing here yet! Once you get going, your ${s} will show up here.`,
          `${cap(s)} count: zero. The void is patient. Are you?`
        ),
        "empty", "empty-list",
        p(tone, "Get started", `Add ${s}`, `Summon ${s}`)
      );
    }
  }
}

function genPrimaryError(info: StepInfo, tone: Tone): State {
  const { category, subject, verb } = info;

  switch (category) {
    case "auth-signup":
      return makeState(
        p(tone, "Email already registered", "That email's taken!", "EMAIL_COLLISION_DETECTED"),
        p(tone,
          "An account with this email already exists. Sign in or reset your password.",
          "Oops! That email already has an account. Time to sign in instead?",
          "Email already lives here. Are you cloning yourself? Not how this works."
        ),
        "error", "form-error",
        p(tone, "Sign in instead", "Take me to sign in", "Fine, I'll sign in")
      );

    case "auth-login":
      return makeState(
        p(tone, "Invalid credentials", "That didn't work", "ACCESS_DENIED"),
        p(tone,
          "The email or password you entered is incorrect. Please check and try again.",
          "Hmm, those credentials aren't right. Typo? Wrong account? Let's try again!",
          "Login rejected. The system said no. Loudly. Maybe a typo. Maybe fate."
        ),
        "error", "form-error",
        p(tone, "Try again", "Give it another go", "Retry login")
      );

    case "email-verify":
      return makeState(
        p(tone, "Verification link expired", "That link has gone stale", "LINK_DECEASED"),
        p(tone,
          "This verification link expired after 24 hours. Request a new one to continue.",
          "That link had a 24-hour shelf life and it's all used up! Get a fresh one.",
          "Link expired. It had 24 hours and chose to spend them expiring. Get a new one."
        ),
        "error", "modal-error",
        p(tone, "Request new link", "Get a fresh link", "Resurrect link")
      );

    case "upload-media":
      return makeState(
        p(tone, `${cap(subject)} upload failed`, `Your ${subject} didn't make it`, `${subject.toUpperCase()}_UPLOAD_FAILED`),
        p(tone,
          `We couldn't upload your ${subject}. Check the file size (max 50MB) and format.`,
          `Your ${subject} upload hit a snag! Too big? Wrong format? Let's try again.`,
          `${cap(subject)} upload exploded. File too chunky? Format too exotic? Who knows.`
        ),
        "error", "upload-error",
        p(tone, "Retry upload", "Try again", "Attempt resurrection")
      );

    case "upload-file":
      return makeState(
        p(tone, `${cap(subject)} upload failed`, `Couldn't upload your ${subject}`, `${subject.toUpperCase()}_REJECTED`),
        p(tone,
          `The ${subject} could not be uploaded. Ensure it's under 25MB and in a supported format.`,
          `That ${subject} upload flopped! Maybe it's too big? Give it another shot.`,
          `${cap(subject)} upload: failed. Format unsupported, file too large, or the server is in a mood.`
        ),
        "error", "upload-error",
        p(tone, "Try uploading again", "Retry", "Force upload")
      );

    case "social-post":
      return makeState(
        p(tone, `Failed to publish ${subject}`, `${cap(subject)} didn't post`, `PUBLISH_FAILED`),
        p(tone,
          `We couldn't publish your ${subject}. This may be a temporary issue.`,
          `Your ${subject} didn't make it out! Server hiccup maybe? Try again!`,
          `${cap(subject)} refused to publish. It may have had stage fright. Try again.`
        ),
        "error", "modal-error",
        p(tone, "Try again", "Retry", "Force it")
      );

    case "social-comment":
      return makeState(
        p(tone, "Comment failed to post", "Your comment vanished", "COMMENT_DROPPED"),
        p(tone,
          "We couldn't post your comment. Check your connection and try again.",
          "Your comment disappeared into the void! Network hiccup? Try again.",
          "Comment: not posted. It ceased to exist before existing. Poetic and also annoying."
        ),
        "error", "inline-banner",
        p(tone, "Try again", "Repost comment", "Un-vanish comment")
      );

    case "social-react":
      return makeState(
        p(tone, `Failed to ${verb} ${subject}`, `Couldn't ${verb}`, `${verb.toUpperCase()}_FAILED`),
        p(tone,
          `We couldn't register your ${verb}. Please try again.`,
          `Your ${verb} didn't register! Tap again—we won't judge.`,
          `${cap(verb)} failed. The server shrugged. Tap again with more conviction.`
        ),
        "error", "toast",
        p(tone, "Try again", "Tap again", "Try harder")
      );

    case "commerce-cart":
      return makeState(
        p(tone, `Failed to add ${subject} to cart`, `${cap(subject)} wouldn't budge`, `CART_ADD_FAILED`),
        p(tone,
          `We couldn't add this ${subject} to your cart. It may be out of stock.`,
          `That ${subject} won't go into your cart! Out of stock maybe? Bummer.`,
          `${cap(subject)} addition failed. Cart rejected it. Maybe the ${subject} rejected the cart.`
        ),
        "error", "modal-error",
        p(tone, "Try again", "Retry", "Force cart")
      );

    case "commerce-checkout":
      return makeState(
        p(tone, "Payment declined", "Card said no", "TRANSACTION_REJECTED"),
        p(tone,
          "Your payment couldn't be processed. Please check your payment details.",
          "Uh oh, your card got rejected! Insufficient funds or the wrong details?",
          "Payment: declined. Bank said nope. Card said nope. Universe said nope."
        ),
        "error", "payment-declined",
        p(tone, "Update payment", "Try another card", "Fight the bank")
      );

    case "commerce-subscribe":
      return makeState(
        p(tone, "Subscription failed", "Couldn't activate plan", "SUBSCRIBE_FAILED"),
        p(tone,
          "We couldn't activate your subscription. Please check your payment method.",
          "Subscription activation hit a wall! Payment issue? Let's fix it.",
          "Subscription refused to subscribe. Meta. Also annoying. Check your card."
        ),
        "error", "modal-error",
        p(tone, "Update billing", "Fix payment", "Throw money harder")
      );

    case "search":
      return makeState(
        p(tone, "Search failed", "Something went wrong", "SEARCH_EXPLODED"),
        p(tone,
          "We couldn't complete your search. Please try again.",
          "Search had a little hiccup! Give it another go.",
          "Search: exploded. Results: none. Reason: unclear. Try again."
        ),
        "error", "inline-banner",
        p(tone, "Retry search", "Try again", "Search harder")
      );

    case "navigation":
      return makeState(
        p(tone, `Failed to load ${subject}`, `${cap(subject)} won't load`, `${subject.toUpperCase()}_UNAVAILABLE`),
        p(tone,
          `We couldn't load your ${subject}. This may be a temporary issue.`,
          `Your ${subject} is hiding! Probably just a connection blip. Try again?`,
          `${cap(subject)}: loading failed. Could be servers. Could be gremlins. Retry.`
        ),
        "error", "inline-banner",
        p(tone, "Retry", "Try again", "Blame the server")
      );

    case "profile-edit":
      return makeState(
        p(tone, `Failed to update ${subject}`, `${cap(subject)} update failed`, `UPDATE_REJECTED`),
        p(tone,
          `We couldn't save your ${subject} changes. Please try again.`,
          `Your ${subject} update didn't stick! Give it another try.`,
          `${cap(subject)} update failed. Your changes are gone. They lived briefly.`
        ),
        "error", "inline-banner",
        p(tone, "Try saving again", "Retry", "Attempt again")
      );

    case "invite":
      return makeState(
        p(tone, "Invitation failed to send", "Invite didn't go through", "INVITE_DROPPED"),
        p(tone,
          "We couldn't send your invitation. Check the email address and try again.",
          "That invite hit a wall! Typo in the email? Try sending again.",
          "Invite: not sent. Lost in digital space. The invitee is unaware they were considered."
        ),
        "error", "modal-error",
        p(tone, "Retry invite", "Send again", "Re-attempt")
      );

    case "schedule":
      return makeState(
        p(tone, `Failed to book ${subject}`, `${cap(subject)} booking failed`, `BOOKING_FAILED`),
        p(tone,
          `We couldn't complete your ${subject} booking. The slot may no longer be available.`,
          `That ${subject} booking fell through! Slot taken? Try another time.`,
          `${cap(subject)} booking: rejected. The system said no. The ${subject} said no. Everyone said no.`
        ),
        "error", "booking-taken",
        p(tone, "Try another time", "Pick different slot", "Fight for the slot")
      );

    case "content-create":
      return makeState(
        p(tone, `Failed to create ${subject}`, `${cap(subject)} wasn't created`, `CREATE_FAILED`),
        p(tone,
          `We couldn't create your ${subject}. Please check your connection and try again.`,
          `Your ${subject} didn't get created! Server burp maybe? Try again.`,
          `${cap(subject)} creation: failed. It almost existed. Then it didn't.`
        ),
        "error", "modal-error",
        p(tone, "Try again", "Retry creation", "Reattempt existence")
      );

    case "content-delete":
      return makeState(
        p(tone, `Failed to delete ${subject}`, `${cap(subject)} won't delete`, `DELETE_REFUSED`),
        p(tone,
          `We couldn't delete the ${subject}. It may still be in use.`,
          `That ${subject} is clinging on! Still in use somewhere? Try again.`,
          `${cap(subject)} refuses to be deleted. It has achieved persistence. Reload and try again.`
        ),
        "error", "modal-error",
        p(tone, "Try again", "Force delete", "Persuade it to leave")
      );

    case "messaging":
      return makeState(
        p(tone, "Message failed to send", "Your message didn't arrive", "MESSAGE_LOST"),
        p(tone,
          "We couldn't send your message. Check your connection and try again.",
          "Your message got lost in transit! Quick, send it again before they notice.",
          "Message: not delivered. Somewhere between you and the server, it ceased to exist."
        ),
        "error", "toast",
        p(tone, "Resend message", "Try again", "Resurrect message")
      );

    default: {
      const s = subject || "action";
      return makeState(
        p(tone, `${cap(s)} failed`, `Couldn't complete that`, `${s.toUpperCase()}_FAILED`),
        p(tone,
          `We couldn't complete this step. Please check your connection and try again.`,
          `That ${s} didn't work out! Let's give it another shot.`,
          `${cap(s)}: failed. Why? Unknown. Retry and see what happens.`
        ),
        "error", "modal-error",
        p(tone, "Try again", "Give it another go", "Retry blindly")
      );
    }
  }
}

function genSecondaryError(info: StepInfo, tone: Tone): State {
  const { subject } = info;

  // Secondary error is always a connection/timeout/system issue
  // but contextualized to what was being done

  const action = info.verb;

  return makeState(
    p(tone, "Connection lost", "Oops, can't connect", "CONNECTION_VAPORIZED"),
    p(tone,
      `We lost connection while trying to ${action} your ${subject}. Check your internet and try again.`,
      `Internet went poof while ${action === "upload" ? "uploading" : "processing"} your ${subject}! Reconnect and try again.`,
      `Server ghosted us mid-${action}. Internet? Dead. Servers? Unclear. Your ${subject}? In limbo.`
    ),
    "error",
    "toast",
    p(tone, "Try again", "Reconnect", "Blame the ISP")
  );
}

function genEdgeCase(info: StepInfo, tone: Tone): State {
  const { category, subject, verb } = info;

  switch (category) {
    case "auth-signup":
      return makeState(
        p(tone, "Account created during maintenance", "You snuck in during maintenance!", "SIGNED_UP_IN_CHAOS"),
        p(tone,
          "Your account was created, but some features may be limited during our maintenance window.",
          "You're in—but we're doing some work behind the scenes. A few things might be a bit glitchy!",
          "Account: technically exists. System: technically broken. Welcome to partial existence."
        ),
        "edge", "toast",
        p(tone, "View status", "What's happening?", "Assess the damage")
      );

    case "auth-login":
      return makeState(
        p(tone, "Too many login attempts", "Slow down, speed racer!", "RATE_LIMIT_EXCEEDED"),
        p(tone,
          "You've exceeded the maximum login attempts. Please wait 15 minutes before trying again.",
          "Whoa, too many tries! Take a 15-minute breather and come back fresh.",
          "TOO. MANY. ATTEMPTS. The system is furious. Sit in the corner for 15 minutes."
        ),
        "edge", "countdown-timer"
      );

    case "email-verify":
      return makeState(
        p(tone, "Already verified", "You already did this!", "ALREADY_VERIFIED"),
        p(tone,
          "This email is already verified. You can head straight to your dashboard.",
          "Plot twist: already verified! You're ahead of the curve. Dashboard awaits!",
          "Already verified. You verified it. It's done. Stop. Go to the dashboard."
        ),
        "edge", "confirmation-modal",
        p(tone, "Go to dashboard", "Let's go!", "PROCEED")
      );

    case "upload-media": {
      const isPhoto = subject === "photo";
      return makeState(
        p(tone, `Duplicate ${subject} detected`, `You've already uploaded this!`, `DUPLICATE_${subject.toUpperCase()}_DETECTED`),
        p(tone,
          `This ${subject} already exists in your ${isPhoto ? "gallery" : "library"}. Upload a different one or view the existing one.`,
          `Déjà vu! This ${subject} is already in your ${isPhoto ? "gallery" : "library"}. Same same!`,
          `DUPLICATE ${subject.toUpperCase()} DETECTED. You uploaded this already. Bold strategy. View the original.`
        ),
        "edge", "duplicate-item",
        p(tone, "View existing", "See the original", "Find the duplicate")
      );
    }

    case "upload-file":
      return makeState(
        p(tone, "File already exists", "Duplicate file detected", "FILE_EXISTS_PARADOX"),
        p(tone,
          `A ${subject} with this name already exists. Rename it or replace the existing one.`,
          `We already have a ${subject} with that name! Replace it or rename yours.`,
          `${cap(subject)} already exists. Two of them. The universe is confused. Choose one.`
        ),
        "edge", "duplicate-item",
        p(tone, "Replace existing", "Rename and retry", "Resolve paradox")
      );

    case "social-post":
      return makeState(
        p(tone, `${cap(subject)} published to wrong audience`, "Oops — wrong audience!", "AUDIENCE_MISMATCH"),
        p(tone,
          `Your ${subject} was published with a different audience setting than intended. You can edit it now.`,
          `Uh oh, your ${subject} went out to the wrong crowd! Edit it before anyone notices?`,
          `${cap(subject)} published to: wrong people. This is fine. Probably. Edit it now.`
        ),
        "edge", "toast",
        p(tone, "Edit post", "Fix visibility", "Contain the damage")
      );

    case "social-comment":
      return makeState(
        p(tone, "Duplicate comment detected", "You already said that!", "COMMENT_CLONED"),
        p(tone,
          "This comment is identical to one you already posted. Duplicate comments are not allowed.",
          "Wait—you already said that! Same comment twice. We've got it covered!",
          "DUPLICATE COMMENT. You said it. Then you said it again. We noticed. The system noticed."
        ),
        "edge", "duplicate-item"
      );

    case "social-react":
      return makeState(
        p(tone, `Already ${verb}ing this ${subject}`, `You already ${verb}d this!`, `ALREADY_${verb.toUpperCase()}ED`),
        p(tone,
          `You're already ${verb}ing this ${subject}.`,
          `You already ${verb}d this! Double-tap to un-${verb}?`,
          `Already ${verb}ing. You can't ${verb} twice. The laws of ${verb}ing are clear.`
        ),
        "edge", "confirmation-modal",
        p(tone, `Un${verb}`, `Tap to un${verb}`, `Undo`)
      );

    case "commerce-cart":
      return makeState(
        p(tone, `${cap(subject)} out of stock`, "Sold out!", "ITEM_CEASED_TO_EXIST"),
        p(tone,
          `This ${subject} went out of stock while it was in your cart. Check back soon.`,
          `Nooo! This ${subject} sold out while it was sitting in your cart. So close!`,
          `${cap(subject)}: sold out. It existed. You wanted it. Now it's gone. The economy.`
        ),
        "edge", "outofstock",
        p(tone, "Get notified when back", "Notify me", "Mourn and move on")
      );

    case "commerce-checkout":
      return makeState(
        p(tone, "Order placed twice", "Possible duplicate order!", "DUPLICATE_ORDER_DETECTED"),
        p(tone,
          "It looks like this order may have been submitted twice. Please check your order history before placing another.",
          "Whoops, looks like you might've double-clicked checkout! Check your orders first.",
          "DOUBLE ORDER DETECTED. Did you click twice? The server got two of them. Awkward."
        ),
        "edge", "duplicate-item",
        p(tone, "View order history", "Check my orders", "Investigate")
      );

    case "commerce-subscribe":
      return makeState(
        p(tone, "Already subscribed", "You're already on this plan!", "SUBSCRIPTION_PARADOX"),
        p(tone,
          "You're already subscribed to this plan. Manage your subscription in account settings.",
          "You're already on this plan! Nothing to change here. All good.",
          "Already subscribed. Subscribing to a subscription you have. Very meta. Very unnecessary."
        ),
        "edge", "confirmation-modal",
        p(tone, "Manage subscription", "View my plan", "Contemplate recursion")
      );

    case "search":
      return makeState(
        p(tone, "Search results cached", "Showing cached results", "CACHE_SERVED"),
        p(tone,
          "You're seeing cached results. They may be a few minutes old.",
          "Psst—these are cached results! They might be a little behind. Refresh for the latest.",
          "Results: from cache. The server was tired. These are old. Maybe still useful. Maybe not."
        ),
        "edge", "inline-banner",
        p(tone, "Refresh results", "Get live results", "Force refresh")
      );

    case "navigation":
      return makeState(
        p(tone, "Session expired mid-session", "Your session timed out!", "SESSION_TERMINATED"),
        p(tone,
          "Your session expired while browsing. Sign in again to continue where you left off.",
          "Your session took a nap! Sign back in and pick up where you left off.",
          "Session: terminated. Time killed it. Everything you were doing: gone. Sign in again."
        ),
        "edge", "locked-feature",
        p(tone, "Sign in again", "Wake up session", "Revive session")
      );

    case "profile-edit":
      return makeState(
        p(tone, `${cap(subject)} already in use`, `That ${subject} is taken`, `${subject.toUpperCase()}_CONFLICT`),
        p(tone,
          `This ${subject} is already associated with another account. Please choose a different one.`,
          `Someone's already using that ${subject}! Try a different one.`,
          `${cap(subject)} conflict. Two accounts, one ${subject}. The system cannot allow this.`
        ),
        "edge", "form-error",
        p(tone, `Choose different ${subject}`, "Try another", "Resolve conflict")
      );

    case "invite":
      return makeState(
        p(tone, "Invite already accepted", "They're already in!", "INVITE_REDUNDANT"),
        p(tone,
          "This person has already accepted an invitation and joined. No need to invite them again.",
          "Good news: they already joined! No invite needed.",
          "Already joined. You're inviting someone who's already here. They're waving at you."
        ),
        "edge", "confirmation-modal",
        p(tone, "View member", "See their profile", "Acknowledge them")
      );

    case "schedule":
      return makeState(
        p(tone, `${cap(subject)} slot taken`, "Someone just grabbed that slot!", "SLOT_CONFLICT"),
        p(tone,
          `This ${subject} slot was just taken by someone else. Please choose another available time.`,
          `Ooh, someone snagged that ${subject} slot just now! Pick another time.`,
          `${cap(subject)} slot: occupied. Race condition. You were milliseconds too slow.`
        ),
        "edge", "calendar-conflict",
        p(tone, "Pick another time", "See available slots", "Mourn the lost slot")
      );

    case "content-create":
      return makeState(
        p(tone, `${cap(subject)} already exists`, "Duplicate detected!", `DUPLICATE_${subject.toUpperCase()}`),
        p(tone,
          `A ${subject} with this name already exists. Please use a different name.`,
          `You've already got a ${subject} with that name! Try something different.`,
          `${cap(subject)} exists. You made it before. Either rename this or accept the duplicate chaos.`
        ),
        "edge", "duplicate-item",
        p(tone, "View existing", "Rename and create", "Embrace duplicates")
      );

    case "content-delete":
      return makeState(
        p(tone, `${cap(subject)} shared with others`, "Heads up — this is shared!", `SHARED_${subject.toUpperCase()}_DELETION_ATTEMPT`),
        p(tone,
          `This ${subject} is shared with other users. Deleting it will remove access for everyone.`,
          `Careful! This ${subject} is shared. Delete it and everyone loses access.`,
          `Deleting shared ${subject}. Others will lose access. They will not be warned. Consequences exist.`
        ),
        "edge", "modal-error",
        p(tone, "Delete for all", "Cancel deletion", "Accept consequences")
      );

    case "messaging":
      return makeState(
        p(tone, "Message sent to wrong recipient", "Wrong person?", "WRONG_RECIPIENT_DETECTED"),
        p(tone,
          "Double check: you're sending this message to the right person.",
          "Wait—did you mean to send this to someone else? Double-check before hitting send!",
          "Sending to correct person? Unclear. System cannot verify your intentions. Proceed with caution."
        ),
        "edge", "toast",
        p(tone, "Double-check recipient", "Verify and send", "Proceed with caution")
      );

    default: {
      const s = subject || "item";
      return makeState(
        p(tone, `${cap(s)} already exists`, `Hold on—duplicate detected`, `DUPLICATE_${s.toUpperCase()}`),
        p(tone,
          `This ${s} already exists. Check for duplicates before proceeding.`,
          `Looks like that ${s} is already there! Check before adding again.`,
          `${cap(s)} already exists. You made it. It exists. Stop making it again.`
        ),
        "edge", "duplicate-item",
        p(tone, "View existing", "Check for duplicates", "Find the original")
      );
    }
  }
}

// ─── Public API ───────────────────────────────────────────────────────────────

export function parseUserFlow(flowDescription: string): ParsedStep[] {
  // Word boundary on "then" prevents splitting words like "authentication"
  // Spaced hyphen handles "step 1 - step 2" without breaking words like "sign-up"
  // Comma is intentionally excluded here — it's handled separately below,
  // since unlike these, it's ambiguous (see comment).
  const strongDelimiters = /→|->|\s+\bthen\b\s+|\n|\s+-\s+/gi;
  const segments = flowDescription.split(strongDelimiters).map(s => s.trim()).filter(Boolean);

  // Commas and "and" are both ambiguous: "signs up, verifies email" and
  // "take a walk and record steps" are each two steps, but "selects size,
  // color, and quantity" is one step with a comma-separated list. Only fold
  // a fragment back into the step before it when it looks like a bare list
  // item rather than its own step — a single word ("color"), or an "and …"
  // tail left over from a comma split ("and quantity") — so real short
  // steps like "sign in" or "pay ticket" (split on -> above) are untouched,
  // and multi-word clauses after "and" ("record step count") become their
  // own steps rather than getting absorbed into the previous one.
  const rawSteps: string[] = [];
  for (const segment of segments) {
    const commaParts = segment.split(/,\s*|\s+\band\b\s+/gi).filter(Boolean);
    commaParts.forEach((fragment, i) => {
      const words = fragment.split(/\s+/);
      // Only a comma-continuation (i > 0) can be a list item — the first
      // part of a segment always came from an unambiguous strong delimiter
      // (or is the start of the whole flow) and is always its own step.
      const looksLikeListItem =
        i > 0 && rawSteps.length > 0 && (words.length === 1 || /^and\s+/i.test(fragment));
      if (looksLikeListItem) {
        rawSteps[rawSteps.length - 1] += `, ${fragment}`;
      } else {
        rawSteps.push(fragment);
      }
    });
  }

  return rawSteps.map(step => {
    const context = step.trim();
    const info = classifyStep(context);
    const words = context.trim().split(/\s+/);
    const action = words.length <= 5
      ? words.map(w => cap(w)).join(" ")
      : words.slice(0, 4).map(w => cap(w)).join(" ") + "…";
    return { action, context: cap(context), info };
  });
}

function getStateGeneratorsForCategory(category: StepCategory) {
  switch (category) {
    case "auth-signup":
    case "auth-login":
    case "email-verify":
      return [genEmpty, genPrimaryError, genEdgeCase];

    case "upload-media":
    case "upload-file":
    case "social-post":
    case "social-comment":
    case "social-react":
    case "commerce-cart":
    case "commerce-checkout":
    case "commerce-subscribe":
    case "messaging":
      return [genEmpty, genPrimaryError, genEdgeCase];

    case "search":
    case "navigation":
    case "profile-edit":
    case "invite":
    case "schedule":
    case "content-create":
    case "content-delete":
      return [genEmpty, genPrimaryError, genEdgeCase];

    default:
      return [genEmpty, genPrimaryError, genSecondaryError, genEdgeCase];
  }
}

function isStateApplicable(info: StepInfo, _state: State): boolean {
  // States are generated specifically for the step's category, so they're
  // always applicable. For generic steps, accept everything since the
  // generators already use the extracted subject/verb.
  return info.category !== "generic"
    || true; // generic always passes — subject is baked into the generated text
}

function uniqueStates(states: State[]): State[] {
  const map = new Map<string, State>();
  states.forEach(state => {
    if (!map.has(state.title)) {
      map.set(state.title, state);
    }
  });
  return Array.from(map.values());
}

export function generateFlowSteps(userFlow: string, tone: Tone): FlowSteps {
  const steps = parseUserFlow(userFlow);

  return steps.map(step => {
    const candidates = getStateGeneratorsForCategory(step.info.category)
      .map(gen => gen(step.info, tone))
      .filter(state => isStateApplicable(step.info, state));

    const filtered = uniqueStates(candidates).slice(0, 3);
    const fallback = [genEmpty(step.info, tone), genPrimaryError(step.info, tone)];

    return {
      stepName: step.action,
      stepDescription: step.context,
      states: filtered.length ? filtered : fallback,
    };
  });
}

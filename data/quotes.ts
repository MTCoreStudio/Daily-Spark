/**
 * Curated bundled quotes — the offline fallback used when there is no cache and
 * the backend/API is unreachable. Attribution is only shown when it is safe and
 * known; otherwise "Unknown" (never invented).
 */
export interface Quote {
  id: string;
  text: string;
  author: string;
  category: string;
  source?: string | null;
  language?: string;
  /** Home country the quote's language belongs to. */
  country?: string | null;
  /** ISO-639 code of the language the quote was originally written in. */
  original_language?: string | null;
  /** Whether this quote is original/native to its language (never a translation). */
  is_original?: boolean;
  featured?: boolean;
}

const q = (
  id: string,
  text: string,
  author: string,
  category: string,
  featured?: boolean
): Quote => ({
  id,
  text,
  author: author || "Unknown",
  category,
  language: "English",
  country: "United States",
  original_language: "en",
  is_original: true,
  source: "Daily Spark (original)",
  featured,
});

export const BUNDLED_QUOTES: Quote[] = [
  q("m1", "Small steps every day lead to big changes.", "Unknown", "Motivation", true),
  q("m2", "Do the hard things before they become harder.", "Unknown", "Motivation"),
  q("m3", "Your effort today is the person you become tomorrow.", "Unknown", "Motivation"),
  q("m4", "Begin where you are. Use what you have. Do what you can.", "Unknown", "Motivation"),
  q("e1", "A single spark of hope can light a whole day.", "Unknown", "Positivity", true),
  q("e2", "Find joy in ordinary moments before chasing big ones.", "Unknown", "Positivity"),
  q("e3", "A grateful heart makes even a small day feel full.", "Unknown", "Positivity"),
  q("l1", "Life is what you make of the moments in between.", "Unknown", "Life", true),
  q("l2", "Grow through what you go through.", "Unknown", "Life"),
  q("l3", "The most important step is the next one.", "Unknown", "Life"),
  q("s1", "Success is built on habits, not luck.", "Unknown", "Success", true),
  q("s2", "Progress over perfection, every single day.", "Unknown", "Success"),
  q("s3", "Discipline is choosing what you want most over what you want now.", "Unknown", "Discipline"),
  q("h1", "Happiness grows when it is shared.", "Unknown", "Happiness"),
  q("h2", "You deserve the peace you keep postponing.", "Unknown", "Happiness"),
  q("lve1", "Love is shown in the small, quiet things.", "Unknown", "Love"),
  q("lve2", "A kind word can change someone's whole day.", "Unknown", "Kindness"),
  q("c1", "Confidence grows one honest action at a time.", "Unknown", "Confidence"),
  q("mn1", "A calm mind makes better decisions.", "Unknown", "Mindset"),
  q("g1", "Leaders grow others and serve the mission.", "Unknown", "Leadership"),
  q("st1", "Be consistent even when no one is watching.", "Unknown", "Focus"),
  q("f1", "True friends stay when it is not convenient.", "Unknown", "Friendship"),
  q("w1", "Wisdom begins where certainty ends.", "Unknown", "Wisdom"),
  q("cr1", "Courage is moving forward despite the fear.", "Unknown", "Courage"),
  q("dr1", "Dream boldly, then work quietly.", "Unknown", "Dreams"),
  q("hl1", "A healthy body supports a strong mind.", "Unknown", "Health"),
  q("cw1", "Creation is just an idea with courage.", "Unknown", "Creativity"),
  q("sp1", "Peace is the path, not the destination.", "Unknown", "Spirituality"),
  q("isl1", "Patience and prayer are a quiet strength.", "Unknown", "Islamic Wisdom"),
  q("fam1", "The family you build is the home you return to.", "Unknown", "Family"),
  q("gr1", "Study today to lead tomorrow.", "Unknown", "Study"),
  q("wk1", "Work well, then rest well.", "Unknown", "Work"),
  // --- Romance & love (original content only; attribution is never invented) ---
  q("r01", "Some hearts are homes the moment you step inside.", "Unknown", "Romance"),
  q("r02", "You are the calm in my loudest days.", "Unknown", "Romance"),
  q("r03", "Loving you feels like coming home to myself.", "Unknown", "Deep Love"),
  q("r04", "First love teaches you the size of your own heart.", "Unknown", "First Love"),
  q("r05", "Two people, one story, written one kind sentence at a time.", "Unknown", "Couple"),
  q("r06", "Forever is not a length of time; it is a way of staying.", "Unknown", "Forever"),
  q("r07", "Wake up knowing someone is glad you exist.", "Unknown", "Good Morning Love"),
  q("r08", "Rest easy tonight; you are loved even in your sleep.", "Unknown", "Good Night Love"),
  q("r09", "Distance stretches the miles, never the feeling.", "Unknown", "Long Distance Love"),
  q("r10", "I keep a small space of every day just for thinking of you.", "Unknown", "Missing Someone"),
  // --- Heartbreak (reflection + moving forward, never harm) ---
  q("h01", "Some rain falls so we can remember the sun.", "Unknown", "Heartbreak"),
  q("h02", "A broken heart still knows how to beat.", "Unknown", "Heartbreak"),
  q("h03", "Endings are just the universe making room.", "Unknown", "Breakup"),
  q("h04", "Moving on is not forgetting; it is choosing yourself.", "Unknown", "Moving On"),
  q("h05", "You loved completely, and that was never a mistake.", "Unknown", "Lost Love"),
  q("h06", "Trust given freely is never the one at fault.", "Unknown", "Betrayal"),
  q("h07", "Letting go is the bravest love you can show yourself.", "Unknown", "Letting Go"),
  // --- Sadness / reflection ---
  q("s01", "Sadness is a room; visit it, but do not move in.", "Unknown", "Sadness"),
  q("s02", "Hard days do not erase the good ones before or ahead.", "Unknown", "Sad Thoughts"),
  q("s03", "Feeling deeply is not weakness; it is proof you are alive.", "Unknown", "Emotional"),
  q("s04", "The mind asks its biggest questions when the heart is quiet.", "Unknown", "Deep Thoughts"),
  q("s05", "Late nights whisper truths the daytime drowns out.", "Unknown", "Late Night Thoughts"),
  q("s06", "Lonely is a place, not a permanent address.", "Unknown", "Loneliness"),
  q("s07", "Missing someone is love in its quietest form.", "Unknown", "Missing Someone"),
  q("s08", "Some days the only win is that you stayed.", "Unknown", "Difficult Days"),
  // --- Healing ---
  q("l01", "Healing is not a straight line; it is a path walked at your own pace.", "Unknown", "Healing"),
  q("l02", "Be as gentle with yourself as you are with those you love.", "Unknown", "Self Love"),
  q("l03", "Acceptance is not giving up; it is choosing peace over resistance.", "Unknown", "Acceptance"),
  q("l04", "Forgiveness is a gift you unwrap for yourself.", "Unknown", "Forgiveness"),
  q("l05", "Every new start is a small act of courage.", "Unknown", "Starting Again"),
  q("l06", "The strength you are looking for was never outside you.", "Unknown", "Inner Strength"),
  q("l07", "Hope is the quiet voice that says tomorrow is still an option.", "Unknown", "Hope", true),
  // --- Happiness / gratitude ---
  q("p01", "Happiness multiplies when it is given away.", "Unknown", "Happiness"),
  q("p02", "Joy lives in the small moments we bother to notice.", "Unknown", "Joy"),
  q("p03", "Gratitude turns what you have into enough.", "Unknown", "Gratitude"),
  q("p04", "Good memories are anchors for the stormy days.", "Unknown", "Good Memories"),
  q("p05", "A positive mind begins with a patient one.", "Unknown", "Positive Life"),
  // --- Peace / calm / faith ---
  q("c01", "Peace begins the moment you stop fighting your own pace.", "Unknown", "Peace"),
  q("c02", "Calm is not the absence of noise; it is the choice to stay steady.", "Unknown", "Calm"),
  q("c03", "Patience is trust in the timing of things unseen.", "Unknown", "Patience"),
  q("c04", "Faith is walking forward when the path is still dark.", "Unknown", "Faith"),
  q("c05", "Your soul knows the way; the noise just speaks louder.", "Unknown", "Spirituality"),
  // --- Life / wisdom ---
  q("w02", "Time does not hurry for anyone; spend it like it matters.", "Unknown", "Time"),
  q("w03", "Change is the doorway; the step is yours.", "Unknown", "Change"),
  q("w04", "You are built by the choices you repeat.", "Unknown", "Choices"),
  q("w05", "Every setback arrives carrying a lesson.", "Unknown", "Lessons"),
  q("w06", "Wisdom is knowing what to keep simple.", "Unknown", "Wisdom"),
  // --- Relationships ---
  q("f02", "Trust is built in small moments and kept in smaller ones.", "Unknown", "Trust"),
  q("f03", "Respect is how love behaves when no one is watching.", "Unknown", "Respect"),
  q("f04", "Loyalty is love that stays through the ordinary.", "Unknown", "Loyalty"),
  // --- Study / work ---
  q("u01", "An exam measures a moment, not your worth.", "Unknown", "Exams"),
  q("u02", "Build a career on work you can be proud of quietly.", "Unknown", "Career"),
  q("u03", "Productivity is kindness to your future self.", "Unknown", "Productivity"),
  q("u04", "Ambition without balance becomes a lonely climb.", "Unknown", "Ambition"),
  // --- Motivation depth ---
  q("mnt1", "Failure is tuition for a lesson you get to keep.", "Unknown", "Failure"),
  q("mnt2", "Growth happens in the discomfort you choose.", "Unknown", "Growth"),
  q("mnt3", "Leadership is listening where others are quick to speak.", "Unknown", "Leadership"),
  q("mnt4", "Dreams are the first draft; work is the final one.", "Unknown", "Dreams"),
];
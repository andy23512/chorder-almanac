// The pool of "Do / Don't" entries for the Chorder's Almanac.
// Each day deterministically draws a few of these from the date, so the
// reading is reproducible — never random from one refresh to the next.
export interface YiJiItem {
  name: string
  desc: string
}

// DO — deeds the omens favor for a chorder today.
export const DO: readonly YiJiItem[] = [
  { name: 'Drill new chords', desc: 'Muscle memory takes root today; ten fresh chords will stick.' },
  { name: 'Back up your chords', desc: 'Export your chord library — fortune spares the well-prepared.' },
  { name: 'Update CCOS', desc: 'The firmware winds are calm; a clean flash brings good fortune.' },
  { name: 'Forge a custom chord', desc: 'A word you type daily begs to be a single chord. Grant its wish.' },
  { name: 'Warm up your hands', desc: 'Stretch wrists and fingers before the first key; longevity favors this.' },
  { name: 'Run a typing test', desc: 'Measure before you tune — a benchmark today guides the week.' },
  { name: 'Learn the layout', desc: 'Study the default map; the well-charted hand never wanders lost.' },
  { name: 'Rest your wrists', desc: 'Step away, shake it out. The hands you save are the hands you keep.' },
  { name: 'Prune stale chords', desc: 'Retire chords you never fire; a lean library is a swift one.' },
  { name: 'Share a chord', desc: 'Post a clever chord to the community — generosity returns threefold.' },
  { name: 'Read the docs', desc: 'The manual holds the answer you were about to ask. Consult it.' },
  { name: 'Set a WPM goal', desc: 'Name a number; the aimed arrow flies straighter than the loosed one.' },
  { name: 'Type hands-adjacent', desc: 'Keep hands home, reach for nothing — the home position brings peace.' },
  { name: 'Onboard a friend', desc: 'Teach someone their first chord; the craft grows by sharing.' },
  { name: 'Recalibrate', desc: 'Center the switches, reseat the board — small tuning, large harmony.' },
  { name: 'Practice slow', desc: 'Accuracy first, speed second; the tortoise chord outlasts the hare.' },
  { name: 'Journal your speed', desc: 'Log today’s WPM; progress unseen is progress unbelieved.' },
  { name: 'Clean the switches', desc: 'A wipe-down today; crisp actuation and clear omens follow.' },
  { name: 'Master one finger', desc: 'Drill a single stubborn digit until it obeys. Great fortune.' },
  { name: 'Trust the chord', desc: 'Commit fully to the chord you know; hesitation is the true typo.' },
  { name: 'Map a phrase chord', desc: 'Bind a whole phrase you repeat — the omens smile on the lazy-clever.' },
  { name: 'Take a mindful break', desc: 'Breathe, un-hunch, look far. The rested chorder returns faster.' },
]

// DON'T — deeds the omens warn against today.
export const DONT: readonly YiJiItem[] = [
  { name: 'Flash before a deadline', desc: 'Firmware updates on judgment day invite disaster. Wait it out.' },
  { name: 'Add 100 chords at once', desc: 'Cramming the library overloads the mind; the forgotten chord mocks you.' },
  { name: 'Chord in anger', desc: 'Tense hands fat-finger. Cool the temper before touching the board.' },
  { name: 'Wipe without a backup', desc: 'Reset the library unexported and weep — a great misfortune, easily dodged.' },
  { name: 'Chase WPM over accuracy', desc: 'Speed built on typos is a house on sand. Ill omen.' },
  { name: 'Skip the tutorial', desc: 'The impatient chorder relearns twice. Begin at the beginning.' },
  { name: 'Flash over a bad cable', desc: 'A flaky USB link mid-update bricks the mood. Use a trusted cable.' },
  { name: 'Race un-warmed', desc: 'A cold-handed sprint strains tendons. Warm up, then run.' },
  { name: 'Blame the board', desc: '“It mis-fired” is oft the hand, not the switch. Look inward first.' },
  { name: 'Trust day-one muscle memory', desc: 'New chords betray under pressure. Give them a week before the demo.' },
  { name: 'Chord with greasy hands', desc: 'Slick fingers slip the switches. Wipe down before you type. Ill omen.' },
  { name: 'Hoard dead chords', desc: 'A library bloated with unused chords slows the mind. Prune, don’t hoard.' },
  { name: 'Doomscroll typing forums', desc: 'Reading about speed is not practicing it. Close the tab, drill instead.' },
  { name: 'Update mid-flight', desc: 'Firmware in the middle of real work courts a lost session. Finish first.' },
  { name: 'Force a chord that won’t fire', desc: 'Mashing harder rarely helps; check the binding, not your grip strength.' },
  { name: 'Ignore wrist pain', desc: 'Pushing through the ache is the one true misfortune. Stop and rest.' },
  { name: 'Rebind on a whim', desc: 'Changing your layout the night before a race unsettles the hands. Hold.' },
  { name: 'Perfect over ship', desc: 'Endless chord-tuning while the work waits. Good enough types the email.' },
  { name: 'Two boards, one week', desc: 'Learning two new layouts at once confuses both. One craft at a time.' },
  { name: 'Skip the backup — again', desc: 'You meant to export last time too. The unbacked library is borrowed time.' },
]

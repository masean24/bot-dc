/** @module config/constants */

module.exports = {
  /** Default embed colors */
  Colors: {
    SUCCESS: 0x2ecc71,
    ERROR: 0xe74c3c,
    INFO: 0x3498db,
    WARN: 0xf39c12,
    ROBLOX: 0xe2231a,
    GAME: 0x9b59b6,
  },

  /** Default cooldown in seconds if not set on command */
  DEFAULT_COOLDOWN: 3,

  /** Roblox API cache TTL in seconds */
  ROBLOX_CACHE_TTL: 60,

  /** Verification code length */
  VERIFICATION_CODE_LENGTH: 6,

  /** Verification code expiry in minutes */
  VERIFICATION_EXPIRY_MINUTES: 10,

  /** Roblox trivia questions pool (minimum 15) */
  QUIZ_QUESTIONS: [
    {
      question: 'What year was Roblox officially released to the public?',
      options: ['2004', '2006', '2008', '2010'],
      answer: 1,
    },
    {
      question: 'What is the in-game currency of Roblox called?',
      options: ['Coins', 'Gems', 'Robux', 'Tokens'],
      answer: 2,
    },
    {
      question: 'Who is the co-founder of Roblox?',
      options: ['Erik Cassel', 'Notch', 'Gabe Newell', 'John Carmack'],
      answer: 0,
    },
    {
      question: 'What programming language is used to script Roblox games?',
      options: ['Python', 'JavaScript', 'Lua', 'C++'],
      answer: 2,
    },
    {
      question: 'What was Roblox originally called during its beta phase?',
      options: ['DynaBlocks', 'BlockWorld', 'BuildIt', 'GoBlocks'],
      answer: 0,
    },
    {
      question: 'Which Roblox game was the first to reach 1 billion visits?',
      options: ['Jailbreak', 'MeepCity', 'Adopt Me!', 'Brookhaven'],
      answer: 1,
    },
    {
      question: 'What is the maximum number of players in a default Roblox server?',
      options: ['50', '100', '700', '200'],
      answer: 2,
    },
    {
      question: 'What is the Roblox game engine called?',
      options: ['Unity', 'Unreal', 'Roblox Studio', 'GameMaker'],
      answer: 2,
    },
    {
      question: 'What does "R15" refer to in Roblox?',
      options: ['15 Robux', 'A 15-joint avatar rig', '15 players max', 'Update version 15'],
      answer: 1,
    },
    {
      question: 'Which Roblox game popularized the "obby" genre?',
      options: ['Tower of Hell', 'Adopt Me!', 'Blox Fruits', 'Natural Disaster Survival'],
      answer: 0,
    },
    {
      question: 'What is the Roblox Developer Exchange program called?',
      options: ['RoTrade', 'DevEx', 'RobuxSwap', 'CashOut'],
      answer: 1,
    },
    {
      question: 'What is the minimum age requirement to create a Roblox account?',
      options: ['No minimum', '8 years old', '13 years old', '6 years old'],
      answer: 0,
    },
    {
      question: 'Which item is the most expensive limited on Roblox (historically)?',
      options: ['Dominus Empyreus', 'Violet Valkyrie', 'Sparkle Time Fedora', 'Dominus Frigidus'],
      answer: 0,
    },
    {
      question: 'What does "ABC" mean in Roblox chat?',
      options: ['A cheat code', 'Ready / willing to do something', 'A type of ban', 'Alphabet game'],
      answer: 1,
    },
    {
      question: 'What is the name of Roblox\'s annual developer conference?',
      options: ['RoSummit', 'RDC (Roblox Developers Conference)', 'BloxCon', 'DevFest'],
      answer: 1,
    },
    {
      question: 'Which Roblox game broke records with over 1.5 million concurrent players?',
      options: ['Brookhaven', 'Adopt Me!', 'Tower of Hell', 'Blox Fruits'],
      answer: 1,
    },
    {
      question: 'What is a "GamePass" in Roblox?',
      options: ['A monthly subscription', 'A purchasable in-game perk', 'A type of badge', 'An admin command'],
      answer: 1,
    },
    {
      question: 'What does the Roblox "Oof" sound play when?',
      options: ['Joining a game', 'Character dies', 'Earning Robux', 'Sending a message'],
      answer: 1,
    },
  ],
};

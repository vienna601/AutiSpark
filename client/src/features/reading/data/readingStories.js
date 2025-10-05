export const READING_STORIES = {
  difficulty1: [
    {
      id: 'easy1',
      title: "Sam's Red Ball",
      story: "Sam has a red ball. The ball is big and round. Sam likes to play with his ball in the yard. His dog Max likes the ball too. They play catch together. Sam throws the ball and Max runs to get it. It is fun to play outside.",
      questions: [
        {
          id: 'q1',
          question: "What color is Sam's ball?",
          options: ["Blue", "Red", "Green", "Yellow"],
          correct: 1,
          explanation: "The story says 'Sam has a red ball' in the first sentence."
        },
        {
          id: 'q2',
          question: "Who is Max?",
          options: ["Sam's friend", "Sam's dog", "Sam's brother", "Sam's cat"],
          correct: 1,
          explanation: "The story says 'His dog Max likes the ball too.'"
        }
      ]
    },
    {
      id: 'easy2', 
      title: "The Little Garden",
      story: "Emma loves to help in her grandmother's garden. Every morning, she waters the flowers with a small blue watering can. The garden has roses, tulips, and sunflowers. Emma's favorite flowers are the yellow sunflowers because they are as tall as she is. When the flowers bloom, butterflies come to visit. Emma sits quietly and watches the colorful butterflies dance from flower to flower.",
      questions: [
        {
          id: 'q1',
          question: "What does Emma use to water the flowers?",
          options: ["A green hose", "A small blue watering can", "A big bucket", "A spray bottle"],
          correct: 1,
          explanation: "The story says 'she waters the flowers with a small blue watering can.'"
        },
        {
          id: 'q2',
          question: "Why are sunflowers Emma's favorite?",
          options: ["They smell nice", "They are colorful", "They are as tall as she is", "They attract birds"],
          correct: 2,
          explanation: "The story says 'Emma's favorite flowers are the yellow sunflowers because they are as tall as she is.'"
        }
      ]
    }
  ],

  difficulty2: [
    {
      id: 'medium1',
      title: "The School Science Fair",
      story: "Marcus was excited about the school science fair. He had been working on his volcano project for two weeks. His volcano was made from clay and painted to look realistic. For the demonstration, Marcus mixed baking soda and vinegar inside the volcano. When he poured the vinegar, the mixture bubbled up and overflowed like real lava. The judges were impressed with his explanation of how real volcanoes work. Marcus won second place and felt very proud of his hard work.",
      questions: [
        {
          id: 'q1',
          question: "How long did Marcus work on his project?",
          options: ["One week", "Two weeks", "Three weeks", "One month"],
          correct: 1,
          explanation: "The story says 'He had been working on his volcano project for two weeks.'"
        },
        {
          id: 'q2',
          question: "What place did Marcus win in the science fair?",
          options: ["First place", "Second place", "Third place", "Fourth place"],
          correct: 1,
          explanation: "The story says 'Marcus won second place and felt very proud of his hard work.'"
        }
      ]
    },
    {
      id: 'medium2',
      title: "The School Garden",
      story: "Mr. Johnson's class planted a garden at school in the spring. They planted tomatoes, carrots, and lettuce. The students took turns watering the plants every day. By summer, the vegetables had grown big and healthy. The class harvested the vegetables and used them to make a fresh salad for lunch. Everyone agreed it was the best salad they had ever tasted because they grew it themselves.",
      questions: [
        {
          id: 'q1',
          question: "When did the class plant their garden?",
          options: ["In winter", "In spring", "In summer", "In fall"],
          correct: 1,
          explanation: "The story begins with 'Mr. Johnson's class planted a garden at school in the spring.'"
        },
        {
          id: 'q2',
          question: "Why did everyone think the salad was the best they had ever tasted?",
          options: ["It had special dressing", "They bought it from a store", "They grew it themselves", "It was very expensive"],
          correct: 2,
          explanation: "The story ends with 'Everyone agreed it was the best salad they had ever tasted because they grew it themselves.'"
        }
      ]
    }
  ],

  difficulty3: [
    {
      id: 'hard1',
      title: "The Mystery of the Missing Cookies",
      story: "Detective Sarah arrived at the Henderson house to solve the case of the missing cookies. Mrs. Henderson explained that she had baked chocolate chip cookies for the school bake sale and left them cooling on the kitchen counter. When she returned an hour later, half the cookies were gone. Sarah examined the evidence carefully: crumbs on the floor leading to the back door, a chair pulled up to the counter, and muddy paw prints on the tile. After interviewing the family members, Sarah discovered that the youngest Henderson child, Tommy, had left the back door open while playing outside. The real culprit was the neighbor's clever golden retriever, who had learned to open doors and had quite a sweet tooth.",
      questions: [
        {
          id: 'q1',
          question: "What evidence helped Sarah solve the case?",
          options: ["Only the muddy paw prints", "Crumbs, a moved chair, and paw prints", "Just the open door", "Only Tommy's confession"],
          correct: 1,
          explanation: "The story says Sarah examined 'crumbs on the floor leading to the back door, a chair pulled up to the counter, and muddy paw prints on the tile.'"
        },
        {
          id: 'q2',
          question: "Who was the real cookie thief?",
          options: ["Tommy Henderson", "Mrs. Henderson", "Detective Sarah", "The neighbor's golden retriever"],
          correct: 3,
          explanation: "The story says 'The real culprit was the neighbor's clever golden retriever.'"
        }
      ]
    },
    {
      id: 'hard2',
      title: "The Community Helper",
      story: "Sarah volunteered at the local animal shelter every weekend. She helped feed the dogs and cats, cleaned their living spaces, and played with them so they wouldn't feel lonely. Sarah noticed that many animals seemed sad because they missed having a family. She decided to create colorful posters with photos of the animals to hang around town. Her idea worked wonderfully - within a month, five animals found new homes because people saw her posters and came to adopt them.",
      questions: [
        {
          id: 'q1',
          question: "Why did Sarah create posters?",
          options: ["To win a contest", "To help animals find homes", "To practice her art", "To decorate the town"],
          correct: 1,
          explanation: "Sarah created posters because she 'noticed that many animals seemed sad because they missed having a family' and wanted to help them find homes."
        },
        {
          id: 'q2',
          question: "How many animals found homes because of the posters?",
          options: ["Three", "Four", "Five", "Six"],
          correct: 2,
          explanation: "The story ends with 'within a month, five animals found new homes because people saw her posters.'"
        }
      ]
    }
  ],

  difficulty4: [
    {
      id: 'vhard1',
      title: "The Weather Station Mystery",
      story: "Dr. Kim had been monitoring the weather station data for months when she noticed something unusual. The temperature readings were consistently three degrees higher than neighboring stations, but only during the afternoon hours. She suspected that something was interfering with the instruments. After investigating, Dr. Kim discovered that a new building had been constructed nearby, and its glass windows were reflecting sunlight directly onto her weather equipment. The reflected heat was causing the incorrect readings. She relocated the station to an area with better shade and accurate measurements resumed.",
      questions: [
        {
          id: 'q1',
          question: "What was unusual about the temperature readings?",
          options: ["They were too low", "They were three degrees higher", "They weren't working", "They changed every hour"],
          correct: 1,
          explanation: "The story states 'The temperature readings were consistently three degrees higher than neighboring stations.'"
        },
        {
          id: 'q2',
          question: "What caused the incorrect readings?",
          options: ["Broken equipment", "Bad weather", "Reflected sunlight from a building", "Wrong location"],
          correct: 2,
          explanation: "Dr. Kim discovered that 'a new building had been constructed nearby, and its glass windows were reflecting sunlight directly onto her weather equipment.'"
        }
      ]
    },
    {
      id: 'vhard2',
      title: "The History Detective",
      story: "When renovating the old courthouse, workers discovered a sealed room behind a false wall. Inside, they found documents, photographs, and artifacts from the 1800s. Local historian Emma Rodriguez was called to examine the findings. She carefully catalogued each item and realized they told the story of the town's first mayor, who had apparently hidden these treasures during a difficult period in the town's history. The discovery provided valuable insights into how the community had overcome challenges over a century ago, and the items were eventually displayed in the town museum for everyone to learn from.",
      questions: [
        {
          id: 'q1',
          question: "Where were the historical items discovered?",
          options: ["In the basement", "In a sealed room behind a false wall", "In the attic", "In an old safe"],
          correct: 1,
          explanation: "The story says 'workers discovered a sealed room behind a false wall' where the items were found."
        },
        {
          id: 'q2',
          question: "What did the discovery teach people about?",
          options: ["How to build buildings", "The town's first mayor and history", "How to preserve artifacts", "Modern renovation techniques"],
          correct: 1,
          explanation: "The items 'told the story of the town's first mayor' and 'provided valuable insights into how the community had overcome challenges over a century ago.'"
        }
      ]
    }
  ],

  difficulty5: [
    {
      id: 'expert1',
      title: "The Time Capsule Discovery",
      story: "While helping her grandfather clean out his attic, Zoe discovered a dusty metal box hidden behind old Christmas decorations. Her grandfather's eyes widened with recognition when she showed it to him. 'I completely forgot about this,' he said, carefully opening the time capsule he had created in 1985. Inside, they found photographs of her grandfather as a young man, handwritten letters to his future self, a mixtape of his favorite songs, and newspaper clippings from that year. Most intriguingly, there was a sealed envelope labeled 'Predictions for the Year 2020.' As they read his predictions together, some were surprisingly accurate while others made them both laugh. Zoe suggested they create a new time capsule together, bridging the gap between his past and her future.",
      questions: [
        {
          id: 'q1',
          question: "What made the grandfather's predictions particularly interesting?",
          options: ["They were all completely wrong", "Some were accurate while others were amusing", "They were written in a foreign language", "They predicted Zoe's birth"],
          correct: 1,
          explanation: "The story says 'some were surprisingly accurate while others made them both laugh.'"
        },
        {
          id: 'q2',
          question: "What did Zoe suggest at the end of the story?",
          options: ["Selling the old time capsule", "Creating a new time capsule together", "Returning the box to the attic", "Giving the items to a museum"],
          correct: 1,
          explanation: "The story ends with 'Zoe suggested they create a new time capsule together, bridging the gap between his past and her future.'"
        }
      ]
    },
    {
      id: 'expert2',
      title: "The Ecosystem Balance",
      story: "Biologist Dr. Martinez was studying the delicate balance of a forest ecosystem when she observed an interesting phenomenon. The population of deer had increased significantly over the past five years, but surprisingly, this wasn't due to more births or fewer natural predators. Her research revealed that climate change had extended the growing season, resulting in more abundant food sources throughout the year. However, this population boom was beginning to impact other species - the increased browsing pressure was affecting tree saplings and understory plants, which in turn influenced bird nesting habitats. Dr. Martinez realized that even positive changes in an ecosystem could have complex, unexpected consequences that required careful monitoring and sometimes human intervention.",
      questions: [
        {
          id: 'q1',
          question: "What was the main cause of the deer population increase?",
          options: ["More births", "Fewer predators", "Extended growing season from climate change", "Human protection"],
          correct: 2,
          explanation: "The story explains that 'climate change had extended the growing season, resulting in more abundant food sources throughout the year.'"
        },
        {
          id: 'q2',
          question: "How was the deer population increase affecting other species?",
          options: ["It helped all other animals", "It affected tree saplings and bird habitats", "It had no effect", "It only helped the plants"],
          correct: 1,
          explanation: "The text states that 'the increased browsing pressure was affecting tree saplings and understory plants, which in turn influenced bird nesting habitats.'"
        }
      ]
    }
  ]
};

export const DIFFICULTY_LEVELS = [
  { id: 1, name: "Beginner", description: "Simple stories with basic vocabulary" },
  { id: 2, name: "Elementary", description: "Longer stories with more details" },
  { id: 3, name: "Intermediate", description: "Complex stories requiring inference" },
  { id: 4, name: "Advanced", description: "Detailed stories with multiple concepts" },
  { id: 5, name: "Expert", description: "Complex narratives with nuanced understanding" }
];

// Helper functions for compatibility
export const getDifficultyColor = (difficulty) => {
  const colors = {
    1: "#10b981", // Green
    2: "#3b82f6", // Blue
    3: "#f59e0b", // Orange
    4: "#ef4444", // Red
    5: "#8b5cf6"  // Purple
  };
  return colors[difficulty] || "#6b7280";
};

export const getDifficultyStars = (difficulty) => {
  return difficulty;
};

export const getDifficulties = () => {
  return DIFFICULTY_LEVELS.map(level => ({
    level: level.id,
    name: level.name,
    color: getDifficultyColor(level.id)
  }));
};

export const getStoriesByDifficulty = (difficulty) => {
  return READING_STORIES[`difficulty${difficulty}`] || [];
};

export type SlideType = 'intro' | 'concept' | 'interactive' | 'code' | 'summary';

export interface Slide {
  type: SlideType;
  emoji?: string;
  title: string;
  body: string;
  highlight?: string;
  code?: string;
  question?: string;
  options?: string[];
  correctIndex?: number;
  explanation?: string;
}

export interface QuizQuestion {
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

export interface Lesson {
  id: string;
  courseId: string;
  title: string;
  subtitle: string;
  duration: string;
  xpReward: number;
  slides: Slide[];
  quiz: QuizQuestion[];
}

export interface Course {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  emoji: string;
  gradient: readonly [string, string];
  level: 'Beginner' | 'Intermediate' | 'Advanced';
  totalDuration: string;
  xpReward: number;
  tags: string[];
  lessons: Lesson[];
}

export const COURSES: Course[] = [
  {
    id: 'ai-intro',
    title: 'Introduction to AI',
    subtitle: 'How artificial intelligence actually works',
    description: 'Demystify AI from the ground up. Learn what it is, how it learns, and why it matters for your future.',
    emoji: '🤖',
    gradient: ['#F857A6', '#FF5858'],
    level: 'Beginner',
    totalDuration: '45 min',
    xpReward: 500,
    tags: ['AI Basics', 'Machine Learning', 'Neural Networks'],
    lessons: [
      {
        id: 'ai-intro-0',
        courseId: 'ai-intro',
        title: 'What is AI?',
        subtitle: 'The intelligence behind the machines',
        duration: '8 min',
        xpReward: 100,
        slides: [
          {
            type: 'intro',
            emoji: '🤖',
            title: 'What is Artificial Intelligence?',
            body: 'AI is the ability of machines to perform tasks that typically require human intelligence — understanding language, recognizing images, making decisions, and learning from experience.',
            highlight: 'AI learns from patterns, not programmed rules.',
          },
          {
            type: 'concept',
            emoji: '⚡',
            title: 'AI vs Traditional Software',
            body: 'Traditional software follows explicit rules a programmer writes. AI learns its own rules from data.\n\nTraditional: IF email contains "prize" → mark as spam\nAI: Study 1 million emails, learn spam patterns automatically.',
            highlight: 'The shift from rules → learning is the entire AI revolution.',
          },
          {
            type: 'concept',
            emoji: '🗺️',
            title: 'The AI Landscape',
            body: 'Think of it as three nested circles:\n\n🔵 AI — the broad field of intelligent machines\n🟣 Machine Learning — AI that learns from data\n🟡 Deep Learning — ML using neural networks\n\nChatGPT, Claude, Gemini all live in Deep Learning.',
          },
          {
            type: 'interactive',
            emoji: '🧠',
            title: 'Quick Check',
            body: 'Test what you just learned.',
            question: 'Which of these is powered by AI?',
            options: [
              'A spreadsheet formula',
              'A spam filter that learns from flagged emails',
              'A digital alarm clock',
              'A printed calendar',
            ],
            correctIndex: 1,
            explanation: 'The spam filter learns patterns from data — that\'s AI. The others follow fixed rules or have no intelligence at all.',
          },
          {
            type: 'summary',
            emoji: '✅',
            title: 'Lesson Complete',
            body: 'You now understand the foundation of AI.',
            highlight: '• AI learns from data, not rules\n• Machine Learning is a subset of AI\n• Deep Learning uses neural networks\n• You already use AI dozens of times daily',
          },
        ],
        quiz: [
          {
            question: 'What makes AI fundamentally different from traditional programming?',
            options: [
              'AI runs much faster on computers',
              'AI learns patterns from data instead of following fixed rules',
              'AI requires an internet connection',
              'AI uses more electricity',
            ],
            correctIndex: 1,
            explanation: 'Traditional programs follow explicit rules. AI discovers rules by learning from examples — that\'s the core difference.',
          },
          {
            question: 'Which is a subset of AI that focuses specifically on learning from data?',
            options: ['Deep Computing', 'Machine Learning', 'Quantum AI', 'Neural Programming'],
            correctIndex: 1,
            explanation: 'Machine Learning is the subfield of AI where systems improve their performance by learning from data.',
          },
          {
            question: 'What does "deep" in Deep Learning refer to?',
            options: [
              'Deep philosophical thinking',
              'Running on powerful supercomputers',
              'Many layers in a neural network',
              'Training for a very long time',
            ],
            correctIndex: 2,
            explanation: '"Deep" refers to the many layers of artificial neurons stacked together in a neural network.',
          },
          {
            question: 'Which company created ChatGPT?',
            options: ['Google', 'Meta', 'OpenAI', 'Microsoft'],
            correctIndex: 2,
            explanation: 'ChatGPT was created by OpenAI. Microsoft invested heavily in OpenAI and integrated it into Bing/Copilot.',
          },
        ],
      },
      {
        id: 'ai-intro-1',
        courseId: 'ai-intro',
        title: 'How Machines Learn',
        subtitle: 'Training, data, and the magic of patterns',
        duration: '10 min',
        xpReward: 120,
        slides: [
          {
            type: 'intro',
            emoji: '📚',
            title: 'The Secret Behind AI',
            body: 'AI learns through training — exposing a model to millions of examples until it recognizes patterns so well it can predict outcomes on data it\'s never seen before.',
            highlight: 'More data + better architecture = smarter AI.',
          },
          {
            type: 'concept',
            emoji: '🏷️',
            title: 'Supervised Learning',
            body: 'You teach the AI with labeled examples.\n\n• 10,000 photos labeled "cat" or "not cat"\n• AI learns the features that define a cat\n• Now it can identify cats in photos it\'s never seen\n\nThis is how most practical AI is built today.',
            highlight: 'Labeled data is the fuel of supervised learning.',
          },
          {
            type: 'concept',
            emoji: '🔍',
            title: 'Unsupervised Learning',
            body: 'No labels. The AI finds hidden patterns on its own.\n\nExamples:\n• Grouping customers by behavior (without being told the groups)\n• Detecting anomalies in financial transactions\n• Compressing images without quality loss\n\nUsed when labeling data is expensive or impossible.',
          },
          {
            type: 'interactive',
            emoji: '📧',
            title: 'Quick Check',
            body: 'Apply what you\'ve learned.',
            question: 'A spam filter trained on millions of emails labeled "spam" or "not spam" uses which learning type?',
            options: ['Unsupervised learning', 'Supervised learning', 'Reinforcement learning', 'Deep thinking'],
            correctIndex: 1,
            explanation: 'Labeled data ("spam" / "not spam") makes this supervised learning — the classic case.',
          },
          {
            type: 'summary',
            emoji: '✅',
            title: 'Lesson Complete',
            body: 'You understand how AI learns from data.',
            highlight: '• Training = examples → patterns → predictions\n• Supervised: uses labeled examples\n• Unsupervised: finds patterns without labels\n• More quality data = better models',
          },
        ],
        quiz: [
          {
            question: 'What is "training data" in the context of AI?',
            options: [
              'Data used to exercise your body',
              'Examples used to teach an AI model patterns',
              'Confidential company data',
              'Test results from students',
            ],
            correctIndex: 1,
            explanation: 'Training data is the collection of examples an AI model learns from to improve its performance on a task.',
          },
          {
            question: 'What is "overfitting" in machine learning?',
            options: [
              'When a model is too simple to learn anything',
              'When a model memorizes training data but fails on new examples',
              'When training takes too long',
              'When the dataset is too large',
            ],
            correctIndex: 1,
            explanation: 'Overfitting means the model memorized training examples instead of learning generalizable patterns — it fails on real-world data.',
          },
          {
            question: 'In supervised learning, what must training examples include?',
            options: [
              'Only raw images or text',
              'Correct labels or answers',
              'Internet access during training',
              'A database connection',
            ],
            correctIndex: 1,
            explanation: 'Supervised learning requires labeled data — each example must have the correct answer the model should learn to predict.',
          },
          {
            question: 'Netflix recommends shows based on your watch history. Which learning type does this most resemble?',
            options: [
              'Supervised learning with fixed labels',
              'Unsupervised learning finding patterns in behavior',
              'No learning, just rules',
              'Manual curation by employees',
            ],
            correctIndex: 1,
            explanation: 'Recommendation systems typically use unsupervised techniques (like collaborative filtering) to find patterns across users\' behavior without explicit labels.',
          },
        ],
      },
      {
        id: 'ai-intro-2',
        courseId: 'ai-intro',
        title: 'Inside Neural Networks',
        subtitle: 'How your brain inspired modern AI',
        duration: '12 min',
        xpReward: 130,
        slides: [
          {
            type: 'intro',
            emoji: '🧬',
            title: 'Your Brain Inspired This',
            body: 'Neural networks are computing systems loosely modeled on the biological brain. Like biological neurons, artificial neurons receive signals, process them, and pass results to the next layer.',
            highlight: 'Billions of parameters, one goal: find the pattern.',
          },
          {
            type: 'concept',
            emoji: '🏗️',
            title: 'Neurons and Layers',
            body: 'Every neural network has three layer types:\n\n① Input layer — receives raw data (pixels, words, numbers)\n② Hidden layers — transform and abstract the data\n③ Output layer — produces the final prediction\n\n"Deep" learning = many hidden layers stacked together.',
          },
          {
            type: 'concept',
            emoji: '⚖️',
            title: 'Weights, Bias & Learning',
            body: 'Each connection between neurons has a weight — a number controlling how much influence one neuron has on the next.\n\nDuring training, the network adjusts weights using backpropagation — a process that measures error and nudges weights to reduce it. Repeat millions of times = a trained model.',
            highlight: 'Training = adjusting weights until errors are minimized.',
          },
          {
            type: 'interactive',
            emoji: '🎯',
            title: 'Quick Check',
            body: 'Test your understanding.',
            question: 'What does the output layer of a neural network do?',
            options: [
              'Stores the training data',
              'Connects to the internet',
              'Produces the final prediction or answer',
              'Receives the raw input data',
            ],
            correctIndex: 2,
            explanation: 'The output layer is the last layer — it produces the model\'s final answer, whether that\'s a classification, a number, or generated text.',
          },
          {
            type: 'summary',
            emoji: '✅',
            title: 'Lesson Complete',
            body: 'You can now picture what\'s happening inside AI.',
            highlight: '• Three layer types: input, hidden, output\n• Weights control connection strengths\n• Backpropagation adjusts weights during training\n• "Deep" = many hidden layers',
          },
        ],
        quiz: [
          {
            question: 'What is the role of hidden layers in a neural network?',
            options: [
              'Store user personal data',
              'Process and transform data between input and output',
              'Display results on screen',
              'Connect the model to APIs',
            ],
            correctIndex: 1,
            explanation: 'Hidden layers progressively transform raw input into more abstract representations that the output layer can use to make accurate predictions.',
          },
          {
            question: 'What does "deep" in "deep learning" actually refer to?',
            options: [
              'Very complex mathematics',
              'Running on deep underground servers',
              'Many hidden layers in a neural network',
              'Training the model for a very long time',
            ],
            correctIndex: 2,
            explanation: '"Deep" refers to the depth of the network — specifically the many hidden layers between input and output.',
          },
          {
            question: 'What process adjusts weights during neural network training?',
            options: ['Forward pass', 'Activation function', 'Backpropagation', 'Normalization'],
            correctIndex: 2,
            explanation: 'Backpropagation calculates how much each weight contributed to the error, then adjusts weights in the direction that reduces that error.',
          },
          {
            question: 'GPT-4 has ~1.8 trillion parameters. What are parameters in a neural network?',
            options: [
              'Lines of code written by engineers',
              'The weights and biases the model learns during training',
              'The training examples fed to the model',
              'Rules programmed by the AI team',
            ],
            correctIndex: 1,
            explanation: 'Parameters are the learned weights and biases of a neural network — the actual numerical values the training process adjusts to minimize prediction errors.',
          },
        ],
      },
      {
        id: 'ai-intro-3',
        courseId: 'ai-intro',
        title: 'AI in the Real World',
        subtitle: 'Generative AI and the models changing everything',
        duration: '10 min',
        xpReward: 150,
        slides: [
          {
            type: 'intro',
            emoji: '🌍',
            title: 'AI Is Already Everywhere',
            body: 'From the feed on your phone to the search in your browser — AI shapes your digital life. In 2024, generative AI crossed from research labs into every industry on earth.',
            highlight: 'We\'re living in the fastest technology shift in history.',
          },
          {
            type: 'concept',
            emoji: '✨',
            title: 'Generative AI',
            body: 'A new wave of AI that creates rather than classifies:\n\n• Text → ChatGPT, Claude, Gemini\n• Images → DALL-E, Midjourney, Stable Diffusion\n• Code → GitHub Copilot, Cursor\n• Audio/Video → ElevenLabs, Sora\n\nThese models generate new content — they don\'t just analyze existing data.',
          },
          {
            type: 'concept',
            emoji: '🔧',
            title: 'The Transformer Architecture',
            body: 'GPT, Claude, Gemini — they all use the Transformer model (introduced by Google in 2017).\n\nKey insight: Transformers use "attention" to understand relationships between all words in a sentence simultaneously — not one by one like older models.\n\nThis is why modern LLMs understand context so well.',
            highlight: 'Attention is all you need. — Original Transformer paper title',
          },
          {
            type: 'interactive',
            emoji: '🤔',
            title: 'Quick Check',
            body: 'Test your understanding.',
            question: 'ChatGPT generates new text based on your prompt. What type of AI is this?',
            options: [
              'Discriminative AI',
              'Generative AI',
              'Supervised classification AI',
              'Robotic process automation',
            ],
            correctIndex: 1,
            explanation: 'Generative AI creates new content — text, images, code, audio. ChatGPT generates text responses, making it a Generative AI model.',
          },
          {
            type: 'summary',
            emoji: '🎓',
            title: 'Course Complete!',
            body: 'You\'re now AI-literate. You understand what AI is, how it learns, how neural networks work, and what the generative AI revolution means.',
            highlight: '• Generative AI creates new content\n• Transformers power all major LLMs\n• Attention mechanisms enable context understanding\n• You have the foundation for everything else',
          },
        ],
        quiz: [
          {
            question: 'What type of AI specializes in creating new content like text and images?',
            options: ['Narrow AI', 'Generative AI', 'Robotic AI', 'Analytical AI'],
            correctIndex: 1,
            explanation: 'Generative AI is designed to produce new content — text, images, audio, video, code — rather than simply classifying or analyzing existing data.',
          },
          {
            question: 'What neural network architecture do GPT, Claude, and Gemini all use?',
            options: ['CNN (Convolutional Neural Network)', 'RNN (Recurrent Neural Network)', 'Transformer', 'Decision Tree'],
            correctIndex: 2,
            explanation: 'All major large language models (LLMs) are built on the Transformer architecture introduced by Google researchers in the 2017 paper "Attention Is All You Need."',
          },
          {
            question: 'What does LLM stand for?',
            options: [
              'Large Learning Model',
              'Low-Level Machine learning',
              'Large Language Model',
              'Logical Learning Mechanism',
            ],
            correctIndex: 2,
            explanation: 'LLM stands for Large Language Model — AI systems trained on massive text datasets to understand and generate human language.',
          },
          {
            question: 'Which of these is NOT an example of generative AI?',
            options: [
              'ChatGPT writing an email',
              'DALL-E creating an image from text',
              'Gmail filtering spam from your inbox',
              'GitHub Copilot suggesting code',
            ],
            correctIndex: 2,
            explanation: 'Gmail spam filtering is a classification task (spam or not spam) — it doesn\'t generate new content. The other three all create new original content.',
          },
        ],
      },
    ],
  },

  {
    id: 'prompt-eng',
    title: 'Prompt Engineering',
    subtitle: 'Get 10× more from every AI interaction',
    description: 'Master the art of directing AI. Learn the frameworks professionals use to get precise, powerful outputs every time.',
    emoji: '✨',
    gradient: ['#4776E6', '#8E54E9'],
    level: 'Intermediate',
    totalDuration: '50 min',
    xpReward: 600,
    tags: ['Prompting', 'ChatGPT', 'Productivity'],
    lessons: [
      {
        id: 'prompt-eng-0',
        courseId: 'prompt-eng',
        title: 'The Power of Prompting',
        subtitle: 'Why your words are the most important variable',
        duration: '8 min',
        xpReward: 100,
        slides: [
          {
            type: 'intro',
            emoji: '🎯',
            title: 'Your Words Are Instructions',
            body: 'A prompt is the input you give to an AI. The quality of your prompt directly determines the quality of the output.\n\nA vague prompt → vague, generic output.\nA precise prompt → precise, useful output.\n\nThis is the highest-leverage skill of the AI era.',
            highlight: 'Prompt quality = output quality. Full stop.',
          },
          {
            type: 'concept',
            emoji: '🔬',
            title: 'What is Prompt Engineering?',
            body: 'Prompt engineering is the practice of designing inputs to AI models to produce specific, high-quality outputs.\n\nIt\'s part art, part science:\n• Art: Framing, tone, context, creativity\n• Science: Systematic testing, iteration, measurement\n\nProfessional prompt engineers can earn $200K+ at top companies.',
          },
          {
            type: 'concept',
            emoji: '🕳️',
            title: 'The Gap Problem',
            body: 'Three things rarely match:\n\n① What you think → ② What you type → ③ What AI understands\n\nEvery gap introduces error. Prompt engineering closes these gaps by being explicit about context, role, format, and expected output.\n\nMost people skip steps 2 and 3 — that\'s why their results are mediocre.',
            highlight: 'Close the gap between intent and instruction.',
          },
          {
            type: 'interactive',
            emoji: '💭',
            title: 'Quick Check',
            body: 'Apply the concept.',
            question: 'You ask ChatGPT "write something about marketing." The result is vague and generic. What\'s the root cause?',
            options: [
              'ChatGPT is broken for marketing topics',
              'The prompt lacks context, role, and specific output requirements',
              'AI doesn\'t understand marketing',
              'You need a paid subscription for good results',
            ],
            correctIndex: 1,
            explanation: 'Vague input = vague output. "Write something about marketing" gives the AI no context about audience, tone, length, format, or goal. The AI makes its best guess — and guesses generically.',
          },
          {
            type: 'summary',
            emoji: '✅',
            title: 'Lesson Complete',
            body: 'You understand why prompting is a skill worth mastering.',
            highlight: '• Prompt quality = output quality\n• The gap between intent and instruction creates errors\n• Prompting is both art and science\n• It\'s the highest-leverage AI skill available to you',
          },
        ],
        quiz: [
          {
            question: 'What is prompt engineering?',
            options: [
              'Building AI models from scratch',
              'Crafting precise inputs to get high-quality AI outputs',
              'Writing code that runs on AI chips',
              'Training neural networks with new data',
            ],
            correctIndex: 1,
            explanation: 'Prompt engineering is the practice of designing inputs (prompts) to AI systems to reliably produce accurate, useful, and high-quality outputs.',
          },
          {
            question: 'Why does the quality of a prompt matter so much?',
            options: [
              'AI models charge more tokens for complex tasks',
              'AI output quality directly reflects the clarity and specificity of the prompt',
              'AI models are still very basic and need guidance on every word',
              'Prompts are stored and reused by the AI forever',
            ],
            correctIndex: 1,
            explanation: 'AI models are powerful but they respond to what\'s in the prompt. More context, clarity, and specificity = more relevant and precise responses.',
          },
          {
            question: 'What is a "system prompt"?',
            options: [
              'Instructions your computer sends at startup',
              'Instructions set at the start of a session that define the AI\'s persona and behavior',
              'A prompt specifically about system design or architecture',
              'A technical error message from the AI',
            ],
            correctIndex: 1,
            explanation: 'A system prompt is an initial instruction that defines how the AI should behave throughout a conversation — its role, tone, constraints, and goals.',
          },
          {
            question: 'Which is a significantly better prompt?',
            options: [
              '"Tell me about climate change"',
              '"Explain the 3 most significant human causes of climate change in plain language for a high school student, using one real-world example for each cause"',
              '"Climate change info please"',
              '"Write about the environment and how it\'s changing"',
            ],
            correctIndex: 1,
            explanation: 'The second prompt specifies the number of points (3), the topic (human causes), the audience (high school student), the format (plain language), and requires examples — all elements that produce a precise, useful response.',
          },
        ],
      },
      {
        id: 'prompt-eng-1',
        courseId: 'prompt-eng',
        title: 'Anatomy of Great Prompts',
        subtitle: 'The 5-element framework every pro uses',
        duration: '12 min',
        xpReward: 120,
        slides: [
          {
            type: 'intro',
            emoji: '🏗️',
            title: 'The 5-Element Framework',
            body: 'World-class prompts are built from up to 5 elements:\n\n① Role — who the AI should be\n② Context — background information\n③ Task — exactly what to do\n④ Format — how to structure the output\n⑤ Examples — what "good" looks like\n\nYou don\'t always need all 5. Use what the task requires.',
            highlight: 'These 5 elements eliminate the guesswork.',
          },
          {
            type: 'concept',
            emoji: '🎭',
            title: 'Role + Context',
            body: 'Role: Tell the AI what expert to embody.\n"You are a senior UX designer at a top tech company..."\n\nContext: Provide relevant background.\n"...I\'m redesigning the onboarding for a B2B SaaS product. Our users are non-technical operations managers at mid-size companies."\n\nThese two elements alone transform the quality of responses.',
            highlight: 'The more specific the role, the more expert the response.',
          },
          {
            type: 'concept',
            emoji: '📋',
            title: 'Task + Format + Examples',
            body: 'Task: State clearly what you want done.\n"Write 5 microcopy options for the welcome screen tooltip."\n\nFormat: Specify the output structure.\n"Output as a numbered list. Each option max 12 words."\n\nExamples: Show the quality bar.\n"Like this: \'Your dashboard is ready — let\'s take a quick tour\'"\n\nExamples are the most underused element. They\'re also the most powerful.',
          },
          {
            type: 'interactive',
            emoji: '🔍',
            title: 'Quick Check',
            body: 'Identify the elements.',
            question: 'Prompt: "You are a senior copywriter. Write 3 email subject lines for a flash sale on running shoes targeting gym-goers aged 25–35. Output as a bulleted list."\n\nWhich element is present but has room to improve?',
            options: [
              'Role (needs more specificity)',
              'Format (output format is well defined)',
              'Examples (none provided — adding one would sharpen results)',
              'Task (the task is clearly stated)',
            ],
            correctIndex: 2,
            explanation: 'Role, Task, and Format are all present. The missing element is Examples — adding one exemplary subject line would show the AI the exact tone and style you\'re after, dramatically improving output quality.',
          },
          {
            type: 'summary',
            emoji: '✅',
            title: 'Lesson Complete',
            body: 'You have a professional framework for every prompt you write.',
            highlight: '• 5 elements: Role, Context, Task, Format, Examples\n• Role + Context set the stage\n• Task + Format define the deliverable\n• Examples are the most powerful yet underused element',
          },
        ],
        quiz: [
          {
            question: 'What does the "Role" element do in a prompt?',
            options: [
              'Specifies how long the output should be',
              'Tells the AI what expert persona to adopt',
              'Provides examples of good output',
              'Defines the main topic',
            ],
            correctIndex: 1,
            explanation: 'The Role element instructs the AI to respond as a specific expert or persona ("You are a senior financial analyst..."), which calibrates the depth, vocabulary, and perspective of the response.',
          },
          {
            question: 'You want the AI to return a JSON object instead of a paragraph. Which prompt element handles this?',
            options: ['Role', 'Context', 'Task', 'Format'],
            correctIndex: 3,
            explanation: 'Format controls how the output is structured — whether that\'s a bullet list, numbered list, table, JSON, code block, or any other specific structure.',
          },
          {
            question: 'Why are examples the most powerful element in a prompt?',
            options: [
              'They make the prompt look longer and more authoritative',
              'They show the AI the exact style, tone, and quality you expect rather than describing it abstractly',
              'Examples are permanently learned by the AI for future use',
              'Examples replace the need for other prompt elements',
            ],
            correctIndex: 1,
            explanation: 'Showing beats telling. An example demonstrates the exact quality, style, and format you want in a way that\'s concrete and unambiguous — far more effective than describing it in words.',
          },
          {
            question: 'What is "Context" in the 5-element framework?',
            options: [
              'The main task or request you\'re making',
              'Background information the AI needs to give relevant, tailored output',
              'The output format you want',
              'The role you assign to the AI',
            ],
            correctIndex: 1,
            explanation: 'Context is the background information that helps the AI understand your situation — who the audience is, what the constraints are, what problem you\'re solving. It makes responses relevant rather than generic.',
          },
        ],
      },
      {
        id: 'prompt-eng-2',
        courseId: 'prompt-eng',
        title: 'Advanced Techniques',
        subtitle: 'Chain of Thought, few-shot, and beyond',
        duration: '12 min',
        xpReward: 130,
        slides: [
          {
            type: 'intro',
            emoji: '🚀',
            title: 'Beyond the Basics',
            body: 'You know the 5-element framework. Now learn the techniques that unlock dramatically higher performance on complex tasks — reasoning, analysis, structured extraction, and creative generation.',
            highlight: 'These techniques are what separate good from exceptional prompting.',
          },
          {
            type: 'concept',
            emoji: '🔗',
            title: 'Chain of Thought (CoT)',
            body: 'Add "Let\'s think step by step" or "Walk me through your reasoning" to your prompt.\n\nThe AI breaks the problem into explicit steps before answering.\n\nResult: Dramatically fewer logical errors on math problems, analysis tasks, and multi-step reasoning.\n\nWhy it works: The model\'s intermediate reasoning becomes part of its context, constraining later reasoning to be consistent.',
            highlight: '"Think step by step" is one of the most powerful phrases in prompting.',
          },
          {
            type: 'concept',
            emoji: '🎯',
            title: 'Few-Shot Prompting',
            body: 'Provide 2–5 examples of input → output pairs before your actual request. The AI infers the pattern.\n\nExample:\n[Review: "Loved it!"] → Positive\n[Review: "Terrible waste of time"] → Negative\n[Review: "Not bad, but not great"] → ?\n\nThe AI classifies the last one correctly without you ever defining rules. Show, don\'t tell.',
            highlight: 'Few-shot is the fastest way to teach an AI your specific style.',
          },
          {
            type: 'interactive',
            emoji: '🧩',
            title: 'Quick Check',
            body: 'Identify the technique.',
            question: 'You add "explain your reasoning step-by-step before giving the final answer" to a complex math problem prompt. This is:',
            options: [
              'Few-shot prompting',
              'Zero-shot prompting',
              'Chain of Thought prompting',
              'Role prompting',
            ],
            correctIndex: 2,
            explanation: 'Asking the AI to show its reasoning step-by-step is Chain of Thought (CoT) prompting — it forces the model to reason explicitly, reducing errors on complex problems.',
          },
          {
            type: 'summary',
            emoji: '✅',
            title: 'Lesson Complete',
            body: 'You can now use advanced prompting techniques like a pro.',
            highlight: '• CoT: "Step by step" reasoning for complex tasks\n• Few-shot: 2–5 examples that teach the pattern\n• Zero-shot: No examples — clear instruction only\n• Combine techniques for maximum effect',
          },
        ],
        quiz: [
          {
            question: 'Chain of Thought prompting is most effective for which type of task?',
            options: [
              'Writing short social media captions',
              'Generating random creative ideas',
              'Multi-step reasoning, math problems, and logical analysis',
              'Simple factual Q&A',
            ],
            correctIndex: 2,
            explanation: 'CoT forces the model to reason step-by-step, which catches errors in logical chains. It\'s most impactful on tasks requiring multi-step reasoning where intermediate errors compound.',
          },
          {
            question: 'Few-shot prompting involves:',
            options: [
              'Using the minimum possible words in your prompt',
              'Providing 2–5 input/output examples that demonstrate the pattern you want',
              'Asking multiple short questions in sequence',
              'Only prompting the AI a few times per day',
            ],
            correctIndex: 1,
            explanation: 'Few-shot prompting provides a small number of examples (typically 2–5) that demonstrate the exact pattern, style, or format you want the AI to follow on your actual request.',
          },
          {
            question: 'Zero-shot prompting means:',
            options: [
              'The AI performs poorly on the task',
              'You provide no examples and rely on clear, explicit instructions alone',
              'No tokens are used in processing',
              'The model receives no instructions at all',
            ],
            correctIndex: 1,
            explanation: 'Zero-shot means zero examples. You rely entirely on clear instruction to guide the AI — no demonstrations of what the output should look like.',
          },
          {
            question: 'Which prompting phrase is most commonly used to trigger Chain of Thought reasoning?',
            options: [
              '"Be as creative as possible"',
              '"Think step by step"',
              '"Generate output now"',
              '"Use your best judgment"',
            ],
            correctIndex: 1,
            explanation: '"Think step by step" (and variants like "Let\'s reason through this") are the canonical Chain of Thought triggers shown in the original CoT research to significantly improve reasoning accuracy.',
          },
        ],
      },
      {
        id: 'prompt-eng-3',
        courseId: 'prompt-eng',
        title: 'Prompting Masterclass',
        subtitle: 'Iteration, temperature, and professional-grade output',
        duration: '12 min',
        xpReward: 150,
        slides: [
          {
            type: 'intro',
            emoji: '🏆',
            title: 'Pro-Level Prompting',
            body: 'The final layer: iterative refinement, temperature control, and building a personal prompt library. This is what separates casual users from people who get consistently exceptional results.',
            highlight: 'Great prompts are crafted, not written.',
          },
          {
            type: 'concept',
            emoji: '🔄',
            title: 'Iterative Prompting',
            body: 'The best prompts go through multiple rounds of refinement:\n\n1. Draft prompt → evaluate output\n2. What worked? What didn\'t?\n3. Add specificity where it was missing\n4. Remove constraints that were too rigid\n5. Repeat until output consistently meets the bar\n\nProfessionals treat prompts like code — tested, versioned, improved.',
            highlight: 'The best prompt you write today will be better tomorrow.',
          },
          {
            type: 'concept',
            emoji: '🌡️',
            title: 'Temperature: Controlling Creativity',
            body: 'Temperature controls how "random" or "creative" the AI\'s responses are:\n\n🔵 Low (0.1–0.3): Precise, deterministic, factual\n→ Use for: Code, data extraction, factual Q&A\n\n🟡 Medium (0.5–0.7): Balanced, professional\n→ Use for: Emails, summaries, analysis\n\n🔴 High (0.8–1.0): Creative, diverse, unexpected\n→ Use for: Brainstorming, fiction, ideation',
            highlight: 'Match temperature to task. Most chat apps let you adjust it.',
          },
          {
            type: 'interactive',
            emoji: '📊',
            title: 'Quick Check',
            body: 'Choose the right temperature.',
            question: 'You\'re extracting structured data from 500 customer support tickets. Which temperature setting maximizes accuracy?',
            options: [
              '0.9 — high creativity for varied extraction',
              '0.2 — low temperature for precise, consistent output',
              '1.5 — maximum creativity',
              "Temperature doesn't affect structured tasks",
            ],
            correctIndex: 1,
            explanation: 'Data extraction needs consistency and precision — the same input should always produce the same structured output. Low temperature (0.1–0.3) minimizes randomness and maximizes reliability.',
          },
          {
            type: 'summary',
            emoji: '🎓',
            title: 'Course Complete!',
            body: 'You\'re now a trained prompt engineer. Your AI interactions will never be the same.',
            highlight: '• Iteration: treat prompts like code — test and refine\n• Temperature: match creativity level to the task\n• Low temp = precise; High temp = creative\n• Build a personal library of your best prompts',
          },
        ],
        quiz: [
          {
            question: 'What is "iterative prompting"?',
            options: [
              'Sending the exact same prompt multiple times until you get what you want',
              'Systematically refining prompts based on evaluating each output',
              'Programming a loop that runs a prompt automatically',
              'Copying prompts shared by others online',
            ],
            correctIndex: 1,
            explanation: 'Iterative prompting means treating prompt development like a feedback loop — evaluate each output, identify gaps, refine the prompt, and repeat until results consistently meet your quality bar.',
          },
          {
            question: 'What does higher AI temperature produce?',
            options: [
              'Faster response times',
              'More creative, varied, and less predictable outputs',
              'More accurate, factual answers',
              'Shorter responses',
            ],
            correctIndex: 1,
            explanation: 'Higher temperature increases randomness in the model\'s output — generating more diverse, creative, and sometimes unexpected responses. Lower temperature keeps outputs precise and consistent.',
          },
          {
            question: 'What is "prompt injection"?',
            options: [
              'Adding technical medical terms to prompts for accuracy',
              'Malicious input designed to override or hijack an AI\'s intended behavior',
              'A grammar and spell-check tool for prompts',
              'Inserting code snippets into prompt text',
            ],
            correctIndex: 1,
            explanation: 'Prompt injection is a security attack where malicious text in user input (or retrieved data) overrides the system prompt\'s instructions, causing the AI to behave unintentionally. A key concern in production AI systems.',
          },
          {
            question: 'What should you do first when an AI response misses the mark?',
            options: [
              'Accept it and use the response anyway',
              'Switch to a different AI model immediately',
              'Analyze what information was missing from your prompt, add it, and retry',
              'Report a bug to the AI company',
            ],
            correctIndex: 2,
            explanation: 'Before switching models or giving up, analyze your own prompt. Usually the gap is in your instructions — missing context, unclear format expectations, or insufficient examples. Fix the prompt first.',
          },
        ],
      },
    ],
  },

  {
    id: 'ai-agents',
    title: 'AI Agents',
    subtitle: 'Build autonomous AI that works for you',
    description: 'Go beyond chatbots. Learn how AI agents think, plan, and take actions — then build your first agent for real work.',
    emoji: '🧠',
    gradient: ['#11998E', '#38EF7D'],
    level: 'Advanced',
    totalDuration: '55 min',
    xpReward: 700,
    tags: ['Agents', 'Automation', 'LangChain', 'Build'],
    lessons: [
      {
        id: 'ai-agents-0',
        courseId: 'ai-agents',
        title: 'Meet AI Agents',
        subtitle: 'AI that acts, not just answers',
        duration: '10 min',
        xpReward: 120,
        slides: [
          {
            type: 'intro',
            emoji: '🤖',
            title: 'AI That Acts, Not Just Answers',
            body: 'ChatGPT answers questions. An AI agent takes actions.\n\nAn agent can browse the web, write and run code, send emails, query databases, fill spreadsheets, and complete multi-step tasks — all autonomously.\n\nThis is the difference between a powerful tool and an autonomous worker.',
            highlight: 'Agents don\'t assist. They execute.',
          },
          {
            type: 'concept',
            emoji: '⚙️',
            title: 'What Makes an Agent?',
            body: 'Three defining properties:\n\n🔵 Autonomy — acts without step-by-step human guidance\n🟣 Goal-directed — pursues an objective over multiple steps\n🟢 Tool use — can call APIs, run code, search the web, write files\n\nWithout tool use, it\'s a chatbot. With tool use and autonomy, it\'s an agent.',
            highlight: 'Tool use + Autonomy + Goal = Agent',
          },
          {
            type: 'concept',
            emoji: '🆚',
            title: 'Agents vs Chatbots',
            body: 'Chatbot:\nYou ask → It responds → Conversation ends\n\nAgent:\nYou set a goal → Agent plans → Executes step 1 → Evaluates result → Executes step 2 → Adjusts based on findings → Reports back\n\nKey difference: Agents operate in a loop. Chatbots respond once.',
          },
          {
            type: 'interactive',
            emoji: '🎯',
            title: 'Quick Check',
            body: 'Identify the agent behavior.',
            question: 'You tell an AI: "Research our top 5 competitors and add their pricing to this spreadsheet." Which response is agent-level?',
            options: [
              'It asks you for a spreadsheet template before it can proceed',
              'It autonomously searches competitors, extracts pricing, and writes it to the spreadsheet',
              'It gives you a list of competitors to research yourself',
              'It explains what competitive research methodology to use',
            ],
            correctIndex: 1,
            explanation: 'An agent takes autonomous action toward the goal — searching, extracting, writing — without needing to be guided through each step. The other options just respond with information or pass the work back to you.',
          },
          {
            type: 'summary',
            emoji: '✅',
            title: 'Lesson Complete',
            body: 'You understand what makes an AI agent different from everything before it.',
            highlight: '• Agents take autonomous actions toward a goal\n• Tool use is what separates agents from chatbots\n• Agents operate in a loop, not a single response\n• This is the most significant AI shift for how we work',
          },
        ],
        quiz: [
          {
            question: 'What fundamentally distinguishes an AI agent from a standard chatbot?',
            options: [
              'Agents use a completely different programming language',
              'Agents take autonomous, multi-step actions toward a goal using tools',
              'Agents are older, more established technology',
              'Agents only work when not connected to the internet',
            ],
            correctIndex: 1,
            explanation: 'The key distinction is autonomous action with tools. Chatbots generate text responses. Agents use tools to take real actions — searching, writing files, calling APIs — in pursuit of a goal across multiple steps.',
          },
          {
            question: 'What is "tool use" in AI agents?',
            options: [
              'The AI physically uses a keyboard and mouse',
              'The AI\'s ability to call external APIs, run code, and interact with services',
              'A type of model fine-tuning technique',
              'Using keyboard shortcuts to operate the AI',
            ],
            correctIndex: 1,
            explanation: 'Tool use means the agent can call external functions — web search APIs, code execution environments, email services, databases, file systems. This is what gives agents the ability to take real-world actions.',
          },
          {
            question: 'Which of these is clearly an agent-level task (vs a chatbot task)?',
            options: [
              'Answer: "What is the capital of France?"',
              'Translate a paragraph to Spanish',
              'Monitor a Slack channel, summarize daily discussions, and email a digest to the team each evening',
              'Summarize a paragraph I paste in',
            ],
            correctIndex: 2,
            explanation: 'The Slack monitoring task requires persistent execution, tool use (Slack API, email), multi-step processing, and autonomous operation on a schedule — all hallmarks of an agent task.',
          },
          {
            question: 'What does agent "autonomy" mean in practice?',
            options: [
              'The agent has no internet connection',
              'The agent pursues a goal and makes decisions without needing step-by-step human instructions',
              'The agent never makes any mistakes',
              'The agent responds extremely quickly',
            ],
            correctIndex: 1,
            explanation: 'Autonomy means the agent can determine its own next steps toward a goal. You give it an objective; it figures out how to achieve it — which tools to use, in what order, adjusting based on results.',
          },
        ],
      },
      {
        id: 'ai-agents-1',
        courseId: 'ai-agents',
        title: 'How Agents Think',
        subtitle: 'The ReAct loop and memory systems',
        duration: '12 min',
        xpReward: 130,
        slides: [
          {
            type: 'intro',
            emoji: '🔄',
            title: 'The Agent Loop',
            body: 'Agents don\'t respond once. They run a continuous cycle:\n\nObserve → Think → Act → Observe result → Think again → Act again\n\nThis loop continues until the goal is achieved or the agent determines it\'s impossible.\n\nUnderstanding this loop is understanding how all modern agents work.',
            highlight: 'The loop is the heartbeat of every AI agent.',
          },
          {
            type: 'concept',
            emoji: '🧪',
            title: 'ReAct: Reasoning + Acting',
            body: 'ReAct is the dominant agent framework:\n\n🧠 Reasoning: "What do I know? What do I need? What\'s my next step?"\n⚡ Acting: Execute the decided action (call a tool, run code)\n👁️ Observing: Evaluate the result and update understanding\n\nAt each step, the agent reasons explicitly before acting — this prevents chaotic or contradictory behavior.',
            highlight: 'ReAct = Reasoning traces that guide coherent action.',
          },
          {
            type: 'concept',
            emoji: '🧠',
            title: 'Memory in Agents',
            body: 'Agents use two types of memory:\n\n📋 Short-term memory: The current conversation context — what\'s happened in this session\n\n🗄️ Long-term memory: A vector database storing past experiences, facts, and documents the agent can search and retrieve\n\nLong-term memory is what allows agents to learn over time and recall relevant past context.',
          },
          {
            type: 'interactive',
            emoji: '🔍',
            title: 'Quick Check',
            body: 'Identify the loop behavior.',
            question: 'An agent is tasked with booking a restaurant. It checks availability, finds none, then searches for alternatives, finds one, confirms availability, and books it. This is:',
            options: [
              'Error handling — the agent is managing a failure state',
              'The ReAct loop in action — observe, reason, act, repeat',
              'Memory retrieval — pulling past restaurant preferences',
              'Tool failure — the booking API isn\'t working',
            ],
            correctIndex: 1,
            explanation: 'This perfectly illustrates the ReAct loop: the agent observed (no availability), reasoned (find alternatives), acted (search), observed (found one), reasoned (confirm), acted (book). Multi-step autonomous execution toward the goal.',
          },
          {
            type: 'summary',
            emoji: '✅',
            title: 'Lesson Complete',
            body: 'You understand how agents think and remember.',
            highlight: '• The Observe→Think→Act loop is how all agents work\n• ReAct makes reasoning explicit before every action\n• Short-term: current session context\n• Long-term: vector DB for persistent knowledge\n• Memory makes agents smarter over time',
          },
        ],
        quiz: [
          {
            question: 'What does ReAct stand for in the context of AI agents?',
            options: [
              'Respond and Calculate',
              'Reasoning and Acting',
              'Recurrent Active Networks',
              'Real-time Action Training',
            ],
            correctIndex: 1,
            explanation: 'ReAct stands for Reasoning and Acting — a framework where agents generate explicit reasoning traces before taking actions, making their behavior more coherent and debuggable.',
          },
          {
            question: 'What is an agent\'s "short-term memory"?',
            options: [
              'A physical hard drive storing agent code',
              'The current conversation context and recent actions within the session',
              'Saved user preferences from previous months',
              'The model\'s learned weights from training',
            ],
            correctIndex: 1,
            explanation: 'Short-term memory is the context window — what\'s happened in the current session. It includes the conversation history, tool call results, and intermediate reasoning within the current task.',
          },
          {
            question: 'What is a vector database used for in AI agent systems?',
            options: [
              'Storing images and other binary files',
              'Long-term memory — storing and semantically retrieving past knowledge and experiences',
              'Running mathematical calculations faster',
              'Establishing network connections to APIs',
            ],
            correctIndex: 1,
            explanation: 'Vector databases store information as high-dimensional numerical vectors, enabling semantic similarity search. Agents use them as long-term memory to retrieve relevant past experiences, documents, or facts.',
          },
          {
            question: 'After an agent takes an action (e.g., calls a search API), what is the critical next step?',
            options: [
              'The agent immediately stops and waits for human confirmation',
              'The agent observes and evaluates the result to inform its next reasoning step',
              'The agent saves the result to long-term memory automatically',
              'The agent reports the result to the user and ends the loop',
            ],
            correctIndex: 1,
            explanation: 'After every action, the agent must observe the result and incorporate it into its reasoning before the next action. This feedback loop is what allows agents to adapt and course-correct dynamically.',
          },
        ],
      },
      {
        id: 'ai-agents-2',
        courseId: 'ai-agents',
        title: 'Building Blocks',
        subtitle: 'The 4 components every agent has',
        duration: '12 min',
        xpReward: 120,
        slides: [
          {
            type: 'intro',
            emoji: '🧱',
            title: 'The 4 Core Components',
            body: 'Every AI agent — no matter how complex — is built from four components:\n\n① LLM Brain — the reasoning core\n② Memory — short-term + long-term\n③ Tools — capabilities to act in the world\n④ Orchestrator — coordinates everything\n\nUnderstand these four and you understand any agent.',
            highlight: 'LLM + Memory + Tools + Orchestrator = Agent',
          },
          {
            type: 'concept',
            emoji: '🧠',
            title: 'The LLM Brain',
            body: 'The LLM (Claude, GPT-4, Gemini) is the reasoning engine. It:\n\n• Interprets the goal and breaks it into steps\n• Decides which tool to call and with what input\n• Evaluates tool outputs and adjusts plans\n• Knows when the goal is achieved\n\nWithout a capable LLM, an agent is unreliable. Model quality is the ceiling on agent quality.',
            highlight: 'Your agent is only as smart as the LLM you choose.',
          },
          {
            type: 'concept',
            emoji: '🔧',
            title: 'Tools: The Agent\'s Hands',
            body: 'Tools are what give agents power beyond generating text:\n\n🔍 Web search — real-time information\n💻 Code execution — run Python, analyze data\n📧 Email/Calendar — communicate, schedule\n🗄️ Database queries — read/write structured data\n📁 File management — create, read, edit files\n🌐 Any API — weather, CRM, ticketing, etc.\n\nEach tool is a function the LLM can call with specific parameters.',
          },
          {
            type: 'interactive',
            emoji: '🔧',
            title: 'Quick Check',
            body: 'Match tool to task.',
            question: 'An agent needs to get the current Bitcoin price to include in a financial report. Which component does it use?',
            options: [
              'Long-term memory — it already knows historical prices',
              'A web search or financial data API tool',
              'The LLM\'s training data — it knows all prices',
              'Another language model for financial tasks',
            ],
            correctIndex: 1,
            explanation: 'LLM training data has a knowledge cutoff — it can\'t know current prices. The agent needs a real-time tool: a web search API or a financial data API like Alpha Vantage to get current market data.',
          },
          {
            type: 'summary',
            emoji: '✅',
            title: 'Lesson Complete',
            body: 'You can now describe the anatomy of any AI agent.',
            highlight: '• LLM = reasoning brain (quality matters)\n• Memory = context + persistent knowledge\n• Tools = real-world capabilities (APIs, code, data)\n• Orchestrator = coordinates all components\n• Tools are what separate agents from chatbots',
          },
        ],
        quiz: [
          {
            question: 'What is the primary role of the LLM in an AI agent?',
            options: [
              'Storing user data and preferences',
              'Connecting to APIs and external services',
              'Reasoning, planning, deciding which tools to use, and evaluating results',
              'Displaying results to users through a UI',
            ],
            correctIndex: 2,
            explanation: 'The LLM is the brain — it reasons about the goal, decides which tools to use and with what inputs, evaluates tool outputs, adjusts the plan, and determines when the goal is achieved.',
          },
          {
            question: 'Why do AI agents fundamentally need tools?',
            options: [
              'To make the agent appear more capable than it is',
              'To access real-time information and take actions beyond generating text',
              'To avoid making any factual mistakes ever',
              'To reduce the computational cost of running the LLM',
            ],
            correctIndex: 1,
            explanation: 'LLMs alone can only generate text based on training data. Tools extend agents into the real world — enabling real-time data access, code execution, file management, and interaction with external services.',
          },
          {
            question: 'What does the "orchestrator" component do in an agent system?',
            options: [
              'Composes and plays background music during agent tasks',
              'Coordinates the LLM, memory, and tools to ensure coherent execution toward the goal',
              'Trains the LLM on new data',
              'Handles the user interface and display',
            ],
            correctIndex: 1,
            explanation: 'The orchestrator manages the agent loop — it handles the flow between LLM reasoning, tool calls, memory reads/writes, and result evaluation, ensuring all components work together coherently.',
          },
          {
            question: 'An agent needs to send an automated email. Which component enables this?',
            options: [
              'A system prompt',
              'An email API tool',
              'Long-term memory',
              'The LLM\'s training data',
            ],
            correctIndex: 1,
            explanation: 'Sending an email requires action in the real world — specifically an email API tool (like the Gmail API or SendGrid). The LLM can draft the email, but the tool is what actually sends it.',
          },
        ],
      },
      {
        id: 'ai-agents-3',
        courseId: 'ai-agents',
        title: 'Build Your First Agent',
        subtitle: 'From concept to working code',
        duration: '15 min',
        xpReward: 150,
        slides: [
          {
            type: 'intro',
            emoji: '🏗️',
            title: 'From Concept to Code',
            body: 'You don\'t need to be an AI researcher to build an agent. With modern frameworks, a working agent takes under 50 lines of code.\n\nThe hard part isn\'t the code — it\'s clearly defining what you want the agent to do and what tools it needs to do it.',
            highlight: 'Define goal → Pick tools → Write system prompt → Iterate',
          },
          {
            type: 'concept',
            emoji: '📋',
            title: 'Step 1: Define Goal + Tools',
            body: 'Before writing any code:\n\n① Goal: What does this agent need to accomplish?\n"Summarize my unread Slack messages and flag urgent ones"\n\n② Tools needed: What capabilities does it require?\n→ Slack API (read messages)\n→ Email/Slack (send summary)\n\n③ System prompt: What is its persona, constraints, and decision rules?\n\nClarity here saves hours of debugging later.',
          },
          {
            type: 'code',
            emoji: '💻',
            title: 'Agent Code — Python',
            body: 'A minimal working agent using Anthropic\'s API:',
            code: `import anthropic

client = anthropic.Anthropic()

tools = [
  {
    "name": "web_search",
    "description": "Search the web for info",
    "input_schema": {
      "type": "object",
      "properties": {
        "query": {"type": "string"}
      },
      "required": ["query"]
    }
  }
]

response = client.messages.create(
  model="claude-opus-4-5",
  max_tokens=1024,
  tools=tools,
  system="You are a research assistant.",
  messages=[{
    "role": "user",
    "content": "What are the latest AI agent frameworks?"
  }]
)`,
          },
          {
            type: 'interactive',
            emoji: '🤔',
            title: 'Quick Check',
            body: 'Test your understanding.',
            question: 'What is LangGraph (part of LangChain)?',
            options: [
              'A blockchain-based AI marketplace',
              'A social network platform for AI developers',
              'A framework for building stateful, multi-agent applications with LLMs',
              'A type of recurrent neural network architecture',
            ],
            correctIndex: 2,
            explanation: 'LangGraph is a library for building stateful, multi-agent systems. It uses a graph structure to model agent workflows, making it easy to build complex agents with loops, branches, and multiple cooperating sub-agents.',
          },
          {
            type: 'summary',
            emoji: '🎓',
            title: 'Course Complete!',
            body: 'You can now design, understand, and begin building real AI agents. The skills in this course are among the most valuable in tech right now.',
            highlight: '• Define goal + tools before writing code\n• System prompt governs agent behavior\n• Anthropic API, LangGraph, CrewAI are top frameworks\n• Start simple: one goal, two tools, iterate\n• You\'re now ready to build agents for real work',
          },
        ],
        quiz: [
          {
            question: 'What is the most important first step when building an AI agent?',
            options: [
              'Write the code and figure out the goal later',
              'Install every available framework and library',
              'Clearly define the agent\'s goal and the specific tools it needs to achieve it',
              'Choose a flashy name and color scheme for the agent',
            ],
            correctIndex: 2,
            explanation: 'Clarity of goal and tools is the foundation. Without knowing exactly what the agent should accomplish and what capabilities it needs, you\'ll spend most of your time debugging vague behavior.',
          },
          {
            question: 'What is LangChain/LangGraph used for?',
            options: [
              'A cryptocurrency platform for AI transactions',
              'A blockchain framework for decentralized AI',
              'A framework for building LLM-powered applications, agents, and multi-agent workflows',
              'A hardware requirement for running local LLMs',
            ],
            correctIndex: 2,
            explanation: 'LangChain is a framework that simplifies building LLM-powered apps. LangGraph extends it for stateful, multi-step agent workflows with graph-based execution models, loops, and multiple agents.',
          },
          {
            question: 'What does the system prompt define in an agent?',
            options: [
              'The model\'s training data and learned knowledge',
              'The agent\'s core behavior, persona, role, and constraints for all interactions',
              'The technical API keys and authentication',
              'The UI and visual design of the agent interface',
            ],
            correctIndex: 1,
            explanation: 'The system prompt is the "personality and rules" of your agent — it defines who the agent is, what it should and shouldn\'t do, how it should handle edge cases, and the tone and style of its communication.',
          },
          {
            question: 'Which of these is a real, production-ready AI agent framework?',
            options: [
              'AgentScript 2.0',
              'PyAgentFlow',
              'LangGraph, CrewAI, or the Anthropic Agents SDK',
              'NeuralFrame Pro',
            ],
            correctIndex: 2,
            explanation: 'LangGraph (by LangChain), CrewAI (for multi-agent collaboration), and the Anthropic Agents SDK are all real, production-ready frameworks used by companies today to build AI agents.',
          },
        ],
      },
    ],
  },
];

export function getCourseById(id: string): Course | undefined {
  return COURSES.find((c) => c.id === id);
}

export function getLessonById(lessonId: string): Lesson | undefined {
  for (const course of COURSES) {
    const lesson = course.lessons.find((l) => l.id === lessonId);
    if (lesson) return lesson;
  }
  return undefined;
}

export function getLessonsForCourse(courseId: string): Lesson[] {
  return getCourseById(courseId)?.lessons ?? [];
}

export const founderFlow = [
  {
    id: 'full_name',
    question: "What is your full name?",
    type: 'text',
    placeholder: "Jane Doe",
    required: true,
    section: "Personal Info"
  },
  {
    id: 'email',
    question: "What is your email address?",
    type: 'email',
    placeholder: "jane@startup.com",
    required: true,
    section: "Personal Info",
    validation: {
      pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
      message: "Please enter a valid email address."
    }
  },
  {
    id: 'phone',
    question: "What is your phone number?",
    type: 'tel',
    placeholder: "10-digit mobile number",
    required: true,
    section: "Personal Info",
    validation: {
      pattern: /^\d{10}$/,
      message: "Phone number must be exactly 10 digits."
    }
  },
  {
    id: 'linkedin_url',
    question: "What is your LinkedIn profile URL?",
    type: 'url',
    placeholder: "linkedin.com/in/username",
    required: true,
    section: "Personal Info",
    validation: {
      pattern: /^https?:\/\/(www\.)?linkedin\.com\/in\/[a-zA-Z0-9_-]+\/?$/,
      message: "URL must be a valid LinkedIn profile link starting with linkedin.com/in/."
    }
  },
  {
    id: 'startup_name',
    question: "What is your startup's name?",
    type: 'text',
    placeholder: "Acme Corp",
    required: true,
    section: "Startup Background"
  },
  {
    id: 'sector',
    question: "What industry or sector are you in?",
    type: 'select',
    options: ['Fintech', 'Edtech', 'Healthtech', 'SaaS', 'D2C', 'Deeptech', 'Other'],
    required: true,
    section: "Startup Background"
  },
  {
    id: 'problem_statement',
    question: "Describe the problem your startup is solving in 2-3 sentences.",
    type: 'textarea',
    placeholder: "Explain the pain point...",
    required: true,
    section: "Startup Background"
  },
  {
    id: 'solution',
    question: "What is your proposed solution?",
    type: 'textarea',
    placeholder: "Explain your product or service...",
    required: true,
    section: "Startup Background"
  },
  {
    id: 'mvp_status',
    question: "What is your current MVP status?",
    type: 'select',
    options: [
      { label: 'Idea Stage', value: 'idea' },
      { label: 'Prototype Built', value: 'prototype' },
      { label: 'Beta Live', value: 'beta' },
      { label: 'Revenue Generating', value: 'revenue' }
    ],
    required: true,
    section: "MVP & Traction"
  },
  {
    id: 'has_paying_customers',
    question: "Do you have paying customers?",
    type: 'conditional_customers', // Custom renderer type
    required: true,
    section: "MVP & Traction"
  },
  {
    id: 'traction_metric',
    question: "What is your key traction metric? (e.g. users, pilot agreements, monthly growth)",
    type: 'text',
    placeholder: "e.g. 500 active users, 2 pilots signed",
    required: true,
    section: "MVP & Traction"
  },
  {
    id: 'co_founder_count',
    question: "How many co-founders do you have?",
    type: 'number',
    placeholder: "e.g. 0 if solo, 1, 2",
    required: true,
    section: "Team"
  },
  {
    id: 'team_background',
    question: "Briefly describe your team's relevant background/experience.",
    type: 'textarea',
    placeholder: "e.g. CTO was ex-Google engineer, CEO has 5 years sales experience...",
    required: true,
    section: "Team"
  },
  {
    id: 'funding_ask',
    question: "How much funding are you seeking?",
    type: 'currency_amount', // Custom amount + currency renderer
    placeholder: "150,000",
    required: true,
    section: "Funding"
  },
  {
    id: 'funding_stage',
    question: "What stage are you raising?",
    type: 'select',
    options: [
      { label: 'Pre-seed', value: 'pre-seed' },
      { label: 'Seed', value: 'seed' },
      { label: 'Series A', value: 'series-a' }
    ],
    required: true,
    section: "Funding"
  },
  {
    id: 'previous_funding',
    question: "Have you raised any funding before?",
    type: 'conditional_funding', // Custom renderer type
    required: true,
    section: "Funding"
  },
  {
    id: 'validation_types',
    question: "Do you have any of the following validations?",
    type: 'multiselect',
    options: ['LOIs', 'Pilot agreements', 'Media coverage', 'Awards/recognition', 'None yet'],
    required: true,
    section: "Validation"
  },
  {
    id: 'pitch_statement',
    question: "What makes you a strong fit for the Venturizer program?",
    type: 'textarea',
    placeholder: "Make your case here...",
    required: true,
    section: "Validation"
  }
];

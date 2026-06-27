export const investorFlow = [
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
    placeholder: "jane@fund.com",
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
    id: 'fund_name',
    question: "What is the name of your fund or firm?",
    type: 'text',
    placeholder: "e.g. Acme Ventures or Individual Angel",
    required: true,
    section: "Personal Info"
  },
  {
    id: 'sectors',
    question: "What sectors do you invest in?",
    type: 'multiselect',
    options: ['Fintech', 'Edtech', 'Healthtech', 'SaaS', 'D2C', 'Deeptech', 'Other'],
    required: true,
    section: "Investment Thesis"
  },
  {
    id: 'stage_focus',
    question: "What stage do you focus on?",
    type: 'select',
    options: [
      { label: 'Pre-seed', value: 'pre-seed' },
      { label: 'Seed', value: 'seed' },
      { label: 'Series A', value: 'series-a' },
      { label: 'Series B+', value: 'series-b-plus' },
      { label: 'All stages', value: 'all-stages' }
    ],
    required: true,
    section: "Investment Thesis"
  },
  {
    id: 'investment_thesis',
    question: "Describe your investment thesis in 2-3 sentences.",
    type: 'textarea',
    placeholder: "e.g. We back early stage SaaS founders in India with strong distribution advantages...",
    required: true,
    section: "Investment Thesis"
  },
  {
    id: 'cheque_size',
    question: "What is your typical cheque size per deal?",
    type: 'currency_amount', // Custom amount + currency renderer
    placeholder: "50,000",
    required: true,
    section: "Cheque Size & Portfolio"
  },
  {
    id: 'deals_last_2_years',
    question: "How many investments have you made in the last 2 years?",
    type: 'number',
    placeholder: "e.g. 3, 5, 10",
    required: true,
    section: "Cheque Size & Portfolio"
  },
  {
    id: 'portfolio_companies',
    question: "Can you name 2-3 portfolio companies?",
    type: 'text',
    placeholder: "e.g. Razorpay, Swiggy (Optional)",
    required: false,
    section: "Cheque Size & Portfolio"
  },
  {
    id: 'round_preference',
    question: "Do you lead rounds or co-invest?",
    type: 'select',
    options: [
      { label: 'Lead', value: 'lead' },
      { label: 'Co-invest', value: 'co-invest' },
      { label: 'Both', value: 'both' }
    ],
    required: true,
    section: "Cheque Size & Portfolio"
  },
  {
    id: 'support_types',
    question: "Beyond capital, what value do you bring to portfolio companies?",
    type: 'multiselect',
    options: ['Mentorship', 'Network access', 'Hiring help', 'PR/Marketing', 'Follow-on capital', 'Board seat', 'None'],
    required: true,
    section: "Support Model"
  },
  {
    id: 'involvement_level',
    question: "How hands-on are you post-investment?",
    type: 'select',
    options: ['Very active', 'Moderately involved', 'Passive/financial only'],
    required: true,
    section: "Support Model"
  },
  {
    id: 'active_deployment',
    question: "Are you actively deploying capital right now?",
    type: 'select',
    options: [
      { label: 'Yes, actively', value: 'yes' },
      { label: 'Planning soon', value: 'planning-soon' },
      { label: 'No', value: 'no' }
    ],
    required: true,
    section: "Deployment Timeline"
  },
  {
    id: 'target_deals_6_months',
    question: "How many deals are you targeting in the next 6 months?",
    type: 'number',
    placeholder: "e.g. 1, 2, 5",
    required: true,
    section: "Deployment Timeline"
  },
  {
    id: 'venturizer_interest',
    question: "Why are you interested in partnering with Venturizer specifically?",
    type: 'textarea',
    placeholder: "Share your thoughts...",
    required: true,
    section: "Deployment Timeline"
  }
];

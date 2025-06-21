export const caregivers = [
  {
    id: 1,
    name: "Dr. Priya Sharma",
    category: "medical",
    service: "Registered Nurse",
    rating: 4.8,
    reviews: 127,
    experience: "8 years",
    price: "₹2,500",
    priceUnit: "/day",
    location: "South Delhi",
    distance: "2.5 km",
    image: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=400",
    verified: true,
    available: true,
    specialties: ["Elderly Care", "Medication Management", "Vital Signs"],
    languages: ["Hindi", "English", "Punjabi"],
    nextAvailable: "Today",
    responseTime: "< 30 min",
    description:
      "Experienced registered nurse specializing in elderly care and medication management. Provides compassionate care with focus on patient comfort and safety.",
    certifications: [
      { name: "RN License", issuer: "Medical Council", year: "2018" },
      { name: "CPR Certified", issuer: "Red Cross", year: "2022" },
      {
        name: "Geriatric Care Specialist",
        issuer: "Healthcare Institute",
        year: "2020",
      },
    ],
    contact: {
      phone: "+91-9876543210",
      email: "priya.sharma@example.com",
    },
    reviewsData: [
      {
        name: "Mrs. Gupta",
        rating: 5,
        comment:
          "Priya is wonderful with my mother. Very caring and responsible.",
        date: "2 days ago",
        serviceType: "Medical Care",
      },
      {
        name: "Rajesh Kumar",
        rating: 5,
        comment: "Excellent nursing skills and very punctual.",
        date: "1 week ago",
        serviceType: "Basic Care",
      },
    ],
    servicePackages: [
      {
        name: "Basic Care",
        description: "Essential daily care assistance",
        price: "₹2,500/day",
      },
      {
        name: "Medical Care",
        description: "Medication management & monitoring",
        price: "₹3,500/day",
      },
      {
        name: "Premium Care",
        description: "24/7 comprehensive care",
        price: "₹5,000/day",
      },
    ],
    availableDates: [
      { day: "Today", dayNum: "22", month: "Jun", date: "2025-06-22" },
      { day: "Tomorrow", dayNum: "23", month: "Jun", date: "2025-06-23" },
      { day: "Monday", dayNum: "24", month: "Jun", date: "2025-06-24" },
      { day: "Tuesday", dayNum: "25", month: "Jun", date: "2025-06-25" },
    ],
    timeSlots: [
      { time: "08:00 AM", available: true },
      { time: "09:00 AM", available: true },
      { time: "10:30 AM", available: false },
      { time: "02:00 PM", available: true },
      { time: "04:00 PM", available: true },
      { time: "06:00 PM", available: false },
    ],
  },
  {
    id: 2,
    name: "Nurse Anjali Patel",
    category: "medical",
    service: "ICU Specialist",
    rating: 4.9,
    reviews: 89,
    experience: "12 years",
    price: "₹4,000",
    priceUnit: "/day",
    location: "Bandra West",
    distance: "1.8 km",
    image: "https://images.unsplash.com/photo-1582750433449-648ed127bb54?w=400",
    verified: true,
    available: true,
    specialties: ["Critical Care", "Post Surgery", "Emergency Care"],
    languages: ["Hindi", "English", "Gujarati"],
    nextAvailable: "Today",
    responseTime: "< 15 min",
    description:
      "ICU nurse with extensive experience in critical and emergency care. Specialized in post-operative care and patient monitoring.",
    certifications: [
      { name: "RN License", issuer: "Medical Council", year: "2015" },
      {
        name: "Advanced Cardiac Life Support",
        issuer: "American Heart Association",
        year: "2021",
      },
      {
        name: "Critical Care Nursing",
        issuer: "Nursing Institute",
        year: "2017",
      },
    ],
    contact: {
      phone: "+91-9876543211",
      email: "anjali.patel@example.com",
    },
    reviewsData: [
      {
        name: "Dr. Singh",
        rating: 5,
        comment: "Very professional and knowledgeable nurse.",
        date: "3 days ago",
        serviceType: "Critical Care",
      },
      {
        name: "Meera Patel",
        rating: 4,
        comment: "Great care for my elderly father.",
        date: "1 week ago",
        serviceType: "Post Surgery Care",
      },
    ],
    servicePackages: [
      {
        name: "Basic ICU Care",
        description: "Standard ICU monitoring",
        price: "₹4,000/day",
      },
      {
        name: "Advanced Care",
        description: "Intensive monitoring & support",
        price: "₹6,000/day",
      },
      {
        name: "Emergency Care",
        description: "24/7 critical care",
        price: "₹8,000/day",
      },
    ],
    availableDates: [
      { day: "Today", dayNum: "22", month: "Jun", date: "2025-06-22" },
      { day: "Tomorrow", dayNum: "23", month: "Jun", date: "2025-06-23" },
      { day: "Monday", dayNum: "24", month: "Jun", date: "2025-06-24" },
      { day: "Tuesday", dayNum: "25", month: "Jun", date: "2025-06-25" },
    ],
    timeSlots: [
      { time: "06:00 AM", available: true },
      { time: "08:00 AM", available: true },
      { time: "12:00 PM", available: true },
      { time: "06:00 PM", available: true },
      { time: "10:00 PM", available: false },
    ],
  },
  {
    id: 3,
    name: "Dr. Rajesh Kumar",
    category: "physio",
    service: "Physiotherapist",
    rating: 4.7,
    reviews: 156,
    experience: "15 years",
    price: "₹1,800",
    priceUnit: "/session",
    location: "Koramangala",
    distance: "3.2 km",
    image: "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=400",
    verified: true,
    available: false,
    specialties: ["Joint Therapy", "Stroke Recovery", "Pain Management"],
    languages: ["Hindi", "English", "Kannada"],
    nextAvailable: "Tomorrow 9 AM",
    responseTime: "< 1 hour",
    description:
      "Experienced physiotherapist specializing in stroke recovery and pain management. Expert in mobility restoration and joint therapy.",
    certifications: [
      { name: "BPT", issuer: "Physiotherapy Council", year: "2010" },
      { name: "MPT", issuer: "Physiotherapy Council", year: "2013" },
      {
        name: "Stroke Rehabilitation Specialist",
        issuer: "Rehab Institute",
        year: "2016",
      },
    ],
    contact: {
      phone: "+91-9876543212",
      email: "rajesh.kumar@example.com",
    },
    reviewsData: [
      {
        name: "Sunita Devi",
        rating: 5,
        comment: "Excellent physiotherapy sessions. Very effective.",
        date: "4 days ago",
        serviceType: "Joint Therapy",
      },
      {
        name: "Ramesh Gupta",
        rating: 4,
        comment: "Good results after knee surgery rehabilitation.",
        date: "2 weeks ago",
        serviceType: "Post Surgery",
      },
    ],
    servicePackages: [
      {
        name: "Basic Therapy",
        description: "Standard physiotherapy session",
        price: "₹1,800/session",
      },
      {
        name: "Advanced Therapy",
        description: "Specialized treatment plan",
        price: "₹2,500/session",
      },
      {
        name: "Home Therapy",
        description: "At-home physiotherapy",
        price: "₹3,000/session",
      },
    ],
    availableDates: [
      { day: "Tomorrow", dayNum: "23", month: "Jun", date: "2025-06-23" },
      { day: "Monday", dayNum: "24", month: "Jun", date: "2025-06-24" },
      { day: "Tuesday", dayNum: "25", month: "Jun", date: "2025-06-25" },
      { day: "Wednesday", dayNum: "26", month: "Jun", date: "2025-06-26" },
    ],
    timeSlots: [
      { time: "09:00 AM", available: true },
      { time: "11:00 AM", available: true },
      { time: "02:00 PM", available: false },
      { time: "04:00 PM", available: true },
      { time: "06:00 PM", available: true },
    ],
  },
  {
    id: 4,
    name: "Maya Reddy",
    category: "wellness",
    service: "Massage Therapist",
    rating: 4.6,
    reviews: 203,
    experience: "6 years",
    price: "₹2,800",
    priceUnit: "/session",
    location: "Jubilee Hills",
    distance: "4.1 km",
    image: "https://images.unsplash.com/photo-1594824804732-ca8db7ca6dcd?w=400",
    verified: true,
    available: true,
    specialties: ["Therapeutic Massage", "Arthritis Relief", "Circulation"],
    languages: ["Telugu", "English", "Hindi"],
    nextAvailable: "Today",
    responseTime: "< 45 min",
    description:
      "Certified massage therapist specializing in therapeutic treatments for elderly clients. Expert in pain relief and circulation improvement.",
    certifications: [
      {
        name: "Certified Massage Therapist",
        issuer: "Massage Therapy Institute",
        year: "2017",
      },
      {
        name: "Therapeutic Massage Specialist",
        issuer: "Wellness Academy",
        year: "2019",
      },
      {
        name: "Geriatric Massage Certified",
        issuer: "Elder Care Institute",
        year: "2021",
      },
    ],
    contact: {
      phone: "+91-9876543213",
      email: "maya.reddy@example.com",
    },
    reviewsData: [
      {
        name: "Lakshmi Rao",
        rating: 5,
        comment: "Very relaxing and therapeutic massage.",
        date: "1 day ago",
        serviceType: "Therapeutic Massage",
      },
      {
        name: "Vijay Kumar",
        rating: 4,
        comment: "Helped with my back pain significantly.",
        date: "5 days ago",
        serviceType: "Pain Relief",
      },
    ],
    servicePackages: [
      {
        name: "Relaxation Massage",
        description: "General wellness massage",
        price: "₹2,800/session",
      },
      {
        name: "Therapeutic Massage",
        description: "Medical massage therapy",
        price: "₹3,500/session",
      },
      {
        name: "Pain Relief Package",
        description: "Specialized pain management",
        price: "₹4,200/session",
      },
    ],
    availableDates: [
      { day: "Today", dayNum: "22", month: "Jun", date: "2025-06-22" },
      { day: "Tomorrow", dayNum: "23", month: "Jun", date: "2025-06-23" },
      { day: "Monday", dayNum: "24", month: "Jun", date: "2025-06-24" },
      { day: "Tuesday", dayNum: "25", month: "Jun", date: "2025-06-25" },
    ],
    timeSlots: [
      { time: "10:00 AM", available: true },
      { time: "12:00 PM", available: true },
      { time: "02:00 PM", available: false },
      { time: "04:00 PM", available: true },
      { time: "06:00 PM", available: true },
    ],
  },
  {
    id: 5,
    name: "Sister Margaret",
    category: "medical",
    service: "Elder Care Specialist",
    rating: 4.9,
    reviews: 94,
    experience: "20 years",
    price: "₹5,000",
    priceUnit: "/day",
    location: "Park Street",
    distance: "1.2 km",
    image: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=400",
    verified: true,
    available: true,
    specialties: ["Dementia Care", "Palliative Care", "Chronic Conditions"],
    languages: ["English", "Hindi", "Bengali"],
    nextAvailable: "Today",
    responseTime: "< 20 min",
    description:
      "Highly experienced nurse specializing in dementia and palliative care. Provides compassionate end-of-life care and chronic condition management.",
    certifications: [
      { name: "Senior RN", issuer: "Nursing Council", year: "2005" },
      {
        name: "Dementia Care Certified",
        issuer: "Alzheimer's Association",
        year: "2018",
      },
      {
        name: "Palliative Care Specialist",
        issuer: "Hospice Institute",
        year: "2015",
      },
      {
        name: "Chronic Disease Management",
        issuer: "Medical Academy",
        year: "2020",
      },
    ],
    contact: {
      phone: "+91-9876543214",
      email: "margaret@example.com",
    },
    reviewsData: [
      {
        name: "John D'Silva",
        rating: 5,
        comment: "Exceptional care for my mother with dementia.",
        date: "1 week ago",
        serviceType: "Dementia Care",
      },
      {
        name: "Maria Fernandes",
        rating: 5,
        comment: "Very experienced and compassionate.",
        date: "3 days ago",
        serviceType: "Palliative Care",
      },
    ],
    servicePackages: [
      {
        name: "Basic Elder Care",
        description: "Standard elderly care",
        price: "₹5,000/day",
      },
      {
        name: "Dementia Care",
        description: "Specialized dementia support",
        price: "₹6,500/day",
      },
      {
        name: "Palliative Care",
        description: "End-of-life comfort care",
        price: "₹7,500/day",
      },
    ],
    availableDates: [
      { day: "Today", dayNum: "22", month: "Jun", date: "2025-06-22" },
      { day: "Tomorrow", dayNum: "23", month: "Jun", date: "2025-06-23" },
      { day: "Monday", dayNum: "24", month: "Jun", date: "2025-06-24" },
      { day: "Tuesday", dayNum: "25", month: "Jun", date: "2025-06-25" },
    ],
    timeSlots: [
      { time: "08:00 AM", available: true },
      { time: "12:00 PM", available: true },
      { time: "04:00 PM", available: true },
      { time: "08:00 PM", available: false },
    ],
  },
  {
    id: 6,
    name: "Ravi Menon",
    category: "house",
    service: "Male Attendant",
    rating: 4.5,
    reviews: 78,
    experience: "5 years",
    price: "₹3,200",
    priceUnit: "/day",
    location: "Indiranagar",
    distance: "2.8 km",
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400",
    verified: true,
    available: true,
    specialties: ["Personal Care", "Mobility Support", "Companionship"],
    languages: ["Hindi", "English", "Kannada"],
    nextAvailable: "Today",
    responseTime: "< 1 hour",
    description:
      "Reliable male attendant providing personal care and mobility support. Experienced in assisting elderly men with daily activities and companionship.",
    certifications: [
      {
        name: "Physical Therapy Assistant",
        issuer: "Therapy Council",
        year: "2019",
      },
      {
        name: "Personal Care Certified",
        issuer: "Care Institute",
        year: "2020",
      },
      { name: "First Aid Certified", issuer: "Red Cross", year: "2022" },
    ],
    contact: {
      phone: "+91-9876543215",
      email: "ravi.menon@example.com",
    },
    reviewsData: [
      {
        name: "Krishnan Nair",
        rating: 4,
        comment: "Reliable and strong support for my father.",
        date: "2 days ago",
        serviceType: "Personal Care",
      },
      {
        name: "Suresh Babu",
        rating: 5,
        comment: "Very helpful with mobility assistance.",
        date: "1 week ago",
        serviceType: "Mobility Support",
      },
    ],
    servicePackages: [
      {
        name: "Basic Attendant",
        description: "Daily personal care",
        price: "₹3,200/day",
      },
      {
        name: "Mobility Support",
        description: "Physical assistance & mobility",
        price: "₹4,000/day",
      },
      {
        name: "Companion Care",
        description: "Full-time companionship",
        price: "₹4,800/day",
      },
    ],
    availableDates: [
      { day: "Today", dayNum: "22", month: "Jun", date: "2025-06-22" },
      { day: "Tomorrow", dayNum: "23", month: "Jun", date: "2025-06-23" },
      { day: "Monday", dayNum: "24", month: "Jun", date: "2025-06-24" },
      { day: "Tuesday", dayNum: "25", month: "Jun", date: "2025-06-25" },
    ],
    timeSlots: [
      { time: "07:00 AM", available: true },
      { time: "09:00 AM", available: true },
      { time: "01:00 PM", available: false },
      { time: "05:00 PM", available: true },
      { time: "07:00 PM", available: true },
    ],
  },
{
    id: 7,
    name: "Dr. Kavita Rao",
    category: "medical",
    service: "Visiting Doctor",
    rating: 4.8,
    reviews: 94,
    experience: "20 years",
    price: "₹2,000",
    priceUnit: "/visit",
    location: "Koramangala, Bangalore",
    distance: "1.5 km",
    image: "https://images.unsplash.com/photo-1594824804732-ca8db7ca6dcd?w=400",
    verified: true,
    available: false,
    specialties: ["General Medicine", "Geriatric Medicine", "Home Consultations", "Health Monitoring"],
    languages: ["English", "Hindi", "Kannada", "Telugu"],
    nextAvailable: "Tomorrow 10 AM",
    responseTime: "< 2 hours",
    description: "MBBS, MD in General Medicine with 20 years of experience. Provides comprehensive home healthcare consultations for elderly patients with chronic conditions.",
    certifications: [
      { name: "MBBS", issuer: "Medical University", year: "2005" },
      { name: "MD General Medicine", issuer: "Medical College", year: "2008" },
      { name: "Geriatric Care Certificate", issuer: "Elder Care Institute", year: "2015" },
      { name: "Home Healthcare Specialist", issuer: "Healthcare Academy", year: "2018" }
    ],
    contact: {
      phone: "+91-9876543216",
      email: "kavita.rao@example.com"
    },
    reviewsData: [
      { name: "Ramesh Nair", rating: 5, comment: "Very thorough examination and excellent bedside manner.", date: "3 days ago", serviceType: "Home Consultation" },
      { name: "Sita Devi", rating: 4, comment: "Professional and caring doctor. Highly recommended.", date: "1 week ago", serviceType: "General Medicine" }
    ],
    servicePackages: [
      { name: "Basic Consultation", description: "General health checkup", price: "₹2,000/visit" },
      { name: "Comprehensive Checkup", description: "Detailed examination & tests", price: "₹3,500/visit" },
      { name: "Follow-up Care", description: "Regular monitoring visits", price: "₹1,500/visit" }
    ],
    availableDates: [
      { day: "Tomorrow", dayNum: "23", month: "Jun", date: "2025-06-23" },
      { day: "Monday", dayNum: "24", month: "Jun", date: "2025-06-24" },
      { day: "Tuesday", dayNum: "25", month: "Jun", date: "2025-06-25" },
      { day: "Wednesday", dayNum: "26", month: "Jun", date: "2025-06-26" }
    ],
    timeSlots: [
      { time: "10:00 AM", available: true },
      { time: "12:00 PM", available: true },
      { time: "02:00 PM", available: false },
      { time: "04:00 PM", available: true },
      { time: "06:00 PM", available: false }
    ]
  },
  {
    id: 8,
    name: "Dr. Meera Nair",
    category: "physio",
    service: "Home Physiotherapy",
    rating: 4.8,
    reviews: 134,
    experience: "12 years",
    price: "₹2,200",
    priceUnit: "/session",
    location: "Thiruvananthapuram",
    distance: "2.1 km",
    image: "https://images.unsplash.com/photo-1594824804732-ca8db7ca6dcd?w=400",
    verified: true,
    available: true,
    specialties: ["Arthritis Management", "Fall Prevention", "Strength Training", "Respiratory Therapy"],
    languages: ["Malayalam", "English", "Hindi", "Tamil"],
    nextAvailable: "Today",
    responseTime: "< 45 min",
    description: "BPT, MPT specialized in home-based physiotherapy for elderly patients. Expert in chronic pain management and mobility restoration.",
    certifications: [
      { name: "BPT", issuer: "Physiotherapy Council", year: "2012" },
      { name: "MPT", issuer: "Physiotherapy University", year: "2015" },
      { name: "Certified Geriatric Physiotherapist", issuer: "Geriatric Institute", year: "2018" },
      { name: "Manual Therapy Certified", issuer: "Therapy Academy", year: "2020" }
    ],
    contact: {
      phone: "+91-9876543217",
      email: "meera.nair@example.com"
    },
    reviewsData: [
      { name: "Krishnan Pillai", rating: 5, comment: "Excellent physiotherapy sessions at home. Very professional.", date: "2 days ago", serviceType: "Arthritis Management" },
      { name: "Radha Menon", rating: 4, comment: "Great improvement in mobility after sessions.", date: "1 week ago", serviceType: "Strength Training" }
    ],
    servicePackages: [
      { name: "Basic Physiotherapy", description: "Standard therapy session", price: "₹2,200/session" },
      { name: "Advanced Therapy", description: "Specialized treatment plan", price: "₹3,000/session" },
      { name: "Rehabilitation Package", description: "Comprehensive recovery program", price: "₹3,800/session" }
    ],
    availableDates: [
      { day: "Today", dayNum: "22", month: "Jun", date: "2025-06-22" },
      { day: "Tomorrow", dayNum: "23", month: "Jun", date: "2025-06-23" },
      { day: "Monday", dayNum: "24", month: "Jun", date: "2025-06-24" },
      { day: "Tuesday", dayNum: "25", month: "Jun", date: "2025-06-25" }
    ],
    timeSlots: [
      { time: "08:00 AM", available: true },
      { time: "10:00 AM", available: true },
      { time: "02:00 PM", available: true },
      { time: "04:00 PM", available: false },
      { time: "06:00 PM", available: true }
    ]
  },
  {
    id: 9,
    name: "Dr. Amit Joshi",
    category: "wellness",
    service: "Chiropractor",
    rating: 4.7,
    reviews: 112,
    experience: "14 years",
    price: "₹3,500",
    priceUnit: "/session",
    location: "Pune",
    distance: "3.5 km",
    image: "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=400",
    verified: true,
    available: true,
    specialties: ["Spinal Adjustment", "Joint Manipulation", "Posture Correction", "Pain Relief"],
    languages: ["Hindi", "English", "Marathi"],
    nextAvailable: "Today",
    responseTime: "< 1 hour",
    description: "Licensed chiropractor with focus on elderly spinal health and mobility improvement. Specializes in non-invasive pain management techniques.",
    certifications: [
      { name: "Doctor of Chiropractic", issuer: "Chiropractic College", year: "2011" },
      { name: "Geriatric Chiropractic Specialist", issuer: "Senior Care Institute", year: "2016" },
      { name: "Sports Injury Rehabilitation", issuer: "Sports Medicine Academy", year: "2018" },
      { name: "Pain Management Certified", issuer: "Pain Institute", year: "2020" }
    ],
    contact: {
      phone: "+91-9876543218",
      email: "amit.joshi@example.com"
    },
    reviewsData: [
      { name: "Sunil Patil", rating: 5, comment: "Amazing results for my back pain. Highly skilled.", date: "4 days ago", serviceType: "Spinal Adjustment" },
      { name: "Priya Sharma", rating: 4, comment: "Professional service and effective treatment.", date: "1 week ago", serviceType: "Pain Relief" }
    ],
    servicePackages: [
      { name: "Basic Adjustment", description: "Standard chiropractic session", price: "₹3,500/session" },
      { name: "Comprehensive Treatment", description: "Full spinal assessment & treatment", price: "₹4,500/session" },
      { name: "Pain Management Package", description: "Multi-session treatment plan", price: "₹5,500/session" }
    ],
    availableDates: [
      { day: "Today", dayNum: "22", month: "Jun", date: "2025-06-22" },
      { day: "Tomorrow", dayNum: "23", month: "Jun", date: "2025-06-23" },
      { day: "Monday", dayNum: "24", month: "Jun", date: "2025-06-24" },
      { day: "Tuesday", dayNum: "25", month: "Jun", date: "2025-06-25" }
    ],
    timeSlots: [
      { time: "09:00 AM", available: true },
      { time: "11:00 AM", available: false },
      { time: "02:00 PM", available: true },
      { time: "04:00 PM", available: true },
      { time: "06:00 PM", available: true }
    ]
  },
  {
    id: 10,
    name: "Fatima Khan",
    category: "medical",
    service: "Dementia Care Specialist",
    rating: 4.9,
    reviews: 87,
    experience: "16 years",
    price: "₹4,500",
    priceUnit: "/day",
    location: "Lucknow",
    distance: "2.3 km",
    image: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=400",
    verified: true,
    available: true,
    specialties: ["Dementia Care", "Alzheimer's Support", "Behavioral Management", "Memory Activities"],
    languages: ["Hindi", "Urdu", "English"],
    nextAvailable: "Today",
    responseTime: "< 30 min",
    description: "Specialized in dementia and Alzheimer's care with extensive training in behavioral management. Provides compassionate care for memory-related conditions.",
    certifications: [
      { name: "RN License", issuer: "Nursing Council", year: "2008" },
      { name: "Dementia Care Specialist", issuer: "Alzheimer's Institute", year: "2012" },
      { name: "Behavioral Management Certified", issuer: "Mental Health Academy", year: "2015" },
      { name: "Memory Care Expert", issuer: "Cognitive Care Institute", year: "2019" }
    ],
    contact: {
      phone: "+91-9876543219",
      email: "fatima.khan@example.com"
    },
    reviewsData: [
      { name: "Ahmed Ali", rating: 5, comment: "Exceptional care for my father with Alzheimer's. Very patient and understanding.", date: "1 day ago", serviceType: "Alzheimer's Support" },
      { name: "Rashid Khan", rating: 5, comment: "Professional and caring approach to dementia care.", date: "5 days ago", serviceType: "Dementia Care" }
    ],
    servicePackages: [
      { name: "Basic Dementia Care", description: "Daily care and supervision", price: "₹4,500/day" },
      { name: "Advanced Memory Care", description: "Specialized memory activities", price: "₹6,000/day" },
      { name: "24/7 Dementia Support", description: "Round-the-clock care", price: "₹8,500/day" }
    ],
    availableDates: [
      { day: "Today", dayNum: "22", month: "Jun", date: "2025-06-22" },
      { day: "Tomorrow", dayNum: "23", month: "Jun", date: "2025-06-23" },
      { day: "Monday", dayNum: "24", month: "Jun", date: "2025-06-24" },
      { day: "Tuesday", dayNum: "25", month: "Jun", date: "2025-06-25" }
    ],
    timeSlots: [
      { time: "08:00 AM", available: true },
      { time: "12:00 PM", available: true },
      { time: "04:00 PM", available: true },
      { time: "08:00 PM", available: false }
    ]
  },
  {
    id: 11,
    name: "James Wilson",
    category: "medical",
    service: "Male Nurse",
    rating: 4.6,
    reviews: 156,
    experience: "11 years",
    price: "₹3,800",
    priceUnit: "/day",
    location: "Chennai",
    distance: "1.9 km",
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400",
    verified: true,
    available: true,
    specialties: ["Male Patient Care", "Catheter Care", "Mobility Assistance", "Personal Hygiene"],
    languages: ["English", "Tamil", "Hindi"],
    nextAvailable: "Today",
    responseTime: "< 45 min",
    description: "Experienced male nurse specializing in personal care for elderly male patients. Expert in catheter care and mobility assistance.",
    certifications: [
      { name: "RN License", issuer: "Tamil Nadu Nursing Council", year: "2013" },
      { name: "Male Patient Care Certified", issuer: "Healthcare Institute", year: "2016" },
      { name: "Catheter Care Specialist", issuer: "Medical Academy", year: "2018" },
      { name: "Geriatric Nursing", issuer: "Elder Care Institute", year: "2020" }
    ],
    contact: {
      phone: "+91-9876543220",
      email: "james.wilson@example.com"
    },
    reviewsData: [
      { name: "Raman Iyer", rating: 5, comment: "Very professional and respectful care for my father.", date: "2 days ago", serviceType: "Male Patient Care" },
      { name: "Venkat Krishnan", rating: 4, comment: "Excellent nursing skills and very reliable.", date: "1 week ago", serviceType: "Personal Care" }
    ],
    servicePackages: [
      { name: "Basic Male Nursing", description: "Standard nursing care", price: "₹3,800/day" },
      { name: "Specialized Care", description: "Advanced medical nursing", price: "₹5,200/day" },
      { name: "Intensive Care", description: "24/7 comprehensive care", price: "₹7,000/day" }
    ],
    availableDates: [
      { day: "Today", dayNum: "22", month: "Jun", date: "2025-06-22" },
      { day: "Tomorrow", dayNum: "23", month: "Jun", date: "2025-06-23" },
      { day: "Monday", dayNum: "24", month: "Jun", date: "2025-06-24" },
      { day: "Tuesday", dayNum: "25", month: "Jun", date: "2025-06-25" }
    ],
    timeSlots: [
      { time: "06:00 AM", available: true },
      { time: "12:00 PM", available: true },
      { time: "06:00 PM", available: true },
      { time: "10:00 PM", available: false }
    ]
  },
  {
    id: 12,
    name: "Rekha Agarwal",
    category: "house",
    service: "Companion Care",
    rating: 4.8,
    reviews: 143,
    experience: "7 years",
    price: "₹2,200",
    priceUnit: "/day",
    location: "Jaipur",
    distance: "2.7 km",
    image: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=400",
    verified: true,
    available: true,
    specialties: ["Companionship", "Light Housekeeping", "Meal Preparation", "Medication Reminders"],
    languages: ["Hindi", "Rajasthani", "English"],
    nextAvailable: "Today",
    responseTime: "< 1 hour",
    description: "Warm and caring companion providing emotional support and light assistance to elderly clients. Specializes in creating meaningful connections.",
    certifications: [
      { name: "Companion Care Training", issuer: "Elder Care Institute", year: "2018" },
      { name: "First Aid Certified", issuer: "Red Cross", year: "2021" },
      { name: "Elderly Psychology", issuer: "Psychology Academy", year: "2019" },
      { name: "Nutrition Basics", issuer: "Health Institute", year: "2020" }
    ],
    contact: {
      phone: "+91-9876543221",
      email: "rekha.agarwal@example.com"
    },
    reviewsData: [
      { name: "Shanti Devi", rating: 5, comment: "Rekha is like family to us. Very caring and trustworthy.", date: "1 day ago", serviceType: "Companionship" },
      { name: "Mohan Lal", rating: 4, comment: "Great companion for my mother. Very reliable.", date: "4 days ago", serviceType: "Light Housekeeping" }
    ],
    servicePackages: [
      { name: "Basic Companionship", description: "Daily companionship & light tasks", price: "₹2,200/day" },
      { name: "Enhanced Care", description: "Companionship + meal preparation", price: "₹3,000/day" },
      { name: "Full Support", description: "Complete companion care", price: "₹3,800/day" }
    ],
    availableDates: [
      { day: "Today", dayNum: "22", month: "Jun", date: "2025-06-22" },
      { day: "Tomorrow", dayNum: "23", month: "Jun", date: "2025-06-23" },
      { day: "Monday", dayNum: "24", month: "Jun", date: "2025-06-24" },
      { day: "Tuesday", dayNum: "25", month: "Jun", date: "2025-06-25" }
    ],
    timeSlots: [
      { time: "09:00 AM", available: true },
      { time: "01:00 PM", available: true },
      { time: "05:00 PM", available: true },
      { time: "07:00 PM", available: false }
    ]
  },
  {
    id: 13,
    name: "Dr. Sanjay Mehta",
    category: "wellness",
    service: "Occupational Therapist",
    rating: 4.7,
    reviews: 98,
    experience: "13 years",
    price: "₹2,500",
    priceUnit: "/session",
    location: "Ahmedabad",
    distance: "3.1 km",
    image: "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=400",
    verified: true,
    available: true,
    specialties: ["Daily Living Skills", "Adaptive Equipment", "Cognitive Rehabilitation", "Home Safety"],
    languages: ["Gujarati", "Hindi", "English"],
    nextAvailable: "Today",
    responseTime: "< 2 hours",
    description: "Occupational therapist helping elderly maintain independence in daily activities. Expert in adaptive equipment and home safety modifications.",
    certifications: [
      { name: "Master in Occupational Therapy", issuer: "OT University", year: "2012" },
      { name: "Geriatric OT Specialist", issuer: "Senior Care Institute", year: "2016" },
      { name: "Adaptive Equipment Expert", issuer: "Rehabilitation Academy", year: "2018" },
      { name: "Home Safety Certified", issuer: "Safety Institute", year: "2020" }
    ],
    contact: {
      phone: "+91-9876543222",
      email: "sanjay.mehta@example.com"
    },
    reviewsData: [
      { name: "Kiran Patel", rating: 5, comment: "Excellent therapy sessions. Very knowledgeable about adaptive equipment.", date: "3 days ago", serviceType: "Adaptive Equipment" },
      { name: "Nita Shah", rating: 4, comment: "Great help with daily living skills training.", date: "1 week ago", serviceType: "Daily Living Skills" }
    ],
    servicePackages: [
      { name: "Basic OT Session", description: "Standard occupational therapy", price: "₹2,500/session" },
      { name: "Comprehensive Assessment", description: "Full evaluation & treatment plan", price: "₹3,500/session" },
      { name: "Home Modification", description: "Safety assessment & modifications", price: "₹4,500/session" }
    ],
    availableDates: [
      { day: "Today", dayNum: "22", month: "Jun", date: "2025-06-22" },
      { day: "Tomorrow", dayNum: "23", month: "Jun", date: "2025-06-23" },
      { day: "Monday", dayNum: "24", month: "Jun", date: "2025-06-24" },
      { day: "Tuesday", dayNum: "25", month: "Jun", date: "2025-06-25" }
    ],
    timeSlots: [
      { time: "10:00 AM", available: true },
      { time: "02:00 PM", available: true },
      { time: "04:00 PM", available: false },
      { time: "06:00 PM", available: true }
    ]
  },
  {
    id: 14,
    name: "Lakshmi Iyer",
    category: "wellness",
    service: "Speech Therapist",
    rating: 4.8,
    reviews: 76,
    experience: "9 years",
    price: "₹2,000",
    priceUnit: "/session",
    location: "Coimbatore",
    distance: "2.4 km",
    image: "https://images.unsplash.com/photo-1594824804732-ca8db7ca6dcd?w=400",
    verified: true,
    available: true,
    specialties: ["Swallowing Therapy", "Speech Recovery", "Communication Aids", "Post-Stroke Speech"],
    languages: ["Tamil", "English", "Malayalam"],
    nextAvailable: "Today",
    responseTime: "< 1 hour",
    description: "Speech-language pathologist specializing in elderly communication and swallowing disorders. Expert in post-stroke speech rehabilitation.",
    certifications: [
      { name: "Master in Speech-Language Pathology", issuer: "SLP University", year: "2016" },
      { name: "Dysphagia Specialist", issuer: "Swallowing Institute", year: "2018" },
      { name: "Post-Stroke Speech Therapy", issuer: "Stroke Recovery Center", year: "2019" },
      { name: "Communication Aids Expert", issuer: "Assistive Technology Institute", year: "2021" }
    ],
    contact: {
      phone: "+91-9876543223",
      email: "lakshmi.iyer@example.com"
    },
    reviewsData: [
      { name: "Ravi Kumar", rating: 5, comment: "Excellent speech therapy after my stroke. Very patient and skilled.", date: "2 days ago", serviceType: "Post-Stroke Speech" },
      { name: "Kamala Devi", rating: 4, comment: "Great help with swallowing difficulties.", date: "1 week ago", serviceType: "Swallowing Therapy" }
    ],
    servicePackages: [
      { name: "Basic Speech Therapy", description: "Standard speech therapy session", price: "₹2,000/session" },
      { name: "Swallowing Therapy", description: "Specialized dysphagia treatment", price: "₹2,800/session" },
      { name: "Communication Package", description: "Comprehensive communication training", price: "₹3,500/session" }
    ],
    availableDates: [
      { day: "Today", dayNum: "22", month: "Jun", date: "2025-06-22" },
      { day: "Tomorrow", dayNum: "23", month: "Jun", date: "2025-06-23" },
      { day: "Monday", dayNum: "24", month: "Jun", date: "2025-06-24" },
      { day: "Tuesday", dayNum: "25", month: "Jun", date: "2025-06-25" }
    ],
    timeSlots: [
      { time: "09:00 AM", available: true },
      { time: "11:00 AM", available: true },
      { time: "03:00 PM", available: false },
      { time: "05:00 PM", available: true }
    ]
  },
  {
    id: 15,
    name: "Geeta Sharma",
    category: "medical",
    service: "Night Nurse",
    rating: 4.9,
    reviews: 134,
    experience: "14 years",
    price: "₹3,200",
    priceUnit: "/night",
    location: "Noida",
    distance: "1.7 km",
    image: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=400",
    verified: true,
    available: true,
    specialties: ["Night Care", "Sleep Monitoring", "Emergency Response", "Medication Administration"],
    languages: ["Hindi", "English"],
    nextAvailable: "Tonight",
    responseTime: "< 30 min",
    description: "Experienced night nurse providing overnight care and monitoring for elderly patients. Specializes in sleep disorders and emergency response.",
    certifications: [
      { name: "RN License", issuer: "UP Nursing Council", year: "2010" },
      { name: "Night Care Specialist", issuer: "Night Care Institute", year: "2014" },
      { name: "Emergency Response Certified", issuer: "Emergency Medical Services", year: "2017" },
      { name: "Sleep Disorder Management", issuer: "Sleep Medicine Academy", year: "2019" }
    ],
    contact: {
      phone: "+91-9876543224",
      email: "geeta.sharma@example.com"
    },
    reviewsData: [
      { name: "Raj Gupta", rating: 5, comment: "Excellent night care for my father. Very attentive and professional.", date: "1 day ago", serviceType: "Night Care" },
      { name: "Sunita Verma", rating: 5, comment: "Great peace of mind knowing she's there at night.", date: "3 days ago", serviceType: "Sleep Monitoring" }
    ],
    servicePackages: [
      { name: "Basic Night Care", description: "Standard overnight monitoring", price: "₹3,200/night" },
      { name: "Intensive Night Care", description: "Enhanced monitoring & care", price: "₹4,500/night" },
      { name: "Medical Night Care", description: "Advanced medical monitoring", price: "₹5,800/night" }
    ],
    availableDates: [
      { day: "Tonight", dayNum: "22", month: "Jun", date: "2025-06-22" },
      { day: "Tomorrow", dayNum: "23", month: "Jun", date: "2025-06-23" },
      { day: "Monday", dayNum: "24", month: "Jun", date: "2025-06-24" },
      { day: "Tuesday", dayNum: "25", month: "Jun", date: "2025-06-25" }
    ],
    timeSlots: [
      { time: "08:00 PM", available: true },
      { time: "10:00 PM", available: true },
      { time: "12:00 AM", available: true },
      { time: "02:00 AM", available: false }
    ]
  }
];


export const categories = [
  { id: "all", name: "All", icon: "grid-outline", color: "#6366F1" },
  { id: "medical", name: "Medical", icon: "medical-outline", color: "#EF4444" },
  { id: "physio", name: "Physio", icon: "fitness-outline", color: "#10B981" },
  { id: "wellness", name: "Wellness", icon: "leaf-outline", color: "#F59E0B" },
  { id: "house", name: "Home Care", icon: "home-outline", color: "#8B5CF6" },
];

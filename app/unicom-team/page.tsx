"use client";
import { useState, useEffect } from "react";
import { useTheme } from "../contexts/ThemeContext";
import {
  ChevronDown,
  Sparkles,
  Smartphone,
  Globe,
  Code,
  Palette,
  Zap,
  Users,
  Calendar,
  TrendingUp,
  Clock,
  Award,
  Target,
  MessageSquare,
  FolderOpen,
  UserPlus,
  Activity,
  Briefcase,
  CheckCircle,
  Menu,
  X,
  ArrowRight,
  Rocket,
  Plus,
  Minus,
  ExternalLink,
  Star,
  Quote,
  ArrowUpRight,
  Lightbulb,
  PenTool,
  Wrench,
  CheckSquare,
  Home,
  Info,
  Mail,
  Phone,
  MapPin,
  Send,
  ArrowLeft,
  Play,
  Github,
  Linkedin,
  Twitter,
  Eye,
  MousePointer,
  Image as ImageIcon,
  ChevronLeft,
  ChevronRight,
  Shield,
  Coffee,
  Headphones,
} from "lucide-react";
import Image from "next/image";

export default function UnicomTeamWebsite() {
  // Use the ThemeContext instead of local state
  const { toggleTheme, isDark, colors, gradients } = useTheme();

  // Add mounted state to prevent hydration mismatch
  const [mounted, setMounted] = useState(false);

  const [currentSlide, setCurrentSlide] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [openFAQ, setOpenFAQ] = useState<number | null>(null);
  const [activeTestimonial, setActiveTestimonial] = useState(0);
  const [activeTab, setActiveTab] = useState("home");
  const [selectedProject, setSelectedProject] = useState<any>(null);
  const [hoveredProject, setHoveredProject] = useState<number | null>(null);

  // Add image gallery states
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [showImageModal, setShowImageModal] = useState(false);

  // Handle mounting to prevent hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  // Map context colors to component theme structure - only after mounting
  const theme = mounted
    ? {
        bg: isDark
          ? "from-gray-950 via-black to-gray-950"
          : "from-amber-50 via-orange-50 to-yellow-50",
        text: colors.text.primary,
        textSecondary: colors.text.secondary,
        textMuted: colors.text.muted,
        accent: colors.text.accent,
        card: colors.card.background,
        cardHover: isDark
          ? "hover:shadow-amber-500/30 hover:border-amber-400/40"
          : "hover:shadow-amber-500/30 hover:border-orange-400/50",
        button: colors.form.button,
      }
    : {
        // Default theme for server-side rendering (prevents hydration mismatch)
        bg: "from-gray-950 via-black to-gray-950",
        text: "text-white",
        textSecondary: "text-white/90",
        textMuted: "text-white/70",
        accent: "text-amber-300",
        card: "bg-gray-900/90 backdrop-blur-lg border-amber-500/20",
        cardHover: "hover:shadow-amber-500/30 hover:border-amber-400/40",
        button:
          "from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500",
      };

  // Updated slides with Unsplash images
  const slides = [
    {
      title: "Stunning Websites for Your Online Presence",
      subtitle: "Crafted with precision and passion",
      icon: Globe,
      image:
        "https://images.unsplash.com/photo-1547658719-da2b51169166?w=600&h=600&fit=crop&crop=center",
      description:
        "We design and develop beautiful, responsive websites that captivate your audience and drive results",
    },
    {
      title: "Mobile Applications",
      subtitle: "Innovation in your pocket",
      icon: Smartphone,
      image:
        "https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=600&h=600&fit=crop&crop=center",
      description:
        "Native and cross-platform mobile apps that deliver exceptional user experiences on any device",
    },
    {
      title: "Custom Solutions",
      subtitle: "Tailored to your vision",
      icon: Code,
      image:
        "https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=600&h=600&fit=crop&crop=center",
      description:
        "From concept to launch, we bring your digital dreams to life with cutting-edge technology",
    },
  ];

  // Updated Team Owners/Founders with Unsplash profile images
  const teamOwners = [
    {
      name: "Stephanie Noelle",
      role: "CEO & Co-Founder",
      image: "/images/unicom1.png",
      bio: "Visionary leader with 15+ years in tech industry",
      expertise: "Business Strategy, Product Vision",
      social: {
        linkedin: "#",
        twitter: "#",
        github: "#",
      },
    },
    {
      name: "Alvine Malyka",
      role: "CTO & Co-Founder",
      image: "/images/unicom3.jpeg",
      bio: "Tech innovator and full-stack architect",
      expertise: "System Architecture, AI/ML",
      social: {
        linkedin: "#",
        twitter: "#",
        github: "#",
      },
    },
    {
      name: "Obed Bolak",
      role: "Creative Director & Co-Founder",
      image: "/images/unicom4.jpeg",
      bio: "Award-winning designer with eye for detail",
      expertise: "UI/UX Design, Brand Strategy",
      social: {
        linkedin: "#",
        twitter: "#",
        github: "#",
      },
    },
    {
      name: "Lilian Martin",
      role: "COO & Co-Founder",
      image: "/images/unicom2.jpg",
      bio: "Operations expert ensuring seamless delivery",
      expertise: "Project Management, Client Relations",
      social: {
        linkedin: "#",
        twitter: "#",
        github: "#",
      },
    },
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setIsAnimating(true);
      setTimeout(() => {
        setCurrentSlide((prev) => (prev + 1) % slides.length);
        setIsAnimating(false);
      }, 500);
    }, 4500);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const testimonialInterval = setInterval(() => {
      setActiveTestimonial((prev) => (prev + 1) % testimonials.length);
    }, 5000);

    return () => clearInterval(testimonialInterval);
  }, []);

  const CurrentIcon = slides[currentSlide].icon;

  // Update the document title dynamically based on active tab/section
  useEffect(() => {
    const base = "Unicom Team";

    const capitalize = (s: string) => s?.charAt(0).toUpperCase() + s?.slice(1);

    function getTitle() {
      const tab = capitalize(activeTab || "");

      if (activeTab === "home") {
        const slideTitle = slides[currentSlide]?.title ?? "";
        return slideTitle ? `${slideTitle} — ${base}` : `${tab} — ${base}`;
      }

      if (activeTab === "projects" && selectedProject?.title) {
        return `${selectedProject.title} — ${tab} — ${base}`;
      }

      // Fallback: show tab and app name
      return tab ? `${tab} — ${base}` : base;
    }

    try {
      document.title = getTitle();
    } catch (e) {
      // If document isn't available (very unlikely in this client component), ignore
    }
  }, [activeTab, currentSlide, selectedProject]);

  // UPDATED: Removed "Happy Clients" stat
  const teamStats = [
    {
      title: "Projects Delivered",
      value: "150+",
      icon: CheckCircle,
      gradient: "from-amber-500 to-orange-500",
    },
    {
      title: "Team Members",
      value: "25+",
      icon: Award,
      gradient: "from-amber-600 to-yellow-600",
    },
    {
      title: "Years Experience",
      value: "8+",
      icon: TrendingUp,
      gradient: "from-orange-500 to-amber-600",
    },
  ];

  const services = [
    {
      icon: Globe,
      title: "Web Development",
      description:
        "Responsive, fast, and scalable websites built with modern technologies",
      features: [
        "React & Next.js",
        "E-commerce Solutions",
        "CMS Integration",
        "SEO Optimized",
      ],
    },
    {
      icon: Smartphone,
      title: "Mobile Apps",
      description: "Native iOS and Android apps that users love",
      features: [
        "React Native",
        "Flutter",
        "Cross-Platform",
        "App Store Publishing",
      ],
    },
    {
      icon: Palette,
      title: "UI/UX Design",
      description: "Beautiful, intuitive designs that enhance user experience",
      features: [
        "User Research",
        "Wireframing",
        "Prototyping",
        "Design Systems",
      ],
    },
    {
      icon: Code,
      title: "Custom Development",
      description: "Tailored solutions for your unique business needs",
      features: [
        "API Development",
        "Database Design",
        "Cloud Integration",
        "DevOps",
      ],
    },
  ];

  // Updated projects with more images and removed videoUrl
  const projects = [
    {
      id: 1,
      title: "E-Commerce Platform",
      category: "Web Development",
      description:
        "A modern e-commerce solution with real-time inventory management",
      image: "🛍️",
      thumbnail:
        "https://images.unsplash.com/photo-1557821552-17105176677c?w=1200&h=800&fit=crop",
      technologies: ["React", "Node.js", "MongoDB", "Stripe"],
      link: "#",
      featured: true,
      details: {
        fullDescription:
          "A comprehensive e-commerce platform built for a leading retail brand. The solution features real-time inventory management, advanced search capabilities, personalized recommendations, and seamless payment integration. We implemented a scalable microservices architecture to handle high traffic volumes during peak shopping seasons.",
        client: "RetailMax Inc.",
        duration: "6 months",
        team: "8 members",
        heroImage:
          "https://images.unsplash.com/photo-1557821552-17105176677c?w=1200&h=600&fit=crop",
        images: [
          "https://images.unsplash.com/photo-1557821552-17105176677c?w=800&h=600&fit=crop",
          "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&h=600&fit=crop",
          "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&h=600&fit=crop",
          "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=800&h=600&fit=crop",
          "https://images.unsplash.com/photo-1586953208448-b95a79798f07?w=800&h=600&fit=crop",
        ],
        challenges: [
          "Handling 10,000+ concurrent users",
          "Real-time inventory synchronization",
          "Complex product filtering system",
        ],
        results: [
          "40% increase in conversion rate",
          "99.9% uptime achieved",
          "3x faster page load times",
        ],
      },
    },
    {
      id: 2,
      title: "FinTech Mobile App",
      category: "Mobile Development",
      description: "Secure banking application with biometric authentication",
      image: "💳",
      thumbnail:
        "https://images.unsplash.com/photo-1563986768609-322da13575f3?w=1200&h=800&fit=crop",
      technologies: ["React Native", "Firebase", "Node.js", "Plaid API"],
      link: "#",
      featured: true,
      details: {
        fullDescription:
          "A cutting-edge mobile banking application that revolutionizes the way users manage their finances. Features include biometric authentication, real-time transaction notifications, budget tracking, investment portfolio management, and peer-to-peer payments. Built with security and user experience as top priorities.",
        client: "SecureBank Digital",
        duration: "8 months",
        team: "10 members",
        heroImage:
          "https://images.unsplash.com/photo-1563986768609-322da13575f3?w=1200&h=600&fit=crop",
        images: [
          "https://images.unsplash.com/photo-1563986768609-322da13575f3?w=800&h=600&fit=crop",
          "https://images.unsplash.com/photo-1551650975-87deedd944c3?w=800&h=600&fit=crop",
          "https://images.unsplash.com/photo-1559526324-4b87b5e36e44?w=800&h=600&fit=crop",
          "https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?w=800&h=600&fit=crop",
          "https://images.unsplash.com/photo-1556742111-a301076d9d18?w=800&h=600&fit=crop",
        ],
        challenges: [
          "Bank-level security implementation",
          "Compliance with financial regulations",
          "Cross-platform consistency",
        ],
        results: [
          "500K+ downloads in first quarter",
          "4.8★ average rating",
          "Zero security breaches",
        ],
      },
    },
    {
      id: 3,
      title: "Healthcare Portal",
      category: "Web Application",
      description: "Patient management system with telemedicine features",
      image: "🏥",
      thumbnail:
        "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=1200&h=800&fit=crop",
      technologies: ["Next.js", "PostgreSQL", "WebRTC", "AWS"],
      link: "#",
      featured: false,
      details: {
        fullDescription:
          "An innovative healthcare platform connecting patients with healthcare providers. Features include appointment scheduling, electronic health records, video consultations, prescription management, and lab result tracking. The system prioritizes HIPAA compliance and data security.",
        client: "HealthCare Solutions",
        duration: "10 months",
        team: "12 members",
        heroImage:
          "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=1200&h=600&fit=crop",
        images: [
          "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=800&h=600&fit=crop",
          "https://images.unsplash.com/photo-1504439468489-c8920d796a29?w=800&h=600&fit=crop",
          "https://images.unsplash.com/photo-1538108149393-fbbd81895907?w=800&h=600&fit=crop",
        ],
        challenges: [
          "HIPAA compliance requirements",
          "Secure video consultations",
          "Integration with multiple EMR systems",
        ],
        results: [
          "10,000+ patients onboarded",
          "95% patient satisfaction rate",
          "50% reduction in no-shows",
        ],
      },
    },
    {
      id: 4,
      title: "Real Estate Platform",
      category: "Full Stack",
      description: "Property listing platform with virtual tour capabilities",
      image: "🏠",
      thumbnail:
        "https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=1200&h=800&fit=crop",
      technologies: ["Vue.js", "Django", "PostgreSQL", "Mapbox"],
      link: "#",
      featured: false,
      details: {
        fullDescription:
          "A comprehensive real estate platform featuring advanced property search, 3D virtual tours, mortgage calculators, and agent matching. The platform uses AI to provide personalized property recommendations and market insights.",
        client: "Prime Properties Group",
        duration: "7 months",
        team: "9 members",
        heroImage:
          "https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=1200&h=600&fit=crop",
        images: [
          "https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=800&h=600&fit=crop",
          "https://images.unsplash.com/photo-1582407947304-fd86f028f716?w=800&h=600&fit=crop",
          "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800&h=600&fit=crop",
        ],
        challenges: [
          "Real-time property availability",
          "3D virtual tour integration",
          "Complex search filters",
        ],
        results: [
          "5,000+ properties listed",
          "60% increase in qualified leads",
          "30% faster property sales",
        ],
      },
    },
    {
      id: 5,
      title: "Food Delivery App",
      category: "Mobile Development",
      description: "Multi-vendor food delivery with real-time tracking",
      image: "🍔",
      thumbnail:
        "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=1200&h=800&fit=crop",
      technologies: ["Flutter", "Firebase", "Google Maps", "Stripe"],
      link: "#",
      featured: false,
      details: {
        fullDescription:
          "A feature-rich food delivery application connecting customers with local restaurants. Includes real-time order tracking, multiple payment options, restaurant ratings, loyalty programs, and delivery optimization algorithms.",
        client: "QuickBite Services",
        duration: "5 months",
        team: "7 members",
        heroImage:
          "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=1200&h=600&fit=crop",
        images: [
          "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800&h=600&fit=crop",
          "https://images.unsplash.com/photo-1526367790999-0150786686a2?w=800&h=600&fit=crop",
          "https://images.unsplash.com/photo-1476224203421-9ac39bcb3327?w=800&h=600&fit=crop",
        ],
        challenges: [
          "Real-time driver tracking",
          "Multi-restaurant order handling",
          "Dynamic pricing algorithms",
        ],
        results: [
          "200+ restaurant partners",
          "Average 30-min delivery time",
          "4.7★ user rating",
        ],
      },
    },
    {
      id: 6,
      title: "SaaS Dashboard",
      category: "Web Development",
      description: "Analytics dashboard for business intelligence",
      image: "📊",
      thumbnail:
        "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=1200&h=800&fit=crop",
      technologies: ["React", "D3.js", "Node.js", "Redis"],
      link: "#",
      featured: false,
      details: {
        fullDescription:
          "A powerful business intelligence dashboard providing real-time analytics, custom reports, and data visualization. Features include interactive charts, automated reporting, team collaboration tools, and API integrations with major platforms.",
        client: "DataMetrics Inc.",
        duration: "6 months",
        team: "6 members",
        heroImage:
          "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=1200&h=600&fit=crop",
        images: [
          "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&h=600&fit=crop",
          "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&h=600&fit=crop",
          "https://images.unsplash.com/photo-1551650975-87deedd944c3?w=800&h=600&fit=crop",
        ],
        challenges: [
          "Processing large datasets",
          "Real-time data visualization",
          "Custom report builder",
        ],
        results: [
          "1000+ business users",
          "Processes 10M+ data points daily",
          "80% time saved on reporting",
        ],
      },
    },
  ];

  const faqs = [
    {
      question: "How long does it take to build a website?",
      answer:
        "The timeline varies based on project complexity. A simple website typically takes 2-4 weeks, while complex web applications can take 2-6 months. We'll provide a detailed timeline after understanding your requirements.",
    },
    {
      question: "What technologies do you use?",
      answer:
        "We use modern, industry-standard technologies including React, Next.js, Node.js, Python, React Native, Flutter, and cloud services like AWS and Google Cloud. We choose the best tech stack based on your project needs.",
    },
    {
      question: "Do you provide ongoing support?",
      answer:
        "Yes! We offer comprehensive maintenance and support packages. This includes bug fixes, security updates, performance optimization, and feature enhancements to keep your application running smoothly.",
    },
    {
      question: "What is your development process?",
      answer:
        "We follow an agile methodology with clear phases: Discovery, Design, Development, Testing, and Deployment. You'll receive regular updates and have opportunities for feedback throughout the process.",
    },
    {
      question: "Can you work with our existing team?",
      answer:
        "Absolutely! We can seamlessly integrate with your existing team, whether you need additional resources, specific expertise, or complete project management.",
    },
    {
      question: "How much does a project typically cost?",
      answer:
        "Costs vary based on scope and complexity. Small websites start from $5,000, mobile apps from $15,000, and enterprise solutions from $30,000+. We provide detailed quotes after understanding your requirements.",
    },
  ];

  const testimonials = [
    {
      name: "Sarah Johnson",
      role: "CEO, TechStart",
      content:
        "Unicom Team transformed our vision into a stunning reality. Their attention to detail and technical expertise is unmatched.",
      rating: 5,
      image: "👩‍💼",
    },
    {
      name: "Michael Chen",
      role: "Founder, InnovateCo",
      content:
        "Working with Unicom was a game-changer for our business. They delivered beyond our expectations and on time.",
      rating: 5,
      image: "👨‍💼",
    },
    {
      name: "Emily Rodriguez",
      role: "Product Manager, FinanceHub",
      content:
        "The team's professionalism and creativity helped us launch a product that our users absolutely love. Highly recommended!",
      rating: 5,
      image: "👩‍💻",
    },
    {
      name: "David Kim",
      role: "CTO, HealthTech Solutions",
      content:
        "Unicom's technical expertise and innovative solutions helped us scale our platform to serve millions of users.",
      rating: 5,
      image: "👨‍💻",
    },
  ];

  const processSteps = [
    {
      icon: Lightbulb,
      title: "Discovery",
      description:
        "We dive deep into your vision, goals, and requirements to create a roadmap for success.",
      number: "01",
    },
    {
      icon: PenTool,
      title: "Design",
      description:
        "Our designers craft beautiful, intuitive interfaces that delight users and drive engagement.",
      number: "02",
    },
    {
      icon: Wrench,
      title: "Development",
      description:
        "We build robust, scalable solutions using cutting-edge technologies and best practices.",
      number: "03",
    },
    {
      icon: CheckSquare,
      title: "Launch",
      description:
        "After rigorous testing, we deploy your project and ensure a smooth, successful launch.",
      number: "04",
    },
  ];

  const navigationTabs = [
    { id: "home", label: "Home", icon: Home },
    { id: "services", label: "Services", icon: Briefcase },
    { id: "projects", label: "Projects", icon: FolderOpen },
    { id: "about", label: "About Us", icon: Info },
    { id: "contact", label: "Contact", icon: Mail },
  ];

  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId);
    setMenuOpen(false);
    setSelectedProject(null);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleProjectClick = (project: any) => {
    setSelectedProject(project);
    setSelectedImageIndex(0); // Reset to first image
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Image gallery functions
  const openImageModal = (index: number) => {
    setSelectedImageIndex(index);
    setShowImageModal(true);
  };

  const closeImageModal = () => {
    setShowImageModal(false);
  };

  const nextImage = () => {
    if (selectedProject) {
      setSelectedImageIndex((prev) =>
        prev < selectedProject.details.images.length - 1 ? prev + 1 : 0,
      );
    }
  };

  const prevImage = () => {
    if (selectedProject) {
      setSelectedImageIndex((prev) =>
        prev > 0 ? prev - 1 : selectedProject.details.images.length - 1,
      );
    }
  };

  const updateMainImage = (index: number) => {
    setSelectedImageIndex(index);
  };

  const renderContent = () => {
    if (selectedProject) {
      return <ProjectDetailContent />;
    }

    switch (activeTab) {
      case "home":
        return <HomeContent />;
      case "services":
        return <ServicesContent />;
      case "projects":
        return <ProjectsContent />;
      case "about":
        return <AboutContent />;
      case "contact":
        return <ContactContent />;
      default:
        return <HomeContent />;
    }
  };

  // Image Modal Component
  const ImageModal = () => {
    if (!showImageModal || !selectedProject) return null;

    return (
      <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-sm flex items-center justify-center p-4">
        <div className="relative max-w-6xl max-h-full">
          {/* Close Button */}
          <button
            onClick={closeImageModal}
            className="absolute top-4 right-4 z-10 p-2 rounded-full bg-black/50 text-white hover:bg-black/70 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>

          {/* Navigation Buttons */}
          <button
            onClick={prevImage}
            className="absolute left-4 top-1/2 -translate-y-1/2 z-10 p-2 rounded-full bg-black/50 text-white hover:bg-black/70 transition-colors"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>

          <button
            onClick={nextImage}
            className="absolute right-4 top-1/2 -translate-y-1/2 z-10 p-2 rounded-full bg-black/50 text-white hover:bg-black/70 transition-colors"
          >
            <ChevronRight className="w-6 h-6" />
          </button>

          {/* Image */}
          <img
            src={selectedProject.details.images[selectedImageIndex]}
            alt={`${selectedProject.title} - Image ${selectedImageIndex + 1}`}
            className="max-w-full max-h-[80vh] object-contain rounded-lg"
          />

          {/* Image Info */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/50 text-white px-4 py-2 rounded-full text-sm">
            {selectedImageIndex + 1} of {selectedProject.details.images.length}
          </div>
        </div>
      </div>
    );
  };

  // Updated Project Detail Page with clickable image gallery
  const ProjectDetailContent = () => (
    <section className="relative z-10 container mx-auto px-6 py-20">
      {/* Image Modal */}
      <ImageModal />

      {/* Back Button */}
      <button
        onClick={() => setSelectedProject(null)}
        className={`flex items-center gap-2 ${theme.text} hover:${theme.accent} mb-8 transition-colors`}
      >
        <ArrowLeft className="w-5 h-5" />
        <span className="font-medium">Back to Projects</span>
      </button>

      {/* Project Header */}
      <div className="mb-12">
        <div className="flex items-start justify-between mb-4">
          <div>
            <span
              className={`px-3 py-1 rounded-full text-sm font-semibold ${
                mounted && isDark
                  ? "bg-amber-500/20 text-amber-300"
                  : "bg-amber-100 text-amber-700"
              } mb-4 inline-block`}
            >
              {selectedProject.category}
            </span>
            <h1 className={`text-4xl md:text-5xl font-bold ${theme.text} mb-4`}>
              {selectedProject.title}
            </h1>
            <p className={`text-xl ${theme.textMuted}`}>
              {selectedProject.description}
            </p>
          </div>
          <div className="text-6xl">{selectedProject.image}</div>
        </div>

        {/* Project Meta Info */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
          <div className={`${theme.card} border rounded-xl p-4`}>
            <p className={`text-sm ${theme.textMuted} mb-1`}>Client</p>
            <p className={`font-semibold ${theme.text}`}>
              {selectedProject.details.client}
            </p>
          </div>
          <div className={`${theme.card} border rounded-xl p-4`}>
            <p className={`text-sm ${theme.textMuted} mb-1`}>Duration</p>
            <p className={`font-semibold ${theme.text}`}>
              {selectedProject.details.duration}
            </p>
          </div>
          <div className={`${theme.card} border rounded-xl p-4`}>
            <p className={`text-sm ${theme.textMuted} mb-1`}>Team Size</p>
            <p className={`font-semibold ${theme.text}`}>
              {selectedProject.details.team}
            </p>
          </div>
          <div className={`${theme.card} border rounded-xl p-4`}>
            <p className={`text-sm ${theme.textMuted} mb-1`}>Status</p>
            <p className={`font-semibold text-green-500`}>Completed</p>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Left Column - Text Content */}
        <div className="lg:col-span-1 space-y-8">
          {/* Project Overview */}
          <div className={`${theme.card} border rounded-2xl p-6`}>
            <h2 className={`text-2xl font-bold ${theme.text} mb-4`}>
              Project Overview
            </h2>
            <p className={`${theme.textMuted} leading-relaxed`}>
              {selectedProject.details.fullDescription}
            </p>
          </div>

          {/* Technologies */}
          <div className={`${theme.card} border rounded-2xl p-6`}>
            <h3 className={`text-xl font-bold ${theme.text} mb-4`}>
              Technologies Used
            </h3>
            <div className="flex flex-wrap gap-2">
              {selectedProject.technologies.map((tech: string, idx: number) => (
                <span
                  key={idx}
                  className={`px-4 py-2 rounded-lg ${
                    mounted && isDark ? "bg-gray-800" : "bg-gray-100"
                  } ${theme.text} font-medium`}
                >
                  {tech}
                </span>
              ))}
            </div>
          </div>

          {/* Challenges */}
          <div className={`${theme.card} border rounded-2xl p-6`}>
            <h3 className={`text-xl font-bold ${theme.text} mb-4`}>
              Key Challenges
            </h3>
            <ul className="space-y-3">
              {selectedProject.details.challenges.map(
                (challenge: string, idx: number) => (
                  <li key={idx} className="flex items-start gap-3">
                    <Zap className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
                    <span className={`${theme.textMuted}`}>{challenge}</span>
                  </li>
                ),
              )}
            </ul>
          </div>

          {/* Results */}
          <div className={`${theme.card} border rounded-2xl p-6`}>
            <h3 className={`text-xl font-bold ${theme.text} mb-4`}>
              Results Achieved
            </h3>
            <ul className="space-y-3">
              {selectedProject.details.results.map(
                (result: string, idx: number) => (
                  <li key={idx} className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                    <span className={`${theme.textMuted}`}>{result}</span>
                  </li>
                ),
              )}
            </ul>
          </div>
        </div>

        {/* Right Column - Media Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Main Display Image - Clickable and updates based on selection */}
          <div className={`${theme.card} border rounded-2xl overflow-hidden`}>
            <div
              className="relative aspect-video overflow-hidden cursor-pointer group"
              onClick={() => openImageModal(selectedImageIndex)}
            >
              <img
                src={selectedProject.details.images[selectedImageIndex]}
                alt={`${selectedProject.title} main interface`}
                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>

              {/* View Icon on Hover */}
              <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300">
                <div className="p-4 rounded-full bg-black/50 backdrop-blur-sm">
                  <Eye className="w-8 h-8 text-white" />
                </div>
              </div>
            </div>
            <div className="p-4">
              <div className="flex items-center gap-2 text-amber-500">
                <ImageIcon className="w-4 h-4" />
                <span className={`text-sm font-medium ${theme.text}`}>
                  Click to view full size • Image {selectedImageIndex + 1} of{" "}
                  {selectedProject.details.images.length}
                </span>
              </div>
            </div>
          </div>

          {/* Clickable Image Gallery */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {selectedProject.details.images.map(
              (image: string, idx: number) => (
                <div
                  key={idx}
                  className={`${
                    theme.card
                  } border rounded-xl overflow-hidden group ${
                    theme.cardHover
                  } transition-all duration-300 cursor-pointer ${
                    idx === selectedImageIndex ? "ring-2 ring-amber-500" : ""
                  }`}
                  onClick={() => updateMainImage(idx)}
                >
                  <div className="relative aspect-[4/3] overflow-hidden">
                    <img
                      src={image}
                      alt={`Project screenshot ${idx + 1}`}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

                    {/* Click indicator */}
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300">
                      <div className="p-2 rounded-full bg-black/50 backdrop-blur-sm">
                        <MousePointer className="w-5 h-5 text-white" />
                      </div>
                    </div>

                    {/* Image overlay info */}
                    <div className="absolute bottom-2 left-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <div className="bg-black/70 backdrop-blur-sm rounded-lg px-3 py-2">
                        <p className="text-white text-xs font-medium">
                          Interface Design {idx + 1}
                          {idx === selectedImageIndex && " (Current)"}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              ),
            )}
          </div>

          {/* Project Features Showcase */}
          <div className={`${theme.card} border rounded-2xl p-6`}>
            <h3 className={`text-xl font-bold ${theme.text} mb-4`}>
              Key Features
            </h3>
            <div className="grid md:grid-cols-2 gap-4">
              {selectedProject.technologies.map((tech: string, idx: number) => (
                <div
                  key={idx}
                  className="flex items-center gap-3 p-3 rounded-lg bg-gradient-to-r from-amber-500/10 to-orange-500/10"
                >
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center">
                    <Code className="w-4 h-4 text-white" />
                  </div>
                  <span className={`${theme.text} font-medium`}>{tech}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Additional Info Card */}
          <div
            className={`${theme.card} border rounded-2xl p-8 bg-gradient-to-br from-amber-500/10 to-orange-500/10`}
          >
            <h3 className={`text-2xl font-bold ${theme.text} mb-4`}>
              Want a similar project?
            </h3>
            <p className={`${theme.textMuted} mb-6`}>
              We can create a customized solution tailored to your specific
              needs. Let's discuss how we can bring your vision to life.
            </p>
            <button
              onClick={() => handleTabChange("contact")}
              className={`px-8 py-4 rounded-full bg-gradient-to-r ${theme.button} text-white font-semibold shadow-xl shadow-amber-500/30 transform transition-all duration-300 hover:scale-105 hover:shadow-amber-500/50 flex items-center gap-2`}
            >
              Start Your Project
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );

  // Don't render content until mounted to prevent hydration mismatch
  if (!mounted) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-amber-500"></div>
      </div>
    );
  }

  // Home Page Content - UPDATED with two new sections
  const HomeContent = () => (
    <>
      {/* Hero Section */}
      <section className="relative z-10 container mx-auto px-6 py-20 min-h-screen flex items-center">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center w-full">
          {/* Left Container - Content */}
          <div className="order-2 lg:order-1">
            {/* Badge */}
            <div className="flex justify-start mb-6 animate-fade-in">
              <div
                className={`px-4 py-2 rounded-full ${theme.card} border flex items-center gap-2 ${theme.cardHover} transition-all duration-300`}
              >
                <Rocket className="w-4 h-4 text-amber-500 animate-pulse" />
                <span className={`${theme.text} text-sm font-medium`}>
                  Digital Excellence Since 2016
                </span>
              </div>
            </div>

            {/* Main Heading */}
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-black mb-6">
              <span className="block mb-2">
                <span
                  className="bg-gradient-to-r from-amber-300 via-yellow-200 to-orange-300 bg-clip-text text-transparent"
                  style={{
                    textShadow: isDark
                      ? "0 0 80px rgba(251, 191, 36, 0.3)"
                      : "0 0 40px rgba(245, 158, 11, 0.2)",
                  }}
                >
                  Create
                </span>
              </span>
              <span className="block mb-2">
                <span
                  className="bg-gradient-to-r from-orange-400 via-amber-400 to-yellow-400 bg-clip-text text-transparent"
                  style={{
                    textShadow: isDark
                      ? "0 0 60px rgba(251, 146, 60, 0.3)"
                      : "0 0 30px rgba(251, 146, 60, 0.2)",
                  }}
                >
                  Digital
                </span>
              </span>
              <span className="block">
                <span
                  className="bg-gradient-to-r from-yellow-400 via-orange-400 to-amber-500 bg-clip-text text-transparent"
                  style={{
                    textShadow: isDark
                      ? "0 0 80px rgba(234, 179, 8, 0.4)"
                      : "0 0 40px rgba(234, 179, 8, 0.2)",
                  }}
                >
                  Masterpieces
                </span>
              </span>
            </h1>

            {/* Subtitle */}
            <p className={`text-xl md:text-2xl ${theme.textMuted} mb-8`}>
              We transform your ideas into stunning digital experiences that
              captivate audiences and drive real business results.
            </p>

            {/* Features List */}
            <div className="space-y-3 mb-8">
              <div className="flex items-center gap-3">
                <CheckCircle className="w-5 h-5 text-amber-500 flex-shrink-0" />
                <span className={`${theme.textSecondary}`}>
                  Custom websites & mobile apps
                </span>
              </div>
              <div className="flex items-center gap-3">
                <CheckCircle className="w-5 h-5 text-amber-500 flex-shrink-0" />
                <span className={`${theme.textSecondary}`}>
                  Modern, scalable technology stack
                </span>
              </div>
              <div className="flex items-center gap-3">
                <CheckCircle className="w-5 h-5 text-amber-500 flex-shrink-0" />
                <span className={`${theme.textSecondary}`}>
                  End-to-end digital solutions
                </span>
              </div>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-wrap gap-4">
              <button
                onClick={() => handleTabChange("contact")}
                className={`px-8 py-4 rounded-full bg-gradient-to-r ${theme.button} text-white font-semibold text-lg shadow-2xl shadow-amber-500/30 transform transition-all duration-300 hover:scale-105 hover:shadow-amber-500/50 flex items-center gap-2`}
              >
                Start Your Project
                <ArrowRight className="w-5 h-5" />
              </button>
              <button
                onClick={() => handleTabChange("services")}
                className={`px-8 py-4 rounded-full ${theme.card} border ${theme.text} font-semibold text-lg ${theme.cardHover} transform transition-all duration-300 hover:scale-105 flex items-center gap-2`}
              >
                <MessageSquare className="w-5 h-5" />
                Explore Services
              </button>
            </div>

            {/* Stats Bar */}
            <div className="flex flex-wrap gap-8 mt-12 pt-8 border-t border-amber-500/20">
              <div>
                <div className={`text-3xl font-bold ${theme.accent}`}>150+</div>
                <div className={`text-sm ${theme.textMuted}`}>Projects</div>
              </div>
              <div>
                <div className={`text-3xl font-bold ${theme.accent}`}>25+</div>
                <div className={`text-sm ${theme.textMuted}`}>Team Members</div>
              </div>
              <div>
                <div className={`text-3xl font-bold ${theme.accent}`}>8+</div>
                <div className={`text-sm ${theme.textMuted}`}>Years</div>
              </div>
            </div>
          </div>

          {/* Right Container - Image Background Cards */}
          <div className="order-1 lg:order-2">
            <div
              className={`relative rounded-3xl overflow-hidden transition-all duration-500 ${
                isAnimating ? "opacity-0 scale-95" : "opacity-100 scale-100"
              } shadow-2xl hover:shadow-amber-500/30 transform hover:scale-105 transition-all duration-300`}
              style={{ height: "500px" }}
            >
              {/* Background Image */}
              <div
                className="absolute inset-0 bg-cover bg-center transition-all duration-1000"
                style={{
                  backgroundImage: `url(${slides[currentSlide].image})`,
                }}
              />

              {/* Overlay for text readability */}
              <div className="absolute inset-0 bg-gradient-to-br from-black/60 via-black/40 to-black/70"></div>
              <div className="absolute inset-0 bg-gradient-to-br from-amber-500/20 to-orange-600/30"></div>

              {/* Content */}
              <div className="relative z-10 h-full flex flex-col justify-center items-center text-center p-8 md:p-12">
                {/* Icon */}
                <div className="mb-6">
                  <div className="p-4 rounded-2xl bg-gradient-to-br from-amber-500/90 to-orange-600/90 backdrop-blur-sm shadow-lg">
                    <CurrentIcon className="w-10 h-10 text-white" />
                  </div>
                </div>

                {/* Title */}
                <h3 className="text-3xl md:text-4xl font-bold text-white mb-4 drop-shadow-lg">
                  {slides[currentSlide].title}
                </h3>

                {/* Subtitle */}
                <p className="text-lg md:text-xl text-white/90 font-medium mb-6 drop-shadow-md max-w-md">
                  {slides[currentSlide].subtitle}
                </p>

                {/* Call to Action */}
                <button
                  onClick={() => handleTabChange("services")}
                  className="px-6 py-3 rounded-full bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-white font-semibold shadow-lg shadow-amber-500/30 transform transition-all duration-300 hover:scale-105 flex items-center gap-2"
                >
                  Learn More
                  <ArrowRight className="w-5 h-5" />
                </button>
              </div>

              {/* Slide Indicators */}
              <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 flex gap-3 z-20">
                {slides.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => {
                      setIsAnimating(true);
                      setTimeout(() => {
                        setCurrentSlide(index);
                        setIsAnimating(false);
                      }, 300);
                    }}
                    className={`h-2 rounded-full transition-all duration-300 backdrop-blur-sm ${
                      index === currentSlide
                        ? "w-12 bg-gradient-to-r from-amber-400 to-orange-500 shadow-lg"
                        : "w-2 bg-white/50 hover:bg-white/70"
                    }`}
                  />
                ))}
              </div>

              {/* Corner Decoration */}
              <div className="absolute top-4 right-4 z-20">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-amber-100/80 to-orange-200/40 backdrop-blur-sm flex items-center justify-center">
                  <Image
                    src="/images/logo.png"
                    alt="logo"
                    width={20}
                    height={20}
                  />
                </div>
              </div>
            </div>

            {/* Service Preview Cards */}
            <div className="grid grid-cols-3 gap-4 mt-8">
              {slides.map((slide, index) => (
                <button
                  key={index}
                  onClick={() => {
                    setIsAnimating(true);
                    setTimeout(() => {
                      setCurrentSlide(index);
                      setIsAnimating(false);
                    }, 300);
                  }}
                  className={`p-4 rounded-xl border transition-all duration-300 hover:scale-105 ${
                    index === currentSlide
                      ? `${theme.card} border-amber-500/50 shadow-lg shadow-amber-500/20`
                      : `${theme.card} border-transparent hover:border-amber-500/30`
                  }`}
                >
                  <div className="flex flex-col items-center text-center">
                    <div
                      className={`p-2 rounded-lg bg-gradient-to-br from-amber-500 to-orange-600 mb-2 ${
                        index === currentSlide ? "shadow-lg" : ""
                      }`}
                    >
                      <slide.icon className="w-4 h-4 text-white" />
                    </div>
                    <span
                      className={`text-sm font-medium ${theme.text} line-clamp-2`}
                    >
                      {slide.title}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* NEW SECTION 1: Why Choose Us */}
      <section className="relative z-10 container mx-auto px-6 py-20">
        <div className="text-center mb-12">
          <h2 className={`text-3xl md:text-4xl font-bold mb-4 ${theme.text}`}>
            Why Choose Unicom Team?
          </h2>
          <p className={`text-lg ${theme.textMuted}`}>
            We deliver excellence through innovation and dedication
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div
            className={`p-8 rounded-2xl ${theme.card} border ${theme.cardHover} transition-all duration-300 hover:scale-105 text-center`}
          >
            <div className="inline-flex p-4 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 mb-4">
              <Zap className="w-8 h-8 text-white" />
            </div>
            <h3 className={`text-xl font-bold ${theme.text} mb-3`}>
              Lightning Fast
            </h3>
            <p className={`${theme.textMuted} text-sm`}>
              Optimized performance and quick turnaround times for all projects
            </p>
          </div>

          <div
            className={`p-8 rounded-2xl ${theme.card} border ${theme.cardHover} transition-all duration-300 hover:scale-105 text-center`}
          >
            <div className="inline-flex p-4 rounded-2xl bg-gradient-to-br from-yellow-500 to-amber-500 mb-4">
              <Shield className="w-8 h-8 text-white" />
            </div>
            <h3 className={`text-xl font-bold ${theme.text} mb-3`}>
              Secure & Reliable
            </h3>
            <p className={`${theme.textMuted} text-sm`}>
              Bank-level security and 99.9% uptime guarantee for your peace of
              mind
            </p>
          </div>

          <div
            className={`p-8 rounded-2xl ${theme.card} border ${theme.cardHover} transition-all duration-300 hover:scale-105 text-center`}
          >
            <div className="inline-flex p-4 rounded-2xl bg-gradient-to-br from-orange-500 to-amber-600 mb-4">
              <Coffee className="w-8 h-8 text-white" />
            </div>
            <h3 className={`text-xl font-bold ${theme.text} mb-3`}>
              Easy to Work With
            </h3>
            <p className={`${theme.textMuted} text-sm`}>
              Transparent communication and collaborative approach throughout
            </p>
          </div>

          <div
            className={`p-8 rounded-2xl ${theme.card} border ${theme.cardHover} transition-all duration-300 hover:scale-105 text-center`}
          >
            <div className="inline-flex p-4 rounded-2xl bg-gradient-to-br from-amber-600 to-yellow-600 mb-4">
              <Headphones className="w-8 h-8 text-white" />
            </div>
            <h3 className={`text-xl font-bold ${theme.text} mb-3`}>
              24/7 Support
            </h3>
            <p className={`${theme.textMuted} text-sm`}>
              Round-the-clock support to ensure your project runs smoothly
            </p>
          </div>
        </div>
      </section>

      {/* NEW SECTION 2: Featured Projects Preview */}
      <section className="relative z-10 container mx-auto px-6 py-20">
        <div className="text-center mb-12">
          <h2 className={`text-3xl md:text-4xl font-bold mb-4 ${theme.text}`}>
            Recent Success Stories
          </h2>
          <p className={`text-lg ${theme.textMuted}`}>
            Take a look at some of our latest projects
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {projects.slice(0, 3).map((project, index) => (
            <div
              key={index}
              onClick={() => handleProjectClick(project)}
              className={`${theme.card} border rounded-2xl overflow-hidden group ${theme.cardHover} transition-all duration-300 hover:scale-105 cursor-pointer`}
            >
              {/* Thumbnail */}
              <div className="relative h-56 overflow-hidden">
                <img
                  src={project.thumbnail}
                  alt={project.title}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent opacity-60 group-hover:opacity-80 transition-opacity duration-300"></div>

                {/* View Icon */}
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300">
                  <div className="p-4 rounded-full bg-gradient-to-br from-amber-500 to-orange-600 shadow-2xl">
                    <Eye className="w-6 h-6 text-white" />
                  </div>
                </div>

                {/* Category Badge */}
                <div className="absolute top-4 right-4">
                  <span className="px-3 py-1 rounded-full text-xs font-semibold bg-amber-500 text-white backdrop-blur-sm">
                    {project.category}
                  </span>
                </div>

                {/* Emoji */}
                <div className="absolute top-4 left-4 text-4xl">
                  {project.image}
                </div>
              </div>

              {/* Content */}
              <div className="p-6">
                <h3
                  className={`text-xl font-bold ${theme.text} mb-3 group-hover:text-amber-500 transition-colors`}
                >
                  {project.title}
                </h3>
                <p className={`${theme.textMuted} text-sm mb-4 line-clamp-2`}>
                  {project.description}
                </p>
                <div className="flex flex-wrap gap-2 mb-4">
                  {project.technologies.slice(0, 2).map((tech, idx) => (
                    <span
                      key={idx}
                      className={`px-3 py-1 rounded-lg text-xs ${
                        mounted && isDark ? "bg-gray-800" : "bg-gray-100"
                      } ${theme.text}`}
                    >
                      {tech}
                    </span>
                  ))}
                  {project.technologies.length > 2 && (
                    <span
                      className={`px-3 py-1 rounded-lg text-xs ${theme.accent}`}
                    >
                      +{project.technologies.length - 2}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2 text-amber-500 text-sm font-semibold group-hover:gap-3 transition-all">
                  <span>View Details</span>
                  <ArrowUpRight className="w-4 h-4" />
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="text-center mt-12">
          <button
            onClick={() => handleTabChange("projects")}
            className={`px-8 py-4 rounded-full bg-gradient-to-r ${theme.button} text-white font-semibold text-lg shadow-2xl shadow-amber-500/30 transform transition-all duration-300 hover:scale-105 hover:shadow-amber-500/50`}
          >
            View All Projects
          </button>
        </div>
      </section>

      {/* Featured Services Preview */}
      <section className="relative z-10 container mx-auto px-6 py-20">
        <div className="text-center mb-12">
          <h2 className={`text-3xl md:text-4xl font-bold mb-4 ${theme.text}`}>
            What We Offer
          </h2>
          <p className={`text-lg ${theme.textMuted}`}>
            Comprehensive solutions for your digital needs
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {services.map((service, index) => {
            const Icon = service.icon;
            return (
              <div
                key={index}
                className={`p-6 rounded-xl ${theme.card} border ${theme.cardHover} transition-all duration-300 hover:scale-105 text-center`}
              >
                <div className="p-3 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 inline-block mb-4">
                  <Icon className="w-8 h-8 text-white" />
                </div>
                <h3 className={`text-xl font-bold ${theme.text} mb-2`}>
                  {service.title}
                </h3>
                <p className={`${theme.textMuted} text-sm`}>
                  {service.description}
                </p>
              </div>
            );
          })}
        </div>

        <div className="text-center">
          <button
            onClick={() => handleTabChange("services")}
            className={`px-8 py-4 rounded-full bg-gradient-to-r ${theme.button} text-white font-semibold text-lg shadow-2xl shadow-amber-500/30 transform transition-all duration-300 hover:scale-105 hover:shadow-amber-500/50`}
          >
            View All Services
          </button>
        </div>
      </section>
    </>
  );

  // Services Page Content
  const ServicesContent = () => (
    <section className="relative z-10 container mx-auto px-6 py-20">
      <div className="text-center mb-16">
        <h1 className={`text-4xl md:text-5xl font-bold mb-4`}>
          <span
            className="bg-gradient-to-r from-orange-400 via-amber-400 to-yellow-400 bg-clip-text text-transparent"
            style={{
              textShadow: isDark ? "0 0 40px rgba(251, 146, 60, 0.3)" : "none",
            }}
          >
            Our Services
          </span>
        </h1>
        <p className={`text-xl ${theme.textMuted}`}>
          Comprehensive digital solutions for modern businesses
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
        {services.map((service, index) => {
          const Icon = service.icon;
          return (
            <div
              key={index}
              className={`p-8 rounded-2xl ${theme.card} border ${theme.cardHover} transition-all duration-300 hover:scale-105`}
            >
              <div className="flex items-start gap-4 mb-6">
                <div className="p-3 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600">
                  <Icon className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h3 className={`text-2xl font-bold ${theme.text} mb-2`}>
                    {service.title}
                  </h3>
                  <p className={`${theme.textMuted}`}>{service.description}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                {service.features.map((feature, idx) => (
                  <div
                    key={idx}
                    className={`px-3 py-2 rounded-lg ${
                      mounted && isDark ? "bg-gray-800/50" : "bg-amber-50"
                    } flex items-center gap-2`}
                  >
                    <CheckCircle className="w-4 h-4 text-amber-500 flex-shrink-0" />
                    <span className={`text-sm ${theme.text}`}>{feature}</span>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Process Section */}
      <div className="mb-16">
        <h2 className={`text-3xl font-bold text-center mb-12 ${theme.text}`}>
          Our Process
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {processSteps.map((step, index) => {
            const Icon = step.icon;
            return (
              <div key={index} className="relative">
                {index < processSteps.length - 1 && (
                  <div className="hidden lg:block absolute top-1/3 left-full w-full h-0.5 bg-gradient-to-r from-amber-500 to-transparent z-0"></div>
                )}

                <div
                  className={`relative ${theme.card} border rounded-2xl p-6 ${theme.cardHover} transition-all duration-300 hover:scale-105 z-10`}
                >
                  <div className="mb-4">
                    <span className="text-5xl font-bold bg-gradient-to-r from-amber-500 to-orange-600 bg-clip-text text-transparent">
                      {step.number}
                    </span>
                  </div>
                  <div className="p-3 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 inline-block mb-4">
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <h3 className={`text-xl font-bold ${theme.text} mb-3`}>
                    {step.title}
                  </h3>
                  <p className={`${theme.textMuted} text-sm`}>
                    {step.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* FAQ Section */}
      <div>
        <h2 className={`text-3xl font-bold text-center mb-12 ${theme.text}`}>
          Frequently Asked Questions
        </h2>
        <div className="max-w-3xl mx-auto space-y-4">
          {faqs.map((faq, index) => (
            <div
              key={index}
              className={`${theme.card} border rounded-xl overflow-hidden ${theme.cardHover}`}
            >
              <button
                onClick={() => setOpenFAQ(openFAQ === index ? null : index)}
                className="w-full p-6 text-left flex items-center justify-between"
              >
                <h3 className={`text-lg font-semibold ${theme.text}`}>
                  {faq.question}
                </h3>
                {openFAQ === index ? (
                  <Minus className="w-5 h-5 text-amber-500 flex-shrink-0" />
                ) : (
                  <Plus className="w-5 h-5 text-amber-500 flex-shrink-0" />
                )}
              </button>
              {openFAQ === index && (
                <div className="px-6 pb-6">
                  <p className={`${theme.textMuted} leading-relaxed`}>
                    {faq.answer}
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );

  // Projects Page Content
  const ProjectsContent = () => (
    <section className="relative z-10 container mx-auto px-6 py-20">
      <div className="text-center mb-16">
        <h1 className={`text-4xl md:text-5xl font-bold mb-4`}>
          <span
            className="bg-gradient-to-r from-yellow-400 via-orange-400 to-amber-500 bg-clip-text text-transparent"
            style={{
              textShadow: isDark ? "0 0 40px rgba(234, 179, 8, 0.3)" : "none",
            }}
          >
            Our Projects
          </span>
        </h1>
        <p className={`text-xl ${theme.textMuted}`}>
          Showcasing our best work and success stories
        </p>
      </div>

      {/* Featured Projects with Thumbnails */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
        {projects
          .filter((p) => p.featured)
          .map((project, index) => (
            <div
              key={index}
              onMouseEnter={() => setHoveredProject(project.id)}
              onMouseLeave={() => setHoveredProject(null)}
              onClick={() => handleProjectClick(project)}
              className={`${theme.card} border rounded-2xl overflow-hidden group ${theme.cardHover} transition-all duration-300 hover:scale-105 cursor-pointer`}
            >
              {/* Thumbnail Image */}
              <div className="relative h-64 overflow-hidden">
                <img
                  src={project.thumbnail}
                  alt={project.title}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
                {/* Overlay on hover */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent opacity-60 group-hover:opacity-80 transition-opacity duration-300"></div>

                {/* View Icon */}
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300">
                  <div className="p-4 rounded-full bg-gradient-to-br from-amber-500 to-orange-600 shadow-2xl transform group-hover:scale-110 transition-transform duration-300">
                    <Eye className="w-8 h-8 text-white" />
                  </div>
                </div>

                {/* Category Badge */}
                <div className="absolute top-4 right-4">
                  <span className="px-3 py-1 rounded-full text-xs font-semibold bg-amber-500 text-white backdrop-blur-sm">
                    {project.category}
                  </span>
                </div>

                {/* Emoji Icon */}
                <div className="absolute top-4 left-4 text-4xl">
                  {project.image}
                </div>
              </div>

              {/* Content */}
              <div className="p-6">
                <h3
                  className={`text-2xl font-bold ${theme.text} mb-3 group-hover:text-amber-500 transition-colors`}
                >
                  {project.title}
                </h3>
                <p className={`${theme.textMuted} mb-4`}>
                  {project.description}
                </p>
                <div className="flex flex-wrap gap-2 mb-4">
                  {project.technologies.slice(0, 3).map((tech, idx) => (
                    <span
                      key={idx}
                      className={`px-3 py-1 rounded-lg text-xs ${
                        mounted && isDark ? "bg-gray-800" : "bg-gray-100"
                      } ${theme.text}`}
                    >
                      {tech}
                    </span>
                  ))}
                  {project.technologies.length > 3 && (
                    <span
                      className={`px-3 py-1 rounded-lg text-xs ${theme.accent}`}
                    >
                      +{project.technologies.length - 3} more
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2 text-amber-500 font-semibold group-hover:gap-3 transition-all">
                  <MousePointer className="w-4 h-4" />
                  <span>Click to view details</span>
                  <ArrowUpRight className="w-4 h-4" />
                </div>
              </div>
            </div>
          ))}
      </div>

      {/* Other Projects Grid with Thumbnails */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {projects
          .filter((p) => !p.featured)
          .map((project, index) => (
            <div
              key={index}
              onMouseEnter={() => setHoveredProject(project.id)}
              onMouseLeave={() => setHoveredProject(null)}
              onClick={() => handleProjectClick(project)}
              className={`${theme.card} border rounded-xl overflow-hidden ${theme.cardHover} transition-all duration-300 hover:scale-105 group cursor-pointer`}
            >
              {/* Thumbnail */}
              <div className="relative h-48 overflow-hidden">
                <img
                  src={project.thumbnail}
                  alt={project.title}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent opacity-60 group-hover:opacity-80 transition-opacity duration-300"></div>

                {/* View Icon */}
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300">
                  <div className="p-3 rounded-full bg-gradient-to-br from-amber-500 to-orange-600 shadow-xl">
                    <Eye className="w-6 h-6 text-white" />
                  </div>
                </div>

                {/* Emoji */}
                <div className="absolute top-3 left-3 text-3xl">
                  {project.image}
                </div>
              </div>

              {/* Content */}
              <div className="p-4">
                <span
                  className={`text-xs font-semibold ${theme.accent} mb-2 block`}
                >
                  {project.category}
                </span>
                <h3
                  className={`text-lg font-bold ${theme.text} mb-2 group-hover:text-amber-500 transition-colors`}
                >
                  {project.title}
                </h3>
                <p className={`${theme.textMuted} text-sm mb-3 line-clamp-2`}>
                  {project.description}
                </p>
                <div className="flex items-center gap-2 text-amber-500 text-sm font-semibold group-hover:gap-3 transition-all">
                  <span>View Project</span>
                  <ArrowUpRight className="w-3 h-3" />
                </div>
              </div>
            </div>
          ))}
      </div>
    </section>
  );

  // About Page Content (keeping the rest unchanged)
  const AboutContent = () => (
    <section className="relative z-10 container mx-auto px-6 py-20">
      <div className="text-center mb-16">
        <h1 className={`text-4xl md:text-5xl font-bold mb-4`}>
          <span
            className="bg-gradient-to-r from-amber-300 via-yellow-200 to-orange-300 bg-clip-text text-transparent"
            style={{
              textShadow: isDark ? "0 0 40px rgba(251, 191, 36, 0.3)" : "none",
            }}
          >
            About Unicom Team
          </span>
        </h1>
        <p className={`text-xl ${theme.textMuted}`}>
          Your trusted partner in digital transformation
        </p>
      </div>

      {/* Company Story */}
      <div className={`${theme.card} border rounded-3xl p-8 md:p-12 mb-16`}>
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className={`text-3xl font-bold ${theme.text} mb-6`}>
              Our Story
            </h2>
            <p className={`${theme.textMuted} mb-4 leading-relaxed`}>
              Founded in 2016, Unicom Team began as a small group of passionate
              developers with a vision to create exceptional digital
              experiences. Over the years, we've grown into a full-service
              digital agency, serving clients across the globe.
            </p>
            <p className={`${theme.textMuted} mb-4 leading-relaxed`}>
              We believe in the power of technology to transform businesses and
              improve lives. Our team combines technical expertise with creative
              thinking to deliver solutions that not only meet but exceed
              expectations.
            </p>
            <p className={`${theme.textMuted} leading-relaxed`}>
              Today, with over 150 successful projects and a growing team of
              talented professionals, we continue to push boundaries and set new
              standards in digital innovation.
            </p>
          </div>
          <div className="flex justify-center">
            <div className="relative">
              <img
                src="/images/about.png"
                alt="Our team working together"
                className="w-full h-full object-cover rounded-full"
                width={800}
                height={50}
              />
              <div className="absolute inset-0 bg-gradient-to-br from-amber-500/20 to-orange-600/20 rounded-3xl blur-2xl"></div>
            </div>
          </div>
        </div>
      </div>

      {/* Founders/Owners Section */}
      <div className="mb-16">
        <h2 className={`text-3xl font-bold text-center mb-4 ${theme.text}`}>
          Meet Our Founders
        </h2>
        <p className={`text-center ${theme.textMuted} mb-12`}>
          The visionaries behind Unicom Team
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {teamOwners.map((owner, index) => (
            <div
              key={index}
              className={`${theme.card} border rounded-2xl p-6 ${theme.cardHover} transition-all duration-300 hover:scale-105 group`}
            >
              {/* Profile Image */}
              <div className="flex justify-center mb-4">
                <div className="relative">
                  <div className="w-32 h-32 rounded-2xl overflow-hidden group-hover:scale-110 transition-transform duration-300 shadow-lg">
                    <img
                      src={owner.image}
                      alt={owner.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-br from-amber-500/20 to-orange-600/20 rounded-2xl blur-xl"></div>
                </div>
              </div>

              {/* Name & Role */}
              <div className="text-center mb-4">
                <h3 className={`text-xl font-bold ${theme.text} mb-1`}>
                  {owner.name}
                </h3>
                <p className={`text-sm ${theme.accent} font-medium mb-2`}>
                  {owner.role}
                </p>
                <p className={`text-sm ${theme.textMuted} mb-3`}>{owner.bio}</p>
                <div
                  className={`inline-block px-3 py-1 rounded-lg text-xs ${
                    mounted && isDark ? "bg-gray-800" : "bg-amber-50"
                  } ${theme.text}`}
                >
                  {owner.expertise}
                </div>
              </div>

              {/* Social Links */}
              <div className="flex justify-center gap-3 pt-4 border-t border-amber-500/20">
                <a
                  href={owner.social.linkedin}
                  className={`p-2 rounded-lg ${
                    mounted && isDark ? "bg-gray-800" : "bg-gray-100"
                  } ${
                    theme.text
                  } hover:bg-gradient-to-br hover:from-amber-500 hover:to-orange-600 hover:text-white transition-all`}
                >
                  <Linkedin className="w-4 h-4" />
                </a>
                <a
                  href={owner.social.twitter}
                  className={`p-2 rounded-lg ${
                    mounted && isDark ? "bg-gray-800" : "bg-gray-100"
                  } ${
                    theme.text
                  } hover:bg-gradient-to-br hover:from-amber-500 hover:to-orange-600 hover:text-white transition-all`}
                >
                  <Twitter className="w-4 h-4" />
                </a>
                <a
                  href={owner.social.github}
                  className={`p-2 rounded-lg ${
                    mounted && isDark ? "bg-gray-800" : "bg-gray-100"
                  } ${
                    theme.text
                  } hover:bg-gradient-to-br hover:from-amber-500 hover:to-orange-600 hover:text-white transition-all`}
                >
                  <Github className="w-4 h-4" />
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Mission & Values */}
      <div className="grid md:grid-cols-3 gap-8 mb-16">
        <div className={`${theme.card} border rounded-2xl p-8 text-center`}>
          <div className="p-4 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 inline-block mb-4">
            <Target className="w-8 h-8 text-white" />
          </div>
          <h3 className={`text-xl font-bold ${theme.text} mb-3`}>
            Our Mission
          </h3>
          <p className={`${theme.textMuted}`}>
            To empower businesses with innovative digital solutions that drive
            growth and create lasting impact.
          </p>
        </div>

        <div className={`${theme.card} border rounded-2xl p-8 text-center`}>
          <div className="p-4 rounded-xl bg-gradient-to-br from-yellow-500 to-amber-500 inline-block mb-4">
            <Award className="w-8 h-8 text-white" />
          </div>
          <h3 className={`text-xl font-bold ${theme.text} mb-3`}>Our Vision</h3>
          <p className={`${theme.textMuted}`}>
            To be the global leader in creating transformative digital
            experiences that shape the future.
          </p>
        </div>

        <div className={`${theme.card} border rounded-2xl p-8 text-center`}>
          <div className="p-4 rounded-xl bg-gradient-to-br from-orange-500 to-amber-600 inline-block mb-4">
            <Users className="w-8 h-8 text-white" />
          </div>
          <h3 className={`text-xl font-bold ${theme.text} mb-3`}>Our Values</h3>
          <p className={`${theme.textMuted}`}>
            Innovation, integrity, collaboration, and excellence in everything
            we do.
          </p>
        </div>
      </div>

      {/* Team Stats */}
      <div className="mb-16">
        <h2 className={`text-3xl font-bold text-center mb-12 ${theme.text}`}>
          Our Achievements
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {teamStats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <div
                key={index}
                className={`p-6 rounded-xl ${theme.card} border ${theme.cardHover} transition-all duration-300 hover:scale-105`}
              >
                <div className="flex flex-col items-center text-center">
                  <div
                    className={`p-4 rounded-xl bg-gradient-to-br ${stat.gradient} mb-4`}
                  >
                    <Icon className="w-8 h-8 text-white" />
                  </div>
                  <h3 className={`text-4xl font-bold ${theme.text} mb-2`}>
                    {stat.value}
                  </h3>
                  <p className={`text-sm ${theme.textMuted} font-medium`}>
                    {stat.title}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Testimonials */}
      <div>
        <h2 className={`text-3xl font-bold text-center mb-12 ${theme.text}`}>
          What Our Clients Say
        </h2>
        <div className="max-w-4xl mx-auto">
          <div
            className={`${theme.card} border rounded-3xl p-8 md:p-12 ${theme.cardHover}`}
          >
            <Quote className="w-12 h-12 text-amber-500 mb-6" />
            <p className={`text-2xl ${theme.text} mb-8 leading-relaxed`}>
              "{testimonials[activeTestimonial].content}"
            </p>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="text-5xl">
                  {testimonials[activeTestimonial].image}
                </div>
                <div>
                  <h4 className={`font-semibold ${theme.text}`}>
                    {testimonials[activeTestimonial].name}
                  </h4>
                  <p className={`${theme.textMuted} text-sm`}>
                    {testimonials[activeTestimonial].role}
                  </p>
                </div>
              </div>
              <div className="flex gap-1">
                {[...Array(testimonials[activeTestimonial].rating)].map(
                  (_, i) => (
                    <Star
                      key={i}
                      className="w-5 h-5 text-amber-500 fill-amber-500"
                    />
                  ),
                )}
              </div>
            </div>
          </div>

          <div className="flex justify-center gap-3 mt-8">
            {testimonials.map((_, index) => (
              <button
                key={index}
                onClick={() => setActiveTestimonial(index)}
                className={`h-2 rounded-full transition-all duration-300 ${
                  index === activeTestimonial
                    ? "w-12 bg-gradient-to-r from-amber-500 to-orange-600"
                    : `w-2 ${
                        isDark
                          ? "bg-gray-600 hover:bg-gray-500"
                          : "bg-gray-400 hover:bg-gray-300"
                      }`
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );

  // Contact Page Content (unchanged)
  const ContactContent = () => (
    <section className="relative z-10 container mx-auto px-6 py-20">
      <div className="text-center mb-16">
        <h1 className={`text-4xl md:text-5xl font-bold mb-4`}>
          <span
            className="bg-gradient-to-r from-yellow-400 via-orange-400 to-amber-500 bg-clip-text text-transparent"
            style={{
              textShadow: isDark ? "0 0 40px rgba(234, 179, 8, 0.3)" : "none",
            }}
          >
            Get In Touch
          </span>
        </h1>
        <p className={`text-xl ${theme.textMuted}`}>
          Let's discuss your next project and bring your vision to life
        </p>
      </div>

      <div className="grid lg:grid-cols-2 gap-12 max-w-6xl mx-auto">
        {/* Contact Form */}
        <div className={`${theme.card} border rounded-2xl p-8`}>
          <h2 className={`text-2xl font-bold ${theme.text} mb-6`}>
            Send us a message
          </h2>
          <form className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label
                  className={`block ${theme.text} mb-2 text-sm font-medium`}
                >
                  First Name
                </label>
                <input
                  type="text"
                  className={`w-full px-4 py-3 rounded-lg ${colors.form.background} border ${theme.text} focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none transition`}
                  placeholder="John"
                />
              </div>
              <div>
                <label
                  className={`block ${theme.text} mb-2 text-sm font-medium`}
                >
                  Last Name
                </label>
                <input
                  type="text"
                  className={`w-full px-4 py-3 rounded-lg ${colors.form.background} border ${theme.text} focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none transition`}
                  placeholder="Doe"
                />
              </div>
            </div>

            <div>
              <label className={`block ${theme.text} mb-2 text-sm font-medium`}>
                Email
              </label>
              <input
                type="email"
                className={`w-full px-4 py-3 rounded-lg ${colors.form.background} border ${theme.text} focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none transition`}
                placeholder="john@example.com"
              />
            </div>

            <div>
              <label className={`block ${theme.text} mb-2 text-sm font-medium`}>
                Project Type
              </label>
              <select
                className={`w-full px-4 py-3 rounded-lg ${colors.form.background} border ${theme.text} focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none transition`}
              >
                <option>Web Development</option>
                <option>Mobile App Development</option>
                <option>UI/UX Design</option>
                <option>Custom Solution</option>
                <option>Other</option>
              </select>
            </div>

            <div>
              <label className={`block ${theme.text} mb-2 text-sm font-medium`}>
                Message
              </label>
              <textarea
                rows={5}
                className={`w-full px-4 py-3 rounded-lg ${colors.form.background} border ${theme.text} focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none transition resize-none`}
                placeholder="Tell us about your project..."
              />
            </div>

            <button
              type="submit"
              className={`w-full px-8 py-4 rounded-lg bg-gradient-to-r ${theme.button} text-white font-semibold text-lg shadow-xl shadow-amber-500/30 transform transition-all duration-300 hover:scale-105 hover:shadow-amber-500/50 flex items-center justify-center gap-2`}
            >
              Send Message
              <Send className="w-5 h-5" />
            </button>
          </form>
        </div>

        {/* Contact Information */}
        <div className="space-y-6">
          <div className={`${theme.card} border rounded-2xl p-8`}>
            <h3 className={`text-xl font-bold ${theme.text} mb-6`}>
              Contact Information
            </h3>

            <div className="space-y-4">
              <div className="flex items-start gap-4">
                <div className="p-3 rounded-lg bg-gradient-to-br from-amber-500 to-orange-600">
                  <Mail className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className={`font-medium ${theme.text}`}>Email</p>
                  <p className={`${theme.textMuted}`}>contact@unicomteam.com</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="p-3 rounded-lg bg-gradient-to-br from-amber-500 to-orange-600">
                  <Phone className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className={`font-medium ${theme.text}`}>Phone</p>
                  <p className={`${theme.textMuted}`}>+237 (681) 529-488</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="p-3 rounded-lg bg-gradient-to-br from-amber-500 to-orange-600">
                  <MapPin className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className={`font-medium ${theme.text}`}>Office</p>
                  <p className={`${theme.textMuted}`}>
                    Chapelle, Balas Obili, Yaounde
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="p-3 rounded-lg bg-gradient-to-br from-amber-500 to-orange-600">
                  <Clock className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className={`font-medium ${theme.text}`}>Business Hours</p>
                  <p className={`${theme.textMuted}`}>
                    Monday - Friday: 9:00 AM - 6:00 PM
                  </p>
                  <p className={`${theme.textMuted}`}>
                    Saturday - Sunday: Closed
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className={`${theme.card} border rounded-2xl p-8`}>
            <h3 className={`text-2xl font-bold ${theme.text} mb-4`}>
              Let's Start Your Project
            </h3>
            <p className={`${theme.textMuted} mb-6`}>
              Ready to transform your ideas into reality? We're here to help you
              every step of the way.
            </p>
            <ul className="space-y-3">
              <li className="flex items-center gap-3">
                <CheckCircle className="w-5 h-5 text-amber-500 flex-shrink-0" />
                <span className={`${theme.textSecondary}`}>
                  Free consultation
                </span>
              </li>
              <li className="flex items-center gap-3">
                <CheckCircle className="w-5 h-5 text-amber-500 flex-shrink-0" />
                <span className={`${theme.textSecondary}`}>
                  Quick response within 24 hours
                </span>
              </li>
              <li className="flex items-center gap-3">
                <CheckCircle className="w-5 h-5 text-amber-500 flex-shrink-0" />
                <span className={`${theme.textSecondary}`}>
                  Detailed project proposal
                </span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </section>
  );

  return (
    <div
      className={`min-h-screen bg-gradient-to-br ${theme.bg} relative overflow-hidden`}
    >
      {/* Animated Background Orbs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-96 h-96 bg-gradient-to-br from-amber-500/20 to-orange-500/20 rounded-full blur-3xl animate-pulse"></div>
        <div
          className="absolute bottom-20 right-10 w-96 h-96 bg-gradient-to-br from-yellow-500/20 to-amber-500/20 rounded-full blur-3xl animate-pulse"
          style={{ animationDelay: "1s" }}
        ></div>
        <div
          className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-br from-orange-500/15 to-yellow-500/15 rounded-full blur-3xl animate-pulse"
          style={{ animationDelay: "2s" }}
        ></div>
      </div>

      {/* Header/Navigation */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-opacity-95 w-full">
        <nav
          className={`${theme.card} border-b backdrop-blur-xl shadow-lg w-full transition-shadow duration-200`}
        >
          <div className="container mx-auto px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button
                onClick={() => handleTabChange("home")}
                className="flex items-center gap-3"
              >
                <div>
                  <Image
                    src="/images/logo.png"
                    alt="this is the logo"
                    width={40}
                    height={50}
                  />{" "}
                </div>
                <span className={`text-2xl font-bold ${theme.text}`}>
                  Unicom Team
                </span>
              </button>
            </div>

            {/* Desktop Menu */}
            <div className="hidden md:flex items-center gap-8">
              {navigationTabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => handleTabChange(tab.id)}
                  className={`${
                    activeTab === tab.id ? theme.accent : theme.text
                  } font-medium hover:${theme.accent} transition-all ${
                    activeTab === tab.id ? "underline underline-offset-4" : ""
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-4">
              <button
                onClick={toggleTheme}
                className={`p-2 rounded-lg ${theme.card} border transition-all duration-300 hover:scale-110`}
              >
                {isDark ? "🌞" : "🌙"}
              </button>
              <button
                onClick={() => setMenuOpen(!menuOpen)}
                className="md:hidden p-2"
              >
                {menuOpen ? (
                  <X className={theme.text} />
                ) : (
                  <Menu className={theme.text} />
                )}
              </button>
            </div>
          </div>

          {/* Mobile Menu */}
          {menuOpen && (
            <div className="md:hidden border-t">
              <div className="container mx-auto px-6 py-4 space-y-4">
                {navigationTabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => handleTabChange(tab.id)}
                    className={`block w-full text-left ${
                      activeTab === tab.id ? theme.accent : theme.text
                    } font-medium`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>
          )}
        </nav>
      </header>

      {/* spacer to prevent content being hidden behind fixed header */}
      <div aria-hidden="true" className="h-20" />

      {/* Main Content */}
      <main>{renderContent()}</main>

      {/* Footer */}
      <footer
        className={`relative z-10 ${theme.card} border-t backdrop-blur-xl mt-20`}
      >
        <div className="container mx-auto px-6 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div>
                  <Image
                    src="/images/logo.png"
                    alt="this is the logo"
                    width={40}
                    height={50}
                  />
                </div>
                <span className={`text-xl font-bold ${theme.text}`}>
                  Unicom Team
                </span>
              </div>
              <p className={`${theme.textMuted}`}>
                Creating digital excellence since 2016
              </p>
            </div>
            <div>
              <h4 className={`font-semibold ${theme.text} mb-4`}>
                Quick Links
              </h4>
              <ul className={`space-y-2 ${theme.textMuted}`}>
                {navigationTabs.map((tab) => (
                  <li key={tab.id}>
                    <button
                      onClick={() => handleTabChange(tab.id)}
                      className={`hover:${theme.accent} transition-colors`}
                    >
                      {tab.label}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className={`font-semibold ${theme.text} mb-4`}>Services</h4>
              <ul className={`space-y-2 ${theme.textMuted}`}>
                <li>Web Development</li>
                <li>Mobile Apps</li>
                <li>UI/UX Design</li>
                <li>Custom Solutions</li>
              </ul>
            </div>
            <div>
              <h4 className={`font-semibold ${theme.text} mb-4`}>Connect</h4>
              <ul className={`space-y-2 ${theme.textMuted}`}>
                <li>Twitter</li>
                <li>LinkedIn</li>
                <li>GitHub</li>
                <li>Dribbble</li>
              </ul>
            </div>
          </div>
          <div
            className={`pt-8 border-t ${
              isDark ? "border-amber-500/20" : "border-amber-300/60"
            } text-center ${theme.textMuted}`}
          >
            <p>
              © {new Date().getFullYear()} Unicom Team. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

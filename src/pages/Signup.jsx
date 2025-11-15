import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import apiService from "../services/api";

export default function Signup() {
  const navigate = useNavigate();
  const location = useLocation();
  const { signup } = useAuth();
  
  // Get the intended destination from location state
  const from = location.state?.from?.pathname || "/";

  // Form state
  const [selectedProfession, setSelectedProfession] = useState("");
  const [formData, setFormData] = useState({
    name: "",
    mobile: "",
    email: "",
    password: "",
    confirmPassword: "",
    // Student fields
    uni_name: "",
    uni_mail: "",
    graduation_year: "",
    // Lawyer fields
    lawyer_email: "",
    bar_id: "",
    city: "",
    // Corporate fields
    company_name: "",
    company_email: "",
    registered_id: "",
    company_size: "",
    // Other fields
    other_email: "",
    profession_type: "",
  });

  // UI state
  const [otpSent, setOtpSent] = useState(false);
  const [otpVerified, setOtpVerified] = useState(false);
  const [otpTimer, setOtpTimer] = useState(0);
  const [expectedOtp, setExpectedOtp] = useState("");
  const [enteredOtp, setEnteredOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [fieldErrors, setFieldErrors] = useState({
    name: "",
    email: "",
    mobile: "",
    password: "",
    confirmPassword: ""
  });
  const [phoneVerificationStep, setPhoneVerificationStep] = useState(false);
  const [verificationCode, setVerificationCode] = useState("");
  const [phoneVerified, setPhoneVerified] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  // Static data
  const months = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];
  const years = Array.from({ length: 50 }, (_, i) => new Date().getFullYear() - i);
  const cities = [
    "Mumbai", "Delhi", "Bangalore", "Chennai", "Kolkata", "Hyderabad",
    "Pune", "Ahmedabad", "Jaipur", "Surat", "Lucknow", "Kanpur", "Other"
  ];
  const colleges = [
    "National Law School of India University, Bangalore",
    "National Academy of Legal Studies and Research, Hyderabad",
    "West Bengal National University of Juridical Sciences, Kolkata",
    "National Law Institute University, Bhopal",
    "Gujarat National Law University, Gandhinagar",
    "Rajiv Gandhi National University of Law, Patiala",
    "Other"
  ];
  const companySizes = ["1-5", "6-20", "21-50", "51-200", "200+"];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Clear field-specific error when user types
    if (fieldErrors[name]) {
      setFieldErrors(prev => ({
        ...prev,
        [name]: ""
      }));
    }
    if (error) setError("");
  };

  const handleProfessionSelect = (profession) => {
    setIsAnimating(true);
    setTimeout(() => {
      setSelectedProfession(profession);
      setIsAnimating(false);
    }, 150);
  };

  const sendOTP = async () => {
    if (!formData.mobile.trim()) {
      setError("Please enter your phone number first");
      return;
    }

    setLoading(true);
    setError("");
    setMessage("Sending OTP...");

    try {
      const data = await apiService.sendVerificationCode(formData.mobile);
      setOtpSent(true);
      setOtpTimer(60);
      setMessage(`OTP sent successfully to ${apiService.formatPhoneNumber(formData.mobile)}!`);
    } catch (err) {
      setError(err.message || "Failed to send OTP. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const verifyOTP = async (otpValue) => {
    setEnteredOtp(otpValue);
    
    if (otpValue.length === 6) {
      try {
        const data = await apiService.verifyPhone(formData.mobile, otpValue);
        if (data.verified) {
          setOtpVerified(true);
          setMessage("Phone verified successfully!");
        } else {
          setError("Invalid OTP. Please try again.");
        }
      } catch (err) {
        setError(err.message || "Invalid OTP. Please try again.");
      }
    }
  };

  const resendOTP = () => {
    if (otpTimer === 0) {
      sendOTP();
    }
  };

  const validateForm = () => {
    const errors = {
      name: "",
      email: "",
      mobile: "",
      password: "",
      confirmPassword: ""
    };

    if (!formData.name.trim()) {
      errors.name = "Name is required";
    }
    
    if (!formData.email.trim()) {
      errors.email = "Email is required";
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email)) {
        errors.email = "Please enter a valid email address";
      }
    }
    
    if (!formData.mobile.trim()) {
      errors.mobile = "Phone number is required";
    }
    
    if (!otpVerified) {
      errors.mobile = "Please verify your phone number";
    }
    
    if (!formData.password.trim()) {
      errors.password = "Password is required";
    } else if (formData.password.length < 8) {
      errors.password = "Password must be at least 8 characters long";
    }
    
    if (!formData.confirmPassword.trim()) {
      errors.confirmPassword = "Please confirm your password";
    } else if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = "Passwords do not match";
    }

    setFieldErrors(errors);
    
    // Check if there are any errors
    const hasErrors = Object.values(errors).some(err => err !== "");
    if (hasErrors) {
      return false;
    }

    // Profession-specific validation
    if (selectedProfession === "Student") {
      if (!formData.uni_name.trim()) {
        setError("University name is required");
        return false;
      }
      if (!formData.graduation_year.trim()) {
        setError("Graduation year is required");
        return false;
      }
    } else if (selectedProfession === "Lawyer") {
      if (!formData.bar_id.trim()) {
        setError("Bar ID is required");
        return false;
      }
      if (!formData.city.trim()) {
        setError("City is required");
        return false;
      }
    } else if (selectedProfession === "Law Firm") {
      if (!formData.company_name.trim()) {
        setError("Company name is required");
        return false;
      }
      if (!formData.registered_id.trim()) {
        setError("Registration ID is required");
        return false;
      }
      if (!formData.company_size.trim()) {
        setError("Company size is required");
        return false;
      }
    } else if (selectedProfession === "Other") {
      if (!formData.profession_type.trim()) {
        setError("Profession type is required");
        return false;
      }
    }

    return true;
  };

  // Phone verification functions
  const sendVerificationCode = async () => {
    try {
      setLoading(true);
      setError("");
      await apiService.sendVerificationCode(formData.mobile);
      setPhoneVerificationStep(true);
      setMessage("Verification code sent to your phone number");
    } catch (err) {
      setError(err.message || "Failed to send verification code");
    } finally {
      setLoading(false);
    }
  };

  const verifyPhoneNumber = async () => {
    try {
      setLoading(true);
      setError("");
      await apiService.verifyPhone(formData.mobile, verificationCode);
      setPhoneVerified(true);
      setMessage("Phone number verified successfully!");
      setPhoneVerificationStep(false);
    } catch (err) {
      setError(err.message || "Invalid verification code");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setError("");
    setFieldErrors({ name: "", email: "", mobile: "", password: "", confirmPassword: "" });
    setMessage("Creating your account...");

    try {
      // Map profession to user_type according to API documentation
      const userTypeMap = {
        "Student": 1,
        "Lawyer": 2,
        "Law Firm": 3, // This maps to Corporate (user_type: 3)
        "Other": 4
      };

      // Prepare API payload based on user type
      let apiPayload = {
        email: formData.email,
        password: formData.password,
        user_type: userTypeMap[selectedProfession],
        name: formData.name,
        mobile: formData.mobile
      };

      // Add profession-specific fields according to API documentation
      if (selectedProfession === "Student") {
        apiPayload = {
          ...apiPayload,
          uni_name: formData.uni_name,
          uni_mail: formData.uni_mail || formData.email, // Use university email if provided, fallback to main email
          graduation_year: parseInt(formData.graduation_year)
        };
      } else if (selectedProfession === "Lawyer") {
        apiPayload = {
          ...apiPayload,
          lawyer_email: formData.lawyer_email || formData.email, // Use lawyer email if provided, fallback to main email
          bar_id: formData.bar_id,
          city: formData.city
        };
      } else if (selectedProfession === "Law Firm") {
        apiPayload = {
          ...apiPayload,
          company_name: formData.company_name,
          company_email: formData.company_email || formData.email, // Use company email if provided, fallback to main email
          registered_id: formData.registered_id,
          company_size: parseInt(formData.company_size),
          city: formData.city
        };
      } else if (selectedProfession === "Other") {
        apiPayload = {
          ...apiPayload,
          other_email: formData.other_email || formData.email, // Use other email if provided, fallback to main email
          profession_type: formData.profession_type
        };
      }

      const data = await apiService.signup(apiPayload);
      
      // Store user data in auth context with proper field mapping
      const userData = {
        name: formData.name,
        email: formData.email,
        phone: formData.mobile, // Map mobile to phone for profile page
        profession: selectedProfession,
        user_type: userTypeMap[selectedProfession],
        // Map profession-specific fields
        college: formData.uni_name || "",
        collegeOther: formData.uni_name === "Other" ? formData.uni_name : "",
        passingYear: formData.graduation_year || "",
        barCouncilId: formData.bar_id || "",
        city: formData.city || "",
        cityOther: formData.city === "Other" ? formData.city : "",
        registrationNo: formData.registered_id || "",
        companySize: formData.company_size || "",
        designation: formData.profession_type || "",
        // Keep original form data for reference
        ...formData
      };
      
      // Enhanced signup with token management
      const tokens = {
        access_token: data.access_token,
        refresh_token: data.refresh_token
      };
      await signup(userData, tokens);
      
      setMessage("Account created successfully! Redirecting...");
      setTimeout(() => {
        navigate(from, { replace: true });
      }, 2000);
    } catch (err) {
      setError(err.message || "Failed to create account. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // OTP Timer
  useEffect(() => {
    let interval = null;
    if (otpTimer > 0) {
      interval = setInterval(() => {
        setOtpTimer(timer => timer - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [otpTimer]);


  return (
    <>
      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-20px) rotate(180deg); }
        }
        @keyframes pulse {
          0%, 100% { opacity: 0.05; }
          50% { opacity: 0.1; }
        }
        @keyframes shimmer {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }
        .animate-float {
          animation: float 6s ease-in-out infinite;
        }
        .animate-pulse-slow {
          animation: pulse 4s ease-in-out infinite;
        }
        .animate-shimmer {
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent);
          background-size: 200% 100%;
          animation: shimmer 2s infinite;
        }
        .animation-delay-1000 {
          animation-delay: 1s;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-3000 {
          animation-delay: 3s;
        }
        .opacity-3 {
          opacity: 0.03;
        }
        .opacity-5 {
          opacity: 0.05;
        }
        .glass-effect {
          backdrop-filter: blur(10px);
          background: rgba(255, 255, 255, 0.1);
          border: 1px solid rgba(255, 255, 255, 0.2);
        }
        .hover-lift {
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .hover-lift:hover {
          transform: translateY(-2px);
          box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
        }
      `}</style>
      <div className="min-h-screen relative overflow-hidden" style={{ backgroundColor: '#F9FAFC' }}>
        {/* Background Elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 left-20 w-32 h-32 rounded-full opacity-5 animate-float" style={{ backgroundColor: '#1E65AD' }}></div>
          <div className="absolute top-40 right-32 w-24 h-24 rounded-full opacity-5 animate-float animation-delay-1000" style={{ backgroundColor: '#CF9B63' }}></div>
          <div className="absolute bottom-32 left-40 w-40 h-40 rounded-full opacity-5 animate-float animation-delay-2000" style={{ backgroundColor: '#8C969F' }}></div>
          <div className="absolute bottom-20 right-20 w-28 h-28 rounded-full opacity-5 animate-float animation-delay-3000" style={{ backgroundColor: '#1E65AD' }}></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full opacity-3 animate-pulse-slow" style={{ backgroundColor: '#CF9B63' }}></div>
          <div className="absolute top-1/4 right-1/4 w-16 h-16 rounded-full opacity-4 animate-float animation-delay-1000" style={{ backgroundColor: '#1E65AD' }}></div>
          <div className="absolute bottom-1/4 left-1/4 w-20 h-20 rounded-full opacity-4 animate-float animation-delay-2000" style={{ backgroundColor: '#8C969F' }}></div>
        </div>

        <div className="flex items-center justify-center p-4 sm:p-6 lg:p-8 relative z-10 min-h-screen">

      <div className="max-w-6xl w-full relative z-10">
        <div className="bg-white rounded-2xl sm:rounded-3xl shadow-2xl overflow-hidden border border-gray-100 hover-lift">
          <div className="lg:flex min-h-[500px] sm:min-h-[600px]">
            {/* Left Panel - Branding */}
            <div className="lg:w-1/2 p-6 sm:p-8 lg:p-12 flex flex-col justify-center items-center text-white relative overflow-hidden" style={{ background: `linear-gradient(135deg, #1E65AD 0%, #CF9B63 100%)` }}>
              {/* Background Pattern */}
              <div className="absolute inset-0 opacity-10">
                <div className="absolute top-4 left-4 w-8 h-8 border-2 border-white rounded-full"></div>
                <div className="absolute top-8 right-8 w-6 h-6 border-2 border-white rounded-full"></div>
                <div className="absolute bottom-8 left-8 w-4 h-4 border-2 border-white rounded-full"></div>
                <div className="absolute bottom-4 right-4 w-10 h-10 border-2 border-white rounded-full"></div>
              </div>
              
              <div className="text-center relative z-10">
                <div className="mb-6 sm:mb-8">
                  <div className="w-20 h-20 sm:w-24 sm:h-24 lg:w-28 lg:h-28 bg-gradient-to-br from-white/30 to-white/10 backdrop-blur-sm rounded-full flex items-center justify-center text-3xl font-bold shadow-2xl border-4 border-white/20 mx-auto animate-shimmer">
                    ⚖️
                  </div>
                </div>
                <h1 className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-bold mb-4 sm:mb-6 text-white" style={{ fontFamily: 'Helvetica Hebrew Bold, sans-serif' }}>
                  Welcome to सलहाकार
                </h1>
                <p className="text-blue-100 mb-6 sm:mb-8 text-sm sm:text-base lg:text-lg leading-relaxed max-w-md mx-auto px-4" style={{ fontFamily: 'Roboto, sans-serif' }}>
                  Join thousands of legal professionals and students exploring comprehensive legal tools in one place.
                </p>
                <div className="space-y-2 sm:space-y-3 w-full max-w-xs">
                  <button
                    className="w-full bg-white/20 backdrop-blur-sm text-white py-2 sm:py-3 px-4 sm:px-6 rounded-lg sm:rounded-xl font-semibold hover:bg-white/30 transition-all duration-300 transform hover:scale-105 border border-white/30 text-sm sm:text-base"
                    onClick={() => navigate("/login")}
                    style={{ fontFamily: 'Roboto, sans-serif', minHeight: '44px' }}
                  >
                    Already have an account? Sign In
                  </button>
                  <button
                    className="w-full bg-transparent border-2 border-white/50 text-white py-2 sm:py-3 px-4 sm:px-6 rounded-lg sm:rounded-xl font-semibold hover:bg-white/10 transition-all duration-300 transform hover:scale-105 text-sm sm:text-base"
                    onClick={() => navigate("/")}
                    style={{ fontFamily: 'Roboto, sans-serif', minHeight: '44px' }}
                  >
                    ← Back to Home
                  </button>
                </div>
              </div>
            </div>

            {/* Right Panel - Signup Form */}
            <div className="lg:w-1/2 p-6 sm:p-8 lg:p-12">
              <div className="max-w-lg mx-auto">
                <div className="text-center mb-6 sm:mb-8">
                  <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-2 sm:mb-3" style={{ color: '#1E65AD', fontFamily: 'Helvetica Hebrew Bold, sans-serif' }}>
                    Create Account
                  </h2>
                  <p className="text-sm sm:text-base lg:text-lg" style={{ color: '#8C969F', fontFamily: 'Roboto, sans-serif' }}>Join our legal community today</p>
                  <div className="w-16 sm:w-20 h-1 mx-auto mt-3 sm:mt-4 rounded-full" style={{ backgroundColor: '#CF9B63' }}></div>
                </div>

                {message && (
                  <div className="bg-green-50 border-l-4 border-green-400 text-green-700 px-3 sm:px-4 py-2 sm:py-3 rounded-lg mb-4 sm:mb-6">
                    <div className="flex items-center">
                      <svg className="w-4 h-4 sm:w-5 sm:h-5 text-green-400 mr-2 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      <span className="text-sm sm:text-base" style={{ fontFamily: 'Roboto, sans-serif' }}>{message}</span>
                    </div>
                  </div>
                )}
                
                {/* General error message (for API errors and profession-specific validation) */}
                {error && !fieldErrors.name && !fieldErrors.email && !fieldErrors.mobile && !fieldErrors.password && !fieldErrors.confirmPassword && (
                  <div className="bg-red-50 border-l-4 border-red-400 text-red-700 px-3 sm:px-4 py-2 sm:py-3 rounded-lg mb-4 sm:mb-6">
                    <div className="flex items-center">
                      <svg className="w-4 h-4 sm:w-5 sm:h-5 text-red-400 mr-2 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                      </svg>
                      <span className="text-sm sm:text-base" style={{ fontFamily: 'Roboto, sans-serif' }}>{error}</span>
                    </div>
                  </div>
                )}

                {/* Profession Selection */}
                {!selectedProfession ? (
                  <div className="mb-6 sm:mb-8">
                    <h3 className="text-lg sm:text-xl font-bold mb-4 sm:mb-6 text-center" style={{ color: '#1E65AD', fontFamily: 'Helvetica Hebrew Bold, sans-serif' }}>
                      Choose your profession
                    </h3>
                    <div className="grid grid-cols-2 gap-3 sm:gap-4">
                      {[
                        { name: "Student", icon: "🎓", primaryColor: "#1E65AD", secondaryColor: "#CF9B63" },
                        { name: "Lawyer", icon: "⚖️", primaryColor: "#CF9B63", secondaryColor: "#1E65AD" },
                        { name: "Law Firm", icon: "🏢", primaryColor: "#8C969F", secondaryColor: "#1E65AD" },
                        { name: "Other", icon: "👤", primaryColor: "#1E65AD", secondaryColor: "#8C969F" }
                      ].map((profession, index) => (
                        <button
                          key={profession.name}
                          type="button"
                          onClick={() => handleProfessionSelect(profession.name)}
                          className="group relative p-4 sm:p-6 border-2 border-gray-200 rounded-xl sm:rounded-2xl hover:border-transparent transition-all duration-300 text-center transform hover:scale-105 hover:shadow-lg overflow-hidden"
                          style={{ 
                            animationDelay: `${index * 100}ms`,
                            background: `linear-gradient(135deg, ${profession.primaryColor} 0%, ${profession.secondaryColor} 100%)`,
                            minHeight: '44px'
                          }}
                        >
                          <div className="absolute inset-0 bg-white rounded-xl sm:rounded-2xl group-hover:opacity-0 transition-opacity duration-300"></div>
                          <div className="relative z-10">
                            <div className="text-2xl sm:text-3xl mb-2 sm:mb-3 group-hover:scale-110 transition-transform duration-300">
                              {profession.icon}
                            </div>
                            <div className="font-semibold text-gray-700 group-hover:text-white transition-colors duration-300 text-sm sm:text-base" style={{ fontFamily: 'Roboto, sans-serif' }}>
                              {profession.name}
                            </div>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
                    {/* Back to profession selection */}
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 sm:mb-6 space-y-2 sm:space-y-0">
                      <button
                        type="button"
                        onClick={() => setSelectedProfession("")}
                        className="text-xs sm:text-sm flex items-center font-medium transition-colors duration-200 self-start"
                        style={{ color: '#1E65AD', fontFamily: 'Roboto, sans-serif' }}
                      >
                        <svg className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                        Back to profession selection
                      </button>
                      <span className="text-xs sm:text-sm text-white px-3 sm:px-4 py-1 sm:py-2 rounded-full font-semibold self-start sm:self-auto" style={{ backgroundColor: '#1E65AD', fontFamily: 'Roboto, sans-serif' }}>
                        {selectedProfession}
                      </span>
                    </div>

                    {/* Common Fields */}
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-semibold mb-2" style={{ color: '#1E65AD', fontFamily: 'Roboto, sans-serif' }}>
                          Full Name *
                        </label>
              <input
                type="text"
                          name="name"
                          value={formData.name}
                onChange={handleChange}
                          className={`w-full px-3 sm:px-4 py-2 sm:py-3 border-2 rounded-lg sm:rounded-xl focus:ring-2 focus:border-transparent transition-all duration-200 bg-gray-50 focus:bg-white text-sm sm:text-base ${fieldErrors.name ? 'border-red-400' : 'border-gray-200'}`}
                          style={{ fontFamily: 'Roboto, sans-serif', '--tw-ring-color': '#1E65AD', minHeight: '44px' }}
                          placeholder="Enter your full name"
                required
              />
              {fieldErrors.name && (
                <p className="mt-1 text-sm text-red-600" style={{ fontFamily: 'Roboto, sans-serif' }}>
                  {fieldErrors.name}
                </p>
              )}
            </div>

                      <div>
                        <label className="block text-sm font-semibold mb-2" style={{ color: '#1E65AD', fontFamily: 'Roboto, sans-serif' }}>
                          Email Address *
                        </label>
                        <input
                          type="email"
                          name="email"
                          value={formData.email}
                          onChange={handleChange}
                          className={`w-full px-3 sm:px-4 py-2 sm:py-3 border-2 rounded-lg sm:rounded-xl focus:ring-2 focus:border-transparent transition-all duration-200 bg-gray-50 focus:bg-white text-sm sm:text-base ${fieldErrors.email ? 'border-red-400' : 'border-gray-200'}`}
                          style={{ fontFamily: 'Roboto, sans-serif', '--tw-ring-color': '#1E65AD', minHeight: '44px' }}
                          placeholder="Enter your email address"
                          required
                        />
                        {fieldErrors.email && (
                          <p className="mt-1 text-sm text-red-600" style={{ fontFamily: 'Roboto, sans-serif' }}>
                            {fieldErrors.email}
                          </p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-semibold mb-2" style={{ color: '#1E65AD', fontFamily: 'Roboto, sans-serif' }}>
                          Phone Number *
                        </label>
                        <div className="space-y-2">
                          <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                            <input
                              type="tel"
                              name="mobile"
                              value={formData.mobile}
                              onChange={handleChange}
                              className={`flex-1 px-3 sm:px-4 py-2 sm:py-3 border-2 rounded-lg sm:rounded-xl focus:ring-2 focus:border-transparent transition-all duration-200 bg-gray-50 focus:bg-white text-sm sm:text-base ${fieldErrors.mobile ? 'border-red-400' : 'border-gray-200'}`}
                              style={{ fontFamily: 'Roboto, sans-serif', '--tw-ring-color': '#1E65AD', minHeight: '44px' }}
                              placeholder="Enter phone number (e.g., 9313507346)"
                              required
                            />
                          {!otpSent ? (
              <button
                type="button"
                onClick={sendOTP}
                disabled={loading}
                              className="px-4 sm:px-6 py-2 sm:py-3 rounded-lg sm:rounded-xl font-semibold text-white transition-all duration-200 hover:opacity-90 text-sm sm:text-base whitespace-nowrap"
                              style={{ backgroundColor: '#1E65AD', fontFamily: 'Roboto, sans-serif', minHeight: '44px' }}
                            >
                              {loading ? "Sending..." : "Send OTP"}
                            </button>
                          ) : (
                            <div className="px-4 sm:px-6 py-2 sm:py-3 rounded-lg sm:rounded-xl text-sm font-medium whitespace-nowrap" style={{ backgroundColor: '#CF9B63', color: 'white', fontFamily: 'Roboto, sans-serif', minHeight: '44px' }}>
                              OTP Sent
                            </div>
                          )}
                        </div>
                        {otpSent && !otpVerified && (
                          <div className="mt-3">
                            <input
                              type="text"
                              placeholder="Enter 6-digit OTP"
                              maxLength="6"
                              value={enteredOtp}
                              onChange={(e) => verifyOTP(e.target.value)}
                              className="w-full px-3 sm:px-4 py-2 sm:py-3 border-2 border-gray-200 rounded-lg sm:rounded-xl focus:ring-2 focus:border-transparent transition-all duration-200 bg-gray-50 focus:bg-white text-sm sm:text-base"
                              style={{ fontFamily: 'Roboto, sans-serif', '--tw-ring-color': '#1E65AD', minHeight: '44px' }}
                            />
                            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mt-2 space-y-1 sm:space-y-0">
                              <span className="text-xs sm:text-sm" style={{ color: '#8C969F', fontFamily: 'Roboto, sans-serif' }}>
                                {otpTimer > 0 ? `Resend in ${otpTimer}s` : "OTP expired"}
                              </span>
                              {otpTimer === 0 && (
                                <button
                                  type="button"
                                  onClick={resendOTP}
                                  className="text-xs sm:text-sm font-medium hover:underline self-start sm:self-auto"
                                  style={{ color: '#1E65AD', fontFamily: 'Roboto, sans-serif' }}
                                >
                                  Resend OTP
              </button>
                              )}
                            </div>
                          </div>
                        )}
                          </div>
                          {fieldErrors.mobile && (
                            <p className="mt-1 text-sm text-red-600" style={{ fontFamily: 'Roboto, sans-serif' }}>
                              {fieldErrors.mobile}
                            </p>
                          )}
                          <p className="text-xs text-gray-500 mt-2" style={{ fontFamily: 'Roboto, sans-serif' }}>
                            Enter your 10-digit mobile number. We'll automatically add the +91 country code for India.
                          </p>
                        </div>
                      </div>

                      {/* Profession-specific fields */}
                      {selectedProfession === "Student" && (
                        <>
                          <div>
                            <label className="block text-sm font-semibold mb-2" style={{ color: '#1E65AD', fontFamily: 'Roboto, sans-serif' }}>
                              University *
                            </label>
                            <select
                              name="uni_name"
                              value={formData.uni_name}
                              onChange={handleChange}
                              className="w-full px-3 sm:px-4 py-2 sm:py-3 border-2 border-gray-200 rounded-lg sm:rounded-xl focus:ring-2 focus:border-transparent transition-all duration-200 bg-gray-50 focus:bg-white text-sm sm:text-base"
                              style={{ fontFamily: 'Roboto, sans-serif', '--tw-ring-color': '#1E65AD', minHeight: '44px' }}
                              required
                            >
                              <option value="">Select college</option>
                              {colleges.map(college => (
                                <option key={college} value={college}>{college}</option>
                              ))}
                            </select>
                            {formData.college === "Other" && (
                              <input
                                type="text"
                                name="collegeOther"
                                value={formData.collegeOther}
                                onChange={handleChange}
                                className="w-full px-3 sm:px-4 py-2 sm:py-3 border-2 border-gray-200 rounded-lg sm:rounded-xl focus:ring-2 focus:border-transparent transition-all duration-200 bg-gray-50 focus:bg-white mt-2 text-sm sm:text-base"
                                style={{ fontFamily: 'Roboto, sans-serif', '--tw-ring-color': '#1E65AD', minHeight: '44px' }}
                                placeholder="Enter college name"
                                required
                              />
                            )}
                          </div>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                            <div>
                              <label className="block text-sm font-semibold mb-2" style={{ color: '#1E65AD', fontFamily: 'Roboto, sans-serif' }}>
                                Passing Month *
                              </label>
                              <select
                                name="passingMonth"
                                value={formData.passingMonth}
                                onChange={handleChange}
                                className="w-full px-3 sm:px-4 py-2 sm:py-3 border-2 border-gray-200 rounded-lg sm:rounded-xl focus:ring-2 focus:border-transparent transition-all duration-200 bg-gray-50 focus:bg-white text-sm sm:text-base"
                                style={{ fontFamily: 'Roboto, sans-serif', '--tw-ring-color': '#1E65AD', minHeight: '44px' }}
                                required
                              >
                                <option value="">Select month</option>
                                {months.map(month => (
                                  <option key={month} value={month}>{month}</option>
                                ))}
                              </select>
                            </div>
                            <div>
                              <label className="block text-sm font-semibold mb-2" style={{ color: '#1E65AD', fontFamily: 'Roboto, sans-serif' }}>
                                Graduation Year *
                              </label>
                              <select
                                name="graduation_year"
                                value={formData.graduation_year}
                                onChange={handleChange}
                                className="w-full px-3 sm:px-4 py-2 sm:py-3 border-2 border-gray-200 rounded-lg sm:rounded-xl focus:ring-2 focus:border-transparent transition-all duration-200 bg-gray-50 focus:bg-white text-sm sm:text-base"
                                style={{ fontFamily: 'Roboto, sans-serif', '--tw-ring-color': '#1E65AD', minHeight: '44px' }}
                                required
                              >
                                <option value="">Select year</option>
                                {years.map(year => (
                                  <option key={year} value={year}>{year}</option>
                                ))}
                              </select>
                            </div>
              </div>
                        </>
                      )}

                      {selectedProfession === "Lawyer" && (
                        <>
                          <div>
                            <label className="block text-sm font-semibold mb-2" style={{ color: '#1E65AD', fontFamily: 'Roboto, sans-serif' }}>
                              Bar ID *
                            </label>
                            <input
                              type="text"
                              name="bar_id"
                              value={formData.bar_id}
                onChange={handleChange}
                              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:border-transparent transition-all duration-200 bg-gray-50 focus:bg-white"
                              style={{ fontFamily: 'Roboto, sans-serif', '--tw-ring-color': '#1E65AD' }}
                              placeholder="Enter Bar Council ID"
                              required
              />
            </div>
                          <div>
                            <label className="block text-sm font-semibold mb-2" style={{ color: '#1E65AD', fontFamily: 'Roboto, sans-serif' }}>
                              City *
                            </label>
                            <select
                              name="city"
                              value={formData.city}
                              onChange={handleChange}
                              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:border-transparent transition-all duration-200 bg-gray-50 focus:bg-white"
                              style={{ fontFamily: 'Roboto, sans-serif', '--tw-ring-color': '#1E65AD' }}
                              required
                            >
                              <option value="">Select city</option>
                              {cities.map(city => (
                                <option key={city} value={city}>{city}</option>
                              ))}
                            </select>
                            {formData.city === "Other" && (
                              <input
                                type="text"
                                name="cityOther"
                                value={formData.cityOther}
                                onChange={handleChange}
                                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:border-transparent transition-all duration-200 bg-gray-50 focus:bg-white mt-2"
                                style={{ fontFamily: 'Roboto, sans-serif', '--tw-ring-color': '#1E65AD' }}
                                placeholder="Enter city name"
                                required
                              />
                            )}
                          </div>
                        </>
                      )}

                      {selectedProfession === "Law Firm" && (
                        <>
                          <div>
                            <label className="block text-sm font-semibold mb-2" style={{ color: '#1E65AD', fontFamily: 'Roboto, sans-serif' }}>
                              City *
                            </label>
                            <select
                              name="city"
                              value={formData.city}
                              onChange={handleChange}
                              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:border-transparent transition-all duration-200 bg-gray-50 focus:bg-white"
                              style={{ fontFamily: 'Roboto, sans-serif', '--tw-ring-color': '#1E65AD' }}
                              required
                            >
                              <option value="">Select city</option>
                              {cities.map(city => (
                                <option key={city} value={city}>{city}</option>
                              ))}
                            </select>
                            {formData.city === "Other" && (
              <input
                                type="text"
                                name="cityOther"
                                value={formData.cityOther}
                                onChange={handleChange}
                                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:border-transparent transition-all duration-200 bg-gray-50 focus:bg-white mt-2"
                                style={{ fontFamily: 'Roboto, sans-serif', '--tw-ring-color': '#1E65AD' }}
                                placeholder="Enter city name"
                required
                              />
                            )}
                          </div>
                          <div>
                            <label className="block text-sm font-semibold mb-2" style={{ color: '#1E65AD', fontFamily: 'Roboto, sans-serif' }}>
                              Registration ID *
                            </label>
                            <input
                              type="text"
                              name="registered_id"
                              value={formData.registered_id}
                onChange={handleChange}
                              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:border-transparent transition-all duration-200 bg-gray-50 focus:bg-white"
                              style={{ fontFamily: 'Roboto, sans-serif', '--tw-ring-color': '#1E65AD' }}
                              placeholder="Enter registration number"
                              required
              />
            </div>
                          <div>
                            <label className="block text-sm font-semibold mb-2" style={{ color: '#1E65AD', fontFamily: 'Roboto, sans-serif' }}>
                              Company Size *
                            </label>
              <select
                              name="company_size"
                              value={formData.company_size}
                              onChange={handleChange}
                              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:border-transparent transition-all duration-200 bg-gray-50 focus:bg-white"
                              style={{ fontFamily: 'Roboto, sans-serif', '--tw-ring-color': '#1E65AD' }}
                required
                            >
                              <option value="">Select company size</option>
                              {companySizes.map(size => (
                                <option key={size} value={size}>{size} employees</option>
                              ))}
              </select>
            </div>
                        </>
                      )}

                      {selectedProfession === "Other" && (
                        <>
                          <div>
                            <label className="block text-sm font-semibold mb-2" style={{ color: '#1E65AD', fontFamily: 'Roboto, sans-serif' }}>
                              Profession Type *
                            </label>
                <input
                  type="text"
                              name="profession_type"
                              value={formData.profession_type}
                  onChange={handleChange}
                              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:border-transparent transition-all duration-200 bg-gray-50 focus:bg-white"
                              style={{ fontFamily: 'Roboto, sans-serif', '--tw-ring-color': '#1E65AD' }}
                              placeholder="Enter your profession type"
                              required
                />
              </div>
                        </>
                      )}

                      {/* Password Fields */}
                      {otpVerified && (
                        <>
                          <div>
                            <label className="block text-sm font-semibold mb-2" style={{ color: '#1E65AD', fontFamily: 'Roboto, sans-serif' }}>
                              Password *
                            </label>
                            <div className="relative">
            <input
                                type={showPassword ? "text" : "password"}
                                name="password"
                                value={formData.password}
                                onChange={handleChange}
                                className={`w-full px-3 sm:px-4 py-2 sm:py-3 pr-10 sm:pr-12 border-2 rounded-lg sm:rounded-xl focus:ring-2 focus:border-transparent transition-all duration-200 bg-gray-50 focus:bg-white text-sm sm:text-base ${fieldErrors.password ? 'border-red-400' : 'border-gray-200'}`}
                                style={{ fontFamily: 'Roboto, sans-serif', '--tw-ring-color': '#1E65AD', minHeight: '44px' }}
                                placeholder="Create a strong password"
                                required
                              />
              <button
                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-2 sm:right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 p-1"
                                style={{ minHeight: '44px', minWidth: '44px' }}
              >
                                {showPassword ? "👁️" : "👁️‍🗨️"}
              </button>
            </div>
            {fieldErrors.password && (
              <p className="mt-1 text-sm text-red-600" style={{ fontFamily: 'Roboto, sans-serif' }}>
                {fieldErrors.password}
              </p>
            )}
        </div>
                          <div>
                            <label className="block text-sm font-semibold mb-2" style={{ color: '#1E65AD', fontFamily: 'Roboto, sans-serif' }}>
                              Confirm Password *
                            </label>
                            <div className="relative">
                              <input
                                type={showConfirmPassword ? "text" : "password"}
                                name="confirmPassword"
                                value={formData.confirmPassword}
                                onChange={handleChange}
                                className={`w-full px-3 sm:px-4 py-2 sm:py-3 pr-10 sm:pr-12 border-2 rounded-lg sm:rounded-xl focus:ring-2 focus:border-transparent transition-all duration-200 bg-gray-50 focus:bg-white text-sm sm:text-base ${fieldErrors.confirmPassword ? 'border-red-400' : 'border-gray-200'}`}
                                style={{ fontFamily: 'Roboto, sans-serif', '--tw-ring-color': '#1E65AD', minHeight: '44px' }}
                                placeholder="Confirm your password"
                                required
                              />
              <button
                type="button"
                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                className="absolute right-2 sm:right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 p-1"
                                style={{ minHeight: '44px', minWidth: '44px' }}
              >
                                {showConfirmPassword ? "👁️" : "👁️‍🗨️"}
              </button>
            </div>
            {fieldErrors.confirmPassword && (
              <p className="mt-1 text-sm text-red-600" style={{ fontFamily: 'Roboto, sans-serif' }}>
                {fieldErrors.confirmPassword}
              </p>
            )}
          </div>
                        </>
                      )}

                    <button
                      type="submit"
                      disabled={loading || !otpVerified}
                      className="w-full py-3 sm:py-4 px-4 sm:px-6 rounded-lg sm:rounded-xl font-semibold text-white transition-all duration-200 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none text-sm sm:text-base"
                      style={{ backgroundColor: '#1E65AD', fontFamily: 'Roboto, sans-serif', minHeight: '44px' }}
                    >
                      {loading ? "Creating Account..." : "Create Account"}
                    </button>
                  </form>
                )}
              </div>
          </div>
        </div>
      </div>
      </div>
      </div>

      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }
        .animate-float {
          animation: float 3s ease-in-out infinite;
        }
        .animation-delay-1000 {
          animation-delay: 1s;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-3000 {
          animation-delay: 3s;
        }
      `}</style>
    </div>
    </>
  );
}

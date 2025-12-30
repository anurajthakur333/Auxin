import { useEffect, useRef, useState } from 'react';
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import ShinyText from "../components/ShinyText";
import Calendar from "../components/Calendar";
import TimeSlots from "../components/TimeSlots";
import MyAppointments from "../components/MyAppointments";
import "../styles/fonts.css";
import "../styles/Main.css";
import Lenis from "lenis";
import { API_BASE_URL } from '../lib/apiConfig';

interface Question {
  label: string;
  type: 'text' | 'textarea' | 'email' | 'tel' | 'number';
  placeholder?: string;
  required: boolean;
  order: number;
}

interface MeetingCategory {
  _id: string;
  name: string;
  description?: string;
  icon?: string;
  color?: string;
  questions: Question[];
}

const Meeting = () => {
  const lenisRef = useRef<Lenis | null>(null);
  const [categories, setCategories] = useState<MeetingCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<MeetingCategory | null>(null);
  const [formAnswers, setFormAnswers] = useState<Record<string, string>>({});
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedTime, setSelectedTime] = useState<string>('');

  useEffect(() => {
    // Initialize Lenis for smooth scrolling
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      wheelMultiplier: 1,
      touchMultiplier: 1.5,
      infinite: false,
    });

    lenisRef.current = lenis;

    const raf = (time: number) => {
      lenis.raf(time);
      requestAnimationFrame(raf);
    };
    requestAnimationFrame(raf);

    return () => {
      lenis.destroy();
    };
  }, []);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/api/meeting-categories/public`);
      if (response.ok) {
        const data = await response.json();
        setCategories(data.categories || []);
      } else {
        console.error('Failed to fetch categories');
        setCategories([]);
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
      setCategories([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCategorySelect = (category: MeetingCategory) => {
    setSelectedCategory(category);
    // Reset form answers when selecting a new category
    setFormAnswers({});
  };

  const handleFormChange = (questionLabel: string, value: string) => {
    setFormAnswers({
      ...formAnswers,
      [questionLabel]: value,
    });
  };

  const handleBackToCategories = () => {
    setSelectedCategory(null);
    setFormAnswers({});
    setFormSubmitted(false);
  };

  const handleFormSubmit = () => {
    // Validate required fields
    if (!selectedCategory) return;
    
    const requiredQuestions = selectedCategory.questions.filter(q => q.required);
    const missingRequired = requiredQuestions.some(q => !formAnswers[q.label] || formAnswers[q.label].trim() === '');
    
    if (missingRequired) {
      alert('Please fill in all required fields');
      return;
    }

    // Save form data to localStorage
    const cachedData = {
      categoryId: selectedCategory._id,
      categoryName: selectedCategory.name,
      formAnswers: formAnswers,
      timestamp: new Date().toISOString(),
    };
    localStorage.setItem('meetingFormData', JSON.stringify(cachedData));
    
    // Mark form as submitted to show calendar
    setFormSubmitted(true);
  };

  // Show category tiles
  if (!selectedCategory) {
    return (
      <div style={{ 
        display: "flex", 
        flexDirection: "column", 
        minHeight: "100vh", 
        background: "#000",
        position: "relative",
        zIndex: 1
      }}>
        <Navbar />
        
        <div style={{ flex: 1, display: "flex", flexDirection: "column", padding: "50px" }}>
          <h1
            className="aeonik-mono text-white"
            style={{
              fontSize: "clamp(32px, 15vw, 770px)",
              lineHeight: "0.9",
              letterSpacing: "-15px",
              fontWeight: 600,
              textAlign: "left",
              marginTop: "12px",
              marginBottom: "100px",
            }}
          >
            MEETINGS
          </h1>
          
          <div 
            className="aeonik-mono text-white"
            style={{
              maxWidth: "900px",
              paddingLeft: "10px",
              marginBottom: "60px",
            }}
          >
            <ShinyText 
              text="Turn Organized Time Into Lasting Success." 
              disabled={false} 
              speed={3} 
              className="aeonik-mono meeting-subtitle"
            />
          </div>

          {loading ? (
            <p className="aeonik-mono" style={{ color: "rgba(255,255,255,0.5)", fontSize: "14px" }}>
              LOADING CATEGORIES...
            </p>
          ) : categories.length === 0 ? (
            <p className="aeonik-mono" style={{ color: "rgba(255,255,255,0.5)", fontSize: "14px" }}>
              NO MEETING CATEGORIES AVAILABLE
            </p>
          ) : (
            <div style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
              gap: "30px",
              marginBottom: "60px",
            }}>
              {categories.map((category) => (
                <button
                  key={category._id}
                  onClick={() => handleCategorySelect(category)}
                  className="aeonik-mono"
                  style={{
                    background: "rgba(255, 255, 255, 0.03)",
                    border: `2px solid ${category.color || "#39FF14"}`,
                    padding: "40px 30px",
                    cursor: "pointer",
                    transition: "all 0.3s ease",
                    textAlign: "left",
                    display: "flex",
                    flexDirection: "column",
                    gap: "15px",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = `${category.color || "#39FF14"}20`;
                    e.currentTarget.style.transform = "translateY(-5px)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = "rgba(255, 255, 255, 0.03)";
                    e.currentTarget.style.transform = "translateY(0)";
                  }}
                >
                  {category.icon && (
                    <div style={{ fontSize: "48px", lineHeight: 1 }}>
                      {category.icon}
                    </div>
                  )}
                  <h2
                    style={{
                      fontSize: "24px",
                      color: category.color || "#39FF14",
                      fontWeight: 600,
                      margin: 0,
                      letterSpacing: "-0.5px",
                    }}
                  >
                    {category.name}
                  </h2>
                  {category.description && (
                    <p
                      style={{
                        fontSize: "14px",
                        color: "rgba(255, 255, 255, 0.6)",
                        margin: 0,
                        lineHeight: 1.5,
                      }}
                    >
                      {category.description}
                    </p>
                  )}
                  <div
                    style={{
                      marginTop: "auto",
                      fontSize: "12px",
                      color: "rgba(255, 255, 255, 0.4)",
                    }}
                  >
                    {category.questions.length} QUESTION{category.questions.length !== 1 ? "S" : ""}
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
        
        <Footer />
      </div>
    );
  }

  // If form is submitted, show calendar directly
  if (formSubmitted && selectedCategory) {
    return (
      <div style={{ 
        display: "flex", 
        flexDirection: "column", 
        minHeight: "100vh", 
        background: "#000",
        position: "relative",
        zIndex: 1
      }}>
        <Navbar />
        
        <div style={{ flex: 1, display: "flex", flexDirection: "column", padding: "50px" }}>
          <button
            onClick={handleBackToCategories}
            className="aeonik-mono"
            style={{
              padding: "10px 20px",
              background: "transparent",
              border: "1px solid rgba(255, 255, 255, 0.3)",
              color: "#FFF",
              fontSize: "12px",
              cursor: "pointer",
              letterSpacing: "1px",
              marginBottom: "30px",
              width: "fit-content",
              transition: "all 0.3s ease",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = selectedCategory.color || "#39FF14";
              e.currentTarget.style.color = selectedCategory.color || "#39FF14";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.3)";
              e.currentTarget.style.color = "#FFF";
            }}
          >
            ← BACK TO CATEGORIES
          </button>

          <h3
            className="aeonik-mono"
            style={{
              fontSize: "24px",
              color: "#FFF",
              fontWeight: 600,
              marginBottom: "30px",
            }}
          >
            SELECT DATE & TIME
          </h3>
          <div className="meeting-layout">
            <Calendar 
              selectedDate={selectedDate}
              onDateSelect={setSelectedDate}
            />
            
            <TimeSlots 
              selectedDate={selectedDate}
              selectedTime={selectedTime}
              onTimeSelect={setSelectedTime}
            />
            
            <MyAppointments />
          </div>
        </div>
        
        <Footer />
      </div>
    );
  }

  // Show form based on selected category
  const sortedQuestions = [...selectedCategory.questions].sort((a, b) => a.order - b.order);

  return (
    <div style={{ 
      display: "flex", 
      flexDirection: "column", 
      minHeight: "100vh", 
      background: "#000",
      position: "relative",
      zIndex: 1
    }}>
      <Navbar />
      
      <div style={{ flex: 1, display: "flex", flexDirection: "column", padding: "50px" }}>
        <button
          onClick={handleBackToCategories}
          className="aeonik-mono"
          style={{
            padding: "10px 20px",
            background: "transparent",
            border: "1px solid rgba(255, 255, 255, 0.3)",
            color: "#FFF",
            fontSize: "12px",
            cursor: "pointer",
            letterSpacing: "1px",
            marginBottom: "30px",
            width: "fit-content",
            transition: "all 0.3s ease",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = selectedCategory.color || "#39FF14";
            e.currentTarget.style.color = selectedCategory.color || "#39FF14";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.3)";
            e.currentTarget.style.color = "#FFF";
          }}
        >
          ← BACK TO CATEGORIES
        </button>

        <h2
          className="aeonik-mono text-white"
          style={{
            fontSize: "clamp(24px, 8vw, 120px)",
            lineHeight: "0.9",
            letterSpacing: "-8px",
            fontWeight: 600,
            textAlign: "left",
            marginBottom: "20px",
            color: selectedCategory.color || "#39FF14",
          }}
        >
          {selectedCategory.icon && <span style={{ marginRight: "20px" }}>{selectedCategory.icon}</span>}
          {selectedCategory.name}
        </h2>

        {selectedCategory.description && (
          <p
            className="aeonik-mono"
            style={{
              fontSize: "18px",
              color: "rgba(255, 255, 255, 0.7)",
              marginBottom: "50px",
              maxWidth: "800px",
            }}
          >
            {selectedCategory.description}
          </p>
        )}

        <div style={{
          maxWidth: "700px",
          background: "rgba(255, 255, 255, 0.03)",
          border: `1px solid ${selectedCategory.color || "#39FF14"}40`,
          padding: "40px",
          marginBottom: "40px",
        }}>
          <h3
            className="aeonik-mono"
            style={{
              fontSize: "16px",
              color: "#FFF",
              fontWeight: 600,
              marginBottom: "30px",
              letterSpacing: "1px",
            }}
          >
            PLEASE ANSWER THE FOLLOWING QUESTIONS
          </h3>

          {sortedQuestions.map((question, index) => (
            <div key={index} style={{ marginBottom: "30px" }}>
              <label
                className="aeonik-mono"
                style={{
                  display: "block",
                  fontSize: "14px",
                  color: "#FFF",
                  marginBottom: "10px",
                  fontWeight: 600,
                }}
              >
                {question.label}
                {question.required && <span style={{ color: "#FF0000", marginLeft: "5px" }}>*</span>}
              </label>
              
              {question.type === 'textarea' ? (
                <textarea
                  value={formAnswers[question.label] || ''}
                  onChange={(e) => handleFormChange(question.label, e.target.value)}
                  placeholder={question.placeholder || ''}
                  required={question.required}
                  className="aeonik-mono"
                  style={{
                    width: "100%",
                    padding: "15px",
                    background: "rgba(255, 255, 255, 0.05)",
                    border: "1px solid rgba(255, 255, 255, 0.2)",
                    color: "#FFF",
                    fontSize: "14px",
                    minHeight: "120px",
                    resize: "vertical",
                  }}
                />
              ) : (
                <input
                  type={question.type}
                  value={formAnswers[question.label] || ''}
                  onChange={(e) => handleFormChange(question.label, e.target.value)}
                  placeholder={question.placeholder || ''}
                  required={question.required}
                  className="aeonik-mono"
                  style={{
                    width: "100%",
                    padding: "15px",
                    background: "rgba(255, 255, 255, 0.05)",
                    border: "1px solid rgba(255, 255, 255, 0.2)",
                    color: "#FFF",
                    fontSize: "14px",
                  }}
                />
              )}
            </div>
          ))}

          <button
            onClick={handleFormSubmit}
            className="aeonik-mono"
            style={{
              width: "100%",
              padding: "15px 30px",
              background: selectedCategory.color || "#39FF14",
              border: `1px solid ${selectedCategory.color || "#39FF14"}`,
              color: "#000",
              fontSize: "14px",
              cursor: "pointer",
              letterSpacing: "1px",
              fontWeight: 600,
              transition: "all 0.3s ease",
              marginTop: "20px",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = selectedCategory.color ? selectedCategory.color + "DD" : "#2ecc11";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = selectedCategory.color || "#39FF14";
            }}
          >
            CONTINUE TO CALENDAR
          </button>
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default Meeting;

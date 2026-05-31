import { useState, useRef } from "react";
import { Mic, MapPin, CheckCircle, Users, ArrowLeft, UserPlus } from "lucide-react";
import { supabase } from "./supabase";

const LANDMARKS = [
  "Daley Library",
  "Student Center East",
  "Science & Engineering Labs (SEL)",
  "ARC — Academic & Residential Complex",
  "BSB — Behavioural Sciences Building",
  "CS Building",
];

function AboutPage({ onBack }: any) {
  return (
    <div className="min-h-screen bg-midnight-ink font-inter tracking-body flex items-center justify-center w-full px-4 sm:px-6 md:px-8 py-4 sm:py-6 md:py-8">
      <div className="w-full max-w-sm sm:max-w-md md:max-w-lg mx-auto">
        <div className="flex items-center gap-3 mb-8">
          <button
            onClick={onBack}
            className="w-10 h-10 rounded-full-2 bg-canvas-ice hover:bg-soft-lavender flex items-center justify-center transition-colors focus:outline-none"
          >
            <ArrowLeft size={18} className="text-midnight-ink" />
          </button>
          <span className="text-snow-white font-bold text-subheading">About NearU</span>
        </div>

        <div className="bg-snow-white rounded-3xl-2 p-6 mb-6 shadow-xl">
          <p className="text-plasma-violet text-caption font-bold uppercase tracking-widest mb-4">The Story</p>
          <p className="text-midnight-ink text-body leading-relaxed mb-4">
            Ok so picture this. You just started at UIC and you literally know nobody. You walk onto campus and everyone is already in their little groups talking and laughing and you are just standing there on your phone pretending to be busy.
          </p>
          <p className="text-pale-stone text-body leading-relaxed mb-4">
            You want to meet people so bad but like how do you just walk up to a random person and start talking? It feels so awkward. So you just leave and go back to your dorm. Again.
          </p>
          <p className="text-pale-stone text-body leading-relaxed mb-4">
            That happened to me way too many times honestly. College is supposed to be the best years of your life but nobody tells you how hard it actually is to just find your people.
          </p>
          <p className="text-midnight-ink text-body leading-relaxed font-bold">
            I got tired of it. So I built NearU.
          </p>
        </div>

        <div className="bg-snow-white rounded-3xl-2 p-6 mb-6 shadow-xl">
          <p className="text-plasma-violet text-caption font-bold uppercase tracking-widest mb-4">What NearU Does</p>
          <p className="text-pale-stone text-body leading-relaxed mb-4">
            NearU makes it super easy to meet other UIC students around you. You pick the building you are at right now, tap the mic and say something like "anyone want to grab food" or "looking to meet new people at the student center."
          </p>
          <p className="text-pale-stone text-body leading-relaxed">
            NearU finds someone nearby who is looking for the same thing and connects you both instantly. No awkward cold approaches. No swiping through profiles. Just real students right there on campus who actually want to hang.
          </p>
        </div>

        <div className="bg-snow-white rounded-3xl-2 p-6 mb-8 shadow-xl">
          <p className="text-plasma-violet text-caption font-bold uppercase tracking-widest mb-5">Who Built This</p>
          <div className="flex items-center gap-4 mb-4">
            <div className="w-14 h-14 rounded-full-2 bg-plasma-violet flex items-center justify-center shadow-xl">
              <span className="text-snow-white font-bold text-subheading">DP</span>
            </div>
            <div>
              <p className="text-midnight-ink font-bold text-body">Divya Patel</p>
              <p className="text-pale-stone text-caption font-medium">CS Senior at UIC</p>
            </div>
          </div>
          <p className="text-pale-stone text-body leading-relaxed">
            Hey I am Divya! I am a senior studying Computer Science at UIC and I am really into data analytics and building things with AI. I built NearU because I genuinely felt that loneliness too and I thought if I can use what I know to fix even a small part of that for other students then why not just do it. So I did.
          </p>
        </div>

        <button
          onClick={onBack}
          className="w-full bg-plasma-violet hover:opacity-90 text-snow-white rounded-full-2 py-4 font-bold text-body transition-all duration-200 shadow-xl active:scale-[0.98] focus:outline-none"
        >
          Back to NearU
        </button>

        <p className="text-center text-pale-stone text-caption mt-6 mb-4 font-medium">NearU v1.0 · University of Illinois Chicago</p>
      </div>
    </div>
  );
}

export default function App() {
  const [page, setPage] = useState("home");
  const [landmark, setLandmark] = useState(LANDMARKS[0]);
  const [micState, setMicState] = useState("idle");
  const [inputText, setInputText] = useState("");
  const [searchState, setSearchState] = useState("idle");
  const [showModal, setShowModal] = useState(false);
  const [match, setMatch] = useState<any>(null);
  const [fetchedStudents, setFetchedStudents] = useState<any[]>([]);

  const baseTextRef = useRef("");

  const handleMic = () => {
    if (micState === "listening") return;

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Speech recognition is not supported in this browser. Please use the text input instead.");
      return;
    }

    setMicState("listening");
    setSearchState("idle");
    setMatch(null);
    baseTextRef.current = inputText;

    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = true;

    recognition.onresult = (event: any) => {
      let currentInterim = "";
      let currentFinal = "";

      for (let i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) {
          currentFinal += event.results[i][0].transcript;
        } else {
          currentInterim += event.results[i][0].transcript;
        }
      }

      if (currentFinal) {
        baseTextRef.current = (baseTextRef.current + " " + currentFinal).trim();
      }
      setInputText((baseTextRef.current + " " + currentInterim).trim());
    };

    recognition.onerror = (event: any) => {
      console.error("Speech recognition error:", event.error);
      setMicState("idle");
    };

    recognition.onend = () => {
      setMicState("done");
    };

    recognition.start();
  };

  const handleFind = async () => {
    const textToMatch = inputText;
    if (!textToMatch || searchState !== "idle") return;
    setSearchState("searching");

    try {
      const { data, error } = await supabase
        .from("student_profiles")
        .select("*")
        .eq("landmark", landmark);

      if (error) throw error;

      if (data && data.length > 0) {
        console.log("Fetched Students:", data);

        const cleanedText = textToMatch.toLowerCase().replace(/[^\w\s]/g, "");
        const cleanedInputWords = cleanedText.split(/\s+/).filter(Boolean);
        console.log("Cleaned Input Words:", cleanedInputWords);

        let exactMatch = data.find((student: any) => {
          let kwArray: string[] = [];
          if (Array.isArray(student.keywords)) {
            kwArray = student.keywords;
          } else if (typeof student.keywords === "string") {
            kwArray = student.keywords.replace(/[{}]/g, "").split(",");
          }

          return kwArray.some((kw: string) => cleanedInputWords.includes(kw.trim().toLowerCase()));
        });

        console.log("Match Found:", exactMatch);

        setMatch(exactMatch || null);
        setFetchedStudents(data);
        setSearchState("found");
        setShowModal(true);
      } else {
        setMatch(null);
        setFetchedStudents([]);
        setSearchState("idle");
        alert(`No student profiles found at ${landmark} in the database.`);
      }
    } catch (err) {
      console.error("Error finding match:", err);
      setSearchState("idle");
      alert("Failed to search database. Please verify your Supabase configuration in .env.local.");
    }
  };

  const handleClose = () => {
    setShowModal(false);
    setSearchState("idle");
    setMicState("idle");
    setInputText("");
    setMatch(null);
    setFetchedStudents([]);
  };

  if (page === "about") return <AboutPage onBack={() => setPage("home")} />;

  return (
    <div className="min-h-screen bg-midnight-ink font-inter tracking-body flex items-center justify-center w-full px-4 sm:px-6 md:px-8 py-4 sm:py-6 md:py-8">
      <div className="w-full max-w-sm sm:max-w-md md:max-w-lg mx-auto relative">

        {/* Header */}
        <div className="flex justify-between items-center mb-8 px-1">
          <div className="flex items-center gap-3">
            <img src="/NearU_logo.png" alt="NearU Logo" className="w-[42px] h-[42px] object-cover rounded-xl" />
            <span className="text-snow-white font-bold text-subheading">NearU</span>
          </div>
          <div className="flex items-center gap-1.5 bg-canvas-ice rounded-full px-3 py-1">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-plasma-violet opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-plasma-violet" />
            </span>
            <span className="text-midnight-ink text-caption font-semibold">Online</span>
          </div>
        </div>

        {/* Location card */}
        <div className="bg-snow-white rounded-3xl-2 p-6 mb-4 shadow-xl">
          <div className="flex items-center gap-2 mb-3">
            <MapPin size={16} className="text-plasma-violet" />
            <span className="text-pale-stone text-caption font-semibold uppercase tracking-widest">Your Location</span>
          </div>
          <div className="relative">
            <select
              value={landmark}
              onChange={e => { setLandmark(e.target.value); setSearchState("idle"); setMatch(null); setFetchedStudents([]); }}
              className="w-full bg-canvas-ice text-midnight-ink rounded-full-2 px-5 py-3.5 text-body font-medium appearance-none focus:outline-none focus:ring-2 focus:ring-plasma-violet cursor-pointer border-none"
            >
              {LANDMARKS.map(l => (
                <option key={l} value={l} className="text-midnight-ink">{l}</option>
              ))}
            </select>
            <div className="pointer-events-none absolute right-5 top-1/2 -translate-y-1/2">
              <svg width="12" height="8" viewBox="0 0 12 8" fill="none">
                <path d="M1 1L6 6L11 1" stroke="#101722" strokeWidth="2" strokeLinecap="round" />
              </svg>
            </div>
          </div>
        </div>

        {/* Voice and Text section */}
        <div className="bg-snow-white rounded-3xl-2 p-6 mb-6 shadow-xl">
          <p className="text-pale-stone text-caption font-semibold uppercase tracking-widest mb-6 text-center">
            Who are you looking to meet?
          </p>

          <div className="flex flex-col items-center mb-6">
            <button
              onClick={handleMic}
              className={`relative w-24 h-24 rounded-full-2 flex items-center justify-center focus:outline-none transition-all duration-300 ease-in-out hover:scale-105
                ${micState === "listening"
                  ? "bg-plasma-violet shadow-xl-2 scale-105"
                  : micState === "done"
                    ? "bg-soft-lavender hover:bg-plasma-violet hover:text-snow-white"
                    : "bg-canvas-ice hover:bg-soft-lavender text-midnight-ink"
                }`}
            >
              {micState === "listening" && (
                <>
                  <span className="absolute inset-0 rounded-full-2 animate-ping bg-plasma-violet opacity-30" />
                </>
              )}
              <Mic
                size={32}
                className={`transition-colors duration-300 ${micState === "listening" ? "text-snow-white" : micState === "done" ? "text-plasma-violet hover:text-snow-white" : "text-midnight-ink"}`}
              />
            </button>
            <p className="mt-4 text-pale-stone text-caption font-medium">
              {micState === "listening" ? "Listening..." : micState === "done" ? "Tap to re-record" : "Tap to speak"}
            </p>
          </div>

          <div className="relative">
            <textarea
              value={inputText}
              onChange={e => {
                setInputText(e.target.value);
                setSearchState("idle");
              }}
              placeholder="Type your message here or tap the mic..."
              disabled={micState === "listening"}
              className={`w-full min-h-[80px] bg-canvas-ice text-midnight-ink text-body rounded-2xl p-5 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-plasma-violet resize-none border-none
                ${inputText ? "bg-soft-lavender/30" : ""}`}
            />
          </div>
        </div>

        {/* Find button */}
        <button
          onClick={handleFind}
          disabled={!inputText || searchState !== "idle"}
          className={`w-full rounded-full-2 py-4.5 font-bold text-body flex items-center justify-center gap-3 transition-all duration-300 focus:outline-none
            ${!inputText || searchState !== "idle"
              ? "bg-canvas-ice text-pale-stone cursor-not-allowed"
              : "bg-plasma-violet hover:opacity-90 text-snow-white shadow-xl active:scale-[0.98]"
            }`}
        >
          {searchState === "searching" ? (
            <>
              <svg className="animate-spin h-5 w-5 text-snow-white opacity-75" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
              </svg>
              <span>Finding students...</span>
            </>
          ) : (
            <>
              <UserPlus size={20} />
              Find People Nearby
            </>
          )}
        </button>

        {/* Footer */}
        <div className="flex items-center justify-center gap-3 mt-8">
          <p className="text-pale-stone text-caption">Only at UIC · Always anonymous first</p>
          <span className="text-pale-stone text-caption">·</span>
          <button
            onClick={() => setPage("about")}
            className="text-pale-stone hover:text-snow-white text-caption font-semibold transition-colors duration-200 underline underline-offset-4"
          >
            About
          </button>
        </div>
      </div>

      {/* Match Modal */}
      {showModal && fetchedStudents.length > 0 && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-midnight-ink/80 backdrop-blur-md" onClick={handleClose} />
          <div className="relative w-full max-w-sm sm:max-w-md md:max-w-lg mx-auto bg-snow-white rounded-3xl-2 shadow-xl animate-[fadeInUp_0.35s_ease_forwards] max-h-[90vh] flex flex-col overflow-hidden py-6 sm:py-8 pr-2">
            <div className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden pl-7 sm:pl-9 pr-2 sm:pr-4 [scrollbar-gutter:stable]">
              {match ? (
                <div className="flex flex-col items-center mb-8 mt-2">
                  <div className="flex items-center gap-2 bg-canvas-ice rounded-full px-4 py-2 mb-6">
                    <CheckCircle size={16} className="text-plasma-violet" />
                    <span className="text-plasma-violet text-caption font-bold uppercase tracking-widest">Someone Nearby!</span>
                  </div>

                  <div className="relative mb-4">
                    <div className="w-96 h-96 rounded-full-2 bg-plasma-violet flex items-center justify-center shadow-xl">
                      <span className="text-snow-white text-heading font-bold tracking-tight">{match.avatar_initials || "AM"}</span>
                    </div>
                    <span className="absolute -bottom-1 -right-1 w-24 h-24 bg-canvas-ice border-[3px] border-snow-white rounded-full-2 flex items-center justify-center">
                      <div className="w-[10px] h-[10px] bg-plasma-violet rounded-full-2 animate-pulse" />
                    </span>
                  </div>

                  <h2 className="text-midnight-ink text-heading font-bold mb-1">{match.name}</h2>
                  <p className="text-pale-stone text-body font-medium">{match.major_year}</p>
                  <div className="flex items-center gap-1.5 mt-3 text-plasma-violet">
                    <MapPin size={14} />
                    <span className="text-caption font-semibold">~40 ft away · Same floor</span>
                  </div>

                  <div className="bg-canvas-ice rounded-2xl p-5 mb-6 mt-8 w-full">
                    <p className="text-pale-stone text-caption font-bold uppercase tracking-widest mb-4 text-center">Also Looking For</p>
                    <div className="flex flex-wrap justify-center gap-2">
                      {(Array.isArray(match.keywords) ? match.keywords : typeof match.keywords === "string" ? match.keywords.replace(/[{}]/g, "").split(",") : []).map((tag: string) => (
                        <span key={tag} className="bg-soft-lavender/50 text-plasma-violet text-caption font-semibold rounded-full-2 px-4 py-1.5">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="bg-canvas-ice/50 rounded-2xl px-5 py-4 mb-8 w-full text-center">
                    <p className="text-midnight-ink text-body leading-relaxed">
                      <span className="font-bold">{match.name}</span> is also at{" "}
                      <span className="font-bold">{landmark}</span>: "{match.status_prompt}"
                    </p>
                  </div>

                  <button className="w-full bg-plasma-violet hover:opacity-90 text-snow-white rounded-full-2 py-4 font-bold text-body flex items-center justify-center gap-2.5 transition-all duration-200 shadow-xl active:scale-[0.98] focus:outline-none mb-4">
                    <UserPlus size={20} />
                    Connect with {match.name.split(" ")[0]}
                  </button>
                </div>
              ) : (
                <div className="flex flex-col items-center mb-10 mt-4">
                  <div className="w-12 h-12 rounded-full bg-canvas-ice flex items-center justify-center mb-5">
                    <Users size={22} className="text-midnight-ink/60" />
                  </div>
                  <h2 className="text-midnight-ink text-[36px] font-bold mb-2 text-center tracking-tight leading-none">No exact matches</h2>
                  <p className="text-pale-stone text-[15px] text-center">No exact matches at this moment for your prompt.</p>
                </div>
              )}

              {/* Others Available Nearby */}
              {fetchedStudents.filter(s => !match || s.id !== match.id).length > 0 && (
                <div className="w-full">
                  <div className="w-full h-px bg-canvas-ice mb-6"></div>
                  <div className="flex items-center justify-center gap-3 mb-6">
                    <div className="w-1.5 h-1.5 rounded-full bg-soft-lavender/60"></div>
                    <h3 className="text-midnight-ink text-[11px] font-bold uppercase tracking-[0.15em] text-center">Others Available Nearby</h3>
                    <div className="w-1.5 h-1.5 rounded-full bg-soft-lavender/60"></div>
                  </div>
                  <div className="flex flex-col gap-4 pb-2">
                    {fetchedStudents.filter(s => !match || s.id !== match.id).map(student => (
                      <div key={student.id} className="bg-[#fcfbfe] border border-soft-lavender/30 rounded-[28px] p-6 flex flex-col items-center text-center shadow-[0_2px_12px_-4px_rgba(69,65,254,0.08)]">
                        <div className="w-[56px] h-[56px] rounded-full-2 bg-plasma-violet flex items-center justify-center shrink-0 shadow-sm mb-2">
                          <span className="text-snow-white font-bold text-subheading">{student.avatar_initials || "U"}</span>
                        </div>
                        <div className="w-full mb-5">
                          <h4 className="text-midnight-ink font-bold text-[18px] mb-1">{student.name}</h4>
                          <p className="text-pale-stone text-[14px] leading-[1.4] px-2">{student.status_prompt}</p>
                        </div>
                        <button className="w-full bg-snow-white text-plasma-violet border border-soft-lavender/40 px-5 py-3.5 rounded-full-2 text-[15px] font-bold shadow-sm hover:bg-canvas-ice transition-colors">
                          Connect
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {!match && (
                <button onClick={handleClose} className="w-full mt-6 bg-transparent hover:bg-canvas-ice text-pale-stone hover:text-midnight-ink rounded-full-2 py-3.5 text-body font-bold transition-all duration-200 focus:outline-none">
                  Close
                </button>
              )}
              {match && (
                <button onClick={handleClose} className="w-full bg-transparent hover:bg-canvas-ice text-pale-stone hover:text-midnight-ink rounded-full-2 py-3.5 text-body font-bold transition-all duration-200 focus:outline-none">
                  Skip for now
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(24px) scale(0.97); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }
      `}</style>
    </div>
  );
}

import { useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "@/store/authStore";
import api from "@/services/api";

const PERSONAS = [
  {
    id: "study",
    emoji: "📚",
    title: "Study & Exams",
    description: "Prepare for exams, build strong study habits, and ace your courses.",
    gradient: "from-blue-600 to-indigo-600",
  },
  {
    id: "fitness",
    emoji: "💪",
    title: "Fitness & Health",
    description: "Build workout routines, track nutrition, and transform your body.",
    gradient: "from-green-600 to-emerald-600",
  },
  {
    id: "coding",
    emoji: "⚙️",
    title: "Career & Coding",
    description: "Master programming, build projects, and level up your career.",
    gradient: "from-purple-600 to-violet-600",
  },
  {
    id: "growth",
    emoji: "🌱",
    title: "Personal Growth",
    description: "Journaling, reading, meditation — becoming your best self.",
    gradient: "from-amber-600 to-orange-600",
  },
  {
    id: "habits",
    emoji: "🔗",
    title: "Breaking Bad Habits",
    description: "Quit scrolling, quit smoking, quit procrastinating — for good.",
    gradient: "from-rose-600 to-red-600",
  },
];

export default function Onboarding() {
  const [selected, setSelected] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const { fetchProfile } = useAuthStore();
  const navigate = useNavigate();

  const handleContinue = async () => {
    if (!selected) return;
    setLoading(true);
    try {
      await api.post("/user/onboarding", { persona: selected });
      await fetchProfile();
      navigate("/dashboard");
    } catch {
      navigate("/dashboard");
    } finally {
      setLoading(false);
    }
  };

  const handleSkip = () => navigate("/dashboard");

  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-2xl w-full"
      >
        {/* Header */}
        <div className="text-center mb-10">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring" }}
            className="text-6xl mb-4"
          >
            🛡️
          </motion.div>
          <h1 className="text-3xl font-bold text-white mb-2">Welcome to StreakForge!</h1>
          <p className="text-gray-400 text-lg">
            I am The Sentinel. Tell me what you want to conquer and I will tailor your experience.
          </p>
        </div>

        {/* Persona Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
          {PERSONAS.map((persona, i) => (
            <motion.button
              key={persona.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 * i }}
              onClick={() => setSelected(persona.id)}
              className={`relative p-5 rounded-2xl border-2 text-left transition-all duration-200 ${
                selected === persona.id
                  ? "border-purple-500 bg-purple-500/10 scale-[1.02]"
                  : "border-gray-800 bg-gray-900/50 hover:border-gray-600"
              }`}
            >
              {selected === persona.id && (
                <motion.div
                  layoutId="selected-check"
                  className="absolute top-4 right-4 w-6 h-6 bg-purple-500 rounded-full flex items-center justify-center text-white text-sm font-bold"
                >
                  ✓
                </motion.div>
              )}
              <div className="text-3xl mb-3">{persona.emoji}</div>
              <h3 className="text-white font-bold text-lg mb-1">{persona.title}</h3>
              <p className="text-gray-400 text-sm">{persona.description}</p>
            </motion.button>
          ))}
        </div>

        {/* Actions */}
        <div className="flex gap-4">
          <button
            onClick={handleSkip}
            className="flex-1 py-3 rounded-xl border border-gray-700 text-gray-400 hover:text-white hover:border-gray-500 transition-all"
          >
            Skip for now
          </button>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleContinue}
            disabled={!selected || loading}
            className={`flex-1 py-3 rounded-xl font-bold text-white transition-all ${
              selected
                ? "bg-gradient-to-r from-purple-600 to-indigo-600 hover:opacity-90"
                : "bg-gray-800 text-gray-500 cursor-not-allowed"
            }`}
          >
            {loading ? "Setting up..." : "Start Forging →"}
          </motion.button>
        </div>
      </motion.div>
    </div>
  );
}

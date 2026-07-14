import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  Activity,
  ArrowDown,
  ArrowUp,
  BarChart3,
  Bell,
  Bot,
  CalendarDays,
  ChevronDown,
  Crown,
  Download,
  FileText,
  Gauge,
  HelpCircle,
  ImageIcon,
  LayoutDashboard,
  LineChart as LineChartIcon,
  Medal,
  Moon,
  MoreHorizontal,
  Search,
  Settings,
  Share2,
  ShieldCheck,
  Sparkles,
  Star,
  Sun,
  TableProperties,
  Trophy,
  UserRound,
  Users,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

type Segment = "All" | "Students" | "Teachers" | "Reviewers";
type RangeKey = "7D" | "30D" | "90D";
type SortKey = "rank" | "model" | "averageScore" | "participants" | "totalRatings" | "trend";

type ModelScore = {
  id: string;
  name: string;
  shortName: string;
  rating: number;
  image: string;
  rank: number;
  change: number;
  totalRatings: number;
  participants: number;
  realism: number;
  indianContext: number;
  imageQuality: number;
  color: string;
  gradient: string;
};

type SubmissionRow = ModelScore & {
  averageScore: number;
  status: "Leader" | "Stable" | "Review";
};

const getSortValue = (row: SubmissionRow, key: SortKey) => {
  if (key === "model") return row.name;
  if (key === "trend") return row.change;
  return row[key];
};

const navItems: { label: string; icon: LucideIcon; active?: boolean }[] = [
  { label: "Dashboard", icon: LayoutDashboard, active: true },
  { label: "Image Evaluation", icon: ImageIcon },
  { label: "AI Models", icon: Bot },
  { label: "Participants", icon: Users },
  { label: "Ratings", icon: Star },
  { label: "Analytics", icon: BarChart3 },
  { label: "Leaderboard", icon: Trophy },
  { label: "Reports", icon: FileText },
  { label: "Settings", icon: Settings },
  { label: "Help & Support", icon: HelpCircle },
];

const baseModels: ModelScore[] = [
  {
    id: "gpt-image-1",
    name: "GPT Image 1",
    shortName: "GPT Image",
    rating: 4.8,
    image: "/images/gpt-image-classroom.jpg",
    rank: 1,
    change: 8.4,
    totalRatings: 10,
    participants: 10,
    realism: 96,
    indianContext: 94,
    imageQuality: 97,
    color: "#2563eb",
    gradient: "from-blue-600 to-cyan-500",
  },
  {
    id: "gemini-25-flash",
    name: "Gemini 2.5 Flash",
    shortName: "Gemini Flash",
    rating: 4.4,
    image: "/images/gemini-flash-classroom.jpg",
    rank: 2,
    change: 3.1,
    totalRatings: 10,
    participants: 10,
    realism: 89,
    indianContext: 91,
    imageQuality: 88,
    color: "#0ea5e9",
    gradient: "from-sky-500 to-blue-500",
  },
  {
    id: "gemini-31-ultra",
    name: "Gemini 3.1 Ultra",
    shortName: "Gemini Ultra",
    rating: 4.1,
    image: "/images/gemini-ultra-classroom.jpg",
    rank: 3,
    change: -1.7,
    totalRatings: 10,
    participants: 10,
    realism: 84,
    indianContext: 87,
    imageQuality: 83,
    color: "#7c3aed",
    gradient: "from-indigo-500 to-violet-500",
  },
];

const feedback = [
  {
    name: "Aarav Mehta",
    role: "Education reviewer",
    model: "GPT Image 1",
    rating: 5,
    quote:
      "The classroom context feels authentic, with strong visual clarity and details that match an Indian government school setting.",
  },
  {
    name: "Nisha Khan",
    role: "Teacher participant",
    model: "Gemini 2.5 Flash",
    rating: 4,
    quote:
      "The image is clean and usable for the prompt, though a few environmental details could feel more localized.",
  },
  {
    name: "Rohan Iyer",
    role: "Product evaluator",
    model: "Gemini 3.1 Ultra",
    rating: 4,
    quote:
      "Good overall quality, but the realism score drops slightly because the classroom lighting looks more staged.",
  },
];

const segmentOffsets: Record<Segment, number> = {
  All: 0,
  Students: -0.04,
  Teachers: 0.07,
  Reviewers: 0.02,
};

const rangeMultipliers: Record<RangeKey, number> = {
  "7D": 1,
  "30D": 0.98,
  "90D": 0.95,
};

const ratingDistributionBase = [
  { rating: "1 star", count: 0 },
  { rating: "2 star", count: 1 },
  { rating: "3 star", count: 3 },
  { rating: "4 star", count: 10 },
  { rating: "5 star", count: 16 },
];

const clampScore = (value: number) => Math.min(5, Math.max(1, value));

function formatScore(value: number) {
  return value.toFixed(2);
}

function IconBadge({ icon: Icon, className = "" }: { icon: LucideIcon; className?: string }) {
  return (
    <span
      className={`inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-blue-100/80 bg-white/80 text-blue-600 shadow-sm shadow-blue-950/5 backdrop-blur dark:border-white/10 dark:bg-white/10 dark:text-blue-200 ${className}`}
    >
      <Icon className="h-5 w-5" />
    </span>
  );
}

function Stars({ value }: { value: number }) {
  return (
    <div className="flex items-center gap-1" aria-label={`${value} out of 5 stars`}>
      {Array.from({ length: 5 }).map((_, index) => (
        <Star
          key={index}
          className={`h-4 w-4 ${index < value ? "fill-amber-400 text-amber-400" : "text-slate-300 dark:text-slate-600"}`}
        />
      ))}
    </div>
  );
}

function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;

  return (
    <div className="rounded-2xl border border-slate-200/80 bg-white/95 p-3 text-sm shadow-xl shadow-slate-950/10 backdrop-blur-xl dark:border-white/10 dark:bg-slate-950/90 dark:text-slate-100">
      <p className="mb-2 font-semibold text-slate-900 dark:text-white">{label}</p>
      <div className="space-y-1">
        {payload.map((entry: any) => (
          <div key={`${entry.name}-${entry.value}`} className="flex items-center justify-between gap-6">
            <span className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
              <span className="h-2.5 w-2.5 rounded-full" style={{ background: entry.color }} />
              {entry.name}
            </span>
            <span className="font-semibold text-slate-900 dark:text-white">{entry.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function App() {
  const [darkMode, setDarkMode] = useState(false);
  const [segment, setSegment] = useState<Segment>("All");
  const [range, setRange] = useState<RangeKey>("7D");
  const [query, setQuery] = useState("");
  const [sortKey, setSortKey] = useState<SortKey>("rank");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");

  const adjustedModels = useMemo(() => {
    const offset = segmentOffsets[segment];
    const rangeMultiplier = rangeMultipliers[range];

    return baseModels.map((model, index) => {
      const adjustedRating = clampScore(model.rating * rangeMultiplier + offset + index * 0.01);
      return {
        ...model,
        rating: Number(adjustedRating.toFixed(2)),
        averageScore: Number(adjustedRating.toFixed(2)),
        realism: Math.round(model.realism * rangeMultiplier + offset * 10),
        indianContext: Math.round(model.indianContext * rangeMultiplier + offset * 10),
        imageQuality: Math.round(model.imageQuality * rangeMultiplier + offset * 10),
        status: model.rank === 1 ? "Leader" : model.rank === 2 ? "Stable" : "Review",
      } satisfies SubmissionRow;
    });
  }, [range, segment]);

  const averageRating = useMemo(() => {
    const avg = adjustedModels.reduce((sum, model) => sum + model.rating, 0) / adjustedModels.length;
    return avg.toFixed(2);
  }, [adjustedModels]);

  const barData = adjustedModels.map((model) => ({
    model: model.shortName,
    score: model.rating,
    fill: model.color,
  }));

  const distributionData = ratingDistributionBase.map((item, index) => ({
    ...item,
    count: Math.max(0, Math.round(item.count * rangeMultipliers[range] + segmentOffsets[segment] * 8 + index)),
  }));

  const donutData = [
    { name: "Realism", value: Math.round(adjustedModels.reduce((sum, model) => sum + model.realism, 0) / 3), color: "#2563eb" },
    {
      name: "Indian Context",
      value: Math.round(adjustedModels.reduce((sum, model) => sum + model.indianContext, 0) / 3),
      color: "#0ea5e9",
    },
    {
      name: "Image Quality",
      value: Math.round(adjustedModels.reduce((sum, model) => sum + model.imageQuality, 0) / 3),
      color: "#7c3aed",
    },
  ];

  const filteredRows = useMemo(() => {
    const rows = adjustedModels.filter((row) => row.name.toLowerCase().includes(query.toLowerCase()));
    return [...rows].sort((a, b) => {
      const first = getSortValue(a, sortKey);
      const second = getSortValue(b, sortKey);
      const direction = sortDirection === "asc" ? 1 : -1;

      if (typeof first === "number" && typeof second === "number") {
        return (first - second) * direction;
      }

      return String(first).localeCompare(String(second)) * direction;
    });
  }, [adjustedModels, query, sortDirection, sortKey]);

  const selectSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDirection((current) => (current === "asc" ? "desc" : "asc"));
      return;
    }

    setSortKey(key);
    setSortDirection(key === "rank" || key === "model" ? "asc" : "desc");
  };

  const kpis = [
    { label: "Models Compared", value: "3", trend: "+0", helper: "Active evaluation set", icon: Bot, tone: "blue" },
    { label: "Participants", value: "10", trend: "+2", helper: "Human raters", icon: Users, tone: "sky" },
    { label: "Average Rating", value: `${range === "7D" && segment === "All" ? "4.45" : averageRating}/5`, trend: "+4.2%", helper: "Across all ratings", icon: Gauge, tone: "indigo" },
    { label: "Total Ratings", value: "30", trend: "+12", helper: "Submitted reviews", icon: Activity, tone: "cyan" },
    { label: "Winning Model", value: "GPT Image 1", trend: "+8.4%", helper: "Highest average score", icon: Crown, tone: "violet" },
  ];

  return (
    <div className={darkMode ? "dark" : ""}>
      <div className="min-h-screen bg-[#f5f8ff] text-slate-900 transition-colors duration-500 dark:bg-slate-950 dark:text-slate-100">
        <div className="pointer-events-none fixed inset-0 overflow-hidden">
          <div className="absolute -left-28 top-0 h-80 w-80 rounded-full bg-blue-300/30 blur-3xl dark:bg-blue-600/20" />
          <div className="absolute right-0 top-1/4 h-96 w-96 rounded-full bg-cyan-200/30 blur-3xl dark:bg-cyan-500/10" />
        </div>

        <div className="relative flex min-h-screen">
          <aside className="sticky top-0 hidden h-screen w-72 shrink-0 border-r border-white/70 bg-white/80 p-5 shadow-xl shadow-blue-950/5 backdrop-blur-2xl dark:border-white/10 dark:bg-slate-950/70 lg:flex lg:flex-col">
            <div className="mb-8 flex items-center gap-3 px-2">
              <div className="grid h-11 w-11 place-items-center rounded-2xl bg-gradient-to-br from-blue-600 to-cyan-500 text-sm font-black tracking-tight text-white shadow-lg shadow-blue-700/25">
                JT
              </div>
              <div>
                <p className="text-base font-bold tracking-tight text-slate-950 dark:text-white">Josh Talks</p>
                <p className="text-xs font-medium text-slate-500 dark:text-slate-400">AI evaluation suite</p>
              </div>
            </div>

            <nav className="space-y-1.5">
              {navItems.map((item) => (
                <button
                  key={item.label}
                  className={`group flex w-full items-center gap-3 rounded-2xl px-3.5 py-3 text-left text-sm font-semibold transition-all duration-200 ${
                    item.active
                      ? "bg-blue-600 text-white shadow-lg shadow-blue-700/20"
                      : "text-slate-600 hover:bg-blue-50 hover:text-blue-700 dark:text-slate-400 dark:hover:bg-white/10 dark:hover:text-white"
                  }`}
                >
                  <item.icon className="h-5 w-5" />
                  <span>{item.label}</span>
                </button>
              ))}
            </nav>

            <div className="mt-auto rounded-[20px] border border-blue-100 bg-gradient-to-br from-blue-50 to-white p-4 shadow-sm dark:border-white/10 dark:from-blue-950/50 dark:to-white/5">
              <div className="mb-3 flex items-center gap-2">
                <ShieldCheck className="h-5 w-5 text-blue-600 dark:text-blue-300" />
                <p className="text-sm font-bold text-slate-900 dark:text-white">Figma Ready</p>
              </div>
              <p className="text-xs leading-5 text-slate-500 dark:text-slate-400">
                12 column grid, 24 px gutters, 16 to 20 px radii, editable chart and table components.
              </p>
            </div>
          </aside>

          <main className="w-full min-w-0 px-4 pb-10 pt-4 sm:px-6 lg:px-8">
            <div className="mx-auto flex max-w-[1500px] flex-col gap-6">
              <header className="sticky top-3 z-20 rounded-[24px] border border-white/70 bg-white/80 px-4 py-3 shadow-xl shadow-blue-950/5 backdrop-blur-2xl dark:border-white/10 dark:bg-slate-900/80 sm:px-5">
                <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
                  <div className="flex min-w-0 items-center gap-3">
                    <div className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-blue-600 text-white shadow-lg shadow-blue-600/25 lg:hidden">
                      JT
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.18em] text-blue-600 dark:text-blue-300">
                        <Sparkles className="h-3.5 w-3.5" />
                        Product analytics submission
                      </div>
                      <h1 className="mt-1 truncate text-2xl font-bold tracking-[-0.03em] text-slate-950 dark:text-white sm:text-3xl">
                        AI Image Evaluation Dashboard
                      </h1>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-2.5">
                    <div className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 shadow-sm dark:border-white/10 dark:bg-white/5 dark:text-slate-200">
                      <CalendarDays className="h-4 w-4 text-blue-600 dark:text-blue-300" />
                      <input
                        type="date"
                        defaultValue="2026-07-15"
                        className="bg-transparent outline-none"
                        aria-label="Dashboard date"
                      />
                    </div>
                    <button
                      onClick={() => setDarkMode((current) => !current)}
                      className="inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-700 shadow-sm transition hover:border-blue-200 hover:text-blue-700 dark:border-white/10 dark:bg-white/5 dark:text-slate-200 dark:hover:text-white"
                      aria-label="Toggle dark mode"
                    >
                      {darkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
                    </button>
                    <button className="relative inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-700 shadow-sm transition hover:border-blue-200 hover:text-blue-700 dark:border-white/10 dark:bg-white/5 dark:text-slate-200 dark:hover:text-white">
                      <Bell className="h-5 w-5" />
                      <span className="absolute right-2.5 top-2.5 h-2.5 w-2.5 rounded-full border-2 border-white bg-blue-600 dark:border-slate-900" />
                    </button>
                    <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white py-1.5 pl-2 pr-3 shadow-sm dark:border-white/10 dark:bg-white/5">
                      <div className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-blue-600 to-cyan-500 text-sm font-bold text-white">
                        MA
                      </div>
                      <div className="hidden sm:block">
                        <p className="text-sm font-bold text-slate-900 dark:text-white">Mohd Asad</p>
                        <p className="text-xs text-slate-500 dark:text-slate-400">Product intern</p>
                      </div>
                    </div>
                  </div>
                </div>
              </header>

              <section className="grid gap-4 rounded-[28px] border border-white/70 bg-white/70 p-4 shadow-xl shadow-blue-950/5 backdrop-blur-xl dark:border-white/10 dark:bg-white/[0.04] sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5">
                {kpis.map((kpi, index) => (
                  <motion.div
                    key={kpi.label}
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.45, delay: index * 0.05 }}
                    className="rounded-[20px] border border-slate-200/80 bg-white p-4 shadow-lg shadow-blue-950/[0.04] transition hover:-translate-y-0.5 hover:shadow-blue-950/10 dark:border-white/10 dark:bg-slate-900/80"
                  >
                    <div className="mb-5 flex items-start justify-between gap-3">
                      <IconBadge icon={kpi.icon} />
                      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-1 text-xs font-bold text-emerald-700 dark:bg-emerald-400/10 dark:text-emerald-300">
                        {kpi.trend.startsWith("+") ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />}
                        {kpi.trend}
                      </span>
                    </div>
                    <p className="text-sm font-medium text-slate-500 dark:text-slate-400">{kpi.label}</p>
                    <p className="mt-1 text-2xl font-black tracking-[-0.04em] text-slate-950 dark:text-white">{kpi.value}</p>
                    <p className="mt-2 text-xs font-medium text-slate-400 dark:text-slate-500">{kpi.helper}</p>
                  </motion.div>
                ))}
              </section>

              <section className="rounded-[28px] border border-white/70 bg-white/70 p-4 shadow-xl shadow-blue-950/5 backdrop-blur-xl dark:border-white/10 dark:bg-white/[0.04] sm:p-5">
                <div className="mb-5 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                  <div>
                    <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.18em] text-blue-600 dark:text-blue-300">
                      <ImageIcon className="h-4 w-4" />
                      AI image comparison
                    </div>
                    <h2 className="mt-2 text-2xl font-black tracking-[-0.04em] text-slate-950 dark:text-white">Indian government school classroom evaluation</h2>
                    <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500 dark:text-slate-400">
                      Three editable model cards compare realism, Indian context, and image quality from the human rating study.
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {(["7D", "30D", "90D"] as RangeKey[]).map((item) => (
                      <button
                        key={item}
                        onClick={() => setRange(item)}
                        className={`rounded-2xl px-4 py-2 text-sm font-bold transition ${
                          range === item
                            ? "bg-blue-600 text-white shadow-lg shadow-blue-700/25"
                            : "border border-slate-200 bg-white text-slate-600 hover:border-blue-200 hover:text-blue-700 dark:border-white/10 dark:bg-white/5 dark:text-slate-300 dark:hover:text-white"
                        }`}
                      >
                        {item}
                      </button>
                    ))}
                    <label className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm font-bold text-slate-600 dark:border-white/10 dark:bg-white/5 dark:text-slate-300">
                      Segment
                      <select
                        value={segment}
                        onChange={(event) => setSegment(event.target.value as Segment)}
                        className="bg-transparent font-bold text-blue-700 outline-none dark:text-blue-300"
                      >
                        {(["All", "Students", "Teachers", "Reviewers"] as Segment[]).map((item) => (
                          <option key={item} value={item}>
                            {item}
                          </option>
                        ))}
                      </select>
                    </label>
                  </div>
                </div>

                <div className="grid gap-5 xl:grid-cols-3">
                  {adjustedModels.map((model, index) => (
                    <motion.article
                      key={model.id}
                      initial={{ opacity: 0, scale: 0.98 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.5, delay: 0.08 * index }}
                      className="group overflow-hidden rounded-[24px] border border-slate-200 bg-white shadow-xl shadow-blue-950/[0.06] transition duration-300 hover:-translate-y-1 hover:shadow-blue-950/12 dark:border-white/10 dark:bg-slate-900"
                    >
                      <div className="relative aspect-[16/11] overflow-hidden bg-blue-50 dark:bg-slate-800">
                        <motion.img
                          src={model.image}
                          alt={`${model.name} Indian government school classroom output`}
                          className="h-full w-full object-cover"
                          whileHover={{ scale: 1.04 }}
                          transition={{ duration: 0.5 }}
                        />
                        <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-slate-950/45 to-transparent" />
                        <div className="absolute left-4 top-4 rounded-2xl bg-white/85 px-3 py-1.5 text-sm font-black text-blue-700 shadow-lg shadow-slate-950/10 backdrop-blur-xl dark:bg-slate-950/70 dark:text-blue-200">
                          Model {index + 1}
                        </div>
                      </div>
                      <div className="space-y-4 p-5">
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <h3 className="text-xl font-black tracking-[-0.03em] text-slate-950 dark:text-white">{model.name}</h3>
                            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Human evaluation score</p>
                          </div>
                          <div className="rounded-2xl bg-blue-600 px-3 py-2 text-right text-white shadow-lg shadow-blue-700/25">
                            <p className="text-xs font-bold uppercase tracking-wide text-blue-100">Rating</p>
                            <p className="text-lg font-black">{formatScore(model.rating)}/5</p>
                          </div>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {[
                            { label: "Realistic", value: model.realism },
                            { label: "Indian Context", value: model.indianContext },
                            { label: "Image Quality", value: model.imageQuality },
                          ].map((tag) => (
                            <span
                              key={tag.label}
                              className="rounded-full border border-blue-100 bg-blue-50 px-3 py-1.5 text-xs font-bold text-blue-700 dark:border-blue-400/20 dark:bg-blue-400/10 dark:text-blue-200"
                            >
                              {tag.label} {tag.value}%
                            </span>
                          ))}
                        </div>
                      </div>
                    </motion.article>
                  ))}
                </div>
              </section>

              <section className="grid gap-5 xl:grid-cols-[1.15fr_1fr]">
                <div className="rounded-[28px] border border-slate-200/80 bg-white p-5 shadow-xl shadow-blue-950/[0.05] dark:border-white/10 dark:bg-slate-900/80">
                  <div className="mb-5 flex items-start justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.18em] text-blue-600 dark:text-blue-300">
                        <BarChart3 className="h-4 w-4" />
                        Average score by model
                      </div>
                      <h2 className="mt-2 text-xl font-black tracking-[-0.03em] text-slate-950 dark:text-white">Bar chart comparison</h2>
                    </div>
                    <MoreHorizontal className="h-5 w-5 text-slate-400" />
                  </div>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={barData} barCategoryGap="24%">
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={darkMode ? "#1e293b" : "#e2e8f0"} />
                        <XAxis dataKey="model" axisLine={false} tickLine={false} tick={{ fill: darkMode ? "#94a3b8" : "#64748b", fontSize: 12 }} />
                        <YAxis domain={[0, 5]} axisLine={false} tickLine={false} tick={{ fill: darkMode ? "#94a3b8" : "#64748b", fontSize: 12 }} />
                        <Tooltip content={<CustomTooltip />} cursor={{ fill: darkMode ? "rgba(255,255,255,0.04)" : "rgba(37,99,235,0.06)" }} />
                        <Bar dataKey="score" name="Average score" radius={[14, 14, 6, 6]} animationDuration={900}>
                          {barData.map((entry) => (
                            <Cell key={entry.model} fill={entry.fill} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                <div className="rounded-[28px] border border-slate-200/80 bg-white p-5 shadow-xl shadow-blue-950/[0.05] dark:border-white/10 dark:bg-slate-900/80">
                  <div className="mb-5 flex items-start justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.18em] text-blue-600 dark:text-blue-300">
                        <LineChartIcon className="h-4 w-4" />
                        Rating distribution
                      </div>
                      <h2 className="mt-2 text-xl font-black tracking-[-0.03em] text-slate-950 dark:text-white">Line chart by star level</h2>
                    </div>
                    <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-bold text-blue-700 dark:bg-blue-400/10 dark:text-blue-200">Live</span>
                  </div>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={distributionData}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={darkMode ? "#1e293b" : "#e2e8f0"} />
                        <XAxis dataKey="rating" axisLine={false} tickLine={false} tick={{ fill: darkMode ? "#94a3b8" : "#64748b", fontSize: 12 }} />
                        <YAxis axisLine={false} tickLine={false} tick={{ fill: darkMode ? "#94a3b8" : "#64748b", fontSize: 12 }} />
                        <Tooltip content={<CustomTooltip />} />
                        <Line type="monotone" dataKey="count" name="Ratings" stroke="#2563eb" strokeWidth={3} dot={{ r: 4, fill: "#2563eb" }} activeDot={{ r: 7 }} animationDuration={900} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </section>

              <section className="grid gap-5 xl:grid-cols-[1fr_0.95fr]">
                <div className="rounded-[28px] border border-slate-200/80 bg-white p-5 shadow-xl shadow-blue-950/[0.05] dark:border-white/10 dark:bg-slate-900/80">
                  <div className="mb-5 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div>
                      <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.18em] text-blue-600 dark:text-blue-300">
                        <TableProperties className="h-4 w-4" />
                        Leaderboard
                      </div>
                      <h2 className="mt-2 text-xl font-black tracking-[-0.03em] text-slate-950 dark:text-white">Sortable model ranking</h2>
                    </div>
                    <label className="flex h-11 min-w-64 items-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 px-3 text-sm text-slate-500 dark:border-white/10 dark:bg-white/5 dark:text-slate-400">
                      <Search className="h-4 w-4" />
                      <input
                        value={query}
                        onChange={(event) => setQuery(event.target.value)}
                        placeholder="Filter models"
                        className="w-full bg-transparent font-medium outline-none placeholder:text-slate-400"
                      />
                    </label>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full min-w-[760px] border-separate border-spacing-y-2 text-left text-sm">
                      <thead>
                        <tr className="text-xs uppercase tracking-[0.12em] text-slate-400 dark:text-slate-500">
                          {[
                            ["rank", "Rank"],
                            ["model", "Model"],
                            ["averageScore", "Average Score"],
                            ["participants", "Participants"],
                            ["totalRatings", "Ratings"],
                            ["trend", "Trend"],
                          ].map(([key, label]) => (
                            <th key={key} className="px-4 py-2 font-black">
                              <button onClick={() => selectSort(key as SortKey)} className="inline-flex items-center gap-1 transition hover:text-blue-600">
                                {label}
                                <ChevronDown className={`h-3.5 w-3.5 transition ${sortKey === key && sortDirection === "desc" ? "rotate-180" : ""}`} />
                              </button>
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {filteredRows.map((row) => (
                          <tr key={row.id} className="group rounded-2xl bg-slate-50/80 transition hover:bg-blue-50 dark:bg-white/[0.04] dark:hover:bg-white/[0.08]">
                            <td className="rounded-l-2xl px-4 py-4 font-black text-slate-900 dark:text-white">#{row.rank}</td>
                            <td className="px-4 py-4">
                              <div className="flex items-center gap-3">
                                <span className={`grid h-10 w-10 place-items-center rounded-2xl bg-gradient-to-br ${row.gradient} text-white shadow-lg shadow-blue-800/15`}>
                                  <Medal className="h-5 w-5" />
                                </span>
                                <div>
                                  <p className="font-black text-slate-900 dark:text-white">{row.name}</p>
                                  <p className="text-xs font-medium text-slate-500 dark:text-slate-400">{row.status}</p>
                                </div>
                              </div>
                            </td>
                            <td className="px-4 py-4 font-black text-blue-700 dark:text-blue-300">{formatScore(row.averageScore)}/5</td>
                            <td className="px-4 py-4 text-slate-600 dark:text-slate-300">{row.participants}</td>
                            <td className="px-4 py-4 text-slate-600 dark:text-slate-300">{row.totalRatings}</td>
                            <td className="rounded-r-2xl px-4 py-4">
                              <span
                                className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-black ${
                                  row.change >= 0
                                    ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-400/10 dark:text-emerald-300"
                                    : "bg-rose-50 text-rose-700 dark:bg-rose-400/10 dark:text-rose-300"
                                }`}
                              >
                                {row.change >= 0 ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />}
                                {Math.abs(row.change)}%
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-1">
                  <div className="rounded-[28px] border border-slate-200/80 bg-white p-5 shadow-xl shadow-blue-950/[0.05] dark:border-white/10 dark:bg-slate-900/80">
                    <div className="mb-4 flex items-start justify-between gap-4">
                      <div>
                        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.18em] text-blue-600 dark:text-blue-300">
                          <Gauge className="h-4 w-4" />
                          Quality composition
                        </div>
                        <h2 className="mt-2 text-xl font-black tracking-[-0.03em] text-slate-950 dark:text-white">Donut chart</h2>
                      </div>
                    </div>
                    <div className="grid items-center gap-5 sm:grid-cols-[1fr_0.9fr]">
                      <div className="h-56">
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Tooltip content={<CustomTooltip />} />
                            <Pie data={donutData} innerRadius={62} outerRadius={88} paddingAngle={4} dataKey="value" nameKey="name" animationDuration={900}>
                              {donutData.map((entry) => (
                                <Cell key={entry.name} fill={entry.color} />
                              ))}
                            </Pie>
                          </PieChart>
                        </ResponsiveContainer>
                      </div>
                      <div className="space-y-3">
                        {donutData.map((item) => (
                          <div key={item.name} className="flex items-center justify-between gap-4">
                            <span className="flex items-center gap-2 text-sm font-bold text-slate-600 dark:text-slate-300">
                              <span className="h-2.5 w-2.5 rounded-full" style={{ background: item.color }} />
                              {item.name}
                            </span>
                            <span className="text-sm font-black text-slate-950 dark:text-white">{item.value}%</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="rounded-[28px] border border-slate-200/80 bg-white p-5 shadow-xl shadow-blue-950/[0.05] dark:border-white/10 dark:bg-slate-900/80">
                    <div className="mb-4 flex items-center justify-between">
                      <div>
                        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.18em] text-blue-600 dark:text-blue-300">
                          <Activity className="h-4 w-4" />
                          Rating distribution
                        </div>
                        <h2 className="mt-2 text-xl font-black tracking-[-0.03em] text-slate-950 dark:text-white">30 human ratings</h2>
                      </div>
                    </div>
                    <div className="space-y-3">
                      {distributionData.map((item, index) => {
                        const width = `${Math.min(100, item.count * 6)}%`;
                        return (
                          <div key={item.rating}>
                            <div className="mb-1 flex justify-between text-xs font-bold text-slate-500 dark:text-slate-400">
                              <span>{item.rating}</span>
                              <span>{item.count}</span>
                            </div>
                            <div className="h-2.5 overflow-hidden rounded-full bg-slate-100 dark:bg-white/10">
                              <motion.div
                                className="h-full rounded-full bg-gradient-to-r from-blue-600 to-cyan-400"
                                initial={{ width: 0 }}
                                animate={{ width }}
                                transition={{ duration: 0.65, delay: index * 0.04 }}
                              />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </section>

              <section className="grid gap-5 xl:grid-cols-[1fr_0.85fr]">
                <div className="rounded-[28px] border border-slate-200/80 bg-white p-5 shadow-xl shadow-blue-950/[0.05] dark:border-white/10 dark:bg-slate-900/80">
                  <div className="mb-5 flex items-center justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.18em] text-blue-600 dark:text-blue-300">
                        <UserRound className="h-4 w-4" />
                        Participant feedback
                      </div>
                      <h2 className="mt-2 text-xl font-black tracking-[-0.03em] text-slate-950 dark:text-white">Professional review cards</h2>
                    </div>
                  </div>
                  <div className="grid gap-4 lg:grid-cols-3">
                    {feedback.map((item, index) => (
                      <motion.article
                        key={item.name}
                        initial={{ opacity: 0, y: 14 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.45, delay: index * 0.06 }}
                        className="rounded-[22px] border border-slate-200 bg-slate-50 p-5 dark:border-white/10 dark:bg-white/[0.04]"
                      >
                        <div className="mb-4 flex items-center justify-between gap-3">
                          <Stars value={item.rating} />
                          <span className="rounded-full bg-white px-2.5 py-1 text-xs font-black text-blue-700 shadow-sm dark:bg-white/10 dark:text-blue-200">{item.model}</span>
                        </div>
                        <p className="min-h-24 text-sm leading-6 text-slate-600 dark:text-slate-300">"{item.quote}"</p>
                        <div className="mt-5 flex items-center gap-3 border-t border-slate-200 pt-4 dark:border-white/10">
                          <div className="grid h-10 w-10 place-items-center rounded-2xl bg-blue-100 text-sm font-black text-blue-700 dark:bg-blue-400/10 dark:text-blue-200">
                            {item.name
                              .split(" ")
                              .map((part) => part[0])
                              .join("")}
                          </div>
                          <div>
                            <p className="text-sm font-black text-slate-900 dark:text-white">{item.name}</p>
                            <p className="text-xs font-medium text-slate-500 dark:text-slate-400">{item.role}</p>
                          </div>
                        </div>
                      </motion.article>
                    ))}
                  </div>
                </div>

                <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-1">
                  <div className="rounded-[28px] border border-slate-200/80 bg-white p-5 shadow-xl shadow-blue-950/[0.05] dark:border-white/10 dark:bg-slate-900/80">
                    <div className="mb-5 flex items-center gap-3">
                      <IconBadge icon={FileText} />
                      <div>
                        <div className="text-xs font-bold uppercase tracking-[0.18em] text-blue-600 dark:text-blue-300">Prompt details</div>
                        <h2 className="mt-1 text-xl font-black tracking-[-0.03em] text-slate-950 dark:text-white">Evaluation metadata</h2>
                      </div>
                    </div>
                    <div className="grid gap-3 text-sm">
                      {[
                        ["Prompt Category", "Education"],
                        ["Evaluation Type", "Human Rating"],
                        ["Generation Date", "15 July 2026"],
                        ["Ratings", "30"],
                      ].map(([label, value]) => (
                        <div key={label} className="flex items-center justify-between rounded-2xl bg-slate-50 px-4 py-3 dark:bg-white/[0.04]">
                          <span className="font-semibold text-slate-500 dark:text-slate-400">{label}</span>
                          <span className="font-black text-slate-950 dark:text-white">{value}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="rounded-[28px] border border-blue-200/80 bg-gradient-to-br from-blue-600 to-cyan-500 p-5 text-white shadow-xl shadow-blue-700/20">
                    <div className="mb-5 flex items-start justify-between gap-4">
                      <div>
                        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.18em] text-blue-100">
                          <Sparkles className="h-4 w-4" />
                          Quick actions
                        </div>
                        <h2 className="mt-2 text-xl font-black tracking-[-0.03em]">Shareable dashboard</h2>
                      </div>
                    </div>
                    <div className="grid gap-3">
                      {[
                        { label: "View All Submissions", icon: TableProperties },
                        { label: "Download Report", icon: Download },
                        { label: "Share Dashboard", icon: Share2 },
                      ].map((action) => (
                        <button
                          key={action.label}
                          className="flex items-center justify-between rounded-2xl bg-white/15 px-4 py-3 text-left text-sm font-black text-white backdrop-blur transition hover:bg-white/25"
                        >
                          <span className="flex items-center gap-3">
                            <action.icon className="h-5 w-5" />
                            {action.label}
                          </span>
                          <ArrowUp className="h-4 w-4 rotate-45" />
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </section>

              <section className="rounded-[28px] border border-slate-200/80 bg-white p-5 shadow-xl shadow-blue-950/[0.05] dark:border-white/10 dark:bg-slate-900/80">
                <div className="mb-5 flex items-center gap-3">
                  <IconBadge icon={LayoutDashboard} />
                  <div>
                    <div className="text-xs font-bold uppercase tracking-[0.18em] text-blue-600 dark:text-blue-300">Figma-ready layout</div>
                    <h2 className="mt-1 text-xl font-black tracking-[-0.03em] text-slate-950 dark:text-white">Auto layout blueprint</h2>
                  </div>
                </div>
                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                  {[
                    ["Frame", "Desktop 1440 px, 12 columns, 24 px gutters, 32 px page margin"],
                    ["Sidebar", "Fixed 288 px width, vertical auto layout, 12 px item gap"],
                    ["Cards", "16 to 20 px radius, 20 px internal padding, soft 0 18 45 shadow"],
                    ["Components", "Charts, table rows, KPI cards, filters, buttons remain editable layers"],
                  ].map(([title, copy]) => (
                    <div key={title} className="rounded-[20px] border border-slate-200 bg-slate-50 p-4 dark:border-white/10 dark:bg-white/[0.04]">
                      <p className="text-sm font-black text-slate-950 dark:text-white">{title}</p>
                      <p className="mt-2 text-sm leading-6 text-slate-500 dark:text-slate-400">{copy}</p>
                    </div>
                  ))}
                </div>
              </section>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
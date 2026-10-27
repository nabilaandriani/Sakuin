import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Sidebar from "../components/Sidebar";
import "../style/transaction.css";
import { useStreakContext } from "../components/StreakContext";
import { useMonthlyBudget } from "../src/hooks/Usemonthlybudget";
import {
  filterByMonth,
  formatRupiah,
  getLocalDateKey,
  toDateKey,
} from "../src/utils/monthlyAllowance";

import {
  Search,
  ChevronDown,
  Brain,
  Utensils,
  Bus,
  Wallet,
  Clapperboard,
  ShoppingBag,
  FileText,
  Heart,
  GraduationCap,
  MoreHorizontal,
  ArrowDownLeft,
  ArrowUpRight,
  Plus,
  X,
  TrendingUp,
  SlidersHorizontal,
  Settings2,
  Check,
  AlertOctagon,
  ArrowRight,
  BookOpen,
  MousePointerClick,
  HelpCircle,
  Trash2,
  Edit2,
  CheckCircle,
  AlertTriangle,
  Home,
  Target,
  ChevronLeft,
  ChevronRight,
  PieChart,
} from "lucide-react";

/* =========================================================
   API
========================================================= */

const BACKEND_URL = "http://localhost:3000";

const apiClient = axios.create({
  baseURL: BACKEND_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error),
);

/* =========================================================
   CONSTANT
========================================================= */

const createDefaultForm = () => ({
  title: "",
  category: "",
  amount: "",
  type: "expense",
  date: getLocalDateKey(),
  savingId: "",
});

const CATEGORY_MAP = {
  Food: "Makan dan Minuman",
  FoodAndDrinks: "Makan dan Minuman",
  "Food & Drink": "Makan dan Minuman",
  Entertainment: "Hiburan",
  Transportation: "Transportasi",
  Shopping: "Belanja",
  Salary: "Gaji/ Pemasukan",
  Income: "Gaji/ Pemasukan",
  "Gaji / Pemasukan": "Gaji/ Pemasukan",
  Health: "Kesehatan",
  Education: "Pendidikan",
  Utilities: "Lainnya",
  Rent: "Lainnya",
  Bills: "Lainnya",
  Others: "Lainnya",
};

const DREAM_CATEGORY = "Dream Saving";

const ITEMS_PER_PAGE = 5;

const CATEGORY_OPTIONS = [
  { name: "Semua Kategori", icon: <MoreHorizontal size={14} /> },
  { name: "Makan dan Minuman", icon: <Utensils size={14} /> },
  { name: "Investasi", icon: <TrendingUp size={14} /> },
  { name: "Transportasi", icon: <Bus size={14} /> },
  { name: "Hiburan", icon: <Clapperboard size={14} /> },
  { name: "Belanja", icon: <ShoppingBag size={14} /> },
  { name: "Gaji/ Pemasukan", icon: <FileText size={14} /> },
  { name: "Kesehatan", icon: <Heart size={14} /> },
  { name: "Pendidikan", icon: <GraduationCap size={14} /> },
  { name: "Tagihan/ Kos", icon: <Home size={14} /> },
  { name: DREAM_CATEGORY, icon: <Target size={14} /> },
  { name: "Lainnya", icon: <HelpCircle size={14} /> },
];

const CATEGORY_ICONS = {
  "Makan dan Minuman": <Utensils size={18} />,
  Transportasi: <Bus size={18} />,
  Hiburan: <Clapperboard size={18} />,
  Belanja: <ShoppingBag size={18} />,
  Investasi: <TrendingUp size={18} />,
  "Gaji/ Pemasukan": <Wallet size={18} />,
  Kesehatan: <Heart size={18} />,
  Pendidikan: <GraduationCap size={18} />,
  "Tagihan/ Kos": <Home size={18} />,
  [DREAM_CATEGORY]: <Target size={18} />,
  Lainnya: <MoreHorizontal size={18} />,
};

/* =========================================================
   HELPER
========================================================= */

function getUser() {
  try {
    const data = localStorage.getItem("userData");
    if (!data) return null;
    return JSON.parse(data);
  } catch (error) {
    console.error("userData tidak valid:", error);
    return null;
  }
}

function getCategoryFromAI(category) {
  if (!category) return "Lainnya";
  return CATEGORY_MAP[category] || category || "Lainnya";
}

function getPageNumbers(current, total) {
  if (total <= 5) {
    return Array.from({ length: total }, (_, i) => i + 1);
  }
  const pages = [1];
  const start = Math.max(2, current - 1);
  const end = Math.min(total - 1, current + 1);
  if (start > 2) pages.push("...");
  for (let i = start; i <= end; i++) pages.push(i);
  if (end < total - 1) pages.push("...");
  pages.push(total);
  return pages;
}

// function buildLocalInsight({
//   totalInflow,
//   totalOutflow,
//   monthlyLimit,
//   topCategory,
// }) {
//   if (monthlyLimit > 0) {
//     const used = Math.round((totalOutflow / monthlyLimit) * 100);
//     if (used >= 100) {
//       return {
//         headline: "Jatah Bulanan Terlampaui",
//         insight: `Pengeluaran bulan ini sudah ${used}% dari jatah. Pos terbesar: ${topCategory}.`,
//       };
//     }
//     if (used >= 80) {
//       return {
//         headline: "Jatah Hampir Habis",
//         insight: `${used}% jatah sudah terpakai. Pos terbesar: ${topCategory}.`,
//       };
//     }
//     return {
//       headline: "Pengeluaran Masih Aman",
//       insight: `Baru ${used}% jatah terpakai bulan ini. Pos terbesar: ${topCategory}.`,
//     };
//   }
//   return {
//     headline: "Ringkasan Bulan Ini",
//     insight: `Pemasukan Rp ${formatRupiah(totalInflow)}, pengeluaran Rp ${formatRupiah(totalOutflow)}. Pos terbesar: ${topCategory}.`,
//   };
// }

function normalizeDream(raw) {
  const target = Number(raw.target ?? 0);
  const saved = Number(raw.terkumpul ?? 0);
  return {
    id: raw.id,
    name: raw.nama ?? "Impian",
    target,
    saved,
    paused: Boolean(raw.dijeda),
    completed: Boolean(raw.tercapai) || (target > 0 && saved >= target),
  };
}

/* =========================================================
   COMPONENT
========================================================= */

export default function Transaction() {
  const { recordTransaction } = useStreakContext();
  const navigate = useNavigate();
  const toastTimerRef = useRef(null);
  const aiRequestRef = useRef(0);
  const aiLastRef = useRef({ key: "", retryAt: 0 });
  const user = useMemo(() => getUser(), []);

  /* =======================================================
     UI STATE
  ======================================================= */
  const [openDropdown, setOpenDropdown] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("Semua Kategori");
  const [searchQuery, setSearchQuery] = useState("");
  const [openModal, setOpenModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [deleteModal, setDeleteModal] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);
  const [openLimitModal, setOpenLimitModal] = useState(false);
  const [activeTab, setActiveTab] = useState("all");
  const [showGuide, setShowGuide] = useState(false);
  const [showBudgetWarning, setShowBudgetWarning] = useState(false);
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  /* =======================================================
     DATA STATE
  ======================================================= */
  const [transactions, setTransactions] = useState([]);
  const [savings, setSavings] = useState([]);
  const [formData, setFormData] = useState(createDefaultForm);

  /* =======================================================
     JATAH BULANAN
  ======================================================= */
  const { monthlyLimit, setMonthlyLimit } = useMonthlyBudget(user?.id);
  const hasSetBudget = monthlyLimit > 0;
  const [tempLimit, setTempLimit] = useState("");

  /* =======================================================
     TOAST
  ======================================================= */
  const [toastMessage, setToastMessage] = useState("");
  const [showToast, setShowToast] = useState(false);
  const [toastType, setToastType] = useState("success");

  /* =======================================================
     AI
  ======================================================= */
  const [aiHeadline, setAiHeadline] = useState("⏳ Menganalisis...");
  const [aiInsight, setAiInsight] = useState(
    "AI sedang membaca pola keuanganmu...",
  );
  const [aiLoading, setAiLoading] = useState(false);
  const [aiPredictLoading, setAiPredictLoading] = useState(false);

  /* =======================================================
     FETCH TRANSACTIONS
  ======================================================= */
  const fetchTransactions = useCallback(async () => {
    try {
      const currentUser = getUser();
      if (!currentUser?.id) {
        navigate("/login");
        return;
      }
      const response = await apiClient.get(
        `/api/transactions?userId=${currentUser.id}`,
      );
      const data = response?.data?.data;
      if (Array.isArray(data)) {
        setTransactions(data);
      } else {
        setTransactions([]);
      }
    } catch (error) {
      console.error("Gagal mengambil transaksi:", error);
      if (error.response?.status === 401 || error.response?.status === 403) {
        localStorage.removeItem("token");
        navigate("/login");
      }
    }
  }, [navigate]);

  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions]);

  const fetchSavings = useCallback(async () => {
    try {
      const res = await apiClient.get("/api/savings");
      setSavings(res.data?.data || []);
    } catch (error) {
      console.error("Gagal mengambil savings:", error);
    }
  }, []);

  useEffect(() => {
    fetchSavings();
  }, [fetchSavings]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedCategory, activeTab, dateFrom, dateTo]);

  /* =======================================================
     GUIDE
  ======================================================= */
  useEffect(() => {
    const currentUser = getUser();
    if (!currentUser?.id) return;
    const guideKey = `cerminsaku_guide_seen_${currentUser.id}`;
    const hasSeenGuide = localStorage.getItem(guideKey);
    if (!hasSeenGuide) {
      setShowGuide(true);
      localStorage.setItem(guideKey, "true");
    }
  }, []);

  /* =======================================================
     TOAST
  ======================================================= */
  const triggerToast = useCallback((message, type = "success") => {
    setToastMessage(message);
    setToastType(type);
    setShowToast(true);
    if (toastTimerRef.current) {
      clearTimeout(toastTimerRef.current);
    }
    toastTimerRef.current = setTimeout(() => {
      setShowToast(false);
    }, 3500);
  }, []);

  useEffect(() => {
    return () => {
      if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    };
  }, []);

  /* =======================================================
     TOTAL TRANSACTION & BUDGET CALCULATION
  ======================================================= */
  const totalInflow = transactions
    .filter((item) => item.type === "income")
    .reduce((total, item) => total + Number(item.amount || 0), 0);

  const totalOutflow = transactions
    .filter((item) => item.type === "expense")
    .reduce((total, item) => total + Number(item.amount || 0), 0);

  const netSurplus = totalInflow - totalOutflow;

  const currentMonthTransactions = useMemo(
    () => filterByMonth(transactions),
    [transactions],
  );
  const spentThisMonth = useMemo(
    () =>
      currentMonthTransactions
        .filter((t) => t.type === "expense")
        .reduce((sum, t) => sum + Number(t.amount || 0), 0),
    [currentMonthTransactions],
  );

  const remainingBudget = monthlyLimit - spentThisMonth;
  const budgetPercentage =
    monthlyLimit > 0
      ? Math.min(Math.round((spentThisMonth / monthlyLimit) * 100), 100)
      : 0;

  /* =======================================================
     DREAM SAVING
  ======================================================= */
  const dreams = useMemo(() => savings.map(normalizeDream), [savings]);
  const dreamById = useMemo(
    () => new Map(dreams.map((dream) => [String(dream.id), dream])),
    [dreams],
  );
  const activeDreams = useMemo(
    () => dreams.filter((dream) => !dream.paused && !dream.completed),
    [dreams],
  );

  const dreamOptions = useMemo(() => {
    const selected = dreamById.get(String(formData.savingId));
    if (selected && !activeDreams.some((dream) => dream.id === selected.id)) {
      return [selected, ...activeDreams];
    }
    return activeDreams;
  }, [activeDreams, dreamById, formData.savingId]);

  const selectedDream = dreamById.get(String(formData.savingId));

  /* =======================================================
       AI INSIGHT 
    ======================================================= */

  const fetchAIInsight = useCallback(async () => {
    if (transactions.length === 0) {
      setAiHeadline("Belum Ada Data");
      setAiInsight(
        "Tambahkan transaksi terlebih dahulu agar AI dapat memberikan insight.",
      );
      return;
    }

    try {
      setAiLoading(true);

      const expenseTransactions = transactions.filter(
        (item) => item.type === "expense",
      );

      const categoryTotals = {};
      expenseTransactions.forEach((item) => {
        const category = item.category || "Lainnya";
        categoryTotals[category] =
          (categoryTotals[category] || 0) + Number(item.amount || 0);
      });

      const sortedCategories = Object.entries(categoryTotals).sort(
        (a, b) => b[1] - a[1],
      );
      const topCategory = sortedCategories[0]?.[0] || "Lainnya";

      const response = await apiClient.post("/api/ai/transaction-insight", {
        totalInflow,
        totalOutflow,
        monthlyLimit,
        topCategory,
      });

      const data = response?.data || {};
      setAiHeadline(data.headline || "Insight Keuangan");
      setAiInsight(data.insight || "Belum ada insight yang tersedia.");
    } catch (error) {
      console.error("AI Insight Error:", error);
      setAiHeadline("AI Tidak Aktif");
      setAiInsight("Insight belum tersedia. Pastikan layanan AI sedang aktif.");
    } finally {
      setAiLoading(false);
    }
  }, [transactions, totalInflow, totalOutflow, monthlyLimit]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchAIInsight();
    }, 500);
    return () => clearTimeout(timer);
  }, [fetchAIInsight]);

  /* =======================================================
       AI CATEGORY PREDICTION
    ======================================================= */
  const predictCategory = async () => {
    if (!formData.amount || !formData.date) {
      triggerToast("Harap isi nominal dan tanggal terlebih dahulu.", "danger");
      return;
    }
    try {
      setAiPredictLoading(true);
      const response = await apiClient.post("/api/ai/predict", {
        date: formData.date,
        amount_rupiah: Number(formData.amount),
        transaction_type: formData.type === "income" ? "Income" : "Expense",
        top_k: 3,
      });
      const data = response?.data || {};
      const predictedCategory = getCategoryFromAI(data.predicted_category);
      setFormData((previous) => ({
        ...previous,
        category: predictedCategory,
      }));
      triggerToast(`AI memilih kategori: ${predictedCategory}`, "success");
    } catch (error) {
      console.error("AI Prediction Error:", error);
      triggerToast("AI Service tidak tersedia saat ini.", "danger");
    } finally {
      setAiPredictLoading(false);
    }
  };

  /* =======================================================
     DELETE
  ======================================================= */
  const confirmDelete = (id) => {
    setItemToDelete(id);
    setDeleteModal(true);
  };

  const executeDelete = async () => {
    if (!itemToDelete) return;
    try {
      const currentUser = getUser();
      if (!currentUser?.id) {
        navigate("/login");
        return;
      }
      await apiClient.delete(
        `/api/transactions/${itemToDelete}?userId=${currentUser.id}`,
      );
      setDeleteModal(false);
      setItemToDelete(null);
      await Promise.all([fetchTransactions(), fetchSavings()]);
      triggerToast("Data transaksi berhasil dihapus.", "success");
    } catch (error) {
      console.error("Gagal menghapus:", error);
      triggerToast(
        error.response?.data?.message || "Gagal menghapus transaksi.",
        "danger",
      );
    }
  };

  /* =======================================================
     CREATE / EDIT
  ======================================================= */
  const openCreateModal = () => {
    setEditingId(null);
    setFormData(createDefaultForm());
    setOpenModal(true);
  };

  const openEditModal = (item) => {
    setEditingId(item.id);
    setFormData({
      title: item.title || "",
      category: item.category || "",
      amount: item.amount ?? "",
      type: item.type || "expense",
      date: item.date ? toDateKey(item.date) : getLocalDateKey(),
      savingId:
        (item.saving_id ?? item.savingId) != null
          ? String(item.saving_id ?? item.savingId)
          : "",
    });
    setOpenModal(true);
  };

  const openBudgetModal = () => {
    setTempLimit(monthlyLimit > 0 ? String(monthlyLimit) : "");
    setOpenLimitModal(true);
  };

  const handleCategoryChange = (category) => {
    setFormData((previous) => ({
      ...previous,
      category,
      savingId:
        category === DREAM_CATEGORY && activeDreams.length === 1
          ? String(activeDreams[0].id)
          : "",
    }));
  };

  const getCategoryLabel = (item) => {
    const category = item.category || "Lainnya";
    if (category !== DREAM_CATEGORY) return category;
    const dream = dreamById.get(String(item.saving_id ?? item.savingId ?? ""));
    return dream ? `${category}: ${dream.name}` : category;
  };

  const handleTriggerCreateTransaction = () => {
    if (!hasSetBudget) {
      setShowBudgetWarning(true);
      return;
    }
    openCreateModal();
  };

  /* =======================================================
     SUBMIT TRANSACTION
  ======================================================= */
  const handleSubmit = async () => {
    const currentUser = getUser();
    if (!currentUser?.id) {
      navigate("/login");
      return;
    }
    if (!formData.title.trim()) {
      triggerToast("Deskripsi transaksi wajib diisi.", "danger");
      return;
    }
    if (!formData.amount || Number(formData.amount) <= 0) {
      triggerToast("Nominal transaksi harus lebih dari 0.", "danger");
      return;
    }
    if (!formData.date) {
      triggerToast("Tanggal transaksi wajib diisi.", "danger");
      return;
    }
    const isDreamTransaction =
      formData.type === "expense" && formData.category === DREAM_CATEGORY;
    if (isDreamTransaction && !formData.savingId) {
      triggerToast("Pilih impian tujuan terlebih dahulu.", "danger");
      return;
    }

    try {
      const payload = {
        title: formData.title.trim(),
        category: formData.category || "Lainnya",
        amount: Number(formData.amount),
        type: formData.type,
        date: formData.date,
        saving_id: isDreamTransaction ? formData.savingId : null,
        user_id: currentUser.id,
      };

      if (editingId) {
        await apiClient.put(`/api/transactions/${editingId}`, payload);
      } else {
        await apiClient.post("/api/transactions", payload);
      }

      setOpenModal(false);
      setEditingId(null);
      setFormData(createDefaultForm());
      await Promise.all([fetchTransactions(), fetchSavings()]);
      recordTransaction();

      const dreamName = isDreamTransaction
        ? dreamById.get(String(formData.savingId))?.name
        : null;
      triggerToast(
        dreamName
          ? `Dana berhasil ditambahkan ke impian ${dreamName}.`
          : editingId
            ? "Transaksi berhasil diperbarui."
            : "Transaksi berhasil ditambahkan.",
        "success",
      );
    } catch (error) {
      console.error("Submit transaction error:", error);
      if (error.response?.status === 401 || error.response?.status === 403) {
        localStorage.removeItem("token");
        navigate("/login");
        return;
      }
      triggerToast(
        error.response?.data?.message ||
          "Terjadi kesalahan saat menyimpan transaksi.",
        "danger",
      );
    }
  };

  /* =======================================================
     FILTER & PAGINATION
  ======================================================= */
  const normalizedSearch = searchQuery.toLowerCase().trim();

  const filteredTransactions = transactions.filter((item) => {
    const title = String(item.title || "").toLowerCase();
    const category = String(item.category || "Lainnya").toLowerCase();
    const matchesTab = activeTab === "all" || item.type === activeTab;
    const matchesCategory =
      selectedCategory === "Semua Kategori" ||
      item.category === selectedCategory;
    const matchesSearch =
      title.includes(normalizedSearch) || category.includes(normalizedSearch);
    const itemDate = toDateKey(item.date);
    const matchesDate =
      (!dateFrom || itemDate >= dateFrom) && (!dateTo || itemDate <= dateTo);
    return matchesTab && matchesCategory && matchesSearch && matchesDate;
  });

  const rangeInflow = filteredTransactions
    .filter((t) => t.type === "income")
    .reduce((sum, t) => sum + Number(t.amount || 0), 0);
  const rangeOutflow = filteredTransactions
    .filter((t) => t.type === "expense")
    .reduce((sum, t) => sum + Number(t.amount || 0), 0);
  const hasDateFilter = Boolean(dateFrom || dateTo);
  const rangeNet = rangeInflow - rangeOutflow;
  const totalPages = Math.max(
    1,
    Math.ceil(filteredTransactions.length / ITEMS_PER_PAGE),
  );
  const safePage = Math.min(currentPage, totalPages);
  const startIndex = (safePage - 1) * ITEMS_PER_PAGE;
  const paginatedTransactions = filteredTransactions.slice(
    startIndex,
    startIndex + ITEMS_PER_PAGE,
  );

  /* =======================================================
     JATAH BULANAN SAVE
  ======================================================= */
  const saveBudget = () => {
    const currentUser = getUser();
    if (!currentUser?.id) {
      navigate("/login");
      return;
    }
    const value = Number(tempLimit);
    if (!value || value <= 0) {
      triggerToast("Jatah bulanan harus lebih dari Rp 0.", "danger");
      return;
    }
    setMonthlyLimit(value);
    setOpenLimitModal(false);
    triggerToast("Jatah bulanan berhasil diperbarui.", "success");
  };

  /* =======================================================
     RENDER
  ======================================================= */
  return (
    <div className="dashboard">
      <Sidebar activePage="transactions" />

      {/* =====================================================
          TOAST
      ===================================================== */}
      <div className={`premium-toast ${showToast ? "show" : ""} ${toastType}`}>
        <div className="toast-content">
          <div className="toast-icon-wrapper">
            {toastType === "success" ? (
              <CheckCircle size={20} />
            ) : (
              <AlertTriangle size={20} />
            )}
          </div>
          <div className="toast-text-group">
            <span className="toast-title">
              {toastType === "success" ? "Informasi Sistem" : "Peringatan"}
            </span>
            <span className="toast-desc">{toastMessage}</span>
          </div>
        </div>
        <div className="toast-progress-bar"></div>
      </div>

      {/* =====================================================
          MAIN CONTENT
      ===================================================== */}
      <div className="viewport-content-wrapper">
        <div className="ambient-blur-sphere sphere-one"></div>
        <div className="ambient-blur-sphere sphere-two"></div>

        <div className="viewport-container">
          {/* =================================================
              HEADER
          ================================================= */}
          <header className="glass-action-header">
            <div className="brand-intel">
              <h1>Arus Kas</h1>
              <p>Catat pembukuan kas masuk dan keluar secara terstruktur.</p>
            </div>

            <div className="header-utilities">
              <button
                className="utility-secondary-btn"
                onClick={() => setShowGuide(true)}
              >
                <BookOpen size={14} />
                <span>Panduan</span>
              </button>
              <button
                className="utility-secondary-btn"
                onClick={openBudgetModal}
              >
                <Settings2 size={14} />
                <span>Atur Budget</span>
              </button>
              <button
                className="neon-emerald-btn"
                onClick={handleTriggerCreateTransaction}
              >
                <Plus size={15} strokeWidth={2.5} />
                <span>Catat Transaksi</span>
              </button>
            </div>
          </header>

          {/* =================================================
              WORKSPACE
          ================================================= */}
          <div className="bento-asymmetric-workspace">
            <div className="intel-core-column">
              {/* NET SURPLUS */}
              <div
                className={`aurora-mesh-card ${netSurplus < 0 ? "is-negative" : ""}`}
              >
                <div className="mesh-overlay-glow"></div>
                <div className="card-inner-content">
                  <div className="card-top-meta">
                    <span className="system-tag">NET SURPLUS PORTFOLIO</span>
                    <div className="badge-trend">
                      <TrendingUp size={12} />
                      <span>
                        {totalInflow > 0
                          ? `${netSurplus >= 0 ? "+" : ""}${((netSurplus / totalInflow) * 100).toFixed(1)}%`
                          : "0%"}
                      </span>
                    </div>
                  </div>
                  <h2>Rp {formatRupiah(netSurplus)}</h2>
                  <div className="card-bottom-meta">
                    <p>
                      Dana bersih aktif dari alur kas masuk dikurangi beban
                      transaksi keluar.
                    </p>
                  </div>
                </div>
              </div>

              {/* INFLOW / OUTFLOW */}
              <div className="twin-bento-grid">
                <div className="bento-subcard inflow">
                  <div className="subcard-header">
                    <div className="icon-circle">
                      <ArrowDownLeft size={14} />
                    </div>
                    <span className="subcard-title">Inflow</span>
                  </div>
                  <h3>Rp {formatRupiah(totalInflow)}</h3>
                  <span className="subcard-footer">Total Pendapatan</span>
                </div>

                <div className="bento-subcard outflow">
                  <div className="subcard-header">
                    <div className="icon-circle">
                      <ArrowUpRight size={14} />
                    </div>
                    <span className="subcard-title">Outflow</span>
                  </div>
                  <h3>Rp {formatRupiah(totalOutflow)}</h3>
                  <span className="subcard-footer">Total Pengeluaran</span>
                </div>
              </div>
            </div>

            <div
              className="right-stack"
              style={{ display: "flex", flexDirection: "column", gap: "16px" }}
            >
              {/* JATAH BULANAN */}
              <div
                className="bento-subcard budget"
                style={{
                  flex: 1,
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                  padding: "20px",
                  background: "var(--glass-panel)",
                  border: "1px solid var(--border-light)",
                  borderRadius: "24px",
                  boxShadow: "var(--subtle-shadow)",
                }}
              >
                <div
                  className="subcard-header"
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      gap: "8px",
                      alignItems: "center",
                    }}
                  >
                    <div
                      className="icon-circle"
                      style={{
                        background: "#F0FDF4",
                        color: "#16A34A",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <PieChart size={14} />
                    </div>
                    <span
                      className="subcard-title"
                      style={{ fontWeight: "600" }}
                    >
                      Jatah Bulanan
                    </span>
                  </div>

                  <button
                    onClick={openBudgetModal}
                    style={{
                      background: "transparent",
                      border: "none",
                      cursor: "pointer",
                      color: "#94A3B8",
                    }}
                    title="Ubah Jatah Bulanan"
                  >
                    <Settings2 size={14} />
                  </button>
                </div>

                <div style={{ margin: "16px 0" }}>
                  <h3
                    style={{
                      fontSize: "1.25rem",
                      fontWeight: "700",
                      margin: "0 0 4px 0",
                      color:
                        monthlyLimit === 0
                          ? "#6B7280"
                          : remainingBudget < 0
                            ? "#EF4444"
                            : "#0F172A",
                    }}
                  >
                    {monthlyLimit === 0
                      ? "Belum Diatur"
                      : `Rp ${formatRupiah(Math.abs(remainingBudget))}`}
                  </h3>
                  <span
                    className="subcard-footer"
                    style={{ color: "#94A3B8", fontSize: "0.75rem" }}
                  >
                    {monthlyLimit === 0
                      ? "Tentukan batas pengeluaran"
                      : remainingBudget < 0
                        ? "Melebihi batas bulan ini"
                        : "Sisa jatah bulan ini"}
                  </span>
                </div>

                {monthlyLimit > 0 ? (
                  <div
                    className="budget-progress-wrapper"
                    style={{ marginTop: "auto" }}
                  >
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        fontSize: "0.7rem",
                        color: "#64748B",
                        marginBottom: "8px",
                        fontWeight: "500",
                      }}
                    >
                      <span>Terpakai {budgetPercentage}%</span>
                      <span>Dari Rp {formatRupiah(monthlyLimit)}</span>
                    </div>
                    <div
                      style={{
                        width: "100%",
                        height: "6px",
                        background: "#F1F5F9",
                        borderRadius: "4px",
                        overflow: "hidden",
                      }}
                    >
                      <div
                        style={{
                          width: `${budgetPercentage}%`,
                          height: "100%",
                          background:
                            budgetPercentage >= 90
                              ? "#EF4444"
                              : budgetPercentage >= 75
                                ? "#F59E0B"
                                : "#10B981",
                          borderRadius: "4px",
                          transition: "width 0.5s ease-in-out",
                        }}
                      />
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={openBudgetModal}
                    style={{
                      marginTop: "auto",
                      padding: "8px 12px",
                      background: "#10B981",
                      color: "white",
                      border: "none",
                      borderRadius: "8px",
                      fontSize: "12px",
                      fontWeight: "600",
                      cursor: "pointer",
                      transition: "background 0.2s",
                    }}
                  >
                    Atur Sekarang
                  </button>
                )}
              </div>

              {/* AI INSIGHT */}
              <div className="ai-insight-card">
                <div className="ai-insight-header">
                  <Brain size={18} />
                  <span>Insight AI CerminSaku</span>
                </div>

                <h4>{aiLoading ? "Menganalisis..." : aiHeadline}</h4>

                <p>
                  {aiLoading
                    ? "AI sedang membaca pola transaksi..."
                    : aiInsight}
                </p>
              </div>
            </div>
          </div>

          {/* LEDGER: lebar penuh */}
          <div className="ledger-wide">
            <div className="ledger-panel-column">
              <div className="master-ledger-shell">
                <div className="ledger-control-center">
                  <div className="minimal-search-input-box">
                    <Search size={14} />
                    <input
                      type="text"
                      placeholder="Cari entitas transaksi..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                  <div className="context-dropdown-anchor">
                    <button
                      className={`glass-filter-btn ${openDropdown ? "dropdown-active" : ""}`}
                      onClick={() => setOpenDropdown(!openDropdown)}
                    >
                      <SlidersHorizontal size={13} />
                      <span className="filter-text-truncate">
                        {selectedCategory}
                      </span>
                      <ChevronDown
                        size={14}
                        className={`chevron-rotate-tweak ${openDropdown ? "rotate" : ""}`}
                      />
                    </button>
                    {openDropdown && (
                      <>
                        <div
                          className="dropdown-overlay-shutter"
                          onClick={() => setOpenDropdown(false)}
                        />
                        <div className="context-blur-dropdown">
                          {CATEGORY_OPTIONS.map((item) => (
                            <div
                              key={item.name}
                              className={`blur-dropdown-item ${selectedCategory === item.name ? "selected" : ""}`}
                              onClick={() => {
                                setSelectedCategory(item.name);
                                setOpenDropdown(false);
                              }}
                            >
                              <div className="item-core">
                                {item.icon}
                                <span>{item.name}</span>
                              </div>
                              {selectedCategory === item.name && (
                                <span className="dot-marker-check">
                                  <Check size={12} strokeWidth={3} />
                                </span>
                              )}
                            </div>
                          ))}
                        </div>
                      </>
                    )}
                  </div>
                </div>

                {/* TABS */}
                <div className="ios-segmented-tabs">
                  <button
                    className={activeTab === "all" ? "active" : ""}
                    onClick={() => setActiveTab("all")}
                  >
                    Semua
                  </button>
                  <button
                    className={activeTab === "income" ? "active" : ""}
                    onClick={() =>
                      setFormData((previous) => ({
                        ...previous,
                        type: "income",
                        ...(previous.category === DREAM_CATEGORY
                          ? { category: "", savingId: "" }
                          : {}),
                      }))
                    }
                  >
                    Pemasukan
                  </button>
                  <button
                    className={activeTab === "expense" ? "active" : ""}
                    onClick={() =>
                      setFormData((previous) => ({
                        ...previous,
                        type: "expense",
                      }))
                    }
                  >
                    Pengeluaran
                  </button>
                </div>

                <div className="date-range-filter">
                  <div className="date-range-field">
                    <label>Dari</label>
                    <input
                      type="date"
                      value={dateFrom}
                      max={dateTo || undefined}
                      onChange={(e) => setDateFrom(e.target.value)}
                    />
                  </div>
                  <div className="date-range-field">
                    <label>Sampai</label>
                    <input
                      type="date"
                      value={dateTo}
                      min={dateFrom || undefined}
                      onChange={(e) => setDateTo(e.target.value)}
                    />
                  </div>
                  {hasDateFilter && (
                    <button
                      type="button"
                      className="date-range-reset"
                      onClick={() => {
                        setDateFrom("");
                        setDateTo("");
                      }}
                    >
                      <X size={12} />
                      <span>Reset</span>
                    </button>
                  )}
                </div>

                {/* TOTAL */}
                <div className="range-summary">
                  <div className="range-summary-item">
                    <span>Pemasukan</span>
                    <strong className="income">
                      +Rp {formatRupiah(rangeInflow)}
                    </strong>
                  </div>
                  <div className="range-summary-item">
                    <span>Pengeluaran</span>
                    <strong className="expense">
                      -Rp {formatRupiah(rangeOutflow)}
                    </strong>
                  </div>
                  <div
                    className={`range-summary-item range-net ${rangeNet < 0 ? "negative" : "positive"}`}
                  >
                    <span>Selisih</span>
                    <strong>
                      {rangeNet < 0 ? "-" : ""}Rp{" "}
                      {formatRupiah(Math.abs(rangeNet))}
                    </strong>
                  </div>
                </div>

                {/* TRANSACTION LIST */}
                <div className="premium-stream-list">
                  {filteredTransactions.length > 0 ? (
                    paginatedTransactions.map((item) => (
                      <div className="stream-row-item" key={item.id}>
                        <div className="stream-row-left">
                          <div className={`stream-icon-frame ${item.type}`}>
                            {CATEGORY_ICONS[item.category] || (
                              <HelpCircle size={16} />
                            )}
                          </div>
                          <div className="stream-row-info">
                            <h4>{item.title || "Transaksi"}</h4>
                            <span>{getCategoryLabel(item)}</span>
                          </div>
                        </div>
                        <div className="stream-row-right">
                          <div className="stream-time-amount">
                            <span className="stream-time">
                              {item.date
                                ? new Date(item.date).toLocaleDateString(
                                    "id-ID",
                                    {
                                      day: "2-digit",
                                      month: "short",
                                      year: "numeric",
                                    },
                                  )
                                : "-"}
                            </span>
                            <h3 className={`stream-amount ${item.type}`}>
                              {item.type === "expense"
                                ? `-Rp ${formatRupiah(item.amount)}`
                                : `+Rp ${formatRupiah(item.amount)}`}
                            </h3>
                          </div>
                          <div className="action-buttons">
                            <button
                              className="edit-btn"
                              title="Edit transaksi"
                              onClick={() => openEditModal(item)}
                            >
                              <Edit2 size={12} />
                            </button>
                            <button
                              className="delete-btn"
                              title="Hapus transaksi"
                              onClick={() => confirmDelete(item.id)}
                            >
                              <Trash2 size={12} />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="stream-empty-state">
                      <MoreHorizontal
                        size={24}
                        style={{
                          color: "#94A3B8",
                          marginBottom: "8px",
                          justifySelf: "center",
                        }}
                      />
                      <p>Tidak ada transaksi yang ditemukan.</p>
                    </div>
                  )}
                </div>
                {filteredTransactions.length > ITEMS_PER_PAGE && (
                  <div className="pagination-bar">
                    <span className="pagination-info">
                      Menampilkan{" "}
                      <strong>
                        {startIndex + 1}–
                        {Math.min(
                          startIndex + ITEMS_PER_PAGE,
                          filteredTransactions.length,
                        )}
                      </strong>{" "}
                      dari <strong>{filteredTransactions.length}</strong>{" "}
                      transaksi
                    </span>
                    <nav
                      className="pagination-controls"
                      aria-label="Navigasi halaman"
                    >
                      <button
                        type="button"
                        className="pagination-btn"
                        onClick={() => setCurrentPage(safePage - 1)}
                        disabled={safePage === 1}
                      >
                        <ChevronLeft size={16} />
                      </button>
                      {getPageNumbers(safePage, totalPages).map(
                        (page, index) =>
                          page === "..." ? (
                            <span
                              key={`gap-${index}`}
                              className="pagination-gap"
                            >
                              …
                            </span>
                          ) : (
                            <button
                              key={page}
                              type="button"
                              className={`pagination-btn ${page === safePage ? "active" : ""}`}
                              onClick={() => setCurrentPage(page)}
                            >
                              {page}
                            </button>
                          ),
                      )}
                      <button
                        type="button"
                        className="pagination-btn"
                        onClick={() => setCurrentPage(safePage + 1)}
                        disabled={safePage === totalPages}
                      >
                        <ChevronRight size={16} />
                      </button>
                    </nav>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* =====================================================
          MODAL SECTION
      ===================================================== */}
      {showGuide && (
        <div className="sheet-backdrop-blur">
          <div className="sheet-modal-body guide-modal-size">
            <div className="sheet-header">
              <div className="guide-title-hub">
                <BookOpen size={18} className="guide-main-icon" />
                <h2>Panduan Penggunaan Menu</h2>
              </div>
              <button
                className="sheet-close-circle"
                onClick={() => setShowGuide(false)}
              >
                <X size={15} />
              </button>
            </div>
            <p className="modal-description-text">
              Selamat datang di menu pembukuan kas Sakuin. Ikuti langkah praktis
              berikut untuk memulai pelacakan dana Anda.
            </p>
            <div className="onboarding-steps-list">
              <div className="step-guide-card">
                <div className="step-number-tag">1</div>
                <div className="step-info-meta">
                  <h4>Atur Jatah Bulanan</h4>
                  <p>
                    Tentukan jatah pengeluaran bulanan. Sisa jatah dihitung
                    otomatis.
                  </p>
                </div>
              </div>
              <div className="step-guide-card">
                <div className="step-number-tag">2</div>
                <div className="step-info-meta">
                  <h4>Catat Transaksi</h4>
                  <p>
                    Masukkan transaksi pemasukan atau pengeluaran. Pilih
                    kategori Dream Saving pada pemasukan untuk menambah dana
                    impian.
                  </p>
                </div>
              </div>
              <div className="step-guide-card">
                <div className="step-number-tag">3</div>
                <div className="step-info-meta">
                  <h4>Baca Insight AI</h4>
                  <p>
                    AI membaca pola transaksi bulan ini dan memberi saran khusus
                    untuk Anda.
                  </p>
                </div>
              </div>
            </div>
            <div className="sheet-action-footer" style={{ marginTop: "24px" }}>
              <button
                className="sheet-btn-commit full-width-guide-btn"
                onClick={() => setShowGuide(false)}
              >
                <MousePointerClick size={14} />
                <span>Saya Paham, Mulai Eksplorasi</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {deleteModal && (
        <div className="sheet-backdrop-blur">
          <div className="sheet-modal-body warning-budget-modal-size">
            <div
              className="popup-icon-octagon-warning-wrapper"
              style={{ background: "#FFF1F2", color: "#E11D48" }}
            >
              <Trash2 size={26} />
            </div>
            <div className="popup-text-content">
              <h3>Yakin Hapus Transaksi?</h3>
              <p>Data transaksi ini akan dihapus permanen.</p>
            </div>
            <div
              className="sheet-action-footer"
              style={{
                marginTop: "24px",
                justifyContent: "center",
                gap: "12px",
              }}
            >
              <button
                className="sheet-btn-cancel"
                onClick={() => setDeleteModal(false)}
              >
                Batal
              </button>
              <button
                className="sheet-btn-commit"
                style={{ background: "#E11D48", width: "auto" }}
                onClick={executeDelete}
              >
                Ya, Hapus
              </button>
            </div>
          </div>
        </div>
      )}

      {showBudgetWarning && (
        <div className="sheet-backdrop-blur">
          <div className="sheet-modal-body warning-budget-modal-size">
            <div className="popup-icon-octagon-warning-wrapper">
              <AlertOctagon size={26} />
            </div>
            <div className="popup-text-content">
              <h3>Jatah Bulanan Belum Diatur</h3>
              <p>Atur jatah pengeluaran bulanan terlebih dahulu.</p>
            </div>
            <div
              className="sheet-action-footer"
              style={{ marginTop: "24px", justifyContent: "center" }}
            >
              <button
                className="sheet-btn-commit full-width-guide-btn"
                onClick={() => {
                  setShowBudgetWarning(false);
                  openBudgetModal();
                }}
              >
                <span>Atur Jatah Bulanan Sekarang</span>
                <ArrowRight size={14} />
              </button>
            </div>
          </div>
        </div>
      )}

      {openModal && (
        <div className="sheet-backdrop-blur">
          <div className="sheet-modal-body">
            <div className="sheet-header">
              <h2>{editingId ? "Edit Transaksi" : "Transaksi Baru"}</h2>
              <button
                className="sheet-close-circle"
                onClick={() => setOpenModal(false)}
              >
                <X size={15} />
              </button>
            </div>
            <div className="ios-segmented-tabs sheet-toggle-margin">
              <button
                className={formData.type === "expense" ? "active" : ""}
                onClick={() =>
                  setFormData((previous) => ({
                    ...previous,
                    type: "expense",
                    ...(previous.category === DREAM_CATEGORY
                      ? { category: "", savingId: "" }
                      : {}),
                  }))
                }
              >
                Pengeluaran
              </button>
              <button
                className={formData.type === "income" ? "active" : ""}
                onClick={() =>
                  setFormData((previous) => ({ ...previous, type: "income" }))
                }
              >
                Pemasukan
              </button>
            </div>
            <div className="sheet-form-inputs">
              <div className="sheet-input-field">
                <label>Deskripsi Transaksi</label>
                <input
                  type="text"
                  placeholder="Kopi Sore, Gaji Project"
                  value={formData.title}
                  onChange={(e) =>
                    setFormData((previous) => ({
                      ...previous,
                      title: e.target.value,
                    }))
                  }
                />
              </div>
              <div className="sheet-input-row">
                <div className="sheet-input-field">
                  <label>Nominal (Rp)</label>
                  <input
                    type="number"
                    min="0"
                    placeholder="0"
                    value={formData.amount}
                    onChange={(e) =>
                      setFormData((previous) => ({
                        ...previous,
                        amount: e.target.value,
                      }))
                    }
                  />
                </div>
                <div className="sheet-input-field">
                  <label>Tanggal</label>
                  <input
                    type="date"
                    value={formData.date}
                    onChange={(e) =>
                      setFormData((previous) => ({
                        ...previous,
                        date: e.target.value,
                      }))
                    }
                  />
                </div>
              </div>
              <div className="sheet-input-field">
                <label>Kategori</label>
                <select
                  value={formData.category}
                  onChange={(e) => handleCategoryChange(e.target.value)}
                >
                  <option value="">Pilih klasifikasi kategori...</option>
                  <option value="Makan dan Minuman">Makan dan Minuman</option>
                  <option value="Transportasi">Transportasi</option>
                  <option value="Investasi">Investasi</option>
                  <option value="Hiburan">Hiburan</option>
                  <option value="Belanja">Belanja</option>
                  <option value="Gaji/ Pemasukan">Gaji/ Pemasukan</option>
                  <option value="Kesehatan">Kesehatan</option>
                  <option value="Pendidikan">Pendidikan</option>
                  <option value="Tagihan/ Kos">Tagihan/ Kos</option>
                  {formData.type === "expense" && (
                    <option value={DREAM_CATEGORY}>Dream Saving</option>
                  )}
                  <option value="Lainnya">Lainnya</option>
                </select>
              </div>
              {formData.type === "expense" &&
                formData.category === DREAM_CATEGORY && (
                  <div className="sheet-input-field">
                    <label>Impian tujuan</label>
                    {dreamOptions.length > 0 ? (
                      <select
                        value={formData.savingId}
                        onChange={(e) =>
                          setFormData((previous) => ({
                            ...previous,
                            savingId: e.target.value,
                          }))
                        }
                      >
                        <option value="">Pilih impian...</option>
                        {dreamOptions.map((dream) => (
                          <option key={dream.id} value={String(dream.id)}>
                            {dream.name} (Rp {formatRupiah(dream.saved)} dari Rp{" "}
                            {formatRupiah(dream.target)}){" "}
                            {dream.paused
                              ? " - dijeda"
                              : dream.completed
                                ? " - selesai"
                                : ""}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <p className="budget-modal-hint">
                        Belum ada impian aktif. Buat impian di menu Dream
                        Savings terlebih dahulu.
                      </p>
                    )}
                  </div>
                )}
            </div>
            <div className="sheet-action-footer">
              <button
                className="sheet-btn-cancel"
                onClick={() => setOpenModal(false)}
              >
                Batal
              </button>
              <button className="sheet-btn-commit" onClick={handleSubmit}>
                {editingId ? "Simpan Perubahan" : "Simpan"}
              </button>
            </div>
          </div>
        </div>
      )}

      {openLimitModal && (
        <div className="sheet-backdrop-blur">
          <div className="sheet-modal-body limit-modal-size">
            <div className="sheet-header">
              <h2>Atur Jatah Bulanan</h2>
              <button
                className="sheet-close-circle"
                onClick={() => setOpenLimitModal(false)}
              >
                <X size={15} />
              </button>
            </div>
            <div className="sheet-form-inputs">
              <div className="sheet-input-field">
                <label>Jatah Pengeluaran Bulan Ini (Rp)</label>
                <input
                  type="number"
                  min="0"
                  value={tempLimit}
                  onChange={(e) => setTempLimit(e.target.value)}
                  placeholder="5000000"
                />
                <p className="budget-modal-hint">
                  Sisa jatah bulanan dihitung otomatis dari pengeluaran bulan
                  ini.
                </p>
              </div>
            </div>
            <div className="sheet-action-footer" style={{ marginTop: "24px" }}>
              <button
                className="sheet-btn-cancel"
                onClick={() => setOpenLimitModal(false)}
              >
                Batal
              </button>
              <button className="sheet-btn-commit" onClick={saveBudget}>
                Simpan Jatah
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

import { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Sidebar from "../components/Sidebar";
import "../style/transaction.css";
import { useStreakContext } from "../components/StreakContext";


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
  PieChart,
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

const DEFAULT_FORM = {
  title: "",
  category: "",
  amount: "",
  type: "expense",
  date: new Date().toISOString().split("T")[0],
};

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

const CATEGORY_OPTIONS = [
  {
    name: "Semua Kategori",
    icon: <MoreHorizontal size={14} />,
  },
  {
    name: "Makan dan Minuman",
    icon: <Utensils size={14} />,
  },
  {
    name: "Investasi",
    icon: <TrendingUp size={14} />,
  },
  {
    name: "Transportasi",
    icon: <Bus size={14} />,
  },
  {
    name: "Hiburan",
    icon: <Clapperboard size={14} />,
  },
  {
    name: "Belanja",
    icon: <ShoppingBag size={14} />,
  },
  {
    name: "Gaji/ Pemasukan",
    icon: <FileText size={14} />,
  },
  {
    name: "Kesehatan",
    icon: <Heart size={14} />,
  },
  {
    name: "Pendidikan",
    icon: <GraduationCap size={14} />,
  },
  {
    name: "Lainnya",
    icon: <HelpCircle size={14} />,
  },
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

function formatRupiah(value) {
  return Number(value || 0).toLocaleString("id-ID");
}

/* =========================================================
   COMPONENT
========================================================= */

export default function Transaction() {
  const { recordTransaction } = useStreakContext();

  const navigate = useNavigate();

  const toastTimerRef = useRef(null);

  const user = getUser();

  /* =======================================================
     UI STATE
  ======================================================= */

  const [openDropdown, setOpenDropdown] = useState(false);

  const [selectedCategory, setSelectedCategory] =
    useState("Semua Kategori");

  const [searchQuery, setSearchQuery] = useState("");

  const [openModal, setOpenModal] = useState(false);

  const [editingId, setEditingId] = useState(null);

  const [deleteModal, setDeleteModal] = useState(false);

  const [itemToDelete, setItemToDelete] = useState(null);

  const [openLimitModal, setOpenLimitModal] = useState(false);

  const [activeTab, setActiveTab] = useState("all");

  const [showGuide, setShowGuide] = useState(false);

  const [showBudgetWarning, setShowBudgetWarning] = useState(false);

  /* =======================================================
     DATA STATE
  ======================================================= */

  const [transactions, setTransactions] = useState([]);

  /* =======================================================
     FORM STATE
  ======================================================= */

  const [formData, setFormData] = useState(DEFAULT_FORM);

  /* =======================================================
     BUDGET
  ======================================================= */

  const [monthlyLimit, setMonthlyLimit] = useState(() => {
    const currentUser = getUser();

    if (!currentUser?.id) return 0;

    const savedLimit = localStorage.getItem(
      `cerminsaku_budget_limit_${currentUser.id}`,
    );

    return savedLimit ? Number(savedLimit) : 0;
  });

  const [tempLimit, setTempLimit] = useState(0);

  const [hasSetBudget, setHasSetBudget] = useState(false);

  /* =======================================================
     TOAST
  ======================================================= */

  const [toastMessage, setToastMessage] = useState("");

  const [showToast, setShowToast] = useState(false);

  const [toastType, setToastType] = useState("success");

  /* =======================================================
     AI
  ======================================================= */

  const [aiHeadline, setAiHeadline] =
    useState("⏳ Menganalisis...");

  const [aiInsight, setAiInsight] = useState(
    "AI sedang membaca pola keuanganmu...",
  );

  const [aiLoading, setAiLoading] = useState(false);

  const [aiPredictLoading, setAiPredictLoading] =
    useState(false);

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

      if (
        error.response?.status === 401 ||
        error.response?.status === 403
      ) {
        localStorage.removeItem("token");
        navigate("/login");
      }
    }
  }, [navigate]);

  /* =======================================================
     INITIAL LOAD
  ======================================================= */

  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions]);

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
     BUDGET STATUS
  ======================================================= */

  useEffect(() => {
    setHasSetBudget(monthlyLimit > 0);
  }, [monthlyLimit]);

  /* =======================================================
     TOAST
  ======================================================= */

  const triggerToast = useCallback(
    (message, type = "success") => {
      setToastMessage(message);
      setToastType(type);
      setShowToast(true);

      if (toastTimerRef.current) {
        clearTimeout(toastTimerRef.current);
      }

      toastTimerRef.current = setTimeout(() => {
        setShowToast(false);
      }, 3500);
    },
    [],
  );

  useEffect(() => {
    return () => {
      if (toastTimerRef.current) {
        clearTimeout(toastTimerRef.current);
      }
    };
  }, []);

  /* =======================================================
     TOTAL TRANSACTION
  ======================================================= */

  const totalInflow = transactions
    .filter((item) => item.type === "income")
    .reduce(
      (total, item) => total + Number(item.amount || 0),
      0,
    );

  const totalOutflow = transactions
    .filter((item) => item.type === "expense")
    .reduce(
      (total, item) => total + Number(item.amount || 0),
      0,
    );

  const netSurplus = totalInflow - totalOutflow;

  /* =======================================================
     MONTHLY BUDGET
  ======================================================= */

  const currentMonth = new Date().getMonth();

  const currentYear = new Date().getFullYear();

  const currentMonthExpenses = transactions
    .filter((item) => {
      if (item.type !== "expense") return false;

      const date = new Date(item.date);

      return (
        date.getMonth() === currentMonth &&
        date.getFullYear() === currentYear
      );
    })
    .reduce(
      (total, item) => total + Number(item.amount || 0),
      0,
    );

  const budgetPercentage =
    monthlyLimit > 0
      ? Math.min(
          Math.round(
            (currentMonthExpenses / monthlyLimit) * 100,
          ),
          100,
        )
      : 0;

  const remainingBudget =
    monthlyLimit - currentMonthExpenses;

  /* =======================================================
     AI DASHBOARD INSIGHT
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
          (categoryTotals[category] || 0) +
          Number(item.amount || 0);
      });

      const sortedCategories = Object.entries(
        categoryTotals,
      ).sort((a, b) => b[1] - a[1]);

      const topCategory = sortedCategories[0]?.[0] || "Lainnya";

      const response = await apiClient.post(
        "/api/ai/transaction-insight",
        {
          totalInflow,
          totalOutflow,
          monthlyLimit,
          topCategory,
        },
      );

      const data = response?.data || {};

      setAiHeadline(
        data.headline || "Insight Keuangan",
      );

      setAiInsight(
        data.insight ||
          "Belum ada insight yang tersedia.",
      );
    } catch (error) {
      console.error("AI Insight Error:", error);

      setAiHeadline("AI Tidak Aktif");

      setAiInsight(
        "Insight belum tersedia. Pastikan layanan AI sedang aktif.",
      );
    } finally {
      setAiLoading(false);
    }
  }, [
    transactions,
    totalInflow,
    totalOutflow,
    monthlyLimit,
  ]);

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
      triggerToast(
        "Harap isi nominal dan tanggal terlebih dahulu.",
        "danger",
      );

      return;
    }

    try {
      setAiPredictLoading(true);

      const response = await apiClient.post(
        "/api/ai/predict",
        {
          date: formData.date,
          amount_rupiah: Number(formData.amount),
          transaction_type:
            formData.type === "income"
              ? "Income"
              : "Expense",
          top_k: 3,
        },
      );

      const data = response?.data || {};

      const predictedCategory = getCategoryFromAI(
        data.predicted_category,
      );

      setFormData((previous) => ({
        ...previous,
        category: predictedCategory,
      }));

      triggerToast(
        `AI memilih kategori: ${predictedCategory}`,
        "success",
      );
    } catch (error) {
      console.error("AI Prediction Error:", error);

      triggerToast(
        "AI Service tidak tersedia saat ini.",
        "danger",
      );
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

      await fetchTransactions();

      triggerToast(
        "Data transaksi berhasil dihapus.",
        "success",
      );
    } catch (error) {
      console.error("Gagal menghapus:", error);

      triggerToast(
        error.response?.data?.message ||
          "Gagal menghapus transaksi.",
        "danger",
      );
    }
  };

  /* =======================================================
     CREATE / EDIT
  ======================================================= */

  const openCreateModal = () => {
    setEditingId(null);
    setFormData({
      ...DEFAULT_FORM,
      date: new Date().toISOString().split("T")[0],
    });

    setOpenModal(true);
  };

  const openEditModal = (item) => {
    setEditingId(item.id);

    setFormData({
      title: item.title || "",
      category: item.category || "",
      amount: item.amount ?? "",
      type: item.type || "expense",
      date: item.date
        ? String(item.date).split("T")[0]
        : new Date().toISOString().split("T")[0],
    });

    setOpenModal(true);
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
      triggerToast(
        "Deskripsi transaksi wajib diisi.",
        "danger",
      );
      return;
    }

    if (
      !formData.amount ||
      Number(formData.amount) <= 0
    ) {
      triggerToast(
        "Nominal transaksi harus lebih dari 0.",
        "danger",
      );
      return;
    }

    if (!formData.date) {
      triggerToast(
        "Tanggal transaksi wajib diisi.",
        "danger",
      );
      return;
    }

    try {
      const payload = {
        title: formData.title.trim(),
        category:
          formData.category || "Lainnya",
        amount: Number(formData.amount),
        type: formData.type,
        date: formData.date,
        user_id: currentUser.id,
      };

      if (editingId) {
        await apiClient.put(
          `/api/transactions/${editingId}`,
          payload,
        );
      } else {
        await apiClient.post(
          "/api/transactions",
          payload,
        );
      }

      setOpenModal(false);
      setEditingId(null);
      setFormData({
        ...DEFAULT_FORM,
        date: new Date().toISOString().split("T")[0],
      });

      await fetchTransactions();

      recordTransaction();

      triggerToast(
        editingId
          ? "Transaksi berhasil diperbarui."
          : "Transaksi berhasil ditambahkan.",
        "success",
      );
    } catch (error) {
      console.error("Submit transaction error:", error);

      if (
        error.response?.status === 401 ||
        error.response?.status === 403
      ) {
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
     FILTER
  ======================================================= */

  const normalizedSearch = searchQuery
    .toLowerCase()
    .trim();

  const filteredTransactions =
    transactions.filter((item) => {
      const title = String(item.title || "").toLowerCase();

      const category = String(
        item.category || "Lainnya",
      ).toLowerCase();

      const matchesTab =
        activeTab === "all" ||
        item.type === activeTab;

      const matchesCategory =
        selectedCategory === "Semua Kategori" ||
        item.category === selectedCategory;

      const matchesSearch =
        title.includes(normalizedSearch) ||
        category.includes(normalizedSearch);

      return (
        matchesTab &&
        matchesCategory &&
        matchesSearch
      );
    });

  /* =======================================================
     BUDGET SAVE
  ======================================================= */

  const saveBudget = () => {
    const currentUser = getUser();

    if (!currentUser?.id) {
      navigate("/login");
      return;
    }

    const value = Number(tempLimit);

    if (!value || value <= 0) {
      triggerToast(
        "Batas budget harus lebih dari Rp 0.",
        "danger",
      );

      return;
    }

    setMonthlyLimit(value);
    setHasSetBudget(true);

    localStorage.setItem(
      `cerminsaku_budget_limit_${currentUser.id}`,
      String(value),
    );

    setOpenLimitModal(false);

    triggerToast(
      "Batas anggaran berhasil diperbarui.",
      "success",
    );
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

      <div
        className={`premium-toast ${
          showToast ? "show" : ""
        } ${toastType}`}
      >
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
              {toastType === "success"
                ? "Informasi Sistem"
                : "Peringatan"}
            </span>

            <span className="toast-desc">
              {toastMessage}
            </span>
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

              <p>
                Catat pembukuan kas masuk dan keluar
                secara terstruktur.
              </p>
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
                onClick={() => {
                  setTempLimit(monthlyLimit);
                  setOpenLimitModal(true);
                }}
              >
                <Settings2 size={14} />

                <span>Atur Budget</span>
              </button>

              <button
                className="neon-emerald-btn"
                onClick={
                  handleTriggerCreateTransaction
                }
              >
                <Plus
                  size={15}
                  strokeWidth={2.5}
                />

                <span>Catat Transaksi</span>
              </button>

            </div>
          </header>

          {/* =================================================
              WORKSPACE
          ================================================= */}

          <div className="bento-asymmetric-workspace">

            {/* =================================================
                LEFT COLUMN
            ================================================= */}

            <div className="intel-core-column">

              {/* NET SURPLUS */}

              <div className="aurora-mesh-card">
                <div className="mesh-overlay-glow"></div>

                <div className="card-inner-content">

                  <div className="card-top-meta">
                    <span className="system-tag">
                      NET SURPLUS PORTFOLIO
                    </span>

                    <div className="badge-trend">
                      <TrendingUp size={12} />

                      <span>
                        {totalInflow > 0
                          ? `${
                              netSurplus >= 0
                                ? "+"
                                : ""
                            }${(
                              (netSurplus /
                                totalInflow) *
                              100
                            ).toFixed(1)}%`
                          : "0%"}
                      </span>
                    </div>
                  </div>

                  <h2>
                    Rp{" "}
                    {formatRupiah(netSurplus)}
                  </h2>

                  <div className="card-bottom-meta">
                    <p>
                      Dana bersih aktif dari alur
                      kas masuk dikurangi beban
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

                    <span className="subcard-title">
                      Inflow
                    </span>
                  </div>

                  <h3>
                    Rp{" "}
                    {formatRupiah(totalInflow)}
                  </h3>

                  <span className="subcard-footer">
                    Total Pendapatan
                  </span>

                </div>

                <div className="bento-subcard outflow">

                  <div className="subcard-header">
                    <div className="icon-circle">
                      <ArrowUpRight size={14} />
                    </div>

                    <span className="subcard-title">
                      Outflow
                    </span>
                  </div>

                  <h3>
                    Rp{" "}
                    {formatRupiah(totalOutflow)}
                  </h3>

                  <span className="subcard-footer">
                    Total Pengeluaran
                  </span>

                </div>

              </div>

              {/* BUDGET */}

              <div className="budget-limit-panel memanjang-panel-style">

                <div className="budget-panel-header">

                  <div className="budget-label">
                    <PieChart
                      size={15}
                      className="budget-icon"
                    />

                    <h5>
                      Limit Pengeluaran
                      Bulanan
                    </h5>
                  </div>

                  <div className="budget-actions-hub">

                    <span className="budget-percentage">
                      {budgetPercentage}%
                      Terpakai
                    </span>

                    <button
                      className="adjust-budget-trigger"
                      onClick={() => {
                        setTempLimit(
                          monthlyLimit,
                        );

                        setOpenLimitModal(
                          true,
                        );
                      }}
                    >
                      <Settings2 size={13} />
                    </button>

                  </div>

                </div>

                <div className="progress-bar-container">

                  <div
                    className="progress-bar-fill"
                    style={{
                      width: `${budgetPercentage}%`,
                      background:
                        budgetPercentage >= 80
                          ? "#E11D48"
                          : "#0E4834",
                    }}
                  />

                </div>

                <div className="budget-panel-footer">

                  <span>
                    {monthlyLimit === 0
                      ? "Belum diatur"
                      : remainingBudget >= 0
                        ? "Sisa kuota: "
                        : "Defisit: "}

                    {monthlyLimit > 0 && (
                      <strong>
                        Rp{" "}
                        {formatRupiah(
                          Math.abs(
                            remainingBudget,
                          ),
                        )}
                      </strong>
                    )}
                  </span>

                  <span>
                    Batas: Rp{" "}
                    {formatRupiah(
                      monthlyLimit,
                    )}
                  </span>

                </div>

              </div>

              {/* AI */}

              <div className="ai-insight-card">

                <div className="ai-insight-header">
                  <Brain size={18} />

                  <span>
                    Insight AI CerminSaku
                  </span>
                </div>

                <h4>
                  {aiLoading
                    ? "Menganalisis..."
                    : aiHeadline}
                </h4>

                <p>
                  {aiLoading
                    ? "AI sedang membaca pola transaksi..."
                    : aiInsight}
                </p>

              </div>

            </div>

            {/* =================================================
                RIGHT COLUMN
            ================================================= */}

            <div className="ledger-panel-column">

              <div className="master-ledger-shell">

                {/* SEARCH / FILTER */}

                <div className="ledger-control-center">

                  <div className="minimal-search-input-box">

                    <Search size={14} />

                    <input
                      type="text"
                      placeholder="Cari entitas transaksi..."
                      value={searchQuery}
                      onChange={(e) =>
                        setSearchQuery(
                          e.target.value,
                        )
                      }
                    />

                  </div>

                  <div className="context-dropdown-anchor">

                    <button
                      className={`glass-filter-btn ${
                        openDropdown
                          ? "dropdown-active"
                          : ""
                      }`}
                      onClick={() =>
                        setOpenDropdown(
                          !openDropdown,
                        )
                      }
                    >
                      <SlidersHorizontal
                        size={13}
                      />

                      <span className="filter-text-truncate">
                        {selectedCategory}
                      </span>

                      <ChevronDown
                        size={14}
                        className={`chevron-rotate-tweak ${
                          openDropdown
                            ? "rotate"
                            : ""
                        }`}
                      />
                    </button>

                    {openDropdown && (
                      <>
                        <div
                          className="dropdown-overlay-shutter"
                          onClick={() =>
                            setOpenDropdown(
                              false,
                            )
                          }
                        />

                        <div className="context-blur-dropdown">

                          {CATEGORY_OPTIONS.map(
                            (item) => (
                              <div
                                key={item.name}
                                className={`blur-dropdown-item ${
                                  selectedCategory ===
                                  item.name
                                    ? "selected"
                                    : ""
                                }`}
                                onClick={() => {
                                  setSelectedCategory(
                                    item.name,
                                  );

                                  setOpenDropdown(
                                    false,
                                  );
                                }}
                              >

                                <div className="item-core">
                                  {item.icon}

                                  <span>
                                    {item.name}
                                  </span>
                                </div>

                                {selectedCategory ===
                                  item.name && (
                                  <span className="dot-marker-check">
                                    <Check
                                      size={12}
                                      strokeWidth={
                                        3
                                      }
                                    />
                                  </span>
                                )}

                              </div>
                            ),
                          )}

                        </div>
                      </>
                    )}

                  </div>

                </div>

                {/* TABS */}

                <div className="ios-segmented-tabs">

                  <button
                    className={
                      activeTab === "all"
                        ? "active"
                        : ""
                    }
                    onClick={() =>
                      setActiveTab("all")
                    }
                  >
                    Semua
                  </button>

                  <button
                    className={
                      activeTab === "income"
                        ? "active"
                        : ""
                    }
                    onClick={() =>
                      setActiveTab("income")
                    }
                  >
                    Pemasukan
                  </button>

                  <button
                    className={
                      activeTab === "expense"
                        ? "active"
                        : ""
                    }
                    onClick={() =>
                      setActiveTab("expense")
                    }
                  >
                    Pengeluaran
                  </button>

                </div>

                {/* TRANSACTION LIST */}

                <div className="premium-stream-list">

                  {filteredTransactions.length >
                  0 ? (
                    filteredTransactions.map(
                      (item) => (
                        <div
                          className="stream-row-item"
                          key={item.id}
                        >

                          <div className="stream-row-left">

                            <div
                              className={`stream-icon-frame ${item.type}`}
                            >
                              {CATEGORY_ICONS[
                                item.category
                              ] || (
                                <HelpCircle
                                  size={16}
                                />
                              )}
                            </div>

                            <div className="stream-row-info">

                              <h4>
                                {item.title ||
                                  "Transaksi"}
                              </h4>

                              <span>
                                {item.category ||
                                  "Lainnya"}
                              </span>

                            </div>

                          </div>

                          <div className="stream-row-right">

                            <div className="stream-time-amount">

                              <span className="stream-time">
                                {item.date
                                  ? new Date(
                                      item.date,
                                    ).toLocaleDateString(
                                      "id-ID",
                                      {
                                        day: "2-digit",
                                        month:
                                          "short",
                                        year:
                                          "numeric",
                                      },
                                    )
                                  : "-"}
                              </span>

                              <h3
                                className={`stream-amount ${item.type}`}
                              >
                                {item.type ===
                                "expense"
                                  ? `-Rp ${formatRupiah(
                                      item.amount,
                                    )}`
                                  : `+Rp ${formatRupiah(
                                      item.amount,
                                    )}`}
                              </h3>

                            </div>

                            <div className="action-buttons">

                              <button
                                className="edit-btn"
                                title="Edit transaksi"
                                onClick={() =>
                                  openEditModal(
                                    item,
                                  )
                                }
                              >
                                <Edit2
                                  size={12}
                                />
                              </button>

                              <button
                                className="delete-btn"
                                title="Hapus transaksi"
                                onClick={() =>
                                  confirmDelete(
                                    item.id,
                                  )
                                }
                              >
                                <Trash2
                                  size={12}
                                />
                              </button>

                            </div>

                          </div>

                        </div>
                      ),
                    )
                  ) : (
                    <div className="stream-empty-state">

                      <MoreHorizontal
                        size={24}
                        style={{
                          color: "#94A3B8",
                          marginBottom:
                            "8px",
                          justifySelf: "center"
                        }}
                      />

                      <p>
                        Tidak ada transaksi
                        yang ditemukan.
                      </p>

                    </div>
                  )}

                </div>

              </div>

            </div>

          </div>

        </div>
      </div>

      {/* =====================================================
          GUIDE MODAL
      ===================================================== */}

      {showGuide && (
        <div className="sheet-backdrop-blur">

          <div className="sheet-modal-body guide-modal-size">

            <div className="sheet-header">

              <div className="guide-title-hub">

                <BookOpen
                  size={18}
                  className="guide-main-icon"
                />

                <h2>
                  Panduan Penggunaan Menu
                </h2>

              </div>

              <button
                className="sheet-close-circle"
                onClick={() =>
                  setShowGuide(false)
                }
              >
                <X size={15} />
              </button>

            </div>

            <p className="modal-description-text">
              Selamat datang di menu pembukuan kas
              CerminSaku. Ikuti langkah praktis berikut
              untuk memulai pelacakan dana Anda.
            </p>

            <div className="onboarding-steps-list">

              <div className="step-guide-card">

                <div className="step-number-tag">
                  1
                </div>

                <div className="step-info-meta">

                  <h4>
                    Atur Batas Anggaran
                  </h4>

                  <p>
                    Tentukan batas pengeluaran
                    bulanan terlebih dahulu.
                  </p>

                </div>

              </div>

              <div className="step-guide-card">

                <div className="step-number-tag">
                  2
                </div>

                <div className="step-info-meta">

                  <h4>
                    Catat Transaksi
                  </h4>

                  <p>
                    Masukkan transaksi
                    pemasukan atau pengeluaran.
                  </p>

                </div>

              </div>

              <div className="step-guide-card">

                <div className="step-number-tag">
                  3
                </div>

                <div className="step-info-meta">

                  <h4>
                    Gunakan Prediksi AI
                  </h4>

                  <p>
                    AI dapat membantu menentukan
                    kategori transaksi.
                  </p>

                </div>

              </div>

            </div>

            <div
              className="sheet-action-footer"
              style={{
                marginTop: "24px",
              }}
            >

              <button
                className="sheet-btn-commit full-width-guide-btn"
                onClick={() =>
                  setShowGuide(false)
                }
              >
                <MousePointerClick
                  size={14}
                />

                <span>
                  Saya Paham, Mulai Eksplorasi
                </span>
              </button>

            </div>

          </div>

        </div>
      )}

      {/* =====================================================
          DELETE MODAL
      ===================================================== */}

      {deleteModal && (
        <div className="sheet-backdrop-blur">

          <div className="sheet-modal-body warning-budget-modal-size">

            <div
              className="popup-icon-octagon-warning-wrapper"
              style={{
                background: "#FFF1F2",
                color: "#E11D48",
              }}
            >
              <Trash2 size={26} />
            </div>

            <div className="popup-text-content">

              <h3>
                Yakin Hapus Transaksi?
              </h3>

              <p>
                Data transaksi ini akan
                dihapus permanen.
              </p>

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
                onClick={() =>
                  setDeleteModal(false)
                }
              >
                Batal
              </button>

              <button
                className="sheet-btn-commit"
                style={{
                  background: "#E11D48",
                  width: "auto",
                }}
                onClick={executeDelete}
              >
                Ya, Hapus
              </button>

            </div>

          </div>

        </div>
      )}

      {/* =====================================================
          BUDGET WARNING
      ===================================================== */}

      {showBudgetWarning && (
        <div className="sheet-backdrop-blur">

          <div className="sheet-modal-body warning-budget-modal-size">

            <div className="popup-icon-octagon-warning-wrapper">
              <AlertOctagon size={26} />
            </div>

            <div className="popup-text-content">

              <h3>
                Batas Anggaran Belum Diatur
              </h3>

              <p>
                Anda wajib mengonfigurasi limit
                anggaran pengeluaran kas terlebih
                dahulu.
              </p>

            </div>

            <div
              className="sheet-action-footer"
              style={{
                marginTop: "24px",
                justifyContent: "center",
              }}
            >

              <button
                className="sheet-btn-commit full-width-guide-btn"
                onClick={() => {
                  setShowBudgetWarning(false);

                  setTempLimit(
                    monthlyLimit,
                  );

                  setOpenLimitModal(true);
                }}
              >
                <span>
                  Atur Limit Budget Sekarang
                </span>

                <ArrowRight size={14} />
              </button>

            </div>

          </div>

        </div>
      )}

      {/* =====================================================
          TRANSACTION MODAL
      ===================================================== */}

      {openModal && (
        <div className="sheet-backdrop-blur">

          <div className="sheet-modal-body">

            <div className="sheet-header">

              <h2>
                {editingId
                  ? "Edit Transaksi"
                  : "Transaksi Baru"}
              </h2>

              <button
                className="sheet-close-circle"
                onClick={() =>
                  setOpenModal(false)
                }
              >
                <X size={15} />
              </button>

            </div>

            {/* TYPE */}

            <div className="ios-segmented-tabs sheet-toggle-margin">

              <button
                className={
                  formData.type ===
                  "expense"
                    ? "active"
                    : ""
                }
                onClick={() =>
                  setFormData(
                    (previous) => ({
                      ...previous,
                      type: "expense",
                    }),
                  )
                }
              >
                Pengeluaran
              </button>

              <button
                className={
                  formData.type ===
                  "income"
                    ? "active"
                    : ""
                }
                onClick={() =>
                  setFormData(
                    (previous) => ({
                      ...previous,
                      type: "income",
                    }),
                  )
                }
              >
                Pemasukan
              </button>

            </div>

            <div className="sheet-form-inputs">

              {/* AI */}

              {/*<button
                type="button"
                onClick={predictCategory}
                disabled={aiPredictLoading}
                style={{
                  width: "100%",
                  display: "flex",
                  alignItems: "center",
                  gap: "14px",
                  padding: "20px",
                  borderRadius: "22px",
                  border:
                    "1px solid rgba(139,92,246,.22)",
                  background:
                    "rgba(139,92,246,.08)",
                  marginBottom: "20px",
                  cursor:
                    aiPredictLoading
                      ? "wait"
                      : "pointer",
                  textAlign: "left",
                  opacity:
                    aiPredictLoading ? 0.7 : 1,
                }}
              >

                <Brain
                  size={26}
                  color="#7C3AED"
                />

                <div>

                  <h4
                    style={{
                      margin: 0,
                      color: "#6D28D9",
                      fontWeight: "700",
                    }}
                  >
                    {aiPredictLoading
                      ? "AI sedang menganalisis..."
                      : "Prediksi dengan AI"}
                  </h4>

                  <p
                    style={{
                      margin:
                        "4px 0 0",
                      fontSize:
                        "13px",
                      color:
                        "#8B5CF6",
                    }}
                  >
                    {aiPredictLoading
                      ? "Mohon tunggu..."
                      : "Klik untuk memprediksi kategori otomatis"}
                  </p>

                </div>

              </button>*/}

              {/* TITLE */}

              <div className="sheet-input-field">

                <label>
                  Deskripsi Transaksi
                </label>

                <input
                  type="text"
                  placeholder="Kopi Sore, Gaji Project"
                  value={formData.title}
                  onChange={(e) =>
                    setFormData(
                      (previous) => ({
                        ...previous,
                        title: e.target.value,
                      }),
                    )
                  }
                />

              </div>

              {/* AMOUNT / DATE */}

              <div className="sheet-input-row">

                <div className="sheet-input-field">

                  <label>
                    Nominal (Rp)
                  </label>

                  <input
                    type="number"
                    min="0"
                    placeholder="0"
                    value={
                      formData.amount
                    }
                    onChange={(e) =>
                      setFormData(
                        (previous) => ({
                          ...previous,
                          amount:
                            e.target.value,
                        }),
                      )
                    }
                  />

                </div>

                <div className="sheet-input-field">

                  <label>
                    Tanggal
                  </label>

                  <input
                    type="date"
                    value={
                      formData.date
                    }
                    onChange={(e) =>
                      setFormData(
                        (previous) => ({
                          ...previous,
                          date:
                            e.target.value,
                        }),
                      )
                    }
                  />

                </div>

              </div>

              {/* CATEGORY */}

              <div className="sheet-input-field">

                <label>
                  Kategori
                </label>

                <select
                  value={
                    formData.category
                  }
                  onChange={(e) =>
                    setFormData(
                      (previous) => ({
                        ...previous,
                        category:
                          e.target.value,
                      }),
                    )
                  }
                >

                  <option value="">
                    Pilih klasifikasi
                    kategori...
                  </option>

                  <option value="Makan dan Minuman">
                    Makan dan Minuman
                  </option>

                  <option value="Transportasi">
                    Transportasi
                  </option>

                  <option value="Investasi">
                    Investasi
                  </option>

                  <option value="Hiburan">
                    Hiburan
                  </option>

                  <option value="Belanja">
                    Belanja
                  </option>

                  <option value="Gaji/ Pemasukan">
                    Gaji/ Pemasukan
                  </option>

                  <option value="Kesehatan">
                    Kesehatan
                  </option>

                  <option value="Pendidikan">
                    Pendidikan
                  </option>

                  <option value="Lainnya">
                    Lainnya
                  </option>

                </select>

              </div>

            </div>

            {/* FOOTER */}

            <div className="sheet-action-footer">

              <button
                className="sheet-btn-cancel"
                onClick={() =>
                  setOpenModal(false)
                }
              >
                Batal
              </button>

              <button
                className="sheet-btn-commit"
                onClick={handleSubmit}
              >
                {editingId
                  ? "Simpan Perubahan"
                  : "Simpan"}
              </button>

            </div>

          </div>

        </div>
      )}

      {/* =====================================================
          BUDGET MODAL
      ===================================================== */}

      {openLimitModal && (
        <div className="sheet-backdrop-blur">

          <div className="sheet-modal-body limit-modal-size">

            <div className="sheet-header">

              <h2>
                Atur Batas Anggaran
              </h2>

              <button
                className="sheet-close-circle"
                onClick={() =>
                  setOpenLimitModal(
                    false,
                  )
                }
              >
                <X size={15} />
              </button>

            </div>

            <div className="sheet-form-inputs">

              <div className="sheet-input-field">

                <label>
                  Batas Pengeluaran Bulan Ini
                  (Rp)
                </label>

                <input
                  type="number"
                  min="0"
                  value={tempLimit}
                  onChange={(e) =>
                    setTempLimit(
                      Number(
                        e.target.value,
                      ),
                    )
                  }
                  placeholder="5000000"
                />

              </div>

            </div>

            <div
              className="sheet-action-footer"
              style={{
                marginTop: "24px",
              }}
            >

              <button
                className="sheet-btn-cancel"
                onClick={() =>
                  setOpenLimitModal(
                    false,
                  )
                }
              >
                Batal
              </button>

              <button
                className="sheet-btn-commit"
                onClick={saveBudget}
              >
                Simpan Batasan
              </button>

            </div>

          </div>

        </div>
      )}

    </div>
  );
}
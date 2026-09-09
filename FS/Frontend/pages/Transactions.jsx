import { useState, useEffect } from "react";
import axios from "axios";
import Sidebar from "../components/Sidebar";
import "../style/transaction.css";

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

const apiClient = axios.create({
  baseURL: "http://localhost:3000",
  headers: {
    "Content-Type": "application/json",
  },
});

apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

export default function Transaction() {
  const [openDropdown, setOpenDropdown] = useState(false);
  const [selectedCategory, setSelectedCategory] =
    useState("Semua Kategori");

  const [searchQuery, setSearchQuery] = useState("");

  const [openModal, setOpenModal] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const [formData, setFormData] = useState({
    title: "",
    category: "",
    amount: "",
    type: "expense",
    date: new Date().toISOString().split("T")[0],
  });

  const [deleteModal, setDeleteModal] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);

  const [openLimitModal, setOpenLimitModal] = useState(false);

  const [activeTab, setActiveTab] = useState("all");

  const [transactions, setTransactions] = useState([]);

  const [hasSetBudget, setHasSetBudget] = useState(false);

  const [showGuide, setShowGuide] = useState(false);
  const [showBudgetWarning, setShowBudgetWarning] = useState(false);

  const [toastMessage, setToastMessage] = useState("");
  const [showToast, setShowToast] = useState(false);
  const [toastType, setToastType] = useState("success");

  const [aiHeadline, setAiHeadline] =
    useState("⏳ Menganalisis...");

  const [aiInsight, setAiInsight] = useState(
    "AI sedang membaca pola keuanganmu..."
  );

  const [aiLoading, setAiLoading] = useState(false);

  const [aiConfidence, setAiConfidence] = useState(null);

  const [monthlyLimit, setMonthlyLimit] = useState(() => {
    const user = JSON.parse(
      localStorage.getItem("userData")
    );

    if (!user?.id) return 0;

    const savedLimit = localStorage.getItem(
      `cerminsaku_budget_limit_${user.id}`
    );

    return savedLimit ? Number(savedLimit) : 0;
  });

  const [tempLimit, setTempLimit] =
    useState(monthlyLimit);

  /* =====================================================
     FETCH TRANSACTIONS
  ===================================================== */

  useEffect(() => {
    fetchTransactions();

    const user = JSON.parse(
      localStorage.getItem("userData")
    );

    const hasSeenGuide = localStorage.getItem(
      `cerminsaku_guide_seen_${user?.id}`
    );

    if (!hasSeenGuide) {
      setShowGuide(true);

      if (user?.id) {
        localStorage.setItem(
          `cerminsaku_guide_seen_${user.id}`,
          "true"
        );
      }
    }

    setHasSetBudget(monthlyLimit > 0);
  }, [monthlyLimit]);

  const fetchTransactions = async () => {
    try {
      const user = JSON.parse(
        localStorage.getItem("userData")
      );

      if (!user?.id) return;

      const response = await apiClient.get(
        `/api/transactions?userId=${user.id}`
      );

      if (response.data.success) {
        setTransactions(response.data.data);
      }
    } catch (error) {
      console.error(
        "Gagal mengambil transaksi:",
        error
      );
    }
  };

  /* =====================================================
     TOAST
  ===================================================== */

  const triggerToast = (
    message,
    type = "success"
  ) => {
    setToastMessage(message);
    setToastType(type);
    setShowToast(true);

    setTimeout(() => {
      setShowToast(false);
    }, 3500);
  };

  /* =====================================================
     AI CATEGORY PREDICTION
  ===================================================== */

  const handleAIPredict = async () => {
    if (!formData.amount || !formData.date) {
      triggerToast(
        "Harap isi Nominal dan Tanggal terlebih dahulu!",
        "danger"
      );

      return;
    }

    try {
      setAiLoading(true);
      setAiConfidence(null);

      const response = await apiClient.post(
        "/api/ai/predict",
        {
          date: formData.date,

          amount_rupiah: Number(
            formData.amount
          ),

          transaction_type:
            formData.type === "income"
              ? "Income"
              : "Expense",

          top_k: 3,
        }
      );

      const data = response.data;

      console.log(
        "HASIL PREDIKSI AI:",
        data
      );

      /* ==============================================
         Mapping label AI → kategori aplikasi
      ============================================== */

      const categoryMap = {
        Food: "Makan dan Minuman",
        FoodAndDrinks: "Makan dan Minuman",

        Entertainment: "Hiburan",

        Transportation: "Transportasi",

        Shopping: "Belanja",

        Salary: "Gaji/ Pemasukan",
        Income: "Gaji/ Pemasukan",

        Health: "Kesehatan",

        Education: "Pendidikan",

        Utilities: "Lainnya",

        Rent: "Lainnya",

        Bills: "Lainnya",

        Others: "Lainnya",
      };

      const predictedCategory =
        categoryMap[
          data.predicted_category
        ] || "Lainnya";

      /* ==============================================
         Ambil confidence
      ============================================== */

      let confidence = null;

      if (
        data.confidence !== undefined &&
        data.confidence !== null
      ) {
        confidence = Number(
          data.confidence
        );

        /*
          Jika backend mengirim:
          0.87 → 87%

          Jika backend mengirim:
          87 → 87%
        */

        if (confidence <= 1) {
          confidence *= 100;
        }

        confidence = Math.min(
          Math.max(confidence, 0),
          100
        );
      }

      setAiConfidence(confidence);

      /* ==============================================
         Masukkan hasil AI ke form
      ============================================== */

      setFormData((prev) => ({
        ...prev,
        category: predictedCategory,
      }));

      /* ==============================================
         Toast
      ============================================== */

      triggerToast(
        confidence !== null
          ? `AI memilih: ${predictedCategory} (${confidence.toFixed(
              1
            )}%)`
          : `AI memilih: ${predictedCategory}`,
        "success"
      );
    } catch (error) {
      console.error(
        "AI Prediction Error:",
        error
      );

      setAiConfidence(null);

      triggerToast(
        "AI Service tidak tersedia saat ini.",
        "danger"
      );
    } finally {
      setAiLoading(false);
    }
  };

  /* =====================================================
     DELETE
  ===================================================== */

  const confirmDelete = (id) => {
    setItemToDelete(id);
    setDeleteModal(true);
  };

  const executeDelete = async () => {
    if (!itemToDelete) return;

    try {
      const user = JSON.parse(
        localStorage.getItem("userData")
      );

      await apiClient.delete(
        `/api/transactions/${itemToDelete}?userId=${user.id}`
      );

      setDeleteModal(false);
      setItemToDelete(null);

      await fetchTransactions();

      triggerToast(
        "Data transaksi berhasil dihapus dari sistem.",
        "success"
      );
    } catch (error) {
      console.error(error);

      triggerToast(
        "Gagal menghapus transaksi.",
        "danger"
      );
    }
  };

  /* =====================================================
     SUBMIT TRANSACTION
  ===================================================== */

  const handleSubmit = async () => {
    try {
      const user = JSON.parse(
        localStorage.getItem("userData")
      );

      if (!user?.id) {
        triggerToast(
          "Data pengguna tidak ditemukan.",
          "danger"
        );

        return;
      }

      /* ==============================================
         Validasi
      ============================================== */

      if (!formData.title) {
        triggerToast(
          "Deskripsi transaksi wajib diisi.",
          "danger"
        );

        return;
      }

      if (!formData.amount) {
        triggerToast(
          "Nominal transaksi wajib diisi.",
          "danger"
        );

        return;
      }

      if (!formData.category) {
        triggerToast(
          "Silakan pilih kategori atau gunakan Prediksi AI.",
          "danger"
        );

        return;
      }

      /* ==============================================
         Payload
         Tidak melakukan prediksi AI lagi.
      ============================================== */

      const payload = {
        ...formData,
        amount: Number(formData.amount),
        user_id: user.id,
      };

      if (editingId) {
        await apiClient.put(
          `/api/transactions/${editingId}`,
          payload
        );
      } else {
        await apiClient.post(
          "/api/transactions",
          payload
        );
      }

      /* ==============================================
         Reset
      ============================================== */

      setOpenModal(false);
      setEditingId(null);

      setAiConfidence(null);

      setFormData({
        title: "",
        category: "",
        amount: "",
        type: "expense",
        date: new Date()
          .toISOString()
          .split("T")[0],
      });

      await fetchTransactions();

      triggerToast(
        editingId
          ? "Transaksi berhasil diperbarui."
          : "Pencatatan arus kas berhasil disimpan.",
        "success"
      );
    } catch (error) {
      console.error(
        "Gagal menyimpan transaksi:",
        error
      );

      triggerToast(
        "Terjadi kesalahan koneksi ke server.",
        "danger"
      );
    }
  };

  /* =====================================================
     EDIT
  ===================================================== */

  const openEditModal = (item) => {
    setEditingId(item.id);

    setAiConfidence(null);

    setFormData({
      title: item.title || "",
      category: item.category || "",
      amount: item.amount || "",
      type: item.type || "expense",
      date: item.date || "",
    });

    setOpenModal(true);
  };

  /* =====================================================
     CREATE TRANSACTION
  ===================================================== */

  const handleTriggerCreateTransaction = () => {
    if (!hasSetBudget) {
      setShowBudgetWarning(true);
      return;
    }

    setEditingId(null);
    setAiConfidence(null);

    setFormData({
      title: "",
      category: "",
      amount: "",
      type: "expense",
      date: new Date()
        .toISOString()
        .split("T")[0],
    });

    setOpenModal(true);
  };

  /* =====================================================
     CALCULATION
  ===================================================== */

  const totalInflow = transactions
    .filter(
      (t) => t.type === "income"
    )
    .reduce(
      (acc, curr) =>
        acc + Number(curr.amount),
      0
    );

  const totalOutflow = transactions
    .filter(
      (t) => t.type === "expense"
    )
    .reduce(
      (acc, curr) =>
        acc + Number(curr.amount),
      0
    );

  const budgetPercentage =
    monthlyLimit > 0
      ? Math.min(
          Math.round(
            (totalOutflow /
              monthlyLimit) *
              100
          ),
          100
        )
      : 0;

  const remainingBudget =
    monthlyLimit - totalOutflow;

  /* =====================================================
     AI FINANCIAL INSIGHT
  ===================================================== */

  const fetchAIInsight = async () => {
    try {
      setAiLoading(true);

      const expenseTransactions =
        transactions.filter(
          (t) => t.type === "expense"
        );

      const categoryTotals = {};

      expenseTransactions.forEach(
        (item) => {
          const cat =
            item.category ||
            "Lainnya";

          categoryTotals[cat] =
            (categoryTotals[cat] || 0) +
            Number(item.amount);
        }
      );

      const topCategory =
        Object.entries(
          categoryTotals
        ).sort(
          (a, b) => b[1] - a[1]
        )[0]?.[0];

      const response =
        await apiClient.post(
          "/api/ai/transaction-insight",
          {
            totalInflow,
            totalOutflow,
            monthlyLimit,
            topCategory,
          }
        );

      const data = response.data;

      setAiHeadline(
        data.headline
      );

      setAiInsight(
        data.insight
      );
    } catch (err) {
      console.log(
        "AI Insight Error:",
        err
      );

      setAiHeadline(
        "AI Tidak Aktif"
      );

      setAiInsight(
        "Insight belum tersedia."
      );
    } finally {
      setAiLoading(false);
    }
  };

  useEffect(() => {
    if (transactions.length > 0) {
      fetchAIInsight();
    }
  }, [
    totalInflow,
    totalOutflow,
    monthlyLimit,
    transactions,
  ]);

  /* =====================================================
     ICON
  ===================================================== */

  const iconDictionary = {
    "Makan dan Minuman": (
      <Utensils size={18} />
    ),

    Transportasi: (
      <Bus size={18} />
    ),

    Hiburan: (
      <Clapperboard size={18} />
    ),

    Belanja: (
      <ShoppingBag size={18} />
    ),

    Investasi: (
      <TrendingUp size={18} />
    ),

    "Gaji/ Pemasukan": (
      <Wallet size={18} />
    ),

    Kesehatan: (
      <Heart size={18} />
    ),

    Pendidikan: (
      <GraduationCap size={18} />
    ),

    Lainnya: (
      <MoreHorizontal size={18} />
    ),
  };

  /* =====================================================
     CATEGORIES
  ===================================================== */

  const categories = [
    {
      name: "Semua Kategori",
      icon: (
        <MoreHorizontal size={14} />
      ),
    },

    {
      name: "Makan dan Minuman",
      icon: (
        <Utensils size={14} />
      ),
    },

    {
      name: "Investasi",
      icon: (
        <TrendingUp size={14} />
      ),
    },

    {
      name: "Transportasi",
      icon: (
        <Bus size={14} />
      ),
    },

    {
      name: "Hiburan",
      icon: (
        <Clapperboard size={14} />
      ),
    },

    {
      name: "Belanja",
      icon: (
        <ShoppingBag size={14} />
      ),
    },

    {
      name: "Gaji/ Pemasukan",
      icon: (
        <FileText size={14} />
      ),
    },

    {
      name: "Kesehatan",
      icon: (
        <Heart size={14} />
      ),
    },

    {
      name: "Pendidikan",
      icon: (
        <GraduationCap size={14} />
      ),
    },

    {
      name: "Lainnya",
      icon: (
        <HelpCircle size={14} />
      ),
    },
  ];

  /* =====================================================
     FILTER
  ===================================================== */

  const filteredTransactions =
    transactions.filter((item) => {
      const matchesTab =
        activeTab === "all" ||
        item.type === activeTab;

      const matchesCategory =
        selectedCategory ===
          "Semua Kategori" ||
        item.category ===
          selectedCategory;

      const title =
        item.title?.toLowerCase() ||
        "";

      const category =
        item.category?.toLowerCase() ||
        "";

      const search =
        searchQuery.toLowerCase();

      const matchesSearch =
        title.includes(search) ||
        category.includes(search);

      return (
        matchesTab &&
        matchesCategory &&
        matchesSearch
      );
    });

  /* =====================================================
     RETURN
  ===================================================== */

  return (
    <div className="dashboard">

      <Sidebar activePage="transactions" />

      {/* =================================================
          TOAST
      ================================================= */}

      <div
        className={`premium-toast ${
          showToast ? "show" : ""
        } ${toastType}`}
      >
        <div className="toast-content">

          <div className="toast-icon-wrapper">
            {toastType ===
            "success" ? (
              <CheckCircle size={20} />
            ) : (
              <AlertTriangle size={20} />
            )}
          </div>

          <div className="toast-text-group">

            <span className="toast-title">
              {toastType ===
              "success"
                ? "Informasi Sistem"
                : "Peringatan"}
            </span>

            <span className="toast-desc">
              {toastMessage}
            </span>

          </div>
        </div>

        <div className="toast-progress-bar" />
      </div>

      {/* =================================================
          MAIN CONTENT
      ================================================= */}

      <div className="viewport-content-wrapper">

        <div className="ambient-blur-sphere sphere-one" />

        <div className="ambient-blur-sphere sphere-two" />

        <div className="viewport-container">

          {/* HEADER */}

          <header className="glass-action-header">

            <div className="brand-intel">

              <h1>
                Arus Kas
              </h1>

              <p>
                Catat pembukuan kas masuk
                dan keluar secara terstruktur.
              </p>

            </div>

            <div className="header-utilities">

              <button
                className="utility-secondary-btn"
                onClick={() =>
                  setShowGuide(true)
                }
              >
                <BookOpen size={14} />

                <span>
                  Panduan
                </span>
              </button>

              <button
                className="utility-secondary-btn"
                onClick={() => {
                  setTempLimit(
                    monthlyLimit
                  );

                  setOpenLimitModal(
                    true
                  );
                }}
              >
                <Settings2 size={14} />

                <span>
                  Atur Budget
                </span>
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

                <span>
                  Catat Transaksi
                </span>
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

              {/* SURPLUS */}

              <div className="aurora-mesh-card">

                <div className="mesh-overlay-glow" />

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
                              (
                                ((totalInflow -
                                  totalOutflow) /
                                  totalInflow) *
                                100
                              ) > 0
                                ? "+"
                                : ""
                            }${(
                              ((totalInflow -
                                totalOutflow) /
                                totalInflow) *
                              100
                            ).toFixed(1)}%`
                          : "0%"}
                      </span>

                    </div>

                  </div>

                  <h2>
                    Rp{" "}
                    {(
                      totalInflow -
                      totalOutflow
                    ).toLocaleString(
                      "id-ID"
                    )}
                  </h2>

                  <div className="card-bottom-meta">

                    <p>
                      Dana bersih aktif sisa
                      alokasi alur kas masuk
                      dikurangi beban transaksi
                      keluar.
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
                    {totalInflow.toLocaleString(
                      "id-ID"
                    )}
                  </h3>

                  <span className="subcard-footer">
                    Total Pendapatan
                    (All Time)
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
                    {totalOutflow.toLocaleString(
                      "id-ID"
                    )}
                  </h3>

                  <span className="subcard-footer">
                    Total Pengeluaran
                    (All Time)
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
                      Limit Pengeluaran Bulanan
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
                          monthlyLimit
                        );

                        setOpenLimitModal(
                          true
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
                        budgetPercentage >=
                        80
                          ? "#E11D48"
                          : "#0E4834",
                    }}
                  />

                </div>

                <div className="budget-panel-footer">

                  <span>
                    {remainingBudget >= 0
                      ? "Sisa kuota: "
                      : "Defisit: "}

                    <strong>
                      Rp{" "}
                      {Math.abs(
                        remainingBudget
                      ).toLocaleString(
                        "id-ID"
                      )}
                    </strong>
                  </span>

                  <span>
                    Batas: Rp{" "}
                    {monthlyLimit.toLocaleString(
                      "id-ID"
                    )}
                  </span>

                </div>

              </div>

              {/* AI INSIGHT */}

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
                TRANSACTION LIST
            ================================================= */}

            <div className="ledger-panel-column">

              <div className="master-ledger-shell">

                <div className="ledger-control-center">

                  <div className="minimal-search-input-box">

                    <Search size={14} />

                    <input
                      type="text"
                      placeholder="Cari entitas transaksi..."
                      value={
                        searchQuery
                      }
                      onChange={(e) =>
                        setSearchQuery(
                          e.target.value
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
                          !openDropdown
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
                        className={
                          openDropdown
                            ? "rotate"
                            : ""
                        }
                      />

                    </button>

                    {openDropdown && (
                      <>
                        <div
                          className="dropdown-overlay-shutter"
                          onClick={() =>
                            setOpenDropdown(
                              false
                            )
                          }
                        />

                        <div className="context-blur-dropdown">

                          {categories.map(
                            (
                              item,
                              index
                            ) => (
                              <div
                                key={
                                  index
                                }
                                className={`blur-dropdown-item ${
                                  selectedCategory ===
                                  item.name
                                    ? "selected"
                                    : ""
                                }`}
                                onClick={() => {
                                  setSelectedCategory(
                                    item.name
                                  );

                                  setOpenDropdown(
                                    false
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
                                      size={
                                        12
                                      }
                                      strokeWidth={
                                        3
                                      }
                                    />
                                  </span>
                                )}

                              </div>
                            )
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
                      activeTab ===
                      "all"
                        ? "active"
                        : ""
                    }
                    onClick={() =>
                      setActiveTab(
                        "all"
                      )
                    }
                  >
                    Semua
                  </button>

                  <button
                    className={
                      activeTab ===
                      "income"
                        ? "active"
                        : ""
                    }
                    onClick={() =>
                      setActiveTab(
                        "income"
                      )
                    }
                  >
                    Pemasukan
                  </button>

                  <button
                    className={
                      activeTab ===
                      "expense"
                        ? "active"
                        : ""
                    }
                    onClick={() =>
                      setActiveTab(
                        "expense"
                      )
                    }
                  >
                    Pengeluaran
                  </button>

                </div>

                {/* TRANSACTIONS */}

                <div className="premium-stream-list">

                  {filteredTransactions.length >
                  0 ? (
                    filteredTransactions.map(
                      (
                        item,
                        index
                      ) => (
                        <div
                          className="stream-row-item"
                          key={
                            item.id ||
                            index
                          }
                        >

                          <div className="stream-row-left">

                            <div
                              className={`stream-icon-frame ${item.type}`}
                            >
                              {iconDictionary[
                                item.category
                              ] || (
                                <HelpCircle
                                  size={
                                    16
                                  }
                                />
                              )}
                            </div>

                            <div className="stream-row-info">

                              <h4>
                                {item.title}
                              </h4>

                              <span>
                                {
                                  item.category
                                }
                              </span>

                            </div>

                          </div>

                          <div className="stream-row-right">

                            <div className="stream-time-amount">

                              <span className="stream-time">
                                {item.date}
                              </span>

                              <h3
                                className={`stream-amount ${item.type}`}
                              >
                                {item.type ===
                                "expense"
                                  ? `-Rp ${Number(
                                      item.amount
                                    ).toLocaleString(
                                      "id-ID"
                                    )}`
                                  : `+Rp ${Number(
                                      item.amount
                                    ).toLocaleString(
                                      "id-ID"
                                    )}`}
                              </h3>

                            </div>

                            <div className="action-buttons">

                              <button
                                className="edit-btn"
                                onClick={() =>
                                  openEditModal(
                                    item
                                  )
                                }
                              >
                                <Edit2
                                  size={
                                    12
                                  }
                                />
                              </button>

                              <button
                                className="delete-btn"
                                onClick={() =>
                                  confirmDelete(
                                    item.id
                                  )
                                }
                              >
                                <Trash2
                                  size={
                                    12
                                  }
                                />
                              </button>

                            </div>

                          </div>

                        </div>
                      )
                    )
                  ) : (
                    <div className="stream-empty-state">

                      <MoreHorizontal
                        size={24}
                        style={{
                          color:
                            "#94A3B8",
                          marginBottom:
                            "8px",
                        }}
                      />

                      <p>
                        Pencarian transaksi
                        tidak ditemukan.
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
              Selamat datang di menu
              pembukuan kas CerminSaku!
              Ikuti langkah praktis berikut
              untuk memulai pelacakan dana
              Anda.
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
                    Pencatatan Transaksi
                  </h4>

                  <p>
                    Klik tombol Catat Transaksi
                    untuk memasukkan riwayat kas.
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
                    Isi nominal dan tanggal,
                    kemudian klik Prediksi
                    dengan AI untuk menentukan
                    kategori otomatis.
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
                justifyContent:
                  "center",
                gap: "12px",
              }}
            >

              <button
                className="sheet-btn-cancel"
                onClick={() =>
                  setDeleteModal(
                    false
                  )
                }
              >
                Batal
              </button>

              <button
                className="sheet-btn-commit"
                style={{
                  background:
                    "#E11D48",
                  width: "auto",
                }}
                onClick={
                  executeDelete
                }
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

              <AlertOctagon
                size={26}
              />

            </div>

            <div className="popup-text-content">

              <h3>
                Batas Anggaran Belum Diatur
              </h3>

              <p>
                Anda wajib mengonfigurasi
                limit anggaran pengeluaran
                kas bulan ini terlebih dahulu.
              </p>

            </div>

            <div
              className="sheet-action-footer"
              style={{
                marginTop: "24px",
                justifyContent:
                  "center",
              }}
            >

              <button
                className="sheet-btn-commit full-width-guide-btn"
                onClick={() => {
                  setShowBudgetWarning(
                    false
                  );

                  setTempLimit(
                    monthlyLimit
                  );

                  setOpenLimitModal(
                    true
                  );
                }}
              >

                <span>
                  Atur Limit Budget Sekarang
                </span>

                <ArrowRight
                  size={14}
                />

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
                  setFormData({
                    ...formData,
                    type: "expense",
                    category: "",
                  })
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
                  setFormData({
                    ...formData,
                    type: "income",
                    category: "",
                  })
                }
              >
                Pemasukan
              </button>

            </div>

            <div className="sheet-form-inputs">

              {/* =================================================
                  AI CARD
              ================================================= */}

              <button
                type="button"
                onClick={
                  handleAIPredict
                }
                disabled={aiLoading}
                style={{
                  display: "flex",
                  alignItems:
                    "center",
                  gap: "14px",
                  width: "100%",
                  padding: "20px",
                  borderRadius:
                    "22px",
                  border:
                    "1px solid rgba(139,92,246,.22)",
                  background:
                    aiLoading
                      ? "rgba(139,92,246,.05)"
                      : "rgba(139,92,246,.08)",
                  marginBottom:
                    "20px",
                  cursor:
                    aiLoading
                      ? "not-allowed"
                      : "pointer",
                  textAlign:
                    "left",
                  opacity:
                    aiLoading
                      ? 0.7
                      : 1,
                  transition:
                    "all .2s ease",
                }}
              >

                <div
                  style={{
                    width:
                      "44px",
                    height:
                      "44px",
                    minWidth:
                      "44px",
                    borderRadius:
                      "14px",
                    display:
                      "flex",
                    alignItems:
                      "center",
                    justifyContent:
                      "center",
                    background:
                      "rgba(139,92,246,.12)",
                  }}
                >

                  <Brain
                    size={24}
                    color="#7C3AED"
                  />

                </div>

                <div>

                  <h4
                    style={{
                      margin: 0,
                      color:
                        "#6D28D9",
                      fontWeight:
                        "700",
                    }}
                  >
                    {aiLoading
                      ? "AI Sedang Menganalisis..."
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
                    {aiLoading
                      ? "Membaca pola transaksi..."
                      : "Klik untuk memprediksi kategori otomatis"}
                  </p>

                </div>

              </button>

              {/* AI CONFIDENCE */}

              {aiConfidence !==
                null && (
                <div
                  style={{
                    marginTop:
                      "-8px",
                    marginBottom:
                      "20px",
                    padding:
                      "10px 14px",
                    borderRadius:
                      "12px",
                    background:
                      "rgba(124,58,237,.06)",
                    color:
                      "#6D28D9",
                    fontSize:
                      "12px",
                    fontWeight:
                      "600",
                  }}
                >
                  Confidence AI:{" "}
                  {aiConfidence.toFixed(
                    1
                  )}
                  %
                </div>
              )}

              {/* TITLE */}

              <div className="sheet-input-field">

                <label>
                  Deskripsi Transaksi
                </label>

                <input
                  type="text"
                  placeholder="Kopi Sore, Gaji Project"
                  value={
                    formData.title
                  }
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      title:
                        e.target.value,
                    })
                  }
                />

              </div>

              {/* AMOUNT + DATE */}

              <div className="sheet-input-row">

                <div className="sheet-input-field">

                  <label>
                    Nominal (Rp)
                  </label>

                  <input
                    type="number"
                    placeholder="0"
                    value={
                      formData.amount
                    }
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        amount:
                          e.target.value,
                      })
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
                      setFormData({
                        ...formData,
                        date:
                          e.target.value,
                      })
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
                    setFormData({
                      ...formData,
                      category:
                        e.target.value,
                    })
                  }
                >

                  <option
                    value=""
                    disabled
                  >
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
                  setOpenModal(
                    false
                  )
                }
              >
                Batal
              </button>

              <button
                className="sheet-btn-commit"
                onClick={
                  handleSubmit
                }
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
          LIMIT MODAL
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
                    false
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
                  value={
                    tempLimit
                  }
                  onChange={(e) =>
                    setTempLimit(
                      Number(
                        e.target.value
                      )
                    )
                  }
                  placeholder="5000000"
                />

              </div>

            </div>

            <div
              className="sheet-action-footer"
              style={{
                marginTop:
                  "24px",
              }}
            >

              <button
                className="sheet-btn-cancel"
                onClick={() =>
                  setOpenLimitModal(
                    false
                  )
                }
              >
                Batal
              </button>

              <button
                className="sheet-btn-commit"
                onClick={() => {

                  if (
                    tempLimit <=
                    0
                  ) {
                    triggerToast(
                      "Limit budget harus lebih dari 0.",
                      "danger"
                    );

                    return;
                  }

                  setMonthlyLimit(
                    tempLimit
                  );

                  setHasSetBudget(
                    true
                  );

                  const user =
                    JSON.parse(
                      localStorage.getItem(
                        "userData"
                      )
                    );

                  if (user?.id) {
                    localStorage.setItem(
                      `cerminsaku_budget_limit_${user.id}`,
                      tempLimit
                    );
                  }

                  setOpenLimitModal(
                    false
                  );

                  triggerToast(
                    "Batas anggaran berhasil diperbarui.",
                    "success"
                  );

                }}
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
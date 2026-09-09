const express = require("express");
const router = express.Router();

const { GoogleGenAI, Type } = require("@google/genai");
const auth = require("../middleware/authMidlleware");

// ============================================================
// GEMINI CONFIGURATION
// ============================================================

const MODEL = "gemini-3.6-flash";

function getGeminiClient() {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    throw new Error(
      "GEMINI_API_KEY belum dikonfigurasi di file .env"
    );
  }

  return new GoogleGenAI({
    apiKey,
  });
}


// ============================================================
// GENERATE JSON DENGAN GEMINI
// ============================================================

async function generateJSON(
  systemInstruction,
  userPrompt,
  responseSchema
) {
  try {
    const ai = getGeminiClient();

    console.log("=================================");
    console.log("GEMINI REQUEST");
    console.log("MODEL:", MODEL);
    console.log("API KEY:", process.env.GEMINI_API_KEY ? "ADA" : "TIDAK ADA");
    console.log("=================================");

    const response = await ai.models.generateContent({
      model: MODEL,

      contents: userPrompt,

      config: {
        systemInstruction,

        responseMimeType: "application/json",

        responseSchema,
      },
    });

    console.log("Gemini response diterima");

    const text = response.text;

    if (!text) {
      throw new Error("Gemini tidak memberikan response text");
    }

    console.log("Gemini raw response:", text);

    try {
      return JSON.parse(text);
    } catch (jsonError) {
      console.error("JSON PARSE ERROR:", jsonError.message);
      console.error("RAW RESPONSE:", text);

      throw new Error(
        "Response Gemini bukan JSON yang valid"
      );
    }

  } catch (error) {

    console.error("=================================");
    console.error("GEMINI ERROR");
    console.error("=================================");
    console.error("Message:", error.message);

    if (error.status) {
      console.error("Status:", error.status);
    }

    if (error.code) {
      console.error("Code:", error.code);
    }

    if (error.response) {
      console.error("Response:", error.response);
    }

    console.error("=================================");

    throw error;
  }
}


// ============================================================
// DASHBOARD INSIGHT
// POST /api/ai/dashboard-insight
// ============================================================

router.post("/dashboard-insight", auth, async (req, res) => {

  try {

    const {
      netSurplus,
      totalInflow,
      totalOutflow,
      budgetPercentage,
    } = req.body;

    console.log("=== DASHBOARD AI ===");
    console.log("BODY:", req.body);

    const result = await generateJSON(

      `
Kamu adalah AI financial assistant bernama CerminSaku.

Tugasmu memberikan insight keuangan singkat berdasarkan data dashboard.

Gunakan Bahasa Indonesia yang santai, ramah, suportif,
dan mudah dipahami Gen Z.

Jangan menghakimi pengguna.

Jangan memberikan nasihat investasi berisiko.

Fokus pada pengelolaan keuangan sehari-hari.

Buat:
1. headline singkat
2. insight berupa evaluasi cashflow
3. satu saran praktis

Jawaban harus singkat dan jelas.
      `,

      `
Data Dashboard:

Sisa Uang:
Rp${Number(netSurplus || 0).toLocaleString("id-ID")}

Pemasukan:
Rp${Number(totalInflow || 0).toLocaleString("id-ID")}

Pengeluaran:
Rp${Number(totalOutflow || 0).toLocaleString("id-ID")}

Budget Terpakai:
${Number(budgetPercentage || 0)}%

Berikan insight kondisi keuangan pengguna hari ini.
      `,

      {
        type: Type.OBJECT,

        properties: {

          headline: {
            type: Type.STRING,
          },

          insight: {
            type: Type.STRING,
          },

        },

        required: [
          "headline",
          "insight",
        ],
      }
    );

    return res.json(result);

  } catch (err) {

    console.error(
      "AI dashboard insight error:",
      err
    );

    return res.status(503).json({
      message: "Gagal mengambil insight Dashboard",
      error: err.message,
    });
  }
});


// ============================================================
// SAVINGS INSIGHT
// POST /api/ai/savings-insight
// ============================================================

router.post("/savings-insight", auth, async (req, res) => {

  try {

    const {
      totalGoalAktif,
      totalTarget,
      totalTerkumpul,
      progressKeseluruhan,
      goalTercapai,
      goals,
    } = req.body;

    console.log("=== SAVINGS AI ===");
    console.log("BODY:", req.body);

    const result = await generateJSON(

      `
Kamu adalah asisten keuangan pribadi bernama CerminSaku.

Tugasmu memberikan insight dan motivasi tentang tabungan impian.

Gunakan Bahasa Indonesia yang ramah,
singkat, positif, dan realistis.

Jangan menyalahkan pengguna.

Berikan saran yang bisa dilakukan sehari-hari.
      `,

      `
Data Dream Savings:

${JSON.stringify(
  {
    totalGoalAktif,
    totalTarget,
    totalTerkumpul,
    progressKeseluruhan,
    goalTercapai,
    goals,
  },
  null,
  2
)}

Berikan insight mengenai progress tabungan pengguna.
      `,

      {
        type: Type.OBJECT,

        properties: {

          headline: {
            type: Type.STRING,
          },

          highlights: {
            type: Type.ARRAY,

            items: {
              type: Type.STRING,
            },
          },

          suggestion: {
            type: Type.STRING,
          },

        },

        required: [
          "headline",
          "highlights",
          "suggestion",
        ],
      }
    );

    return res.json(result);

  } catch (err) {

    console.error(
      "AI savings insight error:",
      err
    );

    return res.status(503).json({
      message: "Gagal mengambil insight AI",
      error: err.message,
    });
  }
});


// ============================================================
// TRANSACTION INSIGHT
// POST /api/ai/transaction-insight
// ============================================================

router.post("/transaction-insight", auth, async (req, res) => {

  try {

    const {
      totalInflow,
      totalOutflow,
      monthlyLimit,
      topCategory,
    } = req.body;

    console.log("=== TRANSACTION AI ===");
    console.log("BODY:", req.body);

    const result = await generateJSON(

      `
Kamu adalah AI financial assistant bernama CerminSaku.

Tugasmu menganalisis arus kas bulanan pengguna.

Analisis:

- pemasukan
- pengeluaran
- batas budget
- kategori pengeluaran terbesar

Gunakan Bahasa Indonesia yang santai,
friendly, dan mudah dipahami.

Berikan insight yang singkat,
jelas, dan berguna.

Jangan menghakimi pengguna.
      `,

      `
Data keuangan:

Pemasukan:
Rp${Number(totalInflow || 0).toLocaleString("id-ID")}

Pengeluaran:
Rp${Number(totalOutflow || 0).toLocaleString("id-ID")}

Budget Bulanan:
Rp${Number(monthlyLimit || 0).toLocaleString("id-ID")}

Kategori Pengeluaran Terbesar:
${topCategory || "Tidak ada"}

Berikan insight keuangan pengguna.
      `,

      {
        type: Type.OBJECT,

        properties: {

          headline: {
            type: Type.STRING,
          },

          insight: {
            type: Type.STRING,
          },

        },

        required: [
          "headline",
          "insight",
        ],
      }
    );

    return res.json(result);

  } catch (err) {

    console.error(
      "AI transaction insight error:",
      err
    );

    return res.status(503).json({
      message: "Gagal mengambil insight AI",
      error: err.message,
    });
  }
});


// ============================================================
// PREDICT TRANSACTION
// POST /api/ai/predict
// ============================================================

router.post("/predict", auth, async (req, res) => {

  try {

    console.log("=================================");
    console.log("AI PREDICT DIPANGGIL");
    console.log("BODY:", req.body);
    console.log("=================================");

    const {
      date,
      amount_rupiah,
      transaction_type,
    } = req.body;

    // --------------------------------------------------------
    // VALIDASI DATA
    // --------------------------------------------------------

    if (
      !date ||
      amount_rupiah === undefined ||
      amount_rupiah === null ||
      !transaction_type
    ) {

      console.log("DATA TIDAK LENGKAP");

      return res.status(400).json({
        message: "Data transaksi belum lengkap",
      });
    }

    console.log("Data transaksi valid");
    console.log("Memanggil Gemini...");

    // --------------------------------------------------------
    // GEMINI
    // --------------------------------------------------------

    const result = await generateJSON(

      `
Kamu adalah sistem klasifikasi transaksi keuangan CerminSaku.

Tentukan kategori transaksi menggunakan salah satu kategori berikut:

Food
Entertainment
Transportation
Shopping
Salary
Health
Education
Utilities
Rent
Bills
Others

Gunakan Bahasa Inggris untuk nama kategori.

Berikan confidence antara 0 dan 1.

Hanya gunakan kategori yang tersedia.
      `,

      `
Tanggal:
${date}

Nominal:
Rp${Number(amount_rupiah).toLocaleString("id-ID")}

Jenis transaksi:
${transaction_type}

Tentukan kategori transaksi.
      `,

      {
        type: Type.OBJECT,

        properties: {

          predicted_category: {

            type: Type.STRING,

            enum: [
              "Food",
              "Entertainment",
              "Transportation",
              "Shopping",
              "Salary",
              "Health",
              "Education",
              "Utilities",
              "Rent",
              "Bills",
              "Others",
            ],
          },

          confidence: {
            type: Type.NUMBER,
          },

        },

        required: [
          "predicted_category",
          "confidence",
        ],
      }
    );

    console.log("HASIL AI:", result);

    return res.json(result);

  } catch (err) {

    console.error("=================================");
    console.error("AI PREDICT ERROR");
    console.error("=================================");
    console.error(err);
    console.error("=================================");

    return res.status(503).json({

      message:
        "Gagal melakukan prediksi kategori transaksi",

      error:
        err.message,
    });
  }
});


// ============================================================
// EXPORT
// ============================================================

module.exports = router;
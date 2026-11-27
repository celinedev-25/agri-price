
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import supabase from "../src/supabase.js";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

// Get districts
app.get("/api/districts", async (req, res) => {
  const { data, error } = await supabase
    .from("districts")
    .select("*");

  if (error) {
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }

  res.json({
    success: true,
    data
  });
});

// Get market prices
app.get("/api/prices", async (req, res) => {
  const { data, error } = await supabase
    .from("market_price")
    .select("*");

  if (error) {
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }

  res.json({
    success: true,
    data
  });
});

const PORT = process.env.PORT || 5000;
// GET districts
app.get("/api/districts", async (req, res) => {
  // code yawe isanzwe
});

// GET market prices
app.get("/api/prices", async (req, res) => {
  // code yawe isanzwe
});

// POST new market price
app.post("/api/prices", async (req, res) => {
  const { crop_name, district_id, price } = req.body;

  if (!crop_name || !district_id || price === undefined) {
    return res.status(400).json({
      message: "Fill in all fields"
    });
  }

  const { data, error } = await supabase
    .from("market_price")
    .insert([{ crop_name, district_id, price }])
    .select();

  if (error) {
    return res.status(500).json({
      message: error.message
    });
  }

  res.status(201).json({
    success: true,
    data
  });
});

app.post("/api/prices", async (req, res) => {
  try {
    const { crop_name, district_id, price } = req.body;

    if (!crop_name || !district_id || price === undefined || price === "") {
      return res.status(400).json({
        success: false,
        message: "Fill in all fields"
      });
    }

    const { data, error } = await supabase
      .from("market_price")
      .insert([
        {
          crop_name,
          district_id,
          price: Number(price)
        }
      ])
      .select();

    if (error) {
      return res.status(500).json({
        success: false,
        message: error.message
      });
    }

    return res.status(201).json({
      success: true,
      message: "Price saved successfully",
      data
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
